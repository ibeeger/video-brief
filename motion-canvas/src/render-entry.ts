// 无一等 CLI 渲染路径：Motion Canvas 3.17.2 未提供官方 headless/CLI 渲染
// （见 github.com/motion-canvas/motion-canvas issue #415 / #1218，均未合并）。
// 编辑器的“Render”面板本质上也只是调用 `@motion-canvas/core` 的
// `Renderer` 类 + `@motion-canvas/ffmpeg` 的 FFmpegExporterClient/Server；
// 这里绕开编辑器 UI，直接在浏览器上下文中复刻同一条调用链，
// 由 scripts/render-motion-canvas.mjs 启动 vite dev server + puppeteer-core
// 加载本文件所在的 render.html 来驱动——即“可编程渲染”而非点击按钮的 UI 自动化。
import {Renderer, RendererResult, Vector2} from '@motion-canvas/core';
// `?project` 触发 @motion-canvas/vite-plugin 的虚拟模块转换（见
// node_modules/@motion-canvas/vite-plugin/lib/partials/projects.js），
// 会自动装配 project.plugins（含 vite.config.ts 里注册的 ffmpeg() 导出插件），
// 与编辑器启动时 `import project from '...?project'` 完全一致。
import project from './project?project';

declare global {
  interface Window {
    __mcRenderDone?: boolean;
    __mcRenderResult?: string;
    __mcRenderError?: string;
  }
}

function readRangeFromQuery(): [number, number] {
  const params = new URLSearchParams(window.location.search);
  const t = params.get('t');
  // scripts/render-motion-canvas.mjs 内部用 render.html?t=0.2 发起一次极短
  // 的“预热”渲染（见该脚本文件头 DX 问题 2），提前引爆 vite optimizeDeps
  // 的强制刷新；也可手动打开 render.html?t=1 之类的 URL 做本地烟雾测试。
  if (t) return [0, Number(t)];
  return [0, Infinity];
}

function readNameFromQuery(): string {
  return new URLSearchParams(window.location.search).get('name') ?? 'motion-canvas';
}

async function main() {
  // Motion Canvas 的 Logger.error()/warn() 只 dispatch 事件 + push 进
  // history，不会调用 console.error（见 @motion-canvas/core/lib/app/Logger.js）。
  // 编辑器 UI 靠订阅 onLogged 把日志画到面板上；我们没有 UI，必须自己订阅
  // 并打到 console，否则 Renderer.run() 内部 catch 到的异常会完全静默。
  project.logger.onLogged.subscribe(payload => {
    if (payload.level === 'error' || payload.level === 'warn') {
      // eslint-disable-next-line no-console
      console.error(
        `[MC_LOGGER_${payload.level.toUpperCase()}]`,
        payload.message,
        payload.stack ?? '',
        payload.remarks ?? '',
      );
    }
  });

  const renderer = new Renderer(project);

  renderer.onFrameChanged.subscribe(frame => {
    // 每 30 帧（约 1s）打印一次，避免 900 帧逐帧刷屏。
    if (frame % 30 === 0) {
      // eslint-disable-next-line no-console
      console.log(`[MC_PROGRESS] frame=${frame}`);
    }
  });

  let finalResult: RendererResult | null = null;
  renderer.onFinished.subscribe(result => {
    finalResult = result;
  });

  await renderer.render({
    name: readNameFromQuery(),
    range: readRangeFromQuery(),
    fps: 30,
    size: new Vector2(1920, 1080),
    resolutionScale: 1,
    colorSpace: 'srgb',
    background: null,
    exporter: {
      name: '@motion-canvas/ffmpeg',
      options: {
        fastStart: true,
        includeAudio: true,
      },
    },
  });

  const resultName =
    finalResult === RendererResult.Success
      ? 'success'
      : finalResult === RendererResult.Aborted
        ? 'aborted'
        : 'error';

  window.__mcRenderDone = true;
  window.__mcRenderResult = resultName;
  // eslint-disable-next-line no-console
  console.log(`[MC_RENDER_DONE] result=${resultName}`);
}

main().catch(e => {
  window.__mcRenderDone = true;
  window.__mcRenderResult = 'error';
  window.__mcRenderError = String(e?.stack ?? e);
  // eslint-disable-next-line no-console
  console.error('[MC_RENDER_ERROR]', e);
});
