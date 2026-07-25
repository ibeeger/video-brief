# 三框架视频对比 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 Remotion、HyperFrames、Motion Canvas 各实现一支内容完全相同的 30 秒对比视频（含 edge-tts 旁白），并产出基准数据与对比报告。

**Architecture:** 单仓库三子项目（各自独立 node_modules）。`docs/storyboard.md` 是文案/时间轴/视觉的唯一依据；`assets/voiceover.mp3` 由 edge-tts 生成、三支视频共用；`scripts/benchmark.mjs` 统一计时；报告引用实测数据。

**Tech Stack:** Remotion v4 (React 18 + TS)、HyperFrames (HTML + GSAP)、Motion Canvas (TS 生成器)、edge-tts (Python venv)、FFmpeg 7。

## Global Constraints

- 视频规格：1920×1080、30fps、30 秒（900 帧）、含音频流；`ffprobe` 校验时长 30s±0.5s。
- 旁白音色：`zh-CN-YunjianNeural`；三支视频共用 `assets/voiceover.mp3`。
- 一切权限与 skills 只写项目 `.claude/`，任何工具**不得写 home 目录**（Python 用项目内 `.venv/`）。
- 环境：macOS、Node v22.22.1、FFmpeg 7.1（已确认）。
- 文案中文为主、术语与框架名保留英文；分镜、文案、色板、时间轴三实现必须一致（spec §3）。
- 每完成一个任务立即 git commit（中文 message，附 Co-Authored-By: Claude Fable 5）。

---

### Task 1: 项目基线（权限、目录、skills）

**Files:**
- Create: `.claude/settings.json`
- Create: `CLAUDE.md`
- Create: `output/.gitkeep`, `assets/tts/.gitkeep`

**Interfaces:**
- Produces: 项目级 Bash 权限白名单；`.claude/skills/` 内的 HyperFrames 官方 skills（后续 Task 6 使用）。

- [ ] **Step 1: 写入项目权限白名单**

`.claude/settings.json`：

```json
{
  "permissions": {
    "allow": [
      "Bash(npm:*)", "Bash(npx:*)", "Bash(node:*)",
      "Bash(ffmpeg:*)", "Bash(ffprobe:*)",
      "Bash(python3:*)", "Bash(.venv/bin/edge-tts:*)", "Bash(.venv/bin/pip:*)",
      "Bash(git:*)", "Bash(/usr/bin/time:*)"
    ]
  }
}
```

- [ ] **Step 2: 建目录**

Run: `mkdir -p output assets/tts scripts && touch output/.gitkeep assets/tts/.gitkeep`

- [ ] **Step 3: 安装 HyperFrames 官方 skills 到项目目录**

Run（在项目根执行；如 CLI 询问安装位置，选择项目/当前目录，确认产物落在 `.claude/skills/` 或 `./skills/`，若落在 `./skills/` 则移动到 `.claude/skills/`）:

```bash
npx skills add heygen-com/hyperframes --full-depth
ls .claude/skills/
```

Expected: 出现 hyperframes 相关 skill 目录。验证没有写入 `~/.claude`：`ls ~/.claude/skills 2>/dev/null` 无新增。

- [ ] **Step 4: 写 CLAUDE.md**（三子项目常用命令，随任务推进可补充）

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目
三框架（Remotion / HyperFrames / Motion Canvas）实现同一支 30s 对比视频。
唯一内容依据：docs/storyboard.md。规格：1920×1080·30fps·30s·含旁白音轨。

## 常用命令
- 旁白生成：`bash scripts/build-voiceover.sh`（产出 assets/voiceover.mp3）
- Remotion 预览：`cd remotion && npx remotion studio`
- Remotion 渲染：`cd remotion && npx remotion render src/index.ts Compare ../output/remotion.mp4`
- HyperFrames 预览：`cd hyperframes && npx hyperframes preview`
- HyperFrames 渲染：`cd hyperframes && npx hyperframes render`（详见 .claude/skills）
- Motion Canvas 编辑器：`cd motion-canvas && npm start`
- 基准测试：`node scripts/benchmark.mjs`

