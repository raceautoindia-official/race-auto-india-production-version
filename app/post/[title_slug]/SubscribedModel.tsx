"use client";
import React, { useState, useEffect } from "react";
import styles from "./ContentComponent.module.css";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const ContentComponent = ({
  token,
  is_recommended,
}: {
  token: string;
  is_recommended: any;
}) => {
  // For demonstration, we always show the modal on mount.
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const [subcriptionData, setSubcriptionData] = useState<any>([]);
  const decoded: any = token ? jwtDecode(token) : { email: "", role: "user" };

  const subscriptionApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription/purchase/${decoded.email}`
      );
      setSubcriptionData(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  // Show modal on component mount
  useEffect(() => {
    setShowModal(true);
  }, []);

  const handleSubscribe = () => {
    // Implement your subscription flow here
    router.push("/subscription");
  };

  useEffect(() => {
    if (decoded.email !== "") {
      subscriptionApi();
    }
  }, []);

  if (
    is_recommended == 1 &&
    (decoded.role == "user" ||
      (subcriptionData.length !== 0 && new Date(subcriptionData[0].end_date) > new Date()))
  ) {
    return (
      <div>
        {showModal && (
          <div className={styles.overlay}>
            <div className={styles.modal}>
              <h2 className={styles.title}>Please Subscribe</h2>
              <p className={styles.text}>
                You need a subscription to access this content. Please subscribe
                to continue.
              </p>
              <div className={styles.buttonGroup}>
                <button onClick={handleSubscribe} className={styles.button}>
                  Subscribe Now
                </button>
                <button
                  onClick={() => router.push("/")}
                  className={`${styles.button} ${styles.closeButton}`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default ContentComponent;
