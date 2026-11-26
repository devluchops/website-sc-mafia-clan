"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export default function PushControls({ compact = false }) {
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState("default");
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [installEvent, setInstallEvent] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const okPush = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setSupported(okPush);
    if (okPush) setPermission(Notification.permission);

    const ua = window.navigator.userAgent || "";
    const ios = /iphone|ipad|ipod/i.test(ua);
    setIsIOS(ios);

    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setInstalled(standalone);

    // ¿ya está suscrito este dispositivo?
    if (okPush) {
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => setSubscribed(!!sub))
        .catch(() => {});
    }

    const onPrompt = (e) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const enable = async () => {
    setMsg("");
    if (!supported) {
      setMsg("Tu navegador no soporta notificaciones push.");
      return;
    }
    if (!VAPID) {
      setMsg("Falta configurar la clave de notificaciones (VAPID).");
      return;
    }
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        setMsg(
          perm === "denied"
            ? "Bloqueaste las notificaciones. Actívalas desde los ajustes del navegador."
            : "No se activaron las notificaciones."
        );
        setBusy(false);
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID),
        });
      }
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      if (!res.ok) throw new Error("No se pudo guardar la suscripción");
      setSubscribed(true);
      setMsg("¡Listo! Te avisaremos de showmatches, torneos y anuncios.");
    } catch (err) {
      setMsg("Error activando notificaciones: " + err.message);
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    setMsg("");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {});
        await sub.unsubscribe().catch(() => {});
      }
      setSubscribed(false);
      setMsg("Notificaciones desactivadas en este dispositivo.");
    } catch (err) {
      setMsg("Error: " + err.message);
    } finally {
      setBusy(false);
    }
  };

  const install = async () => {
    if (!installEvent) return;
    installEvent.prompt();
    try {
      await installEvent.userChoice;
    } catch (_e) {}
    setInstallEvent(null);
  };

  const showInstall = !installed && (installEvent || isIOS);

  return (
    <div className={compact ? "pushctl pushctl-compact" : "pushctl"}>
      <div className="pushctl-row">
        {supported && (
          subscribed ? (
            <button className="lz-btn lz-btn-ghost" onClick={disable} disabled={busy}>
              {busy ? "..." : "Notificaciones activas ✓"}
            </button>
          ) : (
            <button className="lz-btn lz-btn-gold" onClick={enable} disabled={busy}>
              {busy ? "Activando..." : "Activar notificaciones"}
            </button>
          )
        )}

        {showInstall && installEvent && (
          <button className="lz-btn lz-btn-ghost" onClick={install}>
            Instalar app
          </button>
        )}
      </div>

      {!supported && (
        <p className="pushctl-msg">
          Tu navegador no soporta notificaciones push. En iPhone, primero instala la app
          (Compartir → “Añadir a pantalla de inicio”) y ábrela desde ahí.
        </p>
      )}

      {showInstall && isIOS && !installEvent && (
        <p className="pushctl-msg">
          En iPhone: toca <b>Compartir</b> en Safari y luego <b>“Añadir a pantalla de inicio”</b>.
          Abre la app desde el ícono para recibir avisos.
        </p>
      )}

      {msg && <p className="pushctl-msg">{msg}</p>}
    </div>
  );
}