## 约束
- 所有权限/skills 只放项目 .claude/，不写 home 目录；Python 用项目 .venv/。
- 三实现的文案、时间轴、色板必须与 docs/storyboard.md 完全一致。
```

- [ ] **Step 5: Commit**

```bash
git add .claude CLAUDE.md output assets scripts
git commit -m "chore: 项目基线(权限/目录/HyperFrames skills)"
```

---

### Task 2: 统一分镜脚本 docs/storyboard.md

**Files:**
- Create: `docs/storyboard.md`

**Interfaces:**
- Produces: 全部文案/旁白/色板/时间轴常量。后续所有实现任务**逐字**引用本文件，不得自行改写文案。

- [ ] **Step 1: 写入 storyboard.md（以下为完整内容，原样写入）**

````markdown
# 统一分镜脚本（唯一依据）

规格：1920×1080 · 30fps · 30s（900 帧）。三实现必须逐字一致。

## 设计 tokens
- 背景 #0B0D12；卡片面 #141926；主文字 #F2F4F8；次级 #8B93A7
- 品牌色：Remotion #3B82F6 / HyperFrames #F97316 / Motion Canvas #10B981
- 字体：中文 "PingFang SC"；西文/数字 system-ui；序号用 "Menlo"
- 动效：缓动 cubic-bezier(0.22,1,0.36,1)；入场 0.5–0.8s；场景间硬切前 0.4s 内部淡出
- 版式：安全边距左右 160px；主标题 72px/粗；副题 32px；卡片标题 30px；说明 22px

## 场景

### S1 片头 0.0–4.0s (帧 0–120)
- 0.0–0.8s 中心水平细线(2px, #8B93A7)自中点展开至 640px
- 0.5–1.5s 主标题「程序化视频，三种答案」上移 24px + 淡入
- 1.8–3.0s 三框架名 Remotion / HyperFrames / Motion Canvas 各自品牌色，间隔 0.3s 依次淡入，横排
- 3.6–4.0s 整屏淡出

### S2/S3/S4 章节页共用版式（每章 6s）
- +0.0–0.4s 品牌色竖条(6×72px)自上而下立起；左上角序号 01/02/03 (Menlo, 次级色)
- +0.2–0.8s 框架名大标题(72px) + 副题(32px 次级色)自左滑入 40px + 淡入
- +1.0s 起三张特性卡片(500×180px, 面色 #141926, 圆角 16px)依次上浮弹入，间隔 0.4s；卡片含关键词(30px 品牌色)与一行说明(22px)
- +5.6–6.0s 整屏淡出

### S2 Remotion 4.0–10.0s (帧 120–300)
副题「React 生态的视频引擎」
- 卡1 组件即镜头 —— 每一帧都是组件的纯函数输出
- 卡2 useCurrentFrame —— 以帧为一等公民的时间模型
- 卡3 工程化生态 —— Studio 预览 · Lambda 云渲染 · npm 生态

### S3 HyperFrames 10.0–16.0s (帧 300–480)
副题「写 HTML，渲染视频」
- 卡1 HTML 即分镜 —— 浏览器渲染，逐帧捕获成片
- 卡2 GSAP 时间线 —— 成熟动画栈直接复用
- 卡3 为 Agent 而生 —— 轻量管线，AI 生成友好

### S4 Motion Canvas 16.0–22.0s (帧 480–660)
副题「生成器驱动的动画流」
- 卡1 yield* 即时间 —— 用生成器顺序描述动画
- 卡2 实时编辑器 —— 时间线拖拽，所见即所得
- 卡3 教学利器 —— 代码与图形演示的天然选择

### S5 对比 22.0–28.0s (帧 660–840)
- 0.0–0.5s 标题「同题对比」自上滑入；三列表头为三框架名(品牌色)
- 自 +0.8s 起每 1.1s 点亮一行，共 4 行；每行 3 根评分条(高 14px，宽度 0→值/5×320px 动画)
- 评分(画面设计值；benchmark 后若与实测明显矛盾，三实现同步修订)：
  | 维度 | Remotion | HyperFrames | Motion Canvas |
  |---|---|---|---|
  | 上手成本(满=易) | 3 | 5 | 3 |
  | 生态成熟度 | 5 | 2 | 3 |
  | 渲染速度 | 3 | 4 | 4 |
  | Agent 友好度 | 4 | 5 | 3 |
- 5.6–6.0s 整屏淡出

### S6 结语 28.0–30.0s (帧 840–900)
- 0.0–0.6s 「没有最好，只有最合适」中心淡入(56px)
- 0.6–1.2s 下方小字(22px 次级色)：工程团队选 Remotion · Agent 管线选 HyperFrames · 教学演示选 Motion Canvas
- 持续至结束，最后 0.3s 淡至黑

## 旁白（edge-tts, 音色 zh-CN-YunjianNeural）
| 文件 | 起点(s) | 窗口(s) | rate | 话术 |
|---|---|---|---|---|
| s1.mp3 | 0.3 | ≤3.5 | +0% | 程序化视频，三种答案。 |
| s2.mp3 | 4.3 | ≤5.5 | +0% | Remotion，用 React 组件写视频，生态成熟，适合工程团队。 |
| s3.mp3 | 10.3 | ≤5.5 | +0% | HyperFrames，写 HTML 就能渲染视频，为 AI Agent 而生。 |
| s4.mp3 | 16.3 | ≤5.5 | +0% | Motion Canvas，生成器描述动画流，是教学演示的利器。 |
| s5.mp3 | 22.3 | ≤5.5 | +0% | 三者在生态、上手和性能上，各有胜场。 |
| s6.mp3 | 28.0 | ≤2.0 | +15% | 没有最好，只有最合适。 |
````

- [ ] **Step 2: Commit**

```bash
git add docs/storyboard.md && git commit -m "docs: 统一分镜脚本(文案/旁白/tokens/时间轴)"
```

---

### Task 3: edge-tts 旁白管线

**Files:**
- Create: `scripts/build-voiceover.sh`
- Produce: `assets/tts/s1..s6.mp3`、`assets/voiceover.mp3`

**Interfaces:**
- Consumes: storyboard 旁白表（话术/起点/rate 逐字照抄）。
- Produces: `assets/voiceover.mp3`（30.0s, 44.1kHz mp3），Task 4/6/7 直接引用。

- [ ] **Step 1: 项目内建 venv 并安装 edge-tts**

```bash
python3 -m venv .venv && .venv/bin/pip install --quiet edge-tts && .venv/bin/edge-tts --version
```

Expected: 输出版本号；确认无 `~/.local` 写入。

- [ ] **Step 2: 写 scripts/build-voiceover.sh**

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
TTS=.venv/bin/edge-tts
V="zh-CN-YunjianNeural"
$TTS --voice $V --text "程序化视频，三种答案。" --write-media assets/tts/s1.mp3
$TTS --voice $V --text "Remotion，用 React 组件写视频，生态成熟，适合工程团队。" --write-media assets/tts/s2.mp3
$TTS --voice $V --text "HyperFrames，写 HTML 就能渲染视频，为 AI Agent 而生。" --write-media assets/tts/s3.mp3
$TTS --voice $V --text "Motion Canvas，生成器描述动画流，是教学演示的利器。" --write-media assets/tts/s4.mp3
$TTS --voice $V --text "三者在生态、上手和性能上，各有胜场。" --write-media assets/tts/s5.mp3
$TTS --voice $V --rate "+15%" --text "没有最好，只有最合适。" --write-media assets/tts/s6.mp3

for f in assets/tts/s*.mp3; do
  printf "%s %ss\n" "$f" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")"
done

# 起点(ms): s1=300 s2=4300 s3=10300 s4=16300 s5=22300 s6=28000
ffmpeg -y -v error \
  -f lavfi -t 30 -i anullsrc=r=44100:cl=stereo \
  -i assets/tts/s1.mp3 -i assets/tts/s2.mp3 -i assets/tts/s3.mp3 \
  -i assets/tts/s4.mp3 -i assets/tts/s5.mp3 -i assets/tts/s6.mp3 \
  -filter_complex "[1]adelay=300|300[a1];[2]adelay=4300|4300[a2];[3]adelay=10300|10300[a3];[4]adelay=16300|16300[a4];[5]adelay=22300|22300[a5];[6]adelay=28000|28000[a6];[0][a1][a2][a3][a4][a5][a6]amix=inputs=7:normalize=0,atrim=0:30" \
  -b:a 192k assets/voiceover.mp3
ffprobe -v error -show_entries format=duration -of csv=p=0 assets/voiceover.mp3
```

