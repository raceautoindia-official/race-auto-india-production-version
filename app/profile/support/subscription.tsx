"use client";

import { formatDate } from "@/components/Time";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { Card } from "react-bootstrap";
import styles from "../profile.module.css";
import { getPlanUITitle, normalizePlanName } from "@/lib/subscriptionPlan";

function SubscriptionProfile({ token }: { token: any }) {
  const [subscription, setSubscription] = useState<any[]>([]);
  const [subscriptionPack, setSubscriptionPack] = useState<any[]>([]);
  const [plan, setPlan] = useState<any[]>([]);
  const decoded: any = token ? jwtDecode<any>(token) : { email: "", role: "user" };

  const subscriptionApi = async () => {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription`);
    setSubscription(res.data);
  };

  const packApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/profile/subscription/${decoded.email}`
      );
      setSubscriptionPack(res.data);
    } catch (err) {
      console.log(err);
      setSubscriptionPack([]);
    }
  };

  useEffect(() => {
    subscriptionApi();
    packApi();
  }, []);

  useEffect(() => {
    if (subscription.length !== 0) {
      const planName =
        subscriptionPack.length === 0 || subscriptionPack[0]?.status === "expired"
          ? "bronze"
          : subscriptionPack[0]?.plan_name;
      const filteredPlan = subscription.filter((item: any) => item[planName] === 1);
      setPlan(filteredPlan);
    }
  }, [subscriptionPack, subscription]);

  const currentPlan =
    subscriptionPack.length === 0 || subscriptionPack[0]?.status === "expired"
      ? "bronze"
      : subscriptionPack[0]?.plan_name;
  const isActive = subscriptionPack[0]?.status === "Active";
  const isExpired = subscriptionPack[0]?.status === "expired";

  const planDetails = useMemo(
    () => plan.filter((item: any) => item.plan !== "usd").map((item: any) => item.plan),
    [plan]
  );

  const currentPlanLabel = getPlanUITitle(normalizePlanName(currentPlan));

  return (
    <div className={styles.mainStack}>
      <Card className={`${styles.surfaceCard} ${styles.sectionCard}`}>
        <Card.Body className="p-0">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Subscription Details</h2>
              <p className={styles.sectionDescription}>
                Review your current plan, access validity, and the features available with your subscription.
              </p>
            </div>
            <Link href="/subscription" className={styles.secondaryButton}>
              Upgrade Now
            </Link>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Current Plan</span>
              <div className={styles.statValue}>{currentPlanLabel}</div>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Status</span>
              <div className={styles.statValue}>{isExpired ? "Expired" : isActive ? "Active" : "Free"}</div>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Access Until</span>
              <div className={styles.statValue}>
                {isActive ? formatDate(subscriptionPack[0]?.end_date) : "—"}
              </div>
            </div>
          </div>

          <div className="mt-4" />

          {isExpired ? (
            <div className={styles.infoItem}>
              <span className={styles.infoValue}>Your plan has expired. Bronze plan details are shown as the fallback.</span>
            </div>
          ) : (
            <div className={styles.infoItem}>
              <span className={styles.infoValue}>
                You are currently on the <strong>{currentPlanLabel}</strong> plan.
              </span>
            </div>
          )}

          {isActive && (
            <div className={`${styles.tableGrid} mt-4`}>
              <div className={styles.tableLabel}>Start date</div>
              <div className={styles.tableValue}>{formatDate(subscriptionPack[0]?.start_date)}</div>
              <div className={styles.tableLabel}>End date</div>
              <div className={styles.tableValue}>{formatDate(subscriptionPack[0]?.end_date)}</div>
            </div>
          )}

          <div className="mt-4" />
          {planDetails.length > 0 ? (
            <ul className={styles.featureList}>
              {planDetails.map((item, i) => (
                <li key={`${item}-${i}`} className={styles.featureItem}>
                  <span className={styles.featureBullet} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.infoItem}>
              <span className={styles.infoValueMuted}>No plan details available.</span>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default SubscriptionProfile;
