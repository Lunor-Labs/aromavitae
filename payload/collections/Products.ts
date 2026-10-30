import type { CollectionBeforeValidateHook, CollectionConfig } from "payload";
import { anyone } from "../access";
import { SIZE_UNITS } from "../../types/product";

type Sizes = { sizeValue?: number | null; sizeUnit?: string | null };
type Prices = { price?: number | null; salePrice?: number | null };
type Variant = Prices & Sizes;

const wholeNumber = (label: string) => (value: number | null | undefined) =>
  value == null || Number.isInteger(value) || `${label} must be a whole number.`;

const salePrice = (value: number | null | undefined, { siblingData }: { siblingData: Prices }) => {
  const whole = wholeNumber("Sale price")(value);
  if (whole !== true) return whole;
  return (
    value == null ||
    siblingData.price == null ||
    value < siblingData.price ||
    "Sale price must be lower than the price."
  );
};

const hasVariants = (data: Partial<{ variants: unknown[] | null }> | undefined) =>
  Boolean(data?.variants?.length);

/**
 * A size and its unit, always set together. On the product itself both are
 * optional, because products from before sizes existed have none; on a row of
 * the sizes table both are required.
 */
const sizeFields = (
  required: boolean,
  condition?: (data: Partial<{ variants: unknown[] | null }>) => boolean
) => [
  {
    name: "sizeValue",
    label: "Size",
    type: "number" as const,
    min: 0,
    max: 100000,
    admin: { width: "50%", description: "Volume or weight, e.g. 100 for 100g.", condition },
    required,
    validate: (value: number | null | undefined, { siblingData }: { siblingData: Sizes }) =>
      value != null || (!required && !siblingData.sizeUnit) || "Enter a size for the chosen unit.",
  },
  {
    name: "sizeUnit",
    label: "Unit",
    type: "select" as const,
    options: [...SIZE_UNITS],
    admin: { width: "50%", condition },
    required,
    validate: (value: string | null | undefined, { siblingData }: { siblingData: Sizes }) =>
      Boolean(value) || (!required && siblingData.sizeValue == null) || "Pick a unit for the size.",
  },
];

/**
 * A product with sizes keeps its top-level price filled with the cheapest size,
 * so cards can show "From …" and anything sorting or filtering by price keeps
 * working. The top-level size means nothing then, so it is cleared.
 */
const priceFromVariants: CollectionBeforeValidateHook = ({ data }) => {
  const variants = (data?.variants ?? []) as Variant[];
  const priced = variants.filter((v) => typeof v.price === "number");
  if (!data || priced.length === 0) return data;

  const effective = (v: Variant) => v.salePrice ?? v.price!;
  const cheapest = priced.reduce((min, v) => (effective(v) < effective(min) ? v : min));
  return {
    ...data,
    price: cheapest.price,
    salePrice: cheapest.salePrice ?? null,
    sizeValue: null,
    sizeUnit: null,
  };
};

export const Products: CollectionConfig = {
  slug: "products",
  access: { read: anyone },
  orderable: true,
  admin: {
    group: "Shop",
    useAsTitle: "name",
    defaultColumns: ["name", "category", "price", "isBestSeller"],
    description: "Drag rows to change the order products appear on the site.",
  },
  hooks: { beforeValidate: [priceFromVariants] },
  fields: [
    { name: "name", type: "text", required: true, maxLength: 200 },
    {
      // Hidden once the product has sizes: each size carries its own price.
      type: "row",
      fields: [
        {
          name: "price",
          type: "number",
          required: true,
          min: 0,
          admin: {
            step: 1,
            width: "33%",
            description: "Whole amount, no cents.",
            condition: (data) => !hasVariants(data),
          },
          validate: wholeNumber("Price"),
        },
        {
          name: "salePrice",
          label: "Sale price",
          type: "number",
          min: 0,
          admin: {
            step: 1,
            width: "33%",
            description: "Optional. Shown with the price struck through.",
            condition: (data) => !hasVariants(data),
          },
          validate: salePrice,
        },
        {
          name: "currency",
          type: "text",
          required: true,
          defaultValue: "LKR",
          maxLength: 8,
          admin: { width: "33%" },
        },
      ],
    },
    { type: "row", fields: sizeFields(false, (data) => !hasVariants(data)) },
    {
      name: "variants",
      label: "Sizes",
      labels: { singular: "Size", plural: "Sizes" },
      type: "array",
      admin: {
        description:
          "Leave empty for a single-size product. The first size is selected by default on the product page.",
        initCollapsed: false,
      },
      fields: [
        {
          type: "row",
          fields: sizeFields(true),
        },
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
              name: "salePrice",
              label: "Sale price",
              type: "number",
              min: 0,
              admin: { step: 1, width: "50%", description: "Optional." },
              validate: salePrice,
            },
          ],
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          admin: { description: "Optional. Shown when this size is picked." },
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
