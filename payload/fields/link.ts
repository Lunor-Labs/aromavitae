import type { GroupField } from "payload";

/** A `{ label, href }` pair, rendered side by side in the admin. */
export function linkGroup(name: string, label: string, required = true): GroupField {
  return {
    name,
    label,
    type: "group",
    fields: [
      {
        type: "row",
        fields: [
          { name: "label", type: "text", required, admin: { width: "50%" } },
          {
            name: "href",
            label: "Link",
            type: "text",
            required,
            admin: { width: "50%", description: "A site path like /products, or a full URL." },
          },
        ],
      },
    ],
  };
}
