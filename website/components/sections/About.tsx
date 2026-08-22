import {
  Check,
  Eye,
  Handshake,
  Shield,
  Target,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/content/site";
import type { Content } from "@/content/types";

const valueIcons = [Shield, UserCheck, Handshake, Users, TrendingUp];

export function About({ t }: { t: Content }) {
  return (
    <section id={site.anchors.about} className="bg-paper-alt py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header & Concise Intro */}
        <Reveal className="mx-auto max-w-3xl text-center">
          <SectionHeading
            eyebrow={t.about.eyebrow}
            title={t.about.heading}
            align="center"
          />
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-600 font-normal">
            {t.about.paragraphs[0]}
          </p>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-500">
            {t.about.paragraphs[1]}
          </p>
        </Reveal>

        {/* Vision & Mission Cards */}
        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* Vision Card */}
          <Reveal delay={0.1}>
            <div className="flex h-full flex-col justify-between rounded-3xl bg-gradient-to-br from-brand-950 via-slate-900 to-brand-900 p-8 sm:p-10 text-white shadow-xl">
              <div>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/20 text-brand-300">
                  <Eye className="h-6 w-6" />
                </div>
                <h3 className="mt-6 font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {t.about.visionLabel}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-slate-200">
                  &ldquo;{t.about.vision}&rdquo;
                </p>
              </div>
              <div className="mt-8 border-t border-white/10 pt-4 text-xs font-semibold uppercase tracking-wider text-brand-300">
                {site.name} — Strategic Vision
              </div>
            </div>
          </Reveal>

          {/* Mission Card */}
          <Reveal delay={0.2}>
            <div className="flex h-full flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-lg">
              <div>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="mt-6 font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
                  {t.about.missionLabel}
                </h3>
                <ul className="mt-6 space-y-3.5">
                  {t.about.missions.map((m) => (
                    <li
                      key={m.slice(0, 32)}
                      className="flex items-start gap-3 text-sm leading-relaxed text-slate-700"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 border-t border-slate-100 pt-4 text-xs font-semibold uppercase tracking-wider text-brand-700">
                Action-Driven Commitments
              </div>
            </div>
          </Reveal>
        </div>

        {/* 5 Core Values */}
        <Reveal delay={0.25} className="mt-20">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-700">
              {t.about.valuesLabel}
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
              Prinsip & Budaya Kerja Utama
            </h3>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {t.about.values.map((v, i) => {
              const Icon = valueIcons[i % valueIcons.length];
              return (
                <div
                  key={v.name}
                  className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="mt-4 font-display text-base font-bold text-ink">
                    {v.name}
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {v.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
