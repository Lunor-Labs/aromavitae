import { describe, expect, it } from "vitest";
import { addNote, sameItems } from "../attention";

describe("addNote", () => {
  it("starts the box, then adds below what's there", () => {
    expect(addNote(null, "Chargeback.")).toBe("Chargeback.");
    expect(addNote("Wrong amount.", "Chargeback.")).toBe("Wrong amount.\nChargeback.");
  });

  it("doesn't repeat a note PayHere reported twice", () => {
    expect(addNote("Wrong amount.\nChargeback.", "Chargeback.")).toBe("Wrong amount.\nChargeback.");
  });
});

describe("sameItems", () => {
  const a = { productId: 1, variantId: null, quantity: 2 };
  const b = { productId: 2, variantId: "v1", quantity: 1 };

  it("matches the same basket in any order", () => {
    expect(sameItems([a, b], [b, a])).toBe(true);
  });

  it("tells apart a different size, quantity or item", () => {
    expect(sameItems([a, b], [a, { ...b, variantId: "v2" }])).toBe(false);
    expect(sameItems([a, b], [a, { ...b, quantity: 2 }])).toBe(false);
    expect(sameItems([a, b], [a])).toBe(false);
  });
});
