"use client";

import React, { ErrorInfo, ReactNode } from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="text-[var(--color-error)]">
                🚫 Noe gikk galt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-foreground/70">
                  Det oppstod en uventet feil i applikasjonen. Vi beklager ulempen.
                </p>
                {process.env.NODE_ENV === "development" && this.state.error && (
                  <details className="text-xs bg-[var(--color-error-light)] p-3 rounded border border-[var(--color-error)]/20">
                    <summary className="cursor-pointer font-medium text-[var(--color-error)]">
                      Tekniske detaljer (kun i development)
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap text-[var(--color-error)]">
                      {this.state.error.message}
                      {"\n"}
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => this.setState({ hasError: false, error: undefined })}
                    size="sm"
                  >
                    Prøv igjen
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                    size="sm"
                  >
                    Last siden på nytt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export function AsyncErrorBoundary({ children, fallback }: Props) {
  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}

// Simple error fallback components
export function ErrorFallback({ 
  error, 
  resetError, 
  title = "Noe gikk galt" 
}: { 
  error?: Error; 
  resetError?: () => void;
  title?: string;
}) {
  return (
    <div className="p-4 text-center animate-fade-in">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="text-2xl">😵</div>
            <h3 className="font-medium text-[var(--color-error)]">{title}</h3>
            <p className="text-sm text-foreground/70">
              {error?.message || "En uventet feil oppstod. Prøv igjen senere."}
            </p>
            {resetError && (
              <Button onClick={resetError} size="sm">
                Prøv igjen
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function NetworkErrorFallback({ 
  onRetry,
  title = "Nettverksfeil" 
}: { 
  onRetry?: () => void;
  title?: string;
}) {
  return (
    <div className="p-4 text-center animate-fade-in">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="text-2xl">📡</div>
            <h3 className="font-medium text-[var(--color-warning)]">{title}</h3>
            <p className="text-sm text-foreground/70">
              Kunne ikke koble til serveren. Sjekk internettforbindelsen din.
            </p>
            {onRetry && (
              <Button onClick={onRetry} size="sm">
                Prøv igjen
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function EmptyStateFallback({ 
  title = "Ingen data",
  description = "Det er ingen data å vise akkurat nå.",
  action,
  icon = "📭"
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  icon?: string;
}) {
  return (
    <div className="p-8 text-center animate-fade-in">
      <div className="space-y-3">
        <div className="text-4xl">{icon}</div>
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="text-sm text-foreground/70 max-w-md mx-auto">
          {description}
        </p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
