"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";

export default function SettingsPage() {
  const [orgName, setOrgName] = useState("");
  const [slaMinutes, setSlaMinutes] = useState(15);

  useEffect(() => {
    try {
      const n = window.localStorage.getItem("lp_orgName");
      const s = window.localStorage.getItem("lp_slaMinutes");
      if (n) setOrgName(n);
      if (s) setSlaMinutes(parseInt(s));
    } catch {}
  }, []);

  function save() {
    try {
      window.localStorage.setItem("lp_orgName", orgName);
      window.localStorage.setItem("lp_slaMinutes", String(slaMinutes));
    } catch {}
  }

  return (
    <div className="py-4 space-y-3">
      <h1 className="heading text-xl">Innstillinger</h1>
      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Organisasjon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label className="text-sm text-foreground/70">Navn</label>
              <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Luna Demo AS" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Varslingsregler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label className="text-sm text-foreground/70">SLA (minutter til første kontakt)</label>
              <Input type="number" value={slaMinutes} onChange={(e) => setSlaMinutes(parseInt(e.target.value || "0"))} />
              <div className="pt-2">
                <Button onClick={save}>Lagre</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


