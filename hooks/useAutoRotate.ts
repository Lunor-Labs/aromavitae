"use client";

import { useEffect, useState } from "react";

/** Cycle an index 0..count-1 on a timer. No-op when there is nothing to rotate. */
export function useAutoRotate(count: number, intervalMs = 4000) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [count, intervalMs]);

  // Clamp when the image list shrinks (e.g. admin edits while previewing)
  const safeIndex = count > 0 ? index % count : 0;
  return { index: safeIndex, setIndex };
}
