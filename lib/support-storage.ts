import { Ticket, TicketFormData } from './types/support';
import { processTicketAI } from './ai-support-engine';

const GOOGLE_APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL || '';

// In-memory fallback
let localTickets: Ticket[] = [];

// Load cached tickets from localStorage on browser
if (typeof window !== 'undefined') {
  try {
    const cached = localStorage.getItem('nattu_cached_tickets');
    if (cached) {
      localTickets = JSON.parse(cached);
    }
  } catch {
    localTickets = [];
  }
}

function saveLocalCache(tickets: Ticket[]) {
  localTickets = tickets;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('nattu_cached_tickets', JSON.stringify(tickets));
    } catch {
      // ignore
    }
  }
}

export async function fetchTickets(): Promise<Ticket[]> {
  if (GOOGLE_APPS_SCRIPT_URL) {
    try {
      const res = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=GET_TICKETS`, {
        method: 'GET',
        cache: 'no-store'
      });
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && Array.isArray(json.data)) {
          const tickets = json.data.map((item: Record<string, unknown>) => mapGSheetToTicket(item));
          saveLocalCache(tickets);
          return tickets;
        }
      }
    } catch (err) {
      console.warn('GSheet API fetch failed, fallback to local storage:', err);
    }
  }
  return [...localTickets];
}

export async function fetchTicketById(id: string): Promise<Ticket | null> {
  if (GOOGLE_APPS_SCRIPT_URL) {
    try {
      const res = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=GET_TICKET&id=${encodeURIComponent(id)}`, {
        method: 'GET',
        cache: 'no-store'
      });
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          const ticket = mapGSheetToTicket(json.data as Record<string, unknown>);
          return ticket;
        }
      }
    } catch (err) {
      console.warn('GSheet API fetch single failed:', err);
    }
  }
  const match = localTickets.find(t => t.id === id || t.ticketNumber === id);
  return match || null;
}

