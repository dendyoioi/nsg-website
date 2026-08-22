# Website Company Profile — PT Nattu Global Synergy

Website produksi (one-page, bilingual ID/EN) dibangun dengan Next.js static export.
Spec: `../docs/superpowers/specs/2026-08-22-nsg-website-design.md`

## Perintah

```bash
npm run dev       # dev server di localhost:3000
npm test          # tes integritas konten (vitest)
npm run build     # build static export → folder out/
```

## Form kontak (Web3Forms)

1. Daftar gratis di https://web3forms.com dengan email perusahaan.
2. Salin `.env.example` menjadi `.env.local`, isi `NEXT_PUBLIC_WEB3FORMS_KEY`.
3. Setelah domain live, aktifkan *domain restriction* di dashboard Web3Forms.

## Deploy ke Biznet Gio NEO

1. `npm run build`
2. Upload seluruh isi `out/` ke `public_html` (File Manager / FTP).
3. Verifikasi: `/`, `/en`, `sitemap.xml`, `robots.txt`, submit form.

## Update konten minor (maintenance)

- Semua teks ada di `content/id.ts` & `content/en.ts` (harus lengkap keduanya — field hilang = error TypeScript).
- Kontak/alamat/domain: `content/site.ts`.
- Foto: ganti file di `public/images/` dengan nama yang sama.
- Angka struktur konten (3 divisi × 10 item, 5 misi, 5 nilai, 8 keunggulan, 4 K3, 13 sektor) dijaga oleh tes `npm test` — ubah tes hanya jika dokumen sumber klien berubah.
