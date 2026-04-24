"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "react-bootstrap";
import Image from "next/image";
import Link from "next/link";
import { getPlanUITitle } from "@/lib/subscriptionPlan";

const FailurePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const duration = searchParams.get("duration");
  const reason = searchParams.get("reason");
  const planLabel = plan ? getPlanUITitle(plan) : null;
  const [retrying, setRetrying] = useState(false);

  const failureMessage = useMemo(() => {
    if (reason === "cancelled") {
      return "Payment was cancelled before completion. You can retry anytime.";
    }
    if (reason === "verification_pending") {
      return "Payment may have succeeded, but verification could not complete due to a network issue.";
    }
    if (reason === "checkout_unavailable") {
      return "Checkout could not be initialized on this page. Please retry.";
    }
    return "Your payment could not be processed due to a technical issue.";
  }, [reason]);

  const canRetryVerification = reason === "verification_pending";

  const handleRetryVerification = async () => {
    if (typeof window === "undefined") return;
    const pendingRaw = sessionStorage.getItem("pending_payment_verification");
    if (!pendingRaw) return;

    let payload: any = null;
    try {
      payload = JSON.parse(pendingRaw);
    } catch {
      payload = null;
    }

    if (!payload) return;

    try {
      setRetrying(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription/verify-payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();

      if (res.ok && data?.success) {
        sessionStorage.removeItem("pending_payment_verification");
        router.push(
          `/subscription/payment-success?plan=${encodeURIComponent(
            payload.plan || plan || ""
          )}&duration=${encodeURIComponent(payload.duration || duration || "")}`
        );
      }
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-secondary">
      <div
        className="text-center p-5 bg-white shadow-lg rounded-4 border-secondary"
        style={{ maxWidth: "1000px" }}
      >
        {/* <PiCheckCircleFill size={80} className="text-success mb-3" /> */}
        {/* <div
          style={{ aspectRatio: "1/1", width: "100%", position: "relative" }}
        > */}
        <Image
          alt="payment-success"
          src="/images/payment failed.png"
          width={300}
          height={300}
        />

        <h2 className="fw-bold text-danger">
          Your payment has Failed!
        </h2>
        <p className="text-muted">
        {planLabel ? (
          <>
            Your payment for <strong>{planLabel}</strong> could not be completed.
          </>
        ) : (
          <>Your payment could not be completed.</>
        )}
        <br />
        {failureMessage}
        <br />
        Please try again or <Link href='/contact'><span className="text-primary">contact</span></Link> support for assistance.
        </p>
        {canRetryVerification && (
          <Button
            variant="outline-primary"
            className="me-2"
            onClick={handleRetryVerification}
            disabled={retrying}
          >
            {retrying ? "Retrying..." : "Retry Verification"}
          </Button>
        )}
        <Button variant='danger' onClick={() => router.push("/subscription")}>
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default FailurePage;
