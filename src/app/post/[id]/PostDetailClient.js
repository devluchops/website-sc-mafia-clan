'use client';

import PageClient from '@/app/page-client';

export default function PostDetailClient({ initialData, postId }) {
  return <PageClient initialData={initialData} initialHash={`#post-${postId}`} />;
}
