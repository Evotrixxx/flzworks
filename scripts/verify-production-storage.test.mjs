import { describe, expect, it } from "vitest";
import { validateProductionStorageEnv } from "./verify-production-storage.mjs";

describe("production storage guard", () => {
  const productionEnv = {
    NODE_ENV: "production",
    DATABASE_URL: "postgresql://postgres:secret@postgres.railway.internal:5432/railway",
    S3_BUCKET: "flz-media-example",
    S3_ENDPOINT: "https://storage.railway.app",
    S3_REGION: "auto",
    S3_ACCESS_KEY_ID: "access-key",
    S3_SECRET_ACCESS_KEY: "secret-key",
  };

  it("passes with PostgreSQL and complete S3 configuration", () => {
    expect(
      validateProductionStorageEnv(productionEnv),
    ).toEqual({ ok: true });
  });

  it("fails with a file-based database", () => {
    const result = validateProductionStorageEnv({
      ...productionEnv,
      DATABASE_URL: "file:./prod.db",
    });

    expect(result.ok).toBe(false);
    expect(result.message).toContain("DATABASE_URL");
  });

  it("fails when object storage is incomplete", () => {
    const result = validateProductionStorageEnv({
      ...productionEnv,
      S3_SECRET_ACCESS_KEY: "",
    });

    expect(result.ok).toBe(false);
    expect(result.message).toContain("S3_SECRET_ACCESS_KEY");
  });

  it("does not require production services during local development", () => {
    expect(
      validateProductionStorageEnv({
        NODE_ENV: "development",
        DATABASE_URL: "file:./dev.db",
      }),
    ).toEqual({ ok: true });
  });
});
