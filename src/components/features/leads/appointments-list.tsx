"use client";

import { useAppointments } from "@/src/hooks/use-leads";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { LoadingSpinner } from "@/src/components/ui/skeleton";
import { formatDistanceToNow, format } from "date-fns";
import { nb } from "date-fns/locale";

interface AppointmentsListProps {
  leadId: string;
}

export function AppointmentsList({ leadId }: AppointmentsListProps) {
  const { data, isLoading, error } = useAppointments(leadId);
  const appointments = data?.pages?.[0] || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bookede befaringer</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bookede befaringer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">Kunne ikke laste befaringer</p>
        </CardContent>
      </Card>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bookede befaringer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground/60">Ingen befaringer booket ennå</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'no_show': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Planlagt';
      case 'completed': return 'Gjennomført';
      case 'cancelled': return 'Avlyst';
      case 'no_show': return 'Ikke møtt';
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookede befaringer ({appointments.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {appointments.map((appointment) => {
            const startTime = new Date(appointment.start_time);
            const isUpcoming = startTime > new Date();
            
            return (
              <div key={appointment.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{appointment.title}</h4>
                  <Badge variant={getStatusVariant(appointment.status)}>
                    {getStatusLabel(appointment.status)}
                  </Badge>
                </div>
                
                <div className="text-xs text-foreground/70 space-y-1">
                  <div>
                    <strong>📅 Dato:</strong> {format(startTime, "EEEE d. MMMM yyyy", { locale: nb })}
                  </div>
                  <div>
                    <strong>🕐 Tid:</strong> {format(startTime, "HH:mm", { locale: nb })} - {format(new Date(appointment.end_time), "HH:mm", { locale: nb })}
                  </div>
                  {appointment.location && (
                    <div>
                      <strong>📍 Lokasjon:</strong> {appointment.location}
                    </div>
                  )}
                  <div>
                    <strong>⏰ Status:</strong> {isUpcoming ? (
                      <span className="text-blue-600">
                        {formatDistanceToNow(startTime, { locale: nb, addSuffix: true })}
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        {formatDistanceToNow(startTime, { locale: nb, addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
                
                {appointment.description && (
                  <div className="text-xs text-foreground/60 bg-gray-50 p-2 rounded">
                    {appointment.description}
                  </div>
                )}
                
                {appointment.outcome && (
                  <div className="text-xs text-foreground/60 bg-green-50 p-2 rounded">
                    <strong>Resultat:</strong> {appointment.outcome}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
