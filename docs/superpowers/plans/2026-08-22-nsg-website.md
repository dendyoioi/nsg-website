# Website Company Profile NSG — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Website company profile produksi PT Nattu Global Synergy — one-page bilingual (ID `/`, EN `/en`) dengan Next.js static export untuk hosting Biznet Gio NEO.

**Architecture:** Next.js 15 App Router dengan dua root layout via route groups `(id)` dan `(en)` (agar `<html lang>` benar per bahasa — static export tidak mendukung redirect root). Seluruh teks situs hidup di modul TS terpusat yang memenuhi satu `interface Content` (paritas bahasa dijamin compiler). Form kontak = satu-satunya interaksi jaringan (POST client-side ke Web3Forms).

**Tech Stack:** Next.js 15 (App Router, `output: 'export'`), React 19, TypeScript, Tailwind CSS v4, `motion` (animasi), `lucide-react` (ikon), `vitest` (tes konten).

**Spec:** `docs/superpowers/specs/2026-08-22-nsg-website-design.md`

## Global Constraints

- Semua perintah `npm`/`npx` dijalankan dari dalam folder `website/` kecuali disebutkan lain.
- Static export: `next.config.ts` wajib `output: 'export'` + `images: { unoptimized: true }`. Dilarang memakai fitur server-only (API routes, middleware, ISR, `next/image` optimizer).
- Warna hanya dari token di `@theme` globals.css (`brand-950/900/700/500/300/100`, `paper`, `paper-alt`, `ink`). Tidak ada hex mentah di komponen.
- Font: Sora (`--font-display`) + Inter (`--font-body`) via `next/font/google`, hanya di-set di root layout.
- Semua teks UI wajib dari `content/id.ts` / `content/en.ts`. Tidak ada string bahasa yang di-hardcode di komponen.
- Komit git dari root proyek setelah setiap task; pesan commit konvensional (`feat:`, `test:`, `chore:`, `docs:`).
- Angka konten wajib sesuai dokumen sumber: 3 divisi × 10 item, 5 misi, 5 nilai, 8 keunggulan, 4 poin K3, 13 sektor, 3 paragraf tentang.
- Anchor section (sama untuk kedua bahasa): `beranda`, `tentang`, `divisi`, `keunggulan`, `kontak` — dari `site.anchors`.
- Animasi harus menghormati `prefers-reduced-motion`.

---

### Task 1: Scaffold Next.js + konfigurasi static export

**Files:**
- Create: `website/` (via create-next-app)
- Modify: `website/next.config.ts`
- Delete: `website/public/*.svg` bawaan (next.svg, vercel.svg, dll.)

**Interfaces:**
- Produces: proyek Next.js 15 yang bisa di-build; `npm run build` menghasilkan `website/out/`.

- [ ] **Step 1: Scaffold**

Dari root proyek `/Users/dendyaditya/Projects/windy_project`:

```bash
npx create-next-app@latest website --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --yes
```

Expected: folder `website/` terbuat dengan `app/`, `package.json`, `next.config.ts`. (Git root sudah ada, jadi create-next-app tidak membuat repo baru.)

- [ ] **Step 2: Konfigurasi export**

Ganti seluruh isi `website/next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
```

- [ ] **Step 3: Hapus aset bawaan yang tidak dipakai**

```bash
rm -f website/public/*.svg website/public/*.ico
```

