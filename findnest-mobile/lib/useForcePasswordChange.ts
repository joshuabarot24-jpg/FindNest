// [Sec] Students with a temporary password must set their own first.
// Sends them to Profile on every screen focus until the flag is cleared.
import { useEffect } from "react";
import api from "./api";

export function useForcePasswordChange(navigation: any) {
  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const res = await api.get("/profile");
        if (!cancelled && res.data?.user?.password_is_temporary) {
          navigation.navigate("Profile");
        }
      } catch {}
    };

    check();
    const unsubscribe = navigation.addListener("focus", check);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [navigation]);
}