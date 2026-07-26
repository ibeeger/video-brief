# Remotion vs HyperFrames vs Motion Canvas 实测对比报告

数据来源：`output/benchmark.json`（三框架各 3 次冷启动渲染实测）、`wc -l` 代码行数实测、
`.superpowers/sdd/2026-07-25-video-framework-comparison/task-4..8-report.md` 开发过程实录、
三支成片 `ffprobe`/截帧人工核对。全部数据均来自实测，不凭空给结论。

## 结论速览

| 维度 | Remotion | HyperFrames | Motion Canvas |
|---|---|---|---|
| 上手成本(满=易) | 3 | 5 | 3 |
| 生态成熟度 | 5 | 2 | 3 |
| 渲染速度（实测修订后） | 5 | 3 | 3 |
| Agent 友好度 | 4 | 5 | 3 |
| 渲染耗时均值（3 次） | 13.81s | 22.04s | 22.86s |
| 产物体积 | 2.33 MB | 2.50 MB | 0.79 MB |
| 代码行数 | 425 行 | 530 行 | 731 行（含渲染脚本） |

一句话选型建议：

- **工程团队** 选 **Remotion**——React 声明式组件模型、TS 类型系统、成熟的 Studio/Lambda 生态，渲染速度实测也最快，适合长期维护的生产管线。
- **Agent 管线** 选 **HyperFrames**——写 HTML 即分镜，`check`/`lint` 提供确定性质量闸门，评分体系里 Agent 友好度实测最高（5），最适合让 AI 生成并自我校验。
- **教学演示** 选 **Motion Canvas**——生成器语法把动画写成可读的"时间脚本"，配实时可视化编辑器，最适合边讲解边改数值的课堂/演示场景，产物体积也最小、便于分享。

## 实验设置

同一分镜脚本 `docs/storyboard.md`（唯一内容依据）、同一段旁白音轨 `assets/voiceover.mp3`
（`bash scripts/build-voiceover.sh` 统一生成）、同一台机器（macOS/darwin，本机已装 Chrome/FFmpeg，
无额外网络依赖）。三实现规格统一为 1920×1080·30fps·30s（900 帧），六场景时间轴、文案、配色 token
逐字一致，详见 `docs/superpowers/specs/2026-07-25-video-framework-comparison-design.md` 与
`docs/storyboard.md`。

## 1 开发体验

- **脚手架**：Remotion（`npm i remotion @remotion/cli react react-dom`，手工搭建，见
  task-4-report.md）与 Motion Canvas（`npm init @motion-canvas@latest` 需要交互式输入，本环境不可用，
  改为手写等价 `package.json`/`vite.config.ts`/`tsconfig.json`，见 task-7-report.md）都靠手工搭建；
  HyperFrames 有 `npx hyperframes init` 一键脚手架（task-6-report.md），起步最快。
- **热预览**：Remotion `npx remotion studio`、HyperFrames `npx hyperframes preview`、Motion Canvas
  `npm start`（vite 编辑器）均提供交互式时间线预览，三者体验接近。
- **调试**：Remotion 是 React 组件树 + `useCurrentFrame()`，用浏览器 DevTools 直接调；HyperFrames
  的 `check` 命令提供 Lint/Runtime/Layout/Motion/Contrast 五类静态检查（见下"踩坑实录"）；
  Motion Canvas 的 `Logger` 默认不打 `console`，出错时静默吞掉异常（DX 问题 4），需要手动订阅
  `project.logger.onLogged` 才能看见真实报错，调试体验在三者中最差。
- **文档质量**：Remotion 官方文档成熟、案例丰富；HyperFrames 存在"文档已提示但默认行为仍会踩坑"的
  情况（`--skip-skills` 标注 "temporarily ignored"，必须改用环境变量，见踩坑 2）；Motion Canvas
  官方文档缺一等 headless CLI 说明，需要翻上游 GitHub issue（#415、#1218）才能确认"无一等 CLI"是
  已知限制而非我们用法有误。

## 2 代码量与可读性

`wc -l` 实测（`remotion/src/*.ts*`、`hyperframes/index.html`、`motion-canvas/src/**/*.ts*` +
`scripts/render-motion-canvas.mjs`）：

