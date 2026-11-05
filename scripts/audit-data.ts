import { getProducts, getPrices, getReadings } from "../src/data/catalog";
import { catalogCoverage } from "../src/lib/coverage";
import { baseSpecs, categories } from "../src/lib/domain";

const report = catalogCoverage(getProducts(), getPrices(), getReadings());
const labels = new Map<string, string>(baseSpecs);
console.log("# CukWise 数据维护清单\n");
console.log("数量按标准产品统计，限定版本单列。报价包含参考价；当前好价仅统计已关联型号的普通用户记录。外部资料含评测、拆解、视频、选购与新品报道，不等于全部经过独立实测。\n");
console.log("| 品类 | 标准产品 | 限定版本 | 有报价 | 有当前好价 | 有外部资料 |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: |");
for (const row of report.categories) console.log(`| ${categories[row.category]} | ${row.total} | ${row.editions} | ${row.priced} | ${row.deals} | ${row.researched} |`);
console.log("\n## 待核实的选购参数\n\n这里只列与品类选购直接相关的缺项。未知值不等于错误；限定版没有单独公开的数值继续保留未知。数据线与配件不因缺少重量或独立评测被列为核心参数缺失。\n");
if (!report.gaps.length) console.log("当前没有已登记的核心参数缺项。");
for (const { product, missing } of report.gaps) console.log(`- ${product.name}（${product.model} / ${product.id}）：${missing.map(key => labels.get(key) ?? key).join("、")}。来源：${product.sourceUrl}`);
console.log("\n## 尚未关联型号的报价\n\n需核对原图的版本、线长、套装后关联，不根据价格或简称猜测型号。\n");
for (const price of report.ambiguousPrices) console.log(`- ${price.id}：${price.productName}；${price.recordedAt}；${price.sourceUrl}`);
