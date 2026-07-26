#!/usr/bin/env node
// 统一基准测试：对三个框架的"端到端冷启动墙钟时间"渲染命令各跑 3 次，
// 记录均值/标准差、/usr/bin/time -l 观测到的峰值 RSS、产物体积与 ffprobe 元数据。
//
// 计时口径（Task 8 控制器裁决，见 task-8-report.md）：
// - 统一采用端到端冷启动墙钟时间（用户视角真实成本），Motion Canvas 的
//   vite 冷启动 + 预热渲染不从计时中扣除，只在其结果条目里加 note 说明。
// - /usr/bin/time -l 包裹的是每个 TARGET 的“直接子进程”（npx / node）。
//   三个目标的渲染链路都会再往下 spawn 无头 Chrome（remotion、hyperframes
//   经由各自的 puppeteer 依赖；motion-canvas 由 render-motion-canvas.mjs
//   自行 spawn vite + puppeteer-core），maximum resident set size 只测得
//   到这层直接子进程，测不到更深层 Chrome 子进程的真实峰值。如实记录，
//   不外推、不伪造，测量边界写进每条结果的 memNote。
//
// 用法：node scripts/benchmark.mjs

import {execSync, spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, statSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(REPO_ROOT, 'output');
const NPM_CACHE_DIR = path.join(REPO_ROOT, '.npm-cache'); // 项目内，已在 .gitignore

const MEM_NOTE =
  '/usr/bin/time -l 只测得到本命令的直接子进程（npx/node），测不到其再 spawn 的无头 ' +
  'Chrome 子进程真实峰值；如实记录此边界内的观测值，不代表整条渲染链路的真实峰值内存。';

const TARGETS = [
  {
    name: 'remotion',
    cwd: path.join(REPO_ROOT, 'remotion'),
    cmd: ['npx', 'remotion', 'render', 'src/index.ts', 'Compare', '../output/remotion.mp4'],
    out: path.join(OUTPUT_DIR, 'remotion.mp4'),
    env: {},
  },
  {
    name: 'hyperframes',
    cwd: path.join(REPO_ROOT, 'hyperframes'),
    cmd: [
      'npx',
      '--yes',
      'hyperframes@0.7.71',
      'render',
      '--quality',
      'high',
      '--output',
      '../output/hyperframes.mp4',
    ],
    out: path.join(OUTPUT_DIR, 'hyperframes.mp4'),
    // 见 CLAUDE.md / task-6-report.md DX 问题 1、2：
    // 项目内 npm 缓存规避 ~/.npm 权限问题；跳过 init/skills 写 home 目录。
    env: {
      npm_config_cache: NPM_CACHE_DIR,
      HYPERFRAMES_SKIP_SKILLS: '1',
    },
  },
  {
    name: 'motion-canvas',
    cwd: REPO_ROOT,
    cmd: ['node', 'scripts/render-motion-canvas.mjs'],
    out: path.join(OUTPUT_DIR, 'motion-canvas.mp4'),
    env: {},
    note:
      '端到端墙钟时间含 vite dev server 冷启动 + 0.2s 预热渲染 + 5s 稳定等待，' +
      '这是 Motion Canvas 官方渲染链路（无官方 headless CLI，脚本经 puppeteer-core ' +
      '驱动浏览器调用 Renderer API）固有的固定开销，按控制器裁决不从计时中扣除；' +
      '详见 .superpowers/sdd/2026-07-25-video-framework-comparison/task-7-report.md。',
  },
];

const RUNS = 3;
const PER_RUN_TIMEOUT_MS = 10 * 60 * 1000; // 单次渲染超过 10 分钟视为异常

function bytesToMb(bytes) {
  return bytes / 1024 / 1024;
}

mkdirSync(OUTPUT_DIR, {recursive: true});
mkdirSync(NPM_CACHE_DIR, {recursive: true});

const results = [];

for (const t of TARGETS) {
  console.log(`\n=== ${t.name} ===`);
  const times = [];
  let peakRssMb = null;

  for (let i = 0; i < RUNS; i++) {
    console.log(`[${t.name}] run ${i + 1}/${RUNS}...`);
    const t0 = process.hrtime.bigint();
    const r = spawnSync('/usr/bin/time', ['-l', ...t.cmd], {
      cwd: t.cwd,
      encoding: 'utf8',
      env: {...process.env, ...t.env},
      timeout: PER_RUN_TIMEOUT_MS,
      maxBuffer: 64 * 1024 * 1024,
    });
    const elapsedSec = Number(process.hrtime.bigint() - t0) / 1e9;

    if (r.error) {
      throw new Error(`${t.name} run ${i + 1} 启动失败: ${r.error.message}`);
    }
    if (r.signal) {
      throw new Error(
        `${t.name} run ${i + 1} 被信号 ${r.signal} 终止（可能超过 ${PER_RUN_TIMEOUT_MS / 1000}s 超时）:\n${r.stderr?.slice(-4000)}`,
      );
    }
    if (r.status !== 0) {
      throw new Error(`${t.name} run ${i + 1} 失败（exit ${r.status}）:\n${r.stderr?.slice(-4000)}`);
    }

    times.push(elapsedSec);
    console.log(`[${t.name}] run ${i + 1} 完成，耗时 ${elapsedSec.toFixed(2)}s`);

    const m = r.stderr.match(/(\d+)\s+maximum resident set size/);
    if (m) {
      // macOS `time -l`：maximum resident set size 单位为字节。
      const mb = Number(m[1]) / 1024 / 1024;
      peakRssMb = peakRssMb === null ? mb : Math.max(peakRssMb, mb);
    }
  }

  if (!existsSync(t.out)) {
    throw new Error(`${t.name} 渲染声称成功，但产物不存在：${t.out}`);
  }

  const probeRaw = execSync(
    `ffprobe -v error -show_entries format=duration,size,bit_rate -of json "${t.out}"`,
  ).toString();
  const probe = JSON.parse(probeRaw).format;

  const mean = times.reduce((a, b) => a + b, 0) / RUNS;
  const sd = Math.sqrt(times.reduce((a, b) => a + (b - mean) ** 2, 0) / RUNS);

  const entry = {
    name: t.name,
    runs: times.map(x => +x.toFixed(2)),
    meanSec: +mean.toFixed(2),
    sdSec: +sd.toFixed(2),
    peakRssMb: peakRssMb === null ? null : +peakRssMb.toFixed(0),
    memNote: MEM_NOTE,
    sizeBytes: statSync(t.out).size,
    probe,
  };
  if (t.note) entry.note = t.note;

  results.push(entry);
}

writeFileSync(path.join(OUTPUT_DIR, 'benchmark.json'), JSON.stringify(results, null, 2) + '\n');

console.log('\n=== 汇总 ===');
console.table(
  results.map(({name, meanSec, sdSec, peakRssMb, sizeBytes}) => ({
    name,
    meanSec,
    sdSec,
    peakRssMb,
    mb: +(sizeBytes / 1e6).toFixed(1),
  })),
);

console.log(`\n已写入 ${path.join(OUTPUT_DIR, 'benchmark.json')}`);
