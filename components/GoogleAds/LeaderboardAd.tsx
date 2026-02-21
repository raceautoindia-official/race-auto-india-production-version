"use client";

import { useEffect, useRef } from "react";

export default function LeaderboardAd({
  slot,
  className = "",
}: {
  slot: string;
  className?: string;
}) {
  const pushedRef = useRef(false);

  useEffect(() => {
    // Prevent double push in dev/strict mode or re-renders
    if (pushedRef.current) return;
    pushedRef.current = true;

    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, []);

  return (
    <div className={className} style={{ width: "100%", minHeight: 90 }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", minHeight: 90 }}
        data-ad-client="ca-pub-5751151754746971"
        data-ad-slot={slot}
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
    </div>
  );
}
