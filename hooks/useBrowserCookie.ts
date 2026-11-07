"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readCookie(name: string): string | null {
  const prefix = `${name}=`;
  const found = document.cookie.split("; ").find((part) => part.startsWith(prefix));
  return found ? decodeURIComponent(found.slice(prefix.length)) : null;
}

/** Set a readable cookie and update every component using it. */
export function setBrowserCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
  listeners.forEach((listener) => listener());
}

/**
 * A cookie's value, or null. Always null in the server render and the first
 * browser render, so a cached page never mismatches during hydration.
 */
export function useBrowserCookie(name: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => readCookie(name),
    () => null
  );
}
