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

## 待补充内容（占位清单）

- [ ] 庞智博教授照片与简介（`index.html` 02 INSTRUCTOR）
- [ ] 三位业界嘉宾照片、单位、简介（03 GUEST LECTURES）
- [ ] 上课地点（05 SCHEDULE 中的「地点待定 TBA」）
- [ ] 15 次课的具体内容与顺序（`main.js` 顶部 `SESSIONS` 数组，目前为占位）

## 修改课程安排

所有课表数据都在 `main.js` 的 `SESSIONS` 数组里，改一处即可——
日历高亮和下方课次列表都由它自动生成。

`type` 取值：`lecture`（常规课）/ `guest`（嘉宾报告）/ `review`（汇报）/ `holiday`（放假）。