- [ ] **Step 4: Verifikasi build menghasilkan out/**

```bash
cd website && npm run build
```

Expected: build sukses tanpa error, folder `out/` berisi `index.html`, `index.txt`, `favicon.ico` atau hasil serupa.

- [ ] **Step 5: Commit**

```bash
cd .. && git add website/ && git commit -m "chore: scaffold Next.js 15 + static export config untuk website NSG"
```

---

### Task 2: Design tokens, fonts, dan shell HTML

**Files:**
- Modify: `website/app/globals.css` (ganti total)
- Create: `website/lib/fonts.ts`
- Create: `website/components/HtmlShell.tsx`
- Delete: `website/app/layout.tsx`, `website/app/page.tsx` (diganti route groups di Task 6)

**Interfaces:**
- Produces: token kelas Tailwind `bg-brand-*`, `text-ink`, `bg-paper`, `bg-paper-alt`, `font-display`, `font-body`; komponen `<HtmlShell lang>{children}</HtmlShell>` untuk dipakai kedua root layout.

- [ ] **Step 1: Tulis globals.css**

Ganti seluruh isi `website/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-brand-950: #062924;
  --color-brand-900: #0b3a36;
  --color-brand-700: #0f766e;
  --color-brand-500: #14b8a6;
  --color-brand-300: #5eead4;
  --color-brand-100: #ccfbf1;
  --color-paper: #f7faf9;
  --color-paper-alt: #f2f8f6;
  --color-ink: #0f1f1d;
}

@theme inline {
  --font-display: var(--font-sora), ui-sans-serif, system-ui, sans-serif;
  --font-body: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
}

html {
  scroll-behavior: smooth;
}

section[id] {
  scroll-margin-top: 5rem;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

- [ ] **Step 2: Fonts**

Buat `website/lib/fonts.ts`:

```ts
import { Inter, Sora } from "next/font/google";

export const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
```

- [ ] **Step 3: HtmlShell**

Buat `website/components/HtmlShell.tsx`:

```tsx
import type { ReactNode } from "react";
import { inter, sora } from "@/lib/fonts";

export function HtmlShell({
  lang,
  children,
}: {
  lang: string;
  children: ReactNode;
}) {
  return (
    <html lang={lang} className={`${sora.variable} ${inter.variable}`}>
      <body className="bg-paper font-body text-ink antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Verifikasi build tetap hijau (layout & page bawaan masih ada — diganti di Task 6)**

```bash
cd website && npm run build
```

Expected: build sukses (globals.css baru + fonts + HtmlShell belum dipakai, tidak merusak apa pun).

- [ ] **Step 5: Commit**

```bash
cd .. && git add website/ && git commit -m "feat: design tokens arah Living Synergy + font Sora/Inter + HtmlShell"
```

---

### Task 3: Sistem konten — types, site, konten Indonesia + tes integritas

**Files:**
- Create: `website/content/types.ts`
- Create: `website/content/site.ts`
- Create: `website/content/id.ts`
- Create: `website/content/index.ts`
- Test: `website/content/content.test.ts`

**Interfaces:**
- Produces: `type Locale = 'id' | 'en'`; `interface Content` (bentuk di bawah — Task 4 wajib memenuhi); `getContent(locale): Content`; objek `site` dengan `site.anchors`, `site.addressFull`, `site.addressShort`, `site.email`, `site.name`, `site.brand`, `site.tagline`, `site.url`.

- [ ] **Step 1: Install vitest & tambah script test**

```bash
cd website && npm i -D vitest
```

Di `website/package.json`, bagian `"scripts"`, tambah:

```json
"test": "vitest run"
```

- [ ] **Step 2: Tulis tes gagal lebih dulu**

Buat `website/content/content.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { contentId } from "./id";
import type { Content } from "./types";

function assertAllStringsNonEmpty(obj: unknown, path = "content"): void {
  if (typeof obj === "string") {
    expect(obj.trim().length, `${path} kosong`).toBeGreaterThan(0);
    return;
  }
  if (Array.isArray(obj)) {
    expect(obj.length, `${path} tidak boleh array kosong`).toBeGreaterThan(0);
    obj.forEach((v, i) => assertAllStringsNonEmpty(v, `${path}[${i}]`));
    return;
  }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) assertAllStringsNonEmpty(v, `${path}.${k}`);
  }
}

describe("konten Indonesia (sumber: NSG COMPRO.docx)", () => {
  it("3 divisi, masing-masing 10 item", () => {
    expect(contentId.divisions.items).toHaveLength(3);
    for (const d of contentId.divisions.items) expect(d.items).toHaveLength(10);
  });

  it("3 paragraf tentang, 5 misi, 5 nilai", () => {
    expect(contentId.about.paragraphs).toHaveLength(3);
    expect(contentId.about.missions).toHaveLength(5);
    expect(contentId.about.values).toHaveLength(5);
  });

  it("8 keunggulan, 4 poin K3, 2 paragraf komitmen", () => {
    expect(contentId.advantages.items).toHaveLength(8);
    expect(contentId.advantages.compliance.items).toHaveLength(4);
    expect(contentId.advantages.compliance.commitment).toHaveLength(2);
  });

  it("13 sektor target pelanggan", () => {
    expect(contentId.sectors.items).toHaveLength(13);
  });

  it("semua field teks terisi (non-kosong)", () => {
    assertAllStringsNonEmpty(contentId satisfies Content);
  });
});
```

- [ ] **Step 3: Verifikasi tes gagal**

```bash
npm test
```

Expected: FAIL — `Cannot find module './id'` (atau error resolve serupa).

- [ ] **Step 4: Tulis types + site**

Buat `website/content/types.ts`:

```ts
export type Locale = "id" | "en";

export interface DivisionItem {
  number: string;
  icon: "building" | "layers" | "cpu";
  name: string;
  intro: string;
  items: string[];
}

export interface Content {
  meta: { title: string; description: string };
  nav: {
    about: string;
    divisions: string;
    advantages: string;
    contact: string;
    contactCta: string;
  };
  hero: {
    eyebrow: string;
    titlePre: string;
    titleHighlight: string;
    titlePost: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    imageAlt: string;
    stats: { value: string; label: string }[];
  };
  about: {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
    valuesLabel: string;
    values: { name: string; description: string }[];
    visionLabel: string;
    vision: string;
    missionLabel: string;
    missions: string[];
  };
  divisions: {
    eyebrow: string;
    heading: string;
    lead: string;
    items: DivisionItem[];
  };
  advantages: {
    eyebrow: string;
    heading: string;
    items: string[];
    compliance: {
      eyebrow: string;
      heading: string;
      items: string[];
      commitmentHeading: string;
      commitment: string[];
    };
  };
  sectors: { eyebrow: string; heading: string; items: string[] };
  contact: {
    eyebrow: string;
    heading: string;
    lead: string;
    form: {
      nameLabel: string;
      namePlaceholder: string;
      emailLabel: string;
      companyLabel: string;
      companyPlaceholder: string;
      categoryLabel: string;
      categoryOther: string;
      messageLabel: string;
      messagePlaceholder: string;
      submitLabel: string;
      sendingLabel: string;
      successMessage: string;
      errorMessage: string;
      unconfiguredMessage: string;
      emailSubject: string;
    };
    infoTitle: string;
    addressLabel: string;
    emailLabel: string;
  };
  footer: { navTitle: string; contactTitle: string; copyright: string };
}
```

Buat `website/content/site.ts` (data non-bahasa):

```ts
export const site = {
  name: "PT Nattu Global Synergy",
  brand: "Nattu Global Synergy",
  tagline: "Building Strong Foundations, Delivering Sustainable Synergy",
  // TODO: ganti setelah domain .co.id final & email korporat aktif
  url: "https://www.nattuglobalsynergy.co.id",
  email: "info@nattuglobalsynergy.co.id",
  addressFull:
    "Jl. Serdang Raya No. 12, Kel. Sumur Batu, Kec. Kemayoran, Kota Administrasi Jakarta Pusat, DKI Jakarta 10650",
  addressShort: "Kemayoran, Jakarta Pusat 10650",
  phone: "", // TODO: isi nomor telepon resmi klien
  anchors: {
    home: "beranda",
    about: "tentang",
    divisions: "divisi",
    advantages: "keunggulan",
    contact: "kontak",
  },
} as const;
```

- [ ] **Step 5: Tulis konten Indonesia**

Buat `website/content/id.ts` — seluruh teks verbatim dari `Data Dokumen/NSG COMPRO.docx`:

```ts
import type { Content } from "./types";

export const contentId: Content = {
  meta: {
    title: "PT Nattu Global Synergy — Konstruksi, Perdagangan Logam & Suku Cadang Elektronik",
    description:
      "PT Nattu Global Synergy adalah mitra terpercaya untuk konstruksi gedung perkantoran, perdagangan bahan konstruksi logam, dan pengadaan suku cadang elektronik di Jakarta — melayani sektor pemerintah, BUMN, dan swasta.",
  },
  nav: {
    about: "Tentang Kami",
    divisions: "Bidang Usaha",
    advantages: "Keunggulan",
    contact: "Kontak",
    contactCta: "Hubungi Kami",
  },
  hero: {
    eyebrow: "Satu Mitra — Tiga Solusi",
    titlePre: "Building Strong Foundations, Delivering ",
    titleHighlight: "Sustainable Synergy",
    titlePost: ".",
    subtitle:
      "Konstruksi gedung perkantoran, perdagangan bahan konstruksi logam, dan pengadaan suku cadang elektronik — solusi terpadu untuk sektor pemerintah, BUMN, dan swasta.",
    ctaPrimary: "Jelajahi Divisi",
    ctaSecondary: "Hubungi Kami",
    imageAlt: "Struktur konstruksi gedung bertingkat",
    stats: [
      { value: "3", label: "Divisi Utama" },
      { value: "13+", label: "Sektor Pelanggan" },
      { value: "K3", label: "Komitmen Keselamatan" },
    ],
  },
  about: {
    eyebrow: "Tentang Kami",
    heading: "Mitra konstruksi & perdagangan yang terpercaya",
    paragraphs: [
      "PT NATTU GLOBAL SYNERGY adalah perusahaan yang bergerak di bidang konstruksi dan perdagangan yang berkomitmen memberikan solusi terpadu bagi kebutuhan sektor pembangunan, industri, komersial, maupun pemerintahan.",
      "Dengan mengedepankan profesionalisme, kualitas, dan integritas, PT NATTU GLOBAL SYNERGY hadir sebagai mitra bisnis yang mampu menyediakan layanan konstruksi serta pengadaan berbagai kebutuhan material dan komponen industri secara efektif, efisien, dan tepat waktu.",
      "Kami percaya bahwa keberhasilan sebuah proyek dibangun melalui sinergi yang kuat antara kualitas pekerjaan, ketepatan pelaksanaan, dan hubungan kerja sama yang berkelanjutan dengan setiap pelanggan maupun mitra usaha.",
    ],
    valuesLabel: "Nilai-Nilai Perusahaan",
    values: [
      {
        name: "Integrity",
        description:
          "Menjalankan setiap pekerjaan dengan kejujuran, tanggung jawab, dan etika bisnis yang tinggi.",
      },
      {
        name: "Professionalism",
        description:
          "Mengutamakan kompetensi, kualitas pelayanan, dan standar kerja profesional.",
      },
      {
        name: "Commitment",
        description:
          "Berkomitmen memberikan hasil terbaik sesuai kebutuhan pelanggan.",
      },
      {
        name: "Collaboration",
        description:
          "Membangun hubungan kerja sama yang saling menguntungkan dengan seluruh mitra bisnis.",
      },
      {
        name: "Continuous Improvement",
        description:
          "Terus meningkatkan kualitas layanan melalui evaluasi, inovasi, dan pengembangan berkelanjutan.",
      },
    ],
    visionLabel: "Visi",
    vision:
      "Menjadi perusahaan konstruksi dan perdagangan nasional yang terpercaya, profesional, serta memberikan solusi terbaik melalui kualitas layanan, inovasi, dan sinergi yang berkelanjutan.",
    missionLabel: "Misi",
    missions: [
      "Memberikan layanan konstruksi yang mengutamakan kualitas, keselamatan, dan ketepatan waktu.",
      "Menyediakan produk dan material berkualitas sesuai kebutuhan pelanggan.",
      "Membangun hubungan bisnis yang profesional, transparan, dan saling menguntungkan.",
      "Mengembangkan sumber daya manusia yang kompeten dan berintegritas.",
      "Memberikan nilai tambah bagi pelanggan melalui pelayanan yang responsif dan berorientasi pada kepuasan pelanggan.",
    ],
  },
  divisions: {
    eyebrow: "Bidang Usaha",
    heading: "Tiga divisi, satu sinergi",
    lead: "Kami menggabungkan keahlian konstruksi dan jaringan pengadaan untuk memenuhi kebutuhan proyek Anda secara menyeluruh.",
    items: [
      {
        number: "01",
        icon: "building",
        name: "Konstruksi Konvensional Gedung Perkantoran",
        intro:
          "Kami melayani pekerjaan konstruksi gedung perkantoran dengan pendekatan profesional dan sistematis — memperhatikan standar mutu, efisiensi biaya, keselamatan kerja, serta ketepatan waktu penyelesaian.",
        items: [
          "Pembangunan gedung perkantoran",
          "Renovasi dan rehabilitasi bangunan",
          "Pekerjaan struktur",
          "Pekerjaan arsitektur",
          "Pekerjaan interior",
          "Pekerjaan mekanikal",
          "Pekerjaan elektrikal",
          "Pekerjaan plumbing",
          "Finishing bangunan",
          "Pemeliharaan bangunan",
        ],
      },
      {
        number: "02",
        icon: "layers",
        name: "Perdagangan Besar Bahan Konstruksi dari Logam",
        intro:
          "Kami menyediakan berbagai kebutuhan material konstruksi berbahan logam untuk mendukung proyek pembangunan dan industri — mengutamakan kualitas produk, ketepatan spesifikasi, dan efisiensi distribusi.",
        items: [
          "Baja struktural",
          "Besi konstruksi",
          "Hollow",
          "Pipa baja",
          "Plat baja",
          "Wiremesh",
          "Stainless steel",
          "Aluminium",
          "Aksesoris konstruksi logam",
          "Material pendukung konstruksi lainnya",
        ],
      },
      {
        number: "03",
        icon: "cpu",
        name: "Perdagangan Besar Suku Cadang Elektronik",
        intro:
          "Kami melayani pengadaan berbagai suku cadang elektronik untuk kebutuhan industri, komersial, maupun proyek — dengan proses pengadaan yang cepat dan terpercaya.",
        items: [
          "Komponen elektronik",
          "Spare part elektronik",
          "Perangkat kelistrikan",
          "Panel dan aksesoris listrik",
          "Kabel",
          "Connector",
          "Sensor",
          "Relay",
          "Switch",
          "Komponen pendukung sistem elektronik lainnya",
        ],
      },
    ],
  },
  advantages: {
    eyebrow: "Mengapa Kami",
    heading: "Keunggulan & komitmen kami",
    items: [
      "Berorientasi pada kepuasan pelanggan",
      "Pelayanan profesional dan responsif",
      "Komitmen terhadap kualitas pekerjaan",
      "Penyediaan produk sesuai spesifikasi",
      "Penyelesaian pekerjaan secara efektif dan efisien",
      "Mengutamakan ketepatan waktu",
      "Menjunjung tinggi integritas dan transparansi",
      "Fleksibel dalam memenuhi kebutuhan proyek pelanggan",
    ],
    compliance: {
      eyebrow: "K3, Mutu & Kepatuhan",
      heading: "Keselamatan, mutu, dan kepatuhan dalam setiap pekerjaan",
      items: [
        "Mengutamakan keselamatan kerja pada setiap aktivitas operasional.",
        "Menjaga mutu pekerjaan dan produk sesuai spesifikasi yang disepakati.",
        "Menerapkan tata kelola perusahaan yang profesional.",
        "Mematuhi ketentuan peraturan perundang-undangan yang berlaku.",
      ],
      commitmentHeading: "Komitmen Kami",
      commitment: [
        "Kami memahami bahwa setiap proyek memiliki tantangan dan kebutuhan yang berbeda. Oleh karena itu, PT NATTU GLOBAL SYNERGY berkomitmen menjadi mitra yang mampu memberikan solusi terbaik melalui perencanaan yang matang, pelaksanaan yang profesional, serta pelayanan yang konsisten.",
        "Kepercayaan pelanggan merupakan aset utama perusahaan. Dengan semangat kolaborasi dan peningkatan berkelanjutan, kami siap mendukung berbagai kebutuhan konstruksi maupun pengadaan barang bagi sektor swasta, BUMN, maupun instansi pemerintah.",
      ],
    },
  },
  sectors: {
    eyebrow: "Siapa yang Kami Layani",
    heading: "Dari instansi pemerintah hingga industri",
    items: [
      "Instansi Pemerintah",
      "Kementerian",
      "BUMN",
      "BUMD",
      "Perusahaan Swasta",
      "Kontraktor",
      "Developer",
      "Industri Manufaktur",
      "Perusahaan Perdagangan",
      "Perkantoran",
      "Institusi Pendidikan",
      "Rumah Sakit",
      "Fasilitas Komersial",
    ],
  },
  contact: {
    eyebrow: "Hubungi Kami",
    heading: "Diskusikan kebutuhan proyek Anda",
    lead: "Kirim pesan melalui formulir di bawah ini, atau hubungi kami langsung melalui email.",
    form: {
      nameLabel: "Nama Lengkap",
      namePlaceholder: "Nama Anda",
      emailLabel: "Email",
      companyLabel: "Perusahaan / Institusi (opsional)",
      companyPlaceholder: "Nama perusahaan atau institusi",
      categoryLabel: "Kategori Kebutuhan",
      categoryOther: "Lainnya",
      messageLabel: "Pesan",
      messagePlaceholder: "Ceritakan kebutuhan proyek atau pengadaan Anda…",
      submitLabel: "Kirim Pesan",
      sendingLabel: "Mengirim…",
      successMessage:
        "Terima kasih! Pesan Anda telah terkirim. Kami akan segera menghubungi Anda.",
      errorMessage:
        "Maaf, pesan gagal terkirim. Silakan coba lagi atau hubungi kami melalui email.",
      unconfiguredMessage:
        "Formulir belum dikonfigurasi (access key Web3Forms belum diatur).",
      emailSubject: "Pesan baru dari website NSG",
    },
    infoTitle: "Informasi Kontak",
    addressLabel: "Alamat",
    emailLabel: "Email",
  },
  footer: {
    navTitle: "Navigasi",
    contactTitle: "Kontak",
    copyright: "© 2026 PT Nattu Global Synergy. Seluruh hak cipta dilindungi.",
  },
};
```

Buat `website/content/index.ts` (selesai di Task 4 saat `en` ada — untuk sekarang tulis versi id-only agar tes jalan):

```ts
import { contentId } from "./id";
import type { Content, Locale } from "./types";

const contents: Record<Locale, Content> = {
  id: contentId,
  en: contentId, // TODO(Task 4): ganti dengan contentEn
};

export function getContent(locale: Locale): Content {
  return contents[locale];
}
```

- [ ] **Step 6: Jalankan tes — harus lulus**

```bash
npm test
```

Expected: PASS — 5 tes konten ID hijau.

- [ ] **Step 7: Commit**

```bash
cd .. && git add website/ && git commit -m "feat: sistem konten type-safe + konten Indonesia lengkap dari dokumen client"
```

---

### Task 4: Konten English + tes paritas

**Files:**
- Create: `website/content/en.ts`
- Modify: `website/content/index.ts`
- Modify: `website/content/content.test.ts`

**Interfaces:**
- Consumes: `interface Content` dari Task 3.
- Produces: `contentEn: Content`; `getContent('en')` mengembalikan konten EN.

- [ ] **Step 1: Perluas tes untuk EN**

Tambahkan di akhir `website/content/content.test.ts`:

```ts
import { contentEn } from "./en";

describe("konten English (terjemahan)", () => {
  it("struktur sama dengan dokumen sumber", () => {
    expect(contentEn.divisions.items).toHaveLength(3);
    for (const d of contentEn.divisions.items) expect(d.items).toHaveLength(10);
    expect(contentEn.about.paragraphs).toHaveLength(3);
    expect(contentEn.about.missions).toHaveLength(5);
    expect(contentEn.about.values).toHaveLength(5);
    expect(contentEn.advantages.items).toHaveLength(8);
    expect(contentEn.advantages.compliance.items).toHaveLength(4);
    expect(contentEn.advantages.compliance.commitment).toHaveLength(2);
    expect(contentEn.sectors.items).toHaveLength(13);
  });

  it("semua field teks terisi (non-kosong)", () => {
    assertAllStringsNonEmpty(contentEn);
  });
});
```

Jalankan `npm test` — expected FAIL (`Cannot find module './en'`).

- [ ] **Step 2: Tulis konten English**

Buat `website/content/en.ts`:

```ts
import type { Content } from "./types";

export const contentEn: Content = {
  meta: {
    title: "PT Nattu Global Synergy — Construction, Metal Trading & Electronic Spare Parts",
    description:
      "PT Nattu Global Synergy is a trusted partner for office building construction, metal construction material trading, and electronic spare parts procurement in Jakarta — serving government, state-owned, and private sectors.",
  },
  nav: {
    about: "About Us",
    divisions: "Business Divisions",
    advantages: "Why Choose Us",
    contact: "Contact",
    contactCta: "Contact Us",
  },
  hero: {
    eyebrow: "One Partner — Three Solutions",
    titlePre: "Building Strong Foundations, Delivering ",
    titleHighlight: "Sustainable Synergy",
    titlePost: ".",
    subtitle:
      "Office building construction, metal construction material trading, and electronic spare parts procurement — integrated solutions for the government, state-owned, and private sectors.",
    ctaPrimary: "Explore Our Divisions",
    ctaSecondary: "Contact Us",
    imageAlt: "Multi-storey building construction structure",
    stats: [
      { value: "3", label: "Core Divisions" },
      { value: "13+", label: "Customer Sectors" },
      { value: "K3", label: "Safety Commitment" },
    ],
  },
  about: {
    eyebrow: "About Us",
    heading: "A trusted partner in construction & trading",
    paragraphs: [
      "PT NATTU GLOBAL SYNERGY is a construction and trading company committed to delivering integrated solutions for the development, industrial, commercial, and government sectors.",
      "By upholding professionalism, quality, and integrity, PT NATTU GLOBAL SYNERGY serves as a business partner capable of providing construction services and procuring industrial materials and components effectively, efficiently, and on time.",
      "We believe that a project's success is built on strong synergy between work quality, precise execution, and sustainable cooperation with every customer and business partner.",
    ],
    valuesLabel: "Corporate Values",
    values: [
      {
        name: "Integrity",
        description:
          "Carrying out every task with honesty, responsibility, and high business ethics.",
      },
      {
        name: "Professionalism",
        description:
          "Prioritizing competence, service quality, and professional work standards.",
      },
      {
        name: "Commitment",
        description:
          "Committed to delivering the best results according to customer needs.",
      },
      {
        name: "Collaboration",
        description:
          "Building mutually beneficial cooperation with all business partners.",
      },
      {
        name: "Continuous Improvement",
        description:
          "Continuously improving service quality through evaluation, innovation, and sustainable development.",
      },
    ],
    visionLabel: "Vision",
    vision:
      "To become a trusted, professional national construction and trading company that delivers the best solutions through service quality, innovation, and sustainable synergy.",
    missionLabel: "Mission",
    missions: [
      "Deliver construction services that prioritize quality, safety, and timeliness.",
      "Provide quality products and materials tailored to customer needs.",
      "Build professional, transparent, and mutually beneficial business relationships.",
      "Develop competent and high-integrity human resources.",
      "Deliver added value through responsive, customer-satisfaction-oriented service.",
    ],
  },
  divisions: {
    eyebrow: "Business Divisions",
    heading: "Three divisions, one synergy",
    lead: "We combine construction expertise and procurement networks to meet your project needs end to end.",
    items: [
      {
        number: "01",
        icon: "building",
        name: "Conventional Office Building Construction",
        intro:
          "We deliver office building construction with a professional, systematic approach — attending to quality standards, cost efficiency, occupational safety, and on-time completion.",
        items: [
          "Office building construction",
          "Building renovation & rehabilitation",
          "Structural works",
          "Architectural works",
          "Interior works",
          "Mechanical works",
          "Electrical works",
          "Plumbing works",
          "Building finishing",
          "Building maintenance",
        ],
      },
      {
        number: "02",
        icon: "layers",
        name: "Wholesale of Metal Construction Materials",
        intro:
          "We supply metal construction materials for development and industrial projects — prioritizing product quality, specification accuracy, and distribution efficiency.",
        items: [
          "Structural steel",
          "Construction iron",
          "Hollow sections",
          "Steel pipes",
          "Steel plates",
          "Wire mesh",
          "Stainless steel",
          "Aluminium",
          "Metal construction accessories",
          "Other supporting construction materials",
        ],
      },
      {
        number: "03",
        icon: "cpu",
        name: "Wholesale of Electronic Spare Parts",
        intro:
          "We procure electronic spare parts for industrial, commercial, and project needs — through a fast and reliable procurement process.",
        items: [
          "Electronic components",
          "Electronic spare parts",
          "Electrical equipment",
          "Electrical panels & accessories",
          "Cables",
          "Connectors",
          "Sensors",
          "Relays",
          "Switches",
          "Other supporting electronic system components",
        ],
      },
    ],
  },
  advantages: {
    eyebrow: "Why Choose Us",
    heading: "Our strengths & commitments",
    items: [
      "Customer satisfaction oriented",
      "Professional and responsive service",
      "Commitment to work quality",
      "Products supplied to specification",
      "Effective and efficient completion of works",
      "On-time delivery as a priority",
      "Upholding integrity and transparency",
      "Flexible to customers' project needs",
    ],
    compliance: {
      eyebrow: "Safety, Quality & Compliance",
      heading: "Safety, quality, and compliance in every work",
      items: [
        "Prioritizing occupational safety in every operational activity.",
        "Maintaining work and product quality according to agreed specifications.",
        "Applying professional corporate governance.",
        "Complying with all applicable laws and regulations.",
      ],
      commitmentHeading: "Our Commitment",
      commitment: [
        "We understand that every project has its own challenges and requirements. PT NATTU GLOBAL SYNERGY is therefore committed to being a partner that delivers the best solutions through thorough planning, professional execution, and consistent service.",
        "Customer trust is the company's greatest asset. With a spirit of collaboration and continuous improvement, we are ready to support construction and procurement needs for the private, state-owned, and government sectors.",
      ],
    },
  },
  sectors: {
    eyebrow: "Who We Serve",
    heading: "From government agencies to industry",
    items: [
      "Government Agencies",
      "Ministries",
      "State-Owned Enterprises (BUMN)",
      "Regional-Owned Enterprises (BUMD)",
      "Private Companies",
      "Contractors",
      "Developers",
      "Manufacturing Industry",
      "Trading Companies",
      "Office Facilities",
      "Educational Institutions",
      "Hospitals",
      "Commercial Facilities",
    ],
  },
  contact: {
    eyebrow: "Get in Touch",
    heading: "Let's discuss your project needs",
    lead: "Send us a message using the form below, or reach us directly by email.",
    form: {
      nameLabel: "Full Name",
      namePlaceholder: "Your name",
      emailLabel: "Email",
      companyLabel: "Company / Institution (optional)",
      companyPlaceholder: "Your company or institution",
      categoryLabel: "Inquiry Category",
      categoryOther: "Others",
      messageLabel: "Message",
      messagePlaceholder: "Tell us about your project or procurement needs…",
      submitLabel: "Send Message",
      sendingLabel: "Sending…",
      successMessage:
        "Thank you! Your message has been sent. We will get back to you shortly.",
      errorMessage:
        "Sorry, the message failed to send. Please try again or contact us by email.",
      unconfiguredMessage:
        "The form is not configured yet (Web3Forms access key missing).",
      emailSubject: "New message from the NSG website",
    },
    infoTitle: "Contact Information",
    addressLabel: "Address",
    emailLabel: "Email",
  },
  footer: {
    navTitle: "Navigation",
    contactTitle: "Contact",
    copyright: "© 2026 PT Nattu Global Synergy. All rights reserved.",
  },
};
```

- [ ] **Step 3: Aktifkan EN di index**

Di `website/content/index.ts` ganti seluruh isi:

```ts
import { contentEn } from "./en";
import { contentId } from "./id";
import type { Content, Locale } from "./types";

const contents: Record<Locale, Content> = {
  id: contentId,
  en: contentEn,
};

export function getContent(locale: Locale): Content {
  return contents[locale];
}
```

- [ ] **Step 4: Jalankan tes**

```bash
npm test
```

Expected: PASS — 7 tes hijau (5 ID + 2 EN).

- [ ] **Step 5: Commit**

```bash
cd .. && git add website/ && git commit -m "feat: konten English lengkap + paritas struktur dua bahasa teruji"
```

---

### Task 5: UI primitives

**Files:**
- Create: `website/components/ui/Button.tsx`
- Create: `website/components/ui/GlassCard.tsx`
- Create: `website/components/ui/SectionHeading.tsx`
- Create: `website/components/ui/Reveal.tsx`
- Create: `website/components/LogoMark.tsx`

**Interfaces:**
- Produces:
  - `<Button href variant="primary"|"outline-light"|"brand" className>{children}</Button>`
  - `<GlassCard className>{children}</GlassCard>`
  - `<SectionHeading eyebrow title align="left"|"center" dark>{...}</SectionHeading>`
  - `<Reveal delay className>{children}</Reveal>` (client component)
  - `<LogoMark className />`

- [ ] **Step 1: Install dependensi**

```bash
cd website && npm i motion lucide-react
```

- [ ] **Step 2: Tulis komponen**

Buat `website/components/ui/Button.tsx`:

```tsx
import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "outline-light" | "brand";

const variants: Record<Variant, string> = {
  primary: "bg-white text-brand-950 hover:bg-brand-100",
  "outline-light": "border border-white/40 text-white hover:bg-white/10",
  brand: "bg-gradient-to-r from-brand-700 to-brand-500 text-white hover:opacity-90",
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const cls = `inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 ${variants[variant]} ${className}`;
  if (href.startsWith("#") || href.startsWith("/")) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={cls}>
      {children}
    </a>
  );
}
```

Buat `website/components/ui/GlassCard.tsx`:

```tsx
import type { ReactNode } from "react";

export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}
```

Buat `website/components/ui/SectionHeading.tsx`:

```tsx
export function SectionHeading({
  eyebrow,
  title,
  align = "left",
  dark = false,
}: {
  eyebrow: string;
  title: string;
  align?: "left" | "center";
  dark?: boolean;
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="inline-block rounded-full bg-brand-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
        {eyebrow}
      </span>
      <h2
        className={`mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
    </div>
  );
}
```

Buat `website/components/ui/Reveal.tsx`:

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

Buat `website/components/LogoMark.tsx`:

```tsx
export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="nsg-mark" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0b3a36" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#nsg-mark)" />
      <text
        x="20"
        y="25.5"
        textAnchor="middle"
        fontFamily="Sora, sans-serif"
        fontWeight="800"
        fontSize="13"
        letterSpacing="0.5"
        fill="#ffffff"
      >
        N<tspan fill="#5eead4">S</tspan>G
      </text>
    </svg>
  );
}
```

- [ ] **Step 3: Verifikasi TypeScript**

```bash
npx tsc --noEmit
```

Expected: tidak ada error.

- [ ] **Step 4: Commit**

```bash
cd .. && git add website/ && git commit -m "feat: UI primitives (Button, GlassCard, SectionHeading, Reveal, LogoMark)"
```

---

### Task 6: Header, Footer, HomePage + routing dua bahasa

**Files:**
- Create: `website/app/(id)/layout.tsx`
- Create: `website/app/(id)/page.tsx`
- Create: `website/app/(en)/layout.tsx`
- Create: `website/app/(en)/en/page.tsx`
- Create: `website/components/Header.tsx`
- Create: `website/components/Footer.tsx`
- Create: `website/components/HomePage.tsx`

**Interfaces:**
- Consumes: `getContent(locale)`, `site`, `HtmlShell`, `LogoMark`, `Content`, `Locale`.
- Produces: dua route `/` dan `/en` yang render `<HomePage locale>`; komponen `<Header locale t>` dan `<Footer locale t>` (signature dipakai HomePage).

- [ ] **Step 1: Header**

Buat `website/components/Header.tsx`:

```tsx
"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/LogoMark";
import { site } from "@/content/site";
import type { Content, Locale } from "@/content/types";

export function Header({ locale, t }: { locale: Locale; t: Content }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: `#${site.anchors.about}`, label: t.nav.about },
    { href: `#${site.anchors.divisions}`, label: t.nav.divisions },
    { href: `#${site.anchors.advantages}`, label: t.nav.advantages },
  ];
  const langHref = locale === "id" ? "/en" : "/";

  function switchLang(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    window.location.href = langHref + window.location.hash;
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-white/10 bg-brand-950/85 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href={`#${site.anchors.home}`} className="flex items-center gap-2.5 text-white">
          <LogoMark className="h-9 w-9" />
          <span className="font-display text-base font-bold tracking-wide">
            {site.brand}
          </span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-white/85 transition-colors hover:text-brand-300"
            >
              {l.label}
            </a>
          ))}
          <a
            href={`#${site.anchors.contact}`}
            className="rounded-full bg-brand-300 px-5 py-2 text-sm font-bold text-brand-950 transition-colors hover:bg-white"
          >
            {t.nav.contactCta}
          </a>
          <a
            href={langHref}
            onClick={switchLang}
            className="rounded-full border border-white/30 px-3 py-1.5 text-xs font-bold uppercase text-white transition-colors hover:border-brand-300 hover:text-brand-300"
          >
            {locale === "id" ? "EN" : "ID"}
          </a>
        </nav>
        <button
          className="text-white md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-white/10 bg-brand-950/95 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm text-white/85"
              >
                {l.label}
              </a>
            ))}
            <a
              href={`#${site.anchors.contact}`}
              onClick={() => setOpen(false)}
              className="mt-1 rounded-full bg-brand-300 px-5 py-2.5 text-center text-sm font-bold text-brand-950"
            >
              {t.nav.contactCta}
            </a>
            <a
              href={langHref}
              onClick={switchLang}
              className="text-center text-xs font-bold uppercase text-brand-300"
            >
              {locale === "id" ? "English" : "Bahasa Indonesia"}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
```

- [ ] **Step 2: Footer (dengan alamat lengkap — tanpa map)**

Buat `website/components/Footer.tsx`:

```tsx
import { Mail, MapPin } from "lucide-react";
import { LogoMark } from "@/components/LogoMark";
import { site } from "@/content/site";
import type { Content, Locale } from "@/content/types";

export function Footer({ locale, t }: { locale: Locale; t: Content }) {
  const links = [
    { href: `#${site.anchors.about}`, label: t.nav.about },
    { href: `#${site.anchors.divisions}`, label: t.nav.divisions },
    { href: `#${site.anchors.advantages}`, label: t.nav.advantages },
    { href: `#${site.anchors.contact}`, label: t.nav.contact },
  ];
  return (
    <footer className="bg-gradient-to-br from-brand-950 to-brand-900 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.4fr_1fr_1.3fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-10 w-10" />
            <div>
              <div className="font-display text-base font-bold">{site.name}</div>
              <div className="text-xs text-brand-300">{site.tagline}</div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-brand-300">
            {t.footer.navTitle}
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-white/80">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition-colors hover:text-brand-300">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-brand-300">
            {t.footer.contactTitle}
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" />
              <span>{site.addressFull}</span>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" />
              <a href={`mailto:${site.email}`} className="transition-colors hover:text-brand-300">
                {site.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/60">
        {t.footer.copyright}
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: HomePage (shell section — section diisi Task 7–11)**

Buat `website/components/HomePage.tsx`:

```tsx
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getContent } from "@/content";
import type { Locale } from "@/content/types";

export function HomePage({ locale }: { locale: Locale }) {
  const t = getContent(locale);
  return (
    <>
      <Header locale={locale} t={t} />
      <main>
        {/* Task 7–11 mengisi section di sini */}
      </main>
      <Footer locale={locale} t={t} />
    </>
  );
}
```

- [ ] **Step 4: Route groups + layouts**

Hapus dulu layout & page bawaan (diganti route groups — app/ tidak boleh punya dua page untuk `/`):

```bash
rm website/app/layout.tsx website/app/page.tsx
```

Buat `website/app/(id)/layout.tsx`:

```tsx
import { HtmlShell } from "@/components/HtmlShell";

