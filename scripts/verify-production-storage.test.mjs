import { describe, expect, it } from "vitest";
import {
  validateProductionStorageEnv,
  validateProductionStorageMount,
} from "./verify-production-storage.mjs";

describe("production storage guard", () => {
  it("passes with Railway persistent volume paths", () => {
    expect(
      validateProductionStorageEnv({
        NODE_ENV: "production",
        DATABASE_URL: "file:/data/prod.db",
        UPLOAD_DIR: "/data/uploads",
      }),
    ).toEqual({ ok: true });
  });

  it("fails with an ephemeral database path", () => {
    const result = validateProductionStorageEnv({
      NODE_ENV: "production",
      DATABASE_URL: "file:./prod.db",
      UPLOAD_DIR: "/data/uploads",
    });

    expect(result.ok).toBe(false);
    expect(result.message).toContain("DATABASE_URL");
  });

  it("fails with an ephemeral upload path", () => {
    const result = validateProductionStorageEnv({
      NODE_ENV: "production",
      DATABASE_URL: "file:/data/prod.db",
      UPLOAD_DIR: "./uploads",
    });

    expect(result.ok).toBe(false);
    expect(result.message).toContain("UPLOAD_DIR");
  });

  it("passes only when /data is an actual mount point", () => {
    const env = { NODE_ENV: "production" };
    expect(
      validateProductionStorageMount(
        env,
        "125 99 0:81 / /data rw,relatime - ext4 /dev/volume rw",
      ),
    ).toEqual({ ok: true });

    const result = validateProductionStorageMount(
      env,
      "90 31 0:40 / / rw,relatime - overlay overlay rw",
    );
    expect(result.ok).toBe(false);
    expect(result.message).toContain("persistent volume");
  });
});
