"""为 videos/Success/ 下每段视频抽一张封面帧到 assets/posters/。

用法（在仓库根目录）:
    python tools/make_posters.py            # 只处理缺封面的
    python tools/make_posters.py --force    # 全部重抽

依赖: opencv-python, pillow
"""

import argparse
import glob
import os

import cv2
from PIL import Image

SRC = "videos/Success"
DST = "assets/posters"
AT = 0.62          # 抽帧位置（时长占比）——多数片段此时正好抓住物体
MAX_EDGE = 1280    # 长边上限
QUALITY = 80


def grab(path):
    cap = cv2.VideoCapture(path)
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    for frac in (AT, 0.5, 0.0):
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(total * frac))
        ok, frame = cap.read()
        if ok:
            cap.release()
            return frame
    cap.release()
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="已存在的封面也重新生成")
    args = ap.parse_args()

    os.makedirs(DST, exist_ok=True)
    made = skipped = 0

    for path in sorted(glob.glob(os.path.join(SRC, "*.mp4"))):
        name = os.path.splitext(os.path.basename(path))[0]
        out = os.path.join(DST, name + ".jpg")
        if os.path.exists(out) and not args.force:
            skipped += 1
            continue

        frame = grab(path)
        if frame is None:
            print(f"!! 读不出帧: {path}")
            continue

        img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        img.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
        img.save(out, quality=QUALITY, optimize=True, progressive=True)
        made += 1

        cap = cv2.VideoCapture(path)
        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        dur = cap.get(cv2.CAP_PROP_FRAME_COUNT) / (cap.get(cv2.CAP_PROP_FPS) or 30)
        cap.release()
        # 顺手打印可直接粘进 showcase.js 的 CLIPS 那一行
        key = name.replace("-Succeed", "")
        print(f'  "{key}": {{ file: "{name}", dur: {dur:.1f}, w: {w}, h: {h} }},')

    print(f"\n生成 {made} 张，跳过 {skipped} 张 → {DST}/")


if __name__ == "__main__":
    main()
