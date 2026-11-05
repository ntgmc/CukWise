import {useMemo,useState} from "react";
import Link from "./link";
import {ArrowUpRight,Search} from "lucide-react";
import {getProducts,getReadings,getPublicReviews} from "@/data/catalog";
import {guides} from "@/data/guides";
import {categories,readingKinds} from "@/lib/domain";
import {matchesQuery} from "@/lib/search";
import {PageHeading,SectionHeading,ReadingCard,GuideCard,ReviewCard,EmptyState} from "./ui";

export default function InsightsPage(){
  const readings=getReadings();const products=getProducts();const reviews=getPublicReviews();
  const [category,setCategory]=useState("all");const [kind,setKind]=useState("all");const [query,setQuery]=useState("");
  const filtered=useMemo(()=>readings.filter(r=>(kind==="all"||r.kind===kind)&&(category==="all"||r.productIds.some(id=>products.find(p=>p.id===id)?.category===category))&&matchesQuery(`${r.title} ${r.description} ${r.author} ${r.productIds.map(id=>{const p=products.find(p=>p.id===id);return `${p?.name} ${p?.model}`;}).join(" ")}`,query)),[readings,products,category,kind,query]);
  return <><PageHeading title="买之前，把关键差别看清楚" description={`${guides.length} 篇选购指南、${readings.length} 篇外部资料、${reviews.length} 条评测摘要。`}/>
    <section><SectionHeading title="先从你的用途开始"/><div className="reading-grid">{guides.map(guide=><GuideCard key={guide.id} guide={guide}/>)}</div></section>
    <section className="page-section" id="sources"><SectionHeading title="评测与外部资料" description="按型号、作者或资料类型查找，点击卡片阅读原文或观看视频。"/>
      <div className="catalog-toolbar"><label className="input-search"><Search size={18}/><input aria-label="搜索选购资料" placeholder="搜索型号、用途或作者" value={query} onChange={event=>setQuery(event.target.value)}/></label><label className="sort-field">品类<select aria-label="资料品类" value={category} onChange={event=>setCategory(event.target.value)}><option value="all">全部品类</option>{Object.entries(categories).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label></div>
      <div className="filter-tabs" role="group" aria-label="资料类型">{[["all","全部资料"],...Object.entries(readingKinds)].map(([id,label])=><button key={id} className={kind===id?"active":""} aria-pressed={kind===id} onClick={()=>setKind(id)}>{label}</button>)}</div><p className="results-line" aria-live="polite">找到 {filtered.length} 篇资料</p>
      {filtered.length?<div className="reading-grid">{filtered.map(r=><ReadingCard key={r.id} reading={r}/>)}</div>:<EmptyState title="没有找到这类资料" description="试试产品型号，或切换资料类型和品类。"/>}
    </section>
    <section className="page-section" id="summaries"><SectionHeading title="评测重点，先读几条"/><div className="review-list">{reviews.map(r=><div key={r.id}><ReviewCard review={r}/><Link className="text-link" href={`/products/${r.productId}#experiences`}>{products.find(p=>p.id===r.productId)?.name}<ArrowUpRight size={15}/></Link></div>)}</div></section>
  </>;
}
