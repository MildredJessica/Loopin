"use client";

import { useEffect, useState } from "react";
import { getUnreadCount } from "./api";

export function useUnreadCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const result = await getUnreadCount();

        if (alive) {
          setCount(result.count);
        }
      } catch {
        // Keep the current badge value if a background request fails.
      }
    }

    // Get the current count immediately.
    void load();

    // Keep the badge current while the app is open.
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        void load();
      }
    }, 3000);

    // Refresh immediately when returning to the tab.
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void load();
      }
    };

    document.addEventListener("visibilitychange", onVisible);

    // Allow other components to request an immediate refresh.
    const onNotificationChange = () => {
      void load();
    };

    window.addEventListener(
      "loopin:notification-change",
      onNotificationChange
    );

    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener(
        "loopin:notification-change",
        onNotificationChange
      );
    };
  }, []);

  return count;
}