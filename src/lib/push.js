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
  // topics = CSV de temas elegidos; NULL/'' = recibe todo
  await sql`ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS topics TEXT`;
}

export async function saveSubscription(subscription, userAgent, topics) {
  const sql = getDb();
  await ensurePushTable(sql);
  const { endpoint } = subscription;
  const p256dh = subscription.keys?.p256dh;
  const auth = subscription.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    throw new Error("Suscripción inválida");
  }
  const topicsCsv = Array.isArray(topics) && topics.length ? topics.join(",") : null;
  await sql`
    INSERT INTO push_subscriptions (endpoint, p256dh, auth, user_agent, topics)
    VALUES (${endpoint}, ${p256dh}, ${auth}, ${userAgent || null}, ${topicsCsv})
    ON CONFLICT (endpoint)
    DO UPDATE SET p256dh = ${p256dh}, auth = ${auth}, user_agent = ${userAgent || null}, topics = ${topicsCsv}
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

// Etiqueta corta del dispositivo a partir del endpoint / user-agent.
export function deviceLabel(endpoint = "", ua = "") {
  if (endpoint.includes("apple.com")) return "iPhone";
  if (endpoint.includes("fcm.googleapis") || /android/i.test(ua)) return "Android";
  if (endpoint.includes("mozilla")) return "Firefox";
  if (endpoint.includes("windows.com")) return "Edge";
  if (/mac os x/i.test(ua)) return "Mac";
  if (/windows/i.test(ua)) return "Windows";
  return "Otro";
}

// Historial de notificaciones enviadas
export async function ensurePushLogTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS push_log (
      id SERIAL PRIMARY KEY,
      title TEXT,
      body TEXT,
      url TEXT,
      kind VARCHAR(40) DEFAULT 'manual',
      sent_by VARCHAR(255),
      sent INTEGER DEFAULT 0,
      removed INTEGER DEFAULT 0,
      total INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  // Detalle por dispositivo: [{ device, status: 'ok'|'expired'|'error', code }]
  await sql`ALTER TABLE push_log ADD COLUMN IF NOT EXISTS results JSONB`;
}

export async function getPushLog(limit = 30) {
  const sql = getDb();
  await ensurePushLogTable(sql);
  return await sql`SELECT * FROM push_log ORDER BY created_at DESC LIMIT ${limit}`;
}

/**
 * Envía una push a TODOS los dispositivos suscritos.
 * payload: { title, body, url?, icon?, image?, tag? }
 * Limpia automáticamente las suscripciones muertas (404/410).
 */
export async function sendPushToAll(payload, meta = {}) {
  const sql = getDb();
  if (!configure()) {
    return { ok: false, sent: 0, error: "VAPID no configurado" };
  }
  await ensurePushTable(sql);
  const subs = await sql`SELECT * FROM push_subscriptions`;

  // Filtrar por tema: una suscripción sin temas (NULL) recibe todo
  const topic = payload.topic || null;
  const targets = topic
    ? subs.filter((s) => {
        if (!s.topics) return true;
        return s.topics.split(",").map((t) => t.trim()).filter(Boolean).includes(topic);
      })
    : subs;

  const body = JSON.stringify(payload);

  let sent = 0;
  let removed = 0;
  const results = [];

  await Promise.all(
    targets.map(async (s) => {
      const device = deviceLabel(s.endpoint, s.user_agent);
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body
        );
        sent++;
        results.push({ device, status: "ok", code: 201 });
      } catch (err) {
        const code = err?.statusCode || null;
        if (code === 404 || code === 410) {
          await sql`DELETE FROM push_subscriptions WHERE endpoint = ${s.endpoint}`;
          removed++;
          results.push({ device, status: "expired", code });
        } else {
          results.push({ device, status: "error", code });
        }
      }
    })
  );

  // Registrar en el historial (no bloquea si falla)
  try {
    await ensurePushLogTable(sql);
    await sql`
      INSERT INTO push_log (title, body, url, kind, sent_by, sent, removed, total, results)
      VALUES (${payload.title || ""}, ${payload.body || ""}, ${payload.url || null},
              ${meta.kind || "manual"}, ${meta.sentBy || null}, ${sent}, ${removed}, ${targets.length},
              ${JSON.stringify(results)})
    `;
  } catch (e) {
    console.error("No se pudo registrar el log de push:", e.message);
  }

  return { ok: true, sent, removed, total: targets.length, results };
}
