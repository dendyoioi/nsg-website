'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PlusCircle, 
  Search, 
  Clock, 
  AlertCircle, 
  Mail, 
  Globe, 
  FileEdit, 
  Layers, 
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  Lock,
  LogIn,
  UserCheck
} from 'lucide-react';
import { Ticket, TicketCategory, TicketStatus } from '@/lib/types/support';
import { fetchTickets } from '@/lib/support-storage';

export default function SupportPortalPage() {
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; department?: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const stored = localStorage.getItem('nattu_client_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCurrentUser(parsed);
      } catch {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
    setAuthChecked(true);
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await fetchTickets();
      setTickets(data);
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadTickets();
    }
  }, [currentUser]);

  // If user is logged in, ONLY show tickets created by this specific user
  const userTickets = tickets.filter(ticket => {
    if (!currentUser) return false;
    const ticketEmail = (ticket.clientEmail || '').trim().toLowerCase();
    const myEmail = (currentUser.email || '').trim().toLowerCase();
    return ticketEmail === myEmail;
  });

  const filteredTickets = userTickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryIcon = (category: TicketCategory) => {
    switch (category) {
      case 'email_webmail':
        return <Mail className="w-4 h-4 text-sky-400" />;
      case 'website_bug':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 'content_revision':
        return <FileEdit className="w-4 h-4 text-amber-400" />;
      case 'new_feature':
        return <Layers className="w-4 h-4 text-emerald-400" />;
      case 'domain_dns':
        return <Globe className="w-4 h-4 text-indigo-400" />;
      default:
        return <SlidersHorizontal className="w-4 h-4 text-slate-400" />;
    }
  };

  const getCategoryLabel = (category: TicketCategory) => {
    switch (category) {
      case 'email_webmail': return 'Email / Webmail (Gmail)';
      case 'website_bug': return 'Error Website';
      case 'content_revision': return 'Revisi Konten';
      case 'new_feature': return 'Fitur Baru';
      case 'domain_dns': return 'Domain / DNS';
      default: return 'Lainnya';
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">Tiket Terbuka</span>;
      case 'in_progress':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">Sedang Dikerjakan</span>;
      case 'waiting_feedback':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">Menunggu Feedback</span>;
      case 'resolved':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Selesai</span>;
      case 'closed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">Ditutup</span>;
    }
  };

  if (!authChecked) {
    return null;
  }

  // If NOT logged in, show Login Required State
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white tracking-tight">Login Diperlukan</h1>
            <p className="text-xs text-slate-400">
              Silakan login dengan akun email korporat (@nattuglobalsynergy.co.id) Anda untuk melihat tiket dan mengajukan permohonan baru.
            </p>
          </div>

          <Link
            href="/support/login"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Login Sekarang</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950/40 to-slate-900 border border-teal-500/20 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-medium">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Login sebagai: <strong>{currentUser.name}</strong> ({currentUser.email})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Portal Layanan & Maintenance Website / Email
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Pantau status tiket permohonan revisi website dan bantuan email Anda secara real-time.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/support/new"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Buat Tiket Baru</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row for Current User */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-400">Total Tiket Saya</p>
          <p className="text-2xl font-bold text-white mt-1">{userTickets.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-sky-400 font-medium">Tiket Terbuka</p>
          <p className="text-2xl font-bold text-sky-400 mt-1">
            {userTickets.filter(t => t.status === 'open').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-amber-400 font-medium">Sedang Dikerjakan</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">
            {userTickets.filter(t => t.status === 'in_progress').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-emerald-400 font-medium">Selesai</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {userTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari berdasarkan nomor tiket atau subjek..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-teal-500"
          >
            <option value="all">Semua Kategori</option>
            <option value="email_webmail">Email & Webmail (Gmail)</option>
            <option value="content_revision">Revisi Konten</option>
            <option value="website_bug">Error Website</option>
            <option value="new_feature">Permintaan Fitur</option>
            <option value="domain_dns">Domain / DNS</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-teal-500"
          >
            <option value="all">Semua Status</option>
            <option value="open">Tiket Terbuka</option>
            <option value="in_progress">Sedang Dikerjakan</option>
            <option value="resolved">Selesai</option>
            <option value="closed">Ditutup</option>
          </select>

          <button
            onClick={loadTickets}
            title="Refresh Data"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Ticket List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-sm text-white">Daftar Tiket Permohonan Saya</h2>
          <span className="text-xs text-slate-400">{filteredTickets.length} Tiket ditemukan</span>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-teal-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Memuat data tiket dari Google Spreadsheet...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">Belum ada tiket yang dibuat</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Anda belum memiliki riwayat tiket support. Klik tombol di bawah untuk membuat permohonan pertama Anda.
            </p>
            <Link
              href="/support/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 border border-teal-500/30 text-xs font-semibold transition mt-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Tiket Baru</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredTickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/support/ticket?id=${ticket.id}`}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/50 transition group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                      {ticket.ticketNumber}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {getCategoryIcon(ticket.category)}
                      <span>{getCategoryLabel(ticket.category)}</span>
                    </span>
                    {getStatusBadge(ticket.status)}
                  </div>
                  
                  <h3 className="font-bold text-slate-100 group-hover:text-teal-300 transition text-sm sm:text-base line-clamp-1">
                    {ticket.subject}
                  </h3>
                  
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {ticket.description}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 text-xs text-slate-400 shrink-0">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(ticket.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-teal-400 group-hover:border-teal-500/40 transition">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
