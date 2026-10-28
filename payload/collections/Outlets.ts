import type { CollectionConfig } from "payload";
import { anyone } from "../access";

export const Outlets: CollectionConfig = {
  slug: "outlets",
  access: { read: anyone },
  orderable: true,
  admin: {
    group: "Content",
    useAsTitle: "name",
    defaultColumns: ["name", "phone", "address"],
  },
  fields: [
    { name: "name", type: "text", required: true, maxLength: 200 },
    { name: "address", type: "textarea", required: true, maxLength: 500 },
    { name: "phone", type: "text", required: true, maxLength: 50 },
    { name: "description", type: "textarea", required: true, maxLength: 2000 },
    { name: "image", type: "upload", relationTo: "media", required: true },
  ],
};