- [ ] **Step 3: 运行并校验**

Run: `bash scripts/build-voiceover.sh`
Expected: 每句时长 ≤ storyboard 窗口值（超窗则精简该句话术或加 `--rate`，并同步改 storyboard）；voiceover.mp3 时长 30.0±0.1s。

- [ ] **Step 4: 人工抽听** `afplay assets/voiceover.mp3`（可选，确认音色与断句自然）。

- [ ] **Step 5: Commit**

```bash
git add scripts/build-voiceover.sh assets && git commit -m "feat: edge-tts 旁白管线与共用音轨"
```

---

### Task 4: Remotion 子项目脚手架

**Files:**
- Create: `remotion/package.json`, `remotion/tsconfig.json`, `remotion/src/index.ts`, `remotion/src/Root.tsx`, `remotion/public/voiceover.mp3`(复制)

**Interfaces:**
- Produces: 组合 ID `Compare`（900 帧/30fps/1920×1080）；渲染命令 `npx remotion render src/index.ts Compare ../output/remotion.mp4`（Task 8 引用）。

- [ ] **Step 1: 手工脚手架（确定性,不用交互式 CLI）**

```bash
mkdir -p remotion/src remotion/public
cp assets/voiceover.mp3 remotion/public/
cd remotion && npm init -y >/dev/null
npm i remotion@^4 @remotion/cli@^4 react@^18.3 react-dom@^18.3
npm i -D typescript @types/react
```

