import type { CollectionConfig } from "payload";
import { adminsOnly, staffWrites } from "../access";
import { COUNTRIES } from "../../lib/shop/countries";

export const ShippingZones: CollectionConfig = {
  slug: "shipping-zones",
  labels: { singular: "Shipping zone", plural: "Shipping zones" },
  access: { ...staffWrites, read: adminsOnly },
  admin: {
    group: "Shop",
    useAsTitle: "name",
    defaultColumns: ["name", "isFallback", "updatedAt"],
    description: "Where you ship and what it costs. A country in no zone can't check out unless a zone covers everywhere else.",
  },
  fields: [
    { name: "name", type: "text", required: true, maxLength: 80, admin: { description: "e.g. Sri Lanka, Europe" } },
    {
      name: "countries",
      type: "select",
      hasMany: true,
      enumName: "enum_shipping_zones_countries",
      options: COUNTRIES.map((country) => ({ label: country.name, value: country.code })),
      admin: { description: "A country's own zone is used before the catch-all one." },
    },
    {
      name: "isFallback",
      label: "Everywhere else",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "Covers every country not listed in another zone. Use it on one zone only." },
    },
    {
      name: "methods",
      label: "Shipping methods",
      labels: { singular: "Method", plural: "Methods" },
      type: "array",
      required: true,
      minRows: 1,
      admin: { initCollapsed: false },
      fields: [
        {
          type: "row",
          fields: [
            { name: "name", type: "text", required: true, admin: { width: "34%", description: "e.g. Standard, Express" } },
            { name: "estimate", label: "Delivery time", type: "text", admin: { width: "33%", description: "e.g. 2-4 working days" } },
            {
              name: "freeOverLkr",
              label: "Free over (LKR)",
              type: "number",
              min: 0,
              admin: { width: "33%", description: "Optional. Free when the basket reaches this." },
            },
          ],
        },
        {
          name: "bands",
          label: "Prices by weight",
          labels: { singular: "Weight band", plural: "Weight bands" },
          type: "array",
          required: true,
          minRows: 1,
          admin: {
            description: "For a flat rate, add one band and leave Up to empty. A parcel heavier than every band can't use this method.",
          },
          fields: [
            {
              type: "row",
              fields: [
                { name: "upToGrams", label: "Up to (g)", type: "number", min: 1, admin: { width: "50%", description: "Empty means no limit." } },
                { name: "priceLkr", label: "Price (LKR)", type: "number", required: true, min: 0, admin: { width: "50%" } },
              ],
            },
          ],
        },
      ],
    },
  ],
};
