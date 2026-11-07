import type { CollectionConfig } from "payload";
import { anyone, staffWrites } from "../access";

export const Categories: CollectionConfig = {
  slug: "categories",
  access: { read: anyone, ...staffWrites },
  orderable: true,
  admin: {
    group: "Shop",
    useAsTitle: "name",
    defaultColumns: ["name", "image"],
    description: "Drag rows to change the order categories appear on the site.",
  },
  fields: [
    { name: "name", type: "text", required: true, maxLength: 200 },
    { name: "image", type: "upload", relationTo: "media", required: true },
    {
      type: "collapsible",
      label: "Products page section",
      admin: {
        description:
          "On the products page each category is its own section, its name above as a small label. All optional.",
      },
      fields: [
        {
          name: "headline",
          type: "text",
          maxLength: 200,
          admin: { description: "The section heading. Without it, the category name is the heading." },
        },
        { name: "intro", type: "textarea", maxLength: 1000, admin: { description: "A paragraph under the heading." } },
        {
          name: "highlight",
          type: "text",
          maxLength: 200,
          admin: { description: "A short gold line under the paragraph, e.g. MAYURA | THISARA | KOKILA | LIHINI." },
        },
        { name: "signoff", label: "Sign-off", type: "text", maxLength: 200, admin: { description: "A small closing line." } },
      ],
    },
  ],
};
