# Spec Desain — Website Company Profile PT Nattu Global Synergy

**Tanggal:** 22 Agustus 2026
**Status:** Disetujui via brainstorming (semua bagian telah dikonfirmasi)
**Sumber konten:** `Data Dokumen/NSG COMPRO.docx` (transkrip), `Dokumen_Analisa_Project.md`

---

## 1. Ringkasan & Tujuan

Website company profile produksi untuk PT Nattu Global Synergy (NSG) — perusahaan konstruksi & perdagangan baru di Kemayoran, Jakarta Pusat. Ini adalah website sungguhan yang di-deploy ke domain klien, terpisah dari `web_sample/` (demo penawaran yang hanya untuk presentasi ke klien).

**Tujuan:** membangun kepercayaan calon klien (instansi pemerintah, BUMN, swasta) melalui situs modern, profesional, cepat, dan bilingual.

**Keputusan utama (hasil brainstorming):**

| Aspek | Keputusan |
|---|---|
| Framework | Next.js 15 App Router + React 19 + TypeScript, **static export** (`output: 'export'`) |
| Hosting produksi | Biznet Gio NEO (upload isi `out/` ke `public_html`) — sesuai quotation |
| Bahasa | Route per bahasa: **ID default di `/`**, EN di `/en` |
| Struktur | One-page dengan section anchor |
| Form kontak | Web3Forms (kirim ke email perusahaan) |
| Arah desain | **C — "Living Synergy"**: gradient teal gelap, glassmorphism, pill button, segar & kontemporer (dipilih dari 3 opsi mockup visual) |
| Styling | Tailwind CSS v4 + design tokens CSS variables; konten bilingual di modul TS terpusat |
| Animasi/ikon | `motion` (scroll-reveal halus) + `lucide-react` |

---

## 2. Arsitektur

### 2.1 Lokasi & Git

- Kode di folder baru `website/` pada root proyek.
- Git di-init **di root proyek**. `.gitignore` root mengecualikan:
  - `Administration/` — rahasia (KTP, NIB, invoice), **tidak pernah** di-track
  - `Data Dokumen/`, `Web Design Reference/` — materi referensi klien, tidak di-track
  - `.superpowers/`, `.DS_Store`, `website/node_modules/`, `website/.next/`, `website/out/`, `website/.env*.local`
- Yang di-track: `website/`, `docs/`, `Dokumen_Analisa_Project.md`, `Dokumen_Quotation_Penawaran.md`, `CLAUDE.md`.

### 2.2 Struktur folder `website/`

```
website/
  app/
    layout.tsx            # root layout: font, metadata dasar
    page.tsx              # Indonesia (/) → <HomePage locale="id">
    en/
      page.tsx            # English (/en) → <HomePage locale="en">
    sitemap.ts            # / dan /en (kompatibel export)
    robots.ts
    globals.css           # Tailwind v4 + @theme tokens
  components/
    Header.tsx
    Footer.tsx
    sections/
      Hero.tsx
      About.tsx
      Divisions.tsx
      Advantages.tsx      # 8 keunggulan + strip K3/kepatuhan + komitmen
      Sectors.tsx         # 14 sektor target pelanggan
      Contact.tsx         # form Web3Forms + info kontak (TANPA map)
    ui/
      Button.tsx
      GlassCard.tsx
      SectionHeading.tsx  # eyebrow pill + judul Sora
      Reveal.tsx          # wrapper animasi scroll-reveal (motion)
  content/
    types.ts              # interface Content — kontrak seluruh teks situs
    id.ts                 # konten Indonesia (dari NSG COMPRO.docx)
    en.ts                 # konten English (terjemahan, nada formal)
    site.ts               # data non-bahasa: alamat, kontak, nav, statistik
  lib/
    locales.ts            # tipe Locale, helper prefix & switch bahasa
  public/
    images/               # semua gambar terpusat, mudah ditukar saat maintenance
    og.jpg                # OG image statis
    favicon.svg / icon assets NSG (render ulang bersih dari foto logo)
  next.config.ts          # output: 'export', images.unoptimized
```

### 2.3 Routing & i18n

