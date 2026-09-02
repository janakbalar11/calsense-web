import { useEffect, useState } from "react";
import { useAssessments, useSessions } from "@/data/DataContext";
import type { Foot } from "@/lib/types";
import { Card, Eyebrow, Pill } from "@/components/ui/primitives";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { FootField } from "@/components/foot/FootField";
import { PageLoader, ErrorNote } from "@/components/ui/PageLoader";
import { regionField } from "@/data/simulated/gait";
import { fmtDate, fmtTime, durationMin, int } from "@/lib/format";

const EMPTY_FIELD = regionField({
  big_toe: 0,
  toes: 0,
  ball_inner: 0,
  ball_outer: 0,
  arch: 0,
  heel: 0,
});

export function Assessments() {
  const assessments = useAssessments();
  const sessions = useSessions();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  if (assessments.error) return <ErrorNote error={assessments.error} />;
  if (!assessments.data || !sessions.data) return <PageLoader />;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { title: "Balance test", desc: "Stand still for 30 seconds. Measures how much you sway and where your weight sits.", time: "30 sec" },
          { title: "Walk test", desc: "A short guided walk. Checks cadence, symmetry and how each foot rolls through.", time: "2 min" },
        ].map((t) => (
          <Card key={t.title} className="animate-rise flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[1.1rem] text-ink">{t.title}</h3>
              <Pill>{t.time}</Pill>
            </div>
            <p className="text-[0.85rem] leading-relaxed text-ink-3">{t.desc}</p>
            <button
              type="button"
              onClick={() => setToast("Guided tests need the live sensor — coming soon.")}
              className="mt-2 self-start rounded-full bg-accent px-4 py-2 text-[0.82rem] font-medium text-[#1b1206] transition-opacity hover:opacity-90"
            >
              Start {t.title.toLowerCase()}
            </button>
          </Card>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <Eyebrow>Test history</Eyebrow>
        {assessments.data.map((a) => (
          <Card key={a.id} className="animate-rise">
            <div className="grid gap-5 sm:grid-cols-[130px_1fr]">
              <div className="flex flex-col items-center gap-1">
                <ScoreRing value={a.score} size={110} stroke={9} label={a.kind === "balance" ? "Steadiness" : "Walk"} />
                <span className="font-mono text-[0.68rem] text-ink-3">{fmtDate(a.takenAt)}</span>
              </div>
              <div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {a.metrics.map((m) => (
                    <div key={m.label}>
                      <p className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-ink-3">{m.label}</p>
                      <p className="font-display text-[1.05rem] text-ink">{m.value}</p>
                      {m.hint && <p className="text-[0.72rem] leading-tight text-ink-3">{m.hint}</p>}
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[0.85rem] leading-relaxed text-ink-2">{a.takeaway}</p>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <Eyebrow>Recorded sessions</Eyebrow>
        <div className="grid gap-4 sm:grid-cols-2">
          {sessions.data.map((s) => (
            <Card key={s.id} className="animate-rise">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-[1.05rem] text-ink capitalize">{s.kind}</h3>
                  <p className="font-mono text-[0.7rem] text-ink-3">
                    {fmtDate(s.startedAt)} · {fmtTime(s.startedAt)}
                  </p>
                </div>
                <Pill>{durationMin(s.durationMin)}</Pill>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex gap-3">
                  {(["left", "right"] as Foot[]).map((foot) => (
                    <div key={foot} className="w-12">
                      <FootField field={EMPTY_FIELD} foot={foot} trail={s.copPath[foot]} outline />
                    </div>
                  ))}
                </div>
                <dl className="flex-1 space-y-1 text-[0.82rem]">
                  <Row k="Steps" v={s.kind === "balance" ? "—" : int(s.steps)} />
                  <Row k="Cadence" v={s.kind === "balance" ? "—" : `${s.avgCadenceSpm} spm`} />
                  <Row k="Symmetry" v={`${s.symmetryScore} / 100`} />
                </dl>
              </div>
              {s.note && <p className="mt-3 text-[0.8rem] italic text-ink-3">“{s.note}”</p>}
            </Card>
          ))}
        </div>
      </section>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full border border-line bg-surface px-4 py-2 text-[0.82rem] text-ink-2 shadow-lg lg:bottom-8">
          {toast}
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-line py-1 last:border-0">
      <dt className="text-ink-3">{k}</dt>
      <dd className="font-mono text-ink-2">{v}</dd>
    </div>
  );
}
