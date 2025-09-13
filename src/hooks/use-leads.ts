"use client";

import { useEffect } from "react";
import { useInfiniteQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { queryKeys } from "@/src/lib/query-keys";
import type { Lead, LeadStatus, Appointment } from "@/src/types/core";
import { useSupabase } from "@/src/providers/supabase-provider";
import { toast } from "sonner";
import type { SupabaseClient } from "@supabase/supabase-js";

interface LeadFilters {
  status?: string;
  search?: string;
}

interface LeadsPageResponse {
  data: Lead[];
  nextPage: number | null;
}

// Supabase API functions
async function fetchLeads({ 
  page = 0, 
  supabase, 
  filters 
}: { 
  page?: number; 
  supabase: SupabaseClient;
  filters?: LeadFilters;
}): Promise<LeadsPageResponse> {
  try {
    const pageSize = 20;
    const from = page * pageSize;
    const to = from + pageSize - 1;
    
    let query = supabase
      .from('leads')
      .select(`
        *,
        assignee:users(name),
        campaign:campaigns(name)
      `)
      .order('created_at', { ascending: false })
      .range(from, to);
    
    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.search) {
      query = query.or(
        `full_name.ilike.%${filters.search}%,` +
        `email.ilike.%${filters.search}%,` +
        `phone.ilike.%${filters.search}%,` +
        `service.ilike.%${filters.search}%,` +
        `postal_code.ilike.%${filters.search}%`
      );
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Feil ved henting av leads: ${error.message}`);
    }
    
    console.log('Supabase data received:', data?.length || 0, 'leads');
    
    // Convert Supabase data to our Lead type
    const leads: Lead[] = (data || []).map((row: any): Lead => ({
      id: row.id,
      customer_id: row.customer_id,
      campaign_id: row.campaign_id,
      adset_id: row.ad_set_id,
      ad_id: row.ad_id,
      source: row.source,
      full_name: row.full_name,
      phone: row.phone,
      email: row.email,
      postal_code: row.postal_code,
      service: row.service,
      message: row.message,
      status: row.status as LeadStatus,
      assignee_user_id: row.assignee_user_id,
      attempts: [], // Will be populated separately if needed
      last_contact_at: row.last_contact_at,
      gdpr_consent: row.gdpr_consent,
      consent_version: row.consent_version,
      consent_timestamp: row.consent_timestamp,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
    
    const hasMore = data && data.length === pageSize;
    
    return {
      data: leads,
      nextPage: hasMore ? page + 1 : null,
    };
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
}

export function useLeads(filters?: LeadFilters) {
  const { supabase } = useSupabase();
  
  return useInfiniteQuery({
    queryKey: queryKeys.leads(filters),
    queryFn: ({ pageParam = 0 }) => {
      console.log('Fetching leads with supabase:', !!supabase);
      if (!supabase) throw new Error('Supabase client not available');
      return fetchLeads({ page: pageParam, supabase, filters });
    },
    getNextPageParam: (last) => last.nextPage ?? undefined,
    initialPageParam: 0,
    retry: (failureCount, error) => {
      console.error('Query failed:', error);
      // Retry up to 3 times for network errors
      if (failureCount < 3 && (error.message.includes("network") || error.message.includes("fetch"))) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for real-time data)
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!supabase, // Only run when Supabase is available
  });
}

export function useRealtimeLeads() {
  const { supabase } = useSupabase();
  const qc = useQueryClient();
  
  useEffect(() => {
    if (!supabase) return;

    // Subscribe to real-time changes on leads table
    const subscription = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads'
        },
        (payload) => {
          const newLead = payload.new as any;
          
          // Convert to our Lead type
          const lead: Lead = {
            id: newLead.id,
            customer_id: newLead.customer_id,
            campaign_id: newLead.campaign_id,
            adset_id: newLead.ad_set_id,
            ad_id: newLead.ad_id,
            source: newLead.source,
            full_name: newLead.full_name,
            phone: newLead.phone,
            email: newLead.email,
            postal_code: newLead.postal_code,
            service: newLead.service,
            message: newLead.message,
            status: newLead.status as LeadStatus,
            assignee_user_id: newLead.assignee_user_id,
            attempts: [],
            last_contact_at: newLead.last_contact_at,
            gdpr_consent: newLead.gdpr_consent,
            consent_version: newLead.consent_version,
            consent_timestamp: newLead.consent_timestamp,
            created_at: newLead.created_at,
            updated_at: newLead.updated_at,
          };
          
          // Update all lead queries
          qc.setQueryData(
            queryKeys.leads(undefined),
            (old: { pages: LeadsPageResponse[]; pageParams: unknown[] } | undefined) => {
              if (!old) return old;
              const first = old.pages[0];
              const updatedFirst: LeadsPageResponse = {
                data: [lead, ...(first?.data ?? [])],
                nextPage: first?.nextPage ?? null,
              };
              return { ...old, pages: [updatedFirst, ...old.pages.slice(1)] };
            }
          );
          
          toast.success(`Nytt lead mottatt: ${lead.full_name}`, {
            description: `${lead.service} - ${lead.postal_code}`,
            duration: 5000,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leads'
        },
        (payload) => {
          const updatedLead = payload.new as any;
          
          // Convert to our Lead type
          const lead: Lead = {
            id: updatedLead.id,
            customer_id: updatedLead.customer_id,
            campaign_id: updatedLead.campaign_id,
            adset_id: updatedLead.ad_set_id,
            ad_id: updatedLead.ad_id,
            source: updatedLead.source,
            full_name: updatedLead.full_name,
            phone: updatedLead.phone,
            email: updatedLead.email,
            postal_code: updatedLead.postal_code,
            service: updatedLead.service,
            message: updatedLead.message,
            status: updatedLead.status as LeadStatus,
            assignee_user_id: updatedLead.assignee_user_id,
            attempts: [],
            last_contact_at: updatedLead.last_contact_at,
            gdpr_consent: updatedLead.gdpr_consent,
            consent_version: updatedLead.consent_version,
            consent_timestamp: updatedLead.consent_timestamp,
            created_at: updatedLead.created_at,
            updated_at: updatedLead.updated_at,
          };
          
          // Update all lead queries
          qc.setQueriesData(
            { queryKey: ['leads'] },
            (old: { pages: LeadsPageResponse[]; pageParams: unknown[] } | undefined) => {
              if (!old) return old;
              const newPages = old.pages.map(page => ({
                ...page,
                data: page.data.map(l => 
                  l.id === lead.id ? lead : l
                )
              }));
              return { ...old, pages: newPages };
            }
          );
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, qc]);
}

// Supabase API functions for mutations
async function updateLeadStatus(leadId: string, status: LeadStatus, supabase: SupabaseClient): Promise<Lead> {
  try {
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    
    // Set timestamps based on status
    if (status === 'contacted' || status === 'no_answer') {
      updateData.first_contact_at = new Date().toISOString();
      updateData.last_contact_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', leadId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Feil ved oppdatering av lead status: ${error.message}`);
    }
    
    // Convert to our Lead type
    const lead: Lead = {
      id: data.id,
      customer_id: data.customer_id,
      campaign_id: data.campaign_id,
      adset_id: data.ad_set_id,
      ad_id: data.ad_id,
      source: data.source,
      full_name: data.full_name,
      phone: data.phone,
      email: data.email,
      postal_code: data.postal_code,
      service: data.service,
      message: data.message,
      status: data.status as LeadStatus,
      assignee_user_id: data.assignee_user_id,
      attempts: [], // Will be populated separately if needed
      last_contact_at: data.last_contact_at,
      gdpr_consent: data.gdpr_consent,
      consent_version: data.consent_version,
      consent_timestamp: data.consent_timestamp,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
    
    return lead;
  } catch (error) {
    console.error('Error updating lead status:', error);
    throw error;
  }
}

