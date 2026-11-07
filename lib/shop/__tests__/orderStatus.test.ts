import { describe, expect, it } from "vitest";
import { canChangeStatus, canRetryPayment, isPaidStatus, releasesStock } from "../orderStatus";

describe("status changes", () => {
  it("can't skip payment or go backwards", () => {
    expect(canChangeStatus("pending_payment", "shipped")).toBe(false);
    expect(canChangeStatus("pending_payment", "delivered")).toBe(false);
    expect(canChangeStatus("shipped", "processing")).toBe(false);
    expect(canChangeStatus("cancelled", "processing")).toBe(false);
  });

  it("follows the normal path", () => {
    expect(canChangeStatus("pending_payment", "processing")).toBe(true);
    expect(canChangeStatus("processing", "shipped")).toBe(true);
    expect(canChangeStatus("shipped", "delivered")).toBe(true);
    expect(canChangeStatus("delivered", "refunded")).toBe(true);
  });

  it("knows which statuses mean the money arrived", () => {
    expect(isPaidStatus("pending_payment")).toBe(false);
    expect(isPaidStatus("processing")).toBe(true);
    expect(isPaidStatus("refunded")).toBe(false);
  });
});

describe("releasesStock", () => {
  it("puts stock back when an order is cancelled or fails", () => {
    expect(releasesStock("pending_payment", "cancelled")).toBe(true);
    expect(releasesStock("pending_payment", "failed")).toBe(true);
    expect(releasesStock("processing", "cancelled")).toBe(true);
  });

  it("puts stock back on a refund only before shipping", () => {
    expect(releasesStock("processing", "refunded")).toBe(true);
    expect(releasesStock("shipped", "refunded")).toBe(false);
    expect(releasesStock("delivered", "refunded")).toBe(false);
  });

  it("keeps stock out along the normal path", () => {
    expect(releasesStock("pending_payment", "processing")).toBe(false);
    expect(releasesStock("processing", "shipped")).toBe(false);
  });
});

describe("canRetryPayment", () => {
  const now = new Date("2026-11-07T10:00:00Z");
  const order = {
    status: "pending_payment" as const,
    attempts: 1,
    stockHeld: true,
    expiresAt: "2026-11-07T10:30:00Z",
  };

  it("allows a retry while stock is held", () => {
    expect(canRetryPayment(order, now)).toBe(true);
    expect(canRetryPayment({ ...order, attempts: 2 }, now)).toBe(true);
  });

  it("refuses the 4th attempt", () => {
    expect(canRetryPayment({ ...order, attempts: 3 }, now)).toBe(false);
  });

  it("refuses once the order has expired, been paid, or lost its stock", () => {
    expect(canRetryPayment({ ...order, expiresAt: "2026-11-07T09:59:00Z" }, now)).toBe(false);
    expect(canRetryPayment({ ...order, status: "processing" }, now)).toBe(false);
    expect(canRetryPayment({ ...order, stockHeld: false }, now)).toBe(false);
  });
});
