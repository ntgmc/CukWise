export const specificationGroups: { label: string; keys: string[] }[] = [
  { label: "基本信息", keys: ["model", "category", "series", "版本", "产品颜色", "型号说明", "官网目录标识"] },
  { label: "容量与功率", keys: ["capacityMah", "电池能量", "电池组容量", "额定容量", "电池种类", "电池技术", "maxOutputW", "单口最大输出", "pdOutputW", "inputW", "单口最大输入", "双口总输入", "额定功率", "额定电压"] },
  { label: "接口与协议", keys: ["ports", "protocols", "扩展接口", "快充技术", "技术特点", "协议转换", "数据传输", "车机互联", "认证信息"] },
  { label: "输入与输出", keys: ["输入规格", "USB-C1 输出", "USB-C2 输出", "USB-C3 输出", "自带 USB-C 线输出", "自带 Lightning 线输出", "USB-A1 输出", "USB-A2 输出", "无线输出", "Power-Pin 输出", "POGO PIN 输出", "DC 输出", "交流输出", "交流额定参数", "车充口输出", "多口输出", "低压输入输出上限", "工作模式", "充电器模式输出", "充电宝模式输出", "Turbo 模式输出", "PD 输出核对"] },
  { label: "尺寸与线材", keys: ["产品尺寸", "尺寸说明", "weightG", "重量口径", "线材长度", "同系列线长", "线材设计", "线材材质", "最大电流", "最大电压", "芯片", "收纳方式", "外壳材质", "插脚"] },
  { label: "显示与功能", keys: ["显示功能", "屏幕规格", "连接功能", "机型识别", "官方机型说明", "充电模式", "充电策略", "功率调节", "插拔行为", "同时连接", "充电时间", "自充方式", "无线感应距离", "升维驱动", "其他功能", "支架", "风速档位", "电机转速", "风面面积", "供电方式", "控制方式", "摆放方式", "续航", "光通量", "亮度调节", "结构"] },
  { label: "使用与资料", keys: ["套装内容", "包装数量", "循环寿命", "使用温度", "保质期", "执行标准", "环保信息", "含汞量", "功率说明", "资料备注"] },
];

// Source data uses one name per field; shared port specifications are written under each applicable port.
export const retiredSpecificationNames = new Set([
  "USB-C 输出", "USB-C1 / C2 输出", "USB-C3 / USB-A 输出", "USB-C1 自带线输出", "USB-C 伸缩线输出", "USB-C 与自带线", "Lightning 输出", "USB-A 输出",
  "多口总输出", "双口总输出", "三口总输出", "重量说明", "线长", "自带线长度", "电源线长度", "配套 DC 线长度", "线材", "配色", "电量显示", "显示方式", "屏幕", "屏幕尺寸", "认证", "接口类型",
]);
