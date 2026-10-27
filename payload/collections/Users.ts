import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    group: "Administration",
    useAsTitle: "email",
    defaultColumns: ["email", "name", "updatedAt"],
  },
  fields: [{ name: "name", type: "text" }],
};
