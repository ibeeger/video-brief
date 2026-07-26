# 预设 · 竖屏信息流

> 参照抖音 / 视频号 / Reels / Shorts 的信息流内容。**静音、竖屏、三秒定生死。**

**核心原则：这套风格的所有参数都是为「被划走」这个前提设计的。** 它与 `apple-restraint` 在几乎每条上都相反 —— 那里禁弹跳、禁纯白、禁硬切，这里全部要。这不是妥协，是不同的物理环境：6 英寸屏、外放静音、手指悬在屏幕上。

## 适用 / 不适用

| 适用 | 不适用 |
|---|---|
| 9:16 短视频平台 | 桌面横屏播放 |
| 静音刷流场景 | 品牌形象片（见 `apple-restraint`） |
| 单点知识、观点输出、清单类 | 需要细读的图表（小屏读不了，见 `data-journalism`） |

## 规格（本预设强制）

```
分辨率   1080 × 1920
帧率     30fps
时长     15–60 秒（超过 60 秒必须有强钩子撑住）
```

## 安全区（最重要的一节）

平台 UI 会盖住画面边缘。**下方是重灾区** —— 头像、文案、话题、音乐条、点赞栏全在那里。

```
上安全区   220px    （避开状态栏与顶部 tab）
下安全区   380px    （避开文案区、话题、音乐条、右侧交互栏）
左右安全区  72px
右侧额外    140px   （右侧交互栏的宽度，重要元素不要放在右侧这一条内）
```

字幕焊死在**下安全区上沿**，不要更低。核心信息全部落在 `y: 220 – 1540` 这个区间内。

## 色彩

| 角色 | 值 | 说明 |
|---|---|---|
| 背景 | `#101014` | 或全出血画面 + 遮罩 |
| 画面遮罩 | `rgba(0,0,0,0.35)` | 铺在背景图/视频上，保证文字对比度 |
| 主文字 | `#FFFFFF` | **这里用纯白。** 小屏 + 外部光照 + 静音刷流，需要最大对比度 |
| 次文字 | `rgba(255,255,255,0.72)` | 竖屏不用 0.56，太淡在户外看不清 |
| 强调色 | `#FFE04D` | 黄，小屏上最跳眼且不刺 |
| 强调底板 | `#FFE04D` + 文字 `#101014` | 关键词用色块反白，比改字色更醒目 |
| 字幕底板 | `rgba(0,0,0,0.55)` | |

- 强调色不限制出现次数（与其他预设相反）—— 刷流场景需要持续的视觉锚点
- 但同屏只能有一个强调元素

## 字体

> CSS 族名一律写 `'Noto Sans SC'`（即思源黑体）。**不要写 `'Source Han Sans SC'`** —— HyperFrames 编译器不认识它，`check` 会刷 `No deterministic font mapping` 警告。编译器认不认识某个族名、以及哪些必须项目内自带 woff2，见 `../scaffold.md`。

| 用途 | 首选 | 备选 |
|---|---|---|
| 中文标题 | **得意黑**（免费商用，标题专用） | Noto Sans SC Black(900) |
| 中文正文 / 字幕 | **Noto Sans SC** Bold(700) | HarmonyOS Sans Bold |
| 数字 | Noto Sans SC Black 或 JetBrains Mono ExtraBold | |

```
主标题   得意黑 / 思源黑体 Black(900)
         字号 112px（区间 96–140）  行高 1.12  居中  最多 2 行
副标题   思源黑体 Bold(700)
         字号 56px   行高 1.3
字幕     思源黑体 Bold(700)
         字号 64px   描边 4px #000  底板 rgba(0,0,0,0.55) 圆角 12px
         每行 ≤12 字  逐词高亮
序号/标签 思源黑体 Black(900)  字号 72px  强调色
```

**字号下限 40px。** 竖屏画布 1080 宽，小于 40px 的字在手机上等于不存在。

## 版式

```
画布 1080×1920
标题位置   垂直 1/3 处（y ≈ 640），居中
主体位置   垂直居中（y ≈ 960）
字幕位置   下安全区上沿（y ≈ 1540 基线）
每屏元素   ≤3 个
每屏文字   ≤20 字（不含字幕）
```

## 动效

**这里允许弹跳，而且需要。**

```
缓动        back.out(1.4)       主元素入场
            power2.out          次要元素
入场时长    0.3–0.4s
位移距离    translateY(60px) → 0
缩放        0.85 → 1            （可以更夸张，上限 1.1 的 overshoot 也允许）
stagger     0.05s
```

关键词强调：底板从左向右 `scaleX(0→1)` 刷出，0.25s，`transform-origin: left`。

## 转场

