# 预设 · Apple 式克制

> 基准预设。不确定选哪个时选它。整段收录自 `docs/VIDEO_BRIEF.template.md` 附录，参数未改动。

**核心原则：高级感不来自加东西，来自减东西、放慢、留白。**

做不出苹果感的原因只有三个：元素太多、动效太快、字重太粗。本预设每一条都在对付这三件事。

## 适用 / 不适用

| 适用 | 不适用 |
|---|---|
| 品牌片、产品叙事、企业形象 | 需要塞进大量信息的解释视频 |
| 要「贵」的场合 | 竖屏刷流（节奏对不上，见 `vertical-feed`） |
| 单一核心信息的传达 | 图表密集的数据片（见 `data-journalism`） |

## 色彩

| 角色 | 值 | 说明 |
|---|---|---|
| 背景 | `#000000` | 真黑。不要用 `#111` `#1a1a1a`，那是网页安全色思维 |
| 次级背景 | `#1D1D1F` | 卡片、分区块 |
| 主文字 | `rgba(255,255,255,0.92)` | **不要纯白**。纯白在黑底上会晕开、显廉价 |
| 次文字 | `rgba(255,255,255,0.56)` | |
| 三级文字 | `rgba(255,255,255,0.36)` | |
| 强调色 | `#0071E3` | 全片**只用一个**强调色 |
| 分隔线 | `rgba(255,255,255,0.08)` | 1px，几乎看不见就对了 |

- 强调色全片出现不超过 3 次，每次只用在一个元素上
- 禁止彩色渐变。需要渐变时只能是同色系极低对比（`#1D1D1F → #000000`）
- 无彩色占画面 95% 以上

## 字体

> CSS 族名一律写 `'Noto Sans SC'`（即思源黑体）。**不要写 `'Source Han Sans SC'`** —— HyperFrames 编译器不认识它，`check` 会刷 `No deterministic font mapping` 警告。编译器认不认识某个族名、以及哪些必须项目内自带 woff2，见 `../scaffold.md`。

**许可提醒：SF Pro 和苹方（PingFang）不能用于视频内容。** SF Pro 的许可仅限为 Apple 平台开发 App 的界面使用，苹方随系统分发同样受限。

| 用途 | 首选 | 备选 |
|---|---|---|
| 西文 | **Inter**（SIL OFL，几何形态最接近 SF Pro） | Geist、Instrument Sans |
| 中文 | **Noto Sans SC / 思源黑体**（SIL OFL） | HarmonyOS Sans（免费商用） |
| 数字 | **JetBrains Mono** 或 Inter 的 tabular 变体 | 必须开等宽数字 |

```
标题     Inter SemiBold(600) / 思源黑体 Medium
         字号 88–120px  行高 1.05  字距 -0.025em
副标题   Inter Regular(400)
         字号 36–44px   行高 1.35  字距 -0.01em
正文     Inter Regular(400)
         字号 28–32px   行高 1.5   字距 0
数字     tabular-nums 必开
```

- **标题最重只到 SemiBold(600)。** 用 Bold/Black 堆标题是「苹果感」最常见的死因
- 西文字距必须为负。大字号不收字距立刻变廉价
- 全片字号档位不超过 4 个
- **中文字距不要设负值**（中文字形本身已满框，负字距会粘连）

## 版式与留白

留白是这套风格 80% 的来源。

```
画布 1920×1080
左右安全边距   240px   （12.5%，是常规做法的 2 倍）
上下安全边距   160px
栅格           8pt grid，所有间距为 8 的倍数
常用大间距     64 / 96 / 128 / 160
```

- **每屏最多 2 个信息元素**（一个标题 + 一行副标题就够了）
- 单屏文字总量不超过 30 字
- 内容多宁可拆场景，不要挤一屏
- 主体垂直居中或位于视觉上三分位，左对齐或居中，全片统一

## 动效

最容易做错的一节。**慢 = 贵。**

```
缓动        cubic-bezier(0.28, 0.11, 0.32, 1)    全片统一，无例外
入场时长    0.8s – 1.2s                          不是 0.3s
位移距离    translateY(24px) → 0                 不超过 40px
缩放范围    0.98 → 1                             绝不超过 1.05
stagger     0.06 – 0.1s
```

**只允许两种入场**：淡入、淡入 + 微小上移。就这两种。

## 转场

```
类型    交叉淡化（crossfade）
时长    0.6 – 0.8s
```

全片只用这一种。不用 shader，不用擦除，不用推移。

## 材质（谨慎使用）

