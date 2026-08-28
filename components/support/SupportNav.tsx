'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LifeBuoy, PlusCircle, LogOut, LogIn, ArrowLeft, ShieldCheck } from 'lucide-react';

export function SupportNav() {
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const checkAuth = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Check client user session
    const storedClient = localStorage.getItem('nattu_client_user');
    if (storedClient) {
      try {
        setCurrentUser(JSON.parse(storedClient));
      } catch {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }

    // Check admin auth session
    const storedAdmin = localStorage.getItem('nattu_admin_auth');
    setIsAdminAuth(storedAdmin === 'true');
  }, []);

  useEffect(() => {
    setMounted(true);
    checkAuth();

    // Listen to custom auth change, storage events, and route changes
    window.addEventListener('storage', checkAuth);
    window.addEventListener('nattu_auth_change', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('nattu_auth_change', checkAuth);
    };
  }, [checkAuth, pathname]);

  const handleLogoutClient = () => {
    localStorage.removeItem('nattu_client_user');
    setCurrentUser(null);
    window.dispatchEvent(new Event('nattu_auth_change'));
    window.location.href = '/support/login';
  };

  const handleLogoutAdmin = () => {
    localStorage.removeItem('nattu_admin_auth');
    setIsAdminAuth(false);
    window.dispatchEvent(new Event('nattu_auth_change'));
    window.location.href = '/support/admin';
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <nav className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Website</span>
        </Link>
      </nav>
    );
  }

  // If user is currently on the Admin Cockpit route (/support/admin)
  if (pathname?.startsWith('/support/admin')) {
    return (
      <nav className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5 hidden md:flex"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Website</span>
        </Link>

        {isAdminAuth ? (
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Dendy Aditya (Admin / Real Agent)</span>
            </div>

            <button
              onClick={handleLogoutAdmin}
              title="Kunci Sesi Admin"
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition flex items-center gap-1 text-xs font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Kunci Admin</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Portal</span>
          </div>
        )}
      </nav>
    );
  }

  // Standard Client Portal Navigation
  return (
    <nav className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/"
        className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5 hidden md:flex"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Kembali ke Website</span>
      </Link>

      {currentUser ? (
        <>
          <Link
            href="/support"
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              pathname === '/support' 
                ? 'bg-slate-800 text-teal-300 font-semibold' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LifeBuoy className="w-4 h-4 text-teal-400" />
            <span>Daftar Tiket</span>
          </Link>

          <Link
            href="/support/new"
            className="text-xs font-semibold bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white px-3.5 py-1.5 rounded-lg shadow-sm shadow-teal-500/20 transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buat Tiket Baru</span>
          </Link>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[130px]">{currentUser.name}</span>
              <span className="text-[10px] text-teal-400 truncate max-w-[130px]">{currentUser.email}</span>
            </div>
            <button
              onClick={handleLogoutClient}
              title="Keluar (Logout)"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition flex items-center gap-1 text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Logout</span>
            </button>
          </div>
        </>
      ) : (
        <Link
          href="/support/login"
          className="text-xs font-semibold bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white px-3.5 py-1.5 rounded-lg shadow-sm shadow-teal-500/20 transition flex items-center gap-1.5"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Login User</span>
        </Link>
      )}
    </nav>
  );
}
