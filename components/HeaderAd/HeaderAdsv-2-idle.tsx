"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeaderAdSwiper = dynamic(() => import("./HeaderAdsv-2"), {
  ssr: false,
  loading: () => null,
});

export default function HeaderAdSwiperIdle() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const run = () => setReady(true);

    if ("requestIdleCallback" in window) {
      const id = (window as any).requestIdleCallback(run, { timeout: 2500 });
      return () => (window as any).cancelIdleCallback(id);
    }

    const t = setTimeout(run, 1200);
    return () => clearTimeout(t);
  }, []);

  return <div >{ready ? <HeaderAdSwiper /> : null}</div>;
}
