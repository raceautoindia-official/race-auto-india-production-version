"use client";

import { useEffect, useState } from "react";

const AdHeader = () => {
  const [showSlot, setShowSlot] = useState(false);

  useEffect(() => {
    // Show reserved slot shortly after start (prevents initial huge gap)
    const t = setTimeout(() => setShowSlot(true), 200);

    // If ad doesn't render, collapse slot after some time
    const collapse = setTimeout(() => {
      const ins = document.querySelector("ins.adsbygoogle") as HTMLElement | null;

      // If AdSense hasn't filled the slot, collapse the space
      const isEmpty =
        !ins ||
        ins.innerHTML.trim().length === 0 ||
        ins.offsetHeight < 30;

      if (isEmpty) setShowSlot(false);
    }, 1200);

    return () => {
      clearTimeout(t);
      clearTimeout(collapse);
    };
  }, []);

  useEffect(() => {
    if (!showSlot) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // If error, collapse to avoid blank gap
      setShowSlot(false);
    }
  }, [showSlot]);

  if (!showSlot) return null;

  return (
    <div style={{ display: "block", margin: "8px 0", minHeight: 90 }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight: 90 }}
        data-ad-client="ca-pub-5751151754746971"
        data-ad-slot="1408136777"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdHeader;
