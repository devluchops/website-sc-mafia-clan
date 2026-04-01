"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { SocialIcons } from "@/components/SocialIcons";

const gold = "#c9a84c";
const darkGold = "#3d3525";
const cardBg = "#252220";
const textMuted = "#8b7b5e";
const textLight = "#e8dcc0";
const bg = "#1e1b18";

// ============================================================
// HELPER FUNCTIONS
// ============================================================

// Estilo mejorado para todos los selects/comboboxes
const getSelectStyle = (customStyle = {}) => ({
  width: "100%",
  padding: "10px 36px 10px 14px",
  background: `linear-gradient(180deg, ${bg} 0%, #16130f 100%)`,
  border: `1.5px solid ${darkGold}`,
  borderRadius: 6,
  color: textLight,
  fontSize: 14,
  fontFamily: "inherit",
  cursor: "pointer",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23c9a84c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  transition: "all 0.2s ease",
  outline: "none",
  ...customStyle,
});

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
        style={getSelectStyle()}
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

function Modal({ isOpen, onClose, title, children, zIndex = 1000 }) {
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
        zIndex: zIndex,
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
// AUDIT LOG COMPONENT
// ============================================================

function AuditLogSection() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: "",
    table_name: "",
    actor: "",
    startDate: "",
    endDate: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [filters, page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== "")),
      });

      const res = await fetch(`/api/admin/audit-logs?${params}`);
      const data = await res.json();

      setLogs(data.logs || []);
      setTotalPages(data.totalPages || 1);
      setTotalLogs(data.totalLogs || 0);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    const colors = {
      CREATE: "rgba(76, 175, 80, 0.2)",
      UPDATE: "rgba(33, 150, 243, 0.2)",
      DELETE: "rgba(244, 67, 54, 0.2)",
      LOGIN: "rgba(76, 175, 80, 0.2)",
      LOGOUT: "rgba(158, 158, 158, 0.2)",
      LOGIN_FAILED: "rgba(244, 67, 54, 0.2)",
    };
    return colors[action] || "rgba(201, 168, 76, 0.2)";
  };

  const thStyle = {
    padding: "12px 16px",
    textAlign: "left",
    color: gold,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: 600,
  };

  const tdStyle = {
    padding: "12px 16px",
    color: textLight,
    fontSize: 13,
  };

  return (
    <AdminCard title="Audit Log" style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 16, color: textMuted, fontSize: 13 }}>
        Total de eventos: <strong style={{ color: gold }}>{totalLogs}</strong>
      </div>

      {/* Filtros */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div>
          <label style={{ display: "block", fontSize: 11, color: textMuted, marginBottom: 4, textTransform: "uppercase" }}>
            Acción
          </label>
          <select
            value={filters.action}
            onChange={(e) => {
              setFilters({ ...filters, action: e.target.value });
              setPage(1);
            }}
            style={getSelectStyle()}
          >
            <option value="">Todas las acciones</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGOUT">LOGOUT</option>
            <option value="LOGIN_FAILED">LOGIN_FAILED</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 11, color: textMuted, marginBottom: 4, textTransform: "uppercase" }}>
            Recurso
          </label>
          <select
            value={filters.table_name}
            onChange={(e) => {
              setFilters({ ...filters, table_name: e.target.value });
              setPage(1);
            }}
            style={getSelectStyle()}
          >
            <option value="">Todos los recursos</option>
            <option value="posts">Posts</option>
            <option value="videos">Videos</option>
            <option value="events">Events</option>
            <option value="members">Members</option>
            <option value="user_permissions">Permissions</option>
            <option value="tournaments">Tournaments</option>
            <option value="build_orders">Build Orders</option>
            <option value="clan_rules">Rules</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 11, color: textMuted, marginBottom: 4, textTransform: "uppercase" }}>
            Usuario
          </label>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={filters.actor}
            onChange={(e) => {
              setFilters({ ...filters, actor: e.target.value });
              setPage(1);
            }}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: bg,
              border: `1px solid ${darkGold}`,
              borderRadius: 6,
              color: textLight,
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 11, color: textMuted, marginBottom: 4, textTransform: "uppercase" }}>
            Fecha Inicio
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => {
              setFilters({ ...filters, startDate: e.target.value });
              setPage(1);
            }}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: bg,
              border: `1px solid ${darkGold}`,
              borderRadius: 6,
              color: textLight,
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 11, color: textMuted, marginBottom: 4, textTransform: "uppercase" }}>
            Fecha Fin
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => {
              setFilters({ ...filters, endDate: e.target.value });
              setPage(1);
            }}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: bg,
              border: `1px solid ${darkGold}`,
              borderRadius: 6,
              color: textLight,
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Tabla de logs */}
      {loading ? (
        <div style={{ color: textMuted, textAlign: "center", padding: 40 }}>
          Cargando logs...
        </div>
      ) : logs.length === 0 ? (
        <div style={{ color: textMuted, textAlign: "center", padding: 40 }}>
          No se encontraron eventos con los filtros seleccionados.
        </div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${darkGold}` }}>
                  <th style={thStyle}>Fecha</th>
                  <th style={thStyle}>Acción</th>
                  <th style={thStyle}>Recurso</th>
                  <th style={thStyle}>Actor</th>
                  <th style={thStyle}>Cambios</th>
                  <th style={thStyle}>IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: `1px solid rgba(61,53,37,0.3)` }}>
                    <td style={tdStyle}>
                      {new Date(log.created_at).toLocaleString("es-PE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "America/Lima",
                      })}
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        background: getActionColor(log.action),
                        fontWeight: 600,
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {log.table_name ? (
                        <div>
                          <div style={{ fontWeight: 600 }}>{log.table_name}</div>
                          {log.record_id && <div style={{ fontSize: 11, color: textMuted }}>#{log.record_id}</div>}
                        </div>
                      ) : (
                        <span style={{ color: textMuted, fontStyle: "italic" }}>Session</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <div>{log.actor_discord_username || "Unknown"}</div>
                      {log.is_admin && <div style={{ fontSize: 10, color: gold }}>⭐ Admin</div>}
                      {log.permission_used && !log.is_admin && (
                        <div style={{ fontSize: 10, color: textMuted }}>{log.permission_used}</div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {log.changes && JSON.parse(log.changes) && Object.keys(JSON.parse(log.changes)).length > 0 ? (
                        <details>
                          <summary style={{ cursor: "pointer", color: gold, fontSize: 12 }}>
                            {Object.keys(JSON.parse(log.changes)).length} campos modificados
                          </summary>
                          <pre style={{
                            fontSize: 10,
                            marginTop: 8,
                            background: bg,
                            padding: 8,
                            borderRadius: 4,
                            color: textLight,
                            maxWidth: 300,
                            overflow: "auto",
                          }}>
                            {JSON.stringify(JSON.parse(log.changes), null, 2)}
                          </pre>
                        </details>
                      ) : log.action === "CREATE" && log.new_values ? (
                        <span style={{ color: textMuted, fontSize: 11 }}>Nuevo registro</span>
                      ) : log.action === "DELETE" && log.old_values ? (
                        <span style={{ color: textMuted, fontSize: 11 }}>Registro eliminado</span>
                      ) : (
                        <span style={{ color: textMuted, fontSize: 11 }}>-</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {log.ip_address ? (
                        <span style={{ fontSize: 11, fontFamily: "monospace" }}>{log.ip_address}</span>
                      ) : (
                        <span style={{ color: textMuted }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 24 }}>
              <Button
                variant="secondary"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                style={{ padding: "8px 16px", fontSize: 12 }}
              >
                ← Anterior
              </Button>
              <span style={{ color: textLight, fontSize: 13 }}>
                Página {page} de {totalPages}
              </span>
              <Button
                variant="secondary"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                style={{ padding: "8px 16px", fontSize: 12 }}
              >
                Siguiente →
              </Button>
            </div>
          )}
        </>
      )}
    </AdminCard>
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
  const [subscribers, setSubscribers] = useState([]);
  const [subscriberStats, setSubscriberStats] = useState(null);

  // Modal states
  const [memberModal, setMemberModal] = useState({ isOpen: false, member: null });
  const [postModal, setPostModal] = useState({ isOpen: false, post: null });
  const [videoModal, setVideoModal] = useState({ isOpen: false, video: null });
  const [eventModal, setEventModal] = useState({ isOpen: false, event: null });
  const [ruleModal, setRuleModal] = useState({ isOpen: false, rule: null });
  const [buildOrderModal, setBuildOrderModal] = useState({ isOpen: false, buildOrder: null });
  const [tournamentModal, setTournamentModal] = useState({ isOpen: false, tournament: null });
  const [participantModal, setParticipantModal] = useState({ isOpen: false, tournamentId: null, participant: null });
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [bracketRefreshKey, setBracketRefreshKey] = useState(0);
  const [tournamentMatches, setTournamentMatches] = useState([]);
  const [matchModal, setMatchModal] = useState({ isOpen: false, match: null, tournamentId: null });
  const [discordUserModal, setDiscordUserModal] = useState({ isOpen: false, user: null });

  // Member expansion state
  const [expandedMember, setExpandedMember] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const [logoFile, setLogoFile] = useState(null);
  const [postImageFile, setPostImageFile] = useState(null);
  const [memberFilter, setMemberFilter] = useState("todos");
  const [memberSearch, setMemberSearch] = useState("");
  const [videoFilter, setVideoFilter] = useState("");
  const [postFilter, setPostFilter] = useState("Todos");
  const [eventFilter, setEventFilter] = useState("Todos");
  const [activeSection, setActiveSection] = useState(() => {
    // Leer el hash de la URL al cargar
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      return hash || "info";
    }
    return "info";
  });
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

  // Set initial active section based on permissions (only if no hash in URL)
  useEffect(() => {
    if (session?.user?.permissions) {
      // Solo establecer sección por defecto si NO hay hash en la URL
      const hash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
      if (hash) return; // Si hay hash, no sobrescribir

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

  // Actualizar hash cuando cambia activeSection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.hash = activeSection;
    }
  }, [activeSection]);

  useEffect(() => {
    if (!session) return;
    loadData();
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
      .then((data) => setPosts(Array.isArray(data) ? data : []))
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

    // Cargar suscriptores
    fetch("/api/admin/subscribers")
      .then((res) => res.json())
      .then((data) => {
        setSubscribers(data.subscribers || []);
        setSubscriberStats(data.stats || null);
      })
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

  const handleStartEdit = (member) => {
    setEditingMember(member.id);
    setEditFormData({ ...member });
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    setEditFormData({});
  };

  const handleSaveInlineEdit = async () => {
    setLoading(true);
    try {
      // Asegurar que las fechas estén en formato correcto (YYYY-MM-DD) o null
      const dataToSend = {
        ...editFormData,
        birth_date: editFormData.birth_date || null,
        join_date: editFormData.join_date || null,
      };

      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (res.ok) {
        showMessage("✅ Miembro actualizado correctamente");
        setEditingMember(null);
        setEditFormData({});
        loadData();
      } else {
        const errorData = await res.json();
        console.error("Error del servidor:", errorData);
        showMessage("❌ Error al actualizar miembro: " + (errorData.error || "Error desconocido"));
      }
    } catch (error) {
      console.error("Error en handleSaveInlineEdit:", error);
      showMessage("❌ Error: " + error.message);
    }
    setLoading(false);
  };

  const updateEditField = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  // Helper function to safely parse dates for DatePicker
  const safeParseDate = (dateString) => {
    if (!dateString) return null;

    try {
      // Remove any time component if present
      const dateOnly = dateString.split('T')[0];

      // Validate format YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
        console.warn('Invalid date format:', dateString);
        return null;
      }

      // Create date object with explicit time to avoid timezone issues
      const date = new Date(dateOnly + 'T00:00:00');

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date value:', dateString);
        return null;
      }

      return date;
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return null;
    }
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
        const savedPost = await res.json();

        // Enviar notificaciones a suscriptores (solo para posts nuevos)
        if (!postModal.post?.id) {
          try {
            const notifyRes = await fetch("/api/admin/notify-subscribers", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ postId: savedPost.id }),
            });

            if (notifyRes.ok) {
              const notifyData = await notifyRes.json();
              showMessage(`✅ Post guardado y ${notifyData.message}`);
            } else {
              showMessage("✅ Post guardado (error al enviar notificaciones)");
            }
          } catch (error) {
            showMessage("✅ Post guardado (error al enviar notificaciones)");
            console.error("Error enviando notificaciones:", error);
          }
        } else {
          showMessage("✅ Post actualizado correctamente");
        }

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

  const handleToggleSubscriber = async (subscriber) => {
    const action = subscriber.is_active ? "desactivar" : "activar";
    if (!confirm(`¿Estás seguro de ${action} este suscriptor?`)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/subscribers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: subscriber.id,
          is_active: !subscriber.is_active
        }),
      });
      if (res.ok) {
        showMessage(`✅ Suscriptor ${subscriber.is_active ? "desactivado" : "activado"}`);
        loadData();
      } else {
        showMessage("❌ Error al actualizar");
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

        // Recargar torneos inmediatamente
        fetch("/api/admin/tournaments")
          .then((res) => res.json())
          .then((data) => setTournaments(data || []))
          .catch((err) => console.error(err));
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

  const handleAddParticipant = async () => {
    setLoading(true);
    try {
      const { tournamentId, participant } = participantModal;

      if (!participant.name || participant.name.trim() === "") {
        showMessage("❌ El nombre del participante es requerido");
        setLoading(false);
        return;
      }

      // Validar duplicados
      if (selectedTournament?.tournament?.participants) {
        const exists = selectedTournament.tournament.participants.some(
          p => p.participant.name.toLowerCase() === participant.name.trim().toLowerCase()
        );
        if (exists) {
          showMessage("❌ Ya existe un participante con ese nombre");
          setLoading(false);
          return;
        }
      }

      const res = await fetch("/api/admin/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: 'add_participant',
          tournamentId,
          participant: {
            name: participant.name,
            seed: participant.seed || null,
            misc: participant.misc || null
          }
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showMessage("✅ Participante agregado correctamente");
        setParticipantModal({ isOpen: false, tournamentId: null, participant: null });
        // Recargar el torneo seleccionado si existe
        if (selectedTournament?.tournament?.id) {
          loadTournamentDetails(selectedTournament.tournament.id);
        }
      } else {
        showMessage("❌ " + (data.error || "Error al agregar participante"));
      }
    } catch (error) {
      showMessage("❌ Error: " + error.message);
    }
    setLoading(false);
  };

  const handleDeleteParticipant = async (tournamentId, participantId, participantName) => {
    if (!confirm(`¿Eliminar a ${participantName} del torneo?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: 'delete_participant',
          tournamentId,
          participantId
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showMessage("✅ Participante eliminado correctamente");
        // Recargar el torneo seleccionado
        if (selectedTournament?.tournament?.id) {
          loadTournamentDetails(selectedTournament.tournament.id);
        }
      } else {
        showMessage("❌ " + (data.error || "Error al eliminar participante"));
      }
    } catch (error) {
      showMessage("❌ Error: " + error.message);
    }
    setLoading(false);
  };

  const loadTournamentDetails = async (tournamentId) => {
    try {
      const res = await fetch(`/api/admin/tournaments?id=${tournamentId}`);
      const data = await res.json();
      setSelectedTournament(data);
      setBracketRefreshKey(prev => prev + 1); // Forzar refresh del iframe

      // También cargar los matches si el torneo está en curso
      if (data.tournament?.state === 'underway' || data.tournament?.state === 'awaiting_review') {
        const matchesRes = await fetch(`/api/admin/tournaments?id=${tournamentId}&matches=true`);
        const matchesData = await matchesRes.json();
        setTournamentMatches(matchesData);
      } else {
        setTournamentMatches([]);
      }
    } catch (error) {
      console.error("Error loading tournament details:", error);
    }
  };

  const handleUpdateMatch = async () => {
    setLoading(true);
    try {
      const { tournamentId, match } = matchModal;

      if (!match.winner_id) {
        showMessage("❌ Debes seleccionar un ganador");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/admin/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: 'update_match',
          tournamentId,
          matchId: match.id,
          matchData: {
            winner_id: match.winner_id,
            scores_csv: match.scores_csv || ""
          }
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showMessage("✅ Resultado actualizado correctamente");
        setMatchModal({ isOpen: false, match: null, tournamentId: null });
        // Recargar detalles del torneo
        loadTournamentDetails(tournamentId);
      } else {
        showMessage("❌ " + (data.error || "Error al actualizar resultado"));
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

  const handleLogout = async () => {
    try {
      // Llamar al endpoint custom de logout para registrar en audit log
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Error logging logout:", error);
    } finally {
      // Hacer signOut de NextAuth
      await signOut({ callbackUrl: "/" });
    }
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
      {/* Estilos globales para efectos hover/focus en selects y date inputs */}
      <style jsx global>{`
        select {
          transition: all 0.2s ease;
        }
        select:hover {
          border-color: ${gold} !important;
          box-shadow: 0 0 0 1px ${gold}40;
        }
        select:focus {
          border-color: ${gold} !important;
          box-shadow: 0 0 0 2px ${gold}60;
          outline: none;
        }
        option {
          background: ${cardBg};
          color: ${textLight};
          padding: 8px;
        }

        /* DatePicker personalizado - Wrapper */
        .custom-datepicker-wrapper {
          width: 100%;
        }

        /* DatePicker personalizado - Input */
        .custom-datepicker {
          width: 100%;
          padding: 12px 16px;
          background: linear-gradient(180deg, ${bg} 0%, #16130f 100%);
          border: 1.5px solid ${darkGold};
          border-radius: 6px;
          color: ${textLight};
          font-size: 14px;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .custom-datepicker:hover {
          border-color: ${gold};
          box-shadow: 0 0 0 1px rgba(201, 168, 76, 0.25);
        }

        .custom-datepicker:focus {
          border-color: ${gold};
          box-shadow: 0 0 0 2px rgba(201, 168, 76, 0.4);
          outline: none;
        }

        .custom-datepicker::placeholder {
          color: ${textMuted};
          opacity: 0.7;
        }

        /* Calendario - Contenedor principal */
        .custom-calendar {
          background: ${cardBg};
          border: 2px solid ${gold};
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
          font-family: inherit;
          padding: 16px;
          transform: scale(1.15);
          transform-origin: top left;
        }

        /* Header del calendario */
        .custom-calendar .react-datepicker__header {
          background: ${bg};
          border-bottom: 2px solid ${darkGold};
          border-radius: 8px 8px 0 0;
          padding: 16px;
        }

        .custom-calendar .react-datepicker__current-month {
          color: ${gold};
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        /* Nombres de días */
        .custom-calendar .react-datepicker__day-name {
          color: ${textMuted};
          font-size: 12px;
          font-weight: 600;
          width: 2.5rem;
          line-height: 2.5rem;
          margin: 0.15rem;
          letter-spacing: 0.5px;
        }

        /* Días del calendario */
        .custom-calendar .react-datepicker__day {
          color: ${textLight};
          background: ${bg};
          border-radius: 6px;
          width: 2.5rem;
          line-height: 2.5rem;
          margin: 0.15rem;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .custom-calendar .react-datepicker__day:hover {
          background: ${gold};
          color: ${bg};
          transform: scale(1.1);
        }

        .custom-calendar .react-datepicker__day--selected {
          background: ${gold};
          color: ${bg};
          font-weight: 700;
        }

        .custom-calendar .react-datepicker__day--today {
          border: 2px solid ${gold};
          font-weight: 700;
        }

        .custom-calendar .react-datepicker__day--disabled {
          color: ${darkGold};
          cursor: not-allowed;
          opacity: 0.4;
        }

        .custom-calendar .react-datepicker__day--outside-month {
          color: ${textMuted};
          opacity: 0.3;
        }

        /* Botones de navegación */
        .custom-calendar .react-datepicker__navigation {
          top: 20px;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: ${bg};
          border: 1px solid ${darkGold};
          transition: all 0.2s ease;
        }

        .custom-calendar .react-datepicker__navigation:hover {
          background: ${gold};
          border-color: ${gold};
        }

        .custom-calendar .react-datepicker__navigation-icon::before {
          border-color: ${gold};
          border-width: 2px 2px 0 0;
          width: 8px;
          height: 8px;
        }

        .custom-calendar .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
          border-color: ${bg};
        }

        /* Dropdown de año */
        .custom-calendar .react-datepicker__year-dropdown {
          background: ${cardBg};
          border: 2px solid ${gold};
          border-radius: 8px;
          max-height: 250px;
          overflow-y: auto;
        }

        .custom-calendar .react-datepicker__year-option {
          color: ${textLight};
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .custom-calendar .react-datepicker__year-option:hover {
          background: ${gold};
          color: ${bg};
        }

        .custom-calendar .react-datepicker__year-option--selected {
          background: ${gold};
          color: ${bg};
          font-weight: 700;
        }

        /* Scrollbar para dropdown */
        .custom-calendar .react-datepicker__year-dropdown::-webkit-scrollbar {
          width: 8px;
        }

        .custom-calendar .react-datepicker__year-dropdown::-webkit-scrollbar-track {
          background: ${bg};
          border-radius: 4px;
        }

        .custom-calendar .react-datepicker__year-dropdown::-webkit-scrollbar-thumb {
          background: ${gold};
          border-radius: 4px;
        }

        .custom-calendar .react-datepicker__year-dropdown::-webkit-scrollbar-thumb:hover {
          background: #d4b962;
        }
      `}</style>
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
          <Button variant="secondary" onClick={() => window.location.href = "/"}>
            Ver Sitio
          </Button>
          <Button variant="secondary" onClick={handleLogout}>
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "0 24px", flexWrap: "wrap" }}>
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
          {(session?.user?.permissions?.is_admin || session?.user?.permissions?.can_publish_blog) && (
            <button
              onClick={() => setActiveSection("subscribers")}
              style={{
                background: activeSection === "subscribers" ? "rgba(201,168,76,0.08)" : "transparent",
                border: "none",
                color: activeSection === "subscribers" ? gold : textMuted,
                fontFamily: "'Cinzel', serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                padding: "16px 20px",
                cursor: "pointer",
                borderBottom: activeSection === "subscribers" ? `2px solid ${gold}` : "2px solid transparent",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              Suscriptores
            </button>
          )}
          {session?.user?.permissions?.is_admin && (
            <button
              onClick={() => setActiveSection("audit")}
              style={{
                background: activeSection === "audit" ? "rgba(201,168,76,0.08)" : "transparent",
                border: "none",
                color: activeSection === "audit" ? gold : textMuted,
                fontFamily: "'Cinzel', serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                padding: "16px 20px",
                cursor: "pointer",
                borderBottom: activeSection === "audit" ? `2px solid ${gold}` : "2px solid transparent",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              Audit Log
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
                    style={getSelectStyle({ padding: "6px 28px 6px 12px", fontSize: 12 })}
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
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/admin/export-members');
                        if (!response.ok) throw new Error('Error al exportar');

                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `miembros-clan-mafia-${new Date().toISOString().split('T')[0]}.xlsx`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      } catch (error) {
                        console.error('Error:', error);
                        alert('Error al exportar miembros');
                      }
                    }}
                  >
                    ↓ Exportar a Excel
                  </Button>
                  <Button onClick={() => setMemberModal({ isOpen: true, member: { name: "", race: "Terran", rank: "Miembro", avatar: "", mmr: 0 } })}>
                    + Agregar Miembro
                  </Button>
                </div>
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
                        minute: '2-digit',
                        timeZone: 'America/Lima'
                      })
                    : 'Nunca';

                  // Determinar estado general
                  const isComplete = hasEmail && isVerified && hasDiscord;
                  const needsSetup = !hasEmail || !hasDiscord;

                  return (
                    <div key={member.id}>
                    <div
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

                          {/* Estado de Teléfono */}
                          {member.phone && (
                            <span style={{
                              fontSize: 10,
                              padding: "3px 8px",
                              borderRadius: 4,
                              background: "rgba(76, 140, 201, 0.15)",
                              color: "#4C8CCF",
                              fontWeight: 600,
                              border: "1px solid #4C8CCF",
                            }}>
                              📱 {member.phone}
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
                          onClick={() => {
                            if (expandedMember === member.id) {
                              setExpandedMember(null);
                            } else {
                              setExpandedMember(member.id);
                            }
                          }}
                        >
                          {expandedMember === member.id ? "Ocultar ▲" : "Ver detalle ▼"}
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

                    {/* Detalle expandido - FUERA del card */}
                    {expandedMember === member.id && (
                      <div style={{
                        marginTop: 12,
                        padding: 16,
                        background: cardBg,
                        borderRadius: 8,
                        border: `1px solid ${gold}`,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                          <h4 style={{ color: gold, fontSize: 14, margin: 0 }}>
                            {editingMember === member.id ? "Editar Miembro" : "Información Completa"}
                          </h4>
                          <div style={{ display: "flex", gap: 8 }}>
                            {editingMember === member.id ? (
                              <>
                                <Button onClick={handleSaveInlineEdit} loading={loading} style={{ padding: "6px 12px", fontSize: 12 }}>
                                  💾 Guardar
                                </Button>
                                <Button variant="secondary" onClick={handleCancelEdit} style={{ padding: "6px 12px", fontSize: 12 }}>
                                  Cancelar
                                </Button>
                              </>
                            ) : (
                              <Button onClick={() => handleStartEdit(member)} style={{ padding: "6px 12px", fontSize: 12 }}>
                                ✏️ Editar
                              </Button>
                            )}
                          </div>
                        </div>

                        {editingMember === member.id ? (
                          // MODO EDICIÓN
                          <div>
                          {/* Info Básica */}
                          <h4 style={{ color: gold, fontSize: 13, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Información Básica</h4>

                          {/* Avatar (primero) */}
                          <div style={{ marginBottom: 12 }}>
                            <label style={{ display: "block", color: textMuted, fontSize: 11, marginBottom: 4 }}>Avatar URL</label>
                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                              <input
                                type="text"
                                value={editFormData.avatar || ""}
                                onChange={(e) => updateEditField("avatar", e.target.value)}
                                placeholder="URL de imagen"
                                style={{
                                  flex: 1,
                                  padding: "8px 12px",
                                  background: bg,
                                  border: `1px solid ${darkGold}`,
                                  borderRadius: 4,
                                  color: textLight,
                                  fontSize: 13,
                                }}
                              />
                              {editFormData.avatar && (
                                <img
                                  src={(() => {
                                    // Usar proxy para imágenes externas
                                    let imageSrc = editFormData.avatar;
                                    if (editFormData.avatar.startsWith('http://') || editFormData.avatar.startsWith('https://')) {
                                      const externalUrl = editFormData.avatar.replace(/^https?:\/\//, '');
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
                                    flexShrink: 0
                                  }}
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              )}
                            </div>
                          </div>

                          {/* Fechas: Nacimiento e Ingreso */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                            <div>
                              <label style={{ display: "block", color: textMuted, fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                🎂 Fecha de Nacimiento
                              </label>
                              <DatePicker
                                selected={safeParseDate(editFormData.birth_date)}
                                onChange={(date) => {
                                  if (date) {
                                    const year = date.getFullYear();
                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                    const day = String(date.getDate()).padStart(2, '0');
                                    const formattedDate = `${year}-${month}-${day}`;
                                    updateEditField("birth_date", formattedDate);
                                  } else {
                                    updateEditField("birth_date", null);
                                  }
                                }}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Seleccionar fecha"
                                showYearDropdown
                                scrollableYearDropdown
                                yearDropdownItemNumber={100}
                                maxDate={new Date()}
                                className="custom-datepicker"
                                calendarClassName="custom-calendar"
                                wrapperClassName="custom-datepicker-wrapper"
                                isClearable
                              />
                            </div>
                            <div>
                              <label style={{ display: "block", color: textMuted, fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                ⭐ Fecha de Ingreso al Clan
                              </label>
                              <DatePicker
                                selected={safeParseDate(editFormData.join_date)}
                                onChange={(date) => {
                                  if (date) {
                                    const year = date.getFullYear();
                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                    const day = String(date.getDate()).padStart(2, '0');
                                    const formattedDate = `${year}-${month}-${day}`;
                                    updateEditField("join_date", formattedDate);
                                  } else {
                                    updateEditField("join_date", null);
                                  }
                                }}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Seleccionar fecha"
                                showYearDropdown
                                scrollableYearDropdown
                                yearDropdownItemNumber={50}
                                maxDate={new Date()}
                                className="custom-datepicker"
                                calendarClassName="custom-calendar"
                                wrapperClassName="custom-datepicker-wrapper"
                                isClearable
                              />
                            </div>
                          </div>

                          {/* Fila 1: Nombre, Email y Teléfono */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                            <div>
                              <label style={{ display: "block", color: textMuted, fontSize: 11, marginBottom: 4 }}>Nombre</label>
                              <input
                                type="text"
                                value={editFormData.name || ""}
                                onChange={(e) => updateEditField("name", e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  background: bg,
                                  border: `1px solid ${darkGold}`,
                                  borderRadius: 4,
                                  color: textLight,
                                  fontSize: 13,
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: "block", color: textMuted, fontSize: 11, marginBottom: 4 }}>Email</label>
                              <input
                                type="email"
                                value={editFormData.email || ""}
                                onChange={(e) => updateEditField("email", e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  background: bg,
                                  border: `1px solid ${darkGold}`,
                                  borderRadius: 4,
                                  color: textLight,
                                  fontSize: 13,
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: "block", color: textMuted, fontSize: 11, marginBottom: 4 }}>Teléfono/WhatsApp</label>
                              <input
                                type="tel"
                                value={editFormData.phone || ""}
                                onChange={(e) => updateEditField("phone", e.target.value)}
                                placeholder="+51 999 999 999"
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  background: bg,
                                  border: `1px solid ${darkGold}`,
                                  borderRadius: 4,
                                  color: textLight,
                                  fontSize: 13,
                                }}
                              />
                            </div>
                          </div>

                          {/* Fila 2: Discord, MMR, Rango, Nivel */}
                          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                            <div>
                              <label style={{ display: "flex", alignItems: "center", gap: 8, color: textMuted, fontSize: 11, marginBottom: 4 }}>
                                <SocialIcons.Discord size={16} />
                                Discord
                              </label>
                              <input
                                type="text"
                                value={editFormData.social_discord || ""}
                                onChange={(e) => updateEditField("social_discord", e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  background: bg,
                                  border: `1px solid ${darkGold}`,
                                  borderRadius: 4,
                                  color: textLight,
                                  fontSize: 13,
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: "block", color: textMuted, fontSize: 11, marginBottom: 4 }}>MMR</label>
                              <input
                                type="number"
                                value={editFormData.mmr || 0}
                                onChange={(e) => updateEditField("mmr", parseInt(e.target.value) || 0)}
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  background: bg,
                                  border: `1px solid ${darkGold}`,
                                  borderRadius: 4,
                                  color: textLight,
                                  fontSize: 13,
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: "block", color: textMuted, fontSize: 11, marginBottom: 4 }}>Rango</label>
                              <select
                                value={editFormData.rank || "Miembro"}
                                onChange={(e) => updateEditField("rank", e.target.value)}
                                style={getSelectStyle({ padding: "8px 32px 8px 12px", fontSize: 13 })}
                              >
                                <option value="Lider">Lider</option>
                                <option value="Oficial">Oficial</option>
                                <option value="Miembro">Miembro</option>
                                <option value="Recruit">Recruit</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ display: "block", color: textMuted, fontSize: 11, marginBottom: 4 }}>Nivel</label>
                              <select
                                value={editFormData.level_rank || "B"}
                                onChange={(e) => updateEditField("level_rank", e.target.value)}
                                style={getSelectStyle({ padding: "8px 32px 8px 12px", fontSize: 13 })}
                              >
                                <option value="S">S</option>
                                <option value="A+">A+</option>
                                <option value="A">A</option>
                                <option value="B+">B+</option>
                                <option value="B">B</option>
                                <option value="C+">C+</option>
                                <option value="C">C</option>
                                <option value="D+">D+</option>
                                <option value="D">D</option>
                              </select>
                            </div>
                          </div>

                          {/* Niveles por Raza */}
                          <h4 style={{ color: gold, fontSize: 13, marginTop: 4, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Niveles por Raza</h4>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
                            <div>
                              <label style={{ display: "block", color: textMuted, fontSize: 11, marginBottom: 4 }}>Protoss</label>
                              <select
                                value={editFormData.protoss_level || "-"}
                                onChange={(e) => updateEditField("protoss_level", e.target.value)}
                                style={getSelectStyle({ padding: "6px 28px 6px 10px", fontSize: 12 })}
                              >
                                <option value="-">-</option>
                                <option value="S">S</option>
                                <option value="A+">A+</option>
                                <option value="A">A</option>
                                <option value="B+">B+</option>
                                <option value="B">B</option>
                                <option value="C+">C+</option>
                                <option value="C">C</option>
                                <option value="D+">D+</option>
                                <option value="D">D</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ display: "block", color: textMuted, fontSize: 11, marginBottom: 4 }}>Terran</label>
                              <select
                                value={editFormData.terran_level || "-"}
                                onChange={(e) => updateEditField("terran_level", e.target.value)}
                                style={getSelectStyle({ padding: "6px 28px 6px 10px", fontSize: 12 })}
                              >
                                <option value="-">-</option>
                                <option value="S">S</option>
                                <option value="A+">A+</option>
                                <option value="A">A</option>
                                <option value="B+">B+</option>
                                <option value="B">B</option>
                                <option value="C+">C+</option>
                                <option value="C">C</option>
                                <option value="D+">D+</option>
                                <option value="D">D</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ display: "block", color: textMuted, fontSize: 11, marginBottom: 4 }}>Zerg</label>
                              <select
                                value={editFormData.zerg_level || "-"}
                                onChange={(e) => updateEditField("zerg_level", e.target.value)}
                                style={getSelectStyle({ padding: "6px 28px 6px 10px", fontSize: 12 })}
                              >
                                <option value="-">-</option>
                                <option value="S">S</option>
                                <option value="A+">A+</option>
                                <option value="A">A</option>
                                <option value="B+">B+</option>
                                <option value="B">B</option>
                                <option value="C+">C+</option>
                                <option value="C">C</option>
                                <option value="D+">D+</option>
                                <option value="D">D</option>
                              </select>
                            </div>
                          </div>

                          {/* Redes Sociales */}
                          <h4 style={{ color: gold, fontSize: 13, marginTop: 4, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Redes Sociales</h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                            <div>
                              <label style={{ display: "flex", alignItems: "center", gap: 8, color: textMuted, fontSize: 11, marginBottom: 4 }}>
                                <SocialIcons.Kick size={16} />
                                Kick
                              </label>
                              <input
                                type="text"
                                value={editFormData.social_kick || ""}
                                onChange={(e) => updateEditField("social_kick", e.target.value)}
                                placeholder="https://kick.com/..."
                                style={{
                                  width: "100%",
                                  padding: "6px 10px",
                                  background: bg,
                                  border: `1px solid ${darkGold}`,
                                  borderRadius: 4,
                                  color: textLight,
                                  fontSize: 12,
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: "flex", alignItems: "center", gap: 8, color: textMuted, fontSize: 11, marginBottom: 4 }}>
                                <SocialIcons.Twitch size={16} />
                                Twitch
                              </label>
                              <input
                                type="text"
                                value={editFormData.social_twitch || ""}
                                onChange={(e) => updateEditField("social_twitch", e.target.value)}
                                placeholder="@username"
                                style={{
                                  width: "100%",
                                  padding: "6px 10px",
                                  background: bg,
                                  border: `1px solid ${darkGold}`,
                                  borderRadius: 4,
                                  color: textLight,
                                  fontSize: 12,
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: "flex", alignItems: "center", gap: 8, color: textMuted, fontSize: 11, marginBottom: 4 }}>
                                <SocialIcons.YouTube size={16} />
                                YouTube
                              </label>
                              <input
                                type="text"
                                value={editFormData.social_youtube || ""}
                                onChange={(e) => updateEditField("social_youtube", e.target.value)}
                                placeholder="https://youtube.com/@canal"
                                style={{
                                  width: "100%",
                                  padding: "6px 10px",
                                  background: bg,
                                  border: `1px solid ${darkGold}`,
                                  borderRadius: 4,
                                  color: textLight,
                                  fontSize: 12,
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: "flex", alignItems: "center", gap: 8, color: textMuted, fontSize: 11, marginBottom: 4 }}>
                                <SocialIcons.Facebook size={16} />
                                Facebook
                              </label>
                              <input
                                type="text"
                                value={editFormData.social_facebook || ""}
                                onChange={(e) => updateEditField("social_facebook", e.target.value)}
                                placeholder="https://facebook.com/..."
                                style={{
                                  width: "100%",
                                  padding: "6px 10px",
                                  background: bg,
                                  border: `1px solid ${darkGold}`,
                                  borderRadius: 4,
                                  color: textLight,
                                  fontSize: 12,
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: "flex", alignItems: "center", gap: 8, color: textMuted, fontSize: 11, marginBottom: 4 }}>
                                <SocialIcons.Instagram size={16} />
                                Instagram
                              </label>
                              <input
                                type="text"
                                value={editFormData.social_instagram || ""}
                                onChange={(e) => updateEditField("social_instagram", e.target.value)}
                                placeholder="@username"
                                style={{
                                  width: "100%",
                                  padding: "6px 10px",
                                  background: bg,
                                  border: `1px solid ${darkGold}`,
                                  borderRadius: 4,
                                  color: textLight,
                                  fontSize: 12,
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: "flex", alignItems: "center", gap: 8, color: textMuted, fontSize: 11, marginBottom: 4 }}>
                                <SocialIcons.Twitter size={16} />
                                Twitter/X
                              </label>
                              <input
                                type="text"
                                value={editFormData.social_twitter || ""}
                                onChange={(e) => updateEditField("social_twitter", e.target.value)}
                                placeholder="@username"
                                style={{
                                  width: "100%",
                                  padding: "6px 10px",
                                  background: bg,
                                  border: `1px solid ${darkGold}`,
                                  borderRadius: 4,
                                  color: textLight,
                                  fontSize: 12,
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: "flex", alignItems: "center", gap: 8, color: textMuted, fontSize: 11, marginBottom: 4 }}>
                                <SocialIcons.TikTok size={16} />
                                TikTok
                              </label>
                              <input
                                type="text"
                                value={editFormData.social_tiktok || ""}
                                onChange={(e) => updateEditField("social_tiktok", e.target.value)}
                                placeholder="@username"
                                style={{
                                  width: "100%",
                                  padding: "6px 10px",
                                  background: bg,
                                  border: `1px solid ${darkGold}`,
                                  borderRadius: 4,
                                  color: textLight,
                                  fontSize: 12,
                                }}
                              />
                            </div>
                          </div>
                          </div>
                        ) : (
                          // MODO VISTA
                          <div>
                            {/* Avatar (primero) */}
                            <div style={{
                              padding: "16px",
                              background: bg,
                              borderRadius: 8,
                              border: `1px solid ${darkGold}`,
                              marginBottom: 20,
                              display: "flex",
                              alignItems: "center",
                              gap: 16
                            }}>
                              <div>
                                <p style={{ color: textMuted, fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Avatar</p>
                                {member.avatar ? (
                                  <img
                                    src={(() => {
                                      // Usar proxy para imágenes externas (igual que en la página principal)
                                      let imageSrc = member.avatar;
                                      if (member.avatar.startsWith('http://') || member.avatar.startsWith('https://')) {
                                        const externalUrl = member.avatar.replace(/^https?:\/\//, '');
                                        imageSrc = `https://images.weserv.nl/?url=${externalUrl}&w=160&h=160&fit=cover`;
                                      }
                                      return imageSrc;
                                    })()}
                                    alt={member.name}
                                    style={{
                                      width: 80,
                                      height: 80,
                                      borderRadius: "50%",
                                      objectFit: "cover",
                                      border: `3px solid ${gold}`
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextElementSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : (
                                  <div style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: "50%",
                                    background: cardBg,
                                    border: `2px dashed ${darkGold}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 10,
                                    color: textMuted
                                  }}>
                                    Sin avatar
                                  </div>
                                )}
                                <div style={{ display: 'none', width: 80, height: 80, borderRadius: "50%", background: cardBg, border: `2px dashed ${darkGold}`, alignItems: "center", justifyContent: "center", fontSize: 10, color: textMuted }}>
                                  Error al cargar
                                </div>
                              </div>
                              {member.avatar && (
                                <div style={{ flex: 1 }}>
                                  <p style={{ color: textMuted, fontSize: 10, marginBottom: 4 }}>URL</p>
                                  <p style={{
                                    color: textLight,
                                    fontSize: 11,
                                    wordBreak: "break-all",
                                    fontFamily: "monospace",
                                    background: cardBg,
                                    padding: "6px 8px",
                                    borderRadius: 4
                                  }}>{member.avatar}</p>
                                </div>
                              )}
                            </div>

                            {/* Datos Personales */}
                            <div style={{
                              padding: "16px",
                              background: bg,
                              borderRadius: 8,
                              border: `1px solid ${darkGold}`,
                              marginBottom: 20
                            }}>
                              <h4 style={{ color: gold, fontSize: 13, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Datos Personales</h4>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                                <div style={{
                                  padding: "10px 12px",
                                  background: cardBg,
                                  borderRadius: 6,
                                  border: `1px solid ${darkGold}`
                                }}>
                                  <p style={{ color: textMuted, fontSize: 10, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>✉️ Email</p>
                                  <p style={{ color: textLight, fontSize: 12, fontWeight: 500, wordBreak: "break-all" }}>{member.email || "Sin email"}</p>
                                </div>
                                {member.phone && (
                                  <div style={{
                                    padding: "10px 12px",
                                    background: cardBg,
                                    borderRadius: 6,
                                    border: `1px solid ${darkGold}`
                                  }}>
                                    <p style={{ color: textMuted, fontSize: 10, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>📱 Teléfono/WhatsApp</p>
                                    <p style={{ color: textLight, fontSize: 12, fontWeight: 500 }}>{member.phone}</p>
                                  </div>
                                )}
                                {member.birth_date && (
                                  <div style={{
                                    padding: "10px 12px",
                                    background: cardBg,
                                    borderRadius: 6,
                                    border: `1px solid ${darkGold}`
                                  }}>
                                    <p style={{ color: textMuted, fontSize: 10, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>🎂 Fecha de Nacimiento</p>
                                    <p style={{ color: textLight, fontSize: 12, fontWeight: 500 }}>{new Date(member.birth_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Lima' })}</p>
                                  </div>
                                )}
                                {member.join_date && (
                                  <div style={{
                                    padding: "10px 12px",
                                    background: cardBg,
                                    borderRadius: 6,
                                    border: `1px solid ${darkGold}`
                                  }}>
                                    <p style={{ color: textMuted, fontSize: 10, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>⭐ Ingreso al Clan</p>
                                    <p style={{ color: gold, fontSize: 12, fontWeight: 500 }}>{new Date(member.join_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Lima' })}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Información de Juego */}
                            <div style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 12,
                              marginBottom: 20
                            }}>
                              <div style={{
                                padding: "12px",
                                background: bg,
                                borderRadius: 6,
                                border: `1px solid ${darkGold}`
                              }}>
                                <p style={{ color: textMuted, fontSize: 10, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>MMR</p>
                                <p style={{ color: gold, fontSize: 20, fontWeight: 700 }}>{member.mmr}</p>
                              </div>
                              <div style={{
                                padding: "12px",
                                background: bg,
                                borderRadius: 6,
                                border: `1px solid ${darkGold}`
                              }}>
                                <p style={{ color: textMuted, fontSize: 10, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Nivel General</p>
                                <p style={{ color: gold, fontSize: 20, fontWeight: 700 }}>{member.level_rank || "B"}</p>
                              </div>
                            </div>

                            {/* Niveles por Raza */}
                            <div style={{
                              padding: "16px",
                              background: bg,
                              borderRadius: 8,
                              border: `1px solid ${darkGold}`,
                              marginBottom: 20
                            }}>
                              <h4 style={{ color: gold, fontSize: 13, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>Niveles por Raza</h4>
                              <div style={{ display: "flex", justifyContent: "space-around", gap: 16 }}>
                                {/* Protoss */}
                                <div style={{
                                  flex: 1,
                                  padding: "16px",
                                  background: "rgba(201,168,76,0.08)",
                                  border: "2px solid rgba(201,168,76,0.3)",
                                  borderRadius: 8,
                                  textAlign: "center"
                                }}>
                                  <p style={{
                                    color: gold,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: 1,
                                    marginBottom: 10,
                                    textTransform: "uppercase"
                                  }}>Protoss</p>
                                  <p style={{
                                    color: gold,
                                    fontSize: 32,
                                    fontWeight: 900,
                                    lineHeight: 1
                                  }}>{member.protoss_level || "-"}</p>
                                </div>

                                {/* Terran */}
                                <div style={{
                                  flex: 1,
                                  padding: "16px",
                                  background: "rgba(100,160,200,0.08)",
                                  border: "2px solid rgba(100,160,200,0.3)",
                                  borderRadius: 8,
                                  textAlign: "center"
                                }}>
                                  <p style={{
                                    color: "#7ab8d4",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: 1,
                                    marginBottom: 10,
                                    textTransform: "uppercase"
                                  }}>Terran</p>
                                  <p style={{
                                    color: "#7ab8d4",
                                    fontSize: 32,
                                    fontWeight: 900,
                                    lineHeight: 1
                                  }}>{member.terran_level || "-"}</p>
                                </div>

                                {/* Zerg */}
                                <div style={{
                                  flex: 1,
                                  padding: "16px",
                                  background: "rgba(160,100,180,0.08)",
                                  border: "2px solid rgba(160,100,180,0.3)",
                                  borderRadius: 8,
                                  textAlign: "center"
                                }}>
                                  <p style={{
                                    color: "#c09ad8",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: 1,
                                    marginBottom: 10,
                                    textTransform: "uppercase"
                                  }}>Zerg</p>
                                  <p style={{
                                    color: "#c09ad8",
                                    fontSize: 32,
                                    fontWeight: 900,
                                    lineHeight: 1
                                  }}>{member.zerg_level || "-"}</p>
                                </div>
                              </div>
                            </div>

                            {/* Redes Sociales - Solo mostrar si tiene al menos una red social */}
                            {(member.social_discord || member.social_kick || member.social_twitch || member.social_youtube || member.social_facebook || member.social_instagram || member.social_twitter || member.social_tiktok) && (
                              <div style={{
                                padding: "16px",
                                background: bg,
                                borderRadius: 8,
                                border: `1px solid ${darkGold}`,
                                marginBottom: 20
                              }}>
                                <h4 style={{ color: gold, fontSize: 13, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Redes Sociales</h4>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                                {member.social_discord && (
                                  <div style={{ padding: "10px 12px", background: cardBg, borderRadius: 6, border: `1px solid ${gold}` }}>
                                    <p style={{ color: gold, fontSize: 10, marginBottom: 4, fontWeight: 600 }}>💬 Discord</p>
                                    <p style={{ color: textLight, fontSize: 11, wordBreak: "break-all" }}>{member.social_discord}</p>
                                  </div>
                                )}
                                {member.social_kick && (
                                <div style={{ padding: "10px 12px", background: cardBg, borderRadius: 6, border: `1px solid ${gold}` }}>
                                  <p style={{ color: gold, fontSize: 10, marginBottom: 4, fontWeight: 600 }}>🎮 Kick</p>
                                  <p style={{ color: textLight, fontSize: 11, wordBreak: "break-all" }}>{member.social_kick}</p>
                                </div>
                              )}
                              {member.social_twitch && (
                                <div style={{ padding: "8px 10px", background: bg, borderRadius: 4, border: `1px solid ${darkGold}` }}>
                                  <p style={{ color: textMuted, fontSize: 10, marginBottom: 3 }}>Twitch</p>
                                  <p style={{ color: textLight, fontSize: 12 }}>{member.social_twitch}</p>
                                </div>
                              )}
                              {member.social_youtube && (
                                <div style={{ padding: "8px 10px", background: bg, borderRadius: 4, border: `1px solid ${darkGold}` }}>
                                  <p style={{ color: textMuted, fontSize: 10, marginBottom: 3 }}>YouTube</p>
                                  <p style={{ color: textLight, fontSize: 12, wordBreak: "break-all" }}>{member.social_youtube}</p>
                                </div>
                              )}
                              {member.social_facebook && (
                                <div style={{ padding: "8px 10px", background: bg, borderRadius: 4, border: `1px solid ${darkGold}` }}>
                                  <p style={{ color: textMuted, fontSize: 10, marginBottom: 3 }}>Facebook</p>
                                  <p style={{ color: textLight, fontSize: 12, wordBreak: "break-all" }}>{member.social_facebook}</p>
                                </div>
                              )}
                              {member.social_instagram && (
                                <div style={{ padding: "8px 10px", background: bg, borderRadius: 4, border: `1px solid ${darkGold}` }}>
                                  <p style={{ color: textMuted, fontSize: 10, marginBottom: 3 }}>Instagram</p>
                                  <p style={{ color: textLight, fontSize: 12 }}>{member.social_instagram}</p>
                                </div>
                              )}
                              {member.social_twitter && (
                                <div style={{ padding: "8px 10px", background: bg, borderRadius: 4, border: `1px solid ${darkGold}` }}>
                                  <p style={{ color: textMuted, fontSize: 10, marginBottom: 3 }}>Twitter/X</p>
                                  <p style={{ color: textLight, fontSize: 12 }}>{member.social_twitter}</p>
                                </div>
                              )}
                              {member.social_tiktok && (
                                <div style={{ padding: "8px 10px", background: bg, borderRadius: 4, border: `1px solid ${darkGold}` }}>
                                  <p style={{ color: textMuted, fontSize: 10, marginBottom: 3 }}>TikTok</p>
                                  <p style={{ color: textLight, fontSize: 12 }}>{member.social_tiktok}</p>
                                </div>
                              )}
                                </div>
                              </div>
                            )}

                            {/* Estado del Miembro */}
                            <div style={{
                              padding: "16px",
                              background: bg,
                              borderRadius: 8,
                              border: `1px solid ${darkGold}`,
                              marginBottom: 20
                            }}>
                              <h4 style={{ color: gold, fontSize: 13, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Estado del Miembro</h4>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                                <div style={{
                                  padding: "10px 12px",
                                  background: cardBg,
                                  borderRadius: 6,
                                  border: `1px solid ${darkGold}`
                                }}>
                                  <p style={{ color: textMuted, fontSize: 10, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Último ingreso</p>
                                  <p style={{ color: textLight, fontSize: 12, fontWeight: 500 }}>{lastLogin}</p>
                                </div>
                                <div style={{
                                  padding: "10px 12px",
                                  background: cardBg,
                                  borderRadius: 6,
                                  border: `1px solid ${darkGold}`
                                }}>
                                  <p style={{ color: textMuted, fontSize: 10, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Miembro desde</p>
                                  <p style={{ color: textLight, fontSize: 12, fontWeight: 500 }}>
                                    {member.created_at ? new Date(member.created_at).toLocaleDateString('es-ES', { timeZone: 'America/Lima' }) : "N/A"}
                                  </p>
                                </div>
                                <div style={{
                                  padding: "10px 12px",
                                  background: cardBg,
                                  borderRadius: 6,
                                  border: `1px solid ${darkGold}`
                                }}>
                                  <p style={{ color: textMuted, fontSize: 10, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Email Verificado</p>
                                  <p style={{ color: isVerified ? "#4CAF50" : "#f44336", fontSize: 12, fontWeight: 700 }}>
                                    {isVerified ? "✓ Verificado" : "✗ Sin verificar"}
                                  </p>
                                </div>
                                <div style={{
                                  padding: "10px 12px",
                                  background: cardBg,
                                  borderRadius: 6,
                                  border: `1px solid ${darkGold}`
                                }}>
                                  <p style={{ color: textMuted, fontSize: 10, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Discord Verificado</p>
                                  <p style={{ color: hasDiscord ? "#4CAF50" : "#f44336", fontSize: 12, fontWeight: 700 }}>
                                    {hasDiscord ? "✓ Verificado" : "✗ Sin verificar"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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
                        <Button
                          style={{ padding: "6px 12px", fontSize: 10, whiteSpace: "nowrap" }}
                          onClick={() => loadTournamentDetails(tournament.url || tournament.id)}
                        >
                          Ver Detalles
                        </Button>
                        {tournament.state === 'pending' && (
                          <Button
                            variant="secondary"
                            style={{ padding: "6px 12px", fontSize: 10, whiteSpace: "nowrap" }}
                            onClick={() => handleStartTournament(tournament.url || tournament.id)}
                          >
                            Iniciar
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          style={{ padding: "6px 12px", fontSize: 10 }}
                          onClick={() => handleDeleteTournament(tournament.url || tournament.id)}
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
        {/* Suscriptores */}
        {activeSection === "subscribers" && (session?.user?.permissions?.is_admin || session?.user?.permissions?.can_publish_blog) && (
          <AdminCard title="Suscriptores del Blog" style={{ marginBottom: 24 }}>
            {/* Stats Cards */}
            {subscriberStats && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 24 }}>
                <div style={{ background: bg, padding: 16, borderRadius: 8, border: `1px solid ${darkGold}`, textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: gold, fontFamily: "'Cinzel', serif" }}>
                    {subscriberStats.total}
                  </div>
                  <div style={{ fontSize: 12, color: textMuted, marginTop: 4 }}>Total</div>
                </div>
                <div style={{ background: bg, padding: 16, borderRadius: 8, border: `1px solid rgba(76, 201, 130, 0.3)`, textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#4CC982", fontFamily: "'Cinzel', serif" }}>
                    {subscriberStats.active}
                  </div>
                  <div style={{ fontSize: 12, color: textMuted, marginTop: 4 }}>Activos</div>
                </div>
                <div style={{ background: bg, padding: 16, borderRadius: 8, border: `1px solid rgba(139, 123, 94, 0.3)`, textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: textMuted, fontFamily: "'Cinzel', serif" }}>
                    {subscriberStats.inactive}
                  </div>
                  <div style={{ fontSize: 12, color: textMuted, marginTop: 4 }}>Inactivos</div>
                </div>
              </div>
            )}

            <p style={{ color: textMuted, fontSize: 14, marginBottom: 16 }}>
              Gestiona los suscriptores que reciben notificaciones por email cuando se publica un nuevo post.
            </p>

            {/* Lista de suscriptores */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${darkGold}` }}>
                    <th style={{ padding: "12px 8px", textAlign: "left", color: gold, fontWeight: 600 }}>Email</th>
                    <th style={{ padding: "12px 8px", textAlign: "left", color: gold, fontWeight: 600 }}>Nombre</th>
                    <th style={{ padding: "12px 8px", textAlign: "center", color: gold, fontWeight: 600 }}>Estado</th>
                    <th style={{ padding: "12px 8px", textAlign: "left", color: gold, fontWeight: 600 }}>Fecha de Suscripción</th>
                    <th style={{ padding: "12px 8px", textAlign: "center", color: gold, fontWeight: 600 }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: "24px", textAlign: "center", color: textMuted }}>
                        No hay suscriptores todavía
                      </td>
                    </tr>
                  ) : (
                    subscribers.map((sub) => (
                      <tr key={sub.id} style={{ borderBottom: `1px solid ${darkGold}` }}>
                        <td style={{ padding: "12px 8px", color: textLight }}>
                          <div style={{ fontWeight: 600 }}>{sub.email}</div>
                        </td>
                        <td style={{ padding: "12px 8px", color: textLight }}>
                          {sub.name || <span style={{ color: textMuted, fontStyle: "italic" }}>-</span>}
                        </td>
                        <td style={{ padding: "12px 8px", textAlign: "center" }}>
                          {sub.is_active ? (
                            <span style={{ color: "#4CC982", fontSize: 11, background: "rgba(76, 201, 130, 0.1)", padding: "4px 8px", borderRadius: 4 }}>
                              ✓ Activo
                            </span>
                          ) : (
                            <span style={{ color: textMuted, fontSize: 11, background: "rgba(139, 123, 94, 0.1)", padding: "4px 8px", borderRadius: 4 }}>
                              ✕ Inactivo
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px 8px", color: textLight, fontSize: 12 }}>
                          {new Date(sub.subscribed_at).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            timeZone: "America/Lima",
                          })}
                        </td>
                        <td style={{ padding: "12px 8px", textAlign: "center" }}>
                          <Button
                            variant={sub.is_active ? "secondary" : "primary"}
                            style={{ padding: "4px 8px", fontSize: 10 }}
                            onClick={() => handleToggleSubscriber(sub)}
                          >
                            {sub.is_active ? "Desactivar" : "Activar"}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 16, padding: "12px", background: "rgba(201,168,76,0.05)", borderRadius: 6 }}>
              <p style={{ fontSize: 12, color: textMuted, margin: 0 }}>
                <strong>💡 Nota:</strong> Los suscriptores reciben un email automáticamente cuando se publica un nuevo post en el blog.
                Pueden cancelar su suscripción en cualquier momento desde el link en cada email.
              </p>
            </div>
          </AdminCard>
        )}

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

        {/* Audit Log */}
        {activeSection === "audit" && session?.user?.permissions?.is_admin && <AuditLogSection />}
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

        <Input
          label="Teléfono/WhatsApp"
          type="tel"
          value={memberModal.member?.phone || ""}
          onChange={(val) => setMemberModal({ ...memberModal, member: { ...memberModal.member, phone: val } })}
          placeholder="+51 999 999 999"
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

        {/* Tipo de Media */}
        <Select
          label="Tipo de Media"
          value={postModal.post?.media_type || "image"}
          onChange={(val) => setPostModal({ ...postModal, post: { ...postModal.post, media_type: val } })}
          options={["image", "video"]}
        />

        {/* Imagen del post */}
        {(!postModal.post?.media_type || postModal.post?.media_type === "image") && (
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
        )}

        {/* Video URL */}
        {postModal.post?.media_type === "video" && (
          <div style={{ marginTop: 16 }}>
            <Input
              label="URL del Video"
              value={postModal.post?.video_url || ""}
              onChange={(val) => setPostModal({ ...postModal, post: { ...postModal.post, video_url: val } })}
              placeholder="https://youtube.com/watch?v=... o https://tiktok.com/@..."
            />
            <p style={{ fontSize: 11, color: textMuted, marginTop: 4 }}>
              Soporta: YouTube, TikTok, o URL directa de video (.mp4, .webm, .ogg)
            </p>
            {postModal.post?.video_url && (
              <div style={{ marginTop: 12, padding: 12, background: "rgba(201,168,76,0.1)", borderRadius: 6, border: `1px solid ${darkGold}` }}>
                <p style={{ fontSize: 11, color: gold, marginBottom: 4 }}>✓ URL de video configurada</p>
                <p style={{ fontSize: 10, color: textMuted, wordBreak: "break-all" }}>{postModal.post.video_url}</p>
              </div>
            )}
          </div>
        )}

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
          label="URL del Video"
          value={videoModal.video?.video_url || videoModal.video?.youtube_id ? `https://youtube.com/watch?v=${videoModal.video.youtube_id}` : ""}
          onChange={(val) => setVideoModal({ ...videoModal, video: { ...videoModal.video, video_url: val } })}
          placeholder="https://youtube.com/watch?v=... o https://tiktok.com/@..."
        />
        <p style={{ fontSize: 11, color: textMuted, marginTop: 4 }}>
          Soporta: YouTube, TikTok, o URL directa de video (.mp4, .webm, .ogg)
        </p>
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
            URL Única (solo letras, números y _)
          </label>
          <input
            type="text"
            value={tournamentModal.tournament?.url || ""}
            onChange={(e) => {
              // Sanitizar: solo letras, números y guiones bajos
              const sanitized = e.target.value.replace(/[^a-zA-Z0-9_]/g, '_');
              setTournamentModal({ ...tournamentModal, tournament: { ...tournamentModal.tournament, url: sanitized } });
            }}
            placeholder="copa_mafia_2025"
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
          />
          <p style={{ fontSize: 11, color: textMuted, marginTop: 6, fontStyle: "italic" }}>
            Espacios y guiones se convertirán automáticamente en _
          </p>
        </div>
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

      {/* Add Participant Modal */}
      <Modal
        isOpen={participantModal.isOpen}
        onClose={() => setParticipantModal({ isOpen: false, tournamentId: null, participant: null })}
        title="Agregar Participante"
        zIndex={1100}
      >
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            color: textMuted,
            marginBottom: 8,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}>
            Tipo de Participante
          </label>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <button
              onClick={() => setParticipantModal({
                ...participantModal,
                participant: { ...participantModal.participant, type: 'member' }
              })}
              style={{
                flex: 1,
                padding: "10px 14px",
                background: participantModal.participant?.type === 'member' ? gold : bg,
                color: participantModal.participant?.type === 'member' ? bg : textLight,
                border: `1px solid ${darkGold}`,
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600
              }}
            >
              Miembro del Clan
            </button>
            <button
              onClick={() => setParticipantModal({
                ...participantModal,
                participant: { ...participantModal.participant, type: 'external', name: '', memberId: null }
              })}
              style={{
                flex: 1,
                padding: "10px 14px",
                background: participantModal.participant?.type === 'external' ? gold : bg,
                color: participantModal.participant?.type === 'external' ? bg : textLight,
                border: `1px solid ${darkGold}`,
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600
              }}
            >
              Jugador Externo
            </button>
          </div>
        </div>

        {participantModal.participant?.type === 'member' ? (
          <Select
            label="Seleccionar Miembro"
            value={participantModal.participant?.memberId || ""}
            onChange={(val) => {
              const member = members.find(m => m.id === parseInt(val));
              setParticipantModal({
                ...participantModal,
                participant: {
                  ...participantModal.participant,
                  memberId: val,
                  name: member ? member.name : ''
                }
              });
            }}
            options={[
              "-- Seleccionar miembro --",
              ...members.map(m => `${m.id}:${m.name}`)
            ]}
          />
        ) : participantModal.participant?.type === 'external' ? (
          <Input
            label="Nombre del Participante"
            value={participantModal.participant?.name || ""}
            onChange={(val) => setParticipantModal({
              ...participantModal,
              participant: { ...participantModal.participant, name: val }
            })}
            placeholder="Nombre del jugador"
          />
        ) : (
          <div style={{ padding: 20, textAlign: "center", color: textMuted }}>
            Selecciona el tipo de participante
          </div>
        )}

        {participantModal.participant?.type && (
          <>
            <Input
              label="Seed (opcional)"
              type="number"
              value={participantModal.participant?.seed || ""}
              onChange={(val) => setParticipantModal({
                ...participantModal,
                participant: { ...participantModal.participant, seed: parseInt(val) || null }
              })}
              placeholder="Posición inicial (1, 2, 3...)"
            />
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <Button onClick={handleAddParticipant} loading={loading} style={{ flex: 1 }}>
                Agregar
              </Button>
              <Button variant="secondary" onClick={() => setParticipantModal({ isOpen: false, tournamentId: null, participant: null })} style={{ flex: 1 }}>
                Cancelar
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* Tournament Details Modal */}
      {selectedTournament && (
        <Modal
          isOpen={!!selectedTournament}
          onClose={() => setSelectedTournament(null)}
          title={selectedTournament.tournament?.name || "Detalles del Torneo"}
        >
          {/* Tournament Info */}
          <div style={{ marginBottom: 20, padding: 16, background: bg, borderRadius: 6, border: `1px solid ${darkGold}` }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{
                fontSize: 11,
                padding: "4px 10px",
                borderRadius: 4,
                background: selectedTournament.tournament?.state === 'pending' ? "rgba(201,168,76,0.1)" :
                           selectedTournament.tournament?.state === 'underway' ? "rgba(76,201,130,0.1)" : "rgba(139,92,92,0.1)",
                color: selectedTournament.tournament?.state === 'pending' ? gold :
                       selectedTournament.tournament?.state === 'underway' ? "#4cc982" : "#c9a08a",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.5
              }}>
                {selectedTournament.tournament?.state === 'pending' ? 'Pendiente' :
                 selectedTournament.tournament?.state === 'underway' ? 'En Curso' :
                 selectedTournament.tournament?.state === 'complete' ? 'Completado' :
                 selectedTournament.tournament?.state}
              </span>
              <span style={{ color: textMuted, fontSize: 13 }}>
                Tipo: <span style={{ color: textLight, fontWeight: 600 }}>{selectedTournament.tournament?.tournament_type}</span>
              </span>
              <span style={{ color: textMuted, fontSize: 13 }}>
                Participantes: <span style={{ color: gold, fontWeight: 600 }}>{selectedTournament.tournament?.participants_count || 0}</span>
              </span>
            </div>
            {selectedTournament.tournament?.description && (
              <p style={{ color: textLight, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                {selectedTournament.tournament.description}
              </p>
            )}
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${darkGold}` }}>
              <a
                href={selectedTournament.tournament?.full_challonge_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#7ab8d4", fontSize: 12, textDecoration: "none" }}
              >
                Abrir en Challonge.com →
              </a>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h4 style={{ color: gold, fontSize: 14, marginBottom: 12, fontWeight: 600 }}>Participantes ({selectedTournament.tournament?.participants?.length || 0})</h4>

            {selectedTournament.tournament?.state === 'pending' && (
              <Button
                style={{ marginBottom: 12, width: "100%" }}
                onClick={() => {
                  setParticipantModal({
                    isOpen: true,
                    tournamentId: selectedTournament.tournament.id,
                    participant: { type: null, name: '', seed: null }
                  });
                }}
              >
                + Agregar Participante
              </Button>
            )}

            <div style={{ maxHeight: 300, overflowY: "auto", border: `1px solid ${darkGold}`, borderRadius: 6, padding: 8 }}>
              {selectedTournament.tournament?.participants && selectedTournament.tournament.participants.length > 0 ? (
                selectedTournament.tournament.participants.map((p) => {
                  const participant = p.participant;
                  return (
                    <div
                      key={participant.id}
                      style={{
                        padding: "8px 12px",
                        background: bg,
                        borderRadius: 4,
                        marginBottom: 6,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <span style={{ color: textLight, fontSize: 14, fontWeight: 600 }}>{participant.name}</span>
                        {participant.seed && (
                          <span style={{ color: textMuted, fontSize: 12, marginLeft: 8 }}>Seed: {participant.seed}</span>
                        )}
                      </div>

                      {selectedTournament.tournament?.state === 'pending' && (
                        <Button
                          variant="danger"
                          style={{ padding: "4px 10px", fontSize: 11 }}
                          onClick={() => handleDeleteParticipant(
                            selectedTournament.tournament.id,
                            participant.id,
                            participant.name
                          )}
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                  );
                })
              ) : (
                <p style={{ color: textMuted, fontSize: 13, textAlign: "center", padding: 20 }}>
                  No hay participantes aún
                </p>
              )}
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <h4 style={{ color: gold, fontSize: 14, marginBottom: 12, fontWeight: 600 }}>Bracket</h4>
            {selectedTournament.tournament?.full_challonge_url ? (
              <div
                style={{
                  border: `1px solid ${darkGold}`,
                  borderRadius: 6,
                  overflow: "hidden",
                  background: "#fff"
                }}
              >
                <iframe
                  key={`bracket-${selectedTournament.tournament.id}-${bracketRefreshKey}`}
                  src={`${selectedTournament.tournament.full_challonge_url}/module?v=${bracketRefreshKey}`}
                  width="100%"
                  height="500"
                  frameBorder="0"
                  scrolling="auto"
                  allowTransparency="true"
                  style={{ border: 0 }}
                />
              </div>
            ) : (
              <p style={{ color: textMuted, fontSize: 13, padding: 20, textAlign: "center" }}>
                El bracket estará disponible una vez que el torneo inicie
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <Button variant="secondary" onClick={() => setSelectedTournament(null)} style={{ flex: 1 }}>
              Cerrar
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
