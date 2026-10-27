import type { GlobalConfig } from "payload";

export const Announcement: GlobalConfig = {
  slug: "announcement",
  label: "Announcement Bar",
  admin: {
    group: "Site",
    description: "The scrolling strip above the menu on every page.",
  },
  fields: [
    {
      name: "messages",
      type: "array",
      labels: { singular: "Message", plural: "Messages" },
      fields: [{ name: "text", type: "text", required: true }],
    },
  ],
};
