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

    try {
      setIsLoading(true);

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
          try {
            const verifyRes = await axios.post(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription/verify-payment`,
              {
                ...response,
                email,
                plan: planInfo.planTier,
                duration: planInfo.billingCycle,
              }
            );

            if (verifyRes.data.success) {
              closeModal();
              router.push(
                `/subscription/payment-success?plan=${planInfo.planTier}&duration=${planInfo.billingCycle}`
              );
            } else {
              router.push(
                `/subscription/payment-failure?plan=${planInfo.planTier}&duration=${planInfo.billingCycle}`
              );
            }
          } catch (err) {
            console.error("Verification failed", err);
            router.push("/subscription/payment-failure");
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
            setIsLoading(false); // Reset loading if user closes the Razorpay window
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Razorpay Error:", error);
      setIsLoading(false);
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
