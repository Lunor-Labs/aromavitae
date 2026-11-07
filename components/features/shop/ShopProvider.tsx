"use client";

import { createContext, useContext, useMemo } from "react";
import { useBrowserCookie } from "@/hooks/useBrowserCookie";
import type { ShopContent } from "@/types/content";

interface ShopContextValue {
  /** Whether this visitor sees the cart, checkout and accounts. */
  enabled: boolean;
  settings: ShopContent;
}

const OFF: ShopContextValue = { enabled: false, settings: { mode: "off", rates: {} } };
const ShopContext = createContext<ShopContextValue>(OFF);

interface ShopProviderProps {
  settings: ShopContent;
  children: React.ReactNode;
}

/**
 * Pages are cached for everyone, so whether this visitor sees the shop is worked
 * out here in the browser. The UI appearing grants nothing: the CMS checks the
 * mode and the preview key again on every shop request.
 */
export function ShopProvider({ settings, children }: ShopProviderProps) {
  const previewOn = useBrowserCookie("av_preview_on") === "1";
  const enabled = settings.mode === "live" || (settings.mode === "test" && previewOn);
  const value = useMemo(() => ({ enabled, settings }), [enabled, settings]);
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopContextValue {
  return useContext(ShopContext);
}
