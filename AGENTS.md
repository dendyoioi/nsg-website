# Workspace Rules & Workflow Standards

## 🛑 ATURAN UTAMA PENGEMBANGAN & DEPLOYMENT

1. **JANGAN LANGSUNG PUSH/DEPLOY KE PRODUCTION SAAT REVISI**:
   - Setiap revisi (perubahan kode, tampilan UI, teks, gambar, atau styling) **HANYA diuji dan divalidasi di LOCAL server (`http://localhost:3000`) terlebih dahulu**.
   - Minta user untuk mereview dan memvalidasi tampilan di browser lokal.
   - **HANYA lakukan `git push origin main` atau deploy ke server JIKA dan HANYA JIKA user sudah memberikan persetujuan eksplisit (misal: *"oke deploy"*, *"sudah bagus, tolong deploy"*, dsb.)**.

2. **Local Development Server**:
   - Server dev dijalankan dengan `npm run dev` di `http://localhost:3000`.
   - Pastikan local dev server selalu dalam kondisi sehat (200 OK) sebelum meminta review user.
