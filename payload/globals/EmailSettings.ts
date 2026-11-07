import type { Field, GlobalConfig } from "payload";
import { adminsOnly } from "../access";
import { EMAIL_DEFAULTS, type EmailKind } from "../shop/email/defaults";

/** One email's wording. Anything left empty uses the text it starts with. */
const wording = (name: EmailKind, label: string): Field => ({
  type: "collapsible",
  label,
  admin: { initCollapsed: true },
  fields: [
    {
      name: `${name}Subject`,
      label: "Subject",
      type: "text",
      admin: { placeholder: EMAIL_DEFAULTS[name].subject },
    },
    {
      name: `${name}Intro`,
      label: "Message",
      type: "textarea",
      admin: { placeholder: EMAIL_DEFAULTS[name].intro },
    },
  ],
});

export const EmailSettings: GlobalConfig = {
  slug: "email-settings",
  access: { read: adminsOnly, update: adminsOnly },
  label: "Email Settings",
  admin: {
    group: "Shop",
    description:
      "Who gets alerts and what emails say. {order} in any subject or message becomes the order number. The mail server itself is set up on the server.",
  },
  fields: [
    {
      name: "testEmail",
      type: "ui",
      admin: { components: { Field: "/admin/SendTestEmail#SendTestEmail" } },
    },
    {
      name: "replyTo",
      label: "Reply-to address",
      type: "email",
      admin: { description: "Where customers' replies go." },
    },
    {
      name: "staffAlerts",
      label: "Staff alerts go to",
      labels: { singular: "Address", plural: "Addresses" },
      type: "array",
      admin: { description: "These addresses get new-order and low-stock alerts." },
      fields: [{ name: "email", type: "email", required: true }],
    },
    {
      name: "signature",
      type: "textarea",
      admin: { description: "The closing line of every email.", placeholder: "With warm regards,\nThe AROMAVITAE team" },
    },
    wording("confirmation", "Order confirmation"),
    wording("shipped", "Order shipped"),
    wording("delivered", "Order delivered"),
    wording("cancelled", "Order cancelled"),
    wording("setPassword", "Set your password (new guest accounts)"),
    wording("passwordReset", "Reset your password"),
  ],
};
