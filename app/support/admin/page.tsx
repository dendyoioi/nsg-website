'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink, 
  Search, 
  Edit3, 
  Send,
  MessageSquare,
  Phone,
  Bot
} from 'lucide-react';
import { Ticket, TicketStatus } from '@/lib/types/support';
import { 
  fetchTickets, 
  updateTicketStatus, 
  fetchComments, 
  addComment, 
  getLocalComments,
  ClientComment as TicketComment 
} from '@/lib/support-storage';

const ADMIN_MASTER_PINS = ['123456', '2026', '1234'];

export default function SupportAdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSLA, setFilterSLA] = useState<'all' | '0' | '1'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [copied, setCopied] = useState(false);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Discussion / Real Agent Reply State
  const [currentComments, setCurrentComments] = useState<TicketComment[]>([]);
  const [adminReplyText, setAdminReplyText] = useState('');

  // Check Local Auth
  useEffect(() => {
    const isAuth = localStorage.getItem('nattu_admin_auth');
    if (isAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ADMIN_MASTER_PINS.includes(pinInput.trim())) {
      setIsAuthenticated(true);
      setPinError(false);
      localStorage.setItem('nattu_admin_auth', 'true');
      window.dispatchEvent(new Event('nattu_auth_change'));
    } else {
      setPinError(true);
    }
  };

  const loadTickets = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchTickets();
      setTickets(data);
      if (!selectedTicketId && data.length > 0) {
        setSelectedTicketId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load tickets in admin:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [selectedTicketId]);

  useEffect(() => {
    if (isAuthenticated) {
      loadTickets();
      const ticketInterval = setInterval(() => {
        loadTickets(true);
      }, 5000);
      return () => clearInterval(ticketInterval);
    }
  }, [isAuthenticated, loadTickets]);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || null;

  // Load comments when selected ticket changes (Instant 0ms read + background sync)
  useEffect(() => {
    if (selectedTicket) {
      setAdminNoteInput(selectedTicket.adminNotes || '');
      
      // 1. Instant local read (same-browser scenarios)
      const instant = getLocalComments(selectedTicket.id, selectedTicket.ticketNumber);
      setCurrentComments(instant);

      // 2. Background sync from Google Sheets (cross-browser/cross-device)
      fetchComments(selectedTicket.id, selectedTicket.ticketNumber).then(newComments => {
        setCurrentComments(prev => {
          if (newComments.length > 0 && (prev.length !== newComments.length || JSON.stringify(prev) !== JSON.stringify(newComments))) {
            return newComments;
          }
          return prev;
        });
      });
    }
  }, [selectedTicketId, selectedTicket]);

  // Real-time synchronization for discussions (listener & periodic polling)
  useEffect(() => {
    if (!selectedTicket) return;

    const handleSync = () => {
      // 1. Check local immediately
      const instant = getLocalComments(selectedTicket.id, selectedTicket.ticketNumber);
      if (instant.length > 0) {
        setCurrentComments(prev => {
          if (prev.length !== instant.length || JSON.stringify(prev) !== JSON.stringify(instant)) {
            return instant;
          }
          return prev;
        });
      }

      // 2. Background fetch
      fetchComments(selectedTicket.id, selectedTicket.ticketNumber).then(newComments => {
        setCurrentComments(prev => {
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
  }, [selectedTicket]);

  const handleCopyPrompt = () => {
    if (!selectedTicket?.aiLevel1Analysis?.antigravityPrompt) return;
    navigator.clipboard.writeText(selectedTicket.aiLevel1Analysis.antigravityPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleUpdateStatus = async (newStatus: TicketStatus) => {
    if (!selectedTicket) return;
    setUpdatingStatus(true);
    try {
      await updateTicketStatus(selectedTicket.id, newStatus, adminNoteInput);
      setTickets(prev => prev.map(t => {
        if (t.id === selectedTicket.id) {
          return { ...t, status: newStatus, adminNotes: adminNoteInput, updatedAt: new Date().toISOString() };
        }
        return t;
      }));
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Send Direct Real Agent Reply to Client
  const handleSendAdminReply = async (customText?: string) => {
    const textToSend = (customText || adminReplyText).trim();
    if (!textToSend || !selectedTicket) return;

    const newComment: TicketComment = {
      sender: 'Dendy Aditya (Real Agent / IT Support Admin)',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      text: textToSend,
      isAI: false
    };

    setAdminReplyText('');
    await addComment(selectedTicket.id, selectedTicket.ticketNumber, newComment);
    const refreshed = await fetchComments(selectedTicket.id, selectedTicket.ticketNumber);
    setCurrentComments(refreshed);

    try {
      localStorage.setItem(`nattu_last_staff_time_${selectedTicket.id}`, Date.now().toString());
      localStorage.setItem(`nattu_confirm_${selectedTicket.id}`, 'eskalasi');
      if (selectedTicket.ticketNumber) {
        localStorage.setItem(`nattu_last_staff_time_${selectedTicket.ticketNumber}`, Date.now().toString());
        localStorage.setItem(`nattu_confirm_${selectedTicket.ticketNumber}`, 'eskalasi');
      }
    } catch {
      // ignore
    }

    // Update status to in_progress or resolved if not already
    if (selectedTicket.status === 'open') {
      await handleUpdateStatus('in_progress');
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSLA = 
      filterSLA === 'all' || 
      (filterSLA === '0' && t.slaLevel === 0) || 
      (filterSLA === '1' && t.slaLevel === 1);

    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;

    return matchesSearch && matchesSLA && matchesStatus;
  });

  // Calculate Metrics
  const totalTickets = tickets.length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const level1Tickets = tickets.filter(t => t.slaLevel === 1).length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  // Clean WhatsApp number
  const cleanPhone = selectedTicket?.clientPhone?.replace(/\D/g, '') || '';
  const waUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(`Halo ${selectedTicket?.clientName}, saya Dendy dari IT Support PT Nattu Global Synergy menindaklanjuti tiket ${selectedTicket?.ticketNumber} (${selectedTicket?.subject})...`)}`
    : null;

  // PIN Gate Screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Admin & Developer Gate
            </h1>
            <p className="text-xs text-slate-400">
              Akses khusus Admin Teknis (Dendy) untuk manajemen tiket, eskalasi real agent, & AI prompt orchestration.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Master Security PIN:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Masukkan PIN (Default: 1234)..."
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition"
                />
              </div>
            </div>

            {pinError && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
                PIN salah. Masukkan PIN yang terdaftar di spreadsheet.
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Buka Admin Cockpit</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Admin Cockpit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[11px] font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>IT Technical Support Cockpit (Real Agent Active)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Nattu Support Management & Real Agent Hub
          </h1>
          <p className="text-xs text-slate-400">
            Kirim balasan manual ke klien, tindak lanjuti eskalasi Gmail, dan salin prompt Antigravity Level 1.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadTickets}
            title="Refresh Data"
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-400' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-400">Total Tiket Masuk</p>
          <p className="text-2xl font-bold text-white mt-1">{totalTickets}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-amber-400 font-medium">Sedang Dikerjakan</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{inProgressTickets}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-purple-400 font-medium">Antigravity Code Tasks</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{level1Tickets}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-emerald-400 font-medium">Tiket Selesai</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{resolvedTickets}</p>
        </div>
      </div>

      {/* Main 2-Column Split: Ticket List (5 cols) & Detail / Response / Prompt Hub (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Ticket Browser (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Cari subjek, user, ID tiket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition"
              />
            </div>

            <div className="flex gap-2 text-xs">
              <select
                value={filterSLA}
                onChange={(e) => setFilterSLA(e.target.value as 'all' | '0' | '1')}
                className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-teal-500 text-[11px]"
              >
                <option value="all">Semua SLA</option>
                <option value="0">SLA 0 (Email Gmail)</option>
                <option value="1">SLA 1 (Website Code)</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-teal-500 text-[11px]"
              >
                <option value="all">Semua Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 divide-y divide-slate-800/40">
            {filteredTickets.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Tidak ada tiket yang cocok.
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = t.id === selectedTicketId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-slate-800/90 border-teal-500/80 shadow-md shadow-teal-500/10'
                        : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">
                        {t.ticketNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-semibold ${
                        t.status === 'open' ? 'bg-sky-500/10 text-sky-400' :
                        t.status === 'in_progress' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">
                      {t.subject}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                      <span>{t.clientName}</span>
                      {t.slaLevel === 1 ? (
                        <span className="text-purple-400 font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Prompt Ready
                        </span>
                      ) : (
                        <span className="text-sky-400 font-medium">Email SLA 0</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Ticket Inspector & Real Agent Response Hub (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {selectedTicket ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Header Info */}
              <div className="space-y-2 pb-4 border-b border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-md border border-teal-500/20">
                      {selectedTicket.ticketNumber}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium text-[11px] uppercase">
                      {selectedTicket.category.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs px-2.5 py-1 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 transition inline-flex items-center gap-1 font-semibold"
                      >
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>Chat WhatsApp</span>
                      </a>
                    )}
                    <Link
                      href={`/support/ticket?id=${selectedTicket.id}`}
                      target="_blank"
                      className="text-xs text-teal-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Buka Halaman Klien</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-white">{selectedTicket.subject}</h2>
                <div className="text-xs text-slate-400 space-y-0.5">
                  <p>Dari: <strong className="text-slate-200">{selectedTicket.clientName}</strong> ({selectedTicket.clientEmail})</p>
                  {selectedTicket.clientPhone && <p>Telepon / WA: <strong className="text-slate-200">{selectedTicket.clientPhone}</strong></p>}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Update Status Penanganan Tiket:</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus('in_progress')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedTicket.status === 'in_progress'
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    ⚡ Set In Progress (Sedang Dikerjakan)
                  </button>

                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus('resolved')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedTicket.status === 'resolved'
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    ✓ Set Resolved (Selesai)
                  </button>

                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus('closed')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedTicket.status === 'closed'
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                    }`}
                  >
                    ✕ Set Closed
                  </button>
                </div>

                <div className="pt-2">
                  <label className="block text-[11px] text-slate-400 mb-1">Catatan Admin / Ringkasan Solusi:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Tulis ringkasan perbaikan untuk catatan tiket..."
                      value={adminNoteInput}
                      onChange={(e) => setAdminNoteInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedTicket.status)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-medium border border-teal-500/20"
                    >
                      Simpan Catatan
                    </button>
                  </div>
                </div>
              </div>

              {/* REAL AGENT DIRECT RESPONSE & DISCUSSION HUB */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-teal-500/30 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-teal-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-teal-300">
                      Diskusi Langsung Klien & Balasan Real Agent
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">{currentComments.length} pesan</span>
                </div>

                  {/* Comments List */}
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {currentComments.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      Belum ada pesan diskusi dari klien untuk tiket ini.
                    </div>
                  ) : (
                    currentComments.map((c, i) => {
                      const messageText = c.text || (c as unknown as Record<string, string>).message || (c as unknown as Record<string, string>).content || (c as unknown as Record<string, string>).comment || '';
                      if (!messageText.trim()) return null;

                      return (
                        <div
                          key={`${c.sender}-${c.time}-${i}`}
                          className={`p-3 rounded-xl text-xs space-y-1 ${
                            c.isAI
                              ? 'bg-teal-950/20 border border-teal-500/20 text-slate-300'
                              : c.sender.includes('Dendy') || c.sender.includes('Admin')
                              ? 'bg-emerald-950/30 border border-emerald-500/30 text-emerald-200'
                              : 'bg-slate-900 border border-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <strong className={
                              c.isAI ? 'text-teal-300' :
                              c.sender.includes('Dendy') || c.sender.includes('Admin') ? 'text-emerald-400' :
                              'text-slate-200'
                            }>
                              {c.sender || 'Klien'}
                            </strong>
                            <span>{c.time}</span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{messageText}</p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Action Snippets for Admin */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-400">Template Balasan Cepat (1-Click Send):</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSendAdminReply('Halo, kendala penarikan email di mail server telah kami periksa dan sinkronisasi sudah normal kembali. Silakan dicek kembali di Gmail Anda.')}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
                    >
                      ✉️ Server Email Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendAdminReply('Halo, kuota penyimpanan mailbox Anda telah kami perbesar di server hosting. Email baru dari eksternal sudah bisa masuk kembali.')}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
                    >
                      📦 Kuota Mailbox Diperbesar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendAdminReply('Halo, tim teknis kami akan menghubungi nomor WhatsApp Anda dalam beberapa menit untuk memandu setting secara langsung.')}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
                    >
                      📞 Panduan via WhatsApp
                    </button>
                  </div>
                </div>

                {/* Admin Reply Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendAdminReply();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Tulis balasan resmi real agent untuk klien ini..."
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition"
                  />
                  <button
                    type="submit"
                    disabled={!adminReplyText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim ke Klien</span>
                  </button>
                </form>
              </div>

              {/* ANTIGRAVITY AI LEVEL 1 PROMPT SECTION (CORE FEATURE) */}
              {selectedTicket.aiLevel1Analysis ? (
                <div className="space-y-3 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-950 to-slate-950 border border-purple-500/40 p-5 shadow-xl">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                          AI Level 1: Generated Prompt untuk Antigravity
                        </h3>
                        <p className="text-[11px] text-slate-400">Siap copas langsung ke Antigravity IDE</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg ${
                        copied
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white shadow-purple-500/25 transform hover:-translate-y-0.5'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Tersalin ke Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>1-Click Copy Prompt</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-purple-500/20">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Estimasi Waktu</span>
                      <span className="font-semibold text-purple-300">{selectedTicket.aiLevel1Analysis.estimatedScope}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-purple-500/20">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Komponen Target</span>
                      <span className="font-mono text-[11px] text-slate-300 truncate block">
                        {selectedTicket.aiLevel1Analysis.affectedComponents.join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Prompt Code Block */}
                  <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-200 whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed shadow-inner">
                    {selectedTicket.aiLevel1Analysis.antigravityPrompt}
                  </div>

                  {/* Test Steps Checklist */}
                  {selectedTicket.aiLevel1Analysis.suggestedTestSteps?.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[11px] font-bold text-slate-400 mb-1.5">Rekomendasi Uji Verifikasi Antigravity:</p>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {selectedTicket.aiLevel1Analysis.suggestedTestSteps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-teal-400">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-sky-400 font-bold">
                    <Bot className="w-4 h-4" />
                    <span>Tiket Kategori SLA Level 0 (Troubleshooting Gmail)</span>
                  </div>
                  <p className="text-slate-400">
                    Gunakan box diskusi di atas untuk mengirim balasan manual langsung ke halaman klien atau gunakan tombol Chat WhatsApp.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-16 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-sm">
              Pilih tiket di sebelah kiri untuk melihat detail inspeksi, diskusi real agent, & Antigravity prompt.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
