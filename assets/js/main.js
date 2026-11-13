const buttons = document.querySelectorAll(".nav-btn");
const panelsContainer = document.querySelector(".panels");
const panels = document.querySelectorAll(".panel");
const viewport = document.querySelector(".panel-viewport");

let activeIndex = 0;

function isMobileLayout() {
  return window.innerWidth <= 768;
}

function slideTo(index, shouldScroll = false) {
  if (
    !viewport ||
    !panelsContainer ||
    !buttons.length ||
    !panels.length
  ) {
    return;
  }

  activeIndex = index;

  // Update navigation button
  buttons.forEach((button) => {
    button.classList.remove("active");
  });

  buttons[index]?.classList.add("active");

  // Update active panel
  panels.forEach((panel) => {
    panel.classList.remove("active");
  });

  panels[index]?.classList.add("active");

  if (isMobileLayout()) {
    /*
      Mobile uses a normal block layout.
      Do not move the entire panel container horizontally.
    */
    panelsContainer.style.transform = "none";

    if (shouldScroll) {
      document.querySelector(".content-card")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  } else {
    /*
      Desktop keeps the horizontal slider.
    */
    const viewportWidth =
      viewport.getBoundingClientRect().width;

    panelsContainer.style.transform =
      `translateX(-${index * viewportWidth}px)`;
  }
}

buttons.forEach((button, index) => {
  button.addEventListener("click", () => {
    slideTo(index, true);
  });
});

window.addEventListener("resize", () => {
  slideTo(activeIndex);
});

/* THEME TOGGLE */
const themeToggle = document.getElementById("theme-toggle");
const themeFlash = document.querySelector(".theme-flash");
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
  document.body.classList.add("light-mode");
  document.documentElement.classList.add("light-mode");
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");

    const isLight =
      document.body.classList.contains("light-mode");

    document.documentElement.classList.toggle("light-mode", isLight);

    localStorage.setItem(
      "theme",
      isLight ? "light" : "dark"
    );

    // Star animation
    themeToggle.classList.remove("animate");
    void themeToggle.offsetWidth;
    themeToggle.classList.add("animate");

    // Ripple/glow effect
    if (themeFlash) {
      themeFlash.classList.remove("active");
      void themeFlash.offsetWidth;
      themeFlash.classList.add("active");
    }
  });
}