`remotion/tsconfig.json`：

```json
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","jsx":"react-jsx","strict":true,"skipLibCheck":true,"noEmit":true}}
```

`remotion/src/index.ts`：

```ts
import {registerRoot} from 'remotion';
import {Root} from './Root';
registerRoot(Root);
```

`remotion/src/Root.tsx`（先放占位画面验证管线通）：

```tsx
import {Composition, AbsoluteFill} from 'remotion';
const Placeholder = () => <AbsoluteFill style={{backgroundColor: '#0B0D12'}} />;
export const Root = () => (
  <Composition id="Compare" component={Placeholder} durationInFrames={900} fps={30} width={1920} height={1080} />
);
```

- [ ] **Step 2: 验证渲染管线**

Run: `cd remotion && npx remotion render src/index.ts Compare ../output/remotion.mp4`
Expected: 成功产出 mp4；`ffprobe` 显示 1920×1080、30fps、30s。

- [ ] **Step 3: Commit**

```bash
git add remotion && git commit -m "feat(remotion): 脚手架与渲染管线打通"
```

---

### Task 5: Remotion 六场景实现

**Files:**
- Create: `remotion/src/tokens.ts`, `remotion/src/scenes.tsx`
- Modify: `remotion/src/Root.tsx`

**Interfaces:**
- Consumes: storyboard 全部内容；`public/voiceover.mp3`。
- Produces: 最终 `output/remotion.mp4`。

- [ ] **Step 1: 写 tokens.ts（storyboard tokens 的代码化，三实现各自照抄同一来源）**

