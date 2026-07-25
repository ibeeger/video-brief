# 设计规范：Remotion / HyperFrames / Motion Canvas 三框架视频对比

日期：2026-07-25
状态：已获用户批准

## 1. 目标

用 Remotion、HyperFrames、Motion Canvas 三个程序化视频框架，各实现一支**内容完全相同**的视频，通过实际开发与渲染过程得出三者优劣的对比结论。

视频内容本身就是「三个框架的对比介绍」，要求专业、高级的视觉呈现。

## 2. 产出物

| 产出 | 位置 | 说明 |
|---|---|---|
| 三支成品视频 | `output/remotion.mp4`、`output/hyperframes.mp4`、`output/motion-canvas.mp4` | 1920×1080、30fps、约 30 秒，内容一致 |
| 统一分镜脚本 | `docs/storyboard.md` | 文案、旁白话术、时间轴、视觉规范的唯一依据 |
| 旁白音轨 | `assets/voiceover.mp3`（及分句素材 `assets/tts/`） | edge-tts 生成，三支视频共用同一条音轨 |
| 对比报告 | `docs/report.md` | 主观评价 + 客观数据 |
| 基准测试脚本 | `scripts/benchmark.mjs` | 统一计时与产物统计 |

## 3. 统一分镜脚本（概要）

深色背景，统一色板与字体层级，克制的动效节奏。文案中文为主、英文点缀（框架名、术语保留英文）。

| 时间 | 场景 | 内容要点 |
|---|---|---|
| 0–4s | 片头 | 「程序化视频，三种答案」标题动画，三个框架名依次浮现 |
| 4–10s | Remotion 章节 | React 生态、组件化、`useCurrentFrame`、企业级生态 |
| 10–16s | HyperFrames 章节 | HTML + GSAP、为 AI Agent 而生、轻量渲染管线 |
| 16–22s | Motion Canvas 章节 | 生成器动画流、时间线编辑器、教学动画强项 |
| 22–28s | 对比环节 | 三列对比表逐行点亮 + 评分条动画 |
| 28–30s | 结语 | 「没有最好，只有最合适」+ 三者适用场景一句话 |

逐句文案、旁白话术、色值、字体、动效曲线在实现阶段先写入 `docs/storyboard.md`，三个实现严格照此执行，保证公平。

## 3.1 旁白配音（edge-tts）

- 每个场景配一句旁白话术，写入 `docs/storyboard.md` 并标注目标时间窗。
- 用 **edge-tts**（音色 `zh-CN-YunjianNeural`）逐句生成音频到 `assets/tts/`；若某句超出场景时长，通过 `--rate` 微调语速或精简话术。
- 用 ffmpeg 按分镜时间轴拼装成整条 `assets/voiceover.mp3`（30 秒，句间以静音填充对齐场景起点），并用 `ffprobe` 校验每句起点误差 ≤ 0.2s。
- **三支视频共用这一条音轨**，保证音画同步且对比公平；混入方式优先用各框架原生音频能力（Remotion `<Audio>`、Motion Canvas 项目音频、HyperFrames voiceover/audio），原生能力不可用时降级为 ffmpeg 后期混流，并在报告中如实记录——音频支持度本身就是对比维度之一。
- edge-tts 为 Python 工具，安装在**项目内** `.venv/`（`python3 -m venv .venv && .venv/bin/pip install edge-tts`），不写 home 目录；生成时需要联网（微软 TTS 服务）。

## 4. 项目结构

```
aigenVideo/
├─ .claude/           # 项目级权限 settings.json + skills（不写 home 目录）
├─ assets/
│  ├─ tts/            # edge-tts 逐句生成的音频
│  └─ voiceover.mp3   # 拼装后的整条旁白音轨
├─ .venv/             # 项目内 Python 环境（edge-tts）
├─ docs/
│  ├─ storyboard.md
│  ├─ report.md
│  └─ superpowers/specs/   # 本文档
├─ remotion/          # npx create-video 脚手架，React + TS
├─ hyperframes/       # npx hyperframes init，HTML + GSAP
├─ motion-canvas/     # 官方脚手架，TS 生成器动画
├─ scripts/
│  └─ benchmark.mjs
└─ output/            # 三支成品 mp4（git 忽略大文件可另议）
```

- 三个子项目各自独立 `node_modules`，根目录不装混合依赖。
- 环境已确认：Node v22.22.1（满足 HyperFrames ≥22 要求）、FFmpeg 7.1、macOS。

## 5. 权限与 skills 约束

- 所有权限白名单写入项目 `.claude/settings.json`（npm / npx / node / ffmpeg / ffprobe / .venv/bin/edge-tts 等）。
- HyperFrames 官方 agent skills（`npx skills add heygen-com/hyperframes`）安装到项目 `.claude/skills/`。
- 任何配置、skill、缓存**不得写入用户 home 目录**。
- 根目录 CLAUDE.md 记录三个子项目的常用命令（预览、渲染、基准测试）。

## 6. 基准测试方法

`scripts/benchmark.mjs` 对每个框架：

1. 冷启动渲染 3 次，取平均耗时与标准差；
2. 记录产物体积（bytes）与 `ffprobe` 校验的时长/分辨率/帧率/码率；
3. 通过 `/usr/bin/time -l` 记录渲染进程峰值内存；
4. 结果输出 JSON 至 `output/benchmark.json`，报告引用该数据。

## 7. 对比报告维度

- 开发体验（脚手架、热预览、调试、文档质量）
- 代码量与可读性（同一分镜的实现行数、结构清晰度）
- 学习曲线
- 渲染性能（耗时、内存、产物体积 —— 引用 benchmark 数据）
- 成品质量（视觉还原度、文字渲染、动效流畅度）
- 生态与扩展（原生音频/配音支持度、图表、AI Agent 友好度）
- 适用场景结论

## 8. 验证方式

- 每支视频渲染后 `ffprobe` 校验：时长 30s±0.5s、1920×1080、30fps、含音频流。
- 抽查关键场景切换点，确认旁白句起点与画面场景起点对齐（误差 ≤ 0.2s）。
- 人工预览三支视频确认视觉一致性、音画同步与质量。
- benchmark 跑通且数据写入报告后视为完成。

## 9. 明确不做（YAGNI）

- 不做 BGM/音效，音频仅旁白一条音轨；不做字幕烧录（画面文字已承担信息）。
- 不做多分辨率输出、不做 CI、不做部署。
- 不逐帧像素级对齐三支视频，允许框架惯用表达的合理差异，但分镜、文案、配色、时间轴必须一致。