async function addLeadAttempt(
  leadId: string, 
  type: 'call' | 'sms' | 'email' | 'whatsapp', 
  supabase: SupabaseClient,
  notes?: string
): Promise<Lead> {
  try {
    // First, add the contact attempt
    const { error: attemptError } = await supabase
      .from('contact_attempts')
      .insert({
        lead_id: leadId,
        user_id: '22222222-2222-2222-2222-222222222222', // Demo user ID
        type,
        outcome: 'completed',
        notes: notes || `${type} kontaktforsøk`,
      });
    
    if (attemptError) {
      throw new Error(`Feil ved registrering av kontaktforsøk: ${attemptError.message}`);
    }
    
    // Then update the lead
    const { data, error } = await supabase
      .from('leads')
      .update({
        status: 'contacted',
        last_contact_at: new Date().toISOString(),
        // total_attempts increment is handled at database level
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Feil ved oppdatering av lead: ${error.message}`);
    }
    
    // Convert to our Lead type
    const lead: Lead = {
      id: data.id,
      customer_id: data.customer_id,
      campaign_id: data.campaign_id,
      adset_id: data.ad_set_id,
      ad_id: data.ad_id,
      source: data.source,
      full_name: data.full_name,
      phone: data.phone,
      email: data.email,
      postal_code: data.postal_code,
      service: data.service,
      message: data.message,
      status: data.status as LeadStatus,
      assignee_user_id: data.assignee_user_id,
      attempts: [], // Will be populated separately if needed
      last_contact_at: data.last_contact_at,
      gdpr_consent: data.gdpr_consent,
      consent_version: data.consent_version,
      consent_timestamp: data.consent_timestamp,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
    
    return lead;
  } catch (error) {
    console.error('Error adding lead attempt:', error);
    throw error;
  }
}

export function useUpdateLeadStatus() {
  const { supabase } = useSupabase();
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leadId, status }: { leadId: string; status: LeadStatus }) => {
      if (!supabase) throw new Error('Supabase client not available');
      return updateLeadStatus(leadId, status, supabase);
    },
    onSuccess: (updatedLead) => {
      // Update all lead queries
      qc.setQueriesData(
        { queryKey: ['leads'] },
        (old: { pages: LeadsPageResponse[]; pageParams: unknown[] } | undefined) => {
          if (!old) return old;
          const newPages = old.pages.map(page => ({
            ...page,
            data: page.data.map(lead => 
              lead.id === updatedLead.id ? updatedLead : lead
            )
          }));
          return { ...old, pages: newPages };
        }
      );
      
      // Invalidate dashboard metrics when lead status changes
      qc.invalidateQueries({ queryKey: queryKeys.dashboardMetrics });
      
      toast.success("Lead status oppdatert", {
        description: `Status endret til: ${updatedLead.status}`,
      });
    },
    onError: (error) => {
      toast.error("Feil ved oppdatering av lead", {
        description: error.message || "Prøv igjen senere",
      });
    },
  });
}

export function useAddLeadAttempt() {
  const { supabase } = useSupabase();
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leadId, type, notes }: { 
      leadId: string; 
      type: 'call' | 'sms' | 'email' | 'whatsapp';
      notes?: string;
    }) => {
      if (!supabase) throw new Error('Supabase client not available');
      return addLeadAttempt(leadId, type, supabase, notes);
    },
    onSuccess: (updatedLead) => {
      // Update all lead queries
      qc.setQueriesData(
        { queryKey: ['leads'] },
        (old: { pages: LeadsPageResponse[]; pageParams: unknown[] } | undefined) => {
          if (!old) return old;
          const newPages = old.pages.map(page => ({
            ...page,
            data: page.data.map(lead => 
              lead.id === updatedLead.id ? updatedLead : lead
            )
          }));
          return { ...old, pages: newPages };
        }
      );
      
      toast.success("Kontaktforsøk registrert", {
        description: `Kontaktforsøk logget for ${updatedLead.full_name}`,
      });
    },
    onError: (error) => {
      toast.error("Feil ved registrering av kontaktforsøk", {
        description: error.message || "Prøv igjen senere",
      });
    },
  });
}

// API function for creating a new lead
async function createLead(leadData: CreateLeadData, supabase: SupabaseClient): Promise<Lead> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert({
        customer_id: '11111111-1111-1111-1111-111111111111', // Demo customer ID
        campaign_id: leadData.campaign_id,
        source: 'manual',
        full_name: leadData.full_name,
        phone: leadData.phone,
        email: leadData.email,
        postal_code: leadData.postal_code,
        address: leadData.address,
        city: leadData.city,
        service: leadData.service,
        message: leadData.message,
        budget_range: leadData.budget_range,
        preferred_contact_time: leadData.preferred_contact_time,
        status: 'new',
        gdpr_consent: leadData.gdpr_consent,
        consent_version: '1.0',
        consent_timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Feil ved opprettelse av lead: ${error.message}`);
    }

    // Convert to our Lead type
    const lead: Lead = {
      id: data.id,
      customer_id: data.customer_id,
      campaign_id: data.campaign_id,
      adset_id: data.ad_set_id,
      ad_id: data.ad_id,
      source: data.source,
      full_name: data.full_name,
      phone: data.phone,
      email: data.email,
      postal_code: data.postal_code,
      service: data.service,
      message: data.message,
      status: data.status as LeadStatus,
      assignee_user_id: data.assignee_user_id,
      attempts: [],
      last_contact_at: data.last_contact_at,
      gdpr_consent: data.gdpr_consent,
      consent_version: data.consent_version,
      consent_timestamp: data.consent_timestamp,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return lead;
  } catch (error) {
    console.error('Error creating lead:', error);
    throw error;
  }
}

export interface CreateLeadData {
  campaign_id?: string;
  full_name: string;
  phone: string;
  email: string;
  postal_code: string;
  address?: string;
  city?: string;
  service: string;
  message?: string;
  budget_range?: string;
  preferred_contact_time?: string;
  gdpr_consent: boolean;
}

export interface UpdateLeadData {
  campaign_id?: string;
  full_name?: string;
  phone?: string;
  email?: string;
  postal_code?: string;
  address?: string;
  city?: string;
  service?: string;
  message?: string;
  budget_range?: string;
  preferred_contact_time?: string;
}

export function useCreateLead() {
  const { supabase } = useSupabase();
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: (leadData: CreateLeadData) => {
      if (!supabase) throw new Error('Supabase client not available');
      return createLead(leadData, supabase);
    },
    onSuccess: (newLead) => {
      // Update all lead queries by adding the new lead to the first page
      qc.setQueryData(
        queryKeys.leads(undefined),
        (old: { pages: LeadsPageResponse[]; pageParams: unknown[] } | undefined) => {
          if (!old) {
            return {
              pages: [{ data: [newLead], nextPage: null }],
              pageParams: [0],
            };
          }
          const first = old.pages[0];
          const updatedFirst: LeadsPageResponse = {
            data: [newLead, ...(first?.data ?? [])],
            nextPage: first?.nextPage ?? null,
          };
          return { ...old, pages: [updatedFirst, ...old.pages.slice(1)] };
        }
      );
      
      // Invalidate dashboard metrics when new lead is created
      qc.invalidateQueries({ queryKey: queryKeys.dashboardMetrics });
      
      toast.success("Lead opprettet", {
        description: `${newLead.full_name} er lagt til i systemet`,
        duration: 5000,
      });
    },
    onError: (error) => {
      toast.error("Feil ved opprettelse av lead", {
        description: error.message || "Prøv igjen senere",
      });
    },
  });
}

