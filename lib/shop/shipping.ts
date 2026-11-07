/** Shipping prices, entered in LKR in the admin (Shipping Zones). */

export interface WeightBand {
  /** Empty means no upper limit. */
  upToGrams?: number | null;
  priceLkr: number;
}

export interface ShippingMethod {
  id: string;
  name: string;
  estimate?: string | null;
  freeOverLkr?: number | null;
  bands: WeightBand[];
}

export interface ShippingZone {
  countries: string[];
  /** Catches every country that isn't listed in a zone of its own. */
  isFallback: boolean;
  methods: ShippingMethod[];
}

export interface ShippingOption {
  id: string;
  name: string;
  estimate: string | null;
  priceLkr: number;
}

/** A country's own zone wins over the "everywhere else" one. */
export function findZone(zones: ShippingZone[], country: string): ShippingZone | null {
  return zones.find((zone) => zone.countries.includes(country)) ?? zones.find((zone) => zone.isFallback) ?? null;
}

/** The smallest band this weight fits in, or null when it's too heavy for the method. */
export function bandPrice(bands: WeightBand[], grams: number): number | null {
  const sorted = [...bands].sort((a, b) => (a.upToGrams ?? Infinity) - (b.upToGrams ?? Infinity));
  return sorted.find((band) => band.upToGrams == null || grams <= band.upToGrams)?.priceLkr ?? null;
}

export function shippingOptions(
  zones: ShippingZone[],
  country: string,
  grams: number,
  subtotalLkr: number
): ShippingOption[] {
  const zone = findZone(zones, country);
  if (!zone) return [];

  return zone.methods.flatMap((method) => {
    const price = bandPrice(method.bands, grams);
    if (price == null) return [];
    const free = method.freeOverLkr != null && subtotalLkr >= method.freeOverLkr;
    return [{ id: method.id, name: method.name, estimate: method.estimate ?? null, priceLkr: free ? 0 : price }];
  });
}
