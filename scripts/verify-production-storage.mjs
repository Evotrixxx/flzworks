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

const isMain = import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`;

if (isMain) {
  const result = validateProductionStorageEnv(process.env);

  if (!result.ok) {
    console.error(result.message);
    process.exit(1);
  }
}
