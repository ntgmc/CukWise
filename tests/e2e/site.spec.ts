import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

const base = (process.env.BASE_PATH || "/").replace(/\/$/, "");
const route = (value = "") => `${base}/${value}`;

test("every generated route and asset uses a valid static path", async ({ request }) => {
  const files = readdirSync("dist", { recursive: true }).map(String).filter(file => file.endsWith(".html"));
  expect(files.length).toBeGreaterThan(90);
  const links = new Set<string>();
  for (const file of files) {
    const html = readFileSync(path.join("dist", file), "utf8");
    expect(html).not.toMatch(/(?:href|action)="[^\"]*\/(?:submit|admin|api)(?:[/?"])/);
    for (const match of html.matchAll(/(?:href|src|component-url|renderer-url)="(\/[^\"]*)"/g)) links.add(match[1]);
  }
  for (const link of links) {
    expect(link.startsWith(`${base}/`), link).toBe(true);
    const pathname = new URL(link.replaceAll("&amp;", "&"), "http://localhost").pathname.slice(base.length + 1);
    expect(existsSync(path.join("dist", pathname.endsWith("/") ? `${pathname}index.html` : pathname)), link).toBe(true);
  }
  for (const page of ["", "products/", "products/15-ultra/", "compare/", "deals/", "recommend/", "insights/", "about/", "privacy/"]) {
    expect((await request.get(route(page))).status()).toBe(200);
  }
  for (const removed of ["submit/", "admin/", "api/catalog/"]) expect((await request.get(route(removed))).status()).toBe(404);
});

test("all catalog photos decode locally and official specifications expand", async ({ page }) => {
  const external: string[] = [];
  page.on("request", request => { if (new URL(request.url()).hostname !== "127.0.0.1") external.push(request.url()); });
  await page.goto(route("products/"));
  await page.getByLabel("包含限定版本").check();
  await expect(page.locator(".product-card .product-photo")).toHaveCount(88);
  const decoded = await page.locator(".product-card .product-photo").evaluateAll(async images => Promise.all(images.map(async element => {
    const image = element as HTMLImageElement;
    image.loading = "eager";
    await image.decode();
    return image.naturalWidth === 720 && image.naturalHeight === 520 && image.alt.length > 0;
  })));
  expect(decoded.every(Boolean)).toBe(true);
  for (const id of ["15-ultra", "cable-240", "fan-desk", "energy600", "6-card-2026"]) {
    await page.goto(route(`products/${id}/`));
    await expect(page.locator(".detail-visual .product-photo")).toBeVisible();
    await page.getByText("查看官方规格图", { exact: true }).click();
    const image = page.locator(".official-specs img").first();
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  }
  expect(external).toEqual([]);
});

test("official catalog identifiers remain searchable after correcting model names", async ({ page }) => {
  await page.goto(route("products/"));
  await page.getByRole("textbox", { name: "搜索产品名称或型号" }).fill("PB062");
  await expect(page.locator(".product-card")).toHaveCount(2);
  await expect(page.locator(".product-card").first()).toContainText("PB060");
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox", { name: "搜索产品", exact: true }).fill("AD652SNY");
  await expect(page.getByRole("option").first()).toContainText("新年版");
  await page.getByRole("option").first().click();
  await expect(page).toHaveURL(new RegExp(`${base}/products/6-card-2026/`));
});

test("search, favorites and compare survive document navigation", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(route());
  await page.locator("astro-island[component-export='Header']:not([ssr])").waitFor();
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox", { name: "搜索产品" }).fill("PB200U");
  await page.getByRole("option").first().click();
  await expect(page).toHaveURL(new RegExp(`${base}/products/15-ultra/`));
  await page.locator("astro-island[component-export='default']:not([ssr])").waitFor();
  await page.getByRole("button", { name: "收藏产品", exact: true }).click();
  await page.getByRole("button", { name: "加入对比", exact: true }).click();
  await expect(page.getByRole("complementary", { name: "已选对比产品" })).toBeVisible();
  await page.getByRole("link", { name: "我的收藏" }).click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page.locator(".product-card")).toContainText("15号电能柱 Ultra");
  await page.reload();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.getByRole("link", { name: "开始对比" }).click();
  await expect(page.locator(".comparison-table")).toContainText("15号电能柱 Ultra");
  expect(errors).toEqual([]);
});