```ts
export const C = {
  bg: '#0B0D12', panel: '#141926', text: '#F2F4F8', muted: '#8B93A7',
  remotion: '#3B82F6', hyperframes: '#F97316', motioncanvas: '#10B981',
};
export const FONT = '"PingFang SC", system-ui, sans-serif';
export const MONO = 'Menlo, monospace';
export const CHAPTERS = [
  {no: '01', name: 'Remotion', color: C.remotion, sub: 'React 生态的视频引擎', cards: [
    ['组件即镜头', '每一帧都是组件的纯函数输出'],
    ['useCurrentFrame', '以帧为一等公民的时间模型'],
    ['工程化生态', 'Studio 预览 · Lambda 云渲染 · npm 生态']]},
  {no: '02', name: 'HyperFrames', color: C.hyperframes, sub: '写 HTML，渲染视频', cards: [
    ['HTML 即分镜', '浏览器渲染，逐帧捕获成片'],
    ['GSAP 时间线', '成熟动画栈直接复用'],
    ['为 Agent 而生', '轻量管线，AI 生成友好']]},
  {no: '03', name: 'Motion Canvas', color: C.motioncanvas, sub: '生成器驱动的动画流', cards: [
    ['yield* 即时间', '用生成器顺序描述动画'],
    ['实时编辑器', '时间线拖拽，所见即所得'],
    ['教学利器', '代码与图形演示的天然选择']]},
] as const;
export const SCORES = [
  ['上手成本', 3, 5, 3], ['生态成熟度', 5, 2, 3],
  ['渲染速度', 3, 4, 4], ['Agent 友好度', 4, 5, 3],
] as const;
```

- [ ] **Step 2: 写 scenes.tsx**

实现要点（完整遵循 storyboard 的时间数值；缓动统一 `Easing.bezier(0.22,1,0.36,1)`）：

```tsx
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, CHAPTERS, FONT, MONO, SCORES} from './tokens';

const EZ = Easing.bezier(0.22, 1, 0.36, 1);
const io = (f: number, [a, b]: [number, number], out: [number, number] = [0, 1]) =>
  interpolate(f, [a, b], out, {easing: EZ, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
// 场景末 0.4s 整屏淡出：sceneFrames 为场景总帧数
const fadeOut = (f: number, sceneFrames: number) => io(f, [sceneFrames - 12, sceneFrames], [1, 0]);

export const Intro = () => { /* S1: 细线展开(0-24帧)、主标题上移淡入(15-45)、三名字 54/63/72 帧起各 18 帧淡入、108-120 淡出 */ };
export const Chapter = ({i}: {i: number}) => { /* S2-4 共用: 竖条 0-12 帧立起、标题 6-24 滑入、卡片 30/42/54 帧起上浮、168-180 淡出 */ };
export const Versus = () => { /* S5: 标题 0-15、行 n 于 24+33n 帧起点亮,评分条宽度 18 帧动画、168-180 淡出 */ };
export const Outro = () => { /* S6: 主句 0-18 淡入、小字 18-36、51-60 淡至黑 */ };

export const CompareVideo = () => (
  <AbsoluteFill style={{backgroundColor: C.bg, fontFamily: FONT}}>
    <Audio src={staticFile('voiceover.mp3')} />
    <Sequence durationInFrames={120}><Intro /></Sequence>
    {CHAPTERS.map((c, i) => (
      <Sequence key={c.no} from={120 + i * 180} durationInFrames={180}><Chapter i={i} /></Sequence>
    ))}
    <Sequence from={660} durationInFrames={180}><Versus /></Sequence>
    <Sequence from={840} durationInFrames={60}><Outro /></Sequence>
  </AbsoluteFill>
);
```

四个场景组件按注释中的帧数值完整实现（JSX 布局按 storyboard 的字号/边距/圆角；不允许留 TODO）。

- [ ] **Step 3: Root.tsx 换用 CompareVideo**

```tsx
import {Composition} from 'remotion';
import {CompareVideo} from './scenes';
export const Root = () => (
  <Composition id="Compare" component={CompareVideo} durationInFrames={900} fps={30} width={1920} height={1080} />
);
```

- [ ] **Step 4: Studio 目检** `npx remotion studio`，逐场景核对时间轴/文案/配色与 storyboard 一致、音画同步。

- [ ] **Step 5: 渲染并校验**

```bash
cd remotion && npx remotion render src/index.ts Compare ../output/remotion.mp4
ffprobe -v error -show_entries stream=codec_type,width,height,r_frame_rate -of compact ../output/remotion.mp4
```

