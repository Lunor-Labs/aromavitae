import { APIError, type CollectionBeforeChangeHook, type CollectionConfig, type Field } from "payload";
import { adminsOnly } from "../access";
import { returnStock } from "../shop/stock";
import { ORDER_STATUSES, STATUS_LABELS, canChangeStatus, releasesStock, type OrderStatus } from "../../lib/shop/orderStatus";
import { CURRENCIES } from "../../lib/shop/money";
import type { Order } from "../payload-types";

/** Set on changes the shop makes itself, like a late payment on an expired order. */
export interface OrderContext {
  systemStatusChange?: boolean;
  statusNote?: string;
}

/** Facts about what happened. Staff can read them, only the shop writes them. */
const locked = (field: Field): Field =>
  ({
    ...field,
    access: { update: () => false },
    admin: { ...(field as { admin?: object }).admin, readOnly: true },
  }) as Field;

const money = (name: string, label: string): Field =>
  locked({ name, label, type: "number", required: true, admin: { width: "50%" } });

const handleStatusChange: CollectionBeforeChangeHook<Order> = async ({ data, originalDoc, req, operation, context }) => {
  if (operation !== "update" || !originalDoc || !data.status || data.status === originalDoc.status) return data;

  const from = originalDoc.status as OrderStatus;
  const to = data.status as OrderStatus;
  const { systemStatusChange, statusNote } = context as OrderContext;

  if (!systemStatusChange && !canChangeStatus(from, to)) {
    throw new APIError(`An order can't go from "${STATUS_LABELS[from]}" to "${STATUS_LABELS[to]}".`, 400, undefined, true);
  }

  if (originalDoc.stockHeld && releasesStock(from, to)) {
    for (const item of originalDoc.items ?? []) {
      await returnStock(req, { productId: item.productId, variantId: item.variantId, quantity: item.quantity });
    }
    data.stockHeld = false;
  }

  data.statusHistory = [
    ...(originalDoc.statusHistory ?? []),
    {
      from,
      to,
      at: new Date().toISOString(),
      by: req.user?.collection === "users" ? req.user.email : "Shop",
      note: statusNote ?? null,
    },
  ];
  return data;
};

const statusOptions = ORDER_STATUSES.map((value) => ({ label: STATUS_LABELS[value], value }));

