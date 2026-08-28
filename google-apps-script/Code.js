/**
 * NATTU SUPPORT TICKETING BACKEND (Google Apps Script)
 * 
 * Fitur:
 * 1. Database relasional via Google Sheets (Tickets & Comments)
 * 2. File & Image Attachment Storage via Google Drive (15 GB Free Storage)
 * 3. REST API endpoint (GET / POST) untuk integrasi dengan Next.js Portal
 * 4. Otomatisasi Hak Akses File (Public Viewable Link)
 * 
 * CARA DEPLOY:
 * 1. Buka script.google.com -> Buat Project Baru.
 * 2. Paste seluruh kode ini.
 * 3. Jalankan fungsi initialSetup() sekali untuk menginisialisasi Spreadsheet & Folder Drive.
 * 4. Klik "Deploy" -> "New deployment" -> Type: "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 5. Copy URL Web App hasil deploy dan masukkan ke .env / portal Next.js.
 */

// Konfigurasi Nama Sheet dan Folder
const FOLDER_NAME = "Nattu Support Attachments";
const SHEET_TICKETS = "Tickets";
const SHEET_COMMENTS = "Comments";
const SHEET_USERS = "Users";
const SPREADSHEET_NAME = "Nattu Support Ticketing DB";

// Optional: Jika Anda ingin menautkan langsung ke ID Spreadsheet tertentu, masukkan di sini (atau biarkan kosong untuk deteksi otomatis)
const SPREADSHEET_ID = "18JMWVxqkJ5rkp_S6o0A6VpD1l3cvYna5Ko1U_YAjitY";

/**
 * Fungsi helper untuk mendapatkan Spreadsheet instance (mendukung Container-bound, Standalone, dan Pencarian Drive)
 */
function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    try {
      return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
    } catch (e) {
      Logger.log("Error openById: " + e.toString());
    }
  }

  // Cek jika script tertaut langsung di dalam spreadsheet
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;

  // Cek jika spreadsheet sudah ada di Google Drive dengan nama 'Nattu Support Ticketing DB'
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }

  // Jika belum ada, buat file baru
  return SpreadsheetApp.create(SPREADSHEET_NAME);
}

/**
 * Inisialisasi awal Google Spreadsheet dan Folder Google Drive
 */
function initialSetup() {
  const ss = getSpreadsheet();
  
  // 1. Setup Sheet Users (Kredensial Client & Admin)
  let sheetUsers = ss.getSheetByName(SHEET_USERS);
  if (!sheetUsers) {
    sheetUsers = ss.insertSheet(SHEET_USERS);
  }
  
  const headersUsers = [
    "User_ID",
    "Full_Name",
    "Email",
    "Role", // 'admin' atau 'client'
    "Password_PIN",
    "Department",
    "Created_At"
  ];
  
  if (sheetUsers.getLastRow() === 0) {
    sheetUsers.appendRow(headersUsers);
    sheetUsers.getRange(1, 1, 1, headersUsers.length).setFontWeight("bold").setBackground("#0f766e").setFontColor("#ffffff");
    sheetUsers.setFrozenRows(1);
    
    // Seed default users
    sheetUsers.appendRow(["USR-001", "Dendy Aditya (Admin)", "dendy@nattuglobalsynergy.co.id", "admin", "123456", "IT Technical Support", new Date().toISOString()]);
    sheetUsers.appendRow(["USR-002", "Ibu Rahmawati", "rahmawati@nattuglobalsynergy.co.id", "client", "654321", "Divisi Pengadaan", new Date().toISOString()]);
    sheetUsers.appendRow(["USR-003", "Bpk. Hendra", "hendra@nattuglobalsynergy.co.id", "client", "654321", "Divisi Marketing", new Date().toISOString()]);
  }

  // 2. Setup Sheet Tickets
  let sheetTickets = ss.getSheetByName(SHEET_TICKETS);
  if (!sheetTickets) {
    sheetTickets = ss.insertSheet(SHEET_TICKETS);
  }
  
  const headersTickets = [
    "Ticket_ID",
    "Ticket_Number",
    "Created_At",
    "Updated_At",
    "Client_Name",
    "Client_Email",
    "Client_Phone",
    "Company_Name",
    "Category",
    "Priority",
    "Subject",
    "Description",
    "Attachment_URL",
    "Attachment_Name",
    "Status",
    "SLA_Level",
    "AI_Level0_Reply",
    "AI_Level1_Prompt",
    "Admin_Notes",
    "Resolved_At"
  ];
  
  if (sheetTickets.getLastRow() === 0) {
    sheetTickets.appendRow(headersTickets);
    sheetTickets.getRange(1, 1, 1, headersTickets.length).setFontWeight("bold").setBackground("#0f766e").setFontColor("#ffffff");
    sheetTickets.setFrozenRows(1);
  }
  
  // 2. Setup Sheet Comments
  let sheetComments = ss.getSheetByName(SHEET_COMMENTS);
  if (!sheetComments) {
    sheetComments = ss.insertSheet(SHEET_COMMENTS);
  }
  
  const headersComments = [
    "Comment_ID",
    "Ticket_ID",
    "Created_At",
    "Sender_Role",
    "Sender_Name",
    "Message",
    "Attachment_URL"
  ];
  
  if (sheetComments.getLastRow() === 0) {
    sheetComments.appendRow(headersComments);
    sheetComments.getRange(1, 1, 1, headersComments.length).setFontWeight("bold").setBackground("#133947").setFontColor("#ffffff");
    sheetComments.setFrozenRows(1);
  }
  
  // 3. Pastikan Folder Google Drive Ada
  getOrCreateFolder(FOLDER_NAME);
  
  Logger.log("Inisialisasi Berhasil! URL Spreadsheet: " + ss.getUrl());
}

