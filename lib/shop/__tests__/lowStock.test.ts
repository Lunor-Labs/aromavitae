import { describe, expect, it } from "vitest";
import { crossedLowStock, findLowStock } from "../lowStock";

describe("crossedLowStock", () => {
  it("alerts once, on the sale that reaches the level", () => {
    expect(crossedLowStock(6, 5, 5)).toBe(true);
    expect(crossedLowStock(9, 2, 5)).toBe(true);
    expect(crossedLowStock(5, 4, 5)).toBe(false);
    expect(crossedLowStock(4, 3, 5)).toBe(false);
  });

  it("doesn't alert while there's plenty left, or when restocking", () => {
    expect(crossedLowStock(9, 8, 5)).toBe(false);
    expect(crossedLowStock(2, 20, 5)).toBe(false);
  });

  it("ignores items whose stock isn't tracked, or has only just started to be", () => {
    expect(crossedLowStock(null, null, 5)).toBe(false);
    expect(crossedLowStock(null, 2, 5)).toBe(false);
    expect(crossedLowStock(6, null, 5)).toBe(false);
  });
});

describe("findLowStock", () => {
  it("lists what's at or below its level, lowest first", () => {
    const low = findLowStock(
      [
        { id: 1, name: "Plenty", stock: 50 },
        { id: 2, name: "Untracked", stock: null },
        { id: 3, name: "At the level", stock: 5 },
        { id: 4, name: "Sold out", stock: 0 },
      ],
      5
    );
    expect(low.map((item) => item.name)).toEqual(["Sold out", "At the level"]);
  });

  it("uses a product's own level over the default", () => {
    const low = findLowStock(
      [
        { id: 1, name: "Rare", stock: 8, lowStockAt: 10 },
        { id: 2, name: "Common", stock: 3, lowStockAt: 1 },
      ],
      5
    );
    expect(low.map((item) => item.name)).toEqual(["Rare"]);
  });

  it("checks each size of a product separately", () => {
    const low = findLowStock(
      [
        {
          id: 1,
          name: "Spice",
          stock: null,
          variants: [
            { stock: 2, sizeValue: 100, sizeUnit: "g" },
            { stock: 40, sizeValue: 1, sizeUnit: "kg" },
            { stock: null, sizeValue: 5, sizeUnit: "kg" },
          ],
        },
      ],
      5
    );
    expect(low).toEqual([{ productId: 1, name: "Spice", sizeLabel: "100 g", stock: 2, level: 5 }]);
  });
});
