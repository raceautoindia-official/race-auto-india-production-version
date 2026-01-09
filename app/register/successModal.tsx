"use client";

import React, { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";

const SignupSuccessBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const shouldShow = localStorage.getItem("showSignupBanner");
    if (shouldShow === "true") {
      setVisible(true);
      localStorage.removeItem("showSignupBanner");
    }
  }, []);
  if (!visible) return null;

  return (
    <Alert
      variant="success"
      onClose={() => setVisible(false)}
      dismissible
      className="text-center"
    >
      🎉 Registration Successful! Welcome to RaceAuto India.
    </Alert>
  );
};

export default SignupSuccessBanner;
