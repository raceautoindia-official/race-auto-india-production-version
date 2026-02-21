"use client";

import { useEffect, useRef } from "react";

export default function SidebarAd({
  slot,
  className = "",
  minHeight = 250,
}: {
  slot: string;          // e.g. "5763596286"
  className?: string;
  minHeight?: number;
}) {
  const pushedRef = useRef(false);

  useEffect(() => {
    if (pushedRef.current) return;
    pushedRef.current = true;

    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className={className} style={{ width: "100%", minHeight }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-5751151754746971"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}