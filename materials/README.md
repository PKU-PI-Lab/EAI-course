# 课程资料 materials/

课程主页「07 课程资料 Repo」读取的目录。庞老师给的课件、实验手册、代码模板、
参考资料都放这里，网页会自动列出来。

## 加一份资料

**第一步**：文件放进本目录，按下面的规则命名。

```
L01-课程介绍-课件.pdf
L02-任务仿真I-课件.pdf
L03-任务仿真II-实验手册.pdf
L05-数据工程-代码模板.zip
参考-Isaac-Sim-快速上手.pdf
```

- 前缀 `L01`–`L15` 对应课次，跨课次的通用资料用 `参考-` 开头
- 只用中文、英文、数字和连字符，**不要空格**（空格在 URL 里会变成 `%20`，容易出错）
- 大小写敏感，`.pdf` 用小写

**第二步**：在仓库根目录的 `materials.js` 顶部 `MATERIALS` 数组里加一行。

```js
const MATERIALS = [
  { unit: "sim", w: "L2", date: "2026-09-15",
    title: "任务仿真 I 课件", type: "slides",
    file: "materials/L02-任务仿真I-课件.pdf" },
];
```

| 字段 | 说明 |
|---|---|
| `unit` | 所属单元：`intro` / `sim` / `data` / `train` / `deploy` / `review` |
| `w` | 对应课次 `L1`–`L15`，通用资料留空字符串 |
| `date` | 发布日期 `YYYY-MM-DD` |
| `title` | 网页上显示的名字 |
| `type` | `slides` 课件 / `lab` 实验手册 / `code` 代码 / `data` 数据 / `ref` 参考 |
| `file` | 相对路径；也可以填 `http` 开头的外链（网盘、GitHub 仓库等） |
| `note` | 可选，一行补充说明 |

**文件大小不用填**，网页加载时自己读。

**第三步**：`git add` 后提交推送，GitHub Pages 一两分钟后生效。

## 注意体积

这个仓库同时是网站，GitHub 单文件上限 100 MB，仓库整体建议控制在 1 GB 以内。
大文件（数据集、录屏、模型权重）不要直接放进来 —— 传网盘或 GitHub Release，
然后在 `MATERIALS` 里把 `file` 填成外链即可，网页会自动显示成「↗ 外链」而不是下载。

PDF 如果很大，可以先压一下：

```bash
ffmpeg -h >/dev/null 2>&1   # 本机 ffmpeg 见根目录 README
```

PDF 压缩用 Ghostscript 更合适：

```bash
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.5 -dPDFSETTINGS=/ebook \
   -dNOPAUSE -dQUIET -dBATCH -sOutputFile=out.pdf in.pdf
```
