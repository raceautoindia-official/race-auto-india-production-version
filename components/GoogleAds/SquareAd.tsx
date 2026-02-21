"use client";

import { useEffect, useRef } from "react";

export default function SquareAd({
  slot,
  className = "",
  minHeight = 250,
}: {
  slot: string;
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
    } catch {}
  }, []);

  return (
    <div className={className} style={{ width: "100%", minHeight }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", minHeight }}
        data-ad-client="ca-pub-5751151754746971"
        data-ad-slot={slot}
        data-ad-format="rectangle"
        data-full-width-responsive="true"
      />
    </div>
  );
}
