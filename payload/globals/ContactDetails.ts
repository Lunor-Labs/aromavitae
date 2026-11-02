import type { GlobalConfig } from "payload";
import { anyone } from "../access";

// Anything left empty falls back to the details in lib/site.ts
export const ContactDetails: GlobalConfig = {
  slug: "contact-details",
  access: { read: anyone },
  label: "Contact Details",
  admin: {
    group: "Site",
    description:
      "The phone numbers, email and address in the footer and on the Contact page. Anything left empty shows the shop's usual details.",
  },
  fields: [
    {
      name: "phones",
      label: "Phone numbers",
      type: "array",
      labels: { singular: "Phone number", plural: "Phone numbers" },
      admin: { description: "Leave empty to show the usual numbers." },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "number",
              type: "text",
              required: true,
              admin: { width: "50%", description: "With the country code, e.g. +94 77 602 8676" },
            },
            {
              name: "whatsapp",
              label: "WhatsApp",
              type: "checkbox",
              admin: {
                width: "50%",
                description: "The first number ticked gets the orders from the Order buttons.",
              },
            },
          ],
        },
      ],
    },
    {
      name: "email",
      type: "email",
    },
    {
      name: "address",
      type: "textarea",
      admin: { description: "One line per row, as it should appear on the site." },
    },
  ],
};
