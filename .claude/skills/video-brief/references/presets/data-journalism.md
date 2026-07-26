# 预设 · 数据新闻式

> 参照 Bloomberg / 财新 / FT 的图表视频。**图表是主角，字卡是注解。**

**核心原则：可信度来自节制。** 数据片一旦开始用红绿、3D、彩虹配色，观众读到的是情绪而不是数字。

## 适用 / 不适用

| 适用 | 不适用 |
|---|---|
| 数据驱动、图表是主角 | 无数据的品牌片（见 `apple-restraint`） |
| 行业分析、财报解读、趋势对比 | 产品 UI 演示（见 `saas-dark`） |
| 要「可信」「客观」的场合 | 需要煽动情绪的营销片 |

## 色彩

| 角色 | 值 | 说明 |
|---|---|---|
| 背景 | `#0F1115` | 深灰蓝，比真黑更适合承载图表网格线 |
| 卡片 / 分区 | `#171A20` | |
| 主文字 | `#F5F5F5` | |
| 次文字 | `rgba(245,245,245,0.55)` | 轴标签、单位、脚注 |
| 三级文字 | `rgba(245,245,245,0.32)` | 数据来源标注 |
| 强调色 | `#E4572E` | **仅用于关键数字与主序列**，全片 ≤3 处 |
| 正向值 | `#4ADE80` | 仅在明确表达增长时用 |
| 负向值 | `#94A3B8` | **用中性灰，不用红。** 红色让观众读成「坏」，那是编辑立场不是数据 |
| 网格线 | `rgba(245,245,245,0.08)` | |
| 坐标轴 | `rgba(245,245,245,0.28)` | |

- 强调色只标注结论数字，不用来上色整张图表
- 多序列对比时，非主序列全部用灰阶（`0.55` / `0.32`），只有主序列上强调色
- 禁止彩虹配色、禁止渐变填充柱体

## 字体

> CSS 族名一律写 `'Noto Sans SC'`（即思源黑体）。**不要写 `'Source Han Sans SC'`** —— HyperFrames 编译器不认识它，`check` 会刷 `No deterministic font mapping` 警告。编译器认不认识某个族名、以及哪些必须项目内自带 woff2，见 `../scaffold.md`。

| 用途 | 首选 | 备选 |
|---|---|---|
| 中文标题 / 正文 | **Noto Sans SC / 思源黑体**（SIL OFL） | HarmonyOS Sans |
| 西文 | Inter | Roboto |
| 数字 | **JetBrains Mono**，`tabular-nums` 必开 | Inter 的 tabular 变体 |

```
标题     思源黑体 Bold(700)
         字号 72–96px   行高 1.15   字距 -0.02em（中文不设负字距）
要点     思源黑体 Medium(500)
         字号 36px      行高 1.4
正文/轴  思源黑体 Regular(400)
         字号 28–32px   行高 1.5
关键数字 JetBrains Mono Bold
         字号 120–180px  tabular-nums 必开
单位/脚注 思源黑体 Regular  字号 22–24px
```

**数字必须等宽。** count-up 动效下非等宽数字会左右抖动，这是数据视频最刺眼的瑕疵。

## 版式

```
画布 1920×1080
左右安全边距   120px
上下安全边距   96px
栅格           8pt grid
图表区         占画面 55–70%，靠右或居中；标题与要点靠左
```

- 每屏最多 1 标题 + 3 要点
- 图表与文字不重叠，各占独立分区
- **每张图必须带来源标注**（22px 三级文字，右下角）
- 全片左对齐

## 动效

```
缓动        power2.out          全片统一
入场时长    0.5s
位移距离    translateY(40px) → 0
stagger     0.08s
数字 count-up  0.8–1.2s，与图表生长同起
```

**图表必须按数据的物理轴向生长：**

| 图表类型 | 生长方式 |
|---|---|
| 柱状图 | 从基线向上长（`scaleY` 或 `height`，`transform-origin: bottom`） |
| 折线图 | 从左向右画（`stroke-dashoffset`） |
| 面积图 | 先画线，线到位后再淡入填充 |
| 散点 | 按数据顺序 stagger 淡入，不要随机 |
| 饼 / 环 | 从 12 点顺时针扫（类别 ≤5 个才允许用） |