Expected: video 1920×1080 30/1 + audio 流；时长 30s。

- [ ] **Step 6: Commit** `git add remotion && git commit -m "feat(remotion): 六场景完整实现"`

---

### Task 6: HyperFrames 实现

**Files:**
- Create: `hyperframes/`（`npx hyperframes init` 脚手架产物 + 场景实现）

**Interfaces:**
- Consumes: storyboard、`assets/voiceover.mp3`、`.claude/skills/` 内 HyperFrames skills。
- Produces: `output/hyperframes.mp4`；渲染命令记入 CLAUDE.md（Task 8 引用）。

- [ ] **Step 1: 阅读已安装的 HyperFrames skills**（`.claude/skills/` 下 composition/动画/voiceover 相关文档），确认：组合文件格式、时长/fps 声明方式、音频挂载方式、`render` 命令参数。**本任务后续代码以 skill 文档为准。**

- [ ] **Step 2: 脚手架**

```bash
npx hyperframes init hyperframes
cd hyperframes && npx hyperframes preview   # 确认预览可开
```

- [ ] **Step 3: 实现六场景**

按脚手架约定创建组合（1920×1080/30fps/30s，挂载 `../assets/voiceover.mp3`）。画面结构与 GSAP 时间线（时间数值与 storyboard 逐一对应；tokens/文案与 Task 5 `tokens.ts` 内容完全一致，以 HTML/CSS 变量表达）：

```html
<style>
  :root { --bg:#0B0D12; --panel:#141926; --text:#F2F4F8; --muted:#8B93A7;
          --remotion:#3B82F6; --hyperframes:#F97316; --motioncanvas:#10B981; }
  body { background:var(--bg); color:var(--text); font-family:"PingFang SC",system-ui,sans-serif; }
  .card { width:500px; height:180px; background:var(--panel); border-radius:16px; }
</style>
<!-- 六个 <section id="s1">..<section id="s6">，内容逐字取自 storyboard -->
<script>
const EZ = 'cubic-bezier(0.22,1,0.36,1)'; // GSAP: ease: CustomEase 或 "power3.out" 近似,以 skill 推荐为准
const tl = gsap.timeline();
tl.fromTo('#s1 .line', {width:0}, {width:640, duration:0.8}, 0)
  .fromTo('#s1 h1', {y:24, opacity:0}, {y:0, opacity:1, duration:1.0}, 0.5)
  .fromTo('#s1 .names span', {opacity:0}, {opacity:1, stagger:0.3, duration:0.6}, 1.8)
  .to('#s1', {opacity:0, duration:0.4}, 3.6);
// s2/s3/s4: 章节偏移 4/10/16s,内部: 竖条 scaleY 0→1 (0.4s)、标题 x:-40 淡入(0.2s 起)、
// 卡片 y:24 淡入 stagger 0.4 (1.0s 起)、5.6s 淡出
// s5: 偏移 22s,标题 y:-24 淡入,4 行自 0.8s 起每 1.1s 点亮,评分条 width 0→score/5*320 (0.6s)
// s6: 偏移 28s,主句 0.6s 淡入,小字 0.6s 起,29.7s 淡至黑
</script>
```

- [ ] **Step 4: 渲染并校验**

Run: skill 文档给出的 render 命令，输出/移动至 `output/hyperframes.mp4`；同 Task 5 的 ffprobe 校验。若组合不支持原生音频挂载，用
`ffmpeg -y -i output/hyperframes.mp4 -i assets/voiceover.mp3 -c:v copy -c:a aac -shortest output/hyperframes.mp4`（先渲染到临时名再混流），并在报告记录「需后期混流」。

- [ ] **Step 5: 把实际使用的渲染命令更新进 CLAUDE.md。**

- [ ] **Step 6: Commit** `git add hyperframes CLAUDE.md && git commit -m "feat(hyperframes): 六场景完整实现"`

---

### Task 7: Motion Canvas 实现

**Files:**
- Create: `motion-canvas/package.json`, `motion-canvas/vite.config.ts`, `motion-canvas/src/project.ts`, `motion-canvas/src/scenes/compare.tsx`, `motion-canvas/public/voiceover.mp3`

