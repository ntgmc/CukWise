import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getProducts, getPrices, getReadings, getPublicReviews, getPurchaseUrl } from "../src/data/catalog";
import { guides, guidesForCategory } from "../src/data/guides";
import { day, safeUrl, text } from "../src/lib/validation";

for (const file of new Set([...getProducts().flatMap(p => [p.image, ...p.specImages]), ...getPrices().map(p => p.sourceUrl).filter(source => source.startsWith("images/"))])) {
  const bytes = readFileSync(new URL(`../public/${file}`, import.meta.url));
  assert(bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP", `${file} must be a WebP image`);
}
assert(new Set(guides.map(guide => guide.id)).size === guides.length, "Duplicate guide ID");
for (const guide of guides) {
  assert(/^[a-z0-9-]+$/.test(guide.id), `Invalid guide ID: ${guide.id}`);
  text(guide.title, "指南标题", 160);
  day(guide.updatedAt, "指南核对日期");
  assert(guide.sections.length && guide.checklist.length && guide.sources.length, `Incomplete guide: ${guide.id}`);
  for (const pick of guide.picks) assert(getProducts().some(p => p.id === pick.productId), `Unknown guide product: ${pick.productId}`);
  for (const source of guide.sources) safeUrl(source.url);
}
for (const product of getProducts()) assert(guidesForCategory(product.category).length > 0, `No category guide: ${product.id}`);
console.log(`Data valid: ${getProducts().length} products, ${getPrices().length} prices, ${getReadings().length} readings, ${getPublicReviews().length} summaries, ${guides.length} guides.`);
console.log(`Coverage: ${getProducts().filter(p => getPurchaseUrl(p.id)).length} official buying links; ${new Set(getPrices().filter(p => p.productId).map(p => p.productId)).size} products with price records; ${getPrices().filter(p => p.productId === null).length} ambiguous quotes retained.`);
