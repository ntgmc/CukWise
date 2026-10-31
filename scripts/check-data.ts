import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getProducts, getPrices, getReadings, getPublicReviews } from "../src/data/catalog";

for (const file of new Set([...getProducts().flatMap(p => [p.image, ...p.specImages]), ...getPrices().map(p => p.sourceUrl).filter(source => source.startsWith("images/"))])) {
  const bytes = readFileSync(new URL(`../public/${file}`, import.meta.url));
  assert(bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP", `${file} must be a WebP image`);
}
console.log(`Data valid: ${getProducts().length} products, ${getPrices().length} prices, ${getReadings().length} readings, ${getPublicReviews().length} reviews.`);
