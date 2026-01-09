'use client';

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Disable SSR for the modal
const ContactModal = dynamic(() => import("./SubscribeModal"), { ssr: false });

export default function ClientOnlyModal() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // only true on client
  }, []);

  if (!mounted) return null;

  return <ContactModal />;
}
