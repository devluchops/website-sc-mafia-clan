import { notFound } from 'next/navigation';
import PostDetailClient from './PostDetailClient';

export async function generateMetadata({ params }) {
  const { id } = params;

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/clan`, {
    cache: 'no-store'
  });

  if (!res.ok) return {};

  const data = await res.json();
  const post = data.posts.find(p => p.id === parseInt(id));

  if (!post) return {};

  return {
    title: `${post.title} | Clan MAFIA`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.image || data.clan.logo, width: 1200, height: 630, alt: post.title }],
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: [post.tag],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image || data.clan.logo],
    },
  };
}

export default async function PostPage({ params }) {
  const { id } = params;

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/clan`, {
    cache: 'no-store'
  });

  if (!res.ok) return notFound();

  const data = await res.json();
  const post = data.posts.find(p => p.id === parseInt(id));

  if (!post) return notFound();

  return <PostDetailClient initialData={data} postId={parseInt(id)} />;
}
