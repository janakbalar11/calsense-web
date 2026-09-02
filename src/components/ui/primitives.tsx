import { useEffect, useRef, useState, type ReactNode } from "react";

/* ------------------------------------------------------------------ *
 *  Card + section scaffolding
 * ------------------------------------------------------------------ */

export function Card({
  children,
  className = "",
  as: As = "div",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  as?: React.ElementType;
  padded?: boolean;
}) {
  return (
    <As className={`card ${padded ? "p-5" : ""} ${className}`}>{children}</As>
  );
}

export function CardTitle({
  children,
  hint,
  action,
}: {
  children: ReactNode;
  hint?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 className="font-display text-[1.05rem] leading-tight text-ink">{children}</h3>
        {hint && <p className="mt-0.5 text-[0.82rem] text-ink-3">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.14em] text-ink-3">
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 *  Status pill
 * ------------------------------------------------------------------ */

const TONE: Record<string, string> = {
  good: "text-good border-good/30 bg-good/10",
  watch: "text-watch border-watch/30 bg-watch/10",
  alert: "text-alert border-alert/30 bg-alert/10",
  neutral: "text-ink-2 border-line-strong bg-surface-2",
  accent: "text-accent-ink border-accent/30 bg-accent/10",
};

export function Pill({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof TONE | string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[0.72rem] font-medium ${
        TONE[tone] ?? TONE.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
}

export function Dot({ tone = "good" }: { tone?: "good" | "watch" | "alert" }) {
  const c = tone === "good" ? "bg-good" : tone === "watch" ? "bg-watch" : "bg-alert";
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${c}`} />;
}

/* ------------------------------------------------------------------ *
 *  Segmented control
 * ------------------------------------------------------------------ */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-full border border-line bg-surface-2 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`rounded-full px-3 py-1 text-[0.8rem] font-medium transition-colors ${
            value === o.value
              ? "bg-surface text-ink shadow-sm"
              : "text-ink-3 hover:text-ink-2"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Skeleton
 * ------------------------------------------------------------------ */

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-surface-2 ${className}`}
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------ *
 *  Count-up number
 * ------------------------------------------------------------------ */

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

export function useCountUp(target: number, durationMs = 650) {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const startRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }
    fromRef.current = value;
    startRef.current = performance.now();
    const from = fromRef.current;
    const tick = (now: number) => {
      const t = Math.min((now - startRef.current) / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs]);

  return value;
}
