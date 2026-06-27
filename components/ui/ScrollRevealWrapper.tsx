"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

interface ScrollRevealWrapperProps {
  children: React.ReactNode;
}

export function ScrollRevealWrapper({ children }: ScrollRevealWrapperProps) {
  const ref = useScrollReveal();

  return <div ref={ref}>{children}</div>;
}
