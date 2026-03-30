'use client';

import PageClient from '@/app/page-client';

export default function EventDetailClient({ initialData, eventId }) {
  return <PageClient initialData={initialData} initialHash={`#event-${eventId}`} />;
}
