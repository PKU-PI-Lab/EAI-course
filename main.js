/* EAI-COURSE 00334790 · FALL 2026 schedule renderer
   学期：2026-09-08 ~ 2026-12-22，每周二 15:00–18:00，10-06 国庆停课 */

const SESSIONS = [
  { w: "W01", date: "2026-09-08", zh: "课程介绍 · 业界嘉宾分享", en: "Course Introduction + Guest Talk",
    tag: "讲授+嘉宾 LEC+GUEST", type: "lecture", types: ["lecture", "guest"], place: "三教 501",
    agenda: [
      { t: "15:10 – 16:00", who: "庞智博", what: "课程介绍" },
      { t: "16:10 – 17:00", who: "池晓威", what: "行业经验分享" },
    ] },
  { w: "W02", date: "2026-09-15", zh: "任务仿真 I（占位）", en: "Task Simulation I", tag: "讲授+实验 LEC+LAB", type: "lecture" },
  { w: "W03", date: "2026-09-22", zh: "任务仿真 II（占位）", en: "Task Simulation II", tag: "讲授+实验 LEC+LAB", type: "lecture" },
  { w: "W04", date: "2026-09-29", zh: "业界嘉宾报告（待定）", en: "Guest Lecture TBA", tag: "嘉宾 GUEST", type: "guest" },
  { w: null, date: "2026-10-06", zh: "国庆假期 · 停课", en: "National Day Holiday", tag: "HOLIDAY", type: "holiday" },
  { w: "W05", date: "2026-10-13", zh: "数据工程 I（占位）", en: "Data Engineering I", tag: "讲授+实验 LEC+LAB", type: "lecture" },
  { w: "W06", date: "2026-10-20", zh: "数据工程 II（占位）", en: "Data Engineering II", tag: "讲授+实验 LEC+LAB", type: "lecture" },
  { w: "W07", date: "2026-10-27", zh: "业界嘉宾报告（待定）", en: "Guest Lecture TBA", tag: "嘉宾 GUEST", type: "guest" },
  { w: "W08", date: "2026-11-03", zh: "期中项目汇报", en: "Mid-term Review", tag: "汇报 REVIEW", type: "review" },
  { w: "W09", date: "2026-11-10", zh: "模型训练 I（占位）", en: "Model Training I", tag: "讲授+实验 LEC+LAB", type: "lecture" },
  { w: "W10", date: "2026-11-17", zh: "模型训练 II（占位）", en: "Model Training II", tag: "讲授+实验 LEC+LAB", type: "lecture" },
  { w: "W11", date: "2026-11-24", zh: "业界嘉宾报告（待定）", en: "Guest Lecture TBA", tag: "嘉宾 GUEST", type: "guest" },
  { w: "W12", date: "2026-12-01", zh: "推理部署 I（占位）", en: "Inference & Deployment I", tag: "讲授+实验 LEC+LAB", type: "lecture" },
  { w: "W13", date: "2026-12-08", zh: "推理部署 II（占位）", en: "Inference & Deployment II", tag: "讲授+实验 LEC+LAB", type: "lecture" },
  { w: "W14", date: "2026-12-15", zh: "期末项目汇报 I（占位）", en: "Final Review I", tag: "汇报 REVIEW", type: "review" },
  { w: "W15", date: "2026-12-22", zh: "期末项目汇报 II · 结课（占位）", en: "Final Review II", tag: "汇报 REVIEW", type: "review" },
];

const MONTHS = [
  { y: 2026, m: 8,  label: "09", name: "SEPTEMBER" },
  { y: 2026, m: 9,  label: "10", name: "OCTOBER" },
  { y: 2026, m: 10, label: "11", name: "NOVEMBER" },
  { y: 2026, m: 11, label: "12", name: "DECEMBER" },
];

const byDate = Object.fromEntries(SESSIONS.map(s => [s.date, s]));

