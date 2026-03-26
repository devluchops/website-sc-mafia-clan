"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const gold = "#c9a84c";
const darkGold = "#2a2215";
const cardBg = "#111110";
const textMuted = "#6b5c3e";
const textLight = "#e8dcc0";
const bg = "#0a0a0a";

function AdminCard({ title, children, style }) {
  return (
    <div
      style={{
        background: cardBg,
        border: `1px solid ${darkGold}`,
        borderRadius: 10,
        padding: 24,
        ...style,
      }}
    >
      <h2
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 18,
          fontWeight: 600,
          color: gold,
          marginBottom: 20,
          letterSpacing: 2,
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, textarea }) {
  const Component = textarea ? "textarea" : "input";
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 600,
          color: textMuted,
          marginBottom: 6,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
      <Component
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px 14px",
          background: bg,
          border: `1px solid ${darkGold}`,
          borderRadius: 6,
          color: textLight,
          fontSize: 14,
          fontFamily: "inherit",
          ...(textarea && { minHeight: 100, resize: "vertical" }),
        }}
      />
    </div>
  );
}

function Button({ onClick, children, variant = "primary", loading, disabled }) {
  const isPrimary = variant === "primary";
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        padding: "10px 20px",
        background: isPrimary ? gold : "transparent",
        color: isPrimary ? bg : gold,
        border: isPrimary ? "none" : `1px solid ${gold}`,
        borderRadius: 6,
        fontFamily: "'Cinzel', serif",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        cursor: loading || disabled ? "not-allowed" : "pointer",
        opacity: loading || disabled ? 0.6 : 1,
        transition: "all 0.2s",
      }}
    >
      {loading ? "Guardando..." : children}
    </button>
  );
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [clanInfo, setClanInfo] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    // Cargar información del clan
    fetch("/api/admin/clan-info")
      .then((res) => res.json())
      .then((data) => setClanInfo(data))
      .catch((err) => console.error(err));

    // Cargar miembros
    fetch("/api/admin/members")
      .then((res) => res.json())
      .then((data) => setMembers(data))
      .catch((err) => console.error(err));
  }, []);

  const handleSaveClanInfo = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/clan-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clanInfo.name,
          tagline: clanInfo.tagline,
        }),
      });
      if (res.ok) {
        setMessage("✅ Información guardada correctamente");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ Error al guardar");
      }
    } catch (error) {
      setMessage("❌ Error: " + error.message);
    }
    setLoading(false);
  };

  if (!clanInfo) {
    return (
      <div style={{ minHeight: "100vh", background: bg, color: textLight, padding: 24 }}>
        <div style={{ textAlign: "center", paddingTop: 100 }}>
          <p style={{ color: textMuted }}>Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, color: textLight }}>
      {/* Header */}
      <header
        style={{
          background: cardBg,
          borderBottom: `1px solid ${darkGold}`,
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 24,
              fontWeight: 700,
              color: gold,
              letterSpacing: 4,
            }}
          >
            PANEL ADMIN
          </h1>
          <p style={{ fontSize: 12, color: textMuted, marginTop: 4 }}>
            {session?.user?.email || session?.user?.name}
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={() => router.push("/")}>
            Ver Sitio
          </Button>
          <Button variant="secondary" onClick={() => signOut({ callbackUrl: "/" })}>
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {message && (
          <div
            style={{
              padding: 16,
              background: message.includes("✅") ? "rgba(76, 201, 130, 0.1)" : "rgba(201, 76, 76, 0.1)",
              border: `1px solid ${message.includes("✅") ? "rgba(76, 201, 130, 0.3)" : "rgba(201, 76, 76, 0.3)"}`,
              borderRadius: 8,
              marginBottom: 24,
              color: textLight,
            }}
          >
            {message}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 24 }}>
          {/* Información del Clan */}
          <AdminCard title="Información del Clan">
            <Input
              label="Nombre del Clan"
              value={clanInfo.name}
              onChange={(val) =>
                setClanInfo({ ...clanInfo, name: val })
              }
              placeholder="MAFIA"
            />
            <Input
              label="Frase / Tagline"
              value={clanInfo.tagline}
              onChange={(val) =>
                setClanInfo({ ...clanInfo, tagline: val })
              }
              placeholder="El mejor clan del StarCraft en mapa Fastest"
            />
            <div style={{ marginTop: 20 }}>
              <Button onClick={handleSaveClanInfo} loading={loading}>
                Guardar Cambios
              </Button>
            </div>
          </AdminCard>

          {/* Logo */}
          <AdminCard title="Logo del Clan">
            <div style={{ marginBottom: 16, textAlign: "center" }}>
              <img
                src={clanInfo.logo || "/logo.png"}
                alt="Logo"
                style={{
                  width: 120,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: "50%",
                  border: `2px solid ${gold}`,
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
            <p style={{ fontSize: 12, color: textMuted, marginBottom: 12, lineHeight: 1.6 }}>
              Para cambiar el logo, sube la imagen <strong style={{ color: gold }}>logo.png</strong> a la carpeta <code style={{ color: gold, background: bg, padding: "2px 6px", borderRadius: 4 }}>/public</code> en GitHub.
            </p>
            <p style={{ fontSize: 12, color: textMuted, marginBottom: 16, lineHeight: 1.6 }}>
              Tamaño recomendado: 512x512px, formato PNG o JPG
            </p>
          </AdminCard>
        </div>

        {/* Miembros */}
        <AdminCard title="Miembros del Clan" style={{ marginBottom: 24 }}>
          <p style={{ color: textMuted, fontSize: 14, marginBottom: 16 }}>
            Total de miembros: <strong style={{ color: gold }}>{members.length}</strong>
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
            {members.map((member) => (
              <div
                key={member.id}
                style={{
                  background: bg,
                  padding: 14,
                  borderRadius: 8,
                  border: `1px solid ${darkGold}`,
                }}
              >
                <p style={{ fontWeight: 600, color: textLight, marginBottom: 6, fontSize: 15 }}>{member.name}</p>
                <p style={{ fontSize: 12, color: textMuted, marginBottom: 4 }}>
                  <strong style={{ color: gold }}>{member.rank}</strong> • {member.race}
                </p>
                <p style={{ fontSize: 12, color: textMuted }}>
                  MMR: <strong style={{ color: gold }}>{member.mmr}</strong>
                </p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 13, color: textMuted, fontStyle: "italic" }}>
              Próximamente: Agregar, editar y eliminar miembros desde aquí
            </p>
          </div>
        </AdminCard>

        {/* Info */}
        <AdminCard title="ℹ️ Información">
          <div style={{ fontSize: 13, color: textMuted, lineHeight: 1.8 }}>
            <p style={{ marginBottom: 12 }}>
              <strong style={{ color: textLight }}>✅ Ya funciona:</strong>
            </p>
            <ul style={{ marginLeft: 20, marginBottom: 20 }}>
              <li>Editar nombre y tagline del clan</li>
              <li>Ver todos los miembros</li>
              <li>Login seguro con GitHub</li>
            </ul>
            <p style={{ marginBottom: 12 }}>
              <strong style={{ color: textLight }}>🚧 Próximamente:</strong>
            </p>
            <ul style={{ marginLeft: 20 }}>
              <li>Agregar/editar/eliminar miembros</li>
              <li>Crear y gestionar posts del blog</li>
              <li>Subir y cambiar logo desde el panel</li>
              <li>Gestionar videos y eventos</li>
            </ul>
          </div>
        </AdminCard>
      </main>
    </div>
  );
}
