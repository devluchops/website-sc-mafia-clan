"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import PushControls from "./PushControls";

const SEEN_KEY = "mafia_notif_last_seen_id";

function Bell({ size = 26, color = "#15110a" }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function hace(ts) {
  try {
    const diff = Date.now() - new Date(ts).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "ahora";
    if (min < 60) return `hace ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `hace ${h} h`;
    const d = Math.floor(h / 24);
    if (d < 7) return `hace ${d} d`;
    return new Date(ts).toLocaleDateString("es-PE", { day: "numeric", month: "short" });
  } catch (_e) {
    return "";
  }
}

export default function NotifyBell() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [lastSeen, setLastSeen] = useState(0);
  const [subscribed, setSubscribed] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [showManage, setShowManage] = useState(false);

  const readLastSeen = () => {
    try { return parseInt(localStorage.getItem(SEEN_KEY) || "0", 10) || 0; } catch (_e) { return 0; }
  };

  const loadItems = useCallback(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d.items) ? d.items : []))
      .catch(() => {});
  }, []);

  const refreshSub = useCallback(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.ready
      .then((r) => r.pushManager.getSubscription())
      .then((s) => setSubscribed(!!s))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setMounted(true);
    setLastSeen(readLastSeen());
    setPushSupported(
      "serviceWorker" in navigator && "PushManager" in window && "Notification" in window
    );
    loadItems();
    refreshSub();
    const onVis = () => {
      if (document.visibilityState === "visible") { loadItems(); refreshSub(); }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [loadItems, refreshSub]);

  const maxId = items.reduce((m, it) => (it.id > m ? it.id : m), 0);
  const unread = items.filter((it) => it.id > lastSeen).length;

  const markAllSeen = () => {
    if (!maxId) return;
    setLastSeen(maxId);
    try { localStorage.setItem(SEEN_KEY, String(maxId)); } catch (_e) {}
    // Baja también el badge rojo del ícono
    if ("clearAppBadge" in navigator) { try { navigator.clearAppBadge().catch(() => {}); } catch (_e) {} }
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then((r) => r.active && r.active.postMessage({ type: "clear-badge" }))
        .catch(() => {});
    }
  };

  const openInbox = () => {
    setOpen(true);
    loadItems();
    refreshSub();
    // marcar visto un instante después, para que se note el resaltado de los nuevos
    setTimeout(markAllSeen, 1200);
  };

  const close = () => { setOpen(false); markAllSeen(); setShowManage(false); };

  const goTo = (url) => {
    if (!url) return;
    close();
    window.location.href = url;
  };

  if (!mounted) return null;
  if (pathname && (pathname.startsWith("/admin") || pathname.startsWith("/login"))) return null;

  const showNudge = unread === 0 && pushSupported && !subscribed;

  return (
    <>
      <button
        className="notify-fab"
        onClick={openInbox}
        aria-label={unread ? `Avisos del clan, ${unread} sin leer` : "Avisos del clan"}
        aria-expanded={open}
      >
        <Bell />
        {unread > 0 && <span className="notify-fab-count" aria-hidden="true">{unread > 9 ? "9+" : unread}</span>}
        {showNudge && <span className="notify-fab-dot" aria-hidden="true" />}
      </button>

      {open && (
        <div className="notify-pop-overlay" role="dialog" aria-label="Avisos del clan" onClick={close}>
          <div className="notify-pop notify-inbox" onClick={(e) => e.stopPropagation()}>
            <button className="notify-pop-x" onClick={close} aria-label="Cerrar">✕</button>
            <div className="notify-inbox-head">
              <span className="notify-inbox-ico"><Bell size={20} color="#ffc24e" /></span>
              <h3>Avisos del clan</h3>
            </div>

            {pushSupported && !subscribed && (
              <div className="notify-inbox-cta">
                <p>Activa los avisos y te llegan al instante al celular.</p>
                <PushControls compact />
              </div>
            )}

            <div className="notify-feed">
              {items.length === 0 ? (
                <p className="notify-feed-empty">Todavía no hay avisos.</p>
              ) : (
                items.map((it) => {
                  const isUnread = it.id > lastSeen;
                  const clickable = !!it.url;
                  return (
                    <div
                      key={it.id}
                      className={"notify-feed-item" + (isUnread ? " unread" : "") + (clickable ? " clickable" : "")}
                      onClick={clickable ? () => goTo(it.url) : undefined}
                      role={clickable ? "button" : undefined}
                      tabIndex={clickable ? 0 : undefined}
                    >
                      <div className="nfi-top">
                        {isUnread && <span className="nfi-dot" aria-hidden="true" />}
                        <strong className="nfi-title">{it.title}</strong>
                        <span className="nfi-time">{hace(it.created_at)}</span>
                      </div>
                      {it.body && <p className="nfi-body">{it.body}</p>}
                      {it.detail && <p className="nfi-detail">{it.detail}</p>}
                      {clickable && <span className="nfi-link">Ver más →</span>}
                    </div>
                  );
                })
              )}
            </div>

            {pushSupported && subscribed && (
              <div className="notify-inbox-manage">
                <button className="notify-manage-toggle" onClick={() => setShowManage((v) => !v)}>
                  {showManage ? "Ocultar ajustes" : "⚙ Gestionar avisos"}
                </button>
                {showManage && <PushControls compact />}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
