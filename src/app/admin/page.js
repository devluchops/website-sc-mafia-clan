"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const gold = "#c9a84c";
const darkGold = "#3d3525";
const cardBg = "#252220";
const textMuted = "#8b7b5e";
const textLight = "#e8dcc0";
const bg = "#1e1b18";

// ============================================================
// COMPONENTS
// ============================================================

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

function Input({ label, value, onChange, placeholder, textarea, type = "text" }) {
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
        type={type}
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

function Select({ label, value, onChange, options }) {
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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 14px",
          background: bg,
          border: `1px solid ${darkGold}`,
          borderRadius: 6,
          color: textLight,
          fontSize: 14,
          fontFamily: "inherit",
        }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function Button({ onClick, children, variant = "primary", loading, disabled, style }) {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";

  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        padding: "10px 20px",
        background: isDanger ? "#c94c4c" : (isPrimary ? gold : "transparent"),
        color: isDanger ? "#fff" : (isPrimary ? bg : gold),
        border: (isPrimary || isDanger) ? "none" : `1px solid ${gold}`,
        borderRadius: 6,
        fontFamily: "'Cinzel', serif",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        cursor: loading || disabled ? "not-allowed" : "pointer",
        opacity: loading || disabled ? 0.6 : 1,
        transition: "all 0.2s",
        ...style,
      }}
    >
      {loading ? "Guardando..." : children}
    </button>
  );
}

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: cardBg,
          border: `1px solid ${darkGold}`,
          borderRadius: 10,
          padding: 24,
          maxWidth: 600,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 20,
            fontWeight: 600,
            color: gold,
            marginBottom: 20,
            letterSpacing: 2,
          }}
        >
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [clanInfo, setClanInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [events, setEvents] = useState([]);
  const [rules, setRules] = useState([]);

  // Modal states
  const [memberModal, setMemberModal] = useState({ isOpen: false, member: null });
  const [postModal, setPostModal] = useState({ isOpen: false, post: null });
  const [videoModal, setVideoModal] = useState({ isOpen: false, video: null });
  const [eventModal, setEventModal] = useState({ isOpen: false, event: null });
  const [ruleModal, setRuleModal] = useState({ isOpen: false, rule: null });
  const [logoFile, setLogoFile] = useState(null);
  const [postImageFile, setPostImageFile] = useState(null);
  const [memberFilter, setMemberFilter] = useState("todos");
  const [videoFilter, setVideoFilter] = useState("");
  const [postFilter, setPostFilter] = useState("Todos");
  const [eventFilter, setEventFilter] = useState("Todos");

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
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

    // Cargar posts (crear API si no existe)
    fetch("/api/admin/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error(err));

    // Cargar videos
    fetch("/api/admin/videos")
      .then((res) => res.json())
      .then((data) => setVideos(data))
      .catch((err) => console.error(err));

    // Cargar eventos
    fetch("/api/admin/events")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error(err));

    // Cargar reglas
    fetch("/api/admin/rules")
      .then((res) => res.json())
      .then((data) => setRules(data))
      .catch((err) => console.error(err));
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  // ============================================================
  // CLAN INFO HANDLERS
  // ============================================================

  const handleSaveClanInfo = async () => {
    setLoading(true);
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
        showMessage("✅ Información guardada correctamente");
      } else {
        showMessage("❌ Error al guardar");
      }
    } catch (error) {
      showMessage("❌ Error: " + error.message);
    }
    setLoading(false);
  };

  const handleUploadLogo = async () => {
    if (!logoFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("logo", logoFile);

    try {
      const res = await fetch("/api/admin/upload-logo", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        showMessage("✅ Logo subido correctamente");
        setLogoFile(null);
        loadData();
      } else {
        showMessage("❌ Error al subir logo");
      }
    } catch (error) {
      showMessage("❌ Error: " + error.message);
    }
    setLoading(false);
  };

  // ============================================================
  // MEMBER HANDLERS
  // ============================================================

  const handleSaveMember = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberModal.member),
      });
      if (res.ok) {
        showMessage("✅ Miembro guardado correctamente");
        setMemberModal({ isOpen: false, member: null });
        loadData();
      } else {
        showMessage("❌ Error al guardar miembro");
      }
    } catch (error) {
      showMessage("❌ Error: " + error.message);
    }
    setLoading(false);
  };

  const handleDeleteMember = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este miembro?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        showMessage("✅ Miembro eliminado");
        loadData();
      } else {
        showMessage("❌ Error al eliminar");
      }
    } catch (error) {
      showMessage("❌ Error: " + error.message);
    }
    setLoading(false);
  };

  // ============================================================
  // POST HANDLERS
  // ============================================================

  const handleSavePost = async () => {
    setLoading(true);
    try {
      let imagePath = postModal.post?.image || null;

      // Si hay una imagen nueva, subirla primero
      if (postImageFile) {
        const formData = new FormData();
        formData.append("image", postImageFile);

        const uploadRes = await fetch("/api/admin/upload-post-image", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imagePath = uploadData.image;
        } else {
          showMessage("❌ Error al subir imagen");
          setLoading(false);
          return;
        }
      }

      // Guardar post con la ruta de la imagen
      const postData = { ...postModal.post, image: imagePath };
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (res.ok) {
        showMessage("✅ Post guardado correctamente");
        setPostModal({ isOpen: false, post: null });
        setPostImageFile(null);
        loadData();
      } else {
        showMessage("❌ Error al guardar post");
      }
    } catch (error) {
      showMessage("❌ Error: " + error.message);
    }
    setLoading(false);
  };

  const handleDeletePost = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este post?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        showMessage("✅ Post eliminado");
        loadData();
      } else {
        showMessage("❌ Error al eliminar");
      }
    } catch (error) {
      showMessage("❌ Error: " + error.message);
    }
    setLoading(false);
  };

  // ============================================================
  // VIDEO HANDLERS
  // ============================================================

  const handleSaveVideo = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(videoModal.video),
      });
      if (res.ok) {
        showMessage("✅ Video guardado correctamente");
        setVideoModal({ isOpen: false, video: null });
        loadData();
      } else {
        showMessage("❌ Error al guardar video");
      }
    } catch (error) {
      showMessage("❌ Error: " + error.message);
    }
    setLoading(false);
  };

  const handleDeleteVideo = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este video?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/videos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        showMessage("✅ Video eliminado");
        loadData();
      } else {
        showMessage("❌ Error al eliminar");
      }
    } catch (error) {
      showMessage("❌ Error: " + error.message);
    }
    setLoading(false);
  };

  // ============================================================
  // EVENT HANDLERS
  // ============================================================

  const handleSaveEvent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventModal.event),
      });
      if (res.ok) {
        showMessage("✅ Evento guardado correctamente");
        setEventModal({ isOpen: false, event: null });
        loadData();
      } else {
        showMessage("❌ Error al guardar evento");
      }
    } catch (error) {
      showMessage("❌ Error: " + error.message);
    }
    setLoading(false);
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este evento?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        showMessage("✅ Evento eliminado");
        loadData();
      } else {
        showMessage("❌ Error al eliminar");
      }
    } catch (error) {
      showMessage("❌ Error: " + error.message);
    }
    setLoading(false);
  };

  // ============================================================
  // RULE HANDLERS
  // ============================================================

  const handleSaveRule = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ruleModal.rule),
      });
      if (res.ok) {
        showMessage("✅ Regla guardada correctamente");
        setRuleModal({ isOpen: false, rule: null });
        loadData();
      } else {
        showMessage("❌ Error al guardar regla");
      }
    } catch (error) {
      showMessage("❌ Error: " + error.message);
    }
    setLoading(false);
  };

  const handleDeleteRule = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta regla?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/rules", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        showMessage("✅ Regla eliminada");
        loadData();
      } else {
        showMessage("❌ Error al eliminar");
      }
    } catch (error) {
      showMessage("❌ Error: " + error.message);
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

        {/* Clan Info & Logo */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 24 }}>
          <AdminCard title="Información del Clan">
            <Input
              label="Nombre del Clan"
              value={clanInfo.name}
              onChange={(val) => setClanInfo({ ...clanInfo, name: val })}
              placeholder="MAFIA"
            />
            <Input
              label="Frase / Tagline"
              value={clanInfo.tagline}
              onChange={(val) => setClanInfo({ ...clanInfo, tagline: val })}
              placeholder="El mejor clan del StarCraft en mapa Fastest"
            />
            <div style={{ marginTop: 20 }}>
              <Button onClick={handleSaveClanInfo} loading={loading}>
                Guardar Cambios
              </Button>
            </div>
          </AdminCard>

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
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files[0])}
              style={{
                width: "100%",
                padding: "10px",
                background: bg,
                border: `1px solid ${darkGold}`,
                borderRadius: 6,
                color: textLight,
                fontSize: 12,
                marginBottom: 12,
              }}
            />
            <Button onClick={handleUploadLogo} loading={loading} disabled={!logoFile}>
              Subir Logo
            </Button>
          </AdminCard>
        </div>

        {/* Members */}
        <AdminCard title="Miembros del Clan" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <p style={{ color: textMuted, fontSize: 14 }}>
                Total: <strong style={{ color: gold }}>{members.filter(m => memberFilter === "todos" || m.level_rank === memberFilter).length}</strong>
              </p>
              <select
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
                style={{
                  padding: "6px 12px",
                  background: bg,
                  border: `1px solid ${darkGold}`,
                  borderRadius: 6,
                  color: textLight,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                <option value="todos">Todos los niveles</option>
                <option value="S">Nivel S</option>
                <option value="A+">Nivel A+</option>
                <option value="A">Nivel A</option>
                <option value="B+">Nivel B+</option>
                <option value="B">Nivel B</option>
                <option value="C+">Nivel C+</option>
                <option value="C">Nivel C</option>
                <option value="D+">Nivel D+</option>
                <option value="D">Nivel D</option>
              </select>
            </div>
            <Button onClick={() => setMemberModal({ isOpen: true, member: { name: "", race: "Terran", rank: "Miembro", avatar: "", mmr: 0 } })}>
              + Agregar Miembro
            </Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {members
              .filter(m => memberFilter === "todos" || m.level_rank === memberFilter)
              .map((member) => (
              <div
                key={member.id}
                style={{
                  background: bg,
                  padding: 14,
                  borderRadius: 8,
                  border: `1px solid ${darkGold}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: textLight, marginBottom: 6, fontSize: 15 }}>
                    {member.name}
                    {member.level_rank && (
                      <span style={{
                        marginLeft: 8,
                        padding: "2px 8px",
                        fontSize: 11,
                        fontWeight: 700,
                        background: "rgba(201,168,76,0.15)",
                        color: gold,
                        borderRadius: 4,
                      }}>
                        {member.level_rank}
                      </span>
                    )}
                  </p>
                  <p style={{ fontSize: 12, color: textMuted, marginBottom: 0 }}>
                    <strong style={{ color: gold }}>{member.rank}</strong> • {member.main_race || member.race} • MMR: {member.mmr}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    variant="secondary"
                    style={{ padding: "6px 12px", fontSize: 10 }}
                    onClick={() => setMemberModal({ isOpen: true, member })}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    style={{ padding: "6px 12px", fontSize: 10 }}
                    onClick={() => handleDeleteMember(member.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        {/* Posts */}
        <AdminCard title="Posts del Blog" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <p style={{ color: textMuted, fontSize: 14 }}>
                Total: <strong style={{ color: gold }}>{posts.filter(p => postFilter === "Todos" || p.tag === postFilter).length}</strong>
              </p>
              <select
                value={postFilter}
                onChange={(e) => setPostFilter(e.target.value)}
                style={{
                  padding: "6px 12px",
                  background: bg,
                  border: `1px solid ${darkGold}`,
                  borderRadius: 6,
                  color: textLight,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                <option value="Todos">Todas las categorías</option>
                <option value="Guia">Guía</option>
                <option value="Recap">Recap</option>
                <option value="Noticias">Noticias</option>
              </select>
            </div>
            <Button onClick={() => {
              setPostImageFile(null);
              setPostModal({ isOpen: true, post: { tag: "Noticias", title: "", author: "", date: "", read_time: "", excerpt: "", content: "", image: null } });
            }}>
              + Agregar Post
            </Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {posts
              .filter(p => postFilter === "Todos" || p.tag === postFilter)
              .map((post) => (
              <div
                key={post.id}
                style={{
                  background: bg,
                  padding: 14,
                  borderRadius: 8,
                  border: `1px solid ${darkGold}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: textLight, marginBottom: 4 }}>{post.title}</p>
                  <p style={{ fontSize: 12, color: textMuted }}>
                    {post.tag} • {post.author} • {post.date}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    variant="secondary"
                    style={{ padding: "6px 12px", fontSize: 10 }}
                    onClick={() => {
                      setPostImageFile(null);
                      setPostModal({ isOpen: true, post });
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    style={{ padding: "6px 12px", fontSize: 10 }}
                    onClick={() => handleDeletePost(post.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        {/* Videos */}
        <AdminCard title="Videos" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <p style={{ color: textMuted, fontSize: 14 }}>
                Total: <strong style={{ color: gold }}>{videos.filter(v => v.title.toLowerCase().includes(videoFilter.toLowerCase())).length}</strong>
              </p>
              <input
                type="text"
                placeholder="Buscar video..."
                value={videoFilter}
                onChange={(e) => setVideoFilter(e.target.value)}
                style={{
                  padding: "6px 12px",
                  background: bg,
                  border: `1px solid ${darkGold}`,
                  borderRadius: 6,
                  color: textLight,
                  fontSize: 12,
                  minWidth: 200,
                }}
              />
            </div>
            <Button onClick={() => setVideoModal({ isOpen: true, video: { title: "", duration: "", date: "", youtube_id: "" } })}>
              + Agregar Video
            </Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {videos
              .filter(v => v.title.toLowerCase().includes(videoFilter.toLowerCase()))
              .map((video) => (
              <div
                key={video.id}
                style={{
                  background: bg,
                  padding: 14,
                  borderRadius: 8,
                  border: `1px solid ${darkGold}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: textLight, marginBottom: 4, fontSize: 14 }}>{video.title}</p>
                  <p style={{ fontSize: 12, color: textMuted, marginBottom: 0 }}>
                    {video.duration} • {video.date}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    variant="secondary"
                    style={{ padding: "6px 12px", fontSize: 10 }}
                    onClick={() => setVideoModal({ isOpen: true, video })}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    style={{ padding: "6px 12px", fontSize: 10 }}
                    onClick={() => handleDeleteVideo(video.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        {/* Events */}
        <AdminCard title="Eventos" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ color: textMuted, fontSize: 14 }}>
              Total: <strong style={{ color: gold }}>{events.length}</strong>
            </p>
            <Button onClick={() => setEventModal({ isOpen: true, event: { month: "Ene", day: "1", title: "", description: "", status: "Abierto" } })}>
              + Agregar Evento
            </Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {events.map((event) => (
              <div
                key={event.id}
                style={{
                  background: bg,
                  padding: 14,
                  borderRadius: 8,
                  border: `1px solid ${darkGold}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: textLight, marginBottom: 4 }}>{event.title}</p>
                  <p style={{ fontSize: 12, color: textMuted }}>
                    {event.month} {event.day} • {event.status}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    variant="secondary"
                    style={{ padding: "6px 12px", fontSize: 10 }}
                    onClick={() => setEventModal({ isOpen: true, event })}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    style={{ padding: "6px 12px", fontSize: 10 }}
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        {/* Reglas del Clan */}
        <AdminCard title="Reglas del Clan">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ color: textMuted, fontSize: 14 }}>
              Total: <strong style={{ color: gold }}>{rules.length}</strong>
            </p>
            <Button onClick={() => setRuleModal({ isOpen: true, rule: { category: "Reglas Generales", title: "", description: "", order_index: rules.length } })}>
              + Agregar Regla
            </Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {rules.map((rule) => (
              <div
                key={rule.id}
                style={{
                  background: bg,
                  padding: 14,
                  borderRadius: 8,
                  border: `1px solid ${darkGold}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: gold, fontWeight: 600, letterSpacing: 1 }}>
                      {rule.category.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontWeight: 600, color: textLight, marginBottom: 4 }}>{rule.title}</p>
                  <p style={{ fontSize: 12, color: textMuted }}>{rule.description}</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    variant="secondary"
                    style={{ padding: "6px 12px", fontSize: 10 }}
                    onClick={() => setRuleModal({ isOpen: true, rule })}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    style={{ padding: "6px 12px", fontSize: 10 }}
                    onClick={() => handleDeleteRule(rule.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </main>

      {/* MODALS */}

      {/* Member Modal */}
      <Modal
        isOpen={memberModal.isOpen}
        onClose={() => setMemberModal({ isOpen: false, member: null })}
        title={memberModal.member?.id ? "Editar Miembro" : "Agregar Miembro"}
      >
        <Input
          label="Nombre"
          value={memberModal.member?.name || ""}
          onChange={(val) => setMemberModal({ ...memberModal, member: { ...memberModal.member, name: val } })}
          placeholder="Nombre del jugador"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Select
            label="Raza Principal"
            value={memberModal.member?.main_race || "Terran"}
            onChange={(val) => setMemberModal({ ...memberModal, member: { ...memberModal.member, main_race: val } })}
            options={["Terran", "Zerg", "Protoss"]}
          />
          <Input
            label="Razas que Juega"
            value={memberModal.member?.races_played || ""}
            onChange={(val) => setMemberModal({ ...memberModal, member: { ...memberModal.member, races_played: val } })}
            placeholder="Ej: Terran, Zerg, Todas"
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Select
            label="Nivel"
            value={memberModal.member?.level_rank || "B"}
            onChange={(val) => setMemberModal({ ...memberModal, member: { ...memberModal.member, level_rank: val } })}
            options={["S", "A+", "A", "B+", "B", "C+", "C", "D+", "D"]}
          />
          <Input
            label="MMR"
            type="number"
            value={memberModal.member?.mmr || 0}
            onChange={(val) => setMemberModal({ ...memberModal, member: { ...memberModal.member, mmr: parseInt(val) || 0 } })}
            placeholder="0"
          />
        </div>

        <Select
          label="Rango"
          value={memberModal.member?.rank || "Miembro"}
          onChange={(val) => setMemberModal({ ...memberModal, member: { ...memberModal.member, rank: val } })}
          options={["Lider", "Oficial", "Miembro", "Recruit"]}
        />

        <Input
          label="Avatar URL"
          value={memberModal.member?.avatar || ""}
          onChange={(val) => setMemberModal({ ...memberModal, member: { ...memberModal.member, avatar: val } })}
          placeholder="URL de la imagen"
        />

        <h4 style={{ color: gold, fontSize: 14, marginTop: 20, marginBottom: 10 }}>Redes Sociales</h4>

        <Input
          label="Facebook"
          value={memberModal.member?.social_facebook || ""}
          onChange={(val) => setMemberModal({ ...memberModal, member: { ...memberModal.member, social_facebook: val } })}
          placeholder="https://facebook.com/..."
        />
        <Input
          label="Discord"
          value={memberModal.member?.social_discord || ""}
          onChange={(val) => setMemberModal({ ...memberModal, member: { ...memberModal.member, social_discord: val } })}
          placeholder="username#1234"
        />
        <Input
          label="TikTok"
          value={memberModal.member?.social_tiktok || ""}
          onChange={(val) => setMemberModal({ ...memberModal, member: { ...memberModal.member, social_tiktok: val } })}
          placeholder="@username"
        />
        <Input
          label="Kick"
          value={memberModal.member?.social_kick || ""}
          onChange={(val) => setMemberModal({ ...memberModal, member: { ...memberModal.member, social_kick: val } })}
          placeholder="https://kick.com/..."
        />
        <Input
          label="Instagram"
          value={memberModal.member?.social_instagram || ""}
          onChange={(val) => setMemberModal({ ...memberModal, member: { ...memberModal.member, social_instagram: val } })}
          placeholder="@username"
        />
        <Input
          label="Twitter/X"
          value={memberModal.member?.social_twitter || ""}
          onChange={(val) => setMemberModal({ ...memberModal, member: { ...memberModal.member, social_twitter: val } })}
          placeholder="@username"
        />

        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <Button onClick={handleSaveMember} loading={loading} style={{ flex: 1 }}>
            Guardar
          </Button>
          <Button variant="secondary" onClick={() => setMemberModal({ isOpen: false, member: null })} style={{ flex: 1 }}>
            Cancelar
          </Button>
        </div>
      </Modal>

      {/* Post Modal */}
      <Modal
        isOpen={postModal.isOpen}
        onClose={() => setPostModal({ isOpen: false, post: null })}
        title={postModal.post?.id ? "Editar Post" : "Agregar Post"}
      >
        <Input
          label="Título"
          value={postModal.post?.title || ""}
          onChange={(val) => setPostModal({ ...postModal, post: { ...postModal.post, title: val } })}
          placeholder="Título del post"
        />
        <Select
          label="Categoría"
          value={postModal.post?.tag || "Noticias"}
          onChange={(val) => setPostModal({ ...postModal, post: { ...postModal.post, tag: val } })}
          options={["Guia", "Recap", "Noticias"]}
        />
        <Input
          label="Autor"
          value={postModal.post?.author || ""}
          onChange={(val) => setPostModal({ ...postModal, post: { ...postModal.post, author: val } })}
          placeholder="Nombre del autor"
        />
        <Input
          label="Fecha"
          value={postModal.post?.date || ""}
          onChange={(val) => setPostModal({ ...postModal, post: { ...postModal.post, date: val } })}
          placeholder="24 Dic, 2024"
        />
        <Input
          label="Tiempo de lectura"
          value={postModal.post?.read_time || ""}
          onChange={(val) => setPostModal({ ...postModal, post: { ...postModal.post, read_time: val } })}
          placeholder="3 min"
        />
        <Input
          label="Extracto"
          textarea
          value={postModal.post?.excerpt || ""}
          onChange={(val) => setPostModal({ ...postModal, post: { ...postModal.post, excerpt: val } })}
          placeholder="Breve descripción del post"
        />
        <Input
          label="Contenido"
          textarea
          value={postModal.post?.content || ""}
          onChange={(val) => setPostModal({ ...postModal, post: { ...postModal.post, content: val } })}
          placeholder="Contenido completo del post"
        />

        {/* Imagen del post */}
        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600, color: textLight }}>
            Imagen del Post (opcional)
          </label>
          {postModal.post?.image && !postImageFile && (
            <div style={{ marginBottom: 12 }}>
              <img
                src={postModal.post.image}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  height: 150,
                  objectFit: "cover",
                  borderRadius: 8,
                  border: `1px solid ${darkGold}`
                }}
              />
              <p style={{ fontSize: 12, color: textMuted, marginTop: 4 }}>
                Imagen actual (puedes subir una nueva para reemplazarla)
              </p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPostImageFile(file);
            }}
            style={{
              width: "100%",
              padding: 10,
              background: cardBg,
              border: `1px solid ${darkGold}`,
              borderRadius: 6,
              color: textLight,
              fontSize: 14,
            }}
          />
          {postImageFile && (
            <p style={{ fontSize: 12, color: gold, marginTop: 8 }}>
              ✓ Nueva imagen seleccionada: {postImageFile.name}
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <Button onClick={handleSavePost} loading={loading} style={{ flex: 1 }}>
            Guardar
          </Button>
          <Button variant="secondary" onClick={() => {
            setPostModal({ isOpen: false, post: null });
            setPostImageFile(null);
          }} style={{ flex: 1 }}>
            Cancelar
          </Button>
        </div>
      </Modal>

      {/* Video Modal */}
      <Modal
        isOpen={videoModal.isOpen}
        onClose={() => setVideoModal({ isOpen: false, video: null })}
        title={videoModal.video?.id ? "Editar Video" : "Agregar Video"}
      >
        <Input
          label="Título"
          value={videoModal.video?.title || ""}
          onChange={(val) => setVideoModal({ ...videoModal, video: { ...videoModal.video, title: val } })}
          placeholder="Título del video"
        />
        <Input
          label="Duración"
          value={videoModal.video?.duration || ""}
          onChange={(val) => setVideoModal({ ...videoModal, video: { ...videoModal.video, duration: val } })}
          placeholder="12:34"
        />
        <Input
          label="Fecha"
          value={videoModal.video?.date || ""}
          onChange={(val) => setVideoModal({ ...videoModal, video: { ...videoModal.video, date: val } })}
          placeholder="24 Dic, 2024"
        />
        <Input
          label="YouTube ID"
          value={videoModal.video?.youtube_id || ""}
          onChange={(val) => setVideoModal({ ...videoModal, video: { ...videoModal.video, youtube_id: val } })}
          placeholder="dQw4w9WgXcQ"
        />
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <Button onClick={handleSaveVideo} loading={loading} style={{ flex: 1 }}>
            Guardar
          </Button>
          <Button variant="secondary" onClick={() => setVideoModal({ isOpen: false, video: null })} style={{ flex: 1 }}>
            Cancelar
          </Button>
        </div>
      </Modal>

      {/* Event Modal */}
      <Modal
        isOpen={eventModal.isOpen}
        onClose={() => setEventModal({ isOpen: false, event: null })}
        title={eventModal.event?.id ? "Editar Evento" : "Agregar Evento"}
      >
        <Input
          label="Título"
          value={eventModal.event?.title || ""}
          onChange={(val) => setEventModal({ ...eventModal, event: { ...eventModal.event, title: val } })}
          placeholder="Título del evento"
        />
        <Input
          label="Mes"
          value={eventModal.event?.month || ""}
          onChange={(val) => setEventModal({ ...eventModal, event: { ...eventModal.event, month: val } })}
          placeholder="Ene"
        />
        <Input
          label="Día"
          value={eventModal.event?.day || ""}
          onChange={(val) => setEventModal({ ...eventModal, event: { ...eventModal.event, day: val } })}
          placeholder="1"
        />
        <Input
          label="Descripción"
          textarea
          value={eventModal.event?.description || ""}
          onChange={(val) => setEventModal({ ...eventModal, event: { ...eventModal.event, description: val } })}
          placeholder="Descripción del evento"
        />
        <Select
          label="Estado"
          value={eventModal.event?.status || "Abierto"}
          onChange={(val) => setEventModal({ ...eventModal, event: { ...eventModal.event, status: val } })}
          options={["Abierto", "Cerrado", "Finalizado"]}
        />
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <Button onClick={handleSaveEvent} loading={loading} style={{ flex: 1 }}>
            Guardar
          </Button>
          <Button variant="secondary" onClick={() => setEventModal({ isOpen: false, event: null })} style={{ flex: 1 }}>
            Cancelar
          </Button>
        </div>
      </Modal>

      {/* Rule Modal */}
      <Modal
        isOpen={ruleModal.isOpen}
        onClose={() => setRuleModal({ isOpen: false, rule: null })}
        title={ruleModal.rule?.id ? "Editar Regla" : "Agregar Regla"}
      >
        <Select
          label="Categoría"
          value={ruleModal.rule?.category || "Reglas Generales"}
          onChange={(val) => setRuleModal({ ...ruleModal, rule: { ...ruleModal.rule, category: val } })}
          options={["Reglas Generales", "Compromisos", "Consecuencias"]}
        />
        <Input
          label="Título"
          value={ruleModal.rule?.title || ""}
          onChange={(val) => setRuleModal({ ...ruleModal, rule: { ...ruleModal.rule, title: val } })}
          placeholder="Título de la regla"
        />
        <Input
          label="Descripción"
          textarea
          value={ruleModal.rule?.description || ""}
          onChange={(val) => setRuleModal({ ...ruleModal, rule: { ...ruleModal.rule, description: val } })}
          placeholder="Descripción de la regla"
        />
        <Input
          label="Orden"
          type="number"
          value={ruleModal.rule?.order_index ?? ""}
          onChange={(val) => setRuleModal({ ...ruleModal, rule: { ...ruleModal.rule, order_index: parseInt(val) || 0 } })}
          placeholder="0"
        />
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <Button onClick={handleSaveRule} loading={loading} style={{ flex: 1 }}>
            Guardar
          </Button>
          <Button variant="secondary" onClick={() => setRuleModal({ isOpen: false, rule: null })} style={{ flex: 1 }}>
            Cancelar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
