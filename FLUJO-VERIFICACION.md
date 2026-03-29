# 🔐 Flujo Completo de Verificación de Email

## 📋 Resumen del Sistema

El sistema combina **Discord OAuth2** (para autenticación) con **Email Verification** (para seguridad).

---

## 🎯 Flujo Completo

### **Caso 1: Admin crea miembro CON email**

```
ADMIN en panel /admin/miembros:
  ├─ Nombre: MAFIA]`Roma
  ├─ Discord: lucho264849
  ├─ Email: lvalencia1286@gmail.com ✅
  └─ Teléfono: +51 966 346 424 (opcional)
       ↓
Sistema guarda en DB:
  ├─ email: lvalencia1286@gmail.com
  ├─ email_verified: false
  ├─ last_login_at: NULL
  └─ invite_sent_at: NULL
       ↓
Sistema detecta: email + Discord + sin login
       ↓
Envía EMAIL DE INVITACIÓN automáticamente 📧
  ├─ Asunto: "¡Bienvenido al Clan MAFIA! 🎮"
  ├─ Contenido: Info del clan + botón "Iniciar Sesión con Discord"
  └─ From: Clan MAFIA <noreply@devluchops.space>
       ↓
Actualiza DB:
  └─ invite_sent_at: NOW()
       ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

USUARIO recibe email → Click en "Iniciar Sesión"
       ↓
Redirect a: https://clanmafia.devluchops.space/login
       ↓
Usuario hace click: "Iniciar Sesión con Discord"
       ↓
Discord OAuth2:
  ├─ Autorización en Discord
  ├─ Callback a /api/auth/callback/discord
  └─ Sistema obtiene: Discord ID + Username
       ↓
Sistema busca en DB:
  ├─ Busca por social_discord (username)
  └─ Encuentra al miembro ✅
       ↓
Sistema actualiza:
  ├─ discord_id = "758207301714182144"
  ├─ last_login_at = NOW()
  └─ Crea entrada en discord_authorized_users (si no existe)
       ↓
Login EXITOSO → Sesión creada ✅
       ↓
Middleware verifica:
  ├─ ¿Tiene sesión? → SÍ ✅
  ├─ ¿Tiene email? → SÍ ✅
  └─ ¿Email verificado? → NO ❌
       ↓
Redirect a: /verify-email
       ↓
Página /verify-email carga:
  ├─ Detecta: Ya tiene email en DB
  ├─ Pre-llena formulario:
  │    ├─ Email: lvalencia1286@gmail.com
  │    └─ Teléfono: +51 966 346 424
  └─ Muestra: "Email actual: xxx"
       ↓
Usuario ve opciones:
  ├─ [Cambiar email] (editar campo)
  └─ [Reenviar Código de Verificación]
       ↓
Usuario hace click: "Reenviar Código de Verificación"
       ↓
Sistema:
  ├─ Genera token único (24h de validez)
  ├─ Guarda: verification_token + expires
  └─ Envía EMAIL DE VERIFICACIÓN 📧
       ↓
Usuario recibe email:
  ├─ Asunto: "Verifica tu email - Clan MAFIA 🔐"
  ├─ Contenido: Link de verificación
  └─ Link: https://clanmafia.devluchops.space/api/verify-token?token=abc123...
       ↓
Usuario hace click en el link
       ↓
API /api/verify-token:
  ├─ Valida token
  ├─ Verifica que no expiró
  └─ Actualiza DB:
       ├─ email_verified = true ✅
       ├─ verification_token = NULL
       └─ verification_token_expires = NULL
       ↓
Redirect a: /?verified=true
       ↓
Usuario ve mensaje: "¡Email verificado! ✅"
       ↓
Middleware verifica:
  ├─ ¿Tiene sesión? → SÍ ✅
  ├─ ¿Email verificado? → SÍ ✅
  └─ Permite acceso completo
       ↓
USUARIO CON ACCESO COMPLETO 🎉
```

---

### **Caso 2: Admin crea miembro SIN email**

```
ADMIN en panel /admin/miembros:
  ├─ Nombre: MAFIA]`Zeta
  ├─ Discord: zeta_user
  ├─ Email: [vacío] ❌
  └─ Teléfono: [vacío]
       ↓
Sistema guarda en DB:
  ├─ email: NULL
  ├─ email_verified: false
  ├─ last_login_at: NULL
  └─ invite_sent_at: NULL
       ↓
Sistema detecta: NO tiene email
       ↓
NO envía invite email (no hay destinatario)
       ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

USUARIO intenta hacer login:
       ↓
Click: "Iniciar Sesión con Discord"
       ↓
Discord OAuth2 → Login exitoso ✅
       ↓
Middleware verifica:
  ├─ ¿Tiene sesión? → SÍ ✅
  ├─ ¿Tiene email? → NO ❌
  └─ email_verified: false
       ↓
Redirect a: /verify-email
       ↓
Página /verify-email carga:
  ├─ Detecta: NO tiene email en DB
  └─ Muestra formulario vacío
       ↓
Usuario ingresa:
  ├─ Email: zeta@email.com
  └─ Teléfono: +51 999 888 777 (opcional)
       ↓
Click: "Enviar Código de Verificación"
       ↓
Sistema:
  ├─ Guarda email en DB
  ├─ Genera token de verificación
  └─ Envía EMAIL DE VERIFICACIÓN 📧
       ↓
[Resto del flujo igual que Caso 1]
       ↓
Email verificado → Acceso completo ✅
```

---

