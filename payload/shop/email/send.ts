import type { PayloadRequest } from "payload";
import type { EmailSetting, Order } from "../../payload-types";
import { siteUrl } from "../http";
import { DEFAULT_SIGNATURE, EMAIL_DEFAULTS, type EmailKind } from "./defaults";
import { fillIn, orderSummary, renderEmail, trackingSummary } from "./templates";

export type OrderEmailKind = Extract<EmailKind, "confirmation" | "shipped" | "delivered" | "cancelled">;

export const getEmailSettings = (req: PayloadRequest): Promise<EmailSetting> =>
  req.payload.findGlobal({ slug: "email-settings", req, overrideAccess: true });

/** Staff's wording for this email, or the text it starts with. */
export function emailWording(settings: EmailSetting, kind: EmailKind) {
  return {
    subject: settings[`${kind}Subject`] || EMAIL_DEFAULTS[kind].subject,
    intro: settings[`${kind}Intro`] || EMAIL_DEFAULTS[kind].intro,
    signature: settings.signature || DEFAULT_SIGNATURE,
  };
}

export const orderLink = (order: Pick<Order, "publicToken">) => `${siteUrl()}/order/${order.publicToken}`;

/** The link in a password email, which lands on the storefront's own page. */
export const passwordLink = (token: string) => `${siteUrl()}/account/reset-password?token=${encodeURIComponent(token)}`;

export async function sendOrderEmail(req: PayloadRequest, order: Order, kind: OrderEmailKind): Promise<void> {
  const settings = await getEmailSettings(req);
  const { subject, intro, signature } = emailWording(settings, kind);
  const filledSubject = fillIn(subject, order.orderNumber);

  const body =
    kind === "shipped"
      ? trackingSummary(order) + orderSummary(order)
      : kind === "cancelled" || kind === "delivered"
        ? ""
        : orderSummary(order);

  await req.payload.sendEmail({
    to: order.email,
    replyTo: settings.replyTo ?? undefined,
    subject: filledSubject,
    html: renderEmail({
      heading: filledSubject,
      intro: fillIn(intro, order.orderNumber),
      signature,
      body,
      button: { label: "View your order", url: orderLink(order) },
    }),
  });
}

/** Staff alerts, to whoever Email Settings lists. Nobody listed means no alert. */
export async function sendStaffAlert(req: PayloadRequest, subject: string, heading: string, body: string): Promise<void> {
  const settings = await getEmailSettings(req);
  const to = (settings.staffAlerts ?? []).map((row) => row.email);
  if (to.length === 0) return;
  await req.payload.sendEmail({
    to,
    subject,
    html: renderEmail({ heading, intro: "", signature: "AROMAVITAE shop", body }),
  });
}

/** A new guest account's email. The link lasts a week; after that, "forgot password" still works. */
export async function sendSetPasswordEmail(req: PayloadRequest, email: string): Promise<void> {
  const token = await req.payload.forgotPassword({
    collection: "customers",
    data: { email },
    disableEmail: true,
    expiration: 7 * 24 * 60 * 60 * 1000,
    overrideAccess: true,
    req,
  });
  const settings = await getEmailSettings(req);
  const { subject, intro, signature } = emailWording(settings, "setPassword");
  await req.payload.sendEmail({
    to: email,
    replyTo: settings.replyTo ?? undefined,
    subject,
    html: renderEmail({
      heading: subject,
      intro,
      signature,
      button: { label: "Choose a password", url: passwordLink(token) },
    }),
  });
}
