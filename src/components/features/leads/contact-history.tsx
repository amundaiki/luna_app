"use client";

import { useContactAttempts, type ContactAttempt } from "@/src/hooks/use-leads";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

interface ContactHistoryProps {
  leadId: string;
}

export function ContactHistory({ leadId }: ContactHistoryProps) {
  const { data, isLoading, error } = useContactAttempts(leadId);
  const attempts = data?.pages?.[0] ?? [];

  const getTypeIcon = (type: ContactAttempt['type']) => {
    switch (type) {
      case 'call': return '📞';
      case 'sms': return '💬';
      case 'email': return '📧';
      case 'whatsapp': return '📱';
      default: return '📝';
    }
  };

  const getTypeLabel = (type: ContactAttempt['type']) => {
    switch (type) {
      case 'call': return 'Oppringt';
      case 'sms': return 'SMS sendt';
      case 'email': return 'E-post sendt';
      case 'whatsapp': return 'WhatsApp';
      default: return type;
    }
  };

  const getOutcomeVariant = (outcome: string) => {
    switch (outcome.toLowerCase()) {
      case 'answered':
      case 'delivered':
      case 'completed':
        return 'success';
      case 'no_answer':
      case 'busy':
      case 'failed':
        return 'error';
      case 'voicemail':
      case 'sent':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getOutcomeLabel = (outcome: string) => {
    switch (outcome.toLowerCase()) {
      case 'answered': return 'Svarte';
      case 'no_answer': return 'Ingen svar';
      case 'busy': return 'Opptatt';
      case 'voicemail': return 'Telefonsvarer';
      case 'delivered': return 'Levert';
      case 'sent': return 'Sendt';
      case 'failed': return 'Feilet';
      case 'completed': return 'Fullført';
      default: return outcome;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Kontakthistorikk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Kontakthistorikk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-500">
            Feil ved henting av kontakthistorikk
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Kontakthistorikk</CardTitle>
          <Badge variant="secondary" size="sm">
            {attempts.length} forsøk
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {attempts.length === 0 ? (
          <div className="text-sm text-foreground/60 text-center py-4">
            Ingen kontaktforsøk ennå
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-black/10 bg-white/50"
              >
                <div className="text-lg">{getTypeIcon(attempt.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {getTypeLabel(attempt.type)}
                    </span>
                    <Badge variant={getOutcomeVariant(attempt.outcome)} size="sm">
                      {getOutcomeLabel(attempt.outcome)}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-foreground/60 mb-1">
                    {new Date(attempt.created_at).toLocaleString('no-NO')}
                    {attempt.user?.name && (
                      <span> • av {attempt.user.name}</span>
                    )}
                    {attempt.duration_seconds && (
                      <span> • {Math.round(attempt.duration_seconds / 60)} min</span>
                    )}
                  </div>

                  {attempt.notes && (
                    <div className="text-sm text-foreground/80 mt-2">
                      {attempt.notes}
                    </div>
                  )}

                  {attempt.follow_up_required && (
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs text-orange-600">
                        🔔 Oppfølging nødvendig
                      </span>
                      {attempt.follow_up_date && (
                        <span className="text-xs text-foreground/60">
                          innen {new Date(attempt.follow_up_date).toLocaleDateString('no-NO')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