| 实现 | 文件 | 行数 |
|---|---|---|
| Remotion | `src/index.ts` | 3 |
| Remotion | `src/tokens.ts` | 55 |
| Remotion | `src/Root.tsx` | 6 |
| Remotion | `src/scenes.tsx` | 361 |
| **Remotion 合计** | | **425** |
| HyperFrames | `index.html`（单文件 monolithic） | **530** |
| Motion Canvas | `src/motion-canvas-env.d.ts` | 11 |
| Motion Canvas | `src/project.ts` | 7 |
| Motion Canvas | `src/render-entry.ts` | 104 |
| Motion Canvas | `src/scenes/compare.tsx` | 329 |
| Motion Canvas | `src/tokens.ts` | 56 |
| Motion Canvas | `scripts/render-motion-canvas.mjs`（自建渲染管线，计入总成本） | 224 |
| **Motion Canvas 合计** | | **731** |

可读性观察：

- Remotion 最精简（425 行）——React 函数组件 + `interpolate()` 声明式表达时间轴，`Sequence` 天然
  分场景，读者一眼能对上 storyboard 的时间点。
- HyperFrames 单文件 530 行，`check` 曾建议拆成 `compositions/*.html` 子组合（`timeline_track_too_dense`
  告警，见踩坑 5），但本项目规模（~450 行有效动画代码）下 monolithic 结构复杂度增量小于拆分收益，
  故保留单文件。
- Motion Canvas 总成本最高（731 行），原因是**官方无一等 headless CLI**（详见"6 生态与扩展"），
  224 行的 `render-motion-canvas.mjs` 渲染脚本（vite 启动、puppeteer-core 驱动、预热渲染、日志转发）
  是场景代码之外必须自行承担的基础设施成本，若只看场景逻辑本身（`compare.tsx` 329 行 + `tokens.ts`
  56 行 = 385 行）则与 Remotion 相近。

## 3 学习曲线

- **Remotion**：心智模型是"纯函数 = 每一帧"，熟悉 React 的团队几乎零学习成本；主要门槛是理解
  `useCurrentFrame`/`interpolate`/`Sequence` 的时间语义。评分表"上手成本"给 3，因为不熟悉 React
  的团队仍需先学 React。
- **HyperFrames**：写普通 HTML/CSS + `class="clip"`/`data-*` 时间属性即可出片，前端背景的人几乎
  不需要学新范式；但 GSAP 时间线模型有"因果关系需要额外硬约束"的心智负担（淡出动画结束点必须显式
  `hard-kill` 才能通过 lint，见踩坑 3），系统字体也必须显式 `@font-face` 声明（踩坑 4），这些是
  与浏览器默认行为不同的强制项，初次接触会踩坑，但一旦知道规则后上手很快。评分表"上手成本"给 5，
  与实录一致（起步最快，踩坑集中在少数几类且有工具（check/lint）提前告警）。
- **Motion Canvas**：生成器语法 `yield*`/`waitFor`/`all()` 描述动画序列，读起来像"时间脚本"，
  对没写过生成器/协程的人有一次性的范式门槛；且脚手架、CJS/ESM 互操作（DX 问题 1）、冷启动丢帧
  （DX 问题 2）等基础设施层面的坑，需要较深的 vite/Node 模块系统知识才能定位，不是"写业务代码"
  层面的学习曲线，而是"打通渲染管线"层面的学习曲线。评分表"上手成本"给 3。

## 4 渲染性能

`output/benchmark.json` 完整实测（同一轮 3×3 渲染，未拼接）：

| 目标 | 单次耗时(s) | 均值(s) | 标准差(s) | 峰值 RSS(MB) | 产物体积 | 时长(probe) | 码率 |
|---|---|---|---|---|---|---|---|
| remotion | 13.59 / 13.91 / 13.92 | **13.81** | 0.15 | 748 | 2,332,129 B (2.33 MB) | 30.058667s | 620,687 bps |
| hyperframes | 22.02 / 22.13 / 21.98 | **22.04** | 0.06 | 845 | 2,499,690 B (2.50 MB) | 30.016000s | 666,228 bps |
| motion-canvas | 22.86 / 22.84 / 22.89 | **22.86** | 0.02 | 799 | 786,462 B (0.79 MB) | 30.033333s | 209,490 bps |

