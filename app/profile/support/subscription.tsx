"use client";
import { formatDate } from "@/components/Time";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Row, Col, Card } from "react-bootstrap";

function SubscriptionProfile({ token }: { token: any }) {
  const [subscription, setSubscription] = useState([]);
  const [subscriptionPack, setSubscriptionPack] = useState<any>([]);
  const [plan, setPlan] = useState([]);
  const decoded: any = token ? jwtDecode(token) : { email: "", role: "user" };

  const subscriptionApi = async () => {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription`
    );
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
    }
  };

  useEffect(() => {
    subscriptionApi();
    packApi();
  }, []);

  useEffect(() => {
    if (subscription.length !== 0) {
      const planName =
        subscriptionPack.length === 0 ||
        subscriptionPack[0]?.status === "expired"
          ? "bronze"
          : subscriptionPack[0]?.plan_name;
      const filteredPlan = subscription.filter(
        (item: any) => item[planName] === 1
      );
      setPlan(filteredPlan);
    }
  }, [subscriptionPack, subscription]);

  const currentPlan =
    subscriptionPack.length === 0 || subscriptionPack[0]?.status === "expired"
      ? "bronze"
      : subscriptionPack[0]?.plan_name;
  const isActive = subscriptionPack[0]?.status === "Active";
  const isExpired = subscriptionPack[0]?.status === "expired";

  // Dynamic class assignment based on the current plan
  const planClass = (plan: string) => {
    switch (plan) {
      case "bronze":
        return "text-warning";
      case "silver":
        return "text-secondary";
      case "gold":
        return "text-success";
      case "platinum":
        return "text-primary";
      default:
        return "text-muted";
    }
  };

  return (
    <Card className="shadow p-4 border-0 rounded-3">
      <Row>
        <Col md={6} className="d-flex flex-column  mb-4 mb-md-0">
          <h4 className="fw-semibold mb-3">Subscription</h4>
          {isExpired ? (
            <p className="text-danger">
              Your plan has expired. Showing Bronze plan details.
            </p>
          ) : (
            <p>
              You are currently on the{" "}
              <span className={planClass(currentPlan)}>{currentPlan}</span> plan
              now.
            </p>
          )}
          {isActive && (
            <Row className="mt-2">
              <Col>
                <h4 className="fw-semibold mb-3">Active Plan Period</h4>
                <p>Start Date: {formatDate(subscriptionPack[0]?.start_date)}</p>
                <p>End Date: {formatDate(subscriptionPack[0]?.end_date)}</p>
              </Col>
            </Row>
          )}
        </Col>

        {/* Plan Details */}
        <Col md={6}>
          <h4 className="fw-semibold mb-3">Plan Details</h4>
          <ul className="text-start pl-2">
            {plan
              .filter((item: any) => item.plan !== "usd")
              .map((item: any, i) => (
                <li key={i} className="py-1">
                  {item.plan}
                </li>
              ))}
            <li className="d-block py-1">&nbsp;</li>
          </ul>
          <Link href="/subscription">
            <button className="btn btn-dark ms-auto">Upgarde Now</button>
          </Link>
        </Col>
      </Row>

      {/* Active Plan Dates */}
    </Card>
  );
}

export default SubscriptionProfile;
