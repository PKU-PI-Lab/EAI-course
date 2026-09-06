# EAI-Course · 课程主页

《机器人具身智能系统开发实践基础》（课程号 00334790，2026 秋）课程主页。
纯静态 HTML/CSS/JS，无构建步骤，直接用 GitHub Pages 发布。

## 本地预览

直接双击打开 `index.html`，或：

```bash
python -m http.server 8000
# 浏览器打开 http://localhost:8000
```

## 发布到 GitHub Pages

仓库已在 GitHub 建好（EAI-course）的前提下：

```bash
git add .
git commit -m "course homepage: initial version"
git remote add origin git@github.com:<你的账号或组织>/EAI-course.git   # 若尚未关联远程
git push -u origin main
```

然后在 GitHub 仓库页：**Settings → Pages → Source 选 `main` 分支 / `(root)` → Save**。
约 1 分钟后页面会发布在：

- 仓库在个人账号下：`https://<用户名>.github.io/EAI-course/`
- 仓库在 PKU-PI-Lab 组织下：`https://pku-pi-lab.github.io/EAI-course/`

## 页面结构

01 课程现场 · 02 课程基本信息 · 03 授课教师 · 04 业界嘉宾 · 05 面向的学生 · 06 课程安排

全站沿用同一套「工业极简」令牌（`styles.css` 的 `--paper / --ink / --accent / --mono`）：
1px 硬边、直角、无阴影。新增部分在 `showcase.css`，与 `styles.css` 共用变量。

| 文件 | 作用 |
|---|---|
| `styles.css` | 原有版式 |
| `showcase.css` | 01 课程现场、嘉宾 logo／合作块、教师研究方向、各处交互态 |
| `main.js` | 课表数据（`SESSIONS`）+ 日历、课次列表、类型筛选与联动 |
| `showcase.js` | 01 的演示播放器、任务矩阵、泛化对比 |
| `interactions.js` | 首屏四段流水线、成绩构成、知识基础、教师履历展开、滚动入场、阅读进度、导航高亮、数字滚动 |
| `assets/posters/*.jpg` | 每段视频的封面帧（长边 1280，约 55 KB/张） |

## 交互一览

- **首屏流水线**：点四段中任意一段，下方展开该环节做什么（文案在 `interactions.js` 的 `STAGES`）
- **01 任务矩阵**：3 运动模式 × 7 物体，点任意一格在上方播放；横屏铺满、竖屏自动收窄成竖幅
- **01 泛化对比**：拖动分割线对比训练背景与未见过的背景
- **02 成绩构成**：点三段中任意一段展开考核说明（`GRADES`）
- **03 教师**：展开完整履历
- **05 知识基础**：点 A–D 展开「要到什么程度」
- **06 课程安排**：按类型筛选（全部／讲授／嘉宾／汇报），日历与课次列表双向高亮，点日历跳到对应课次
- 全局：阅读进度条、导航当前章节高亮、滚动入场（均尊重 `prefers-reduced-motion`）

## 改视频素材：只动 `showcase.js` 顶部三个常量

```js
const MOTIONS = [...]   // 矩阵的「行」：运动模式
const OBJECTS = [...]   // 矩阵的「列」：目标物体
const CLIPS   = {...}   // key = "运动-物体"，有就渲染，没有就是「待补充」斜纹格
```

新增一段视频：

1. 放进 `videos/Success/`，命名 `运动-物体-Succeed.mp4`（**只用 ASCII，不要空格**）
2. `python tools/make_posters.py` 生成封面帧（会顺带打印出可直接粘进 `CLIPS` 的那一行）
3. 把那一行粘进 `CLIPS`

深链：`index.html#clip=Linear-Rat` 可直接定位到某一段，方便发给学生看某个 demo。

## 视频

网页读的是 `assets/video/`（720p / 无音轨 / faststart 的压缩版，13 段共约 5.6 MB），
原片留在 `videos/Success/`，**不入库**（见 `.gitignore`）。

重新压缩（改了原片或加了新片之后）：

```bash
bash tools/compress_videos.sh /path/to/ffmpeg
```

脚本按长边 1280 缩放、`-crf 26 -preset slow`、去音轨、加 `+faststart`。
本机 ffmpeg 由 `pip install imageio-ffmpeg` 提供，路径可用
`python -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"` 查。

页面还做了懒加载：视频进视口才拉流，离开即暂停。

## 待补充内容（占位清单）

- [ ] 庞智博教授照片与简介（`index.html` 02 INSTRUCTOR）
- [ ] 三位业界嘉宾照片、单位、简介（03 GUEST LECTURES）
- [ ] 上课地点（05 SCHEDULE 中的「地点待定 TBA」）
- [ ] 15 次课的具体内容与顺序（`main.js` 顶部 `SESSIONS` 数组，目前为占位）
- [ ] 补齐任务矩阵中的 9 个「待补充」格子（运动模式 × 物体）

## 修改课程安排

所有课表数据都在 `main.js` 的 `SESSIONS` 数组里，改一处即可——
日历高亮和下方课次列表都由它自动生成。

`type` 取值：`lecture`（常规课）/ `guest`（嘉宾报告）/ `review`（汇报）/ `holiday`（放假）。
