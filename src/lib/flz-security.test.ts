import { describe, expect, it } from "vitest";
import { flzProjectUpdateSchema, flzSettingSchema } from "@/lib/flz-schemas";

describe("FLZ project partial updates", () => {
  it("does not inject publishing defaults into a sort-order update", () => {
    expect(flzProjectUpdateSchema.parse({ sortOrder: 3 })).toEqual({ sortOrder: 3 });
  });

  it("does not reset featured or sort order when visibility changes", () => {
    expect(flzProjectUpdateSchema.parse({ visible: false })).toEqual({ visible: false });
  });
});

describe("FLZ settings validation", () => {
  it("rejects values beyond the persisted limit", () => {
    expect(
      flzSettingSchema.safeParse({ key: "hero_headline", value: "x".repeat(2001) }).success,
    ).toBe(false);
  });
});