从中心放大、从四周飞入、随机顺序出现都是错的 —— 它们暗示了数据里不存在的方向。

## 转场

```
类型    CSS 模糊叠化（blur + opacity 交叉）
时长    0.4s
```

全片统一。图表之间切换时保留坐标轴不动、只换数据序列，比整屏转场更清晰。

## 节奏

```
单场景停留      3–5 秒（图表复杂的可到 8 秒）
关键数字        单独占一屏，停留 ≥3 秒
读图时间        图表入场完成后静止 ≥1.5 秒，让观众读完
结论前置        场景 1 给结论数字，中段论证
```

## 禁止清单

粘贴到 BRIEF §10：

- ❌ 双 Y 轴（几乎总是在误导，改用两张图或指数化）
- ❌ Y 轴不从 0 起（柱状图绝对不行；折线图可以但必须在轴上标明截断）
- ❌ 3D 图表、立体柱、透视
- ❌ 饼图类别超过 5 个
- ❌ 彩虹 / 渐变配色，渐变填充柱体
- ❌ 负值用红色
- ❌ 无来源标注的图表
- ❌ 缺失数据插值成连续曲线（留空，不要连）
- ❌ 非等宽数字做 count-up
- ❌ 弹跳缓动、旋转
- ❌ 「震惊」「碾压」「暴涨」类煽动措辞

## CSS Tokens

```css
:root {
  /* 色彩 */
  --bg:            #0F1115;
  --bg-elevated:   #171A20;
  --text-primary:  #F5F5F5;
  --text-secondary:rgba(245,245,245,0.55);
  --text-tertiary: rgba(245,245,245,0.32);
  --accent:        #E4572E;
  --pos:           #4ADE80;
  --neg:           #94A3B8;
  --grid:          rgba(245,245,245,0.08);
  --axis:          rgba(245,245,245,0.28);

  /* 字体 */
  --font-cn:       'Noto Sans SC', sans-serif;
  --font-latin:    'Inter', system-ui, sans-serif;
  --font-mono:     'JetBrains Mono', monospace;

  /* 排版 */
  --title-size:    80px;
  --title-weight:  700;
  --title-lh:      1.15;
  --point-size:    36px;
  --body-size:     30px;
  --body-lh:       1.5;
  --num-size:      148px;
  --unit-size:     24px;

  /* 间距 */
  --pad-x:         120px;
  --pad-y:         96px;
  --gap-s:         16px;
  --gap-m:         48px;
  --gap-l:         96px;

  /* 动效 */
  --ease:          power2.out;
  --dur-in:        0.5s;
  --dur-count:     1s;
  --dur-transition:0.4s;
  --shift:         40px;
  --stagger:       0.08s;

  /* 图表 */
  --bar-radius:    4px;
  --line-width:    4px;
  --dot-size:      10px;
}

.num { font-variant-numeric: tabular-nums; font-feature-settings: "tnum"; }
```

## 验收补充

追加到 BRIEF §11：

- [ ] 强调色出现 ≤ 3 处 —— `grep -c 'E4572E' index.html`
- [ ] 所有数字元素带 `.num` 或 `tabular-nums` —— `grep -n 'num-size\|tabular' index.html`
- [ ] 无双 Y 轴、无 3D 图表 —— 人工核
- [ ] 柱状图 Y 轴从 0 起；折线图若截断，轴上已标明 —— snapshot 抽查
- [ ] 每张图表有来源标注 —— `grep -c '来源' index.html` ≥ 图表数
- [ ] 负值未使用红色 —— `grep -nE '#(e|E)[0-9a-fA-F]{2}[0-4]' 检查负值样式`
- [ ] 图表生长方向与数据轴向一致 —— snapshot 抽查入场中间帧
- [ ] 数据与源文件逐项核对（BRIEF §9 列出的字段全部对过）
- [ ] 无煽动措辞 —— `grep -nE '震惊|碾压|暴涨|颠覆' index.html` 应为空