// API function for updating a lead
async function updateLead(leadId: string, leadData: UpdateLeadData, supabase: SupabaseClient): Promise<Lead> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update({
        ...leadData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)
      .select()
      .single();

    if (error) {
      throw new Error(`Feil ved oppdatering av lead: ${error.message}`);
    }

    // Convert to our Lead type
    const lead: Lead = {
      id: data.id,
      customer_id: data.customer_id,
      campaign_id: data.campaign_id,
      adset_id: data.ad_set_id,
      ad_id: data.ad_id,
      source: data.source,
      full_name: data.full_name,
      phone: data.phone,
      email: data.email,
      postal_code: data.postal_code,
      service: data.service,
      message: data.message,
      status: data.status as LeadStatus,
      assignee_user_id: data.assignee_user_id,
      attempts: [],
      last_contact_at: data.last_contact_at,
      gdpr_consent: data.gdpr_consent,
      consent_version: data.consent_version,
      consent_timestamp: data.consent_timestamp,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return lead;
  } catch (error) {
    console.error('Error updating lead:', error);
    throw error;
  }
}

export function useUpdateLead() {
  const { supabase } = useSupabase();
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leadId, leadData }: { leadId: string; leadData: UpdateLeadData }) => {
      if (!supabase) throw new Error('Supabase client not available');
      return updateLead(leadId, leadData, supabase);
    },
    onSuccess: (updatedLead) => {
      // Update all lead queries
      qc.setQueriesData(
        { queryKey: ['leads'] },
        (old: { pages: LeadsPageResponse[]; pageParams: unknown[] } | undefined) => {
          if (!old) return old;
          const newPages = old.pages.map(page => ({
            ...page,
            data: page.data.map(lead => 
              lead.id === updatedLead.id ? updatedLead : lead
            )
          }));
          return { ...old, pages: newPages };
        }
      );
      
      // Invalidate dashboard metrics when lead is updated
      qc.invalidateQueries({ queryKey: queryKeys.dashboardMetrics });
      
      toast.success("Lead oppdatert", {
        description: `${updatedLead.full_name} ble oppdatert`,
        duration: 5000,
      });
    },
    onError: (error) => {
      toast.error("Feil ved oppdatering av lead", {
        description: error.message || "Prøv igjen senere",
      });
    },
  });
}

