import type { Address } from "@/lib/shop/schemas";
import type { CurrencyCode } from "@/lib/shop/money";
import type { OrderStatus } from "@/lib/shop/orderStatus";

/** What a customer may see of an order. Staff notes and payment logs never leave the CMS. */
export interface OrderView {
  token: string;
  orderNumber: string;
  status: OrderStatus;
  isPaid: boolean;
  canRetry: boolean;
  attemptsLeft: number;
  createdAt: string;
  email: string;
  address: Address;
  notes: string;
  lines: {
    name: string;
    sizeLabel: string | null;
    image: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  currency: CurrencyCode;
  subtotal: number;
  shippingMethod: string;
  shippingEstimate: string | null;
  shippingAmount: number;
  total: number;
  tracking: { carrier: string | null; number: string | null; url: string | null } | null;
}

/** The form the browser posts to PayHere's hosted page. */
export interface PayHereForm {
  action: string;
  fields: Record<string, string>;
}

export interface CheckoutResult {
  token: string;
  payhere: PayHereForm;
}