```
毛玻璃    backdrop-filter: blur(24px) saturate(180%)
          background: rgba(255,255,255,0.06)
边框      1px solid rgba(255,255,255,0.08)
圆角      20px（小卡片）/ 28px（大面板）
阴影      0 24px 64px rgba(0,0,0,0.4)     大范围、低透明、无锐边
```

一条片子里用毛玻璃的元素不超过 2 个。它是重音符号，不是背景纹理。

## 节奏

比视觉参数更决定「高级感」。

```
单场景停留      4 – 6 秒        （常规做法是 2–3 秒）
静止时刻        每个场景元素入场完成后，保持 1.5–2 秒完全静止
开场留白        首帧后 0.5 秒黑场再进内容
结尾留白        最后一个元素退场后 1 秒黑场
```

**画面上什么都不发生的时间，要占全片 30% 以上。** 这是苹果视频和普通视频最大的体感差异 —— 不是它做了什么，是它敢什么都不做。

直接后果：**同样的信息量，这套风格需要的时长比常规风格多 40%。** 在 BRIEF §3 定时长时就要预留，否则一定会被迫加快节奏，然后前面所有参数都白设。

## 禁止清单

粘贴到 BRIEF §10：

- ❌ 纯白文字
- ❌ Bold 以上字重的标题
- ❌ 两个及以上强调色
- ❌ 彩色渐变背景
- ❌ 文字投影 / 描边（字幕的功能性描边除外）
- ❌ 装饰性几何图形、飞舞的粒子、光效扫光
- ❌ 弹跳缓动（`back` / `elastic` / `bounce` 系）
- ❌ 旋转、3D 翻转、透视
- ❌ 0.5 秒以内的入场动画
- ❌ 位移超过 40px 的「飞入」、缩放超过 1.05 的「爆出」
- ❌ 快切、闪切、硬切
- ❌ 一屏超过 3 个元素、同屏超过 3 个元素同时运动
- ❌ emoji

## CSS Tokens

粘贴到 BRIEF §4 与骨架的 `:root`：

```css
:root {
  /* 色彩 */
  --bg:            #000000;
  --bg-elevated:   #1D1D1F;
  --text-primary:  rgba(255,255,255,0.92);
  --text-secondary:rgba(255,255,255,0.56);
  --text-tertiary: rgba(255,255,255,0.36);
  --accent:        #0071E3;
  --hairline:      rgba(255,255,255,0.08);

  /* 字体 */
  --font-latin:    'Inter', system-ui, sans-serif;
  --font-cn:       'Noto Sans SC', sans-serif;
  --font-mono:     'JetBrains Mono', monospace;

  /* 排版 */
  --title-size:    96px;
  --title-weight:  600;
  --title-lh:      1.05;
  --title-ls:      -0.025em;
  --sub-size:      40px;
  --body-size:     30px;
  --body-lh:       1.5;

  /* 间距 */
  --pad-x:         240px;
  --pad-y:         160px;
  --gap-s:         24px;
  --gap-m:         64px;
  --gap-l:         128px;

  /* 动效 */
  --ease:          cubic-bezier(0.28, 0.11, 0.32, 1);
  --dur-in:        1s;
  --dur-transition:0.7s;
  --shift:         24px;
  --stagger:       0.08s;

  /* 材质 */
  --radius:        20px;
  --radius-lg:     28px;
  --blur:          blur(24px) saturate(180%);
  --shadow:        0 24px 64px rgba(0,0,0,0.4);
}

.num { font-variant-numeric: tabular-nums; font-feature-settings: "tnum"; }
```

## 验收补充

追加到 BRIEF §11：

- [ ] 全片强调色出现 ≤ 3 次 —— `grep -c '0071E3' index.html`
- [ ] 无任何字重 > 600 的标题 —— `grep -nE 'font-weight:\s*(7|8|9)00|bold' index.html` 应为空
- [ ] 所有缓动为同一条曲线 —— `grep -o 'ease:[^,}]*' index.html | sort -u` 应只有一行
- [ ] 无元素位移 > 40px —— 检查 timeline 里所有 `y:` / `x:` 值
- [ ] 静止时间占比 ≥ 30% —— 用 timeline 总动效时长 ÷ `data-duration` 反算
- [ ] 每屏元素 ≤ 3 个 —— snapshot 抽查
- [ ] 无纯白文字 —— `grep -nE '#fff|#FFFFFF|rgb\(255,\s*255,\s*255\)' index.html` 应为空
- [ ] 字体授权已确认可商用（不含 SF Pro / 苹方）
