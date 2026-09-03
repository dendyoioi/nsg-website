'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Clock, 
  Bot, 
  Sparkles, 
  Paperclip, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Send,
  MessageSquare,
  User,
  Building,
  Check,
  Hourglass,
  HelpCircle,
  Loader2,
  Lock,
  XCircle
} from 'lucide-react';
import { Ticket, TicketStatus } from '@/lib/types/support';
import { 
  fetchTicketById, 
  updateTicketStatus, 
  fetchComments, 
  addComment, 
  getLocalComments,
  ClientComment as TicketComment 
} from '@/lib/support-storage';
import { generateAICommentReply } from '@/lib/ai-support-engine';

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

export default function TicketDetailClient({ ticketId }: { ticketId: string }) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [aiTyping, setAiTyping] = useState(false);
  
  // Modal states
  const [confirmModal, setConfirmModal] = useState<'resolve' | 'escalate' | 'close' | null>(null);
  const [userConfirmedStatus, setUserConfirmedStatus] = useState<'paham' | 'eskalasi' | null>(null);
  const [autoClosedNotice, setAutoClosedNotice] = useState(false);
  const [remainingTimeText, setRemainingTimeText] = useState<string>('');

  useEffect(() => {
    async function loadTicket() {
      setLoading(true);
      try {
        const found = await fetchTicketById(ticketId);
        if (found) {
          // 1. Instant local comments
          const instant = getLocalComments(found.id, found.ticketNumber);
          if (instant.length > 0) {
            setComments(instant);
          }

          // 2. Load stored & remote comments
          let loadedComments = await fetchComments(found.id, found.ticketNumber);

          // Calculate 3-hour auto-close rule based on the LAST response from Admin / System
          if (found.status === 'open' || found.status === 'in_progress' || found.status === 'waiting_feedback') {
            // Find last response from system or admin
            let lastStaffResponseTime = new Date(found.createdAt).getTime();
            let lastSenderIsClient = false;

            if (loadedComments.length > 0) {
              const lastComment = loadedComments[loadedComments.length - 1];
              const isClient = !lastComment.isAI && !lastComment.sender.includes('Admin') && !lastComment.sender.includes('Dendy');
              if (isClient) {
                lastSenderIsClient = true;
              } else {
                // Last response was from staff/system
                const storedTime = localStorage.getItem(`nattu_last_staff_time_${found.id}`) || 
                  (found.ticketNumber ? localStorage.getItem(`nattu_last_staff_time_${found.ticketNumber}`) : null);
                lastStaffResponseTime = storedTime ? parseInt(storedTime, 10) : new Date(found.updatedAt || found.createdAt).getTime();
              }
            }

            // Only auto-close if the LAST message was from System / Admin and client has not responded for 3 hours
            if (!lastSenderIsClient) {
              const nowMs = Date.now();
              const elapsedMs = nowMs - lastStaffResponseTime;

              if (elapsedMs >= THREE_HOURS_MS) {
                found.status = 'closed';
                found.adminNotes = 'Tiket ditutup otomatis oleh sistem karena tidak ada respon lanjutan dalam waktu 3 jam setelah balasan terakhir diberikan.';
                
                const hasAutoCloseComment = loadedComments.some(c => c.text.includes('otomatis ditutup oleh sistem karena tidak ada respon'));
                if (!hasAutoCloseComment) {
                  const autoCloseComment: TicketComment = {
                    sender: 'Sistem Auto-Reply Nattu',
                    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                    text: '🔒 Tiket ini telah otomatis ditutup oleh sistem karena tidak ada respon lanjutan dalam waktu 3 jam setelah balasan terakhir diberikan. Terima kasih telah menghubungi Layanan Support PT Nattu Global Synergy.',
                    isAI: true
                  };
                  await addComment(found.id, found.ticketNumber, autoCloseComment);
                  loadedComments = await fetchComments(found.id, found.ticketNumber);
                }

                await updateTicketStatus(found.id, 'closed', found.adminNotes);
                setAutoClosedNotice(true);
              } else {
                const diffMs = THREE_HOURS_MS - elapsedMs;
                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                setRemainingTimeText(`${hours} jam ${minutes} menit`);
              }
            } else {
              // Waiting for Admin to reply, timer paused
              setRemainingTimeText('');
            }
          }

          setComments(loadedComments);

          // Check if previous confirmation is saved
          const storedConfirm = localStorage.getItem(`nattu_confirm_${found.id}`) || 
            (found.ticketNumber ? localStorage.getItem(`nattu_confirm_${found.ticketNumber}`) : null);
          if (storedConfirm === 'paham' || storedConfirm === 'eskalasi') {
            setUserConfirmedStatus(storedConfirm);
          } else if (found.status === 'resolved' || found.status === 'closed') {
            setUserConfirmedStatus('paham');
          } else if (found.adminNotes?.includes('Eskalasi Real Agent')) {
            setUserConfirmedStatus('eskalasi');
          }

          setTicket(found);
        }
      } catch (err) {
        console.error('Failed to load ticket', err);
      } finally {
        setLoading(false);
      }
    }
    loadTicket();
  }, [ticketId]);

  // Real-time synchronization listener for discussions
  useEffect(() => {
    if (!ticket) return;

    const handleSync = () => {
      // 1. Instant local read
      const instant = getLocalComments(ticket.id, ticket.ticketNumber);
      if (instant.length > 0) {
        setComments(prev => {
          if (prev.length !== instant.length || JSON.stringify(prev) !== JSON.stringify(instant)) {
            return instant;
          }
          return prev;
        });
      }

      // 2. Background sync
      fetchComments(ticket.id, ticket.ticketNumber).then(newComments => {
        setComments(prev => {
          if (newComments.length > 0 && (prev.length !== newComments.length || JSON.stringify(prev) !== JSON.stringify(newComments))) {
            return newComments;
          }
          return prev;
        });
      });
    };

    window.addEventListener('nattu_comments_updated', handleSync);
    window.addEventListener('storage', handleSync);

    const interval = setInterval(handleSync, 3000);

    return () => {
      window.removeEventListener('nattu_comments_updated', handleSync);
      window.removeEventListener('storage', handleSync);
      clearInterval(interval);
    };
  }, [ticket]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !ticket) return;

    const userInput = commentText.trim();
    const clientName = ticket.clientName || 'Klien';
    const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const userComment: TicketComment = {
      sender: clientName,
      time: currentTime,
      text: userInput,
      isAI: false
    };

    setCommentText('');
    await addComment(ticket.id, ticket.ticketNumber, userComment);
    const updatedWithUser = await fetchComments(ticket.id, ticket.ticketNumber);
    setComments(updatedWithUser);

    // Check if ticket has already been escalated to Real Agent / Admin
    const isEscalatedToRealAgent = 
      userConfirmedStatus === 'eskalasi' || 
      ticket.status === 'in_progress' || 
      updatedWithUser.some(c => c.sender.includes('Admin') || c.sender.includes('Dendy') || c.text.includes('dialihkan ke Real Agent'));

    // If escalated to Real Agent, TURN OFF Auto-Reply completely!
    if (isEscalatedToRealAgent) {
      return;
    }

    // Otherwise, trigger initial Level 0 Auto-Reply
    setAiTyping(true);
    setTimeout(async () => {
      const aiReply = generateAICommentReply(userInput, clientName);
      const aiComment: TicketComment = {
        sender: 'Nattu Auto-Reply Sistem',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        text: aiReply.replyText,
        isAI: true
      };

      await addComment(ticket.id, ticket.ticketNumber, aiComment);
      const finalComments = await fetchComments(ticket.id, ticket.ticketNumber);
      setComments(finalComments);
      setAiTyping(false);

      // Record timestamp of system reply for 3-hour auto close
      localStorage.setItem(`nattu_last_staff_time_${ticket.id}`, Date.now().toString());
      if (ticket.ticketNumber) {
        localStorage.setItem(`nattu_last_staff_time_${ticket.ticketNumber}`, Date.now().toString());
      }

      if (aiReply.shouldEscalate) {
        setUserConfirmedStatus('eskalasi');
        localStorage.setItem(`nattu_confirm_${ticket.id}`, 'eskalasi');
        if (ticket.ticketNumber) {
          localStorage.setItem(`nattu_confirm_${ticket.ticketNumber}`, 'eskalasi');
        }
        setTicket(prev => prev ? { ...prev, status: 'in_progress', adminNotes: 'Eskalasi otomatis: Klien meminta bantuan manual melalui diskusi.' } : null);
        await updateTicketStatus(ticket.id, 'in_progress', 'Eskalasi otomatis: Klien meminta bantuan manual melalui diskusi.');
      }
    }, 700);
  };

  const handleConfirmResolve = async () => {
    if (!ticket) return;
    setUserConfirmedStatus('paham');
    localStorage.setItem(`nattu_confirm_${ticket.id}`, 'paham');
    setConfirmModal(null);

    const newComment: TicketComment = {
      sender: ticket.clientName || 'Klien',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      text: '✅ Klien telah mengonfirmasi: Panduan integrasi Gmail sudah dipahami & berhasil diterapkan. Tiket diselesaikan.'
    };
    await addComment(ticket.id, ticket.ticketNumber, newComment);
    const updated = await fetchComments(ticket.id, ticket.ticketNumber);
    setComments(updated);
    setTicket(prev => prev ? { ...prev, status: 'resolved', adminNotes: 'Diselesaikan oleh klien setelah panduan AI Level 0 berhasil diterapkan.' } : null);

    // Sync to Google Spreadsheet backend
    await updateTicketStatus(ticket.id, 'resolved', 'Diselesaikan oleh klien setelah panduan AI Level 0 berhasil diterapkan.');
  };

  const handleConfirmEscalate = async () => {
    if (!ticket) return;
    setUserConfirmedStatus('eskalasi');
    localStorage.setItem(`nattu_confirm_${ticket.id}`, 'eskalasi');
    setConfirmModal(null);

    const newComment: TicketComment = {
      sender: ticket.clientName || 'Klien',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      text: '⚠️ Klien meminta bantuan manual: Panduan AI belum dipahami sepenuhnya. Tiket dialihkan ke Real Agent (Tim Teknis Nattu).'
    };
    await addComment(ticket.id, ticket.ticketNumber, newComment);
    const updated = await fetchComments(ticket.id, ticket.ticketNumber);
    setComments(updated);
    setTicket(prev => prev ? { ...prev, status: 'in_progress', adminNotes: 'Eskalasi Real Agent: Klien membutuhkan panduan langsung.' } : null);

    // Sync to Google Spreadsheet backend
    await updateTicketStatus(ticket.id, 'in_progress', 'Eskalasi Real Agent: Klien membutuhkan panduan langsung.');
  };

  const handleConfirmClose = async () => {
    if (!ticket) return;
    setUserConfirmedStatus('paham');
    localStorage.setItem(`nattu_confirm_${ticket.id}`, 'paham');
    setConfirmModal(null);

    const newComment: TicketComment = {
      sender: ticket.clientName || 'Klien',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      text: '🔒 Klien telah menutup tiket ini secara mandiri. Tiket selesai.'
    };
    await addComment(ticket.id, ticket.ticketNumber, newComment);
    const updated = await fetchComments(ticket.id, ticket.ticketNumber);
    setComments(updated);
    setTicket(prev => prev ? { ...prev, status: 'closed', adminNotes: 'Ditutup langsung oleh klien.' } : null);

    // Sync to Google Spreadsheet backend
    await updateTicketStatus(ticket.id, 'closed', 'Ditutup langsung oleh klien.');
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">Tiket Terbuka</span>;
      case 'in_progress':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">Sedang Dikerjakan Tim Teknis</span>;
      case 'waiting_feedback':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">Menunggu Feedback</span>;
      case 'resolved':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Selesai (Resolved)</span>;
      case 'closed':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">Ditutup (Closed)</span>;
    }
  };

  const isTicketClosedOrResolved = ticket?.status === 'closed' || ticket?.status === 'resolved';

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Memuat detail tiket...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">Tiket Tidak Ditemukan</h2>
        <p className="text-xs text-slate-400">Nomor tiket &quot;{ticketId}&quot; tidak terdaftar di sistem.</p>
        <Link
          href="/support"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Tiket</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/support"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-300 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Tiket</span>
        </Link>

        {!isTicketClosedOrResolved && (
          <button
            type="button"
            onClick={() => setConfirmModal('close')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/30 text-xs font-semibold transition"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Tutup Tiket Ini</span>
          </button>
        )}
      </div>

      {/* Auto-Closed Notice Banner */}
      {autoClosedNotice && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 flex items-start gap-3">
          <Clock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-200">Tiket Ditutup Otomatis (3 Jam Tanpa Respon)</p>
            <p className="text-slate-400 mt-0.5">
              Tiket ini telah otomatis ditutup oleh sistem karena tidak ada respon atau eskalasi lanjutan dalam waktu 3 jam setelah balasan diberikan.
            </p>
          </div>
        </div>
      )}

      {/* Main Ticket Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Header Ticket Info */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-md border border-teal-500/20">
                {ticket.ticketNumber}
              </span>
              <span className="text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 uppercase font-semibold text-[11px]">
                {ticket.category.replace('_', ' ')}
              </span>
              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${
                ticket.priority === 'urgent' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                ticket.priority === 'high' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                'bg-slate-800 text-slate-300'
              }`}>
                Prioritas: {ticket.priority}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {ticket.subject}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-400" />
                {ticket.clientName} ({ticket.clientEmail})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                {ticket.companyName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Dibuat: {new Date(ticket.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0">
            {getStatusBadge(ticket.status)}
          </div>
        </div>

        {/* Progress Tracker Steps */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Status Penanganan Tiket</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 font-semibold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              <span>1. Tiket Diterima</span>
            </div>
            <div className={`p-2.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 ${
              ticket.aiLevel0Reply || ticket.aiLevel1Analysis
                ? 'bg-teal-500/10 border border-teal-500/30 text-teal-300'
                : 'bg-slate-900 text-slate-500'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>2. Auto-Reply Sistem</span>
            </div>
            <div className={`p-2.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 ${
              ticket.status === 'in_progress' || ticket.status === 'resolved' || ticket.status === 'closed'
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                : 'bg-slate-900 text-slate-500'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>3. Respon Real Agent</span>
            </div>
            <div className={`p-2.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 ${
              ticket.status === 'resolved' || ticket.status === 'closed'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-slate-900 text-slate-500'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>4. Selesai</span>
            </div>
          </div>
        </div>

        {/* User Description */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Deskripsi Permintaan Klien</h2>
          <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </div>
        </div>

        {/* Attachment Card if exists */}
        {ticket.attachmentUrl && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Lampiran File / Screenshot</h2>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 flex-shrink-0">
                  <Paperclip className="w-5 h-5" />
                </div>
                <div className="overflow-hidden text-xs">
                  <p className="font-semibold text-slate-200 truncate">{ticket.attachmentName || 'Dokumen_Lampiran'}</p>
                  <p className="text-slate-500">Tersimpan aman di Google Drive Support Nattu</p>
                </div>
              </div>
              <a
                href={ticket.attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold transition"
              >
                <span>Buka / Download File</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            {ticket.attachmentUrl.startsWith('data:image') && (
              <div className="mt-2 rounded-xl overflow-hidden border border-slate-800 max-w-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ticket.attachmentUrl} alt="Preview Attachment" className="w-full h-auto object-cover" />
              </div>
            )}
          </div>
        )}

        {/* AI Agent Auto-Reply Response Box */}
        {ticket.aiLevel0Reply && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-teal-500/20 text-teal-300">
                  <Bot className="w-4 h-4" />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  Respon Cepat Auto-Reply Sistem (Panduan Integrasi Gmail)
                </h2>
              </div>

              {/* 3-Hour Countdown Hint */}
              {remainingTimeText && !isTicketClosedOrResolved && !userConfirmedStatus && (
                <div className="hidden sm:flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  <Hourglass className="w-3.5 h-3.5 animate-spin" />
                  <span>Auto-Close: Sisa {remainingTimeText}</span>
                </div>
              )}
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-teal-950/30 via-slate-950 to-slate-950 border border-teal-500/30 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap shadow-inner">
              {ticket.aiLevel0Reply}
            </div>
          </div>
        )}

        {/* Admin Resolution Note if resolved */}
        {ticket.adminNotes && (
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Catatan Penyelesaian:</span>
            </div>
            <p className="text-slate-300 pl-5">{ticket.adminNotes}</p>
          </div>
        )}

        {/* Discussion / Additional Comment Box */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Diskusi & Tambahan Informasi
            </h3>
          </div>

          {comments.length > 0 && (
            <div className="space-y-3">
              {comments.map((c, i) => {
                const messageText = c.text || (c as unknown as Record<string, string>).message || (c as unknown as Record<string, string>).content || (c as unknown as Record<string, string>).comment || '';
                if (!messageText.trim()) return null;

                return (
                  <div
                    key={`${c.sender}-${c.time}-${i}`}
                    className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                      c.isAI
                        ? 'bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-900 border-teal-500/30 shadow-md'
                        : c.sender.includes('Admin') || c.sender.includes('Dendy')
                        ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/40 shadow-md'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <div className="flex items-center gap-1.5">
                        {c.isAI ? (
                          <>
                            <div className="p-1 rounded bg-teal-500/20 text-teal-300">
                              <Bot className="w-3.5 h-3.5" />
                            </div>
                            <strong className="text-teal-300 font-bold">Nattu Auto-Reply Sistem</strong>
                          </>
                        ) : c.sender.includes('Admin') || c.sender.includes('Dendy') ? (
                          <>
                            <div className="p-1 rounded bg-emerald-500/20 text-emerald-300">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <strong className="text-emerald-300 font-bold">{c.sender}</strong>
                          </>
                        ) : (
                          <>
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <strong className="text-slate-200">{c.sender || 'Klien'}</strong>
                          </>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">{c.time}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed whitespace-pre-wrap pl-5">{messageText}</p>
                  </div>
                );
              })}
            </div>
          )}

          {aiTyping && (
            <div className="p-3.5 rounded-xl bg-teal-950/20 border border-teal-500/20 text-xs text-teal-300 flex items-center gap-2 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
              <span>Nattu Assistant sedang mengetik balasan...</span>
            </div>
          )}

          {isTicketClosedOrResolved ? (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Tiket ini telah ditutup / diselesaikan. Kolom diskusi telah diarsipkan.</span>
              </div>
              <Link
                href="/support/new"
                className="px-3 py-1.5 rounded-lg bg-teal-600/20 border border-teal-500/30 text-teal-300 hover:bg-teal-600/30 font-semibold transition"
              >
                Buat Tiket Baru
              </Link>
            </div>
          ) : (
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Tulis pesan atau tanggapan lanjutan seputar kendala Gmail Anda..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={aiTyping}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={aiTyping || !commentText.trim()}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim</span>
              </button>
            </form>
          )}
        </div>

        {/* Comprehension Check & Action Card (ALWAYS AT THE VERY BOTTOM OF DISCUSSION) */}
        {!isTicketClosedOrResolved && (
          <div className="pt-6 border-t border-slate-800">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-teal-500/30 space-y-3 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Konfirmasi Pemahaman & Status Penyelesaian Tiket:</span>
              </div>
              
              {userConfirmedStatus === 'paham' ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-emerald-200">✅ Anda telah mengonfirmasi bahwa panduan sudah dipahami dan berhasil diterapkan.</p>
                    <p className="text-emerald-400/80 text-[11px] mt-0.5">Tiket ini telah ditandai Selesai (Resolved). Terima kasih atas konfirmasi Anda!</p>
                  </div>
                </div>
              ) : userConfirmedStatus === 'eskalasi' ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-200">⚠️ Tiket telah dialihkan ke Real Agent (Tim Teknis Nattu).</p>
                      <p className="text-amber-400/80 text-[11px] mt-0.5">Tim teknis kami telah menerima notifikasi dan akan segera merespon di ruang diskusi tiket ini.</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Jika kendala sudah selesai, Anda dapat menutup tiket kapan saja:</span>
                    <button
                      type="button"
                      onClick={() => setConfirmModal('close')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Selesaikan & Tutup Tiket</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-400">
                    Apakah panduan di atas dan diskusi bersama sistem telah berhasil menyelesaikan kendala Gmail Anda?
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setConfirmModal('resolve')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition transform hover:-translate-y-0.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Sudah Paham & Selesaikan Tiket</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmModal('escalate')}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
                    >
                      <HelpCircle className="w-4 h-4 text-amber-400" />
                      <span>Belum Paham / Minta Bantuan Tim Teknis (Real Agent)</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* In-App Confirmation Modal Dialog */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start gap-3.5">
              <div className={`p-3 rounded-2xl ${
                confirmModal === 'resolve' || confirmModal === 'close'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {confirmModal === 'resolve' || confirmModal === 'close' ? <CheckCircle2 className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  {confirmModal === 'resolve'
                    ? 'Selesaikan & Tutup Tiket Ini?'
                    : confirmModal === 'close'
                    ? 'Tutup & Selesaikan Tiket Ini?'
                    : 'Eskalasi ke Real Agent (Tim Teknis)?'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {confirmModal === 'resolve' || confirmModal === 'close'
                    ? 'Apakah Anda yakin ingin menutup tiket ini? Tiket akan ditandai Ditutup / Selesai (Closed) dan tidak memerlukan tindakan lebih lanjut.'
                    : 'Permintaan bantuan Anda akan dialihkan ke Admin Tim Teknis Nattu untuk dibantu dan dipandu secara langsung.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Batal
              </button>

              {confirmModal === 'resolve' ? (
                <button
                  type="button"
                  onClick={handleConfirmResolve}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Ya, Selesaikan Tiket</span>
                </button>
              ) : confirmModal === 'close' ? (
                <button
                  type="button"
                  onClick={handleConfirmClose}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Ya, Tutup Tiket</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmEscalate}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-600/20 transition flex items-center gap-1.5"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Ya, Teruskan ke Tim Teknis</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
