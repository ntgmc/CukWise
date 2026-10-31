import { test } from "node:test";
import assert from "node:assert/strict";
import { getProducts, getPrices, getReadings, getPublicReviews, getPurchaseUrl, validatePublicReview } from "../src/data/catalog";
import { guides, guidesForCategory } from "../src/data/guides";
import { compareRows, currentPrice, isCurrentDeal, lowestPrice, referencePrice, specValue, type PriceRecord } from "../src/lib/domain";
import { recommend, validateRecommendation } from "../src/lib/recommend";
import { centsFromInput, validatePrice, validateProduct } from "../src/lib/validation";
import { withBase, withoutBase, sourceHref } from "../src/lib/paths";

const products = getProducts();
function price(values: Partial<PriceRecord> = {}): PriceRecord {
  return { id:"test", productId:products[0].id, amountCents:10000, platform:"测试平台",store:"测试店铺",kind:"deal",eligibility:"public",conditions:"普通用户直接购买",recordedAt:"2020-01-01",expiresAt:"2099-01-01",sourceUrl:"https://example.com/price",sourceLabel:"价格来源",archived:false,...values };
}
test("project paths preserve queries and fragments, and external links", () => {
  assert.equal(withBase("/products/15-ultra?source=compare#prices", "/CukWise/"), "/CukWise/products/15-ultra/?source=compare#prices");
  assert.equal(withBase("/", "/CukWise"), "/CukWise/");
  assert.equal(withBase("/compare?ids=6-power,15-ultra", "/"), "/compare/?ids=6-power,15-ultra");
  assert.equal(withBase("https://example.com/a", "/CukWise"), "https://example.com/a");
  assert.equal(withBase("#prices", "/CukWise"), "#prices");
  assert.equal(withoutBase("/CukWise/products/", "/CukWise/"), "/products/");
  assert.equal(withoutBase("/CukWise-other/products/", "/CukWise"), "/CukWise-other/products/");
  assert.equal(sourceHref("images/prices/1025-discount-guide.webp", "/CukWise/"), "/CukWise/images/prices/1025-discount-guide.webp");
  assert.equal(sourceHref("images/prices/1025-discount-guide.webp", "/"), "/images/prices/1025-discount-guide.webp");
  assert.equal(sourceHref("https://example.com/source", "/CukWise"), "https://example.com/source");
});
test("reference quotes and different purchase conditions do not become public lows", () => {
  const prices=[price({id:"ordinary",amountCents:10000}),price({id:"member",eligibility:"member",amountCents:5000}),price({id:"reference",kind:"reference",amountCents:1000}),price({id:"future",recordedAt:"2099-01-01",amountCents:2000})];
  assert.equal(lowestPrice(prices,products[0].id)?.id,"ordinary");
  assert.equal(currentPrice(prices,products[0].id)?.id,"ordinary");
  assert.equal(lowestPrice(getPrices(),"cp13-pocket"),undefined);
});
test("screenshot import preserves both columns, variants and unmapped product names", () => {
  const imported = getPrices().filter(p => p.id.startsWith("shot-1025-"));
  const quote = (id: string) => imported.find(p => p.id === `shot-1025-${id}`)!;
  assert.equal(imported.length, 74);
  assert.equal(imported.filter(p => p.id.includes("-oct25")).length, 29);
  assert.equal(imported.filter(p => p.id.endsWith("-double11")).length, 45);
  assert.equal(quote("r01-oct25").amountCents, 1080);
  assert.equal(quote("r02-oct25").amountCents, 1270);
  assert.equal(quote("r04-oct25-1").amountCents, 1500);
  assert.equal(quote("r04-oct25-2").amountCents, 1170);
  assert.equal(quote("r04-double11").amountCents, 1200);
  assert.equal(quote("r04-double11").productId, null);
  assert.equal(quote("r11-oct25").amountCents, 4970);
  assert.equal(quote("r13-oct25").productId, "6-card");
  assert.equal(quote("r13-double11").productId, null);
  assert.equal(quote("r25-double11").productName, "CP26电能块");
  assert.equal(quote("r25-double11").productId, "cp26-cable");
  assert.equal(quote("r26-oct25").productId, "10-charger-se");
  assert(quote("r30-double11").conditions.includes("原表推荐：5/5星"));
  assert.equal(quote("r41-double11").productId, null);
  assert.equal(quote("r46-double11").amountCents, 23600);
  assert(!quote("r01-double11"));
  assert(!quote("r25-oct25"));
  assert(imported.every(p => p.platform === "拼多多" && p.store === "百亿补贴店铺" && p.eligibility === "public" && p.amountCents > 0 && p.expiresAt === null));
  assert(imported.every(p => p.conditions.startsWith("2026年") && p.conditions.includes("购买用券：") && !p.conditions.includes("未注明")));
  assert(imported.filter(p => p.id.includes("-oct25")).every(p => p.kind === "deal" && isCurrentDeal(p,"2026-10-31")));
  assert(imported.filter(p => p.id.endsWith("-double11")).every(p => p.kind === "reference" && !isCurrentDeal(p,"2026-10-31")));
  assert(quote("r01-oct25").conditions.includes("5折减15"));
  assert(quote("r11-oct25").conditions.includes("7折减30"));
  assert(quote("r26-oct25").conditions.includes("7折减50或7.5折减50"));
  assert(quote("r41-oct25").conditions.includes("7.5折减80"));
  assert.equal(lowestPrice(imported,"10-power")?.amountCents, 10400);
  assert.equal(currentPrice(imported,"10-power")?.amountCents, 10400);
  assert.equal(getPrices().filter(p => p.id.startsWith("ref-")).length, 6);
  assert.equal(referencePrice(getPrices(),"energy600")?.amountCents,129900);
  assert.equal(currentPrice(getPrices(),"energy600"),undefined);
});
test("unmapped quotes require a name and screenshot sources stay inside the price image directory", () => {
  const value = {...price(), productId:null, productName:"CP26电能块", sourceUrl:"images/prices/1025-discount-guide.webp"};
  assert.equal(validatePrice(value).productId, null);
  assert.throws(() => validatePrice({...value, productName:undefined}));
  assert.throws(() => validatePrice({...value, productName:""}));
  for (const sourceUrl of ["images/prices/../private.webp", "images/prices/source.svg", "//example.com/source.webp", "javascript:alert(1)"])
    assert.throws(() => validatePrice({...value, sourceUrl}));
});
test("deals need no expiry, while explicit expiry, archive and future dates still apply", () => {
  assert.equal(isCurrentDeal(price(),"2026-10-31"),true);
  const withoutExpiry = price({expiresAt:null});
  assert.equal(isCurrentDeal(withoutExpiry,"2026-10-31"),true);
  assert.equal(isCurrentDeal(withoutExpiry,"2030-01-01"),true);
  assert.equal(isCurrentDeal(price({expiresAt:"2026-10-31"}),"2026-10-31"),true);
  const {expiresAt, ...withoutField} = withoutExpiry;
  assert.equal(validatePrice(withoutField).expiresAt,null);
  assert.equal(currentPrice([withoutExpiry],withoutExpiry.productId!)?.id,withoutExpiry.id);
  for(const changes of [{expiresAt:"2020-02-01"},{archived:true},{kind:"reference" as const},{recordedAt:"2099-01-01"}]) assert.equal(isCurrentDeal(price(changes),"2026-10-31"),false);
});
test("comparison includes the union of custom parameters and preserves unknown values", () => {
  const a={...products[0],specs:{"线材长度":"数据线：1 m"}};const b={...products[1],specs:{"电池技术":"硅碳负极"}};
  const rows=compareRows([a,b]);
  assert.deepEqual(rows.find(r=>r.key==="extra:线材长度")?.values,["数据线：1 m","—"]);
  assert.deepEqual(rows.find(r=>r.key==="extra:电池技术")?.values,["—","硅碳负极"]);
});
test("catalog keeps port power, editions and cable ratings distinct", () => {
  const product = (id: string) => products.find(p => p.id === id)!;
  assert.equal(product("10-power").maxOutputW, 150);
  assert.equal(product("10-power").pdOutputW, 100);
  assert.equal(product("10-plus").pdOutputW, 70);
  assert.equal(product("15-ultra").inputW, 165);
  assert.equal(product("car6").ports, "自带伸缩 USB-C 线 × 1 / USB-A × 1");
  assert.equal(product("car6").maxOutputW, 77);
  assert.equal(product("cable-atoc").model, "CTC310N");
  assert.equal(product("cable-atoc").ports, "USB-C 转 USB-C");
  assert.equal(product("6-card-2024").model, "AC65B2");
  assert.equal(product("6-card-2026").model, "AD652S");
  assert.equal(product("6-card-2026").weightG, null);
  assert.notEqual(product("6-card-2026").image, product("6-card").image);
  assert.equal(product("cable-240").specs["最大电流"], "6 A");
  assert.equal(product("cable-240-braid").specs["最大电流"], "5 A");
  assert.equal(product("cable-100-15").maxOutputW, 100);
});
test("specifications distinguish unknown, inapplicable and battery energy", () => {
  const product = (id: string) => products.find(p => p.id === id)!;
  assert.equal(specValue(product("energy600"), "capacityMah"), "512 Wh（25.6 V，20 Ah）");
  assert.equal(specValue(product("6-card-2026"), "weightG"), "未公开");
  assert.equal(specValue(product("6-card"), "capacityMah"), "不适用");
  assert.equal(specValue(product("6-card"), "inputW"), "见输入规格");
  assert.equal(specValue(product("battery-aa"), "capacityMah"), "未公开");
  assert.equal(specValue(product("fan-desk"), "maxOutputW"), "不适用");
  assert.equal(specValue(product("cable-240"), "pdOutputW"), "不适用");
});
test("product media must use local WebP paths", () => {
  for (const image of ["https://example.com/p.webp", "images/products/../p.webp", "images/products/p.svg"])
    assert.throws(() => validateProduct({...products[0], image}));
  assert.throws(() => validateProduct({...products[0], specImages:["../private.webp"]}));
  assert.equal(validateProduct(products[0]).image, products[0].image);
});
test("laptop recommendations use confirmed single-port PD power", () => {
  const input=validateRecommendation({category:"powerbank",device:"laptop100",model:"",scenario:"travel",budgetCents:null,maxWeight:null,preferCable:false,multipleDevices:false});
  const fake={...products[0],id:"total-only",maxOutputW:300,pdOutputW:65,protocols:["PD 3.1"]};
  const unknown={...fake,id:"unknown-pd",pdOutputW:null};
  const real=products.find(p=>p.id==="15-ultra")!;
  const result=recommend([fake,unknown,real],[],input);
  assert.deepEqual(result.results.map(r=>r.product.id),["15-ultra"]);
});
test("recommendations reject incompatible phones and separate protocol support from device power", () => {
  const input=validateRecommendation({category:"powerbank",device:"iphone",model:"",scenario:"commute",budgetCents:null,maxWeight:null,preferCable:false,multipleDevices:false});
  const incompatible={...products[0],id:"no-pd",protocols:["QC"],pdOutputW:65};
  const underpowered={...incompatible,id:"pd-15",protocols:["PD"],pdOutputW:15};
  assert.equal(recommend([incompatible,underpowered],[],input).results.length,0);
  const pps={...products[0],protocols:["PPS"],ports:"USB-C × 1"};
  const samsung=recommend([pps],[],{...input,device:"samsung"}).results[0];
  assert(samsung.notes.some(note=>note.includes("三星 45 W")));
  assert(!samsung.match.includes("功率匹配"));
  assert.equal(recommend([pps],[],{...input,device:"samsung",multipleDevices:true}).results.length,0);
  const laptop100={...input,category:"charger" as const,device:"laptop100"};
  assert.equal(recommend(products.filter(p=>["6-mini","6-screen"].includes(p.id)),[],laptop100).results.length,0);
});
test("guides and attributed research cover every category without converting reference prices into deals", () => {
  for(const category of new Set(products.map(p=>p.category))) assert(guidesForCategory(category).length>0,category);
  for(const guide of guides) for(const pick of guide.picks) assert(products.some(p=>p.id===pick.productId),pick.productId);
  assert(getReadings().length>=43);
  assert(getPublicReviews().length>=16);
  assert.equal(getPurchaseUrl("10-charger-mini"),"https://item.jd.com/100280149890.html");
  const cp26=products.find(p=>p.id==="cp26-cable")!;
  assert.equal(cp26.model,"LPB150N");
  assert.equal(cp26.pdOutputW,null);
  assert.equal(referencePrice(getPrices(),cp26.id)?.amountCents,14900);
  assert.equal(currentPrice(getPrices(),cp26.id),undefined);
  const future=price({kind:"reference",recordedAt:"2099-01-01"});
  assert.equal(referencePrice([future],products[0].id),undefined);
  const member=price({kind:"reference",eligibility:"member"});
  assert.equal(referencePrice([member],products[0].id),undefined);
});
test("budget excludes known over-budget offers and identifies unknown prices", () => {
  const input=validateRecommendation({category:"powerbank",device:"iphone",model:"iPhone 16",scenario:"commute",budgetCents:5000,maxWeight:null,preferCable:false,multipleDevices:false});
  assert.equal(recommend([products[0]],[price({expiresAt:null})],input).results.length,0);
  const product = products.find(p => p.id === "10-power")!;
  assert.equal(recommend([product],getPrices(),{...input,budgetCents:10300}).results.length,0);
  assert.equal(recommend([product],getPrices(),{...input,budgetCents:10400}).results[0].price?.amountCents,10400);
  const unknown=recommend([products[0]],[],input).results[0];
  assert(unknown.notes.some(note=>note.includes("预算")));
});
test("invalid money, dates, URLs and recommendation inputs fail validation", () => {
  assert.equal(centsFromInput("12.30"),1230);
  for(const value of ["1.001","-2","NaN"]) assert.throws(()=>centsFromInput(value));
  assert.throws(()=>validatePrice({...price(),recordedAt:"2026-02-30"}));
  assert.throws(()=>validateProduct({...products[0],sourceUrl:"javascript:alert(1)"}));
  assert.throws(()=>validateRecommendation({device:"unknown"}));
});
test("public review data refuses private or moderation fields", () => {
  const review={id:"review",productId:products[0].id,nickname:"公开署名",device:"测试机型",title:"体验标题",content:"带来源的体验摘要",createdAt:"2026-10-31",sourceUrl:"https://example.com/review",sourceLabel:"原文"};
  assert.equal(validatePublicReview(review).nickname,"公开署名");
  for(const privateField of ["contact","email","moderationNote"]) assert.throws(()=>validatePublicReview({...review,[privateField]:"private"}));
});
