import Link from "./link";
import type {Product} from "@/lib/domain";
import {ArrowUpRight,ArrowLeft,Check,CalendarDays,BookOpen} from "lucide-react";
import {getProducts,getPrices,getReadings,getPublicReviews,getPurchaseUrl} from "@/data/catalog";
import {guidesForCategory} from "@/data/guides";
import {categories,compareRows,currentPrice,lowestPrice,referencePrice,dateLabel,money,specValue} from "@/lib/domain";
import {ProductArt} from "./product-art";
import {CompareButton,FavoriteButton} from "./selection";
import {SectionHeading,ReadingCard,GuideCard,ReviewCard} from "./ui";
import {PriceHistory} from "./price-history";

export default function ProductDetails({product:p}:{product:Product}) {
  const prices=getPrices().filter(price=>price.productId===p.id);const readings=getReadings().filter(r=>r.productIds.includes(p.id));const reviews=getPublicReviews(p.id);
  const low=lowestPrice(prices,p.id);const current=currentPrice(prices,p.id);const reference=referencePrice(prices,p.id);const purchase=getPurchaseUrl(p.id);
  const familyId=p.baseProductId??p.id;
  const related=getProducts().filter(x=>x.id!==p.id&&(x.id===familyId||x.baseProductId===familyId));
  const alternatives=getProducts().filter(x=>x.category===p.category&&x.id!==p.id&&!x.baseProductId&&(p.category!=="accessory"||x.tags.some(tag=>p.tags.includes(tag)))).sort((a,b)=>Math.abs((a.pdOutputW??a.maxOutputW??0)-(p.pdOutputW??p.maxOutputW??0))-Math.abs((b.pdOutputW??b.maxOutputW??0)-(p.pdOutputW??p.maxOutputW??0))).slice(0,3);
  const guides=guidesForCategory(p.category);const specs=compareRows([p]).filter(row=>row.values[0]!=="不适用");
  const keys=p.category==="cable"?["maxOutputW","线材长度","数据传输"]:p.category==="fan"?["inputW","供电方式","weightG"]:p.category==="accessory"?["ports","weightG"]:["capacityMah","pdOutputW","weightG"];
  const groups=[...new Set(specs.map(row=>row.group))];
  return <><Link href="/products" className="back-link"><ArrowLeft size={15}/> 返回产品库</Link>
    <section className="product-detail"><div className="detail-visual"><ProductArt product={p}/><a href={p.sourceUrl} target="_blank" rel="noreferrer">图片与资料：{p.sourceLabel}<ArrowUpRight size={12}/></a></div>
      <div className="detail-info"><div className="detail-eyeline"><span>{categories[p.category]} / {p.series}</span><FavoriteButton id={p.id}/></div><h1>{p.name}</h1><p className="detail-model">{p.model}</p><p className="detail-summary">{p.summary}</p><div className="product-tags">{p.tags.map(t=><span key={t}>{t}</span>)}</div>
        <dl className="detail-glance">{keys.filter(key=>specValue(p,key)!=="不适用"&&specs.some(row=>row.key===key||row.label===key)).map(key=><div key={key}><dt>{specs.find(row=>row.key===key||row.label===key)?.label}</dt><dd>{specValue(p,key)}</dd></div>)}</dl>
        <div className="detail-price"><div><span>{current?"当前普通用户好价":reference?`参考报价 · ${dateLabel(reference.recordedAt)}`:"当前普通用户好价"}</span><strong>{current?`¥${money(current.amountCents)}`:reference?`¥${money(reference.amountCents)}`:"暂无报价"}</strong></div>{low&&<div><span>已收录普通用户最低价</span><strong>¥{money(low.amountCents)}</strong></div>}</div>
        {current&&<p className="detail-price-note">收录于 {dateLabel(current.recordedAt)}，用券条件见价格记录。</p>}
        <div className="detail-actions"><CompareButton product={p}/>{["charger","powerbank"].includes(p.category)?<Link href={`/recommend?category=${p.category}`} className="button button-dark">适合我的设备吗 <ArrowUpRight size={16}/></Link>:<Link href={`/guides/${guides[0].id}`} className="button button-dark">查看选购要点<ArrowUpRight size={16}/></Link>}{purchase&&<a className="button" href={purchase} target="_blank" rel="noreferrer">官网购买入口<ArrowUpRight size={16}/></a>}</div>
        <p className="source-line"><CalendarDays size={14}/> 更新于 {dateLabel(p.updatedAt)}<a href={p.sourceUrl} target="_blank" rel="noreferrer">{p.sourceLabel}<ArrowUpRight size={13}/></a></p>
        {related.length>0&&<details className="related-editions"><summary>同系列版本 · 共 {related.length+1} 款</summary><div>{related.map(r=><Link key={r.id} href={`/products/${r.id}`}>{r.name}<ArrowUpRight size={14}/></Link>)}</div></details>}
      </div>
    </section>
    <nav className="detail-tabs" aria-label="产品内容"><a href="#specs">详细参数</a><a href="#prices">价格记录 <span>{prices.length}</span></a>{reviews.length>0&&<a href="#experiences">评测摘要 <span>{reviews.length}</span></a>}<a href="#readings">选购与资料</a>{alternatives.length>0&&<a href="#alternatives">同类对比</a>}</nav>
    <div className="detail-content"><div>
      <section id="specs" className="page-section"><SectionHeading title="详细参数"/><div className="spec-groups">{groups.map((group,index)=><section key={group} aria-labelledby={`spec-group-${index}`}><h3 id={`spec-group-${index}`}>{group}</h3><dl className="spec-list">{specs.filter(row=>row.group===group).map(row=><div key={row.key}><dt>{row.label}</dt><dd>{row.values[0]}</dd></div>)}</dl></section>)}</div>
        {p.specImages.length>0&&<details className="official-specs"><summary>查看官方规格图</summary><p>完整输出档位、多口分配及条件见下图。<a href={p.sourceUrl} target="_blank" rel="noreferrer">查看产品来源 <ArrowUpRight size={13}/></a></p><div>{p.specImages.map((src,index)=><a key={src} href={`${import.meta.env.BASE_URL}${src}`} target="_blank" rel="noreferrer" aria-label={`打开${p.name}规格图 ${index+1}`}><img src={`${import.meta.env.BASE_URL}${src}`} alt={`${p.name}官方规格图 ${index+1}`} loading="lazy" decoding="async"/></a>)}</div></details>}
      </section>
      <section id="prices" className="page-section"><SectionHeading title="价格记录"/>{prices.length?<PriceHistory prices={prices}/>:<p className="detail-callout">暂无报价。{purchase?<a href={purchase} target="_blank" rel="noreferrer">查看官网价格 ↗</a>:<a href={p.sourceUrl} target="_blank" rel="noreferrer">查看产品来源 ↗</a>}</p>}</section>
      {reviews.length>0&&<section id="experiences" className="page-section"><SectionHeading title="评测摘要"/><div className="review-list">{reviews.map(r=><ReviewCard key={r.id} review={r}/>)}</div></section>}
      <section id="readings" className="page-section"><SectionHeading title="选购与资料"/>{guides.length>0&&<div className="reading-stack">{guides.slice(0,2).map(guide=><GuideCard key={guide.id} guide={guide}/>)}</div>}{readings.length>0&&<details className="related-readings" open={readings.length<=3}><summary>这款的外部资料 · {readings.length} 篇</summary><div className="reading-stack">{readings.map(r=><ReadingCard key={r.id} reading={r}/>)}</div></details>}</section>
      {alternatives.length>0&&<section id="alternatives" className="page-section"><SectionHeading title="同类产品，放在一起看"/><div className="alternative-list">{alternatives.map(r=><div key={r.id}><ProductArt product={r} small/><span><Link href={`/products/${r.id}`}>{r.name}</Link><small>{r.summary}</small></span><Link className="text-link" href={`/compare?ids=${p.id},${r.id}`}>对比<ArrowUpRight size={15}/></Link></div>)}</div></section>}
    </div><aside className="detail-sidebar"><div><BookOpen size={23}/><h3>选购要点</h3><ul><li><Check size={15}/> 商品型号、版本与套装内容</li><li><Check size={15}/> 设备协议、插口与线材</li><li><Check size={15}/> 多设备同时使用的功率分配</li><li><Check size={15}/> 尺寸、重量和使用条件</li></ul><Link href={`/compare?ids=${p.id}`} className="text-link">加入参数对比<ArrowUpRight size={15}/></Link></div><Link className="correction-link" href="/about">查看资料来源与整理方式<ArrowUpRight size={15}/></Link></aside></div>
  </>;
}
