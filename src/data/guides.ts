import type { Category } from "../lib/domain";

export type Guide = {
  id: string; title: string; summary: string; categoryIds: Category[];
  picks: { productId: string; reason: string }[];
  sections: { title: string; paragraphs: string[] }[];
  checklist: string[]; sources: { label: string; url: string }[];
  updatedAt: string;
};

export const guides: Guide[] = [
  {
    id: "phone-power", title: "手机补能，先选协议，再选容量",
    summary: "按手机协议选功率，按外出时间选容量，再看是否需要磁吸和自带线。",
    categoryIds: ["powerbank"], updatedAt: "2026-10-31",
    picks: [
      { productId: "6-power", reason: "6000 mAh、153 g，优先考虑随身应急；长时间外出再看更大容量。" },
      { productId: "10-magnetic", reason: "适合想用磁吸、又需要较高有线输出的用户；有线与无线各有功率档位。" },
      { productId: "cp24-dual", reason: "USB-C 与 Lightning 双线，新旧接口设备混用时少带线。" },
    ],
    sections: [
      { title: "按设备选择快充协议", paragraphs: ["USB-C iPhone / iPad 看 PD；三星等机型看 PPS 的电压、电流范围是否匹配手机的快充档。小米 / REDMI 的高功率通常需要澎湃秒充协议、对应机型和合适的 6A 线。", "磁吸是固定方式，无线功率要看 Qi 等协议和认证档位。有线 55 W 与无线输出是两项规格，手机壳厚度和磁环位置也会影响使用。"] },
      { title: "容量和体积一起选", paragraphs: ["应急和日常补电可选 6000–10000 mAh，长时间通勤、出差可看 15000–20000 mAh。同容量产品再比较重量、尺寸、自带线与实际输出能量。", "估算充电次数时，要计入升降压、线材和手机充电的损耗；电芯容量直接除以手机电池容量会高估次数。"] },
      { title: "自带线与多设备怎么取舍", paragraphs: ["经常忘带线，可选自带线款。按设备接口选双 USB-C 或 USB-C + Lightning，并查看线材损坏后能否通过其他接口充电。", "两台设备同充时看多口分配。例如 CP24 双线款的单口上限与双线同充不同，评测中双线同时输出约各 10 W。"] },
    ],
    checklist: ["手机支持的协议与充电接口", "保护壳能否兼容磁吸或插头", "电池能量、重量与尺寸", "两台设备同时充电时的分配"],
    sources: [
      { label: "酷态科官网移动电源目录", url: "https://www.cuktech.com.cn/products-lists/power-bank.html" },
      { label: "充电头网：WPB100P 有线与磁吸测试", url: "https://www.chongdiantou.com/archives/1763540675511.html" },
      { label: "充电头网：CP24 双线款评测", url: "https://www.chongdiantou.com/archives/1753233350544.html" },
    ],
  },
  {
    id: "laptop-pd", title: "给笔记本选电源，看单口 PD 固定档",
    summary: "先查笔记本需要的 PD 电压和功率，再选接口、线材与多口分配。",
    categoryIds: ["powerbank", "charger"], updatedAt: "2026-10-31",
    picks: [
      { productId: "6-card-air", reason: "约 81 g 薄型充电器，主口固定 PD 65 W；低压交流输入时上限降低。" },
      { productId: "10-charger-mini", reason: "固定 PD 100 W，适合希望兼顾手机与笔记本的差旅用户。" },
      { productId: "15-ultra", reason: "20000 mAh、PD 3.1 140 W；有高功率需求并接受约 590 g 重量时再选。" },
    ],
    sections: [
      { title: "从原装电源和笔记本接口查起", paragraphs: ["确认笔记本支持 USB-C PD 输入，再看厂家建议功率。65 W、100 W、140 W 是不同候选范围；某些游戏本虽能 USB-C 充电，也可能在高负载时限性能或继续消耗电池。", "PD 100 W 常见固定档为 20 V / 5 A，PD 3.1 140 W 常见为 28 V / 5 A。笔记本按这些固定档选；120 W 小米快充和 210 W 多口总输出属于其他功率指标。"] },
      { title: "线材与接口也要满足档位", paragraphs: ["超过 3 A 的 USB-C 供电需要带电子标记的 5A 线，140 W 还需要 EPR 支持。240 W 是供电规格，高速数据和视频能力要另看标注。", "同一设备的 C1、C2 与自带线可能不是相同档位。例如 15 号电能站的自带线和 C2，在评测中分别约为 94 W 与 134 W。"] },
      { title: "持续供电与差旅条件", paragraphs: ["多口接入后，笔记本可能从 100 W 降到 65 W 或 45 W。按实际同充组合查分配表，单口上限不能相加。", "交流输入为 100–130 V 的地区，部分产品输出会降低。6 号卡片 Air 主口在低压输入下标注最高 45 W；跨地区出行需同时核对插头与输入范围。"] },
    ],
    checklist: ["笔记本是否支持 PD 输入及所需固定档", "目标接口的单口 PD 上限", "线材是否支持 5A / EPR", "多口同充与目的地交流输入条件"],
    sources: [
      { label: "充电头网：PD 3.1 移动电源选购", url: "https://post.smzdm.com/p/avd29334/" },
      { label: "充电头网：6 号 Mini 固定 PD 档核对", url: "https://www.chongdiantou.com/archives/1769649734024.html" },
      { label: "酷态科：15 号电能站接口规格", url: "https://www.cuktech.com.cn/products/ta1406.html" },
    ],
  },
  {
    id: "desk-charging", title: "桌面多设备，按同时使用的接口选",
    summary: "手机、笔记本、耳机一起充时，功率分配、线长与整套占地，比单口峰值更重要。",
    categoryIds: ["charger"], updatedAt: "2026-10-31",
    picks: [
      { productId: "10-charger-se", reason: "2C1A 适合常见桌面组合；第三口加入后笔记本功率会降低。" },
      { productId: "15-station", reason: "伸缩线与双无线充适合固定桌面，先核对手机无线档位。" },
      { productId: "30-desktop", reason: "多台高功率设备或 DC 笔记本供电；注意整套重量和转接头。" },
    ],
    sections: [
      { title: "写下真正同时充电的设备", paragraphs: ["先列出笔记本、手机、平板和小配件各自的接口与功率需求。再找到产品对应的双口或三口分配表，确认主设备在其他设备接入后仍有足够输出。", "10 号充电器 SE 的评测给出 C1 + C2 约 67 W + 33 W，三口时约 45 W + 33 W + 18 W。需要笔记本持续 65 W 以上时，这种变化会直接影响使用。"] },
      { title: "区分插座、USB 与无线充功率", paragraphs: ["10 号电能基站的 2500 W 是交流插座额定负载，USB 快充另有总输出上限。摆放时也要算上可拆万象屏、底座和电源线的占地。", "无线位的标称上限不一定适用于 iPhone，耳机位通常另有功率限制。对充电速度要求高时，优先核对有线输出。"] },
      { title: "二合一与 DC 电源的特殊条件", paragraphs: ["二合一产品在插电、移动电源和 Turbo 模式下可能有不同功率；需要长期桌面使用，应先理解模式切换与电池工作方式。", "DC 供电需确认笔记本所需电压、极性、接口和识别方式。功率足够只是条件之一，应按厂家对应机型选择转接头。"] },
    ],
    checklist: ["实际口数组合下的主口功率", "线长、插座方向与桌面占地", "无线档位和手机壳兼容性", "是否包含电源线、底座与转接头"],
    sources: [
      { label: "充电头网：AD1003 多口测试", url: "https://www.chongdiantou.com/archives/362857.html" },
      { label: "充电头网：TA3005U 桌面充评测", url: "https://www.chongdiantou.com/archives/1750756730516.html" },
      { label: "酷态科：TA1208 电能基站", url: "https://www.cuktech.com.cn/products/ta1208.html" },
    ],
  },
  {
    id: "usb-cables", title: "数据线怎么选：接口、电流、长度分开看",
    summary: "按设备选接口和电流，按距离选线长；需要传数据或接屏幕时，再查对应规格。",
    categoryIds: ["cable"], updatedAt: "2026-10-31",
    picks: [
      { productId: "cable-100-15", reason: "适合普通 USB-C PD 100 W 设备的直连线。" },
      { productId: "cable-240", reason: "适合 EPR 高功率或对应的小米 6A 快充，需搭配支持该档位的电源和设备。" },
      { productId: "cable-plus", reason: "需要一分二及协议转换时再选；先阅读电源与手机兼容条件。" },
    ],
    sections: [
      { title: "接口形状不代表功能", paragraphs: ["按电源和设备的接口选 USB-C 转 USB-C、USB-A 转 USB-C 或 Lightning。iPhone 要区分旧款 Lightning 和新款 USB-C。", "同款不同线长分别比较。CTC310N 的官网目录分类与规格资料有差异，规格资料标注为双 USB-C，购买时看具体型号和插头。"] },
      { title: "供电、数据和视频分别核对", paragraphs: ["PD 100 W、240 W 和 6A 描述供电能力，数据速率另看 USB 规格。240 W 线也可能只有 USB 2.0 速率；需要接屏幕时，选明确标注视频输出的线。", "小米私有 6A 快充与通用 5A PD 各有要求，充电器、线材和设备都支持目标协议时，才能使用对应档位。"] },
      { title: "数显与一分二适合什么人", paragraphs: ["数显方便观察充电状态；测协议和精度仍需专业测试仪。日常补电优先看线长、柔软度与接口耐用性。", "一分二线要看共享功率和协议转换条件。给笔记本持续供电时，重点查两路同充的分配，单路标称功率不能相加。"] },
    ],
    checklist: ["两端接口、线长和使用距离", "目标电流与 5A / 6A / EPR 支持", "数据速率或视频功能是否明确公布", "一分二同时输出的条件和功率"],
    sources: [
      { label: "酷态科：数据线与配件目录", url: "https://www.cuktech.com.cn/products-lists/data-cable-and-accessories.html" },
      { label: "酷态科：CTC615N 规格", url: "https://www.cuktech.com.cn/products/ctc615n.html" },
      { label: "充电头网：一分二智转线 Plus", url: "https://www.chongdiantou.com/archives/1773989381580.html" },
    ],
  },
  {
    id: "travel-kit", title: "差旅充电包，按整套重量做减法",
    summary: "大容量、自带线和二合一都能解决问题，合适的组合取决于途中有没有插座。",
    categoryIds: ["powerbank", "charger"], updatedAt: "2026-10-31",
    picks: [
      { productId: "15-air", reason: "15000 mAh、305 g，想兼顾中等容量与薄型机身时考虑。" },
      { productId: "10-fusion", reason: "充电器与移动电源合一；约 334 g 裸机，留意各模式和交流输入条件。" },
      { productId: "cp26-cable", reason: "15000 mAh 磷酸铁锂，自带线；尺寸、重量和固定 PD 档尚无可靠资料。" },
    ],
    sections: [
      { title: "有插座和无插座，是两种需求", paragraphs: ["酒店、办公室常有插座，可以先选一个满足笔记本和手机需求的多口充，再按途中补电需要配小容量移动电源。长时间离开插座，才优先增加电池容量。", "把充电器、线材、底座和 DC 转接头一并计重，再比较二合一与独立充电器加移动电源的组合。"] },
      { title: "出行前核对实物能量与携带规则", paragraphs: ["乘机携带看实物标注的 Wh、认证标识和产品状态，mAh 与型号名称不足以判断。出发前查询承运人的最新要求，以及对应批次的认证和召回信息。", "标识不清的产品先确认是否符合携带要求；鼓包或受损的产品停止使用。"] },
      { title: "跨地区还要看交流输入", paragraphs: ["插脚适配与电压适配是两件事。有些型号支持 100–240 V 输入，但高功率档只在 200–240 V 可用；有些还存在两段输入范围。", "按目的地电压查目标接口和同充组合的输出档位，再与设备需求比较。"] },
    ],
    checklist: ["实物 Wh、认证标识与承运人最新要求", "途中没有插座的最长时间", "整套重量与另带线材", "目的地交流输入范围和插头"],
    sources: [
      { label: "酷态科：PB150S 电池与接口参数", url: "https://www.cuktech.com.cn/products/pb150s.html" },
      { label: "充电头网：二合一 Fusion 模式评测", url: "https://www.chongdiantou.com/archives/1762328231041.html" },
      { label: "中国民用航空局（出行前查询最新要求）", url: "https://www.caac.gov.cn/" },
    ],
  },
  {
    id: "car-charging", title: "车充：先看车辆输入，再安排线材",
    summary: "伸缩线、独立 C 口与磁吸无线各有用途，安装位置和 12 / 24 V 条件先确认。",
    categoryIds: ["car"], updatedAt: "2026-10-31",
    picks: [
      { productId: "car6", reason: "伸缩 C 线为主、A 口补充，适合主要给一台手机充电的车内场景。" },
      { productId: "car10", reason: "希望有独立 C 口和更多输出组合；按车辆输入与端口表核对功率。" },
      { productId: "car10-magnetic", reason: "需要磁吸支架与无线充一体；确认手机壳、安装角度和适用车型。" },
    ],
    sections: [
      { title: "12 V 与 24 V 的上限可能不同", paragraphs: ["按车辆插座电压、额定负载和车充输入范围选择。不同输入电压下，总功率和 USB-A 上限可能不同，分别查 12 V 与 24 V 的输出表。", "车内点烟器位置和周边空间会影响能否插牢。自带伸缩结构的车充通常比普通小车充更占空间。"] },
      { title: "优先使用匹配协议的接口", paragraphs: ["USB-C 自带线、独立 C 口与 A 口能力可能差别很大。CC652 的评测中，C 线为 iPhone 提供快充，而 USB-A 给 iPhone 只握手普通 5 V 充电。", "同时给司机和乘客充电时，直接查看多口分配。若主设备是笔记本，还需确认车辆电压下的固定 PD 档。"] },
      { title: "走线与磁吸支架", paragraphs: ["线材不能阻碍换挡、方向盘、踏板或其他操控。先量插座到手机固定位置的距离，再判断约 0.7 m 伸缩线是否够用。", "磁吸无线需要兼容的设备或保护壳。高温、阳光直射和导航负载可能影响充电速度，应按产品与车辆说明使用。"] },
    ],
    checklist: ["车辆插座电压与产品输入范围", "插座周边空间及插入深度", "主设备实际使用接口的输出", "线材长度、走线与支架位置"],
    sources: [
      { label: "充电头网：三款伸缩线车充区别", url: "https://www.chongdiantou.com/archives/1787725133738.html" },
      { label: "充电头网：CC652 实测", url: "https://www.chongdiantou.com/archives/1787908162317.html" },
    ],
  },
  {
    id: "modular-accessories", title: "风扇与小配件，先核对套装和供电",
    summary: "桌面、夹式和随身使用各有合适的套装，重点看电源、线材和 Power-Pin 接口。",
    categoryIds: ["fan", "accessory"], updatedAt: "2026-11-05",
    picks: [
      { productId: "fan-desk", reason: "固定桌面使用，核对 USB-C 和 Power-Pin 供电条件。" },
      { productId: "fan-plus-clip", reason: "需要夹在合适位置使用，先确认夹具尺寸、走线与独立电源。" },
      { productId: "fan-plus-power", reason: "希望随身使用模块风扇与配套电源，按包装清单核对组合。" },
    ],
    sections: [
      { title: "先确认风扇主体与电源是否都包含", paragraphs: ["模块风扇 Plus 分夹式延长线套装和移动电源供电套装，比较价格时先看包装清单。Power-Pin 配件按接口规格选，磁吸外观相似也可能不兼容。", "桌面模块风扇适合固定摆放，户外风扇与风嘴配件适合手持、吹扫等用途。除转速外，也要看摆放方式和配件。"] },
      { title: "插口一样，也要核对电源档位", paragraphs: ["桌面模块风扇 BF03 的有线输入为 5 V / 2 A，包装含 A to C 电源线，Power-Pin 移动电源需要另购。风扇由外接电源供电；官网标称约 49 小时续航对应 10000 mAh 电源和最低档。", "BF02 夹式延长线套装建议搭配支持 9 V / 3 A 的移动电源或充电器，供电不足可能无法激活 BOOST 档。"] },
      { title: "使用时间取决于档位和电源", paragraphs: ["续航取决于风速档位、外接电源容量和转换损耗，优先参考对应档位的测试。", "夹具安装要稳固，风口保持通畅。随身灯和转接头同样需要核对输入、接口及使用说明。"] },
      { title: "电池和转接头单独核对", paragraphs: ["AA、AAA 和 CR2032 的尺寸、电压和类型不同，按设备要求选。碱性或纽扣原电池不可充电。", "选 Lightning 转接头时，分别查它支持的数据、视频和充电功能。"] },
    ],
    checklist: ["包装是否含电源、夹具和延长线", "接口是否为对应 Power-Pin 或 USB-C", "安装空间、风向与走线", "电池规格、极性和是否可充电"],
    sources: [
      { label: "酷态科：BF03 桌面风扇完整参数", url: "https://www.cuktech.com.cn/products/bf03.html" },
      { label: "酷态科：BF02 夹式延长线套装与 BOOST 条件", url: "https://www.cuktech.com.cn/products/bf02-2-1.html" },
      { label: "酷态科：BF02 供电套装", url: "https://www.cuktech.com.cn/products/bf02.html" },
      { label: "充电头网：模块风扇 Plus 套装介绍", url: "https://www.chongdiantou.com/archives/1779098200973.html" },
      { label: "充电头网：桌面模块风扇", url: "https://www.chongdiantou.com/archives/1782298450505.html" },
    ],
  },
  {
    id: "portable-station", title: "户外电源，分清 Wh、W 和升维模式",
    summary: "512 Wh 是储电量，600 W 是额定 AC 输出，升维 1000 W 还要核对负载类型。",
    categoryIds: ["station"], updatedAt: "2026-11-05",
    picks: [
      { productId: "energy600", reason: "需要给 AC 电器或多台设备供电，接受约 6.5 kg 机身与 512 Wh 电池。" },
      { productId: "30-power", reason: "主要为 USB-C 设备补能时可比较的替代方向；没有 AC 插座，功能不等同。" },
    ],
    sections: [
      { title: "先列负载，再看电池能量", paragraphs: ["先查电器的持续功率、启动功率和供电接口，再选电源。Wh 表示电池储能，W 表示输出功率。", "电池能量除以负载功率可粗估运行时间；实际还要扣除逆变器、待机等损耗，并考虑环境和保护策略。"] },
      { title: "用具体负载的实测作参照", paragraphs: ["充电头网的 PS600N 样品在 AC 600 W 恒定负载下约运行 42 分钟；使用原装 AC 电源线充电，约 28 分钟到 50%、1 小时 7 分钟充满。", "比较续航时，找负载和环境接近自己用途的测试。电器功耗、环境温度和待机损耗占比都会影响结果，小功率设备尤其要看待机损耗。"] },
      { title: "额定输出和升维不是同一种能力", paragraphs: ["电能仓 600 的额定 AC 输出为 600 W，升维 1000 W 仅适用于产品说明中支持的负载。选电器时按负载类型和持续功率判断。", "USB-C PD 140 W、AC 和车载接口有各自限制；多路同时使用还需查看整机总输出及保护条件。"] },
      { title: "补电方式与实际搬运", paragraphs: ["按计划使用的交流、USB-C 等补电方式，比较最大输入和所需配件。", "约 6.5 kg 机身更适合有车辆或固定营地的场景。仅为手机或笔记本补电时，先比较更轻的移动电源是否已经满足需要。"] },
    ],
    checklist: ["电器持续与启动功率", "额定 AC 输出及升维适用负载", "补电接口、时间与所需配件", "搬运重量、通风及放置环境"],
    sources: [
      { label: "酷态科：PS600N 官方规格", url: "https://www.cuktech.com.cn/products/ps600n.html" },
      { label: "充电头网：电能仓 600 充放电与温度实测", url: "https://www.chongdiantou.com/archives/1785494605155.html" },
      { label: "充电头网：电能仓 600 开箱视频入口", url: "https://www.chongdiantou.com/archives/1785919089120.html" },
    ],
  },
];

export const guidesForCategory = (category: Category) => guides.filter(guide => guide.categoryIds.includes(category));
