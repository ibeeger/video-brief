# 报告讲解视频 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 HyperFrames 制作一支 120s 的「数据故事线」视频讲解 docs/report.md，产出 output/report-video.mp4。

**Architecture:** 独立子项目 `hyperframes-report/`（不动现有 `hyperframes/`），内容唯一依据 `docs/storyboard-report.md`；旁白复用 edge-tts 管线模式（新脚本+新音轨）；GSAP 本地 vendor；图表遵循 dataviz 规范。

**Tech Stack:** HyperFrames 0.7.71（HTML+GSAP 3.14.2 本地 vendor）、edge-tts（项目 .venv）、FFmpeg 7。

## Global Constraints

- 规格：1920×1080 · 30fps · 120s（3600 帧）· 含 aac 旁白音轨；ffprobe 时长 119–120.5s。
- 场景边界（秒）：0 / 10 / 24 / 48 / 66 / 90 / 106 / 120。
- 一切数字与结论必须与 docs/report.md 逐值一致，禁止新造。
- 视觉 tokens 与既有实现一致：--bg #0B0D12 / --panel #141926 / --text #F2F4F8 / --muted #8B93A7 / --remotion #3B82F6 / --hyperframes #F97316 / --motioncanvas #10B981；"PingFang SC"（显式 @font-face local()）；缓动 power3.out；左右安全边距 160px。
- HyperFrames 命令一律带 `HYPERFRAMES_SKIP_SKILLS=1` 与项目内 `npm_config_cache`（不写 home 目录）；淡出显式 hard-kill（`tl.set(...,{opacity:0},<边界>)`）。
- 旁白音色 `zh-CN-YunjianNeural`；超窗先 `--rate`（≤+20%）后精简话术并同步 storyboard-report。
- commit 中文 message，结尾 Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>。

---

### Task 1: docs/storyboard-report.md（唯一内容依据）

**Files:**
- Create: `docs/storyboard-report.md`

**Interfaces:**
- Produces: 全部文案/旁白/图表数据/时间轴。后续任务逐字引用，不得改写。

- [ ] **Step 1: 写入 storyboard-report.md（以下为完整内容，原样写入）**

````markdown
# 报告讲解视频 分镜脚本（唯一依据）

规格：1920×1080 · 30fps · 120s（3600 帧）。数据与 docs/report.md 逐值一致。
tokens 沿用 docs/storyboard.md（色板/字体/边距/卡片样式）；缓动 power3.out；场景末 0.4s 内部淡出。

## 场景

### S1 开场 0–10s
- 0.5–1.5s 顶部细线展开（同 30s 片 S1 样式）
- 0.8–2.0s 主标题「一份全实测的三框架对比报告」（64px）上移 24px 淡入
- 2.4–4.2s 三框架名 Remotion / HyperFrames / Motion Canvas 品牌色横排，间隔 0.3s 依次淡入
- 4.8–6.5s 副题（28px 次级色）「同一支 30 秒视频 · 三种实现 · 全部实测」淡入
- 9.6–10.0s 整屏淡出

### S2 实验设定 10–24s
- +0.3–0.8s 章节题「实验设定」（48px）左侧滑入；左上角序号 01
- +1.0s 起三张规格卡（500×180，同 30s 片卡片样式）依次上浮，间隔 0.4s：
  - 卡1 同一份分镜 —— docs/storyboard.md 逐字一致
  - 卡2 同一段旁白 —— assets/voiceover.mp3 共用音轨
  - 卡3 同一台机器 —— macOS · Chrome · FFmpeg
- +8.0s 底部一行强调（26px）「唯一的变量：框架本身」淡入
- +13.6–14.0s 整屏淡出

### S3 渲染性能 24–48s（两拍）
拍A 24–36s 渲染耗时条形图：
- +0.3s 章节题「渲染性能 · 实测 3×3」；序号 02
- +0.8s 起三根水平条依次生长（间隔 0.35s，各 0.8s），品牌色，右端数值标签：
  - Remotion 14.06s（±0.27）
  - HyperFrames 21.34s（±0.19）
  - Motion Canvas 22.79s（±0.02）
- 条长映射：值/24 × 1200px（Remotion 703px / HyperFrames 1067px / Motion Canvas 1140px）
- +11.6–12.0s 拍A 内容淡出
拍B 36–48s 产物体积：
- +0.3s 小标题「产物体积」
- +0.8s 三根条（值/2.5 × 1200px）：2.33 MB / 2.50 MB / 0.76 MB
- +6.5s 注脚（22px 次级色）「Motion Canvas 码率 211k vs 620k/666k——编码差异，非画质缩水」
- +11.6–12.0s 整屏淡出

