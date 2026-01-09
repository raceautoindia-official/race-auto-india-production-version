"use client";
import { useEffect } from 'react';

const AdArticleMiddle = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div style={{ display: 'block', margin: '20px 0', textAlign: 'center' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-5751151754746971"
        data-ad-slot="7948526797"
      ></ins>
    </div>
  );
};

export default AdArticleMiddle;
