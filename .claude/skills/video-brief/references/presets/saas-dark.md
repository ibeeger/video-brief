# 预设 · SaaS 科技深色

> 参照 Linear / Vercel / Raycast 的发布片。**深底 + 冷光晕 + 玻璃卡片 + 等宽小字。**

**核心原则：光是唯一的装饰。** 这套风格的层次全部由极低透明度的白与一层冷色光晕撑起，一旦加了实心色块就塌成普通深色网页。

## 适用 / 不适用

| 适用 | 不适用 |
|---|---|
| 产品发布、功能揭示、changelog | 数据密集的图表片（见 `data-journalism`） |
| UI 演示、开发者受众 | 竖屏刷流（见 `vertical-feed`） |
| 终端 / 代码 / API 相关内容 | 需要暖色情绪的品牌片 |

## 色彩

| 角色 | 值 | 说明 |
|---|---|---|
| 背景 | `#08090A` | 近黑但不是真黑，留一点空间给光晕 |
| 卡片 | `rgba(255,255,255,0.03)` | 靠透明度而非实色抬高 |
| 卡片（悬起） | `rgba(255,255,255,0.06)` | |
| 描边 | `rgba(255,255,255,0.08)` | 1px，所有卡片必须有 |
| 主文字 | `#EDEDED` | |
| 次文字 | `rgba(235,235,235,0.62)` | |
| 三级文字 | `rgba(235,235,235,0.38)` | 标签、时间戳 |
| 强调色 | `#6E56CF` | 紫 |
| 强调色 2 | `#3B82F6` | 蓝，**只与强调色组成渐变，不单独作为第二强调色** |
| 光晕 | `radial-gradient(60% 60% at 50% 0%, rgba(110,86,207,0.35), transparent 70%)` | 每屏最多一处 |

**渐变的唯一合法用途是光晕与描边。**

- ✅ 顶部 / 角落的 radial 光晕
- ✅ 卡片描边的 `linear-gradient` 走一遍（1px 发光边）
- ❌ 铺在文字底下当背景
- ❌ 填充按钮 / 卡片本体
- ❌ 全屏渐变背景

## 字体

> CSS 族名一律写 `'Noto Sans SC'`（即思源黑体）。**不要写 `'Source Han Sans SC'`** —— HyperFrames 编译器不认识它，`check` 会刷 `No deterministic font mapping` 警告。编译器认不认识某个族名、以及哪些必须项目内自带 woff2，见 `../scaffold.md`。

| 用途 | 首选 | 备选 |
|---|---|---|
| 西文 | **Inter**（SIL OFL） | Geist（Vercel 自家，OFL） |
| 中文 | **Noto Sans SC / 思源黑体** | HarmonyOS Sans |
| 代码 / 标签 / 版本号 | **JetBrains Mono** | Geist Mono |

```
标题     Inter SemiBold(600)
         字号 72–96px   行高 1.1   字距 -0.03em
副标题   Inter Regular(400)
         字号 32–36px   行高 1.4   字距 -0.01em
正文     Inter Regular(400)
         字号 26–28px   行高 1.55
代码/标签 JetBrains Mono Regular
         字号 20–24px   字距 0     常配 --text-tertiary
```

- 标题字重上限 600。这套风格里 Bold 标题读起来像后台管理系统
- 西文字距 -0.03em（比 `apple-restraint` 更紧一档）
- 中文不设负字距

## 版式

```
画布 1920×1080
左右安全边距   160px
上下安全边距   120px
栅格           8pt grid
圆角           12px（小元素 / 按钮 / 标签）· 16px（卡片 / 面板）
```

- 每屏 ≤3 个元素（标题 + 副标题 + 一个卡片 / 一张 UI 截图）
- UI 截图 / mock 面板居中或靠右，文字靠左
- 卡片必须有 1px 描边，否则在近黑底上会浮不起来

## 动效

```
缓动        power3.out          全片统一
入场时长    0.6s
位移距离    translateY(32px) → 0
缩放        0.98 → 1            上限 1
stagger     0.06s
光晕        随场景切换缓慢移动，8s 走完一屏（唯一允许的慢速持续运动）
```

UI 演示里的光标：走 `oversized-cursor` skill，不要自己画。点击要有一次 tap 动作，并用它引出下一个 beat。

## 转场

```
类型    穿越缩放（zoom-through）或 模糊叠化，二选一，全片统一
时长    0.5s
```