/* SCROLL REVEAL */
function setupReveal() {
  const revealTargets = document.querySelectorAll(
    ".section-subtitle, " +
    ".doing-card, " +
    ".project-card, " +
    ".experience-card, " +
    ".skill-pill, " +
    ".cert-card, " +
    ".map-container, " +
    ".contact-form"
  );

  if (!revealTargets.length) {
    return;
  }

  revealTargets.forEach((element, index) => {
    element.classList.add("reveal");

    const staggerGroup =
      element.classList.contains("doing-card") ||
      element.classList.contains("project-card") ||
      element.classList.contains("cert-card") ||
      element.classList.contains("skill-pill");

    if (staggerGroup) {
      element.classList.add(
        `reveal-delay-${(index % 4) + 1}`
      );
    }
  });

  // Fallback for older browsers
  if (!("IntersectionObserver" in window)) {
    revealTargets.forEach((element) => {
      element.classList.add("is-visible");
    });

    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealTargets.forEach((element) => {
    observer.observe(element);
  });
}


/* BUNGEE GUM: elastic, sticky strands drawn on a canvas.
   - the top edges of the panels are rubber bands you can pluck
   - where the cursor enters a tile, gum sticks to it, stretches to the cursor,
     pulls the tile along, then snaps back with a wobble
   - clicks splat gum and throw playing cards (Hisoka's deck) */
function setupGum() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = window.matchMedia("(hover: none)").matches;
  const TILE = ".doing-card, .cert-card, .project-card";

  /* ---- hover overlays: card pip + label ---- */
  const ranks = ["A", "K", "Q", "J", "10", "9", "8", "7"];
  const suits = ["♥", "♠", "♦", "♣"];
  let n = 0;
  document.querySelectorAll(TILE).forEach((el) => {
    if (el.querySelector(":scope > .hx")) return;
    const hx = document.createElement("div");
    hx.className = "hx";
    hx.setAttribute("aria-hidden", "true");
    const s = n % 4;
    hx.dataset.pip = ranks[n % ranks.length] + suits[s];
    hx.dataset.red = s % 2 === 0 ? "1" : "0";
    hx.dataset.label = el.classList.contains("cert-card")
      ? "TRUMP CARD"
      : el.classList.contains("project-card")
      ? "BUNGEE GUM"
      : "BUNGEE GUM";
    el.appendChild(hx);
    n++;
  });

  /* ---- TEXTURE SURPRISE (project tiles): four strands of gum pin the tile at its corners,
     then the tile takes on the background's texture and blends in for a moment ---- */
  const NS = "http://www.w3.org/2000/svg";
  if (!touch && !reduce) {
    document.querySelectorAll(".experience-card").forEach((card) => {
      let busy = false;
      card.addEventListener("mouseenter", () => {
        if (busy) return;
        busy = true;
        const r = card.getBoundingClientRect();
        const ov = document.createElement("div");
        ov.className = "texfx";
        ov.style.left = r.left + window.scrollX + "px";
        ov.style.top = r.top + window.scrollY + "px";
        ov.style.width = r.width + "px";
        ov.style.height = r.height + "px";
        const svg = document.createElementNS(NS, "svg");
        svg.setAttribute("viewBox", "0 0 100 100");
        svg.setAttribute("preserveAspectRatio", "none");
        /* a strand from each corner, pulled taut across the tile like the patch on the scar */
        const d = [
          "M0,0 C14,10 26,24 44,40",
          "M100,0 C86,10 74,24 56,40",
          "M0,100 C14,90 26,76 44,60",
          "M100,100 C86,90 74,76 56,60",
        ];
        d.forEach((p, i) => {
          ["o", "c", "r"].forEach((cl) => {
            const path = document.createElementNS(NS, "path");
            path.setAttribute("d", p);
            path.setAttribute("class", cl);
            path.setAttribute("pathLength", "1");
            path.style.animationDelay = i * 0.07 + "s";
            svg.appendChild(path);
          });
        });
        ov.appendChild(svg);
        [[0, 0], [100, 0], [0, 100], [100, 100]].forEach((c, i) => {
          const b = document.createElement("i");
          b.style.left = c[0] + "%";
          b.style.top = c[1] + "%";
          b.style.animationDelay = i * 0.07 + "s";
          ov.appendChild(b);
        });
        document.body.appendChild(ov);
        card.classList.add("blending");
        setTimeout(() => card.classList.remove("blending"), 2500);
        setTimeout(() => { ov.remove(); busy = false; }, 2700);
      });
    });
  }

  /* ---- click: gum splat + flying cards ---- */
  /* ---- avatar click: Hisoka's aura, the 200th-floor wall Gon and Killua hit ----
     deep violet air, and hundreds of flame-like magenta streaks tearing outward from the avatar */
  let auraBusy = false;
  function aura() {
    if (auraBusy) return;
    auraBusy = true;
    const reduceM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const W = window.innerWidth, H = window.innerHeight;
    const ox = W * 0.5, oy = H * 0.52;
    const ov = document.createElement("div");
    ov.className = "aura";
    ov.style.setProperty("--ox", ox + "px");
    ov.style.setProperty("--oy", oy + "px");
    ov.innerHTML =
      '<svg width="0" height="0" style="position:absolute"><filter id="auraNoise" x="-10%" y="-10%" width="120%" height="120%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves="3" seed="7" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="160"/></filter></svg>' +
      '<div class="aura-smoke"></div><canvas class="aura-cv"></canvas><div class="aura-core"></div>' +
      '<div class="aura-vig"></div>';
    document.body.appendChild(ov);
    document.documentElement.classList.add("aura-shake");
    setTimeout(() => document.documentElement.classList.remove("aura-shake"), 1500);

    const cv = ov.querySelector("canvas");
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    cv.width = W * dpr; cv.height = H * dpr;
    const ctx = cv.getContext("2d");
    ctx.scale(dpr, dpr);
    const maxR = Math.hypot(Math.max(ox, W - ox), Math.max(oy, H - oy)) * 1.05;
    const N = 340;
    const streaks = [];
    for (let k = 0; k < N; k++) {
      const hot = Math.random() < 0.35;
      streaks.push({
        a: Math.random() * Math.PI * 2,
        sp: 0.35 + Math.random() * 0.9,
        ph: Math.random(),
        len: 0.22 + Math.random() * 0.5,
        w: 6 + Math.random() * 26,
        curl: (Math.random() - 0.5) * 0.7,
        wob: Math.random() * 6.28,
        wf: 2 + Math.random() * 5,
        hue: hot ? 305 + Math.random() * 25 : 268 + Math.random() * 28,
        lum: hot ? 72 : 58,
        al: 0.55 + Math.random() * 0.45
      });
    }
    let raf = 0, t0 = performance.now(), alive = true;
    function frame(now) {
      if (!alive) return;
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      const flick = 0.82 + 0.18 * Math.sin(t * 38) * Math.sin(t * 23);
      for (const s of streaks) {
        const p = (t * s.sp * 0.55 + s.ph) % 1;
        const r0 = maxR * (0.015 + p * 0.78);
        const L = maxR * s.len * (0.45 + p * 0.9);
        const r1 = r0 + L;
        const ang = (r) => s.a + s.curl * (r / maxR) + Math.sin(t * s.wf + s.wob + r * 0.006) * 0.035;
        const a0 = ang(r0), a1 = ang(r1);
        const x0 = ox + Math.cos(a0) * r0, y0 = oy + Math.sin(a0) * r0;
        const x1 = ox + Math.cos(a1) * r1, y1 = oy + Math.sin(a1) * r1;
        const mx = ox + Math.cos((a0 + a1) / 2 + Math.sin(t * s.wf + s.wob) * 0.05) * (r0 + L * 0.5);
        const my = oy + Math.sin((a0 + a1) / 2 + Math.sin(t * s.wf + s.wob) * 0.05) * (r0 + L * 0.5);
        const nx = -Math.sin(a0) * s.w * (0.4 + p), ny = Math.cos(a0) * s.w * (0.4 + p);
        const fade = Math.sin(Math.PI * Math.min(1, p * 1.15)) * (1 - p * 0.35);
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        const col = "hsla(" + s.hue + ",100%," + s.lum + "%,";
        g.addColorStop(0, col + "0)");
        g.addColorStop(0.25, col + (s.al * fade * flick).toFixed(3) + ")");
        g.addColorStop(1, col + "0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x0 + nx * 0.2, y0 + ny * 0.2);
        ctx.quadraticCurveTo(mx + nx, my + ny, x1, y1);
        ctx.quadraticCurveTo(mx - nx, my - ny, x0 - nx * 0.2, y0 - ny * 0.2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      if (!reduceM) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    setTimeout(() => ov.classList.add("out"), 3000);
    setTimeout(() => { alive = false; cancelAnimationFrame(raf); ov.remove(); auraBusy = false; }, 4000);
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest && e.target.closest(".avatar-box")) { aura(); return; }
    const sp = document.createElement("div");
    sp.className = "splat";
    sp.style.left = e.clientX + "px";
    sp.style.top = e.clientY + "px";
    document.body.appendChild(sp);
    setTimeout(() => sp.remove(), 800);
    if (reduce) return;
    for (let i = 0; i < 5; i++) {
      const c = document.createElement("div");
      c.className = "flycard";
      const k = Math.floor(Math.random() * 4);
      c.dataset.s = suits[k];
      c.dataset.r = k % 2 === 0 ? "1" : "0";
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
      const d = 60 + Math.random() * 70;
      c.style.left = e.clientX + "px";
      c.style.top = e.clientY + "px";
      c.style.setProperty("--fx", Math.cos(a) * d + "px");
      c.style.setProperty("--fy", Math.sin(a) * d + 30 + "px");
      c.style.setProperty("--fr", (Math.random() - 0.5) * 720 + "deg");
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 1000);
    }
  });

  /* ---- canvas ---- */
  const cv = document.createElement("canvas");
  cv.className = "gum-canvas";
  cv.setAttribute("aria-hidden", "true");
  document.body.appendChild(cv);
  const ctx = cv.getContext("2d");
  let W = 0, H = 0, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + "px"; cv.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  let rgb = "255,79,163", frame = 0;
  const col = (a) => `rgba(${rgb},${a})`;
  const dark = () => `rgba(120,10,60,0.55)`;

  /* ---- NEN gum: translucent aura, glowing rim, edges that waver and flame upward ---- */
  let nt = 0, lightMode = false;
  function curvePts(x0, y0, x1, y1, sag, n) {
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 + sag, pts = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u;
      pts.push([a * x0 + b * mx + c * x1, a * y0 + b * my + c * y1]);
    }
    return pts;
  }
  function strokePts(pts, lw, style, seed, wob) {
    ctx.beginPath();
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      let x = pts[i][0], y = pts[i][1];
      if (wob) {
        const p = pts[Math.min(i + 1, n - 1)], q = pts[Math.max(i - 1, 0)];
        let tx = p[0] - q[0], ty = p[1] - q[1];
        const l = Math.hypot(tx, ty) || 1;
        const k = (Math.sin(i * 0.85 + nt * 5 + seed * 2.1) + 0.7 * Math.sin(i * 0.37 - nt * 3.3 + seed)) * wob * Math.sin(Math.PI * i / (n - 1));
        x += (-ty / l) * k; y += (tx / l) * k - Math.abs(k) * 0.25;
      }
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.lineWidth = lw; ctx.strokeStyle = style; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
  }
  function nenLine(pts, w) {
    ctx.save();
    if (!lightMode) ctx.globalCompositeOperation = "lighter";
    const fl = 0.8 + 0.2 * Math.sin(nt * 17) * Math.sin(nt * 9.3);
    strokePts(pts, w * 4.2, col(lightMode ? 0.12 : 0.09 * fl), 0, w * 0.4);            /* soft halo */
    ctx.shadowColor = col(0.95); ctx.shadowBlur = 14;
    strokePts(pts, w * 2.0, lightMode ? "rgba(226,40,140,0.40)" : "rgba(214,40,150,0.32)", 1, w * 0.28); /* translucent body */
    ctx.shadowBlur = 0;
    strokePts(pts, w * 1.15, col(lightMode ? 0.55 : 0.48), 2, w * 0.2);
    for (let k = 0; k < 3; k++) {                                                    /* flame wisps */
      strokePts(pts, Math.max(0.8, w * 0.18), "rgba(255,196,232," + (0.2 + 0.14 * Math.sin(nt * 9 + k * 2.1)).toFixed(3) + ")", 3 + k * 1.7, w * 1.0);
    }
    strokePts(pts, Math.max(1, w * 0.3), "rgba(255,238,249,0.9)", 0, w * 0.12);       /* bright rim */
    ctx.restore();
  }
  function strand(x0, y0, x1, y1, sag, w) {
    nenLine(curvePts(x0, y0, x1, y1, sag, 26), w);
  }
  function blob(x, y, r) {
    ctx.save();
    if (!lightMode) ctx.globalCompositeOperation = "lighter";
    const R = r * 3.2;
    const g = ctx.createRadialGradient(x, y, 0, x, y, R);
    g.addColorStop(0, "rgba(255,255,255,0.95)");
    g.addColorStop(0.18, "rgba(255,200,234,0.8)");
    g.addColorStop(0.45, col(0.4));
    g.addColorStop(1, col(0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.fill();
    for (let k = 0; k < 3; k++) {                                                    /* aura licking upward */
      ctx.beginPath();
      for (let i = 0; i <= 8; i++) {
        const u = i / 8;
        const px = x + Math.sin(nt * 6 + k * 2.2 + i * 0.8) * r * 0.5 * u + (k - 1) * r * 0.5 * (1 - u * 0.6);
        const py = y - u * r * (3.4 + k * 0.7) - r * 0.3;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.lineWidth = Math.max(1, r * 0.3); ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(255,206,238," + (0.3 + 0.15 * Math.sin(nt * 8 + k)).toFixed(3) + ")"; ctx.stroke();
    }
    ctx.restore();
  }

  /* ---- rubber bands along the top of the panels ---- */
  const N = 28;
  const bands = [];
  document.querySelectorAll(".sidebar, .content-card").forEach((el) => {
    bands.push({ el, y: new Float32Array(N), v: new Float32Array(N), next: 1 + Math.random() * 3 });
  });
  const mouse = { x: -999, y: -999, px: -999, py: -999 };
  window.addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

  function stepBand(b, dt, t) {
    const r = b.el.getBoundingClientRect();
    if (r.width < 60 || r.bottom < 0 || r.top > H) return;
    const x0 = r.left + 18, x1 = r.right - 18, y0 = r.top + 1;
    const len = x1 - x0;
    /* pluck: the cursor crossing the band */
    if (!reduce && mouse.px > -900) {
      const crossed = (mouse.py - y0) * (mouse.y - y0) <= 0 && Math.abs(mouse.y - mouse.py) < 80;
      if (crossed && mouse.x > x0 && mouse.x < x1) {
        const i = Math.round(((mouse.x - x0) / len) * (N - 1));
        const dir = mouse.y > mouse.py ? 1 : -1;
        for (let k = -3; k <= 3; k++) if (b.v[i + k] !== undefined) b.v[i + k] += dir * 150 * (1 - Math.abs(k) / 4);
      }
      b.next -= dt;
      if (b.next <= 0) { b.v[2 + Math.floor(Math.random() * (N - 4))] += (Math.random() < 0.5 ? -1 : 1) * 70; b.next = 3 + Math.random() * 5; }
    }
    const sub = 4, h = dt / sub;
    for (let q = 0; q < sub; q++) {
      for (let i = 1; i < N - 1; i++) {
        const acc = 260 * (b.y[i - 1] + b.y[i + 1] - 2 * b.y[i]) - 4 * b.v[i] - 40 * b.y[i];
        b.v[i] += acc * h;
      }
      for (let i = 1; i < N - 1; i++) b.y[i] = Math.max(-30, Math.min(30, b.y[i] + b.v[i] * h));
    }
    /* draw */
    const pts = [];
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1);
      pts.push([x0 + u * len, y0 + Math.sin(u * Math.PI) * 5 + b.y[i]]);
    }
    let amp = 0; for (let i = 0; i < N; i++) amp = Math.max(amp, Math.abs(b.y[i]));
    const w = Math.max(2.4, 5.4 - amp * 0.09);
    nenLine(pts, w * 0.85);
    blob(x0, y0, 5.5); blob(x1, y0, 5.5);
  }

  /* ---- tug: sticky strand from the tile to the cursor ---- */
  let tug = null, cooldown = null;
  const snaps = [];
  function startTug(el, x, y) {
    const r = el.getBoundingClientRect();
    tug = { el, rx: x - r.left, ry: y - r.top, ox: 0, oy: 0, out: 0 };
    el.classList.add("is-tugging");
  }
  function release(t, vis) {
    if (!t) return;
    t.el.classList.remove("is-tugging");
    t.el.style.removeProperty("--tug-x");
    t.el.style.removeProperty("--tug-y");
    if (vis) snaps.push({ ax: vis.ax, ay: vis.ay, ex: vis.ex, ey: vis.ey, t: 0 });
  }
  if (!reduce && !touch) {
    document.addEventListener("pointerover", (e) => {
      const el = e.target.closest && e.target.closest(TILE);
      if (!el) return;
      if (tug && tug.el === el) return;
      if (cooldown === el) return;
      if (tug) release(tug, tug.last);
      startTug(el, e.clientX, e.clientY);
    });
  }

  function stepTug(dt) {
    if (!tug) return;
    const r = tug.el.getBoundingClientRect();
    const ax = r.left + tug.rx, ay = r.top + tug.ry;
    const dx = mouse.x - ax, dy = mouse.y - ay;
    const L = Math.hypot(dx, dy);
    const inside = mouse.x >= r.left && mouse.x <= r.right && mouse.y >= r.top && mouse.y <= r.bottom;
    tug.out = inside ? 0 : tug.out + dt;
    tug.last = { ax, ay, ex: mouse.x, ey: mouse.y };
    if (L > 170 || tug.out > 1.6 || r.bottom < 0 || r.top > H) {
      cooldown = tug.el;
      release(tug, tug.last);
      tug = null;
      return;
    }
    /* the tile follows the cursor, up to 16px */
    const k = Math.min(16 / Math.max(L, 1), 0.16);
    const tx = dx * k, ty = dy * k;
    tug.ox += (tx - tug.ox) * Math.min(1, dt * 14);
    tug.oy += (ty - tug.oy) * Math.min(1, dt * 14);
    tug.el.style.setProperty("--tug-x", tug.ox.toFixed(1) + "px");
    tug.el.style.setProperty("--tug-y", tug.oy.toFixed(1) + "px");
    /* three strands: thinner as the gum stretches */
    const sag = Math.max(0, 46 - L) * 0.7;
    const w = Math.max(1.8, Math.min(6, 7 - L * 0.035));
    const nx = L ? -dy / L : 0, ny = L ? dx / L : 1;
    const sp = Math.min(7, 2 + L * 0.03);
    strand(ax + nx * sp, ay + ny * sp, mouse.x, mouse.y, sag * 0.8, w * 0.55);
    strand(ax - nx * sp, ay - ny * sp, mouse.x, mouse.y, sag * 1.2, w * 0.55);
    strand(ax, ay, mouse.x, mouse.y, sag, w);
    blob(ax, ay, Math.max(3.5, w * 0.9));
    blob(mouse.x, mouse.y, Math.max(2.5, w * 0.5));
  }

  function stepSnaps(dt) {
    for (let i = snaps.length - 1; i >= 0; i--) {
      const s = snaps[i];
      s.t += dt;
      if (s.t > 0.6) { snaps.splice(i, 1); continue; }
      const f = Math.exp(-6 * s.t) * Math.cos(14 * s.t);
      const dx = s.ex - s.ax, dy = s.ey - s.ay;
      const L = Math.hypot(dx, dy) || 1;
      const ex = s.ax + dx * f * 0.55 + (-dy / L) * Math.sin(14 * s.t) * 18 * Math.exp(-6 * s.t);
      const ey = s.ay + dy * f * 0.55 + (dx / L) * Math.sin(14 * s.t) * 18 * Math.exp(-6 * s.t);
      strand(s.ax, s.ay, ex, ey, 6 * Math.sin(18 * s.t), Math.max(2, 5 - Math.abs(f) * 2));
      blob(s.ax, s.ay, 4);
    }
  }

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now; nt += dt;
    if (frame++ % 20 === 0) {
      const v = getComputedStyle(document.documentElement).getPropertyValue("--gum-rgb").trim();
      if (v) rgb = v;
      lightMode = document.documentElement.classList.contains("light-mode") || document.body.classList.contains("light-mode");
    }
    ctx.clearRect(0, 0, W, H);
    bands.forEach((b) => stepBand(b, dt, now));
    stepTug(dt);
    stepSnaps(dt);
    mouse.px = mouse.x; mouse.py = mouse.y;
    if (!document.hidden && !reduce) requestAnimationFrame(tick);
  }
  if (reduce) { tick(performance.now()); window.addEventListener("scroll", () => tick(performance.now()), { passive: true }); }
  else {
    requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) { last = performance.now(); requestAnimationFrame(tick); } });
  }
  /* leaving a tile for good re-arms it */
  document.addEventListener("pointerout", (e) => {
    if (cooldown && e.target.closest && e.target.closest(TILE) === cooldown && !(e.relatedTarget && cooldown.contains(e.relatedTarget))) cooldown = null;
  });
}

setupGum();


  /* ---- certification cards: click to flip and read what the cert covers ---- */
  const flipCert = (card) => {
    if (card.dataset.busy) return;
    const done = () => { card.classList.remove("flip-out", "flip-in"); delete card.dataset.busy; };
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      card.classList.toggle("flipped");
      return;
    }
    card.dataset.busy = "1";
    card.classList.add("flip-out");
    setTimeout(() => {
      card.classList.remove("flip-out");
      card.classList.toggle("flipped");
      card.classList.add("flip-in");
      setTimeout(done, 300);
    }, 220);
  };
  document.querySelectorAll(".cert-card").forEach((card) => {
    card.addEventListener("click", () => flipCert(card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flipCert(card); }
    });
  });


/* PAGE LOAD */
window.addEventListener("load", () => {
  slideTo(activeIndex);

  const loader = document.getElementById("loader");

  if (loader) {
    setTimeout(() => {
      loader.classList.add("hidden");
    }, 800);
  }

  setupReveal();
});



