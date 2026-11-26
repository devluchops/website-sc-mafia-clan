---
description: Clan MAFIA — navegación centrada en Eventos; Torneos, Build Orders y Videos ocultos
paths: ["src/app/page-client.js", "src/app/admin/**", "src/components/CalendarSection.js", "src/app/api/admin/events/**"]
---

## La web se organiza alrededor de Eventos, no de módulos sueltos

Decisión del dueño (2026-11-26): todo lo de agenda y competencia del clan se maneja desde
**Eventos**, diferenciado por `event_type`. Las pestañas **Torneos** (Challonge), **Build Orders**
y **Videos** están **ocultas** y no se usan por ahora.

### Tabs públicos activos
`inicio`, `blog`, `roster` (Miembros), `events` (Eventos), `rules` (Reglas).
Definidos en `TABS` de `src/app/page-client.js`. Los ocultos siguen comentados ahí y su código
(secciones, APIs) permanece en el repo para reactivar fácil — no borrar.

### event_type (tipos de evento)
`showmatch`, `partida`, `torneo`, `reunion`, `anuncio`, `evento`. Cada uno tiene color en el
calendario (`EVENT_TYPES` en `src/components/CalendarSection.js`).

### Cómo aplicar
- **No** volver a mostrar Torneos, Build Orders ni Videos en el nav público sin que el dueño lo pida.
- Funcionalidad nueva de agenda/competencia se modela como un `event_type` dentro de Eventos,
  **no** como un módulo/pestaña nueva.
- La tarjeta del hero muestra el **próximo evento** (desde `events`), no un torneo de Challonge.
- El calendario (mes grande + panel lateral por colores) es la vista principal de Eventos.

### Por qué existe esta regla
Menos secciones, agenda centralizada y clara. Reintroducir módulos sueltos va en contra de la
decisión; si se necesitan de nuevo, se habla primero.
