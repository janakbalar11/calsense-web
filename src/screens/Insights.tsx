import { useState } from "react";
import { useInsights } from "@/data/DataContext";
import { InsightCard } from "@/components/InsightCard";
import { PageLoader, ErrorNote } from "@/components/ui/PageLoader";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "watch", label: "Worth watching" },
  { key: "info", label: "Notes" },
] as const;

export function Insights() {
  const insights = useInsights();
  const [filter, setFilter] = useState<string>("all");

  if (insights.error) return <ErrorNote error={insights.error} />;
  if (!insights.data) return <PageLoader />;

  const list = insights.data.filter((i) =>
    filter === "all" ? true : filter === "watch" ? i.severity !== "info" : i.severity === "info",
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-3 py-1 text-[0.8rem] transition-colors ${
              filter === f.key
                ? "border-accent/40 bg-accent/10 text-ink"
                : "border-line text-ink-3 hover:text-ink-2"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {list.map((i) => (
          <InsightCard key={i.id} insight={i} />
        ))}
        {list.length === 0 && (
          <p className="py-10 text-center text-[0.9rem] text-ink-3">Nothing here right now.</p>
        )}
      </div>
    </div>
  );
}
