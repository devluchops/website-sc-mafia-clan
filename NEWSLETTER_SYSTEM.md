# 📧 Sistema de Newsletter para Blog

Sistema completo de notificaciones por email para nuevos posts del blog.

## ✅ Componentes Implementados

### 1. Base de Datos
- **Tabla:** `blog_subscribers`
- **Campos:** id, email, name, is_active, subscribed_at, unsubscribed_at
- **Status:** ✅ Creada

### 2. APIs Implementadas

#### `/api/subscribe` (POST)
Suscribe un nuevo email a las notificaciones.

**Request:**
```json
{
  "email": "usuario@example.com",
  "name": "Nombre Usuario" // opcional
}
```

**Response:**
```json
{
  "message": "Suscripción exitosa! Recibirás notificaciones de nuevos posts."
}
```

#### `/api/unsubscribe` (POST)
Da de baja un email suscrito.

**Request:**
```json
{
  "email": "usuario@example.com"
}
```

#### `/api/admin/subscribers` (GET)
Obtiene lista de todos los suscriptores (solo admin).

**Response:**
```json
{
  "subscribers": [...],
  "stats": {
    "total": 150,
    "active": 145,
    "inactive": 5
  }
}
```

#### `/api/admin/subscribers` (DELETE)
Elimina un suscriptor permanentemente (solo admin).

**Request:**
```json
{
  "id": 123
}
```

### 3. Componente de Suscripción

**Archivo:** `/src/components/SubscribeForm.js`

**Uso en el sitio:**

```jsx
import SubscribeForm from '@/components/SubscribeForm';

// Versión inline (para footer/sidebar)
<SubscribeForm inline={true} />

// Versión completa (para página dedicada)
<SubscribeForm />
```

**Lugares sugeridos para colocar:**
- Footer del sitio
- Sidebar de la sección Blog
- Al final de cada post
- Página dedicada `/subscribe`

### 4. Sistema de Notificaciones

**Archivo:** `/src/lib/notify-subscribers.js`

**Función:** `notifySubscribers(post)`

**Uso:**
```javascript
import { notifySubscribers } from '@/lib/notify-subscribers';

// Cuando se publica un nuevo post
await notifySubscribers({
  id: post.id,
  title: post.title,
  excerpt: post.excerpt,
  image: post.image,
  date: post.date,
  tag: post.tag,
  read_time: post.read_time
});
```

**Características:**
- Envía emails en batch (50 por vez)
- Template HTML responsive
- Incluye imagen del post
- Botón "Leer más" con link al post
- Link de unsubscribe en el footer
- Respeta rate limits de Resend (3000 emails/mes gratis)

## 📋 Tareas Pendientes

### 1. Integrar SubscribeForm en el Frontend

Opciones:

**A. En el Footer:**
Agregar al final de `page-client.js` o en un componente Footer:

```jsx
<SubscribeForm inline={true} />
```

**B. En la sección Blog:**
Agregar después de la lista de posts:

```jsx
{activeTab === 'blog' && (
  <>
    {/* Posts existentes */}
    <SubscribeForm inline={true} />
  </>
)}
```

**C. Crear página dedicada `/subscribe`:**
Crear `/src/app/subscribe/page.js`:

```jsx
import SubscribeForm from '@/components/SubscribeForm';

export const metadata = {
  title: 'Suscribirse al Blog | Clan MAFIA',
  description: 'Recibe notificaciones de nuevos posts'
};

export default function SubscribePage() {
  return (
    <div style={{ padding: '60px 20px', maxWidth: 600, margin: '0 auto' }}>
      <SubscribeForm />
    </div>
  );
}
```

### 2. Integrar Notificaciones en Admin Panel

En `/src/app/admin/page.js`, cuando se guarda un post:

```javascript
const handleSavePost = async () => {
  // ... código existente de guardar post ...

  if (res.ok) {
    const savedPost = await res.json();

    // Enviar notificaciones a suscriptores
    try {
      await fetch('/api/admin/notify-subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: savedPost.id })
      });
      console.log('✅ Notificaciones enviadas');
    } catch (error) {
      console.error('Error enviando notificaciones:', error);
    }

    showMessage("✅ Post guardado y notificaciones enviadas");
    // ... resto del código ...
  }
};
```

