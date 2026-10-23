export const appBasePath = import.meta.env.BASE_URL;

/** Turn an app route such as `/stories/example` into a deployment-aware URL. */
export function routeHref(path: string): string {
  const basePath = appBasePath.endsWith("/") ? appBasePath : `${appBasePath}/`;
  const routePath = path.startsWith("/") ? path.slice(1) : path;
  return `${basePath}${routePath}`;
}

export function routePathFromUrl(pathname: string): string {
  if (appBasePath === "/") return pathname.replace(/\/$/, "") || "/";
  const basePath = appBasePath.endsWith("/") ? appBasePath : `${appBasePath}/`;
  const prefix = basePath.slice(0, -1);
  const routePath = pathname === prefix ? "/" : pathname.startsWith(basePath) ? `/${pathname.slice(basePath.length)}` : pathname;
  return routePath.replace(/\/$/, "") || "/";
}
