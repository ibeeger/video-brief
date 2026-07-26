# video-brief skill 设计

日期：2026-07-26
状态：已批准（用户于 brainstorming 阶段确认全部设计节）

## 背景

`docs/VIDEO_BRIEF.template.md` 已经沉淀出一份高质量的视频需求规范，核心心法是「形容词不可执行，参数才可执行」。但它目前只是一份**劝告性文档**：没有任何机制强制 agent 在动手之前把形容词翻译成参数，也没有把「Apple 式克制」之外的风格沉淀成可复用预设。

本仓库 `.claude/skills/` 下已有 25 个 HyperFrames 官方 skill，覆盖「怎么做」（composition 契约、CLI、动效技法、媒体资源）。缺的是「怎么下单」那一层。

## 目标

创建 project skill `video-brief`，把模板的心法变成**带 gate 的强制流程**，并内置 4 个可执行风格预设。

**成功标志**：任何一次视频请求，在第一行 HTML 被写出来之前，BRIEF.md 已落盘且其中不存在未参数化的形容词。

**这不是什么**：不是 composition 契约文档、不是 CLI 手册、不是动效技法库。这三块归 `hyperframes-core` / `hyperframes-cli` / `hyperframes-animation`。

## 约束

- **命名空间隔离**：`.claude/skills/` 下 25 个 skill 全部由 `skills-lock.json` 从上游 `heygen-com/hyperframes` 管理。`video-blank` 不在 lock 中，也不得写入 lock，否则 `hyperframes skills` 升级会冲掉它。名字 `video-brief` 已确认不与上游任何 skill 冲突。
- **脚手架只出 HyperFrames**，与 `CLAUDE.md` 里「HyperFrames 是默认输出框架」一致。Remotion / Motion Canvas 不在范围内。
- **不写 home 目录**（沿用 CLAUDE.md 约束）。
- **不引外部 CDN**：脚手架的 GSAP 从项目内 `vendor/gsap.min.js` 引，与 `hyperframes-report` 现有做法一致。

## 文件结构

```
.claude/skills/video-brief/
  SKILL.md                          # 五道 gate + 路由 + 交棒 + rationalization 表 + red flags
  references/
    brief-blank.md                  # 可复制的空 BRIEF，未填处以 TBD 哨兵标记
    adjective-to-parameter.md       # 形容词 → 可执行参数 翻译表
    scaffold.md                     # BRIEF 场景表 → index.html 的映射规则与产物契约
    presets/
      apple-restraint.md            # 从模板附录整段收录
      data-journalism.md
      saas-dark.md
      vertical-feed.md
```

## 五道 gate

按顺序执行，每道 gate 的产物是下一道的输入。

| Gate | 职责 | 产物 | 约束形式 |
|---|---|---|---|
| 0 路由 | 判定是否该用本 skill | 用 / 转交 | 条件判断 |
| 1 BRIEF 完备 | 补齐 §1 目标、§2 受众、§3 规格、§5 场景表 | 无 TBD 的 BRIEF 草稿 | 结构性（模板里的 REQUIRED 槽位） |
| 2 形容词清零 | 每个形容词后必须跟括号参数 | BRIEF.md 落盘 | 禁令 + 借口表 + red flags |
| 3 预设锁定 | 选定 1 个预设，合并 tokens/禁止清单/验收补充进 §4 §11 | 完整 BRIEF.md | 条件判断（禁止混搭） |
| 4 脚手架 | 生成 HyperFrames 项目骨架 | 见下方产物契约 | 正向配方（输出形状） |
| 5 验收 | 逐条给证据 | 验收报告 | 证据契约 |

**约束形式的选择依据**（来自 `superpowers:writing-skills` 的 Match the Form to the Failure）：
Gate 2 是纪律型失败（agent 知道该参数化却在压力下跳过）→ 用禁令 + 借口表。
Gate 4 是形状型失败（会做但产物结构错）→ 用正向配方，不用禁令列表，因为禁令在竞争性激励下会被 agent 谈判掉。

## Gate 4 产物契约

生成的项目必须**恰好**包含以下内容，按顺序：

1. `<项目名>/index.html` —— 单文件 standalone composition，结构遵循 `hyperframes-core/references/minimal-composition.md`：根 `<div id="root">` 带 `data-composition-id` / `data-start="0"` / `data-width` / `data-height` / `data-duration` / `data-fps`；每个 BRIEF 场景一个 `<section class="clip">` 带 `data-start` / `data-duration` / `data-track-index`；`:root` 内嵌选定预设的 CSS tokens；一个 `gsap.timeline({paused:true})` 注册到 `window.__timelines["main"]`
2. `<项目名>/hyperframes.json` —— 复制 `hyperframes-report/hyperframes.json` 的结构
3. `<项目名>/vendor/gsap.min.js` —— 从 `hyperframes-report/vendor/` 复制
4. `<项目名>/assets/` —— 旁白音轨占位
5. 一次通过的 `hyperframes check` 输出

`data-duration` 与 `data-start` 直接由 BRIEF §5 场景表的时长列累加得出，不允许另行拍数字。

