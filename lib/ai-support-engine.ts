import { TicketCategory, TicketPriority, Level1Analysis } from './types/support';

interface TriageInput {
  category: TicketCategory;
  priority: TicketPriority;
  subject: string;
  description: string;
  clientName: string;
  companyName: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export function generateLevel0Response(input: TriageInput): string {
  const { clientName, subject, description } = input;
  const lowerDesc = (subject + ' ' + description).toLowerCase();

  // Specific handling for delay, password/auth error, sending issue, or quota
  let specificTip = '';
  if (lowerDesc.includes('lambat') || lowerDesc.includes('delay') || lowerDesc.includes('tidak masuk') || lowerDesc.includes('belum terima')) {
    specificTip = `\n📌 **Penyebab Utama Email Masuk Terlambat di Gmail:**
Gmail melakukan penarikan (POP3 fetch) secara periodik setiap 15–30 menit.
**Solusi Instan:** Buka Gmail di Browser ➔ Klik ikon **Gerigi (Settings)** ➔ **See all settings** ➔ Tab **Accounts and Import** ➔ Pada baris *"Check mail from other accounts"*, klik **"Check mail now"** (Periksa email sekarang). Email baru akan langsung masuk ke Inbox detik itu juga.\n`;
  } else if (lowerDesc.includes('password') || lowerDesc.includes('auth') || lowerDesc.includes('gagal login') || lowerDesc.includes('denied')) {
    specificTip = `\n📌 **Penyebab Pesan "Authentication Failed" / "Server Denied POP3 Access":**
Kredensial atau password email Nattu perlu diperbarui pada pengaturan Gmail.
**Solusi Cepat:** Buka Gmail ➔ Tab **Accounts and Import** ➔ Klik **edit info** di samping email \`@nattuglobalsynergy.co.id\` pada bagian *"Check mail"* maupun *"Send mail as"* ➔ Masukkan ulang password email Anda yang aktif ➔ Klik **Save Changes**.\n`;
  } else if (lowerDesc.includes('gagal kirim') || lowerDesc.includes('bounce') || lowerDesc.includes('relay')) {
    specificTip = `\n📌 **Penyebab Gagal Kirim Email dari Gmail:**
Koneksi SMTP ke server hosting terputus atau pengaturan port berubah.
**Solusi:** Buka Gmail ➔ Tab **Accounts and Import** ➔ Pada bagian *"Send mail as"*, klik **edit info** ➔ Pastikan SMTP Server: \`mail.nattuglobalsynergy.co.id\`, Port: **465 (SSL)**, dan centang *"Secured connection using SSL"*.\n`;
  }

  return `Halo Bapak/Ibu ${clientName},

Terima kasih telah menghubungi Nattu Support Center. Tiket Anda terkait kendala email yang telah terintegrasi di akun **Gmail** telah tercatat dengan prioritas penanganan.
${specificTip}
Berikut adalah langkah pengecekan cepat untuk mengatasi kendala email **@nattuglobalsynergy.co.id** yang terhubung di Gmail:

1. **Email Masuk Terlambat (Delay Sinkronisasi):**
   - Gmail secara default menarik email setiap 15-30 menit.
   - Untuk memaksa penarikan email saat ini juga: Buka **Gmail (Browser)** ➔ **Settings** ➔ **See all settings** ➔ Tab **Accounts and Import** ➔ Klik **"Check mail now"** di samping akun email Nattu Anda.

2. **Error Password / "Authentication Failed" di Gmail:**
   - Masuk ke Gmail ➔ **Accounts and Import** ➔ Klik **edit info** pada email Nattu Anda ➔ Masukkan ulang password yang benar ➔ Simpan.

3. **Gagal Mengirim Email Nattu dari Gmail:**
   - Pastikan server pengiriman tetap: \`mail.nattuglobalsynergy.co.id\`, Port: **465 (SSL)**, Username: alamat email lengkap Anda (contoh: \`nama@nattuglobalsynergy.co.id\`).

4. **Penyimpanan Mailbox Hosting Penuh (Quota Exceeded):**
   - Jika Gmail gagal menarik email karena mailbox penuh di server, tim teknis kami dapat langsung memperbesar kuota akun email Anda.

---

⚠️ **PENTING — KONFIRMASI PEMAHAMAN ANDA:**
Apakah penjelasan penanganan kendala Gmail di atas dapat dipahami dan berhasil menyelesaikan masalah Anda?

Jika Bapak/Ibu **belum memahami**, merasa penjelasannya berbelit-belit, atau kendala masih berlanjut, **mohon jangan membuang waktu Anda**. Silakan klik tombol **"⚠️ Belum Paham / Minta Bantuan Tim Teknis"** di bawah. Informasi ini akan segera diteruskan ke **Real Agent (Tim Teknis Nattu)** untuk dijawab dan dipandu secara manual langsung!`;
}

export function generateLevel1Analysis(input: TriageInput): Level1Analysis {
  const { category, priority, subject, description, attachmentUrl, attachmentName } = input;
  const text = (subject + ' ' + description).toLowerCase();

  // Determine affected components
  const affected: string[] = [];
  if (text.includes('header') || text.includes('menu') || text.includes('nav')) affected.push('components/Header.tsx');
  if (text.includes('footer') || text.includes('kontak') || text.includes('alamat')) affected.push('components/Footer.tsx');
  if (text.includes('hero') || text.includes('banner') || text.includes('utama')) affected.push('components/sections/HeroSection.tsx');
  if (text.includes('produk') || text.includes('layanan') || text.includes('service') || text.includes('divisi')) affected.push('components/sections/ServicesSection.tsx');
  if (text.includes('tentang') || text.includes('about') || text.includes('profil')) affected.push('components/sections/AboutSection.tsx');
  if (text.includes('konten') || text.includes('bahasa') || text.includes('teks')) affected.push('content/siteContent.ts');
  if (affected.length === 0) affected.push('components/', 'content/siteContent.ts');

  // Estimate scope
  let scope: Level1Analysis['estimatedScope'] = 'Minor (< 1 Jam)';
  if (category === 'new_feature' || text.includes('halaman baru') || text.includes('integrasi') || text.includes('form baru')) {
    scope = 'Major (> 3 Jam)';
  } else if (text.includes('redesign') || text.includes('layout') || text.includes('struktur')) {
    scope = 'Medium (1 - 3 Jam)';
  }

  const prompt = `### PERMINTAAN PERUBAHAN WEBSITE DARI KLIEN (TIKET: ${subject})

**Tujuan Bisnis:**
Klien PT Nattu Global Synergy meminta pembaruan pada website dengan spesifikasi berikut:
- **Kategori:** ${category}
- **Tingkat Prioritas:** ${priority.toUpperCase()}
- **Subjek Tiket:** ${subject}
- **Rincian Ekspektasi Klien:**
${description}
${attachmentUrl ? `\n- **Lampiran Referensi Klien:** [${attachmentName || 'Lihat Attachment'}](${attachmentUrl})` : ''}

---

### INSTRUKSI IMPLEMENTASI UNTUK ANTIGRAVITY:

1. **Target File / Komponen yang Diperbarui:**
${affected.map(f => `   - \`${f}\``).join('\n')}

