"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const RefreshOnVerified = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified) {
      // Reload the page without query params.
      // You can also use window.location.reload(), but this version removes the query string.
      window.location.href = window.location.pathname;
    }
  }, [searchParams]);

  return null;
};

export default RefreshOnVerified;
