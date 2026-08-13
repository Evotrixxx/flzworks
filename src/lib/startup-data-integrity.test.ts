import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("production startup data integrity", () => {
  it("starts only after storage validation and migrations", () => {
    const packageJson = JSON.parse(
      readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
    ) as { scripts?: { start?: string } };

    expect(packageJson.scripts?.start).toBe(
      "node scripts/verify-production-storage.mjs && prisma migrate deploy && next start",
    );
    expect(packageJson.scripts?.start).not.toContain("seed");
    expect(packageJson.scripts?.start).not.toContain("bootstrap");
  });

  it("keeps the manual Instagram bootstrap insert-only", () => {
    const source = readFileSync(
      path.join(process.cwd(), "scripts", "bootstrap-instagram-projects.mjs"),
      "utf8",
    );

    expect(source).not.toContain("flzProject.upsert");
    expect(source).not.toContain("flzProject.update");
    expect(source).not.toContain("flzProject.updateMany");
    expect(source).not.toContain("flzProject.delete");
    expect(source).not.toContain("flzProject.deleteMany");
  });
});
