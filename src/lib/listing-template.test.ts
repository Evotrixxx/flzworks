import { describe, expect, it } from "vitest";
import { listingToTemplateValues } from "@/lib/listing-template";

describe("listing templates", () => {
  it("removes identity, owner, timestamps, photos, and forces draft status", () => {
    const result = listingToTemplateValues({
      id: "listing-1",
      sellerId: "seller-1",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-02"),
      photos: [{ id: "photo-1" }],
      make: "Toyota",
      model: "Corolla",
      status: "PUBLISHED",
    });

    expect(result).toEqual({
      make: "Toyota",
      model: "Corolla",
      status: "DRAFT",
    });
  });
});
