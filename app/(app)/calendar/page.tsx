"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { useAppointments } from "@/src/hooks/use-leads";
import { format, isSameDay, isAfter } from "date-fns";
import { nb } from "date-fns/locale";

export default function CalendarPage() {
  const [filter, setFilter] = useState<"today" | "upcoming">("upcoming");
  const { data, isLoading, error } = useAppointments("");
  const appointments = data?.pages?.[0] || [];

  const filtered = useMemo(() => {
    const now = new Date();
    if (filter === "today") {
      return appointments.filter((a: any) => isSameDay(new Date(a.start_time), now));
    }
    return appointments.filter((a: any) => isAfter(new Date(a.start_time), now));
  }, [appointments, filter]);

  return (
    <div className="py-4 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="heading text-xl">Kalender</h1>
        <select
          className="text-xs border border-black/10 rounded px-2 py-1 bg-background"
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
        >
          <option value="upcoming">Kommende</option>
          <option value="today">I dag</option>
        </select>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {isLoading && (
          <Card><CardContent className="pt-6">Laster...</CardContent></Card>
        )}
        {error && (
          <Card><CardContent className="pt-6">Kunne ikke laste kalender</CardContent></Card>
        )}
        {!isLoading && !error && filtered.length === 0 && (
          <Card><CardContent className="pt-6 text-sm text-foreground/60">Ingen treff</CardContent></Card>
        )}
        {filtered.map((a: any) => (
          <Card key={a.id}>
            <CardHeader>
              <CardTitle>{a.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-foreground/70">
                {format(new Date(a.start_time), "EEEE d. MMMM yyyy HH:mm", { locale: nb })}
                {" – "}
                {format(new Date(a.end_time), "HH:mm", { locale: nb })}
              </div>
              {a.location && (
                <div className="text-xs text-foreground/60">{a.location}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


