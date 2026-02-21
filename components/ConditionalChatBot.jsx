"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const FloatingChatBot = dynamic(() => import("@/components/ChatBot/MessengerNon-ai"), {
  ssr: false,
  loading: () => null,
});

export default function ConditionalChatbot() {
  const pathname = usePathname();

  const excludedPaths = [
    "/admin",
    "/login",
    "/magazine",
    "/Flash-report-pdf",
    "/flash-reports",
    "/insights",
  ];

  const shouldShowChatBot = !excludedPaths.some((p) => pathname.startsWith(p));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!shouldShowChatBot) return;

    const run = () => setReady(true);

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = window.requestIdleCallback(run, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }

    const t = setTimeout(run, 1500);
    return () => clearTimeout(t);
  }, [shouldShowChatBot]);

  return shouldShowChatBot && ready ? <FloatingChatBot /> : null;
}