**Interfaces:**
- Consumes: storyboard、`assets/voiceover.mp3`。
- Produces: `output/motion-canvas.mp4`；可自动化的渲染命令（Task 8 引用；若只能编辑器渲染则 benchmark 采用「编辑器计时」并明记）。

- [ ] **Step 1: 脚手架**

```bash
npm init @motion-canvas@latest -- --name motion-canvas --path motion-canvas --language ts
cd motion-canvas && npm i && cp ../assets/voiceover.mp3 public/
npm start   # 打开编辑器确认可跑
```

（若 init 参数与当前版本不符，按 CLI 提示交互完成，目标不变：TS 项目位于 `motion-canvas/`。）

- [ ] **Step 2: project.ts 挂音频、设分辨率**

```ts
import {makeProject} from '@motion-canvas/core';
import compare from './scenes/compare?scene';
export default makeProject({scenes: [compare], audio: '/voiceover.mp3'});
```

编辑器渲染设置：1920×1080、30fps、时长以场景为准（场景内 waitFor 精确到 30.0s）。

- [ ] **Step 3: 实现场景 compare.tsx**

结构（tokens/文案与 Task 5 `tokens.ts` 完全一致；时间用秒并与 storyboard 对齐，用 `waitUntil`/`waitFor` 卡场景边界 4/10/16/22/28/30s）：

```tsx
import {makeScene2D, Txt, Rect, Line, Layout} from '@motion-canvas/2d';
import {all, chain, createRef, makeRef, waitFor, easeOutQuint} from '@motion-canvas/core';

export default makeScene2D(function* (view) {
  view.fill('#0B0D12');
  // S1: Line 展开 0.8s -> 标题 y/opacity 1.0s -> 三名字 stagger 0.3 -> 淡出,合计恰 4s
  // S2-4: 循环 CHAPTERS 数据,竖条 scaleY、标题滑入、三卡片 stagger、淡出,每章恰 6s
  // S5: 表头 + 4 行×3 评分条 width 补间,行间 1.1s,恰 6s
  // S6: 主句/小字淡入,末 0.3s 淡黑,恰 2s
});
```

各段完整实现（不允许 TODO）；每段结束用 `waitFor` 补齐到边界秒数。

- [ ] **Step 4: 确定 CLI 渲染方式（实现时调研，二选一记录进 CLAUDE.md）**

1. 查当前 Motion Canvas 文档是否有官方 headless/CLI 渲染（含 `@motion-canvas/ffmpeg` 导出 mp4+音频）；有则采用。
2. 没有则：编辑器手动渲染产出 `output/motion-canvas.mp4`（含音频；若导出无音频用 Task 6 同款 ffmpeg 混流），benchmark 对该框架改用编辑器渲染计时（人工秒表/编辑器日志），报告中如实标注「无一等 CLI 渲染」——这本身是重要对比结论。

- [ ] **Step 5: ffprobe 校验（同 Task 5 标准）。**

- [ ] **Step 6: Commit** `git add motion-canvas CLAUDE.md && git commit -m "feat(motion-canvas): 六场景完整实现"`

---

### Task 8: 基准测试

**Files:**
- Create: `scripts/benchmark.mjs`
- Produce: `output/benchmark.json`

**Interfaces:**
- Consumes: Task 4-7 确定的渲染命令。
- Produces: `output/benchmark.json`（结构见下），Task 9 引用。

- [ ] **Step 1: 写 scripts/benchmark.mjs**

