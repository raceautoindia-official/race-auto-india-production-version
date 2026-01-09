'use client';
import React, { useEffect, useState } from "react";
import "./subscriptioncards.css";
import "./subscriptioncard.css";
import { PiCheckCircleFill, PiXCircleFill } from "react-icons/pi";
import { IoDiamond } from "react-icons/io5";
import SubscriptionForm from "./SubscriptionForm";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Tooltip } from "react-tooltip"; // v5+

export default function PricingCard({
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

  const subscriptionApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription/purchase/${email}`
      );
      setSubcriptionData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

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
      subscriptionApi();
    }
  }, [email]);

  const fakePrice = typeof price === "number" && typeof multipliedPrice === "number"
    ? price * multipliedPrice
    : null;

  const discountPercent =
    typeof fakePrice === "number" && typeof price === "number"
      ? Math.round(((fakePrice - price) / fakePrice) * 100)
      : null;

  const userPlan = subcriptionData.length > 0 ? subcriptionData[0].plan_name : null;
  const isUserSubscribed = subcriptionData.length !== 0 && new Date(subcriptionData[0].end_date) > new Date();

  const isThisUserPlan = isUserSubscribed && userPlan === title.toLowerCase();
  const isSilverPlan = title.toLowerCase() === "silver";

  const shouldShowYourPlanBadge = isThisUserPlan || (!token && isSilverPlan);

  return (
    <div
      className={`pricing-card ${shouldShowYourPlanBadge ? "active-plan" : ""}`}
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

      {title.toLowerCase() === "gold" && (
        <img src="/images/gold-star.png" alt="Gold Icon" className="corner-icon" />
      )}
      {title.toLowerCase() === "silver" && (
        <img src="/images/silver.jpg" alt="Silver Icon" className="corner-icon" />
      )}
      {title.toLowerCase() === "platinum" && (
        <img src="/images/platinum.png" alt="Platinum Icon" className="corner-icon" />
      )}

      <h3
        className="plan-title"
        style={{
          color:
            title.toLowerCase() === "gold"
              ? "#DAA520"
              : title.toLowerCase() === "silver"
                ? "#7c7c7c"
                : title.toLowerCase() === "platinum"
                  ? "#2c3e50"
                  : "black",
          fontWeight: 700,
          fontSize: "1.5rem",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {title}
      </h3>

      {isSilverPlan && (
        <div
          style={{
            backgroundColor: '#f8f9fa',
            color: '#6c757d',
            padding: '4px 10px',
            fontSize: '0.75rem',
            borderRadius: '20px',
            fontWeight: 600,
            textTransform: 'uppercase',
            width: 'fit-content',
            margin: '0 auto 8px',
            border: '1px solid #dee2e6',
            boxShadow: '0 0 4px rgba(0,0,0,0.05)',
          }}
        >
          Free Plan
        </div>
      )}

      <p className="plan-subtitle">{subtitle}</p>

      <div className="price-section" style={{ textAlign: "center" }}>
        {fakePrice && !isSilverPlan && (
          <div className="fake-price" style={{
            position: 'relative',
            display: 'inline-block',
            fontSize: '1.1rem',
            color: '#888',
            marginBottom: '4px',
            fontWeight: 500
          }}>
            {fakePrice.toLocaleString("en-US", {
              style: "currency",
              currency: currency || "INR",
            })}
            <span style={{
              position: 'absolute',
              left: 0,
              top: '50%',
              width: '100%',
              height: '1px',
              backgroundColor: 'red',
              transform: 'rotate(-5deg)',
            }} />
          </div>
        )}

        {!isSilverPlan && (
          <h2 className="plan-price" style={{ color: 'black' }}>
            {typeof price === "number"
              ? price.toLocaleString("en-US", {
                style: "currency",
                currency: currency || "INR",
              })
              : "N/A"}
            <span>/{isYear ? "yr" : "mo"}</span>
          </h2>
        )}

        {isSilverPlan && (
          <h2 className="plan-price" style={{ color: '#7c7c7c' }}>
            ₹0<span>/mo</span>
          </h2>
        )}
      </div>

      <ul className="feature-list">
        {features
          .filter(f => f.available !== 2)
          .sort((a, b) => {
            const order = { 1: 0, 3: 1, 4: 2, 0: 3 };
            return order[a.available] - order[b.available];
          })
          .map((f, i) => {
            const tooltipId = `tip-${i}`;
            const baseStyle = { color: 'black', fontWeight: 500 };
            const iconStyle = { marginRight: "8px", verticalAlign: "middle" };

            const tooltipProps = {
              "data-tooltip-id": tooltipId,
              "data-tooltip-html": f.description || ""
            };

            if (f.available === 1) {
              return (
                <li key={i} style={baseStyle}>
                  <PiCheckCircleFill style={iconStyle} className="text-success" />
                  <span {...tooltipProps}>{f.plan}</span>
                  <Tooltip id={tooltipId} className="custom-tooltip" place="top" html />
                </li>
              );
            }

            if (f.available === 3) {
              return (
                <li key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#b37400",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                }}>
                  <IoDiamond style={iconStyle} color="#f57c00" />
                  <span {...tooltipProps} style={{ flex: 1 }}>{f.plan}</span>
                  <Tooltip id={tooltipId} className="custom-tooltip" place="top" html />
                  <span className="sparkled_badge" style={{
                    fontSize: "0.7rem",
                    color: 'black',
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    display: "inline-block",
                  }}>
                    Featured
                  </span>
                </li>
              );
            }

            if (f.available === 4) {
              return (
                <li key={i} style={{
                  ...baseStyle,
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontWeight: 600,
                  position: "relative",
                }}>
                  <span {...tooltipProps}>{f.plan}</span>
                  <Tooltip id={tooltipId} className="custom-tooltip" place="top" html />
                  <span style={{
                    backgroundColor: "#00796b",
                    color: "#fff",
                    fontSize: "0.65rem",
                    padding: "2px 6px",
                    borderRadius: "10px",
                    marginLeft: "10px",
                    textTransform: "uppercase",
                  }}>
                    New
                  </span>
                </li>
              );
            }

            if (f.available === 0) {
              return (
                <li key={i} style={{ ...baseStyle, opacity: 0.6 }}>
                  <PiXCircleFill style={iconStyle} className="text-muted" />
                  <span {...tooltipProps}>{f.plan}</span>
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
