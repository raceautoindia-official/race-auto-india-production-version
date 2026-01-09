"use client";

import { useEffect } from "react";

export default function PageViewTracker({page}) {
  useEffect(() => {
    const incrementPageView = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/page-views`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            page_type: page, // Change based on route
          }),
        });
      } catch (error) {
        console.error("Error incrementing page view:", error);
      }
    };

    incrementPageView();
  }, []);

  return null;
}
