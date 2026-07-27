# aigenVideo

用 AI Agent 批量产出**程序化视频**的基础环境。唯一出片框架是
[HyperFrames](https://github.com/heygen-com/hyperframes)——写 HTML 即分镜，浏览器逐帧捕获成片。

核心主张：**形容词不可执行，参数才可执行。**
「高级感」「节奏明快」这类词，agent 只会翻译成训练数据里最平庸的那一版。所以本仓库把
「需求 → 成片」拆成两段，中间强制隔一层规范：

```
模糊需求 ──/video-brief──▶ BRIEF.md（形容词全部换成数值/色码/明确动作）
                              │
                              ├─ 锁定一个风格预设
                              ▼
                        HyperFrames 项目骨架 ──hyperframes-* skills──▶ MP4
```

## 环境准备

| 依赖 | 用途 | 备注 |
|---|---|---|
| Node.js 18+ | `npx hyperframes` 全部命令 | 实测 v22 |
| Chrome | HyperFrames 无头渲染 | 系统安装即可 |
| ffmpeg / ffprobe | 旁白合轨与时长核对 | 实测 7.1 |
| Python 3 + edge-tts | TTS 生成旁白 | 见下 |

fresh clone 后先建虚拟环境（**必须用项目内 `.venv/`**，不写 home 目录）：

```bash
python3 -m venv .venv && .venv/bin/pip install edge-tts
```

首次跑 HyperFrames 命令前，建议设两个环境变量，规避两个已知坑
（详见 `docs/report.md` 附录「踩坑实录」）：

```bash
export npm_config_cache="$PWD/.npm-cache"   # 规避 ~/.npm 缓存权限问题
export HYPERFRAMES_SKIP_SKILLS=1            # 阻止 init/skills 往 home 写全局 skills
```

## 新开一支视频

在 Claude Code 里走 `/video-brief`（项目自建 skill，`.claude/skills/video-brief/`）。
它有五道 gate，按顺序走、不允许跳跃：

| Gate | 做什么 | 产物 |
|---|---|---|
| 0 | 路由——判断该不该用本 skill | — |
| 1 | 填 `BRIEF.md`，未定项留 `TBD` 哨兵 | `BRIEF.md` |
| 2 | 把每个形容词翻译成参数 | 同上，`TBD` 清零 |
| 3 | 锁定一个风格预设 | 色板 / 字体 / 动效 / 转场 / 节奏 tokens |
| 4 | BRIEF 场景表 → `index.html` | HyperFrames 项目骨架 |

其中四项**必须由需求方给出**，agent 不得代拟：§1 产出目标（只允许一个——两个以上
agent 会两个都做不好）、§2 受众·观看场景（是否静音刷流直接决定字幕是不是必需）、
§3 规格·时长与画幅（时长决定场景数上限，画幅决定安全区）、§5 场景清单（每场时长
直接变成 `data-duration`）。其余各节 agent 可给默认值，但必须在 BRIEF 里标注是补的。

Gate 2 通过前不允许写任何 CSS / HTML / tokens——已经写了的删掉重来。

四个内置风格预设：

| 预设 | 参照与核心原则 |
|---|---|
| `apple-restraint` | 基准预设，不确定选哪个时选它。高级感来自减东西、放慢、留白 |
| `data-journalism` | Bloomberg / 财新 / FT。图表是主角，字卡是注解；可信度来自节制 |
| `saas-dark` | Linear / Vercel / Raycast。深底 + 冷光晕 + 玻璃卡片，光是唯一的装饰 |
| `vertical-feed` | 抖音 / Reels / Shorts。静音、竖屏、三秒定生死，几乎每条都与 `apple-restraint` 相反 |

骨架建好后交棒给 `hyperframes-*` 系列 skill 做动效与渲染
（`hyperframes-core` 契约 / `hyperframes-animation` 动效 / `hyperframes-cli` 渲染 /
`motion-doctrine` 运镜法则 / `media-use` 素材）。

规范模板：`docs/VIDEO_BRIEF.template.md`。

## 目录结构

```
.claude/skills/     # 全部 skill；除 video-brief 外由 skills-lock.json 从上游管理
docs/               # 规范模板、分镜、设计记录、历史报告
scripts/            # 旁白生成（edge-tts + ffmpeg 合轨）
assets/             # 共享旁白音轨与分段 TTS
output/             # 成片产物（mp4 已 gitignore）

hyperframes/        # 成片项目：30s 框架对比片
hyperframes-report/ # 成片项目：报告讲解片
video-brief-demo/   # 示例项目：/video-brief 全流程走通的产物（含 BRIEF.md）
```

每个成片项目是一个独立 HyperFrames 工程：`index.html`（分镜本体）+ `hyperframes.json`
（配置）+ `assets/`（音轨等）+ `vendor/`（GSAP 等本地依赖）。

## 常用命令

旁白（先跑，`index.html` 的 `<audio>` 直接引用产物，无需后期混流）：

```bash
bash scripts/build-voiceover.sh          # → assets/voiceover.mp3
bash scripts/build-voiceover-report.sh   # → assets/voiceover-report.mp3
bash scripts/build-voiceover-demo.sh     # → video-brief-demo/assets/voiceover-demo.mp3
```

脚本里每段 TTS 的**起点 ms 是硬编码的**，改文案后必须重新核对各段时长与场景起点是否还对得上，
脚本末尾会打印实测时长供比对。

预览 / 校验 / 渲染（以 `hyperframes/` 为例，其余项目同构）：

```bash
cd hyperframes
npx --yes hyperframes@0.7.71 preview
npx --yes hyperframes@0.7.71 check
npx --yes hyperframes@0.7.71 render --quality high --output ../output/hyperframes.mp4
```

`check` 提供 Lint / Runtime / Layout / Motion / Contrast 五类静态检查，是提交前的质量闸门。

## skills 约定

- `.claude/skills/` 下**除 `video-brief` 外**全部由 `skills-lock.json` 从上游
  `heygen-com/hyperframes` 管理。自建 skill 不得写入 lock，否则 `hyperframes skills`
  升级会把它冲掉。
- 所有权限与 skill 只放项目 `.claude/`，不往 home 目录写。

## 历史存档

`docs/report.md`、`docs/storyboard.md`、`docs/superpowers/{plans,specs}/2026-07-25-*`
与 `output/benchmark.json` 记录的是 2026-07 的 Remotion / HyperFrames / Motion Canvas
三框架实测对比实验。实验已结束，另两个框架的代码与渲染脚本已从仓库移除
（commit `8b9feda`），这些文档**仅作历史存档，所述命令不再可复现**。

结论保留一句：工程团队选 Remotion，Agent 管线选 HyperFrames，教学演示选 Motion Canvas。
本仓库的定位是 Agent 管线，所以留下了 HyperFrames。
