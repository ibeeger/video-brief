import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, CHAPTERS, FONT, MONO, SCORES} from './tokens';

const EZ = Easing.bezier(0.22, 1, 0.36, 1);

const io = (f: number, [a, b]: [number, number], out: [number, number] = [0, 1]) =>
  interpolate(f, [a, b], out, {easing: EZ, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

// 场景末 0.4s (12 帧) 整屏淡出：sceneFrames 为场景总帧数
const fadeOut = (f: number, sceneFrames: number) => io(f, [sceneFrames - 12, sceneFrames], [1, 0]);

// 卡片质感：1px 内描边 + 轻微投影
const cardShadow = 'inset 0 0 0 1px rgba(255,255,255,0.06), 0 24px 48px -24px rgba(0,0,0,0.65)';

// ---------------------------------------------------------------------------
// S1 片头 (帧 0-120 / 0.0-4.0s)
// - 0-24 帧 (0.0-0.8s)：中心水平细线 (2px, muted) 自中点展开至 640px
// - 15-45 帧 (0.5-1.5s)：主标题「程序化视频，三种答案」上移 24px + 淡入
// - 54/63/72 帧起各 18 帧：三框架名依次淡入，各自品牌色，横排，间隔 9 帧(0.3s)
// - 108-120 帧 (3.6-4.0s)：整屏淡出
// ---------------------------------------------------------------------------
export const Intro = () => {
  const f = useCurrentFrame();
  const lineScale = io(f, [0, 24], [0, 1]);
  const titleOpacity = io(f, [15, 45]);
  const titleY = io(f, [15, 45], [24, 0]);
  const names = [
    {label: 'Remotion', color: C.remotion, start: 54},
    {label: 'HyperFrames', color: C.hyperframes, start: 63},
    {label: 'Motion Canvas', color: C.motioncanvas, start: 72},
  ];

  return (
    <AbsoluteFill style={{opacity: fadeOut(f, 120)}}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
        <div
          style={{
            width: 640,
            height: 2,
            backgroundColor: C.muted,
            transform: `scaleX(${lineScale})`,
            transformOrigin: 'center',
            marginBottom: 56,
          }}
        />
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: C.text,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            marginBottom: 40,
            letterSpacing: 1,
          }}
        >
          程序化视频，三种答案
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 56}}>
          {names.map((n) => {
            const op = io(f, [n.start, n.start + 18]);
            const y = io(f, [n.start, n.start + 18], [16, 0]);
            return (
              <div
                key={n.label}
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: n.color,
                  opacity: op,
                  transform: `translateY(${y}px)`,
                }}
              >
                {n.label}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// S2/S3/S4 章节页共用版式 (每章 180 帧 / 6.0s)
// - 0-12 帧 (0.0-0.4s)：品牌色竖条 (6x72px) 自上而下立起；左上角序号 (Menlo, muted)
// - 6-24 帧 (0.2-0.8s)：框架名大标题(72px) + 副题(32px muted) 自左滑入 40px + 淡入
// - 30/42/54 帧起各 24 帧：三张特性卡片依次上浮弹入，间隔 12 帧 (0.4s)
// - 168-180 帧 (5.6-6.0s)：整屏淡出
// ---------------------------------------------------------------------------
export const Chapter = ({i}: {i: number}) => {
  const f = useCurrentFrame();
  const chapter = CHAPTERS[i];

  const barScale = io(f, [0, 12], [0, 1]);
  const numberOpacity = io(f, [0, 12]);

  const titleOpacity = io(f, [6, 24]);
  const titleX = io(f, [6, 24], [40, 0]);
  const subOpacity = io(f, [6, 24]);
  const subX = io(f, [6, 24], [40, 0]);

  return (
    <AbsoluteFill style={{opacity: fadeOut(f, 180)}}>
      {/* 竖条 + 序号 */}
      <div style={{position: 'absolute', top: 160, left: 160, display: 'flex', alignItems: 'center', height: 72}}>
        <div
          style={{
            width: 6,
            height: 72,
            backgroundColor: chapter.color,
            transform: `scaleY(${barScale})`,
            transformOrigin: 'top',
            borderRadius: 3,
          }}
        />
        <div
          style={{
            marginLeft: 20,
            fontFamily: MONO,
            fontSize: 26,
            color: C.muted,
            opacity: numberOpacity,
            letterSpacing: 2,
          }}
        >
          {chapter.no}
        </div>
      </div>

      {/* 标题 + 副题 */}
      <div
        style={{
          position: 'absolute',
          top: 272,
          left: 160,
          fontSize: 72,
          fontWeight: 700,
          color: C.text,
          opacity: titleOpacity,
          transform: `translateX(${titleX}px)`,
        }}
      >
        {chapter.name}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 366,
          left: 160,
          fontSize: 32,
          color: C.muted,
          opacity: subOpacity,
          transform: `translateX(${subX}px)`,
        }}
      >
        {chapter.sub}
      </div>

      {/* 特性卡片 */}
      <div style={{position: 'absolute', top: 560, left: 160, display: 'flex', gap: 50}}>
        {chapter.cards.map((card, idx) => {
          const start = 30 + idx * 12;
          const op = io(f, [start, start + 24]);
          const y = io(f, [start, start + 24], [40, 0]);
          return (
            <div
              key={card[0]}
              style={{
                width: 500,
                height: 180,
                borderRadius: 16,
                backgroundColor: C.panel,
                boxShadow: cardShadow,
                opacity: op,
                transform: `translateY(${y}px)`,
                padding: '32px 36px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <div style={{fontSize: 30, fontWeight: 700, color: chapter.color, marginBottom: 14}}>{card[0]}</div>
              <div style={{fontSize: 22, color: C.muted, lineHeight: 1.5}}>{card[1]}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// S5 对比 (帧 660-840 / 180 帧 / 6.0s)
// - 0-15 帧 (0.0-0.5s)：标题「同题对比」自上滑入；三列表头为三框架名(品牌色)
// - 行 n (n=0..3) 于 24+33n 帧起点亮：标签淡入 + 评分条宽度 0 -> 值/5*320px，18 帧动画
// - 168-180 帧 (5.6-6.0s)：整屏淡出
// ---------------------------------------------------------------------------
const VERSUS_COLORS = [C.remotion, C.hyperframes, C.motioncanvas];
const VERSUS_NAMES = ['Remotion', 'HyperFrames', 'Motion Canvas'];
const BAR_MAX = 320;

export const Versus = () => {
  const f = useCurrentFrame();

  const titleOpacity = io(f, [0, 15]);
  const titleY = io(f, [0, 15], [-30, 0]);

  return (
    <AbsoluteFill style={{opacity: fadeOut(f, 180)}}>
      <div
        style={{
          position: 'absolute',
          top: 160,
          left: 160,
          right: 160,
          fontSize: 56,
          fontWeight: 700,
          color: C.text,
          textAlign: 'center',
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        同题对比
      </div>

      {/* 表头 */}
      <div
        style={{
          position: 'absolute',
          top: 300,
          left: 160,
          width: 1600,
          display: 'grid',
          gridTemplateColumns: '320px repeat(3, 1fr)',
          alignItems: 'center',
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div />
        {VERSUS_NAMES.map((name, idx) => (
          <div
            key={name}
            style={{fontSize: 32, fontWeight: 700, color: VERSUS_COLORS[idx], textAlign: 'center'}}
          >
            {name}
          </div>
        ))}
      </div>

      {/* 评分行 */}
      {SCORES.map((row, n) => {
        const [label, r, h, m] = row;
        const values = [r, h, m];
        const start = 24 + 33 * n;
        const labelOpacity = io(f, [start, start + 18]);
        const labelX = io(f, [start, start + 18], [-16, 0]);

        return (
          <div
            key={label}
            style={{
              position: 'absolute',
              top: 420 + n * 110,
              left: 160,
              width: 1600,
              display: 'grid',
              gridTemplateColumns: '320px repeat(3, 1fr)',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: 24,
                color: C.text,
                opacity: labelOpacity,
                transform: `translateX(${labelX}px)`,
              }}
            >
              {label}
            </div>
            {values.map((v, colIdx) => {
              const barWidth = io(f, [start, start + 18], [0, (v / 5) * BAR_MAX]);
              return (
                <div key={colIdx} style={{display: 'flex', justifyContent: 'center'}}>
                  <div style={{width: BAR_MAX, height: 14, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.08)'}}>
                    <div
                      style={{
                        width: barWidth,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: VERSUS_COLORS[colIdx],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// S6 结语 (帧 840-900 / 60 帧 / 2.0s)
// - 0-18 帧 (0.0-0.6s)：主句「没有最好，只有最合适」中心淡入 (56px)
// - 18-36 帧 (0.6-1.2s)：下方小字 (22px muted) 淡入
// - 51-60 帧 (1.7-2.0s)：淡至黑
// ---------------------------------------------------------------------------
export const Outro = () => {
  const f = useCurrentFrame();
  const mainOpacity = io(f, [0, 18]);
  const subOpacity = io(f, [18, 36]);
  const blackFade = io(f, [51, 60]);

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          opacity: 1 - blackFade,
        }}
      >
        <div style={{fontSize: 56, fontWeight: 700, color: C.text, opacity: mainOpacity, marginBottom: 28}}>
          没有最好，只有最合适
        </div>
        <div style={{fontSize: 22, color: C.muted, opacity: subOpacity}}>
          工程团队选 Remotion · Agent 管线选 HyperFrames · 教学演示选 Motion Canvas
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{backgroundColor: '#000000', opacity: blackFade}} />
    </AbsoluteFill>
  );
};

export const CompareVideo = () => (
  <AbsoluteFill style={{backgroundColor: C.bg, fontFamily: FONT}}>
    <Audio src={staticFile('voiceover.mp3')} />
    <Sequence durationInFrames={120}>
      <Intro />
    </Sequence>
    {CHAPTERS.map((c, i) => (
      <Sequence key={c.no} from={120 + i * 180} durationInFrames={180}>
        <Chapter i={i} />
      </Sequence>
    ))}
    <Sequence from={660} durationInFrames={180}>
      <Versus />
    </Sequence>
    <Sequence from={840} durationInFrames={60}>
      <Outro />
    </Sequence>
  </AbsoluteFill>
);
