import { dictionaries, type Locale } from "@/lib/i18n";
import { validateListingPayload, type FieldErrors } from "@/lib/listing-validation";
import {
  bodyTypeOptions,
  conditionOptions,
  fuelOptions,
  transmissionOptions,
  type BodyTypeOption,
  type ConditionOption,
  type FuelOption,
  type TransmissionOption,
} from "@/lib/options";

type ListingImportData = Extract<ReturnType<typeof validateListingPayload>, { ok: true }>["data"];

export type ListingImportItem = {
  index: number;
  raw: Record<string, string>;
  warnings: string[];
} & (
  | {
      ok: true;
      data: ListingImportData;
      title: string;
    }
  | {
      ok: false;
      error: string;
      fieldErrors: FieldErrors;
    }
);

export type ListingImportPreview = {
  items: ListingImportItem[];
  validCount: number;
  invalidCount: number;
};

const fieldAliases: Record<string, string> = {
  make: "make",
  marka: "make",
  brand: "make",
  model: "model",
  modell: "model",
  trim: "trim",
  felszereltseg: "trim",
  kivitelifelszereltseg: "trim",
  trimequipment: "trim",
  year: "year",
  ev: "year",
  evjarat: "year",
  yearmonth: "yearMonth",
  modelyearmonth: "yearMonth",
  price: "price",
  pricehuf: "price",
  ar: "price",
  arhuf: "price",
  vetelar: "price",
  vetelarhuf: "price",
  purchaseprice: "price",
  purchasepricehuf: "price",
  priceeur: "priceEur",
  vetelareur: "priceEur",
  purchasepriceeur: "priceEur",
  mileage: "mileage",
  kilometer: "mileage",
  km: "mileage",
  futas: "mileage",
  fuel: "fuel",
  uzemanyag: "fuel",
  transmission: "transmission",
  valto: "transmission",
  sebessegvalto: "transmission",
  body: "bodyType",
  bodytype: "bodyType",
  kivitel: "bodyType",
  condition: "condition",
  allapot: "condition",
  location: "location",
  helyseg: "location",
  leiras: "description",
  description: "description",
  financing: "financingDetails",
  financingdetails: "financingDetails",
  finanszirozas: "financingDetails",
  term: "financeTermMonths",
  futamido: "financeTermMonths",
  financetermmonths: "financeTermMonths",
  seats: "seats",
  szallithatoszemszama: "seats",
  doors: "doors",
  ajtokszama: "doors",
  color: "color",
  szin: "color",
  upholsterycolor1: "upholsteryPrimary",
  upholsteryprimary: "upholsteryPrimary",
  karpitszine1: "upholsteryPrimary",
  upholsterycolor2: "upholsterySecondary",
  upholsterysecondary: "upholsterySecondary",
  karpitszine2: "upholsterySecondary",
  curbweight: "curbWeightKg",
  curbweightkg: "curbWeightKg",
  sajattomeg: "curbWeightKg",
  grossweight: "grossWeightKg",
  grossweightkg: "grossWeightKg",
  teljestomeg: "grossWeightKg",
  trunk: "trunkVolumeLiters",
  trunkvolumeliters: "trunkVolumeLiters",
  csomagtarto: "trunkVolumeLiters",
  climate: "climate",
  climatecontrol: "climate",
  klimafajtaja: "climate",
  roof: "roof",
  teto: "roof",
  displacement: "engineDisplacementCcm",
  engineccm: "engineDisplacementCcm",
  enginedisplacementccm: "engineDisplacementCcm",
  hengerurtartalom: "engineDisplacementCcm",
  powerkw: "powerKw",
  teljesitmenykw: "powerKw",
  powerhp: "powerHp",
  teljesitmenyle: "powerHp",
  cylinderlayout: "cylinderLayout",
  hengerelrendezes: "cylinderLayout",
  drive: "driveType",
  drivetype: "driveType",
  hajtas: "driveType",
  transmissiondetail: "gearboxDetail",
  gearboxdetail: "gearboxDetail",
  akkukapacitas: "batteryCapacityPercent",
  currentbatterycapacity: "batteryCapacityPercent",
  batterycapacitypercent: "batteryCapacityPercent",
  acconnector: "acChargerType",
  acconnectortype: "acChargerType",
  acchargertype: "acChargerType",
  actoltocsatlakozotipusa: "acChargerType",
  fastcharging: "fastCharging",
  villamtoltes: "fastCharging",
  wltprange: "wltpRangeKm",
  wltprangekm: "wltpRangeKm",
  wltphatotav: "wltpRangeKm",
  systempowerkw: "systemPowerKw",
  rendszerosszteljesitmenykw: "systemPowerKw",
  systempowerhp: "systemPowerHp",
  rendszerosszteljesitmenyle: "systemPowerHp",
  documenttype: "documentsType",
  documentstype: "documentsType",
  okmanyokjellege: "documentsType",
  inspectionvaliduntil: "inspectionValidUntil",
  muszakivizsgaervenyes: "inspectionValidUntil",
  summertiresize: "frontTireSize",
  fronttiresize: "frontTireSize",
  nyarigumimeret: "frontTireSize",
  rearsummertiresize: "rearTireSize",
  reartiresize: "rearTireSize",
  hatsonyarigumimeret: "rearTireSize",
  interior: "interiorFeatures",
  interiorfeatures: "interiorFeatures",
  belter: "interiorFeatures",
  technical: "technicalFeatures",
  technicalfeatures: "technicalFeatures",
  muszaki: "technicalFeatures",
  exterior: "exteriorFeatures",
  exteriorfeatures: "exteriorFeatures",
  kulteri: "exteriorFeatures",
  multimedia: "multimediaFeatures",
  multimediafeatures: "multimediaFeatures",
  extra: "extraInfo",
  extrainfo: "extraInfo",
  otherinformation: "extraInfo",
  egyebinformacio: "extraInfo",
  internationalhistoryreport: "historyInternationalEnabled",
  nemzetkozieloeleltlekerdezes: "historyInternationalEnabled",
  hungarianhistoryreport: "historyDomesticEnabled",
  magyarorszagieloeleltlekerdezes: "historyDomesticEnabled",
  vatdeductible: "vatDeductible",
  afavisszaigenyelheto: "vatDeductible",
  tradeinpossible: "tradeInAvailable",
  tradeinavailable: "tradeInAvailable",
  autobeszamitaslehetseges: "tradeInAvailable",
  availableimmediately: "availableImmediately",
  azonnalelviheto: "availableImmediately",
};