### **Caso 3: Usuario CON email verificado**

```
USUARIO hace login:
       ↓
Discord OAuth2 → Login exitoso ✅
       ↓
Middleware verifica:
  ├─ ¿Tiene sesión? → SÍ ✅
  └─ ¿Email verificado? → SÍ ✅
       ↓
ACCESO DIRECTO AL SITIO 🎉
(Sin pasar por /verify-email)
```

---

## 🧪 Cómo Probar el Flujo

### **Preparación:**

1. **Verificar dominio en Resend:**
   ```
   https://resend.com/domains
   Buscar: devluchops.space
   Debe tener ✅ en SPF, DKIM, MX
   ```

2. **Variables de entorno en Vercel:**
   ```bash
   RESEND_API_KEY=re_xxx...
   RESEND_FROM_EMAIL=Clan MAFIA <noreply@devluchops.space>
   NEXT_PUBLIC_SITE_URL=https://clanmafia.devluchops.space
   ```

### **Test Caso 1: Con email**

1. Ir a: https://clanmafia.devluchops.space/admin
2. Crear nuevo miembro:
   - Nombre: MAFIA]`TestUser1
   - Discord: test_user_1
   - Email: tu_email@gmail.com ✅
3. Guardar
4. **Verificar:** Debería llegar email de invitación 📧
5. Revisar inbox: tu_email@gmail.com
6. Click en "Iniciar Sesión con Discord"
7. Login con Discord (cuenta test_user_1)
8. **Debería:** Redirect a /verify-email
9. Ver email pre-llenado
10. Click "Reenviar Código"
11. **Verificar:** Llega email de verificación 📧
12. Click en link del email
13. **Resultado:** Email verificado ✅ + acceso completo

### **Test Caso 2: Sin email**

1. Crear miembro sin email
2. Login con Discord
3. **Debería:** Redirect a /verify-email
4. Ver formulario vacío
5. Ingresar email
6. Click "Enviar Código"
7. **Verificar:** Llega email de verificación 📧
8. Click en link
9. **Resultado:** Email verificado ✅

### **Test Caso 3: Ya verificado**

1. Login con usuario que ya verificó email
2. **Resultado:** Acceso directo al sitio 🎉

---

## 📊 Base de Datos - Estados

### **Miembro SIN email (recién creado):**
```sql
{
  email: NULL,
  email_verified: false,
  verification_token: NULL,
  verification_token_expires: NULL,
  invite_sent_at: NULL,
  last_login_at: NULL,
  discord_id: NULL
}
```

### **Miembro CON email (invite enviado):**
```sql
{
  email: "user@email.com",
  email_verified: false,
  verification_token: NULL,
  verification_token_expires: NULL,
  invite_sent_at: "2026-03-29 12:00:00",  ← Email enviado
  last_login_at: NULL,
  discord_id: NULL
}
```

### **Miembro esperando verificación:**
```sql
{
  email: "user@email.com",
  email_verified: false,
  verification_token: "abc123...",           ← Token generado
  verification_token_expires: "2026-03-30",  ← Expira en 24h
  invite_sent_at: "2026-03-29 12:00:00",
  last_login_at: "2026-03-29 13:00:00",     ← Ya hizo login
  discord_id: "758207301714182144"          ← Discord ID asignado
}
```

### **Miembro VERIFICADO:**
```sql
{
  email: "user@email.com",
  email_verified: true,                      ← VERIFICADO ✅
  verification_token: NULL,                  ← Token limpiado
  verification_token_expires: NULL,
  invite_sent_at: "2026-03-29 12:00:00",
  last_login_at: "2026-03-29 13:00:00",
  discord_id: "758207301714182144"
}
```

---

## ✅ Checklist de Funcionamiento

- [ ] Admin puede crear miembro con email → Invite enviado
- [ ] Admin puede crear miembro sin email → No envía email
- [ ] Usuario con email puede hacer login → Redirect a /verify-email
- [ ] Usuario sin email puede hacer login → Redirect a /verify-email
- [ ] /verify-email muestra email pre-llenado si existe
- [ ] /verify-email muestra formulario vacío si no existe
- [ ] Botón "Reenviar" funciona correctamente
- [ ] Email de verificación llega al inbox
- [ ] Link de verificación funciona (marca email_verified = true)
- [ ] Usuario verificado accede directamente al sitio
- [ ] Middleware bloquea acceso sin verificación
- [ ] Middleware permite acceso con verificación

---

## 🚨 Troubleshooting

### **Email no llega:**
1. Verificar dominio en Resend (SPF, DKIM, MX)
2. Revisar logs en https://resend.com/emails
3. Revisar carpeta de spam
4. Verificar RESEND_API_KEY en Vercel

### **Redirect loop:**
1. Verificar middleware.js
2. Verificar email_verified en DB
3. Limpiar cookies/cache del navegador

### **Token expirado:**
1. Token válido por 24 horas
2. Reenviar código de verificación
3. Nuevo token generado

---

## 📌 Notas Importantes

1. **Email es OPCIONAL al crear miembro**
   - Con email → Invite automático
   - Sin email → Usuario lo ingresa al login

2. **Verificación es OBLIGATORIA**
   - Middleware bloquea acceso sin email_verified = true
   - No hay bypass (excepto rutas públicas)

3. **Discord es la autenticación principal**
   - OAuth2 para login
   - Email solo para verificación/notificaciones

4. **Tokens expiran en 24 horas**
   - Se puede reenviar código sin límite
   - Token anterior se invalida al generar uno nuevo
