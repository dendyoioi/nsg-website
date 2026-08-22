"use client";

import { useState } from "react";
import type { Content } from "@/content/types";

type Status = "idle" | "sending" | "success" | "error" | "unconfigured";

export function ContactForm({ t }: { t: Content }) {
  const f = t.contact.form;
  const [status, setStatus] = useState<Status>("idle");
  const busy = status === "sending";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get("botcheck")) return; // honeypot terisi → bot, abaikan
    const key = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "";
    if (!key) {
      setStatus("unconfigured");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(data.entries())),
      });
      const json = (await res.json()) as { success?: boolean };
      if (json.success) {
        form.reset();
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const inputCls =
    "w-full rounded-xl border border-brand-100 bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-brand-500 focus:outline-none";
  const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/70";

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-brand-100 bg-white p-8">
      <input type="hidden" name="access_key" value={process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? ""} />
      <input type="hidden" name="subject" value={f.emailSubject} />
      <input type="hidden" name="from_name" value="Website NSG" />
      <input
        type="checkbox"
        name="botcheck"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelCls}>{f.nameLabel}</label>
          <input id="name" name="name" required className={inputCls} placeholder={f.namePlaceholder} />
        </div>
        <div>
          <label htmlFor="email" className={labelCls}>{f.emailLabel}</label>
          <input id="email" name="email" type="email" required className={inputCls} placeholder="email@contoh.co.id" />
        </div>
      </div>
      <div className="mt-5">
        <label htmlFor="company" className={labelCls}>{f.companyLabel}</label>
        <input id="company" name="company" className={inputCls} placeholder={f.companyPlaceholder} />
      </div>
      <div className="mt-5">
        <label htmlFor="category" className={labelCls}>{f.categoryLabel}</label>
        <select id="category" name="category" required className={inputCls} defaultValue="">
          <option value="" disabled>
            —
          </option>
          {t.divisions.items.map((d) => (
            <option key={d.number} value={d.name}>
              {d.name}
            </option>
          ))}
          <option value={f.categoryOther}>{f.categoryOther}</option>
        </select>
      </div>
      <div className="mt-5">
        <label htmlFor="message" className={labelCls}>{f.messageLabel}</label>
        <textarea id="message" name="message" required rows={5} className={inputCls} placeholder={f.messagePlaceholder} />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="mt-6 w-full rounded-full bg-gradient-to-r from-brand-700 to-brand-500 px-6 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? f.sendingLabel : f.submitLabel}
      </button>
      {status === "success" && (
        <p className="mt-4 rounded-xl bg-brand-100 px-4 py-3 text-sm text-brand-700">{f.successMessage}</p>
      )}
      {status === "error" && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{f.errorMessage}</p>
      )}
      {status === "unconfigured" && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">{f.unconfiguredMessage}</p>
      )}
    </form>
  );
}