export default function IdLayout({ children }: { children: React.ReactNode }) {
  return <HtmlShell lang="id">{children}</HtmlShell>;
}
```

Buat `website/app/(id)/page.tsx`:

```tsx
import { HomePage } from "@/components/HomePage";

export default function Page() {
  return <HomePage locale="id" />;
}
```

Buat `website/app/(en)/layout.tsx`:

```tsx
import { HtmlShell } from "@/components/HtmlShell";

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <HtmlShell lang="en">{children}</HtmlShell>;
}
```

Buat `website/app/(en)/en/page.tsx`:

```tsx
import { HomePage } from "@/components/HomePage";

export default function Page() {
  return <HomePage locale="en" />;
}
```

- [ ] **Step 5: Verifikasi build kembali jalan**

```bash
npm run build && ls out
```

Expected: build sukses; `out/index.html` dan `out/en/index.html` ada.

- [ ] **Step 6: Cek visual cepat**

```bash
npm run dev
```

Buka `http://localhost:3000/` dan `http://localhost:3000/en` — header glass saat scroll + footer tampil di kedua bahasa, toggle bahasa bekerja. Hentikan dev server.

- [ ] **Step 7: Commit**

```bash
cd .. && git add website/ && git commit -m "feat: routing dua bahasa via route groups + Header glass + Footer"
```

