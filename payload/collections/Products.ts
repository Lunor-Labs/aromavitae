import type { CollectionAfterChangeHook, CollectionBeforeValidateHook, CollectionConfig } from "payload";
import { adminsOnlyField, anyone, staffWrites } from "../access";
import { queueLowStockAlert } from "../shop/jobs/lowStockAlert";
import { DEFAULT_LOW_STOCK_LEVEL, crossedLowStock, type LowStockItem } from "../../lib/shop/lowStock";
import { SIZE_UNITS } from "../../types/product";
import { formatSize } from "../../lib/utils";
import type { Product } from "../payload-types";

type Sizes = { sizeValue?: number | null; sizeUnit?: string | null };
type Prices = { price?: number | null; salePrice?: number | null; priceMax?: number | null };
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

/** The top of a price range: above the price, and never alongside a sale price. */
const priceMax = (value: number | null | undefined, { siblingData }: { siblingData: Prices }) => {
  const whole = wholeNumber("Price up to")(value);
  if (whole !== true) return whole;
  if (value == null) return true;
  if (siblingData.salePrice != null) return "A price range can't have a sale price. Clear one of them.";
  return siblingData.price == null || value > siblingData.price || "Must be higher than the price.";
};

/** How many are left, and what one weighs when shipped. On the product, or on each size. */
const inventoryFields = (condition?: (data: Partial<{ variants: unknown[] | null }>) => boolean) => [
  {
    name: "stock",
    type: "number" as const,
    min: 0,
    admin: {
      step: 1,
      width: "50%",
      description: "How many are left. Leave empty to not track stock: it never sells out.",
      condition,
    },
    validate: wholeNumber("Stock"),
  },
  {
    name: "weightGrams",
    label: "Shipping weight (g)",
    type: "number" as const,
    min: 0,
    admin: {
      step: 1,
      width: "50%",
      description: "Packed weight. Leave empty to use the default in Shop Settings.",
      condition,
    },
    validate: wholeNumber("Shipping weight"),
  },
];

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
    priceMax: null,
    sizeValue: null,
    sizeUnit: null,
    stock: null,
    weightGrams: null,
  };
};

/** Staff saving a lower stock count can cross the level too, not only a sale. */
const alertOnLowStock: CollectionAfterChangeHook<Product> = async ({ doc, previousDoc, operation, req }) => {
  if (operation !== "update") return doc;

  const settings = await req.payload.findGlobal({ slug: "shop-settings", req, overrideAccess: true });
  const level = doc.lowStockAt ?? settings.lowStockLevel ?? DEFAULT_LOW_STOCK_LEVEL;

  const items: LowStockItem[] = [];
  const crossed = (before: number | null | undefined, after: number | null | undefined, sizeLabel: string | null) => {
    if (crossedLowStock(before, after, level)) {
      items.push({ productId: doc.id, name: doc.name, sizeLabel, stock: after as number, level });
    }
  };
  crossed(previousDoc.stock, doc.stock, null);
  for (const variant of doc.variants ?? []) {
    const before = previousDoc.variants?.find((v) => v.id === variant.id);
    crossed(before?.stock, variant.stock, formatSize(variant));
  }

  await queueLowStockAlert(req, items);
  return doc;
};

export const Products: CollectionConfig = {
  slug: "products",
  access: { read: anyone, ...staffWrites },
  orderable: true,
  admin: {
    group: "Shop",
    useAsTitle: "name",
    defaultColumns: ["name", "category", "price", "isBestSeller"],
    description: "Drag rows to change the order products appear on the site.",
  },
  hooks: { beforeValidate: [priceFromVariants], afterChange: [alertOnLowStock] },
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
            width: "25%",
            description: "Whole amount, no cents. With a range, the lowest price.",
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
            width: "25%",
            description: "Optional. Shown with the price struck through.",
            condition: (data) => !hasVariants(data),
          },
          validate: salePrice,
        },
        {
          name: "priceMax",
          label: "Price up to",
          type: "number",
          min: 0,
          admin: {
            step: 1,
            width: "25%",
            description: "Optional. Shows a range, e.g. LKR 18,000–24,000. A range can't be bought online: it keeps the WhatsApp button until it has one exact price or sizes.",
            condition: (data) => !hasVariants(data),
          },
          validate: priceMax,
        },
        {
          name: "currency",
          type: "text",
          required: true,
          defaultValue: "LKR",
          maxLength: 8,
          admin: { width: "25%" },
        },
      ],
    },
    { type: "row", fields: sizeFields(false, (data) => !hasVariants(data)) },
    { type: "row", fields: inventoryFields((data) => !hasVariants(data)) },
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
        { type: "row", fields: inventoryFields() },
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
    {
      name: "tagline",
      type: "text",
      maxLength: 200,
      admin: { description: "Optional. One line under the name on the product page." },
    },
    {
      name: "cardText",
      label: "Card text",
      type: "textarea",
      maxLength: 300,
      admin: { description: "Optional. One or two sentences under the name on product cards." },
    },
    {
      name: "description",
      type: "textarea",
      maxLength: 5000,
      admin: { description: "The full text on the product page." },
    },
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
      name: "domesticOnly",
      label: "Sri Lanka only",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Can't be shipped abroad, for example because of export rules.",
      },
    },
    {
      name: "lowStockAt",
      label: "Low-stock level",
      type: "number",
      min: 0,
      access: { read: adminsOnlyField },
      admin: {
        position: "sidebar",
        step: 1,
        description: "Optional. Overrides the level in Shop Settings for this product.",
      },
      validate: wholeNumber("Low-stock level"),
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
