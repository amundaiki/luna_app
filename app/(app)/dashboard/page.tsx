"use client";

import { useDashboardMetrics } from "@/src/hooks/use-leads";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { DashboardMetricSkeleton } from "@/src/components/ui/skeleton";
import { NetworkErrorFallback, EmptyStateFallback } from "@/src/components/ui/error-boundary";

function format(n: number) { return new Intl.NumberFormat("no-NO").format(n); }

export default function DashboardPage() {
  const { data, isLoading, error, refetch, isError } = useDashboardMetrics();
  const metrics = data?.pages?.[0];

  // Calculate trend for today vs yesterday (simplified)
  const calculateTrend = (current: number, baseline: number) => {
    if (baseline === 0) return "+0%";
    const change = ((current - baseline) / baseline) * 100;
    const sign = change >= 0 ? "+" : "";
    return `${sign}${Math.round(change)}%`;
  };

  return (
    <div className="py-4 space-y-4 animate-fade-in">
      <h1 className="heading-md">Dashboard</h1>
      
      {isError && (
        <NetworkErrorFallback 
          onRetry={() => refetch()}
          title={error?.message?.includes("Nettverksfeil") ? "Nettverksfeil" : "Feil ved henting av dashboard-data"}
        />
      )}
      
      {isLoading && !isError ? (
        <div className="grid gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <DashboardMetricSkeleton key={i} />
          ))}
        </div>
      ) : metrics ? (
        <>
          <div className="grid gap-3 md:grid-cols-4">
            <Metric 
              title="Nye leads (i dag)" 
              value={format(metrics.leadsToday)} 
              trend={calculateTrend(metrics.leadsToday, metrics.leadsThisWeek / 7)}
            />
            <Metric 
              title="Kontaktgrad" 
              value={`${Math.round(metrics.contactRate * 100)}%`} 
              trend={calculateTrend(metrics.contactRate, 0.65)} // baseline comparison
            />
            <Metric 
              title="Avtalegrad" 
              value={`${Math.round(metrics.appointmentRate * 100)}%`} 
              trend={calculateTrend(metrics.appointmentRate, 0.30)} // baseline comparison
            />
            <Metric 
              title="CPL (snitt)" 
              value={metrics.avgCPL > 0 ? `kr ${format(Math.round(metrics.avgCPL))}` : "kr 0"} 
              trend={calculateTrend(metrics.avgCPL, 200)} // baseline comparison
            />
          </div>
          
          <div className="grid gap-3 md:grid-cols-2">
            <Panel title="Leads siste 10 dager">
              <Sparkline data={metrics.leadsByDay.map(d => d.count)} />
              <div className="text-xs text-foreground/60 mt-2">
                Totalt denne uken: {metrics.leadsThisWeek} | Denne måneden: {metrics.leadsThisMonth}
              </div>
            </Panel>
            <Panel title="Kontaktgrad siste 10 dager">
              <Sparkline data={metrics.contactRateByDay.map(d => Math.round(d.rate * 100))} />
              <div className="text-xs text-foreground/60 mt-2">
                Vinnerate: {Math.round(metrics.winRate * 100)}% | Totalbudsjett: kr {format(metrics.totalSpend)}
              </div>
            </Panel>
          </div>
        </>
      ) : (
        <EmptyStateFallback 
          title="Ingen data ennå"
          description="Opprett noen kampanjer og leads for å se statistikk her."
          icon="📊"
        />
      )}
    </div>
  );
}

function Metric({ title, value, trend }: { title: string; value: string; trend?: string }) {
  const isPositive = trend && trend.startsWith('+');
  const isNegative = trend && trend.startsWith('-');
  
  return (
    <Card>
      <CardHeader>
        <div className="text-sm text-foreground/60">{title}</div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-semibold">{value}</div>
          {trend && (
            <div className={`text-xs font-medium ${
              isPositive ? 'text-[var(--color-success)]' :
              isNegative ? 'text-[var(--color-error)]' :
              'text-[var(--color-neutral)]'
            }`}>
              {trend}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-foreground/60">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const points = data.map((v, i) => `${(i/(data.length-1))*100},${100-(v/max)*100}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" className="w-full h-24">
      <polyline fill="none" stroke="var(--color-primary)" strokeWidth="2" points={points} />
    </svg>
  );
}

function EmptyHint({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="rounded-md border border-black/10 p-3 bg-white text-sm text-foreground/70">
      Ingen data ennå. Koble Meta Insights eller importer CSV for å se grafer her.
    </div>
  );
}


