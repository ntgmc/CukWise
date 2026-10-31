import { useSyncExternalStore } from "react";
import Link from "./link";
import { Check, Plus, Heart, ArrowRight, X, Scale } from "lucide-react";
import type { Product } from "@/lib/domain";
import { getProducts } from "@/data/catalog";

const empty = { ids: [] as string[], favorites: [] as string[] };
let state = empty;
const listeners = new Set<() => void>();
const validIds = new Set(getProducts().map(p => p.id));
function read(key: string, limit: number): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === "string" && validIds.has(id)))].slice(0, limit) : [];
  } catch { return []; }
}
function restore() {
  const next = { ids: read("cukwise:compare", 4), favorites: read("cukwise:favorites", 200) };
  if (JSON.stringify(next) !== JSON.stringify(state)) { state = next; listeners.forEach(listener => listener()); }
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  restore();
  window.addEventListener("storage", restore);
  return () => { listeners.delete(listener); window.removeEventListener("storage", restore); };
}
function save(next: typeof state) {
  state = next;
  try { localStorage.setItem("cukwise:compare", JSON.stringify(next.ids)); localStorage.setItem("cukwise:favorites", JSON.stringify(next.favorites)); }
  catch { /* Keep controls usable when browser storage is unavailable. */ }
  listeners.forEach(listener => listener());
}
export function useSelection() {
  const current = useSyncExternalStore(subscribe, () => state, () => empty);
  return { ...current,
    toggle(id: string) { if (validIds.has(id)) save({ ...state, ids: state.ids.includes(id) ? state.ids.filter(v => v !== id) : state.ids.length < 4 ? [...state.ids, id] : state.ids }); },
    favorite(id: string) { if (validIds.has(id)) save({ ...state, favorites: state.favorites.includes(id) ? state.favorites.filter(v => v !== id) : [...state.favorites, id] }); },
    clear() { save({ ...state, ids: [] }); }
  };
}
export function SelectionTray({ products }: { products: Product[] }) {
  const { ids, toggle, clear } = useSelection();
  if (!ids.length) return null;
  return <aside className="compare-tray" aria-label="已选对比产品"><div className="compare-tray-inner"><span className="tray-title"><Scale size={18}/><b>{ids.length}</b> 款待对比</span><div className="tray-products">{ids.map(id => <button key={id} className="tray-chip" onClick={() => toggle(id)} aria-label={`移除${products.find(p => p.id === id)?.name}`}>{products.find(p => p.id === id)?.name}<X size={13}/></button>)}</div><button className="text-button" onClick={clear}>清空</button><Link href={`/compare?ids=${ids.join(",")}`} className="button button-dark">开始对比 <ArrowRight size={16}/></Link></div></aside>;
}
export function CompareButton({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { ids, toggle } = useSelection(); const selected = ids.includes(product.id); const full = ids.length >= 4 && !selected;
  return <button className={`button ${compact ? "button-small" : ""} ${selected ? "button-selected" : ""}`} aria-pressed={selected} disabled={full} onClick={() => toggle(product.id)} title={full ? "已选 4 款，可先移除一款" : undefined}>{selected ? <Check size={16}/> : <Plus size={16}/>} {selected ? "已加入" : full ? "对比已满" : "加入对比"}</button>;
}
export function FavoriteButton({ id }: { id: string }) {
  const { favorites, favorite } = useSelection(); const selected = favorites.includes(id);
  return <button className={`icon-button ${selected ? "is-favorite" : ""}`} onClick={() => favorite(id)} aria-label={selected ? "取消收藏" : "收藏产品"} aria-pressed={selected}><Heart size={18} fill={selected ? "currentColor" : "none"}/></button>;
}
