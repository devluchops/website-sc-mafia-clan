"use client";

import { useState, useEffect } from "react";

// ============================================================
//  THEME CONSTANTS
// ============================================================
const gold = "#c9a84c";
const darkGold = "#2a2215";
const cardBg = "#111110";
const textMuted = "#6b5c3e";
const textLight = "#e8dcc0";
const textBody = "#d4c5a0";

const RACE_COLORS = {
  Terran: { bg: "rgba(100,160,200,0.12)", border: "rgba(100,160,200,0.35)", text: "#7ab8d4" },
  Zerg: { bg: "rgba(160,100,180,0.12)", border: "rgba(160,100,180,0.35)", text: "#c09ad8" },
  Protoss: { bg: "rgba(201,168,76,0.12)", border: "rgba(201,168,76,0.35)", text: "#c9a84c" },
};

const TAG_COLORS = {
  Guia: { bg: "rgba(201,168,76,0.1)", color: "#c9a84c" },
  Recap: { bg: "rgba(139,92,92,0.15)", color: "#c9a08a" },
  Noticias: { bg: "rgba(107,92,62,0.2)", color: "#a89060" },
};

const RANK_ORDER = { Lider: 0, Oficial: 1, Miembro: 2, Recruit: 3 };

// ============================================================
//  SMALL COMPONENTS
// ============================================================

