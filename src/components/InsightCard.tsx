import type { Insight } from "@/lib/types";
import { REGION_LABEL } from "@/lib/pressure";
import { fmtDate } from "@/lib/format";
import { Card, Pill } from "@/components/ui/primitives";

const SEV: Record<Insight["severity"], { tone: string; label: string }> = {
  info: { tone: "accent", label: "Note" },
  watch: { tone: "watch", label: "Worth watching" },
  alert: { tone: "alert", label: "Needs attention" },
};

export function InsightCard({ insight, compact = false }: { insight: Insight; compact?: boolean }) {
  const sev = SEV[insight.severity];
  return (
    <Card className="animate-rise">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Pill tone={sev.tone}>{sev.label}</Pill>
        <span className="font-mono text-[0.7rem] text-ink-3">{fmtDate(insight.date)}</span>
      </div>
      <h3 className="font-display text-[1.15rem] leading-snug text-ink text-balance">{insight.title}</h3>

      {insight.region && (
        <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-3">
          {insight.foot === "left" ? "Left" : insight.foot === "right" ? "Right" : ""} · {REGION_LABEL[insight.region]}
        </p>
      )}

      <dl className={`mt-4 grid gap-3 ${compact ? "" : "sm:grid-cols-3"}`}>
        {(
          [
            ["What we saw", insight.observation],
            ["What it means", insight.meaning],
            ["What to try", insight.action],
          ] as const
        ).map(([k, v]) => (
          <div key={k}>
            <dt className="mb-1 font-mono text-[0.64rem] uppercase tracking-[0.12em] text-ink-3">{k}</dt>
            <dd className="text-[0.86rem] leading-relaxed text-ink-2">{v}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
