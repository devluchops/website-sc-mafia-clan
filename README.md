# Clan MAFIA — Sitio Web StarCraft

Sitio oficial del Clan MAFIA. Hecho con Next.js, deploy en Vercel.

## Estructura del proyecto

```
clan-mafia/
├── public/
│   ├── logo.png              ← Tu logo del clan aqui
│   └── members/              ← Fotos de los miembros aqui
│       ├── darklord.jpg
│       ├── shadowking.jpg
│       └── ...
├── src/
│   ├── data/
│   │   └── clan-data.js      ← EDITA ESTE ARCHIVO para cambiar todo el contenido
│   └── app/
│       ├── globals.css
│       ├── layout.js
│       └── page.js
├── package.json
└── next.config.js
```

## Setup rapido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Agregar tus imagenes
- Pon tu logo en `public/logo.png`
- Crea la carpeta `public/members/` y pon las fotos de cada miembro
- Los nombres deben coincidir con lo que pusiste en `src/data/clan-data.js`

### 3. Editar datos del clan
Abre `src/data/clan-data.js` y modifica:
- **CLAN** — nombre, tagline, ruta del logo
- **MEMBERS** — agrega/quita miembros, cambia avatares, MMR, rango
- **POSTS** — publicaciones del blog
- **VIDEOS** — agrega el `youtubeId` de cada video (el ID que aparece en la URL de YouTube)
- **EVENTS** — proximos torneos y actividades

### 4. Probar localmente
```bash
npm run dev
```
Abre http://localhost:3000

### 5. Subir a GitHub
```bash
git init
git add .
git commit -m "Clan MAFIA site"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/clan-mafia.git
git push -u origin main
```

### 6. Deploy en Vercel
1. Ve a https://vercel.com y logueate con tu cuenta de GitHub
2. Click en "Add New Project"
3. Importa el repo `clan-mafia`
4. Click en "Deploy" (no necesitas cambiar nada, Vercel detecta Next.js automaticamente)
5. En ~1 minuto tendras tu sitio en `clan-mafia.vercel.app`

### 7. Dominio custom (opcional)
En el dashboard de Vercel > Settings > Domains, puedes agregar un dominio propio como `clanmafia.gg`.

## Para actualizar el sitio
Solo edita `src/data/clan-data.js`, haz commit y push. Vercel hace deploy automatico.