- `app/page.tsx` (ID, `/`) dan `app/en/page.tsx` (EN, `/en`) adalah *thin wrapper* yang merender komponen `<HomePage locale="...">`. Pola ini dipilih karena redirect root tidak didukung static export.
- Toggle bahasa di header = link `/` ↔ `/en` (anchor `#section` dipertahankan saat berpindah).
- Konten diambil dari `content/{locale}.ts` berdasarkan locale; `id.ts` & `en.ts` **wajib** memenuhi `interface Content` → field hilang = error build. Paritas bahasa dijamin compiler.
- `<html lang>` di-set per halaman (`id` / `en`).

### 2.4 Data flow

- Sepenuhnya statis: konten di-inject saat build, tidak ada fetch saat runtime selain submit form.
- Form kontak: satu-satunya interaksi jaringan → POST client-side ke Web3Forms.

---

## 3. Sistem Desain — arah C "Living Synergy"

### 3.1 Warna (Tailwind v4 `@theme`)

| Token | Nilai | Pemakaian |
|---|---|---|
| `--color-brand-950` | `#062924` | Hero/footer background base |
| `--color-brand-900` | `#0b3a36` | Gradient gelap, strip K3 |
| `--color-brand-700` | `#0f766e` | Aksen kuat pada latar terang, tombol |
| `--color-brand-500` | `#14b8a6` | Gradient tombol/ikon |
| `--color-brand-300` | `#5eead4` | Glow, teks aksen di latar gelap |
| `--color-brand-100` | `#ccfbf1` | Eyebrow pill background |
| `--color-paper` | `#f7faf9` / `#f2f8f6` | Background section terang |
| `--color-ink` | `#0f1f1d` | Teks utama di latar terang |

Tidak ada warna di luar skala ini; semua nilai hex hanya hidup di `@theme`.

### 3.2 Tipografi & bentuk

- **Sora** (display: judul section, hero) + **Inter** (body) via `next/font/google` (self-hosted saat build, kompatibel export).
- Radius besar (14–24px), tombol pill, glass = `bg-white/10 + backdrop-blur + border-white/15` (hanya di latar gelap).
- Animasi: scroll-reveal halus (fade + translateY, `motion`), tanpa animasi mengganggu; hormati `prefers-reduced-motion`.
- Ikon `lucide-react` untuk divisi, keunggulan, kontak.

### 3.3 Logika terang/gelap

Gelap hanya di "panggung": **hero, strip K3, footer**. Seluruh konten tengah terang (sesuai dokumen analisa: latar bersih agar mudah dibaca).

---

## 4. Struktur Halaman (one-page)

Urutan + pemetaan konten dari `NSG COMPRO.docx`:

1. **Header** — sticky; transparan di atas hero → glass saat scroll; nav anchor + tombol Kontak + toggle ID/EN.
2. **Hero (gelap)** — gradient teal + radial glow mint; eyebrow "Satu Mitra — Tiga Solusi"; H1 tagline *"Building Strong Foundations, Delivering Sustainable Synergy."* (gradient text di kata kunci); subjudul ringkas 3 bidang; CTA "Jelajahi Divisi" + "Hubungi Kami"; kartu glass statistik (3 Divisi, 14+ Sektor); gambar pendukung sisi kanan.
3. **Tentang (terang)** — 2 paragraf "Tentang Perusahaan"; 5 nilai perusahaan sebagai chips; kartu **Visi** (gradient gelap) + **Misi** (kartu putih, 5 poin).
4. **Divisi (terang)** — 3 kartu bernomor (ikon + nama + deskripsi + ringkasan 10 lingkup/produk per divisi):
   - 01 Konstruksi Konvensional Gedung Perkantoran
   - 02 Perdagangan Besar Bahan Konstruksi dari Logam
   - 03 Perdagangan Besar Suku Cadang Elektronik
5. **Keunggulan (terang)** — grid 8 keunggulan (kartu kecil + ikon ✓); strip gelap **K3, Mutu & Kepatuhan** (4 poin) + paragraf "Komitmen Kami".
6. **Target Pelanggan (terang)** — barisan pil 14 sektor, center-aligned.
7. **Kontak (terang)** — dua kolom:
   - Kiri: form Web3Forms (nama, email, perusahaan/institusi opsional, kategori kebutuhan dropdown [3 divisi + Lainnya], pesan) + honeypot.
   - Kanan: kartu info kontak — alamat singkat, email, telepon (diisi dari `content/site.ts`). **Tanpa Google Maps** (keputusan revisi: alamat penuh dipindah ke footer).
