import type { GlobalConfig } from "payload";
import { anyone } from "../access";
import { linkGroup } from "../fields/link";

export const Hero: GlobalConfig = {
  slug: "hero",
  access: { read: anyone },
  admin: {
    group: "Homepage",
    description: "The banner at the top of the homepage. With no slides, the built-in banner is shown.",
  },
  fields: [
    {
      name: "slides",
      type: "array",
      labels: { singular: "Slide", plural: "Slides" },
      admin: { initCollapsed: true },
      fields: [
        {
          name: "heading",
          type: "textarea",
          required: true,
          admin: { rows: 2, description: "Press Enter to break the line." },
        },
        { name: "subheading", type: "textarea", required: true, admin: { rows: 3 } },
        {
          type: "row",
          fields: [
            {
              name: "desktopImage",
              type: "upload",
              relationTo: "media",
              admin: {
                width: "50%",
                description: "Wide picture for tablets and computers. Empty uses the built-in banner.",
              },
            },
            {
              name: "mobileImage",
              type: "upload",
              relationTo: "media",
              admin: {
                width: "50%",
                description: "Tall picture for phones. Empty uses the desktop picture.",
              },
            },
          ],
        },
        linkGroup("ctaPrimary", "Main button"),
        linkGroup("ctaSecondary", "Second button"),
      ],
    },
    {
      name: "autoPlayMs",
      label: "Time per slide (milliseconds)",
      type: "number",
      min: 1000,
      defaultValue: 6000,
      admin: { step: 500, description: "6000 = 6 seconds. Only used with more than one slide." },
    },
  ],
};
