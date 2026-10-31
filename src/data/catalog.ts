import productData from "./products.json";
import priceData from "./prices.json";
import readingData from "./readings.json";
import reviewData from "./reviews.json";
import type { PublicReview, Reading, PriceRecord } from "../lib/domain";
import { day, object, safeUrl, text, validatePrice, validateProduct } from "../lib/validation";

function uniqueIds<T extends { id: string }>(items: T[], label: string): T[] {
  if (new Set(items.map(item => item.id)).size !== items.length) throw new Error(`${label}存在重复标识。`);
  return items;
}
const products = uniqueIds(productData.map(validateProduct), "产品");
const ids = new Set(products.map(p => p.id));
function requireProduct(id: string) {
  if (!ids.has(id)) throw new Error(`产品标识不存在：${id}`);
  return id;
}
for (const p of products) {
  if (p.baseProductId) {
    requireProduct(p.baseProductId);
    if (p.baseProductId === p.id || products.find(base => base.id === p.baseProductId)?.baseProductId) throw new Error(`产品版本关联无效：${p.id}`);
  }
}
const prices = uniqueIds(priceData.map(value => {
  const price = { ...validatePrice(value), id: text(value.id, "价格标识", 80) };
  if (price.productId !== null) requireProduct(price.productId);
  return price;
}), "价格");
const readings: Reading[] = uniqueIds(readingData.map(value => {
  const v = object(value);
  if (!Array.isArray(v.productIds)) throw new Error("文章关联产品必须为数组。");
  return { id: text(v.id, "文章标识", 80), productIds: v.productIds.map(id => requireProduct(text(id, "关联产品", 80))),
    title: text(v.title, "文章标题", 160), description: text(v.description, "文章简介", 1000), author: text(v.author, "作者", 100), date: day(v.date, "文章日期"), url: safeUrl(v.url) };
}), "文章");
const publicReviewKeys = new Set(["id", "productId", "nickname", "device", "title", "content", "createdAt", "sourceUrl", "sourceLabel"]);
export function validatePublicReview(value: unknown): PublicReview {
  const v = object(value);
  if (Object.keys(v).some(key => !publicReviewKeys.has(key))) throw new Error("评价文件只能包含公开字段，请移除其他信息。");
  return { id: text(v.id,"评价标识",80), productId:requireProduct(text(v.productId,"关联产品",80)), nickname:text(v.nickname,"署名",100),
    device:text(v.device,"设备",200,0), title:text(v.title,"评价标题",160), content:text(v.content,"评价正文",5000), createdAt:day(v.createdAt,"评价日期"),
    sourceUrl:safeUrl(v.sourceUrl),sourceLabel:text(v.sourceLabel,"评价来源",100) };
}
const reviews = uniqueIds((reviewData as unknown[]).map(validatePublicReview), "评价");
export const getProducts = () => products.filter(p => p.status === "published");
export const getProduct = (id: string) => getProducts().find(p => p.id === id);
export const getPrices = (): PriceRecord[] => prices.filter(p => !p.archived && (p.productId === null || getProduct(p.productId))).sort((a,b) => b.recordedAt.localeCompare(a.recordedAt));
export const getReadings = () => readings;
export const getPublicReviews = (productId?: string) => reviews.filter(r => getProduct(r.productId) && (!productId || r.productId === productId));
