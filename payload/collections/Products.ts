import type { CollectionConfig } from "payload";
import { SIZE_UNITS } from "../../types/product";

type Sizes = { sizeValue?: number | null; sizeUnit?: string | null };

const wholeNumber = (label: string) => (value: number | null | undefined) =>
  value == null || Number.isInteger(value) || `${label} must be a whole number.`;

export const Products: CollectionConfig = {
  slug: "products",
  orderable: true,
  admin: {
    group: "Shop",
    useAsTitle: "name",
    defaultColumns: ["name", "category", "price", "isBestSeller"],
    description: "Drag rows to change the order products appear on the site.",
  },
  fields: [
    { name: "name", type: "text", required: true, maxLength: 200 },
    {
      type: "row",
      fields: [
        {
          name: "price",
          type: "number",
          required: true,
          min: 0,
          admin: { step: 1, width: "50%", description: "Whole amount, no cents." },
          validate: wholeNumber("Price"),
        },
        {
          name: "currency",
          type: "text",
          required: true,
          defaultValue: "LKR",
          maxLength: 8,
          admin: { width: "50%" },
        },
      ],
    },
    {
      // Optional only because products from before sizes existed have none;
      // a size and its unit are always set together.
      type: "row",
      fields: [
        {
          name: "sizeValue",
          label: "Size",
          type: "number",
          min: 0,
          max: 100000,
          admin: { width: "50%", description: "Volume or weight, e.g. 100 for 100g." },
          validate: (value: number | null | undefined, { siblingData }: { siblingData: Sizes }) =>
            value != null || !siblingData.sizeUnit || "Enter a size for the chosen unit.",
        },
        {
          name: "sizeUnit",
          label: "Unit",
          type: "select",
          options: [...SIZE_UNITS],
          admin: { width: "50%" },
          validate: (value: string | null | undefined, { siblingData }: { siblingData: Sizes }) =>
            Boolean(value) || siblingData.sizeValue == null || "Pick a unit for the size.",
        },
      ],
    },
    { name: "category", type: "relationship", relationTo: "categories" },
    { name: "image", label: "Main image", type: "upload", relationTo: "media", required: true },
    {
      name: "sideImages",
      label: "More images",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      maxRows: 10,
    },
    { name: "description", type: "textarea", maxLength: 5000 },
    { name: "tags", type: "text", hasMany: true, maxRows: 10 },
    {
      type: "row",
      fields: [
        {
          name: "rating",
          type: "number",
          required: true,
          min: 0,
          max: 5,
          defaultValue: 5,
          admin: { step: 0.1, width: "50%" },
        },
        {
          name: "reviewCount",
          type: "number",
          required: true,
          min: 0,
          defaultValue: 0,
          admin: { step: 1, width: "50%" },
          validate: wholeNumber("Review count"),
        },
      ],
    },
    {
      name: "isBestSeller",
      label: "Best seller",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    {
      name: "legacyId",
      type: "text",
      index: true,
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "ID from the old admin. Old /products/<id> links redirect here through it.",
        condition: (data) => Boolean(data?.legacyId),
      },
    },
  ],
};
