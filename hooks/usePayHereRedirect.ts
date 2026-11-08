"use client";

import { useEffect, useState } from "react";
import type { PayHereForm } from "@/lib/shop/orderView";
import { submitPayHereForm } from "@/lib/shop/submitPayHereForm";

/**
 * Sends the browser to PayHere and keeps the button off until the page has
 * gone, so a second click in that moment can't place or start a second payment.
 */
export function usePayHereRedirect() {
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // The back button can restore this page exactly as it was left: mid-redirect.
    const onShow = (event: PageTransitionEvent) => {
      if (event.persisted) setRedirecting(false);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const redirect = (form: PayHereForm) => {
    setRedirecting(true);
    submitPayHereForm(form);
  };

  return { redirecting, redirect };
}
