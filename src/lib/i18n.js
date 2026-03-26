// Sistema de traducción simple
const translations = {
  es: {
    // Navbar
    blog: "Blog",
    videos: "Videos",
    members: "Miembros",
    events: "Eventos",
    admin: "Admin",

    // Hero
    tagline: "El mejor clan del StarCraft en mapa Fastest",

    // Sections
    recentPosts: "Publicaciones recientes",
    clanMembers: "Miembros del clan",
    upcomingEvents: "Próximos eventos",

    // Member
    by: "Por",
    readTime: "lectura",
    sortByRank: "Por rango",
    sortByMMR: "Por MMR",
    sortByName: "Por nombre",
    level: "Nivel",
    mainRace: "Raza Principal",
    racesPlayed: "Razas que Juega",
    socialMedia: "Redes Sociales",
    close: "Cerrar",

    // Events
    open: "Abierto",
    closed: "Cerrado",
    finished: "Finalizado",

    // Footer
    facebook: "Facebook",
    whatsapp: "WhatsApp",

    // Admin
    adminPanel: "Panel Admin",
    viewSite: "Ver Sitio",
    logout: "Cerrar Sesión",
    clanInfo: "Información del Clan",
    clanName: "Nombre del Clan",
    taglineLabel: "Frase / Tagline",
    saveChanges: "Guardar Cambios",
    clanLogo: "Logo del Clan",
    uploadLogo: "Subir Logo",
    addMember: "Agregar Miembro",
    editMember: "Editar Miembro",
    deleteMember: "Eliminar",
    edit: "Editar",
    total: "Total",
    save: "Guardar",
    cancel: "Cancelar",
    name: "Nombre",
    rank: "Rango",
    leader: "Líder",
    officer: "Oficial",
    member: "Miembro",
    recruit: "Recluta",
    avatar: "Avatar",
    posts: "Posts del Blog",
    addPost: "Agregar Post",
    addVideo: "Agregar Video",
    addEvent: "Agregar Evento",
  },
  en: {
    // Navbar
    blog: "Blog",
    videos: "Videos",
    members: "Members",
    events: "Events",
    admin: "Admin",

    // Hero
    tagline: "The best StarCraft clan on Fastest map",

    // Sections
    recentPosts: "Recent Posts",
    clanMembers: "Clan Members",
    upcomingEvents: "Upcoming Events",

    // Member
    by: "By",
    readTime: "read",
    sortByRank: "By Rank",
    sortByMMR: "By MMR",
    sortByName: "By Name",
    level: "Level",
    mainRace: "Main Race",
    racesPlayed: "Races Played",
    socialMedia: "Social Media",
    close: "Close",

    // Events
    open: "Open",
    closed: "Closed",
    finished: "Finished",

    // Footer
    facebook: "Facebook",
    whatsapp: "WhatsApp",

    // Admin
    adminPanel: "Admin Panel",
    viewSite: "View Site",
    logout: "Logout",
    clanInfo: "Clan Information",
    clanName: "Clan Name",
    taglineLabel: "Tagline",
    saveChanges: "Save Changes",
    clanLogo: "Clan Logo",
    uploadLogo: "Upload Logo",
    addMember: "Add Member",
    editMember: "Edit Member",
    deleteMember: "Delete",
    edit: "Edit",
    total: "Total",
    save: "Save",
    cancel: "Cancel",
    name: "Name",
    rank: "Rank",
    leader: "Leader",
    officer: "Officer",
    member: "Member",
    recruit: "Recruit",
    avatar: "Avatar",
    posts: "Blog Posts",
    addPost: "Add Post",
    addVideo: "Add Video",
    addEvent: "Add Event",
  }
};

export function getLanguage() {
  if (typeof window === 'undefined') return 'es';

  const browserLang = navigator.language || navigator.userLanguage;
  return browserLang.startsWith('en') ? 'en' : 'es';
}

export function useTranslation() {
  const lang = getLanguage();

  const t = (key) => {
    return translations[lang][key] || translations['es'][key] || key;
  };

  return { t, lang };
}
