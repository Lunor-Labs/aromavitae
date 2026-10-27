import type { GlobalConfig } from "payload";

export const GiftSetsBanner: GlobalConfig = {
  slug: "gift-sets-banner",
  label: "Gift Sets Banner",
  admin: { group: "Homepage" },
  fields: [
    { name: "eyebrow", label: "Small title", type: "text" },
    { name: "heading", type: "text", required: true },
    { name: "body", type: "textarea" },
    { name: "image", type: "upload", relationTo: "media", required: true },
    {
      type: "row",
      fields: [
        { name: "ctaLabel", label: "Button text", type: "text", admin: { width: "50%", placeholder: "SHOP NOW" } },
        { name: "ctaHref", label: "Button link", type: "text", admin: { width: "50%", placeholder: "/products" } },
      ],
    },
  ],
};