2. **Pedoman Desain & Kode:**
   - Pertahankan estetika premium Nattu Global Synergy (Clean corporate modern, Teal/Dark Cyan palet \`--color-brand-*\`, font Sora/Inter).
   - Pastikan perubahan responsif di mobile (375px), tablet (768px), dan desktop (1280px+).
   - Jaga konsistensi bilingual (ID & EN) jika menyentuh file konten di \`content/\`.

3. **Langkah Eksekusi:**
   - Periksa file komponen terkait.
   - Lakukan update sesuai deskripsi klien di atas tanpa merusak struktur komponen lainnya.
   - Jalankan \`npm run build\` atau linting untuk memastikan tidak ada error TypeScript/Tailwind.

4. **Verifikasi:**
   - Buka browser preview dan verifikasi tampilan visual di desktop & mobile.`;

  return {
    businessGoal: `Melakukan update website terkait: "${subject}" sesuai permintaan klien PT Nattu Global Synergy pada komponen ${affected.join(', ')}.`,
    affectedComponents: affected,
    estimatedScope: scope,
    antigravityPrompt: prompt,
    suggestedTestSteps: [
      'Verifikasi teks/aset baru telah terpasang dengan tepat di viewport Desktop dan Mobile',
      'Periksa konsistensi warna brand (#0f766e, #14b8a6) dan font',
      'Pastikan build Next.js (npm run build) sukses tanpa error TypeScript'
    ]
  };
}

export async function processTicketAI(input: TriageInput): Promise<{
  slaLevel: 0 | 1;
  aiLevel0Reply?: string;
  aiLevel1Analysis?: Level1Analysis;
}> {
  // If it's website modification/revision/feature, activate Level 1 (Antigravity Prompt Generator)
  if (input.category === 'content_revision' || input.category === 'new_feature' || input.category === 'website_bug') {
    const level1 = generateLevel1Analysis(input);
    const level0 = generateLevel0Response(input);
    return {
      slaLevel: 1,
      aiLevel0Reply: level0,
      aiLevel1Analysis: level1,
    };
  }

  // Otherwise Level 0 troubleshooting focused on handling existing Gmail integration issues
  const level0 = generateLevel0Response(input);
  return {
    slaLevel: 0,
    aiLevel0Reply: level0,
  };
}

