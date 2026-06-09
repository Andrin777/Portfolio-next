/**
 * Imperative DOM interactions ported from the original single-file portfolio
 * (portfolio_V10.html). These operate on the markup rendered by <HomeView/>
 * and are wired up from a single useEffect. Everything registered here is torn
 * down via the returned cleanup function so React Strict Mode double-mounts and
 * client navigations don't leak listeners or animation frames.
 */

type Cleanup = () => void;

const NAME_DOTS = {
  lightMajority: "#0b0b0f",
  lightAccent: "#ff2d3d",
  radiusMin: 0.7,
  radiusMax: 2.1,
  accentRatio: 0.08,
  driftAmpMin: 1.5,
  driftAmpMax: 3.0,
  driftFreqX: 0.55,
  driftFreqY: 0.45,
  springStrength: 0.0062,
  friction: 0.86,
  cursorRadius: 155,
  cursorForce: 0.028,
  touchRadius: 220,
  touchLinger: 500,
  pulseFreqMin: 0.6,
  pulseFreqMax: 1.8,
  pulseAmpMin: 0.18,
  pulseAmpMax: 0.4,
};

const WORDMARK_FONT = '"Schriftli", "Inter", system-ui, sans-serif';

export function initHomeInteractions(): Cleanup {
  if (typeof window === "undefined") return () => {};

  const cleanups: Cleanup[] = [];
  const $ = <T extends Element = HTMLElement>(s: string, c: ParentNode = document) =>
    c.querySelector(s) as T | null;
  const $$ = <T extends Element = HTMLElement>(s: string, c: ParentNode = document) =>
    Array.from(c.querySelectorAll(s)) as T[];

  const on = (
    el: EventTarget,
    type: string,
    fn: EventListenerOrEventListenerObject,
    opts?: boolean | AddEventListenerOptions,
  ) => {
    el.addEventListener(type, fn, opts);
    cleanups.push(() => el.removeEventListener(type, fn, opts));
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasTouchSupport =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isTouch =
    hasTouchSupport &&
    window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  if (!isTouch) document.body.classList.add("has-hover-cursor");

  /* ======================================================================
     Headline split — wrap each char in a .char span, grouped by .word
     ====================================================================== */
  function splitHeadline(el: HTMLElement | null) {
    if (!el || el.dataset.split === "1") return;
    const text = el.textContent || "";
    el.textContent = "";
    const words = text.split(" ");
    words.forEach((word, i) => {
      const wordSpan = document.createElement("span");
      wordSpan.className = "word";
      for (const ch of word) {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = ch;
        wordSpan.appendChild(span);
      }
      el.appendChild(wordSpan);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    el.dataset.split = "1";
  }

  const heroTitles = $$("#heroTitle, #heroTitleDe");
  heroTitles.forEach(splitHeadline);

  /* ======================================================================
     Typewriter reveal on the hero headlines
     ====================================================================== */
  (function typewriter() {
    if (!heroTitles.length) return;

    function positionCaret(h: HTMLElement, charEl: HTMLElement | null) {
      const caret = h.querySelector(".type-caret") as HTMLElement | null;
      if (!caret) return;
      const hRect = h.getBoundingClientRect();
      if (charEl) {
        const cRect = charEl.getBoundingClientRect();
        caret.style.transform = `translate(${cRect.right - hRect.left}px, ${cRect.top - hRect.top}px)`;
      } else {
        caret.style.transform = `translate(0px, 0px)`;
      }
    }
    function lastTypedChar(h: HTMLElement) {
      const typed = h.querySelectorAll(".char.typed");
      return typed.length ? (typed[typed.length - 1] as HTMLElement) : null;
    }

    heroTitles.forEach((h) => {
      if (!h.querySelector(".type-caret")) {
        const caret = document.createElement("span");
        caret.className = "type-caret";
        caret.setAttribute("aria-hidden", "true");
        h.appendChild(caret);
      }
      h.classList.add("is-typing");
      positionCaret(h, null);
    });

    if (reduceMotion) {
      heroTitles.forEach((h) => {
        $$(".char", h).forEach((c) => c.classList.add("typed"));
        h.classList.remove("is-typing");
        h.classList.add("is-typed");
      });
      return;
    }

    const groups = heroTitles.map((h) => $$(".char", h));
    const maxLen = Math.max(...groups.map((g) => g.length));
    let i = 0;
    let timer = 0;

    function step() {
      if (i >= maxLen) {
        heroTitles.forEach((h) => {
          h.classList.remove("is-typing");
          h.classList.add("is-typed");
          positionCaret(h, lastTypedChar(h));
        });
        return;
      }
      let typedChar: HTMLElement | null = null;
      groups.forEach((g) => {
        if (g[i]) {
          g[i].classList.add("typed");
          if (typedChar === null) typedChar = g[i];
        }
      });
      heroTitles.forEach((h, gi) => {
        positionCaret(h, groups[gi][i] || lastTypedChar(h));
      });
      let delay = 28;
      const sample = typedChar ? (typedChar as HTMLElement).textContent || "" : "";
      if (/[.!?]/.test(sample)) delay = 280;
      else if (/[,;:]/.test(sample)) delay = 160;
      else if (/\s/.test(sample)) delay = 65;
      delay += Math.random() * 35;
      i++;
      timer = window.setTimeout(step, delay);
    }

    const begin = () => {
      timer = window.setTimeout(step, 350);
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(begin);
    else begin();
    cleanups.push(() => window.clearTimeout(timer));

    let resizeRaf = 0;
    on(window, "resize", () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        heroTitles.forEach((h) => {
          if (h.classList.contains("is-typing") || h.classList.contains("is-typed"))
            positionCaret(h, lastTypedChar(h));
        });
      });
    });
  })();

  /* ======================================================================
     Section reveal on scroll
     ====================================================================== */
  (function sectionReveal() {
    const sections = $$(".main-page > section.block").filter((s) => s.id !== "work");
    if (!sections.length) return;
    sections.forEach((section, idx) => {
      section.classList.add("scroll-reveal");
      section.style.setProperty("--section-delay", Math.min(idx * 55, 220) + "ms");
    });
    if (reduceMotion || !("IntersectionObserver" in window)) {
      sections.forEach((s) => s.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -12% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    cleanups.push(() => io.disconnect());
  })();

  /* ======================================================================
     Project grid reveal — alternating slide-in per row
     ====================================================================== */
  (function projectReveal() {
    const grid = $("#projGrid");
    if (!grid) return;
    let observer: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-revealed");
              observer!.unobserve(e.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
      );
    }
    function applyDirection(card: HTMLElement, idx: number) {
      const row = Math.floor(idx / 3);
      const fromRight = row % 2 === 1;
      const dist = Math.min(120, Math.max(60, window.innerWidth * 0.06));
      card.style.setProperty("--reveal-tx", (fromRight ? dist : -dist) + "px");
      card.style.transitionDelay = (idx % 3) * 90 + "ms";
    }
    function refresh() {
      const isGrid = grid!.classList.contains("proj-grid");
      const cards = $$(".proj-card", grid!);
      if (!isGrid) return;
      cards.forEach((card, idx) => {
        if (card.dataset.revealReady === "1") return;
        card.dataset.revealReady = "1";
        applyDirection(card, idx);
        if (reduceMotion || !observer) card.classList.add("is-revealed");
        else observer.observe(card);
      });
    }
    refresh();
    const mo = new MutationObserver(refresh);
    mo.observe(grid, { childList: true, attributes: true, attributeFilter: ["class"] });
    cleanups.push(() => {
      mo.disconnect();
      observer?.disconnect();
    });
  })();

  /* ======================================================================
     Spiral work view — 3D scroll-driven layout
     ====================================================================== */
  (function spiral() {
    let raf = 0;
    function update() {
      const scroll = $(".work-spiral-scroll");
      if (!scroll) return;
      const stage = scroll.querySelector(".work-spiral-stage") as HTMLElement | null;
      if (!stage) return;
      const cards = stage.querySelectorAll<HTMLElement>(".spiral-card");
      const n = cards.length;
      if (!n) return;
      const rect = scroll.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < 0 || rect.top > vh) return;

      const cw = stage.clientWidth || window.innerWidth;
      const total = scroll.offsetHeight - vh;
      const progress = total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0;
      const isSpiral = !!$("#work")?.classList.contains("work-spiral");
      const stageActive =
        isSpiral &&
        !document.body.classList.contains("project-active") &&
        rect.top <= 24 &&
        rect.bottom >= vh * 0.65;
      document.body.classList.toggle("spiral-stage-active", stageActive);
      const compact = cw < 760;
      const focus = progress * Math.max(0, n - 1);
      const angleStep = compact ? 0.88 : 0.76;
      const radiusX = Math.min(cw * (compact ? 0.38 : 0.42), compact ? 230 : 480);
      const radiusY = Math.min(vh * (compact ? 0.16 : 0.17), compact ? 120 : 135);
      const laneY = Math.min(vh * (compact ? 0.13 : 0.098), compact ? 84 : 86);
      const depth = compact ? 210 : 265;
      const centerShiftX = compact ? Math.min(cw * 0.04, 22) : -Math.min(cw * 0.03, 42);
      const centerShiftY = vh * (compact ? -0.02 : 0.01);
      const backLimit = compact ? 3.2 : 6.4;
      const frontLimit = compact ? 2.2 : 4.6;

      for (let i = 0; i < n; i++) {
        const card = cards[i];
        const rel = i - focus;
        if (rel < -frontLimit || rel > backLimit) {
          if (card.style.opacity !== "0") {
            card.style.opacity = "0";
            card.style.pointerEvents = "none";
            card.style.transform = "translate3d(-50%, -50%, -3000px)";
          }
          continue;
        }
        const phase = rel * angleStep + 2.04;
        const wander = Math.sin(i * 1.77) * (compact ? 14 : 28);
        const x = centerShiftX + Math.cos(phase) * radiusX + wander;
        const y =
          centerShiftY +
          rel * laneY -
          Math.cos(phase * 0.82) * radiusY +
          Math.sin(i * 0.93) * (compact ? 10 : 22);
        const z = Math.sin(phase) * depth - Math.abs(rel) * (compact ? 18 : 28);
        const depthNorm = (z + depth) / (depth * 2);
        const distanceFade = Math.max(
          0,
          1 - Math.max(0, Math.abs(rel) - (compact ? 3 : 4.8)) / 1.9,
        );
        const edgeFade = Math.max(
          0,
          Math.min(1, (y + vh * 0.82) / (vh * 0.24), (vh * 0.78 - y) / (vh * 0.24)),
        );
        const opacity = Math.max(
          0,
          Math.min(1, (0.38 + depthNorm * 0.62) * distanceFade * edgeFade),
        );
        const scale = compact ? 0.62 + depthNorm * 0.3 : 0.64 + depthNorm * 0.34;
        const rotX = Math.sin(phase * 0.74) * -14 + rel * -1.8;
        const rotY = -Math.cos(phase) * (compact ? 44 : 58);
        const rotZ = Math.sin(i * 1.31 + progress * 2.8) * 9 + Math.cos(phase) * 5;
        card.style.transform =
          `translate3d(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px), ${z.toFixed(1)}px) ` +
          `rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg) rotateZ(${rotZ.toFixed(1)}deg) ` +
          `scale(${scale.toFixed(3)})`;
        card.style.opacity = opacity.toFixed(3);
        card.style.pointerEvents = opacity > 0.42 && z > -depth * 0.15 ? "auto" : "none";
        card.style.zIndex = String(Math.round(z + depth + (frontLimit - Math.abs(rel)) * 10));
        if (!compact) {
          const blur = Math.max(
            0,
            (1 - depthNorm) * 1.8 + Math.max(0, Math.abs(rel) - 4.6) * 0.45,
          );
          card.style.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : "";
        }
      }
    }
    function schedule() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    }
    on(window, "scroll", schedule, { passive: true });
    on(window, "resize", schedule, { passive: true });
    // expose so the React layer can trigger a relayout when the view changes
    (window as unknown as { __spiralUpdate?: () => void }).__spiralUpdate = () =>
      requestAnimationFrame(update);
    requestAnimationFrame(update);
    cleanups.push(() => {
      document.body.classList.remove("spiral-stage-active");
      delete (window as unknown as { __spiralUpdate?: () => void }).__spiralUpdate;
    });
  })();

  /* ======================================================================
     Pointer-driven flourishes — skip entirely on touch devices
     ====================================================================== */
  if (!isTouch) {
    // Custom cursor dot
    (function cursorDot() {
      const dot = $("#cursorDot");
      if (!dot) return;
      let dx = 0,
        dy = 0,
        dcx = 0,
        dcy = 0,
        dotRaf = 0;
      function tick() {
        dcx += (dx - dcx) * 0.25;
        dcy += (dy - dcy) * 0.25;
        dot!.style.transform = `translate(${dcx}px, ${dcy}px) translate(-50%, -50%)`;
        if (Math.abs(dx - dcx) > 0.1 || Math.abs(dy - dcy) > 0.1)
          dotRaf = requestAnimationFrame(tick);
        else dotRaf = 0;
      }
      on(document, "mousemove", (e) => {
        const m = e as MouseEvent;
        dx = m.clientX;
        dy = m.clientY;
        if (!dot.classList.contains("is-active")) dot.classList.add("is-active");
        if (!dotRaf) dotRaf = requestAnimationFrame(tick);
      });
      on(document, "mouseleave", () => dot.classList.remove("is-active"));
      const hoverSelector =
        "a, button, .proj-card, .proj-play-card, .proj-media-nav, .stack-card, .timeline-btn, .cap-card, .now-card, .spiral-card";
      on(document, "mouseover", (e) => {
        if ((e.target as Element).closest(hoverSelector)) dot.classList.add("is-hovering");
      });
      on(document, "mouseout", (e) => {
        if ((e.target as Element).closest(hoverSelector))
          dot.classList.remove("is-hovering");
      });
    })();

    if (!reduceMotion) {
      // Aurora spotlight following the cursor across the hero band
      (function aurora() {
        const hero = $("#hero");
        if (!hero) return;
        let active = false,
          mx = 0,
          my = 0,
          cmx = 0,
          cmy = 0,
          aRaf = 0;
        function tick() {
          cmx += (mx - cmx) * 0.12;
          cmy += (my - cmy) * 0.12;
          hero!.style.setProperty("--mx", cmx.toFixed(2) + "%");
          hero!.style.setProperty("--my", cmy.toFixed(2) + "%");
          if (Math.abs(mx - cmx) > 0.05 || Math.abs(my - cmy) > 0.05)
            aRaf = requestAnimationFrame(tick);
          else aRaf = 0;
        }
        on(document, "mousemove", (e) => {
          const m = e as MouseEvent;
          const r = hero.getBoundingClientRect();
          if (m.clientY < r.top || m.clientY > r.bottom) {
            if (active) {
              active = false;
              hero.classList.remove("is-active");
            }
            return;
          }
          mx = (m.clientX / window.innerWidth) * 100;
          my = ((m.clientY - r.top) / r.height) * 100;
          if (!active) {
            active = true;
            hero.classList.add("is-active");
          }
          if (!aRaf) aRaf = requestAnimationFrame(tick);
        });
      })();

      // Headline proximity field — chars lift & tint near the cursor
      (function proximity() {
        const RADIUS = 170;
        const MAX_LIFT = 16;
        heroTitles.forEach((h) => {
          const chars = h.querySelectorAll<HTMLElement>(".char");
          if (!chars.length) return;
          let rects: { el: HTMLElement; cx: number; cy: number }[] = [];
          let raf = 0,
            lastX = 0,
            lastY = 0,
            active = false;
          function cache() {
            rects = Array.from(chars).map((c) => {
              const r = c.getBoundingClientRect();
              return { el: c, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
            });
          }
          function update() {
            raf = 0;
            if (!active) return;
            for (const c of rects) {
              const dx = lastX - c.cx;
              const dy = lastY - c.cy;
              const dist = Math.hypot(dx, dy);
              let t = Math.max(0, 1 - dist / RADIUS);
              t = t * t * (3 - 2 * t);
              c.el.style.setProperty("--lift", (-MAX_LIFT * t).toFixed(2) + "px");
              c.el.style.setProperty("--tint", t.toFixed(3));
            }
          }
          on(h, "mouseenter", () => {
            cache();
            active = true;
            h.classList.add("is-active");
          });
          on(h, "mousemove", (e) => {
            const m = e as MouseEvent;
            lastX = m.clientX;
            lastY = m.clientY;
            if (!raf) raf = requestAnimationFrame(update);
          });
          on(h, "mouseleave", () => {
            active = false;
            h.classList.remove("is-active");
            for (const c of rects) {
              c.el.style.setProperty("--lift", "0px");
              c.el.style.setProperty("--tint", "0");
            }
          });
          on(window, "resize", () => {
            if (active) cache();
          }, { passive: true });
        });
      })();

      // Magnetic CTAs
      (function magnetic() {
        $$("[data-magnetic]").forEach((btn) => {
          let raf = 0;
          on(btn, "mousemove", (e) => {
            const m = e as MouseEvent;
            const r = btn.getBoundingClientRect();
            const dx = (m.clientX - (r.left + r.width / 2)) * 0.25;
            const dy = (m.clientY - (r.top + r.height / 2)) * 0.25;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
              btn.style.setProperty("--mxd", dx.toFixed(1) + "px");
              btn.style.setProperty("--myd", dy.toFixed(1) + "px");
            });
          });
          on(btn, "mouseleave", () => {
            btn.style.setProperty("--mxd", "0px");
            btn.style.setProperty("--myd", "0px");
          });
        });
      })();

      // Stack card 3D tilt
      (function stackTilt() {
        $$(".stack-card").forEach((card) => {
          let raf = 0;
          on(card, "mousemove", (e) => {
            const m = e as MouseEvent;
            const r = card.getBoundingClientRect();
            const px = (m.clientX - r.left) / r.width;
            const py = (m.clientY - r.top) / r.height;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
              card.style.setProperty("--rx", ((0.5 - py) * 14).toFixed(2) + "deg");
              card.style.setProperty("--ry", ((px - 0.5) * 14).toFixed(2) + "deg");
              card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
              card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
            });
          });
          on(card, "mouseleave", () => {
            card.style.setProperty("--rx", "0deg");
            card.style.setProperty("--ry", "0deg");
          });
        });
      })();
    }
  }

  /* ======================================================================
     Name intro — particle "ANDRIN" wordmark
     ====================================================================== */
  (function nameIntro() {
    const section = $("#nameIntro");
    const canvas = $<HTMLCanvasElement>("#nameCanvas");
    if (!section || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type P = {
      x: number; y: number; vx: number; vy: number; homeX: number; homeY: number;
      radius: number; accent: boolean; phaseX: number; phaseY: number; phaseR: number;
      driftAmp: number; pulseFreq: number; pulseAmp: number;
    };
    let particles: P[] = [];
    const pointer = { x: -9999, y: -9999, active: false, isTouch: false };
    let rafId = 0;
    let isVisible = true;
    let introPhase = true;
    let introStart = 0;
    const introDuration = 1200;
    const introSpringPeak = 0.05;
    let lastBuildWidth = 0;

    function readColors() {
      const cs = getComputedStyle(document.documentElement);
      const isDark = document.documentElement.dataset.theme === "dark";
      if (!isDark)
        return { baseColor: NAME_DOTS.lightMajority, accent: NAME_DOTS.lightAccent, isDark: false };
      return {
        baseColor: cs.getPropertyValue("--text").trim() || "#fafafa",
        accent: cs.getPropertyValue("--accent").trim() || "#ff2d3d",
        isDark: true,
      };
    }
    function sizeCanvas() {
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.floor(rect.width * dpr);
      canvas!.height = Math.floor(rect.height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      return rect;
    }
    function buildParticles(w: number, h: number, scatter: boolean) {
      particles = [];
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const octx = off.getContext("2d");
      if (!octx) return;
      const text = "ANDRIN";
      let fontSize = Math.min(w * 0.28, h * 0.62);
      octx.font = `800 ${fontSize}px ${WORDMARK_FONT}`;
      const measured = octx.measureText(text).width || 1;
      fontSize = Math.min(fontSize * ((w * 0.85) / measured), h * 0.62);
      octx.fillStyle = "#fff";
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.font = `800 ${fontSize}px ${WORDMARK_FONT}`;
      octx.fillText(text, w / 2, h / 2 + fontSize * 0.02);
      const data = octx.getImageData(0, 0, w, h).data;
      const dpr = window.devicePixelRatio || 1;
      const isMobileSize = w <= 640;
      const gap = Math.max(5, Math.round(w / (isMobileSize ? 200 : 240)) + (dpr > 1.5 ? 0 : 1));
      const radiusScale = isMobileSize ? 0.55 : Math.max(1, dpr * 0.8);
      for (let y = 0; y < h; y += gap) {
        for (let x = 0; x < w; x += gap) {
          const idx = (y * w + x) * 4 + 3;
          if (data[idx] > 140) {
            particles.push({
              x: scatter ? Math.random() * w : x,
              y: scatter ? Math.random() * h : y,
              vx: 0,
              vy: 0,
              homeX: x,
              homeY: y,
              radius:
                (NAME_DOTS.radiusMin +
                  Math.random() * (NAME_DOTS.radiusMax - NAME_DOTS.radiusMin)) *
                radiusScale,
              accent: Math.random() < NAME_DOTS.accentRatio,
              phaseX: Math.random() * Math.PI * 2,
              phaseY: Math.random() * Math.PI * 2,
              phaseR: Math.random() * Math.PI * 2,
              driftAmp:
                NAME_DOTS.driftAmpMin +
                Math.random() * (NAME_DOTS.driftAmpMax - NAME_DOTS.driftAmpMin),
              pulseFreq:
                NAME_DOTS.pulseFreqMin +
                Math.random() * (NAME_DOTS.pulseFreqMax - NAME_DOTS.pulseFreqMin),
              pulseAmp:
                NAME_DOTS.pulseAmpMin +
                Math.random() * (NAME_DOTS.pulseAmpMax - NAME_DOTS.pulseAmpMin),
            });
          }
        }
      }
    }
    function sizeAndBuild(scatter: boolean) {
      const rect = sizeCanvas();
      buildParticles(rect.width, rect.height, scatter);
      lastBuildWidth = rect.width;
    }
    function frame() {
      const rect = canvas!.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const { baseColor, accent, isDark } = readColors();
      const now = performance.now();
      const t = now / 1000;
      const currentlyAnimating = introPhase || pointer.active || isVisible;
      ctx!.clearRect(0, 0, w, h);
      let introBoost = 0;
      if (introPhase) {
        const progress = Math.min((now - introStart) / introDuration, 1);
        introBoost = introSpringPeak * (1 - (1 - Math.pow(1 - progress, 3)));
        if (progress >= 1) introPhase = false;
      }
      for (const p of particles) {
        const targetX = p.homeX + Math.sin(t * NAME_DOTS.driftFreqX + p.phaseX) * p.driftAmp;
        const targetY = p.homeY + Math.cos(t * NAME_DOTS.driftFreqY + p.phaseY) * p.driftAmp;
        p.vx += (targetX - p.x) * NAME_DOTS.springStrength;
        p.vy += (targetY - p.y) * NAME_DOTS.springStrength;
        if (introBoost > 0) {
          p.vx += (p.homeX - p.x) * introBoost;
          p.vy += (p.homeY - p.y) * introBoost;
        }
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          const r = pointer.isTouch
            ? Math.min(NAME_DOTS.touchRadius, w * 0.3)
            : NAME_DOTS.cursorRadius;
          const cr2 = r * r;
          if (d2 < cr2) {
            const f = 1 - d2 / cr2;
            p.vx += (dx || 0.01) * NAME_DOTS.cursorForce * f;
            p.vy += (dy || 0.01) * NAME_DOTS.cursorForce * f;
          }
        }
        p.vx *= NAME_DOTS.friction;
        p.vy *= NAME_DOTS.friction;
        p.x += p.vx;
        p.y += p.vy;
        const pulse = 1 + Math.sin(t * p.pulseFreq + p.phaseR) * p.pulseAmp;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2);
        ctx!.fillStyle = p.accent ? accent : baseColor;
        ctx!.globalAlpha = p.accent ? 0.9 : isDark ? 0.78 : 1;
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      if (currentlyAnimating) rafId = requestAnimationFrame(frame);
      else rafId = 0;
    }

    on(section, "mousemove", (e) => {
      const m = e as MouseEvent;
      const r = canvas.getBoundingClientRect();
      pointer.x = m.clientX - r.left;
      pointer.y = m.clientY - r.top;
      pointer.active = true;
      if (!rafId) rafId = requestAnimationFrame(frame);
    });
    on(section, "mouseleave", () => {
      pointer.active = false;
    });

    let lingerTimer = 0;
    function setTouch(touch: Touch) {
      const r = canvas!.getBoundingClientRect();
      pointer.x = touch.clientX - r.left;
      pointer.y = touch.clientY - r.top;
      pointer.active = true;
      pointer.isTouch = true;
      clearTimeout(lingerTimer);
    }
    on(section, "touchstart", (e) => {
      const t = (e as TouchEvent).touches[0];
      if (t) setTouch(t);
    }, { passive: true });
    on(section, "touchmove", (e) => {
      const t = (e as TouchEvent).touches[0];
      if (t) setTouch(t);
    }, { passive: true });
    on(section, "touchend", () => {
      lingerTimer = window.setTimeout(() => {
        pointer.active = false;
        pointer.isTouch = false;
      }, NAME_DOTS.touchLinger);
    });

    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            isVisible = en.isIntersecting;
            if (isVisible && !rafId) rafId = requestAnimationFrame(frame);
          });
        },
        { threshold: 0 },
      );
      io.observe(section);
    }

    let resizeRaf = 0;
    on(window, "resize", () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        const rect = canvas.getBoundingClientRect();
        if (Math.abs(rect.width - lastBuildWidth) < 1) sizeCanvas();
        else sizeAndBuild(false);
        if (!rafId) rafId = requestAnimationFrame(frame);
      });
    });

    function start() {
      sizeAndBuild(true);
      introPhase = true;
      introStart = performance.now();
      if (!rafId) rafId = requestAnimationFrame(frame);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          sizeAndBuild(true);
          introPhase = true;
          introStart = performance.now();
          if (!rafId) rafId = requestAnimationFrame(frame);
        });
      }
    }
    start();
    cleanups.push(() => {
      if (rafId) cancelAnimationFrame(rafId);
      io?.disconnect();
    });
  })();

  return () => {
    cleanups.forEach((fn) => {
      try {
        fn();
      } catch {
        /* ignore */
      }
    });
    document.body.classList.remove("has-hover-cursor");
  };
}