### S4 代码量 48–66s
- +0.3s 章节题「代码量」；序号 03
- +0.8s 三根水平条（值/750 × 1200px）：Remotion 425 行 / HyperFrames 530 行 / Motion Canvas 731 行
- +4.5s Motion Canvas 条内分段高亮：507 行场景代码 + 224 行自建渲染脚本（斜纹/亮色区分），
  右侧标注「224 行 = 无 headless CLI 的代价」
- +17.6–18.0s 整屏淡出

### S5 踩坑精选 66–90s
- +0.3s 章节题「踩坑各有代表作」；序号 04
- +0.8s 起三列卡片（品牌色顶边，440×360）依次翻入，间隔 0.5s：
  - Remotion：「TypeScript 7 不兼容」 esbuild-loader 报错 → 降级 5.9 解决
  - HyperFrames：「check 五类静态闸门」 Lint/Runtime/Layout/Motion/Contrast；字体与淡出都要显式声明
  - Motion Canvas：「无一等 headless CLI」 上游 #415/#1218 未解决 → 自建 puppeteer 可编程渲染
- +23.6–24.0s 整屏淡出

### S6 评分修订 90–106s
- +0.3s 章节题「一次数据驱动的修订」；序号 05
- +0.8s 「渲染速度」评分条以旧值出现：Remotion 3/5、HyperFrames 4/5、Motion Canvas 4/5（条宽 分值/5×320px，同 30s 片样式）
- +3.0s 旧值条闪烁警示（描边 #F97316，2 次）+ 右侧标注「与实测矛盾」
- +4.5s 条宽动画重排至新值：5/5、3/5、3/5，标注变为「修订为 [5,3,3]」
- +9.0s 底部一行（24px）「三轮复测，排序不变」淡入
- +15.6–16.0s 整屏淡出

### S7 结语 106–120s
- +0.3s 起三行选型建议逐条点亮（间隔 1.2s，各含品牌色框架名）：
  - 工程团队 → Remotion
  - Agent 管线 → HyperFrames
  - 教学演示 → Motion Canvas
- +6.0s 「没有最好，只有最合适」（56px）中心淡入
- +13.4–14.0s 淡至黑

## 旁白（edge-tts, zh-CN-YunjianNeural）
| 文件 | 起点(s) | 窗口(s) | rate | 话术 |
|---|---|---|---|---|
| r1.mp3 | 0.3 | ≤9.4 | +0% | 三个框架，同一支三十秒的视频，各写一遍——这是一份全部来自实测的对比报告。 |
| r2.mp3 | 10.3 | ≤13.3 | +0% | 实验设定很简单：同一份分镜、同一段旁白、同一台机器，唯一的变量，就是框架本身。 |
| r3.mp3 | 24.3 | ≤11.3 | +0% | 渲染性能，Remotion 十四秒的均值明显领先；另外两家在二十一到二十三秒之间。 |
| r4.mp3 | 36.3 | ≤11.3 | +0% | Motion Canvas 的成片只有零点七六兆——那是码率差异，不是画质缩水。 |
| r5.mp3 | 48.3 | ≤17.3 | +0% | 代码量 Remotion 最省，四百二十五行；Motion Canvas 七百三十一行里，有二百二十四行是自建渲染脚本——没有 headless CLI 的代价。 |
| r6.mp3 | 66.3 | ≤23.3 | +0% | 踩坑各有代表作：Remotion 给 TypeScript 降级；HyperFrames 的 check 提供五类静态检查，字体和淡出都要显式声明；Motion Canvas 要靠 puppeteer 才能无头渲染。 |
| r7.mp3 | 90.3 | ≤15.3 | +0% | 渲染速度的评分原本是三四四，与实测明显矛盾；按既定规则修订为五三三——三轮复测，排序不变。 |
| r8.mp3 | 106.3 | ≤13.2 | +0% | 工程团队选 Remotion，Agent 管线选 HyperFrames，教学演示选 Motion Canvas。没有最好，只有最合适。 |
````

- [ ] **Step 2: Commit**

```bash
git add docs/storyboard-report.md && git commit -m "docs: 报告讲解视频分镜脚本"
```

---

### Task 2: 旁白音轨

**Files:**
- Create: `scripts/build-voiceover-report.sh`
- Produce: `assets/tts-report/r1..r8.mp3`、`assets/voiceover-report.mp3`

**Interfaces:**
- Consumes: storyboard-report 旁白表（逐字）。
- Produces: `assets/voiceover-report.mp3`（120.0s、44.1kHz stereo），Task 4 挂载。

