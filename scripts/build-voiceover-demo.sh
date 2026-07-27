#!/usr/bin/env bash
# 旁白音轨 — video-brief-demo（BRIEF.md §6，九段，总长 51s）
# 段起点 = BRIEF §5 场景起点 + 0.4s 引入留白
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p video-brief-demo/tts
TTS=.venv/bin/edge-tts
V="zh-CN-YunjianNeural"
D=video-brief-demo/tts

$TTS --voice $V --text "三四线城市的咖啡增速，是一线的两点四倍。" --write-media $D/d1.mp3
$TTS --voice $V --text "先看总量：五年规模从八十七亿到三百四十二亿，年复合百分之四十点八。" --write-media $D/d2.mp3
$TTS --voice $V --text "拆成两层，曲线立刻分叉。一线第三年后走平，三四线一路向上。" --write-media $D/d3.mp3
$TTS --voice $V --text "五年累计，下沉市场是一线的两点四倍。" --write-media $D/d4.mp3
$TTS --voice $V --text "原因之一，门店密度还有空间。" --write-media $D/d5.mp3
$TTS --voice $V --text "之二，客单价降，订单翻倍。" --write-media $D/d6.mp3
$TTS --voice $V --text "之三，外卖渗透近四成。" --write-media $D/d7.mp3
$TTS --voice $V --text "但有一个反向信号：单店月营收在下滑。" --write-media $D/d8.mp3
$TTS --voice $V --text "增速是总量的故事，单店才是生意的故事。" --write-media $D/d9.mp3

echo "--- 各段实测时长（须小于对应场景时长 - 0.4s 引入）---"
i=1
for f in $D/d*.mp3; do
  printf "%s %ss\n" "$f" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")"
  i=$((i+1))
done

# 起点(ms)：场景起点 0/6/14/22/28/32/36/40/45 秒 + 400ms
ffmpeg -y -v error \
  -f lavfi -t 51 -i anullsrc=r=44100:cl=stereo \
  -i $D/d1.mp3 -i $D/d2.mp3 -i $D/d3.mp3 -i $D/d4.mp3 -i $D/d5.mp3 \
  -i $D/d6.mp3 -i $D/d7.mp3 -i $D/d8.mp3 -i $D/d9.mp3 \
  -filter_complex "\
[1]aresample=44100,aformat=channel_layouts=stereo,adelay=400|400[a1];\
[2]aresample=44100,aformat=channel_layouts=stereo,adelay=6400|6400[a2];\
[3]aresample=44100,aformat=channel_layouts=stereo,adelay=14400|14400[a3];\
[4]aresample=44100,aformat=channel_layouts=stereo,adelay=22400|22400[a4];\
[5]aresample=44100,aformat=channel_layouts=stereo,adelay=28400|28400[a5];\
[6]aresample=44100,aformat=channel_layouts=stereo,adelay=32400|32400[a6];\
[7]aresample=44100,aformat=channel_layouts=stereo,adelay=36400|36400[a7];\
[8]aresample=44100,aformat=channel_layouts=stereo,adelay=40400|40400[a8];\
[9]aresample=44100,aformat=channel_layouts=stereo,adelay=45400|45400[a9];\
[0][a1][a2][a3][a4][a5][a6][a7][a8][a9]amix=inputs=10:normalize=0,atrim=0:51" \
  -b:a 192k video-brief-demo/assets/voiceover-demo.mp3

echo "--- 合轨总长 ---"
ffprobe -v error -show_entries format=duration -of csv=p=0 video-brief-demo/assets/voiceover-demo.mp3
