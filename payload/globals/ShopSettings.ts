import type { GlobalConfig } from "payload";
import { adminsOnly, adminsOnlyField, anyone } from "../access";

const rate = (name: string, code: string) => ({
  name,
  label: `1 ${code} in LKR`,
  type: "number" as const,
  min: 0,
  admin: {
    step: 0.01,
    width: "33%",
    description: `Leave empty to stop offering ${code}.`,
  },
});

export const ShopSettings: GlobalConfig = {
  slug: "shop-settings",
  access: { read: anyone, update: adminsOnly },
  label: "Shop Settings",
  admin: {
    group: "Shop",
    description: "Turns the online shop on and off, and sets its exchange rates and defaults.",
  },
  fields: [
    {
      name: "mode",
      type: "radio",
      required: true,
      defaultValue: "off",
      options: [
        { label: "Off: the site takes orders on WhatsApp", value: "off" },
        { label: "Test: only browsers with the preview link, using the PayHere sandbox", value: "test" },
        { label: "Live: open to everyone, real payments", value: "live" },
      ],
    },
    {
      type: "group",
      name: "exchangeRates",
      label: "Exchange rates",
      admin: {
        description:
          "What customers pay in each currency. PayHere pays the shop in LKR at the bank's rate and adds a fee, so keep a small margin here.",
      },
      fields: [
        { type: "row", fields: [rate("usd", "USD"), rate("eur", "EUR"), rate("gbp", "GBP")] },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "defaultWeightGrams",
          label: "Default parcel weight (g)",
          type: "number",
          min: 1,
          defaultValue: 250,
          access: { read: adminsOnlyField },
          admin: { width: "33%", description: "Used for shipping when a product has no weight." },
        },
        {
          name: "lowStockLevel",
          label: "Low-stock level",
          type: "number",
          min: 0,
          defaultValue: 5,
          access: { read: adminsOnlyField },
          admin: { width: "33%", description: "Staff are alerted at or below this many left." },
        },
        {
          name: "maxOrderLkr",
          label: "Largest order (LKR)",
          type: "number",
          min: 0,
          defaultValue: 250000,
          access: { read: adminsOnlyField },
          admin: {
            width: "33%",
            description: "Set to your PayHere plan's per-payment limit. Larger orders are asked to contact you.",
          },
        },
      ],
    },
  ],
};