export function generateAICommentReply(
  userComment: string,
  clientName: string
): {
  replyText: string;
  shouldEscalate: boolean;
} {
  const text = userComment.toLowerCase();

  // 1. Check if user expresses confusion / wants real human agent
  if (
    text.includes('belum paham') || 
    text.includes('tidak paham') || 
    text.includes('bingung') || 
    text.includes('ga ngerti') || 
    text.includes('gak ngerti') || 
    text.includes('orang asli') || 
    text.includes('real agent') || 
    text.includes('manual') || 
    text.includes('telepon') || 
    text.includes('hubungi') || 
    text.includes('tolong') || 
    text.includes('susah')
  ) {
    return {
      replyText: `Halo Bapak/Ibu ${clientName},\n\nKami memahami bahwa kendala ini memerlukan panduan langsung. Informasi ini telah kami teruskan ke **Real Agent (Tim Teknis Nattu)**. Tim pengembang kami akan segera menindaklanjuti dan memandu Anda secara manual agar kendala cepat terselesaikan.`,
      shouldEscalate: true
    };
  }

  // 2. Check if user says it worked / resolved
  if (
    text.includes('sudah bisa') || 
    text.includes('berhasil') || 
    text.includes('terima kasih') || 
    text.includes('makasih') || 
    text.includes('thanks') || 
    text.includes('oke sip') || 
    text.includes('solved')
  ) {
    return {
      replyText: `Sama-sama Bapak/Ibu ${clientName}! Senang sekali kendala email Anda sudah teratasi. Anda dapat mengklik tombol **"Sudah Paham & Selesaikan Tiket"** di atas untuk menutup tiket ini secara resmi.`,
      shouldEscalate: false
    };
  }

  // 3. Specific follow-up for email not arriving / delay / settings
  if (
    text.includes('tidak masuk') || 
    text.includes('belum masuk') || 
    text.includes('belum bisa') || 
    text.includes('belum terima') || 
    text.includes('delay') || 
    text.includes('lambat')
  ) {
    return {
      replyText: `Halo Bapak/Ibu ${clientName},\n\nJika email dari eksternal masih belum muncul di Inbox Gmail Anda, silakan coba 2 langkah pengecekan lanjutan berikut:\n\n1. **Paksa Penarikan Email (Check Mail Now):**\n   - Di Gmail browser laptop: Klik **Settings (Ikon Gerigi)** ➔ **See all settings** ➔ Tab **Accounts and Import**.\n   - Cari baris *Check mail from other accounts* ➔ Klik tombol **"Check mail now"**.\n   - Lihat apakah muncul keterangan *"Fetched X emails"* atau pesan error merah (seperti *Connection error*).\n\n2. **Periksa Tab Spam / Updates:**\n   - Terkadang filter bawaan Gmail mengelompokkan email baru dari luar ke folder **Spam** atau tab **Updates**.\n\n⚠️ **Apakah langkah di atas berhasil, atau Anda ingin langsung dibantu oleh Real Agent (Tim Teknis)?** Silakan klik tombol *Belum Paham / Minta Bantuan* jika Anda ingin langsung dibantu secara manual.`,
      shouldEscalate: false
    };
  }

  if (text.includes('password') || text.includes('sandi') || text.includes('auth') || text.includes('gagal login')) {
    return {
      replyText: `Halo Bapak/Ibu ${clientName},\n\nUntuk kendala autentikasi password di Gmail:\n1. Buka Gmail ➔ **Accounts and Import** ➔ klik **edit info** di samping akun Nattu Anda.\n2. Ketikkan ulang password email korporat Anda dengan teliti (perhatikan huruf besar/kecil).\n3. Pastikan Port: **995 (POP3 SSL)** untuk terima email, dan Port: **465 (SSL)** untuk kirim email.\n\nJika lupa password email perusahaan, silakan balas pesan ini agar tim admin teknis mereset password akun email Anda.`,
      shouldEscalate: false
    };
  }

  // 4. Default intelligent contextual reply
  return {
    replyText: `Halo Bapak/Ibu ${clientName},\n\nPesan Anda: *"${userComment}"* telah tercatat pada tiket ini.\n\nSebagai pengingat, jika kendala Gmail masih berlanjut atau panduan terasa rumit, mohon jangan ragu untuk mengklik tombol **"⚠️ Belum Paham / Minta Bantuan Tim Teknis (Real Agent)"** agar tim engineer Nattu segera mendampingi Anda secara langsung.`,
    shouldEscalate: false
  };
}

