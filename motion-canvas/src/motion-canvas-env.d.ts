/// <reference types="@motion-canvas/core/project" />

// `?project` 是 @motion-canvas/vite-plugin 的虚拟模块查询串（见
// node_modules/@motion-canvas/vite-plugin/lib/partials/projects.js 的 `load()` 钩子），
// 官方类型包 project.d.ts 未声明这个后缀（只声明了 `?scene`/`?img`/`?anim`），
// 这里补一份本地声明，供 scripts/render-motion-canvas.mjs 驱动的
// src/render-entry.ts 使用（详见 task-7-report.md 渲染路径调研）。
declare module '*?project' {
  const value: import('@motion-canvas/core').Project;
  export default value;
}
