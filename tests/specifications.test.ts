import { test } from "node:test";
import assert from "node:assert/strict";
import { getProducts } from "../src/data/catalog";
import { compareRows } from "../src/lib/domain";
import { retiredSpecificationNames, specificationGroups } from "../src/lib/specifications";
import { validateProduct } from "../src/lib/validation";

const products = getProducts();
const product = (id: string) => products.find(p => p.id === id)!;

test("the reported power bank comparison aligns common output fields", () => {
  const rows = compareRows([product("10-plus"), product("20-power"), product("25-se")]);
  const values = (label: string) => rows.find(row => row.label === label)!.values;
  assert(values("USB-C1 输出").every(value => value.includes("20 V")));
  assert(values("USB-C2 输出")[0].includes("33 W"));
  assert(values("USB-C2 输出")[1].includes("60 W"));
  assert.equal(values("USB-C2 输出")[2], "—");
  assert(values("USB-A1 输出").every(value => value !== "—"));
  assert.deepEqual(values("自带 USB-C 线输出").slice(0, 2), ["—", "—"]);
  assert.equal(values("自带 USB-C 线输出")[2], values("USB-C1 输出")[2]);
  assert.equal(rows.filter(row => row.label === "多口输出").length, 1);
  assert(values("多口输出")[0].includes("分配与条件："));
  assert(values("多口输出")[1].includes("总功率：210 W"));
  assert(values("多口输出")[2].includes("总功率：20 W"));
});

test("shared ports, retractable cables and output modes keep their actual limits", () => {
  const charger = product("15-charger").specs;
  assert.equal(charger["USB-C1 输出"], charger["USB-C2 输出"]);
  assert.equal(charger["USB-C3 输出"], charger["USB-A1 输出"]);
  assert.notEqual(charger["USB-C1 输出"], charger["USB-C3 输出"]);
  const retract = product("cp6-retract").specs;
  assert(retract["自带 USB-C 线输出"].includes("65 W MAX"));
  assert(retract["USB-C1 输出"].includes("67 W MAX"));
  const station = product("15-station").specs;
  assert(station["自带 USB-C 线输出"].startsWith("C1（自带伸缩线）："));
  assert.equal(station["USB-C1 输出"], undefined);
  assert(station["USB-C2 输出"].includes("140 W MAX"));
  const fusion = product("10-fusion").specs;
  assert(fusion["充电器模式输出"].includes("65 W PD"));
  assert(fusion["充电宝模式输出"].includes("90 W MAX"));
  assert(fusion["Turbo 模式输出"].includes("需 200–240 V 输入"));
  const car = product("car10-magnetic").specs;
  assert(car["多口输出"].includes("三口总功率：100 W"));
  assert(car["多口输出"].includes("主机有线 + 无线：90 W"));
  assert(car["线材长度"].includes("自带线：约 0.7 m\n配套 DC 线：约 1.2 m"));
});

test("every current field has one canonical name and ordering is independent of product order", () => {
  const keys = specificationGroups.flatMap(group => group.keys);
  assert.equal(new Set(keys).size, keys.length);
  const known = new Set(keys);
  for (const p of products) for (const key of Object.keys(p.specs)) {
    assert(known.has(key), `${p.id}: ${key}`);
    assert(!retiredSpecificationNames.has(key), `${p.id}: ${key}`);
  }
  const chosen = [product("25-se"), product("10-plus"), product("20-power")];
  const rows = compareRows(chosen);
  const reversed = compareRows([...chosen].reverse());
  assert.deepEqual(rows.map(row => row.key), reversed.map(row => row.key));
  assert.deepEqual(rows.map(row => row.values), reversed.map(row => [...row.values].reverse()));
  assert.equal(new Set(rows.map(row => row.label)).size, rows.length);
  const future = compareRows([{ ...chosen[0], specs: { "新增规格": "保留原文" } }]);
  assert.deepEqual(future.at(-1), { key: "extra:新增规格", label: "新增规格", values: ["保留原文"], group: "其他参数" });
});

test("catalog validation rejects retired names rather than silently splitting comparison rows", () => {
  for (const key of retiredSpecificationNames) {
    assert.throws(() => validateProduct({ ...products[0], specs: { [key]: "原文规格" } }), /已停用/);
  }
  assert.equal(product("cable-100").ports, "USB-C 转 USB-C");
  assert.equal(product("rainbow-kit").ports, "USB-C 转 USB-C，附 Lightning 转接头");
});
