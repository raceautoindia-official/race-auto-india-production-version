"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "react-bootstrap";

import confetti from "canvas-confetti";

import Image from "next/image";

const SuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const planDuration = searchParams.get("duration");

  const getPlanValidity = (planType: any) => {
    const currentDate = new Date(); // Get the current date
    if (planType === "annual") {
      currentDate.setDate(currentDate.getDate() + 365); // Add 365 days for annual plan
    } else if (planType === "monthly") {
      currentDate.setDate(currentDate.getDate() + 30); // Add 30 days for monthly plan
    }

    return currentDate.toISOString().split("T")[0]; // Return in YYYY-MM-DD format
  };

  const planExpiryDate = getPlanValidity(planDuration);

  var duration = 5 * 1000;
  var animationEnd = Date.now() + duration;
  var defaults = { startVelocity: 50, spread: 500, ticks: 50, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  useEffect(() => {
    var interval = setInterval(function () {
      var timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      var particleCount = 200 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 350);
  }, []);

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
          src="/images/payment successful.png"
          width={300}
          height={300}
          priority
        />

        <h2 className="fw-bold text-dark">
          Your payment for{" "}
          <span
            className={
              plan == "gold"
                ? "text-warning"
                : plan == "silver"
                ? "text-secondary"
                : plan == "platinum"
                ? "text-primary"
                : "text-info"
            }
          >
            {plan?.toUpperCase()}
          </span>{" "}
          plan is successful!
        </h2>
        <p className="text-muted">
          Your{" "}
          <span
            className={
              plan == "gold"
                ? "text-warning"
                : plan == "silver"
                ? "text-secondary"
                : plan == "platinum"
                ? "text-primary"
                : "text-info"
            }
          >
            {plan}
          </span>{" "}
          is now active and valid until <strong>{planExpiryDate}</strong>.
          <br />
          For more details, visit your{" "}
          <a href="/profile" className="fw-bold text-primary">
            Profile Page
          </a>
          .
        </p>
        <Button variant={
              plan == "gold"
                ? "warning"
                : plan == "silver"
                ? "secondary"
                : plan == "platinum"
                ? "primary"
                : "info"
            } onClick={() => router.push("/profile")}>
          Explore Now
        </Button>
      </div>
    </div>
  );
};

export default SuccessPage;
