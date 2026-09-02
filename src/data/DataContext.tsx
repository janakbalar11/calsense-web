import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { DataSource } from "./DataSource";
import { SimulatedDataSource } from "./simulated/SimulatedDataSource";
import type { LiveFrame } from "@/lib/types";

const DataContext = createContext<DataSource | null>(null);

const singleton = new SimulatedDataSource();

export function DataProvider({ children }: { children: ReactNode }) {
  return <DataContext.Provider value={singleton}>{children}</DataContext.Provider>;
}

export function useData(): DataSource {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within <DataProvider>");
  return ctx;
}

export interface AsyncState<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
}

export function useAsync<T>(
  load: (src: DataSource) => Promise<T>,
  deps: unknown[] = [],
): AsyncState<T> {
  const src = useData();
  const [state, setState] = useState<AsyncState<T>>({
    data: undefined,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    load(src)
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((error) => alive && setState({ data: undefined, loading: false, error }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

export const useProfile = () => useAsync((s) => s.getProfile());
export const useDevice = () => useAsync((s) => s.getDevice());
export const useToday = () => useAsync((s) => s.getToday());
export const useHistory = (days: number) =>
  useAsync((s) => s.getHistory(days), [days]);
export const useInsights = () => useAsync((s) => s.getInsights());
export const useWatchZones = () => useAsync((s) => s.getWatchZones());
export const useSessions = () => useAsync((s) => s.getSessions());
export const useAssessments = () => useAsync((s) => s.getAssessments());

export function useLive() {
  const src = useData();
  const handleRef = useRef(src.live());
  const [frame, setFrame] = useState<LiveFrame | null>(null);
  const [running, setRunning] = useState(handleRef.current.isRunning());

  useEffect(() => {
    const handle = handleRef.current;
    return handle.subscribe(setFrame);
  }, []);

  const start = useCallback(() => {
    handleRef.current.start();
    setRunning(true);
  }, []);
  const stop = useCallback(() => {
    handleRef.current.stop();
    setRunning(false);
  }, []);
  const reset = useCallback(() => {
    handleRef.current.reset();
  }, []);

  return { frame, running, start, stop, reset };
}
