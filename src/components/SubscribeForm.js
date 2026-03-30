'use client';

import { useState } from 'react';

const gold = "#c9a84c";
const darkGold = "#3d3525";
const bg = "#1e1b18";
const cardBg = "#252220";
const textLight = "#e8dcc0";
const textMuted = "#8b7b5e";

export default function SubscribeForm({ inline = false }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setEmail('');
        setName('');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error al procesar solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (inline) {
    // Versión inline para footer/sidebar
    return (
      <div style={{
        background: cardBg,
        border: `1px solid ${darkGold}`,
        borderRadius: 8,
        padding: 20,
      }}>
        <h3 style={{
          color: gold,
          margin: '0 0 8px 0',
          fontSize: 18,
          fontFamily: "'Cinzel', serif",
        }}>
          📰 Suscríbete al Blog
        </h3>
        <p style={{
          color: textMuted,
          fontSize: 13,
          margin: '0 0 15px 0',
          lineHeight: 1.4,
        }}>
          Recibe notificaciones de nuevos posts directamente en tu email
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: bg,
              border: `1px solid ${darkGold}`,
              borderRadius: 4,
              color: textLight,
              fontSize: 14,
              outline: 'none',
            }}
          />

          <input
            type="text"
            placeholder="Tu nombre (opcional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: bg,
              border: `1px solid ${darkGold}`,
              borderRadius: 4,
              color: textLight,
              fontSize: 14,
              outline: 'none',
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: gold,
              border: 'none',
              borderRadius: 6,
              color: bg,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Suscribiendo...' : 'Suscribirse'}
          </button>

          {message && (
            <p style={{ color: gold, fontSize: 12, margin: 0 }}>
              ✓ {message}
            </p>
          )}
          {error && (
            <p style={{ color: '#ff6b6b', fontSize: 12, margin: 0 }}>
              ✕ {error}
            </p>
          )}
        </form>
      </div>
    );
  }

  // Versión completa para página dedicada
  return (
    <div style={{
      maxWidth: 500,
      margin: '0 auto',
      background: cardBg,
      border: `1px solid ${darkGold}`,
      borderRadius: 12,
      padding: 30,
    }}>
      <h2 style={{
        color: gold,
        margin: '0 0 10px 0',
        fontSize: 24,
        fontFamily: "'Cinzel', serif",
        textAlign: 'center',
      }}>
        📰 Suscríbete al Blog
      </h2>
      <p style={{
        color: textMuted,
        fontSize: 14,
        margin: '0 0 25px 0',
        lineHeight: 1.6,
        textAlign: 'center',
      }}>
        Recibe notificaciones por email cada vez que publicamos un nuevo post.
        Sin spam, solo contenido de calidad sobre StarCraft y el clan.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
        <div>
          <label style={{ display: 'block', color: textMuted, fontSize: 12, marginBottom: 6 }}>
            Email *
          </label>
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 14px',
              background: bg,
              border: `1px solid ${darkGold}`,
              borderRadius: 6,
              color: textLight,
              fontSize: 15,
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: textMuted, fontSize: 12, marginBottom: 6 }}>
            Nombre (opcional)
          </label>
          <input
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 14px',
              background: bg,
              border: `1px solid ${darkGold}`,
              borderRadius: 6,
              color: textLight,
              fontSize: 15,
              outline: 'none',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: gold,
            border: 'none',
            borderRadius: 8,
            color: bg,
            fontSize: 16,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s',
            marginTop: 10,
          }}
        >
          {loading ? 'Suscribiendo...' : 'Suscribirse Ahora'}
        </button>

        {message && (
          <p style={{
            color: gold,
            fontSize: 14,
            margin: 0,
            textAlign: 'center',
            padding: 12,
            background: 'rgba(201,168,76,0.1)',
            borderRadius: 6,
          }}>
            ✓ {message}
          </p>
        )}
        {error && (
          <p style={{
            color: '#ff6b6b',
            fontSize: 14,
            margin: 0,
            textAlign: 'center',
            padding: 12,
            background: 'rgba(255,107,107,0.1)',
            borderRadius: 6,
          }}>
            ✕ {error}
          </p>
        )}
      </form>

      <p style={{
        color: textMuted,
        fontSize: 11,
        margin: '20px 0 0 0',
        textAlign: 'center',
        lineHeight: 1.5,
      }}>
        Puedes cancelar tu suscripción en cualquier momento desde el link en cada email
      </p>
    </div>
  );
}
