"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

interface SubmitButtonProps {
  children: React.ReactNode;
  className?: string;
}

export const primaryButtonClass =
  "inline-flex items-center justify-center px-8 py-3 bg-forest text-warm-white text-xs font-medium " +
  "tracking-[0.15em] uppercase rounded hover:bg-forest-light transition-colors duration-200 " +
  "disabled:opacity-60 disabled:cursor-not-allowed";

export function SubmitButton({ children, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn(primaryButtonClass, className)}>
      {pending ? "Please wait…" : children}
    </button>
  );
}
