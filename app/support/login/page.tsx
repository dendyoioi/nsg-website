'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Mail, 
  Lock, 
  LogIn, 
  ArrowLeft, 
  UserCheck, 
  AlertCircle, 
  Loader2, 
  LifeBuoy, 
  LogOut,
  Building
} from 'lucide-react';
import { verifyUserLogin } from '@/lib/support-storage';

export default function ClientLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingUser, setExistingUser] = useState<{ id: string; name: string; email: string; department?: string; company?: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nattu_client_user');
      if (stored) {
        setExistingUser(JSON.parse(stored));
      }
    } catch {
      setExistingUser(null);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPin = pin.trim();

    try {
      // Direct verification with Google Apps Script backend reading from Spreadsheet
      const res = await verifyUserLogin(cleanEmail, cleanPin);

      if (res.success && res.user) {
        const userObj = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
          department: res.user.department,
          company: res.user.company || 'PT Nattu Global Synergy'
        };
        localStorage.setItem('nattu_client_user', JSON.stringify(userObj));
        window.dispatchEvent(new Event('nattu_auth_change'));
        setExistingUser(userObj);
        router.push('/support');
      } else {
        setErrorMsg(res.message || 'Email atau PIN tidak terdaftar di Google Spreadsheet.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan saat memverifikasi data ke Google Spreadsheet. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAccount = () => {
    localStorage.removeItem('nattu_client_user');
    setExistingUser(null);
    setEmail('');
    setPin('');
    window.dispatchEvent(new Event('nattu_auth_change'));
  };

  if (checkingAuth) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-400 mb-2" />
        <p className="text-xs">Memeriksa status login...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-10 space-y-6">
      <div>
        <Link
          href="/support"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-300 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Portal Support</span>
        </Link>
      </div>

      {existingUser ? (
        // Display active session card if user is already logged in
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto">
            <UserCheck className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-md border border-teal-500/20">
              Sesi Sedang Aktif
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight pt-2">
              {existingUser.name}
            </h1>
            <p className="text-xs text-slate-400">{existingUser.email}</p>
            {existingUser.department && (
              <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1 mt-1">
                <Building className="w-3 h-3" />
                <span>{existingUser.department} • {existingUser.company || 'PT Nattu Global Synergy'}</span>
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-3">
            <p>Anda sudah terautentikasi dan dapat langsung mengakses tiket Anda.</p>
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <Link
                href="/support"
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2"
              >
                <LifeBuoy className="w-4 h-4" />
                <span>Buka Daftar Tiket</span>
              </Link>

              <button
                type="button"
                onClick={handleSwitchAccount}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Ganti Akun</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Standard Login Form
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto">
              <UserCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Login User / Staf Nattu
            </h1>
            <p className="text-xs text-slate-400">
              Kredensial diverifikasi langsung dari tab <strong>Users</strong> di Google Spreadsheet Anda.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Perusahaan <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="nama@nattuglobalsynergy.co.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password / PIN <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="Masukkan PIN Anda..."
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition disabled:opacity-50"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi ke Spreadsheet...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Akun</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
            Database User terhubung secara real-time ke Google Spreadsheet PT Nattu Global Synergy.
          </div>
        </div>
      )}
    </div>
  );
}
