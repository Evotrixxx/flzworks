import { describe, expect, it } from "vitest";
import { buildListingWhere, getListingOrderBy, parseListingSearch } from "@/lib/listings";

describe("listing search", () => {
  it("normalizes filters and ignores unsupported enum values", () => {
    const parsed = parseListingSearch({
      fuel: "HYBRID",
      transmission: "CVT",
      priceMax: "8000000",
      page: "0",
    });

    expect(parsed.fuel).toBe("HYBRID");
    expect(parsed.transmission).toBeUndefined();
    expect(parsed.priceMax).toBe(8000000);
    expect(parsed.page).toBe(1);
  });

  it("builds a composed Prisma where object", () => {
    const where = buildListingWhere(
      parseListingSearch({
        keyword: "Toyota",
        mileageMax: "90000",
      }),
    );

    expect(where).toMatchObject({
      AND: [
        { status: "PUBLISHED" },
        { OR: expect.any(Array) },
        { mileage: { lte: 90000 } },
      ],
    });
  });

  it("maps sort options to stable order clauses", () => {
    expect(getListingOrderBy("price_asc")).toEqual({ price: "asc" });
    expect(getListingOrderBy("newest")).toEqual({ createdAt: "desc" });
  });
});