---

### Task 7: Hero section

**Files:**
- Create: `website/components/sections/Hero.tsx`
- Create: `website/public/images/hero.jpg` (download)
- Modify: `website/components/HomePage.tsx`

**Interfaces:**
- Consumes: `<Button>`, `<GlassCard>`, `<Reveal>`, `site.anchors`, `t.hero`.

- [ ] **Step 1: Unduh gambar hero (stock konstruksi)**

```bash
mkdir -p website/public/images
curl -L "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1400&q=72" -o website/public/images/hero.jpg
file website/public/images/hero.jpg
```

Expected: `JPEG image data` (bukan HTML error page). Gambar mudah diganti dengan foto client nanti — nama file tetap.

- [ ] **Step 2: Tulis Hero**

Buat `website/components/sections/Hero.tsx`:

```tsx
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/content/site";
import type { Content } from "@/content/types";

export function Hero({ t }: { t: Content }) {
  return (
    <section id={site.anchors.home} className="relative overflow-hidden bg-brand-950 text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-[-10%] h-[480px] w-[560px] rounded-full bg-brand-500/25 blur-3xl" />
        <div className="absolute bottom-[-25%] left-[-10%] h-[420px] w-[480px] rounded-full bg-brand-700/40 blur-3xl" />
      </div>
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 pb-24 pt-36 sm:pt-40 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-300/30 bg-brand-300/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-300">
            {t.hero.eyebrow}
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
            {t.hero.titlePre}
            <span className="bg-gradient-to-r from-brand-300 to-brand-100 bg-clip-text text-transparent">
              {t.hero.titleHighlight}
            </span>
            {t.hero.titlePost}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            {t.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href={`#${site.anchors.divisions}`}>{t.hero.ctaPrimary}</Button>
            <Button href={`#${site.anchors.contact}`} variant="outline-light">
              {t.hero.ctaSecondary}
            </Button>
          </div>
          <div className="mt-12 grid max-w-md grid-cols-3 gap-4">
            {t.hero.stats.map((s) => (
              <GlassCard key={s.label} className="p-4">
                <div className="font-display text-2xl font-extrabold">{s.value}</div>
                <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-brand-300/90">
                  {s.label}
                </div>
              </GlassCard>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="overflow-hidden rounded-3xl border border-white/15">
            <Image
              src="/images/hero.jpg"
              alt={t.hero.imageAlt}
              width={1400}
              height={900}
              priority
              className="h-auto w-full object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Pasang di HomePage**

Di `website/components/HomePage.tsx`, ganti `{/* Task 7–11 mengisi section di sini */}` dengan:

```tsx
        <Hero t={t} />
```

dan tambahkan import:

```tsx
import { Hero } from "@/components/sections/Hero";
```

- [ ] **Step 4: Verifikasi**

```bash
npm run build
```

Expected: build sukses. Dev server: hero gradient + kartu glass + gambar tampil, heading h1 tepat satu.

- [ ] **Step 5: Commit**

```bash
cd .. && git add website/ && git commit -m "feat: hero section arah Living Synergy"
```

---

### Task 8: About section

**Files:**
- Create: `website/components/sections/About.tsx`
- Modify: `website/components/HomePage.tsx`

**Interfaces:**
- Consumes: `<SectionHeading>`, `<Reveal>`, `site.anchors`, `t.about`.

- [ ] **Step 1: Tulis About**

Buat `website/components/sections/About.tsx`:

```tsx
import { Check } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/content/site";
import type { Content } from "@/content/types";

export function About({ t }: { t: Content }) {
  return (
    <section id={site.anchors.about} className="bg-paper py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading eyebrow={t.about.eyebrow} title={t.about.heading} />
            {t.about.paragraphs.map((p) => (
              <p key={p.slice(0, 32)} className="mt-5 leading-relaxed text-ink/75">
                {p}
              </p>
            ))}
            <div className="mt-8">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
                {t.about.valuesLabel}
              </div>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {t.about.values.map((v) => (
                  <span
                    key={v.name}
                    title={v.description}
                    className="cursor-default rounded-full border border-brand-100 bg-white px-4 py-2 text-xs font-semibold text-brand-700 transition-colors hover:border-brand-300"
                  >
                    {v.name}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="space-y-5">
            <div className="rounded-2xl bg-gradient-to-br from-brand-900 to-brand-700 p-8 text-white">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-300">
                {t.about.visionLabel}
              </span>
              <p className="mt-3 leading-relaxed text-white/90">“{t.about.vision}”</p>
            </div>
            <div className="rounded-2xl border border-brand-100 bg-white p-8">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
                {t.about.missionLabel}
              </span>
              <ul className="mt-4 space-y-3">
                {t.about.missions.map((m) => (
                  <li key={m.slice(0, 32)} className="flex gap-3 text-sm leading-relaxed text-ink/80">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Pasang di HomePage**

Di `HomePage.tsx`, setelah `<Hero t={t} />`:

```tsx
        <About t={t} />
```

Import: `import { About } from "@/components/sections/About";`

- [ ] **Step 3: Verifikasi + commit**

```bash
npm run build && cd .. && git add website/ && git commit -m "feat: section tentang — profil, nilai, visi, misi"
```

Expected: build sukses, lalu commit dibuat.

---

### Task 9: Divisions section

**Files:**
- Create: `website/components/sections/Divisions.tsx`
- Modify: `website/components/HomePage.tsx`

**Interfaces:**
- Consumes: `<SectionHeading>`, `<Reveal>`, `site.anchors`, `t.divisions` (kunci ikon: `building` | `layers` | `cpu`).

- [ ] **Step 1: Tulis Divisions**

Buat `website/components/sections/Divisions.tsx`:

```tsx
import { Building2, Check, Cpu, Layers } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/content/site";
import type { Content } from "@/content/types";

const icons = {
  building: Building2,
  layers: Layers,
  cpu: Cpu,
} as const;

export function Divisions({ t }: { t: Content }) {
  return (
    <section id={site.anchors.divisions} className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow={t.divisions.eyebrow} title={t.divisions.heading} />
        <p className="mt-4 max-w-2xl leading-relaxed text-ink/70">{t.divisions.lead}</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {t.divisions.items.map((d, i) => {
            const Icon = icons[d.icon];
            return (
              <Reveal
                key={d.number}
                delay={i * 0.08}
                className="flex flex-col rounded-2xl border border-brand-100 bg-paper p-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-700 to-brand-500 text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-display text-3xl font-extrabold text-brand-100">
                    {d.number}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-bold leading-snug text-ink">
                  {d.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">{d.intro}</p>
                <ul className="mt-5 grid grid-cols-1 gap-2 border-t border-brand-100 pt-5 sm:grid-cols-2">
                  {d.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-ink/75">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Pasang di HomePage**

Setelah `<About t={t} />`:

```tsx
        <Divisions t={t} />
```

Import: `import { Divisions } from "@/components/sections/Divisions";`

- [ ] **Step 3: Verifikasi + commit**

```bash
npm run build && cd .. && git add website/ && git commit -m "feat: section bidang usaha — 3 kartu divisi"
```

Expected: build sukses, commit dibuat.

---

### Task 10: Advantages + Sectors

**Files:**
- Create: `website/components/sections/Advantages.tsx`
- Create: `website/components/sections/Sectors.tsx`
- Modify: `website/components/HomePage.tsx`

**Interfaces:**
- Consumes: `<SectionHeading>`, `<Reveal>`, `site.anchors`, `t.advantages`, `t.sectors`.

- [ ] **Step 1: Tulis Advantages**

Buat `website/components/sections/Advantages.tsx`:

```tsx
import { Check, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/content/site";
import type { Content } from "@/content/types";

export function Advantages({ t }: { t: Content }) {
  return (
    <section id={site.anchors.advantages} className="bg-paper-alt py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow={t.advantages.eyebrow} title={t.advantages.heading} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.advantages.items.map((item, i) => (
            <Reveal key={item} delay={(i % 4) * 0.06}>
              <div className="flex h-full items-start gap-3 rounded-2xl border border-brand-100 bg-white p-5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <Check className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium leading-snug text-ink/85">{item}</span>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-14 rounded-3xl bg-gradient-to-br from-brand-950 to-brand-800 p-8 text-white sm:p-12">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-300/15 text-brand-300">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-300">
                  {t.advantages.compliance.eyebrow}
                </span>
                <h3 className="mt-1 font-display text-xl font-bold sm:text-2xl">
                  {t.advantages.compliance.heading}
                </h3>
              </div>
            </div>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {t.advantages.compliance.items.map((item) => (
                <li key={item.slice(0, 32)} className="flex gap-3 text-sm leading-relaxed text-white/85">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 border-t border-white/15 pt-6">
              <h4 className="font-display text-base font-bold text-brand-300">
                {t.advantages.compliance.commitmentHeading}
              </h4>
              {t.advantages.compliance.commitment.map((p) => (
                <p key={p.slice(0, 32)} className="mt-3 text-sm leading-relaxed text-white/80">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Tulis Sectors**

Buat `website/components/sections/Sectors.tsx`:

```tsx
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Content } from "@/content/types";

export function Sectors({ t }: { t: Content }) {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow={t.sectors.eyebrow} title={t.sectors.heading} align="center" />
        <Reveal delay={0.1}>
          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2.5">
            {t.sectors.items.map((s) => (
              <span
                key={s}
                className="rounded-full border border-brand-100 bg-paper-alt px-5 py-2.5 text-sm font-medium text-ink/80 transition-colors hover:border-brand-300 hover:text-brand-700"
              >
                {s}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Pasang di HomePage**

Setelah `<Divisions t={t} />`:

```tsx
        <Advantages t={t} />
        <Sectors t={t} />
```

Import: `import { Advantages } from "@/components/sections/Advantages";` dan `import { Sectors } from "@/components/sections/Sectors";`

- [ ] **Step 4: Verifikasi + commit**

```bash
npm run build && cd .. && git add website/ && git commit -m "feat: section keunggulan + K3 & sektor pelanggan"
```

Expected: build sukses, commit dibuat.

---

### Task 11: Contact section + form Web3Forms

**Files:**
- Create: `website/components/sections/ContactForm.tsx`
- Create: `website/components/sections/Contact.tsx`
- Modify: `website/components/HomePage.tsx`

**Interfaces:**
- Consumes: `site`, `t.contact`, `t.divisions.items[].name` (opsi dropdown kategori).
- Produces: `<Contact t={t} />` terpasang; form POST ke Web3Forms dengan state `idle | sending | success | error | unconfigured`.

- [ ] **Step 1: Tulis ContactForm (client)**

Buat `website/components/sections/ContactForm.tsx`:

```tsx
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
```

CATATAN warna semantik: `red-50/red-700` dan `amber-50/amber-700` adalah utilitas Tailwind bawaan untuk status error/warning — satu-satunya pengecualian token brand yang diizinkan (status semantik, bukan identitas brand).

- [ ] **Step 2: Tulis Contact (server)**

Buat `website/components/sections/Contact.tsx`:

```tsx
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
```

- [ ] **Step 3: Pasang di HomePage**

Setelah `<Sectors t={t} />`:

```tsx
        <Contact t={t} />
```

Import: `import { Contact } from "@/components/sections/Contact";`

- [ ] **Step 4: Verifikasi perilaku form tanpa key**

```bash
npm run build && npm run dev
```

Buka `http://localhost:3000/#kontak`, isi form, submit → expected: pesan kuning "formulir belum dikonfigurasi". Ini membuktikan jalur unconfigured bekerja. Hentikan dev server.

- [ ] **Step 5: Commit**

```bash
cd .. && git add website/ && git commit -m "feat: form kontak Web3Forms + section kontak (tanpa map)"
```

---

### Task 12: SEO — metadata, sitemap, robots, icon, OG

**Files:**
- Modify: `website/app/(id)/page.tsx`
- Modify: `website/app/(en)/en/page.tsx`
- Create: `website/app/sitemap.ts`
- Create: `website/app/robots.ts`
- Create: `website/app/icon.svg`
- Create: `website/public/og.jpg`
- Create: `website/.env.example`
- Modify: `website/.gitignore` (buat jika tidak ada)

**Interfaces:**
- Consumes: `getContent`, `site.url`, `t.meta`.

- [ ] **Step 1: Metadata per halaman**

Ganti seluruh isi `website/app/(id)/page.tsx`:

```tsx
import type { Metadata } from "next";
import { HomePage } from "@/components/HomePage";
import { getContent } from "@/content";

const t = getContent("id");

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  alternates: {
    canonical: "/",
    languages: { id: "/", en: "/en", "x-default": "/" },
  },
  openGraph: {
    title: t.meta.title,
    description: t.meta.description,
    images: ["/og.jpg"],
    type: "website",
  },
};

export default function Page() {
  return <HomePage locale="id" />;
}
```

Ganti seluruh isi `website/app/(en)/en/page.tsx`:

```tsx
import type { Metadata } from "next";
import { HomePage } from "@/components/HomePage";
import { getContent } from "@/content";

const t = getContent("en");

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  alternates: {
    canonical: "/en",
    languages: { id: "/", en: "/en", "x-default": "/" },
  },
  openGraph: {
    title: t.meta.title,
    description: t.meta.description,
    images: ["/og.jpg"],
    type: "website",
  },
};

export default function Page() {
  return <HomePage locale="en" />;
}
```

- [ ] **Step 2: Sitemap & robots**

Buat `website/app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${site.url}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/en`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];
}
```

Buat `website/app/robots.ts`:

```ts
import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: Favicon**

Buat `website/app/icon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0b3a36"/>
      <stop offset="1" stop-color="#0f766e"/>
    </linearGradient>
  </defs>
  <rect width="40" height="40" rx="10" fill="url(#g)"/>
  <text x="20" y="25.5" text-anchor="middle" font-family="Sora, Arial, sans-serif" font-weight="800" font-size="13" letter-spacing="0.5" fill="#ffffff">N<tspan fill="#5eead4">S</tspan>G</text>
</svg>
```

- [ ] **Step 4: OG image (sementara dari hero.jpg — ganti saat ada desain final)**

```bash
cp website/public/images/hero.jpg website/public/og.jpg
sips --resampleWidth 1200 website/public/og.jpg && sips --cropToHeightWidth 630 1200 website/public/og.jpg
```

Expected: `public/og.jpg` berukuran 1200×630.

- [ ] **Step 5: Env example + gitignore lokal**

Buat `website/.env.example`:

```
# Access key Web3Forms (https://web3forms.com) — daftar gratis dengan email perusahaan.
# Set di .env.local untuk dev, dan sebagai env var saat build produksi.
NEXT_PUBLIC_WEB3FORMS_KEY=
```

Buat/modify `website/.gitignore` (create-next-app sudah membuatnya — pastikan berisi baris ini, tambah jika belum):

```
.env*.local
```

- [ ] **Step 6: Verifikasi build + file SEO**

```bash
npm run build && ls out/sitemap.xml out/robots.txt out/en/index.html
```

Expected: build sukses; `out/sitemap.xml`, `out/robots.txt`, `out/en/index.html` semuanya ada. Cek `out/index.html` mengandung `hreflang`.

```bash
grep -c "hreflang" out/index.html
```

Expected: angka ≥ 3.

- [ ] **Step 7: Commit**

```bash
cd .. && git add website/ && git commit -m "feat: SEO — metadata bilingual, hreflang, sitemap, robots, favicon, OG"
```

---

### Task 13: Verifikasi akhir + README

**Files:**
- Create: `website/README.md`

**Interfaces:**
- Consumes: seluruh situs.

- [ ] **Step 1: Tulis README**

Buat `website/README.md`:

```markdown
# Website Company Profile — PT Nattu Global Synergy

Website produksi (one-page, bilingual ID/EN) dibangun dengan Next.js static export.
Spec: `../docs/superpowers/specs/2026-08-22-nsg-website-design.md`

## Perintah

    npm run dev       # dev server di localhost:3000
    npm test          # tes integritas konten (vitest)
    npm run build     # build static export → folder out/

## Form kontak (Web3Forms)

1. Daftar gratis di https://web3forms.com dengan email perusahaan.
2. Salin `.env.example` menjadi `.env.local`, isi `NEXT_PUBLIC_WEB3FORMS_KEY`.
3. Setelah domain live, aktifkan *domain restriction* di dashboard Web3Forms.

## Deploy ke Biznet Gio NEO

1. `npm run build`
2. Upload seluruh isi `out/` ke `public_html` (File Manager / FTP).
3. Verifikasi: `/`, `/en`, `sitemap.xml`, `robots.txt`, submit form.

## Update konten minor (maintenance)

- Semua teks ada di `content/id.ts` & `content/en.ts` (harus lengkap keduanya —
  field hilang = error TypeScript).
- Kontak/alamat/domain: `content/site.ts`.
- Foto: ganti file di `public/images/` dengan nama yang sama.
- Angka struktur konten (3 divisi × 10 item, 5 misi, 5 nilai, 8 keunggulan,
  4 K3, 13 sektor) dijaga oleh tes `npm test` — ubah tes hanya jika dokumen
  sumber klien berubah.
```

- [ ] **Step 2: Build + tes final**

```bash
cd website && npm test && npm run build
```

Expected: semua tes hijau, build sukses.

- [ ] **Step 3: Smoke test situs statis**

```bash
npx serve out
```

Buka `http://localhost:3000/` (atau port yang tercetak) dan jalankan checklist:

- [ ] `/` berbahasa Indonesia; `/en` berbahasa Inggris; `<html lang>` benar (cek view-source)
- [ ] Kelima anchor nav berfungsi; header berubah glass saat scroll
- [ ] Toggle EN/ID mempertahankan posisi section
- [ ] Semua section tampil: Hero, Tentang, Divisi (3 kartu), Keunggulan (8 + strip K3), Sectors (13 pil), Kontak, Footer (alamat lengkap)
- [ ] Form: submit tanpa key → pesan "belum dikonfigurasi"
- [ ] Responsive: panel device mobile — menu hamburger bekerja
- [ ] Console browser bersih (tanpa error)

Hentikan server (`Ctrl+C`).

- [ ] **Step 4: Commit final**

```bash
cd .. && git add website/ && git commit -m "docs: README website NSG — perintah, form, deploy, maintenance"
```

---

## Verifikasi Lintas-Task (dijalankan executor setelah Task 13)

- `npm test` hijau (7 tes).
- `npm run build` sukses → `out/` berisi `index.html`, `en/index.html`, `sitemap.xml`, `robots.txt`, `images/hero.jpg`, `og.jpg`.
- Checklist smoke di Task 13 Step 3 selesai.
