/* EAI-COURSE · 页面级交互
   滚动入场 / 阅读进度 / 导航高亮 / 数字滚动
   首屏四段流水线 · 成绩构成 · 知识基础
   （课程现场的播放器在 showcase.js，课表联动在 main.js） */

const REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ══════ 首屏：四段流水线，点开看这一段到底做什么 ══════ */
const STAGES = [
  { zh: "任务仿真", en: "TASK SIMULATION",
    text: "在虚拟环境里把机器人、场景和任务立起来，并把仿真里的行为调到和真机对得上。" },
  { zh: "数据工程", en: "DATA ENGINEERING",
    text: "采集、清洗、对齐示教数据。具身智能里数据的活远比模型的活多。" },
  { zh: "模型训练", en: "MODEL TRAINING",
    text: "在数据上训练策略并先在仿真里验证，重点是搞清楚它什么时候会失败。" },
  { zh: "推理部署", en: "INFERENCE & DEPLOYMENT",
    text: "上真机跑通闭环：推理延迟、控制频率、安全限位、异常兜底。" },
];

function initPipeline() {
  const bar = document.getElementById("pipeline");
  const panel = document.getElementById("pipeline-detail");
  if (!bar || !panel) return;

  const chips = [...bar.querySelectorAll("span[data-stage]")];
  let open = -1;

  chips.forEach(chip => {
    chip.setAttribute("role", "button");
    chip.setAttribute("tabindex", "0");
    chip.setAttribute("aria-expanded", "false");
    const toggle = () => {
      const i = +chip.dataset.stage;
      open = open === i ? -1 : i;
      chips.forEach(c => {
        const on = +c.dataset.stage === open;
        c.classList.toggle("is-open", on);
        c.setAttribute("aria-expanded", String(on));
      });
      if (open < 0) { panel.classList.remove("is-open"); return; }
      const s = STAGES[open];
      panel.innerHTML =
        `<span class="pd-no">0${open + 1} / 04</span>` +
        `<h4>${s.zh}</h4><p>${s.text}</p>` +
        `<p class="pd-en">${s.en}</p>`;
      panel.classList.add("is-open");
    };
    chip.addEventListener("click", toggle);
    chip.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
  });
}

/* ══════ 成绩构成：点每一段看考什么 ══════ */
const GRADES = {
  g1: { title: "平时 20%", text: "每次实验的完成度与课堂参与，有检查点，当场验收。" },
  g2: { title: "期中 30%", text: "阶段项目汇报 + 现场 Demo。" },
  g3: { title: "期末 50%", text: "自选一个真实任务全流程独立完成，交付可复现的代码与真机运行记录。不设笔试。" },
};

function initGrading() {
  const bar = document.querySelector(".grading-bar");
  const panel = document.getElementById("grading-detail");
  if (!bar || !panel) return;

  const segs = [...bar.children];
  let open = null;

  segs.forEach(seg => {
    seg.setAttribute("role", "button");
    seg.setAttribute("tabindex", "0");
    const key = seg.className.trim();
    const toggle = () => {
      open = open === key ? null : key;
      if (!open) { panel.classList.remove("is-open"); return; }
      const g = GRADES[key];
      if (!g) return;
      panel.innerHTML = `<b>${g.title}</b><p>${g.text}</p>`;
      panel.classList.add("is-open");
    };
    seg.addEventListener("click", toggle);
    seg.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
  });
}

/* ══════ 知识基础：点开看要到什么程度 ══════ */
function initPrereq() {
  document.querySelectorAll(".prereq-item").forEach(item => {
    if (!item.querySelector(".prereq-more")) return;
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.setAttribute("aria-expanded", "false");
    const toggle = () => {
      const on = item.classList.toggle("is-open");
      item.setAttribute("aria-expanded", String(on));
    };
    item.addEventListener("click", toggle);
    item.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
  });
}

/* ══════ 授课教师：展开完整履历 ══════ */
function initBio() {
  const btn = document.getElementById("bio-toggle");
  const box = document.getElementById("bio-more");
  if (!btn || !box) return;
  btn.addEventListener("click", () => {
    const on = box.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(on));
    btn.textContent = on ? "收起 −" : "展开完整履历 +";
  });
}

