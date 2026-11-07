import { describe, expect, it } from "vitest";
import { addressSchema, emailSchema, passwordSchema } from "../schemas";

const address = {
  fullName: "A Customer",
  phone: "+94 77 123 4567",
  line1: "12 Galle Road",
  city: "Colombo",
  region: "Colombo",
  country: "LK",
};

describe("addressSchema", () => {
  it("accepts a Sri Lankan address", () => {
    expect(addressSchema.safeParse(address).success).toBe(true);
  });

  it("needs a district in Sri Lanka, but not abroad", () => {
    expect(addressSchema.safeParse({ ...address, region: "" }).success).toBe(false);
    expect(addressSchema.safeParse({ ...address, region: "", country: "SG" }).success).toBe(true);
  });

  it("refuses a country that doesn't exist", () => {
    expect(addressSchema.safeParse({ ...address, country: "ZZ" }).success).toBe(false);
    expect(addressSchema.safeParse({ ...address, country: "constructor" }).success).toBe(false);
  });
});

describe("account fields", () => {
  it("lowercases and trims emails", () => {
    expect(emailSchema.parse("  Someone@Example.COM ")).toBe("someone@example.com");
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
  });

  it("needs a password of at least 8 characters", () => {
    expect(passwordSchema.safeParse("short").success).toBe(false);
    expect(passwordSchema.safeParse("long enough").success).toBe(true);
  });
});
