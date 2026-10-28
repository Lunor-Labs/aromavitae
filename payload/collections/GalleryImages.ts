import type { CollectionConfig } from "payload";
import { anyone } from "../access";

export const GalleryImages: CollectionConfig = {
  slug: "gallery-images",
  access: { read: anyone },
  labels: { singular: "Gallery Image", plural: "Gallery" },
  orderable: true,
  admin: {
    group: "Content",
    useAsTitle: "alt",
    defaultColumns: ["image", "alt", "tags", "span"],
    description: "Drag rows to change the order pictures appear in the gallery.",
  },
  fields: [
    { name: "image", type: "upload", relationTo: "media", required: true },
    { name: "alt", label: "Description", type: "text", maxLength: 300 },
    {
      name: "tags",
      type: "text",
      hasMany: true,
      required: true,
      minRows: 1,
      maxRows: 10,
      admin: { description: "Used for the gallery's filter buttons." },
    },
    {
      name: "span",
      label: "Tile shape",
      type: "select",
      options: [
        { label: "Tall", value: "tall" },
        { label: "Wide", value: "wide" },
      ],
      admin: { description: "Leave empty for a normal tile." },
    },
  ],
};
