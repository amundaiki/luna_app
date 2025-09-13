"use client";

import Link from "next/link";
import { useCampaigns, useUpdateCampaignStatus } from "@/src/hooks/use-leads";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { NetworkErrorFallback, EmptyStateFallback } from "@/src/components/ui/error-boundary";
import { CampaignInlineEdit } from "@/src/components/forms/campaign-inline-edit";

function format(n: number) { return new Intl.NumberFormat("no-NO").format(n); }

export default function CampaignsPage() {
  const { data, isLoading, error, refetch, isError } = useCampaigns();
  const updateCampaignStatus = useUpdateCampaignStatus();
  const campaigns = data?.pages?.[0] ?? [];
  const [editingCampaign, setEditingCampaign] = useState<string | null>(null);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'ended': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'paused': return 'Pauset';
      case 'ended': return 'Avsluttet';
      default: return status;
    }
  };

  return (
    <div className="py-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h1 className="heading text-xl">Kampanjer</h1>
        <Link href="/campaigns/add">
          <Button 
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white"
            size="sm"
          >
            + Ny kampanje
          </Button>
        </Link>
      </div>

      {isError && (
        <NetworkErrorFallback 
          onRetry={() => refetch()}
          title={error?.message?.includes("Nettverksfeil") ? "Nettverksfeil" : "Feil ved henting av kampanjer"}
        />
      )}

      {isLoading && !isError && (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !isError && campaigns.length === 0 && (
        <EmptyStateFallback 
          title="Ingen kampanjer ennå"
          description="Opprett din første kampanje for å begynne å motta leads."
          icon="📢"
        />
      )}

      {!isLoading && campaigns.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {campaigns.map((campaign) => {
            // For nå bruker vi mock data for metrics siden Meta-integrasjon ikke er implementert ennå
            const mockMetrics = {
              spend: Math.floor(Math.random() * 15000) + 5000,
              impressions: Math.floor(Math.random() * 200000) + 50000,
              clicks: Math.floor(Math.random() * 3000) + 500,
              leads: Math.floor(Math.random() * 80) + 20,
            };
            const cpl = mockMetrics.leads ? Math.round(mockMetrics.spend / mockMetrics.leads) : 0;

            return (
              <Card key={campaign.id} className="relative group">
                {editingCampaign === campaign.id ? (
                  <CardContent className="pt-6">
                    <CampaignInlineEdit 
                      campaign={campaign} 
                      onCancel={() => setEditingCampaign(null)} 
                    />
                  </CardContent>
                ) : (
                  <>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{campaign.name}</CardTitle>
                        <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCampaign(campaign.id)}
                        className="text-xs px-2 py-1 h-auto text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                      >
                        Rediger
                      </Button>
                          <Badge variant={getStatusVariant(campaign.status)} size="sm">
                            {getStatusLabel(campaign.status)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                  <div className="space-y-3">
                    {/* Budsjett info */}
                    {(campaign.budget_total || campaign.budget_daily) && (
                      <div className="text-sm text-foreground/70">
                        {campaign.budget_total && (
                          <div>Totalbudsjett: kr {format(campaign.budget_total)}</div>
                        )}
                        {campaign.budget_daily && (
                          <div>Daglig: kr {format(campaign.budget_daily)}</div>
                        )}
                      </div>
                    )}
                    
                    {/* Datoer */}
                    {(campaign.start_date || campaign.end_date) && (
                      <div className="text-xs text-foreground/60">
                        {campaign.start_date && (
                          <div>Start: {new Date(campaign.start_date).toLocaleDateString('no-NO')}</div>
                        )}
                        {campaign.end_date && (
                          <div>Slutt: {new Date(campaign.end_date).toLocaleDateString('no-NO')}</div>
                        )}
                      </div>
                    )}

                    {/* Mock metrics - vil bli erstattet med ekte data når Meta-integrasjon er klar */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-foreground/80 pt-2 border-t border-black/10">
                      <div>Spend</div><div>kr {format(mockMetrics.spend)}</div>
                      <div>Impressions</div><div>{format(mockMetrics.impressions)}</div>
                      <div>Clicks</div><div>{format(mockMetrics.clicks)}</div>
                      <div>Leads</div><div>{format(mockMetrics.leads)}</div>
                      <div>CPL</div><div>kr {format(cpl)}</div>
                    </div>

                    {/* Status kontroll */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-foreground/60">
                        Opprettet: {new Date(campaign.created_at).toLocaleDateString('no-NO')}
                      </div>
                      <select
                        className="text-xs border border-black/10 rounded px-2 py-1 bg-background"
                        value={campaign.status}
                        onChange={(e) => updateCampaignStatus.mutate({ 
                          campaignId: campaign.id, 
                          status: e.target.value 
                        })}
                        disabled={updateCampaignStatus.isPending}
                      >
                        <option value="active">Aktiv</option>
                        <option value="paused">Pauset</option>
                        <option value="ended">Avsluttet</option>
                      </select>
                    </div>
                  </div>
                    </CardContent>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}
      
      {!isLoading && campaigns.length > 0 && (
        <div className="text-xs text-foreground/60 text-center pt-4">
          💡 Metrics er demo-data. Ekte tall vil vises når Meta Insights er integrert.
        </div>
      )}
    </div>
  );
}


