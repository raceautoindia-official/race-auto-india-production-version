"use client"; // Required for Next.js App Router (if using Next.js 13+)

import { useState } from "react";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "@/firebase";

const PhoneAuth = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const setupRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });
  };

  const sendOTP = async () => {
    if (!phone) return alert("Please enter a phone number.");
    setLoading(true);
    
    setupRecaptcha();
    
    try {
      const confirmation = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setMessage("OTP sent successfully!");
    } catch (error) {
      setMessage("Error sending OTP: " + error.message);
    }
    
    setLoading(false);
  };

  const verifyOTP = async () => {
    if (!otp) return alert("Please enter the OTP.");
    setLoading(true);

    try {
      const result = await confirmationResult.confirm(otp);
      setMessage("Phone verified! User ID: " + result.user.uid);
    } catch (error) {
      setMessage("Invalid OTP, try again.");
    }

    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card p-4 shadow">
            <h2 className="text-center mb-3">Phone OTP Authentication</h2>
            
            <div className="mb-3">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                placeholder="+91 9876543210"
                className="form-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            
            <button 
              onClick={sendOTP} 
              disabled={loading} 
              className="btn btn-primary w-100 mb-3"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
            
            {confirmationResult && (
              <>
                <div className="mb-3">
                  <label className="form-label">Enter OTP</label>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    className="form-control"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                <button 
                  onClick={verifyOTP} 
                  disabled={loading} 
                  className="btn btn-success w-100"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </>
            )}
            
            <div id="recaptcha-container" className="mt-3"></div>
            
            {message && <p className="text-center text-muted mt-2">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneAuth;
