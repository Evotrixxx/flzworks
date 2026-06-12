export const fuelOptions = ["PETROL", "DIESEL", "HYBRID", "ELECTRIC", "LPG"] as const;
export const transmissionOptions = ["MANUAL", "AUTOMATIC"] as const;
export const bodyTypeOptions = [
  "HATCHBACK",
  "SEDAN",
  "WAGON",
  "SUV",
  "VAN",
  "COUPE",
  "CONVERTIBLE",
  "PICKUP",
  "OTHER",
] as const;
export const conditionOptions = [
  "NORMAL",
  "EXCELLENT",
  "WELL_KEPT",
  "LIKE_NEW",
  "DAMAGED",
] as const;
export const listingStatusOptions = ["DRAFT", "PUBLISHED", "SOLD"] as const;

export const sortOptions = [
  "newest",
  "price_asc",
  "price_desc",
  "year_desc",
  "mileage_asc",
] as const;

export type FuelOption = (typeof fuelOptions)[number];
export type TransmissionOption = (typeof transmissionOptions)[number];
export type BodyTypeOption = (typeof bodyTypeOptions)[number];
export type ConditionOption = (typeof conditionOptions)[number];
export type ListingStatusOption = (typeof listingStatusOptions)[number];
export type SortOption = (typeof sortOptions)[number];
