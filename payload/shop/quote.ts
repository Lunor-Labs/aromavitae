import type { PayloadRequest } from "payload";
import type { Media, Product } from "../payload-types";
import { ratesFromSettings } from "../../lib/shop/money";
import { buildQuote, type CartItemInput, type CatalogProduct, type Quote } from "../../lib/shop/pricing";
import type { ShippingZone } from "../../lib/shop/shipping";
import { formatSize } from "../../lib/utils";

const mediaUrl = (media: number | Media | null | undefined) => (typeof media === "object" && media?.url) || null;

function toCatalog(doc: Product): CatalogProduct {
  return {
    id: doc.id,
    name: doc.name,
    sizeLabel: formatSize(doc),
    price: doc.price ?? 0,
    salePrice: doc.salePrice ?? null,
    priceMax: doc.priceMax ?? null,
    stock: doc.stock ?? null,
    weightGrams: doc.weightGrams ?? null,
    domesticOnly: Boolean(doc.domesticOnly),
    image: mediaUrl(doc.image),
    variants: (doc.variants ?? []).flatMap((v) =>
      v.id
        ? [
            {
              id: v.id,
              sizeLabel: formatSize(v),
              price: v.price,
              salePrice: v.salePrice ?? null,
              stock: v.stock ?? null,
              weightGrams: v.weightGrams ?? null,
              image: mediaUrl(v.image),
            },
          ]
        : []
    ),
  };
}

interface LoadQuoteInput {
  items: CartItemInput[];
  currency?: string | null;
  country?: string | null;
}

export async function loadQuote(req: PayloadRequest, input: LoadQuoteInput): Promise<{ quote: Quote; maxOrderLkr: number | null }> {
  const { payload } = req;
  const settings = await payload.findGlobal({ slug: "shop-settings", req, overrideAccess: true });
  // One after the other: during checkout these share a single database transaction.
  const products = await payload.find({
    collection: "products",
    where: { id: { in: input.items.map((item) => item.productId) } },
    depth: 1,
    pagination: false,
    overrideAccess: true,
    req,
  });
  const zones = await payload.find({ collection: "shipping-zones", depth: 0, pagination: false, overrideAccess: true, req });

  const shippingZones: ShippingZone[] = zones.docs.map((zone) => ({
    countries: zone.countries ?? [],
    isFallback: Boolean(zone.isFallback),
    methods: zone.methods.map((method, i) => ({
      id: method.id ?? String(i),
      name: method.name,
      estimate: method.estimate,
      freeOverLkr: method.freeOverLkr,
      bands: method.bands,
    })),
  }));

  return {
    maxOrderLkr: settings.maxOrderLkr ?? null,
    quote: buildQuote({
      items: input.items,
      products: products.docs.map(toCatalog),
      zones: shippingZones,
      rates: ratesFromSettings(settings.exchangeRates),
      defaultWeightGrams: settings.defaultWeightGrams ?? 250,
      currency: input.currency,
      country: input.country,
    }),
  };
}
