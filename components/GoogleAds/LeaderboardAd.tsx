"use client";

import { useEffect, useRef } from "react";

export default function InArticleAd({
  slot,
  className = "",
  style,
}: {
  slot: string;               // e.g. "9918463715"
  className?: string;
  style?: React.CSSProperties; // optional extra styles
}) {
  const pushedRef = useRef(false);

  useEffect(() => {
    // Prevent double push in dev/strict mode or re-renders
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
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          textAlign: "center",
          ...(style || {}),
        }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-5751151754746971"
        data-ad-slot={slot}
      />
    </div>
  );
}