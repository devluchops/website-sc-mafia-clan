import * as webpushImport from "web-push";
import { getDb } from "@/lib/db";

// web-push es CommonJS: según el bundle, el default puede venir en .default
const webpush = webpushImport.default || webpushImport;

let configured = false;

function configure() {
  if (configured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:clanmafia@devluchops.space";
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

// Crea la tabla de suscripciones si no existe (idempotente)
export async function ensurePushTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id SERIAL PRIMARY KEY,
      endpoint TEXT UNIQUE NOT NULL,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
}

export async function saveSubscription(subscription, userAgent) {
  const sql = getDb();
  await ensurePushTable(sql);
  const { endpoint } = subscription;
  const p256dh = subscription.keys?.p256dh;
  const auth = subscription.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    throw new Error("Suscripción inválida");
  }
  await sql`
    INSERT INTO push_subscriptions (endpoint, p256dh, auth, user_agent)
    VALUES (${endpoint}, ${p256dh}, ${auth}, ${userAgent || null})
    ON CONFLICT (endpoint)
    DO UPDATE SET p256dh = ${p256dh}, auth = ${auth}, user_agent = ${userAgent || null}
  `;
}

export async function removeSubscription(endpoint) {
  const sql = getDb();
  await ensurePushTable(sql);
  await sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint}`;
}

export async function countSubscriptions() {
  const sql = getDb();
  await ensurePushTable(sql);
  const [row] = await sql`SELECT COUNT(*)::int AS n FROM push_subscriptions`;
  return row?.n || 0;
}

/**
 * Envía una push a TODOS los dispositivos suscritos.
 * payload: { title, body, url?, icon?, image?, tag? }
 * Limpia automáticamente las suscripciones muertas (404/410).
 */
export async function sendPushToAll(payload) {
  if (!configure()) {
    return { ok: false, sent: 0, error: "VAPID no configurado" };
  }
  const sql = getDb();
  await ensurePushTable(sql);
  const subs = await sql`SELECT * FROM push_subscriptions`;
  const body = JSON.stringify(payload);

  let sent = 0;
  let removed = 0;

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body
        );
        sent++;
      } catch (err) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await sql`DELETE FROM push_subscriptions WHERE endpoint = ${s.endpoint}`;
          removed++;
        }
      }
    })
  );

  return { ok: true, sent, removed, total: subs.length };
}
