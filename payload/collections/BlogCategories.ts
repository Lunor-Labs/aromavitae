import type { CollectionConfig } from "payload";
import { anyone } from "../access";

export const BlogCategories: CollectionConfig = {
  slug: "blog-categories",
  access: { read: anyone },
  orderable: true,
  admin: {
    group: "Blog",
    useAsTitle: "name",
  },
  fields: [{ name: "name", type: "text", required: true, maxLength: 120 }],
};
