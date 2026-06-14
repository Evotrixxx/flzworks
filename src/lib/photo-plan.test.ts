import { describe, expect, it } from "vitest";
import { resolvePhotoPlan } from "@/lib/photo-plan";

const existingPhotos = [
  { id: "a", path: "a.jpg" },
  { id: "b", path: "b.jpg" },
  { id: "c", path: "c.jpg" },
];

describe("photo plan", () => {
  it("uses the first planned item as the cover image", () => {
    const result = resolvePhotoPlan({
      existingPhotos,
      savedPhotoPaths: [],
      planJson: JSON.stringify([
        { type: "existing", id: "c" },
        { type: "existing", id: "a" },
      ]),
    });

    expect(result.ordered[0]).toMatchObject({ type: "existing", id: "c", sortOrder: 0 });
    expect(result.ordered[1]).toMatchObject({ type: "existing", id: "a", sortOrder: 1 });
  });

  it("preserves retained existing photos and removes only omitted photos", () => {
    const result = resolvePhotoPlan({
      existingPhotos,
      savedPhotoPaths: [],
      planJson: JSON.stringify([{ type: "existing", id: "b" }]),
    });

    expect(result.ordered).toEqual([{ type: "existing", id: "b", path: "b.jpg", sortOrder: 0 }]);
    expect(result.removed.map((photo) => photo.id)).toEqual(["a", "c"]);
  });

  it("adds new uploaded photos without wiping retained existing photos", () => {
    const result = resolvePhotoPlan({
      existingPhotos,
      savedPhotoPaths: ["new-1.jpg", "new-2.jpg"],
      planJson: JSON.stringify([
        { type: "existing", id: "a" },
        { type: "new", id: "draft-1" },
        { type: "existing", id: "b" },
        { type: "new", id: "draft-2" },
      ]),
    });

    expect(result.ordered).toEqual([
      { type: "existing", id: "a", path: "a.jpg", sortOrder: 0 },
      { type: "new", path: "new-1.jpg", sortOrder: 1 },
      { type: "existing", id: "b", path: "b.jpg", sortOrder: 2 },
      { type: "new", path: "new-2.jpg", sortOrder: 3 },
    ]);
    expect(result.removed.map((photo) => photo.id)).toEqual(["c"]);
  });

  it("allows all photos to be removed", () => {
    const result = resolvePhotoPlan({
      existingPhotos,
      savedPhotoPaths: [],
      planJson: "[]",
    });

    expect(result.ordered).toEqual([]);
    expect(result.removed).toEqual(existingPhotos);
  });
});
