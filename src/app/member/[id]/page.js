import { notFound } from 'next/navigation';
import MemberDetailClient from './MemberDetailClient';

export async function generateMetadata({ params }) {
  const { id } = params;

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/clan`, {
    cache: 'no-store'
  });

  if (!res.ok) return {};

  const data = await res.json();
  const member = data.members.find(m => m.id === parseInt(id));

  if (!member) return {};

  const description = member.aboutMe || `${member.name} - ${member.race} ${member.rank} (Nivel ${member.level_rank}, MMR ${member.mmr})`;

  return {
    title: `${member.name} | Clan MAFIA`,
    description: description,
    openGraph: {
      title: `${member.name} - Clan MAFIA`,
      description: description,
      images: [{ url: member.avatar || data.clan.logo, width: 400, height: 400, alt: member.name }],
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: member.name,
      description: description,
      images: [member.avatar || data.clan.logo],
    },
  };
}

export default async function MemberPage({ params }) {
  const { id } = params;

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/clan`, {
    cache: 'no-store'
  });

  if (!res.ok) return notFound();

  const data = await res.json();
  const member = data.members.find(m => m.id === parseInt(id));

  if (!member) return notFound();

  return <MemberDetailClient initialData={data} memberId={parseInt(id)} />;
}
