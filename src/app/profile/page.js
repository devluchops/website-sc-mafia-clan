"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SocialIcons } from "@/components/SocialIcons";

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
        setMessage("Perfil actualizado exitosamente");
        fetchProfile();
      } else {
        const data = await res.json();
        setMessage(data.error || "Error al actualizar perfil");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Error al actualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-secondary)" }}>Cargando...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div style={{ minHeight: "100vh", padding: "2rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "var(--gold)" }}>Mi Perfil</h1>
          <p style={{ color: "var(--text-secondary)" }}>{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <button
            onClick={() => router.push("/")}
            style={{
              background: "transparent",
              border: "1px solid var(--gold)",
              color: "var(--gold)",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            ← Volver al inicio
          </button>
        </div>

        <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "var(--gold)" }}>Mi Perfil</h1>

        <div style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
          padding: "1.5rem",
          marginBottom: "2rem",
        }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "var(--gold)" }}>{member.name}</h2>
          <div style={{ display: "grid", gap: "0.5rem", color: "var(--text-secondary)" }}>
            <p><strong>Raza:</strong> {member.race}</p>
            <p><strong>Rango:</strong> {member.rank}</p>
            <p><strong>Nivel:</strong> {member.level_rank || "B"}</p>
            <p><strong>MMR:</strong> {member.mmr || "N/A"}</p>
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <p><strong>Protoss:</strong> {member.protoss_level || "-"}</p>
              <p><strong>Terran:</strong> {member.terran_level || "-"}</p>
              <p><strong>Zerg:</strong> {member.zerg_level || "-"}</p>
            </div>
          </div>
        </div>

        {message && (
          <div style={{
            padding: "1rem",
            marginBottom: "1rem",
            background: message.includes("exitosamente") ? "rgba(76, 175, 80, 0.1)" : "rgba(244, 67, 54, 0.1)",
            border: `1px solid ${message.includes("exitosamente") ? "rgba(76, 175, 80, 0.3)" : "rgba(244, 67, 54, 0.3)"}`,
            color: message.includes("exitosamente") ? "#4CAF50" : "#F44336",
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
          padding: "1.5rem",
        }}>
          <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "var(--gold)" }}>Editar Información</h3>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-primary)" }}>
              Sobre mí
            </label>
            <textarea
              value={formData.about_me}
              onChange={(e) => setFormData({ ...formData, about_me: e.target.value })}
              rows={4}
              placeholder="Escribe una breve descripción sobre ti..."
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "var(--bg-primary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                borderRadius: "4px",
                fontSize: "1rem",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-primary)" }}>
              Avatar URL
            </label>
            <input
              type="url"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              placeholder="https://ejemplo.com/imagen.jpg"
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "var(--bg-primary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                borderRadius: "4px",
                fontSize: "1rem",
              }}
            />
          </div>

          <h4 style={{ fontSize: "1rem", marginBottom: "1rem", color: "var(--text-primary)" }}>Redes Sociales</h4>

          <div style={{ display: "grid", gap: "1rem" }}>
            {[
              { key: "social_facebook", label: "Facebook", icon: "Facebook" },
              { key: "social_discord", label: "Discord", icon: "Discord" },
              { key: "social_tiktok", label: "TikTok", icon: "TikTok" },
              { key: "social_kick", label: "Kick", icon: "Kick" },
              { key: "social_instagram", label: "Instagram", icon: "Instagram" },
              { key: "social_twitter", label: "Twitter", icon: "Twitter" },
              { key: "social_youtube", label: "YouTube", icon: "YouTube" },
            ].map(({ key, label, icon }) => {
              const Icon = SocialIcons[icon];
              return (
                <div key={key}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-primary)" }}>
                    <Icon size={16} />
                    {label}
                  </label>
                  <input
                    type="url"
                    value={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    placeholder={`URL de ${label}`}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: "var(--bg-primary)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                      borderRadius: "4px",
                      fontSize: "1rem",
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
              marginTop: "1.5rem",
              padding: "0.75rem 1.5rem",
              background: "var(--gold)",
              color: "#000",
              border: "none",
              cursor: saving ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "1rem",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}
