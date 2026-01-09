"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import { auth } from "@/firebase";
import axios from "axios";
import { toast } from "react-toastify";

const AuthActionHandler = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");

  const [newPassword, setNewPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(false);

  useEffect(() => {
    if (!oobCode || mode !== "resetPassword") return;

    verifyPasswordResetCode(auth, oobCode)
      .then((email) => {
        setEmail(email);
        setIsCodeValid(true);
      })
      .catch(() => {
        toast.error("Invalid or expired reset link.");
        setIsCodeValid(false);
      });
  }, [mode, oobCode]);

  const handlePasswordReset = async () => {
    try {
      await confirmPasswordReset(auth, oobCode!, newPassword);

      // Update password in your backend
      await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/login/update-password`, {
        email,
        password: newPassword,
      });

      toast.success("Password updated successfully");
      router.push("/");
    } catch (error) {
      toast.error("Something went wrong. Try again.");
    }
  };

  if (!oobCode || mode !== "resetPassword") {
    return <h4>Invalid or missing link data</h4>;
  }

  if (!isCodeValid) {
    return <h4>Invalid or expired reset link</h4>;
  }

  return (
    <div className="container mt-5">
      <h3>Reset your password</h3>
      <input
        type="password"
        className="form-control mb-3"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button className="btn btn-primary" onClick={handlePasswordReset}>
        Reset Password
      </button>
    </div>
  );
};

export default AuthActionHandler;
