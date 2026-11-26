"use client";

import { useMemo, useState } from "react";

const MONTHS_FULL = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const MONTHS_ABBR = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
const DOW = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export const EVENT_TYPES = {
  showmatch: { label: "Showmatch", color: "var(--gold)" },
  partida:   { label: "Partida",   color: "var(--terran)" },
  torneo:    { label: "Torneo",    color: "var(--zerg)" },
  reunion:   { label: "Reunión",   color: "var(--live)" },
  anuncio:   { label: "Anuncio",   color: "#ff8a5c" },
  evento:    { label: "Evento",    color: "var(--gold)" },
};

function typeMeta(t) {
  return EVENT_TYPES[(t || "evento").toLowerCase()] || EVENT_TYPES.evento;
}

// Resuelve una fecha JS desde event_date o, como respaldo, desde month/day (texto viejo)
function eventDateObj(ev) {
  if (ev.event_date) {
    const d = new Date(String(ev.event_date).slice(0, 10) + "T00:00:00");
    if (!isNaN(d.getTime())) return d;
  }
  if (ev.month && ev.day) {
    const mi = MONTHS_ABBR.indexOf(String(ev.month).toUpperCase().slice(0, 3));
    const day = parseInt(ev.day, 10);
    if (mi >= 0 && day) {
      const d = new Date(new Date().getFullYear(), mi, day);
      if (!isNaN(d.getTime())) return d;
    }
  }
  return null;
}

const sameDay = (a, b) =>
  a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export default function CalendarSection({ events = [] }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(null);

  // eventos con fecha resuelta
  const dated = useMemo(
    () => events.map((e) => ({ ...e, _date: eventDateObj(e) })).filter((e) => e._date),
    [events]
  );

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  // eventos del mes visible
  const monthEvents = useMemo(
    () =>
      dated
        .filter((e) => e._date.getFullYear() === year && e._date.getMonth() === month)
        .sort((a, b) => a._date - b._date),
    [dated, year, month]
  );

  const eventsByDay = useMemo(() => {
    const map = {};
    for (const e of monthEvents) {
      const k = e._date.getDate();
      (map[k] = map[k] || []).push(e);
    }
    return map;
  }, [monthEvents]);

  // construir celdas (semana empieza lunes)
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const goPrev = () => { setSelected(null); setCursor(new Date(year, month - 1, 1)); };
  const goNext = () => { setSelected(null); setCursor(new Date(year, month + 1, 1)); };
  const goToday = () => { setSelected(null); setCursor(new Date(today.getFullYear(), today.getMonth(), 1)); };

  // lista lateral: día seleccionado o todo el mes
  const listEvents = selected
    ? monthEvents.filter((e) => e._date.getDate() === selected)
    : monthEvents;

  return (
    <div>
      <h2
        style={{
          fontFamily: "'Oxanium', sans-serif",
          fontSize: 34,
          textTransform: "uppercase",
          letterSpacing: "0.02em",
          color: "var(--text-light)",
          marginBottom: 20,
        }}
      >
        <span style={{ color: "var(--gold)" }}>//</span> Calendario
      </h2>

      <div className="cal-layout">
        {/* CALENDARIO */}
        <div className="cal-panel">
          <div className="cal-head">
            <div className="cal-title">
              {MONTHS_FULL[month]} <span style={{ color: "var(--gold)" }}>{year}</span>
            </div>
            <div className="cal-nav">
              <button onClick={goPrev} aria-label="Mes anterior">‹</button>
              <button onClick={goToday} aria-label="Hoy" title="Hoy" style={{ width: "auto", padding: "0 12px", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Hoy</button>
              <button onClick={goNext} aria-label="Mes siguiente">›</button>
            </div>
          </div>

          <div className="cal-grid" style={{ marginBottom: 6 }}>
            {DOW.map((d) => (
              <div key={d} className="cal-dow">{d}</div>
            ))}
          </div>

          <div className="cal-grid">
            {cells.map((d, i) => {
              if (d === null) return <div key={`e${i}`} className="cal-cell empty" />;
              const cellDate = new Date(year, month, d);
              const evs = eventsByDay[d] || [];
              const isToday = sameDay(cellDate, today);
              const isSel = selected === d;
              return (
                <div
                  key={d}
                  className={`cal-cell${isToday ? " today" : ""}${isSel ? " selected" : ""}`}
                  onClick={() => setSelected(isSel ? null : d)}
                >
                  <div className="cal-daynum">{d}</div>
                  <div className="cal-evs">
                    {evs.slice(0, 3).map((e) => (
                      <div
                        key={e.id}
                        className="cal-ev"
                        style={{ background: typeMeta(e.event_type).color }}
                        title={e.title}
                      >
                        {e.title}
                      </div>
                    ))}
                    {evs.length > 3 && <div className="cal-more">+{evs.length - 3} más</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* leyenda */}
          <div className="cal-legend">
            {Object.entries(EVENT_TYPES)
              .filter(([k]) => k !== "evento")
              .map(([k, v]) => (
                <span key={k}><i style={{ background: v.color }} />{v.label}</span>
              ))}
          </div>
        </div>

        {/* PANEL LATERAL */}
        <div className="cal-side">
          <div className="cal-panel">
            <h3>{selected ? `${selected} de ${MONTHS_FULL[month]}` : "Este mes"}</h3>
            <p className="cal-subtitle">
              {selected
                ? `${listEvents.length} evento${listEvents.length === 1 ? "" : "s"}`
                : `${monthEvents.length} evento${monthEvents.length === 1 ? "" : "s"} en ${MONTHS_FULL[month]}`}
              {selected && (
                <>
                  {" · "}
                  <button
                    onClick={() => setSelected(null)}
                    style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, padding: 0 }}
                  >
                    ver todo el mes
                  </button>
                </>
              )}
            </p>

            {listEvents.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                No hay eventos {selected ? "ese día" : "este mes"}.
              </p>
            ) : (
              <div className="cal-list">
                {listEvents.map((e) => {
                  const meta = typeMeta(e.event_type);
                  const d = e._date;
                  return (
                    <div
                      key={e.id}
                      className="cal-item"
                      style={{ cursor: "pointer" }}
                      onClick={() => { window.location.href = `/event/${e.id}`; }}
                    >
                      <span style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 4, background: meta.color }} />
                      <div className="cal-when" style={{ color: meta.color }}>
                        {d.getDate()} {MONTHS_ABBR[d.getMonth()]}
                        {e.event_time ? ` · ${e.event_time}` : ""}
                      </div>
                      <div className="cal-it-title">{e.title}</div>
                      {e.description && <div className="cal-desc">{e.description}</div>}
                      <span className="cal-badge" style={{ background: meta.color }}>{meta.label}</span>
                      {e.link && (
                        <div style={{ marginTop: 8 }}>
                          <a
                            href={e.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(ev) => ev.stopPropagation()}
                            style={{ color: "var(--gold)", fontSize: 12.5, fontWeight: 600 }}
                          >
                            Ver stream / enlace →
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
