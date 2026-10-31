import { test } from "node:test";
import assert from "node:assert/strict";
import { sourceStatus } from "../scripts/source-status";

test("source checks distinguish soft 404s and verification from valid articles", () => {
  assert.equal(sourceStatus(200, "<title>Lego head</title>您要找的页面不存在"), "missing");
  assert.equal(sourceStatus(200, "<title>404</title>"), "missing");
  assert.equal(sourceStatus(404, ""), "missing");
  assert.equal(sourceStatus(410, ""), "missing");
  assert.equal(sourceStatus(200, "<title>Page Verification</title>"), "needs-browser");
  assert.equal(sourceStatus(403, ""), "needs-browser");
  assert.equal(sourceStatus(429, ""), "needs-browser");
  assert.equal(sourceStatus(200, "<title>充电器评测</title><p>输入 100–240V</p>"), "reachable");
  assert.equal(sourceStatus(503, ""), "unavailable");
});
