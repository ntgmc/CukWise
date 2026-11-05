import { categories, type Product } from "./domain";

export function matchesQuery(value: string, query: string) {
  const normalize = (text: string) => text.normalize("NFKC").toLowerCase().replace(/[\s·・\-_/]/g, "");
  const haystack = normalize(value);
  const compact = normalize(query);
  if (/^[a-z]+\d+[a-z0-9]*$/.test(compact)) return haystack.includes(compact);
  return query.normalize("NFKC").trim().split(/\s+/).every(term => haystack.includes(normalize(term)));
}

export function matchesProduct(product: Product, query: string) {
  return matchesQuery([product.name, product.model, categories[product.category], product.series, product.summary,
    product.specs["官网目录标识"] ?? "", ...product.tags, ...product.protocols, product.ports,
    product.maxOutputW === null ? "" : `${product.maxOutputW}W`, ...Object.values(product.specs)].join(" "), query);
}
