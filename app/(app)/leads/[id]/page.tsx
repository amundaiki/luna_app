"use client";

import { useMemo, useState } from "react";
import { useLeads, useUpdateLeadStatus, useAddLeadAttempt, useCreateAppointment } from "@/src/hooks/use-leads";
import type { LeadStatus } from "@/src/types/core";
import { useRole } from "@/src/providers/role-provider";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Modal } from "@/src/components/ui/modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { LoadingSpinner } from "@/src/components/ui/skeleton";
import { createAppointmentIcs, downloadIcs } from "@/src/utils/ics";
import { ContactHistory } from "@/src/components/features/leads/contact-history";
import { EditLeadForm } from "@/src/components/forms/edit-lead-form";
import { AppointmentsList } from "@/src/components/features/leads/appointments-list";
import { toast } from "sonner";

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
  const createAppointment = useCreateAppointment();
  // const appointmentsQuery = useAppointments(params.id);
  const lead = useMemo(() => {
    const all = data?.pages?.flatMap((p) => p.data) ?? [];
    return all.find((l) => l.id === params.id);
  }, [data?.pages, params.id]);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");

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
    if (!lead || !appointmentDate || !appointmentTime) {
      toast.error("Velg dato og tid for befaringen");
      return;
    }

    const start = new Date(`${appointmentDate}T${appointmentTime}`);
    const end = new Date(start.getTime() + 45 * 60 * 1000); // 45 minutes
    const icsUid = `lead-${lead.id}-${Date.now()}`;

    // Save to database
    createAppointment.mutate({
      lead_id: lead.id,
      title: `Befaring: ${lead.full_name}`,
      description: `Lead: ${lead.full_name} / ${lead.phone} / ${lead.email}`,
      start_time: start,
      end_time: end,
      location: `${lead.postal_code} ${lead.city || ''}`.trim(),
      ics_uid: icsUid,
    });

    // Generate and download ICS file
    const ics = createAppointmentIcs({
      uid: icsUid,
      title: `Befaring: ${lead.full_name}`,
      description: `Lead: ${lead.full_name} / ${lead.phone} / ${lead.email}`,
      location: `${lead.postal_code} ${lead.city || ''}`.trim(),
      start,
      end,
    });
    downloadIcs(`befaring-${lead.id}.ics`, ics);

    // Update lead status to scheduled
    updateLeadStatus.mutate({ leadId: lead.id, status: 'scheduled' });

    // Close modal and reset form
    setOpen(false);
    setAppointmentDate("");
    setAppointmentTime("");
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

  if (isEditing) {
    return (
      <div className="py-4 animate-fade-in">
        <EditLeadForm 
          lead={lead} 
          onCancel={() => setIsEditing(false)} 
        />
      </div>
    );
  }

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
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsEditing(true)}
          className="text-xs hover:bg-gray-50"
        >
          Rediger
        </Button>
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
              className="mobile-friendly-touch bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
            >
              {addLeadAttempt.isPending ? <LoadingSpinner size="sm" /> : "Ring"}
            </Button>
            <Button 
              onClick={() => handleContactAction('sms')}
              disabled={addLeadAttempt.isPending}
              className="mobile-friendly-touch bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
            >
              {addLeadAttempt.isPending ? <LoadingSpinner size="sm" /> : "SMS"}
            </Button>
            <Button 
              onClick={() => handleContactAction('email')}
              disabled={addLeadAttempt.isPending}
              className="mobile-friendly-touch bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
            >
              {addLeadAttempt.isPending ? <LoadingSpinner size="sm" /> : "E-post"}
            </Button>
            <Button 
              onClick={() => handleContactAction('whatsapp')}
              disabled={addLeadAttempt.isPending}
              className="mobile-friendly-touch bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
            >
              {addLeadAttempt.isPending ? <LoadingSpinner size="sm" /> : "WhatsApp"}
            </Button>
          </div>
          <div className="mt-3">
            <Button 
              onClick={() => setOpen(true)}
              className="w-full md:w-auto mobile-friendly-touch bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium shadow-sm"
            >
              Planlegg befaring →
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

      <AppointmentsList leadId={lead.id} />
      
      <ContactHistory leadId={lead.id} />

      <Modal open={open} onOpenChange={setOpen}>
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Book befaring</h2>
          <p className="text-sm text-foreground/70">Velg dato og tid for befaringen. Dette vil lagres i systemet og generere en ICS-fil for kalenderen din.</p>
          
          <div className="grid gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Dato</label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Tid</label>
              <input
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            
            <div className="text-xs text-foreground/60 bg-blue-50 p-2 rounded">
              <strong>Lokasjon:</strong> {lead.postal_code} {lead.city || ''}<br/>
              <strong>Varighet:</strong> 45 minutter
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>Avbryt</Button>
            <Button 
              onClick={handleBook}
              disabled={!appointmentDate || !appointmentTime || createAppointment.isPending}
            >
              {createAppointment.isPending ? "Booker..." : "Book befaring"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


