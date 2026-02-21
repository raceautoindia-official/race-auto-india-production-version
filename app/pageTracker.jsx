"use client";

import { useEffect } from "react";

export default function PageViewTracker({ page }) {
  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/page-views`;
    const payload = JSON.stringify({ page_type: page });

    const send = () => {
      try {
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: "application/json" });
          navigator.sendBeacon(url, blob);
          return;
        }
      } catch {}

      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    };

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(send, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }

    const t = setTimeout(send, 2000);
    return () => clearTimeout(t);
  }, [page]);

  return null;
}
