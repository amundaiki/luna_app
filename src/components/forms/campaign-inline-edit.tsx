"use client";

import { useState } from "react";
import { useUpdateCampaign, type UpdateCampaignData, type Campaign } from "@/src/hooks/use-leads";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";

interface CampaignInlineEditProps {
  campaign: Campaign;
  onCancel: () => void;
}

export function CampaignInlineEdit({ campaign, onCancel }: CampaignInlineEditProps) {
  const updateCampaign = useUpdateCampaign();

  const [formData, setFormData] = useState<UpdateCampaignData>({
    name: campaign.name,
    budget_total: campaign.budget_total,
    budget_daily: campaign.budget_daily,
    start_date: campaign.start_date,
    end_date: campaign.end_date,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
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
      await updateCampaign.mutateAsync({ campaignId: campaign.id, campaignData: formData });
      onCancel();
    } catch {
      // Error is handled in the mutation
    }
  };

  const handleInputChange = (field: keyof UpdateCampaignData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-medium text-sm">Rediger kampanje</h3>
      
      {/* Kampanjenavn */}
      <div>
        <Input
          value={formData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`text-sm ${errors.name ? 'border-red-500' : ''}`}
          placeholder="Kampanjenavn"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      {/* Budsjett */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Input
            type="number"
            step="100"
            min="0"
            value={formData.budget_total || ''}
            onChange={(e) => handleInputChange('budget_total', e.target.value ? Number(e.target.value) : undefined)}
            className={`text-sm ${errors.budget_total ? 'border-red-500' : ''}`}
            placeholder="Totalbudsjett"
          />
          {errors.budget_total && (
            <p className="text-red-500 text-xs mt-1">{errors.budget_total}</p>
          )}
        </div>

        <div>
          <Input
            type="number"
            step="10"
            min="0"
            value={formData.budget_daily || ''}
            onChange={(e) => handleInputChange('budget_daily', e.target.value ? Number(e.target.value) : undefined)}
            className={`text-sm ${errors.budget_daily ? 'border-red-500' : ''}`}
            placeholder="Daglig budsjett"
          />
          {errors.budget_daily && (
            <p className="text-red-500 text-xs mt-1">{errors.budget_daily}</p>
          )}
        </div>
      </div>

      {/* Datoer */}
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="date"
          value={formData.start_date || ''}
          onChange={(e) => handleInputChange('start_date', e.target.value)}
          className={`text-sm ${errors.start_date ? 'border-red-500' : ''}`}
        />
        <Input
          type="date"
          value={formData.end_date || ''}
          onChange={(e) => handleInputChange('end_date', e.target.value)}
          className={`text-sm ${errors.end_date ? 'border-red-500' : ''}`}
        />
      </div>
      {errors.end_date && (
        <p className="text-red-500 text-xs">{errors.end_date}</p>
      )}

      {/* Handlingsknapper */}
      <div className="flex gap-2 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={onCancel}
          disabled={updateCampaign.isPending}
          className="text-xs"
        >
          Avbryt
        </Button>
        <Button 
          type="submit" 
          size="sm"
          disabled={updateCampaign.isPending}
          className="text-xs bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"
        >
          {updateCampaign.isPending ? 'Lagrer...' : 'Lagre'}
        </Button>
      </div>
    </form>
  );
}
