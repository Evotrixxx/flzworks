import { describe, expect, it } from "vitest";
import { listingSchema } from "@/lib/validation";

const baseListing = {
  make: "Porsche",
  model: "Panamera",
  year: "2025",
  price: "44990000",
  mileage: "6730",
  fuel: "HYBRID",
  transmission: "AUTOMATIC",
  bodyType: "WAGON",
  condition: "LIKE_NEW",
  location: "Budapest",
  description: "Gazdagon felszerelt demo hirdetes eleg hosszu leirassal.",
  status: "PUBLISHED",
};

describe("listing validation", () => {
  it("accepts optional rich listing details", () => {
    const parsed = listingSchema.parse({
      ...baseListing,
      priceEur: "127037",
      financeTermMonths: "25",
      seats: "5",
      fastCharging: "true",
      historyInternationalEnabled: "true",
      historyDomesticEnabled: "false",
      interiorFeatures: "bor belso\nHUD / Head-Up Display",
    });

    expect(parsed.priceEur).toBe(127037);
    expect(parsed.financeTermMonths).toBe(25);
    expect(parsed.fastCharging).toBe(true);
    expect(parsed.historyDomesticEnabled).toBe(false);
  });

  it("normalizes empty optional numbers to undefined", () => {
    const parsed = listingSchema.parse({
      ...baseListing,
      priceEur: "",
      financeTermMonths: "",
      fastCharging: "false",
    });

    expect(parsed.priceEur).toBeUndefined();
    expect(parsed.financeTermMonths).toBeUndefined();
    expect(parsed.fastCharging).toBe(false);
  });
});
