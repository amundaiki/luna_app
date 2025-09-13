"use client";

import * as React from "react";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Modal({ open, onOpenChange, children }: ModalProps) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-lg rounded-lg bg-white p-4 shadow"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}


