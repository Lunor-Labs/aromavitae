import type { CollectionConfig } from "payload";
import { anyone } from "../access";
import {
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import { slugify } from "../../lib/utils";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const BlogPosts: CollectionConfig = {
  slug: "blog-posts",
  access: { read: anyone },
  orderable: true,
  admin: {
    group: "Blog",
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedAt", "isFeatured"],
  },
  fields: [
    { name: "title", type: "text", required: true, maxLength: 200 },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      maxLength: 200,
      admin: {
        position: "sidebar",
        description: "The post's address: /blog/<slug>. Filled in from the title when left empty.",
      },
      hooks: {
        beforeValidate: [({ value, data }) => value || (data?.title ? slugify(data.title) : value)],
      },
      validate: (value: string | null | undefined) =>
        !value || SLUG_PATTERN.test(value) || "Use lowercase letters, numbers and hyphens only.",
    },
    { name: "excerpt", type: "textarea", required: true, maxLength: 500 },
    {
      name: "content",
      type: "richText",
      required: true,
      // Only what BlogDetail has styles for
      editor: lexicalEditor({
        features: () => [
          ParagraphFeature(),
          HeadingFeature({ enabledHeadingSizes: ["h1", "h2"] }),
          BoldFeature(),
          ItalicFeature(),
          UnderlineFeature(),
          UnorderedListFeature(),
          OrderedListFeature(),
          LinkFeature(),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
    { name: "coverImage", type: "upload", relationTo: "media", required: true },
    {
      name: "category",
      type: "relationship",
      relationTo: "blog-categories",
      admin: { position: "sidebar" },
    },
    {
      name: "publishedAt",
      type: "date",
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: "sidebar", date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "isFeatured",
      label: "Featured",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar", description: "Shown large at the top of the blog page." },
    },
  ],
};
