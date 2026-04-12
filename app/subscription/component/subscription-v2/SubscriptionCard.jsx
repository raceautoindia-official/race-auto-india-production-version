"use client";
import React, { useEffect, useMemo, useState } from "react";
import "./pricingShowcase.css";
import { PiCheckCircleFill, PiXCircleFill } from "react-icons/pi";
import { IoDiamond } from "react-icons/io5";
import SubscriptionForm from "./SubscriptionForm";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Tooltip } from "react-tooltip";

const PLAN_META = {
  bronze: {
    segmentLabel: "Individual Plan",
    userCount: null,
    accent: "#b28b47",
    accentSoft: "rgba(178, 139, 71, 0.12)",
    titleColor: "#8c651e",
    iconSrc: "/images/bronze.png",
    iconAlt: "Bronze icon",
  },
  silver: {
    segmentLabel: "Individual Plan",
    userCount: null,
    accent: "#64748b",
    accentSoft: "rgba(100, 116, 139, 0.12)",
    titleColor: "#334155",
    iconSrc: "/images/silver.jpg",
    iconAlt: "Silver icon",
  },
  gold: {
    segmentLabel: "Business Plan",
    userCount: "5 Users",
    accent: "#c3932d",
    accentSoft: "rgba(195, 147, 45, 0.12)",
    titleColor: "#a26708",
    iconSrc: "/images/gold-star.png",
    iconAlt: "Gold icon",
  },
  platinum: {
    segmentLabel: "Business Plan",
    userCount: "10 Users",
    accent: "#0f172a",
    accentSoft: "rgba(15, 23, 42, 0.08)",
    titleColor: "#0f172a",
    iconSrc: "/images/platinum.png",
    iconAlt: "Platinum icon",
  },
};

const PLAN_RANK = {
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
};

