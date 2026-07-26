#!/usr/bin/env node
// 驱动 Motion Canvas 项目渲染出 output/motion-canvas.mp4。
//
// 背景（详见 .superpowers/sdd/2026-07-25-video-framework-comparison/task-7-report.md）：
// Motion Canvas 3.17.2 没有官方 headless/CLI 渲染入口（GitHub issue #415 / #1218
// 均未合并解决方案）；编辑器里点“Render”按钮本质上只是调用
// @motion-canvas/core 的 Renderer 类 + @motion-canvas/ffmpeg 的
// FFmpegExporterClient/Server（走 vite dev server 的 HMR websocket）。
// 本脚本不模拟点击 UI 按钮，而是启动 vite dev server 后用 puppeteer-core
// 打开 motion-canvas/render.html，该页面加载 src/render-entry.ts，
// 在浏览器上下文里直接调用同一条 Renderer API——即“可编程渲染”而非UI自动化。
//
// 用法：node scripts/render-motion-canvas.mjs
//
// 已知限制（DX 问题，详见报告，两条都是实测踩出来的）：
//
// 1. 音频路径：@motion-canvas/ffmpeg 的 FFmpegExporterServer 用
//    `settings.audio.slice(1)` 把 project.audio（如 '/voiceover.mp3'）
//    当相对路径喂给 ffmpeg，这个相对路径是相对 vite dev server 进程 cwd
//    解析的，不是相对 public/ 目录。因此本脚本会在 motion-canvas/ 根目录
//    额外放一份 voiceover.mp3（仅本地产物，已加入 motion-canvas/.gitignore），
//    否则原生混流会静默找不到音轨、ffmpeg 直接跳过音轨或挂起。
//
// 2. 冷启动丢帧：在全新启动的 vite dev server 上直接发起第一次渲染，
//    900 帧会在渲染到一半时突然失败（服务端报 "exporting process has
//    not been started" 或 "stream.push() after EOF"）。根因是 vite 的
//    依赖预打包（optimizeDeps）在第一次真正加载 `?project` 虚拟模块时
//    才发现 `@motion-canvas/ffmpeg/lib/client` 这条依赖链，触发一次
//    "发现新依赖，重新优化并强制刷新页面"，这个强制 full-reload 会在
//    渲染进行到一半时把页面连同 WS 连接一起干掉。用一次极短（0.2s）的
//    "预热渲染" 把这次强制刷新提前引爆、等它稳定几秒后再发起真正的
//    完整渲染，可稳定规避（本脚本实测多次可复现且修复有效）。

import {spawn} from 'node:child_process';
import {existsSync, mkdirSync, copyFileSync, statSync, rmSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const MC_DIR = path.join(REPO_ROOT, 'motion-canvas');
const OUTPUT_DIR = path.join(REPO_ROOT, 'output');
const VOICEOVER_SRC = path.join(REPO_ROOT, 'assets', 'voiceover.mp3');
const PORT = 9000;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const FINAL_NAME = 'motion-canvas';
const FINAL_MP4 = path.join(OUTPUT_DIR, `${FINAL_NAME}.mp4`);
const WARMUP_NAME = '__warmup';
const WARMUP_MP4 = path.join(OUTPUT_DIR, `${WARMUP_NAME}.mp4`);
const SETTLE_MS = 5000; // 见文件头 DX 问题 2：等 vite 的强制 reload 稳定下来
const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
];
const RENDER_TIMEOUT_MS = 15 * 60 * 1000; // 900 帧全量渲染的安全上限

function log(...args) {
  console.log('[render-motion-canvas]', ...args);
}

function findChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(
    '未找到系统 Chrome/Chromium，puppeteer-core 需要 executablePath。' +
      '请安装 Google Chrome，或修改 CHROME_CANDIDATES。',
  );
}

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return;
    } catch {
      // 还没起来，继续轮询
    }
    await new Promise(r => setTimeout(r, 300));
  }
  throw new Error(`vite dev server 在 ${timeoutMs}ms 内未就绪：${url}`);
}

function startVite() {
  log('启动 vite dev server（cwd=motion-canvas，端口', PORT, '）...');
  const child = spawn(
    'npx',
    ['--yes', 'vite', '--port', String(PORT), '--strictPort'],
    {
      cwd: MC_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {...process.env},
    },
  );
  child.stdout.on('data', d => process.stdout.write(`[vite] ${d}`));
  child.stderr.on('data', d => process.stderr.write(`[vite] ${d}`));
  return child;
}

/**
 * 打开 render.html?t=<seconds>&name=<name>，等待 window.__mcRenderDone，
 * 返回 {result, error}。t 省略则渲染完整 30s（900 帧）。
 */