测量口径说明（如实带上，不省略边界）：

- **计时**：统一采用端到端冷启动墙钟时间。Motion Canvas 的均值含 vite dev server 冷启动 + 0.2s
  预热渲染 + 5s 稳定等待，这是其官方渲染链路（**无一等 headless CLI**，靠 puppeteer-core 驱动浏览器
  调用 `Renderer` API）固有的固定开销；按控制器裁决不从计时中扣除，此数字与 Remotion/HyperFrames
  的"纯渲染耗时"不完全同质，不代表 Motion Canvas 渲染引擎本身更慢（详见 task-7/8-report.md）。
- **内存**：`peakRssMb` 由 `/usr/bin/time -l` 采集，只测得到每个目标命令的**直接子进程**
  （npx/node），三者的渲染链路都会再往下 spawn 无头 Chrome（Remotion/HyperFrames 经各自的 puppeteer
  依赖，Motion Canvas 经渲染脚本自行 spawn 的 vite + puppeteer-core），测不到更深层 Chrome 子进程的
  真实峰值，如实记录此边界内的观测值，不代表整条渲染链路的真实峰值内存（`memNote` 字段原文）。
- **体积**：Motion Canvas 产物（0.79 MB）明显小于另两者（2.33/2.50 MB），码率 209k bps vs
  620k/666k bps 差了近 3 倍。已用 `-count_frames` 确认帧数正确（901 帧，见 task-7-report.md），目视
  截帧确认画面正确——这是编码器/CRF 默认设置在本片大面积纯色背景下高度可压缩造成的**编码码率差异，
  非画质/正确性问题**，不应误读为"漏帧"或"画质缩水"。

### 评分修订记录（数据驱动裁决）

S5「渲染速度」画面设计值原为 `[3, 4, 4]`（Remotion/HyperFrames/Motion Canvas），与首轮 benchmark
实测（Remotion 14.17s 最快，HyperFrames 23.96s、Motion Canvas 22.86s 更慢）明显矛盾。按
`docs/storyboard.md` 既定规则（"评分：画面设计值；benchmark 后若与实测明显矛盾，三实现同步修订"）
裁决修订为 **`[5, 3, 3]`**，同步修改四处并保持逐字一致：`docs/storyboard.md` S5 评分表、
`remotion/src/tokens.ts`、`hyperframes/index.html` 对应 `data-score`、`motion-canvas/src/tokens.ts`，
随后重跑 `node scripts/benchmark.mjs` 完整重渲染三支成片并刷新 `benchmark.json`。复审阶段又完整重跑
一轮全新 3×3（本报告表格中的最终数值），结果同向：Remotion 13.81s 仍明显最快，验证修订成立。

## 5 成品质量

三支成片的截帧对比（4s 转场、22s 转场、26.5s 评分条局部）一致性核对：

- **4.1s（S1→S2 转场）**：三者均在同一时刻出现品牌蓝竖条 + 左上角序号 "01"，画面构图、字体
  （Menlo 序号字体）、竖条粗细完全一致，转场对齐无误差。
- **26.5s（S5 评分表"渲染速度"行）**：三者的评分条比例视觉一致——Remotion 满条（5/5）、
  HyperFrames 与 Motion Canvas 均为约 3/5 长度，与本次评分修订后的 `[5,3,3]` 完全对应，标签文字
  「渲染速度」、表头 Remotion/HyperFrames/Motion Canvas（品牌色）、其余三行（上手成本/生态成熟度/
  Agent 友好度）评分条长度三者一致。
- **文字渲染**：中文字体三者均为 "PingFang SC"，数字/西文 system-ui，Menlo 序号字体，无缺字/
  乱码/溢出。HyperFrames 需要显式 `@font-face` 声明才能让 `check` 通过（踩坑 4），确认字体确实按
  预期渲染而非回退到通用字体。
