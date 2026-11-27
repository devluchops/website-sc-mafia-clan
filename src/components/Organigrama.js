"use client";

import { useRef, useState } from "react";

// Datos por defecto (si la BD aún no tiene organigrama)
const DEFAULTS = {
  lider: ["Scarface"],
  socio: ["Josech", "Akio", "Cap_Nemo"],
  cm: ["Roma"],
  capitan: ["Thanatoz", "Evil", "Gohan"],
  miembro: [
    "Mishu", "Warrium", "Zeus", "Nicola", "Cadenzie", "PC", "Tiwar", "Kiwicha",
    "Neo Pro", "Mielitop", "Kotonano", "Checho", "Duckman", "Robsito", "Lokokame",
    "Sentidos", "Assassin", "Bircoft", "Xukhita",
  ],
};

const C = {
  gold: "#ffc24e", goldHi: "#ffd87a", panel: "#15161c", panel2: "#191b22",
  line: "rgba(255,255,255,0.08)", fg: "#eef1f8", muted: "#8690a6",
  terran: "#5aa9ff", live: "#4ee08a",
};

function groupOrg(org) {
  if (!org || !org.length) return DEFAULTS;
  const by = { lider: [], socio: [], cm: [], capitan: [], miembro: [] };
  org.forEach((e) => { if (by[e.section]) by[e.section].push(e.name); });
  // si alguna sección quedó vacía, usa el default de esa sección
  for (const k of Object.keys(by)) if (!by[k].length) by[k] = DEFAULTS[k];
  return by;
}

function Role({ role, name, color = C.gold, big = false }) {
  return (
    <div style={{
      background: "linear-gradient(180deg, " + C.panel2 + ", " + C.panel + ")",
      border: "1px solid " + C.line, borderTop: "3px solid " + color,
      borderRadius: 10, padding: big ? "18px 20px" : "12px 14px", textAlign: "center",
      minWidth: big ? 170 : 110, boxShadow: "0 0 18px -8px " + color,
    }}>
      <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: C.muted }}>{role}</div>
      <div style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 800, fontSize: big ? 24 : 16, color: C.fg, marginTop: 3, letterSpacing: "0.02em" }}>{name}</div>
    </div>
  );
}

const Connector = () => <div style={{ width: 2, height: 22, background: C.line, margin: "0 auto" }} />;
const LevelLabel = ({ children }) => (
  <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: C.gold, textAlign: "center", margin: "4px 0 10px" }}>{children}</div>
);

export default function Organigrama({ org }) {
  const g = groupOrg(org);
  const chartRef = useRef(null);
  const [pdfBusy, setPdfBusy] = useState(false);

  const downloadPdf = async () => {
    if (!chartRef.current) return;
    setPdfBusy(true);
    try {
      const [h2c, jspdf] = await Promise.all([import("html2canvas"), import("jspdf")]);
      const html2canvas = h2c.default || h2c;
      const jsPDF = jspdf.jsPDF || jspdf.default;

      // Clon fuera de pantalla con ancho fijo (como escritorio) para que el PDF
      // salga completo también desde el celular, sin saltos en la UI.
      const clone = chartRef.current.cloneNode(true);
      clone.style.width = "900px";
      clone.style.maxWidth = "none";
      clone.style.position = "fixed";
      clone.style.left = "-10000px";
      clone.style.top = "0";
      document.body.appendChild(clone);

      let canvas;
      try {
        canvas = await html2canvas(clone, { backgroundColor: "#090a0f", scale: 2, useCORS: true, windowWidth: 980 });
      } finally {
        document.body.removeChild(clone);
      }
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: canvas.width >= canvas.height ? "landscape" : "portrait", unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(img, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("organigrama-clan-mafia.pdf");
    } catch (e) {
      console.error("PDF error:", e);
    }
    setPdfBusy(false);
  };

  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <h2 style={{ fontFamily: "'Oxanium', sans-serif", fontSize: "clamp(24px, 5vw, 34px)", fontWeight: 800, letterSpacing: "0.02em", textTransform: "uppercase", color: C.fg, margin: 0 }}>
          <span style={{ color: C.gold, marginRight: 10 }}>//</span>Organigrama
        </h2>
        <button
          onClick={downloadPdf}
          disabled={pdfBusy}
          style={{
            fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 12.5, letterSpacing: "0.06em", textTransform: "uppercase",
            color: "#15110a", background: "linear-gradient(135deg, " + C.goldHi + ", " + C.gold + ")",
            border: "none", borderRadius: 7, padding: "10px 16px", cursor: "pointer",
          }}
        >
          {pdfBusy ? "Generando..." : "⬇ Descargar PDF"}
        </button>
      </div>

      <div ref={chartRef} style={{ background: "#090a0f", padding: 18, borderRadius: 12, border: "1px solid " + C.line }}>
        <div style={{ textAlign: "center", fontFamily: "'Oxanium', sans-serif", fontWeight: 800, letterSpacing: "0.1em", color: C.gold, fontSize: 16, marginBottom: 18 }}>
          ORGANIGRAMA · CLAN MAFIA
        </div>

        <LevelLabel>Directiva del clan</LevelLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", alignItems: "center" }}>
          <Role role="Líder / Fundador" name={g.lider[0] || "—"} color={C.gold} big />
          <div style={{ display: "flex", flexDirection: "column", gap: 10, justifyContent: "center" }}>
            {g.socio.map((s, i) => <Role key={s + i} role="Socio" name={s} color={C.goldHi} />)}
          </div>
        </div>

        <Connector />
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Role role="Community Manager" name={g.cm[0] || "—"} color={C.terran} />
        </div>

        <Connector />
        <LevelLabel>Capitanes</LevelLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          {g.capitan.map((c, i) => <Role key={c + i} role="Capitán" name={c} color={C.live} />)}
        </div>

        <Connector />
        <LevelLabel>Nómina general de miembros</LevelLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
          {g.miembro.map((n, i) => (
            <div key={n + i} style={{ background: C.panel, border: "1px solid " + C.line, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 9.5, letterSpacing: "0.1em", color: C.muted }}>MIEMBRO {String(i + 1).padStart(2, "0")}</div>
              <div style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 14, color: C.fg, marginTop: 2 }}>{n}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
