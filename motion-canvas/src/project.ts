import {makeProject} from '@motion-canvas/core';
import compare from './scenes/compare?scene';

export default makeProject({
  scenes: [compare],
  audio: '/voiceover.mp3',
});
