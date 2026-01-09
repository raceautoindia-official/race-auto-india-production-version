"use client";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProtectedForm from "./ProtectedForm";

const VerifyToken = () => {
  const { token }: any = useParams();
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("");
  const decoded: any = jwtDecode(token);
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}api/login/verify-token/${token}`
        );

        setVerified(true);
        if (response.status === 200) {
          setMessage(
            "Verification successful. Redirecting to reset password page..."
          );
          setTimeout(() => {}, 2000); // Redirect after 2 seconds
        } else {
          setMessage("error please later"); // Display the error message returned from the server
        }
      } catch (error) {
        setMessage("error please later");
      }
    };

    verifyToken();
  }, [token]);

  if (verified) {
    return <ProtectedForm />;
  }

  return (
    <div>
      <h2>{message}</h2>
    </div>
  );
};

export default VerifyToken;
