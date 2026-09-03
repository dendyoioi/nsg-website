# Nattu Support Ticketing System — Flow & Architecture Reference

> **STATUS**: 🟢 **STABLE BASELINE (v1.0.0)**  
> **Terverifikasi**: 03 September 2026  
> **Ruang Lingkup**: Multi-Profile Browser Sync, Real-time Real Agent Escalation, Cloud Sheets Persistence, Cross-Environment Continuity (Local & Live).

## 📋 Overview

Sistem tiketing Nattu Support menggunakan arsitektur **static-export Next.js** dengan **Google Apps Script (GAS)** sebagai backend serverless dan **Google Sheets** sebagai database.

---

## 🏗️ Architecture

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│   Client Browser    │     │  Google Apps Script   │     │   Admin Browser     │
│   (Chrome Profile)  │     │   (Web App / REST)    │     │   (Chrome Profile)  │
│                     │     │                       │     │                     │
│  /support/ticket/   │────▶│  doPost() / doGet()   │◀────│  /support/admin     │
│  TicketDetailClient │     │                       │     │  Admin Portal       │
│                     │     │  ┌─────────────────┐  │     │                     │
│  localStorage       │     │  │ Google Sheets   │  │     │  localStorage       │
│  (nattu_comments_*) │     │  │ - Tickets       │  │     │  (nattu_comments_*) │
│                     │     │  │ - Comments      │  │     │                     │
│                     │     │  │ - Users         │  │     │                     │
│                     │     │  └─────────────────┘  │     │                     │
└─────────────────────┘     └──────────────────────┘     └─────────────────────┘
```

---

## 🔄 Message Flow (Klien → Admin)

### 1. Klien Mengirim Pesan
**File**: `components/support/TicketDetailClient.tsx` → `handleAddComment()`

```
Klien ketik pesan → handleAddComment()
  ├── 1. addComment(ticket.id, ticket.ticketNumber, userComment)
  │     ├── Simpan ke localStorage (nattu_comments_{ticketId} & nattu_comments_{ticketNumber})
  │     ├── Dispatch event 'nattu_comments_updated' (untuk sync tab yang sama)
  │     └── POST ke GAS → action: ADD_COMMENT → Simpan ke Google Sheets (Comments sheet)
  │
  └── 2. fetchComments() → Refresh state dengan data terbaru (lokal + remote)
```

### 2. Admin Menerima Pesan
**File**: `app/support/admin/page.tsx`

```
Admin buka tiket → useEffect([selectedTicket])
  ├── 1. getLocalComments() → Baca localStorage instan (0ms) — untuk same-browser
  ├── 2. fetchComments() → Background sync:
  │     ├── getLocalComments() → Baca lokal
  │     ├── GET GAS → action: GET_COMMENTS → Baca Google Sheets (Comments sheet)
  │     └── Merge lokal + remote → Deduplicate → Return
  │
  └── 3. Polling setiap 3 detik via setInterval → handleSync()
        ├── getLocalComments() → Cek lokal
        └── fetchComments() → Cek remote (Google Sheets)
```

### 3. Admin Membalas Pesan
**File**: `app/support/admin/page.tsx` → `handleSendAdminReply()`

```
Admin ketik balasan → handleSendAdminReply()
  ├── addComment(ticket.id, ticket.ticketNumber, adminComment)
  │     ├── Simpan ke localStorage
  │     ├── Dispatch 'nattu_comments_updated'
  │     └── POST ke GAS → ADD_COMMENT (senderRole: 'admin')
  │
  └── Klien menerima via:
        ├── Polling 3-detik (fetchComments)
        └── Event listener 'nattu_comments_updated' (same-browser only)
```

---

## 🗄️ Data Storage

### Google Sheets (Primary Database)
| Sheet | Kolom | Deskripsi |
|-------|-------|-----------|
| **Tickets** | Ticket_ID, Ticket_Number, Client_Name, Subject, Status, dll | Data tiket utama |
| **Comments** | Comment_ID, Ticket_ID, Created_At, Sender_Role, Sender_Name, Message | Pesan diskusi |
| **Users** | User_ID, Full_Name, Email, Role, Password_PIN | Akun pengguna |

### localStorage (Client-Side Cache)
| Key Pattern | Deskripsi |
|-------------|-----------|
| `nattu_comments_{ticketId}` | Cache komentar per tiket (by TICK-ID) |
| `nattu_comments_{ticketNumber}` | Cache komentar per tiket (by NAT-number) |
| `nattu_cached_tickets` | Cache daftar tiket |
| `nattu_admin_auth` | Status login admin |
| `nattu_confirm_{ticketId}` | Status konfirmasi eskalasi |
| `nattu_last_staff_time_{ticketId}` | Timestamp balasan terakhir staff (untuk auto-close 3 jam) |

---

## 🔧 Google Apps Script API

### Endpoint
```
NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec
```

### GET Endpoints
| Action | Parameter | Deskripsi |
|--------|-----------|-----------|
| `GET_TICKETS` | - | Ambil semua tiket |
| `GET_TICKET` | `id` | Ambil satu tiket by ID |
| `GET_COMMENTS` | `ticketId`, `ticketNumber` | Ambil komentar tiket |
| `VERIFY_USER` | `email`, `pin` | Verifikasi login user |

### POST Endpoints
| Action | Body Fields | Deskripsi |
|--------|-------------|-----------|
| `CREATE_TICKET` | clientName, subject, description, dll | Buat tiket baru |
| `UPDATE_STATUS` | ticketId, status, adminNotes | Update status tiket |
| `ADD_COMMENT` | ticketId, ticketNumber, senderName, senderRole, message | Tambah komentar |

---

## 🚀 Deployment Flow

### Prerequisites
- Google Apps Script Web App sudah di-deploy dengan kode terbaru (`google-apps-script/Code.js`)
- `.env.local` berisi URL GAS yang valid
- `initialSetup()` sudah dijalankan di GAS (membuat sheet Comments, Users, Tickets)

### Deploy Steps
```bash
# 1. Pastikan build sukses
npm run build

# 2. Verifikasi GAS endpoints
curl -sL "{GAS_URL}?action=GET_TICKETS"
curl -sL "{GAS_URL}?action=GET_COMMENTS&ticketId=TICK-xxx"

# 3. Push ke GitHub (auto-deploy via cPanel Git)
git add -A
git commit -m "fix: sync comments client-admin via GAS"
git push origin main
```

### Post-Deploy Verification
1. Buka halaman klien, kirim pesan
2. Buka halaman admin di browser/device berbeda
3. Pesan klien harus muncul di panel Diskusi admin

---

## ⚠️ Troubleshooting

### Pesan tidak muncul di Admin
1. **Cek GAS deployment**: `GET_COMMENTS` harus return JSON dengan field `Comment_ID`, bukan `Ticket_ID`
2. **Cek POST**: `ADD_COMMENT` harus return `{"status":"success","commentId":"CMT-xxx"}`
3. **Jika GAS return data tiket**: GAS belum di-deploy ulang → Re-deploy!
4. **Jika GAS POST return HTML error**: Pastikan `doPost(e)` ada di script

### Re-deploy GAS
1. Buka [script.google.com](https://script.google.com)
2. Paste `google-apps-script/Code.js` terbaru
3. Run `initialSetup()`
4. Deploy → Manage deployments → Edit → New version → Deploy
5. Update URL di `.env.local` jika berubah

### Chat Glitch / Flickering
- `saveLocalComments` dipanggil dengan `notify: false` saat hanya membaca
- State comparison menggunakan `JSON.stringify` untuk mencegah re-render
