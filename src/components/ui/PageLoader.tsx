import { Skeleton } from "./primitives";

export function PageLoader({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-40 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: rows * 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    </div>
  );
}

export function ErrorNote({ error }: { error: Error }) {
  return (
    <div className="card border-alert/30 p-5 text-[0.9rem] text-ink-2">
      <p className="mb-1 font-medium text-alert">Couldn’t load this data</p>
      <p className="font-mono text-[0.78rem] text-ink-3">{error.message}</p>
    </div>
  );
}
