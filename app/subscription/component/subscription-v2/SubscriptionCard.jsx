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
import { Tooltip } from "react-tooltip";
import {
  getActivePlanName,
  getPlanAction,
} from "@/lib/subscriptionPlan";

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
  isYear,
}) {
  const [email, setEmail] = useState("");
  const [subcriptionData, setSubcriptionData] = useState([]);

  const subscriptionApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription/purchase/${email}`
      );
      setSubcriptionData(res.data || []);
    } catch (err) {
      console.log(err);
      setSubcriptionData([]);
    }
  };

  useEffect(() => {
    const authToken = Cookies.get("authToken");
    if (authToken) {
      const decoded = jwtDecode(authToken);
      setEmail(decoded.email);
    }
  }, []);

  useEffect(() => {
    if (email !== "") {
      subscriptionApi();
    }
  }, [email]);

  const planKey = title.toLowerCase();
  const currentPlan = getActivePlanName(subcriptionData);
  const planAction = getPlanAction(currentPlan, planKey);

  const shouldShowYourPlanBadge = planAction === "current";

  const fakePrice =
    typeof price === "number" && typeof multipliedPrice === "number"
      ? price * multipliedPrice
      : null;

  const discountPercent =
    typeof fakePrice === "number" &&
    typeof price === "number" &&
    fakePrice > price
      ? Math.round(((fakePrice - price) / fakePrice) * 100)
      : null;

  const hasTopBadge =
    (discountPercent && discountPercent > 0) || isPopular || shouldShowYourPlanBadge;

  const titleColor =
    planKey === "bronze"
      ? "#a97142"
      : planKey === "silver"
      ? "#7c7c7c"
      : planKey === "gold"
      ? "#DAA520"
      : planKey === "platinum"
      ? "#2c3e50"
      : "black";

  const normalizeFeatureLabel = (label) => {
    if (!label) return "";

    let text = label;

    if (planKey === "silver") {
      text = text.replace(/Everything in Silver Plan/gi, "Everything in Bronze Plan");
    }

    return text;
  };

  const renderActionButton = () => {
    if (planAction === "current") {
      return (
        <button
          type="button"
          className="btn btn-outline-dark w-100"
          disabled
          style={{
            borderRadius: "10px",
            fontWeight: 700,
            padding: "9px 14px",
            fontSize: "0.92rem",
          }}
        >
          Current Plan
        </button>
      );
    }

    if (planAction === "included") {
      return (
        <button
          type="button"
          className="btn btn-outline-secondary w-100"
          disabled
          style={{
            borderRadius: "10px",
            fontWeight: 700,
            padding: "9px 14px",
            fontSize: "0.92rem",
            opacity: 0.95,
          }}
        >
          Included in Your Plan
        </button>
      );
    }

    return <SubscriptionForm plan={planKey} />;
  };

  const iconStyleCommon = {
    width: "34px",
    height: "34px",
    objectFit: "contain",
    borderRadius: "50%",
    background: "#fff",
    padding: "4px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  };

  return (
    <div
      className={`pricing-card ${shouldShowYourPlanBadge ? "active-plan" : ""}`}
      style={{
        backgroundColor: color,
        position: "relative",
        boxShadow: shouldShowYourPlanBadge
          ? "0 0 14px rgba(218, 165, 32, 0.40)"
          : planKey === "bronze"
          ? "0 0 0 2px rgba(169, 113, 66, 0.14), 0 5px 14px rgba(0, 0, 0, 0.06)"
          : "0 5px 14px rgba(0, 0, 0, 0.06)",
        border: shouldShowYourPlanBadge
          ? "2px solid gold"
          : planKey === "bronze"
          ? "2px solid #d2a34f"
          : "1px solid #e4e4e4",
        borderRadius: "16px",
        padding: "14px 16px",
        minHeight: "100%",
        maxHeight: "calc(100vh - 170px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {discountPercent && discountPercent > 0 && (
        <span
          className="badge bg-danger position-absolute top-0 start-0 m-2"
          style={{ fontSize: "0.74rem", padding: "6px 8px" }}
        >
          {discountPercent}% OFF
        </span>
      )}

      {isPopular && (
        <div
          className="popular-badge"
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "#101828",
            color: "#fff",
            padding: "6px 11px",
            borderRadius: "999px",
            fontSize: "0.72rem",
            fontWeight: 700,
            zIndex: 2,
          }}
        >
          Popular
        </div>
      )}

      {shouldShowYourPlanBadge && (
        <div
          className="active-badge animate-pulse"
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "#4c54d2",
            color: "#fff",
            padding: "6px 11px",
            borderRadius: "999px",
            fontSize: "0.72rem",
            fontWeight: 700,
            zIndex: 3,
          }}
        >
          Your Plan
        </div>
      )}

      <div style={{ paddingTop: hasTopBadge ? "16px" : "0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "8px",
            marginBottom: "6px",
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3
              className="plan-title"
              style={{
                color: titleColor,
                fontWeight: 800,
                fontSize: "1.08rem",
                textTransform: "uppercase",
                letterSpacing: "0.35px",
                marginBottom: "5px",
                lineHeight: 1.05,
              }}
            >
              {title}
            </h3>

            {planKey === "bronze" && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "3px 9px",
                  borderRadius: "999px",
                  background: "rgba(169, 113, 66, 0.12)",
                  color: "#8a5a2b",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Bronze Starter
              </div>
            )}
          </div>

          <div style={{ flexShrink: 0 }}>
            {planKey === "bronze" && (
              <img
                src="/images/bronze.png"
                alt="Bronze Icon"
                className="corner-icon"
                style={iconStyleCommon}
              />
            )}
            {planKey === "gold" && (
              <img
                src="/images/gold-star.png"
                alt="Gold Icon"
                className="corner-icon"
                style={iconStyleCommon}
              />
            )}
            {planKey === "silver" && (
              <img
                src="/images/silver.jpg"
                alt="Silver Icon"
                className="corner-icon"
                style={iconStyleCommon}
              />
            )}
            {planKey === "platinum" && (
              <img
                src="/images/platinum.png"
                alt="Platinum Icon"
                className="corner-icon"
                style={iconStyleCommon}
              />
            )}
          </div>
        </div>

        <p
          className="plan-subtitle"
          style={{
            color: "#505a66",
            fontSize: "0.82rem",
            marginBottom: "10px",
            lineHeight: 1.25,
          }}
        >
          {subtitle}
        </p>
      </div>

      <div
        className="price-section"
        style={{ textAlign: "center", marginBottom: "10px" }}
      >
        {fakePrice && fakePrice > price && (
          <div
            className="fake-price"
            style={{
              position: "relative",
              display: "inline-block",
              fontSize: "0.88rem",
              color: "#8b8b8b",
              marginBottom: "2px",
              fontWeight: 500,
            }}
          >
            {fakePrice.toLocaleString("en-US", {
              style: "currency",
              currency: currency || "INR",
            })}
            <span
              style={{
                position: "absolute",
                left: 0,
                top: "50%",
                width: "100%",
                height: "1px",
                backgroundColor: "red",
                transform: "rotate(-5deg)",
              }}
            />
          </div>
        )}

        <h2
          className="plan-price"
          style={{
            color: "black",
            fontWeight: 800,
            fontSize: "1.55rem",
            lineHeight: 1.1,
            marginBottom: 0,
            display: "inline-flex",
            alignItems: "baseline",
            justifyContent: "center",
            gap: "2px",
            flexWrap: "wrap",
          }}
        >
          <span>
            {typeof price === "number"
              ? price.toLocaleString("en-US", {
                  style: "currency",
                  currency: currency || "INR",
                })
              : "N/A"}
          </span>
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "#202020",
            }}
          >
            /{isYear ? "yr" : "mo"}
          </span>
        </h2>
      </div>

      <ul
        className="feature-list"
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          flex: 1,
          overflowY: "auto",
          paddingRight: "4px",
          scrollbarWidth: "thin",
        }}
      >
        {features
          .filter((f) => f.available !== 2)
          .sort((a, b) => {
            const order = { 1: 0, 3: 1, 4: 2, 0: 3 };
            return order[a.available] - order[b.available];
          })
          .map((f, i) => {
            const tooltipId = `tip-${planKey}-${i}`;
            const baseStyle = {
              color: "black",
              fontWeight: 500,
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              padding: "4px 0",
              lineHeight: 1.28,
              fontSize: "0.80rem",
            };
            const itemIconStyle = {
              marginTop: "2px",
              flexShrink: 0,
              fontSize: "1rem",
            };

            const tooltipProps = {
              "data-tooltip-id": tooltipId,
              "data-tooltip-html": f.description || "",
            };

            const featureText = normalizeFeatureLabel(f.plan);

            if (f.available === 1) {
              return (
                <li key={i} style={baseStyle}>
                  <PiCheckCircleFill style={itemIconStyle} className="text-success" />
                  <span {...tooltipProps}>{featureText}</span>
                  <Tooltip id={tooltipId} className="custom-tooltip" place="top" html />
                </li>
              );
            }

            if (f.available === 3) {
              return (
                <li
                  key={i}
                  style={{
                    ...baseStyle,
                    color: "#b37400",
                    fontWeight: 600,
                  }}
                >
                  <IoDiamond style={itemIconStyle} color="#f57c00" />
                  <span {...tooltipProps} style={{ flex: 1 }}>
                    {featureText}
                  </span>
                  <Tooltip id={tooltipId} className="custom-tooltip" place="top" html />
                  <span
                    className="sparkled_badge"
                    style={{
                      fontSize: "0.58rem",
                      color: "black",
                      padding: "2px 6px",
                      borderRadius: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.2px",
                      textTransform: "uppercase",
                      display: "inline-block",
                      background: "#ffd18a",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Featured
                  </span>
                </li>
              );
            }

            if (f.available === 4) {
              return (
                <li
                  key={i}
                  style={{
                    ...baseStyle,
                    fontWeight: 600,
                  }}
                >
                  <span {...tooltipProps} style={{ flex: 1 }}>
                    {featureText}
                  </span>
                  <Tooltip id={tooltipId} className="custom-tooltip" place="top" html />
                  <span
                    style={{
                      backgroundColor: "#00796b",
                      color: "#fff",
                      fontSize: "0.56rem",
                      padding: "2px 5px",
                      borderRadius: "10px",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    New
                  </span>
                </li>
              );
            }

            if (f.available === 0) {
              return (
                <li key={i} style={{ ...baseStyle, opacity: 0.65 }}>
                  <PiXCircleFill style={itemIconStyle} className="text-muted" />
                  <span {...tooltipProps}>{featureText}</span>
                  <Tooltip id={tooltipId} className="custom-tooltip" place="top" html />
                </li>
              );
            }

            return null;
          })}
      </ul>

      <div style={{ marginTop: "10px", flexShrink: 0 }}>{renderActionButton()}</div>
    </div>
  );
}