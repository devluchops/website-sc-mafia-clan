"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "mafia_install_dismissed_at";
const DISMISS_DAYS = 7; // no volver a molestar por 7 días

const GOLD = "#ffc24e";
const GOLD_HI = "#ffd87a";

// Ícono "Compartir" de iOS (cuadro con flecha hacia arriba)
function ShareGlyph({ size = 18, color = GOLD }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ verticalAlign: "-3px" }}>
      <path d="M12 3v12M12 3l-3.2 3.2M12 3l3.2 3.2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 10H5.5A1.5 1.5 0 0 0 4 11.5v7A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 18.5 10H17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const [installEvent, setInstallEvent] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [iosIsSafari, setIosIsSafari] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

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
    // Safari de verdad (no Chrome/Firefox/Edge iOS ni navegador in-app)
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
    setIsIOS(ios);
    setIosIsSafari(isSafari);

    // Android/escritorio: capturar el prompt nativo
    const onPrompt = (e) => {
      e.preventDefault();
      setInstallEvent(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iPhone: mostrar el aviso con instrucciones tras un momento
    let t;
    if (ios && !inStandaloneIOS) {
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
    setShowSteps(false);
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
    <>
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
              {iosIsSafari
                ? "Se instala en 3 pasos desde Safari."
                : "Ábrelo en Safari para poder instalarlo."}
            </div>
          ) : (
            <div style={{ color: "#9a948a", fontSize: 12.5, marginTop: 2, lineHeight: 1.4 }}>
              Recibe showmatches y eventos al instante, como una app.
            </div>
          )}
        </div>

        {isIOS ? (
          <button
            onClick={() => setShowSteps(true)}
            style={{
              flex: "none",
              fontFamily: "'Oxanium', sans-serif",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontSize: 13,
              color: "#15110a",
              background: `linear-gradient(135deg, ${GOLD_HI}, ${GOLD})`,
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            Cómo instalar
          </button>
        ) : (
          installEvent && (
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
                background: `linear-gradient(135deg, ${GOLD_HI}, ${GOLD})`,
                border: "none",
                borderRadius: 8,
                padding: "10px 16px",
                cursor: "pointer",
              }}
            >
              Instalar
            </button>
          )
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

      {showSteps && (
        <div
          role="dialog"
          aria-label="Pasos para instalar en iPhone"
          onClick={() => setShowSteps(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2100,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: "16px",
            paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
            fontFamily: "'Oxanium', sans-serif",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 480,
              background: "linear-gradient(180deg, #17171e, #121218)",
              border: "1px solid rgba(255,194,78,0.4)",
              borderRadius: 16,
              boxShadow: "0 24px 60px -18px rgba(0,0,0,0.85)",
              padding: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ fontWeight: 800, color: "#f4f1ea", fontSize: 17, flex: 1 }}>
                Instalar MAFIA en iPhone
              </div>
              <button
                onClick={() => setShowSteps(false)}
                aria-label="Cerrar"
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
                  color: "#9a948a", fontSize: 16, cursor: "pointer", lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {!iosIsSafari && (
              <div
                style={{
                  background: "rgba(255,194,78,0.1)",
                  border: "1px solid rgba(255,194,78,0.35)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  color: "#e8dcc0",
                  fontSize: 13,
                  lineHeight: 1.45,
                  marginBottom: 14,
                }}
              >
                Estás en otro navegador. Abre <b style={{ color: GOLD }}>clanmafia.devluchops.space</b> en{" "}
                <b style={{ color: GOLD }}>Safari</b> para poder instalarla (Chrome en iPhone no deja).
              </div>
            )}

            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
              {[
                <>Toca el botón <b style={{ color: GOLD }}>Compartir</b> <ShareGlyph /> en la barra de Safari (abajo en iPhone, arriba en iPad).</>,
                <>Desliza hacia abajo y elige <b style={{ color: GOLD }}>“Añadir a pantalla de inicio”</b>.</>,
                <>Revisa que el nombre diga <b style={{ color: GOLD }}>“Clan MAFIA”</b> (si no, edítalo ahí) y toca <b style={{ color: GOLD }}>“Añadir”</b>. El ícono queda en tu pantalla.</>,
              ].map((txt, i) => (
                <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span
                    style={{
                      flex: "none",
                      width: 26, height: 26, borderRadius: "50%",
                      display: "grid", placeItems: "center",
                      background: `linear-gradient(135deg, ${GOLD_HI}, ${GOLD})`,
                      color: "#15110a", fontWeight: 800, fontSize: 14,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ color: "#d4c5a0", fontSize: 14, lineHeight: 1.5, paddingTop: 2 }}>{txt}</span>
                </li>
              ))}
            </ol>

            <div style={{ color: "#8b7b5e", fontSize: 12, marginTop: 16, lineHeight: 1.45 }}>
              Ya instalada, ábrela desde ese ícono para recibir showmatches, partidas y anuncios.
              En Android aparece sola la opción de instalar; en iPhone hay que hacerlo así.
            </div>

            <button
              onClick={dismiss}
              style={{
                marginTop: 16,
                width: "100%",
                fontFamily: "'Oxanium', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: "#15110a",
                background: `linear-gradient(135deg, ${GOLD_HI}, ${GOLD})`,
                border: "none",
                borderRadius: 10,
                padding: "12px 16px",
                cursor: "pointer",
              }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
