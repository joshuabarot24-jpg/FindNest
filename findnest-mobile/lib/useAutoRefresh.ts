import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

export const REFRESH_INTERVAL_MS = 20000;

export function useAutoRefresh(callback: () => void | Promise<void>, intervalMs = REFRESH_INTERVAL_MS) {
  const latest = useRef(callback);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    latest.current = callback;
  });

  useEffect(() => {
    let running = false;

    const run = async () => {
      if (running || appState.current !== "active") return;
      running = true;
      try {
        await latest.current();
      } finally {
        running = false;
      }
    };

    const id = setInterval(run, intervalMs);

    const subscription = AppState.addEventListener("change", (nextState) => {
      const cameToForeground = appState.current.match(/inactive|background/) && nextState === "active";
      appState.current = nextState;
      if (cameToForeground) run();
    });

    return () => {
      clearInterval(id);
      subscription.remove();
    };
  }, [intervalMs]);
}