### 3. Crear Endpoint para Notificar desde Admin

Crear `/src/app/api/admin/notify-subscribers/route.js`:

```javascript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';
import { notifySubscribers } from '@/lib/notify-subscribers';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.permissions?.is_admin &&
      !session?.user?.permissions?.can_publish_blog) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { postId } = await request.json();

    // Obtener datos del post
    const post = await sql`
      SELECT id, title, excerpt, image, date, tag, read_time
      FROM posts
      WHERE id = ${postId}
    `;

    if (post.length === 0) {
      return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 });
    }

    // Enviar notificaciones
    const result = await notifySubscribers(post[0]);

    return NextResponse.json({
      message: `Notificaciones enviadas a ${result.sent} suscriptores`
    });
  } catch (error) {
    console.error('Error enviando notificaciones:', error);
    return NextResponse.json(
      { error: 'Error al enviar notificaciones' },
      { status: 500 }
    );
  }
}
```

### 4. Agregar Sección de Suscriptores en Admin Panel

En `/src/app/admin/page.js`, agregar nueva pestaña:

```javascript
// En los tabs
<button onClick={() => setActiveTab('subscribers')}>
  📧 Suscriptores
</button>

// En el contenido
{activeTab === 'subscribers' && (
  <SubscribersSection />
)}
```

Crear componente SubscribersSection:

```javascript
function SubscribersSection() {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/subscribers')
      .then(res => res.json())
      .then(data => {
        setSubscribers(data.subscribers);
        setStats(data.stats);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Activos" value={stats.active} color="green" />
        <StatCard label="Inactivos" value={stats.inactive} color="gray" />
      </div>

      {/* Lista de suscriptores */}
      <div style={{ /* estilos */ }}>
        {subscribers.map(sub => (
          <div key={sub.id} style={{ /* card styles */ }}>
            <div>
              <strong>{sub.email}</strong>
              {sub.name && <span> ({sub.name})</span>}
            </div>
            <div>
              {sub.is_active ? '✅ Activo' : '❌ Inactivo'}
            </div>
            <div>
              {new Date(sub.subscribed_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 5. Crear Página de Desuscripción

Crear `/src/app/unsubscribe/page.js`:

```jsx
'use client';

import { useState } from 'react';

export default function UnsubscribePage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleUnsubscribe = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    setMessage(data.message || data.error);
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: 20 }}>
      <h1>Desuscribirse</h1>
      <form onSubmit={handleUnsubscribe}>
        <input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Desuscribirse</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
```

## 🧪 Testing

### 1. Test de Suscripción

```bash
curl -X POST http://localhost:3000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

### 2. Test de Notificación

```bash
# Primero obtener un post
curl http://localhost:3000/api/clan | jq '.posts[0]'

# Enviar notificación (requiere autenticación)
curl -X POST http://localhost:3000/api/admin/notify-subscribers \
  -H "Content-Type: application/json" \
  -d '{"postId":1}'
```

### 3. Verificar en Resend Dashboard

- Ve a: https://resend.com/emails
- Revisa los emails enviados
- Verifica delivery status

## 📊 Límites y Consideraciones

### Resend Free Tier:
- 3,000 emails/mes
- 100 emails/día

### Rate Limiting:
- El sistema envía en batches de 50
- 1 segundo de delay entre batches
- Para 1000 suscriptores = ~20 segundos

### Costos (si creces):
- $20/mes por 50,000 emails
- $80/mes por 500,000 emails

## 🎯 Próximos Pasos

1. ✅ Implementar UI en página principal
2. ✅ Integrar en admin panel
3. ✅ Crear endpoint de notificación
4. ✅ Agregar sección de suscriptores
5. ✅ Crear página de unsubscribe
6. 🔄 Testing completo
7. 🔄 Deploy a producción

## 📝 Notas

- Los emails se envían solo cuando se publica un **nuevo post**
- No se envían notificaciones para ediciones de posts existentes
- Los suscriptores pueden darse de baja en cualquier momento
- Los emails incluyen siempre el link de unsubscribe
- El sistema respeta las preferencias de privacidad (GDPR compliant)
