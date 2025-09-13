"use client";

import Link from "next/link";
import { useState } from "react";
import { useLeads, useRealtimeLeads, useUpdateLeadStatus } from "@/src/hooks/use-leads";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { LeadCardSkeleton } from "@/src/components/ui/skeleton";
import { NetworkErrorFallback, EmptyStateFallback } from "@/src/components/ui/error-boundary";
import type { Lead, LeadStatus } from "@/src/types/core";

const statusOptions: Array<{ value: Lead["status"]; label: string; variant: "default" | "success" | "warning" | "error" | "secondary" | "outline" | "neutral" }> = [
  { value: "new", label: "Ny", variant: "secondary" },
  { value: "contacted", label: "Kontaktet", variant: "default" },
  { value: "no_answer", label: "Ingen svar", variant: "warning" },
  { value: "scheduled", label: "Booket", variant: "success" },
  { value: "won", label: "Vunnet", variant: "success" },
  { value: "lost", label: "Tapt", variant: "error" },
];

export default function LeadsPage() {
  useRealtimeLeads();
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | null>(null);
  const { data, isLoading, error, refetch, isError } = useLeads();
  const updateLeadStatus = useUpdateLeadStatus();
  const list = data?.pages?.[0]?.data ?? [];

  const filteredList = list.filter(lead => {
    const matchesSearch = !search || 
      lead.full_name.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone.includes(search) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.postal_code.includes(search) ||
      lead.service.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = !selectedStatus || lead.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusFilter = (status: LeadStatus) => {
    setSelectedStatus(selectedStatus === status ? null : status);
  };

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="heading-md">Leads</h1>
        <div className="flex items-center gap-2">
          <Link href="/leads/add">
            <Button 
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white"
              size="sm"
            >
              + Legg til lead
            </Button>
          </Link>
          <div className="hidden md:flex gap-2 flex-wrap">
            {statusOptions.map((s) => (
              <Button 
                key={s.value} 
                variant={selectedStatus === s.value ? "default" : "outline"} 
                size="sm"
                onClick={() => handleStatusFilter(s.value)}
                className="transition-all duration-[var(--duration-fast)]"
              >
                {s.label}
              </Button>
            ))}
            {selectedStatus && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedStatus(null)}
                className="text-[var(--color-neutral)]"
              >
                Fjern filter
              </Button>
            )}
          </div>
        </div>
      </div>
      <NotifyDemo />
      <div className="grid gap-2 md:grid-cols-3">
        <Input placeholder="Søk..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      
      {isError && (
        <NetworkErrorFallback 
          onRetry={() => refetch()}
          title={error?.message?.includes("Nettverksfeil") ? "Nettverksfeil" : "Feil ved henting av leads"}
        />
      )}
      
      {isLoading && !isError && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LeadCardSkeleton key={i} />
          ))}
        </div>
      )}
      {!isLoading && !isError && filteredList.length === 0 && list.length === 0 && (
        <EmptyStateFallback 
          title="Ingen leads ennå"
          description="Nye leads dukker opp fortløpende her når kampanjene er aktive."
          icon="📋"
        />
      )}
      {!isLoading && !isError && filteredList.length === 0 && list.length > 0 && (
        <EmptyStateFallback 
          title="Ingen treff"
          description="Ingen leads matcher søket eller filteret ditt. Prøv å justere søkekriteriene."
          icon="🔍"
        />
      )}
      {!isLoading && filteredList.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredList.map((lead) => {
            const statusOption = statusOptions.find(s => s.value === lead.status);
            return (
              <Card key={lead.id} className={`relative group interactive-hover status-${lead.status}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{lead.full_name}</CardTitle>
                    <Badge variant={statusOption?.variant || "outline"} size="sm">
                      {statusOption?.label || lead.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-foreground/70 mb-2">
                    <div>{lead.phone}</div>
                    <div>{lead.email}</div>
                  </div>
                  <div className="text-xs text-foreground/60 mb-3">
                    {lead.service} · {lead.postal_code}
                  </div>
                  {lead.last_contact_at && (
                    <div className="text-xs text-[var(--color-success)] mb-3">
                      Sist kontaktet: {new Date(lead.last_contact_at).toLocaleString('no-NO')}
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <Link 
                      href={`/leads/${lead.id}`} 
                      className="text-[var(--color-primary)] text-sm font-medium hover:underline"
                    >
                      Detaljer
                    </Link>
                    <select
                      className="text-xs border border-black/10 rounded px-2 py-1 bg-background"
                      value={lead.status}
                      onChange={(e) => updateLeadStatus.mutate({ 
                        leadId: lead.id, 
                        status: e.target.value as LeadStatus 
                      })}
                      disabled={updateLeadStatus.isPending}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NotifyDemo() {
  return (
    <div className="text-xs text-foreground/60">
      SLA-demo: et varsel dukker opp hvis et nytt lead ikke er kontaktet innen 15 min.
    </div>
  );
}