选了穿越缩放就全片穿越缩放，Z 轴符号规则见 `cut-the-curve`。台底必须不透明（`body { background: #000 }`），否则接缝处会白闪 —— 见 `seam-craft`。

## 节奏

```
单场景停留      3–5 秒
UI 演示场景     5–8 秒（要留出光标移动与点击的时间）
读字时间        标题入场完成后静止 ≥1 秒
功能列举        每项 1.5–2 秒，stagger 0.06s 连续出
```

## 材质

```
毛玻璃    backdrop-filter: blur(20px) saturate(160%)
          background: rgba(255,255,255,0.03)
边框      1px solid rgba(255,255,255,0.08)
圆角      12px / 16px
阴影      0 20px 60px rgba(0,0,0,0.55)
```

全片毛玻璃元素 ≤2 个。

## 禁止清单

粘贴到 BRIEF §10：

- ❌ 渐变铺在文字底下、填充卡片本体、做全屏背景
- ❌ 超过一处光晕同屏
- ❌ 第二个独立强调色（`#3B82F6` 只能与 `#6E56CF` 组渐变）
- ❌ 实心彩色大色块
- ❌ 无描边的卡片
- ❌ Bold 以上字重的标题
- ❌ 光效扫光、粒子、装饰性几何图形
- ❌ 弹跳缓动、旋转、3D 翻转（光晕的缓慢移动除外）
- ❌ emoji
- ❌ 混用两种转场类型
- ❌ 自绘光标（用 `oversized-cursor`）
- ❌ 真实截图里的可识别个人信息未打码

## CSS Tokens

```css
:root {
  /* 色彩 */
  --bg:            #08090A;
  --bg-elevated:   rgba(255,255,255,0.03);
  --bg-hover:      rgba(255,255,255,0.06);
  --hairline:      rgba(255,255,255,0.08);
  --text-primary:  #EDEDED;
  --text-secondary:rgba(235,235,235,0.62);
  --text-tertiary: rgba(235,235,235,0.38);
  --accent:        #6E56CF;
  --accent-2:      #3B82F6;
  --glow:          radial-gradient(60% 60% at 50% 0%, rgba(110,86,207,0.35), transparent 70%);
  --edge-glow:     linear-gradient(120deg, rgba(110,86,207,0.6), rgba(59,130,246,0.25), transparent);

  /* 字体 */
  --font-latin:    'Inter', system-ui, sans-serif;
  --font-cn:       'Noto Sans SC', sans-serif;
  --font-mono:     'JetBrains Mono', monospace;

  /* 排版 */
  --title-size:    84px;
  --title-weight:  600;
  --title-lh:      1.1;
  --title-ls:      -0.03em;
  --sub-size:      34px;
  --body-size:     28px;
  --body-lh:       1.55;
  --mono-size:     22px;

  /* 间距 */
  --pad-x:         160px;
  --pad-y:         120px;
  --gap-s:         16px;
  --gap-m:         48px;
  --gap-l:         96px;

  /* 动效 */
  --ease:          power3.out;
  --dur-in:        0.6s;
  --dur-transition:0.5s;
  --shift:         32px;
  --scale-from:    0.98;
  --stagger:       0.06s;

  /* 材质 */
  --radius:        12px;
  --radius-lg:     16px;
  --blur:          blur(20px) saturate(160%);
  --shadow:        0 20px 60px rgba(0,0,0,0.55);
}

.num { font-variant-numeric: tabular-nums; font-feature-settings: "tnum"; }
```

## 验收补充

追加到 BRIEF §11：

- [ ] 无渐变作为文字背景或卡片填充 —— `grep -n 'gradient' index.html` 逐条核，只应出现在 `--glow` / `--edge-glow` 的使用处
- [ ] 每屏光晕 ≤1 处 —— snapshot 抽查每个场景
- [ ] 所有卡片有 1px 描边 —— `grep -c 'hairline' index.html` ≥ 卡片数
- [ ] 无字重 > 600 的标题 —— `grep -nE 'font-weight:\s*(7|8|9)00|bold' index.html` 应为空
- [ ] 全片只有一种转场类型 —— 人工核 timeline
- [ ] 毛玻璃元素 ≤2 个 —— `grep -c 'backdrop-filter' index.html`
- [ ] 台底不透明，接缝无白闪 —— `grep -n 'body' index.html` 确认 `background: #000`；snapshot 抽查转场中间帧
- [ ] 所有缓动为 `power3.out` —— `grep -o 'ease:[^,}]*' index.html | sort -u`
- [ ] 截图里无可识别个人信息 —— snapshot 逐帧看
