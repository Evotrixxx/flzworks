import { cookies } from "next/headers";
import { dictionaries, normalizeLocale, type Locale } from "@/lib/i18n";

type SearchParamsLike = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function getLocale(searchParams?: SearchParamsLike): Promise<Locale> {
  const queryLocale = first(searchParams?.lang);

  if (queryLocale) {
    return normalizeLocale(queryLocale);
  }

  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get("autopiac_lang")?.value);
}

export async function getDictionary(searchParams?: SearchParamsLike) {
  const locale = await getLocale(searchParams);
  return dictionaries[locale];
}