// Campaign types and functions
export interface Campaign {
  id: string;
  name: string;
  status: string;
  budget_total?: number;
  budget_daily?: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export interface CreateCampaignData {
  name: string;
  budget_total?: number;
  budget_daily?: number;
  start_date?: string;
  end_date?: string;
}

export interface UpdateCampaignData {
  name?: string;
  budget_total?: number;
  budget_daily?: number;
  start_date?: string;
  end_date?: string;
}

async function fetchCampaigns(supabase: SupabaseClient): Promise<Campaign[]> {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Feil ved henting av kampanjer: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
}

async function createCampaign(campaignData: CreateCampaignData, supabase: SupabaseClient): Promise<Campaign> {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        customer_id: '11111111-1111-1111-1111-111111111111', // Demo customer ID
        platform: 'manual',
        name: campaignData.name,
        budget_total: campaignData.budget_total,
        budget_daily: campaignData.budget_daily,
        status: 'active',
        start_date: campaignData.start_date,
        end_date: campaignData.end_date,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Feil ved opprettelse av kampanje: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
}

async function updateCampaignStatus(campaignId: string, status: string, supabase: SupabaseClient): Promise<Campaign> {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', campaignId)
      .select()
      .single();

    if (error) {
      throw new Error(`Feil ved oppdatering av kampanje: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error updating campaign:', error);
    throw error;
  }
}

async function updateCampaign(campaignId: string, campaignData: UpdateCampaignData, supabase: SupabaseClient): Promise<Campaign> {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .update({
        ...campaignData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId)
      .select()
      .single();

    if (error) {
      throw new Error(`Feil ved oppdatering av kampanje: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error updating campaign:', error);
    throw error;
  }
}

export function useCampaigns() {
  const { supabase } = useSupabase();
  
  return useInfiniteQuery({
    queryKey: queryKeys.campaigns,
    queryFn: () => {
      if (!supabase) throw new Error('Supabase client not available');
      return fetchCampaigns(supabase);
    },
    getNextPageParam: () => undefined, // No pagination for campaigns
    initialPageParam: 0,
    enabled: !!supabase,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    select: (data) => ({
      pages: [data.pages[0]], // Flatten for campaigns since there's no pagination
      pageParams: data.pageParams,
    }),
  });
}

export function useCreateCampaign() {
  const { supabase } = useSupabase();
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: (campaignData: CreateCampaignData) => {
      if (!supabase) throw new Error('Supabase client not available');
      return createCampaign(campaignData, supabase);
    },
    onSuccess: (newCampaign) => {
      // Invalidate campaigns query to refetch
      qc.invalidateQueries({ queryKey: queryKeys.campaigns });
      
      toast.success("Kampanje opprettet", {
        description: `${newCampaign.name} er lagt til i systemet`,
        duration: 5000,
      });
    },
    onError: (error) => {
      toast.error("Feil ved opprettelse av kampanje", {
        description: error.message || "Prøv igjen senere",
      });
    },
  });
}

