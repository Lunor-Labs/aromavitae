"use client";

import { useState, useTransition } from "react";
import { AddressFields } from "@/components/features/account/AddressFields";
import { FormField } from "@/components/ui/FormField";
import { FormMessage } from "@/components/ui/FormMessage";
import { primaryButtonClass } from "@/components/ui/SubmitButton";
import { saveAddressesAction, type FormState } from "@/lib/shop/actions/account";
import { countryName, HOME_COUNTRY } from "@/lib/shop/countries";
import type { SavedAddress } from "@/lib/shop/schemas";

const EMPTY: SavedAddress = {
  label: "",
  isDefault: false,
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  region: "",
  postalCode: "",
  country: HOME_COUNTRY,
};

const textButton = "text-xs font-medium text-forest underline underline-offset-2 hover:text-forest-light";

export function AddressBook({ initial }: { initial: SavedAddress[] }) {
  const [addresses, setAddresses] = useState(initial);
  const [editing, setEditing] = useState<{ index: number | null; value: SavedAddress } | null>(null);
  const [message, setMessage] = useState<FormState>({});
  const [pending, startTransition] = useTransition();

  const save = (next: SavedAddress[], onSaved?: () => void) =>
    startTransition(async () => {
      const result = await saveAddressesAction(next);
      setMessage(result);
      if (!result.error) {
        setAddresses(next);
        onSaved?.();
      }
    });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const { index, value } = editing;
    const list = index === null ? [...addresses, value] : addresses.map((a, i) => (i === index ? value : a));
    save(list, () => setEditing(null));
  };

  const makeDefault = (index: number) => save(addresses.map((a, i) => ({ ...a, isDefault: i === index })));

  if (editing) {
    return (
      <form onSubmit={submit} className="space-y-5">
        <FormField
          label="Label"
          placeholder="Home, work…"
          value={editing.value.label}
          onChange={(e) => setEditing({ ...editing, value: { ...editing.value, label: e.target.value } })}
        />
        <AddressFields value={editing.value} onChange={(value) => setEditing({ ...editing, value })} />
        <FormMessage error={message.error} />
        <div className="flex items-center gap-4">
          <button type="submit" disabled={pending} className={primaryButtonClass}>
            {pending ? "Saving…" : "Save address"}
          </button>
          <button type="button" className={textButton} onClick={() => setEditing(null)}>
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.length === 0 && <p className="text-sm text-muted">You haven&apos;t saved an address yet.</p>}
      <ul className="grid sm:grid-cols-2 gap-4">
        {addresses.map((address, index) => (
          <li key={index} className="border border-border rounded-lg p-4 text-sm text-muted">
            <p className="font-medium text-charcoal">
              {address.label || address.fullName}
              {address.isDefault && <span className="ml-2 text-[10px] uppercase tracking-wider text-gold-dark">Default</span>}
            </p>
            <p>{[address.line1, address.line2, address.city, address.region, address.postalCode].filter(Boolean).join(", ")}</p>
            <p>{countryName(address.country)}</p>
            <p className="mb-3">{address.phone}</p>
            <div className="flex flex-wrap gap-3">
              <button type="button" className={textButton} onClick={() => setEditing({ index, value: address })}>
                Edit
              </button>
              {!address.isDefault && (
                <button type="button" className={textButton} disabled={pending} onClick={() => makeDefault(index)}>
                  Make default
                </button>
              )}
              <button
                type="button"
                className={textButton}
                disabled={pending}
                onClick={() => save(addresses.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <FormMessage error={message.error} />
      <button type="button" className={primaryButtonClass} onClick={() => setEditing({ index: null, value: EMPTY })}>
        Add an address
      </button>
    </div>
  );
}
