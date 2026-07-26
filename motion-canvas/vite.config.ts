import {createRequire} from 'node:module';
import {defineConfig} from 'vite';

// `@motion-canvas/vite-plugin` / `@motion-canvas/ffmpeg` 是纯 CJS 包
// （无 "type": "module"，用 Babel 式 `exports.default = ...` 导出，
// 面向 tsc `esModuleInterop` 消费者）。Node 原生 ESM 对 CJS 模块的
// 合成 default 导出恒等于整个 `module.exports`，不会再解一层 `.default`——
// 无论 `import motionCanvas from '...'` 还是 `import * as ns from '...'`
// 再取 `ns.default`，拿到的都还是 `module.exports` 这个对象本身，
// 不是可调用的插件函数。实测在 vite 5.4 + esbuild 打包 vite.config.ts 时
// 会报 `TypeError: motionCanvas is not a function`
// （见 task-7-report.md DX 记录）。改用 `createRequire` 走原生 CJS
// `require().default` 才能拿到真正的函数。
const require = createRequire(import.meta.url);
const motionCanvas = require('@motion-canvas/vite-plugin').default;
const ffmpeg = require('@motion-canvas/ffmpeg').default;

export default defineConfig({
  plugins: [
    motionCanvas({
      project: './src/project.ts',
      // 输出到仓库根 output/，与 Remotion/HyperFrames 保持同一目录
      output: '../output',
    }),
    ffmpeg(),
  ],
});
