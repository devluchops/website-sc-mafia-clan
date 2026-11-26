"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "mafia_install_dismissed_at";
const DISMISS_DAYS = 7; // no volver a molestar por 7 días

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const [installEvent, setInstallEvent] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // ¿ya instalada? no mostrar
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (standalone) return;

    // ¿descartada hace poco?
    try {
      const ts = parseInt(localStorage.getItem(DISMISS_KEY) || "0", 10);
      if (ts && Date.now() - ts < DISMISS_DAYS * 86400000) return;
    } catch (_e) {}

    const ua = window.navigator.userAgent || "";
    const ios = /iphone|ipad|ipod/i.test(ua);
    const inStandaloneIOS = window.navigator.standalone === true;
    setIsIOS(ios);

    // Android/escritorio: capturar el prompt nativo
    const onPrompt = (e) => {
      e.preventDefault();
      setInstallEvent(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iPhone Safari (no Chrome/in-app): mostrar instrucciones tras un momento
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
    let t;
    if (ios && isSafari && !inStandaloneIOS) {
      t = setTimeout(() => setShow(true), 2500);
    }

    const onInstalled = () => setShow(false);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      if (t) clearTimeout(t);
    };
  }, []);

  const dismiss = () => {
    setShow(false);
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (_e) {}
  };

  const install = async () => {
    if (!installEvent) return;
    installEvent.prompt();
    try { await installEvent.userChoice; } catch (_e) {}
    setInstallEvent(null);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Instalar app Clan MAFIA"
      style={{
        position: "fixed",
        left: "max(12px, env(safe-area-inset-left, 0px))",
        right: "max(12px, env(safe-area-inset-right, 0px))",
        bottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
        zIndex: 2000,
        maxWidth: 520,
        margin: "0 auto",
        background: "linear-gradient(180deg, #17171e, #121218)",
        border: "1px solid rgba(255,194,78,0.4)",
        borderRadius: 14,
        boxShadow: "0 18px 50px -16px rgba(0,0,0,0.8)",
        padding: 16,
        display: "flex",
        gap: 14,
        alignItems: "center",
        fontFamily: "'Oxanium', sans-serif",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          flex: "none",
          borderRadius: 10,
          display: "grid",
          placeItems: "center",
          background: "radial-gradient(circle at 35% 30%, #ffd87a, #a6791f)",
          color: "#15110a",
          fontWeight: 800,
          fontSize: 22,
          boxShadow: "0 0 16px rgba(255,194,78,0.4)",
        }}
      >
        M
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, color: "#f4f1ea", fontSize: 15 }}>
          Instala MAFIA en tu celular
        </div>
        {isIOS ? (
          <div style={{ color: "#9a948a", fontSize: 12.5, marginTop: 2, lineHeight: 1.4 }}>
            Toca <b style={{ color: "#ffc24e" }}>Compartir</b> ⬆️ y luego{" "}
            <b style={{ color: "#ffc24e" }}>“Añadir a pantalla de inicio”</b>.
          </div>
        ) : (
          <div style={{ color: "#9a948a", fontSize: 12.5, marginTop: 2, lineHeight: 1.4 }}>
            Recibe showmatches y eventos al instante, como una app.
          </div>
        )}
      </div>

      {!isIOS && installEvent && (
        <button
          onClick={install}
          style={{
            flex: "none",
            fontFamily: "'Oxanium', sans-serif",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            fontSize: 13,
            color: "#15110a",
            background: "linear-gradient(135deg, #ffd87a, #ffc24e)",
            border: "none",
            borderRadius: 8,
            padding: "10px 16px",
            cursor: "pointer",
          }}
        >
          Instalar
        </button>
      )}

      <button
        onClick={dismiss}
        aria-label="Cerrar"
        style={{
          flex: "none",
          width: 30,
          height: 30,
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "transparent",
          color: "#9a948a",
          fontSize: 16,
          cursor: "pointer",
          lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  );
}
