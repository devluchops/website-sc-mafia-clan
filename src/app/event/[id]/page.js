import { notFound } from 'next/navigation';
import EventDetailClient from './EventDetailClient';

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
    cache: 'no-store'
  });

  if (!res.ok) return notFound();

  const data = await res.json();
  const event = data.events.find(e => e.id === parseInt(id));

  if (!event) return notFound();

  return <EventDetailClient initialData={data} eventId={parseInt(id)} />;
}
