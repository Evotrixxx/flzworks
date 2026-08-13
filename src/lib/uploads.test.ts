import { describe, expect, it } from "vitest";
import {
  MAX_PHOTO_SIZE_BYTES,
  contentTypeForPhoto,
  validatePhotoMeta,
} from "@/lib/uploads";

describe("photo upload validation", () => {
  it("accepts supported image types within the size limit", () => {
    expect(validatePhotoMeta({ type: "image/webp", size: 1200 })).toEqual({
      ok: true,
      extension: "webp",
    });
  });

  it("rejects unsupported or oversized files", () => {
    expect(validatePhotoMeta({ type: "text/plain", size: 100 })).toMatchObject({ ok: false });
    expect(validatePhotoMeta({ type: "image/png", size: MAX_PHOTO_SIZE_BYTES + 1 })).toMatchObject({
      ok: false,
    });
  });
});

describe("uploaded photo content types", () => {
  it("preserves supported media types", () => {
    expect(contentTypeForPhoto("image.jpg")).toBe("image/jpeg");
    expect(contentTypeForPhoto("legacy.jpeg")).toBe("image/jpeg");
    expect(contentTypeForPhoto("image.png")).toBe("image/png");
    expect(contentTypeForPhoto("image.webp")).toBe("image/webp");
  });
});
