import { describe, expect, it } from "vitest";
import type { Order } from "../../../payload-types";
import { escapeHtml, fillIn, orderSummary, renderEmail, trackingSummary } from "../templates";

const order = {
  currency: "USD",
  subtotal: 40,
  shippingAmount: 0,
  total: 40,
  shippingMethod: "Air",
  items: [{ name: "Oil <script>", sizeLabel: "3ml", quantity: 2, lineTotal: 40 }],
  shippingAddress: {
    fullName: `Bobby "Tables" <b>`,
    line1: "1 Road",
    city: "Colombo",
    country: "LK",
    phone: "+94",
  },
} as unknown as Order;

describe("email templates", () => {
  it("escapes everything a person typed", () => {
    expect(escapeHtml(`<a href="x">'&`)).toBe("&lt;a href=&quot;x&quot;&gt;&#39;&amp;");
    const html = orderSummary(order);
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<b>");
    expect(html).toContain("Oil &lt;script&gt;");
    expect(html).toContain("&quot;Tables&quot;");
  });

  it("escapes staff's wording too, and keeps its line breaks", () => {
    const html = renderEmail({ heading: "<h>", intro: "one\n<two>", signature: "s" });
    expect(html).toContain("one<br>&lt;two&gt;");
    expect(html).toContain("&lt;h&gt;");
  });

  it("shows amounts in the charged currency, and free shipping as Free", () => {
    const html = orderSummary(order);
    expect(html).toContain("USD 40.00");
    expect(html).toContain("Free");
    expect(html).toContain("Sri Lanka");
  });

  it("only links tracking addresses that are web links", () => {
    const tracked = (url: string) => trackingSummary({ tracking: { url } } as unknown as Order);
    expect(tracked("https://dhl.example/1")).toContain("https://dhl.example/1");
    expect(tracked("javascript:alert(1)")).not.toContain("javascript");
    expect(trackingSummary({ tracking: {} } as unknown as Order)).toBe("");
  });

  it("fills in the order number everywhere it's asked for", () => {
    expect(fillIn("{order} and {order}", "AV-1")).toBe("AV-1 and AV-1");
    expect(fillIn("no placeholder", "AV-1")).toBe("no placeholder");
  });
});
