"use client";
import React, { useEffect, useState } from "react";
import { Button, Form, Spinner, Card } from "react-bootstrap";
import axios from "axios";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { FaCcVisa, FaCcMastercard, FaWallet, FaLock } from "react-icons/fa";
import { SiGooglepay, SiAmazonpay, SiPhonepe } from "react-icons/si";
import styles from "./razorpayv2.module.css"; // Import CSS module
import Link from "next/link";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentFormProps {
  closeModal: () => void;
  planInfo: {
    planTier: string;
    billingCycle: "monthly" | "annual";
    price: number;
  } | null;
}

const RAZORPAY_CHECKOUT_URL = "https://checkout.razorpay.com/v1/checkout.js";

const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector(
      `script[src="${RAZORPAY_CHECKOUT_URL}"]`
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const RazorpayPaymentForm: React.FC<RazorpayPaymentFormProps> = ({
  planInfo,
  closeModal,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  const decoded: any = token ? jwtDecode(token) : { email: "" };
  const email = decoded.email;

  useEffect(() => {
    setToken(Cookies.get("authToken") || null);
  }, []);

  const handleSubmit = async () => {
    if (!isChecked || !planInfo) return;

    const failureBaseUrl = `/subscription/payment-failure?plan=${encodeURIComponent(
      planInfo.planTier
    )}&duration=${encodeURIComponent(planInfo.billingCycle)}`;

    try {
      setIsLoading(true);

      const hasRazorpay = await loadRazorpayScript();
      if (!hasRazorpay || !window.Razorpay) {
        router.push(`${failureBaseUrl}&reason=checkout_unavailable`);
        setIsLoading(false);
        return;
      }

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription/create-payment`,
        {
          customer_email: email,
          AMT: planInfo.price,
        }
      );

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: planInfo.price * 100,
        currency: "INR",
        name: "Race Auto India",
        order_id: data.id,
        handler: async function (response: any) {
          const verificationPayload = {
            ...response,
            email,
            plan: planInfo.planTier,
            duration: planInfo.billingCycle,
            AMT: planInfo.price,
          };

          try {
            const verifyRes = await axios.post(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription/verify-payment`,
              verificationPayload
            );

            if (verifyRes.data.success) {
              sessionStorage.removeItem("pending_payment_verification");
              closeModal();
              router.push(
                `/subscription/payment-success?plan=${planInfo.planTier}&duration=${planInfo.billingCycle}`
              );
            } else {
              router.push(`${failureBaseUrl}&reason=verification_failed`);
            }
          } catch (err) {
            console.error("Verification failed", err);
            sessionStorage.setItem(
              "pending_payment_verification",
              JSON.stringify(verificationPayload)
            );
            router.push(`${failureBaseUrl}&reason=verification_pending`);
          } finally {
            setIsLoading(false);
          }
        },
        prefill: { email },
        theme: { color: "#3399cc" },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            closeModal();
            router.push(`${failureBaseUrl}&reason=cancelled`);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", () => {
        setIsLoading(false);
        closeModal();
        router.push(`${failureBaseUrl}&reason=payment_failed`);
      });
      razorpay.open();
    } catch (error) {
      console.error("Razorpay Error:", error);
      setIsLoading(false);
      router.push(`${failureBaseUrl}&reason=create_order_failed`);
    }
  };
  const formattedPlanTier = planInfo?.planTier
    ? planInfo.planTier.charAt(0).toUpperCase() + planInfo.planTier.slice(1)
    : "Unknown";
  const formattedBillingCycle = planInfo?.billingCycle
    ? planInfo.billingCycle.charAt(0).toUpperCase() +
      planInfo.billingCycle.slice(1)
    : "Unknown"; // Default value if billingCycle is undefined

  return (
    <Card className={styles.paymentCard}>
      <Card.Body>
        <h5 className={styles.heading}>Confirm Your Subscription</h5>
        <div className={styles.trustedTag}>
          <FaLock className={styles.trustedIcon} />
          <span>Secure payment powered by Razorpay</span>
        </div>

        <ul className={styles.summaryList}>
          <li>
            <strong>Tier:</strong> {formattedPlanTier}
          </li>
          <li>
            <strong>Billing:</strong> {formattedBillingCycle}
          </li>
          <li>
            <strong>Amount:</strong> ₹{planInfo?.price.toLocaleString("en-IN")}
          </li>
        </ul>

        <div className={styles.paymentMethods}>
          <span>We accept:</span>
          <div className={styles.icons}>
            <SiGooglepay
              className={`${styles.icon} ${styles.googleIcon}`}
              title="Google Pay"
            />
            <SiAmazonpay
              className={`${styles.icon} ${styles.amazonIcon}`}
              title="Amazon Pay"
            />
            <SiPhonepe
              className={`${styles.icon} ${styles.phonepeIcon}`}
              title="PhonePe"
            />
            <FaCcVisa
              className={`${styles.icon} ${styles.visaIcon}`}
              title="Visa"
            />
            <FaCcMastercard
              className={`${styles.icon} ${styles.mastercardIcon}`}
              title="Mastercard"
            />
          </div>
        </div>

        <Form.Group className="my-3">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
          />
          <span className="ms-2">
            I agree to the{" "}
            <Link
              href="/page/terms-conditions"
              target="_blank"
              className="text-primary"
            >
              terms & conditions
            </Link>
          </span>
        </Form.Group>

        <Button
          className={styles.payButton}
          onClick={handleSubmit}
          disabled={!isChecked || isLoading}
        >
          {isLoading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Processing...
            </>
          ) : (
            "Pay Now"
          )}
        </Button>

        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingBox}>
              <Spinner animation="border" variant="light" />
              <p className="mt-3 mb-0">
                Processing payment...
                <br />
                Please don’t close this window.
              </p>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default RazorpayPaymentForm;
