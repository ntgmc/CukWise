const basePath = import.meta.env?.BASE_URL ?? "/";

export function withBase(path: string, base = basePath): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const prefix = base.replace(/\/$/, "");
  const index = path.search(/[?#]/);
  const pathname = index < 0 ? path : path.slice(0, index);
  const suffix = index < 0 ? "" : path.slice(index);
  const route = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return `${prefix}${route}${suffix}`;
}
export function sourceHref(source: string, base = basePath): string {
  return source.startsWith("images/") ? `${base.replace(/\/$/, "")}/${source}` : source;
}
export function withoutBase(path: string, base = basePath): string {
  const prefix = base.replace(/\/$/, "");
  return path === prefix ? "/" : path.startsWith(`${prefix}/`) ? path.slice(prefix.length) : path;
}