function Avatar({ name, race, avatar, size = 48 }) {
  const rc = RACE_COLORS[race] || RACE_COLORS.Terran;
  const [err, setErr] = useState(false);

  if (avatar && !err) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          border: `2px solid ${rc.border}`,
          flexShrink: 0,
        }}
      >
        <img
          src={avatar}
          alt={name}
          onError={() => setErr(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: rc.bg,
        border: `2px solid ${rc.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Cinzel', serif",
        fontWeight: 700,
        fontSize: size * 0.38,
        color: rc.text,
        flexShrink: 0,
      }}
    >
      {race[0]}
    </div>
  );
}

function Tag({ label }) {
  const tc = TAG_COLORS[label] || TAG_COLORS.Noticias;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 1,
        textTransform: "uppercase",
        padding: "3px 10px",
        borderRadius: 4,
        background: tc.bg,
        color: tc.color,
      }}
    >
      {label}
    </span>
  );
}

function StatusBadge({ status }) {
  const isOpen = status === "Abierto";
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "4px 12px",
        borderRadius: 4,
        background: isOpen ? "rgba(201,168,76,0.1)" : "rgba(107,92,62,0.15)",
        color: isOpen ? gold : "#a89060",
        whiteSpace: "nowrap",
        marginLeft: "auto",
        flexShrink: 0,
      }}
    >
      {status}
    </span>
  );
}

function SectionTitle({ children }) {
  return (
    <h2
      style={{
        fontFamily: "'Cinzel', serif",
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: 3,
        textTransform: "uppercase",
        color: gold,
        marginBottom: 20,
        paddingBottom: 10,
        borderBottom: `1px solid ${darkGold}`,
      }}
    >
      {children}
    </h2>
  );
}

function Card({ children, style: s, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        background: cardBg,
        border: `1px solid ${hovered ? gold : darkGold}`,
        borderRadius: 10,
        padding: 18,
        transition: "border-color 0.25s, transform 0.2s",
        cursor: onClick ? "pointer" : "default",
        transform: hovered && onClick ? "translateY(-2px)" : "none",
        ...s,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================
//  SECTIONS
// ============================================================

function BlogSection({ posts }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SectionTitle>Publicaciones recientes</SectionTitle>
      {posts.map((p, i) => (
        <Card key={i} onClick={() => {}}>
          <Tag label={p.tag} />
          <h3
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 17,
              fontWeight: 600,
              color: textLight,
              margin: "10px 0 6px",
              lineHeight: 1.35,
            }}
          >
            {p.title}
          </h3>
          <p
            style={{
              fontSize: 13,
              color: textBody,
              margin: "0 0 8px",
              lineHeight: 1.5,
            }}
          >
            {p.excerpt}
          </p>
          <p style={{ fontSize: 12, color: textMuted, margin: 0 }}>
            Por {p.author} &bull; {p.date} &bull; {p.readTime} lectura
          </p>
        </Card>
      ))}
    </div>
  );
}

function VideosSection({ videos }) {
  return (
    <div>
      <SectionTitle>Videos y replays</SectionTitle>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        {videos.map((v, i) => {
          const thumb = v.youtubeId
            ? `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`
            : null;
          const link = v.youtubeId
            ? `https://www.youtube.com/watch?v=${v.youtubeId}`
            : null;

          return (
            <Card
              key={i}
              style={{ padding: 0, overflow: "hidden" }}
              onClick={link ? () => window.open(link, "_blank") : undefined}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16/9",
                  background: thumb
                    ? `url(${thumb}) center/cover`
                    : "#1a1810",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    border: `2px solid ${gold}`,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(10,10,10,0.6)",
                  }}
                >
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: `12px solid ${gold}`,
                      borderTop: "7px solid transparent",
                      borderBottom: "7px solid transparent",
                      marginLeft: 3,
                    }}
                  />
                </div>
                <span
                  style={{
                    position: "absolute",
                    bottom: 6,
                    right: 8,
                    fontSize: 11,
                    fontWeight: 600,
                    background: "rgba(10,10,10,0.75)",
                    color: textBody,
                    padding: "2px 6px",
                    borderRadius: 3,
                  }}
                >
                  {v.duration}
                </span>
              </div>
              <div style={{ padding: "12px 14px" }}>
                <p
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: 14,
                    fontWeight: 600,
                    color: textLight,
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {v.title}
                </p>
                <p style={{ fontSize: 11, color: textMuted, margin: "4px 0 0" }}>
                  {v.date}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function RosterSection({ members }) {
  const [sortBy, setSortBy] = useState("rank");
  const sorted = [...members].sort((a, b) => {
    if (sortBy === "rank")
      return (RANK_ORDER[a.rank] ?? 99) - (RANK_ORDER[b.rank] ?? 99);
    if (sortBy === "mmr") return b.mmr - a.mmr;
    return a.name.localeCompare(b.name);
  });

  return (
    <div>
      <SectionTitle>Miembros del clan</SectionTitle>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["rank", "mmr", "name"].map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            style={{
              background:
                sortBy === s ? "rgba(201,168,76,0.12)" : "transparent",
              border: `1px solid ${sortBy === s ? gold : darkGold}`,
              color: sortBy === s ? gold : textMuted,
              fontFamily: "'Cinzel', serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              padding: "6px 14px",
              borderRadius: 6,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {s === "rank" ? "Por rango" : s === "mmr" ? "Por MMR" : "Por nombre"}
          </button>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))",
          gap: 12,
        }}
      >
        {sorted.map((m, i) => {
          const rc = RACE_COLORS[m.race] || RACE_COLORS.Terran;
          return (
            <Card key={i} style={{ textAlign: "center", padding: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <Avatar
                  name={m.name}
                  race={m.race}
                  avatar={m.avatar}
                  size={56}
                />
              </div>
              <p
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 14,
                  fontWeight: 600,
                  color: textLight,
                  margin: 0,
                }}
              >
                {m.name}
              </p>
              <p style={{ fontSize: 11, color: textMuted, margin: "2px 0 6px" }}>
                {m.rank}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <span
                  style={{ fontSize: 11, color: rc.text, fontWeight: 600 }}
                >
                  {m.race}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: textMuted,
                    background: "rgba(201,168,76,0.06)",
                    padding: "2px 6px",
                    borderRadius: 3,
                  }}
                >
                  {m.mmr} MMR
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function EventsSection({ events }) {
  return (
    <div>
      <SectionTitle>Proximos eventos</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {events.map((e, i) => (
          <Card
            key={i}
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              padding: 16,
            }}
          >
            <div style={{ textAlign: "center", minWidth: 48 }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: gold,
                  margin: 0,
                }}
              >
                {e.month}
              </p>
              <p
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 24,
                  fontWeight: 700,
                  color: textLight,
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                {e.day}
              </p>
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 15,
                  fontWeight: 600,
                  color: textLight,
                  margin: 0,
                }}
              >
                {e.title}
              </p>
              <p style={{ fontSize: 12, color: textMuted, margin: "3px 0 0" }}>
                {e.desc}
              </p>
            </div>
            <StatusBadge status={e.status} />
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================
//  MAIN PAGE
// ============================================================

const TABS = [
  { id: "blog", label: "Blog" },
  { id: "videos", label: "Videos" },
  { id: "roster", label: "Miembros" },
  { id: "events", label: "Eventos" },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("blog");
  const [logoErr, setLogoErr] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar datos desde la API
    fetch("/api/clan")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: textMuted,
        }}
      >
        Cargando...
      </div>
    );
  }

  const { clan, members, posts, videos, events } = data;

  return (
    <>
      {/* HERO */}
      <header
        style={{
          padding: "48px 24px 32px",
          textAlign: "center",
          borderBottom: `1px solid ${darkGold}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -80,
            left: "50%",
            transform: "translateX(-50%)",
            width: 500,
            height: 500,
            background:
              "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            width: 160,
            height: 160,
            margin: "0 auto 16px",
            borderRadius: "50%",
            overflow: "hidden",
            border: `2px solid ${gold}`,
            background: cardBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!logoErr ? (
            <img
              src={clan.logo}
              alt={clan.name}
              onError={() => setLogoErr(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 56,
                fontWeight: 700,
                color: gold,
              }}
            >
              {clan.name[0]}
            </span>
          )}
        </div>

        <h1
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: 8,
            color: gold,
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          {clan.name}
        </h1>
        <p
          style={{
            fontSize: 13,
            color: textMuted,
            marginTop: 8,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {clan.tagline}
        </p>
      </header>

      {/* NAV */}
      <nav
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 4,
          padding: "12px 16px",
          background: "#0d0d0a",
          borderBottom: `1px solid ${darkGold}`,
          flexWrap: "wrap",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              background:
                activeTab === t.id
                  ? "rgba(201,168,76,0.08)"
                  : "transparent",
              border: "none",
              color: activeTab === t.id ? gold : textMuted,
              fontFamily: "'Cinzel', serif",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase",
              padding: "10px 18px",
              cursor: "pointer",
              borderRadius: 6,
              transition: "all 0.2s",
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* CONTENT */}
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "32px 20px 48px" }}>
        {activeTab === "blog" && <BlogSection posts={posts} />}
        {activeTab === "videos" && <VideosSection videos={videos} />}
        {activeTab === "roster" && <RosterSection members={members} />}
        {activeTab === "events" && <EventsSection events={events} />}
      </main>

      {/* FOOTER */}
      <footer
        style={{
          textAlign: "center",
          padding: "24px 16px",
          borderTop: `1px solid ${darkGold}`,
          fontFamily: "'Cinzel', serif",
          fontSize: 11,
          color: "#3d3525",
          letterSpacing: 2,
        }}
      >
        {clan.name} &bull; {new Date().getFullYear()}
      </footer>
    </>
  );
}
