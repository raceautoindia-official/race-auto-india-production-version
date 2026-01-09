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

  // Fetch token and decode email
  useEffect(() => {
    const t = Cookies.get("authToken");
    if (t) {
      setToken(t);
      const decoded: any = jwtDecode(t);
      setEmail(decoded.email);
    }
  }, []);

  // Fetch phone details using email
  useEffect(() => {
    if (email) fetchPhoneStatus();
  }, [email]);

  // Fetch subscription pricing details
  useEffect(() => {
    fetchPlanPricing();
  }, []);

  // Calculate price when plan or billing cycle changes
  useEffect(() => {
    if (!plansData.length) return;
    const key = planTier;
    const monthly = plansData.find((item) => item.plan === "Monthly price");
    const annual = plansData.find((item) => item.plan === "Annual price");
    const selectedPrice =
      billingCycle === "monthly" ? monthly?.[key] : annual?.[key];
    setPrice(selectedPrice ?? 0);
  }, [plansData, planTier, billingCycle]);

  // Fetch all subscription plans
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

  // Fetch phone number and verification status
  const fetchPhoneStatus = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/auth/phone/${email}`
      );
      const phoneData = res.data[0];
      setPhoneNumber(phoneData.phone_number);
      setIsVerified(phoneData.phone_status === 1);
    } catch (err) {
      console.error("Phone data fetch failed:", err);
    }
  };

  // Send request to verify OTP
  const verifyOTP = async () => {
    setLoading(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/auth/phone/${email}`,
        { phone: `${countryCode} ${phoneNumber}` }
      );
      setIsVerified(true);
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

  const formatPrice = (price: any) => {
    return price.toLocaleString("en-IN"); // 'en-IN' formats the price in Indian number system
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
          {/* Plan Tier Selection */}
          {/* Plan Tier Selection */}
          <Row className="mb-3 align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Select Plan Tier</Form.Label>
                <Form.Select
                  value={planTier}
                  onChange={(e) => setPlanTier(e.target.value)}
                >
                  <option value="platinum">Platinum</option>
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
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

          {/* Email Display */}
          <Form.Group className="mb-3">
            <Form.Label>Email ID</Form.Label>
            <Form.Control
              type="email"
              value={email}
              disabled
              className="custom-input"
            />
          </Form.Group>

          {/* Phone Verification */}
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
                  "+1", // USA, Canada
                  "+7", // Russia, Kazakhstan
                  "+20", // Egypt
                  "+27", // South Africa
                  "+30", // Greece
                  "+31", // Netherlands
                  "+32", // Belgium
                  "+33", // France
                  "+34", // Spain
                  "+39", // Italy
                  "+40", // Romania
                  "+41", // Switzerland
                  "+44", // UK
                  "+49", // Germany
                  "+51", // Peru
                  "+52", // Mexico
                  "+55", // Brazil
                  "+60", // Malaysia
                  "+61", // Australia
                  "+62", // Indonesia
                  "+65", // Singapore
                  "+81", // Japan
                  "+82", // South Korea
                  "+86", // China
                  "+91", // India
                  "+92", // Pakistan
                  "+93", // Afghanistan
                  "+94", // Sri Lanka
                  "+95", // Myanmar
                  "+98", // Iran
                  "+212", // Morocco
                  "+213", // Algeria
                  "+218", // Libya
                  "+220", // Gambia
                  "+221", // Senegal
                  "+230", // Mauritius
                  "+234", // Nigeria
                  "+251", // Ethiopia
                  "+254", // Kenya
                  "+256", // Uganda
                  "+260", // Zambia
                  "+263", // Zimbabwe
                  "+298", // Faroe Islands
                  "+351", // Portugal
                  "+352", // Luxembourg
                  "+355", // Albania
                  "+358", // Finland
                  "+371", // Latvia
                  "+375", // Belarus
                  "+380", // Ukraine
                  "+381", // Serbia
                  "+387", // Bosnia & Herzegovina
                  "+420", // Czech Republic
                  "+421", // Slovakia
                  "+423", // Liechtenstein
                  "+500", // Falkland Islands
                  "+501", // Belize
                  "+502", // Guatemala
                  "+503", // El Salvador
                  "+504", // Honduras
                  "+505", // Nicaragua
                  "+506", // Costa Rica
                  "+507", // Panama
                  "+509", // Haiti
                  "+590", // Guadeloupe
                  "+591", // Bolivia
                  "+592", // Guyana
                  "+595", // Paraguay
                  "+597", // Suriname
                  "+598", // Uruguay
                  "+670", // Timor-Leste
                  "+673", // Brunei
                  "+852", // Hong Kong
                  "+853", // Macau
                  "+855", // Cambodia
                  "+856", // Laos
                  "+880", // Bangladesh
                  "+886", // Taiwan
                  "+960", // Maldives
                  "+961", // Lebanon
                  "+962", // Jordan
                  "+963", // Syria
                  "+964", // Iraq
                  "+965", // Kuwait
                  "+966", // Saudi Arabia
                  "+967", // Yemen
                  "+968", // Oman
                  "+970", // Palestine
                  "+971", // UAE
                  "+972", // Israel
                  "+973", // Bahrain
                  "+974", // Qatar
                  "+975", // Bhutan
                  "+977", // Nepal
                  "+992", // Tajikistan
                  "+993", // Turkmenistan
                  "+994", // Azerbaijan
                  "+995", // Georgia
                  "+996", // Kyrgyzstan
                  "+998", // Uzbekistan
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

          {/* Terms and Conditions */}
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
                <Link href="/page/terms-conditions" target="_blank" className="text-primary">
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
