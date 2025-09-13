"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateCampaign, type CreateCampaignData } from "@/src/hooks/use-leads";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { toast } from "sonner";

export function AddCampaignForm() {
  const router = useRouter();
  const createCampaign = useCreateCampaign();

  const [formData, setFormData] = useState<CreateCampaignData>({
    name: '',
    budget_total: undefined,
    budget_daily: undefined,
    start_date: '',
    end_date: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Kampanjenavn er påkrevd';
    }

    if (formData.budget_total && formData.budget_total <= 0) {
      newErrors.budget_total = 'Totalbudsjett må være større enn 0';
    }

    if (formData.budget_daily && formData.budget_daily <= 0) {
      newErrors.budget_daily = 'Daglig budsjett må være større enn 0';
    }

    if (formData.budget_total && formData.budget_daily && 
        formData.budget_daily > formData.budget_total) {
      newErrors.budget_daily = 'Daglig budsjett kan ikke være høyere enn totalbudsjettet';
    }

    if (formData.start_date && formData.end_date && 
        new Date(formData.start_date) >= new Date(formData.end_date)) {
      newErrors.end_date = 'Sluttdato må være etter startdato';
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
      await createCampaign.mutateAsync(formData);
      router.push('/campaigns');
    } catch {
      // Error is handled in the mutation
    }
  };

  const handleInputChange = (field: keyof CreateCampaignData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Opprett ny kampanje</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kampanjenavn */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Kampanjenavn *
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
              placeholder="F.eks. Vinter Solceller 2024"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Budsjett */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="budget_total" className="block text-sm font-medium mb-1">
                Totalbudsjett (kr)
              </label>
              <Input
                id="budget_total"
                type="number"
                step="100"
                min="0"
                value={formData.budget_total || ''}
                onChange={(e) => handleInputChange('budget_total', e.target.value ? Number(e.target.value) : undefined)}
                className={errors.budget_total ? 'border-red-500' : ''}
                placeholder="25000"
              />
              {errors.budget_total && (
                <p className="text-red-500 text-xs mt-1">{errors.budget_total}</p>
              )}
            </div>

            <div>
              <label htmlFor="budget_daily" className="block text-sm font-medium mb-1">
                Daglig budsjett (kr)
              </label>
              <Input
                id="budget_daily"
                type="number"
                step="10"
                min="0"
                value={formData.budget_daily || ''}
                onChange={(e) => handleInputChange('budget_daily', e.target.value ? Number(e.target.value) : undefined)}
                className={errors.budget_daily ? 'border-red-500' : ''}
                placeholder="500"
              />
              {errors.budget_daily && (
                <p className="text-red-500 text-xs mt-1">{errors.budget_daily}</p>
              )}
            </div>
          </div>

          {/* Datoer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium mb-1">
                Startdato
              </label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className={errors.start_date ? 'border-red-500' : ''}
              />
              {errors.start_date && (
                <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label htmlFor="end_date" className="block text-sm font-medium mb-1">
                Sluttdato
              </label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className={errors.end_date ? 'border-red-500' : ''}
              />
              {errors.end_date && (
                <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Handlingsknapper */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/campaigns')}
              disabled={createCampaign.isPending}
            >
              Avbryt
            </Button>
            <Button 
              type="submit" 
              disabled={createCampaign.isPending}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"
            >
              {createCampaign.isPending ? 'Oppretter...' : 'Opprett kampanje'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
