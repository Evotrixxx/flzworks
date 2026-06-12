import { z } from "zod";
import {
  bodyTypeOptions,
  conditionOptions,
  fuelOptions,
  listingStatusOptions,
  transmissionOptions,
} from "@/lib/options";

const nextYear = new Date().getFullYear() + 1;

const optionalString = (max = 160) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(max).optional(),
  );

const optionalInt = (min: number, max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.coerce.number().int().min(min).max(max).optional(),
  );

const checkbox = z.preprocess((value) => value === "true" || value === "on", z.boolean());

export const authSchema = z.object({
  email: z.string().email().max(180).transform((value) => value.toLowerCase().trim()),
  password: z.string().min(8).max(100),
  name: z.string().trim().min(2).max(100).optional(),
});

export const listingSchema = z.object({
  make: z.string().trim().min(1).max(80),
  model: z.string().trim().min(1).max(80),
  trim: z.string().trim().max(120).optional().or(z.literal("")),
  yearMonth: optionalString(20),
  year: z.coerce.number().int().min(1950).max(nextYear),
  price: z.coerce.number().int().min(100000).max(250000000),
  priceEur: optionalInt(1, 10000000),
  mileage: z.coerce.number().int().min(0).max(2000000),
  fuel: z.enum(fuelOptions),
  transmission: z.enum(transmissionOptions),
  bodyType: z.enum(bodyTypeOptions),
  condition: z.enum(conditionOptions),
  location: z.string().trim().min(2).max(120),
  description: z.string().trim().min(20).max(5000),
  financingDetails: optionalString(120),
  financeTermMonths: optionalInt(1, 120),
  seats: optionalInt(1, 12),
  doors: optionalInt(1, 7),
  color: optionalString(80),
  upholsteryPrimary: optionalString(80),
  upholsterySecondary: optionalString(80),
  curbWeightKg: optionalInt(200, 10000),
  grossWeightKg: optionalInt(200, 12000),
  trunkVolumeLiters: optionalInt(1, 5000),
  climate: optionalString(120),
  roof: optionalString(120),
  engineDisplacementCcm: optionalInt(1, 10000),
  powerKw: optionalInt(1, 2000),
  powerHp: optionalInt(1, 3000),
  cylinderLayout: optionalString(80),
  driveType: optionalString(80),
  gearboxDetail: optionalString(140),
  batteryCapacityPercent: optionalInt(0, 100),
  acChargerType: optionalString(80),
  fastCharging: checkbox,
  wltpRangeKm: optionalInt(1, 2000),
  systemPowerKw: optionalInt(1, 2500),
  systemPowerHp: optionalInt(1, 3500),
  documentsType: optionalString(200),
  inspectionValidUntil: optionalString(40),
  frontTireSize: optionalString(80),
  rearTireSize: optionalString(80),
  interiorFeatures: optionalString(10000),
  technicalFeatures: optionalString(10000),
  exteriorFeatures: optionalString(10000),
  multimediaFeatures: optionalString(10000),
  extraInfo: optionalString(10000),
  historyInternationalEnabled: checkbox,
  historyDomesticEnabled: checkbox,
  vatDeductible: checkbox,
  tradeInAvailable: checkbox,
  availableImmediately: checkbox,
  status: z.enum(listingStatusOptions).default("PUBLISHED"),
});

export type ListingInput = z.infer<typeof listingSchema>;
