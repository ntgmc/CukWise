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
export type Reading = { id: string; productIds: string[]; title: string; description: string; author: string; date: string; url: string };
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
export const baseSpecs = [
  ["model", "产品型号", "基本信息"], ["category", "产品分类", "基本信息"], ["series", "产品系列", "基本信息"],
  ["capacityMah", "电池容量", "容量与功率"], ["maxOutputW", "标称最大输出", "容量与功率"],
  ["pdOutputW", "单口 PD 固定档输出", "容量与功率"], ["inputW", "标称最大输入", "容量与功率"],
  ["ports", "接口配置", "接口与协议"], ["protocols", "快充协议", "接口与协议"], ["weightG", "产品重量", "尺寸与其他"]
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
  return [
    ...baseSpecs.map(([key, label, group]) => ({ key, label, group, values: products.map(p => specValue(p, key)) })),
    ...extraKeys.map(key => ({ key: `extra:${key}`, label: key, group: "详细参数", values: products.map(p => p.specs[key] || "—") }))
  ];
}
