"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

export default function CalendarPage() {
  const events = useMemo(() => ([
    { title: "Befaring – Testperson 1", time: "I dag 14:00–14:45", location: "0181 Oslo" },
    { title: "Befaring – Testperson 2", time: "I morgen 10:00–10:45", location: "1358 Jar" },
  ]), []);

  return (
    <div className="py-4 space-y-3">
      <h1 className="heading text-xl">Kalender</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {events.map((ev, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>{ev.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-foreground/70">{ev.time}</div>
              <div className="text-xs text-foreground/60">{ev.location}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


