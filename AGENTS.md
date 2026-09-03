# Workspace Rules & Workflow Standards

## 🛑 ATURAN UTAMA PENGEMBANGAN & DEPLOYMENT

1. **JANGAN LANGSUNG PUSH/DEPLOY KE PRODUCTION SAAT REVISI**:
   - Setiap revisi (perubahan kode, tampilan UI, teks, gambar, atau styling) **HANYA diuji dan divalidasi di LOCAL server (`http://localhost:3000`) terlebih dahulu**.
   - Minta user untuk mereview dan memvalidasi tampilan di browser lokal.
   - **HANYA lakukan `git push origin main` atau deploy ke server JIKA dan HANYA JIKA user sudah memberikan persetujuan eksplisit (misal: *"oke deploy"*, *"sudah bagus, tolong deploy"*, dsb.)**.

2. **Local Development Server**:
   - Server dev dijalankan dengan `npm run dev` di `http://localhost:3000`.
   - Pastikan local dev server selalu dalam kondisi sehat (200 OK) sebelum meminta review user.
   - **Penting**: Hindari menjalankan `npm run build` bersamaan saat `npm run dev` sedang aktif di terminal lain agar tidak terjadi korupsi file cache `.next`. Jika terjadi error `./331.js` atau sejenisnya, bersihkan dengan `rm -rf .next` lalu restart dev server.

## 🎯 STANDAR STABIL MEKANISME SISTEM TIKET (STABLE BASELINE)

Sistem tiketing klien dan admin telah diverifikasi dan ditetapkan berstatus **STABLE**. Semua pengembangan selanjutnya **WAJIB** mempertahankan mekanisme berikut tanpa merusaknya:

1. **Dual-Layer Real-Time Synchronization**:
   - **Layer 1 (0ms Instant Local Read)**: Pembacaan awal pesan di UI selalu membaca cache lokal (`getLocalComments`) secara sinkron agar UI instan dan tidak mengalami delay.
   - **Layer 2 (Cloud Persistence & Cross-Browser Sync)**: Setiap pesan (komentar klien, balasan admin, notifikasi eskalasi Real Agent, resolve, close) **wajib menggunakan `await addComment()`** ke Google Apps Script backend agar baris tercatat permanen di Google Sheets (`Comments` sheet).

2. **Dual-Key Addressing**:
   - Penyimpanan dan pencocokan pesan selalu mendukung kedua identifier tiket: `ticketId` (misal: `TICK-16092760`) dan `ticketNumber` (misal: `NAT-2026-001`).

3. **Background Auto-Polling**:
   - Panel Admin melakukan *silent auto-poll* daftar tiket setiap **5 detik** (`loadTickets(true)`) tanpa menampilkan layar loading penuh.
   - Panel Admin dan Klien melakukan polling komentar setiap **3 detik** (`handleSync`) untuk mendeteksi balasan baru dari lawan bicara.

4. **Production Deployment & Backend Continuity**:
   - URL Google Apps Script stabil: `https://script.google.com/macros/s/AKfycbyiywcByOzbNMsgapT2wmGYlD_W9w5GVWFjAV0h9c9GnY2cF0XQwzuju2mnTLvLqRMp/exec`.
   - Konfigurasi CI/CD di `.github/workflows/deploy.yml` dan fallback di `lib/support-storage.ts` harus selalu sinkron dengan URL ini.
   - Acuan dokumentasi arsitektur lengkap: [`docs/TICKETING_FLOW.md`](file:///Users/dendyaditya/Projects/windy_project/docs/TICKETING_FLOW.md).