export function useUpdateCampaignStatus() {
  const { supabase } = useSupabase();
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: ({ campaignId, status }: { campaignId: string; status: string }) => {
      if (!supabase) throw new Error('Supabase client not available');
      return updateCampaignStatus(campaignId, status, supabase);
    },
    onSuccess: (updatedCampaign) => {
      // Invalidate campaigns query to refetch
      qc.invalidateQueries({ queryKey: queryKeys.campaigns });
      
      toast.success("Kampanje oppdatert", {
        description: `Status endret til: ${updatedCampaign.status}`,
      });
    },
    onError: (error) => {
      toast.error("Feil ved oppdatering av kampanje", {
        description: error.message || "Prøv igjen senere",
      });
    },
  });
}

export function useUpdateCampaign() {
  const { supabase } = useSupabase();
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: ({ campaignId, campaignData }: { campaignId: string; campaignData: UpdateCampaignData }) => {
      if (!supabase) throw new Error('Supabase client not available');
      return updateCampaign(campaignId, campaignData, supabase);
    },
    onSuccess: (updatedCampaign) => {
      // Invalidate campaigns query to refetch
      qc.invalidateQueries({ queryKey: queryKeys.campaigns });
      
      // Invalidate dashboard metrics when campaign is updated
      qc.invalidateQueries({ queryKey: queryKeys.dashboardMetrics });
      
      toast.success("Kampanje oppdatert", {
        description: `${updatedCampaign.name} ble oppdatert`,
      });
    },
    onError: (error) => {
      toast.error("Feil ved oppdatering av kampanje", {
        description: error.message || "Prøv igjen senere",
      });
    },
  });
}

