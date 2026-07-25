# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目
三框架（Remotion / HyperFrames / Motion Canvas）实现同一支 30s 对比视频。
唯一内容依据：docs/storyboard.md。规格：1920×1080·30fps·30s·含旁白音轨。

## 常用命令
- 旁白生成：`bash scripts/build-voiceover.sh`（产出 assets/voiceover.mp3）
- Remotion 预览：`cd remotion && npx remotion studio`
- Remotion 渲染：`cd remotion && npx remotion render src/index.ts Compare ../output/remotion.mp4`
- HyperFrames 预览：`cd hyperframes && npx --yes hyperframes@0.7.71 preview`
- HyperFrames 校验：`cd hyperframes && npx --yes hyperframes@0.7.71 check`
- HyperFrames 渲染：`cd hyperframes && npx --yes hyperframes@0.7.71 render --quality high --output ../output/hyperframes.mp4`
  （音频为原生挂载：index.html 内 `<audio>` 元素直接引用 `assets/voiceover.mp3`，无需后期 ffmpeg 混流；
  首次执行需 `export npm_config_cache=<项目内目录>` 规避 `~/.npm` 缓存权限问题，并设 `HYPERFRAMES_SKIP_SKILLS=1`
  避免 `init`/`skills` 向 home 目录写入全局 skills，详见 .superpowers/sdd/2026-07-25-video-framework-comparison/task-6-report.md）
- Motion Canvas 编辑器：`cd motion-canvas && npm start`
- 基准测试：`node scripts/benchmark.mjs`

## 约束
- 所有权限/skills 只放项目 .claude/，不写 home 目录；Python 用项目 .venv/。
- 三实现的文案、时间轴、色板必须与 docs/storyboard.md 完全一致。
