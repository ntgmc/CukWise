import { currentPrice, type PriceRecord, type Product } from "./domain";
import { choice, object, text, InputError } from "./validation";

export const deviceProfiles=[
  {id:"iphone",name:"iPhone / iPad（USB-C PD）",protocol:"PD",power:20},
  {id:"xiaomi",name:"小米 / REDMI",protocol:"小米澎湃秒充",power:0},
  {id:"samsung",name:"三星 Galaxy（PD / PPS）",protocol:"PPS",power:0},
  {id:"pd-phone",name:"其他支持 USB-C PD 的手机",protocol:"PD",power:18},
  {id:"laptop65",name:"USB-C PD 笔记本 · 65 W",protocol:"PD",power:65},
  {id:"laptop100",name:"USB-C PD 笔记本 · 100 W",protocol:"PD",power:100},
  {id:"laptop140",name:"USB-C PD 3.1 笔记本 · 140 W",protocol:"PD",power:140}
] as const;
export const scenarios={commute:"日常通勤",travel:"出差旅行",desk:"桌面常驻",emergency:"随身应急"} as const;
export type RecommendationInput={category:"powerbank"|"charger";device:string;model:string;scenario:keyof typeof scenarios;budgetCents:number|null;maxWeight:number|null;preferCable:boolean;multipleDevices:boolean};
export function validateRecommendation(value:unknown):RecommendationInput {
  const v=object(value);
  for(const key of ["budgetCents","maxWeight"] as const) {
    if(v[key]!==null && v[key]!==undefined && (typeof v[key]!=="number" || !Number.isFinite(v[key]) || Number(v[key])<=0 || Number(v[key])>10000000)) throw new InputError("请填写有效的预算或重量。");
  }
  if(typeof v.preferCable!=="boolean" || typeof v.multipleDevices!=="boolean") throw new InputError("请选择使用偏好。");
  return {category:choice(v.category,["powerbank","charger"] as const,"产品分类"),device:choice(v.device,deviceProfiles.map(d=>d.id),"设备类型"),model:text(v.model??"","设备型号",100,0),
    scenario:choice(v.scenario,Object.keys(scenarios) as (keyof typeof scenarios)[],"使用场景"),budgetCents:v.budgetCents as number|null??null,maxWeight:v.maxWeight as number|null??null,preferCable:v.preferCable,multipleDevices:v.multipleDevices};
}
export function recommend(products:Product[],prices:PriceRecord[],input:RecommendationInput) {
  const profile=deviceProfiles.find(d=>d.id===input.device)!;
  const candidates=products.filter(p=>p.category===input.category && p.status==="published" && !p.baseProductId);
  const ranked=candidates.flatMap(product=>{
    const price=currentPrice(prices,product.id);
    if(price && input.budgetCents && price.amountCents>input.budgetCents) return [];
    if(input.maxWeight && product.weightG!==null && product.weightG>input.maxWeight) return [];
    const protocolMatch=product.protocols.some(p=>p.startsWith(profile.protocol));
    // Power is checked against PD output, never the product's total or proprietary wattage.
    const powerMatch=profile.protocol!=="PD" || (product.pdOutputW!==null && product.pdOutputW>=profile.power);
    if(profile.power>=65 && (!protocolMatch || !powerMatch)) return [];
    const reasons:string[]=[]; const notes:string[]=[]; let score=0;
    if(protocolMatch) {score+=10;reasons.push(`支持${profile.protocol.startsWith("PD")?" USB-C PD":` ${profile.protocol}`}协议`);}
    else notes.push("该设备所需协议待补充确认");
    if(powerMatch && profile.power>=65) {score+=8;reasons.push(`单口 PD 输出满足 ${profile.power} W 需求`);}
    if(input.scenario==="commute" || input.scenario==="emergency") {
      if(product.capacityMah!==null && product.capacityMah<=15000) {score+=5;reasons.push("容量适合日常随身补能");}
      if(product.weightG!==null && product.weightG<=300) {score+=4;reasons.push(`重量 ${product.weightG} g，方便随身携带`);}
      if(product.tags.includes("轻便")) score+=2;
    }
    if(input.scenario==="travel" && product.capacityMah!==null && product.capacityMah>=15000 && product.capacityMah<=25000) {score+=5;reasons.push("容量适合差旅备用");}
    if(input.scenario==="desk" && product.tags.includes("桌面")) {score+=5;reasons.push("适合固定在桌面使用");}
    if(input.preferCable) {
      if(product.tags.includes("自带线")) {score+=6;reasons.push("自带线，出门少带一根线");}
      else notes.push("需要另配合适的充电线");
    }
    if(input.multipleDevices) notes.push("多设备同时充电的接口与功率分配需逐项确认");
    if(input.maxWeight && product.weightG===null) notes.push("重量待补充");
    if(!price) notes.push(input.budgetCents?"购买前核对当前到手价是否在预算内":"当前到手价待补充");
    else {score+=2;reasons.push(`已记录普通用户到手价 ¥${(price.amountCents/100).toFixed(2)}`);}
    if(input.model) notes.push(`${input.model} 的具体握手功率需结合机型与线材确认`);
    if(profile.protocol==="PD" && profile.power<65 && product.pdOutputW===null) notes.push("该接口的 PD 输出档位待补充");
    return [{product,price:price??null,score,reasons:reasons.length?reasons:[product.summary],notes,match:protocolMatch&&powerMatch?"协议与功率匹配":"候选产品"}];
  }).sort((a,b)=>b.score-a.score || (a.product.weightG??Infinity)-(b.product.weightG??Infinity) || a.product.id.localeCompare(b.product.id));
  return {results:ranked.slice(0,3),profile:profile.name,considered:candidates.length};
}
