"use client";
import { useEffect } from "react";

const AdHomeBanner = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);
  return (
    <>
      <span
        style={{ borderBottom: "1px solid black" }}
        className="m-0 mb-2 p-0 text-center"
      >
        Advertisement
      </span>

      <div style={{ display: "block", margin: "20px 0" }}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-5751151754746971"
          data-ad-slot="2787988439"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
        <script
          dangerouslySetInnerHTML={{
            __html: "(adsbygoogle = window.adsbygoogle || []).push({});",
          }}
        />
      </div>
    </>
  );
};

export default AdHomeBanner;
