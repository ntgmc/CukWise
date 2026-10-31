# CukWise

独立的酷态科选购指南。使用 Astro、TypeScript 和 React，构建为可部署到 GitHub Pages 的静态网站。产品、价格和选购资料由人工核对；搜索、对比、推荐和收藏在浏览器内完成。当前包含 88 款产品、8 篇站内指南、43 篇外部资料和 16 条具名评测摘要。

日常更新、来源核对和剩余未知项见 [维护说明](docs/maintenance.md)。

[访问网站](https://ntgmc.github.io/CukWise/) · [GitHub 仓库](https://github.com/ntgmc/CukWise)

## 本地运行

需要 Node.js 24+。

```bash
npm ci
npm run dev
```

打开终端显示的本地地址。构建与预览：

```bash
npm run check
npm run preview
```

`dist/` 是完整发布产物。站内页面使用目录路由，例如 `/products/15-ultra/`，可以直接访问或刷新。

## 部署到 GitHub Pages

1. 仓库为 `ntgmc/CukWise`，默认分支使用 `main`；其他分支名需同步修改 `.github/workflows/pages.yml`。
2. 在仓库 **Settings → Pages → Build and deployment** 中选择 **GitHub Actions**。
3. 推送到 `main`，或手动运行 **Build and deploy GitHub Pages**。工作流检查类型和数据、构建、执行浏览器测试，再发布 `dist/`。

工作流从 GitHub Pages 获取域名与项目路径，支持 `https://用户名.github.io/CukWise/`、用户主页仓库和已配置的自定义域名。自定义域名应先在 Pages 设置中配置并完成 DNS 验证。

本地验证项目子路径时，给构建、预览和浏览器测试传入相同的 `BASE_PATH`：

```bash
BASE_PATH=/CukWise SITE_URL=https://ntgmc.github.io npm run build
BASE_PATH=/CukWise npm run preview
```

在 `http://localhost:4321/CukWise/` 查看。部署配置使用进程环境变量 `SITE_URL`（域名，不含项目路径）和 `BASE_PATH`；不填时使用根路径。`.env.example` 同时列出了可选的公开运营信息，公开变量可在 `.env` 中填写。

## 维护资料

| 文件 | 内容 |
| --- | --- |
| `src/data/products.json` | 型号、版本、功率、协议、接口、重量、自定义参数、图片路径和来源 |
| `public/images/products/` | 产品主图、`specs/` 下的官方规格图，以及记录原图地址的 `sources.json` |
| `src/data/prices.json` | 带收录日期、平台、店铺、购买条件和来源的价格记录 |
| `public/images/prices/` | 人工导入报价的原始截图 |
| `src/data/readings.json` | 外部选购文章的标题、简介、来源和关联产品 |
| `src/data/reviews.json` | 具名评测摘要，注明设备、接口、发表日期和原文 |
| `src/data/guides.ts` | 按用途组织的站内指南、选购清单、关联型号和来源 |
| `src/data/purchase-links.json` | 从官网公开目录整理的购买入口，移除活动追踪参数 |
| `src/pages/about.astro`、`privacy.astro` | 资料说明和隐私说明 |

修改数据后运行 `npm run data:check`。构建也会自动校验标识、产品关联、日期、金额、HTTPS 来源及本地 WebP 图片；通过后提交，工作流会重新发布。产品详情页在构建时生成，更新、添加或归档产品都需要重新构建。

- 产品 `id` 使用小写英文、数字和短横线，作为页面地址；公开后尽量保持稳定。
- 数值参数未知时填写 `null`，文本参数未知时用空字符串；页面区分“未公开”和“不适用”。对比中的自定义字段未收录时显示“—”。`specs` 使用统一字段名，并按 `src/lib/specifications.ts` 的分组和顺序进入详情及对比。USB 接口分别记录，自带线单列，多口总功率与分配条件合为同一项并注明口径；旧同义字段会被校验拒绝。完整字段规则见[参数字段统一](docs/maintenance.md#参数字段统一)。新增参数仍会进入对比。
- `image` 填写 `images/products/型号.webp`，`specImages` 填写规格图路径数组。文件放在 `public/` 对应位置，页面自动加上 Pages 项目路径。主图使用 720 × 520 的透明画布，保持产品比例。
- `maxOutputW` 记录官网标称的最大输出；单口和多口分配分别写入 `specs`。`pdOutputW` 记录单口 PD 固定档输出，不把私有协议或 PPS 峰值填入笔记本 PD 功率。`inputW` 记录公布的输入功率；仅公布电压、电流的交流充电器保留 `null`，把原始参数写入“输入规格”。
- 限定版本通过 `baseProductId` 关联标准款，参数独立填写。`status: "archived"` 的产品不公开展示。
- `updatedAt` 填写实际资料核对日期。保留 `sourceUrl` 和 `sourceLabel`。
- 金额 `amountCents` 使用整数分，如 `8990` 代表 ¥89.90。
- `kind: "reference"` 为文章参考报价、活动参考价等；`kind: "deal"` 为已确认平台和购买条件的好价。普通用户可用的优惠券记为 `eligibility: "public"`，券面和适用金额写入 `conditions`。会员、新客、地区补贴使用各自的 `eligibility`，不混入普通用户最低价。
- 截图缺少准确型号时，价格的 `productId` 可填 `null`，同时填写 `productName` 保留原表商品名；记录会出现在好价列表，型号确认后再关联产品。不要为导入简称新建猜测的产品档案。
- 价格 `sourceUrl` 可使用 HTTPS 来源或 `images/prices/文件名.webp`，本地截图会自动适配 Pages 项目路径。`recordedAt` 为收录日期；活动年份、日期、平台店铺、券条件和套餐差异应如实记录。
- 好价不要求截止时间，`expiresAt` 可不填或填 `null`，均正常显示为当前好价并参与对应条件的价格计算。若填写截止日期，到期后转为历史好价；归档记录和未来记录不展示为当前好价。
- `readings.json` 的 `kind` 可为 `review`、`teardown`、`video`、`guide`、`news`，分别代表深度评测、拆解、视频入口、横向选购和新品资料。只关联原文实际包含的型号；旧名称以正文型号核对，不能仅凭标题关联。
- `reviews.json` 只允许公开字段：`id`、`productId`、`nickname`、`device`、`title`、`content`、`createdAt`、`sourceUrl`、`sourceLabel`。填写有权使用的摘要和出处，不放联系方式或内部备注。

2026-10-31 按酷态科官网目录及各产品规格图整理了 87 条产品档案，补齐全部主图，并保留 155 张去重后的规格图。原有 84 个产品地址保持稳定，新增 CTC615N、CTC515P、CTC515N 三款线材；原标为 USB-A 转 C 的 1 米线已按官网更正为 CTC310N 双 USB-C 线。

官网目录与规格图在部分型号、重量、尺寸、接口及功率上存在差异，产品页的“资料备注”保留具体口径。限定款没有单独公布的重量保留未知；不从标准款推定。户外电源按 Wh 展示电池容量，电池组的 Ah 和电压另外记录。原有 5 条文章参考报价和 2 篇外部选购资料继续保留，未在本次参数整理中重新核价。

2026-10-31 导入用户提供的“10月25日点亮五折”截图：46 行商品整理为 74 条报价，其中活动价 29 条、双十一参考价 45 条，包含一行两档活动价的拆分。53 条关联到 36 款产品，21 条保留原表商品名等待型号区分。按用户确认，这批报价来自 2026 年拼多多百亿补贴店铺，购买时使用表格左侧对应券组。29 条活动价按普通用户可用券好价收录，已关联产品的活动价进入当前价和最低价计算；45 条双十一参考价保留参考价身份。全部无需填写截止时间；“未进活动”和空单元格不生成价格。原表推荐星级随报价保留。

2026-10-31 第二轮补充：新增 CP26 自带线款（LPB150N），按可核对的发布报道及认证报道关联已有 149 元参考价，未转为当前好价；官网暂缺的重量和固定 PD 档保持未知。新增 41 篇外部资料、16 条具名评测摘要与 8 篇站内指南，补入 10 款产品的实测重量。AD653 和 AD653U 按评测读取的 PDO 将固定 PD 上限记为 65 W，保留官网宣传的 90 / 100 W 与输入条件说明。74 个购买入口来自已保存的官网公开目录，不代表活动报价的同一店铺。

## 推荐与浏览器数据

`src/lib/recommend.ts` 使用规则计算候选，不请求服务器。笔记本功率需求以已知的单口 PD 输出判断，不使用多口总功率或私有协议峰值替代。推荐排除协议不匹配或固定 PD 功率不足的产品。PPS 和小米私有协议只确认支持情况，具体机型的功率仍需核对；多设备需求排除单接口产品，并提示多口分配与低压输入条件。未知价格或重量会在结果中标明。

收藏和对比通过 localStorage 保存在当前浏览器，静态页面之间共享，也可在同源标签页间同步。对比链接通过 `ids` 查询参数携带产品标识，最多 4 款；自定义参数和排序保留在当前页面。产品库支持 PD 固定档、协议、当前好价预算和排序筛选，条件保留在 URL 中；型号搜索包含限定版本。参考价只作参考展示，不参与好价预算筛选。本站没有数据库、账号、后台、自动采集或在线 AI 服务。纠错通过 GitHub Issues 提交。

## 验证

```bash
npm run check
npx playwright install --with-deps chromium
npm run test:e2e
```

测试前先完成构建。测试覆盖价格分类、PD 功率判断、协议不匹配和多设备推荐、指南关联、来源状态、关键规格、全部主图解码、站内路径、搜索筛选恢复、收藏、对比、推荐及 320 / 375 / 414 / 768 / 1440 px 页面宽度。项目路径构建后，测试也需使用对应路径：

```bash
BASE_PATH=/CukWise npm run test:e2e
```

每周一 GitHub Actions 自动执行 `npm run sources:check`，报告在工作流 Summary 和 `source-availability` 附件中；也可手动运行。外部网站的登录、验证码和限流会单独标记，需要人工核对，检查不会改写数据或价格。

截图保存在 `artifacts/`，测试输出在 `test-results/`，均不提交。Node.js 用于开发、构建和测试，发布后的站点由静态文件组成。
