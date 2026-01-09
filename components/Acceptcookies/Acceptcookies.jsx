"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import './acceptcookies.css';

export default function AcceptCookies() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-text">
        We use cookies and similar technologies to help personalize content, tailor and measure ads, and provide a better experience. By clicking Accept, you agree to this as outlined in our{' '}
        <Link href="/cookie-policy" className="cookie-link">
          Cookie Policy
        </Link>.
      </div>
      <div className="cookie-buttons">
        <button className="accept" onClick={handleAccept}>Accept</button>
      </div>
    </div>
  );
}
