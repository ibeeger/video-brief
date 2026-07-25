import {Composition, AbsoluteFill} from 'remotion';
const Placeholder = () => <AbsoluteFill style={{backgroundColor: '#0B0D12'}} />;
export const Root = () => (
  <Composition id="Compare" component={Placeholder} durationInFrames={900} fps={30} width={1920} height={1080} />
);
