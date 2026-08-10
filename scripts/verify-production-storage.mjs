import { readFileSync } from "node:fs";

export function validateProductionStorageEnv(env) {
  if (env.NODE_ENV !== "production") {
    return { ok: true };
  }

  const databaseUrl = env.DATABASE_URL || "";
  const uploadDir = env.UPLOAD_DIR || "";

  if (!databaseUrl.startsWith("file:/data/")) {
    return {
      ok: false,
      message:
        "Refusing to start: production DATABASE_URL must use Railway persistent storage, e.g. DATABASE_URL=file:/data/prod.db. Attach a Railway volume mounted at /data before deploying.",
    };
  }

  if (!uploadDir.startsWith("/data/")) {
    return {
      ok: false,
      message:
        "Refusing to start: production UPLOAD_DIR must use Railway persistent storage, e.g. UPLOAD_DIR=/data/uploads. Attach a Railway volume mounted at /data before deploying.",
    };
  }

  return { ok: true };
}

export function validateProductionStorageMount(env, mountInfo) {
  if (env.NODE_ENV !== "production") return { ok: true };

  const hasDataMount = mountInfo
    .split(/\r?\n/)
    .some((line) => line.split(" ")[4] === "/data");
  if (!hasDataMount) {
    return {
      ok: false,
      message:
        "Refusing to start: /data is not a mounted persistent volume. Attach the Railway volume at /data before deploying.",
    };
  }
  return { ok: true };
}

const entrypoint = process.argv[1]?.replace(/\\/g, "/");
const isMain = Boolean(entrypoint) && import.meta.url === `file://${entrypoint}`;

if (isMain) {
  const result = validateProductionStorageEnv(process.env);
  if (!result.ok) {
    console.error(result.message);
    process.exit(1);
  }

  let mountInfo = "";
  try {
    mountInfo = readFileSync("/proc/self/mountinfo", "utf8");
  } catch {
    console.error("Refusing to start: unable to verify the /data persistent volume mount.");
    process.exit(1);
  }
  const mountResult = validateProductionStorageMount(process.env, mountInfo);
  if (!mountResult.ok) {
    console.error(mountResult.message);
    process.exit(1);
  }
}
