import {Layout, Rect, Txt, makeScene2D} from '@motion-canvas/2d';
import {
  all,
  createRef,
  delay,
  easeOutQuint,
  ThreadGenerator,
  waitFor,
} from '@motion-canvas/core';
import {C, CHAPTERS, FONT, MONO, SCORES} from '../tokens';

// ---------------------------------------------------------------------------
// 坐标助手：Motion Canvas 的 view 以中心为原点 (0,0)，1920x1080。
// pt() 把 storyboard/remotion 中的 CSS `top/left` 像素值换算成本框架的
// 中心坐标系数值，配合 `topLeft` 快捷属性即可 1:1 复刻 Remotion 的绝对定位。
// ---------------------------------------------------------------------------
// ⚠️ layout 陷阱（本文件已两次踩坑，务必读完再写入场动画）：
// 一个节点只要处于某个 `layout` 祖先的 flex 托管链下（`layoutEnabled()` 沿
// 父链继承，见 node_modules/@motion-canvas/2d 的 Layout.isLayoutRoot()），
// 它的 `position`/`position.x`/`position.y` getter 就会被 `computedPosition()`
// （flex 算出来的位置）接管，对该属性的补间在渲染上是彻底的 no-op——数值确实在
// 变，画面纹丝不动。想让某个 flex 子节点的入场位移真正生效，只有两条路：
//   1) 绝对定位：父容器不开 `layout`，子节点自己直接用 `position`/`pt()`
//      摆放（见下方 chapterScene 的 chapTitle/chapSub 写法）；
//   2) 占位 spacer + 覆盖节点：保留一个永久透明的 flex 子节点占位（撑开正确
//      间距/尺寸），同步读取它的 `.absolutePosition()`（Motion Canvas 的布局
//      是同步即时计算的，无需等待任何 yield/帧推进；用 absolutePosition 而非
//      position 是因为前者按世界坐标解析，与 spacer 具体嵌套在几层 flex 容器
//      内无关）作为落点坐标，再在一个**不开 `layout` 的父容器**下另建一个可见
//      节点，用该坐标做真正的补间（见下方 S1 标题/三框架名、S5 行标签的写法）。
//      注意 `<Txt>` 会把 `layout` 这个 prop 硬编码成 `true`（
//      Txt.prototype.getLayout() 直接 `return true`，见
//      node_modules/@motion-canvas/2d/src/lib/components/Txt.ts），单独给
//      Txt 节点传 `layout={false}` 完全不起作用——`isLayoutRoot()` 只能靠
//      "父容器不 layoutEnabled" 这一侧成立，所以覆盖节点必须挂在一个本身没开
//      `layout` 的容器下（不能直接挂在开了 `layout` 的 flex 父节点里）。
// ---------------------------------------------------------------------------
const HALF_W = 960;
const HALF_H = 540;
const pt = (left: number, top: number): [number, number] => [left - HALF_W, top - HALF_H];

const CARD_W = 500;
const CARD_H = 180;
const CARD_GAP = 50;
const BAR_MAX = 320;
const VERSUS_COLORS = [C.remotion, C.hyperframes, C.motioncanvas];
const VERSUS_NAMES = ['Remotion', 'HyperFrames', 'Motion Canvas'] as const;

