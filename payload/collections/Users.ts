import type { CollectionConfig } from "payload";
import { adminsOnly, staffWrites } from "../access";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  access: { ...staffWrites, read: adminsOnly, unlock: adminsOnly, admin: ({ req }) => req.user?.collection === "users" },
  admin: {
    group: "Administration",
    useAsTitle: "email",
    defaultColumns: ["email", "name", "updatedAt"],
  },
  fields: [{ name: "name", type: "text" }],
};
