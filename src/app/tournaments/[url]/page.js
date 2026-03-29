"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// Forzar renderizado dinámico (no pre-renderizar)
export const dynamic = 'force-dynamic';

const gold = "#c9a84c";
const darkGold = "#3d3525";
const cardBg = "#252220";
const bg = "#1e1b18";
const textMuted = "#8b7b5e";
const textLight = "#e8dcc0";
const textBody = "#d4c5a0";

export default function TournamentPage() {
  const params = useParams();
  const router = useRouter();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.url) return;

    // Cargar detalles del torneo
    fetch(`/api/tournaments?id=${params.url}`)
      .then((res) => res.json())
      .then((data) => {
        setTournament(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [params.url]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: textMuted, fontFamily: "'Cinzel', serif", letterSpacing: 2 }}>Cargando...</p>
      </div>
    );
  }

  if (!tournament || !tournament.tournament) {
    return (
      <div style={{ minHeight: "100vh", background: bg, padding: "2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Link href="/" style={{ color: gold, textDecoration: "none", fontSize: 14 }}>
            ← Volver al inicio
          </Link>
          <p style={{ color: textMuted, marginTop: 40, textAlign: "center" }}>Torneo no encontrado</p>
        </div>
      </div>
    );
  }

  const t = tournament.tournament;

  const stateLabels = {
    pending: "Pendiente",
    underway: "En Curso",
    awaiting_review: "En Revisión",
    complete: "Completado"
  };

  const stateColors = {
    pending: { bg: "rgba(201,168,76,0.1)", text: gold },
    underway: { bg: "rgba(76,201,130,0.1)", text: "#4cc982" },
    awaiting_review: { bg: "rgba(100,160,200,0.1)", text: "#7ab8d4" },
    complete: { bg: "rgba(139,92,92,0.1)", text: "#c9a08a" }
  };

  const stateColor = stateColors[t.state] || stateColors.pending;

  return (
    <div style={{ minHeight: "100vh", background: bg, color: textLight }}>
      {/* Header */}
      <header style={{
        background: cardBg,
        borderBottom: `1px solid ${darkGold}`,
        padding: "20px 24px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Link href="/#tournaments" style={{ color: gold, textDecoration: "none", fontSize: 14, marginBottom: 16, display: "inline-block" }}>
            ← Volver a Torneos
          </Link>
          <h1 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 32,
            fontWeight: 700,
            color: gold,
            letterSpacing: 2,
            margin: "16px 0 12px 0",
          }}>
            {t.name}
          </h1>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{
              fontSize: 11,
              padding: "6px 12px",
              borderRadius: 4,
              background: stateColor.bg,
              color: stateColor.text,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 0.5
            }}>
              {stateLabels[t.state] || t.state}
            </span>
            <span style={{ color: textMuted, fontSize: 14 }}>
              {t.tournament_type}
            </span>
            <span style={{ color: textMuted, fontSize: 14 }}>
              {t.participants_count || 0} participantes
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {/* Description */}
        {t.description && (
          <div style={{
            background: cardBg,
            border: `1px solid ${darkGold}`,
            borderRadius: 10,
            padding: 24,
            marginBottom: 24,
          }}>
            <h2 style={{ color: gold, fontSize: 18, marginBottom: 12, fontFamily: "'Cinzel', serif" }}>Descripción</h2>
            <p style={{ color: textBody, fontSize: 15, lineHeight: 1.8, margin: 0 }}>
              {t.description}
            </p>
          </div>
        )}

        {/* Participants */}
        {t.participants && t.participants.length > 0 && (
          <div style={{
            background: cardBg,
            border: `1px solid ${darkGold}`,
            borderRadius: 10,
            padding: 24,
            marginBottom: 24,
          }}>
            <h2 style={{ color: gold, fontSize: 18, marginBottom: 16, fontFamily: "'Cinzel', serif" }}>
              Participantes ({t.participants.length})
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {t.participants.map((p) => {
                const participant = p.participant;
                return (
                  <div
                    key={participant.id}
                    style={{
                      background: bg,
                      padding: "12px 16px",
                      borderRadius: 6,
                      border: `1px solid ${darkGold}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {participant.seed && (
                        <span style={{
                          fontSize: 11,
                          color: gold,
                          fontWeight: 700,
                          background: "rgba(201,168,76,0.1)",
                          padding: "4px 8px",
                          borderRadius: 4
                        }}>
                          #{participant.seed}
                        </span>
                      )}
                      <span style={{ color: textLight, fontSize: 14, fontWeight: 600 }}>
                        {participant.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bracket */}
        <div style={{
          background: cardBg,
          border: `1px solid ${darkGold}`,
          borderRadius: 10,
          padding: 24,
          marginBottom: 24,
        }}>
          <h2 style={{ color: gold, fontSize: 18, marginBottom: 16, fontFamily: "'Cinzel', serif" }}>Bracket</h2>
          {t.full_challonge_url ? (
            <div style={{
              background: "#fff",
              borderRadius: 6,
              overflow: "hidden",
              border: `1px solid ${darkGold}`,
            }}>
              <iframe
                src={`${t.full_challonge_url}/module`}
                width="100%"
                height="600"
                frameBorder="0"
                scrolling="auto"
                allowTransparency="true"
                style={{ border: 0, display: "block" }}
              />
            </div>
          ) : (
            <p style={{ color: textMuted, fontSize: 14, textAlign: "center", padding: 40 }}>
              El bracket estará disponible una vez que el torneo inicie
            </p>
          )}
        </div>

        {/* Link to Challonge */}
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a
            href={t.full_challonge_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              background: gold,
              color: bg,
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              fontFamily: "'Cinzel', serif",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Abrir en Challonge.com →
          </a>
        </div>
      </main>
    </div>
  );
}