test("query filters, direct compare links, custom fields and clearing work", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(route("products/?category=cable"));
  await expect(page.getByRole("button", { name: "数据线", exact: true })).toHaveClass("active");
  await expect(page.locator(".product-card .category-label").first()).toHaveText("数据线");
  await page.goto(route("compare/?ids=6-power,15-ultra,missing,6-power"));
  await expect(page.locator(".compare-product-head")).toHaveCount(2);
  await expect(page.locator(".comparison-table")).toContainText("6,000 mAh");
  const before = await page.locator(".comparison-table tbody tr").count();
  await page.getByLabel("只看不同项").check();
  expect(await page.locator(".comparison-table tbody tr").count()).toBeLessThan(before);
  await page.getByText("自定义参数", { exact: true }).click();
  await page.getByLabel("产品型号", { exact: true }).uncheck();
  await expect(page.locator(".comparison-table tbody")).not.toContainText("产品型号");
  await page.getByRole("button", { name: "复制对比链接" }).click();
  await expect(page.getByRole("button", { name: "链接已复制" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(`${base}/compare/?ids=6-power%2C15-ultra`);
  await page.getByRole("button", { name: "清空对比", exact: true }).click();
  await expect(page.locator(".comparison-table")).toHaveCount(0);
});

test("recommendations are local and deals without expiry stay separate from references", async ({ page }) => {
  const requests: string[] = [];
  await page.goto(route("recommend/?category=powerbank"));
  await page.locator("astro-island[component-export='RecommendationForm']:not([ssr])").waitFor();
  page.on("request", request => { if (["fetch", "xhr"].includes(request.resourceType())) requests.push(request.url()); });
  await page.locator("select[name=device]").selectOption("laptop140");
  await page.locator("input[name=model]").fill("测试笔记本");
  await page.getByRole("button", { name: "看看适合哪款" }).click();
  await expect(page.locator(".recommend-result")).not.toHaveCount(0);
  await expect(page.locator(".recommend-reasons").first()).toContainText("140 W");
  expect(requests).toEqual([]);
  await page.goto(route("deals/"));
  await expect(page.locator(".deal-card")).toHaveCount(80);
  await expect(page.locator(".deal-card .badge").first()).toHaveText("好价");
  await expect(page.locator(".deal-card").first()).toContainText("拼多多 · 百亿补贴店铺");
  await page.getByRole("button", { name: "当前好价", exact: true }).click();
  await expect(page.locator(".deal-card")).toHaveCount(29);
  await expect(page.locator(".deal-card").first()).toContainText("2026年10月25日活动价");
  await expect(page.locator(".deal-card").first()).toContainText("购买用券：5折减15");
  await page.getByRole("button", { name: "历史好价", exact: true }).click();
  await expect(page.locator(".deal-card")).toHaveCount(0);
  await page.getByRole("button", { name: "参考报价", exact: true }).click();
  await expect(page.locator(".deal-card")).toHaveCount(51);
  await expect(page.locator(".deal-card .badge").first()).toHaveText("参考报价");
});

test("screenshot quotes preserve unmapped names, coupon terms and local sources", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(route("deals/"));
  const cp26 = page.locator(".deal-card").filter({has:page.getByRole("heading", {name:"CP26 电能块·自带线", exact:true})});
  await expect(cp26).toContainText("¥149");
  await expect(cp26).not.toContainText("型号待确认");
  await expect(cp26.getByRole("heading").getByRole("link")).toHaveAttribute("href",`${base}/products/cp26-cable/`);
  await expect(cp26).toContainText("7折减50或7.5折减50");
  const source = cp26.getByRole("link", {name:"查看来源"});
  await expect(source).toHaveAttribute("href", `${base}/images/prices/1025-discount-guide.webp`);
  const response = await page.request.get((await source.getAttribute("href"))!);
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("image/webp");
  await page.getByRole("combobox", {name:"产品分类", exact:true}).selectOption("charger");
  await expect(cp26).toHaveCount(0);
  await page.getByRole("combobox", {name:"产品分类", exact:true}).selectOption("all");
  await page.getByRole("button", {name:"参考报价", exact:true}).click();
  await expect(page.locator(".deal-card")).toHaveCount(51);
  await page.goto(route("products/10-charger-se/"));
  await expect(page.locator(".price-record")).toHaveCount(2);
  await expect(page.locator(".detail-price")).toContainText("¥70");
  await expect(page.locator(".detail-price")).not.toContainText("待补充");
  await expect(page.locator(".price-record").first()).toContainText("2026年10月25日活动价");
  await expect(page.locator(".price-record").first()).toContainText("拼多多 · 百亿补贴店铺");
  await expect(page.locator(".price-record").first()).toContainText("购买用券：7折减50或7.5折减50");
  await expect(page.locator(".price-record").first()).not.toContainText("截至");
  await expect(page.locator(".price-record .badge").first()).toHaveText("好价");
  await expect(page.locator(".price-record").first()).toContainText("¥70");
  await expect(page.locator(".price-chart circle")).toHaveCount(1);
  await expect(page.locator(".price-chart circle title")).toHaveText("2026.10.31 · ¥70 · 普通用户");
  await expect(page.locator(".price-record").last()).toContainText("2026年双十一参考价");
  await expect(page.locator(".price-record").last()).toContainText("¥71");
  await expect(page.locator(".price-record a").first()).toHaveAttribute("href", `${base}/images/prices/1025-discount-guide.webp`);
  expect(errors).toEqual([]);
});

test("catalog filters survive reload and model search finds limited editions", async ({ page }) => {
  await page.goto(route("products/?category=charger&power=100&protocol=PD"));
  await expect(page.getByRole("combobox",{name:"单口 PD 最低功率"})).toHaveValue("100");
  await expect(page.locator(".product-card")).not.toHaveCount(0);
  await expect(page.locator(".product-card").filter({has:page.getByRole("heading",{name:/6号充电器 Mini|6号屏显充 Ultra/})})).toHaveCount(0);
  await page.getByRole("combobox",{name:"当前好价预算"}).selectOption("10000");
  await expect(page).toHaveURL(/budget=10000/);
  const count=await page.locator(".product-card").count();
  await page.reload();
  await expect(page.locator(".product-card")).toHaveCount(count);
  await page.getByRole("button",{name:"清空筛选"}).click();
  await page.getByRole("textbox",{name:"搜索产品名称或型号"}).fill("AD652SNY");
  await expect(page.locator(".product-card")).toHaveCount(2);
});
test("skip link moves keyboard focus into main content", async ({ page }) => {
  await page.goto(route("guides/laptop-pd/"));
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toHaveText("跳到内容");
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
});

test("buying guides, attributed summaries and official buying links are usable", async ({ page }) => {
  const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
  await page.goto(route("insights/"));
  await expect(page.locator(".guide-card")).toHaveCount(8);
  await page.getByRole("textbox",{name:"搜索选购资料"}).fill("AD653");
  await expect(page.locator("#sources .reading-card")).not.toHaveCount(0);
  await page.getByRole("button",{name:"拆解核对",exact:true}).click();
  await expect(page.locator("#sources .reading-card").first()).toContainText("拆解核对");
  await page.goto(route("guides/laptop-pd/"));
  await expect(page.locator(".guide-checklist")).toContainText("EPR");
  await page.getByRole("link",{name:"对比文中型号"}).click();
  await expect(page.locator(".compare-product-head")).toHaveCount(3);
  await page.goto(route("products/6-mini/"));
  await expect(page.locator(".detail-glance")).toContainText("65 W");
  await expect(page.locator("#experiences")).toContainText("小米 90 W，笔记本按 PD 65 W 选");
  await expect(page.getByRole("link",{name:"官网购买入口",exact:true})).toHaveAttribute("href",/^https:\/\/item\.jd\.com\//);
  await page.goto(route("products/cable-240/"));
  await expect(page.getByRole("link",{name:"查看选购要点"})).toHaveAttribute("href",`${base}/guides/usb-cables/`);
  await expect(page.getByRole("link",{name:"适合我的设备吗"})).toHaveCount(0);
  expect(errors).toEqual([]);
});

for (const width of [320, 375, 414, 768, 1440]) {
  test(`pages fit ${width}px without runtime or hydration errors`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    for (const url of ["", "products/", "products/15-ultra/", "compare/?ids=6-power,15-ultra", "deals/", "recommend/", "insights/", "guides/laptop-pd/", "products/cp26-cable/", "products/cable-240/"]) {
      await page.goto(route(url));
      await page.locator("astro-island[ssr]").first().waitFor({ state: "detached" }).catch(() => {});
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.body.scrollWidth <= innerWidth), url).toBe(true);
      if (!url) await page.screenshot({ path: `artifacts/home-${width}.png`, fullPage: true });
    }
    expect(errors).toEqual([]);
  });
}
