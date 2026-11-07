"use client";

import { inputClass, labelClass } from "@/components/ui/FormField";
import { COUNTRIES } from "@/lib/shop/countries";

interface CountrySelectProps {
  label: string;
  value: string;
  onChange: (country: string) => void;
}

export function CountrySelect({ label, value, onChange }: CountrySelectProps) {
  return (
    <div>
      <label htmlFor="shipping-country" className={labelClass}>
        {label}
      </label>
      <select id="shipping-country" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        {COUNTRIES.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </select>
    </div>
  );
}
