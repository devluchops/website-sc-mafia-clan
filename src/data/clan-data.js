// ============================================================
//  CLAN MAFIA — DATOS DEL SITIO
//  Edita este archivo para cambiar TODO el contenido del sitio
// ============================================================

export const CLAN = {
  name: "MAFIA",
  tagline: "En la sombra dominamos el mapa",
  // Pon tu logo en la carpeta /public y referencia como "/logo.png"
  logo: "/logo.png",
};

// ------------------------------------------------------------
//  MIEMBROS
//  - avatar: pon la foto en /public/members/ y usa "/members/darklord.jpg"
//  - race: "Terran" | "Zerg" | "Protoss"
//  - rank: "Lider" | "Oficial" | "Miembro" | "Recruit"
// ------------------------------------------------------------
export const MEMBERS = [
  {
    name: "DarkLord",
    race: "Terran",
    rank: "Lider",
    avatar: "/members/darklord.jpg",
    mmr: 5200,
  },
  {
    name: "ShadowKing",
    race: "Zerg",
    rank: "Oficial",
    avatar: "/members/shadowking.jpg",
    mmr: 4800,
  },
  {
    name: "NexusGod",
    race: "Protoss",
    rank: "Oficial",
    avatar: "/members/nexusgod.jpg",
    mmr: 4950,
  },
  {
    name: "VoidReaper",
    race: "Zerg",
    rank: "Miembro",
    avatar: "/members/voidreaper.jpg",
    mmr: 4600,
  },
  {
    name: "IronSiege",
    race: "Terran",
    rank: "Miembro",
    avatar: "/members/ironsiege.jpg",
    mmr: 4400,
  },
  {
    name: "StormBlade",
    race: "Protoss",
    rank: "Recruit",
    avatar: "/members/stormblade.jpg",
    mmr: 4100,
  },
];

// ------------------------------------------------------------
//  POSTS / BLOG
//  - tag: "Guia" | "Recap" | "Noticias" (o agrega mas en TAG_COLORS)
// ------------------------------------------------------------
export const POSTS = [
  {
    tag: "Guia",
    title: "Timing push de 2-base Terran: la build que nos dio el torneo",
    author: "DarkLord",
    date: "hace 2 dias",
    readTime: "5 min",
    excerpt:
      "Repasamos la build order que usamos en el ultimo torneo y como adaptarla segun el matchup.",
  },
  {
    tag: "Recap",
    title: "MAFIA vs Phoenix Rising — Resumen de la clan war",
    author: "ShadowKing",
    date: "hace 5 dias",
    readTime: "3 min",
    excerpt:
      "Victoria 4-1 en una serie dominante. Analisis juego por juego de nuestra performance.",
  },
  {
    tag: "Noticias",
    title: "Nuevo parche 5.0.14: cambios en balance que nos afectan",
    author: "NexusGod",
    date: "hace 1 semana",
    readTime: "4 min",
    excerpt:
      "Los cambios a Terran bio y la nueva unidad Protoss. Que significa para nuestras estrategias.",
  },
];

// ------------------------------------------------------------
//  VIDEOS
//  - youtubeId: el ID del video (ej: "dQw4w9WgXcQ" de youtube.com/watch?v=dQw4w9WgXcQ)
//  - thumbnail: se genera automaticamente del youtubeId, o pon una URL custom
// ------------------------------------------------------------
export const VIDEOS = [
  {
    title: "ZvP Macro game — DarkLord vs Artosis",
    duration: "12:34",
    date: "hace 3 dias",
    youtubeId: "",
  },
  {
    title: "Clan war highlights — semana 12",
    duration: "8:21",
    date: "hace 1 semana",
    youtubeId: "",
  },
  {
    title: "Tutorial: Micro de mutas nivel pro",
    duration: "15:02",
    date: "hace 2 semanas",
    youtubeId: "",
  },
];

// ------------------------------------------------------------
//  EVENTOS
// ------------------------------------------------------------
export const EVENTS = [
  {
    month: "Abr",
    day: "05",
    title: "Torneo interno 1v1",
    desc: "Formato eliminacion directa — Bo3",
    status: "Abierto",
  },
  {
    month: "Abr",
    day: "12",
    title: "Clan War vs Nexus Order",
    desc: "5v5 — Preclasificados",
    status: "Pronto",
  },
  {
    month: "Abr",
    day: "20",
    title: "Stream night — Coaching en vivo",
    desc: "Sesion abierta con DarkLord",
    status: "Abierto",
  },
];

// ------------------------------------------------------------
//  COLORES — modifica si quieres otra paleta
// ------------------------------------------------------------
export const RACE_COLORS = {
  Terran: { bg: "rgba(100,160,200,0.12)", border: "rgba(100,160,200,0.35)", text: "#7ab8d4" },
  Zerg: { bg: "rgba(160,100,180,0.12)", border: "rgba(160,100,180,0.35)", text: "#c09ad8" },
  Protoss: { bg: "rgba(201,168,76,0.12)", border: "rgba(201,168,76,0.35)", text: "#c9a84c" },
};

export const TAG_COLORS = {
  Guia: { bg: "rgba(201,168,76,0.1)", color: "#c9a84c" },
  Recap: { bg: "rgba(139,92,92,0.15)", color: "#c9a08a" },
  Noticias: { bg: "rgba(107,92,62,0.2)", color: "#a89060" },
};

export const RANK_ORDER = { Lider: 0, Oficial: 1, Miembro: 2, Recruit: 3 };
