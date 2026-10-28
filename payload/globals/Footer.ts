import type { GlobalConfig } from "payload";
import { anyone } from "../access";

// Must match the icons in components/features/footer/Footer.tsx
export const SOCIAL_PLATFORMS = [
  "facebook",
  "instagram",
  "x",
  "youtube",
  "linkedin",
  "tiktok",
  "pinterest",
  "whatsapp",
] as const;

export const Footer: GlobalConfig = {
  slug: "footer",
  access: { read: anyone },
  admin: {
    group: "Site",
    description: "The social media icons in the footer. Contact details and links are fixed in the code.",
  },
  fields: [
    {
      name: "social",
      label: "Social links",
      type: "array",
      labels: { singular: "Social link", plural: "Social links" },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "platform",
              type: "select",
              required: true,
              options: SOCIAL_PLATFORMS.map((p) => ({ label: p === "x" ? "X (Twitter)" : p[0].toUpperCase() + p.slice(1), value: p })),
              admin: { width: "30%" },
            },
            {
              name: "url",
              label: "Address",
              type: "text",
              required: true,
              admin: { width: "70%", description: "Profile URL. For WhatsApp, the phone number works too." },
            },
          ],
        },
      ],
    },
  ],
};