- [ ] **Step 1: 写 scripts/build-voiceover-report.sh**

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p assets/tts-report
TTS=.venv/bin/edge-tts
V="zh-CN-YunjianNeural"
$TTS --voice $V --text "三个框架，同一支三十秒的视频，各写一遍——这是一份全部来自实测的对比报告。" --write-media assets/tts-report/r1.mp3
$TTS --voice $V --text "实验设定很简单：同一份分镜、同一段旁白、同一台机器，唯一的变量，就是框架本身。" --write-media assets/tts-report/r2.mp3
$TTS --voice $V --text "渲染性能，Remotion 十四秒的均值明显领先；另外两家在二十一到二十三秒之间。" --write-media assets/tts-report/r3.mp3
$TTS --voice $V --text "Motion Canvas 的成片只有零点七六兆——那是码率差异，不是画质缩水。" --write-media assets/tts-report/r4.mp3
$TTS --voice $V --text "代码量 Remotion 最省，四百二十五行；Motion Canvas 七百三十一行里，有二百二十四行是自建渲染脚本——没有 headless CLI 的代价。" --write-media assets/tts-report/r5.mp3
$TTS --voice $V --text "踩坑各有代表作：Remotion 给 TypeScript 降级；HyperFrames 的 check 提供五类静态检查，字体和淡出都要显式声明；Motion Canvas 要靠 puppeteer 才能无头渲染。" --write-media assets/tts-report/r6.mp3
$TTS --voice $V --text "渲染速度的评分原本是三四四，与实测明显矛盾；按既定规则修订为五三三——三轮复测，排序不变。" --write-media assets/tts-report/r7.mp3
$TTS --voice $V --text "工程团队选 Remotion，Agent 管线选 HyperFrames，教学演示选 Motion Canvas。没有最好，只有最合适。" --write-media assets/tts-report/r8.mp3

for f in assets/tts-report/r*.mp3; do
  printf "%s %ss\n" "$f" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")"
done

# 起点(ms): r1=300 r2=10300 r3=24300 r4=36300 r5=48300 r6=66300 r7=90300 r8=106300
ffmpeg -y -v error \
  -f lavfi -t 120 -i anullsrc=r=44100:cl=stereo \
  -i assets/tts-report/r1.mp3 -i assets/tts-report/r2.mp3 -i assets/tts-report/r3.mp3 \
  -i assets/tts-report/r4.mp3 -i assets/tts-report/r5.mp3 -i assets/tts-report/r6.mp3 \
  -i assets/tts-report/r7.mp3 -i assets/tts-report/r8.mp3 \
  -filter_complex "[1]aresample=44100,aformat=channel_layouts=stereo,adelay=300|300[a1];[2]aresample=44100,aformat=channel_layouts=stereo,adelay=10300|10300[a2];[3]aresample=44100,aformat=channel_layouts=stereo,adelay=24300|24300[a3];[4]aresample=44100,aformat=channel_layouts=stereo,adelay=36300|36300[a4];[5]aresample=44100,aformat=channel_layouts=stereo,adelay=48300|48300[a5];[6]aresample=44100,aformat=channel_layouts=stereo,adelay=66300|66300[a6];[7]aresample=44100,aformat=channel_layouts=stereo,adelay=90300|90300[a7];[8]aresample=44100,aformat=channel_layouts=stereo,adelay=106300|106300[a8];[0][a1][a2][a3][a4][a5][a6][a7][a8]amix=inputs=9:normalize=0,atrim=0:120" \
  -b:a 192k assets/voiceover-report.mp3
