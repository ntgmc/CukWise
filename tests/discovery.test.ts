import { test } from "node:test";
import assert from "node:assert/strict";
import { getProducts, getPrices, getReadings } from "../src/data/catalog";
import { catalogCoverage } from "../src/lib/coverage";
import { matchesProduct, matchesQuery } from "../src/lib/search";
import { recommend, validateRecommendation } from "../src/lib/recommend";

const products = getProducts();
const product = (id: string) => products.find(item => item.id === id)!;

test("search accepts spaced, full-width and punctuated model names without losing edition identifiers", () => {
  assert(matchesProduct(product("15-ultra"), "ＰＢ２００Ｕ"));
  assert(matchesProduct(product("15-ultra"), "PB 200 U"));
  assert(!matchesProduct(product("15-power"), "PB 200 U"));
  assert(matchesProduct(product("10-mini"), "10号 Mini"));
  assert(matchesProduct(product("6-card-2026"), "AD652S-NY"));
  assert(matchesProduct(product("cable-100-15"), "100 W 1.5m"));
  assert(matchesProduct(product("6-power"), "PB062"));
  assert(matchesProduct(product("fan-plus-clip"), "风扇 夹式"));
  assert(!matchesProduct(product("15-ultra"), "PB200U Mini"));
  assert(!matchesProduct(product("cable-mag10"), "1.5m"));
  assert(matchesQuery("充电头网 · 小张在旅途中", "充电头网 小张"));
  assert(matchesQuery("任意产品", "  "));
});

test("coverage counts standard products separately and reports concrete missing fields", () => {
  const archived = { ...product("6-power"), id: "archived", status: "archived" as const, weightG: null };
  const report = catalogCoverage([product("6-power"), product("6-power-threebody"), product("cp26-cable"), archived], [], []);
  assert.equal(report.categories.find(row => row.category === "powerbank")?.total, 2);
  assert.equal(report.categories.find(row => row.category === "powerbank")?.editions, 1);
  assert.deepEqual(report.gaps.map(gap => [gap.product.id, gap.missing]), [["cp26-cable", ["pdOutputW", "weightG", "产品尺寸"]]]);
  const withoutLength = { ...product("cable-100-15"), specs: {} };
  assert.deepEqual(catalogCoverage([withoutLength], [], []).gaps[0].missing, ["线材长度"]);
});

test("new source data preserves weight provenance and leaves unpublished variants unknown", () => {
  for (const [id, grams] of [["car10",77],["charger-30-ac",46],["charger-30-a18",53],["cp3",46],["cp16",215]] as const) {
    assert.equal(product(id).weightG, grams);
    assert(product(id).specs["重量口径"]);
    assert(getReadings().some(reading => reading.productIds.includes(id)));
  }
  assert.match(product("cp24-cable").specs["电池能量"], /75\.48 Wh/);
  assert.equal(product("6-card-2026").weightG, null);
  assert.equal(product("cp26-cable").pdOutputW, null);
  const report = catalogCoverage(products, getPrices(), getReadings());
  for (const category of ["powerbank", "charger", "car"])
    assert.equal(report.categories.find(row => row.category === category)?.researched, products.filter(p => p.category === category && !p.baseProductId).length);
  const videos = getReadings().filter(reading => reading.url.startsWith("https://www.bilibili.com/video/"));
  assert.equal(videos.length, 9);
  assert(videos.every(reading => reading.kind === "video" && reading.author.startsWith("B站 · ")));
});

test("recommendations rank confirmed budget and weight matches before unconfirmed candidates", () => {
  const input = validateRecommendation({ category:"powerbank", device:"iphone", model:"", scenario:"commute", budgetCents:20000, maxWeight:300, preferCable:true, multipleDevices:false });
  const unknown = { ...product("6-power"), id:"unknown", weightG:null, tags:["自带线", "轻便"] };
  const known = { ...product("10-power"), id:"known" };
  const price = { ...getPrices().find(item => item.kind === "deal")!, productId:"known", amountCents:10000 };
  const result = recommend([unknown,known], [price], input).results;
  assert.deepEqual(result.map(item => item.product.id), ["known", "unknown"]);
  assert.equal(result[0].constraintsConfirmed, true);
  assert.equal(result[1].constraintsConfirmed, false);
  assert(result[1].notes.some(note => note.includes("300 g")));
  assert(result[1].notes.some(note => note.includes("预算")));
});
