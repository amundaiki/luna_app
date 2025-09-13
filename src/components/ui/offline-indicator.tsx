"use client";

import { useEffect, useState } from "react";
import { Badge } from "./badge";
import { toast } from "sonner";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Tilkoblet til internett", {
        description: "Data vil nå synkroniseres automatisk",
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Ingen internettforbindelse", {
        description: "Appen fungerer i offline-modus",
        duration: 5000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-up">
      <Badge variant="warning" className="shadow-lg">
        📡 Offline
      </Badge>
    </div>
  );
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

// PWA Install prompt
export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install button
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      toast.success("Luna er nå installert!", {
        description: "Du kan nå bruke appen som en native app",
      });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      toast.success("Takk! Luna installeres nå...");
    } else {
      toast.info("Du kan installere Luna senere fra nettlesermenyen");
    }
    
    // Clear the prompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-slide-up">
      <div className="bg-[var(--color-primary)] text-white p-4 rounded-lg shadow-lg">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📱</div>
          <div className="flex-1">
            <h3 className="font-medium text-sm mb-1">Installer Luna</h3>
            <p className="text-xs opacity-90 mb-3">
              Få en bedre opplevelse med vår native app
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="bg-white text-[var(--color-primary)] px-3 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
              >
                Installer
              </button>
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="text-white/80 hover:text-white px-3 py-1 text-xs transition-colors"
              >
                Senere
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
