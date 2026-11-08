import { describe, expect, it } from "vitest";
import { buildQuote, type CatalogProduct } from "../pricing";
import { bandPrice, findZone, shippingOptions, type ShippingZone } from "../shipping";

const oil: CatalogProduct = {
  id: 1,
  name: "Oil",
  sizeLabel: "3ml",
  price: 6000,
  salePrice: null,
  priceMax: null,
  stock: 5,
  weightGrams: 100,
  domesticOnly: false,
  image: null,
  variants: [],
};

const spice: CatalogProduct = {
  ...oil,
  id: 2,
  name: "Spice",
  sizeLabel: null,
  stock: null,
  weightGrams: null,
  variants: [
    { id: "small", sizeLabel: "100g", price: 1000, salePrice: 800, stock: 2, weightGrams: 150, image: null },
    { id: "large", sizeLabel: "1kg", price: 7000, salePrice: null, stock: null, weightGrams: null, image: null },
  ],
};

const zones: ShippingZone[] = [
  {
    countries: ["LK"],
    isFallback: false,
    methods: [
      { id: "local", name: "Island-wide", freeOverLkr: 10000, bands: [{ upToGrams: null, priceLkr: 400 }] },
    ],
  },
  {
    countries: [],
    isFallback: true,
    methods: [
      {
        id: "air",
        name: "Air",
        bands: [
          { upToGrams: 2000, priceLkr: 12000 },
          { upToGrams: 500, priceLkr: 5000 },
        ],
      },
    ],
  },
];

const quote = (overrides: Partial<Parameters<typeof buildQuote>[0]>) =>
  buildQuote({
    items: [],
    products: [oil, spice],
    zones,
    rates: { USD: 300 },
    defaultWeightGrams: 250,
    ...overrides,
  });

describe("shipping", () => {
  it("prefers a country's own zone over the fallback", () => {
    expect(findZone(zones, "LK")?.methods[0].id).toBe("local");
    expect(findZone(zones, "SG")?.methods[0].id).toBe("air");
    expect(findZone([zones[0]], "SG")).toBeNull();
  });

  it("uses the smallest band that fits, in any order", () => {
    expect(bandPrice(zones[1].methods[0].bands, 300)).toBe(5000);
    expect(bandPrice(zones[1].methods[0].bands, 500)).toBe(5000);
    expect(bandPrice(zones[1].methods[0].bands, 501)).toBe(12000);
  });

  it("drops a method the parcel is too heavy for", () => {
    expect(bandPrice(zones[1].methods[0].bands, 2001)).toBeNull();
    expect(shippingOptions(zones, "SG", 2001, 1000)).toEqual([]);
  });

  it("is free over the method's threshold", () => {
    expect(shippingOptions(zones, "LK", 100, 9999)[0].priceLkr).toBe(400);
    expect(shippingOptions(zones, "LK", 100, 10000)[0].priceLkr).toBe(0);
  });
});

