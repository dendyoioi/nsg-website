'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  X, 
  Bot, 
  Sparkles, 
  Mail, 
  AlertCircle, 
  FileEdit, 
  Layers, 
  Globe, 
  CheckCircle,
  LucideIcon,
  Lock,
  LogIn
} from 'lucide-react';
import { TicketCategory, TicketPriority, TicketFormData } from '@/lib/types/support';
import { createTicket } from '@/lib/support-storage';

export default function NewTicketPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [isClientLoggedIn, setIsClientLoggedIn] = useState<boolean | null>(null);

  const [formData, setFormData] = useState<TicketFormData>({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    companyName: 'PT Nattu Global Synergy',
    category: 'content_revision',
    priority: 'normal',
    subject: '',
    description: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('nattu_client_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setFormData(prev => ({
          ...prev,
          clientName: user.name || '',
          clientEmail: user.email || '',
          companyName: user.company || 'PT Nattu Global Synergy'
        }));
        setIsClientLoggedIn(true);
      } catch {
        setIsClientLoggedIn(false);
      }
    } else {
      setIsClientLoggedIn(false);
    }
  }, []);

  const [filePreview, setFilePreview] = useState<{ name: string; type: string; base64: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal adalah 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFilePreview({
        name: file.name,
        type: file.type,
        base64: base64String
      });
      setFormData(prev => ({
        ...prev,
        fileName: file.name,
        fileType: file.type,
        fileBase64: base64String
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setFilePreview(null);
    setFormData(prev => ({
      ...prev,
      fileName: undefined,
      fileType: undefined,
      fileBase64: undefined
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.clientEmail || !formData.subject || !formData.description) {
      alert('Mohon lengkapi semua kolom yang wajib diisi (*)');
      return;
    }

    setSubmitting(true);
    try {
      const newTicket = await createTicket(formData);
      if (newTicket && newTicket.id) {
        router.push(`/support/ticket?id=${newTicket.id}`);
      } else {
        alert('Gagal membuat tiket. Silakan coba kembali.');
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories: { id: TicketCategory; label: string; icon: LucideIcon; desc: string; sla: 0 | 1 }[] = [
    {
      id: 'content_revision',
      label: 'Revisi / Perubahan Konten',
      icon: FileEdit,
      desc: 'Update teks, gambar banner, kontak WhatsApp, atau produk',
      sla: 1
    },
    {
      id: 'email_webmail',
      label: 'Email & Webmail (Gmail)',
      icon: Mail,
      desc: 'Bantuan kendala email korporat yang terintegrasi di akun Gmail',
      sla: 0
    },
    {
      id: 'website_bug',
      label: 'Error / Bug Website',
      icon: AlertCircle,
      desc: 'Tampilan berantakan, tombol tidak berfungsi, atau link error',
      sla: 1
    },
    {
      id: 'new_feature',
      label: 'Permintaan Fitur Baru',
      icon: Layers,
      desc: 'Penambahan section baru, integrasi formulir, atau halaman baru',
      sla: 1
    },
    {
      id: 'domain_dns',
      label: 'Domain & Server / SSL',
      icon: Globe,
      desc: 'Kendala sertifikat SSL tidak aman atau website tidak bisa dibuka',
      sla: 0
    },
  ];

  const currentCategoryObj = categories.find(c => c.id === formData.category);

  if (isClientLoggedIn === false) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">Login Diperlukan</h2>
            <p className="text-xs text-slate-400">
              Silakan login dengan akun email korporat (@nattuglobalsynergy.co.id) Anda terlebih dahulu untuk membuat tiket support.
            </p>
          </div>

          <Link
            href="/support/login"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Login Sekarang</span>
          </Link>

          <Link
            href="/support"
            className="inline-block text-xs text-slate-500 hover:text-slate-300 transition pt-1"
          >
            Kembali ke Daftar Tiket
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb / Back Link */}
      <div>
        <Link
          href="/support"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-300 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Tiket</span>
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="border-b border-slate-800 pb-5 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Buat Tiket Layanan & Maintenance Baru
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Layanan resmi maintenance PT Nattu. Sistem kami otomatis mengalokasikan AI SLA untuk mempercepat respon.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Informasi Kontak Klien */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nama Lengkap Anda <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Bpk. Hendra / Ibu Rahma"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Nattu / Kantor <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="nama@nattu.id"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                No. WhatsApp / Telepon
              </label>
              <input
                type="text"
                placeholder="0812-xxxx-xxxx"
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Perusahaan / Departemen
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition"
              />
            </div>
          </div>

          {/* Section 2: Pemilihan Kategori */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Pilih Kategori Permintaan <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = formData.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-teal-950/40 border-teal-500 text-white shadow-md shadow-teal-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && <CheckCircle className="w-4 h-4 text-teal-400" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">{cat.label}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{cat.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic AI SLA Hint Banner */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-teal-500/20 text-xs flex items-start gap-3">
            {currentCategoryObj?.sla === 1 ? (
              <>
                <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-purple-300">AI SLA Level 1 (Website Code Engine):</strong>
                  <p className="text-slate-400 mt-0.5">
                    Permintaan ini akan dianalisis secara mendalam oleh AI untuk merumuskan spesifikasi teknis dan prompt otomatis yang langsung dieksekusi oleh Tim Developer (Admin).
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-400 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-sky-300">AI SLA Level 0 (Instant Auto-Triage):</strong>
                  <p className="text-slate-400 mt-0.5">
                    Anda akan langsung mendapatkan instruksi langkah demi langkah secara instan (&lt; 1 Menit) setelah tiket disubmit.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Section 3: Prioritas & Detail Permintaan */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tingkat Prioritas
              </label>
              <div className="flex flex-wrap gap-2">
                {(['low', 'normal', 'high', 'urgent'] as TicketPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p })}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                      formData.priority === p
                        ? p === 'urgent'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : p === 'high'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-teal-500/20 border-teal-500 text-teal-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {p === 'low' && 'Rendah (Low)'}
                    {p === 'normal' && 'Normal (Standar)'}
                    {p === 'high' && 'Tinggi (High)'}
                    {p === 'urgent' && 'Kritis / Urgent'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Subjek / Judul Tiket <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Revisi teks di Footer dan penambahan link sosial media baru"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Rincian Deskripsi Permintaan <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={5}
                placeholder="Jelaskan secara detail bagian mana yang ingin diubah, ekspektasi tampilan, teks baru yang ingin dimasukkan, atau kendala error yang dialami..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition leading-relaxed"
              />
            </div>
          </div>

          {/* Section 4: File / Screenshot Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Lampiran Gambar / Dokumen (Opsional)
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Format: JPG, PNG, PDF, DOCX (Maks 5MB). Otomatis diunggah dan diarsipkan ke Google Drive Ticketing Nattu.
            </p>

            {filePreview ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-teal-500/30">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 flex-shrink-0">
                    <Paperclip className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden text-xs">
                    <p className="font-semibold text-slate-200 truncate">{filePreview.name}</p>
                    <p className="text-slate-500">{filePreview.type}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-800 hover:border-teal-500/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 hover:bg-slate-950 transition group">
                <Paperclip className="w-6 h-6 text-slate-500 group-hover:text-teal-400 mb-2 transition" />
                <span className="text-xs font-semibold text-slate-300 group-hover:text-white">
                  Klik untuk pilih file atau seret screenshot ke sini
                </span>
                <span className="text-[11px] text-slate-500 mt-1">PNG, JPG, PDF hingga 5MB</span>
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <Link
              href="/support"
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Memproses & Menjalankan AI SLA...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Tiket Sekarang</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
