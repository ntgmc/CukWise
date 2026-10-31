import {useEffect,useMemo,useState} from "react";
import {Search,SlidersHorizontal,X} from "lucide-react";
import {categories,currentPrice,type Product,type PriceRecord} from "@/lib/domain";
import {useSelection} from "./selection";
import {ProductCard} from "./product-card";
import {EmptyState} from "./ui";
export function ProductExplorer({products,prices}:{products:Product[];prices:PriceRecord[]}) {
  const [category,setCategory]=useState("all");const [onlyFavorites,setOnlyFavorites]=useState(false);
  const [query,setQuery]=useState("");const [tag,setTag]=useState("");const [editions,setEditions]=useState(false);const [sort,setSort]=useState("default");
  const [power,setPower]=useState("");const [budget,setBudget]=useState("");const [protocol,setProtocol]=useState("");const [ready,setReady]=useState(false);
  const {favorites}=useSelection();
  useEffect(()=>{
    const params=new URLSearchParams(location.search);const value=params.get("category");
    if(value&&Object.hasOwn(categories,value))setCategory(value);
    setOnlyFavorites(params.get("favorites")==="1");setQuery(params.get("q")??"");setTag(params.get("tag")??"");setEditions(params.get("editions")==="1");
    if(["weight","power","price"].includes(params.get("sort")??""))setSort(params.get("sort")!);
    if(["20","45","65","100","140"].includes(params.get("power")??""))setPower(params.get("power")!);
    if(["5000","10000","20000","30000"].includes(params.get("budget")??""))setBudget(params.get("budget")!);
    if(["PD","PPS","小米澎湃秒充","UFCS"].includes(params.get("protocol")??""))setProtocol(params.get("protocol")!);
    setReady(true);
  },[]);
  useEffect(()=>{
    if(!ready)return;const url=new URL(location.href);
    const values={category:category==="all"?"":category,favorites:onlyFavorites?"1":"",q:query,tag,editions:editions?"1":"",sort:sort==="default"?"":sort,power,budget,protocol};
    for(const [key,value] of Object.entries(values)){if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);}
    history.replaceState(null,"",url);
  },[ready,category,onlyFavorites,query,tag,editions,sort,power,budget,protocol]);
  const priceById=useMemo(()=>new Map(products.map(p=>[p.id,currentPrice(prices,p.id)?.amountCents])),[products,prices]);
  const filtered=useMemo(()=>products.filter(p=>(category==="all"||p.category===category)&&(!onlyFavorites||favorites.includes(p.id))&&(!tag||p.tags.includes(tag))&&(editions||onlyFavorites||query.trim()||!p.baseProductId)&&(!power||(p.pdOutputW??0)>=Number(power))&&(!budget||(priceById.get(p.id)??Infinity)<=Number(budget))&&(!protocol||p.protocols.some(value=>value.startsWith(protocol)))&&`${p.name} ${p.model} ${p.specs["官网目录标识"]??""} ${p.tags.join(" ")} ${p.protocols.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a,b)=>sort==="weight"?(a.weightG??Infinity)-(b.weightG??Infinity):sort==="power"?(b.maxOutputW??0)-(a.maxOutputW??0):sort==="price"?(priceById.get(a.id)??Infinity)-(priceById.get(b.id)??Infinity):0),[products,category,query,tag,editions,sort,favorites,onlyFavorites,power,budget,protocol,priceById]);
  function reset(){setCategory("all");setOnlyFavorites(false);setQuery("");setTag("");setEditions(false);setSort("default");setPower("");setBudget("");setProtocol("");}
  const active=category!=="all"||onlyFavorites||query||tag||editions||power||budget||protocol||sort!=="default";
  return <><div className="catalog-toolbar"><label className="input-search"><Search size={18}/><input aria-label="搜索产品名称或型号" placeholder="搜索名称、型号、用途或协议" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button className="icon-button" onClick={()=>setQuery("")} aria-label="清除搜索"><X size={16}/></button>}</label><label className="sort-field"><SlidersHorizontal size={16}/><select aria-label="产品排序" value={sort} onChange={e=>setSort(e.target.value)}><option value="default">默认排序</option><option value="weight">重量从轻到重</option><option value="power">标称输出从高到低</option><option value="price">当前好价从低到高</option></select></label></div>
    <div className="filter-tabs" role="group" aria-label="产品分类"><button className={category==="all"?"active":""} aria-pressed={category==="all"} onClick={()=>setCategory("all")}>全部产品</button>{Object.entries(categories).map(([key,label])=><button key={key} className={category===key?"active":""} aria-pressed={category===key} onClick={()=>setCategory(key)}>{label}</button>)}</div>
    <div className="catalog-subfilters"><div className="filter-tags"><span>使用偏好</span>{["轻便","自带线","磁吸","笔记本","桌面"].map(value=><button key={value} aria-pressed={tag===value} className={tag===value?"active":""} onClick={()=>setTag(tag===value?"":value)}>{value}</button>)}</div><label className="checkbox-label"><input type="checkbox" checked={editions} onChange={e=>setEditions(e.target.checked)}/>包含限定版本</label></div>
    <div className="catalog-advanced"><label>单口 PD 至少<select aria-label="单口 PD 最低功率" value={power} onChange={e=>setPower(e.target.value)}><option value="">不限</option>{[20,45,65,100,140].map(w=><option key={w} value={w}>{w} W</option>)}</select></label><label>快充协议<select aria-label="筛选快充协议" value={protocol} onChange={e=>setProtocol(e.target.value)}><option value="">不限</option>{["PD","PPS","小米澎湃秒充","UFCS"].map(value=><option key={value}>{value}</option>)}</select></label><label>当前好价上限<select aria-label="当前好价预算" value={budget} onChange={e=>setBudget(e.target.value)}><option value="">不限</option>{[50,100,200,300].map(value=><option key={value} value={value*100}>¥{value}</option>)}</select></label>{active&&<button className="text-button" onClick={reset}><X size={15}/>清空筛选</button>}</div>
    <div className="results-line"><span aria-live="polite">找到 {filtered.length} 款产品{onlyFavorites?" · 收藏保存在当前浏览器":""}</span><span>{budget?"预算筛选只包含已核实的当前普通用户好价":"可同时对比 4 款 · 筛选条件可通过当前网址分享"}</span></div>
    {filtered.length?<div className="product-grid">{filtered.map(p=><ProductCard key={p.id} product={p} prices={prices}/>)}</div>:<EmptyState title={onlyFavorites?"没有符合条件的收藏":"没有找到符合条件的产品"} description="可以清空筛选，或换一个型号与协议关键词。"/>}
  </>;
}
