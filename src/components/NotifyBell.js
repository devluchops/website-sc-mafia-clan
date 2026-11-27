"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import PushControls from "./PushControls";

const DISMISS_KEY = "mafia_notify_prompt_dismissed_at";
const DAYS = 7;

function Bell({ size = 26, color = "#15110a" }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function NotifyBell() {
  const pathname = usePathname();
  const [eligible, setEligible] = useState(false);
  const [open, setOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  // Hasta no comprobar la suscripción no se pinta la campana (evita que parpadee de
  // "activar" dorada a "gestionar" sutil cuando ya estás suscrito).
  const [checked, setChecked] = useState(false);

  // Re-lee si hay suscripción (tras activar/desactivar en el popup, o al volver a la app),
  // para que la campana cambie de rol sin recargar.
  const refresh = () => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.ready
      .then((r) => r.pushManager.getSubscription())
      .then((s) => setSubscribed(!!s))
      .catch(() => {});
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Solo tiene sentido donde el push funciona (Android, escritorio, o iPhone ya instalado).
    const okPush =
      "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    if (!okPush) return;
    setEligible(true);

    navigator.serviceWorker.ready
      .then((r) => r.pushManager.getSubscription())
      .then((s) => {
        setSubscribed(!!s);
        setChecked(true);
      })
      .catch(() => setChecked(true));

    // Aviso emergente: se abre solo una vez tras unos segundos (soft-ask),
    // salvo que ya esté suscrito o lo hayan cerrado hace poco.
    let t;
    try {
      const ts = parseInt(localStorage.getItem(DISMISS_KEY) || "0", 10);
      const recently = ts && Date.now() - ts < DAYS * 86400000;
      if (!recently) {
        t = setTimeout(async () => {
          const sub = await navigator.serviceWorker.ready
            .then((r) => r.pushManager.getSubscription())
            .catch(() => null);
          if (!sub) setOpen(true);
        }, 5000);
      }
    } catch (_e) {}

    // Al volver al frente, re-chequea por si cambió desde otra pestaña/dispositivo.
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      if (t) clearTimeout(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  if (!eligible || !checked) return null;
  // No en páginas internas (solo tuyas): admin y login.
  if (pathname && (pathname.startsWith("/admin") || pathname.startsWith("/login"))) return null;

  const close = () => {
    setOpen(false);
    refresh(); // por si activó/desactivó dentro del popup
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (_e) {}
  };

  // Sin suscribir: campana dorada que INVITA a activar.
  // Ya suscrito: la misma campana pero sutil, para GESTIONAR (chips + desactivar).
  return (
    <>
      <button
        className={subscribed ? "notify-fab notify-fab--subtle" : "notify-fab"}
        onClick={() => setOpen((o) => !o)}
        aria-label={subscribed ? "Gestionar avisos del clan" : "Activar avisos del clan"}
        aria-expanded={open}
      >
        <Bell color={subscribed ? "#cfd6e6" : "#15110a"} />
        {!subscribed && <span className="notify-fab-dot" aria-hidden="true" />}
      </button>

      {open && (
        <div className="notify-pop-overlay" role="dialog" aria-label="Avisos del clan" onClick={close}>
          <div className="notify-pop" onClick={(e) => e.stopPropagation()}>
            <button className="notify-pop-x" onClick={close} aria-label="Cerrar">✕</button>
            <div className="notify-pop-ico"><Bell /></div>
            {subscribed ? (
              <>
                <h3>Tus avisos</h3>
                <p>Elige qué quieres recibir, o desactívalos cuando quieras.</p>
              </>
            ) : (
              <>
                <h3>Avisos del clan</h3>
                <p>Showmatches, partidas, torneos, reuniones y anuncios — al instante en tu celular.</p>
              </>
            )}
            <PushControls compact />
          </div>
        </div>
      )}
    </>
  );
}
