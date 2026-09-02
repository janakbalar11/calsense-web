import type {
  AssessmentResult,
  DeviceStatus,
  DaySummary,
  Insight,
  LiveFrame,
  Profile,
  SessionSummary,
  TodaySummary,
  WatchZone,
} from "@/lib/types";

export interface LiveHandle {
  /** returns an unsubscribe function */
  subscribe(cb: (frame: LiveFrame) => void): () => void;
  start(): void;
  stop(): void;
  reset(): void;
  isRunning(): boolean;
}

/**
 * Everything the frontend needs. The simulated implementation resolves these
 * from generated data; a real backend client will implement the same surface.
 */
export interface DataSource {
  getProfile(): Promise<Profile>;
  getDevice(): Promise<DeviceStatus>;
  getToday(): Promise<TodaySummary>;
  getHistory(days: number): Promise<DaySummary[]>;
  getInsights(): Promise<Insight[]>;
  getWatchZones(): Promise<WatchZone[]>;
  getSessions(): Promise<SessionSummary[]>;
  getAssessments(): Promise<AssessmentResult[]>;
  live(): LiveHandle;
}
