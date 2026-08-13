// One-time migration utility: loads the JSON produced by
// scripts/export-sqlite-data.mjs into the PostgreSQL database pointed to by
// DATABASE_URL. Run `npx prisma migrate deploy` against that database first
// so the tables exist. Safe to re-run: existing rows (by primary key /
// unique constraint) are skipped rather than duplicated.
import { readFile } from "fs/promises";
import path from "path";
import { createHash } from "node:crypto";
import { PrismaClient, Prisma } from "@prisma/client";

function parseArgs(argv) {
  const args = { in: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--in") args.in = argv[++i];
  }
  return args;
}

function clientKeyFor(modelName) {
  return modelName.charAt(0).toLowerCase() + modelName.slice(1);
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

function normalizeDates(rows) {
  return JSON.parse(JSON.stringify(rows));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inPath = args.in || path.join(process.cwd(), "prisma", "sqlite-export.json");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || !/^postgres(?:ql)?:\/\//.test(connectionString)) {
    console.error("DATABASE_URL must be set to a postgresql:// connection string.");
    process.exit(1);
  }

  console.log(`Reading export: ${inPath}`);
  const exportDocument = JSON.parse(await readFile(inPath, "utf8"));
  if (exportDocument.formatVersion !== 1 || !exportDocument.tables || !exportDocument.manifest) {
    throw new Error("Unsupported or incomplete SQLite export document.");
  }
  const dump = exportDocument.tables;

  const prisma = new PrismaClient();

  const models = Prisma.dmmf.datamodel.models;

  for (const model of models) {
    const rows = dump[model.name] ?? [];
    if (rows.length === 0) {
      console.log(`  ${model.name}: nothing to import`);
      continue;
    }

    const result = await prisma[clientKeyFor(model.name)].createMany({
      data: rows,
      skipDuplicates: true,
    });
    console.log(`  ${model.name}: imported ${result.count} of ${rows.length} rows`);
  }

  console.log("\nVerifying imported table counts and checksums...");
  for (const model of models) {
    if (!(model.name in dump)) continue;
    const rows = normalizeDates(await prisma[clientKeyFor(model.name)].findMany());
    const expected = exportDocument.manifest[model.name];
    if (!expected || rows.length !== expected.count || checksum(rows) !== expected.sha256) {
      throw new Error(
        `${model.name} verification failed: expected ${expected?.count ?? "unknown"} rows with checksum ${expected?.sha256 ?? "missing"}, got ${rows.length} rows with checksum ${checksum(rows)}.`,
      );
    }
    console.log(`  ${model.name}: verified ${rows.length} rows`);
  }

  if (exportDocument.legacySocialConfig) {
    await prisma.flzSetting.upsert({
      where: { key: "studio:social-config" },
      create: {
        key: "studio:social-config",
        value: JSON.stringify(exportDocument.legacySocialConfig),
      },
      update: {
        value: JSON.stringify(exportDocument.legacySocialConfig),
      },
    });
    console.log("  legacy social config: imported into FlzSetting");
  }

  await prisma.$disconnect();
  console.log("\nImport and verification complete.");
}

main().catch((error) => {
  console.error("Import failed:", error);
  process.exit(1);
});
