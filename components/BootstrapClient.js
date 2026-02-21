"use client";

import { useEffect } from "react";

export default function AddBootstrap() {
  useEffect(() => {
    const load = () => import("bootstrap/dist/js/bootstrap.bundle.min.js");

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(load, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }

    const t = setTimeout(load, 1200);
    return () => clearTimeout(t);
  }, []);

  return null;
}