// Contact attempts types and functions
export interface ContactAttempt {
  id: string;
  lead_id: string;
  user_id: string;
  type: 'call' | 'sms' | 'email' | 'whatsapp';
  outcome: string;
  duration_seconds?: number;
  notes?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  created_at: string;
  user?: {
    name: string;
  };
}

async function fetchContactAttempts(leadId: string, supabase: SupabaseClient): Promise<ContactAttempt[]> {
  try {
    const { data, error } = await supabase
      .from('contact_attempts')
      .select(`
        *,
        user:users(name)
      `)
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Feil ved henting av kontaktforsøk: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching contact attempts:', error);
    throw error;
  }
}

export function useContactAttempts(leadId: string) {
  const { supabase } = useSupabase();
  
  return useInfiniteQuery({
    queryKey: queryKeys.contactAttempts(leadId),
    queryFn: () => {
      if (!supabase) throw new Error('Supabase client not available');
      return fetchContactAttempts(leadId, supabase);
    },
    getNextPageParam: () => undefined,
    initialPageParam: 0,
    enabled: !!supabase && !!leadId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Dashboard metrics types and functions
export interface DashboardMetrics {
  leadsToday: number;
  leadsThisWeek: number;
  leadsThisMonth: number;
  contactRate: number;
  appointmentRate: number;
  winRate: number;
  avgCPL: number;
  totalSpend: number;
  leadsByDay: { date: string; count: number }[];
  contactRateByDay: { date: string; rate: number }[];
}

async function fetchDashboardMetrics(supabase: SupabaseClient): Promise<DashboardMetrics> {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const last10Days = new Date(today);
    last10Days.setDate(today.getDate() - 10);

    // Get all leads for calculations
    const { data: allLeads, error: leadsError } = await supabase
      .from('leads')
      .select('id, status, created_at, last_contact_at')
      .gte('created_at', last10Days.toISOString());

    if (leadsError) {
      throw new Error(`Feil ved henting av leads: ${leadsError.message}`);
    }

    // Get all campaigns for spend calculation
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('budget_total')
      .eq('status', 'active');

    if (campaignsError) {
      throw new Error(`Feil ved henting av kampanjer: ${campaignsError.message}`);
    }

    // Get contact attempts for contact rate calculation
    const { error: attemptsError } = await supabase
      .from('contact_attempts')
      .select('id, lead_id, created_at')
      .gte('created_at', last10Days.toISOString());

    if (attemptsError) {
      throw new Error(`Feil ved henting av kontaktforsøk: ${attemptsError.message}`);
    }

    const leads = allLeads || [];
    // const attempts = contactAttempts || [];

    // Calculate basic metrics
    const leadsToday = leads.filter(lead => 
      new Date(lead.created_at) >= today
    ).length;

    const leadsThisWeek = leads.filter(lead => 
      new Date(lead.created_at) >= weekStart
    ).length;

    const leadsThisMonth = leads.filter(lead => 
      new Date(lead.created_at) >= monthStart
    ).length;

    // Contact rate: leads that have been contacted vs total leads
    const contactedLeads = leads.filter(lead => 
      lead.last_contact_at || ['contacted', 'no_answer', 'scheduled', 'won', 'lost'].includes(lead.status)
    ).length;
    const contactRate = leads.length > 0 ? contactedLeads / leads.length : 0;

    // Appointment rate: scheduled/won leads vs total leads
    const appointmentLeads = leads.filter(lead => 
      ['scheduled', 'won'].includes(lead.status)
    ).length;
    const appointmentRate = leads.length > 0 ? appointmentLeads / leads.length : 0;

    // Win rate: won leads vs contacted leads
    const wonLeads = leads.filter(lead => lead.status === 'won').length;
    const winRate = contactedLeads > 0 ? wonLeads / contactedLeads : 0;

    // Calculate spend and CPL
    const totalSpend = (campaigns || []).reduce((sum, campaign) => 
      sum + (campaign.budget_total || 0), 0
    );
    const avgCPL = leads.length > 0 ? totalSpend / leads.length : 0;

    // Generate daily data for charts (last 10 days)
    const leadsByDay: { date: string; count: number }[] = [];
    const contactRateByDay: { date: string; rate: number }[] = [];

    for (let i = 9; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayLeads = leads.filter(lead => 
        lead.created_at.startsWith(dateStr)
      );
      
      const dayContactedLeads = dayLeads.filter(lead => 
        lead.last_contact_at || ['contacted', 'no_answer', 'scheduled', 'won', 'lost'].includes(lead.status)
      );

      leadsByDay.push({
        date: dateStr,
        count: dayLeads.length
      });

      contactRateByDay.push({
        date: dateStr,
        rate: dayLeads.length > 0 ? dayContactedLeads.length / dayLeads.length : 0
      });
    }

    return {
      leadsToday,
      leadsThisWeek,
      leadsThisMonth,
      contactRate,
      appointmentRate,
      winRate,
      avgCPL,
      totalSpend,
      leadsByDay,
      contactRateByDay,
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    throw error;
  }
}

export function useDashboardMetrics() {
  const { supabase } = useSupabase();
  
  return useInfiniteQuery({
    queryKey: queryKeys.dashboardMetrics,
    queryFn: () => {
      if (!supabase) throw new Error('Supabase client not available');
      return fetchDashboardMetrics(supabase);
    },
    getNextPageParam: () => undefined,
    initialPageParam: 0,
    enabled: !!supabase,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Appointments API functions
export interface CreateAppointmentData {
  lead_id: string;
  title: string;
  description?: string;
  start_time: Date;
  end_time: Date;
  location?: string;
  ics_uid?: string;
}

async function createAppointment(appointmentData: CreateAppointmentData, supabase: SupabaseClient): Promise<Appointment> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        lead_id: appointmentData.lead_id,
        user_id: '22222222-2222-2222-2222-222222222222', // Demo user ID
        title: appointmentData.title,
        description: appointmentData.description,
        start_time: appointmentData.start_time.toISOString(),
        end_time: appointmentData.end_time.toISOString(),
        location: appointmentData.location,
        status: 'scheduled',
        reminder_sent: false,
        ics_uid: appointmentData.ics_uid,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Feil ved booking av befaring: ${error.message}`);
    }

    return {
      id: data.id,
      lead_id: data.lead_id,
      user_id: data.user_id,
      title: data.title,
      description: data.description,
      start_time: data.start_time,
      end_time: data.end_time,
      location: data.location,
      meeting_url: data.meeting_url,
      status: data.status,
      reminder_sent: data.reminder_sent,
      ics_uid: data.ics_uid,
      calendar_event_id: data.calendar_event_id,
      notes: data.notes,
      outcome: data.outcome,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}

async function fetchAppointments(leadId: string, supabase: SupabaseClient): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('lead_id', leadId)
      .order('start_time', { ascending: true });

    if (error) {
      throw new Error(`Feil ved henting av befaringer: ${error.message}`);
    }

    return data.map((appointment: any) => ({
      id: appointment.id,
      lead_id: appointment.lead_id,
      user_id: appointment.user_id,
      title: appointment.title,
      description: appointment.description,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      location: appointment.location,
      meeting_url: appointment.meeting_url,
      status: appointment.status,
      reminder_sent: appointment.reminder_sent,
      ics_uid: appointment.ics_uid,
      calendar_event_id: appointment.calendar_event_id,
      notes: appointment.notes,
      outcome: appointment.outcome,
      created_at: appointment.created_at,
      updated_at: appointment.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
}

export function useCreateAppointment() {
  const { supabase } = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentData) => {
      if (!supabase) throw new Error('Supabase client not available');
      return createAppointment(data, supabase);
    },
    onSuccess: (appointment) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments(appointment.lead_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardMetrics });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads() });
      
      toast.success("Befaring booket!", {
        description: `${appointment.title} er lagt til kalenderen`,
      });
    },
    onError: (error: Error) => {
      toast.error("Kunne ikke booke befaring", {
        description: error.message || "Prøv igjen senere",
      });
    },
  });
}

export function useAppointments(leadId: string) {
  const { supabase } = useSupabase();
  
  return useInfiniteQuery({
    queryKey: queryKeys.appointments(leadId),
    queryFn: () => {
      if (!supabase) throw new Error('Supabase client not available');
      return fetchAppointments(leadId, supabase);
    },
    getNextPageParam: () => undefined,
    initialPageParam: 0,
    enabled: !!supabase && !!leadId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}


