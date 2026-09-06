/* EAI-COURSE · 01 课程现场
   演示播放器 / 任务矩阵 / 泛化对比
   —— 素材信息全在下面的 MOTIONS / OBJECTS / CLIPS 三处，改这里即可。
   页面级交互（入场、进度条、导航高亮、流水线等）在 interactions.js。 */

const VIDEO_BASE  = "assets/video/";   // 网页用压缩版；原片在 videos/Success/（不入库）
const POSTER_BASE = "assets/posters/";

/* 运动模式（矩阵的行） */
const MOTIONS = [
  { key: "Linear",   zh: "直线运动", en: "LINEAR" },
  { key: "Circular", zh: "圆周运动", en: "CIRCULAR" },
  { key: "Compound", zh: "复合运动", en: "COMPOUND" },
];

/* 目标物体（矩阵的列） */
const OBJECTS = [
  { key: "Cube-A", zh: "方块 A",  en: "CUBE A" },
  { key: "Cube-B", zh: "方块 B",  en: "CUBE B" },
  { key: "Ball",   zh: "小球",    en: "BALL" },
  { key: "Tennis", zh: "网球",    en: "TENNIS" },
  { key: "Rat",    zh: "玩具鼠",  en: "RAT" },
  { key: "Snack",  zh: "零食",    en: "SNACK" },
  { key: "Car",    zh: "玩具车",  en: "CAR" },
];

/* 已有素材：key = 运动-物体 */
const CLIPS = {
  "Linear-Cube-A":   { file: "Linear-Cube-A-Succeed",   dur: 12.6, w: 720,  h: 1280 },
  "Linear-Tennis":   { file: "Linear-Tennis-Succeed",   dur: 9.7,  w: 720,  h: 1280 },
  "Linear-Rat":      { file: "Linear-Rat-Succeed",      dur: 5.2,  w: 720,  h: 1280 },
  "Linear-Car":      { file: "Linear-Car-Succeed",      dur: 5.7,  w: 720,  h: 1280 },
  "Circular-Cube-A": { file: "Circular-Cube-A-Succeed", dur: 7.7,  w: 1280, h: 720 },
  "Circular-Ball":   { file: "Circular-Ball-Succeed",   dur: 8.8,  w: 1280, h: 720 },
  "Circular-Rat":    { file: "Circular-Rat-Succeed",    dur: 8.1,  w: 1280, h: 720 },
  "Circular-Snack":  { file: "Circular-Snack-Succeed",  dur: 7.7,  w: 1280, h: 720 },
  "Compound-Cube-A": { file: "Compound-Cube-A-Succeed", dur: 14.3, w: 880,  h: 720 },
  "Compound-Cube-B": { file: "Compound-Cube-B-Succeed", dur: 6.6,  w: 1280, h: 720 },
  "Compound-Rat":    { file: "Compound-Rat-Succeed",    dur: 5.2,  w: 1280, h: 720 },
  "Compound-Tennis": { file: "Compound-Tennis-Succeed", dur: 4.7,  w: 1280, h: 720 },
};

/* 泛化对比：同一任务、同一策略，训练背景 vs 未见过的背景 */
const COMPARE = {
  base:  "Circular-Ball-Succeed",
  novel: "Circular-Ball-YellowBG-Succeed",
};

document.documentElement.classList.add("sc-js");
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const vsrc = f => VIDEO_BASE + f + ".mp4";
const psrc = f => POSTER_BASE + f + ".jpg";

/* 按矩阵顺序排出播放序列，供 ← → 与自动轮播使用 */
const ORDER = [];
MOTIONS.forEach(m => OBJECTS.forEach(o => {
  const k = m.key + "-" + o.key;
  if (CLIPS[k]) ORDER.push(k);
}));

