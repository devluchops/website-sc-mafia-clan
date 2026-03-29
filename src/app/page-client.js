"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { SocialIcons } from "@/components/SocialIcons";

// ============================================================
//  THEME CONSTANTS
// ============================================================
const gold = "#c9a84c";
const darkGold = "#3d3525";
const cardBg = "#252220";
const bg = "#1e1b18";
const textMuted = "#8b7b5e";
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

function RaceBadge({ race, level, small = false }) {
  const colors = {
    Protoss: { bg: "rgba(201,168,76,0.15)", border: "rgba(201,168,76,0.4)", text: "#c9a84c" },
    Terran: { bg: "rgba(100,160,200,0.15)", border: "rgba(100,160,200,0.4)", text: "#7ab8d4" },
    Zerg: { bg: "rgba(160,100,180,0.15)", border: "rgba(160,100,180,0.4)", text: "#c09ad8" },
  };

  const c = colors[race] || colors.Terran;

  return (
    <div style={{
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 4,
      padding: small ? "3px 6px" : "4px 8px",
      minWidth: small ? 42 : 50,
    }}>
      <span style={{
        fontSize: small ? 8 : 9,
        color: c.text,
        fontWeight: 600,
        letterSpacing: 0.5,
        opacity: 0.8,
      }}>
        {race.substring(0, 1)}
      </span>
      <span style={{
        fontSize: small ? 11 : 13,
        color: c.text,
        fontWeight: 700,
        marginTop: small ? 1 : 2,
      }}>
        {level || '-'}
      </span>
    </div>
  );
}

function Avatar({ name, race, avatar, size = 48 }) {
  const rc = RACE_COLORS[race] || RACE_COLORS.Terran;
  const [err, setErr] = useState(false);

  if (avatar && !err) {
    // Usar proxy para imágenes externas
    let imageSrc = avatar;
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      // Si es URL externa, usar proxy de imágenes
      const externalUrl = avatar.replace(/^https?:\/\//, '');
      imageSrc = `https://images.weserv.nl/?url=${externalUrl}&w=${size * 2}&h=${size * 2}&fit=cover`;
    }

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
          src={imageSrc}
          alt={name}
          onError={() => setErr(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          crossOrigin="anonymous"
        />
      </div>
    );
  }

  // Extraer la inicial del nombre (después de MAFIA]`)
  const initial = name.includes(']') ? name.split(']')[1].trim()[0] : name[0];

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
      {initial}
    </div>
  );
}