export default function PricingCard({
  title,
  planKey: planKeyProp,
  subtitle,
  price,
  multipliedPrice,
  features,
  currency,
  isYear,
  isPopular,
}) {
  const [email, setEmail] = useState("");
  const [subcriptionData, setSubcriptionData] = useState([]);

  const planKey = planKeyProp || title.toLowerCase();
  const currentMeta = PLAN_META[planKey] || PLAN_META.bronze;

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

  const fakePrice =
    typeof price === "number" && typeof multipliedPrice === "number"
      ? price * multipliedPrice
      : null;

  const discountPercent =
    typeof fakePrice === "number" && typeof price === "number" && fakePrice > price
      ? Math.round(((fakePrice - price) / fakePrice) * 100)
      : null;

  const userPlan = subcriptionData.length > 0 ? subcriptionData[0]?.plan_name : null;

  const isUserSubscribed =
    subcriptionData.length !== 0 &&
    subcriptionData[0]?.end_date &&
    new Date(subcriptionData[0].end_date) > new Date();

  const currentPlanRank = isUserSubscribed ? PLAN_RANK[userPlan] || 0 : 0;
  const viewedPlanRank = PLAN_RANK[planKey] || 0;

  const isThisUserPlan = isUserSubscribed && userPlan === planKey;
  const isLowerThanCurrent = isUserSubscribed && currentPlanRank > viewedPlanRank;

  const normalizeFeatureLabel = (label) => {
    if (!label) return "";
    let text = label;
    if (planKey === "silver") {
      text = text.replace(/Everything in Silver Plan/gi, "Everything in Bronze Plan");
    }
    return text;
  };

  const renderActionButton = () => {
    if (isThisUserPlan) {
      return (
        <button type="button" className="btn btn-outline-dark w-100" disabled>
          Current Plan
        </button>
      );
    }

    if (isLowerThanCurrent) {
      return (
        <button type="button" className="btn btn-outline-secondary w-100" disabled>
          Included in Your Plan
        </button>
      );
    }

    return <SubscriptionForm plan={planKey} />;
  };

  const orderedFeatures = useMemo(() => {
    return (features || [])
      .filter((feature) => feature.available !== 2)
      .sort((a, b) => {
        const order = { 1: 0, 3: 1, 4: 2, 0: 3 };
        return order[a.available] - order[b.available];
      });
  }, [features]);

  return (
    <article
      className={`subscription-card ${isThisUserPlan ? "subscription-card--current" : ""}`}
      style={{ "--card-accent": currentMeta.accent }}
    >
      <div className="subscription-card__badges">
        {discountPercent && discountPercent > 0 && (
          <span className="subscription-card__badge subscription-card__badge--discount">
            {discountPercent}% off
          </span>
        )}
        {isPopular && (
          <span className="subscription-card__badge subscription-card__badge--popular">
            Most Popular
          </span>
        )}
        {isThisUserPlan && (
          <span className="subscription-card__badge subscription-card__badge--current">
            Your Current Plan
          </span>
        )}
      </div>

      <div className="subscription-card__top-row">
        <div className="subscription-card__title-area">
          <h2 className="subscription-card__title" style={{ color: currentMeta.titleColor }}>
            {title}
          </h2>
          <div className="subscription-card__plan-tags">
            <span
              className="subscription-card__plan-tag"
              style={{ background: currentMeta.accentSoft, color: currentMeta.titleColor }}
            >
              {currentMeta.segmentLabel}
            </span>
            {currentMeta.userCount && (
              <span className="subscription-card__plan-tag">{currentMeta.userCount}</span>
            )}
          </div>
        </div>

        <div className="subscription-card__icon-wrap" aria-hidden="true">
          <img src={currentMeta.iconSrc} alt={currentMeta.iconAlt} />
        </div>
      </div>

      <p className="subscription-card__subtitle">{subtitle}</p>

      <div className="subscription-card__price-box">
        {fakePrice && fakePrice > price && (
          <div className="subscription-card__old-price">
            {fakePrice.toLocaleString("en-US", {
              style: "currency",
              currency: currency || "INR",
            })}
          </div>
        )}

        <div className="subscription-card__price-row">
          <div className="subscription-card__price">
            {typeof price === "number"
              ? price.toLocaleString("en-US", {
                  style: "currency",
                  currency: currency || "INR",
                })
              : "N/A"}
          </div>
          <div className="subscription-card__cycle">/{isYear ? "year" : "month"}</div>
        </div>
      </div>

      <ul className="subscription-card__feature-list">
        {orderedFeatures.map((feature, index) => {
          const tooltipId = `tip-${planKey}-${index}`;
          const featureText = normalizeFeatureLabel(feature.plan);
          const tooltipProps = {
            "data-tooltip-id": tooltipId,
            "data-tooltip-html": feature.description || "",
          };

          if (feature.available === 1) {
            return (
              <li key={index} className="subscription-card__feature-item">
                <PiCheckCircleFill
                  className="subscription-card__feature-icon"
                  color="#15803d"
                />
                <span className="subscription-card__feature-text" {...tooltipProps}>
                  {featureText}
                </span>
                <Tooltip id={tooltipId} className="custom-tooltip" place="top" html />
              </li>
            );
          }

          if (feature.available === 3) {
            return (
              <li
                key={index}
                className="subscription-card__feature-item subscription-card__feature-item--featured"
              >
                <IoDiamond className="subscription-card__feature-icon" color={currentMeta.accent} />
                <span className="subscription-card__feature-text" {...tooltipProps}>
                  {featureText}
                </span>
                <Tooltip id={tooltipId} className="custom-tooltip" place="top" html />
                <span className="subscription-card__feature-pill">Featured</span>
              </li>
            );
          }

          if (feature.available === 4) {
            return (
              <li key={index} className="subscription-card__feature-item">
                <PiCheckCircleFill
                  className="subscription-card__feature-icon"
                  color="#0f766e"
                />
                <span className="subscription-card__feature-text" {...tooltipProps}>
                  {featureText}
                </span>
                <Tooltip id={tooltipId} className="custom-tooltip" place="top" html />
                <span className="subscription-card__feature-pill subscription-card__feature-pill--new">
                  New
                </span>
              </li>
            );
          }

          return (
            <li
              key={index}
              className="subscription-card__feature-item subscription-card__feature-item--muted"
            >
              <PiXCircleFill className="subscription-card__feature-icon" color="#94a3b8" />
              <span className="subscription-card__feature-text" {...tooltipProps}>
                {featureText}
              </span>
              <Tooltip id={tooltipId} className="custom-tooltip" place="top" html />
            </li>
          );
        })}
      </ul>

      <div className="subscription-card__action">{renderActionButton()}</div>
    </article>
  );
}
