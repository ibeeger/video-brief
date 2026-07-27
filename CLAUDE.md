# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目
HyperFrames 视频生成基础环境。唯一出片框架是 HyperFrames——新视频一律用它，
不再引入 Remotion / Motion Canvas 等其它框架。

现有两支成片项目：`hyperframes/`（30s 框架对比片，内容依据 docs/storyboard.md）、
`hyperframes-report/`（报告讲解片，内容依据 docs/storyboard-report.md）。
规格：1920×1080·30fps·含旁白音轨。

## 常用命令
- 首次初始化（fresh clone 前置）：`python3 -m venv .venv && .venv/bin/pip install edge-tts`
- 旁白生成：`bash scripts/build-voiceover.sh`（产出 assets/voiceover.mp3，依赖上一步的 .venv/bin/edge-tts）
- HyperFrames 预览：`cd hyperframes && npx --yes hyperframes@0.7.71 preview`
- HyperFrames 校验：`cd hyperframes && npx --yes hyperframes@0.7.71 check`
- HyperFrames 渲染：`cd hyperframes && npx --yes hyperframes@0.7.71 render --quality high --output ../output/hyperframes.mp4`
  （音频为原生挂载：index.html 内 `<audio>` 元素直接引用 `assets/voiceover.mp3`，无需后期 ffmpeg 混流；
  首次执行需 `export npm_config_cache=<项目内目录>` 规避 `~/.npm` 缓存权限问题，并设 `HYPERFRAMES_SKIP_SKILLS=1`
  避免 `init`/`skills` 向 home 目录写入全局 skills，详见 docs/report.md 附录「踩坑实录」）
- 报告视频旁白：`bash scripts/build-voiceover-report.sh`（产出 assets/voiceover-report.mp3）
- 报告讲解视频渲染：`cd hyperframes-report && npx --yes hyperframes@0.7.71 render --quality high --output ../output/report-video.mp4`

## 新开一支视频
先走 `/video-brief`（project skill，`.claude/skills/video-brief/`）：它把需求逼成可执行 `BRIEF.md`
（形容词必须翻译成参数）、锁定一个风格预设（apple-restraint / data-journalism / saas-dark /
vertical-feed）、再生成 HyperFrames 项目骨架，然后交棒给 hyperframes-* 系列做动效与渲染。
规范来源：docs/VIDEO_BRIEF.template.md；设计记录：docs/superpowers/specs/2026-07-26-video-brief-skill-design.md。

## 约束
- 所有权限/skills 只放项目 .claude/，不写 home 目录；Python 用项目 .venv/。
- 出片框架只用 HyperFrames。不要再往仓库里加 Remotion / Motion Canvas 等其它框架的项目或渲染脚本。
- `.claude/skills/` 下除 `video-brief` 外均由 `skills-lock.json` 从上游 heygen-com/hyperframes 管理。
  自建 skill 不得写入 lock，否则 `hyperframes skills` 升级会冲掉它。
  （`remotion-to-hyperframes` 是上游提供的 Remotion→HyperFrames 单向移植 skill，属 HyperFrames 能力，保留。）

## 历史存档
`docs/report.md`、`docs/storyboard.md`、`docs/superpowers/{plans,specs}/2026-07-25-*` 与
`output/benchmark.json` 记录的是 2026-07 三框架对比实验。实验已结束，Remotion / Motion Canvas
的代码与渲染脚本已从仓库移除，这些文档仅作历史存档，不再对应可运行的代码。
