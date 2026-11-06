/**
 * Orders go through WhatsApp until the site has a cart and checkout: the
 * "Order" buttons open a chat with the shop, the message already filled in
 * with the product the customer was looking at.
 */
import { BRAND_NAME, SITE_URL, type ContactDetails } from "@/lib/site";
import type { Product, ProductVariant } from "@/types/product";
import { formatPrice, formatPriceRange, formatSize, percentOff } from "@/lib/utils";

/** The number orders go to, digits only: the first one ticked as WhatsApp in Contact Details. */
export function whatsappNumber(contact: ContactDetails): string {
  return (contact.phones.find((p) => p.whatsapp) ?? contact.phones[0]).tel.replace(/\D/g, "");
}

/**
 * wa.me link to order `product`. Pass the size the customer picked; without
 * one, a product that comes in several sizes is asked about by name only.
 */
export function whatsappOrderUrl(number: string, product: Product, variant?: ProductVariant): string {
  const item = variant ?? (product.variants.length > 0 ? null : product);
  const lines = [`Hi ${BRAND_NAME}, I'd like to order:`, "", `Product: ${product.name}`];
  if (item) {
    const size = formatSize(item);
    const price = percentOff(item.price, item.salePrice) ? item.salePrice! : item.price;
    // A range is quoted as shown; the shop agrees the exact price in the chat.
    const max = item === product ? product.priceMax : null;
    if (size) lines.push(`Size: ${size}`);
    lines.push(
      `Price: ${max != null && max > price ? formatPriceRange(product.currency, price, max) : formatPrice(product.currency, price)}`
    );
  }
  lines.push("", `${SITE_URL}/products/${product.id}`);
  return `https://wa.me/${number}?text=${encodeURIComponent(lines.join("\n"))}`;
}
