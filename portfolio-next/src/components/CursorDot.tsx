"use client";

import { useEffect, useRef } from "react";

/**
 * Custom trailing cursor dot (ported from the legacy portfolio). The old CSS
 * hides the system cursor globally via `cursor: none` on pointer:fine devices,
 * so this dot must exist on *every* page — otherwise sub-pages show no cursor
 * at all. Rendered once from the root layout.
 */
export function CursorDot() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = ref.current;
    if (!dot) return;

    // Skip on touch devices — there the CSS keeps the system cursor.
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const isTouch =
      hasTouch && window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    if (isTouch) return;

    document.body.classList.add("has-hover-cursor");

    let dx = 0,
      dy = 0,
      cx = 0,
      cy = 0,
      raf = 0;

    function tick() {
      cx += (dx - cx) * 0.25;
      cy += (dy - cy) * 0.25;
      dot!.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      if (Math.abs(dx - cx) > 0.1 || Math.abs(dy - cy) > 0.1)
        raf = requestAnimationFrame(tick);
      else raf = 0;
    }

    const onMove = (e: MouseEvent) => {
      dx = e.clientX;
      dy = e.clientY;
      if (!dot.classList.contains("is-active")) dot.classList.add("is-active");
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => dot.classList.remove("is-active");

    const hoverSelector =
      "a, button, .proj-card, .proj-play-card, .proj-media-nav, .stack-card, .timeline-btn, .cap-card, .now-card, .spiral-card";
    const onOver = (e: Event) => {
      if ((e.target as Element).closest(hoverSelector))
        dot.classList.add("is-hovering");
    };
    const onOut = (e: Event) => {
      if ((e.target as Element).closest(hoverSelector))
        dot.classList.remove("is-hovering");
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      if (raf) cancelAnimationFrame(raf);
      document.body.classList.remove("has-hover-cursor");
    };
  }, []);

  return <div className="cursor-dot" id="cursorDot" aria-hidden="true" ref={ref} />;
}
