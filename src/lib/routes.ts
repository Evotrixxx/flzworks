export const AUTOPIAC_BASE_PATH = "/intranet/autopiac";

export function autopiacPath(path = "") {
  if (!path || path === "/") {
    return AUTOPIAC_BASE_PATH;
  }

  return `${AUTOPIAC_BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}

export function withLang(path: string, locale: string) {
  return `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
}
