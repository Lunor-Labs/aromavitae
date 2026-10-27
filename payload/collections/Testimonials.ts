import type { CollectionConfig } from "payload";

export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  orderable: true,
  admin: {
    group: "Content",
    useAsTitle: "author",
    defaultColumns: ["author", "location", "rating"],
  },
  fields: [
    { name: "quote", type: "textarea", required: true, maxLength: 2000 },
    {
      type: "row",
      fields: [
        { name: "author", type: "text", required: true, maxLength: 120, admin: { width: "50%" } },
        { name: "location", type: "text", required: true, maxLength: 120, admin: { width: "50%" } },
      ],
    },
    {
      name: "rating",
      type: "number",
      required: true,
      min: 1,
      max: 5,
      defaultValue: 5,
      admin: { step: 1 },
      validate: (value: number | null | undefined) =>
        value == null || Number.isInteger(value) || "Rating must be a whole number.",
    },
    {
      type: "row",
      fields: [
        { name: "imageA", label: "Left image", type: "upload", relationTo: "media", admin: { width: "50%" } },
        { name: "imageB", label: "Right image", type: "upload", relationTo: "media", admin: { width: "50%" } },
      ],
    },
  ],
};
