# 🎮 Configuración de Discord OAuth - Panel Admin

## ✨ Perfecto para clanes de gaming

Discord OAuth permite que los miembros de tu clan accedan al panel admin usando su cuenta de Discord.

**Ventajas:**
- ✅ Todos los gamers tienen Discord
- ✅ Control total: solo entran los que tú autorices
- ✅ Gratis y seguro
- ✅ Fácil para usuarios no técnicos

---

## 📋 Paso 1: Crear Discord Application

1. Ve a: https://discord.com/developers/applications
2. Click en **"New Application"**
3. Nombre: `Clan MAFIA Admin` (o el que quieras)
4. Acepta los términos → **"Create"**

---

## 🔧 Paso 2: Configurar OAuth2

1. En el menú lateral, click en **"OAuth2"**
2. En la sección **"Redirects"**, click en **"Add Redirect"**
3. Agrega tu URL de callback:
   ```
   https://tu-dominio.vercel.app/api/auth/callback/discord
   ```
   Ejemplo: `https://website-sc-mafia-clan.vercel.app/api/auth/callback/discord`
4. Click en **"Save Changes"**

---

## 🔑 Paso 3: Obtener credenciales

1. En la misma página de **"OAuth2"**
2. Copia el **"CLIENT ID"** (botón Copy)
3. En **"CLIENT SECRET"**, click en **"Reset Secret"** → **"Yes, do it!"**
4. Copia el **"CLIENT SECRET"** (solo se muestra una vez)

**Guarda estos dos valores:**
- `DISCORD_CLIENT_ID` = tu Client ID
- `DISCORD_CLIENT_SECRET` = tu Client Secret

---

## 👥 Paso 4: Obtener los Discord IDs de tus admins

Para permitir acceso a alguien, necesitas su Discord username#tag o ID.

### Opción A: Username con discriminador (Fácil)

Pídeles que te den su username completo:
- Ejemplo: `DarkLord#1234`
- Ejemplo: `ShadowKing#5678`

### Opción B: Discord ID (Más seguro)

1. En Discord, activa **"Modo Desarrollador"**:
   - Settings → Advanced → Developer Mode (ON)
2. Click derecho en el usuario → **"Copy User ID"**
3. Te da un número: `123456789012345678`

---

## ⚙️ Paso 5: Configurar en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Click en tu proyecto
3. **Settings** → **Environment Variables**
4. Agrega estas variables (una por una):

### Variables requeridas:

```bash
# Discord OAuth
DISCORD_CLIENT_ID=tu_client_id_del_paso_3
DISCORD_CLIENT_SECRET=tu_client_secret_del_paso_3

# Usuarios permitidos (separados por coma, sin espacios)
DISCORD_ALLOWED_USERS=DarkLord#1234,ShadowKing#5678,NexusGod#9012

# NextAuth Secret (genera con: openssl rand -base64 32)
NEXTAUTH_SECRET=tu_secret_generado

# URL de tu sitio
NEXTAUTH_URL=https://tu-dominio.vercel.app
```

### Generar NEXTAUTH_SECRET:

En tu terminal:
```bash
openssl rand -base64 32
```
Copia el resultado y úsalo como `NEXTAUTH_SECRET`

**IMPORTANTE:** Marca las 3 opciones (Production, Preview, Development) para cada variable.

---

## 🚀 Paso 6: Redeploy

1. Ve a la pestaña **"Deployments"**
2. Click en los 3 puntos **⋯** del deployment más reciente
3. Click en **"Redeploy"**
4. Espera 1-2 minutos

---

## ✅ Paso 7: Probar el login

1. Ve a: `https://tu-dominio.vercel.app/admin`
2. Deberías ver el botón **"🎮 Iniciar sesión con Discord"**
3. Click → Te lleva a Discord
4. Discord pregunta: "¿Autorizar Clan MAFIA Admin?"
5. Click **"Authorize"**
6. Regresas al panel admin → ¡Ya estás dentro!

---

## 👥 Gestionar acceso de usuarios

### ✅ Para agregar un nuevo admin:

1. Consigue su Discord username#tag (ej: `VoidReaper#4321`)
2. Ve a Vercel → Settings → Environment Variables
3. Edita `DISCORD_ALLOWED_USERS`
4. Agrega el nuevo usuario (separado por coma):
   ```
   DarkLord#1234,ShadowKing#5678,VoidReaper#4321
   ```
5. **Save** → **Redeploy**
6. Listo, ese usuario ya puede entrar

### ❌ Para quitar acceso:

1. Edita `DISCORD_ALLOWED_USERS`
2. Borra el username del usuario
3. **Save** → **Redeploy**
4. Ya no podrá acceder

---

## 🔒 Seguridad

**¿Quién puede intentar hacer login?**
- Cualquiera puede ver `/admin` y el botón de Discord

**¿Quién puede entrar realmente?**
- SOLO los usuarios en `DISCORD_ALLOWED_USERS`
- Aunque alguien tenga Discord, si no está en la lista → Acceso denegado

**¿Es seguro?**
- ✅ Discord verifica la identidad del usuario
- ✅ Tu código verifica si está autorizado
- ✅ Nadie puede "hackear" el acceso sin estar en la lista

---

## 📊 Ejemplo completo de configuración

```bash
# En Vercel Environment Variables:

DISCORD_CLIENT_ID=987654321098765432
DISCORD_CLIENT_SECRET=abc123def456ghi789jkl012mno345pqr678
DISCORD_ALLOWED_USERS=DarkLord#1234,ShadowKing#5678,NexusGod#9012
NEXTAUTH_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
NEXTAUTH_URL=https://tu-dominio.vercel.app
DATABASE_URL=postgresql://user:pass@host/db
```

---

## ❓ Problemas comunes

**"Error: redirect_uri_mismatch"**
→ Verifica que la URL de callback en Discord sea exactamente igual a tu dominio de Vercel

**"Access Denied" al hacer login**
→ Verifica que tu Discord username#tag esté en `DISCORD_ALLOWED_USERS`

**El botón no aparece**
→ Verifica que `DISCORD_CLIENT_ID` y `DISCORD_CLIENT_SECRET` estén configurados

**"Invalid client"**
→ Verifica que copiaste correctamente el Client Secret (se muestra solo una vez)

---

## 🎉 ¡Listo!

Ahora tu clan puede:
- ✅ Entrar a `/admin` con Discord
- ✅ Editar información del clan
- ✅ Gestionar miembros, posts, eventos
- ✅ Todo desde el navegador, sin tocar código

---

## 💡 Tips

**Para encontrar tu Discord username#tag:**
1. Abre Discord
2. Settings → My Account
3. Ahí está tu **USERNAME** y **#TAG**

**Para Discord sin discriminador (nuevo sistema):**
Si Discord ya no usa #1234, usa solo el username o el ID:
```
DISCORD_ALLOWED_USERS=darklord,shadowking,123456789012345678
```

---

## 📞 ¿Necesitas ayuda?

Si tienes problemas con la configuración, revisa:
1. Que las URLs de callback coincidan exactamente
2. Que los usernames estén escritos correctamente
3. Que hayas redeployeado después de agregar las variables

¡Disfruta tu panel admin con Discord! 🎮