function Tag({ label }) {
  const tc = TAG_COLORS[label] || TAG_COLORS.Noticias;
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        padding: "4px 12px",
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
        fontSize: 12,
        fontWeight: 600,
        padding: "5px 14px",
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
        fontSize: 18,
        fontWeight: 600,
        letterSpacing: 3.5,
        textTransform: "uppercase",
        color: gold,
        marginBottom: 24,
        paddingBottom: 12,
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
        padding: 20,
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
//  BLOG POST COMPONENT
// ============================================================

function BlogPost({ post, session, onViewFull }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(true);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/blog-comments?postId=${post.id}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error al cargar comentarios:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !session) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/blog-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          content: newComment,
          parentCommentId: replyTo,
        }),
      });

      if (res.ok) {
        setNewComment("");
        setReplyTo(null);
        await loadComments();
      } else {
        const error = await res.json();
        alert(error.error || "Error al publicar comentario");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al publicar comentario");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("¿Estás seguro de eliminar este comentario?")) return;

    try {
      const res = await fetch(`/api/blog-comments?commentId=${commentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await loadComments();
      } else {
        const error = await res.json();
        alert(error.error || "Error al eliminar comentario");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar comentario");
    }
  };

  const totalComments = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  return (
    <Card style={{ padding: 20 }}>
      {post.image && (
        <div
          style={{
            width: "100%",
            borderRadius: 8,
            overflow: "hidden",
            marginBottom: 12,
            background: "#1a1810",
            cursor: "pointer",
          }}
          onClick={onViewFull}
        >
          <img
            src={post.image}
            alt={post.title}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </div>
      )}
      <Tag label={post.tag} />
      <h3
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 19,
          fontWeight: 600,
          color: textLight,
          margin: "12px 0 8px",
          lineHeight: 1.4,
          cursor: "pointer",
        }}
        onClick={onViewFull}
      >
        {post.title}
      </h3>
      <p
        style={{
          fontSize: 15,
          color: textBody,
          margin: "0 0 10px",
          lineHeight: 1.6,
        }}
      >
        {post.excerpt}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: textMuted, margin: 0 }}>
          Por {post.author} &bull; {post.date} &bull; {post.readTime} lectura
        </p>
        <button
          onClick={() => setShowComments(!showComments)}
          style={{
            background: "transparent",
            border: `1px solid ${darkGold}`,
            color: gold,
            padding: "6px 12px",
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          💬 {totalComments} {showComments ? "Ocultar" : "Ver comentarios"}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div style={{ borderTop: `1px solid ${darkGold}`, paddingTop: 16, marginTop: 16 }}>
          {/* Comment Form */}
          {session ? (
            <form onSubmit={handleSubmitComment} style={{ marginBottom: 16 }}>
              {replyTo && (
                <div style={{
                  fontSize: 12,
                  color: textMuted,
                  marginBottom: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <span>Respondiendo a comentario...</span>
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: gold,
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              )}
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyTo ? "Escribe tu respuesta..." : "Escribe un comentario..."}
                maxLength={1000}
                rows={3}
                style={{
                  width: "100%",
                  padding: 12,
                  background: bg,
                  border: `1px solid ${darkGold}`,
                  borderRadius: 6,
                  color: textLight,
                  fontSize: 14,
                  fontFamily: "inherit",
                  resize: "vertical",
                  marginBottom: 8,
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: textMuted }}>
                  {newComment.length}/1000
                </span>
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  style={{
                    padding: "8px 16px",
                    background: gold,
                    color: bg,
                    border: "none",
                    borderRadius: 6,
                    fontFamily: "'Cinzel', serif",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    cursor: submitting || !newComment.trim() ? "not-allowed" : "pointer",
                    opacity: submitting || !newComment.trim() ? 0.5 : 1,
                  }}
                >
                  {submitting ? "Publicando..." : (replyTo ? "Responder" : "Comentar")}
                </button>
              </div>
            </form>
          ) : (
            <p style={{ fontSize: 14, color: textMuted, fontStyle: "italic", marginBottom: 16 }}>
              Inicia sesión para comentar
            </p>
          )}

          {/* Comments List */}
          {loadingComments ? (
            <p style={{ fontSize: 14, color: textMuted, textAlign: "center" }}>Cargando comentarios...</p>
          ) : comments.length === 0 ? (
            <p style={{ fontSize: 14, color: textMuted, fontStyle: "italic", textAlign: "center" }}>
              No hay comentarios aún. ¡Sé el primero en comentar!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  session={session}
                  onReply={() => setReplyTo(comment.id)}
                  onDelete={handleDeleteComment}
                  depth={0}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ============================================================
//  COMMENT COMPONENT
// ============================================================

function CommentItem({ comment, session, onReply, onDelete, depth = 0 }) {
  const canDelete = session?.user && (
    comment.discord_username === session.user.name ||
    comment.discord_id === session.user.id ||
    session.user.permissions?.is_admin
  );

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "hace unos segundos";
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} h`;
    return `hace ${Math.floor(seconds / 86400)} días`;
  };

  return (
    <div style={{
      marginLeft: depth > 0 ? 24 : 0,
      paddingLeft: depth > 0 ? 12 : 0,
      borderLeft: depth > 0 ? `2px solid ${darkGold}` : "none",
    }}>
      <div style={{
        background: "rgba(201,168,76,0.03)",
        border: `1px solid ${darkGold}`,
        borderRadius: 8,
        padding: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          {comment.member_avatar ? (
            <Avatar
              name={comment.member_name || comment.discord_username}
              race="Terran"
              avatar={comment.member_avatar}
              size={32}
            />
          ) : (
            <div style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(201,168,76,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              color: gold,
            }}>
              {(comment.member_name || comment.discord_username)[0].toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: textLight }}>
                {comment.member_name || comment.discord_username}
              </span>
              {comment.member_rank && (
                <span style={{
                  fontSize: 10,
                  color: gold,
                  background: "rgba(201,168,76,0.1)",
                  padding: "2px 6px",
                  borderRadius: 3,
                }}>
                  {comment.member_rank}
                </span>
              )}
            </div>
            <span style={{ fontSize: 11, color: textMuted }}>
              {timeAgo(comment.created_at)}
            </span>
          </div>
          {canDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              style={{
                background: "transparent",
                border: "none",
                color: "#c94c4c",
                cursor: "pointer",
                fontSize: 12,
                padding: 4,
              }}
            >
              Eliminar
            </button>
          )}
        </div>
        <p style={{
          fontSize: 14,
          color: textBody,
          lineHeight: 1.6,
          margin: "8px 0",
          whiteSpace: "pre-wrap",
        }}>
          {comment.content}
        </p>
        {session && depth < 3 && (
          <button
            onClick={onReply}
            style={{
              background: "transparent",
              border: "none",
              color: gold,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              padding: "4px 0",
            }}
          >
            Responder
          </button>
        )}
      </div>

      {/* Render replies recursively */}
      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              session={session}
              onReply={onReply}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
//  SECTIONS
// ============================================================

function BuildOrdersSection({ builds }) {
  const [selectedRace, setSelectedRace] = useState("all");
  const [selectedBuild, setSelectedBuild] = useState(null);

  const filteredBuilds = builds.filter(
    (build) => selectedRace === "all" || build.race === selectedRace
  );

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\s]+)/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null;
  };

  if (selectedBuild) {
    const embedUrl = getYouTubeEmbedUrl(selectedBuild.video_url);
    const raceColor = RACE_COLORS[selectedBuild.race];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <button
          onClick={() => setSelectedBuild(null)}
          style={{
            background: "transparent",
            border: `1px solid ${darkGold}`,
            color: textMuted,
            padding: "8px 16px",
            borderRadius: 6,
            fontSize: 14,
            cursor: "pointer",
            alignSelf: "flex-start",
            transition: "all 0.2s",
          }}
        >
          ← Volver a builds
        </button>

        <div
          style={{
            background: cardBg,
            border: `1px solid ${darkGold}`,
            borderRadius: 10,
            padding: 32,
          }}
        >
          <div
            style={{
              borderLeft: `4px solid ${raceColor.border}`,
              paddingLeft: 20,
              marginBottom: 24,
            }}
          >
            <h3 style={{ fontSize: 24, fontWeight: 700, color: raceColor.text, margin: "0 0 12px 0" }}>
              {selectedBuild.name}
            </h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ ...styles.raceBadge, background: raceColor.bg, color: raceColor.text, border: `1px solid ${raceColor.border}` }}>
                {selectedBuild.race}
              </span>
              <span style={{ fontSize: 13, color: textMuted, fontWeight: 600 }}>
                {selectedBuild.difficulty}
              </span>
              {selectedBuild.matchups && selectedBuild.matchups.map((m) => (
                <span key={m} style={{ background: "rgba(201,168,76,0.1)", color: gold, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                  {m}
                </span>
              ))}
            </div>
          </div>

          {embedUrl && (
            <div style={{ width: "100%", paddingBottom: "56.25%", position: "relative", marginBottom: 24, borderRadius: 10, overflow: "hidden" }}>
              <iframe
                width="100%"
                height="100%"
                src={embedUrl}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: 10 }}
              />
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 16, fontWeight: 600, color: gold, marginBottom: 12 }}>Descripción</h4>
            <p style={{ color: textLight, fontSize: 15, lineHeight: 1.6, margin: 0 }}>
              {selectedBuild.description}
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: 16, fontWeight: 600, color: gold, marginBottom: 12 }}>Build Order</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {selectedBuild.build_steps && selectedBuild.build_steps.map((step, idx) => {
                const parts = [];
                if (step.time) parts.push(step.time);
                if (step.supply) parts.push(`${step.supply} Supply`);

                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      gap: 8,
                      padding: "10px 12px",
                      background: bg,
                      borderRadius: 6,
                      border: `1px solid ${darkGold}`,
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={{
                      color: gold,
                      fontWeight: 700,
                      fontSize: 13,
                      minWidth: 24,
                      flexShrink: 0
                    }}>
                      {idx + 1}.
                    </span>
                    <span style={{ color: textLight, fontSize: 14, lineHeight: 1.5, flex: 1 }}>
                      {parts.length > 0 && (
                        <span style={{ color: "#7ab8d4", fontWeight: 600 }}>
                          [{parts.join(' • ')}]
                        </span>
                      )}
                      {parts.length > 0 && ' '}
                      {step.action}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedBuild.tags && selectedBuild.tags.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h4 style={{ fontSize: 16, fontWeight: 600, color: gold, marginBottom: 12 }}>Tags</h4>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {selectedBuild.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: "rgba(201,168,76,0.1)",
                      color: gold,
                      padding: "6px 12px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      border: `1px solid ${darkGold}`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionTitle>Build Orders</SectionTitle>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        {["all", "Protoss", "Terran", "Zerg"].map((race) => (
          <button
            key={race}
            onClick={() => setSelectedRace(race)}
            style={{
              background: selectedRace === race ? gold : "transparent",
              border: `1px solid ${selectedRace === race ? gold : darkGold}`,
              color: selectedRace === race ? bg : textMuted,
              padding: "8px 16px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {race === "all" ? "Todas" : race}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {filteredBuilds.map((build) => {
          const raceColor = RACE_COLORS[build.race];
          return (
            <Card
              key={build.id}
              style={{
                borderLeft: `4px solid ${raceColor.border}`,
                cursor: "pointer",
              }}
              onClick={() => setSelectedBuild(build)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: raceColor.text, margin: 0, flex: 1 }}>
                  {build.name}
                </h4>
                <span
                  style={{
                    background: raceColor.bg,
                    color: raceColor.text,
                    padding: "3px 10px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    border: `1px solid ${raceColor.border}`,
                  }}
                >
                  {build.race}
                </span>
              </div>

              <p style={{ color: textMuted, fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>
                {build.description.substring(0, 100)}
                {build.description.length > 100 ? "..." : ""}
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {build.matchups && build.matchups.slice(0, 2).map((m) => (
                    <span key={m} style={{ background: "rgba(201,168,76,0.1)", color: gold, padding: "2px 6px", borderRadius: 3, fontSize: 10, fontWeight: 600 }}>
                      {m}
                    </span>
                  ))}
                  {build.matchups && build.matchups.length > 2 && (
                    <span style={{ background: "rgba(201,168,76,0.1)", color: gold, padding: "2px 6px", borderRadius: 3, fontSize: 10, fontWeight: 600 }}>
                      +{build.matchups.length - 2}
                    </span>
                  )}
                </div>
                <span style={{ color: textMuted, fontSize: 11, fontWeight: 600 }}>
                  {build.difficulty}
                </span>
              </div>

              {build.video_url && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${darkGold}`, color: gold, fontSize: 11, fontWeight: 600 }}>
                  <span style={{ fontSize: 9 }}>▶</span> Video disponible
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {filteredBuilds.length === 0 && (
        <div style={{ textAlign: "center", color: textMuted, fontSize: 15, padding: 40 }}>
          No hay build orders para esta raza
        </div>
      )}
    </div>
  );
}

const styles = {
  raceBadge: {
    padding: "4px 12px",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
  },
};

function BlogSection({ posts }) {
  const { data: session } = useSession();
  const [selectedPost, setSelectedPost] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionTitle>Publicaciones recientes</SectionTitle>
      {posts.map((p, i) => (
        <BlogPost key={i} post={p} session={session} onViewFull={() => setSelectedPost(p)} />
      ))}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
            overflow: "auto",
          }}
          onClick={() => setSelectedPost(null)}
        >
          <div
            style={{
              background: cardBg,
              border: `2px solid ${gold}`,
              borderRadius: 12,
              padding: 32,
              maxWidth: 700,
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {selectedPost.image && (
              <div
                style={{
                  width: "100%",
                  maxHeight: 500,
                  borderRadius: 10,
                  overflow: "hidden",
                  marginBottom: 24,
                  background: "#1a1810",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: 500,
                    objectFit: "contain",
                  }}
                />
              </div>
            )}

            <Tag label={selectedPost.tag} />

            <h3
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 28,
                fontWeight: 700,
                color: gold,
                margin: "16px 0",
                letterSpacing: 1,
              }}
            >
              {selectedPost.title}
            </h3>

            <p style={{ fontSize: 13, color: textMuted, marginBottom: 24 }}>
              Por {selectedPost.author} &bull; {selectedPost.date} &bull; {selectedPost.readTime} lectura
            </p>

            <p
              style={{
                fontSize: 16,
                color: textBody,
                lineHeight: 1.8,
                marginBottom: 24,
                whiteSpace: "pre-wrap",
              }}
            >
              {selectedPost.content || selectedPost.excerpt}
            </p>

            <button
              onClick={() => setSelectedPost(null)}
              style={{
                width: "100%",
                padding: "12px",
                background: "transparent",
                border: `1px solid ${gold}`,
                borderRadius: 6,
                color: gold,
                fontFamily: "'Cinzel', serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
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
              <div style={{ padding: "14px 16px" }}>
                <p
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: 15,
                    fontWeight: 600,
                    color: textLight,
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {v.title}
                </p>
                <p style={{ fontSize: 13, color: textMuted, margin: "5px 0 0" }}>
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
  const [sortBy, setSortBy] = useState("level");
  const [selectedMember, setSelectedMember] = useState(null);

  const LEVEL_ORDER = { 'S': 0, 'A+': 1, 'A': 2, 'B+': 3, 'B': 4, 'C+': 5, 'C': 6, 'D+': 7, 'D': 8 };

  const sorted = [...members].sort((a, b) => {
    if (sortBy === "level") {
      const levelA = LEVEL_ORDER[a.level] ?? 99;
      const levelB = LEVEL_ORDER[b.level] ?? 99;
      if (levelA !== levelB) return levelA - levelB;
      return b.mmr - a.mmr; // Si tienen el mismo nivel, ordenar por MMR
    }
    if (sortBy === "rank")
      return (RANK_ORDER[a.rank] ?? 99) - (RANK_ORDER[b.rank] ?? 99);
    if (sortBy === "mmr") return b.mmr - a.mmr;
    return a.name.localeCompare(b.name);
  });

  const getLevelColor = (level) => {
    if (level === 'S') return '#ff4655';
    if (level?.includes('A')) return '#ff9500';
    if (level?.includes('B')) return gold;
    if (level?.includes('C')) return '#8b7b5e';
    return '#5a5a5a';
  };

  const hasSocial = (member) => {
    return member.social && (
      member.social.facebook ||
      member.social.discord ||
      member.social.tiktok ||
      member.social.kick ||
      member.social.instagram ||
      member.social.twitter ||
      member.social.youtube
    );
  };

  return (
    <div>
      <SectionTitle>Miembros del clan</SectionTitle>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["level", "rank", "mmr", "name"].map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            style={{
              background:
                sortBy === s ? "rgba(201,168,76,0.12)" : "transparent",
              border: `1px solid ${sortBy === s ? gold : darkGold}`,
              color: sortBy === s ? gold : textMuted,
              fontFamily: "'Cinzel', serif",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              padding: "8px 16px",
              borderRadius: 6,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {s === "level" ? "Por nivel" : s === "rank" ? "Por rango" : s === "mmr" ? "Por MMR" : "Por nombre"}
          </button>
        ))}
      </div>

      {/* Lista vertical de miembros */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sorted.map((m, i) => {
          const rc = RACE_COLORS[m.mainRace || m.race] || RACE_COLORS.Terran;
          return (
            <Card
              key={i}
              onClick={() => setSelectedMember(m)}
              style={{
                padding: 16,
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              {/* Avatar */}
              <Avatar
                name={m.name}
                race={m.mainRace || m.race}
                avatar={m.avatar}
                size={60}
              />

              {/* Info principal */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                  <p
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: 20,
                      fontWeight: 600,
                      color: textLight,
                      margin: 0,
                    }}
                  >
                    {m.name}
                  </p>
                  <span
                    style={{
                      fontSize: 16,
                      color: getLevelColor(m.level),
                      fontWeight: 700,
                      background: "rgba(0,0,0,0.3)",
                      padding: "4px 12px",
                      borderRadius: 4,
                    }}
                  >
                    {m.level || 'B'}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 14, color: textMuted, flexWrap: "wrap" }}>
                  <span style={{ color: gold, fontWeight: 600 }}>{m.rank}</span>
                  <span>•</span>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <RaceBadge race="Protoss" level={m.protossLevel} small />
                    <RaceBadge race="Terran" level={m.terranLevel} small />
                    <RaceBadge race="Zerg" level={m.zergLevel} small />
                  </div>
                  <span>•</span>
                  <span style={{ background: "rgba(201,168,76,0.08)", padding: "3px 10px", borderRadius: 3 }}>
                    {m.mmr} MMR
                  </span>
                </div>
              </div>

              {/* Redes sociales */}
              {hasSocial(m) && (
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  {m.social.facebook && (
                    <a
                      href={m.social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        height: 36,
                        background: "rgba(201,168,76,0.08)",
                        border: `1px solid ${darkGold}`,
                        borderRadius: 6,
                        color: textMuted,
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = gold;
                        e.currentTarget.style.color = gold;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = darkGold;
                        e.currentTarget.style.color = textMuted;
                      }}
                    >
                      <SocialIcons.Facebook size={18} />
                    </a>
                  )}
                  {m.social.discord && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMember(m);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        height: 36,
                        background: "rgba(201,168,76,0.08)",
                        border: `1px solid ${darkGold}`,
                        borderRadius: 6,
                        color: textMuted,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = gold;
                        e.currentTarget.style.color = gold;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = darkGold;
                        e.currentTarget.style.color = textMuted;
                      }}
                    >
                      <SocialIcons.Discord size={18} />
                    </button>
                  )}
                  {m.social.tiktok && (
                    <a
                      href={m.social.tiktok.startsWith('http') ? m.social.tiktok : `https://tiktok.com/@${m.social.tiktok.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        height: 36,
                        background: "rgba(201,168,76,0.08)",
                        border: `1px solid ${darkGold}`,
                        borderRadius: 6,
                        color: textMuted,
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = gold;
                        e.currentTarget.style.color = gold;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = darkGold;
                        e.currentTarget.style.color = textMuted;
                      }}
                    >
                      <SocialIcons.TikTok size={18} />
                    </a>
                  )}
                  {m.social.kick && (
                    <a
                      href={m.social.kick}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        height: 36,
                        background: "rgba(201,168,76,0.08)",
                        border: `1px solid ${darkGold}`,
                        borderRadius: 6,
                        color: textMuted,
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = gold;
                        e.currentTarget.style.color = gold;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = darkGold;
                        e.currentTarget.style.color = textMuted;
                      }}
                    >
                      <SocialIcons.Kick size={18} />
                    </a>
                  )}
                  {m.social.instagram && (
                    <a
                      href={m.social.instagram.startsWith('http') ? m.social.instagram : `https://instagram.com/${m.social.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        height: 36,
                        background: "rgba(201,168,76,0.08)",
                        border: `1px solid ${darkGold}`,
                        borderRadius: 6,
                        color: textMuted,
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = gold;
                        e.currentTarget.style.color = gold;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = darkGold;
                        e.currentTarget.style.color = textMuted;
                      }}
                    >
                      <SocialIcons.Instagram size={18} />
                    </a>
                  )}
                  {m.social.twitter && (
                    <a
                      href={m.social.twitter.startsWith('http') ? m.social.twitter : `https://twitter.com/${m.social.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        height: 36,
                        background: "rgba(201,168,76,0.08)",
                        border: `1px solid ${darkGold}`,
                        borderRadius: 6,
                        color: textMuted,
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = gold;
                        e.currentTarget.style.color = gold;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = darkGold;
                        e.currentTarget.style.color = textMuted;
                      }}
                    >
                      <SocialIcons.Twitter size={18} />
                    </a>
                  )}
                  {m.social.youtube && (
                    <a
                      href={m.social.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        height: 36,
                        background: "rgba(201,168,76,0.08)",
                        border: `1px solid ${darkGold}`,
                        borderRadius: 6,
                        color: textMuted,
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = gold;
                        e.currentTarget.style.color = gold;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = darkGold;
                        e.currentTarget.style.color = textMuted;
                      }}
                    >
                      <SocialIcons.YouTube size={18} />
                    </a>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Member Profile Modal */}
      {selectedMember && (() => {
        console.log('Selected Member Data:', selectedMember);
        console.log('About Me:', selectedMember.aboutMe);
        return (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: 20,
            }}
            onClick={() => setSelectedMember(null)}
          >
            <div
              style={{
                background: cardBg,
                border: `2px solid ${gold}`,
                borderRadius: 12,
                padding: 32,
                maxWidth: 500,
                width: "100%",
                maxHeight: "90vh",
                overflow: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Avatar
                name={selectedMember.name}
                race={selectedMember.mainRace || selectedMember.race}
                avatar={selectedMember.avatar}
                size={100}
              />
              <h3
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 24,
                  fontWeight: 700,
                  color: gold,
                  margin: "16px 0 8px",
                  letterSpacing: 2,
                }}
              >
                {selectedMember.name}
              </h3>
              <p style={{ color: textMuted, fontSize: 14, margin: "0 0 12px" }}>
                {selectedMember.rank}
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: 16,
                    color: getLevelColor(selectedMember.level),
                    fontWeight: 700,
                    background: "rgba(0,0,0,0.3)",
                    padding: "4px 12px",
                    borderRadius: 4,
                  }}
                >
                  Nivel {selectedMember.level || 'B'}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: textMuted,
                    background: "rgba(201,168,76,0.06)",
                    padding: "4px 12px",
                    borderRadius: 4,
                  }}
                >
                  {selectedMember.mmr} MMR
                </span>
              </div>
            </div>

            {/* About Me Section */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: textMuted, marginBottom: 12, fontWeight: 600 }}>SOBRE MÍ</p>
              <div style={{
                background: "rgba(201,168,76,0.04)",
                padding: "16px",
                borderRadius: 8,
                border: `1px solid ${darkGold}`,
              }}>
                <p style={{ fontSize: 14, color: selectedMember.aboutMe ? textBody : textMuted, margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap", fontStyle: selectedMember.aboutMe ? "normal" : "italic" }}>
                  {selectedMember.aboutMe || "Este miembro aún no ha configurado su información personal."}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: textMuted, marginBottom: 12, fontWeight: 600 }}>NIVELES POR RAZA</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                <div style={{
                  background: "rgba(201,168,76,0.08)",
                  padding: "16px",
                  borderRadius: 8,
                  border: `1px solid rgba(201,168,76,0.3)`,
                  textAlign: "center"
                }}>
                  <p style={{ fontSize: 12, color: "#c9a84c", fontWeight: 700, margin: 0, marginBottom: 8, letterSpacing: 1 }}>
                    PROTOSS
                  </p>
                  <p style={{ fontSize: 28, color: gold, fontWeight: 700, margin: 0 }}>
                    {selectedMember.protossLevel || '-'}
                  </p>
                </div>
                <div style={{
                  background: "rgba(100,160,200,0.08)",
                  padding: "16px",
                  borderRadius: 8,
                  border: `1px solid rgba(100,160,200,0.3)`,
                  textAlign: "center"
                }}>
                  <p style={{ fontSize: 12, color: "#7ab8d4", fontWeight: 700, margin: 0, marginBottom: 8, letterSpacing: 1 }}>
                    TERRAN
                  </p>
                  <p style={{ fontSize: 28, color: "#7ab8d4", fontWeight: 700, margin: 0 }}>
                    {selectedMember.terranLevel || '-'}
                  </p>
                </div>
                <div style={{
                  background: "rgba(160,100,180,0.08)",
                  padding: "16px",
                  borderRadius: 8,
                  border: `1px solid rgba(160,100,180,0.3)`,
                  textAlign: "center"
                }}>
                  <p style={{ fontSize: 12, color: "#c09ad8", fontWeight: 700, margin: 0, marginBottom: 8, letterSpacing: 1 }}>
                    ZERG
                  </p>
                  <p style={{ fontSize: 28, color: "#c09ad8", fontWeight: 700, margin: 0 }}>
                    {selectedMember.zergLevel || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            {selectedMember.social && (
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${darkGold}` }}>
                <p style={{ fontSize: 12, color: textMuted, marginBottom: 12, fontWeight: 600 }}>
                  REDES SOCIALES
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selectedMember.social.facebook && (
                    <a
                      href={selectedMember.social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 14px",
                        background: "rgba(201,168,76,0.08)",
                        border: `1px solid ${darkGold}`,
                        borderRadius: 6,
                        color: textLight,
                        textDecoration: "none",
                        fontSize: 13,
                        transition: "all 0.2s",
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </a>
                  )}
                  {selectedMember.social.discord && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 14px",
                        background: "rgba(201,168,76,0.08)",
                        border: `1px solid ${darkGold}`,
                        borderRadius: 6,
                        color: textLight,
                        fontSize: 13,
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                      {selectedMember.social.discord}
                    </div>
                  )}
                  {selectedMember.social.tiktok && (
                    <a
                      href={selectedMember.social.tiktok.startsWith('http') ? selectedMember.social.tiktok : `https://tiktok.com/@${selectedMember.social.tiktok.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 14px",
                        background: "rgba(201,168,76,0.08)",
                        border: `1px solid ${darkGold}`,
                        borderRadius: 6,
                        color: textLight,
                        textDecoration: "none",
                        fontSize: 13,
                      }}
                    >
                      <span style={{ fontSize: 18 }}>🎵</span>
                      TikTok: {selectedMember.social.tiktok}
                    </a>
                  )}
                  {selectedMember.social.kick && (
                    <a
                      href={selectedMember.social.kick}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 14px",
                        background: "rgba(201,168,76,0.08)",
                        border: `1px solid ${darkGold}`,
                        borderRadius: 6,
                        color: textLight,
                        textDecoration: "none",
                        fontSize: 13,
                      }}
                    >
                      <span style={{ fontSize: 18 }}>🎮</span>
                      Kick
                    </a>
                  )}
                  {selectedMember.social.instagram && (
                    <a
                      href={selectedMember.social.instagram.startsWith('http') ? selectedMember.social.instagram : `https://instagram.com/${selectedMember.social.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 14px",
                        background: "rgba(201,168,76,0.08)",
                        border: `1px solid ${darkGold}`,
                        borderRadius: 6,
                        color: textLight,
                        textDecoration: "none",
                        fontSize: 13,
                      }}
                    >
                      <span style={{ fontSize: 18 }}>📷</span>
                      Instagram: {selectedMember.social.instagram}
                    </a>
                  )}
                  {selectedMember.social.twitter && (
                    <a
                      href={selectedMember.social.twitter.startsWith('http') ? selectedMember.social.twitter : `https://twitter.com/${selectedMember.social.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 14px",
                        background: "rgba(201,168,76,0.08)",
                        border: `1px solid ${darkGold}`,
                        borderRadius: 6,
                        color: textLight,
                        textDecoration: "none",
                        fontSize: 13,
                      }}
                    >
                      <span style={{ fontSize: 18 }}>🐦</span>
                      Twitter/X: {selectedMember.social.twitter}
                    </a>
                  )}
                  {selectedMember.social.youtube && (
                    <a
                      href={selectedMember.social.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 14px",
                        background: "rgba(201,168,76,0.08)",
                        border: `1px solid ${darkGold}`,
                        borderRadius: 6,
                        color: textLight,
                        textDecoration: "none",
                        fontSize: 13,
                      }}
                    >
                      <span style={{ fontSize: 18 }}>📺</span>
                      YouTube: {selectedMember.social.youtube}
                    </a>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedMember(null)}
              style={{
                width: "100%",
                marginTop: 24,
                padding: "12px",
                background: "transparent",
                border: `1px solid ${gold}`,
                borderRadius: 6,
                color: gold,
                fontFamily: "'Cinzel', serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
        );
      })()}
    </div>
  );
}

