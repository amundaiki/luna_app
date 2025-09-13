"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateLead, useCampaigns, type CreateLeadData } from "@/src/hooks/use-leads";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { toast } from "sonner";

export function AddLeadForm() {
  const router = useRouter();
  const createLead = useCreateLead();
  const { data: campaignsData } = useCampaigns();
  const campaigns = campaignsData?.pages?.[0] ?? [];

  const [formData, setFormData] = useState<CreateLeadData>({
    campaign_id: '',
    full_name: '',
    phone: '',
    email: '',
    postal_code: '',
    address: '',
    city: '',
    service: '',
    message: '',
    budget_range: '',
    preferred_contact_time: '',
    gdpr_consent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Navn er påkrevd';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefonnummer er påkrevd';
    } else if (!/^[\+]?[0-9\s\-\(\)]{8,}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Ugyldig telefonnummer';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-post er påkrevd';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Ugyldig e-postadresse';
    }

    if (!formData.postal_code.trim()) {
      newErrors.postal_code = 'Postnummer er påkrevd';
    } else if (!/^\d{4}$/.test(formData.postal_code.trim())) {
      newErrors.postal_code = 'Postnummer må være 4 siffer';
    }

    if (!formData.service.trim()) {
      newErrors.service = 'Tjeneste er påkrevd';
    }

    if (!formData.gdpr_consent) {
      newErrors.gdpr_consent = 'Du må godta GDPR-samtykke';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Rett opp feilene i skjemaet");
      return;
    }

    try {
      await createLead.mutateAsync(formData);
      router.push('/leads');
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const handleInputChange = (field: keyof CreateLeadData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Legg til nytt lead</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kampanje */}
          <div>
            <label htmlFor="campaign" className="block text-sm font-medium mb-1">
              Kampanje (valgfritt)
            </label>
            <select
              id="campaign"
              value={formData.campaign_id}
              onChange={(e) => handleInputChange('campaign_id', e.target.value)}
              className="w-full border border-black/10 rounded px-3 py-2 bg-background"
            >
              <option value="">Ingen kampanje</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>

          {/* Kontaktinformasjon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium mb-1">
                Fullt navn *
              </label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className={errors.full_name ? 'border-red-500' : ''}
                placeholder="Skriv inn navn"
              />
              {errors.full_name && (
                <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                Telefonnummer *
              </label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={errors.phone ? 'border-red-500' : ''}
                placeholder="+47 123 45 678"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              E-post *
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'border-red-500' : ''}
              placeholder="eksempel@epost.no"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Adresseinformasjon */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="postal_code" className="block text-sm font-medium mb-1">
                Postnummer *
              </label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
                className={errors.postal_code ? 'border-red-500' : ''}
                placeholder="0123"
                maxLength={4}
              />
              {errors.postal_code && (
                <p className="text-red-500 text-xs mt-1">{errors.postal_code}</p>
              )}
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium mb-1">
                By
              </label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Oslo"
              />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="address" className="block text-sm font-medium mb-1">
                Adresse
              </label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Gateadresse 123"
              />
            </div>
          </div>

          {/* Tjeneste og detaljer */}
          <div>
            <label htmlFor="service" className="block text-sm font-medium mb-1">
              Tjeneste *
            </label>
            <select
              id="service"
              value={formData.service}
              onChange={(e) => handleInputChange('service', e.target.value)}
              className={`w-full border border-black/10 rounded px-3 py-2 bg-background ${
                errors.service ? 'border-red-500' : ''
              }`}
            >
              <option value="">Velg tjeneste</option>
              <option value="Solceller">Solceller</option>
              <option value="Varmepumpe">Varmepumpe</option>
              <option value="Batteripakke">Batteripakke</option>
              <option value="Service">Service</option>
              <option value="Annet">Annet</option>
            </select>
            {errors.service && (
              <p className="text-red-500 text-xs mt-1">{errors.service}</p>
            )}
          </div>

          <div>
            <label htmlFor="budget_range" className="block text-sm font-medium mb-1">
              Budsjett
            </label>
            <select
              id="budget_range"
              value={formData.budget_range}
              onChange={(e) => handleInputChange('budget_range', e.target.value)}
              className="w-full border border-black/10 rounded px-3 py-2 bg-background"
            >
              <option value="">Ikke oppgitt</option>
              <option value="Under 100.000">Under 100.000 kr</option>
              <option value="100.000-200.000">100.000 - 200.000 kr</option>
              <option value="200.000-300.000">200.000 - 300.000 kr</option>
              <option value="Over 300.000">Over 300.000 kr</option>
            </select>
          </div>

          <div>
            <label htmlFor="preferred_contact_time" className="block text-sm font-medium mb-1">
              Foretrukket kontakttid
            </label>
            <select
              id="preferred_contact_time"
              value={formData.preferred_contact_time}
              onChange={(e) => handleInputChange('preferred_contact_time', e.target.value)}
              className="w-full border border-black/10 rounded px-3 py-2 bg-background"
            >
              <option value="">Ikke oppgitt</option>
              <option value="Morgen (08-12)">Morgen (08-12)</option>
              <option value="Ettermiddag (12-16)">Ettermiddag (12-16)</option>
              <option value="Kveld (16-20)">Kveld (16-20)</option>
              <option value="Helg">Helg</option>
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">
              Melding
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              className="w-full border border-black/10 rounded px-3 py-2 bg-background min-h-[100px]"
              placeholder="Tilleggsinformasjon eller kommentarer..."
            />
          </div>

          {/* GDPR samtykke */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="gdpr_consent"
              checked={formData.gdpr_consent}
              onChange={(e) => handleInputChange('gdpr_consent', e.target.checked)}
              className={`mt-0.5 ${errors.gdpr_consent ? 'border-red-500' : ''}`}
            />
            <label htmlFor="gdpr_consent" className="text-sm">
              Jeg samtykker til at mine personopplysninger lagres og behandles i henhold til GDPR-regelverket. *
            </label>
          </div>
          {errors.gdpr_consent && (
            <p className="text-red-500 text-xs">{errors.gdpr_consent}</p>
          )}

          {/* Handlingsknapper */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/leads')}
              disabled={createLead.isPending}
            >
              Avbryt
            </Button>
            <Button 
              type="submit" 
              disabled={createLead.isPending}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"
            >
              {createLead.isPending ? 'Oppretter...' : 'Opprett lead'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