/**
 * Mencari atau membuat folder khusus di Google Drive
 */
function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    const newFolder = DriveApp.createFolder(folderName);
    // Set permission folder agar link attachment bisa diakses publik
    newFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return newFolder;
  }
}

/**
 * Menyimpan file attachment (Base64) ke Google Drive
 */
function saveFileToDrive(base64Data, fileName, contentType) {
  try {
    if (!base64Data) return { url: "", name: "" };
    
    const folder = getOrCreateFolder(FOLDER_NAME);
    
    // Hilangkan data URL prefix jika ada (misal: "data:image/png;base64,")
    const cleanBase64 = base64Data.replace(/^data:([A-Za-z-+/]+);base64,/, "");
    const decodedBytes = Utilities.base64Decode(cleanBase64);
    const blob = Utilities.newBlob(decodedBytes, contentType || "application/octet-stream", fileName || ("Attachment_" + Date.now()));
    
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Link view langsung dari Google Drive
    const fileUrl = file.getUrl();
    return {
      url: fileUrl,
      name: file.getName(),
      id: file.getId()
    };
  } catch (error) {
    Logger.log("Error saving file to Drive: " + error.toString());
    return { url: "", name: "", error: error.toString() };
  }
}

/**
 * Handler HTTP GET untuk mengambil data tiket dan user
 */
function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : {};
  const action = params.action || "GET_TICKETS";
  
  try {
    const ss = getSpreadsheet();

    // 1. Action Verifikasi Login User dari Google Sheet
    if (action === "VERIFY_USER" || action === "GET_USERS") {
      const sheetUsers = ss.getSheetByName(SHEET_USERS);
      if (!sheetUsers || sheetUsers.getLastRow() <= 1) {
        return createJsonResponse({ status: "error", message: "Data Users di Spreadsheet belum ada." });
      }
      
      const dataUsers = sheetUsers.getDataRange().getValues();
      const rows = dataUsers.slice(1);
      
      if (action === "VERIFY_USER") {
        const inputEmail = (params.email || "").toString().trim().toLowerCase();
        const inputPin = (params.pin || "").toString().trim();
        
        const match = rows.find(r => {
          const userEmail = (r[2] || "").toString().trim().toLowerCase();
          const userPin = (r[4] || "").toString().trim();
          return userEmail === inputEmail && userPin === inputPin;
        });
        
        if (match) {
          return createJsonResponse({
            status: "success",
            user: {
              id: match[0] || "USR-000",
              name: match[1] || "Client",
              email: match[2] || inputEmail,
              role: match[3] || "client",
              department: match[5] || "Internal",
              company: "PT Nattu Global Synergy"
            }
          });
        }
        return createJsonResponse({ status: "error", message: "Email atau PIN tidak cocok dengan Google Spreadsheet." });
      }
      
      const usersList = rows.map(r => ({
        id: r[0],
        name: r[1],
        email: r[2],
        role: r[3],
        department: r[5]
      }));
      return createJsonResponse({ status: "success", data: usersList });
    }
    
    // 2. Action Get Tickets
    const sheetTickets = ss.getSheetByName(SHEET_TICKETS);
    if (!sheetTickets || sheetTickets.getLastRow() <= 1) {
      return createJsonResponse({ status: "success", data: [] });
    }
    
    const data = sheetTickets.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const tickets = rows.map(row => {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = row[index];
      });
      return item;
    });
    
    if (action === "GET_TICKET" && params.id) {
      const single = tickets.find(t => t.Ticket_ID === params.id || t.Ticket_Number === params.id);
      return createJsonResponse({ status: "success", data: single || null });
    }
    
    return createJsonResponse({ status: "success", count: tickets.length, data: tickets.reverse() });
  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  }
}

