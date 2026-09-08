/* EAI-COURSE · 07 课程资料 Repo（2026 秋）
   ────────────────────────────────────────────────────────────
   收到资料后，只需要在下面的 MATERIALS 数组里加一行，页面自动更新。

     1. 文件放进 materials/ 目录
     2. 在 MATERIALS 里加一条：
        { unit: "sim", w: "L2", date: "2026-09-15",
          title: "任务仿真 I 课件", type: "slides",
          file: "materials/L02-任务仿真I-课件.pdf" }

   字段说明：
     unit   所属单元，取 UNITS 里的 key
     w      对应课次（L1–L15），没有就留空
     date   发布日期 YYYY-MM-DD
     title  显示名称
     type   取 MAT_TYPES 里的 key
     file   相对路径；也可以填外链（http 开头）
     note   可选，一行补充说明
   文件大小不用填，页面会自己读。
   ──────────────────────────────────────────────────────────── */

const MATERIALS = [
  // 例：
  // { unit: "intro", w: "L1", date: "2026-09-08", title: "课程介绍", type: "slides",
  //   file: "materials/L01-课程介绍.pdf" },
];

const UNITS = [
  { key: "intro",  zh: "课程介绍",  en: "INTRODUCTION" },
  { key: "sim",    zh: "任务仿真",  en: "TASK SIMULATION" },
  { key: "data",   zh: "数据工程",  en: "DATA ENGINEERING" },
  { key: "train",  zh: "模型训练",  en: "MODEL TRAINING" },
  { key: "deploy", zh: "推理部署",  en: "INFERENCE & DEPLOYMENT" },
  { key: "review", zh: "项目汇报",  en: "PROJECT REVIEWS" },
];

const MAT_TYPES = {
  slides: { zh: "课件",     en: "SLIDES" },
  lab:    { zh: "实验手册", en: "LAB MANUAL" },
  code:   { zh: "代码",     en: "CODE" },
  data:   { zh: "数据",     en: "DATA" },
  ref:    { zh: "参考",     en: "REFERENCE" },
};

const REPO_BROWSE = "https://github.com/PKU-PI-Lab/EAI-course/tree/main/materials";

/* ══════ 工具 ══════ */

const isExternal = f => /^https?:\/\//i.test(f);

function extOf(file) {
  if (isExternal(file)) return "LINK";
  const m = /\.([a-z0-9]+)(?:$|\?)/i.exec(file);
  return m ? m[1].toUpperCase() : "FILE";
}

function humanSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const u = ["B", "KB", "MB", "GB"];
  let i = 0, n = bytes;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return (n >= 10 || i === 0 ? Math.round(n) : n.toFixed(1)) + " " + u[i];
}

/* 文件大小不用手填：加载后异步读一次 Content-Length */
async function fillSize(el, file) {
  if (isExternal(file)) return;
  try {
    const r = await fetch(file, { method: "HEAD" });
    if (!r.ok) return;
    const s = humanSize(+r.headers.get("content-length"));
    if (s) el.textContent = s;
  } catch { /* 本地直接打开 index.html 时会失败，忽略即可 */ }
}

/* ══════ 渲染 ══════ */

function renderMaterials() {
  const root = document.getElementById("repo-list");
  if (!root) return;

  const countEl = document.getElementById("repo-count");
  if (countEl) {
    const used = new Set(MATERIALS.map(m => m.unit)).size;
    countEl.textContent = MATERIALS.length
      ? `${MATERIALS.length} 份文件 · ${used} 个单元`
      : "尚未发布 · 开课后陆续更新";
  }

  /* 还没有任何资料：给一个说明清楚的空状态 */
  if (!MATERIALS.length) {
    root.innerHTML = `
      <div class="repo-empty">
        <span class="repo-empty-no">REPO</span>
        <div>
          <b>课程资料将在开课后陆续发布</b>
          <p>每次课的课件、实验手册、代码模板与参考资料会在课后整理上传，按单元归档在这里，可直接下载。</p>
          <ul class="repo-kinds">
            ${Object.values(MAT_TYPES).map(t => `<li>${t.zh}<em>${t.en}</em></li>`).join("")}
          </ul>
        </div>
      </div>`;
    return;
  }

  root.innerHTML = "";
  UNITS.forEach(u => {
    const items = MATERIALS
      .filter(m => m.unit === u.key)
      .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    if (!items.length) return;

    const block = document.createElement("div");
    block.className = "repo-unit";
    block.innerHTML =
      `<div class="repo-unit-head"><b>${u.zh}</b><em>${u.en}</em>` +
      `<span>${items.length} 份</span></div>`;

    items.forEach(m => {
      const t = MAT_TYPES[m.type] || { zh: m.type || "文件", en: "" };
      const a = document.createElement("a");
      a.className = "repo-row";
      a.href = m.file;
      if (isExternal(m.file)) { a.target = "_blank"; a.rel = "noopener"; }
      else a.setAttribute("download", "");
      a.innerHTML = `
        <span class="repo-w">${m.w || "——"}</span>
        <span class="repo-title"><b>${m.title}</b>${m.note ? `<em>${m.note}</em>` : ""}</span>
        <span class="repo-type">${t.zh}</span>
        <span class="repo-ext">${extOf(m.file)}</span>
        <span class="repo-size">—</span>
        <span class="repo-go">${isExternal(m.file) ? "↗" : "↓"}</span>`;
      block.appendChild(a);
      fillSize(a.querySelector(".repo-size"), m.file);
    });

    root.appendChild(block);
  });
}

function initRepoLink() {
  const a = document.getElementById("repo-browse");
  if (a) a.href = REPO_BROWSE;
}

renderMaterials();
initRepoLink();