```js
import {execSync, spawnSync} from 'node:child_process';
import {statSync, writeFileSync} from 'node:fs';

const TARGETS = [
  {name: 'remotion', cwd: 'remotion', cmd: ['npx', 'remotion', 'render', 'src/index.ts', 'Compare', '../output/remotion.mp4'], out: 'output/remotion.mp4'},
  {name: 'hyperframes', cwd: 'hyperframes', cmd: ['npx', 'hyperframes', 'render'/* Task 6 确定的参数 */], out: 'output/hyperframes.mp4'},
  // motion-canvas: 若 Task 7 得到 CLI 命令则加入;否则跳过并在 json 里标 manual:true
];
const RUNS = 3;
const results = [];
for (const t of TARGETS) {
  const times = [];
  let peakRssMb = null;
  for (let i = 0; i < RUNS; i++) {
    const t0 = process.hrtime.bigint();
    const r = spawnSync('/usr/bin/time', ['-l', ...t.cmd], {cwd: t.cwd, encoding: 'utf8'});
    if (r.status !== 0) throw new Error(`${t.name} run ${i} failed:\n${r.stderr}`);
    times.push(Number(process.hrtime.bigint() - t0) / 1e9);
    const m = r.stderr.match(/(\d+)\s+maximum resident set size/);
    if (m) peakRssMb = Math.max(peakRssMb ?? 0, Number(m[1]) / 1024 / 1024);
  }
  const probe = execSync(`ffprobe -v error -show_entries format=duration,size,bit_rate -of json ${t.out}`).toString();
  const mean = times.reduce((a, b) => a + b) / RUNS;
  const sd = Math.sqrt(times.reduce((a, b) => a + (b - mean) ** 2, 0) / RUNS);
  results.push({name: t.name, runs: times, meanSec: +mean.toFixed(2), sdSec: +sd.toFixed(2),
    peakRssMb: peakRssMb && +peakRssMb.toFixed(0), sizeBytes: statSync(t.out).size, probe: JSON.parse(probe).format});
}
writeFileSync('output/benchmark.json', JSON.stringify(results, null, 2));
console.table(results.map(({name, meanSec, sdSec, peakRssMb, sizeBytes}) => ({name, meanSec, sdSec, peakRssMb, mb: +(sizeBytes / 1e6).toFixed(1)})));
```

- [ ] **Step 2: 运行** `node scripts/benchmark.mjs`（预计数分钟）。Motion Canvas 若无 CLI，按 Task 7 Step 4 方案 2 人工计时三次，手工把同结构条目补进 benchmark.json（加 `"manual": true`）。

- [ ] **Step 3: 校验** `output/benchmark.json` 含三个条目、均值/标准差/体积/内存字段齐全。

- [ ] **Step 4: Commit** `git add scripts/benchmark.mjs output/benchmark.json && git commit -m "feat: 渲染基准测试与数据"`

---

### Task 9: 对比报告与终检

**Files:**
- Create: `docs/report.md`

- [ ] **Step 1: 三支视频一致性终检**

```bash
for f in output/*.mp4; do echo "== $f"; ffprobe -v error -show_entries stream=codec_type,width,height,r_frame_rate -show_entries format=duration -of compact "$f"; done
```

Expected: 三支均 1920×1080、30/1 fps、时长 30±0.5s、各含 1 条 audio 流。逐支人工预览，抽查 4s/10s/16s/22s/28s 切换点旁白起点对齐（误差 ≤0.2s）。

- [ ] **Step 2: 写 docs/report.md**

结构（spec §7 七个维度逐节展开；数据一律引用 benchmark.json 实测值与开发过程实录，不得凭空给结论）：

```markdown
# Remotion vs HyperFrames vs Motion Canvas 实测对比报告
## 结论速览（一张表 + 三句话选型建议）
## 实验设置（同一分镜/音轨/机器,链接 storyboard 与 spec）
## 1 开发体验  ## 2 代码量与可读性（三实现行数统计: `wc -l` 实测）
## 3 学习曲线  ## 4 渲染性能（benchmark.json 表格化）
## 5 成品质量（截帧对比: 文字渲染/动效还原度）
## 6 生态与扩展（含: 原生音频支持方式实录——谁原生挂载、谁被迫 ffmpeg 混流）
## 7 适用场景结论
## 附录: 踩坑实录
```

- [ ] **Step 3: 若 benchmark 实测与 S5 评分设计值明显矛盾（如某框架实测最快但评分最低），按 storyboard 规则三实现同步修改评分并重渲染。**

- [ ] **Step 4: Commit** `git add docs/report.md && git commit -m "docs: 三框架实测对比报告"`
