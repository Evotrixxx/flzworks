import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  bodyTypeOptions,
  conditionOptions,
  fuelOptions,
  sortOptions,
  transmissionOptions,
  type SortOption,
} from "@/lib/options";

export type SearchParamsInput = Record<string, string | string[] | undefined>;

export type ParsedListingSearch = {
  keyword?: string;
  make?: string;
  model?: string;
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  mileageMax?: number;
  fuel?: string;
  transmission?: string;
  bodyType?: string;
  condition?: string;
  location?: string;
  sort: SortOption;
  page: number;
};

export type ListingCardData = {
  id: string;
  make: string;
  model: string;
  trim: string | null;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  bodyType: string;
  condition: string;
  location: string;
  description: string;
  financingDetails: string | null;
  vatDeductible: boolean;
  availableImmediately: boolean;
  status: string;
  createdAt: Date;
  seller: {
    id: string;
    name: string;
    email: string;
  };
  photos: {
    id: string;
    path: string;
    sortOrder: number;
  }[];
  favorites: {
    id: string;
  }[];
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function cleanString(value: string | string[] | undefined) {
  const cleaned = first(value)?.trim();
  return cleaned ? cleaned : undefined;
}

function positiveInt(value: string | string[] | undefined) {
  const parsed = Number.parseInt(first(value) ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function enumValue<T extends readonly string[]>(value: string | string[] | undefined, allowed: T) {
  const candidate = first(value);
  return allowed.includes(candidate ?? "") ? candidate : undefined;
}

export function parseListingSearch(params: SearchParamsInput): ParsedListingSearch {
  return {
    keyword: cleanString(params.keyword),
    make: cleanString(params.make),
    model: cleanString(params.model),
    priceMin: positiveInt(params.priceMin),
    priceMax: positiveInt(params.priceMax),
    yearMin: positiveInt(params.yearMin),
    yearMax: positiveInt(params.yearMax),
    mileageMax: positiveInt(params.mileageMax),
    fuel: enumValue(params.fuel, fuelOptions),
    transmission: enumValue(params.transmission, transmissionOptions),
    bodyType: enumValue(params.bodyType, bodyTypeOptions),
    condition: enumValue(params.condition, conditionOptions),
    location: cleanString(params.location),
    sort: (enumValue(params.sort, sortOptions) as SortOption | undefined) ?? "newest",
    page: Math.max(1, positiveInt(params.page) ?? 1),
  };
}

export function buildListingWhere(
  filters: ParsedListingSearch,
  base: Prisma.ListingWhereInput = { status: "PUBLISHED" },
): Prisma.ListingWhereInput {
  const and: Prisma.ListingWhereInput[] = [base];

  if (filters.keyword) {
    and.push({
      OR: [
        { make: { contains: filters.keyword } },
        { model: { contains: filters.keyword } },
        { trim: { contains: filters.keyword } },
        { description: { contains: filters.keyword } },
        { location: { contains: filters.keyword } },
      ],
    });
  }

  if (filters.make) and.push({ make: { contains: filters.make } });
  if (filters.model) and.push({ model: { contains: filters.model } });
  if (filters.location) and.push({ location: { contains: filters.location } });
  if (filters.fuel) and.push({ fuel: filters.fuel });
  if (filters.transmission) {
    and.push({ transmission: filters.transmission });
  }
  if (filters.bodyType) {
    and.push({ bodyType: filters.bodyType });
  }
  if (filters.condition) {
    and.push({ condition: filters.condition });
  }

  if (filters.priceMin || filters.priceMax) {
    and.push({
      price: {
        gte: filters.priceMin,
        lte: filters.priceMax,
      },
    });
  }

  if (filters.yearMin || filters.yearMax) {
    and.push({
      year: {
        gte: filters.yearMin,
        lte: filters.yearMax,
      },
    });
  }

  if (filters.mileageMax) {
    and.push({
      mileage: {
        lte: filters.mileageMax,
      },
    });
  }

  return { AND: and };
}

export function getListingOrderBy(sort: SortOption): Prisma.ListingOrderByWithRelationInput {
  switch (sort) {
    case "price_asc":
      return { price: "asc" };
    case "price_desc":
      return { price: "desc" };
    case "year_desc":
      return { year: "desc" };
    case "mileage_asc":
      return { mileage: "asc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

export async function getListings(params: SearchParamsInput, userId?: string) {
  const filters = parseListingSearch(params);
  const pageSize = 8;
  const where = buildListingWhere(filters);

  const [listings, total] = await prisma.$transaction([
    prisma.listing.findMany({
      where,
      orderBy: getListingOrderBy(filters.sort),
      skip: (filters.page - 1) * pageSize,
      take: pageSize,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        photos: {
          orderBy: { sortOrder: "asc" },
        },
        favorites: {
          where: {
            userId: userId ?? "__anonymous__",
          },
          select: {
            id: true,
          },
        },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  return {
    listings: listings as ListingCardData[],
    total,
    page: filters.page,
    pageSize,
    filters,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}