8. **Footer (gelap)** — logo + tagline, navigasi anchor, **alamat lengkap** (Jl. Serdang Raya No. 12, Kel. Sumur Batu, Kec. Kemayoran, Jakarta Pusat 10650), email, hak cipta © 2026.

---

## 5. Form Kontak (Web3Forms)

- Endpoint `POST https://api.web3forms.com/submit` dari client; access key dari `NEXT_PUBLIC_WEB3FORMS_KEY` (`.env.local`, tidak di-commit; diset saat build produksi).
- Anti-spam: honeypot field tersembunyi (+ opsi *domain restriction* di dashboard Web3Forms setelah domain live).
- State: `idle → mengirim` (tombol disabled + spinner) `→ sukses` (pesan sukses inline bilingual + reset form) `| gagal` (pesan error inline + tombol coba lagi). Tanpa `alert()`.
- Jika key belum diset: submit menampilkan pesan "form belum dikonfigurasi" — aman untuk preview ke klien.
- Semua label, placeholder, pesan status, dan error bilingual via `content/{locale}.ts`.

---

## 6. SEO & Metadata

- `generateMetadata` statis per halaman: title/description ID & EN.
- `alternates`: canonical per locale + `hreflang` (`id` → `/`, `en` → `/en`, `x-default` → `/`).
- `sitemap.ts` berisi `/` dan `/en`; `robots.ts` allow-all.
- OG image statis (`public/og.jpg`); favicon + logo NSG dirender ulang bersih sebagai SVG (foto JPG referensi tidak dipakai langsung).
- Semantik: satu `<h1>` per halaman (hero), heading section `<h2>`, alt gambar bilingual.

---

## 7. Assets

- Client belum mengirim foto proyek → tahap awal pakai stock foto konstruksi berkualitas, semua di `public/images/` dengan nama generik (`hero.jpg`, `division-construction.jpg`, dst.) agar mudah ditukar saat maintenance (kontrak update minor).
- Logo NSG: dibuat ulang sebagai SVG bersih (monogram NSG, N & G gelap, S mint) berdasarkan referensi `Web Design Reference/`.

---

## 8. Build & Deploy

1. `npm run build` → situs statis di `out/`.
2. Verifikasi lokal: `npx serve out` → cek `/`, `/en`, anchor, form, responsive.
3. Deploy: upload isi `out/` ke `public_html` Biznet Gio NEO (file manager/FTP). Tidak perlu konfigurasi server tambahan.
4. Pasca-deploy: set `NEXT_PUBLIC_WEB3FORMS_KEY` saat build produksi, aktifkan domain restriction Web3Forms, tes submit form produksi, verifikasi `sitemap.xml` & `robots.txt`.

---

## 9. Testing & Verifikasi

- **Paritas konten ID/EN** — dijamin `interface Content` (error build bila field hilang).
- **Unit test (vitest)** — integritas konten terhadap dokumen sumber:
  - 3 divisi, masing-masing 10 item lingkup/produk
  - 5 misi, 5 nilai perusahaan, 8 keunggulan, 4 poin K3, 14 sektor
  - semua field teks non-kosong di kedua bahasa
- **Build sukses** = verifikasi static export.
- **Smoke test manual** (`npx serve out`): semua anchor berfungsi, toggle bahasa mempertahankan section, form lengkap (idle/mengirim/sukses/gagal), tampilan mobile (Chrome DevTools), tidak ada console error.
- Hormati `prefers-reduced-motion` pada animasi.

---

## 10. Luar Lingkup (Out of Scope)

- Tidak ada backend/API sendiri, CMS, atau database.
- Tidak ada halaman terpisah per divisi (one-page sesuai keputusan).
- Tidak ada Google Maps embed (dihapus per revisi).
- Tidak ada integrasi WhatsApp pada form produksi (itu mekanisme demo `web_sample`).
- Email korporat, domain, dan pembelian hosting = urusan infrastruktur di luar kode ini (lihat `Dokumen_Analisa_Project.md` §4).

---

## 11. Keputusan Terbuka

Tidak ada — semua keputusan telah dikonfirmasi. Nomor telepon & email final klien menunggu infrastruktur email aktif; sementara memakai placeholder yang mudah diganti di `content/site.ts`.