- **动效还原度**：卡片入场（500×180px 上浮弹入）、评分条宽度补间、S1 三框架名错峰淡入等动效三者
  逐帧核对（task-5/6/7-report.md 均有独立静帧自查记录）均与 `docs/storyboard.md` 时间点吻合，唯一
  已知偏差是 HyperFrames 的缓动函数用 GSAP `power3.out` **近似**替代 storyboard 规定的
  `cubic-bezier(0.22,1,0.36,1)`（brief 授权 + 官方 skill house default，非精确复刻，肉眼差异极小，
  详见"附录"）。

## 6 生态与扩展

- **原生音频支持方式**（三者均为原生挂载，无一方被迫走后期 ffmpeg 二次混流降级路径）：
  - **Remotion**：`<Audio src={staticFile('voiceover.mp3')} />`，声明式组件直接挂载。
  - **HyperFrames**：原生 `<audio id="voiceover" src="assets/voiceover.mp3" data-start="0"
    data-duration="30" data-track-index="10">`，框架级音频轨道，渲染日志 `hasAudio:true`。
  - **Motion Canvas**：`@motion-canvas/ffmpeg` 的 `FFmpegExporterServer` 在服务端把
    `project.ts` 里 `audio: '/voiceover.mp3'` 声明的音频文件直接喂给 ffmpeg 做混流——机制上属于
    "渲染管线自带的原生混流"，但实现上比另两者更曲折：音频路径是**相对 vite 进程 cwd** 解析的，不是
    相对 `public/`（DX 问题 3），若不修复会导致浏览器播放用的音频文件与 ffmpeg 实际读取的文件是两个
    不同位置。修复后属正常挂载，非后期二次混流。
- **生态成熟度**（评分 Remotion 5 / HyperFrames 2 / Motion Canvas 3，画面设计值，未触发实测修订）：
  Remotion 有 Studio 预览、Lambda 云渲染、庞大 npm 生态；HyperFrames 生态最新最小；Motion Canvas
  有实时编辑器但缺一等 headless CLI，上游 issue #415/#1218 长期未解决，社区共识是真正需要
  headless/CI 渲染的项目会转向 fork 项目 Revideo。
- **Agent 友好度**（评分 Remotion 4 / HyperFrames 5 / Motion Canvas 3）：HyperFrames "写 HTML 即
  分镜"的心智模型加上 `check` 的五类静态检查（Lint/Runtime/Layout/Motion/Contrast）天然适合 AI
  生成后自我校验，是三者中 Agent 管线最友好的一个；Motion Canvas 的生成器语法与缺 CLI 的渲染链路
  对自动化管线不友好（需要额外封装 puppeteer 脚本才能跑通，即本报告"2 代码量"里 224 行的
  `render-motion-canvas.mjs`）。

## 7 适用场景结论

- **Remotion → 工程团队**：React 心智模型、类型系统、成熟渲染管线（Studio/Lambda）、实测渲染
  速度三者中最快（13.81s），代码量最省（425 行），最适合需要长期维护、CI 集成、多人协作的生产级
  视频管线。
- **HyperFrames → Agent 管线**：HTML 即分镜的低门槛 + `check` 静态校验闸门，Agent 友好度评分最高，
  最适合"AI 生成 → 自动校验 → 批量渲染"的自动化内容管线，但生态成熟度目前最弱，第三方组件/案例
  较少。
- **Motion Canvas → 教学演示**：生成器语法把动画过程写成可读的"时间脚本"，配合实时编辑器所见即所得，
  最适合课堂讲解、代码与图形演示同步的场景；渲染管线（无一等 CLI）目前不适合自动化生产环境，产物
  体积最小、码率最低，适合快速分享预览而非最终交付画质。

结语与 S6 画面台词一致："没有最好，只有最合适" —— 工程团队选 Remotion，Agent 管线选 HyperFrames，
教学演示选 Motion Canvas。

## 附录：一致性终检

`ffprobe` 三支成片规格核对（`for f in output/*.mp4; do ffprobe ...; done`）：

