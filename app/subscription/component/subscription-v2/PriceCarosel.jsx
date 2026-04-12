'use client';
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import PricingCard from "./SubscriptionCard";
import "./pricingShowcase.css";

const PLAN_UI_TITLE = {
  bronze: "Individual Basic",
  silver: "Individual Pro",
  gold: "Business",
  platinum: "Business Pro",
};

export default function PricingCarousel() {
  const [planData, setPlanData] = useState([]);
  const [currency, setCurrency] = useState("INR");
  const [isYear, setIsYear] = useState(false);
  const [categoryView, setCategoryView] = useState("individual");

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription`)
      .then((res) => setPlanData(res.data))
      .catch(console.error);
  }, []);

  const pricingKeys = ["monthly price", "annual price", "usd", "multiplied_price"];
  const features = planData.filter((r) => !pricingKeys.includes(String(r.plan).toLowerCase()));
  const monthly = planData.find((r) => String(r.plan).toLowerCase() === "monthly price") || {};
  const annual = planData.find((r) => String(r.plan).toLowerCase() === "annual price") || {};
  const multiplied =
    planData.find((r) => String(r.plan).toLowerCase() === "multiplied_price") || {};
  const usdValueArray = planData.filter((item) => String(item.plan).toLowerCase() === "usd");
  const usdValue = usdValueArray[0]?.platinum || 1;

  const makePlan = (tier, priceSource = isYear ? annual : monthly) => {
    const basePrice = priceSource[tier] ?? 0;

    const convertedPrice =
      currency === "USD" ? Math.round((basePrice / usdValue) * 100) / 100 : basePrice;

    return {
      key: tier,
      planKey: tier,
      title: PLAN_UI_TITLE[tier] ?? tier,
      subtitle:
        tier === "bronze"
          ? "Built for individual professionals who need premium news access and a clean entry plan."
          : tier === "silver"
          ? "Designed for advanced individual users who need more tools and broader content access."
          : tier === "gold"
          ? "For growing teams that need shared business access for up to 5 users."
          : "For enterprise-ready teams that need broader business access for up to 10 users.",
      price: convertedPrice,
      multipliedPrice: multiplied[tier] ?? 1,
      features: features.map((f) => ({
        plan: f.plan,
        available: f[tier],
        description: f.description || "",
      })),
      currency,
      isYear,
      isPopular: tier === "platinum",
    };
  };

  const visiblePlanKeys =
    categoryView === "individual" ? ["bronze", "silver"] : ["gold", "platinum"];

  const plans = visiblePlanKeys.map((tier) => makePlan(tier));

  const categoryMeta = useMemo(
    () => ({
      individual: {
        eyebrow: "Individual Membership",

        description:
          "Choose between the two individual plans with a cleaner comparison focused on solo users and professionals.",
      },
      business: {
        eyebrow: "Business Membership",
 
        description:
          "Compare the two business plans built for team access, shared memberships, and enterprise-ready usage.",
      },
    }),
    []
  );

  const currentMeta = categoryMeta[categoryView];

  return (
    <section className="subscription-shell">
      <div className="subscription-shell__hero">
        <span className="subscription-shell__eyebrow">Subscription Plans</span>
        <h1 className="subscription-shell__title">Corporate pricing, simplified for every user type.</h1>
        <p className="subscription-shell__subtitle">
          Switch between individual and business views to see only the relevant plan cards. The pricing logic,
          backend flow, and checkout behavior remain unchanged.
        </p>

        <div className="subscription-control-panel">
          <div className="subscription-toggle-group" role="group" aria-label="Currency toggle">
            <button
              type="button"
              className={`subscription-toggle-group__button ${currency === "INR" ? "is-active" : ""}`}
              onClick={() => setCurrency("INR")}
            >
              INR
            </button>
            <button
              type="button"
              className={`subscription-toggle-group__button ${currency === "USD" ? "is-active" : ""}`}
              onClick={() => setCurrency("USD")}
            >
              USD
            </button>
          </div>

          <div className="subscription-toggle-group" role="group" aria-label="Billing cycle toggle">
            <button
              type="button"
              className={`subscription-toggle-group__button ${!isYear ? "is-active" : ""}`}
              onClick={() => setIsYear(false)}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`subscription-toggle-group__button ${isYear ? "is-active" : ""}`}
              onClick={() => setIsYear(true)}
            >
              Yearly
            </button>
          </div>

          <div
            className="subscription-toggle-group subscription-toggle-group--category"
            role="group"
            aria-label="Membership category toggle"
          >
            <button
              type="button"
              className={`subscription-toggle-group__button ${categoryView === "individual" ? "is-active" : ""}`}
              onClick={() => setCategoryView("individual")}
            >
              Individuals
            </button>
            <button
              type="button"
              className={`subscription-toggle-group__button ${categoryView === "business" ? "is-active" : ""}`}
              onClick={() => setCategoryView("business")}
            >
              Business
            </button>
          </div>
        </div>

        <div className="subscription-plan-summary">

          <p className="subscription-plan-summary__text">{currentMeta.description}</p>
        </div>
      </div>

      <div className="subscription-plan-grid">
        {plans.map((plan) => (
          <PricingCard key={plan.key} {...plan} categoryView={categoryView} />
        ))}
      </div>
    </section>
  );
}