/* ══════ 滚动入场 ══════ */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
  els.forEach((el, i) => {
    el.style.setProperty("--d", (i % 5) * 60 + "ms");
    io.observe(el);
  });
  // 兜底：IntersectionObserver 不生效时也不能白屏
  setTimeout(() => els.forEach(el => el.classList.add("is-in")), 3500);
}

/* ══════ 阅读进度 + 导航当前章节 ══════ */
function initScrollUI() {
  const bar = document.querySelector(".scroll-progress");
  const links = [...document.querySelectorAll(".topbar-nav a[href^='#']")];
  const targets = links
    .map(a => ({ a, el: document.getElementById(a.getAttribute("href").slice(1)) }))
    .filter(t => t.el);
  const topbar = document.querySelector(".topbar");

  let raf = 0;
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const y = scrollY;

      if (bar) {
        const h = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = `scaleX(${h > 0 ? Math.min(1, y / h) : 0})`;
      }

      const probe = (topbar ? topbar.getBoundingClientRect().bottom : 0) + 8;
      let cur = null;
      targets.forEach(t => {
        const r = t.el.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) cur = t.a;
      });
      links.forEach(a => a.classList.toggle("is-current", a === cur));
    });
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();
}

/* ══════ 数字滚动 ══════ */
function initCounters() {
  const els = document.querySelectorAll("[data-count]");
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const to = +el.dataset.count;
      const sfx = el.dataset.suffix || "";
      io.unobserve(el);
      if (REDUCE) { el.textContent = to + sfx; return; }
      const t0 = performance.now(), D = 900;
      const run = t => {
        const p = Math.min(1, (t - t0) / D);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + sfx;
        if (p < 1) requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
    });
  }, { threshold: 0.5 });
  els.forEach(el => io.observe(el));
  setTimeout(() => els.forEach(el => {
    if (el.textContent === "0") el.textContent = el.dataset.count + (el.dataset.suffix || "");
  }), 3500);
}

/* ══════ 公开答疑 + 匿名访客统计：服务配置后自动接入 ══════ */
function initCommunity() {
  const qaRoot = document.getElementById("qa-comment-root");
  const qaStatus = document.getElementById("qa-status");
  const visitRoot = document.getElementById("visit-stats");
  const visitState = document.getElementById("visit-state");

  /*
   * 启用公开答疑时，在本脚本加载前定义 window.COURSE_GISCUS_CONFIG：
   * { repo, repoId, category, categoryId, mapping, term?, theme?, lang? }
   * 请原样采用 giscus.app 在启用 GitHub Discussions 后生成的配置；这些 ID 不是密钥。
   */
  const giscus = window.COURSE_GISCUS_CONFIG;
  if (qaRoot && giscus?.repo && giscus?.repoId && giscus?.category && giscus?.categoryId) {
    qaRoot.replaceChildren();
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.repo = giscus.repo;
    script.dataset.repoId = giscus.repoId;
    script.dataset.category = giscus.category;
    script.dataset.categoryId = giscus.categoryId;
    script.dataset.mapping = giscus.mapping || "pathname";
    if (giscus.term) script.dataset.term = giscus.term;
    script.dataset.strict = "0";
    script.dataset.reactionsEnabled = "1";
    script.dataset.emitMetadata = "0";
    script.dataset.inputPosition = "top";
    script.dataset.theme = giscus.theme || "https://pku-pi-lab.github.io/EAI-course/giscus-theme.css";
    script.dataset.lang = giscus.lang || "zh-CN";
    qaRoot.appendChild(script);
    if (qaStatus) {
      qaStatus.textContent = "已开放";
      qaStatus.classList.add("is-live");
    }
  }

  /*
   * 接入分析服务后可定义 window.COURSE_VISITOR_STATS：
   * { total, unique, updated }。仅展示匿名汇总，不应填入个人身份信息。
   */
  const visits = window.COURSE_VISITOR_STATS;
  if (visitRoot && visits) {
    const values = {
      total: visits.total,
      unique: visits.unique,
      updated: visits.updated,
    };
    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      const field = visitRoot.querySelector(`[data-visit-${key}]`);
      if (field) field.textContent = String(value);
    });
    if (visitState) {
      visitState.innerHTML = "<i></i>匿名统计已更新";
      visitState.classList.add("is-live");
    }
  }
}

initPipeline();
initGrading();
initPrereq();
initBio();
initReveal();
initScrollUI();
initCounters();
initCommunity();