const booleanFields = new Set([
  "fastCharging",
  "historyInternationalEnabled",
  "historyDomesticEnabled",
  "vatDeductible",
  "tradeInAvailable",
  "availableImmediately",
]);

function normalizeKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function enumLookup<T extends string>(options: readonly T[], labels: Record<T, string>) {
  const entries = new Map<string, T>();

  for (const option of options) {
    entries.set(normalizeKey(option), option);
    entries.set(normalizeKey(option.replace(/_/g, " ")), option);
    entries.set(normalizeKey(labels[option]), option);
  }

  return entries;
}

const enumLookups = {
  fuel: new Map<string, FuelOption>(),
  transmission: new Map<string, TransmissionOption>(),
  bodyType: new Map<string, BodyTypeOption>(),
  condition: new Map<string, ConditionOption>(),
};

for (const locale of ["hu", "en"] as const) {
  const t = dictionaries[locale];
  for (const [key, value] of enumLookup(fuelOptions, t.enums.fuel)) enumLookups.fuel.set(key, value);
  for (const [key, value] of enumLookup(transmissionOptions, t.enums.transmission)) enumLookups.transmission.set(key, value);
  for (const [key, value] of enumLookup(bodyTypeOptions, t.enums.bodyType)) enumLookups.bodyType.set(key, value);
  for (const [key, value] of enumLookup(conditionOptions, t.enums.condition)) enumLookups.condition.set(key, value);
}

