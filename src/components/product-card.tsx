import Link from "./link";
import {ArrowUpRight} from "lucide-react";
import {categories,currentPrice,lowestPrice,referencePrice,money,type Product,type PriceRecord} from "@/lib/domain";
import {CompareButton,FavoriteButton} from "./selection";
import {ProductArt} from "./product-art";
export function ProductCard({product,prices}:{product:Product;prices:PriceRecord[]}) {
  const current=currentPrice(prices,product.id);const low=lowestPrice(prices,product.id);const reference=referencePrice(prices,product.id);
  return <article className="product-card"><div className="product-image"><Link href={`/products/${product.id}`} aria-label={`查看${product.name}`}><ProductArt product={product}/></Link><span className="category-label">{product.baseProductId?"限定产品":categories[product.category]}</span><FavoriteButton id={product.id}/></div><div className="product-card-body"><div className="product-model">{product.model||product.series}</div><h3><Link href={`/products/${product.id}`}>{product.name}<ArrowUpRight size={16}/></Link></h3><p className="product-summary">{product.summary}</p><div className="product-tags">{product.tags.slice(0,2).map(tag=><span key={tag}>{tag}</span>)}</div><div className="product-card-bottom"><div>{current?<><strong className="price">¥{money(current.amountCents)}</strong><small>当前到手价</small></>:low?<><strong className="price">¥{money(low.amountCents)}</strong><small>已收录普通用户最低价</small></>:reference?<><strong className="price">¥{money(reference.amountCents)}</strong><small>参考报价</small></>:<><strong className="price-missing">暂无报价</strong><small>查看规格与购买入口</small></>}</div><CompareButton product={product} compact/></div></div></article>;
}
