import type { Endpoint } from "payload";
import { renderEmail } from "../email/templates";
import { fail } from "../http";

/** The Send test email button in Email Settings: sends to the staff member who pressed it. */
export const emailTestEndpoint: Endpoint = {
  path: "/shop/email-test",
  method: "post",
  handler: async (req) => {
    if (req.user?.collection !== "users") return fail(403, "Staff only.");
    if (!process.env.SMTP_HOST) return fail(503, "The mail server isn't set up yet: SMTP_HOST is empty on the server.");

    try {
      await req.payload.sendEmail({
        to: req.user.email,
        subject: "AROMAVITAE test email",
        html: renderEmail({
          heading: "It works",
          intro: "If you can read this, the shop can send email.",
          signature: "AROMAVITAE shop",
        }),
      });
    } catch (error) {
      req.payload.logger.error({ err: error }, "Test email failed");
      const reason = error instanceof Error ? error.message : "unknown error";
      return fail(502, `The mail server refused it: ${reason}`);
    }
    return Response.json({ message: `Sent to ${req.user.email}. Check that inbox, and its spam folder.` });
  },
};