export const Orders: CollectionConfig = {
  slug: "orders",
  labels: { singular: "Order", plural: "Orders" },
  access: {
    // Orders are only ever made by checkout, and customers see theirs through /api/shop/orders.
    create: () => false,
    read: adminsOnly,
    update: adminsOnly,
    // Real orders are records of sales and stay. Test orders can be cleared out.
    delete: ({ req }) => (req.user?.collection === "users" ? { isTest: { equals: true } } : false),
  },
  admin: {
    group: "Shop",
    useAsTitle: "orderNumber",
    defaultColumns: ["orderNumber", "status", "email", "total", "currency", "isTest", "createdAt"],
    listSearchableFields: ["orderNumber", "email"],
    pagination: { defaultLimit: 25 },
  },
  defaultSort: "-createdAt",
  hooks: { beforeChange: [handleStatusChange] },
  fields: [
    locked({ name: "orderNumber", label: "Order number", type: "text", required: true, unique: true, index: true }),
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending_payment",
      enumName: "enum_orders_status",
      options: statusOptions,
      index: true,
      admin: {
        position: "sidebar",
        description: "Changing this emails the customer. Cancelling puts the items back in stock.",
      },
    },
    locked({ name: "isTest", label: "Test order", type: "checkbox", defaultValue: false, admin: { position: "sidebar" } }),
    locked({
      name: "needsAttention",
      label: "Needs attention",
      type: "textarea",
      admin: { position: "sidebar", description: "Set when something needs a person: a chargeback, or a payment with no stock left." },
    }),
    {
      name: "internalNotes",
      label: "Staff notes",
      type: "textarea",
      admin: { position: "sidebar", description: "Never shown to the customer." },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Order",
          fields: [
            locked({ name: "email", type: "email", required: true, index: true }),
            locked({ name: "customer", type: "relationship", relationTo: "customers", index: true }),
            locked({
              name: "items",
              type: "array",
              required: true,
              admin: { initCollapsed: false },
              fields: [
                { name: "name", type: "text", required: true },
                { name: "sizeLabel", label: "Size", type: "text" },
                { name: "image", type: "text", admin: { hidden: true } },
                { name: "productId", label: "Product ID", type: "number", required: true },
                { name: "variantId", type: "text", admin: { hidden: true } },
                { name: "quantity", type: "number", required: true },
                { name: "unitPrice", label: "Price each", type: "number", required: true },
                { name: "unitPriceLkr", label: "Price each (LKR)", type: "number", required: true },
                { name: "lineTotal", label: "Line total", type: "number", required: true },
              ],
            }),
            locked({ name: "customerNotes", label: "Customer's notes", type: "textarea" }),
            {
              type: "row",
              fields: [
                locked({
                  name: "currency",
                  type: "select",
                  required: true,
                  enumName: "enum_orders_currency",
                  options: [...CURRENCIES],
                  admin: { width: "50%" },
                }),
                locked({
                  name: "exchangeRate",
                  label: "1 unit in LKR",
                  type: "number",
                  required: true,
                  admin: { width: "50%", description: "The rate when this order was placed." },
                }),
              ],
            },
            { type: "row", fields: [money("subtotal", "Subtotal"), money("subtotalLkr", "Subtotal (LKR)")] },
            { type: "row", fields: [money("shippingAmount", "Shipping"), money("shippingLkr", "Shipping (LKR)")] },
            { type: "row", fields: [money("total", "Total charged"), money("totalLkr", "Total (LKR)")] },
          ],
        },
        {
          label: "Shipping",
          fields: [
            locked({ name: "shippingMethod", label: "Method", type: "text", required: true }),
            locked({ name: "shippingEstimate", label: "Delivery time", type: "text" }),
            {
              name: "tracking",
              type: "group",
              admin: { description: "Shown on the customer's order page and in the shipped email." },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "carrier", type: "text", admin: { width: "50%" } },
                    { name: "number", label: "Tracking number", type: "text", admin: { width: "50%" } },
                  ],
                },
                {
                  name: "url",
                  label: "Tracking link",
                  type: "text",
                  validate: (value: string | null | undefined) =>
                    !value || /^https?:\/\//.test(value) || "Use a full link, starting with https://",
                },
              ],
            },
            {
              name: "shippingAddress",
              label: "Ship to",
              type: "group",
              access: { update: ({ doc }) => doc?.status !== "shipped" && doc?.status !== "delivered" },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "fullName", label: "Full name", type: "text", required: true, admin: { width: "50%" } },
                    { name: "phone", type: "text", required: true, admin: { width: "50%" } },
                  ],
                },
                { name: "line1", label: "Address", type: "text", required: true },
                { name: "line2", label: "Address line 2", type: "text" },
                {
                  type: "row",
                  fields: [
                    { name: "city", type: "text", required: true, admin: { width: "25%" } },
                    { name: "region", label: "District / region", type: "text", admin: { width: "25%" } },
                    { name: "postalCode", label: "Postal code", type: "text", admin: { width: "25%" } },
                    { name: "country", type: "text", required: true, admin: { width: "25%" } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "History",
          fields: [
            locked({
              name: "statusHistory",
              label: "Status changes",
              labels: { singular: "Change", plural: "Changes" },
              type: "array",
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "from", type: "text", admin: { width: "25%" } },
                    { name: "to", type: "text", admin: { width: "25%" } },
                    { name: "at", type: "date", admin: { width: "25%", date: { pickerAppearance: "dayAndTime" } } },
                    { name: "by", type: "text", admin: { width: "25%" } },
                  ],
                },
                { name: "note", type: "text" },
              ],
            }),
            locked({
              name: "paymentLog",
              label: "What PayHere reported",
              labels: { singular: "Report", plural: "Reports" },
              type: "array",
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "at", type: "date", admin: { width: "25%", date: { pickerAppearance: "dayAndTime" } } },
                    { name: "statusCode", label: "Status code", type: "text", admin: { width: "25%" } },
                    { name: "amount", type: "text", admin: { width: "25%" } },
                    { name: "method", type: "text", admin: { width: "25%" } },
                  ],
                },
                { name: "paymentId", label: "PayHere payment ID", type: "text" },
                { name: "message", type: "text" },
              ],
            }),
            locked({ name: "paymentId", label: "PayHere payment ID", type: "text", index: true }),
            locked({ name: "paidAt", label: "Paid at", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } }),
            locked({ name: "attempts", label: "Payment attempts", type: "number", defaultValue: 0 }),
            locked({ name: "stockHeld", label: "Holding stock", type: "checkbox", defaultValue: false }),
            locked({ name: "expiresAt", label: "Unpaid until", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } }),
          ],
        },
      ],
    },
    // The private link in the customer's emails. Whoever has it can see the order, so staff don't need it on screen.
    locked({ name: "publicToken", type: "text", required: true, unique: true, index: true, admin: { hidden: true } }),
  ],
};
