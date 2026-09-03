"use client";

import { createContext, useContext, useState } from "react";
import { AdminSidebarMobile } from "@/components/admin/AdminSidebar";

const MobileSidebarContext = createContext<{ open: () => void } | null>(null);

export function MobileSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MobileSidebarContext.Provider value={{ open: () => setIsOpen(true) }}>
      {children}
      <AdminSidebarMobile open={isOpen} onClose={() => setIsOpen(false)} />
    </MobileSidebarContext.Provider>
  );
}

export function useMobileSidebar() {
  const ctx = useContext(MobileSidebarContext);
  if (!ctx) throw new Error("useMobileSidebar must be used within MobileSidebarProvider");
  return ctx;
}
