"use client";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handlePasswordReset = async () => {
    setMessage(null);
    if (!email.trim()) {
      setIsError(true);
      setMessage("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/login/forgot-password", { email: email.trim() });
      setIsError(false);
      // Always show the neutral response from the server
      setMessage(res.data?.message ?? "If an account exists for this email, a reset link has been sent.");
      setEmail("");
    } catch {
      // Even on server error we show neutral message — do not reveal anything
      setIsError(false);
      setMessage("If an account exists for this email, a reset link has been sent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 pt-5">
      <div className="row">
        <div className="col-12 col-sm-8 col-md-5 m-auto">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h5 className="text-center mb-1 fw-semibold">Forgot Password</h5>
              <p className="text-center text-muted mb-4" style={{ fontSize: "0.88rem" }}>
                Enter your registered email and we'll send you a reset link.
              </p>

              {message && (
                <div
                  className={`alert ${isError ? "alert-danger" : "alert-success"} py-2`}
                  style={{ fontSize: "0.88rem" }}
                >
                  {message}
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="reset-email" className="form-label">
                  Email address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  className="form-control"
                  value={email}
                  placeholder="Enter your registered email"
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePasswordReset()}
                  disabled={loading}
                />
              </div>

              <div className="text-center">
                <button
                  className="btn btn-dark w-100"
                  onClick={handlePasswordReset}
                  disabled={loading}
                >
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </div>

              <div className="text-center mt-3">
                <Link href="/login" className="text-muted" style={{ fontSize: "0.85rem" }}>
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