async function runRenderPass(browser, {label, seconds, name, quiet}) {
  const page = await browser.newPage();
  await page.setViewport({width: 1920, height: 1080});
  page.on('console', msg => {
    const text = msg.text();
    if (text.startsWith('[MC_PROGRESS]')) {
      if (!quiet) log(`${label} page>`, text);
    } else {
      // 非进度日志（含 render-entry.ts 里转发的 Motion Canvas Logger
      // error/warn）全部打印，便于定位渲染失败原因。
      log(`${label} page[${msg.type()}]>`, text);
    }
  });
  page.on('pageerror', err => log(`${label} page error>`, err));

  const params = new URLSearchParams();
  if (seconds != null) params.set('t', String(seconds));
  if (name) params.set('name', name);
  const url = `${BASE_URL}/render.html${params.toString() ? `?${params}` : ''}`;

  await page.goto(url, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction('window.__mcRenderDone === true', {
    timeout: RENDER_TIMEOUT_MS,
    polling: 500,
  });
  const info = await page.evaluate(() => ({
    result: window.__mcRenderResult,
    error: window.__mcRenderError,
  }));
  await page.close();
  return info;
}

async function main() {
  if (!existsSync(VOICEOVER_SRC)) {
    throw new Error(`找不到旁白音轨：${VOICEOVER_SRC}，请先运行 scripts/build-voiceover.sh`);
  }
  mkdirSync(OUTPUT_DIR, {recursive: true});

  // public/ 供浏览器端以 /voiceover.mp3 访问；根目录这份是给
  // FFmpegExporterServer（相对 vite 进程 cwd 解析音频路径）用的，见文件头注释。
  copyFileSync(VOICEOVER_SRC, path.join(MC_DIR, 'public', 'voiceover.mp3'));
  copyFileSync(VOICEOVER_SRC, path.join(MC_DIR, 'voiceover.mp3'));

  const chromePath = findChrome();
  const puppeteerEntry = pathToFileURL(
    path.join(MC_DIR, 'node_modules', 'puppeteer-core', 'lib', 'puppeteer', 'puppeteer-core.js'),
  ).href;
  const {default: puppeteer} = await import(puppeteerEntry);

  const viteProcess = startVite();
  let browser;
  const startedAt = Date.now();

  try {
    await waitForServer(`${BASE_URL}/render.html`);
    log('vite 就绪，启动 puppeteer-core 驱动的 headless Chrome...');

    browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--window-size=1920,1080'],
    });

    // --- 预热：见文件头 DX 问题 2，先跑一个极短渲染把 vite 的依赖发现 /
    // 强制刷新提前引爆，避免它在真正渲染中途把页面刷掉。---
    log('预热渲染（0.2s，触发并等 vite optimizeDeps 的强制刷新落定）...');
    const warmup = await runRenderPass(browser, {
      label: 'warmup',
      seconds: 0.2,
      name: WARMUP_NAME,
      quiet: true,
    });
    if (warmup.result !== 'success') {
      log('警告：预热渲染未成功（result=', warmup.result, warmup.error, '），继续尝试正式渲染。');
    }
    rmSync(WARMUP_MP4, {force: true});
    log(`预热完成，等待 ${SETTLE_MS}ms 让 vite 稳定...`);
    await new Promise(r => setTimeout(r, SETTLE_MS));

    // --- 正式渲染：完整 30s / 900 帧 ---
    log('渲染中（900 帧，逐帧经 HMR websocket 送到 FFmpeg，预计数分钟）...');
    const resultInfo = await runRenderPass(browser, {
      label: 'render',
      seconds: null,
      name: FINAL_NAME,
    });

    if (resultInfo.result !== 'success') {
      throw new Error(
        `Motion Canvas 渲染未成功：result=${resultInfo.result} error=${resultInfo.error ?? '(无)'}`,
      );
    }
    log('渲染完成，result=success。');
  } finally {
    if (browser) await browser.close();
    viteProcess.kill('SIGTERM');
    await new Promise(resolve => {
      viteProcess.once('exit', resolve);
      setTimeout(() => {
        viteProcess.kill('SIGKILL');
        resolve();
      }, 5000);
    });
  }

  const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);
  log(`总耗时 ${elapsedSec}s（含 vite 冷启动 + 预热 + 900 帧渲染 + 关闭）。`);

  if (!existsSync(FINAL_MP4)) {
    throw new Error(`预期产物不存在：${FINAL_MP4}（FFmpegExporterServer 应已写出 ${FINAL_NAME}.mp4）`);
  }
  const size = statSync(FINAL_MP4).size;
  log(`产物：${FINAL_MP4}（${(size / 1024 / 1024).toFixed(2)} MB）。请运行 ffprobe 校验音视频流。`);
}

main().catch(err => {
  console.error('[render-motion-canvas] 失败:', err);
  process.exitCode = 1;
});
