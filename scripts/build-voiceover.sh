#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
TTS=.venv/bin/edge-tts
V="zh-CN-YunjianNeural"
$TTS --voice $V --text "程序化视频，三种答案。" --write-media assets/tts/s1.mp3
$TTS --voice $V --rate "+15%" --text "Remotion，用 React 组件写视频，生态成熟，适合工程团队。" --write-media assets/tts/s2.mp3
$TTS --voice $V --rate "+10%" --text "HyperFrames，写 HTML 就能渲染视频，为 AI Agent 而生。" --write-media assets/tts/s3.mp3
$TTS --voice $V --text "Motion Canvas，生成器描述动画流，是教学演示的利器。" --write-media assets/tts/s4.mp3
$TTS --voice $V --text "三者在生态、上手和性能上，各有胜场。" --write-media assets/tts/s5.mp3
$TTS --voice $V --rate "+15%" --text "只有最合适。" --write-media assets/tts/s6.mp3

for f in assets/tts/s*.mp3; do
  printf "%s %ss\n" "$f" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")"
done

# 起点(ms): s1=300 s2=4300 s3=10300 s4=16300 s5=22300 s6=28000
ffmpeg -y -v error \
  -f lavfi -t 30 -i anullsrc=r=44100:cl=stereo \
  -i assets/tts/s1.mp3 -i assets/tts/s2.mp3 -i assets/tts/s3.mp3 \
  -i assets/tts/s4.mp3 -i assets/tts/s5.mp3 -i assets/tts/s6.mp3 \
  -filter_complex "[1]aresample=44100,aformat=channel_layouts=stereo,adelay=300|300[a1];[2]aresample=44100,aformat=channel_layouts=stereo,adelay=4300|4300[a2];[3]aresample=44100,aformat=channel_layouts=stereo,adelay=10300|10300[a3];[4]aresample=44100,aformat=channel_layouts=stereo,adelay=16300|16300[a4];[5]aresample=44100,aformat=channel_layouts=stereo,adelay=22300|22300[a5];[6]aresample=44100,aformat=channel_layouts=stereo,adelay=28000|28000[a6];[0][a1][a2][a3][a4][a5][a6]amix=inputs=7:normalize=0,atrim=0:30" \
  -b:a 192k assets/voiceover.mp3
ffprobe -v error -show_entries format=duration -of csv=p=0 assets/voiceover.mp3
