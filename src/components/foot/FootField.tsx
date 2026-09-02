import { useEffect, useRef } from "react";
import { FOOT_OUTLINE, FOOT_VB, pressureColor } from "@/lib/pressure";
import type { Foot } from "@/lib/types";

export interface FieldSample {
  x: number;
  y: number;
  v: number;
}

/**
 * Canvas renderer for a single foot's pressure field. Draws soft additive
 * pressure blobs clipped to the foot outline, plus an optional
 * centre-of-pressure trail. Static maps redraw only on resize / theme change;
 * pass `animate` for the live view to run a per-frame loop.
 */
export function FootField({
  field,
  foot,
  cop = null,
  trail,
  grid = false,
  outline = true,
  animate = false,
  className = "",
}: {
  field: FieldSample[];
  foot: Foot;
  cop?: { x: number; y: number } | null;
  trail?: { x: number; y: number }[];
  grid?: boolean;
  outline?: boolean;
  animate?: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<Path2D | null>(null);
  const drawRef = useRef<() => void>(() => {});

  const state = { field, cop, trail, grid, outline, foot };
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    pathRef.current = new Path2D(FOOT_OUTLINE);
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;

    drawRef.current = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      const s = stateRef.current;
      const dark = document.documentElement.dataset.theme !== "light";

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const sx = w / FOOT_VB.w;
      const sy = h / FOOT_VB.h;
      ctx.save();
      if (s.foot === "left") {
        ctx.translate(w, 0);
        ctx.scale(-sx, sy);
      } else {
        ctx.scale(sx, sy);
      }

      const path = pathRef.current!;
      ctx.fillStyle = dark ? "rgba(255,255,255,0.03)" : "rgba(34,30,42,0.035)";
      ctx.fill(path);

      ctx.save();
      ctx.clip(path);

      if (s.grid) {
        ctx.fillStyle = dark ? "rgba(236,232,241,0.10)" : "rgba(34,30,42,0.10)";
        for (let gy = 10; gy < FOOT_VB.h; gy += 8) {
          for (let gx = 6; gx < FOOT_VB.w; gx += 8) {
            ctx.beginPath();
            ctx.arc(gx + (gy % 16 === 0 ? 4 : 0), gy, 0.9, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      ctx.globalCompositeOperation = dark ? "lighter" : "multiply";
      for (const p of s.field) {
        if (p.v <= 0.02) continue;
        const radius = 15 + p.v * 16;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        const col = pressureColor(p.v);
        g.addColorStop(0, withAlpha(col, dark ? 0.92 : 0.95));
        g.addColorStop(0.5, withAlpha(col, dark ? 0.42 : 0.6));
        g.addColorStop(1, withAlpha(col, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      if (s.trail && s.trail.length > 1) {
        ctx.strokeStyle = dark ? "rgba(246,178,95,0.9)" : "rgba(169,90,19,0.9)";
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        s.trail.forEach((pt, i) => (i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y)));
        ctx.stroke();
      }
      if (s.cop) {
        ctx.fillStyle = dark ? "#f6b25f" : "#a95a13";
        ctx.beginPath();
        ctx.arc(s.cop.x, s.cop.y, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      if (s.outline) {
        ctx.strokeStyle = dark ? "rgba(139,132,150,0.55)" : "rgba(138,132,150,0.7)";
        ctx.lineWidth = 1.1;
        ctx.stroke(path);
      }
      ctx.restore();
    };

    const ro = new ResizeObserver(() => drawRef.current());
    ro.observe(wrap);
    const mo = new MutationObserver(() => drawRef.current());
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    drawRef.current();

    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

  // redraw on prop changes; run a loop while animating
  useEffect(() => {
    if (!animate) {
      drawRef.current();
      return;
    }
    let raf = 0;
    const loop = () => {
      drawRef.current();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [animate, field, cop, trail, grid, outline, foot]);

  return (
    <div ref={wrapRef} className={className} style={{ aspectRatio: `${FOOT_VB.w} / ${FOOT_VB.h}` }}>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}

function withAlpha(rgb: string, a: number): string {
  const m = rgb.match(/rgb\(([^)]+)\)/);
  if (!m) return rgb;
  return `rgb(${m[1]} / ${a})`;
}
