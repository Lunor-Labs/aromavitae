import type { Access, CollectionConfig } from "payload";
import { adminsOnly } from "../access";
import { emailWording, getEmailSettings, passwordLink } from "../shop/email/send";
import { renderEmail } from "../shop/email/templates";

/**
 * Customers and staff are separate collections with separate id sequences, so
 * customer 5 and staff user 5 are different people: always check which one
 * `req.user` is before comparing ids.
 */
const selfOrStaff: Access = ({ req }) => {
  if (req.user?.collection === "users") return true;
  if (req.user?.collection === "customers") return { id: { equals: req.user.id } };
  return false;
};

const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;
const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

export const Customers: CollectionConfig = {
  slug: "customers",
  auth: {
    tokenExpiration: ONE_WEEK_SECONDS,
    maxLoginAttempts: 5,
    lockTime: FIFTEEN_MINUTES_MS,
    forgotPassword: {
      generateEmailSubject: async (args) => {
        if (!args?.req) return "Reset your AROMAVITAE password";
        return emailWording(await getEmailSettings(args.req), "passwordReset").subject;
      },
      generateEmailHTML: async (args) => {
        const url = passwordLink(args?.token ?? "");
        if (!args?.req) return `<p><a href="${url}">Choose a new password</a></p>`;
        const { subject, intro, signature } = emailWording(await getEmailSettings(args.req), "passwordReset");
        return renderEmail({ heading: subject, intro, signature, button: { label: "Choose a new password", url } });
      },
    },
  },
  access: {
    admin: () => false,
    create: adminsOnly,
    read: selfOrStaff,
    update: selfOrStaff,
    delete: adminsOnly,
    unlock: adminsOnly,
  },
  admin: {
    group: "Shop",
    useAsTitle: "email",
    defaultColumns: ["email", "name", "phone", "createdAt"],
  },
  fields: [
    { name: "name", type: "text", maxLength: 120 },
    { name: "phone", type: "text", maxLength: 24 },
    {
      name: "addresses",
      type: "array",
      labels: { singular: "Address", plural: "Addresses" },
      admin: { initCollapsed: true },
      fields: [
        {
          type: "row",
          fields: [
            { name: "label", type: "text", maxLength: 40, admin: { width: "50%", description: "e.g. Home" } },
            { name: "isDefault", label: "Default", type: "checkbox", admin: { width: "50%" } },
          ],
        },
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
            {
              name: "country",
              type: "text",
              required: true,
              maxLength: 2,
              admin: { width: "25%", description: "Two-letter code, e.g. LK" },
            },
          ],
        },
      ],
    },
  ],
};