function booleanValue(value: string) {
  const normalized = normalizeKey(value);

  if (["yes", "true", "igen", "van", "1", "y"].includes(normalized)) return "true";
  if (["no", "false", "nem", "nincs", "0", "n"].includes(normalized)) return "false";
  return value;
}

function normalizeValue(field: string, value: string) {
  if (field === "fuel") return enumLookups.fuel.get(normalizeKey(value)) ?? value;
  if (field === "transmission") return enumLookups.transmission.get(normalizeKey(value)) ?? value;
  if (field === "bodyType") return enumLookups.bodyType.get(normalizeKey(value)) ?? value;
  if (field === "condition") return enumLookups.condition.get(normalizeKey(value)) ?? value;
  if (booleanFields.has(field)) return booleanValue(value);
  return value.trim();
}

function parseBlock(block: string, index: number, locale: Locale) {
  const raw: Record<string, string> = {};
  const warnings: string[] = [];
  const lines = block.split(/\r?\n/);

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];

    if (!line.trim()) {
      continue;
    }

    const match = /^([^:]+):\s*(.*)$/.exec(line);

    if (!match) {
      warnings.push(locale === "hu" ? `Ismeretlen sor: ${line.trim()}` : `Unknown line: ${line.trim()}`);
      continue;
    }

    const [, label, firstValue] = match;
    const field = fieldAliases[normalizeKey(label)];

    if (!field) {
      warnings.push(locale === "hu" ? `Ismeretlen mezo: ${label.trim()}` : `Unknown field: ${label.trim()}`);
      continue;
    }

    let fieldValue = firstValue;

    if (firstValue.trim() === "|") {
      const parts: string[] = [];

      while (lineIndex + 1 < lines.length && (/^\s/.test(lines[lineIndex + 1]) || lines[lineIndex + 1].trim() === "")) {
        lineIndex += 1;
        parts.push(lines[lineIndex].replace(/^\s{1,4}/, ""));
      }

      fieldValue = parts.join("\n").trim();
    }

    raw[field] = normalizeValue(field, fieldValue);
  }

  raw.status = "DRAFT";

  const parsed = validateListingPayload(raw, locale);

  if (!parsed.ok) {
    return {
      index,
      raw,
      warnings,
      ok: false as const,
      error: parsed.error,
      fieldErrors: parsed.fieldErrors,
    };
  }

  return {
    index,
    raw,
    warnings,
    ok: true as const,
    data: {
      ...parsed.data,
      status: "DRAFT" as const,
    },
    title: [parsed.data.make, parsed.data.model, parsed.data.trim].filter(Boolean).join(" "),
  };
}

export function parseListingText(text: string, locale: Locale): ListingImportPreview {
  const blocks = text
    .split(/^\s*---\s*$/m)
    .map((block) => block.trim())
    .filter(Boolean);

  const items = blocks.map((block, index) => parseBlock(block, index + 1, locale));

  return {
    items,
    validCount: items.filter((item) => item.ok).length,
    invalidCount: items.filter((item) => !item.ok).length,
  };
}

export const listingImportTemplate = `Make: Porsche
Model: Panamera
Trim: Turbo S E-Hybrid Sport Turismo
Year: 2025
Year month: 2025/9
Price HUF: 44990000
Price EUR: 127037
Mileage: 6730
Fuel: Hybrid
Transmission: Automatic
Body: Wagon
Condition: Like new
Location: Budapest
Description: |
  Ujszeru, gazdagon felszerelt plug-in hibrid kombi.
  Magyar okmanyokkal, panoramatetovel, vezetett szervizeloelettel.
Color: Sarga
Power kW: 430
Power HP: 585
VAT deductible: yes
Available immediately: yes
---

Make: Toyota
Model: Corolla
Trim: 1.8 Hybrid Comfort
Year: 2021
Price HUF: 7390000
Mileage: 64200
Fuel: Hybrid
Transmission: Automatic
Body: Wagon
Condition: Well kept
Location: Budapest XI.
Description: |
  Magyarorszagi, rendszeresen szervizelt csaladi kombi.
  Friss muszaki vizsga, ket kulcs.`;
