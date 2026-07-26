#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p assets/tts-report
TTS=.venv/bin/edge-tts
V="zh-CN-YunjianNeural"
$TTS --voice $V --text "三个框架，同一支三十秒的视频，各写一遍——这是一份全部来自实测的对比报告。" --write-media assets/tts-report/r1.mp3
$TTS --voice $V --text "实验设定很简单：同一份分镜、同一段旁白、同一台机器，唯一的变量，就是框架本身。" --write-media assets/tts-report/r2.mp3
$TTS --voice $V --text "渲染性能，Remotion 十四秒的均值明显领先；另外两家在二十一到二十三秒之间。" --write-media assets/tts-report/r3.mp3
$TTS --voice $V --text "Motion Canvas 的成片只有零点七六兆——那是码率差异，不是画质缩水。" --write-media assets/tts-report/r4.mp3
$TTS --voice $V --text "代码量 Remotion 最省，四百二十五行；Motion Canvas 七百三十一行里，有二百二十四行是自建渲染脚本——没有 headless CLI 的代价。" --write-media assets/tts-report/r5.mp3
$TTS --voice $V --text "踩坑各有代表作：Remotion 给 TypeScript 降级；HyperFrames 的 check 提供五类静态检查，字体和淡出都要显式声明；Motion Canvas 要靠 puppeteer 才能无头渲染。" --write-media assets/tts-report/r6.mp3
$TTS --voice $V --text "渲染速度的评分原本是三四四，与实测明显矛盾；按既定规则修订为五三三——三轮复测，排序不变。" --write-media assets/tts-report/r7.mp3
$TTS --voice $V --text "工程团队选 Remotion，Agent 管线选 HyperFrames，教学演示选 Motion Canvas。没有最好，只有最合适。" --write-media assets/tts-report/r8.mp3

for f in assets/tts-report/r*.mp3; do
  printf "%s %ss\n" "$f" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")"
done

# 起点(ms): r1=300 r2=10300 r3=24300 r4=36300 r5=48300 r6=66300 r7=90300 r8=106300
ffmpeg -y -v error \
  -f lavfi -t 120 -i anullsrc=r=44100:cl=stereo \
  -i assets/tts-report/r1.mp3 -i assets/tts-report/r2.mp3 -i assets/tts-report/r3.mp3 \
  -i assets/tts-report/r4.mp3 -i assets/tts-report/r5.mp3 -i assets/tts-report/r6.mp3 \
  -i assets/tts-report/r7.mp3 -i assets/tts-report/r8.mp3 \
  -filter_complex "[1]aresample=44100,aformat=channel_layouts=stereo,adelay=300|300[a1];[2]aresample=44100,aformat=channel_layouts=stereo,adelay=10300|10300[a2];[3]aresample=44100,aformat=channel_layouts=stereo,adelay=24300|24300[a3];[4]aresample=44100,aformat=channel_layouts=stereo,adelay=36300|36300[a4];[5]aresample=44100,aformat=channel_layouts=stereo,adelay=48300|48300[a5];[6]aresample=44100,aformat=channel_layouts=stereo,adelay=66300|66300[a6];[7]aresample=44100,aformat=channel_layouts=stereo,adelay=90300|90300[a7];[8]aresample=44100,aformat=channel_layouts=stereo,adelay=106300|106300[a8];[0][a1][a2][a3][a4][a5][a6][a7][a8]amix=inputs=9:normalize=0,atrim=0:120" \
  -b:a 192k assets/voiceover-report.mp3
ffprobe -v error -show_entries format=duration -of csv=p=0 assets/voiceover-report.mp3
