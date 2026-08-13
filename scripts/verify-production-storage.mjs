export function validateProductionStorageEnv(env) {
  if (env.NODE_ENV !== "production") {
    return { ok: true };
  }

  const databaseUrl = env.DATABASE_URL || "";

  if (!/^postgres(?:ql)?:\/\//.test(databaseUrl)) {
    return {
      ok: false,
      message:
        "Refusing to start: production DATABASE_URL must point to PostgreSQL. SQLite and file-based databases are not persistent deployment storage.",
    };
  }

  const requiredBucketVariables = [
    "S3_BUCKET",
    "S3_ENDPOINT",
    "S3_REGION",
    "S3_ACCESS_KEY_ID",
    "S3_SECRET_ACCESS_KEY",
  ];
  const missingBucketVariables = requiredBucketVariables.filter(
    (name) => !env[name]?.trim(),
  );

  if (missingBucketVariables.length > 0) {
    return {
      ok: false,
      message:
        `Refusing to start: production object storage is incomplete. Missing ${missingBucketVariables.join(", ")}.`,
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
