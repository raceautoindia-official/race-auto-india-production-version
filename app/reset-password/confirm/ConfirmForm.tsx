"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";

type Stage = "validating" | "invalid" | "form" | "success";

const ResetPasswordConfirm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [stage, setStage] = useState<Stage>("validating");
  const [email, setEmail] = useState("");
  const [tokenError, setTokenError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validate the token as soon as the page loads
  useEffect(() => {
    if (!token) {
      setTokenError("No reset token found. Please request a new reset link.");
      setStage("invalid");
      return;
    }

    axios
      .get(`/api/login/verify-token/${encodeURIComponent(token)}`)
      .then((res) => {
        setEmail(res.data?.email ?? "");
        setStage("form");
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.err ??
          "Invalid or expired reset link. Please request a new one.";
        setTokenError(msg);
        setStage("invalid");
      });
  }, [token]);

  const handleSubmit = async () => {
    setFormError("");

    if (!password || password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await axios.put("/api/login/update-password", {
        email,
        password,
        token, // server re-validates token before clearing it
      });
      setStage("success");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        "Something went wrong. Please try again or request a new reset link.";
      setFormError(msg);
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

              {/* Validating */}
              {stage === "validating" && (
                <p className="text-center text-muted mb-0">Validating reset link…</p>
              )}

              {/* Invalid token */}
              {stage === "invalid" && (
                <>
                  <h5 className="text-center fw-semibold mb-3">Link Invalid or Expired</h5>
                  <div className="alert alert-danger py-2" style={{ fontSize: "0.88rem" }}>
                    {tokenError}
                  </div>
                  <div className="text-center mt-3">
                    <Link href="/reset-password" className="btn btn-dark btn-sm">
                      Request New Reset Link
                    </Link>
                  </div>
                </>
              )}

              {/* New password form */}
              {stage === "form" && (
                <>
                  <h5 className="text-center fw-semibold mb-1">Set New Password</h5>
                  <p className="text-center text-muted mb-4" style={{ fontSize: "0.88rem" }}>
                    Enter a new password for <strong>{email}</strong>
                  </p>

                  {formError && (
                    <div className="alert alert-danger py-2" style={{ fontSize: "0.88rem" }}>
                      {formError}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      disabled={loading}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      disabled={loading}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    />
                  </div>

                  <button
                    className="btn btn-dark w-100"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? "Updating…" : "Update Password"}
                  </button>
                </>
              )}

              {/* Success */}
              {stage === "success" && (
                <>
                  <h5 className="text-center fw-semibold mb-3">Password Updated</h5>
                  <div className="alert alert-success py-2 text-center" style={{ fontSize: "0.88rem" }}>
                    Your password has been updated successfully.
                  </div>
                  <div className="text-center mt-3">
                    <Link href="/login" className="btn btn-dark btn-sm">
                      Go to Login
                    </Link>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordConfirm;
