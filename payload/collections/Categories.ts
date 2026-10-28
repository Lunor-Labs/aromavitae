import type { CollectionConfig } from "payload";
import { anyone } from "../access";

export const Categories: CollectionConfig = {
  slug: "categories",
  access: { read: anyone },
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
  ],
};
