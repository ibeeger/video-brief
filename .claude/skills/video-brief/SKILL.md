---
name: video-brief
description: >
  Use when a video request must become an executable spec before any production
  starts — a topic or one-liner ("帮我做个视频"、"做条介绍片"), adjective-only
  direction ("现代简约风"、"高级感"、"节奏明快"、"有冲击力"), an existing
  BRIEF.md to execute ("按 BRIEF.md 制作"), a request to choose or lock a visual
  style preset, or a new HyperFrames project to scaffold from a scene list. Not
  for rendering, CLI flags, animation technique, or debugging an existing
  composition — those go to the hyperframes-* skills.
---

# Video Brief

**形容词不可执行，参数才可执行。**

agent 无法把「高级感」翻译成 CSS，只能翻译成训练数据里最平庸的那一版。本 skill 的唯一职责：**在第一行 HTML 被写出来之前**，把需求里所有形容词换成数值、颜色码或明确动作，并落盘成 BRIEF.md。

## 职责边界

| 本 skill 管 | 交给谁 |
|---|---|
| 需求 → 可执行 BRIEF.md | — |
| 风格预设（色板 / 字体 / 动效 / 转场 / 节奏参数） | — |
| BRIEF → HyperFrames 项目骨架 | — |
| composition 契约、`data-*` 语义 | `hyperframes-core` |
| 渲染、check、snapshot、CLI | `hyperframes-cli` |
| 具体动效怎么写、GSAP API、转场技法 | `hyperframes-animation`、`motion-doctrine`、`cut-the-curve` |
| 配乐 / 音效 / 图片 / TTS 素材落地 | `media-use` |
| UI 演示的光标 | `oversized-cursor` |
| 字幕 | `embedded-captions`、`captions-overlay` |

## References

| 文件 | 什么时候读 |
|---|---|
| `references/brief-blank.md` | Gate 1：复制成项目根目录的 `BRIEF.md` 开始填 |
| `references/adjective-to-parameter.md` | Gate 2：把形容词翻译成参数 |
| `references/presets/*.md` | Gate 3：锁定风格，取 tokens / 禁止清单 / 验收补充 |
| `references/scaffold.md` | Gate 4：BRIEF 场景表 → index.html 的映射规则与产物契约 |

## 五道 gate

按顺序走。每道 gate 的产物是下一道的输入，**不允许跳跃或并行**。

### Gate 0 — 路由

用本 skill：需求还是模糊的、要定风格、要把 BRIEF 变成项目、要从零开一支片子。

不用本 skill，直接转交：问怎么渲染、问某个 `data-*` 什么意思、问 GSAP 怎么写、已有 composition 出了 bug、只要加字幕。

### Gate 1 — BRIEF 完备

复制 `references/brief-blank.md` 到项目根目录 `BRIEF.md`。未填处保留 `TBD` 哨兵。

四项**必须**从用户处拿到，不允许自行编造：

| 项 | 为什么不能替用户决定 |
|---|---|
| §1 产出目标 | **只允许一个**。两个以上 agent 会两个都做不好 |
| §2 受众 · 观看场景 | 「静音刷流」直接决定字幕是不是必需、信息能不能只靠配音承载 |
| §3 规格 · 时长与画幅 | 时长决定场景数上限；画幅决定安全区，改不动 |
| §5 场景清单 | 每场的时长直接变成 `data-duration`，缺一格就没法搭骨架 |

其余各节你可以给默认值，但**必须在 BRIEF 里标注是你补的**，不能沉默地替用户决定。

一次只问一个问题。问完 grep 一遍 `TBD`，还有残留就继续问。

### Gate 2 — 形容词清零

**凡是 BRIEF 里写下的形容词，后面都要跟一个括号，把它翻译成数值、颜色码或明确的动作。**

查 `references/adjective-to-parameter.md` 就地翻译。查不到、或翻译存在多种合理读法的，回问用户，**不要挑一种默默写下去**。

违反字面就是违反精神。「读者能看懂」不是理由 —— 这一步的产出对象是渲染器，不是读者。

**在 Gate 2 通过之前，不允许写任何 CSS、HTML 或 tokens。** 已经写了的，删掉重来：不要留着当参考，不要边补 BRIEF 边改它。

通过标准：`BRIEF.md` 已落盘，全文 grep 不到 `TBD`，且每一处形容词后面都有括号参数。

### Gate 3 — 预设锁定

选**恰好一个**预设：

