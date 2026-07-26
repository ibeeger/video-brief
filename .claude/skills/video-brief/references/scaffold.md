# BRIEF → HyperFrames 脚手架

Gate 4 的映射规则。**契约的权威来源是 `hyperframes-core`**，本文件只负责「BRIEF 的哪一格变成哪个属性」，不重述契约。骨架结构对齐 `hyperframes-core/references/minimal-composition.md`。

## 产物契约

恰好这五项，按顺序：

1. `<项目名>/index.html`
2. `<项目名>/hyperframes.json`
3. `<项目名>/vendor/gsap.min.js`（`cp hyperframes-report/vendor/gsap.min.js`，禁止引外部 CDN —— 本仓库的渲染环境不保证外网）
4. `<项目名>/assets/`（旁白音轨占位；音轨生成走 `scripts/build-voiceover*.sh` 的模式）
5. 一次通过的 `hyperframes check` 输出

## 字段映射

| BRIEF 位置 | 落到哪里 |
|---|---|
| §3 分辨率 | 根 `data-width` / `data-height`；`<meta name="viewport" content="width=W, height=H">`；`#root` 与 `html,body` 的 px 尺寸 |
| §3 帧率 | 根 `data-fps` |
| §3 时长 | 根 `data-duration`（秒），必须等于 §5 时长列之和 |
| §5 第 N 行时长 | 第 N 个 `<section class="clip">` 的 `data-duration` |
| §5 前 N-1 行时长累加 | 第 N 个 clip 的 `data-start` |
| §5 场景名 | clip 的 `id`（kebab-case）与注释 |
| §5 文字/字卡 | clip 内的占位文案，按预设的字号档位 |
| §4 预设 tokens | `<style>` 里的 `:root` |
| §6 旁白 | `<audio>` 元素，`data-track-index` 用一个高值（如 10）与视觉轨分离 |

所有 clip 用 `data-track-index="1"`，除非 BRIEF 明确要求叠加层。

## 骨架模板

`W` / `H` / `FPS` / `TOTAL` 由 §3 填入；每个 `<section>` 由 §5 逐行生成。

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=W, height=H" />
    <title>项目名 — HyperFrames</title>
    <script src="./vendor/gsap.min.js"></script>
    <style>
      /* ① 字体：Inter / JetBrains Mono / Noto Sans SC 由编译器自动拉取，这里什么都不用写。
            只有编译器不认识的族名才需要下面这块 —— 见下方「字体现实校验」。
         @font-face {
           font-family: "Smiley Sans";
           src: url("./assets/fonts/SmileySans-Oblique.woff2") format("woff2");
           font-weight: 900;
           font-display: block;
         }
      */

      /* ② 锁定预设的 tokens 整段粘贴到这里 */
      :root {
        /* ← references/presets/<锁定预设>.md 的 tokens 代码块 */
      }

      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        width: Wpx; height: Hpx; overflow: hidden;
        background: #000; /* 不透明台底，防转场接缝白闪，见 seam-craft */
      }
      body {
        font-family: var(--font-cn), var(--font-latin), system-ui, sans-serif;
        color: var(--text-primary);
      }
      #root { position: relative; width: Wpx; height: Hpx; overflow: hidden; }
      .clip { position: absolute; inset: 0; background: var(--bg); }
      .num { font-variant-numeric: tabular-nums; font-feature-settings: "tnum"; }
    </style>
  </head>
  <body>
    <div
      id="root"
      data-composition-id="main"
      data-start="0"
      data-width="W"
      data-height="H"
      data-duration="TOTAL"
      data-fps="FPS"
    >
      <!-- 场景 1：<§5 场景名> -->
      <section id="s1-kebab-name" class="clip" data-start="0" data-duration="D1" data-track-index="1">
        <!-- §5 的文字/字卡占位，按预设字号档位 -->
      </section>

      <!-- 场景 2：… data-start="D1" data-duration="D2" -->

      <audio
        id="voiceover"
        src="assets/voiceover.mp3"
        data-start="0"
        data-duration="TOTAL"
        data-track-index="10"
      ></audio>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      // 骨架阶段只留空 timeline 或最简淡入。真正的动效交给 hyperframes-animation。
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
```

`hyperframes.json` 复制 `hyperframes-report/hyperframes.json` 的结构即可。

## 字体现实校验（写 CSS 之前确认）

以下机制经 `hyperframes@0.7.71 check` 实测确认。

HyperFrames 编译器**自己会处理字体**：它有一张内置别名表（`FONT_ALIAS_MAP`），并会为表内或 Google Fonts 上存在的族名自动拉取字体、注入确定性的 `@font-face`。所以字体分三类：

| 类别 | 例子 | 怎么做 |
|---|---|---|
| **编译器认识** | `Inter`、`JetBrains Mono`、`Noto Sans SC`、`Montserrat`、`Roboto`、`Open Sans`、`EB Garamond` | 直接写族名即可，编译器自动拉取。`Noto Sans SC` 实测拉到 9 个 face |
| **编译器不认识** | `得意黑 / Smiley Sans`、`HarmonyOS Sans`、`Source Han Sans SC`、`PingFang SC` | **必须**项目内自带 woff2 + `@font-face url()`，否则 `check` 报 `No deterministic font mapping for: X` 且渲染出豆腐块 |
| 被别名重定向 | `SF Pro` → `inter`、`Menlo` → `jetbrains-mono` | 别写这些名字，直接写目标族名，免得以为用上了实际没用上 |

**两条实测结论，与直觉相反：**

1. **不要在 `--font-cn` 里写 `'Source Han Sans SC'` 当 fallback。** 它不在别名表里、Google Fonts 上也没有这个名字，每次 `check` 都会刷一条 WARN。四个预设的 tokens 已经去掉它了 —— 别加回去。中文只写 `'Noto Sans SC'`。
2. **`Noto Sans SC` 不需要项目内自带 woff2。** 编译器会拉。只有编译器不认识的族名才需要打包 —— 参考 `.claude/skills/changelog-video/assets/fonts/` 的组织方式。

不确定某个族名属于哪类，跑一次 `check` 看有没有 `No deterministic font mapping` 警告，最快。

**许可提醒**：苹方（PingFang SC）与 SF Pro 不能用于视频内容，许可仅覆盖 Apple 平台 App 界面。本仓库 `hyperframes-report/index.html` 目前用了 `src: local("PingFang SC")` —— 它既不在别名表里（渲染机没装就出豆腐块），也没有商用许可，仅适用于内部演示。新项目一律用 `Noto Sans SC`。

**一处与仓库约束的冲突（无法规避，仅记录）**：编译器把拉到的字体缓存到 `~/.cache/hyperframes/fonts/`，这违反 `CLAUDE.md` 里「不写 home 目录」的约束。`HYPERFRAMES_SKIP_SKILLS=1` 只挡 skills 写入，挡不住字体缓存。若必须彻底不碰 home，就全部字体项目内自带 woff2。

## 骨架阶段不做什么

- 不写动效（交 `hyperframes-animation`）
- 不写转场（交 `motion-doctrine` → `cut-the-curve` / `seam-craft`）
- 不找素材（交 `media-use`）
- 不做字幕（交 `embedded-captions`）

骨架的验收只有一条：`hyperframes check` 通过，且每个 clip 的 `data-duration` 与 BRIEF §5 逐行对得上。