export async function createTicket(data: TicketFormData): Promise<Ticket> {
  // 1. Process AI SLA Level 0 / 1
  const aiResult = await processTicketAI({
    category: data.category,
    priority: data.priority,
    subject: data.subject,
    description: data.description,
    clientName: data.clientName,
    companyName: data.companyName,
    attachmentUrl: data.fileBase64 ? 'Uploaded Document' : undefined,
    attachmentName: data.fileName
  });

  const currentYear = new Date().getFullYear();
  const fallbackTicketId = `TICK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const fallbackTicketNumber = `NAT-${currentYear}-${('000' + (localTickets.length + 1)).slice(-3)}`;
  const now = new Date().toISOString();

  let generatedTicketId = fallbackTicketId;
  let generatedTicketNumber = fallbackTicketNumber;
  let driveAttachmentUrl = data.fileBase64 ? (data.fileType?.startsWith('image/') ? data.fileBase64 : '') : '';

  // 2. Direct POST to Google Apps Script Web App
  if (GOOGLE_APPS_SCRIPT_URL) {
    try {
      const postPayload = {
        action: 'CREATE_TICKET',
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone || '',
        companyName: data.companyName || 'PT Nattu Global Synergy',
        category: data.category,
        priority: data.priority,
        subject: data.subject,
        description: data.description,
        fileBase64: data.fileBase64 || '',
        fileName: data.fileName || '',
        fileType: data.fileType || '',
        slaLevel: aiResult.slaLevel,
        aiLevel0Reply: aiResult.aiLevel0Reply || '',
        aiLevel1Prompt: aiResult.aiLevel1Analysis?.antigravityPrompt || ''
      };

      const res = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(postPayload)
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.ticketId) {
          generatedTicketId = json.ticketId;
          generatedTicketNumber = json.ticketNumber || fallbackTicketNumber;
          if (json.attachmentUrl) {
            driveAttachmentUrl = json.attachmentUrl;
          }
        }
      }
    } catch (err) {
      console.warn('GSheet API post ticket error:', err);
    }
  }

  const newTicket: Ticket = {
    id: generatedTicketId,
    ticketNumber: generatedTicketNumber,
    createdAt: now,
    updatedAt: now,
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    clientPhone: data.clientPhone,
    companyName: data.companyName,
    category: data.category,
    priority: data.priority,
    subject: data.subject,
    description: data.description,
    attachmentUrl: driveAttachmentUrl || undefined,
    attachmentName: data.fileName,
    status: 'open',
    slaLevel: aiResult.slaLevel,
    aiLevel0Reply: aiResult.aiLevel0Reply,
    aiLevel1Analysis: aiResult.aiLevel1Analysis
  };

  const updatedTickets = [newTicket, ...localTickets.filter(t => t.id !== newTicket.id)];
  saveLocalCache(updatedTickets);

  return newTicket;
}

export async function updateTicketStatus(id: string, status: Ticket['status'], adminNotes?: string): Promise<boolean> {
  const ticket = localTickets.find(t => t.id === id || t.ticketNumber === id);
  if (ticket) {
    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
    if (adminNotes !== undefined) ticket.adminNotes = adminNotes;
    if (status === 'resolved' || status === 'closed') {
      ticket.resolvedAt = new Date().toISOString();
    }
    saveLocalCache([...localTickets]);
  }

  if (GOOGLE_APPS_SCRIPT_URL) {
    try {
      await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'UPDATE_STATUS',
          ticketId: id,
          status: status,
          adminNotes: adminNotes
        })
      });
    } catch (err) {
      console.warn('GSheet API update status error:', err);
    }
  }

  return true;
}

export async function verifyUserLogin(
  email: string, 
  pin: string
): Promise<{ 
  success: boolean; 
  user?: { 
    id: string; 
    name: string; 
    email: string; 
    role: string; 
    department: string; 
    company: string;
  }; 
  message?: string; 
}> {
  if (GOOGLE_APPS_SCRIPT_URL) {
    try {
      const url = `${GOOGLE_APPS_SCRIPT_URL}?action=VERIFY_USER&email=${encodeURIComponent(email)}&pin=${encodeURIComponent(pin)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.status === 'success' && json.user) {
        return { success: true, user: json.user };
      } else {
        return { success: false, message: json.message || 'Email atau PIN tidak sesuai dengan database Google Spreadsheet.' };
      }
    } catch (err) {
      console.warn('Failed to verify user via Google Apps Script:', err);
      return { success: false, message: 'Gagal terhubung ke Google Apps Script backend. Pastikan Web App telah di-deploy.' };
    }
  }
  return { success: false, message: 'NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL belum dikonfigurasi.' };
}

function mapGSheetToTicket(row: Record<string, unknown>): Ticket {
  return {
    id: (row.Ticket_ID as string) || `TICK-${Math.random().toString(36).substring(2, 6)}`,
    ticketNumber: (row.Ticket_Number as string) || 'NAT-2026-000',
    createdAt: (row.Created_At as string) || new Date().toISOString(),
    updatedAt: (row.Updated_At as string) || new Date().toISOString(),
    clientName: (row.Client_Name as string) || 'Client',
    clientEmail: (row.Client_Email as string) || '',
    clientPhone: (row.Client_Phone ? String(row.Client_Phone) : ''),
    companyName: (row.Company_Name as string) || 'PT Nattu Global Synergy',
    category: (row.Category as Ticket['category']) || 'other',
    priority: (row.Priority as Ticket['priority']) || 'normal',
    subject: (row.Subject as string) || '',
    description: (row.Description as string) || '',
    attachmentUrl: (row.Attachment_URL as string) || undefined,
    attachmentName: (row.Attachment_Name as string) || undefined,
    status: (row.Status as Ticket['status']) || 'open',
    slaLevel: Number(row.SLA_Level) === 1 ? 1 : 0,
    aiLevel0Reply: (row.AI_Level0_Reply as string) || undefined,
    aiLevel1Analysis: row.AI_Level1_Prompt ? {
      businessGoal: (row.Subject as string) || 'Perubahan Website',
      affectedComponents: ['components/'],
      estimatedScope: 'Minor (< 1 Jam)',
      antigravityPrompt: row.AI_Level1_Prompt as string,
      suggestedTestSteps: ['Verifikasi tampilan visual di browser']
    } : undefined,
    adminNotes: (row.Admin_Notes as string) || undefined,
    resolvedAt: (row.Resolved_At as string) || undefined
  };
}
