"use client";

// Organigrama oficial del Clan MAFIA (documento oficial).
const LIDER = "Scarface";
const SOCIOS = ["Josech", "Akio", "Cap_Nemo"];
const CM = "Roma";
const CAPITANES = ["Thanatoz", "Evil", "Gohan"];
const NOMINA = [
  "Mishu", "Warrium", "Zeus", "Nicola", "Cadenzie", "PC", "Tiwar", "Kiwicha",
  "Neo Pro", "Mielitop", "Kotonano", "Checho", "Duckman", "Robsito", "Lokokame",
  "Sentidos", "Assassin", "Bircoft", "Xukhita",
];

const C = {
  gold: "#ffc24e",
  goldHi: "#ffd87a",
  panel: "#15161c",
  panel2: "#191b22",
  line: "rgba(255,255,255,0.08)",
  fg: "#eef1f8",
  muted: "#8690a6",
  terran: "#5aa9ff",
  live: "#4ee08a",
};

function Role({ role, name, color = C.gold, big = false }) {
  return (
    <div
      style={{
        background: "linear-gradient(180deg, " + C.panel2 + ", " + C.panel + ")",
        border: "1px solid " + C.line,
        borderTop: "3px solid " + color,
        borderRadius: 10,
        padding: big ? "18px 20px" : "12px 14px",
        textAlign: "center",
        minWidth: big ? 180 : 120,
        boxShadow: "0 0 18px -8px " + color,
      }}
    >
      <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: C.muted }}>
        {role}
      </div>
      <div style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 800, fontSize: big ? 24 : 16, color: C.fg, marginTop: 3, letterSpacing: "0.02em" }}>
        {name}
      </div>
    </div>
  );
}

function Connector() {
  return <div style={{ width: 2, height: 22, background: C.line, margin: "0 auto" }} />;
}

function LevelLabel({ children }) {
  return (
    <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: C.gold, textAlign: "center", margin: "4px 0 10px" }}>
      {children}
    </div>
  );
}

export default function Organigrama() {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ fontFamily: "'Oxanium', sans-serif", fontSize: "clamp(24px, 5vw, 34px)", fontWeight: 800, letterSpacing: "0.02em", textTransform: "uppercase", color: C.fg, marginBottom: 24 }}>
        <span style={{ color: C.gold, marginRight: 10 }}>//</span>Organigrama
      </h2>

      {/* Directiva: Líder + Socios */}
      <LevelLabel>Directiva del clan</LevelLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", alignItems: "stretch" }}>
        <Role role="Líder / Fundador" name={LIDER} color={C.gold} big />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, justifyContent: "center" }}>
          {SOCIOS.map((s) => (
            <Role key={s} role="Socio" name={s} color={C.goldHi} />
          ))}
        </div>
      </div>

      <Connector />

      {/* Community Manager */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Role role="Community Manager" name={CM} color={C.terran} />
      </div>

      <Connector />

      {/* Capitanes */}
      <LevelLabel>Capitanes</LevelLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
        {CAPITANES.map((c) => (
          <Role key={c} role="Capitán" name={c} color={C.live} />
        ))}
      </div>

      <Connector />

      {/* Nómina */}
      <LevelLabel>Nómina general de miembros</LevelLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
        {NOMINA.map((n, i) => (
          <div
            key={n}
            style={{
              background: C.panel,
              border: "1px solid " + C.line,
              borderRadius: 8,
              padding: "10px 12px",
              textAlign: "center",
            }}
          >
            <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 9.5, letterSpacing: "0.1em", color: C.muted }}>
              MIEMBRO {String(i + 1).padStart(2, "0")}
            </div>
            <div style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 14, color: C.fg, marginTop: 2 }}>
              {n}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
