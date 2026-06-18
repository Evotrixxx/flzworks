export const AUTOPIAC_BASE_PATH = "/intranet/autopiac";
export const GUIDE_PROTOTYPE_BASE_PATH = "/intranet/guide_prototype";
export const TREE_PROTOTYPE_BASE_PATH = "/intranet/tree_prototype";

export const AUTOPIAC_INTRANET_MODULE = "autopiac";
export const GUIDE_PROTOTYPE_INTRANET_MODULE = "guide_prototype";
export const TREE_PROTOTYPE_INTRANET_MODULE = "tree_prototype";

export const ALLOWED_INTRANET_MODULES = [
  AUTOPIAC_INTRANET_MODULE,
  GUIDE_PROTOTYPE_INTRANET_MODULE,
  TREE_PROTOTYPE_INTRANET_MODULE,
] as const;

export type IntranetModule = typeof ALLOWED_INTRANET_MODULES[number];

export function autopiacPath(path = "") {
  if (!path || path === "/") {
    return AUTOPIAC_BASE_PATH;
  }

  return `${AUTOPIAC_BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}

export function withLang(path: string, locale: string) {
  return `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
}
