#!/usr/bin/env bash
# 把 videos/Success/*.mp4 压成网页用的 720p / 无音轨 / faststart 版本，输出到 assets/video/
# 用法: bash tools/compress_videos.sh [ffmpeg路径]
set -e
FF="${1:-ffmpeg}"
mkdir -p assets/video
for f in videos/Success/*.mp4; do
  out="assets/video/$(basename "$f")"
  "$FF" -y -hide_banner -loglevel error -i "$f" \
    -vf "scale='if(gt(iw,ih),min(1280,iw),-2)':'if(gt(iw,ih),-2,min(1280,ih))'" \
    -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -profile:v high \
    -an -movflags +faststart "$out"
  printf '%-38s %6.1f MB -> %5.1f MB\n' "$(basename "$f")" \
    "$(python -c "import os;print(os.path.getsize('$f')/1e6)")" \
    "$(python -c "import os;print(os.path.getsize('$out')/1e6)")"
done
