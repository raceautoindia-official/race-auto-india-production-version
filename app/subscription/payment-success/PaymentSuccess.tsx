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
    const currentDate = new Date();
    if (planType === "annual") {
      currentDate.setDate(currentDate.getDate() + 365);
    } else if (planType === "monthly") {
      currentDate.setDate(currentDate.getDate() + 30);
    }

    return currentDate.toISOString().split("T")[0];
  };

  const planExpiryDate = getPlanValidity(planDuration);

  const getPlanTextClass = (planName: string | null) => {
    switch (planName) {
      case "bronze":
        return "text-warning";
      case "silver":
        return "text-secondary";
      case "gold":
        return "text-success";
      case "platinum":
        return "text-primary";
      default:
        return "text-info";
    }
  };

  const getPlanButtonVariant = (planName: string | null) => {
    switch (planName) {
      case "bronze":
        return "warning";
      case "silver":
        return "secondary";
      case "gold":
        return "success";
      case "platinum":
        return "primary";
      default:
        return "info";
    }
  };

  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 50, spread: 500, ticks: 50, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  useEffect(() => {
    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 200 * (timeLeft / duration);

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

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-secondary">
      <div
        className="text-center p-5 bg-white shadow-lg rounded-4 border-secondary"
        style={{ maxWidth: "1000px" }}
      >
        <Image
          alt="payment-success"
          src="/images/payment successful.png"
          width={300}
          height={300}
          priority
        />

        <h2 className="fw-bold text-dark">
          Your payment for{" "}
          <span className={getPlanTextClass(plan)}>
            {plan?.toUpperCase()}
          </span>{" "}
          plan is successful!
        </h2>

        <p className="text-muted">
          Your{" "}
          <span className={getPlanTextClass(plan)}>
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

        <Button
          variant={getPlanButtonVariant(plan)}
          onClick={() => router.push("/profile")}
        >
          Explore Now
        </Button>
      </div>
    </div>
  );
};

export default SuccessPage;