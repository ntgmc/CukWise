import { test, expect } from "@playwright/test";

const base = (process.env.BASE_PATH || "/").replace(/\/$/, "");
const route = (value = "") => `${base}/${value}`;

test("search shows total matches, supports spaced models and opens the complete result list", async ({ page }) => {
  await page.goto(route("products/"));
  await page.getByRole("textbox", { name:"搜索产品名称或型号" }).fill("ＰＢ２００Ｕ");
  await expect(page.locator(".product-card")).toHaveCount(2);
  await page.getByRole("textbox", { name:"搜索产品名称或型号" }).fill("10号 Mini");
  await expect(page.locator(".product-card")).not.toHaveCount(0);
  await page.keyboard.press("Control+k");
  const search = page.getByRole("combobox", { name:"搜索产品", exact:true });
  await search.fill("10号");
  await expect(page.locator(".search-caption")).toContainText("先显示前 8 款");
  await expect(page.getByRole("dialog").getByRole("option")).toHaveCount(8);
  await page.setViewportSize({width:320,height:568});
  const allResults=page.getByRole("link", { name:/查看全部 .* 款结果/ });
  await expect(allResults).toBeInViewport({ratio:1});
  for(let index=0;index<7;index++) await page.keyboard.press("ArrowDown");
  await expect(page.locator(".search-result.selected")).toBeInViewport({ratio:0.99});
  await expect(page.getByRole("button", {name:"关闭搜索"})).toBeInViewport({ratio:1});
  await expect(allResults).toBeInViewport({ratio:1});
  await allResults.click();
  await expect(page.getByRole("textbox", { name:"搜索产品名称或型号" })).toHaveValue("10号");
  expect(await page.locator(".product-card").count()).toBeGreaterThan(8);
  await page.keyboard.press("Control+k");
  await search.fill("不存在的型号");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("dialog").getByRole("option")).toHaveCount(0);
  await search.fill("PB 200 U");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new RegExp(`${base}/products/15-ultra/`));
});

test("compare edits persist, keep the tray consistent and synchronize across tabs", async ({ page, context }) => {
  await page.goto(route("compare/?ids=6-power,15-ultra"));
  await expect(page.locator(".compare-product-head")).toHaveCount(2);
  await expect(page.locator(".tray-title")).toContainText("2");
  await page.getByRole("combobox", { name:"添加对比产品" }).selectOption("10-power");
  await expect(page.locator(".compare-product-head")).toHaveCount(3);
  await expect(page.locator(".tray-title")).toContainText("3");
  await page.getByRole("button", { name:"移除6号电能块", exact:true }).first().click();
  await page.getByRole("button", { name:"10号电能棒向左移动", exact:true }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("cukwise:compare")!))).toEqual(["10-power", "15-ultra"]);
  await page.reload();
  await expect(page.locator(".compare-product-head").first()).toContainText("10号电能棒");
  const other = await context.newPage();
  await other.goto(route("products/10-power/"));
  await other.getByRole("button", { name:"已加入", exact:true }).click();
  await expect(page.locator(".compare-product-head")).toHaveCount(1);
  await expect(page).toHaveURL(/ids=15-ultra/);
  await other.close();
  await page.getByRole("button", { name:"清空对比", exact:true }).click();
  await page.reload();
  await expect(page.locator(".comparison-table")).toHaveCount(0);
  await expect(page.getByRole("complementary", { name:"已选对比产品" })).toHaveCount(0);
});

test("detail pages group specifications and link sibling editions without inheriting unknown weights", async ({ page }) => {
  await page.goto(route("products/6-card-2026/"));
  await expect(page.locator(".detail-glance")).toContainText("未公开");
  await page.getByText(/同系列版本 · 共/).click();
  await expect(page.locator(".related-editions a")).toHaveCount(4);
  await expect(page.locator(".related-editions a[href$='/6-card-2025/']")).toBeVisible();
  await expect(page.locator(".spec-groups h3")).toContainText(["基本信息", "容量与功率", "接口与协议", "输入与输出", "尺寸与线材", "使用与资料"]);
  await page.goto(route("products/cable-100-15/"));
  await expect(page.locator(".detail-glance")).toContainText("1.5 m");
  await expect(page.locator(".detail-glance")).toContainText("480 Mbps");
  await page.goto(route("products/cp3/"));
  await expect(page.locator(".detail-glance")).toContainText("46 g");
  await expect(page.locator(".spec-groups")).toContainText("AC301 表列重量");
  await page.goto(route("products/fan-desk/"));
  await expect(page.locator(".spec-groups")).not.toContainText("不适用");
  await expect(page.locator(".spec-groups")).toContainText("距出风口 60 cm");
});

test("recommendations distinguish unconfirmed limits and clear results after inputs change", async ({ page }) => {
  await page.goto(route("recommend/"));
  await page.locator("input[name=budget]").fill("1");
  await page.getByRole("button", { name:"看看适合哪款" }).click();
  await expect(page.locator(".recommend-result")).not.toHaveCount(0);
  await expect(page.locator(".recommend-result-top .badge").first()).toHaveText("预算或重量待核对");
  await expect(page.locator(".recommend-notes").first()).toContainText("预算");
  await page.locator("input[name=budget]").fill("500");
  await expect(page.locator(".recommend-result")).toHaveCount(0);
  await page.getByRole("button", { name:"看看适合哪款" }).click();
  await expect(page.locator(".recommend-result-top .badge").first()).toHaveText("优先考虑");
  await page.locator("select[name=device]").selectOption("laptop140");
  await expect(page.locator(".recommend-result")).toHaveCount(0);
});
