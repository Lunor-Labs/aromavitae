import { useId } from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string;
}

export const inputClass =
  "w-full px-4 py-3 bg-cream/50 border border-border rounded-lg text-sm text-charcoal " +
  "placeholder:text-muted/50 outline-none transition-all duration-300 hover:border-forest/40 " +
  "focus:border-forest focus:ring-2 focus:ring-forest/10 focus:bg-warm-white";

export const labelClass = "block text-xs font-medium text-charcoal tracking-wider uppercase mb-2";

export function FormField({ label, className, required, ...input }: FormFieldProps) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && " *"}
      </label>
      <input id={id} required={required} className={cn(inputClass)} {...input} />
    </div>
  );
}
