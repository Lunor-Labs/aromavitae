import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { anyone, staffWrites } from "../access";
import { slugify } from "../../lib/utils";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Terms, returns and privacy. PayHere won't approve a site without them. */
export const LegalPages: CollectionConfig = {
  slug: "legal-pages",
  labels: { singular: "Policy page", plural: "Policy pages" },
  access: { read: anyone, ...staffWrites },
  orderable: true,
  admin: {
    group: "Site",
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "updatedAt"],
    description: "Terms, returns and privacy. Each one is linked from the footer.",
  },
  fields: [
    { name: "title", type: "text", required: true, maxLength: 120 },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      maxLength: 120,
      admin: {
        position: "sidebar",
        description: "The page's address: /policies/<slug>. Filled in from the title when left empty.",
      },
      hooks: {
        beforeValidate: [({ value, data }) => value || (data?.title ? slugify(data.title) : value)],
      },
      validate: (value: string | null | undefined) =>
        !value || SLUG_PATTERN.test(value) || "Use lowercase letters, numbers and hyphens only.",
    },
    { name: "content", type: "richText", required: true, editor: lexicalEditor() },
  ],
};