/* ══════════════ 1 · 舞台播放器 ══════════════ */
function initStage() {
  const stage = document.getElementById("sc-stage");
  if (!stage) return;

  const vids = [stage.querySelector(".v-a"), stage.querySelector(".v-b")];
  const title = document.getElementById("sc-title");
  const tags  = document.getElementById("sc-tags");
  const spec  = document.getElementById("sc-spec");
  const bar   = document.querySelector("#sc-progress i");
  const playBtn = document.getElementById("sc-play");

  let front = 0;      // 当前可见的 video 下标
  let cur = null;     // 当前 clip key
  let token = 0;      // 防止快速切换时的竞态
  let armed = false;  // 是否已进入视口（进入前不加载视频）

  function meta(key) {
    const [mk, ...rest] = key.split("-");
    return {
      motion: MOTIONS.find(m => m.key === mk),
      object: OBJECTS.find(o => o.key === rest.join("-")),
      clip: CLIPS[key],
    };
  }

  const frame = document.getElementById("sc-frame");

  /* 画框贴合视频比例：横屏铺满，竖屏收窄成一条竖幅 */
  function fitFrame(key) {
    const { clip } = meta(key);
    const avail = Math.max(frame.parentElement.clientWidth, 280);
    const vh = Math.max(innerHeight, 520);
    const ar = clip.w / clip.h;
    const capH = Math.min(vh * 0.72, 640);
    let W, H;
    if (ar >= 1) { W = avail; H = W / ar; if (H > capH) { H = capH; W = H * ar; } }
    else { H = Math.min(vh * 0.74, 660); W = Math.min(H * ar, avail); H = W / ar; }
    frame.style.width = Math.round(W) + "px";
    stage.style.height = Math.round(H) + "px";
  }
  addEventListener("resize", () => { if (cur) fitFrame(cur); });

  function paintCaption(key) {
    const { motion, object, clip } = meta(key);
    title.textContent = `${motion.zh} · 抓取${object.zh}`;
    tags.innerHTML =
      `<span class="sc-tag">${motion.en}</span>` +
      `<span class="sc-tag">${object.en}</span>`;
    spec.textContent = `${clip.w}×${clip.h} · ${clip.dur.toFixed(1)}s · 30FPS`;
  }

  function show(key) {
    if (!CLIPS[key] || key === cur) return;
    cur = key;
    paintCaption(key);
    fitFrame(key);
    syncMatrix(key);
    if (!armed) return;              // 未进入视口：只更新文字，不拉视频

    const my = ++token;
    const next = vids[1 - front];
    const prev = vids[front];
    const { clip } = meta(key);

    stage.classList.add("is-loading");
    next.poster = psrc(clip.file);
    next.src = vsrc(clip.file);
    next.load();

    const swap = () => {
      if (my !== token) return;
      stage.classList.remove("is-loading");
      next.classList.add("is-live");
      prev.classList.remove("is-live");
      front = 1 - front;
      if (!REDUCED) next.play().catch(() => {});
      setTimeout(() => { if (my === token) { prev.pause(); prev.removeAttribute("src"); prev.load(); } }, 700);
    };

    next.addEventListener("loadeddata", swap, { once: true });
    next.addEventListener("error", () => { if (my === token) stage.classList.remove("is-loading"); }, { once: true });
  }

  function step(d) {
    const i = ORDER.indexOf(cur);
    show(ORDER[(i + d + ORDER.length) % ORDER.length]);
  }

  /* 进度条 */
  function tick() {
    const v = vids[front];
    if (v && v.duration) bar.style.width = (v.currentTime / v.duration * 100) + "%";
    const glyph = (v && v.paused) ? "▶" : "❙❙";
    if (playBtn.textContent !== glyph) playBtn.textContent = glyph;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  /* 控件 */
  stage.querySelector(".sc-nav.prev").addEventListener("click", () => step(-1));
  stage.querySelector(".sc-nav.next").addEventListener("click", () => step(1));
  playBtn.addEventListener("click", () => {
    const v = vids[front];
    if (v.paused) v.play().catch(() => {}); else v.pause();
  });

  stage.setAttribute("tabindex", "0");
  stage.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft")  { e.preventDefault(); step(-1); }
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
  });

  /* 只在进入视口时加载 / 播放 */
  new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        if (!armed) { armed = true; const k = cur; cur = null; show(k); }
        else if (!REDUCED) vids[front].play().catch(() => {});
      } else {
        vids.forEach(v => v.pause());
      }
    });
  }, { threshold: 0.25 }).observe(stage);

  /* 兜底：若 IntersectionObserver 未生效，滚动或超时后自行加载 */
  const armFallback = () => {
    if (armed) return;
    const r = stage.getBoundingClientRect();
    if (r.top < innerHeight * 1.5 && r.bottom > -innerHeight * 0.5) {
      armed = true; const k = cur; cur = null; show(k);
      removeEventListener("scroll", armFallback);
    }
  };
  addEventListener("scroll", armFallback, { passive: true });
  setTimeout(armFallback, 2500);

  window.__scShow = show;

  /* 支持深链：index.html#clip=Linear-Rat 直接定位到某个任务 */
  const m = /(?:^|[#&])clip=([\w-]+)/.exec(location.hash);
  show(m && CLIPS[m[1]] ? m[1] : "Circular-Ball");   // 默认：圆周 · 小球
}

/* ══════════════ 2 · 泛化矩阵 ══════════════ */
let syncMatrix = () => {};

function initMatrix() {
  const root = document.getElementById("sc-matrix");
  if (!root) return;

  root.innerHTML = "";
  const corner = document.createElement("div");             // 左上角留白
  corner.className = "sc-mx-corner";
  root.appendChild(corner);
  OBJECTS.forEach(o => {
    const c = document.createElement("div");
    c.className = "sc-mx-col";
    c.innerHTML = `<span><b>${o.zh}</b><em>${o.en}</em></span>`;
    root.appendChild(c);
  });

  MOTIONS.forEach(m => {
    const r = document.createElement("div");
    r.className = "sc-mx-row";
    r.innerHTML = `<span><b>${m.zh}</b><em>${m.en}</em></span>`;
    root.appendChild(r);

    OBJECTS.forEach(o => {
      const key = m.key + "-" + o.key;
      const clip = CLIPS[key];
      if (!clip) {
        const empty = document.createElement("div");
        empty.className = "sc-cell is-empty";
        empty.title = `${m.zh} · ${o.zh}：暂无素材`;
        root.appendChild(empty);
        return;
      }
      const btn = document.createElement("button");
      btn.className = "sc-cell";
      btn.type = "button";
      btn.dataset.key = key;
      btn.title = `${m.zh} · 抓取${o.zh}`;
      btn.setAttribute("aria-label", btn.title);
      btn.innerHTML = `<img src="${psrc(clip.file)}" alt="${btn.title}" loading="lazy" decoding="async">`;
      btn.addEventListener("click", () => window.__scShow && window.__scShow(key));
      root.appendChild(btn);
    });
  });

  const cells = root.querySelectorAll(".sc-cell[data-key]");
  syncMatrix = key => cells.forEach(c => c.classList.toggle("is-active", c.dataset.key === key));

  const n = Object.keys(CLIPS).length;
  const el = document.getElementById("sc-matrix-count");
  if (el) el.textContent = `${n} 组已录制 / 共 ${MOTIONS.length} × ${OBJECTS.length} 格`;
}

/* ══════════════ 3 · 泛化对比滑块 ══════════════ */
function initCompare() {
  const box = document.getElementById("sc-compare");
  if (!box) return;

  const a = box.querySelector(".cmp-a");   // 底层：训练背景
  const b = box.querySelector(".cmp-b");   // 顶层：未见过的背景
  let armed = false;

  const setX = pct => box.style.setProperty("--x", Math.max(2, Math.min(98, pct)) + "%");
  setX(50);

  const move = e => {
    const r = box.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    setX(x / r.width * 100);
  };

  let dragging = false;
  box.addEventListener("pointerdown", e => { dragging = true; box.setPointerCapture(e.pointerId); move(e); });
  box.addEventListener("pointermove", e => { if (dragging) move(e); });
  box.addEventListener("pointerup",   () => { dragging = false; });
  box.addEventListener("pointercancel", () => { dragging = false; });
  box.addEventListener("mousemove", e => { if (!dragging) move(e); });   // 悬停即跟随

  /* 两段视频保持同步 */
  a.addEventListener("timeupdate", () => {
    if (Math.abs(b.currentTime - a.currentTime) > 0.15) b.currentTime = a.currentTime;
  });

  new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        if (!armed) {
          armed = true;
          a.src = vsrc(COMPARE.base);
          b.src = vsrc(COMPARE.novel);
          a.load(); b.load();
        }
        if (!REDUCED) { a.play().catch(() => {}); b.play().catch(() => {}); }
      } else { a.pause(); b.pause(); }
    });
  }, { threshold: 0.3 }).observe(box);

  const cmpFallback = () => {
    if (armed) return;
    const r = box.getBoundingClientRect();
    if (r.top < innerHeight * 1.5 && r.bottom > -innerHeight * 0.5) {
      armed = true;
      a.src = vsrc(COMPARE.base); b.src = vsrc(COMPARE.novel);
      a.load(); b.load();
      if (!REDUCED) { a.play().catch(() => {}); b.play().catch(() => {}); }
      removeEventListener("scroll", cmpFallback);
    }
  };
  addEventListener("scroll", cmpFallback, { passive: true });
  setTimeout(cmpFallback, 3000);
}

initMatrix();
initStage();
initCompare();