| 文件 | 分辨率 | 帧率 | 时长 | 视频编码 | 音频编码 |
|---|---|---|---|---|---|
| output/remotion.mp4 | 1920×1080 | 30/1 | 30.058667s | h264 | aac ✓ |
| output/hyperframes.mp4 | 1920×1080 | 30/1 | 30.016000s | h264 | aac ✓ |
| output/motion-canvas.mp4 | 1920×1080 | 30/1 | 30.033333s | h264 | aac ✓ |

三者均在 30±0.5s 规格内，均为 1920×1080/30fps，均含 1 条 aac 音频流，与
`docs/storyboard.md` 规格（1920×1080·30fps·30s·含旁白音轨）一致。

截帧转场核对（`ffmpeg -ss <t> -frames:v 1`）：

- **4.1s（S1→S2）**：三支成片同一时刻均已进入 S2 章节页（品牌蓝竖条 + 序号 "01"），转场对齐，无
  偏差。
- **26.5s（S5 评分条局部）**：三支成片"渲染速度"行评分条长度一致对应修订后的 `[5,3,3]`，其余三行
  评分条、表头颜色、标题文字逐一比对一致。

## 附录：踩坑实录

### Remotion（task-4/5-report.md）
- **TypeScript 版本降级**：初始安装 TypeScript@7.0.2 与 Remotion 的 esbuild-loader 不兼容
  （`npm i -D typescript@5` 降级到 5.9.3 后解决）。
- S5 首行标签一度漏掉「(满=易)」括号后缀，复审后订正为与 storyboard 逐字一致的
  「上手成本(满=易)」。

### HyperFrames（task-6-report.md）
1. **npm 全局缓存权限阻塞**：`npx hyperframes init` 因 `~/.npm/_cacache` 内 root 属主历史遗留文件
   报 `EACCES`，需将 `npm_config_cache` 指向项目内 `.npm-cache/` 规避。
2. **`init`/`skills` 默认写 home 目录，`--skip-skills` 标注已失效**：必须改用环境变量
   `HYPERFRAMES_SKIP_SKILLS=1` 才能规避向 `~/.claude/skills/`、`~/.agents/` 写入全局 skill 包，
   与项目"不写 home 目录"的约束冲突；本次 init 已产生的 home 目录残留因权限系统拒绝
   `rm -rf` 无法在会话内清理，需用户手动处理。
3. **GSAP `opacity` 淡出需要显式 hard-kill**：场景整体淡出结束点恰好落在下一分镜边界时，
   `check` 报 `gsap_exit_missing_hard_kill`，需要额外 `tl.set(...,{opacity:0}, <边界时刻>)` 才能
   通过，是 GSAP 时间线模型特有的心智成本。
4. **系统字体需要显式 `@font-face` 声明**：即使是 macOS 系统自带字体（"PingFang SC"），也必须显式
   声明 `@font-face { font-family: "PingFang SC"; src: local("PingFang SC"); }` 才能满足
   `font_family_without_font_face` 检查，否则渲染器回退到通用字体。
5. **`timeline_track_too_dense` 告警**：6 个场景全部挂在同一 track（monolithic 单文件），`check`
   建议拆成子组合，仅为 info 级告警不阻断渲染，本项目规模下判断保留 monolithic 结构收益更高。
6. **已知偏差**：GSAP 缓动用 `power3.out` 近似 storyboard 规定的
   `cubic-bezier(0.22,1,0.36,1)`（brief 授权 + 官方 skill house default，非精确复刻）。

### Motion Canvas（task-7-report.md）
1. **CJS/ESM interop 崩溃**：`@motion-canvas/vite-plugin`/`@motion-canvas/ffmpeg` 是纯 CJS 包，
   官方脚手架样板 `import x from '...'` 写法在 Vite 5.4 + Node 22 组合下拿到的是整个
   `module.exports` 对象而非可调用插件函数（`TypeError: motionCanvas is not a function`），
   需改用 `createRequire(import.meta.url)` 走原生 CJS `require().default`。
