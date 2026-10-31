import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { getProducts, getReadings, getPublicReviews } from "../src/data/catalog";
import { guides } from "../src/data/guides";
import { sourceStatus } from "./source-status";

const urls = [...new Set([
  ...getProducts().map(p => p.sourceUrl), ...getReadings().map(r => r.url),
  ...getPublicReviews().map(r => r.sourceUrl), ...guides.flatMap(g => g.sources.map(s => s.url))
])];
const results: { url: string; status: string; http?: number; detail?: string }[] = [];
// Sequential requests keep this weekly maintenance check gentle on source sites.
for (const url of urls) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000), headers: { "User-Agent": "CukWise source check (+https://github.com/ntgmc/CukWise)" } });
    const body = (await response.text()).slice(0, 500000);
    results.push({ url, http: response.status, status: sourceStatus(response.status, body) });
  } catch (error) {
    results.push({ url, status: "unavailable", detail: error instanceof Error ? error.message : String(error) });
  }
}
const counts = Object.fromEntries(["reachable", "needs-browser", "missing", "unavailable"].map(status => [status, results.filter(r => r.status === status).length]));
assert.equal(results.length, urls.length, "Every source must produce one result");
assert.equal(Object.values(counts).reduce((sum, count) => sum + count, 0), urls.length, "Every result must have a known status");
mkdirSync("artifacts/maintenance", { recursive: true });
writeFileSync("artifacts/maintenance/sources.json", JSON.stringify({ checkedAt: new Date().toISOString(), counts, results }, null, 2) + "\n");
const report = `# CukWise 来源检查\n\n${urls.length} 个来源：${counts.reachable} 可访问，${counts["needs-browser"]} 需浏览器核对，${counts.missing} 疑似失效，${counts.unavailable} 暂不可用。\n\n状态检查不证明正文仍然准确。购买链接与实时价格请按具体店铺另行核对。\n\n` + results.filter(r => r.status !== "reachable").map(r => `- ${r.status} / ${r.http ?? "network"}: ${r.url}`).join("\n") + "\n";
writeFileSync("artifacts/maintenance/sources.md", report);
console.log(report);