ffprobe -v error -show_entries format=duration -of csv=p=0 assets/voiceover-report.mp3
```

- [ ] **Step 2: 运行并校验**

Run: `bash scripts/build-voiceover-report.sh`
Expected: 每句 ≤ 窗口（超窗按全局约束处理并同步 storyboard-report）；voiceover-report.mp3 时长 120.0±0.1s、44100Hz stereo。

- [ ] **Step 3: Commit**

```bash
git add scripts/build-voiceover-report.sh assets/tts-report assets/voiceover-report.mp3
git commit -m "feat: 报告讲解视频旁白音轨"
```

---

### Task 3: hyperframes-report 脚手架

**Files:**
- Create: `hyperframes-report/`（init 产物）、`hyperframes-report/vendor/gsap.min.js`（复制）、`hyperframes-report/assets/voiceover-report.mp3`（复制）

**Interfaces:**
- Produces: 可渲染的占位组合（120s/30fps/1920×1080，纯 bg 色）+ 渲染命令
  `cd hyperframes-report && npx --yes hyperframes@0.7.71 render --quality high --output ../output/report-video.mp4`。

- [ ] **Step 1: 脚手架（严格带环境变量）**

```bash
export npm_config_cache="$PWD/.npm-cache" HYPERFRAMES_SKIP_SKILLS=1
npx --yes hyperframes@0.7.71 init hyperframes-report
cp hyperframes/vendor/gsap.min.js hyperframes-report/vendor/gsap.min.js  # vendor 目录不存在则先 mkdir
mkdir -p hyperframes-report/assets && cp assets/voiceover-report.mp3 hyperframes-report/assets/
ls ~/.claude/skills ~/.agents 2>/dev/null  # 验证无 home 写入（~/.agents 应不存在）
```

- [ ] **Step 2: 把 index.html 改为 120s 占位组合**（根 `data-composition-id`、总时长 120s、单 `<section class="clip" data-start="0" data-duration="120">` 纯 --bg 背景、`<audio src="assets/voiceover-report.mp3" data-start="0" data-duration="120">`、本地 gsap `<script src="./vendor/gsap.min.js">`、空 `gsap.timeline({paused:true})`；具体属性名以 init 模板与 .claude/skills/hyperframes-core 契约为准）

- [ ] **Step 3: check + 渲染验证**

```bash
cd hyperframes-report && npx --yes hyperframes@0.7.71 check   # 0 error
npx --yes hyperframes@0.7.71 render --quality high --output ../output/report-video.mp4
ffprobe -v error -show_entries stream=codec_type,width,height,r_frame_rate -show_entries format=duration -of compact ../output/report-video.mp4
```

Expected: 1920×1080、30/1、~120s、含 audio 流。

- [ ] **Step 4: Commit** `git add hyperframes-report && git commit -m "feat(report-video): 脚手架与渲染管线打通"`

---

### Task 4: 七场景实现

**Files:**
- Modify: `hyperframes-report/index.html`

**Interfaces:**
- Consumes: storyboard-report 全部内容（逐字/逐值）；Task 3 渲染命令。
- Produces: 最终 `output/report-video.mp4`。

- [ ] **Step 1: 加载 dataviz skill**（S3/S4/S6 是图表场景：条形图数值标签、网格基线、颜色即品牌色语义，按 skill 规范落实；深色背景对比度达标）

- [ ] **Step 2: 实现七个 `<section class="clip">`**（data-start/duration 按边界 0/10/24/48/66/90/106；同一 track 顺排；每场景末 0.4s 淡出且显式 hard-kill；@font-face 显式声明 PingFang SC；结构与 30s 片 hyperframes/index.html 同构——CSS 变量 tokens、.card 样式复用其写法；GSAP 时间线 `gsap.timeline({paused:true})` 单条，时刻 = 场景起点 + storyboard-report 相对时刻）

条形图通用结构（S3/S4/S6 复用同一 CSS 类）：

```html
<div class="bar-row">
  <span class="bar-label">Remotion</span>
  <div class="bar-track"><div class="bar-fill" style="--c:var(--remotion)" data-w="703"></div></div>
  <span class="bar-value">14.06s <small>±0.27</small></span>
</div>
<script>/* tl.fromTo('.s3a .bar-fill', {width:0}, {width:(i,el)=>+el.dataset.w, duration:0.8, stagger:0.35, ease:'power3.out'}, 24.8) */</script>
```

- [ ] **Step 3: check 0 error**（`timeline_track_too_dense` info 级告警可接受，同 30s 片先例）

- [ ] **Step 4: 渲染 + 自查**：渲染成片；截 7 张场景中点静帧（t=5/17/30/42/57/78/98/113 中取 7）到 scratchpad 并 Read 自查：图表数字与 storyboard-report 逐值一致、无溢出/重叠、S6 新旧值动画两个时间点（t=92 vs t=97）比对确认条宽真实变化。

- [ ] **Step 5: ffprobe 校验**（同 Task 3 标准）+ Commit `git add hyperframes-report && git commit -m "feat(report-video): 七场景完整实现"`

---

### Task 5: CLAUDE.md 与终检

**Files:**
- Modify: `CLAUDE.md`（常用命令区新增两行）

- [ ] **Step 1: CLAUDE.md 新增**

```markdown
- 报告视频旁白：`bash scripts/build-voiceover-report.sh`（产出 assets/voiceover-report.mp3）
- 报告讲解视频渲染：`cd hyperframes-report && npx --yes hyperframes@0.7.71 render --quality high --output ../output/report-video.mp4`
```

- [ ] **Step 2: 终检**：ffprobe（1920×1080/30fps/119–120.5s/aac）；抽 10.3/24.3/48.3/90.3s 四个句首点，确认旁白起点与场景切换对齐（误差 ≤0.2s，听感或波形抽验）；数字终核：成片静帧里的 14.06/21.34/22.79/2.33/2.50/0.76/425/530/731/224/[3,4,4]/[5,3,3] 与 docs/report.md 逐值比对。

- [ ] **Step 3: Commit** `git add CLAUDE.md && git commit -m "docs: 报告讲解视频命令入 CLAUDE.md"`
