export enum UserRole {
  OWNER = "owner",
  MANAGER = "manager",
  AGENT = "agent",
}

export const permissions = {
  owner: ["*"],
  manager: ["view_all_leads", "view_stats", "manage_users", "view_campaigns"],
  agent: ["view_assigned_leads", "contact_leads", "book_appointments"],
} as const;

export type LeadStatus =
  | "new"
  | "contacted"
  | "no_answer"
  | "scheduled"
  | "won"
  | "lost";

export interface ContactAttempt {
  id: string;
  type: "call" | "sms" | "email" | "whatsapp";
  timestamp: string;
  user_id: string;
  notes?: string;
  success: boolean;
}

export interface Appointment {
  id: string;
  lead_id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  meeting_url?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  reminder_sent: boolean;
  ics_uid?: string;
  calendar_event_id?: string;
  notes?: string;
  outcome?: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  customer_id: string;
  campaign_id: string;
  adset_id: string;
  ad_id: string;
  source: "meta_lead_ads" | "manual";
  full_name: string;
  phone: string;
  email: string;
  postal_code: string;
  address?: string;
  city?: string;
  service: string;
  message: string;
  budget_range?: string;
  preferred_contact_time?: string;
  status: LeadStatus;
  assignee_user_id: string | null;
  attempts: ContactAttempt[];
  first_contact_at?: string | null;
  last_contact_at: string | null;
  gdpr_consent: boolean;
  consent_version: string;
  consent_timestamp: string;
  created_at: string;
  updated_at: string;
}


