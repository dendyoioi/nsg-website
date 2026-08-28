import React from 'react';
import Link from 'next/link';
import { LogoMark } from '@/components/LogoMark';
import { HtmlShell } from '@/components/HtmlShell';
import { SupportNav } from '@/components/support/SupportNav';

export const metadata = {
  title: 'Nattu Support Center & Maintenance SLA Portal',
  description: 'Portal ticketing support resmi untuk jasa maintenance website dan email PT Nattu Global Synergy.',
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <HtmlShell lang="id">
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
        {/* Main Support Header */}
        <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/support" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:border-teal-400 transition-colors">
                  <LogoMark className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <div className="font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Nattu Support</span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      Portal
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Website & Email Service Desk</p>
                </div>
              </Link>
            </div>

            <SupportNav />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Support Footer */}
        <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} PT Nattu Global Synergy — IT Maintenance & Support Services.</p>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Email: info@nattuglobalsynergy.co.id</span>
            </div>
          </div>
        </footer>
      </div>
    </HtmlShell>
  );
}
