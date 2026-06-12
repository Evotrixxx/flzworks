import { describe, expect, it } from "vitest";
import { validateListingPayload } from "@/lib/listing-validation";

const baseListing = {
  make: "Pentagon",
  model: "Athaan",
  year: "2026",
  price: "26999999",
  mileage: "0",
  fuel: "PETROL",
  transmission: "AUTOMATIC",
  bodyType: "COUPE",
  condition: "LIKE_NEW",
  location: "Budapest",
  description: "Valos jarmuleiras placeholder cim es hamis telefonszam nelkul.",
  status: "PUBLISHED",
};

describe("listing payload validation", () => {
  it("returns field-specific labels for numeric validation failures", () => {
    const result = validateListingPayload(
      {
        ...baseListing,
        priceEur: "0",
      },
      "hu",
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.fieldErrors.priceEur).toContain("Vetelar EUR");
    }
  });

  it("rejects suspicious minimum placeholder values", () => {
    const result = validateListingPayload(
      {
        ...baseListing,
        fuel: "HYBRID",
        batteryCapacityPercent: "1",
        acChargerType: "1",
        wltpRangeKm: "1",
        systemPowerKw: "1",
        systemPowerHp: "1",
      },
      "hu",
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.fieldErrors.wltpRangeKm).toContain("WLTP");
      expect(result.fieldErrors.acChargerType).toContain("AC");
      expect(result.fieldErrors.systemPowerKw).toContain("helykitolto");
    }
  });

  it("rejects placeholder contact text in descriptions", () => {
    const result = validateListingPayload(
      {
        ...baseListing,
        description: "Válogasson kedvére! Budapest, __.kerület _____ 12 +36 00 000 000",
      },
      "hu",
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.fieldErrors.description).toContain("helykitolto");
    }
  });

  it("clears battery fields for non-electrified fuel types", () => {
    const result = validateListingPayload(
      {
        ...baseListing,
        batteryCapacityPercent: "1",
        acChargerType: "1",
        wltpRangeKm: "1",
        systemPowerKw: "1",
        systemPowerHp: "1",
        fastCharging: "true",
      },
      "hu",
    );

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.batteryCapacityPercent).toBeNull();
      expect(result.data.acChargerType).toBeNull();
      expect(result.data.wltpRangeKm).toBeNull();
      expect(result.data.systemPowerKw).toBeNull();
      expect(result.data.systemPowerHp).toBeNull();
      expect(result.data.fastCharging).toBe(false);
    }
  });

  it("accepts valid hybrid battery details", () => {
    const result = validateListingPayload(
      {
        ...baseListing,
        fuel: "HYBRID",
        batteryCapacityPercent: "90",
        acChargerType: "Type 2",
        wltpRangeKm: "65",
        systemPowerKw: "535",
        systemPowerHp: "727",
        fastCharging: "true",
      },
      "hu",
    );

    expect(result.ok).toBe(true);
  });
});
