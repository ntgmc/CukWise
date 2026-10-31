import { specificationGroups } from "./specifications";

export const categories = {
  powerbank: "移动电源", charger: "充电器", cable: "数据线", car: "车载充电", fan: "风扇", accessory: "配件与电池", station: "户外电源"
} as const;
export type Category = keyof typeof categories;
export type Product = {
  id: string; name: string; model: string; category: Category; series: string;
  summary: string; tags: string[]; protocols: string[];
  capacityMah: number | null; maxOutputW: number | null; pdOutputW: number | null;
  inputW: number | null; weightG: number | null; ports: string;
  specs: Record<string, string>; image: string; specImages: string[]; sourceUrl: string; sourceLabel: string;
  baseProductId: string | null; status: "published" | "archived"; updatedAt: string;
};
export type PriceRecord = {
  id: string; productId: string | null; productName?: string; amountCents: number; platform: string; store: string;
  kind: "deal" | "reference"; eligibility: "public" | "member" | "new" | "region" | "other";
  conditions: string; recordedAt: string; expiresAt: string | null;
  sourceUrl: string; sourceLabel: string; archived: boolean;
};
export const readingKinds = { review: "深度评测", teardown: "拆解核对", video: "视频资料", guide: "横向选购", news: "新品资料" } as const;
export type Reading = { id: string; productIds: string[]; title: string; description: string; author: string; date: string; url: string; kind: keyof typeof readingKinds };
export type PublicReview = {
  id: string; productId: string; nickname: string; device: string;
  title: string; content: string; createdAt: string;
  sourceUrl: string; sourceLabel: string;
};
export const eligibilityLabels: Record<PriceRecord["eligibility"], string> = {
  public: "普通用户", member: "会员优惠", new: "新客优惠", region: "地区补贴", other: "其他条件"
};
export const money = (cents: number) => new Intl.NumberFormat("zh-CN", { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 }).format(cents / 100);
export const dateLabel = (date: string) => date.slice(0, 10).replaceAll("-", ".");
export function isCurrentDeal(price: PriceRecord, today = new Date().toISOString().slice(0, 10)) {
  return price.kind === "deal" && !price.archived && price.recordedAt <= today && (price.expiresAt === null || price.expiresAt >= today);
}
export function lowestPrice(prices: PriceRecord[], productId: string, eligibility: PriceRecord["eligibility"] = "public") {
  return prices.filter(p => p.productId === productId && p.kind === "deal" && !p.archived && p.eligibility === eligibility && p.recordedAt <= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.amountCents - b.amountCents || b.recordedAt.localeCompare(a.recordedAt))[0];
}
export function currentPrice(prices: PriceRecord[], productId: string) {
  return prices.filter(p => p.productId === productId && p.eligibility === "public" && isCurrentDeal(p)).sort((a, b) => a.amountCents - b.amountCents)[0];
}
export function referencePrice(prices: PriceRecord[], productId: string) {
  const today = new Date().toISOString().slice(0, 10);
  return prices.filter(p => p.productId === productId && p.kind === "reference" && p.eligibility === "public" && !p.archived && p.recordedAt <= today)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt) || a.amountCents - b.amountCents)[0];
}
export const baseSpecs = [
  ["model", "产品型号"], ["category", "产品分类"], ["series", "产品系列"],
  ["capacityMah", "电池容量"], ["maxOutputW", "标称最大输出"],
  ["pdOutputW", "单口 PD 固定档输出"], ["inputW", "标称最大输入"],
  ["ports", "接口配置"], ["protocols", "快充协议"], ["weightG", "产品重量"]
] as const;
export function specValue(product: Product, key: string): string {
  if (key === "category") return categories[product.category];
  if (key === "protocols") return product.protocols.join("、") || (product.category === "fan" || product.ports === "不适用" ? "不适用" : "未公开");
  if (key === "capacityMah" && product.category === "station") return product.specs["电池能量"] || "未公开";
  const value = product[key as keyof Product];
  if (value === null || value === "") {
    if (key === "capacityMah" && !product.specs["电池种类"] && product.category !== "powerbank") return "不适用";
    if (key === "pdOutputW" && ["cable", "fan", "accessory"].includes(product.category)) return "不适用";
    if (key === "inputW" && (product.category === "cable" || product.ports === "不适用")) return "不适用";
    if (key === "maxOutputW" && (product.category === "fan" || product.ports === "不适用" || product.specs["额定功率"])) return "不适用";
    if (key === "inputW" && product.specs["输入规格"]) return "见输入规格";
    return "未公开";
  }
  if (key === "capacityMah") return value ? `${Number(value).toLocaleString("zh-CN")} mAh` : "不适用";
  if (key === "weightG") return `${value} g`;
  if (["maxOutputW", "pdOutputW", "inputW"].includes(key)) return `${value} W`;
  return String(value ?? product.specs[key] ?? "待补充");
}
export function compareRows(products: Product[]) {
  const extraKeys = [...new Set(products.flatMap(p => Object.keys(p.specs)))];
  const fields = new Map<string, { key: string; label: string; values: string[] }>([
    ...baseSpecs.map(([key, label]) => [key, { key, label, values: products.map(p => specValue(p, key)) }] as const),
    ...extraKeys.map(key => [key, { key: `extra:${key}`, label: key, values: products.map(p => p.specs[key] || "—") }] as const)
  ]);
  const rows = specificationGroups.flatMap(({ label: group, keys }) => keys.flatMap(key => {
    const row = fields.get(key);
    if (!row) return [];
    fields.delete(key);
    return [{ ...row, group }];
  }));
  return [...rows, ...[...fields.values()].sort((a, b) => a.key.localeCompare(b.key, "zh-CN")).map(row => ({ ...row, group: "其他参数" }))];
}
