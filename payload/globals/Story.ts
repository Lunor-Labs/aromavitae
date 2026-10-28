import type { Field, GlobalConfig } from "payload";
import { anyone } from "../access";

const panelFields: Field[] = [
  { name: "eyebrow", label: "Small title", type: "text", required: true },
  {
    name: "heading",
    type: "textarea",
    required: true,
    admin: { rows: 2, description: "Press Enter to break the line." },
  },
  { name: "body", type: "textarea", required: true },
  {
    type: "row",
    fields: [
      { name: "ctaLabel", label: "Link text", type: "text", required: true, admin: { width: "50%" } },
      { name: "ctaHref", label: "Link", type: "text", required: true, admin: { width: "50%" } },
    ],
  },
];

export const Story: GlobalConfig = {
  slug: "story",
  access: { read: anyone },
  label: "Our Story",
  admin: {
    group: "Homepage",
    description: "The two panels under the homepage banner.",
  },
  fields: [
    { name: "ourStory", label: "Left panel (Our Story)", type: "group", fields: panelFields },
    {
      name: "heritage",
      label: "Right panel (Heritage)",
      type: "group",
      fields: [
        ...panelFields,
        {
          name: "badges",
          type: "array",
          maxRows: 3,
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "icon",
                  type: "select",
                  required: true,
                  defaultValue: "book",
                  options: [
                    { label: "Book", value: "book" },
                    { label: "Leaf", value: "leaf" },
                    { label: "Shield", value: "shield" },
                  ],
                  admin: { width: "30%" },
                },
                { name: "label", type: "textarea", required: true, admin: { width: "70%", rows: 2 } },
              ],
            },
          ],
        },
      ],
    },
  ],
};