describe("buildQuote", () => {
  it("prices a size at its sale price and adds up in LKR", () => {
    const q = quote({ items: [{ productId: 2, variantId: "small", quantity: 2 }, { productId: 1, variantId: null, quantity: 1 }] });
    expect(q.lines.map((l) => l.problem)).toEqual([null, null]);
    expect(q.lines[0].unitPriceLkr).toBe(800);
    expect(q.subtotalLkr).toBe(7600);
    expect(q.subtotal).toBe(7600);
    expect(q.currency).toBe("LKR");
    expect(q.rate).toBe(1);
  });

  it("charges foreign totals from the rounded unit price the customer saw", () => {
    const q = quote({ currency: "USD", items: [{ productId: 2, variantId: "small", quantity: 2 }] });
    expect(q.lines[0].unitPrice).toBe(2.67);
    expect(q.subtotal).toBe(5.34);
    expect(q.subtotalLkr).toBe(1600);
    expect(q.rate).toBe(300);
  });

  it("falls back to LKR for a currency with no rate", () => {
    expect(quote({ currency: "GBP", items: [] }).currency).toBe("LKR");
  });

  it("checks stock against the total when a size is added twice", () => {
    const q = quote({
      items: [
        { productId: 2, variantId: "small", quantity: 2 },
        { productId: 2, variantId: "small", quantity: 1 },
      ],
    });
    expect(q.lines).toHaveLength(1);
    expect(q.lines[0].quantity).toBe(3);
    expect(q.lines[0].problem).toBe("Only 2 left");
    expect(q.subtotalLkr).toBe(0);
  });

  it("never sells anything at a zero or negative price", () => {
    const item = [{ productId: 1, variantId: null, quantity: 1 }];
    for (const bad of [{ ...oil, price: 0 }, { ...oil, price: -1500 }, { ...oil, salePrice: 0 }]) {
      const q = quote({ products: [bad], items: item });
      expect(q.lines[0].problem).toBe("No longer available");
      expect(q.subtotalLkr).toBe(0);
    }
    const freeSize = { ...spice, variants: [{ ...spice.variants[0], price: 0, salePrice: null }] };
    expect(quote({ products: [freeSize], items: [{ productId: 2, variantId: "small", quantity: 1 }] }).lines[0].problem).toBe(
      "No longer available"
    );
  });

  it("says sold out at zero, and treats empty stock as untracked", () => {
    const soldOut = { ...oil, stock: 0 };
    expect(quote({ products: [soldOut], items: [{ productId: 1, variantId: null, quantity: 1 }] }).lines[0].problem).toBe("Sold out");
    const q = quote({ items: [{ productId: 2, variantId: "large", quantity: 50 }] });
    expect(q.lines[0].problem).toBeNull();
    expect(q.lines[0].available).toBeNull();
  });

  it("refuses a range-priced product, however cheap the bottom of the range", () => {
    const range = { ...oil, priceMax: 24000 };
    const q = quote({ products: [range], items: [{ productId: 1, variantId: null, quantity: 1 }] });
    expect(q.lines[0].problem).toMatch(/exact price/);
    expect(q.subtotalLkr).toBe(0);
  });

  it("refuses a missing product, a deleted size, and a product with sizes bought without one", () => {
    const q = quote({
      items: [
        { productId: 99, variantId: null, quantity: 1 },
        { productId: 2, variantId: "gone", quantity: 1 },
        { productId: 2, variantId: null, quantity: 1 },
        { productId: 1, variantId: "gone", quantity: 1 },
      ],
    });
    expect(q.lines.map((l) => l.problem)).toEqual(Array(4).fill("No longer available"));
    expect(q.subtotalLkr).toBe(0);
  });

  it("refuses a Sri Lanka only product abroad, but not at home", () => {
    const local = { ...oil, domesticOnly: true };
    const items = [{ productId: 1, variantId: null, quantity: 1 }];
    expect(quote({ products: [local], items, country: "SG" }).lines[0].problem).toMatch(/within Sri Lanka/);
    expect(quote({ products: [local], items, country: "LK" }).lines[0].problem).toBeNull();
  });

  it("offers shipping by total weight, using the default weight when a product has none, in the customer's currency", () => {
    const noWeight = { ...oil, weightGrams: null };
    const q = quote({ products: [noWeight], currency: "USD", country: "SG", items: [{ productId: 1, variantId: null, quantity: 3 }] });
    expect(q.weightGrams).toBe(750);
    expect(q.shipping).toEqual([{ id: "air", name: "Air", estimate: null, priceLkr: 12000, price: 40 }]);
  });

  it("has no shipping until a country is chosen, and none where nothing ships", () => {
    expect(quote({ items: [] }).shipping).toBeNull();
    expect(quote({ zones: [zones[0]], country: "SG", items: [] }).shipping).toEqual([]);
  });
});
