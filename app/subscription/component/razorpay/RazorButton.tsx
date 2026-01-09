'use client'
import { useEffect } from "react";

const RazorpayButton = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/payment-button.js";
    script.async = true;
    script.setAttribute("data-payment_button_id", "pl_PwmMPBLnx0TFHQ");

    const form = document.createElement("form");
    form.appendChild(script);

    document.getElementById("razorpay-container")?.appendChild(form);

    return () => {
      document.getElementById("razorpay-container")?.removeChild(form);
    };
  }, []);

  return <div id="razorpay-container"></div>;
};

export default RazorpayButton;
