"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { Button, Col, Form, Row } from "react-bootstrap";
import { FaMedal } from "react-icons/fa";
import { toast } from "react-toastify";

import "./planDetails.css";

interface PlanDetailsFormProps {
  onNext: (
    planTier: string,
    billingCycle: "monthly" | "annual",
    price: number
  ) => void;
  plan: string;
}

const PlanDetailsForm: React.FC<PlanDetailsFormProps> = ({ onNext, plan }) => {
  const router = useRouter();

  const [plansData, setPlansData] = useState<any[]>([]);
  const [planTier, setPlanTier] = useState(plan.toLowerCase());
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "annual"
  );
  const [price, setPrice] = useState(0);

  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");

  const [isChecked, setIsChecked] = useState(false);
  const [shakeCheckbox, setShakeCheckbox] = useState(false);

  const [isVerified, setIsVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = Cookies.get("authToken");
    if (t) {
      setToken(t);
      const decoded: any = jwtDecode(t);
      setEmail(decoded.email);
    }
  }, []);

  useEffect(() => {
    if (email) fetchPhoneStatus();
  }, [email]);

  useEffect(() => {
    fetchPlanPricing();
  }, []);

  useEffect(() => {
    if (!plansData.length) return;

    const key = planTier.toLowerCase();
    const monthly = plansData.find(
      (item) => String(item.plan).toLowerCase() === "monthly price"
    );
    const annual = plansData.find(
      (item) => String(item.plan).toLowerCase() === "annual price"
    );

    const selectedPrice =
      billingCycle === "monthly" ? monthly?.[key] : annual?.[key];

    setPrice(Number(selectedPrice ?? 0));
  }, [plansData, planTier, billingCycle]);

  const fetchPlanPricing = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription`
      );
      setPlansData(res.data);
    } catch (err) {
      console.error("Subscription fetch failed:", err);
    }
  };

  const fetchPhoneStatus = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/auth/phone/${email}`
      );
      const phoneData = res.data[0];
      setPhoneNumber(phoneData?.phone_number || "");
      setIsVerified(phoneData?.phone_status === 1);
    } catch (err) {
      console.error("Phone data fetch failed:", err);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/auth/phone/${email}`,
        { phone: `${countryCode} ${phoneNumber}` }
      );
      setIsVerified(true);
      setMessage("");
      toast.success("Phone verified successfully!");
    } catch (err) {
      setMessage("Invalid OTP, try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAgreementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
    if (e.target.checked) setShakeCheckbox(false);
  };

  const handleNextClick = () => {
    if (!isChecked) {
      setShakeCheckbox(true);
      toast.warn("Please agree to the terms and conditions before proceeding.");
      setTimeout(() => setShakeCheckbox(false), 500);
      return;
    }

    onNext(planTier, billingCycle, price);
  };

  const formatPrice = (value: any) => {
    const numericValue = Number(value || 0);
    return numericValue.toLocaleString("en-IN");
  };

  return (
    <div className="card border-0">
      <div
        className={`card-header text-white ${planTier}-gradient d-flex justify-content-between align-items-center`}
      >
        <div className="d-flex align-items-center">
          <span className={`plan-badge ${planTier}`}>
            <FaMedal />
          </span>
          <span className="ms-2 fw-bold">{planTier.toUpperCase()} PLAN</span>
        </div>
      </div>

      <div className="card-body">
        <p className="text-muted">
          Unlock all exclusive <strong>{planTier}</strong> plan features after
          purchasing.
        </p>

        <Form>
          <Row className="mb-3 align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Select Plan Tier</Form.Label>
                <Form.Select
                  value={planTier}
                  onChange={(e) => setPlanTier(e.target.value)}
                >
                  <option value="bronze">Bronze</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="platinum">Platinum</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={5}>
              <Form.Group>
                <Form.Label>Billing Cycle</Form.Label>
                <div className="d-flex align-items-center">
                  <Form.Check
                    inline
                    label="Monthly"
                    type="radio"
                    id="monthly"
                    checked={billingCycle === "monthly"}
                    onChange={() => setBillingCycle("monthly")}
                  />
                  <Form.Check
                    inline
                    label="Annual"
                    type="radio"
                    id="annual"
                    checked={billingCycle === "annual"}
                    onChange={() => setBillingCycle("annual")}
                  />
                </div>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Label>Price</Form.Label>
              <div className="price-badge">₹{formatPrice(price)}</div>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Email ID</Form.Label>
            <Form.Control
              type="email"
              value={email}
              disabled
              className="custom-input"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <div className="d-flex gap-2">
              <Form.Select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                style={{ maxWidth: "100px" }}
                disabled={isVerified}
              >
                {[
                  "+1",
                  "+7",
                  "+20",
                  "+27",
                  "+30",
                  "+31",
                  "+32",
                  "+33",
                  "+34",
                  "+39",
                  "+40",
                  "+41",
                  "+44",
                  "+49",
                  "+51",
                  "+52",
                  "+55",
                  "+60",
                  "+61",
                  "+62",
                  "+65",
                  "+81",
                  "+82",
                  "+86",
                  "+91",
                  "+92",
                  "+93",
                  "+94",
                  "+95",
                  "+98",
                  "+212",
                  "+213",
                  "+218",
                  "+220",
                  "+221",
                  "+230",
                  "+234",
                  "+251",
                  "+254",
                  "+256",
                  "+260",
                  "+263",
                  "+298",
                  "+351",
                  "+352",
                  "+355",
                  "+358",
                  "+371",
                  "+375",
                  "+380",
                  "+381",
                  "+387",
                  "+420",
                  "+421",
                  "+423",
                  "+500",
                  "+501",
                  "+502",
                  "+503",
                  "+504",
                  "+505",
                  "+506",
                  "+507",
                  "+509",
                  "+590",
                  "+591",
                  "+592",
                  "+595",
                  "+597",
                  "+598",
                  "+670",
                  "+673",
                  "+852",
                  "+853",
                  "+855",
                  "+856",
                  "+880",
                  "+886",
                  "+960",
                  "+961",
                  "+962",
                  "+963",
                  "+964",
                  "+965",
                  "+966",
                  "+967",
                  "+968",
                  "+970",
                  "+971",
                  "+972",
                  "+973",
                  "+974",
                  "+975",
                  "+977",
                  "+992",
                  "+993",
                  "+994",
                  "+995",
                  "+996",
                  "+998",
                ].map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </Form.Select>

              <Form.Control
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                disabled={isVerified}
                className="custom-input"
              />
            </div>
          </Form.Group>

          {!isVerified && (
            <div className="text-center my-2">
              <Button onClick={verifyOTP} disabled={!phoneNumber || loading}>
                {loading ? "Verifying..." : "Verify"}
              </Button>
            </div>
          )}

          {message && <p className="text-center text-muted mt-2">{message}</p>}

          <div className={`form-check ${shakeCheckbox ? "shake" : ""}`}>
            <label
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={handleAgreementChange}
                style={{
                  accentColor: "#0d6efd",
                  width: "16px",
                  height: "16px",
                }}
              />
              <span>
                I agree to the{" "}
                <Link
                  href="/page/terms-conditions"
                  target="_blank"
                  className="text-primary"
                >
                  terms & conditions
                </Link>
              </span>
            </label>
          </div>

          <div className="mt-3 text-center">
            <Button onClick={handleNextClick}>Next</Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default PlanDetailsForm;