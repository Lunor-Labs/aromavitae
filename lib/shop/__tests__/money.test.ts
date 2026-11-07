import { describe, expect, it } from "vitest";
import {
  availableCurrencies,
  convertFromLkr,
  currencyForCountry,
  lineTotal,
  resolveCurrency,
  sumMoney,
} from "../money";

const rates = { USD: 300, EUR: 325.5, GBP: 380 };

describe("convertFromLkr", () => {
  it("leaves LKR alone", () => {
    expect(convertFromLkr(5300, "LKR", rates)).toBe(5300);
  });

  it("rounds other currencies to the cent", () => {
    expect(convertFromLkr(5300, "USD", rates)).toBe(17.67);
    expect(convertFromLkr(119539, "GBP", rates)).toBe(314.58);
  });

  it("refuses a currency with no rate rather than charging nothing", () => {
    expect(() => convertFromLkr(100, "EUR", { USD: 300 })).toThrow("No exchange rate");
  });
});

describe("line and basket totals", () => {
  it("multiplies the rounded unit price, so totals match the prices shown", () => {
    expect(lineTotal(17.67, 3)).toBe(53.01);
    expect(lineTotal(19.99, 3)).toBe(59.97);
  });

  it("adds without floating point drift", () => {
    expect(sumMoney([0.1, 0.2])).toBe(0.3);
    expect(sumMoney([19.99, 19.99, 19.99])).toBe(59.97);
    expect(sumMoney([])).toBe(0);
  });
});

describe("which currencies a visitor gets", () => {
  it("picks from the visitor's country", () => {
    expect(currencyForCountry("LK")).toBe("LKR");
    expect(currencyForCountry("GB")).toBe("GBP");
    expect(currencyForCountry("DE")).toBe("EUR");
    expect(currencyForCountry("US")).toBe("USD");
    expect(currencyForCountry("IN")).toBe("USD");
  });

  it("only offers currencies with a rate", () => {
    expect(availableCurrencies({})).toEqual(["LKR"]);
    expect(availableCurrencies({ USD: 300, GBP: 0 })).toEqual(["LKR", "USD"]);
  });

  it("falls back to LKR for anything not on offer", () => {
    expect(resolveCurrency("USD", rates)).toBe("USD");
    expect(resolveCurrency("USD", {})).toBe("LKR");
    expect(resolveCurrency("JPY", rates)).toBe("LKR");
    expect(resolveCurrency(null, rates)).toBe("LKR");
  });
});
