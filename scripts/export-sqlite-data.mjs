// One-time migration utility: dumps every row from the legacy SQLite database
// into a JSON file, ready for scripts/import-postgres-data.mjs to load into
// the new PostgreSQL database. Requires Node 22.5+ (node:sqlite).
import { DatabaseSync } from "node:sqlite";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";

function parseArgs(argv) {
  const args = { db: null, out: null, socialConfig: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--db") args.db = argv[++i];
    if (argv[i] === "--out") args.out = argv[++i];
    if (argv[i] === "--social-config") args.socialConfig = argv[++i];
  }
  return args;
}

function canonicalize(value) {
  if (Array.isArray(value)) {
    return value.map(canonicalize).sort((a, b) =>
      JSON.stringify(a).localeCompare(JSON.stringify(b)),
    );
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, canonicalize(item)]),
    );
  }
  return value;
}

function checksum(rows) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(rows)))
    .digest("hex");
}

async function readLegacySocialConfig(explicitPath, sqlitePath) {
  const candidates = explicitPath
    ? [explicitPath]
    : [path.join(path.dirname(sqlitePath), "config", "social-config.json")];

  for (const candidate of candidates) {
    try {
      return JSON.parse(await readFile(candidate, "utf8"));
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  return null;
}

function resolveSqlitePath(cliDb) {
  if (cliDb) return cliDb;

  const envUrl = process.env.SQLITE_DATABASE_URL;
  if (envUrl) return envUrl.replace(/^file:/, "");

  return path.join(process.cwd(), "prisma", "dev.db");
}

function tableExists(db, tableName) {
  const row = db
    .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(tableName);
  return Boolean(row);
}

function readTable(db, model) {
  const tableName = model.dbName ?? model.name;

  if (!tableExists(db, tableName)) {
    return null;
  }

  const dateTimeFields = new Set(
    model.fields.filter((f) => f.type === "DateTime").map((f) => f.name),
  );
  const booleanFields = new Set(
    model.fields.filter((f) => f.type === "Boolean").map((f) => f.name),
  );

  const rows = db.prepare(`SELECT * FROM "${tableName}"`).all();

  return rows.map((row) => {
    const converted = { ...row };
    for (const field of dateTimeFields) {
      if (converted[field] != null) {
        const rawValue = converted[field];
        const numericValue =
          typeof rawValue === "number" || typeof rawValue === "bigint"
            ? Number(rawValue)
            : typeof rawValue === "string" && /^-?\d+$/.test(rawValue)
              ? Number(rawValue)
              : null;
        const parsed = new Date(numericValue ?? String(rawValue));

        if (Number.isNaN(parsed.getTime())) {
          throw new Error(
            `Invalid DateTime in ${tableName}.${field} for row ${JSON.stringify(row)}`,
          );
        }

        converted[field] = parsed.toISOString();
      }
    }
    for (const field of booleanFields) {
      if (converted[field] != null) {
        converted[field] = Boolean(converted[field]);
      }
    }
    return converted;
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sqlitePath = resolveSqlitePath(args.db);
  const outPath = args.out || path.join(process.cwd(), "prisma", "sqlite-export.json");

  console.log(`Reading SQLite database: ${sqlitePath}`);
  const db = new DatabaseSync(sqlitePath, { readOnly: true });

  const models = Prisma.dmmf.datamodel.models;
  const tables = {};
  const manifest = {};

  for (const model of models) {
    const rows = readTable(db, model);
    if (rows === null) {
      console.log(`  ${model.name}: skipped (table not present in source database)`);
      continue;
    }
    tables[model.name] = rows;
    manifest[model.name] = { count: rows.length, sha256: checksum(rows) };
    console.log(`  ${model.name}: ${rows.length} rows`);
  }

  db.close();

  const legacySocialConfig = await readLegacySocialConfig(args.socialConfig, sqlitePath);
  if (legacySocialConfig) console.log("  legacy social config: found");

  const exportDocument = {
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    sourceDatabase: path.resolve(sqlitePath),
    tables,
    manifest,
    legacySocialConfig,
  };
  await writeFile(outPath, JSON.stringify(exportDocument, null, 2));
  console.log(`\nWrote export to ${outPath}`);
  console.log("Next: set DATABASE_URL to your PostgreSQL connection string and run");
  console.log("  npm run migration:import-postgres");
}

main().catch((error) => {
  console.error("Export failed:", error);
  process.exit(1);
});