export default makeScene2D(function* (view) {
  view.fill(C.bg);

  // =========================================================================
  // S1 片头 0.0-4.0s
  // - 0.0-0.8s 中心细线自中点展开至 640px
  // - 0.5-1.5s 主标题上移 24px + 淡入
  // - 1.8/2.1/2.4s 起三框架名各 0.6s 依次淡入（各自品牌色）
  // - 3.6-4.0s 整屏淡出
  // =========================================================================
  const s1 = createRef<Layout>();
  // s1Overlay：不开 layout 的兄弟容器，专门承载下面的可见/可动覆盖节点——
  // `<Txt>` 会把 `layout` 这个 prop 硬编码成 true（见文件头注释），单靠给
  // 覆盖节点自己传 `layout={false}` 没用，必须让它们的直接父容器本身不开
  // `layout`，`position` 补间才能真正生效。
  const s1Overlay = createRef<Layout>();
  const line = createRef<Rect>();
  // title1/name0-2：flex 列/行里的占位 spacer，opacity 永远为 0，只用于撑出
  // 正确的间距与尺寸（marginBottom/gap），见文件头 layout 陷阱注释。
  const title1 = createRef<Txt>();
  const name0 = createRef<Txt>();
  const name1 = createRef<Txt>();
  const name2 = createRef<Txt>();

  view.add(
    <Layout
      ref={s1}
      layout
      direction={'column'}
      alignItems={'center'}
      justifyContent={'center'}
      width={1920}
      height={1080}
    >
      <Rect ref={line} width={640} height={2} fill={C.muted} marginBottom={56} scaleX={0} />
      <Txt
        ref={title1}
        fontFamily={FONT}
        fontSize={72}
        fontWeight={700}
        fill={C.text}
        opacity={0}
        marginBottom={40}
        letterSpacing={1}
      >
        程序化视频，三种答案
      </Txt>
      <Layout layout direction={'row'} alignItems={'center'} gap={56}>
        <Txt ref={name0} fontFamily={FONT} fontSize={32} fontWeight={700} fill={C.remotion} opacity={0}>
          Remotion
        </Txt>
        <Txt ref={name1} fontFamily={FONT} fontSize={32} fontWeight={700} fill={C.hyperframes} opacity={0}>
          HyperFrames
        </Txt>
        <Txt ref={name2} fontFamily={FONT} fontSize={32} fontWeight={700} fill={C.motioncanvas} opacity={0}>
          Motion Canvas
        </Txt>
      </Layout>
    </Layout>,
  );
  view.add(<Layout ref={s1Overlay} width={1920} height={1080} />);

  // 同步读出 spacer 的世界坐标落点（无需等待 yield，Motion Canvas 的 flex
  // 布局是同步即时计算的；用 absolutePosition 而不是 position，跟 spacer
  // 具体嵌套在几层 flex 容器内无关，一律解析成同一套世界/画布像素坐标），
  // 再在 s1Overlay（不开 layout）下建一批可见覆盖节点。
  //
  // ⚠️ absolutePosition 是"画布像素坐标"（左上角原点），跟 `position` prop
  // 用的"以父节点中心为原点"坐标不是同一套换算——不能把 absolutePosition
  // 读出来的值直接塞进 `position` prop（那样会整体偏移出屏幕，实测踩过）。
  // 必须用 `.absolutePosition(...)` 这个 setter（它内部走 worldToParent()
  // 换算），初始值和补间目标都通过它来设，才能保证换算一致。
  const titlePos = title1().absolutePosition();
  const namePos = [name0(), name1(), name2()].map(ref => ref.absolutePosition());

  const titleVis = createRef<Txt>();
  const nameVis = [createRef<Txt>(), createRef<Txt>(), createRef<Txt>()];
  const nameColors = [C.remotion, C.hyperframes, C.motioncanvas];
  const nameLabels = ['Remotion', 'HyperFrames', 'Motion Canvas'];

  s1Overlay().add(
    <>
      <Txt
        ref={titleVis}
        fontFamily={FONT}
        fontSize={72}
        fontWeight={700}
        fill={C.text}
        opacity={0}
        letterSpacing={1}
      >
        程序化视频，三种答案
      </Txt>
      {nameVis.map((ref, idx) => (
        <Txt
          ref={ref}
          fontFamily={FONT}
          fontSize={32}
          fontWeight={700}
          fill={nameColors[idx]}
          opacity={0}
        >
          {nameLabels[idx]}
        </Txt>
      ))}
    </>,
  );
  titleVis().absolutePosition([titlePos.x, titlePos.y + 24]);
  nameVis.forEach((ref, idx) => ref().absolutePosition([namePos[idx].x, namePos[idx].y + 16]));

  const fadeInName = (idx: number): ThreadGenerator =>
    all(
      nameVis[idx]().opacity(1, 0.6, easeOutQuint),
      nameVis[idx]().absolutePosition([namePos[idx].x, namePos[idx].y], 0.6, easeOutQuint),
    );

  yield* all(
    delay(0.0, line().scale.x(1, 0.8, easeOutQuint)),
    delay(
      0.5,
      all(
        titleVis().opacity(1, 1.0, easeOutQuint),
        titleVis().absolutePosition([titlePos.x, titlePos.y], 1.0, easeOutQuint),
      ),
    ),
    delay(1.8, fadeInName(0)),
    delay(2.1, fadeInName(1)),
    delay(2.4, fadeInName(2)),
  );
  yield* waitFor(0.6); // 持有至 3.6s
  yield* all(s1().opacity(0, 0.4, easeOutQuint), s1Overlay().opacity(0, 0.4, easeOutQuint)); // 3.6-4.0s 整屏淡出
  s1().remove();
  s1Overlay().remove();

  // =========================================================================
  // S2/S3/S4 章节页共用版式，每章恰 6.0s
  // =========================================================================
  function* chapterScene(chapter: (typeof CHAPTERS)[number]): ThreadGenerator {
    const root = createRef<Layout>();
    const bar = createRef<Rect>();
    const number = createRef<Txt>();
    const chapTitle = createRef<Txt>();
    const chapSub = createRef<Txt>();
    const cardRefs = [createRef<Rect>(), createRef<Rect>(), createRef<Rect>()];

    view.add(
      <Layout ref={root} width={1920} height={1080}>
        <Layout topLeft={pt(160, 160)} layout direction={'row'} alignItems={'center'} height={72}>
          <Rect ref={bar} width={6} height={72} fill={chapter.color} radius={3} offsetY={-1} scaleY={0} />
          <Txt ref={number} fontFamily={MONO} fontSize={26} fill={C.muted} opacity={0} marginLeft={20} letterSpacing={2}>
            {chapter.no}
          </Txt>
        </Layout>
        <Txt
          ref={chapTitle}
          position={[pt(160, 272)[0] + 40, pt(160, 272)[1]]}
          offset={[-1, -1]}
          fontFamily={FONT}
          fontSize={72}
          fontWeight={700}
          fill={C.text}
          opacity={0}
        >
          {chapter.name}
        </Txt>
        <Txt
          ref={chapSub}
          position={[pt(160, 366)[0] + 40, pt(160, 366)[1]]}
          offset={[-1, -1]}
          fontFamily={FONT}
          fontSize={32}
          fill={C.muted}
          opacity={0}
        >
          {chapter.sub}
        </Txt>
        <Layout position={pt(160, 560)} offset={[-1, -1]} layout direction={'row'} gap={CARD_GAP}>
          {chapter.cards.map((card, idx) => (
            <Rect
              ref={cardRefs[idx]}
              width={CARD_W}
              height={CARD_H}
              radius={16}
              fill={C.panel}
              stroke={'rgba(255,255,255,0.06)'}
              lineWidth={1}
              layout
              direction={'column'}
              justifyContent={'center'}
              padding={[32, 36]}
              gap={14}
              opacity={0}
              position={[0, 40]}
            >
              <Txt fontFamily={FONT} fontSize={30} fontWeight={700} fill={chapter.color}>
                {card[0]}
              </Txt>
              <Txt fontFamily={FONT} fontSize={22} fill={C.muted} lineHeight={33} textWrap>
                {card[1]}
              </Txt>
            </Rect>
          ))}
        </Layout>
      </Layout>,
    );

    const enterCard = (ref: ReturnType<typeof createRef<Rect>>): ThreadGenerator =>
      all(ref().opacity(1, 0.8, easeOutQuint), ref().position.y(0, 0.8, easeOutQuint));

    yield* all(
      delay(0.0, all(bar().scale.y(1, 0.4, easeOutQuint), number().opacity(1, 0.4, easeOutQuint))),
      delay(
        0.2,
        all(
          chapTitle().opacity(1, 0.6, easeOutQuint),
          chapTitle().position.x(pt(160, 272)[0], 0.6, easeOutQuint),
          chapSub().opacity(1, 0.6, easeOutQuint),
          chapSub().position.x(pt(160, 366)[0], 0.6, easeOutQuint),
        ),
      ),
      delay(1.0, enterCard(cardRefs[0])),
      delay(1.4, enterCard(cardRefs[1])),
      delay(1.8, enterCard(cardRefs[2])),
    );
    yield* waitFor(3.0); // 持有至 5.6s
    yield* root().opacity(0, 0.4, easeOutQuint); // 5.6-6.0s 整屏淡出
    root().remove();
  }

  for (const chapter of CHAPTERS) {
    yield* chapterScene(chapter);
  }

  // =========================================================================
  // S5 对比 22.0-28.0s（局部 0.0-6.0s）
  // =========================================================================
  {
    const root = createRef<Layout>();
    const titleGroup = createRef<Layout>();
    const title = createRef<Txt>();
    // labelRefs：flex 行里的占位 spacer（opacity 永远 0），只用于撑开 320px
    // 列宽。labelVis 是真正可见/可动的覆盖节点，挂在 root 下——root 本身没开
    // `layout`，是天然合法的挂载点，见文件头 layout 陷阱注释。
    const labelRefs = [createRef<Txt>(), createRef<Txt>(), createRef<Txt>(), createRef<Txt>()];
    const labelVis = [createRef<Txt>(), createRef<Txt>(), createRef<Txt>(), createRef<Txt>()];
    const barRefs: ReturnType<typeof createRef<Rect>>[][] = [[], [], [], []];

    const colWidth = (1600 - 320) / 3;

    view.add(
      <Layout ref={root} width={1920} height={1080}>
        <Layout
          ref={titleGroup}
          layout
          position={[0, pt(0, 160)[1] - 30]}
          offset={[0, -1]}
          direction={'column'}
          alignItems={'center'}
          opacity={0}
        >
          <Txt ref={title} fontFamily={FONT} fontSize={56} fontWeight={700} fill={C.text} textAlign={'center'}>
            同题对比
          </Txt>
          <Layout marginTop={84} width={1600} layout direction={'row'} alignItems={'center'}>
            <Layout width={320} />
            {VERSUS_NAMES.map((name, idx) => (
              <Layout width={colWidth} layout justifyContent={'center'} alignItems={'center'} direction={'row'}>
                <Txt fontFamily={FONT} fontSize={32} fontWeight={700} fill={VERSUS_COLORS[idx]}>
                  {name}
                </Txt>
              </Layout>
            ))}
          </Layout>
        </Layout>

        {SCORES.map((row, n) => {
          const [label, r, h, m] = row;
          const values = [r, h, m];
          return (
            <Layout
              position={pt(160, 420 + n * 110)}
              offset={[-1, -1]}
              width={1600}
              layout
              direction={'row'}
              alignItems={'center'}
            >
              <Layout width={320}>
                <Txt ref={labelRefs[n]} fontFamily={FONT} fontSize={24} fill={C.text} opacity={0}>
                  {label}
                </Txt>
              </Layout>
              {values.map((v, colIdx) => {
                const barFill = createRef<Rect>();
                barRefs[n][colIdx] = barFill;
                return (
                  <Layout width={colWidth} layout justifyContent={'center'} alignItems={'center'} direction={'row'}>
                    <Rect width={BAR_MAX} height={14} radius={7} fill={'rgba(255,255,255,0.08)'}>
                      <Rect
                        ref={barFill}
                        offsetX={-1}
                        position={[-BAR_MAX / 2, 0]}
                        width={0}
                        height={14}
                        radius={7}
                        fill={VERSUS_COLORS[colIdx]}
                      />
                    </Rect>
                  </Layout>
                );
              })}
            </Layout>
          );
        })}
      </Layout>,
    );

    // 同步读出各行 label spacer 的世界坐标落点（absolutePosition，跟它嵌套在
    // Layout(320) → 行 Layout 几层 flex 容器内无关），再把可见覆盖节点直接挂
    // 到 root 下（root 没开 layout，是合法挂载点）复用这些坐标。
    //
    // ⚠️ absolutePosition 是画布像素坐标，跟 `position` prop 的"父节点中心为
    // 原点"坐标不是同一套，不能直接互用——必须用 `.absolutePosition(...)`
    // 这个 setter（内部走 worldToParent() 换算）来设初始值/补间目标，
    // 见 S1 段落头部注释里踩过的坑。
    const labelPos = labelRefs.map(ref => ref().absolutePosition());
    labelVis.forEach((ref, n) => {
      root().add(
        <Txt ref={ref} fontFamily={FONT} fontSize={24} fill={C.text} opacity={0}>
          {SCORES[n][0]}
        </Txt>,
      );
      ref().absolutePosition([labelPos[n].x - 16, labelPos[n].y]);
    });

    const enterRow = (n: number): ThreadGenerator => {
      const [, r, h, m] = SCORES[n];
      const values = [r, h, m];
      return all(
        labelVis[n]().opacity(1, 0.6, easeOutQuint),
        labelVis[n]().absolutePosition([labelPos[n].x, labelPos[n].y], 0.6, easeOutQuint),
        ...values.map((v, colIdx) => barRefs[n][colIdx]().width((v / 5) * BAR_MAX, 0.6, easeOutQuint)),
      );
    };

    yield* all(
      delay(
        0.0,
        all(
          titleGroup().opacity(1, 0.5, easeOutQuint),
          titleGroup().position.y(pt(0, 160)[1], 0.5, easeOutQuint),
        ),
      ),
      delay(0.8, enterRow(0)),
      delay(1.9, enterRow(1)),
      delay(3.0, enterRow(2)),
      delay(4.1, enterRow(3)),
    );
    yield* waitFor(0.9); // 持有至 5.6s
    yield* root().opacity(0, 0.4, easeOutQuint); // 5.6-6.0s 整屏淡出
    root().remove();
  }

  // =========================================================================
  // S6 结语 28.0-30.0s（局部 0.0-2.0s）
  // =========================================================================
  {
    const root = createRef<Layout>();
    const main = createRef<Txt>();
    const sub = createRef<Txt>();
    const black = createRef<Rect>();

    view.add(
      <Layout ref={root} layout direction={'column'} alignItems={'center'} justifyContent={'center'} width={1920} height={1080}>
        <Txt ref={main} fontFamily={FONT} fontSize={56} fontWeight={700} fill={C.text} opacity={0} marginBottom={28}>
          没有最好，只有最合适
        </Txt>
        <Txt ref={sub} fontFamily={FONT} fontSize={22} fill={C.muted} opacity={0}>
          工程团队选 Remotion · Agent 管线选 HyperFrames · 教学演示选 Motion Canvas
        </Txt>
      </Layout>,
    );
    view.add(<Rect ref={black} width={1920} height={1080} fill={'#000000'} opacity={0} />);

    yield* all(delay(0.0, main().opacity(1, 0.6, easeOutQuint)), delay(0.6, sub().opacity(1, 0.6, easeOutQuint)));
    yield* waitFor(0.5); // 持有至 1.7s
    yield* black().opacity(1, 0.3, easeOutQuint); // 1.7-2.0s 淡至黑
  }
});
