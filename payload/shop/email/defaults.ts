/** What each email says until staff write their own in Email Settings. */
export const EMAIL_DEFAULTS = {
  confirmation: {
    subject: "Your AROMAVITAE order {order} is confirmed",
    intro: "Thank you for your order. We've received your payment and are getting it ready.",
  },
  shipped: {
    subject: "Your AROMAVITAE order {order} is on its way",
    intro: "Good news: your order has left us and is on its way to you.",
  },
  delivered: {
    subject: "Your AROMAVITAE order {order} has been delivered",
    intro: "Your order has been delivered. We hope you love it.",
  },
  cancelled: {
    subject: "Your AROMAVITAE order {order} has been cancelled",
    intro: "Your order has been cancelled. If you've paid, we'll refund you. Please reply to this email if you have any questions.",
  },
  setPassword: {
    subject: "Set a password for your AROMAVITAE account",
    intro: "We've set up an account for you so you can track your order and check out faster next time. Choose a password to start using it.",
  },
  passwordReset: {
    subject: "Reset your AROMAVITAE password",
    intro: "Use the button below to choose a new password. If you didn't ask for this, you can ignore this email.",
  },
} as const;

export type EmailKind = keyof typeof EMAIL_DEFAULTS;

export const DEFAULT_SIGNATURE = "With warm regards,\nThe AROMAVITAE team";
