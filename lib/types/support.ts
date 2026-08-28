export type TicketCategory =
  | 'email_webmail'
  | 'website_bug'
  | 'content_revision'
  | 'new_feature'
  | 'domain_dns'
  | 'other';

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export type TicketStatus =
  | 'open'
  | 'analyzing'
  | 'in_progress'
  | 'waiting_feedback'
  | 'resolved'
  | 'closed';

export interface TicketAttachment {
  name: string;
  url: string;
  type?: string;
  size?: number;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  sender: 'client' | 'admin' | 'ai_level0' | 'system';
  senderName: string;
  message: string;
  createdAt: string;
  attachmentUrl?: string;
}

export interface Level1Analysis {
  businessGoal: string;
  affectedComponents: string[];
  estimatedScope: 'Minor (< 1 Jam)' | 'Medium (1 - 3 Jam)' | 'Major (> 3 Jam)';
  antigravityPrompt: string;
  suggestedTestSteps: string[];
}

export interface Ticket {
  id: string;
  ticketNumber: string; // e.g. NAT-2026-001
  createdAt: string;
  updatedAt: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  companyName: string;
  category: TicketCategory;
  priority: TicketPriority;
  subject: string;
  description: string;
  attachmentUrl?: string;
  attachmentName?: string;
  status: TicketStatus;
  
  // AI Agent SLAs
  slaLevel: 0 | 1;
  aiLevel0Reply?: string; // Instant auto-response for general troubleshooting
  aiLevel1Analysis?: Level1Analysis; // Deep requirement analysis & Antigravity prompt for admin
  
  // Admin fields
  adminNotes?: string;
  assignedTo?: string;
  resolvedAt?: string;
}

export interface TicketFormData {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  companyName: string;
  category: TicketCategory;
  priority: TicketPriority;
  subject: string;
  description: string;
  fileBase64?: string;
  fileName?: string;
  fileType?: string;
}