/**
 * Handler HTTP POST untuk membuat / mengupdate tiket & komentar
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action || "CREATE_TICKET";
    const ss = getSpreadsheet();
    
    if (action === "CREATE_TICKET") {
      const sheetTickets = ss.getSheetByName(SHEET_TICKETS);
      const ticketId = "TICK-" + Utilities.getUuid().substring(0, 8).toUpperCase();
      const currentYear = new Date().getFullYear();
      const rowCount = Math.max(1, sheetTickets.getLastRow());
      const ticketNumber = "NAT-" + currentYear + "-" + ("000" + rowCount).slice(-3);
      const now = new Date().toISOString();
      
      // Upload file ke Google Drive jika ada
      let attachmentInfo = { url: "", name: "" };
      if (postData.fileBase64) {
        attachmentInfo = saveFileToDrive(postData.fileBase64, postData.fileName, postData.fileType);
      } else if (postData.attachmentUrl) {
        attachmentInfo.url = postData.attachmentUrl;
        attachmentInfo.name = postData.attachmentName || "Attachment";
      }
      
      const newRow = [
        ticketId,
        ticketNumber,
        now, // Created_At
        now, // Updated_At
        postData.clientName || "",
        postData.clientEmail || "",
        postData.clientPhone || "",
        postData.companyName || "Nattu",
        postData.category || "other",
        postData.priority || "normal",
        postData.subject || "",
        postData.description || "",
        attachmentInfo.url,
        attachmentInfo.name,
        "open", // Status awal
        postData.slaLevel || 0,
        postData.aiLevel0Reply || "",
        postData.aiLevel1Prompt || "",
        postData.adminNotes || "",
        "" // Resolved_At
      ];
      
      sheetTickets.appendRow(newRow);
      
      return createJsonResponse({
        status: "success",
        message: "Tiket berhasil dibuat",
        ticketId: ticketId,
        ticketNumber: ticketNumber,
        attachmentUrl: attachmentInfo.url
      });
    }
    
    if (action === "UPDATE_STATUS") {
      const sheetTickets = ss.getSheetByName(SHEET_TICKETS);
      const data = sheetTickets.getDataRange().getValues();
      const id = postData.ticketId;
      const newStatus = postData.status;
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === id || data[i][1] === id) {
          sheetTickets.getRange(i + 1, 15).setValue(newStatus); // Kolom 15: Status
          sheetTickets.getRange(i + 1, 4).setValue(new Date().toISOString()); // Kolom 4: Updated_At
          if (newStatus === "resolved" || newStatus === "closed") {
            sheetTickets.getRange(i + 1, 20).setValue(new Date().toISOString()); // Kolom 20: Resolved_At
          }
          if (postData.adminNotes) {
            sheetTickets.getRange(i + 1, 19).setValue(postData.adminNotes);
          }
          return createJsonResponse({ status: "success", message: "Status tiket diperbarui" });
        }
      }
      return createJsonResponse({ status: "error", message: "Tiket tidak ditemukan" });
    }
    
    return createJsonResponse({ status: "error", message: "Action tidak dikenal" });
  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  }
}

/**
 * Helper untuk response format JSON dengan CORS
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
