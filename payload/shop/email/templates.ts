import { countryName } from "../../../lib/shop/countries";
import { formatPrice } from "../../../lib/utils";
import type { Order } from "../../payload-types";

/**
 * The emails' HTML. Everything that came from a person (names, addresses, the
 * wording in Email Settings) goes through `escapeHtml` first. Layout is inline
 * and table-based because that's all email clients reliably support.
 */

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const paragraphs = (text: string) => escapeHtml(text).replace(/\n/g, "<br>");

const FOREST = "#1B3A2D";
const MUTED = "#7A7A6A";
const BORDER = "#D4CFC4";

interface Layout {
  heading: string;
  intro: string;
  signature: string;
  /** Already-safe HTML. */
  body?: string;
  button?: { label: string; url: string };
}

export function renderEmail({ heading, intro, signature, body = "", button }: Layout): string {
  const cta = button
    ? `<p style="margin:24px 0"><a href="${escapeHtml(button.url)}" style="background:${FOREST};color:#FAF8F4;padding:12px 24px;border-radius:4px;text-decoration:none;display:inline-block">${escapeHtml(button.label)}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#FAF8F4;font-family:Arial,Helvetica,sans-serif;color:#2C2C2C">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid ${BORDER};border-radius:8px">
<tr><td style="background:${FOREST};color:#FAF8F4;padding:20px 24px;font-size:18px;font-weight:bold;letter-spacing:2px;border-radius:8px 8px 0 0">AROMAVITAE</td></tr>
<tr><td style="padding:24px;font-size:14px;line-height:1.6">
<h1 style="font-size:20px;margin:0 0 12px">${escapeHtml(heading)}</h1>
<p style="margin:0 0 16px">${paragraphs(intro)}</p>
${cta}${body}
<p style="margin:24px 0 0;color:${MUTED}">${paragraphs(signature)}</p>
</td></tr></table></td></tr></table></body></html>`;
}

const cell = (html: string, align = "left") =>
  `<td align="${align}" style="padding:6px 0;border-bottom:1px solid ${BORDER};font-size:14px">${html}</td>`;

/** The items, totals and address, as the customer sees them on the order page. */
export function orderSummary(order: Order): string {
  const money = (amount: number) => escapeHtml(formatPrice(order.currency, amount));
  const lines = (order.items ?? [])
    .map((item) => {
      const size = item.sizeLabel ? ` (${escapeHtml(item.sizeLabel)})` : "";
      return `<tr>${cell(`${escapeHtml(item.name)}${size} × ${item.quantity}`)}${cell(money(item.lineTotal), "right")}</tr>`;
    })
    .join("");
  const { fullName, line1, line2, city, region, postalCode, country, phone } = order.shippingAddress;
  const address = [line1, line2, city, region, postalCode].filter(Boolean).join(", ");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0">
${lines}
<tr>${cell("Subtotal")}${cell(money(order.subtotal), "right")}</tr>
<tr>${cell(`Shipping (${escapeHtml(order.shippingMethod)})`)}${cell(order.shippingAmount === 0 ? "Free" : money(order.shippingAmount), "right")}</tr>
<tr>${cell("<strong>Total</strong>")}${cell(`<strong>${money(order.total)}</strong>`, "right")}</tr>
</table>
<p style="margin:16px 0;color:${MUTED}"><strong style="color:#2C2C2C">Shipping to</strong><br>${escapeHtml(fullName)}<br>${escapeHtml(address)}<br>${escapeHtml(countryName(country))}<br>${escapeHtml(phone)}</p>`;
}

/** The parcel's tracking details, when staff have added any. */
export function trackingSummary(order: Order): string {
  const { carrier, number, url } = order.tracking ?? {};
  if (!carrier && !number && !url) return "";
  const parts = [
    carrier ? `Carrier: ${escapeHtml(carrier)}` : "",
    number ? `Tracking number: ${escapeHtml(number)}` : "",
    url && /^https?:\/\//.test(url) ? `<a href="${escapeHtml(url)}" style="color:${FOREST}">Track this parcel</a>` : "",
  ].filter(Boolean);
  return `<p style="margin:16px 0">${parts.join("<br>")}</p>`;
}

/** Replaces {order} in staff's wording. */
export const fillIn = (text: string, orderNumber: string) => text.split("{order}").join(orderNumber);
