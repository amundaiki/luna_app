"use client";

import { useMemo, useState } from "react";
import { useLeads, useUpdateLeadStatus, useAddLeadAttempt } from "@/src/hooks/use-leads";
import type { Lead, LeadStatus } from "@/src/types/core";
import { useRole } from "@/src/providers/role-provider";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Modal } from "@/src/components/ui/modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { LoadingSpinner } from "@/src/components/ui/skeleton";
import { createAppointmentIcs, downloadIcs } from "@/src/utils/ics";
import { ContactHistory } from "@/src/components/features/leads/contact-history";

const statusOptions = [
  { value: "new", label: "Ny", variant: "secondary" },
  { value: "contacted", label: "Kontaktet", variant: "default" },
  { value: "no_answer", label: "Ingen svar", variant: "warning" },
  { value: "scheduled", label: "Booket", variant: "success" },
  { value: "won", label: "Vunnet", variant: "success" },
  { value: "lost", label: "Tapt", variant: "error" },
] as const;

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const { data } = useLeads();
  const { role } = useRole();
  const updateLeadStatus = useUpdateLeadStatus();
  const addLeadAttempt = useAddLeadAttempt();
  const all = data?.pages?.flatMap((p) => p.data) ?? [];
  const lead = useMemo(() => all.find((l) => l.id === params.id), [all, params.id]);
  const [open, setOpen] = useState(false);

  if (!lead) {
    return (
      <div className="py-4 animate-fade-in">
        <div className="text-center text-foreground/60">
          <h1 className="text-xl mb-2">Lead ikke funnet</h1>
          <p>Dette leadet eksisterer ikke eller er blitt slettet.</p>
        </div>
      </div>
    );
  }

  function handleBook() {
    if (!lead) return;
    const start = new Date(Date.now() + 60 * 60 * 1000);
    const end = new Date(start.getTime() + 45 * 60 * 1000);
    const ics = createAppointmentIcs({
      uid: `lead-${lead.id}-${Date.now()}`,
      title: `Befaring: ${lead.full_name}`,
      description: `Lead: ${lead.full_name} / ${lead.phone} / ${lead.email}`,
      location: lead.postal_code,
      start,
      end,
    });
    downloadIcs(`befaring-${lead.id}.ics`, ics);
  }

  function handleContactAction(type: 'call' | 'sms' | 'email' | 'whatsapp') {
    if (!lead) return;
    const actions = {
      call: () => window.location.href = `tel:${lead.phone}`,
      sms: () => window.location.href = `sms:${lead.phone}`,
      email: () => window.location.href = `mailto:${lead.email}`,
      whatsapp: () => window.open(`https://wa.me/${lead.phone.replace(/\D/g, "")}`, "_blank")
    };
    
    actions[type]();
    addLeadAttempt.mutate({ leadId: lead.id, type });
  }

  const currentStatus = statusOptions.find(s => s.value === lead.status);

  return (
    <div className="py-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="heading-md mb-1">{lead.full_name}</h1>
          <div className="flex items-center gap-2">
            <Badge variant={currentStatus?.variant || "outline"}>
              {currentStatus?.label || lead.status}
            </Badge>
            <div className="relative">
              <select
                className="text-sm border border-black/10 rounded px-3 py-1 bg-background disabled:opacity-50"
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
              {updateLeadStatus.isPending && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kontaktinformasjon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Telefon:</span> {lead.phone}
            </div>
            <div className="text-sm">
              <span className="font-medium">E-post:</span> {lead.email}
            </div>
            <div className="text-sm">
              <span className="font-medium">Tjeneste:</span> {lead.service}
            </div>
            <div className="text-sm">
              <span className="font-medium">Postnummer:</span> {lead.postal_code}
            </div>
            {lead.message && (
              <div className="text-sm">
                <span className="font-medium">Melding:</span>
                <p className="mt-1 p-2 bg-[var(--color-neutral-light)] rounded text-foreground/80">
                  {lead.message}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kontaktmuligheter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              onClick={() => handleContactAction('call')}
              disabled={addLeadAttempt.isPending}
              className="mobile-friendly-touch"
            >
              {addLeadAttempt.isPending ? <LoadingSpinner size="sm" /> : "📞"} Ring
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleContactAction('sms')}
              disabled={addLeadAttempt.isPending}
              className="mobile-friendly-touch"
            >
              {addLeadAttempt.isPending ? <LoadingSpinner size="sm" /> : "💬"} SMS
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleContactAction('email')}
              disabled={addLeadAttempt.isPending}
              className="mobile-friendly-touch"
            >
              {addLeadAttempt.isPending ? <LoadingSpinner size="sm" /> : "✉️"} E-post
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleContactAction('whatsapp')}
              disabled={addLeadAttempt.isPending}
              className="mobile-friendly-touch"
            >
              {addLeadAttempt.isPending ? <LoadingSpinner size="sm" /> : "💚"} WhatsApp
            </Button>
          </div>
          <div className="mt-3">
            <Button 
              variant="secondary" 
              onClick={() => setOpen(true)}
              className="w-full md:w-auto mobile-friendly-touch"
            >
              📅 Book befaring
            </Button>
          </div>
        </CardContent>
      </Card>

      {lead.attempts && lead.attempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Kontakthistorikk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lead.attempts.map((attempt, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-[var(--color-neutral-light)] rounded text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {attempt.type === 'call' && '📞 Ring'}
                      {attempt.type === 'sms' && '💬 SMS'}
                      {attempt.type === 'email' && '✉️ E-post'}
                      {attempt.type === 'whatsapp' && '💚 WhatsApp'}
                    </span>
                    {attempt.notes && <span className="text-foreground/70">– {attempt.notes}</span>}
                  </div>
                  <span className="text-xs text-foreground/60">
                    {new Date(attempt.timestamp).toLocaleString('no-NO')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>GDPR og personvern</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Samtykke:</span> {lead.gdpr_consent ? "✅ Ja" : "❌ Nei"}
            </div>
            <div className="text-sm">
              <span className="font-medium">Samtykkeversjon:</span> {lead.consent_version}
            </div>
            <div className="text-sm">
              <span className="font-medium">Samtykke gitt:</span> {new Date(lead.consent_timestamp).toLocaleString('no-NO')}
            </div>
            {lead.last_contact_at && (
              <div className="text-sm">
                <span className="font-medium">Sist kontaktet:</span> {new Date(lead.last_contact_at).toLocaleString('no-NO')}
              </div>
            )}
          </div>
          {role !== "agent" && (
            <div className="mt-3 pt-3 border-t border-black/10">
              <h4 className="font-medium text-sm mb-2">Audit log (kun for managers+)</h4>
              <ul className="text-xs text-foreground/60 space-y-1">
                <li className="flex justify-between">
                  <span>Lead opprettet</span>
                  <span>{new Date(lead.created_at).toLocaleString('no-NO')}</span>
                </li>
                <li className="flex justify-between">
                  <span>Sist oppdatert</span>
                  <span>{new Date(lead.updated_at).toLocaleString('no-NO')}</span>
                </li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <ContactHistory leadId={lead.id} />

      <Modal open={open} onOpenChange={setOpen}>
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Book befaring</h2>
          <p className="text-sm text-foreground/70">Demo: generer ICS for kalenderen din.</p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>Avbryt</Button>
            <Button onClick={handleBook}>Generer ICS</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


