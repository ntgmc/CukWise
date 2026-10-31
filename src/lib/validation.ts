import { categories, type PriceRecord, type Product } from "./domain";
import { retiredSpecificationNames } from "./specifications";

export class InputError extends Error {}
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new InputError("请检查填写内容后重试。");
  return value as Record<string, unknown>;
}
export function text(value: unknown, label: string, max: number, min = 1): string {
  if (typeof value !== "string" || value.trim().length < min || value.trim().length > max) throw new InputError(`${label}请填写 ${min}–${max} 个字符。`);
  return value.trim();
}
export function choice<T extends string>(value: unknown, options: readonly T[], label: string): T {
  if (!options.includes(value as T)) throw new InputError(`请选择${label}。`);
  return value as T;
}
export function safeUrl(value: unknown, label = "来源链接") {
  const raw = text(value,label,1000);
  try { const url = new URL(raw); if (url.protocol !== "https:" || url.username || url.password) throw new Error(); return url.href; }
  catch { throw new InputError(`${label}请使用完整的 HTTPS 地址。`); }
}
function numberOrNull(value: unknown, label: string, max = 1000000) {
  if (value === null || value === "" || value === undefined) return null;
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0 || value > max) throw new InputError(`${label}请填写大于 0 的有效数值。`);
  return value;
}
export function day(value: unknown, label: string) {
  const result = text(value,label,10,10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result) || !Number.isFinite(Date.parse(result)) || new Date(result).toISOString().slice(0,10) !== result) throw new InputError(`${label}请填写有效日期。`);
  return result;
}
function productImage(value: unknown) {
  const path = text(value,"产品图片",150);
  if (!/^images\/products\/(?:specs\/)?[a-z0-9-]+\.webp$/.test(path)) throw new InputError("产品图片请使用 images/products 下的 WebP 文件。");
  return path;
}
export function validateProduct(value: unknown): Product {
  const v = object(value);
  const id = text(v.id,"产品标识",80);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new InputError("产品标识请使用小写英文、数字和短横线。");
  const specs = object(v.specs);
  if (Object.keys(specs).length > 80) throw new InputError("详细参数最多填写 80 项。");
  const parsedSpecs = Object.fromEntries(Object.entries(specs).map(([k,val])=>{
    const key = text(k,"参数名称",50);
    if (retiredSpecificationNames.has(key)) throw new InputError(`参数“${key}”已停用，请使用统一字段；USB 接口分别填写，其他字段见维护说明。`);
    return [key,text(val,"参数内容",500)];
  }));
  const strings = (value: unknown, label: string, max: number) => {
    if (!Array.isArray(value) || value.length > max) throw new InputError(`${label}数量过多。`);
    return [...new Set(value.map(v=>text(v,label,50)))];
  };
  return {id,name:text(v.name,"产品名称",100),model:text(v.model??"","产品型号",80,0),category:choice(v.category,Object.keys(categories) as (keyof typeof categories)[],"产品分类"),
    series:text(v.series,"产品系列",40),summary:text(v.summary,"产品简介",240),tags:strings(v.tags,"标签",12),protocols:strings(v.protocols,"协议",20),
    capacityMah:numberOrNull(v.capacityMah,"电池容量"),maxOutputW:numberOrNull(v.maxOutputW,"最大输出"),pdOutputW:numberOrNull(v.pdOutputW,"PD 输出"),
    inputW:numberOrNull(v.inputW,"最大输入"),weightG:numberOrNull(v.weightG,"重量"),ports:text(v.ports??"","接口配置",200,0),specs:parsedSpecs,
    image:productImage(v.image),specImages:strings(v.specImages,"规格图",8).map(productImage),
    sourceUrl:safeUrl(v.sourceUrl),sourceLabel:text(v.sourceLabel,"来源名称",100),baseProductId:v.baseProductId?text(v.baseProductId,"标准款标识",80):null,
    status:choice(v.status,["published","archived"] as const,"发布状态"),updatedAt:day(String(v.updatedAt).slice(0,10),"资料更新日期")};
}
function priceSourceUrl(value: unknown) {
  return typeof value === "string" && /^images\/prices\/[a-z0-9-]+\.webp$/.test(value) ? value : safeUrl(value);
}
export function validatePrice(value: unknown): Omit<PriceRecord,"id"> {
  const v=object(value);
  if (typeof v.amountCents!=="number" || !Number.isSafeInteger(v.amountCents) || v.amountCents<=0 || v.amountCents>100000000) throw new InputError("价格请填写有效金额，最多保留两位小数。");
  const recordedAt=day(v.recordedAt,"记录日期");
  if (recordedAt > new Date().toISOString().slice(0,10)) throw new InputError("记录日期不能晚于今天。");
  const expiresAt=v.expiresAt?day(v.expiresAt,"活动截止日期"):null;
  if(expiresAt && expiresAt<recordedAt) throw new InputError("活动截止日期不能早于记录日期。");
  const productId = v.productId === null ? null : text(v.productId,"产品",80);
  const productName = v.productName === undefined ? undefined : text(v.productName,"截图商品名",100);
  if (productId === null && !productName) throw new InputError("未关联型号的价格请保留截图商品名。");
  return {productId,productName,amountCents:v.amountCents,platform:text(v.platform,"平台",50),store:text(v.store,"店铺",100),
    kind:choice(v.kind,["deal","reference"] as const,"价格类型"),eligibility:choice(v.eligibility,["public","member","new","region","other"] as const,"适用条件"),
    conditions:text(v.conditions,"购买条件",800),recordedAt,expiresAt,sourceUrl:priceSourceUrl(v.sourceUrl),sourceLabel:text(v.sourceLabel,"来源名称",100),archived:v.archived===true};
}
export function centsFromInput(value: string) {
  if(!/^\d{1,7}(?:\.\d{1,2})?$/.test(value.trim())) throw new InputError("价格请填写有效金额，最多保留两位小数。");
  const [whole,decimal=""]=value.trim().split(".");
  return Number(whole)*100+Number(decimal.padEnd(2,"0"));
}
