# Configuración de Resend para Notificaciones por Email

Este documento explica cómo configurar Resend para las notificaciones por email del sitio del Clan MAFIA.

## 📧 Tipos de Emails Implementados

1. **Email de Invitación**: Se envía automáticamente a miembros cuando tienen email + Discord configurados pero aún no han iniciado sesión
2. **Notificación de Respuesta**: Se envía cuando alguien responde a tu comentario en el blog
3. **Notificación de Nuevo Post**: Se envía a todos los miembros cuando se publica un nuevo post en el blog

## 🚀 Configuración Inicial

### 1. Crear cuenta en Resend

1. Ve a [https://resend.com](https://resend.com)
2. Crea una cuenta gratuita (incluye 3,000 emails/mes gratis)
3. Verifica tu email

### 2. Configurar dominio (Opcional pero recomendado)

**Opción A: Usar tu propio dominio**
1. En el dashboard de Resend, ve a "Domains"
2. Click en "Add Domain"
3. Ingresa tu dominio (ej: `clanmafia.com`)
4. Sigue las instrucciones para agregar los DNS records
5. Espera la verificación (puede tomar hasta 72 horas)

**Opción B: Usar el dominio de desarrollo de Resend**
- Por defecto puedes usar `onboarding@resend.dev`
- Solo funciona para pruebas (emails limitados)

### 3. Obtener API Key

1. En el dashboard de Resend, ve a "API Keys"
2. Click en "Create API Key"
3. Dale un nombre (ej: "Clan MAFIA Production")
4. Selecciona los permisos: "Sending access"
5. Copia la API key (empieza con `re_`)

### 4. Configurar Variables de Entorno

Agrega las siguientes variables a tu archivo `.env.local`:

```bash
# Resend (Email Service)
RESEND_API_KEY=re_tu_api_key_aqui
RESEND_FROM_EMAIL=Clan MAFIA <noreply@tudominio.com>

# Site URL
NEXT_PUBLIC_SITE_URL=https://tudominio.com
```

**Notas importantes:**
- `RESEND_API_KEY`: La API key que copiaste de Resend
- `RESEND_FROM_EMAIL`: El email desde el que se enviarán los mensajes. Debe usar un dominio verificado o `onboarding@resend.dev` para pruebas
- `NEXT_PUBLIC_SITE_URL`: La URL de tu sitio (sin `/` al final)

### 5. Variables de Entorno en Vercel

Si estás usando Vercel para deployment:

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega las tres variables:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `NEXT_PUBLIC_SITE_URL`
4. Selecciona todos los ambientes (Production, Preview, Development)
5. Guarda y redeploy

## 📝 Uso

### Invites Automáticos

Los invites se envían automáticamente cuando:
- Un miembro tiene email Y discord configurados
- El miembro NO ha iniciado sesión antes (last_login_at es NULL)
- Se crea o actualiza el miembro en el admin panel

### Notificaciones de Respuestas

Se envían automáticamente cuando:
- Alguien responde a un comentario
- El autor del comentario original tiene email configurado
- El que responde NO es el mismo autor del comentario original

### Notificaciones de Nuevos Posts

Se envían automáticamente cuando:
- Se publica un nuevo post en el blog (no al editar)
- Se envía a todos los miembros que tengan email configurado

## 🧪 Pruebas

### Probar Email de Invitación

1. Ve al admin panel
2. Edita un miembro que no haya iniciado sesión
3. Agrega un email y asegúrate que tenga Discord configurado
4. Guarda
5. Revisa la consola del servidor para ver si el email se envió
6. Revisa tu bandeja de entrada

### Probar Notificación de Respuesta

1. Como usuario A, comenta en un post del blog
2. Como usuario B, responde al comentario del usuario A
3. El usuario A debería recibir un email

### Probar Notificación de Nuevo Post

1. Ve al admin panel
2. Crea un nuevo post en el blog
3. Todos los miembros con email configurado deberían recibir un email

## 📊 Monitoreo

Para ver el estado de tus emails:

1. Ve al dashboard de Resend
2. Click en "Emails"
3. Aquí verás todos los emails enviados con su estado:
   - ✅ Delivered: Email entregado exitosamente
   - ⏳ Queued: Email en cola
   - ❌ Bounced: Email rebotado (dirección inválida)

## 🔧 Troubleshooting

### Los emails no se están enviando

1. **Verifica las variables de entorno**:
   ```bash
   echo $RESEND_API_KEY
   echo $RESEND_FROM_EMAIL
   ```

2. **Revisa los logs del servidor**:
   - Busca mensajes como "✅ Email enviado" o "❌ Error enviando email"

3. **Verifica el dominio**:
   - Si estás usando tu propio dominio, asegúrate que esté verificado en Resend
   - Si no está verificado, usa `onboarding@resend.dev` temporalmente

4. **Revisa el dashboard de Resend**:
   - Ve a "Emails" para ver el estado de los emails

### Los emails llegan a spam

1. **Verifica SPF y DKIM**:
   - Asegúrate de haber configurado correctamente los DNS records
   - Ve a Resend → Domains → tu dominio → verifica que todo esté verde

2. **Usa un dominio verificado**:
   - Los emails desde `onboarding@resend.dev` pueden ir a spam
   - Configura tu propio dominio para mejor deliverability

## 📚 Recursos

- [Documentación de Resend](https://resend.com/docs)
- [Guía de verificación de dominio](https://resend.com/docs/dashboard/domains/introduction)
- [API Reference](https://resend.com/docs/api-reference/introduction)