```
类型    硬切为主；节点处 0.15s 白闪
时长    硬切 0 秒 / 白闪 0.15s
```

不要交叉淡化 —— 淡化在刷流场景里读作「卡了」。

## 节奏

```
首 1.5 秒       必须给出结论或冲突。不要自我介绍，不要片头 logo
信息点密度      每 1.2–1.8 秒一个
单场景停留      1.5–2.5 秒
纯静止上限      2 秒（超过 2 秒不动，观众就划走了）
结尾            必须有 CTA，占 2–3 秒
```

节奏上的直接后果：**同样的信息量，这套风格需要的时长比 `apple-restraint` 少 40% 以上。** 但信息点数量要多一倍。

## 字幕（本预设强制必需）

静音刷流意味着**全部信息必须靠字幕和画面独立成立**，配音只是加成。

```
样式     64px 思源黑体 Bold · 4px #000 描边 · rgba(0,0,0,0.55) 圆角底板
位置     下安全区上沿，居中
分行     每行 ≤12 字，最多 2 行
呈现     逐词高亮（当前词用强调色 #FFE04D）
生成     tts 出音频 → transcribe 取 word-level 时间戳
```

具体实现走 `embedded-captions` / `captions-overlay`。

## 禁止清单

粘贴到 BRIEF §10：

- ❌ 字号 < 40px
- ❌ 重要元素落在下安全区（底部 380px）或右侧交互栏（右侧 140px）内
- ❌ 无字幕
- ❌ 字幕每行超过 12 字
- ❌ 纯静止超过 2 秒
- ❌ 交叉淡化转场
- ❌ 片头 logo / 自我介绍占用首 1.5 秒
- ❌ 结尾没有 CTA
- ❌ 单屏文字超过 20 字（不含字幕）
- ❌ 同屏多个强调元素
- ❌ 横向长句（竖屏宽度放不下，会被迫缩小字号）
- ❌ 需要细读的密集图表

## CSS Tokens

```css
:root {
  /* 画布 */
  --canvas-w:      1080px;
  --canvas-h:      1920px;

  /* 安全区 */
  --safe-top:      220px;
  --safe-bottom:   380px;
  --safe-x:        72px;
  --safe-right-ui: 140px;

  /* 色彩 */
  --bg:            #101014;
  --scrim:         rgba(0,0,0,0.35);
  --text-primary:  #FFFFFF;
  --text-secondary:rgba(255,255,255,0.72);
  --accent:        #FFE04D;
  --accent-ink:    #101014;
  --caption-plate: rgba(0,0,0,0.55);

  /* 字体 */
  --font-display:  'Smiley Sans', 'Noto Sans SC', sans-serif;  /* 得意黑 */
  --font-cn:       'Noto Sans SC', sans-serif;
  --font-mono:     'JetBrains Mono', monospace;

  /* 排版 */
  --title-size:    112px;
  --title-weight:  900;
  --title-lh:      1.12;
  --sub-size:      56px;
  --body-size:     44px;
  --label-size:    72px;
  --caption-size:  64px;
  --caption-stroke:4px;
  --caption-radius:12px;

  /* 间距 */
  --gap-s:         16px;
  --gap-m:         40px;
  --gap-l:         80px;

  /* 动效 */
  --ease:          back.out(1.4);
  --ease-sub:      power2.out;
  --dur-in:        0.35s;
  --shift:         60px;
  --scale-from:    0.85;
  --stagger:       0.05s;

  /* 节奏 */
  --beat:          1.5s;   /* 每个信息点 */
  --flash:         0.15s;  /* 白闪转场 */
}

.num { font-variant-numeric: tabular-nums; font-feature-settings: "tnum"; }
```

## 验收补充

追加到 BRIEF §11：

- [ ] 分辨率为 1080×1920 —— `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 <out>.mp4`
- [ ] 无字号 < 40px —— `grep -oE 'font-size:\s*[0-9]+px' index.html | sort -u -t: -k2 -n | head`
- [ ] 核心信息全部在 `y: 220–1540` 内 —— snapshot 每个场景，叠安全区参考线看
- [ ] 右侧 140px 内无重要元素 —— snapshot 抽查
- [ ] 字幕存在且每行 ≤12 字 —— 人工核字幕源
- [ ] 首 1.5 秒已给出结论或冲突 —— `hyperframes snapshot` 于 0.0s / 0.7s / 1.4s
- [ ] 无纯静止超过 2 秒 —— 核 timeline 相邻动效间隔
- [ ] 结尾有 CTA —— snapshot 于末尾 2 秒
- [ ] 无交叉淡化转场 —— 核 timeline
- [ ] 中文无豆腐块（得意黑需项目内自带 woff2）—— snapshot 抽查标题帧
