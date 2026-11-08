"use client";

import Script from "next/script";
import { useEffect, useImperativeHandle, useRef, type Ref } from "react";

/** Cloudflare's public site key. Without it (local dev) there's no widget, and the CMS doesn't ask for one. */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

interface TurnstileApi {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export interface TurnstileHandle {
  /** A token works once. Call after every checkout attempt to get a fresh one. */
  reset: () => void;
}

interface TurnstileWidgetProps {
  /** Must be stable, like a state setter. Gets null whenever there's no usable token. */
  onToken: (token: string | null) => void;
  ref?: Ref<TurnstileHandle>;
}

/**
 * Cloudflare Turnstile, checked by the CMS at checkout. It only shows itself
 * when Cloudflare wants the visitor to click; most never see it.
 */
export function TurnstileWidget({ onToken, ref }: TurnstileWidgetProps) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      onToken(null);
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
    },
  }));

  useEffect(() => {
    // Back from PayHere, the page can come back as it was left, holding a used token.
    const onShow = (event: PageTransitionEvent) => {
      if (!event.persisted || !widgetId.current) return;
      onToken(null);
      window.turnstile?.reset(widgetId.current);
    };
    window.addEventListener("pageshow", onShow);
    return () => {
      window.removeEventListener("pageshow", onShow);
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
      onToken(null); // a token from a widget that's gone is no use to the next one
    };
  }, [onToken]);

  // Runs once the script has loaded, and again on every mount after that.
  const render = () => {
    if (!window.turnstile || !container.current || widgetId.current) return;
    widgetId.current = window.turnstile.render(container.current, {
      sitekey: TURNSTILE_SITE_KEY,
      appearance: "interaction-only",
      callback: (token: string) => onToken(token),
      "expired-callback": () => onToken(null),
      "error-callback": () => onToken(null),
    });
  };

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={render} />
      <div ref={container} className="flex justify-center" />
    </>
  );
}