## 风格预设

每份预设含：适用/不适用、色彩表、字体（含许可与本机可用性）、版式、动效、转场、节奏、禁止清单、可直接粘的 `:root` tokens、验收补充。

| 预设 | 定位 | 标志性参数 |
|---|---|---|
| `apple-restraint` | 基准预设，从模板附录整段收录 | 真黑 `#000`、文字 0.92 白、单强调 `#0071E3`、字重上限 600、入场 0.8–1.2s、位移 ≤40px、crossfade 0.6–0.8s、静止 ≥30%、时长需 +40% |
| `data-journalism` | 数据驱动型首选 | `#0F1115` 底、强调 `#E4572E` ≤3 处、负值用灰 `#94A3B8` 不用红、`tabular-nums` 必开、图表按数据轴向生长、模糊叠化 0.4s |
| `saas-dark` | 产品发布 / UI 演示 | `#08090A` 底、渐变只用于光晕与描边（`#6E56CF→#3B82F6`）不铺文字底、毛玻璃 ≤2 处、scale 0.98→1 + power3.out 0.6s |
| `vertical-feed` | 静音刷流 / 短视频平台 | 1080×1920、下安全区 380px、标题 Heavy 96–140px、字幕焊死 64px 逐词高亮每行 ≤12 字、每 1.2–1.8s 一个信息点、**允许** `back.out(1.4)` |

`vertical-feed` 的「允许弹跳」与 `apple-restraint` 的「绝对禁止弹跳」正面冲突，这是 Gate 3 禁止混搭的具体理由，会在 SKILL.md 中点明作为反例。

## 字体现实校验

**设计阶段的假设被实测推翻，此处记录修正后的事实。**

原假设：`src: local()` 不可靠，一律优先项目内 `assets/fonts/*.woff2`。
实测（`hyperframes@0.7.71 check`）：HyperFrames 编译器有内置别名表 `FONT_ALIAS_MAP`，并会为表内或 Google Fonts 上存在的族名自动拉取字体、注入确定性 `@font-face`。所以字体分三类：

| 类别 | 例子 | 处理 |
|---|---|---|
| 编译器认识 | `Inter`、`JetBrains Mono`、`Noto Sans SC`、`Montserrat`、`Roboto` | 直接写族名，自动拉取（`Noto Sans SC` 实测拉到 9 个 face） |
| 编译器不认识 | `得意黑 / Smiley Sans`、`HarmonyOS Sans`、`Source Han Sans SC`、`PingFang SC` | 必须项目内自带 woff2，否则 `check` 报 `No deterministic font mapping` 且渲染出豆腐块 |
| 被别名重定向 | `SF Pro` → `inter`、`Menlo` → `jetbrains-mono` | 别写这些名字，直接写目标族名 |

因此四个预设的 `--font-cn` **不写** `'Source Han Sans SC'` fallback —— 它两边都不在，每次 `check` 都刷一条 WARN。这条已在初版写错，实测后修正。

附带记录两处现存风险：

1. `hyperframes-report/index.html` 用 `src: local("PingFang SC")`。苹方既不在别名表里（渲染机没装就出豆腐块），也无商用视频许可，仅适用于内部演示。
2. 编译器把字体缓存写到 `~/.cache/hyperframes/fonts/`，**违反 `CLAUDE.md` 里「不写 home 目录」的约束**。`HYPERFRAMES_SKIP_SKILLS=1` 只挡 skills 写入，挡不住字体缓存。要彻底不碰 home 就得全部字体项目内自带 woff2。

## 已验证项

Gate 4 的脚手架模板经实测，不是纸面推演：

| 验证 | 命令 | 结果 |
|---|---|---|
| 横屏骨架（1920×1080，apple-restraint tokens，2 场景 + timeline） | `hyperframes@0.7.71 check` | Lint / Runtime / Layout / Motion 全 0 error 0 warning；Contrast 3/3 过 WCAG AA；`Check passed` |
| 竖屏骨架（1080×1920，vertical-feed tokens + 安全区 stage + 字幕层） | `hyperframes@0.7.71 check` | 同上，Contrast 8/8 过 WCAG AA；`Check passed` |
| `Source Han Sans SC` fallback 的影响 | 同上 | 修正前刷 `No deterministic font mapping` WARN，去掉后零警告 |

测试项目建在会话 scratchpad，未落进仓库。

## 未验证项（诚实记录）

`superpowers:writing-skills` 的 Iron Law 要求先用 subagent 跑 baseline 压力测试（RED 阶段）观察 agent 在无 skill 时的真实违规与借口，再据此写 skill。**本次未执行该步骤**，因为本会话环境明确禁止主动调用 Agent 工具。

因此：
- SKILL.md 的 rationalization 表来自对模板与本仓库历史的推演，而非实测语料
- Gate 2 的禁令措辞未经 micro-test 对照无指导控制组验证
- 后续若观察到 agent 绕过某道 gate，应把它当次的原话补进借口表，而不是加更多措辞

## 附带改动

`CLAUDE.md` 常用命令区加一行指向本 skill，使新会话能发现它。
