# 🗄️ Configuración de la Base de Datos - Neon Postgres

## ✨ Mucho más simple que GitHub API

Con Neon Postgres tu panel admin:
- ✅ Actualiza instantáneamente (sin esperar rebuilds)
- ✅ Es más rápido
- ✅ Puedes subir imágenes fácilmente
- ✅ Gratis hasta 256MB (suficiente para años)

---

## 📋 Paso 1: Crear cuenta en Neon

1. Ve a: https://neon.tech
2. Click en **"Sign Up"**
3. Usa tu cuenta de GitHub para registrarte (más rápido)
4. Confirma tu email

---

## 📊 Paso 2: Crear base de datos

1. Una vez dentro de Neon, click en **"Create a project"**
2. Configuración:
   - **Project name:** clan-mafia
   - **Postgres version:** 16 (la más reciente)
   - **Region:** Elige la más cercana (US East si estás en América)
3. Click en **"Create project"**
4. **Espera 10-20 segundos** mientras se crea

---

## 🔑 Paso 3: Obtener la URL de conexión

1. En el dashboard de tu proyecto, verás una sección **"Connection Details"**
2. Selecciona la pestaña **"Pooled connection"** (recomendado para Vercel)
3. Copia la **Connection string** que se ve así:
   ```
   postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. **Guarda esta URL** - la necesitarás en el siguiente paso

---

## ⚙️ Paso 4: Configurar en Vercel

### Opción A: Desde el Dashboard de Vercel (Recomendado)

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Click en **Settings** → **Environment Variables**
3. Agrega una nueva variable:
   - **Name:** `DATABASE_URL`
   - **Value:** (pega la URL que copiaste de Neon)
   - **Environment:** Marca todas (Production, Preview, Development)
4. Click en **Save**

### Opción B: Integración Neon + Vercel (Más fácil)

1. En Neon, ve a **Integrations** en el menú lateral
2. Click en **Vercel** → **Connect**
3. Autoriza la conexión
4. Selecciona tu proyecto **website-sc-mafia-clan**
5. Listo - Neon configura automáticamente la variable `DATABASE_URL`

---

## 🚀 Paso 5: Inicializar la base de datos

Después de configurar `DATABASE_URL` en Vercel:

1. Ve a la pestaña **Deployments**
2. Click en los 3 puntos **⋯** del deployment más reciente → **Redeploy**
3. Confirma el redeploy
4. **Espera a que termine el deployment** (~1-2 minutos)
5. Una vez desplegado, ve a:
   ```
   https://tu-dominio.vercel.app/api/setup-db
   ```
6. Deberías ver:
   ```json
   {
     "success": true,
     "message": "Base de datos configurada correctamente"
   }
   ```

**¡Listo!** La base de datos está configurada con todos tus datos iniciales.

---

## ✅ Paso 6: Probar el sitio

1. Ve a tu sitio: `https://tu-dominio.vercel.app`
2. Debería verse exactamente igual que antes
3. Ahora ve al panel admin: `https://tu-dominio.vercel.app/admin`
4. Inicia sesión con GitHub
5. Edita el nombre o tagline del clan
6. Click en **"Guardar"**
7. **Refresca la página principal** - verás los cambios al instante ⚡

---

## 🎯 ¿Qué puedes hacer ahora?

Desde el panel admin puedes:
- ✅ Cambiar nombre y tagline del clan (ya funciona)
- ✅ Ver todos los miembros
- 🚧 Agregar/editar/eliminar miembros (próximamente)
- 🚧 Crear y editar posts (próximamente)
- 🚧 Subir logos e imágenes (próximamente)

---

## 💡 Ventajas vs GitHub API

| Feature | GitHub API | Neon Postgres |
|---------|-----------|---------------|
| Velocidad de actualización | 1-2 minutos (rebuild) | Instantáneo ⚡ |
| Configuración | Compleja (tokens OAuth) | Simple (1 URL) |
| Subir imágenes | Difícil | Fácil |
| Costo | $0 siempre | $0 hasta 256MB |
| Límites | Sin límites | 256MB gratis (suficiente) |

---

## ❓ Problemas comunes

**"Error: DATABASE_URL no está configurado"**
→ Verifica que agregaste la variable en Vercel y redeployeaste

**La URL /api/setup-db da error 500**
→ Revisa que la DATABASE_URL sea correcta (debe empezar con `postgresql://`)

**Los cambios no se ven**
→ Refresca la página con Ctrl+F5 (o Cmd+Shift+R en Mac)

---

## 📊 Monitorear la base de datos

En el dashboard de Neon puedes ver:
- Espacio usado (de los 256MB gratuitos)
- Queries ejecutadas
- Usuarios conectados
- Logs de la base de datos

---

## 🔒 Seguridad de GitHub OAuth

Todavía necesitas configurar GitHub OAuth para el login del admin:

1. Ve a: https://github.com/settings/developers
2. Click en **"New OAuth App"**
3. Llena:
   - **Application name:** Clan MAFIA Admin
   - **Homepage URL:** `https://tu-dominio.vercel.app`
   - **Callback URL:** `https://tu-dominio.vercel.app/api/auth/callback/github`
4. Guarda el **Client ID** y **Client Secret**
5. Agrégalos en Vercel Environment Variables:
   - `GITHUB_ID` = tu client ID
   - `GITHUB_SECRET` = tu client secret
   - `GITHUB_ALLOWED_USERS` = tu username de GitHub
   - `NEXTAUTH_SECRET` = (genera con `openssl rand -base64 32`)
   - `NEXTAUTH_URL` = tu URL de Vercel
6. Redeploy

---

## 🎉 ¡Listo!

Ahora tienes:
- ✅ Base de datos Neon Postgres configurada
- ✅ Panel admin funcional
- ✅ Actualizaciones instantáneas
- ✅ Todo gratis hasta 256MB

¿Necesitas ayuda? Avísame y te guío paso a paso.
