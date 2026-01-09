"use client";
import React, { useEffect, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import axios from "axios";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import styles from "./razorpay.module.css"; // Import CSS module

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
  planInfo, closeModal
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
        name: "Race auto india",
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
              // await axios.put(
              //   `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/transactional-email`,
              //   {
              //     email,
              //     plan: planInfo.planTier,
              //     duration: planInfo.billingCycle,
              //   }
              // );
              closeModal()
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
            router.push(`/subscription/payment-failure`);
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

  return (
    <>
      <h5>Plan Summary</h5>
      <ul>
        <li>Tier: {planInfo?.planTier}</li>
        <li>Billing: {planInfo?.billingCycle}</li>
        <li>Amount: ₹{planInfo?.price}</li>
      </ul>

      <Form.Group className="my-3">
        <Form.Check
          type="checkbox"
          label="I agree to the terms and conditions."
          checked={isChecked}
          onChange={() => setIsChecked(!isChecked)}
        />
      </Form.Group>

      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={!isChecked || isLoading}
      >
        {isLoading ? (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            Processing...
          </>
        ) : (
          "Buy Now with Razorpay"
        )}
      </Button>

      {/* Styled Loading Overlay */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingBox}>
            <Spinner animation="border" variant="light" />
            <p className="mt-3 mb-0">Processing payment...<br />Please don’t close this window.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default RazorpayPaymentForm;
