import type { Lead } from "@/src/types/core";

export const queryKeys = {
  leads: (filters?: unknown) => ["leads", filters] as const,
  lead: (id: string) => ["leads", id] as const,
  campaigns: ["campaigns"] as const,
  metrics: (period: string) => ["metrics", period] as const,
  dashboardMetrics: ["dashboard_metrics"] as const,
  contactAttempts: (leadId: string) => ["contact_attempts", leadId] as const,
  appointments: ["appointments"] as const,
};

export type LeadListCache = Lead[];


