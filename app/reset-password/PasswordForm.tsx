"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase";


const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!email) {
      toast.warn("Please enter your registered email.", {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset link sent! Check your inbox.", {
        position: "top-right",
        autoClose: 5000,
      });
      setEmail(""); // Clear input
    } catch (error) {
      console.error("Reset Error:", error);
      toast.error("Failed to send reset link. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 pt-5">
      <div className="row">
        <div className="col-12 col-sm-8 col-md-6 m-auto">
          <div className="card">
            <div className="card-body">
              <h5 className="text-center mb-4">Reset Password</h5>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control mb-3"
                  name="email"
                  value={email}
                  placeholder="Enter Registered Email"
                  onChange={(e) => setEmail(e.target.value)}
                  id="email"
                />
                <div className="text-center">
                  <button
                    className="btn btn-primary"
                    onClick={handlePasswordReset}
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