function EventsSection({ events }) {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const addToGoogleCalendar = (event) => {
    try {
      // Convertir month/day a fecha válida
      const monthMap = {
        'Ene': 0, 'Feb': 1, 'Mar': 2, 'Abr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Ago': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dic': 11
      };

      const currentYear = new Date().getFullYear();
      const monthIndex = monthMap[event.month] ?? 0;
      const day = parseInt(event.day) || 1;

      // Crear fecha del evento (23:00 = 11:00 PM)
      const eventDate = new Date(currentYear, monthIndex, day, 23, 0, 0);
      const eventEndDate = new Date(currentYear, monthIndex, day, 23, 59, 0);

      // Formato para Google Calendar: YYYYMMDDTHHmmss
      const formatGoogleDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dayNum = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}${month}${dayNum}T${hours}${minutes}${seconds}`;
      };

      // Construir URL de Google Calendar
      const title = encodeURIComponent(event.title);
      const description = encodeURIComponent(event.description || event.desc || '');
      const startDate = formatGoogleDate(eventDate);
      const endDate = formatGoogleDate(eventEndDate);

      const googleCalendarUrl = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${title}&dates=${startDate}/${endDate}&details=${description}`;

      // Abrir Google Calendar en una nueva pestaña
      window.open(googleCalendarUrl, '_blank');
    } catch (error) {
      console.error('Error opening Google Calendar:', error);
      alert('Error al abrir Google Calendar. Por favor intenta de nuevo.');
    }
  };

  return (
    <div>
      <SectionTitle>Proximos eventos</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {events.map((e, i) => (
          <Card
            key={i}
            onClick={() => setSelectedEvent(e)}
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              padding: 16,
            }}
          >
            <div style={{ textAlign: "center", minWidth: 52 }}>
              <p
                style={{
                  fontSize: 12,
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
                  fontSize: 28,
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
                  fontSize: 17,
                  fontWeight: 600,
                  color: textLight,
                  margin: 0,
                }}
              >
                {e.title}
              </p>
              <p style={{ fontSize: 14, color: textMuted, margin: "4px 0 0" }}>
                {e.desc}
              </p>
            </div>
            <StatusBadge status={e.status} />
          </Card>
        ))}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setSelectedEvent(null)}
        >
          <div
            style={{
              background: cardBg,
              border: `2px solid ${gold}`,
              borderRadius: 12,
              padding: 32,
              maxWidth: 500,
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fecha destacada */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div
                style={{
                  display: "inline-block",
                  padding: "16px 24px",
                  background: "rgba(201,168,76,0.1)",
                  border: `2px solid ${gold}`,
                  borderRadius: 10,
                }}
              >
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: gold,
                    margin: 0,
                  }}
                >
                  {selectedEvent.month}
                </p>
                <p
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: 48,
                    fontWeight: 700,
                    color: textLight,
                    lineHeight: 1,
                    margin: "4px 0",
                  }}
                >
                  {selectedEvent.day}
                </p>
                <StatusBadge status={selectedEvent.status} />
              </div>
            </div>

            {/* Título y descripción */}
            <h3
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 24,
                fontWeight: 700,
                color: gold,
                margin: "0 0 16px",
                textAlign: "center",
                letterSpacing: 1,
              }}
            >
              {selectedEvent.title}
            </h3>

            <p
              style={{
                fontSize: 15,
                color: textBody,
                lineHeight: 1.6,
                marginBottom: 24,
                textAlign: "center",
              }}
            >
              {selectedEvent.description || selectedEvent.desc}
            </p>

            {/* Botones de acción */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {selectedEvent.link && (
                <a
                  href={selectedEvent.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: gold,
                    border: "none",
                    borderRadius: 6,
                    color: bg,
                    fontFamily: "'Cinzel', serif",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    textDecoration: "none",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                  🔗 Ver enlace del evento
                </a>
              )}

              <button
                onClick={() => addToGoogleCalendar(selectedEvent)}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "rgba(201,168,76,0.1)",
                  border: `1px solid ${gold}`,
                  borderRadius: 6,
                  color: gold,
                  fontFamily: "'Cinzel', serif",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(201,168,76,0.15)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(201,168,76,0.1)'}
              >
                📅 Agregar a Google Calendar
              </button>

              <button
                onClick={() => setSelectedEvent(null)}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "transparent",
                  border: `1px solid ${darkGold}`,
                  borderRadius: 6,
                  color: textMuted,
                  fontFamily: "'Cinzel', serif",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RulesSection({ rules }) {
  // Agrupar reglas por categoría
  const categories = rules.reduce((acc, rule) => {
    if (!acc[rule.category]) {
      acc[rule.category] = [];
    }
    acc[rule.category].push(rule);
    return acc;
  }, {});

  return (
    <div>
      <SectionTitle>Reglas y Código de Conducta</SectionTitle>

      <div style={{
        background: "rgba(201,168,76,0.05)",
        padding: 20,
        borderRadius: 10,
        border: `1px solid ${darkGold}`,
        marginBottom: 24
      }}>
        <p style={{
          fontSize: 16,
          color: textLight,
          lineHeight: 1.7,
          margin: 0
        }}>
          Como miembro del clan <strong style={{ color: gold }}>MAFIA</strong>, te comprometes a seguir
          estas reglas para mantener un ambiente competitivo, respetuoso y profesional.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {Object.entries(categories).map(([category, categoryRules]) => (
          <div key={category}>
            <h3 style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 17,
              fontWeight: 700,
              color: gold,
              marginBottom: 16,
              letterSpacing: 2,
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <span style={{
                width: 4,
                height: 20,
                background: gold,
                borderRadius: 2,
              }} />
              {category}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {categoryRules.map((rule, i) => (
                <Card key={i} style={{ padding: 18 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{
                      minWidth: 32,
                      height: 32,
                      background: "rgba(201,168,76,0.15)",
                      border: `2px solid ${gold}`,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'Cinzel', serif",
                      fontSize: 14,
                      fontWeight: 700,
                      color: gold,
                      flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: 16,
                        fontWeight: 600,
                        color: textLight,
                        margin: "0 0 8px",
                      }}>
                        {rule.title}
                      </h4>
                      <p style={{
                        fontSize: 14,
                        color: textBody,
                        lineHeight: 1.6,
                        margin: 0,
                      }}>
                        {rule.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
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
  { id: "rules", label: "Reglas" },
  { id: "build-orders", label: "Build Orders" },
];

export default function HomePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState(() => {
    // Leer el hash de la URL al cargar
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      return hash || "blog";
    }
    return "blog";
  });
  const [logoErr, setLogoErr] = useState(false);
  const [data, setData] = useState(null);
  const [buildOrders, setBuildOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Actualizar hash cuando cambia activeTab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.hash = activeTab;
    }
  }, [activeTab]);

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

    // Cargar build orders
    fetch("/api/admin/build-orders")
      .then((res) => res.json())
      .then((builds) => setBuildOrders(builds))
      .catch((err) => console.error(err));
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

  const { clan, members, posts, videos, events, rules } = data;

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
            width: 200,
            height: 200,
            margin: "0 auto 20px",
            borderRadius: "50%",
            overflow: "hidden",
            border: `3px solid ${gold}`,
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
                fontSize: 70,
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
            fontSize: 48,
            fontWeight: 700,
            letterSpacing: 10,
            color: gold,
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          {clan.name}
        </h1>
        <p
          style={{
            fontSize: 15,
            color: textMuted,
            marginTop: 10,
            letterSpacing: 2.5,
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
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "12px 16px",
          background: "#0d0d0a",
          borderBottom: `1px solid ${darkGold}`,
          flexWrap: "wrap",
          position: "sticky",
          top: 0,
          zIndex: 10,
          minHeight: 60,
        }}
      >
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
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
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: "uppercase",
                padding: "12px 20px",
                cursor: "pointer",
                borderRadius: 6,
                transition: "all 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* User Menu - Positioned Absolutely */}
        <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 8, alignItems: "center" }}>
          {session ? (
            <>
              <Link
                href="/profile"
                style={{
                  background: "transparent",
                  border: `1px solid ${gold}`,
                  color: gold,
                  fontFamily: "'Cinzel', serif",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  padding: "12px 20px",
                  cursor: "pointer",
                  borderRadius: 6,
                  textDecoration: "none",
                  display: "inline-block",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = gold;
                  e.currentTarget.style.color = bg;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = gold;
                }}
              >
                Mi Perfil
              </Link>
              {session.user?.permissions?.is_admin && (
                <a
                  href="/admin"
                  style={{
                    background: "rgba(201,168,76,0.1)",
                    border: `1px solid ${gold}`,
                    color: gold,
                    fontFamily: "'Cinzel', serif",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    padding: "12px 20px",
                    cursor: "pointer",
                    borderRadius: 6,
                    textDecoration: "none",
                    display: "inline-block",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = gold;
                    e.currentTarget.style.color = bg;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "rgba(201,168,76,0.1)";
                    e.currentTarget.style.color = gold;
                  }}
                >
                  Admin
                </a>
              )}
            </>
          ) : (
            <Link
              href="/login"
              style={{
                background: "transparent",
                border: `1px solid ${gold}`,
                color: gold,
                fontFamily: "'Cinzel', serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                padding: "12px 20px",
                cursor: "pointer",
                borderRadius: 6,
                textDecoration: "none",
                display: "inline-block",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = gold;
                e.currentTarget.style.color = bg;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = gold;
              }}
            >
              Iniciar Sesión
            </Link>
          )}
        </div>

      </nav>

      {/* CONTENT */}
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "32px 20px 48px" }}>
        {activeTab === "blog" && <BlogSection posts={posts} />}
        {activeTab === "videos" && <VideosSection videos={videos} />}
        {activeTab === "roster" && <RosterSection members={members} />}
        {activeTab === "events" && <EventsSection events={events} />}
        {activeTab === "rules" && <RulesSection rules={rules || []} />}
        {activeTab === "build-orders" && <BuildOrdersSection builds={buildOrders} />}
      </main>

      {/* FOOTER */}
      <footer
        style={{
          textAlign: "center",
          padding: "32px 16px 24px",
          borderTop: `1px solid ${darkGold}`,
          fontFamily: "'Cinzel', serif",
        }}
      >
        {/* Social Links */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <a
            href="https://www.facebook.com/profile.php?id=61586575740605"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              background: "rgba(201,168,76,0.08)",
              border: `1px solid ${darkGold}`,
              borderRadius: 6,
              color: textMuted,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: 1,
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = gold;
              e.currentTarget.style.color = gold;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = darkGold;
              e.currentTarget.style.color = textMuted;
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Facebook</span>
          </a>

          <a
            href="https://wa.me/51999037970"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              background: "rgba(201,168,76,0.08)",
              border: `1px solid ${darkGold}`,
              borderRadius: 6,
              color: textMuted,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: 1,
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = gold;
              e.currentTarget.style.color = gold;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = darkGold;
              e.currentTarget.style.color = textMuted;
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Contact Info */}
        <div
          style={{
            fontSize: 13,
            color: "#6b5c3e",
            letterSpacing: 1,
            marginBottom: 16,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            alignItems: "center",
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, color: gold, fontSize: 14 }}>
            CONTACTO DEL ADMINISTRADOR
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <a
              href="mailto:lvalencia1286@gmail.com"
              style={{
                color: "#6b5c3e",
                textDecoration: "none",
                transition: "color 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              onMouseOver={(e) => e.currentTarget.style.color = gold}
              onMouseOut={(e) => e.currentTarget.style.color = "#6b5c3e"}
            >
              <SocialIcons.Gmail size={18} />
              lvalencia1286@gmail.com
            </a>
            <a
              href="https://wa.me/51966346424"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#6b5c3e",
                textDecoration: "none",
                transition: "color 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              onMouseOver={(e) => e.currentTarget.style.color = gold}
              onMouseOut={(e) => e.currentTarget.style.color = "#6b5c3e"}
            >
              <SocialIcons.WhatsApp size={18} />
              +51 966 346 424
            </a>
          </div>
        </div>

        {/* Copyright */}
        <p
          style={{
            fontSize: 12,
            color: "#3d3525",
            letterSpacing: 2,
            margin: 0,
          }}
        >
          {clan.name} &bull; {new Date().getFullYear()}
          {session && (
            <>
              {" "}&bull;{" "}
              <Link
                href="/profile"
                style={{
                  color: "#3d3525",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseOver={(e) => e.currentTarget.style.color = gold}
                onMouseOut={(e) => e.currentTarget.style.color = "#3d3525"}
              >
                Mi Perfil
              </Link>
              {session.user?.permissions?.is_admin && (
                <>
                  {" "}&bull;{" "}
                  <a
                    href="/admin"
                    style={{
                      color: "#3d3525",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = gold}
                    onMouseOut={(e) => e.currentTarget.style.color = "#3d3525"}
                  >
                    Admin
                  </a>
                </>
              )}
            </>
          )}
        </p>
      </footer>
    </>
  );
}
