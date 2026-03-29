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
  const [permissions, setPermissions] = useState([]);
  const [buildOrders, setBuildOrders] = useState([]);
  const [tournaments, setTournaments] = useState([]);

  // Modal states
  const [memberModal, setMemberModal] = useState({ isOpen: false, member: null });
  const [postModal, setPostModal] = useState({ isOpen: false, post: null });
  const [videoModal, setVideoModal] = useState({ isOpen: false, video: null });
  const [eventModal, setEventModal] = useState({ isOpen: false, event: null });
  const [ruleModal, setRuleModal] = useState({ isOpen: false, rule: null });
  const [buildOrderModal, setBuildOrderModal] = useState({ isOpen: false, buildOrder: null });
  const [tournamentModal, setTournamentModal] = useState({ isOpen: false, tournament: null });
  const [discordUserModal, setDiscordUserModal] = useState({ isOpen: false, user: null });
  const [logoFile, setLogoFile] = useState(null);
  const [postImageFile, setPostImageFile] = useState(null);
  const [memberFilter, setMemberFilter] = useState("todos");
  const [memberSearch, setMemberSearch] = useState("");
  const [videoFilter, setVideoFilter] = useState("");
  const [postFilter, setPostFilter] = useState("Todos");
  const [eventFilter, setEventFilter] = useState("Todos");
  const [activeSection, setActiveSection] = useState("info");
  const [permissionsPage, setPermissionsPage] = useState(1);
  const [membersPage, setMembersPage] = useState(1);
  const [postsPage, setPostsPage] = useState(1);
  const [videosPage, setVideosPage] = useState(1);
  const [eventsPage, setEventsPage] = useState(1);
  const [rulesPage, setRulesPage] = useState(1);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  // Set initial active section based on permissions
  useEffect(() => {
    if (session?.user?.permissions) {
      const perms = session.user.permissions;
      if (perms.is_admin) {
        setActiveSection("info");
      } else if (perms.can_manage_members) {
        setActiveSection("members");
      } else if (perms.can_publish_blog) {
        setActiveSection("blog");
      } else if (perms.can_publish_videos) {
        setActiveSection("videos");
      } else if (perms.can_manage_build_orders) {
        setActiveSection("build-orders");
      } else if (perms.can_publish_events) {
        setActiveSection("events");
      } else if (perms.can_edit_rules) {
        setActiveSection("rules");
      } else if (perms.can_manage_permissions) {
        setActiveSection("permissions");
      }
    }
  }, [session]);

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

    // Cargar permisos
    fetch("/api/admin/permissions")
      .then((res) => res.json())
      .then((data) => setPermissions(data.members || []))
      .catch((err) => console.error(err));

    // Cargar build orders
    fetch("/api/admin/build-orders")
      .then((res) => res.json())
      .then((data) => setBuildOrders(data || []))
      .catch((err) => console.error(err));

    // Cargar torneos de Challonge
    fetch("/api/admin/tournaments")
      .then((res) => res.json())
      .then((data) => setTournaments(data || []))
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

  const handleSaveBuildOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/build-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildOrderModal.buildOrder),
      });
      if (res.ok) {
        showMessage("✅ Build Order guardado correctamente");
        setBuildOrderModal({ isOpen: false, buildOrder: null });
        loadData();
      } else {
        showMessage("❌ Error al guardar Build Order");
      }
    } catch (error) {
      showMessage("❌ Error: " + error.message);
    }
    setLoading(false);
  };

  const handleDeleteBuildOrder = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este Build Order?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/build-orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        showMessage("✅ Build Order eliminado");
        loadData();
      } else {
        showMessage("❌ Error al eliminar");
      }
    } catch (error) {
      showMessage("❌ Error: " + error.message);
    }
    setLoading(false);
  };

  const handleSaveTournament = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: 'create',
          tournamentData: tournamentModal.tournament
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showMessage("✅ Torneo creado correctamente en Challonge");
        setTournamentModal({ isOpen: false, tournament: null });
        loadData();
      } else {
        showMessage("❌ " + (data.error || "Error al crear torneo"));
      }
    } catch (error) {
      showMessage("❌ Error: " + error.message);
    }
    setLoading(false);
  };

  const handleDeleteTournament = async (tournamentId) => {
    if (!confirm("¿Estás seguro de eliminar este torneo de Challonge?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/tournaments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId }),
      });

      const data = await res.json();

      if (res.ok) {
        showMessage("✅ Torneo eliminado");
        loadData();
      } else {
        showMessage("❌ " + (data.error || "Error al eliminar"));
      }
    } catch (error) {
      showMessage("❌ Error: " + error.message);
    }
    setLoading(false);
  };

  const handleStartTournament = async (tournamentId) => {
    if (!confirm("¿Iniciar este torneo? No podrás agregar más participantes después.")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: 'start',
          tournamentId
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showMessage("✅ Torneo iniciado correctamente");
        loadData();
      } else {
        showMessage("❌ " + (data.error || "Error al iniciar torneo"));
      }
    } catch (error) {
      showMessage("❌ Error: " + error.message);
    }
    setLoading(false);
  };

  // ============================================================
  // USER MANAGEMENT (for Permissions section)
  // ============================================================

  const handleSaveDiscordUser = async () => {
    setLoading(true);
    try {
      if (!discordUserModal.selectedMemberId || discordUserModal.selectedMemberId === "-- Seleccionar miembro --") {
        showMessage("❌ Debes seleccionar un miembro");
        setLoading(false);
        return;
      }

      // El valor es "id:nombre (discord)", extraer el ID
      const memberId = parseInt(discordUserModal.selectedMemberId.split(':')[0]);
      const member = members.find(m => m.id === memberId);

      if (!member || !member.social_discord) {
        showMessage("❌ El miembro seleccionado no tiene Discord configurado");
        setLoading(false);
        return;
      }

      const userData = {
        discord_id: null, // Se llenará cuando el usuario haga login
        discord_username: member.social_discord,
        email: null,
      };

      // Save the user to discord_authorized_users
      const res = await fetch("/api/admin/discord-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (res.ok) {
        showMessage(`✅ ${member.name} agregado correctamente`);
        setDiscordUserModal({ isOpen: false, selectedMemberId: null });
        loadData();
      } else {
        const data = await res.json();
        console.error("Error al agregar usuario:", data);
        showMessage("❌ " + (data.error || "Error al agregar usuario"));
      }
    } catch (error) {
      console.error("Error en handleSaveDiscordUser:", error);
      showMessage("❌ Error: " + error.message);
    }
    setLoading(false);
  };

  const handleDeleteUser = async (user) => {
    if (!confirm(`¿Estás seguro de eliminar a ${user.discord_username}? Se eliminarán sus permisos y acceso.`)) return;

    setLoading(true);
    try {
      // Delete from discord_authorized_users (permissions will cascade)
      const res = await fetch("/api/admin/discord-users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discord_id: user.discord_id || null,
          discord_username: user.discord_username || null,
        }),
      });
      if (res.ok) {
        showMessage(`✅ ${user.discord_username} eliminado correctamente`);
        loadData();
      } else {
        const errorData = await res.json();
        console.error("Error al eliminar usuario:", errorData);
        showMessage("❌ " + (errorData.error || "Error al eliminar"));
      }
    } catch (error) {
      console.error("Error en handleDeleteUser:", error);
      showMessage("❌ Error: " + error.message);
    }
    setLoading(false);
  };

  // ============================================================
  // PERMISSIONS HANDLERS
  // ============================================================

  const handleTogglePermission = async (user, permissionKey, currentValue) => {
    setLoading(true);
    try {
      if (!user) {
        showMessage("❌ Usuario no encontrado");
        setLoading(false);
        return;
      }

      const updatedPerms = {
        discord_id: user.discord_id || null,
        discord_username: user.discord_username || null,
        is_admin: user.is_admin,
        can_publish_blog: user.can_publish_blog,
        can_publish_videos: user.can_publish_videos,
        can_manage_build_orders: user.can_manage_build_orders,
        can_publish_events: user.can_publish_events,
        can_edit_rules: user.can_edit_rules,
        can_manage_members: user.can_manage_members,
        can_manage_permissions: user.can_manage_permissions,
        [permissionKey]: !currentValue,
      };

      const res = await fetch("/api/admin/permissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPerms),
      });

      if (res.ok) {
        showMessage("✅ Permisos actualizados");
        loadData();
      } else {
        const errorData = await res.json();
        console.error("Error al actualizar permisos:", errorData);
        showMessage("❌ " + (errorData.error || "Error al actualizar permisos"));
      }
    } catch (error) {
      console.error("Error en handleTogglePermission:", error);
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
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={() => router.push("/")}>
            Ver Sitio
          </Button>
          <Button variant="secondary" onClick={() => signOut({ callbackUrl: "/" })}>
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav
        style={{
          background: "#0d0d0a",
          borderBottom: `1px solid ${darkGold}`,
          overflowX: "auto",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 4, padding: "0 24px" }}>
          {session?.user?.permissions?.is_admin && (
            <button
              onClick={() => setActiveSection("info")}
              style={{
                background: activeSection === "info" ? "rgba(201,168,76,0.08)" : "transparent",
                border: "none",
                color: activeSection === "info" ? gold : textMuted,
                fontFamily: "'Cinzel', serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                padding: "16px 20px",
                cursor: "pointer",
                borderBottom: activeSection === "info" ? `2px solid ${gold}` : "2px solid transparent",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              Información
            </button>
          )}
          {(session?.user?.permissions?.is_admin || session?.user?.permissions?.can_manage_members) && (
            <button
              onClick={() => setActiveSection("members")}
              style={{
                background: activeSection === "members" ? "rgba(201,168,76,0.08)" : "transparent",
                border: "none",
                color: activeSection === "members" ? gold : textMuted,
                fontFamily: "'Cinzel', serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                padding: "16px 20px",
                cursor: "pointer",
                borderBottom: activeSection === "members" ? `2px solid ${gold}` : "2px solid transparent",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              Miembros
            </button>
          )}
          {(session?.user?.permissions?.is_admin || session?.user?.permissions?.can_publish_blog) && (
            <button
              onClick={() => setActiveSection("blog")}
              style={{
                background: activeSection === "blog" ? "rgba(201,168,76,0.08)" : "transparent",
                border: "none",
                color: activeSection === "blog" ? gold : textMuted,
                fontFamily: "'Cinzel', serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                padding: "16px 20px",
                cursor: "pointer",
                borderBottom: activeSection === "blog" ? `2px solid ${gold}` : "2px solid transparent",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              Blog
            </button>
          )}
          {(session?.user?.permissions?.is_admin || session?.user?.permissions?.can_publish_videos) && (
            <button
              onClick={() => setActiveSection("videos")}
              style={{
                background: activeSection === "videos" ? "rgba(201,168,76,0.08)" : "transparent",
                border: "none",
                color: activeSection === "videos" ? gold : textMuted,
                fontFamily: "'Cinzel', serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                padding: "16px 20px",
                cursor: "pointer",
                borderBottom: activeSection === "videos" ? `2px solid ${gold}` : "2px solid transparent",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              Videos
            </button>
          )}
          {(session?.user?.permissions?.is_admin || session?.user?.permissions?.can_manage_build_orders) && (
            <button
              onClick={() => setActiveSection("build-orders")}
              style={{
                background: activeSection === "build-orders" ? "rgba(201,168,76,0.08)" : "transparent",
                border: "none",
                color: activeSection === "build-orders" ? gold : textMuted,
                fontFamily: "'Cinzel', serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                padding: "16px 20px",
                cursor: "pointer",
                borderBottom: activeSection === "build-orders" ? `2px solid ${gold}` : "2px solid transparent",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              Build Orders
            </button>
          )}
          {(session?.user?.permissions?.is_admin || session?.user?.permissions?.can_publish_events) && (
            <button
              onClick={() => setActiveSection("events")}
              style={{
                background: activeSection === "events" ? "rgba(201,168,76,0.08)" : "transparent",
                border: "none",
                color: activeSection === "events" ? gold : textMuted,
                fontFamily: "'Cinzel', serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                padding: "16px 20px",
                cursor: "pointer",
                borderBottom: activeSection === "events" ? `2px solid ${gold}` : "2px solid transparent",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              Eventos
            </button>
          )}
          {(session?.user?.permissions?.is_admin || session?.user?.permissions?.can_publish_events) && (
            <button
              onClick={() => setActiveSection("tournaments")}
              style={{
                background: activeSection === "tournaments" ? "rgba(201,168,76,0.08)" : "transparent",
                border: "none",
                color: activeSection === "tournaments" ? gold : textMuted,
                fontFamily: "'Cinzel', serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                padding: "16px 20px",
                cursor: "pointer",
                borderBottom: activeSection === "tournaments" ? `2px solid ${gold}` : "2px solid transparent",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              Torneos
            </button>
          )}
          {(session?.user?.permissions?.is_admin || session?.user?.permissions?.can_edit_rules) && (
            <button
              onClick={() => setActiveSection("rules")}
              style={{
                background: activeSection === "rules" ? "rgba(201,168,76,0.08)" : "transparent",
                border: "none",
                color: activeSection === "rules" ? gold : textMuted,
                fontFamily: "'Cinzel', serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                padding: "16px 20px",
                cursor: "pointer",
                borderBottom: activeSection === "rules" ? `2px solid ${gold}` : "2px solid transparent",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              Reglas
            </button>
          )}
          {(session?.user?.permissions?.is_admin || session?.user?.permissions?.can_manage_permissions) && (
            <button
              onClick={() => setActiveSection("permissions")}
              style={{
                background: activeSection === "permissions" ? "rgba(201,168,76,0.08)" : "transparent",
                border: "none",
                color: activeSection === "permissions" ? gold : textMuted,
                fontFamily: "'Cinzel', serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                padding: "16px 20px",
                cursor: "pointer",
                borderBottom: activeSection === "permissions" ? `2px solid ${gold}` : "2px solid transparent",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              Permisos
            </button>
          )}
        </div>
      </nav>

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
        {activeSection === "info" && session?.user?.permissions?.is_admin && (
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
        )}

        {/* Members */}
        {activeSection === "members" && (session?.user?.permissions?.is_admin || session?.user?.permissions?.can_manage_members) && (() => {
          const ITEMS_PER_PAGE = 10;
          const filteredMembers = members.filter(m =>
            (memberFilter === "todos" || m.level_rank === memberFilter) &&
            (memberSearch === "" || m.name.toLowerCase().includes(memberSearch.toLowerCase()))
          );
          const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
          const startIndex = (membersPage - 1) * ITEMS_PER_PAGE;
          const endIndex = startIndex + ITEMS_PER_PAGE;
          const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

          return (
            <AdminCard title="Miembros del Clan" style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <p style={{ color: textMuted, fontSize: 14 }}>
                    Total: <strong style={{ color: gold }}>{filteredMembers.length}</strong>
                  </p>
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={memberSearch}
                    onChange={(e) => {
                      setMemberSearch(e.target.value);
                      setMembersPage(1);
                    }}
                    style={{
                      padding: "6px 12px",
                      background: bg,
                      border: `1px solid ${darkGold}`,
                      borderRadius: 6,
                      color: textLight,
                      fontSize: 12,
                      minWidth: 180,
                    }}
                  />
                  <select
                    value={memberFilter}
                    onChange={(e) => {
                      setMemberFilter(e.target.value);
                      setMembersPage(1);
                    }}
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
                {paginatedMembers.map((member) => {
                  const hasEmail = !!member.email;
                  const isVerified = member.email_verified;
                  const hasDiscord = !!member.social_discord;
                  const canResendInvite = hasEmail && hasDiscord && !isVerified;
                  const lastLogin = member.last_login_at
                    ? new Date(member.last_login_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Nunca';

                  // Determinar estado general
                  const isComplete = hasEmail && isVerified && hasDiscord;
                  const needsSetup = !hasEmail || !hasDiscord;

                  return (
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
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 200 }}>
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
                          {isComplete && (
                            <span style={{
                              marginLeft: 8,
                              padding: "2px 8px",
                              fontSize: 11,
                              fontWeight: 700,
                              background: "rgba(76, 201, 76, 0.15)",
                              color: "#4CAF50",
                              borderRadius: 4,
                            }}>
                              ✓ Completo
                            </span>
                          )}
                        </p>
                        <p style={{ fontSize: 12, color: textMuted, marginBottom: 4 }}>
                          <strong style={{ color: gold }}>{member.rank}</strong> • {member.main_race || member.race} • MMR: {member.mmr}
                        </p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6, alignItems: "center" }}>
                          {/* Estado de Email */}
                          {hasEmail ? (
                            <span style={{
                              fontSize: 10,
                              padding: "3px 8px",
                              borderRadius: 4,
                              background: isVerified ? "rgba(76, 201, 76, 0.15)" : "rgba(201, 140, 76, 0.15)",
                              color: isVerified ? "#4CAF50" : "#FF9800",
                              fontWeight: 600,
                              border: `1px solid ${isVerified ? "#4CAF50" : "#FF9800"}`,
                            }}>
                              {isVerified ? "✓ Email verificado" : "⏳ Email pendiente"}
                            </span>
                          ) : (
                            <span style={{
                              fontSize: 10,
                              padding: "3px 8px",
                              borderRadius: 4,
                              background: "rgba(201, 76, 76, 0.15)",
                              color: "#f44336",
                              fontWeight: 600,
                              border: "1px solid #f44336",
                            }}>
                              ✗ Sin email
                            </span>
                          )}

                          {/* Estado de Discord */}
                          {hasDiscord ? (
                            <span style={{
                              fontSize: 10,
                              padding: "3px 8px",
                              borderRadius: 4,
                              background: "rgba(76, 201, 76, 0.15)",
                              color: "#4CAF50",
                              fontWeight: 600,
                              border: "1px solid #4CAF50",
                            }}>
                              ✓ Discord: {member.social_discord}
                            </span>
                          ) : (
                            <span style={{
                              fontSize: 10,
                              padding: "3px 8px",
                              borderRadius: 4,
                              background: "rgba(201, 76, 76, 0.15)",
                              color: "#f44336",
                              fontWeight: 600,
                              border: "1px solid #f44336",
                            }}>
                              ✗ Sin Discord
                            </span>
                          )}

                          {/* Último ingreso */}
                          <span style={{ fontSize: 11, color: textMuted }}>
                            •
                          </span>
                          <span style={{ fontSize: 11, color: textMuted }}>
                            Último ingreso: <strong style={{ color: lastLogin === 'Nunca' ? '#f44336' : textLight }}>{lastLogin}</strong>
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {canResendInvite && (
                          <Button
                            variant="secondary"
                            style={{ padding: "6px 12px", fontSize: 10, whiteSpace: "nowrap" }}
                            onClick={async () => {
                              if (confirm(`¿Reenviar invitación a ${member.email}?`)) {
                                try {
                                  const res = await fetch("/api/admin/resend-invite", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ memberId: member.id }),
                                  });
                                  const data = await res.json();
                                  if (res.ok) {
                                    alert(data.message);
                                    loadData();
                                  } else {
                                    alert("Error: " + data.error);
                                  }
                                } catch (err) {
                                  alert("Error al reenviar invitación");
                                }
                              }
                            }}
                          >
                            📧 Resend
                          </Button>
                        )}
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
                  );
                })}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 20 }}>
                  <Button
                    variant="secondary"
                    onClick={() => setMembersPage(membersPage - 1)}
                    disabled={membersPage === 1}
                    style={{ padding: "8px 16px", fontSize: 12 }}
                  >
                    ← Anterior
                  </Button>
                  <span style={{ color: textMuted, fontSize: 13 }}>
                    Página <strong style={{ color: gold }}>{membersPage}</strong> de <strong style={{ color: gold }}>{totalPages}</strong>
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => setMembersPage(membersPage + 1)}
                    disabled={membersPage === totalPages}
                    style={{ padding: "8px 16px", fontSize: 12 }}
                  >
                    Siguiente →
                  </Button>
                </div>
              )}
            </AdminCard>
          );
        })()}

        {/* Posts */}
        {activeSection === "blog" && (session?.user?.permissions?.is_admin || session?.user?.permissions?.can_publish_blog) && (() => {
          const ITEMS_PER_PAGE = 10;
          const filteredPosts = posts.filter(p => postFilter === "Todos" || p.tag === postFilter);
          const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
          const startIndex = (postsPage - 1) * ITEMS_PER_PAGE;
          const endIndex = startIndex + ITEMS_PER_PAGE;
          const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

          return (
            <AdminCard title="Posts del Blog" style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <p style={{ color: textMuted, fontSize: 14 }}>
                    Total: <strong style={{ color: gold }}>{filteredPosts.length}</strong>
                  </p>
                  <select
                    value={postFilter}
                    onChange={(e) => {
                      setPostFilter(e.target.value);
                      setPostsPage(1);
                    }}
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
                {paginatedPosts.map((post) => (
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

              {/* Paginación */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 20 }}>
                  <Button
                    variant="secondary"
                    onClick={() => setPostsPage(postsPage - 1)}
                    disabled={postsPage === 1}
                    style={{ padding: "8px 16px", fontSize: 12 }}
                  >
                    ← Anterior
                  </Button>
                  <span style={{ color: textMuted, fontSize: 13 }}>
                    Página <strong style={{ color: gold }}>{postsPage}</strong> de <strong style={{ color: gold }}>{totalPages}</strong>
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => setPostsPage(postsPage + 1)}
                    disabled={postsPage === totalPages}
                    style={{ padding: "8px 16px", fontSize: 12 }}
                  >
                    Siguiente →
                  </Button>
                </div>
              )}
            </AdminCard>
          );
        })()}

        {/* Videos */}
        {activeSection === "videos" && (session?.user?.permissions?.is_admin || session?.user?.permissions?.can_publish_videos) && (() => {
          const ITEMS_PER_PAGE = 10;
          const filteredVideos = videos.filter(v => v.title.toLowerCase().includes(videoFilter.toLowerCase()));
          const totalPages = Math.ceil(filteredVideos.length / ITEMS_PER_PAGE);
          const startIndex = (videosPage - 1) * ITEMS_PER_PAGE;
          const endIndex = startIndex + ITEMS_PER_PAGE;
          const paginatedVideos = filteredVideos.slice(startIndex, endIndex);

          return (
            <AdminCard title="Videos" style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <p style={{ color: textMuted, fontSize: 14 }}>
                    Total: <strong style={{ color: gold }}>{filteredVideos.length}</strong>
                  </p>
                  <input
                    type="text"
                    placeholder="Buscar video..."
                    value={videoFilter}
                    onChange={(e) => {
                      setVideoFilter(e.target.value);
                      setVideosPage(1);
                    }}
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
                {paginatedVideos.map((video) => (
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

              {/* Paginación */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 20 }}>
                  <Button
                    variant="secondary"
                    onClick={() => setVideosPage(videosPage - 1)}
                    disabled={videosPage === 1}
                    style={{ padding: "8px 16px", fontSize: 12 }}
                  >
                    ← Anterior
                  </Button>
                  <span style={{ color: textMuted, fontSize: 13 }}>
                    Página <strong style={{ color: gold }}>{videosPage}</strong> de <strong style={{ color: gold }}>{totalPages}</strong>
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => setVideosPage(videosPage + 1)}
                    disabled={videosPage === totalPages}
                    style={{ padding: "8px 16px", fontSize: 12 }}
                  >
                    Siguiente →
                  </Button>
                </div>
              )}
            </AdminCard>
          );
        })()}

        {/* Build Orders */}
        {activeSection === "build-orders" && (session?.user?.permissions?.is_admin || session?.user?.permissions?.can_manage_build_orders) && (
          <AdminCard title="Gestión de Build Orders">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ color: textMuted, fontSize: 14 }}>
                Total: <strong style={{ color: gold }}>{buildOrders.length}</strong>
              </p>
              <Button onClick={() => setBuildOrderModal({
                isOpen: true,
                buildOrder: {
                  name: "",
                  race: "Terran",
                  matchups: "",
                  description: "",
                  build_steps: [],
                  video_url: "",
                  difficulty: "Intermedio",
                  tags: []
                }
              })}>
                + Agregar Build Order
              </Button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {buildOrders.map((build) => (
                <div
                  key={build.id}
                  style={{
                    background: bg,
                    border: `1px solid ${darkGold}`,
                    borderRadius: 6,
                    padding: 16,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: gold, fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
                        {build.name}
                      </h4>
                      <div style={{ display: "flex", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                        <span style={{ color: textMuted, fontSize: 12 }}>
                          Raza: <span style={{ color: textLight }}>{build.race}</span>
                        </span>
                        {build.matchups && (
                          <span style={{ color: textMuted, fontSize: 12 }}>
                            Matchups: <span style={{ color: textLight }}>{build.matchups}</span>
                          </span>
                        )}
                        <span style={{ color: textMuted, fontSize: 12 }}>
                          Dificultad: <span style={{ color: textLight }}>{build.difficulty}</span>
                        </span>
                        <span style={{ color: textMuted, fontSize: 12 }}>
                          Pasos: <span style={{ color: textLight }}>{build.build_steps?.length || 0}</span>
                        </span>
                      </div>
                      <p style={{ color: textLight, fontSize: 13, marginBottom: 8, lineHeight: 1.5 }}>
                        {build.description}
                      </p>
                      {build.video_url && (
                        <a
                          href={build.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#7ab8d4", fontSize: 12, textDecoration: "none" }}
                        >
                          Ver video →
                        </a>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginLeft: 16 }}>
                      <Button
                        variant="secondary"
                        style={{ padding: "6px 12px", fontSize: 10 }}
                        onClick={() => setBuildOrderModal({ isOpen: true, buildOrder: build })}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        style={{ padding: "6px 12px", fontSize: 10 }}
                        onClick={() => handleDeleteBuildOrder(build.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        )}

        {/* Events */}
        {activeSection === "events" && (session?.user?.permissions?.is_admin || session?.user?.permissions?.can_publish_events) && (() => {
          const ITEMS_PER_PAGE = 10;
          const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE);
          const startIndex = (eventsPage - 1) * ITEMS_PER_PAGE;
          const endIndex = startIndex + ITEMS_PER_PAGE;
          const paginatedEvents = events.slice(startIndex, endIndex);

          return (
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
                {paginatedEvents.map((event) => (
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

              {/* Paginación */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 20 }}>
                  <Button
                    variant="secondary"
                    onClick={() => setEventsPage(eventsPage - 1)}
                    disabled={eventsPage === 1}
                    style={{ padding: "8px 16px", fontSize: 12 }}
                  >
                    ← Anterior
                  </Button>
                  <span style={{ color: textMuted, fontSize: 13 }}>
                    Página <strong style={{ color: gold }}>{eventsPage}</strong> de <strong style={{ color: gold }}>{totalPages}</strong>
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => setEventsPage(eventsPage + 1)}
                    disabled={eventsPage === totalPages}
                    style={{ padding: "8px 16px", fontSize: 12 }}
                  >
                    Siguiente →
                  </Button>
                </div>
              )}
            </AdminCard>
          );
        })()}

        {/* Torneos de Challonge */}
        {activeSection === "tournaments" && (session?.user?.permissions?.is_admin || session?.user?.permissions?.can_publish_events) && (
          <AdminCard title="Gestión de Torneos (Challonge)">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ color: textMuted, fontSize: 14 }}>
                Total: <strong style={{ color: gold }}>{tournaments.length}</strong>
              </p>
              <Button onClick={() => setTournamentModal({
                isOpen: true,
                tournament: {
                  name: "",
                  url: "",
                  tournament_type: "single elimination",
                  description: "",
                  open_signup: false
                }
              })}>
                + Crear Torneo
              </Button>
            </div>

            <div style={{ marginBottom: 16, padding: 12, background: "rgba(201,168,76,0.05)", borderRadius: 6 }}>
              <p style={{ fontSize: 12, color: textMuted, margin: 0 }}>
                <strong>💡 Sobre Challonge:</strong> Los torneos se crean en Challonge.com y se sincronizan aquí.
                Podrás compartir el enlace del torneo con los participantes.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {tournaments.map((t) => {
                const tournament = t.tournament;
                const stateColors = {
                  pending: { bg: "rgba(201,168,76,0.1)", text: gold },
                  underway: { bg: "rgba(76,201,130,0.1)", text: "#4cc982" },
                  awaiting_review: { bg: "rgba(100,160,200,0.1)", text: "#7ab8d4" },
                  complete: { bg: "rgba(139,92,92,0.1)", text: "#c9a08a" }
                };
                const stateColor = stateColors[tournament.state] || stateColors.pending;
                const stateLabels = {
                  pending: "Pendiente",
                  underway: "En Curso",
                  awaiting_review: "En Revisión",
                  complete: "Completado"
                };

                return (
                  <div
                    key={tournament.id}
                    style={{
                      background: bg,
                      border: `1px solid ${darkGold}`,
                      borderRadius: 6,
                      padding: 16,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: gold, fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
                          {tournament.name}
                        </h4>
                        <div style={{ display: "flex", gap: 12, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
                          <span style={{
                            fontSize: 11,
                            padding: "4px 8px",
                            borderRadius: 4,
                            background: stateColor.bg,
                            color: stateColor.text,
                            fontWeight: 600,
                            textTransform: "uppercase"
                          }}>
                            {stateLabels[tournament.state] || tournament.state}
                          </span>
                          <span style={{ color: textMuted, fontSize: 12 }}>
                            Tipo: <span style={{ color: textLight }}>{tournament.tournament_type}</span>
                          </span>
                          <span style={{ color: textMuted, fontSize: 12 }}>
                            Participantes: <span style={{ color: textLight }}>{tournament.participants_count || 0}</span>
                          </span>
                        </div>
                        {tournament.description && (
                          <p style={{ color: textLight, fontSize: 13, marginBottom: 8, lineHeight: 1.5 }}>
                            {tournament.description}
                          </p>
                        )}
                        <a
                          href={tournament.full_challonge_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#7ab8d4", fontSize: 12, textDecoration: "none" }}
                        >
                          Ver en Challonge →
                        </a>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {tournament.state === 'pending' && (
                          <Button
                            variant="secondary"
                            style={{ padding: "6px 12px", fontSize: 10, whiteSpace: "nowrap" }}
                            onClick={() => handleStartTournament(tournament.id)}
                          >
                            Iniciar
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          style={{ padding: "6px 12px", fontSize: 10 }}
                          onClick={() => handleDeleteTournament(tournament.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {tournaments.length === 0 && (
                <div style={{ textAlign: "center", padding: 40, color: textMuted }}>
                  <p style={{ fontSize: 14 }}>No hay torneos creados aún.</p>
                  <p style={{ fontSize: 12, marginTop: 8 }}>Crea tu primer torneo en Challonge usando el botón de arriba.</p>
                </div>
              )}
            </div>
          </AdminCard>
        )}

        {/* Permisos de Usuarios */}
        {activeSection === "permissions" && (session?.user?.permissions?.is_admin || session?.user?.permissions?.can_manage_permissions) && (() => {
          const ITEMS_PER_PAGE = 10;
          const totalPages = Math.ceil(permissions.length / ITEMS_PER_PAGE);
          const startIndex = (permissionsPage - 1) * ITEMS_PER_PAGE;
          const endIndex = startIndex + ITEMS_PER_PAGE;
          const paginatedPermissions = permissions.slice(startIndex, endIndex);

          return (
            <AdminCard title="Usuarios y Permisos" style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                <p style={{ color: textMuted, fontSize: 14 }}>
                  Gestiona quién puede acceder al sitio y sus permisos. Total: <strong style={{ color: gold }}>{permissions.length}</strong>
                </p>
                <Button onClick={() => setDiscordUserModal({ isOpen: true, selectedMemberId: null })}>
                  + Agregar Usuario
                </Button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${darkGold}` }}>
                      <th style={{ padding: "12px 8px", textAlign: "left", color: gold, fontWeight: 600 }}>Usuario</th>
                      <th style={{ padding: "12px 8px", textAlign: "center", color: gold, fontWeight: 600 }}>Admin</th>
                      <th style={{ padding: "12px 8px", textAlign: "center", color: gold, fontWeight: 600 }}>Blog</th>
                      <th style={{ padding: "12px 8px", textAlign: "center", color: gold, fontWeight: 600 }}>Videos</th>
                      <th style={{ padding: "12px 8px", textAlign: "center", color: gold, fontWeight: 600 }}>Builds</th>
                      <th style={{ padding: "12px 8px", textAlign: "center", color: gold, fontWeight: 600 }}>Eventos</th>
                      <th style={{ padding: "12px 8px", textAlign: "center", color: gold, fontWeight: 600 }}>Reglas</th>
                      <th style={{ padding: "12px 8px", textAlign: "center", color: gold, fontWeight: 600 }}>Miembros</th>
                      <th style={{ padding: "12px 8px", textAlign: "center", color: gold, fontWeight: 600 }}>Permisos</th>
                      <th style={{ padding: "12px 8px", textAlign: "center", color: gold, fontWeight: 600 }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPermissions.map((user) => (
                    <tr key={user.discord_id} style={{ borderBottom: `1px solid ${darkGold}` }}>
                      <td style={{ padding: "12px 8px", color: textLight }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{user.discord_username}</div>
                          {(user.member_name || user.email) && (
                            <div style={{ fontSize: 11, color: textMuted }}>
                              {user.member_name && user.member_name}
                              {user.member_name && user.email && ' • '}
                              {user.email && user.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={user.is_admin}
                          onChange={() => handleTogglePermission(user, "is_admin", user.is_admin)}
                          style={{ cursor: "pointer", transform: "scale(1.2)" }}
                        />
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={user.is_admin || user.can_publish_blog}
                          onChange={() => handleTogglePermission(user, "can_publish_blog", user.can_publish_blog)}
                          disabled={user.is_admin}
                          style={{ cursor: user.is_admin ? "not-allowed" : "pointer", transform: "scale(1.2)", opacity: user.is_admin ? 0.5 : 1 }}
                        />
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={user.is_admin || user.can_publish_videos}
                          onChange={() => handleTogglePermission(user, "can_publish_videos", user.can_publish_videos)}
                          disabled={user.is_admin}
                          style={{ cursor: user.is_admin ? "not-allowed" : "pointer", transform: "scale(1.2)", opacity: user.is_admin ? 0.5 : 1 }}
                        />
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={user.is_admin || user.can_manage_build_orders}
                          onChange={() => handleTogglePermission(user, "can_manage_build_orders", user.can_manage_build_orders)}
                          disabled={user.is_admin}
                          style={{ cursor: user.is_admin ? "not-allowed" : "pointer", transform: "scale(1.2)", opacity: user.is_admin ? 0.5 : 1 }}
                        />
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={user.is_admin || user.can_publish_events}
                          onChange={() => handleTogglePermission(user, "can_publish_events", user.can_publish_events)}
                          disabled={user.is_admin}
                          style={{ cursor: user.is_admin ? "not-allowed" : "pointer", transform: "scale(1.2)", opacity: user.is_admin ? 0.5 : 1 }}
                        />
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={user.is_admin || user.can_edit_rules}
                          onChange={() => handleTogglePermission(user, "can_edit_rules", user.can_edit_rules)}
                          disabled={user.is_admin}
                          style={{ cursor: user.is_admin ? "not-allowed" : "pointer", transform: "scale(1.2)", opacity: user.is_admin ? 0.5 : 1 }}
                        />
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={user.is_admin || user.can_manage_members}
                          onChange={() => handleTogglePermission(user, "can_manage_members", user.can_manage_members)}
                          disabled={user.is_admin}
                          style={{ cursor: user.is_admin ? "not-allowed" : "pointer", transform: "scale(1.2)", opacity: user.is_admin ? 0.5 : 1 }}
                        />
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={user.is_admin || user.can_manage_permissions}
                          onChange={() => handleTogglePermission(user, "can_manage_permissions", user.can_manage_permissions)}
                          disabled={user.is_admin}
                          style={{ cursor: user.is_admin ? "not-allowed" : "pointer", transform: "scale(1.2)", opacity: user.is_admin ? 0.5 : 1 }}
                        />
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>
                        <Button
                          variant="danger"
                          style={{ padding: "4px 8px", fontSize: 10 }}
                          onClick={() => handleDeleteUser(user)}
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 20 }}>
                  <Button
                    variant="secondary"
                    onClick={() => setPermissionsPage(permissionsPage - 1)}
                    disabled={permissionsPage === 1}
                    style={{ padding: "8px 16px", fontSize: 12 }}
                  >
                    ← Anterior
                  </Button>
                  <span style={{ color: textMuted, fontSize: 13 }}>
                    Página <strong style={{ color: gold }}>{permissionsPage}</strong> de <strong style={{ color: gold }}>{totalPages}</strong>
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => setPermissionsPage(permissionsPage + 1)}
                    disabled={permissionsPage === totalPages}
                    style={{ padding: "8px 16px", fontSize: 12 }}
                  >
                    Siguiente →
                  </Button>
                </div>
              )}

              <div style={{ marginTop: 16, padding: "12px", background: "rgba(201,168,76,0.05)", borderRadius: 6 }}>
                <p style={{ fontSize: 12, color: textMuted, margin: 0 }}>
                  <strong>💡 Nota:</strong> Los administradores tienen acceso completo a todas las funciones automáticamente.
                  Los permisos granulares solo aplican a usuarios no-admin. Al agregar un nuevo usuario, se le otorgará acceso al sitio
                  sin permisos (deberás asignarlos manualmente).
                </p>
              </div>
            </AdminCard>
          );
        })()}

        {/* Reglas del Clan */}
        {activeSection === "rules" && (session?.user?.permissions?.is_admin || session?.user?.permissions?.can_edit_rules) && (() => {
          const ITEMS_PER_PAGE = 10;
          const totalPages = Math.ceil(rules.length / ITEMS_PER_PAGE);
          const startIndex = (rulesPage - 1) * ITEMS_PER_PAGE;
          const endIndex = startIndex + ITEMS_PER_PAGE;
          const paginatedRules = rules.slice(startIndex, endIndex);

          return (
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
                {paginatedRules.map((rule) => (
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

              {/* Paginación */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 20 }}>
                  <Button
                    variant="secondary"
                    onClick={() => setRulesPage(rulesPage - 1)}
                    disabled={rulesPage === 1}
                    style={{ padding: "8px 16px", fontSize: 12 }}
                  >
                    ← Anterior
                  </Button>
                  <span style={{ color: textMuted, fontSize: 13 }}>
                    Página <strong style={{ color: gold }}>{rulesPage}</strong> de <strong style={{ color: gold }}>{totalPages}</strong>
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => setRulesPage(rulesPage + 1)}
                    disabled={rulesPage === totalPages}
                    style={{ padding: "8px 16px", fontSize: 12 }}
                  >
                    Siguiente →
                  </Button>
                </div>
              )}
            </AdminCard>
          );
        })()}
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

        <h4 style={{ color: gold, fontSize: 14, marginTop: 10, marginBottom: 10 }}>Niveles por Raza</h4>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Select
            label="Protoss"
            value={memberModal.member?.protoss_level || "-"}
            onChange={(val) => setMemberModal({ ...memberModal, member: { ...memberModal.member, protoss_level: val } })}
            options={["-", "S", "A+", "A", "B+", "B", "C+", "C", "D+", "D"]}
          />
          <Select
            label="Terran"
            value={memberModal.member?.terran_level || "-"}
            onChange={(val) => setMemberModal({ ...memberModal, member: { ...memberModal.member, terran_level: val } })}
            options={["-", "S", "A+", "A", "B+", "B", "C+", "C", "D+", "D"]}
          />
          <Select
            label="Zerg"
            value={memberModal.member?.zerg_level || "-"}
            onChange={(val) => setMemberModal({ ...memberModal, member: { ...memberModal.member, zerg_level: val } })}
            options={["-", "S", "A+", "A", "B+", "B", "C+", "C", "D+", "D"]}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Select
            label="Nivel General"
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

        <Input
          label="Email"
          type="email"
          value={memberModal.member?.email || ""}
          onChange={(val) => setMemberModal({ ...memberModal, member: { ...memberModal.member, email: val } })}
          placeholder="correo@ejemplo.com"
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
        <Input
          label="YouTube"
          value={memberModal.member?.social_youtube || ""}
          onChange={(val) => setMemberModal({ ...memberModal, member: { ...memberModal.member, social_youtube: val } })}
          placeholder="https://youtube.com/@canal"
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

      {/* Discord User Modal */}
      <Modal
        isOpen={discordUserModal.isOpen}
        onClose={() => setDiscordUserModal({ isOpen: false, selectedMemberId: null })}
        title="Agregar Usuario"
      >
        <div style={{ marginBottom: 20, padding: 12, background: "rgba(201,168,76,0.05)", borderRadius: 6 }}>
          <p style={{ fontSize: 12, color: textMuted, margin: 0 }}>
            <strong>💡 Selecciona un miembro</strong> que tiene Discord configurado para darle acceso al sitio.
          </p>
        </div>

        <Select
          label="Miembro"
          value={discordUserModal.selectedMemberId || ""}
          onChange={(val) => setDiscordUserModal({ ...discordUserModal, selectedMemberId: val })}
          options={[
            "-- Seleccionar miembro --",
            ...members
              .filter(m => {
                // Tiene discord configurado
                if (!m.social_discord) return false;
                // No está ya autorizado (buscar por username en vez de discord_id)
                const alreadyAuthorized = permissions.find(p =>
                  p.discord_username === m.social_discord ||
                  p.discord_username === m.name
                );
                return !alreadyAuthorized;
              })
              .map(m => `${m.id}:${m.name} (${m.social_discord})`)
          ]}
        />

        {members.filter(m => {
          if (!m.social_discord) return false;
          const alreadyAuthorized = permissions.find(p =>
            p.discord_username === m.social_discord ||
            p.discord_username === m.name
          );
          return !alreadyAuthorized;
        }).length === 0 && (
          <p style={{ fontSize: 12, color: textMuted, marginTop: 12, fontStyle: "italic" }}>
            No hay miembros disponibles. Todos los miembros con Discord ya tienen acceso, o ningún miembro tiene Discord configurado.
          </p>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <Button
            onClick={handleSaveDiscordUser}
            loading={loading}
            disabled={!discordUserModal.selectedMemberId || discordUserModal.selectedMemberId === "-- Seleccionar miembro --"}
            style={{ flex: 1 }}
          >
            Agregar
          </Button>
          <Button variant="secondary" onClick={() => setDiscordUserModal({ isOpen: false, selectedMemberId: null })} style={{ flex: 1 }}>
            Cancelar
          </Button>
        </div>
      </Modal>

      {/* Build Order Modal */}
      <Modal
        isOpen={buildOrderModal.isOpen}
        onClose={() => setBuildOrderModal({ isOpen: false, buildOrder: null })}
        title={buildOrderModal.buildOrder?.id ? "Editar Build Order" : "Agregar Build Order"}
      >
        <Input
          label="Nombre del Build"
          value={buildOrderModal.buildOrder?.name || ""}
          onChange={(val) => setBuildOrderModal({ ...buildOrderModal, buildOrder: { ...buildOrderModal.buildOrder, name: val } })}
          placeholder="Ej: Terran FD into Valks"
        />
        <Select
          label="Raza"
          value={buildOrderModal.buildOrder?.race || "Terran"}
          onChange={(val) => setBuildOrderModal({ ...buildOrderModal, buildOrder: { ...buildOrderModal.buildOrder, race: val } })}
          options={["Terran", "Protoss", "Zerg"]}
        />
        <Input
          label="Matchups"
          value={buildOrderModal.buildOrder?.matchups || ""}
          onChange={(val) => setBuildOrderModal({ ...buildOrderModal, buildOrder: { ...buildOrderModal.buildOrder, matchups: val } })}
          placeholder="Ej: TvP, TvZ"
        />
        <Input
          label="Descripción"
          textarea
          value={buildOrderModal.buildOrder?.description || ""}
          onChange={(val) => setBuildOrderModal({ ...buildOrderModal, buildOrder: { ...buildOrderModal.buildOrder, description: val } })}
          placeholder="Descripción del build order"
        />
        <Select
          label="Dificultad"
          value={buildOrderModal.buildOrder?.difficulty || "Intermedio"}
          onChange={(val) => setBuildOrderModal({ ...buildOrderModal, buildOrder: { ...buildOrderModal.buildOrder, difficulty: val } })}
          options={["Fácil", "Intermedio", "Difícil", "Avanzado"]}
        />
        <Input
          label="URL del Video (opcional)"
          value={buildOrderModal.buildOrder?.video_url || ""}
          onChange={(val) => setBuildOrderModal({ ...buildOrderModal, buildOrder: { ...buildOrderModal.buildOrder, video_url: val } })}
          placeholder="https://youtube.com/..."
        />
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            color: textMuted,
            marginBottom: 6,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}>
            Build Steps (JSON)
          </label>
          <textarea
            value={JSON.stringify(buildOrderModal.buildOrder?.build_steps || [], null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setBuildOrderModal({
                  ...buildOrderModal,
                  buildOrder: { ...buildOrderModal.buildOrder, build_steps: parsed }
                });
              } catch (err) {
                // Invalid JSON, update anyway to allow editing
                setBuildOrderModal({
                  ...buildOrderModal,
                  buildOrder: { ...buildOrderModal.buildOrder, build_steps: e.target.value }
                });
              }
            }}
            placeholder='[{"supply": 8, "action": "Scout"}, ...]'
            style={{
              width: "100%",
              padding: "10px 14px",
              background: bg,
              border: `1px solid ${darkGold}`,
              borderRadius: 6,
              color: textLight,
              fontSize: 12,
              fontFamily: "monospace",
              minHeight: 200,
              resize: "vertical",
            }}
          />
          <p style={{ fontSize: 11, color: textMuted, marginTop: 6, fontStyle: "italic" }}>
            Formato: [{"{"}"supply": 8, "action": "Scout"{"}"}]
            <br />
            También puedes usar scripts en /scripts para gestionar builds complejos
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <Button onClick={handleSaveBuildOrder} loading={loading} style={{ flex: 1 }}>
            Guardar
          </Button>
          <Button variant="secondary" onClick={() => setBuildOrderModal({ isOpen: false, buildOrder: null })} style={{ flex: 1 }}>
            Cancelar
          </Button>
        </div>
      </Modal>

      {/* Tournament Modal */}
      <Modal
        isOpen={tournamentModal.isOpen}
        onClose={() => setTournamentModal({ isOpen: false, tournament: null })}
        title="Crear Torneo en Challonge"
      >
        <Input
          label="Nombre del Torneo"
          value={tournamentModal.tournament?.name || ""}
          onChange={(val) => setTournamentModal({ ...tournamentModal, tournament: { ...tournamentModal.tournament, name: val } })}
          placeholder="Ej: Copa MAFIA 2025"
        />
        <Input
          label="URL Única (challonge.com/lvalencia1286/...)"
          value={tournamentModal.tournament?.url || ""}
          onChange={(val) => setTournamentModal({ ...tournamentModal, tournament: { ...tournamentModal.tournament, url: val } })}
          placeholder="Ej: copa-mafia-2025"
        />
        <Select
          label="Tipo de Torneo"
          value={tournamentModal.tournament?.tournament_type || "single elimination"}
          onChange={(val) => setTournamentModal({ ...tournamentModal, tournament: { ...tournamentModal.tournament, tournament_type: val } })}
          options={[
            "single elimination",
            "double elimination",
            "round robin",
            "swiss"
          ]}
        />
        <Input
          label="Descripción (opcional)"
          textarea
          value={tournamentModal.tournament?.description || ""}
          onChange={(val) => setTournamentModal({ ...tournamentModal, tournament: { ...tournamentModal.tournament, description: val } })}
          placeholder="Descripción del torneo"
        />
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: textMuted,
            cursor: "pointer"
          }}>
            <input
              type="checkbox"
              checked={tournamentModal.tournament?.open_signup || false}
              onChange={(e) => setTournamentModal({
                ...tournamentModal,
                tournament: { ...tournamentModal.tournament, open_signup: e.target.checked }
              })}
              style={{ cursor: "pointer" }}
            />
            Permitir registro público
          </label>
        </div>
        <div style={{ marginBottom: 16, padding: 12, background: "rgba(201,168,76,0.05)", borderRadius: 6 }}>
          <p style={{ fontSize: 11, color: textMuted, margin: 0, lineHeight: 1.5 }}>
            <strong>Nota:</strong> El torneo se creará en Challonge.com bajo tu cuenta.
            Podrás gestionar participantes y resultados desde Challonge o este panel.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <Button onClick={handleSaveTournament} loading={loading} style={{ flex: 1 }}>
            Crear en Challonge
          </Button>
          <Button variant="secondary" onClick={() => setTournamentModal({ isOpen: false, tournament: null })} style={{ flex: 1 }}>
            Cancelar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