function fmt(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function renderCalendar() {
  const root = document.getElementById("calendar");
  const dows = ["一", "二", "三", "四", "五", "六", "日"];

  MONTHS.forEach(({ y, m, label, name }) => {
    const month = document.createElement("div");
    month.className = "cal-month";
    month.innerHTML = `<div class="cal-month-head"><span>2026.${label}</span><span>${name}</span></div>`;

    const grid = document.createElement("div");
    grid.className = "cal-grid";
    dows.forEach(d => {
      const c = document.createElement("div");
      c.className = "cal-dow";
      c.textContent = d;
      grid.appendChild(c);
    });

    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const offset = (new Date(y, m, 1).getDay() + 6) % 7; // Monday-first
    for (let i = 0; i < offset; i++) {
      const cell = document.createElement("div");
      cell.className = "cal-cell empty";
      grid.appendChild(cell);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement("div");
      cell.className = "cal-cell";
      cell.textContent = d;
      const s = byDate[fmt(y, m, d)];
      if (s && s.type === "holiday") {
        cell.classList.add("holiday");
        cell.title = s.zh;
      } else if (s) {
        cell.classList.add("class");
        cell.dataset.w = s.w;
        cell.dataset.date = s.date;
        cell.dataset.type = s.type;
        cell.dataset.types = (s.types || [s.type]).join(",");
        cell.title = `${s.w} · ${s.zh}`;
        cell.setAttribute("role", "button");
        cell.setAttribute("tabindex", "0");
      }
      grid.appendChild(cell);
    }

    month.appendChild(grid);
    root.appendChild(month);
  });
}

function renderSessionList() {
  const root = document.getElementById("session-list");
  SESSIONS.forEach(s => {
    const row = document.createElement("div");
    row.className = "session-row";
    row.dataset.date = s.date;
    row.dataset.type = s.type;
    if (s.type === "holiday") row.classList.add("holiday-row");
    if (s.type === "guest") row.classList.add("tag-guest");
    if (s.type === "review") row.classList.add("tag-review");

    row.dataset.types = (s.types || [s.type]).join(",");

    const dateStr = s.date.slice(5).replace("-", ".") + " TUE";
    row.innerHTML = `
      <span class="session-w">${s.w ?? "——"}</span>
      <span class="session-date">${dateStr}</span>
      <span class="session-topic"><b>${s.zh}</b>${s.agenda ? '<i class="session-more">+</i>' : ""}<span class="en">${s.en}</span></span>
      <span class="session-tag">${s.tag}</span>`;
    root.appendChild(row);

    if (!s.agenda) return;
    const ag = document.createElement("div");
    ag.className = "session-agenda";
    ag.dataset.date = s.date;
    ag.innerHTML =
      s.agenda.map(a =>
        `<div class="ag-row"><span class="ag-t">${a.t}</span><b>${a.who}</b><span>${a.what}</span></div>`
      ).join("") +
      (s.place ? `<div class="ag-place">地点 VENUE · ${s.place}</div>` : "");
    root.appendChild(ag);

    row.classList.add("has-agenda");
    row.setAttribute("role", "button");
    row.setAttribute("tabindex", "0");
    row.setAttribute("aria-expanded", "false");
    const toggle = () => {
      const on = ag.classList.toggle("is-open");
      row.classList.toggle("is-expanded", on);
      row.setAttribute("aria-expanded", String(on));
      const i = row.querySelector(".session-more");
      if (i) i.textContent = on ? "−" : "+";
    };
    row.addEventListener("click", toggle);
    row.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
  });
}

/* ── 日历 ↔ 课次列表 联动，以及按类型筛选 ── */

const FILTERS = [
  { key: "all",     zh: "全部",   en: "ALL" },
  { key: "lecture", zh: "讲授",   en: "LECTURE" },
  { key: "guest",   zh: "嘉宾",   en: "GUEST" },
  { key: "review",  zh: "汇报",   en: "REVIEW" },
];

function link(date, on) {
  document
    .querySelectorAll(`.cal-cell[data-date="${date}"], .session-row[data-date="${date}"]`)
    .forEach(el => el.classList.toggle("is-linked", on));
}

function initScheduleUX() {
  const cells = [...document.querySelectorAll(".cal-cell.class")];
  const rows  = [...document.querySelectorAll(".session-row")];

  /* 悬停/聚焦任意一侧，另一侧同步高亮 */
  [...cells, ...rows].forEach(el => {
    const d = el.dataset.date;
    if (!d) return;
    el.addEventListener("mouseenter", () => link(d, true));
    el.addEventListener("mouseleave", () => link(d, false));
    el.addEventListener("focus", () => link(d, true));
    el.addEventListener("blur", () => link(d, false));
  });

  /* 点日历里的上课日 → 跳到对应课次 */
  const jump = d => {
    const row = document.querySelector(`.session-row[data-date="${d}"]`);
    if (!row) return;
    row.scrollIntoView({ block: "center", behavior: "smooth" });
    row.classList.add("is-linked");
    setTimeout(() => row.classList.remove("is-linked"), 1400);
    const ag = document.querySelector(`.session-agenda[data-date="${d}"]`);
    if (ag && !ag.classList.contains("is-open")) row.click();
  };
  cells.forEach(c => {
    c.addEventListener("click", () => jump(c.dataset.date));
    c.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); jump(c.dataset.date); }
    });
  });

  /* 按类型筛选：课次列表隐藏，日历里对应日期变淡 */
  const box = document.getElementById("sched-filter");
  if (!box) return;
  let active = "all";

  FILTERS.forEach(f => {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.key = f.key;
    b.textContent = `${f.zh} ${f.en}`;
    b.setAttribute("aria-pressed", String(f.key === "all"));
    if (f.key === "all") b.classList.add("is-on");

    b.addEventListener("click", () => {
      active = f.key;
      box.querySelectorAll("button").forEach(x => {
        const on = x.dataset.key === active;
        x.classList.toggle("is-on", on);
        x.setAttribute("aria-pressed", String(on));
      });
      const match = el => active === "all" || (el.dataset.types || el.dataset.type || "").split(",").includes(active);
      rows.forEach(r => {
        const hit = match(r);
        r.classList.toggle("is-hidden", !hit);
        const ag = document.querySelector(`.session-agenda[data-date="${r.dataset.date}"]`);
        if (ag) ag.classList.toggle("is-hidden", !hit);
      });
      cells.forEach(c => c.classList.toggle("is-dimmed", !match(c)));
    });
    box.appendChild(b);
  });
}

renderCalendar();
renderSessionList();
initScheduleUX();