2. **冷启动丢帧**：全新 vite dev server 上直接发起 900 帧渲染，会在渲染到中途被 vite 的
   `optimizeDeps` 强制刷新打断（`@motion-canvas/ffmpeg/lib/client` 是运行时经 `?project` 虚拟模块
   动态 `import()` 进来的，esbuild 依赖扫描发现不了，只能等页面首次加载时触发"发现新依赖 →
   重新预打包 → 强制整页刷新"），把正在进行的渲染连根拔起。修法：先跑 0.2s 极短"预热渲染"主动
   引爆这次刷新，`sleep 5s` 等其稳定，再发起真正渲染。
3. **音频路径解析陷阱**：`FFmpegExporterServer` 把 `project.ts` 里 `audio: '/voiceover.mp3'`
   `.slice(1)` 后当**相对 vite 进程 cwd** 的路径直接喂给 ffmpeg，不是相对 `public/`，浏览器播放
   用的文件和 ffmpeg 实际读取的文件原生对不上；修法是渲染前把音频同时复制到 `public/voiceover.mp3`
   （浏览器用）和 `motion-canvas/voiceover.mp3`（ffmpeg cwd 相对路径用）。
4. **Logger 静默吞错误**：`@motion-canvas/core` 的 `Logger.error()`/`warn()` 只 dispatch 事件，
   从不调用 `console.error`，无 UI 环境下渲染失败会完全无声无息；需手动订阅
   `project.logger.onLogged` 转发到 `console.error` 才能定位真实报错。
5. **无一等 headless CLI**：官方渲染面板本质是"真实浏览器 + vite dev server"环境下才能跑的导出
   链路（`FFmpegExporterClient.invoke()` 硬依赖 `import.meta.hot`），上游 issue #415/#1218 长期
   未解决，社区共识转向 fork 项目 Revideo；本项目选择绕开编辑器 UI，直接调用与编辑器同一条内部
   API（`import project from './project?project'` + `new Renderer(project)`），属"可编程渲染"而
   非一等 CLI。
6. **产物体积偏小非画质问题**：`output/motion-canvas.mp4` 体积（0.79 MB）明显小于另两者
   （2.33/2.50 MB），已用 `-count_frames` 确认帧数正确（901 帧），是 libx264 默认 CRF 与本片大面积
   纯色背景高度可压缩共同导致的编码码率差异（209k bps vs 620k/666k bps），非渲染缺陷。
7. **计时含固定开销**：端到端墙钟时间（22.86s 均值）含 vite 冷启动 + 0.2s 预热渲染 + 5s 稳定等待，
   这部分是官方渲染链路（无一等 headless CLI）固有的固定成本，按控制器裁决不从计时中扣除，仅在
   `benchmark.json` 对应条目加 `note` 字段说明背景，避免读者误读为"渲染引擎本身更慢"。

### 基准测试执行过程（task-8/9-report.md）
- **峰值内存测量边界**：`/usr/bin/time -l` 只测得到每个目标命令的直接子进程（npx/node），测不到
  再往下 spawn 的无头 Chrome 子进程真实峰值，`benchmark.json` 每条结果都带 `memNote` 字段如实说明
  这一边界，不外推、不伪造。
- **hyperframes 首次运行 SD 偏高**：`npx --yes hyperframes@0.7.71` 即使命中项目内 `.npm-cache`，
  仍可能有版本解析/校验开销，与本机网络状况有关，非纯渲染差异。
- **Task 9 复审阶段的一次中断与重跑**：首轮评分修订后的重渲染在后台执行时中途异常中断（Remotion、
  HyperFrames 已重渲染完成，Motion Canvas 未及执行，无 `benchmark.json` 产出，且无存活渲染进程，
  排查未发现内存压力或残留进程证据，判断为后台任务的会话边界问题而非脚本自身缺陷）。处置：先用
  `node scripts/render-motion-canvas.mjs` 单独验证 Motion Canvas 渲染管线本身可正常工作（21.4s 渲染
  成功），确认非脚本 bug 后，改为以单次前台阻塞调用（`timeout: 600000`）重跑完整
  `node scripts/benchmark.mjs`，一次性跑完 3 框架×3 次全新采样，避免中途中断风险，产出本报告引用的
  最终 `benchmark.json`（三支成片时间戳集中在同一轮渲染窗口内，非拼接自不同批次）。
