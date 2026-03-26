# MAFIA - Clan StarCraft Website

Sitio web oficial del clan MAFIA de StarCraft Remastered.

## 🎮 Características

- **Roster de Miembros** - Sistema de ranking por nivel (S, A+, A, B+, B, C+, C, D+, D)
- **Blog de Noticias** - Publicaciones con imágenes sobre torneos y eventos
- **Videos y Replays** - Integración con YouTube para ver partidas destacadas
- **Calendario de Eventos** - ShowMatches y torneos con integración a Google Calendar
- **Reglas del Clan** - Código de conducta y compromisos de miembros
- **Perfiles de Jugadores** - Información detallada con redes sociales
- **Panel Admin** - Gestión completa de contenido con autenticación Discord

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Base de Datos**: Neon Postgres
- **Autenticación**: NextAuth.js con Discord OAuth
- **Hosting**: Vercel
- **Estilos**: Inline CSS con tema dorado personalizado

## ⚙️ Variables de Entorno Requeridas

Crea un archivo `.env.local` con:

```env
# Database (Neon Postgres)
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=tu-secret-generado
NEXTAUTH_URL=http://localhost:3000

# Discord OAuth (obtén en https://discord.com/developers/applications)
DISCORD_CLIENT_ID=tu-client-id
DISCORD_CLIENT_SECRET=tu-client-secret
DISCORD_ALLOWED_ID=tu-discord-user-id
```

## 🚀 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📦 Despliegue en Vercel

1. **Conecta el repositorio** a Vercel
2. **Configura las variables de entorno** en Vercel Dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (tu dominio de Vercel)
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `DISCORD_ALLOWED_ID`
3. **Despliega** automáticamente

## 🔐 Panel de Administración

Accede a `/admin` después de autenticarte con Discord.

Desde el panel puedes:
- Gestionar miembros del clan
- Publicar posts con imágenes
- Agregar videos de YouTube
- Crear eventos y torneos
- Administrar reglas del clan

## 📁 Estructura

```
clan-mafia/
├── public/
│   ├── logo.png
│   ├── posts/          # Imágenes de publicaciones
│   └── members/        # Avatares de miembros
├── src/
│   ├── app/
│   │   ├── admin/      # Panel de administración
│   │   ├── api/        # API routes
│   │   └── login/      # Autenticación
│   ├── components/     # Componentes reutilizables
│   └── lib/            # Utilidades (auth, db)
└── package.json
```

## 📄 Licencia

© 2025 MAFIA Clan - StarCraft Remastered
