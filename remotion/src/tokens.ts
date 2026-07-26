export const C = {
  bg: '#0B0D12',
  panel: '#141926',
  text: '#F2F4F8',
  muted: '#8B93A7',
  remotion: '#3B82F6',
  hyperframes: '#F97316',
  motioncanvas: '#10B981',
};

export const FONT = '"PingFang SC", system-ui, sans-serif';
export const MONO = 'Menlo, monospace';

export const CHAPTERS = [
  {
    no: '01',
    name: 'Remotion',
    color: C.remotion,
    sub: 'React 生态的视频引擎',
    cards: [
      ['组件即镜头', '每一帧都是组件的纯函数输出'],
      ['useCurrentFrame', '以帧为一等公民的时间模型'],
      ['工程化生态', 'Studio 预览 · Lambda 云渲染 · npm 生态'],
    ],
  },
  {
    no: '02',
    name: 'HyperFrames',
    color: C.hyperframes,
    sub: '写 HTML，渲染视频',
    cards: [
      ['HTML 即分镜', '浏览器渲染，逐帧捕获成片'],
      ['GSAP 时间线', '成熟动画栈直接复用'],
      ['为 Agent 而生', '轻量管线，AI 生成友好'],
    ],
  },
  {
    no: '03',
    name: 'Motion Canvas',
    color: C.motioncanvas,
    sub: '生成器驱动的动画流',
    cards: [
      ['yield* 即时间', '用生成器顺序描述动画'],
      ['实时编辑器', '时间线拖拽，所见即所得'],
      ['教学利器', '代码与图形演示的天然选择'],
    ],
  },
] as const;

export const SCORES = [
  ['上手成本(满=易)', 3, 5, 3],
  ['生态成熟度', 5, 2, 3],
  ['渲染速度', 5, 3, 3],
  ['Agent 友好度', 4, 5, 3],
] as const;
