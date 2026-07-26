# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目
三框架（Remotion / HyperFrames / Motion Canvas）实现同一支 30s 对比视频。
唯一内容依据：docs/storyboard.md。规格：1920×1080·30fps·30s·含旁白音轨。

## 常用命令
- 首次初始化（fresh clone 前置）：`python3 -m venv .venv && .venv/bin/pip install edge-tts`
- 旁白生成：`bash scripts/build-voiceover.sh`（产出 assets/voiceover.mp3，依赖上一步的 .venv/bin/edge-tts）
- Remotion 预览：`cd remotion && npx remotion studio`
- Remotion 渲染：`cd remotion && npx remotion render src/index.ts Compare ../output/remotion.mp4`
- HyperFrames 预览：`cd hyperframes && npx --yes hyperframes@0.7.71 preview`
- HyperFrames 校验：`cd hyperframes && npx --yes hyperframes@0.7.71 check`
- HyperFrames 渲染：`cd hyperframes && npx --yes hyperframes@0.7.71 render --quality high --output ../output/hyperframes.mp4`
  （音频为原生挂载：index.html 内 `<audio>` 元素直接引用 `assets/voiceover.mp3`，无需后期 ffmpeg 混流；
  首次执行需 `export npm_config_cache=<项目内目录>` 规避 `~/.npm` 缓存权限问题，并设 `HYPERFRAMES_SKIP_SKILLS=1`
  避免 `init`/`skills` 向 home 目录写入全局 skills，详见 docs/report.md 附录「踩坑实录」）
- 报告视频旁白：`bash scripts/build-voiceover-report.sh`（产出 assets/voiceover-report.mp3）
- 报告讲解视频渲染：`cd hyperframes-report && npx --yes hyperframes@0.7.71 render --quality high --output ../output/report-video.mp4`
- Motion Canvas 编辑器：`cd motion-canvas && npm start`
- Motion Canvas 渲染：`node scripts/render-motion-canvas.mjs`（产出 `output/motion-canvas.mp4`）
  （**非一等 CLI**：Motion Canvas 3.17.2 无官方 headless 渲染入口，本脚本用 puppeteer-core
  驱动系统 Chrome 打开 `motion-canvas/render.html`，在浏览器上下文里直接调用
  `@motion-canvas/core` 的 `Renderer` API + `@motion-canvas/ffmpeg` 导出链路——是「可编程渲染」
  而非模拟点击编辑器 UI 按钮；音频为原生混流（FFmpegExporterServer 直接接收
  `assets/voiceover.mp3`）。首次渲染前脚本会自动跑一次极短「预热」渲染，
  规避 vite optimizeDeps 首次发现依赖时的强制刷新把正式渲染冲断的问题；
  详见 docs/report.md 附录「踩坑实录」）
- 基准测试：`node scripts/benchmark.mjs`

## 约束
- 所有权限/skills 只放项目 .claude/，不写 home 目录；Python 用项目 .venv/。
- 三实现的文案、时间轴、色板必须与 docs/storyboard.md 完全一致。
