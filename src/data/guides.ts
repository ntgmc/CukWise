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
    summary: "iPhone、小米和 PPS 手机的选法不同。把磁吸、自带线与真正用得到的功率一起考虑。",
    categoryIds: ["powerbank"], updatedAt: "2026-10-31",
    picks: [
      { productId: "6-power", reason: "6000 mAh、153 g，优先考虑随身应急；长时间外出再看更大容量。" },
      { productId: "10-magnetic", reason: "需要磁吸便利，同时希望保留较高有线输出；无线功率单独核对。" },
      { productId: "cp24-dual", reason: "USB-C 与 Lightning 双线，新旧接口设备混用时少带线。" },
    ],
    sections: [
      { title: "按设备选择快充协议", paragraphs: ["USB-C iPhone / iPad 优先检查 PD，三星等机型还需核对 PPS 电压与电流；写着支持 PPS，不代表每款手机都能达到自己的最高快充功率。小米 / REDMI 的高功率通常还依赖澎湃秒充协议、机型和合适的 6A 线。", "磁吸描述的是固定方式。无线输出、普通 Qi 与其他认证档位需要分别确认，手机壳厚度和磁环位置也会影响体验。有线 55 W 的产品，不会因此拥有 55 W 无线输出。"] },
      { title: "容量和体积一起选", paragraphs: ["6000–10000 mAh 更适合应急和日常补电；15000–20000 mAh 可先作为长时间通勤、出差的候选。相同标称容量还要比较重量、尺寸、线材与实际输出能量。", "电芯容量不等于在手机端能收到的电量，升降压、线材和手机自身充电都有损耗。用容量直接除以手机电池容量，不能得到准确充电次数。"] },
      { title: "自带线与多设备怎么取舍", paragraphs: ["经常忘带线，可以先看自带线；USB-C 双线款与 USB-C + Lightning 双线款要按设备接口区分。自带线损坏后的替代方式，也值得在购买前确认。", "单口最大功率与多口总功率是两个参数。CP24 双线款在评测中双线同时约各 10 W；需要两台设备都快充，应直接查看多口分配与对应接口。"] },
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
    summary: "总功率、小米私有快充和 PPS 峰值，都不能直接替代笔记本所需的 PD 档位。",
    categoryIds: ["powerbank", "charger"], updatedAt: "2026-10-31",
    picks: [
      { productId: "6-card-air", reason: "约 81 g 薄型充电器，主口固定 PD 65 W；低压交流输入时上限降低。" },
      { productId: "10-charger-mini", reason: "固定 PD 100 W，适合希望兼顾手机与笔记本的差旅用户。" },
      { productId: "15-ultra", reason: "20000 mAh、PD 3.1 140 W；有高功率需求并接受约 590 g 重量时再选。" },
    ],
    sections: [
      { title: "从原装电源和笔记本接口查起", paragraphs: ["确认笔记本支持 USB-C PD 输入，再看厂家建议功率。65 W、100 W、140 W 是不同候选范围；某些游戏本虽能 USB-C 充电，也可能在高负载时限性能或继续消耗电池。", "PD 100 W 常见固定档为 20 V / 5 A，PD 3.1 140 W 常见为 28 V / 5 A。产品宣传的 120 W 小米快充或 210 W 多口总输出，不能证明它有对应的笔记本固定 PD 档。"] },
      { title: "线材与接口也要满足档位", paragraphs: ["超过 3 A 的 USB-C 供电需核对带电子标记的 5A 线；140 W 还需核对 EPR 支持。240 W 充电线只表示供电能力，不能证明它支持高速数据传输或视频输出。", "同一设备的 C1、C2 与自带线可能不是相同档位。例如 15 号电能站的自带线和 C2，在评测中分别约为 94 W 与 134 W。"] },
      { title: "持续供电与差旅条件", paragraphs: ["多口接入后，笔记本可能从 100 W 降到 65 W 或 45 W。挑选时按自己实际使用的口数组合检查，而不是把单口上限相加。", "交流输入为 100–130 V 的地区，部分产品输出会降低。6 号卡片 Air 主口在低压输入下标注最高 45 W；跨地区出行需同时核对插头与输入范围。"] },
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
      { title: "区分插座、USB 与无线充功率", paragraphs: ["10 号电能基站的交流插座额定负载与 USB 快充总输出分别计算，不能把插座 2500 W 理解成 USB 输出。可拆万象屏、底座和电源线也会改变整套占地。", "无线位的标称上限不一定适用于 iPhone，耳机位通常另有功率限制。对充电速度要求高时，优先核对有线输出。"] },
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
    summary: "100 W、240 W、6A、数显和一分二各解决不同问题，先确认你的设备需要什么。",
    categoryIds: ["cable"], updatedAt: "2026-10-31",
    picks: [
      { productId: "cable-100-15", reason: "普通 USB-C PD 100 W 设备可先看这类直连线，不需要额外数显功能。" },
      { productId: "cable-240", reason: "需要 EPR 高功率或对应小米 6A 快充时核对；仍需匹配两端设备。" },
      { productId: "cable-plus", reason: "需要一分二及协议转换时再选；先阅读电源与手机兼容条件。" },
    ],
    sections: [
      { title: "接口形状不代表功能", paragraphs: ["USB-C 转 USB-C、USB-A 转 USB-C 和 Lightning 要按设备搭配选择。旧款 iPhone 的 Lightning 与新款 USB-C 不能仅靠商品名称中的“苹果快充”判断。", "型号和线长也属于产品身份。官网目录的 CTC310N 在规格资料中为双 USB-C；遇到目录分类与规格图不一致时，应以具体型号和插头核对。"] },
      { title: "供电、数据和视频分别核对", paragraphs: ["PD 100 W、240 W、6A 与数据传输速率是不同指标。支持 240 W 的线仍可能只有 USB 2.0 数据速率；没有明确标注的视频输出能力应保留未知。", "小米私有 6A 快充与通用 5A PD 也应分别核对。充电器、线、设备任一侧不支持目标协议，都不能只凭线材上的功率标签获得该档位。"] },
      { title: "数显与一分二适合什么人", paragraphs: ["数显用于观察状态，不能代替专业测试仪的协议和精度核验。日常只需稳定补电，可以优先比较线长、柔软度与接口耐用性。", "一分二线可能有共享功率和协议转换条件。若对笔记本持续供电有要求，优先确认两路同时输出时的分配，不把单路标称功率相加。"] },
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
      { productId: "cp26-cable", reason: "15000 mAh 磷酸铁锂、自带线；尺寸、重量与固定 PD 档仍需购买前核对。" },
    ],
    sections: [
      { title: "有插座和无插座，是两种需求", paragraphs: ["酒店、办公室常有插座，可以先选一个满足笔记本和手机需求的多口充，再按途中补电需要配小容量移动电源。长时间离开插座，才优先增加电池容量。", "比较时算上充电器、线、底座和 DC 转接头。桌面充的裸机重量并不代表整套出行重量；二合一也未必比独立小充加小电源更轻。"] },
      { title: "出行前核对实物能量与携带规则", paragraphs: ["按移动电源实物标注的 Wh、电池认证标识、产品状态与承运人最新要求核对。不能只按 mAh 判断是否允许携带，也不能用某型号名称为任何批次作登机承诺。", "航空携带规则、认证状态与召回信息会更新。出发前向承运人确认，实物标识不清、鼓包或受损的产品不要继续使用。"] },
      { title: "跨地区还要看交流输入", paragraphs: ["插脚适配与电压适配是两件事。有些型号支持 100–240 V 输入，但高功率档只在 200–240 V 可用；有些还存在两段输入范围。", "站内推荐按已核对的功率筛选，目的地电压、同充口数和具体机型仍应再看产品规格。"] },
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
      { title: "12 V 与 24 V 的上限可能不同", paragraphs: ["按车辆插座电压、额定负载和产品输入范围选择。部分车充在不同输入电压下的总功率、USB-A 输出上限会变化，不能用最高宣传值覆盖所有车辆。", "车内点烟器位置和周边空间会影响能否插牢。自带伸缩结构的车充通常比普通小车充更占空间。"] },
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
    summary: "Power-Pin、USB-C 和夹式延长线解决不同使用场景，裸机与套装不能只按名字比较。",
    categoryIds: ["fan", "accessory"], updatedAt: "2026-10-31",
    picks: [
      { productId: "fan-desk", reason: "固定桌面使用，核对 USB-C 和 Power-Pin 供电条件。" },
      { productId: "fan-plus-clip", reason: "需要夹在合适位置使用，先确认夹具尺寸、走线与独立电源。" },
      { productId: "fan-plus-power", reason: "希望随身使用模块风扇与配套电源，按包装清单核对组合。" },
    ],
    sections: [
      { title: "先确认风扇主体与电源是否都包含", paragraphs: ["模块风扇 Plus 有夹式延长线套装和移动电源供电套装，配件不同，价格不能直接混为同一款。Power-Pin 接口也不能仅凭磁吸外观认定兼容。", "桌面模块风扇可在固定位置使用，户外风扇与风嘴配件偏向手持、吹扫等场景；根据实际用途选择，避免只比较最高转速。"] },
      { title: "使用时间取决于档位和电源", paragraphs: ["续航要同时看风速档位、外接电源容量和转换损耗。未公开的固定档续航，不从电池容量直接推算为使用承诺。", "夹具安装要稳固，风口保持通畅。随身灯和转接头同样需要核对输入、接口及使用说明。"] },
      { title: "电池和转接头单独核对", paragraphs: ["AA、AAA 和 CR2032 是不同电池规格；按设备要求选择电压、尺寸和电池类型，不能因为同一品牌就互换。碱性或纽扣原电池不要放入充电器充电。", "Lightning 转接头用于特定接口转换，不能据此假设支持任意数据、视频或高功率功能；以其单独规格为准。"] },
    ],
    checklist: ["包装是否含电源、夹具和延长线", "接口是否为对应 Power-Pin 或 USB-C", "安装空间、风向与走线", "电池规格、极性和是否可充电"],
    sources: [
      { label: "酷态科：BF02 供电套装", url: "https://www.cuktech.com.cn/products/bf02.html" },
      { label: "充电头网：模块风扇 Plus 套装介绍", url: "https://www.chongdiantou.com/archives/1779098200973.html" },
      { label: "充电头网：桌面模块风扇", url: "https://www.chongdiantou.com/archives/1782298450505.html" },
    ],
  },
  {
    id: "portable-station", title: "户外电源，分清 Wh、W 和升维模式",
    summary: "512 Wh 是储电量，600 W 是额定 AC 输出，升维 1000 W 还要核对负载类型。",
    categoryIds: ["station"], updatedAt: "2026-10-31",
    picks: [
      { productId: "energy600", reason: "需要给 AC 电器或多台设备供电，接受约 6.5 kg 机身与 512 Wh 电池。" },
      { productId: "30-power", reason: "主要为 USB-C 设备补能时可比较的替代方向；没有 AC 插座，功能不等同。" },
    ],
    sections: [
      { title: "先列负载，再看电池能量", paragraphs: ["查电器持续功率、启动功率与供电形式，再核对电源支持的输出范围。Wh 是电池能量，W 是功率，二者不能互相替代。", "理论运行时间可用电池能量除以负载功率作粗略起点，但逆变器损耗、待机功耗、环境与保护策略会缩短实际时间，不宜直接作续航保证。"] },
      { title: "额定输出和升维不是同一种能力", paragraphs: ["电能仓 600 的额定 AC 输出为 600 W，1000 W 升维需遵守产品对负载的限制。不能将升维参数视为对任意 1000 W 设备的持续额定供电。", "USB-C PD 140 W、AC 和车载接口有各自限制；多路同时使用还需查看整机总输出及保护条件。"] },
      { title: "补电方式与实际搬运", paragraphs: ["确认计划使用的交流、USB-C 或其他输入方式，分别核对最大输入与所需配件。APP 功能不应代替对物理接口、屏幕状态和使用说明的检查。", "约 6.5 kg 机身更适合有车辆或固定营地的场景。仅为手机或笔记本补电时，先比较更轻的移动电源是否已经满足需要。"] },
    ],
    checklist: ["电器持续与启动功率", "额定 AC 输出及升维适用负载", "补电接口、时间与所需配件", "搬运重量、通风及放置环境"],
    sources: [
      { label: "酷态科：PS600N 官方规格", url: "https://www.cuktech.com.cn/products/ps600n.html" },
      { label: "充电头网：电能仓 600 开箱视频入口", url: "https://www.chongdiantou.com/archives/1785919089120.html" },
    ],
  },
];

export const guidesForCategory = (category: Category) => guides.filter(guide => guide.categoryIds.includes(category));
