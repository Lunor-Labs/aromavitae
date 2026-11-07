"use client";

import { AddressFields } from "@/components/features/account/AddressFields";
import { countryName } from "@/lib/shop/countries";
import type { Address, SavedAddress } from "@/lib/shop/schemas";
import { cn } from "@/lib/utils";

interface AddressChooserProps {
  saved: SavedAddress[];
  /** The saved address in use, or null for the form. */
  selected: number | null;
  onSelect: (index: number | null) => void;
  form: Address;
  onFormChange: (address: Address) => void;
}

const optionClass = "flex items-start gap-3 border rounded-lg p-4 text-sm cursor-pointer transition-colors duration-200";
const optionState = (active: boolean) => (active ? "border-forest bg-forest/5" : "border-border hover:border-forest/40");

/** A logged-in customer's saved addresses, or a new one. Guests only see the form. */
export function AddressChooser({ saved, selected, onSelect, form, onFormChange }: AddressChooserProps) {
  return (
    <div className="space-y-3">
      {saved.map((address, index) => (
        <label key={index} className={cn(optionClass, optionState(selected === index))}>
          <input type="radio" name="address" className="mt-1" checked={selected === index} onChange={() => onSelect(index)} />
          <span className="text-muted">
            <span className="block font-medium text-charcoal">{address.label || address.fullName}</span>
            {[address.line1, address.line2, address.city, address.region, address.postalCode].filter(Boolean).join(", ")}
            <br />
            {countryName(address.country)} · {address.phone}
          </span>
        </label>
      ))}
      {saved.length > 0 && (
        <label className={cn(optionClass, optionState(selected === null))}>
          <input type="radio" name="address" className="mt-1" checked={selected === null} onChange={() => onSelect(null)} />
          <span className="font-medium text-charcoal">Use a different address</span>
        </label>
      )}
      {selected === null && <AddressFields value={form} onChange={onFormChange} />}
    </div>
  );
}
