import { useCallback, useEffect, useState } from "react";
import api from "./api";

// Live notification count for the bell: loads at once, then every 10 seconds and on screen focus
export function useUnreadCount(navigation?: any) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get("/notifications/unread-count");
      setCount(res.data.unread_count ?? res.data.count ?? 0);
    } catch {
      // keep the last known count
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 10000);
    const unsub = navigation?.addListener?.("focus", refresh);
    return () => {
      clearInterval(timer);
      if (typeof unsub === "function") unsub();
    };
  }, [refresh, navigation]);

  return { count, refresh };
}