import { categories, currentPrice, type Category, type PriceRecord, type Product, type Reading } from "./domain";

const requiredFields: Record<Category, string[]> = {
  powerbank: ["capacityMah", "maxOutputW", "pdOutputW", "inputW", "weightG", "电池能量", "产品尺寸"],
  charger: ["maxOutputW", "pdOutputW", "weightG", "输入规格", "产品尺寸"],
  car: ["maxOutputW", "pdOutputW", "weightG", "输入规格", "产品尺寸"],
  station: ["maxOutputW", "pdOutputW", "weightG", "电池能量", "输入规格", "产品尺寸"],
  cable: ["线材长度"],
  fan: ["inputW", "weightG", "输入规格", "产品尺寸", "供电方式"],
  accessory: [],
};

export function catalogCoverage(products: Product[], prices: PriceRecord[], readings: Reading[]) {
  const published = products.filter(product => product.status === "published");
  const standard = published.filter(product => !product.baseProductId);
  const publicPrices = new Set(prices.filter(price => !price.archived && price.eligibility === "public" && price.recordedAt <= new Date().toISOString().slice(0, 10)).map(price => price.productId));
  const researched = new Set(readings.flatMap(reading => reading.productIds));
  return {
    categories: (Object.keys(categories) as Category[]).map(category => {
      const items = standard.filter(product => product.category === category);
      return { category, total: items.length, editions: published.filter(product => product.category === category && product.baseProductId).length,
        priced: items.filter(product => publicPrices.has(product.id)).length,
        deals: items.filter(product => currentPrice(prices, product.id)).length,
        researched: items.filter(product => researched.has(product.id)).length };
    }),
    gaps: standard.flatMap(product => {
      const missing = requiredFields[product.category].filter(key => {
        const value = key in product ? product[key as keyof Product] : product.specs[key];
        return value === null || value === undefined || value === "";
      });
      return missing.length ? [{ product, missing }] : [];
    }),
    ambiguousPrices: prices.filter(price => !price.archived && price.productId === null),
  };
}
