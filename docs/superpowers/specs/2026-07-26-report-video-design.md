# 设计规范：报告讲解视频（HyperFrames，≤2 分钟）

日期：2026-07-26
状态：已获用户批准
分支：feature/report-video（基于 feature/video-comparison）

## 1. 目标

用 HyperFrames 制作一支 ≤2 分钟的视频，以「数据故事线」结构讲解 `docs/report.md`
（三框架实测对比报告）的核心内容。数字、结论必须与报告逐字/逐值一致，不得新造结论。

## 2. 规格与产出

| 项 | 值 |
|---|---|
| 规格 | 1920×1080 · 30fps · 120s（3600 帧）· 含旁白音轨 |
| 工程 | `hyperframes-report/`（独立子项目，不动现有 `hyperframes/`） |
| 内容依据 | `docs/storyboard-report.md`（逐字文案+旁白表+时间轴，实现阶段先写它） |
| 旁白 | edge-tts `zh-CN-YunjianNeural`，`scripts/build-voiceover-report.sh` → `assets/voiceover-report.mp3`，原生 `<audio>` 挂载 |
| 成片 | `output/report-video.mp4`，渲染命令写入 CLAUDE.md |

## 3. 分镜结构（数据故事线，七场景）

| 时间 | 场景 | 画面要点 | 数据来源（report.md） |
|---|---|---|---|
| 0–10s | S1 开场 | 「一份全实测的三框架对比报告」+ 三框架名品牌色浮现 | 标题 |
| 10–24s | S2 实验设定 | 「同一分镜·同一旁白·同一台机器」三张规格卡，唯一变量是框架 | §实验设置 |
| 24–48s | S3 渲染性能 | 水平条形图动画：耗时 14.06/21.34/22.79s（含 SD 0.27/0.19/0.02）；第二拍切体积 2.33/2.50/0.76MB + 一句话点破码率差异非画质问题 | §4 表格 |
| 48–66s | S4 代码量 | 条形图 425/530/731 行；Motion Canvas 224 行渲染脚本单独高亮=「无 headless CLI 的代价」 | §2 表格 |
| 66–90s | S5 踩坑精选 | 三列卡片各一坑：Remotion TS7→5.9 降级 / HyperFrames check 五类静态闸门 / Motion Canvas puppeteer 可编程渲染 | 附录踩坑实录 |
| 90–106s | S6 评分修订 | 评分条 [3,4,4] 高亮→与实测矛盾→动画重排 [5,3,3]，「数据驱动修订，三轮复测排序不变」 | §4 评分修订记录 |
| 106–120s | S7 结语 | 三句选型建议逐条点亮 + 「没有最好，只有最合适」淡黑收尾 | §7 / 结语 |

视觉沿用既有 tokens（bg #0B0D12 / panel #141926 / text #F2F4F8 / muted #8B93A7 /
品牌色 #3B82F6 · #F97316 · #10B981；PingFang SC；缓动 power3.out 近似曲线，与既有
HyperFrames 实现一致）。图表设计遵循 dataviz skill 规范（实现阶段加载）。

## 4. 旁白

- 每场景 1-3 句，总字数 ≤540 字（≈4.5 字/秒 × 120s 留余量）；逐句窗口写入
  `docs/storyboard-report.md` 旁白表（起点/窗口/rate），复用既有管线模式
  （逐句生成 → ffmpeg adelay 拼装 → ffprobe 校验起点误差 ≤0.2s）。
- 超窗处理与既有规则一致：先 `--rate`（≤+20%）后精简话术，改动同步回 storyboard-report。

## 5. 工程约束

- `hyperframes-report/` 用 `npx hyperframes init` 脚手架，必须带 `HYPERFRAMES_SKIP_SKILLS=1`
  与项目内 `npm_config_cache`（防写 home 目录，教训见 report.md 踩坑 2）。
- GSAP 从 `hyperframes/vendor/gsap.min.js` 复制，本地引用，无 CDN。
- 已知实现规则直接沿用（report.md 踩坑 3/4：淡出显式 hard-kill；字体显式 @font-face）。
- 不写 home 目录；commit 中文 message + Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>。

## 6. 验证标准

- `npx --yes hyperframes@0.7.71 check` 0 error。
- ffprobe：1920×1080 / 30fps / 119–120.5s / 含 aac 音频流。
- 7 张场景中点静帧目检：图表数字与 report.md 逐值一致、文字无溢出重叠。
- 旁白句起点与场景边界对齐（≤0.2s）。

## 7. 明确不做（YAGNI）

- 不做 BGM/音效/字幕；不做三支成片画中画。
- 不改动现有三支 30s 视频、报告、benchmark。
- 不做多分辨率/多语言版本。
