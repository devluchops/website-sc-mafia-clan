'use client';

import PageClient from '@/app/page-client';

export default function MemberDetailClient({ initialData, memberId }) {
  return <PageClient initialData={initialData} initialHash={`#member-${memberId}`} />;
}
