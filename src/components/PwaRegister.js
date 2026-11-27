"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("SW registration failed:", err);
      });
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register);

    // Borrar el numerito rojo del ícono cuando la app está abierta/al frente.
    const clearBadge = () => {
      if ("clearAppBadge" in navigator) {
        try {
          navigator.clearAppBadge().catch(() => {});
        } catch (_e) {}
      }
      navigator.serviceWorker.ready
        .then((reg) => reg.active && reg.active.postMessage({ type: "clear-badge" }))
        .catch(() => {});
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") clearBadge();
    };
    clearBadge();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.removeEventListener("load", register);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
