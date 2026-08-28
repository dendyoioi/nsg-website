'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TicketDetailClient from '@/components/support/TicketDetailClient';
import { Loader2 } from 'lucide-react';

function TicketContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';

  if (!id) {
    return (
      <div className="py-20 text-center text-slate-400">
        Tiket tidak ditemukan atau ID tidak valid.
      </div>
    );
  }

  return <TicketDetailClient ticketId={id} />;
}

export default function DynamicTicketPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
          <p className="text-xs">Memuat detail tiket...</p>
        </div>
      }
    >
      <TicketContent />
    </Suspense>
  );
}
