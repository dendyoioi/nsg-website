import { Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/sections/ContactForm";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/content/site";
import type { Content } from "@/content/types";

export function Contact({ t }: { t: Content }) {
  return (
    <section id={site.anchors.contact} className="bg-paper-alt py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow={t.contact.eyebrow} title={t.contact.heading} />
        <p className="mt-4 max-w-2xl leading-relaxed text-ink/70">{t.contact.lead}</p>
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <ContactForm t={t} />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="h-fit rounded-2xl border border-brand-100 bg-white p-8">
              <h3 className="font-display text-lg font-bold text-ink">{t.contact.infoTitle}</h3>
              <ul className="mt-6 space-y-5 text-sm leading-relaxed text-ink/80">
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-brand-700">
                      {t.contact.addressLabel}
                    </div>
                    <div className="mt-1">{site.addressFull}</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-brand-700">
                      {t.contact.emailLabel}
                    </div>
                    <a
                      href={`mailto:${site.email}`}
                      className="mt-1 block text-brand-700 transition-colors hover:underline"
                    >
                      {site.email}
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
