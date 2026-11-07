"use client";

import { MAX_QUANTITY } from "@/lib/shop/pricing";

interface QuantityStepperProps {
  name: string;
  quantity: number;
  /** How many can be bought. Null means stock isn't tracked. */
  available?: number | null;
  onChange: (quantity: number) => void;
}

const buttonClass =
  "w-8 h-8 flex items-center justify-center text-charcoal hover:bg-cream transition-colors duration-200 " +
  "disabled:opacity-40 disabled:cursor-not-allowed";

export function QuantityStepper({ name, quantity, available, onChange }: QuantityStepperProps) {
  const max = Math.min(available ?? MAX_QUANTITY, MAX_QUANTITY);
  return (
    <div className="inline-flex items-center border border-border rounded">
      <button
        type="button"
        aria-label={`One fewer ${name}`}
        disabled={quantity <= 1}
        onClick={() => onChange(quantity - 1)}
        className={buttonClass}
      >
        −
      </button>
      <span aria-live="polite" className="w-8 text-center text-sm text-charcoal">
        {quantity}
      </span>
      <button
        type="button"
        aria-label={`One more ${name}`}
        disabled={quantity >= max}
        onClick={() => onChange(quantity + 1)}
        className={buttonClass}
      >
        +
      </button>
    </div>
  );
}
