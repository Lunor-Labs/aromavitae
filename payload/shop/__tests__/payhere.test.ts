import { describe, expect, it } from "vitest";
import { checkoutHash, formatAmount, isGenuineNotify, matchesOrder, notifySignature, type PayHereConfig } from "../payhere";

const config: PayHereConfig = { merchantId: "1211149", merchantSecret: "sandboxsecret", action: "" };

// Worked out separately with md5sum, following PayHere's formula by hand.
const CHECKOUT_HASH = "8C8722E70E5C5D56AE1AF6152BDFA987";
const SUCCESS_SIGNATURE = "4FB93A1F3C7817050BD5B2CE6B6808F3";

const notify = {
  merchantId: "1211149",
  orderId: "AV-000123",
  amount: "17.67",
  currency: "USD",
  statusCode: "2",
  signature: SUCCESS_SIGNATURE,
};

describe("PayHere signatures", () => {
  it("signs the checkout form the way PayHere expects", () => {
    expect(checkoutHash(config, "AV-000123", "17.67", "USD")).toBe(CHECKOUT_HASH);
  });

  it("works out the notify signature the way PayHere does", () => {
    expect(notifySignature(config, notify)).toBe(SUCCESS_SIGNATURE);
  });

  it("accepts a genuine notification, in either case", () => {
    expect(isGenuineNotify(config, notify)).toBe(true);
    expect(isGenuineNotify(config, { ...notify, signature: SUCCESS_SIGNATURE.toLowerCase() })).toBe(true);
  });

  it("rejects anything that was changed or signed with another secret", () => {
    expect(isGenuineNotify(config, { ...notify, amount: "1.00" })).toBe(false);
    expect(isGenuineNotify(config, { ...notify, statusCode: "0" })).toBe(false);
    expect(isGenuineNotify(config, { ...notify, orderId: "AV-000124" })).toBe(false);
    expect(isGenuineNotify(config, { ...notify, merchantId: "999" })).toBe(false);
    expect(isGenuineNotify(config, { ...notify, signature: "" })).toBe(false);
    expect(isGenuineNotify({ ...config, merchantSecret: "other" }, notify)).toBe(false);
  });
});

describe("amounts", () => {
  it("always has two decimals", () => {
    expect(formatAmount(5300)).toBe("5300.00");
    expect(formatAmount(17.6)).toBe("17.60");
  });

  it("only matches the order's exact amount and currency", () => {
    const order = { total: 17.67, currency: "USD" as const };
    expect(matchesOrder(order, "17.67", "USD")).toBe(true);
    expect(matchesOrder(order, "17.66", "USD")).toBe(false);
    expect(matchesOrder(order, "17.67", "LKR")).toBe(false);
    expect(matchesOrder({ total: 5300, currency: "LKR" }, "5300.00", "LKR")).toBe(true);
  });
});
