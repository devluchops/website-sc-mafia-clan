import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const EVENT_TYPES = {
  showmatch: { label: 'Showmatch', color: '#ffc24e' },
  partida: { label: 'Partida', color: '#5aa9ff' },
  torneo: { label: 'Torneo', color: '#b985ff' },
  reunion: { label: 'Reunión', color: '#4ee08a' },
  anuncio: { label: 'Anuncio', color: '#ff8a5c' },
  evento: { label: 'Evento', color: '#ffc24e' },
};
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function youtubeEmbed(link) {
  if (!link) return null;
  const m = String(link).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

export async function generateMetadata({ params }) {
  const { id } = params;

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/clan`, {
    cache: 'no-store'
  });

  if (!res.ok) return {};

  const data = await res.json();
  const event = data.events.find(e => e.id === parseInt(id));

  if (!event) return {};

  const eventDate = new Date(event.date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const description = `${event.description} - ${eventDate}`;

  return {
    title: `${event.title} | Clan MAFIA`,
    description: description,
    openGraph: {
      title: event.title,
      description: description,
      images: [{ url: data.clan.logo, width: 1200, height: 630, alt: event.title }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description: description,
      images: [data.clan.logo],
    },
  };
}

export default async function EventPage({ params }) {
  const { id } = params;

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/clan`, {
    cache: 'no-store',
  });
  if (!res.ok) return notFound();
  const data = await res.json();
  const event = data.events.find((e) => e.id === parseInt(id));
  if (!event) return notFound();

  const meta = EVENT_TYPES[event.event_type] || EVENT_TYPES.evento;
  const d = event.event_date
    ? new Date(String(event.event_date).slice(0, 10) + 'T00:00:00')
    : null;
  const fecha = d ? `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}` : `${event.month || ''} ${event.day || ''}`;
  const yt = youtubeEmbed(event.link);

  const C = { bg: '#090a0f', panel: '#15161c', line: 'rgba(255,255,255,0.08)', fg: '#eef1f8', muted: '#8690a6', gold: '#ffc24e' };

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <header style={{ borderBottom: `1px solid ${C.line}`, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src={data.clan?.logo || '/logo.png'} alt="Clan MAFIA" style={{ width: 34, height: 34, borderRadius: '50%', border: `1.5px solid ${C.gold}` }} />
          <span style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 800, letterSpacing: '0.1em', color: C.fg }}>CLAN <span style={{ color: C.gold }}>MAFIA</span></span>
        </Link>
        <Link href="/#events" style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 600, fontSize: 13, color: C.muted, textDecoration: 'none' }}>← Eventos</Link>
      </header>

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '40px 20px 72px' }}>
        <span style={{ display: 'inline-block', fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0c0c0c', background: meta.color, padding: '4px 12px', borderRadius: 5 }}>{meta.label}</span>

        <h1 style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 800, fontSize: 'clamp(30px, 7vw, 48px)', textTransform: 'uppercase', color: C.fg, margin: '14px 0 0', lineHeight: 1.05 }}>{event.title}</h1>

        <div style={{ color: meta.color, fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 15, marginTop: 10 }}>
          {fecha}{event.event_time ? ` · ${event.event_time}` : ''}
        </div>

        {event.description && (
          <p style={{ color: '#c3cad9', fontSize: 16, lineHeight: 1.7, marginTop: 18 }}>{event.description}</p>
        )}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
          <a href={`/event/${event.id}/ics`} style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 14, color: '#15110a', background: 'linear-gradient(135deg,#ffd87a,#ffc24e)', padding: '12px 22px', borderRadius: 7, textDecoration: 'none' }}>
            Agregar a mi calendario
          </a>
          {event.link && (
            <a href={event.link} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 14, color: C.fg, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.line}`, padding: '12px 22px', borderRadius: 7, textDecoration: 'none' }}>
              Ver stream / enlace
            </a>
          )}
        </div>

        {yt && (
          <div style={{ marginTop: 28, aspectRatio: '16 / 9', borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.line}` }}>
            <iframe src={yt} title={event.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ width: '100%', height: '100%', border: 'none' }} />
          </div>
        )}
      </main>
    </div>
  );
}
