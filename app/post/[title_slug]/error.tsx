"use client";

import Link from "next/link";
import { useEffect } from "react";

// Route-level error boundary for article pages. If an article body throws while
// rendering (e.g. a malformed content block / the previously seen React #329),
// this catches it so the page shows a recoverable message instead of hanging on
// "Loading…" or blanking out.
export default function PostError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Article render error:", error);
  }, [error]);

  return (
    <div className="container my-5">
      <div className="text-center text-primary">
        <h3>Something went wrong</h3>
        <p className="mt-3 text-secondary">
          We couldn&apos;t fully load this article. Please try again.
        </p>
        <div className="d-flex gap-2 justify-content-center mt-4">
          <button className="btn btn-secondary" onClick={() => reset()}>
            Try Again
          </button>
          <Link href="/">
            <button className="btn btn-outline-secondary">Go Home</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
