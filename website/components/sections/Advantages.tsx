import {
  Building,
  Check,
  CheckCircle2,
  HardHat,
  ShieldCheck,
} from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/content/site";
import type { Content } from "@/content/types";

export function Advantages({ t }: { t: Content }) {
  return (
    <section id={site.anchors.advantages} className="bg-paper-alt py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            eyebrow={t.advantages.eyebrow}
            title={t.advantages.heading}
            align="center"
          />
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600">
            Fondasi keunggulan layanan dan integritas operasional PT Nattu Global Synergy.
          </p>
        </div>

        {/* 8 Core Strengths Grid */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.advantages.items.map((item, i) => (
            <Reveal key={item} delay={(i % 4) * 0.05}>
              <div className="flex h-full items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:border-brand-300 hover:shadow-md">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold leading-snug text-slate-800">
                  {item}
                </span>
              </div>
            </Reveal>
          ))}
        </div>

        {/* K3, Mutu & Compliance Section (High Contrast & Crystal Clear Text) */}
        <Reveal delay={0.15} className="mt-16">
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-brand-950 via-slate-900 to-brand-900 p-8 sm:p-12 text-white shadow-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-500/20 text-brand-300 border border-brand-500/30">
                <HardHat className="h-7 w-7" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-300">
                  {t.advantages.compliance.eyebrow}
                </span>
                <h3 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl text-white">
                  {t.advantages.compliance.heading}
                </h3>
              </div>
            </div>

            {/* 4 Compliance Points */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {t.advantages.compliance.items.map((item) => (
                <div
                  key={item.slice(0, 32)}
                  className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" />
                  <span className="text-sm font-medium leading-relaxed text-slate-200">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* Commitment Paragraphs */}
            <div className="mt-8 border-t border-white/15 pt-8">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-brand-300" />
                <h4 className="font-display text-lg font-bold text-white">
                  {t.advantages.compliance.commitmentHeading}
                </h4>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {t.advantages.compliance.commitment.map((p) => (
                  <p
                    key={p.slice(0, 32)}
                    className="text-sm leading-relaxed text-slate-300 bg-white/5 rounded-xl p-4 border border-white/5"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Integrated: Siapa yang Kami Layani (13 Customer Sectors) */}
        <Reveal delay={0.2} className="mt-20">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-lg text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-700 border border-brand-100">
              <Building className="h-3.5 w-3.5" />
              <span>{t.sectors.eyebrow}</span>
            </div>
            <h3 className="mt-4 font-display text-2xl font-bold text-ink sm:text-3xl">
              {t.sectors.heading}
            </h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-slate-600">
              Kemitraan strategis lintas sektor pemerintah, BUMN, dan industri komersial swasta.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-2.5">
              {t.sectors.items.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800 hover:shadow"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
