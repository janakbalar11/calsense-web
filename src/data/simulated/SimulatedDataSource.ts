import type { DataSource, LiveHandle } from "../DataSource";
import {
  ASSESSMENTS,
  DEVICE,
  getHistory,
  getToday,
  getWatchZones,
  INSIGHTS,
  PROFILE,
  SESSIONS,
} from "./history";
import { createLiveEngine } from "./liveEngine";

/** Small artificial latency so loading states are exercised in the UI. */
const delay = <T>(value: T, ms = 220): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export class SimulatedDataSource implements DataSource {
  private liveHandle: LiveHandle | null = null;

  getProfile() {
    return delay(structuredClone(PROFILE));
  }
  getDevice() {
    return delay(structuredClone(DEVICE));
  }
  getToday() {
    return delay(structuredClone(getToday()));
  }
  getHistory(days: number) {
    return delay(structuredClone(getHistory(days)));
  }
  getInsights() {
    return delay(structuredClone(INSIGHTS));
  }
  getWatchZones() {
    return delay(structuredClone(getWatchZones()));
  }
  getSessions() {
    return delay(structuredClone(SESSIONS));
  }
  getAssessments() {
    return delay(structuredClone(ASSESSMENTS));
  }
  live() {
    if (!this.liveHandle) this.liveHandle = createLiveEngine();
    return this.liveHandle;
  }
}