| 预设 | 选它的场合 |
|---|---|
| `apple-restraint` | 品牌片、产品叙事、要「贵」。基准预设，不确定时选它 |
| `data-journalism` | 数据驱动、图表是主角、要可信 |
| `saas-dark` | 产品发布、UI 演示、开发者受众 |
| `vertical-feed` | 9:16、静音刷流、短视频平台 |

或明示「自定义」—— 那就自己把预设该有的九节（色彩 / 字体 / 版式 / 动效 / 转场 / 节奏 / 禁止清单 / tokens / 验收补充）全部填齐，缺一节不算。

**禁止混搭两个预设。** 它们的禁止清单是互斥的：`apple-restraint` 绝对禁止弹跳缓动，`vertical-feed` 恰恰要 `back.out(1.4)`；`apple-restraint` 禁纯白文字，`vertical-feed` 要纯白。各取一半的结果是两种风格都不成立。想改某个参数，就在锁定的那个预设里改一条并写进 BRIEF §4，不要去另一个预设里取。

产物：预设的 tokens 合并进 BRIEF §4，禁止清单与验收补充合并进 §10 §11。

### Gate 4 — 脚手架

按 `references/scaffold.md` 生成项目。产物**恰好**是这五项，按顺序：

1. `<项目名>/index.html` —— 单文件 standalone composition，`:root` 内嵌锁定预设的 tokens，每个 BRIEF 场景一个 `<section class="clip">`
2. `<项目名>/hyperframes.json`
3. `<项目名>/vendor/gsap.min.js` —— 从 `hyperframes-report/vendor/` 复制，禁止引外部 CDN
4. `<项目名>/assets/` —— 旁白音轨占位
5. 一次通过的 `hyperframes check` 输出

`data-start` 与 `data-duration` 由 BRIEF §5 时长列累加得出。不许另行拍数字。

骨架里每个 clip 只放静态版式与占位文案，动效留给 `hyperframes-animation`。`check` 不过就修到过，再交棒。

### Gate 5 — 验收

跑 BRIEF §11 清单 + 锁定预设的验收补充。**每一条后面必须跟证据来源**：

| 验收项 | 证据 |
|---|---|
| 结构合法、无溢出出框 | `hyperframes check` 输出 |
| 时长在 N±1 秒内 | `ffprobe -show_entries format=duration` |
| `pix_fmt` 为 `yuv420p` | `ffprobe -show_entries stream=pix_fmt` |
| 中文无豆腐块 | `hyperframes snapshot` 抽查帧，肉眼看 |
| 关键时间点画面正确 | `hyperframes snapshot` 于 BRIEF 指定的时间点 |
| 强调色出现次数、字重上限、缓动一致 | grep index.html |

没跑就没通过。不许在没有输出可贴的情况下说「验收通过」。有条目没过，说清是哪条、为什么，不要含混地报完成。

## 常见借口

| 借口 | 事实 |
|---|---|
| 「这个形容词大家都懂」 | 你懂 ≠ 渲染出来一致。「简约」有二十种画法，agent 会挑最平庸那种 |
| 「先做出来再调」 | 调不动。色板和字重定错，返工是重写而不是改参数 |
| 「参数太多会限制创意」 | 参数限制的是平庸，不是创意。留白量、缓动曲线本身就是创意决策 |
| 「用户没说，我按经验默认」 | 可以给默认值，但必须写进 BRIEF 并标注是你补的 |
| 「场景表还没定，先把骨架搭起来」 | 骨架的 `data-duration` 直接来自场景表。没有场景表的骨架 = 重搭 |
| 「两个预设各取优点更好看」 | 它们的禁止清单互斥。各取一半 = 两种风格都不成立 |
| 「BRIEF 太重，这次是小改动」 | 小改动用 `brief-blank.md` 末尾的精简版，仍然要落盘 |
| 「check 大概能过」 | 大概不算。跑一次，贴输出 |

## Red flags — 停下

- 已经在写 CSS 或 HTML，但 `BRIEF.md` 还没落盘
- `BRIEF.md` 里 grep 得到 `TBD`
- BRIEF 里还有没跟括号参数的形容词
- §5 场景表有空格，或某场没有时长
- §1 目标写了两条以上
- 同时引用了两个预设的 tokens
- 说「验收通过」但没有可贴的命令输出
- 场景骨架的 `data-duration` 与场景表对不上

**以上任何一条出现：退回对应的 gate 重走，不要往下推进。**
