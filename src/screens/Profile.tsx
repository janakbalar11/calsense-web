import { useEffect, useState } from "react";
import { useProfile } from "@/data/DataContext";
import type { Profile as ProfileT } from "@/lib/types";
import { Card, CardTitle } from "@/components/ui/primitives";
import { PageLoader, ErrorNote } from "@/components/ui/PageLoader";
import { fmtDate } from "@/lib/format";

type ConsentKey = keyof ProfileT["consents"];

const CONSENT_COPY: Record<ConsentKey, { label: string; note: string }> = {
  cloudBackup: {
    label: "Cloud backup",
    note: "Store your readings in your account so they survive a lost phone and sync across devices.",
  },
  clinicianSharing: {
    label: "Clinician sharing",
    note: "Let a clinician you invite view your pressure maps and trends. You can revoke this any time.",
  },
  research: {
    label: "De-identified research",
    note: "Allow your data, with all identifying details removed, to help improve CalSense’s models.",
  },
};

export function Profile() {
  const profile = useProfile();
  const [consents, setConsents] = useState<ProfileT["consents"] | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (profile.data && !consents) setConsents(profile.data.consents);
  }, [profile.data, consents]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  if (profile.error) return <ErrorNote error={profile.error} />;
  if (!profile.data || !consents) return <PageLoader />;

  const p = profile.data;
  const details = [
    ["Height", `${p.heightCm} cm`],
    ["Weight", `${p.weightKg} kg`],
    ["Shoe size", `UK ${p.shoeSizeUk}`],
    ["Member since", fmtDate(p.memberSince)],
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card className="animate-rise">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-plum/15 font-display text-2xl text-plum">
            {p.name[0]}
          </span>
          <div>
            <h3 className="font-display text-[1.3rem] text-ink">{p.name}</h3>
            {p.footNote && <p className="text-[0.83rem] text-ink-3">{p.footNote}</p>}
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {details.map(([k, v]) => (
            <div key={k}>
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink-3">{k}</p>
              <p className="font-display text-[1.05rem] text-ink">{v}</p>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setToast("Editing your profile needs the backend — coming soon.")}
          className="mt-4 text-[0.82rem] text-accent-ink hover:underline"
        >
          Edit details
        </button>
      </Card>

      <Card className="animate-rise">
        <CardTitle hint="You’re in control of what leaves your device">Consents</CardTitle>
        <ul className="flex flex-col divide-y divide-line">
          {(Object.keys(CONSENT_COPY) as ConsentKey[]).map((key) => (
            <li key={key} className="flex items-start justify-between gap-4 py-3.5">
              <div className="max-w-md">
                <p className="text-[0.9rem] font-medium text-ink">{CONSENT_COPY[key].label}</p>
                <p className="text-[0.8rem] leading-relaxed text-ink-3">{CONSENT_COPY[key].note}</p>
              </div>
              <Toggle
                on={consents[key]}
                onChange={(v) => setConsents({ ...consents, [key]: v })}
              />
            </li>
          ))}
        </ul>
      </Card>

      <Card className="animate-rise">
        <CardTitle>Your data</CardTitle>
        <div className="flex flex-col gap-2">
          {[
            ["Export everything", "Download all your readings as JSON and CSV.", "neutral"],
            ["Invite a clinician", "Send a secure, time-limited link to your data.", "neutral"],
            ["Delete account and data", "Permanently removes everything. This cannot be undone.", "alert"],
          ].map(([label, note, tone]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 rounded-lg border border-line bg-surface-2 p-3.5"
            >
              <div>
                <p className={`text-[0.9rem] ${tone === "alert" ? "text-alert" : "text-ink"}`}>{label}</p>
                <p className="text-[0.78rem] text-ink-3">{note}</p>
              </div>
              <button
                type="button"
                onClick={() => setToast("This action needs the backend — coming soon.")}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[0.8rem] font-medium transition-colors ${
                  tone === "alert"
                    ? "border-alert/40 text-alert hover:bg-alert/10"
                    : "border-line text-ink hover:bg-surface"
                }`}
              >
                {tone === "alert" ? "Delete" : "Open"}
              </button>
            </div>
          ))}
        </div>
      </Card>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full border border-line bg-surface px-4 py-2 text-[0.82rem] text-ink-2 shadow-lg lg:bottom-8">
          {toast}
        </div>
      )}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
        on ? "border-accent bg-accent/80" : "border-line-strong bg-surface-2"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white transition-transform ${
          on ? "translate-x-5" : "translate-x-0.5"
        }`}
        style={{ height: "1.15rem", width: "1.15rem" }}
      />
    </button>
  );
}
