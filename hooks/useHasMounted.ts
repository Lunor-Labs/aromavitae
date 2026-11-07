"use client";

import { useSyncExternalStore } from "react";

const noSubscribe = () => () => {};

/** False in the server render and the first browser render, so a browser-only value can't mismatch. */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false
  );
}
