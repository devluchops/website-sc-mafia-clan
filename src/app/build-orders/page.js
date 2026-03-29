"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const gold = "#c9a84c";
const darkGold = "#3d3525";
const cardBg = "#252220";
const bg = "#1e1b18";
const textMuted = "#8b7b5e";
const textLight = "#e8dcc0";

const RACE_COLORS = {
  Protoss: { bg: "rgba(201,168,76,0.15)", border: "#c9a84c", text: "#c9a84c" },
  Terran: { bg: "rgba(100,160,200,0.15)", border: "#7ab8d4", text: "#7ab8d4" },
  Zerg: { bg: "rgba(160,100,180,0.15)", border: "#c09ad8", text: "#c09ad8" },
};

export default function BuildOrdersPage() {
  const [builds, setBuilds] = useState([]);
  const [selectedRace, setSelectedRace] = useState("all");
  const [selectedBuild, setSelectedBuild] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/build-orders")
      .then((res) => res.json())
      .then((data) => {
        setBuilds(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredBuilds = builds.filter(
    (build) => selectedRace === "all" || build.race === selectedRace
  );

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\s]+)/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Cargando build orders...</div>
      </div>
    );
  }

  if (selectedBuild) {
    const embedUrl = getYouTubeEmbedUrl(selectedBuild.video_url);
    const raceColor = RACE_COLORS[selectedBuild.race];

    return (
      <div style={styles.container}>
        <div style={styles.content}>
          {/* Header con botón volver */}
          <div style={styles.header}>
            <button
              onClick={() => setSelectedBuild(null)}
              style={styles.backButton}
            >
              ← Volver a builds
            </button>
            <h1 style={styles.mainTitle}>BUILD ORDERS</h1>
          </div>

          {/* Build Detail */}
          <div style={styles.buildDetail}>
            {/* Title */}
            <div style={{
              borderLeft: `4px solid ${raceColor.border}`,
              paddingLeft: 20,
              marginBottom: 30
            }}>
              <h2 style={{ ...styles.buildTitle, color: raceColor.text }}>
                {selectedBuild.name}
              </h2>
              <div style={styles.buildMeta}>
                <span style={{ ...styles.raceBadge, ...raceColor }}>
                  {selectedBuild.race}
                </span>
                <span style={styles.difficulty}>{selectedBuild.difficulty}</span>
                {selectedBuild.matchups.map((m) => (
                  <span key={m} style={styles.matchupTag}>{m}</span>
                ))}
              </div>
            </div>

            {/* Video */}
            {embedUrl && (
              <div style={styles.videoContainer}>
                <iframe
                  width="100%"
                  height="100%"
                  src={embedUrl}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={styles.video}
                />
              </div>
            )}

            {/* Description */}
            <div style={styles.description}>
              <h3 style={styles.sectionTitle}>Descripción</h3>
              <p style={styles.descriptionText}>{selectedBuild.description}</p>
            </div>

            {/* Build Steps */}
            <div style={styles.stepsContainer}>
              <h3 style={styles.sectionTitle}>Build Order</h3>
              <div style={styles.steps}>
                {selectedBuild.build_steps.map((step, idx) => (
                  <div key={idx} style={styles.step}>
                    <div style={styles.stepNumber}>{idx + 1}</div>
                    <div style={styles.stepContent}>
                      {step.supply && (
                        <span style={styles.supply}>{step.supply} Supply</span>
                      )}
                      {step.time && (
                        <span style={styles.time}>{step.time}</span>
                      )}
                      {step.trigger && (
                        <span style={styles.trigger}>{step.trigger}</span>
                      )}
                      {step.gas && (
                        <span style={styles.gas}>{step.gas} Gas</span>
                      )}
                      <span style={styles.action}>{step.action}</span>
                      {step.notes && (
                        <p style={styles.stepNotes}>{step.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            {selectedBuild.tags && selectedBuild.tags.length > 0 && (
              <div style={styles.tagsContainer}>
                <h3 style={styles.sectionTitle}>Tags</h3>
                <div style={styles.tags}>
                  {selectedBuild.tags.map((tag) => (
                    <span key={tag} style={styles.tag}>{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <Link href="/" style={styles.backButton}>
            ← Volver al inicio
          </Link>
          <h1 style={styles.mainTitle}>BUILD ORDERS</h1>
          <p style={styles.subtitle}>
            Guías de build orders de StarCraft Fastest League
          </p>
        </div>

        {/* Race Filter */}
        <div style={styles.filterContainer}>
          {["all", "Protoss", "Terran", "Zerg"].map((race) => (
            <button
              key={race}
              onClick={() => setSelectedRace(race)}
              style={{
                ...styles.filterButton,
                ...(selectedRace === race ? styles.filterButtonActive : {}),
              }}
            >
              {race === "all" ? "Todas las razas" : race}
            </button>
          ))}
        </div>

        {/* Build Orders Grid */}
        <div style={styles.grid}>
          {filteredBuilds.map((build) => {
            const raceColor = RACE_COLORS[build.race];
            return (
              <div
                key={build.id}
                style={{
                  ...styles.card,
                  borderLeft: `4px solid ${raceColor.border}`,
                }}
                onClick={() => setSelectedBuild(build)}
              >
                <div style={styles.cardHeader}>
                  <h3 style={{ ...styles.cardTitle, color: raceColor.text }}>
                    {build.name}
                  </h3>
                  <span style={{ ...styles.raceBadge, ...raceColor }}>
                    {build.race}
                  </span>
                </div>

                <p style={styles.cardDescription}>
                  {build.description.substring(0, 150)}
                  {build.description.length > 150 ? "..." : ""}
                </p>

                <div style={styles.cardFooter}>
                  <div style={styles.matchups}>
                    {build.matchups.slice(0, 3).map((m) => (
                      <span key={m} style={styles.matchupTag}>{m}</span>
                    ))}
                    {build.matchups.length > 3 && (
                      <span style={styles.matchupTag}>+{build.matchups.length - 3}</span>
                    )}
                  </div>
                  <span style={styles.difficulty}>{build.difficulty}</span>
                </div>

                {build.video_url && (
                  <div style={styles.hasVideo}>
                    <span style={styles.videoIcon}>▶</span> Video disponible
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredBuilds.length === 0 && (
          <div style={styles.noResults}>
            No hay build orders para esta raza
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: `linear-gradient(135deg, ${bg} 0%, #0a0a0a 100%)`,
    padding: "40px 20px",
  },
  content: {
    maxWidth: 1200,
    margin: "0 auto",
  },
  loading: {
    textAlign: "center",
    color: gold,
    fontSize: 18,
    padding: 60,
  },
  header: {
    textAlign: "center",
    marginBottom: 40,
  },
  backButton: {
    background: "transparent",
    border: `1px solid ${darkGold}`,
    color: textMuted,
    padding: "8px 16px",
    borderRadius: 6,
    fontSize: 14,
    cursor: "pointer",
    marginBottom: 20,
    textDecoration: "none",
    display: "inline-block",
    transition: "all 0.2s",
  },
  mainTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: 48,
    fontWeight: 700,
    color: gold,
    margin: "20px 0 10px",
    letterSpacing: 4,
  },
  subtitle: {
    color: textMuted,
    fontSize: 16,
    margin: 0,
  },
  filterContainer: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    marginBottom: 40,
    flexWrap: "wrap",
  },
  filterButton: {
    background: "transparent",
    border: `1px solid ${darkGold}`,
    color: textMuted,
    padding: "10px 20px",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  filterButtonActive: {
    background: gold,
    color: bg,
    borderColor: gold,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 24,
  },
  card: {
    background: cardBg,
    border: `1px solid ${darkGold}`,
    borderRadius: 10,
    padding: 20,
    cursor: "pointer",
    transition: "all 0.3s",
    position: "relative",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
    margin: 0,
    flex: 1,
  },
  raceBadge: {
    padding: "4px 12px",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
    border: "1px solid",
  },
  cardDescription: {
    color: textMuted,
    fontSize: 14,
    lineHeight: 1.6,
    marginBottom: 16,
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  matchups: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  matchupTag: {
    background: "rgba(201,168,76,0.1)",
    color: gold,
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
  },
  difficulty: {
    color: textMuted,
    fontSize: 12,
    fontWeight: 600,
  },
  hasVideo: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTop: `1px solid ${darkGold}`,
    color: gold,
    fontSize: 12,
    fontWeight: 600,
  },
  videoIcon: {
    fontSize: 10,
  },
  noResults: {
    textAlign: "center",
    color: textMuted,
    fontSize: 16,
    padding: 60,
  },
  // Build Detail Styles
  buildDetail: {
    background: cardBg,
    border: `1px solid ${darkGold}`,
    borderRadius: 10,
    padding: 40,
  },
  buildTitle: {
    fontSize: 32,
    fontWeight: 700,
    margin: "0 0 16px 0",
    fontFamily: "'Cinzel', serif",
  },
  buildMeta: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
  },
  videoContainer: {
    width: "100%",
    paddingBottom: "56.25%",
    position: "relative",
    marginBottom: 30,
    borderRadius: 10,
    overflow: "hidden",
  },
  video: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  description: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: 20,
    fontWeight: 600,
    color: gold,
    marginBottom: 16,
  },
  descriptionText: {
    color: textLight,
    fontSize: 16,
    lineHeight: 1.8,
    margin: 0,
  },
  stepsContainer: {
    marginBottom: 30,
  },
  steps: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  step: {
    display: "flex",
    gap: 16,
    background: bg,
    padding: 16,
    borderRadius: 6,
    border: `1px solid ${darkGold}`,
  },
  stepNumber: {
    background: gold,
    color: bg,
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0,
  },
  stepContent: {
    flex: 1,
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  supply: {
    background: "rgba(201,168,76,0.15)",
    color: gold,
    padding: "4px 10px",
    borderRadius: 4,
    fontSize: 13,
    fontWeight: 700,
  },
  time: {
    background: "rgba(100,160,200,0.15)",
    color: "#7ab8d4",
    padding: "4px 10px",
    borderRadius: 4,
    fontSize: 13,
    fontWeight: 700,
  },
  trigger: {
    background: "rgba(160,100,180,0.15)",
    color: "#c09ad8",
    padding: "4px 10px",
    borderRadius: 4,
    fontSize: 13,
    fontWeight: 600,
  },
  gas: {
    background: "rgba(76,201,76,0.15)",
    color: "#4CAF50",
    padding: "4px 10px",
    borderRadius: 4,
    fontSize: 13,
    fontWeight: 700,
  },
  action: {
    color: textLight,
    fontSize: 15,
    fontWeight: 600,
  },
  stepNotes: {
    width: "100%",
    color: textMuted,
    fontSize: 13,
    margin: "8px 0 0 0",
    fontStyle: "italic",
  },
  tagsContainer: {
    marginTop: 30,
  },
  tags: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  tag: {
    background: "rgba(201,168,76,0.1)",
    color: gold,
    padding: "6px 14px",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    border: `1px solid ${darkGold}`,
  },
};
