# 🎮 Configuración del Panel de Administración - Clan MAFIA

## 📋 Requisitos previos

- Cuenta de GitHub (la que ya tienes)
- Repositorio del proyecto (ya está listo)
- Acceso a Vercel (ya tienes el proyecto desplegado)

## 🔧 Configuración en 5 pasos

### 1️⃣ Crear GitHub OAuth App

1. Ve a: https://github.com/settings/developers
2. Click en **"New OAuth App"**
3. Llena los datos:
   - **Application name:** Clan MAFIA Admin
   - **Homepage URL:** `https://tu-dominio.vercel.app` (o tu URL de Vercel)
   - **Authorization callback URL:** `https://tu-dominio.vercel.app/api/auth/callback/github`
4. Click en **"Register application"**
5. **Guarda estos valores:**
   - **Client ID** → Lo usarás como `GITHUB_ID`
   - Click en **"Generate a new client secret"** → Guarda el secret como `GITHUB_SECRET`

### 2️⃣ Crear GitHub Personal Access Token

1. Ve a: https://github.com/settings/tokens
2. Click en **"Generate new token"** → **"Generate new token (classic)"**
3. Configuración:
   - **Note:** Clan MAFIA Admin Token
   - **Expiration:** No expiration (o 1 año)
   - **Scopes:** Marca solo ✅ **repo** (full control of private repositories)
4. Click en **"Generate token"**
5. **COPIA EL TOKEN INMEDIATAMENTE** → Lo usarás como `GITHUB_TOKEN`

### 3️⃣ Generar NextAuth Secret

Abre tu terminal y ejecuta:

```bash
openssl rand -base64 32
```

Copia el resultado → Lo usarás como `NEXTAUTH_SECRET`

### 4️⃣ Configurar Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Click en tu proyecto **"website-sc-mafia-clan"**
3. Ve a **Settings** → **Environment Variables**
4. Agrega estas variables (una por una):

```
GITHUB_ID=tu_client_id_del_paso_1
GITHUB_SECRET=tu_client_secret_del_paso_1
GITHUB_TOKEN=tu_personal_access_token_del_paso_2
GITHUB_REPO=devluchops/website-sc-mafia-clan
GITHUB_ALLOWED_USERS=tu_usuario_github
NEXTAUTH_SECRET=tu_secret_generado_del_paso_3
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXT_PUBLIC_GITHUB_REPO=devluchops/website-sc-mafia-clan
```

**IMPORTANTE:** En `GITHUB_ALLOWED_USERS` pon tu username de GitHub (por ejemplo: `devluchops`)

5. Click en **Save** para cada variable

### 5️⃣ Redeploy en Vercel

1. Ve a la pestaña **Deployments**
2. Click en el deployment más reciente
3. Click en los 3 puntos **⋯** → **Redeploy**
4. Confirma el redeploy

## ✅ Probar el Panel Admin

Una vez que Vercel termine el despliegue:

1. Ve a: `https://tu-dominio.vercel.app/admin`
2. Click en **"Iniciar sesión con GitHub"**
3. Autoriza la aplicación
4. ¡Listo! Ya puedes editar tu sitio

## 🎯 ¿Qué puedes hacer en el panel?

✅ Cambiar el nombre del clan
✅ Cambiar el tagline/frase
✅ Ver todos los miembros
✅ Ver posts y eventos
✅ Todo se guarda automáticamente en GitHub
✅ Vercel reconstruye el sitio cada vez que guardas

## 🔒 Seguridad

- Solo TÚ puedes acceder (configurado en `GITHUB_ALLOWED_USERS`)
- La autenticación es con GitHub OAuth (segura)
- Los cambios se guardan en tu repositorio Git (todo versionado)

## 💡 Próximos pasos (opcional)

Si quieres funcionalidad completa para:
- Subir logos desde el panel
- Editar miembros con interfaz visual
- Crear/editar posts completos
- Gestionar videos y eventos

Avísame y creo las interfaces completas. Por ahora tienes lo básico funcional.

## ❓ Problemas comunes

**Error: "Not authorized"**
→ Verifica que tu username esté en `GITHUB_ALLOWED_USERS`

**Error al guardar cambios**
→ Verifica que el `GITHUB_TOKEN` tenga permisos de `repo`

**No puedes hacer login**
→ Verifica que el `NEXTAUTH_URL` sea exactamente tu URL de Vercel

## 📞 Soporte

Si tienes problemas con la configuración, avísame y te ayudo paso a paso.
