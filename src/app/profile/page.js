"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SocialIcons } from "@/components/SocialIcons";

// Theme colors
const gold = "#c9a84c";
const darkGold = "#3d3525";
const cardBg = "#252220";
const textMuted = "#8b7b5e";
const textLight = "#e8dcc0";
const bg = "#1e1b18";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [member, setMember] = useState(null);

  const [formData, setFormData] = useState({
    about_me: "",
    avatar: "",
    phone: "",
    social_facebook: "",
    social_discord: "",
    social_tiktok: "",
    social_kick: "",
    social_instagram: "",
    social_twitter: "",
    social_youtube: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setMember(data.member);
        setFormData({
          about_me: data.member.about_me || "",
          avatar: data.member.avatar || "",
          phone: data.member.phone || "",
          social_facebook: data.member.social_facebook || "",
          social_discord: data.member.social_discord || "",
          social_tiktok: data.member.social_tiktok || "",
          social_kick: data.member.social_kick || "",
          social_instagram: data.member.social_instagram || "",
          social_twitter: data.member.social_twitter || "",
          social_youtube: data.member.social_youtube || "",
        });
      } else if (res.status === 404) {
        setMessage("Tu cuenta de Discord no está vinculada a ningún miembro del clan. Contacta al administrador.");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage("Error al cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage("✅ Perfil actualizado exitosamente");
        fetchProfile();
      } else {
        const data = await res.json();
        setMessage("❌ " + (data.error || "Error al actualizar perfil"));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("❌ Error al actualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: textMuted, fontFamily: "'Cinzel', serif", letterSpacing: 2 }}>Cargando...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div style={{ minHeight: "100vh", background: bg, padding: "2rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <button
            onClick={() => router.push("/")}
            style={{
              background: "transparent",
              border: `1px solid ${gold}`,
              color: gold,
              padding: "0.5rem 1rem",
              cursor: "pointer",
              borderRadius: "4px",
              fontFamily: "'Cinzel', serif",
              fontSize: 12,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 24,
            }}
          >
            ← Volver
          </button>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "2rem", marginBottom: "1rem", color: gold }}>Mi Perfil</h1>
          <div style={{
            background: "rgba(201, 76, 76, 0.1)",
            border: "1px solid rgba(201, 76, 76, 0.3)",
            borderRadius: 8,
            padding: 16,
          }}>
            <p style={{ color: textLight, margin: 0 }}>{message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, color: textLight }}>
      {/* Header */}
      <header style={{
        background: cardBg,
        borderBottom: `1px solid ${darkGold}`,
        padding: "20px 24px",
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 24,
              fontWeight: 700,
              color: gold,
              letterSpacing: 4,
              margin: 0,
            }}>
              MI PERFIL
            </h1>
            <p style={{ fontSize: 12, color: textMuted, marginTop: 4, margin: 0 }}>
              {session?.user?.name}
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            style={{
              background: "transparent",
              border: `1px solid ${gold}`,
              color: gold,
              padding: "10px 20px",
              cursor: "pointer",
              borderRadius: 6,
              fontFamily: "'Cinzel', serif",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              transition: "all 0.2s",
            }}
          >
            ← Volver al Inicio
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        {message && (
          <div style={{
            padding: 16,
            background: message.includes("✅") ? "rgba(76, 201, 130, 0.1)" : "rgba(201, 76, 76, 0.1)",
            border: `1px solid ${message.includes("✅") ? "rgba(76, 201, 130, 0.3)" : "rgba(201, 76, 76, 0.3)"}`,
            borderRadius: 8,
            marginBottom: 24,
            color: textLight,
          }}>
            {message}
          </div>
        )}

        {/* Member Info Card */}
        <div style={{
          background: cardBg,
          border: `1px solid ${darkGold}`,
          borderRadius: 10,
          padding: 24,
          marginBottom: 24,
        }}>
          <h2 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 18,
            fontWeight: 600,
            color: gold,
            marginBottom: 20,
            letterSpacing: 2,
          }}>
            INFORMACIÓN DEL MIEMBRO
          </h2>

          {/* Avatar */}
          {member.avatar && (
            <div style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 24,
              paddingBottom: 24,
              borderBottom: `1px solid ${darkGold}`,
            }}>
              <img
                src={(() => {
                  // Usar proxy para imágenes externas
                  let imageSrc = member.avatar;
                  if (member.avatar.startsWith('http://') || member.avatar.startsWith('https://')) {
                    const externalUrl = member.avatar.replace(/^https?:\/\//, '');
                    imageSrc = `https://images.weserv.nl/?url=${externalUrl}&w=200&h=200&fit=cover`;
                  }
                  return imageSrc;
                })()}
                alt={member.name}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: `4px solid ${gold}`,
                  boxShadow: `0 4px 12px rgba(201, 168, 76, 0.3)`,
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <div>
              <p style={{ fontSize: 12, color: textMuted, marginBottom: 4, letterSpacing: 1 }}>NOMBRE</p>
              <p style={{ fontSize: 16, color: textLight, fontWeight: 600, margin: 0 }}>{member.name}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: textMuted, marginBottom: 4, letterSpacing: 1 }}>RANGO</p>
              <p style={{ fontSize: 16, color: gold, fontWeight: 600, margin: 0 }}>{member.rank}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: textMuted, marginBottom: 4, letterSpacing: 1 }}>NIVEL</p>
              <p style={{ fontSize: 16, color: textLight, fontWeight: 600, margin: 0 }}>{member.level_rank || "B"}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: textMuted, marginBottom: 4, letterSpacing: 1 }}>MMR</p>
              <p style={{ fontSize: 16, color: textLight, fontWeight: 600, margin: 0 }}>{member.mmr || 0}</p>
            </div>
            {member.phone && (
              <div>
                <p style={{ fontSize: 12, color: textMuted, marginBottom: 4, letterSpacing: 1 }}>📱 TELÉFONO/WHATSAPP</p>
                <p style={{ fontSize: 16, color: textLight, fontWeight: 600, margin: 0 }}>{member.phone}</p>
              </div>
            )}
          </div>
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${darkGold}` }}>
            <p style={{ fontSize: 12, color: textMuted, marginBottom: 12, letterSpacing: 1 }}>NIVELES POR RAZA</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 100, textAlign: "center", background: "rgba(201,168,76,0.08)", padding: 12, borderRadius: 6, border: `1px solid rgba(201,168,76,0.2)` }}>
                <p style={{ fontSize: 10, color: gold, margin: 0, marginBottom: 4, letterSpacing: 1 }}>PROTOSS</p>
                <p style={{ fontSize: 20, color: gold, fontWeight: 700, margin: 0 }}>{member.protoss_level || '-'}</p>
              </div>
              <div style={{ flex: 1, minWidth: 100, textAlign: "center", background: "rgba(100,160,200,0.08)", padding: 12, borderRadius: 6, border: `1px solid rgba(100,160,200,0.2)` }}>
                <p style={{ fontSize: 10, color: "#7ab8d4", margin: 0, marginBottom: 4, letterSpacing: 1 }}>TERRAN</p>
                <p style={{ fontSize: 20, color: "#7ab8d4", fontWeight: 700, margin: 0 }}>{member.terran_level || '-'}</p>
              </div>
              <div style={{ flex: 1, minWidth: 100, textAlign: "center", background: "rgba(160,100,180,0.08)", padding: 12, borderRadius: 6, border: `1px solid rgba(160,100,180,0.2)` }}>
                <p style={{ fontSize: 10, color: "#c09ad8", margin: 0, marginBottom: 4, letterSpacing: 1 }}>ZERG</p>
                <p style={{ fontSize: 20, color: "#c09ad8", fontWeight: 700, margin: 0 }}>{member.zerg_level || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} style={{
          background: cardBg,
          border: `1px solid ${darkGold}`,
          borderRadius: 10,
          padding: 24,
        }}>
          <h3 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 18,
            fontWeight: 600,
            color: gold,
            marginBottom: 20,
            letterSpacing: 2,
          }}>
            EDITAR INFORMACIÓN
          </h3>

          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: textMuted,
              marginBottom: 8,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}>
              Sobre mí
            </label>
            <textarea
              value={formData.about_me}
              onChange={(e) => setFormData({ ...formData, about_me: e.target.value })}
              rows={4}
              placeholder="Cuéntanos algo sobre ti..."
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
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: textMuted,
              marginBottom: 8,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}>
              Avatar URL
            </label>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <input
                type="url"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
                style={{
                  flex: 1,
                  padding: 12,
                  background: bg,
                  border: `1px solid ${darkGold}`,
                  borderRadius: 6,
                  color: textLight,
                  fontSize: 14,
                }}
              />
              {formData.avatar && (
                <img
                  src={(() => {
                    // Usar proxy para imágenes externas
                    let imageSrc = formData.avatar;
                    if (formData.avatar.startsWith('http://') || formData.avatar.startsWith('https://')) {
                      const externalUrl = formData.avatar.replace(/^https?:\/\//, '');
                      imageSrc = `https://images.weserv.nl/?url=${externalUrl}&w=100&h=100&fit=cover`;
                    }
                    return imageSrc;
                  })()}
                  alt="Preview"
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: `2px solid ${gold}`,
                    flexShrink: 0,
                  }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: textMuted,
              marginBottom: 8,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}>
              📱 Teléfono/WhatsApp
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+51 999 999 999"
              style={{
                width: "100%",
                padding: 12,
                background: bg,
                border: `1px solid ${darkGold}`,
                borderRadius: 6,
                color: textLight,
                fontSize: 14,
              }}
            />
          </div>

          <h4 style={{
            fontSize: 14,
            fontWeight: 600,
            color: gold,
            marginBottom: 16,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}>
            Redes Sociales
          </h4>

          <div style={{ display: "grid", gap: 16 }}>
            {[
              { key: "social_facebook", label: "Facebook", icon: "Facebook", type: "url", placeholder: "https://facebook.com/tu-perfil" },
              { key: "social_discord", label: "Discord", icon: "Discord", type: "text", placeholder: "tu_usuario_discord" },
              { key: "social_tiktok", label: "TikTok", icon: "TikTok", type: "url", placeholder: "https://tiktok.com/@tu-usuario" },
              { key: "social_kick", label: "Kick", icon: "Kick", type: "url", placeholder: "https://kick.com/tu-canal" },
              { key: "social_instagram", label: "Instagram", icon: "Instagram", type: "url", placeholder: "https://instagram.com/tu-perfil" },
              { key: "social_twitter", label: "Twitter", icon: "Twitter", type: "url", placeholder: "https://twitter.com/tu-usuario" },
              { key: "social_youtube", label: "YouTube", icon: "YouTube", type: "url", placeholder: "https://youtube.com/@tu-canal" },
            ].map(({ key, label, icon, type, placeholder }) => {
              const Icon = SocialIcons[icon];
              return (
                <div key={key}>
                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    color: textMuted,
                    marginBottom: 8,
                    letterSpacing: 1,
                  }}>
                    <Icon size={16} />
                    {label}
                  </label>
                  <input
                    type={type}
                    value={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    placeholder={placeholder}
                    style={{
                      width: "100%",
                      padding: 12,
                      background: bg,
                      border: `1px solid ${darkGold}`,
                      borderRadius: 6,
                      color: textLight,
                      fontSize: 14,
                    }}
                  />
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              marginTop: 24,
              padding: "12px 24px",
              background: gold,
              color: bg,
              border: "none",
              borderRadius: 6,
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "'Cinzel', serif",
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              opacity: saving ? 0.6 : 1,
              transition: "all 0.2s",
            }}
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </form>
      </main>
    </div>
  );
}
