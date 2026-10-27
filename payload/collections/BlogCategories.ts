import type { CollectionConfig } from "payload";

export const BlogCategories: CollectionConfig = {
  slug: "blog-categories",
  orderable: true,
  admin: {
    group: "Blog",
    useAsTitle: "name",
  },
  fields: [{ name: "name", type: "text", required: true, maxLength: 120 }],
};
