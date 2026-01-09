'use client';
import React, { useEffect, useState } from "react";
import { PiCheckCircleFill, PiXCircleFill } from "react-icons/pi";
import { IoDiamond } from "react-icons/io5";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import './styles/subscriptionMobileCard.css';
import SubscriptionForm from "@/app/subscription/component/subscription-v2/SubscriptionForm";
import { Tooltip } from "react-tooltip";


export default function MobilePricingCard({
  title,
  subtitle,
  price,
  multipliedPrice,
  features,
  color,
  icon,
  isPopular,
  currency,
  isYear
}) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(null);
  const [subcriptionData, setSubcriptionData] = useState([]);

  useEffect(() => {
    const token = Cookies.get("authToken");
    if (token) {
      setToken(token);
      const decoded = jwtDecode(token);
      setEmail(decoded.email);
    }
  }, []);

  useEffect(() => {
    if (email !== "") {
      axios
        .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription/purchase/${email}`)
        .then(res => setSubcriptionData(res.data))
        .catch(err => console.log(err));
    }
  }, [email]);

  const userPlan = subcriptionData.length > 0 ? subcriptionData[0].plan_name : null;
  const isUserSubscribed = subcriptionData.length !== 0 && new Date(subcriptionData[0].end_date) > new Date();
  const isThisUserPlan = isUserSubscribed && userPlan === title.toLowerCase();
  const isSilverPlan = title.toLowerCase() === "silver";

  const shouldShowYourPlanBadge = isThisUserPlan || (!token && isSilverPlan);

  const fakePrice = typeof price === "number" && typeof multipliedPrice === "number"
    ? price * multipliedPrice
    : null;

  const discountPercent =
    typeof fakePrice === "number" && typeof price === "number"
      ? Math.round(((fakePrice - price) / fakePrice) * 100)
      : null;

  const imageSrc = {
    gold: "/images/gold-star.png",
    silver: "/images/silver.jpg",
    platinum: "/images/platinum.png"
  };

  return (
    <div
      className={`mobile-pricing-card ${shouldShowYourPlanBadge ? "active-plan" : ""}`}
      style={{
        backgroundColor: color,
        position: 'relative',
        boxShadow: shouldShowYourPlanBadge
          ? '0 0 18px rgba(218, 165, 32, 0.6)'
          : isSilverPlan
            ? '0 0 12px rgba(192,192,192,0.5)'
            : '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: shouldShowYourPlanBadge
          ? '2px solid gold'
          : isSilverPlan
            ? '1px solid #d0d0d0'
            : 'none',
      }}
    >
      {discountPercent && discountPercent > 0 && !isSilverPlan && (
        <span className="badge bg-danger position-absolute top-0 start-0 m-2">
          {discountPercent}% OFF
        </span>
      )}

      {isPopular && !isSilverPlan && <div className="popular-badge">Popular</div>}
      {shouldShowYourPlanBadge && (
        <div className="active-badge animate-pulse">Your Plan</div>
      )}

      {["gold", "silver", "platinum"].includes(title.toLowerCase()) && (
        <img src={imageSrc[title.toLowerCase()]} alt={`${title} Plan`} className="corner-icon" />
      )}

      <h3 className="plan-title">{title}</h3>

      {isSilverPlan && (
        <div className="free-badge">Free Plan</div>
      )}

      <p className="plan-subtitle">{subtitle}</p>

      <div className="price-section" style={{ textAlign: "center" }}>
        {fakePrice && !isSilverPlan && (
          <div className="fake-price">
            {fakePrice.toLocaleString("en-US", {
              style: "currency",
              currency: currency || "INR",
            })}
            <span className="strike-line" />
          </div>
        )}

        <h2 className="plan-price" style={{ color: isSilverPlan ? '#7c7c7c' : 'black' }}>
          {isSilverPlan ? '₹0' :
            typeof price === "number"
              ? price.toLocaleString("en-US", {
                style: "currency",
                currency: currency || "INR",
              })
              : "N/A"}
          <span>/{isYear ? "yr" : "mo"}</span>
        </h2>
      </div>

      <ul className="feature-list">
        {features
          .filter(f => f.available !== 2)
          .sort((a, b) => {
            const order = { 1: 0, 3: 1, 4: 2, 0: 3 };
            return order[a.available] - order[b.available];
          })
          .map((f, i) => {
            const tooltipId = `m-tip-${i}`;
            const iconStyle = { marginRight: "8px", verticalAlign: "middle" };

            if (f.available === 1) {
              return (
                <li key={i} className="text-success fw-semibold">
                  <PiCheckCircleFill style={iconStyle} />
                  <span data-tooltip-id={tooltipId} data-tooltip-html={f.description || ""}>
                    {f.plan}
                  </span>
                  <Tooltip id={tooltipId} className="custom-tooltip" place="top" html />
                </li>
              );
            }

            if (f.available === 3) {
              return (
                <li key={i} className="text-warning fw-bold">
                  <IoDiamond style={iconStyle} />
                  <span data-tooltip-id={tooltipId} data-tooltip-html={f.description || ""}>
                    {f.plan}
                  </span>
                  <Tooltip id={tooltipId} className="custom-tooltip" place="top" html />
                  <span className="sparkled_badge" style={{color:'black'}}>Featured</span>
                </li>
              );
            }

            if (f.available === 4) {
              return (
                <li key={i} className="text-info fw-bold">
                  <span data-tooltip-id={tooltipId} data-tooltip-html={f.description || ""}>
                    {f.plan}
                  </span>
                  <Tooltip id={tooltipId} className="custom-tooltip" place="top" html />
                  <span className="new-badge">New</span>
                </li>
              );
            }

            if (f.available === 0) {
              return (
                <li key={i} className="text-muted" style={{ opacity: 0.6 }}>
                  <PiXCircleFill style={iconStyle} />
                  <span data-tooltip-id={tooltipId} data-tooltip-html={f.description || ""}>
                    {f.plan}
                  </span>
                  <Tooltip id={tooltipId} className="custom-tooltip" place="top" html />
                </li>
              );
            }

            return null;
          })}
      </ul>

      {!isSilverPlan && !shouldShowYourPlanBadge && (
        <SubscriptionForm plan={title.toLowerCase()} />
      )}
    </div>
  );
}
