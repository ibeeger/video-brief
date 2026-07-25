import {Composition} from 'remotion';
import {CompareVideo} from './scenes';

export const Root = () => (
  <Composition id="Compare" component={CompareVideo} durationInFrames={900} fps={30} width={1920} height={1080} />
);
