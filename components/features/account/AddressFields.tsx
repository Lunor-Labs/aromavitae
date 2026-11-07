"use client";

import { FormField, inputClass, labelClass } from "@/components/ui/FormField";
import { COUNTRIES, regionLabel } from "@/lib/shop/countries";
import type { Address } from "@/lib/shop/schemas";

interface AddressFieldsProps<T extends Address> {
  value: T;
  onChange: (next: T) => void;
}

/** An address form's fields. Used by the address book and at checkout. */
export function AddressFields<T extends Address>({ value, onChange }: AddressFieldsProps<T>) {
  const set = (field: keyof Address) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...value, [field]: e.target.value });

  return (
    <div className="grid sm:grid-cols-2 gap-5">
      <FormField label="Full name" value={value.fullName} onChange={set("fullName")} autoComplete="name" required />
      <FormField label="Phone" type="tel" value={value.phone} onChange={set("phone")} autoComplete="tel" required />
      <FormField
        className="sm:col-span-2"
        label="Address"
        value={value.line1}
        onChange={set("line1")}
        autoComplete="address-line1"
        required
      />
      <FormField
        className="sm:col-span-2"
        label="Address line 2"
        value={value.line2}
        onChange={set("line2")}
        autoComplete="address-line2"
      />
      <FormField label="City" value={value.city} onChange={set("city")} autoComplete="address-level2" required />
      <FormField
        label={regionLabel(value.country)}
        value={value.region}
        onChange={set("region")}
        autoComplete="address-level1"
        required={value.country === "LK"}
      />
      <FormField label="Postal code" value={value.postalCode} onChange={set("postalCode")} autoComplete="postal-code" />
      <div>
        <label htmlFor="address-country" className={labelClass}>
          Country *
        </label>
        <select
          id="address-country"
          value={value.country}
          onChange={set("country")}
          autoComplete="country"
          required
          className={inputClass}
        >
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
