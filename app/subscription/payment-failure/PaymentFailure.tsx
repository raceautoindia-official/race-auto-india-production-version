"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "react-bootstrap";
import Image from "next/image";
import Link from "next/link";

const FailurePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");

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
        Your payment could not be processed due to a technical issue. <br/>Please try again later or <Link href='/contact'><span className="text-primary">contact</span></Link> support for assistance.
        </p>
        <Button variant='danger' onClick={() => router.push("/subscription")}>
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default FailurePage;
