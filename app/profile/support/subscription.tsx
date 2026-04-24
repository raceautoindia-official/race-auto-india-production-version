"use client";

import { formatDate } from "@/components/Time";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { Card } from "react-bootstrap";
import styles from "../profile.module.css";
import { getPlanUITitle, normalizePlanName } from "@/lib/subscriptionPlan";

type BillingEntry = {
  id: string;
  status: "Success" | "Failed";
  planLabel: string;
  amount: number | null;
  paymentReference: string | null;
  createdAt: string | null;
};

function SubscriptionProfile({ token }: { token: any }) {
  const [subscription, setSubscription] = useState<any[]>([]);
  const [subscriptionPack, setSubscriptionPack] = useState<any[]>([]);
  const [plan, setPlan] = useState<any[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingEntry[]>([]);
  const [showAllHistory, setShowAllHistory] = useState(false);

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

  const billingApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/profile/billing-history/${decoded.email}`
      );
      setBillingHistory(res.data?.history ?? []);
    } catch {
      setBillingHistory([]);
    }
  };

  useEffect(() => {
    subscriptionApi();
    packApi();
    billingApi();
  }, []);

  useEffect(() => {
    if (subscription.length !== 0) {
      const planName =
        subscriptionPack.length === 0 || subscriptionPack[0]?.status === "expired"
          ? "none"
          : subscriptionPack[0]?.plan_name;
      const filteredPlan =
        planName === "none"
          ? []
          : subscription.filter((item: any) => item[planName] === 1);
      setPlan(filteredPlan);
    }
  }, [subscriptionPack, subscription]);

  const currentPlan =
    subscriptionPack.length === 0 || subscriptionPack[0]?.status === "expired"
      ? "none"
      : subscriptionPack[0]?.plan_name;
  const isActive = subscriptionPack[0]?.status === "Active";
  const isExpired = subscriptionPack[0]?.status === "expired";
  const hasPastSubscription = subscriptionPack.length > 0;

  const planDetails = useMemo(
    () => plan.filter((item: any) => item.plan !== "usd").map((item: any) => item.plan),
    [plan]
  );

  const currentPlanLabel = getPlanUITitle(normalizePlanName(currentPlan));

  // Billing details: derive from latest payment history + subscription row
  const latestPayment = billingHistory[0] ?? null;
  const billingPaymentRef =
    subscriptionPack[0]?.payment_id || latestPayment?.paymentReference || null;
  const billingLastDate = latestPayment?.createdAt || subscriptionPack[0]?.start_date || null;
  const billingStatus = latestPayment ? latestPayment.status : null;
  const billingAmount = latestPayment?.amount ?? null;
  const billingExpiryDate = subscriptionPack[0]?.end_date ?? null;

  const historyToShow = showAllHistory ? billingHistory : billingHistory.slice(0, 5);

  return (
    <div className={styles.mainStack}>
      {/* Subscription Details */}
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
              <span className={styles.infoValue}>Your paid plan has expired. Your account is currently on the Free plan.</span>
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

      {/* Billing Details — shown for active and expired users, hidden for users with no subscription record */}
      {hasPastSubscription && (
        <Card className={`${styles.surfaceCard} ${styles.sectionCard}`}>
          <Card.Body className="p-0">
            <div className={styles.sectionHeader}>
              <div>
                <h3 className={styles.sectionTitle}>Billing Details</h3>
                <p className={styles.sectionDescription}>
                  Summary of your most recent payment and subscription billing reference.
                </p>
              </div>
            </div>

            <div className={styles.tableGrid}>
              <div className={styles.tableLabel}>Last Payment Amount</div>
              <div className={styles.tableValue}>
                {billingAmount !== null
                  ? `₹${billingAmount.toLocaleString()}`
                  : <span className={styles.infoValueMuted}>Not available</span>}
              </div>

              <div className={styles.tableLabel}>Last Payment Date</div>
              <div className={styles.tableValue}>
                {billingLastDate
                  ? formatDate(billingLastDate)
                  : <span className={styles.infoValueMuted}>Not available</span>}
              </div>

              <div className={styles.tableLabel}>Billing / Order ID</div>
              <div className={styles.tableValue}>
                {billingPaymentRef || <span className={styles.infoValueMuted}>Not available</span>}
              </div>

              <div className={styles.tableLabel}>Plan Expiry Date</div>
              <div className={styles.tableValue}>
                {billingExpiryDate
                  ? formatDate(billingExpiryDate)
                  : <span className={styles.infoValueMuted}>Not available</span>}
              </div>

              <div className={styles.tableLabel}>Renewal Date</div>
              <div className={styles.tableValue}>
                {billingExpiryDate
                  ? formatDate(billingExpiryDate)
                  : <span className={styles.infoValueMuted}>Not available</span>}
              </div>

              <div className={styles.tableLabel}>Payment Status</div>
              <div className={styles.tableValue}>
                {billingStatus === "Success" ? (
                  <span className={styles.successBadge}>Success</span>
                ) : billingStatus === "Failed" ? (
                  <span className={styles.mutedBadge}>Failed</span>
                ) : (
                  <span className={styles.infoValueMuted}>Not available</span>
                )}
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Billing History — always rendered; expired users can still see past records */}
      <Card className={`${styles.surfaceCard} ${styles.sectionCard}`}>
        <Card.Body className="p-0">
          <div className={styles.sectionHeader}>
            <div>
              <h3 className={styles.sectionTitle}>Billing History</h3>
              <p className={styles.sectionDescription}>
                Your recent payment activity. Only confirmed successful or failed transactions are shown.
              </p>
            </div>
          </div>

          {billingHistory.length === 0 ? (
            <div className={styles.infoItem}>
              <span className={styles.infoValueMuted}>No billing history found.</span>
            </div>
          ) : (
            <>
              <div className={styles.infoList}>
                {historyToShow.map((entry) => (
                  <div key={entry.id} className={styles.infoItem}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <div className={styles.infoValue}>{entry.planLabel}</div>
                        {entry.paymentReference && (
                          <div style={{ color: "#94a3b8", fontSize: "0.82rem", marginTop: 4 }}>
                            Ref: {entry.paymentReference}
                          </div>
                        )}
                        {entry.createdAt && (
                          <div style={{ color: "#94a3b8", fontSize: "0.82rem", marginTop: 2 }}>
                            {formatDate(entry.createdAt)}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        {entry.amount !== null && (
                          <span style={{ fontWeight: 700, fontSize: "0.94rem" }}>
                            ₹{entry.amount.toLocaleString()}
                          </span>
                        )}
                        {entry.status === "Success" ? (
                          <span className={styles.successBadge}>Success</span>
                        ) : (
                          <span className={styles.mutedBadge}>Failed</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {billingHistory.length > 5 && (
                <div style={{ marginTop: 16, textAlign: "center" }}>
                  <button
                    type="button"
                    className={styles.ghostButton}
                    onClick={() => setShowAllHistory((prev) => !prev)}
                    style={{ minHeight: 38, padding: "0 18px", fontSize: "0.9rem" }}
                  >
                    {showAllHistory
                      ? "Show Less"
                      : `See More (${billingHistory.length - 5} more)`}
                  </button>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default SubscriptionProfile;
