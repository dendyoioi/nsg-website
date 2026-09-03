# Website Company Profile — PT Nattu Global Synergy

Website produksi (one-page, bilingual ID/EN + Portal Ticketing Support) dibangun dengan Next.js Static Export & Tailwind CSS.

---

## 🚀 Perintah Dasar

```bash
npm run dev       # Menjalankan local dev server di http://localhost:3000
npm test          # Menjalankan tes integritas konten (Vitest)
npm run build     # Menghasilkan static export di folder out/
```

---

## 🔄 Alur Deploy Otomatis (CI/CD Production)

Website ini menggunakan **pipeline deploy otomatis (GitHub Actions)** yang langsung mengupdate hosting Biznet Gio cPanel setiap kali ada commit yang di-push ke branch `main`.

### Arsitektur Deployment:
```
[ Git Push to main ]
        ⬇
[ GitHub Actions Runner ]
  1. npm install & npm run build (Static Export ke folder out/)
  2. Kompresi menjadi paket ringan: site.tar.gz (~3 MB)
  3. Upload site.tar.gz & unpacker-gz.php via Native FTP (Passive Mode + Retry)
  4. Panggil endpoint unpacker-gz.php via HTTPS GET untuk ekstraksi otomatis di server
  5. Verifikasi response HTTP 200 pada halaman utama & portal support
        ⬇
[ cPanel Server (LiteSpeed) ]
  • File diekstrak secara instan di public_html
  • unpacker-gz.php & site.tar.gz otomatis dibersihkan (self-cleanup)
  • Website langsung live dalam ~45 detik!
```

### Konfigurasi GitHub Repository Secrets:
Diperlukan di **GitHub Repo ➔ Settings ➔ Secrets and variables ➔ Actions**:
- `FTP_SERVER`: IP / host FTP cPanel (contoh: `103.125.180.51`)
- `FTP_USERNAME`: Username akun FTP cPanel
- `FTP_PASSWORD`: Password akun FTP cPanel

---

## 🔍 Cara Verifikasi & Validasi Deploy

Setelah push atau deploy selesai, buka alat validator di browser:
- **Deploy Validator**: [https://nattuglobalsynergy.co.id/deploy-check.html](https://nattuglobalsynergy.co.id/deploy-check.html)
- **Halaman Utama (ID)**: [https://nattuglobalsynergy.co.id](https://nattuglobalsynergy.co.id)
- **Versi English (EN)**: [https://nattuglobalsynergy.co.id/en](https://nattuglobalsynergy.co.id/en)
- **Portal Support SLA**: [https://nattuglobalsynergy.co.id/support](https://nattuglobalsynergy.co.id/support)

---

## 🛠️ Catatan Pemeliharaan & Troubleshooting

### 1. Local Development (`npm run dev`)
- Gunakan `npm run dev` (standar Next.js dev server).
- Jika pernah terjadi error cache setelah menjalankan build manual, bersihkan cache lokal dengan:
  ```bash
  rm -rf .next && npm run dev
  ```

### 2. Update Konten & Data
- Semua teks bilingual tersimpan di `content/id.ts` & `content/en.ts`.
- Informasi kontak, alamat kantor, dan metadata: `content/site.ts`.
- Aset gambar/logo: simpan di folder `public/images/`.
- Backend integrasi tiket: Google Apps Script Web App URL dikonfigurasi di `.env.local` / GitHub Workflow env.

---

© 2026 PT Nattu Global Synergy. All rights reserved.
