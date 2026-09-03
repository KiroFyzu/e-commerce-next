"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/admin/ToastProvider";

export function FlashToast() {
  const { showToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const shown = useRef(false);

  useEffect(() => {
    const flash = searchParams.get("flash");
    if (!flash || shown.current) return;
    shown.current = true;
    showToast(flash, searchParams.get("flashType") === "error" ? "error" : "success");

    const params = new URLSearchParams(searchParams.toString());
    params.delete("flash");
    params.delete("flashType");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
