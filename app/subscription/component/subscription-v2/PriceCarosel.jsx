'use client';
import React, { useEffect, useState } from "react";
import axios from "axios";
import PricingCard from "./SubscriptionCard";
import { BiDiamond, BiShield } from "react-icons/bi";
import { PiStarFill } from "react-icons/pi";
import { FaMedal } from "react-icons/fa";

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
  const multiplied = planData.find((r) => String(r.plan).toLowerCase() === "multiplied_price") || {};
  const usdValueArray = planData.filter((item) => String(item.plan).toLowerCase() === "usd");
  const usdValue = usdValueArray[0]?.platinum || 1;

  const makePlan = (tier, priceSource = isYear ? annual : monthly) => {
    const basePrice = priceSource[tier] ?? 0;

    const convertedPrice =
      currency === "USD"
        ? Math.round((basePrice / usdValue) * 100) / 100
        : basePrice;

    const isBusinessCategory = tier === "gold" || tier === "platinum";
    const isCategoryDisabled =
      categoryView === "individual" ? isBusinessCategory : !isBusinessCategory;

    return {
      key: tier,
      title: tier.charAt(0).toUpperCase() + tier.slice(1),
      subtitle:
        tier === "bronze"
          ? "For Individual Professionals"
          : tier === "silver"
          ? "For Growing Businesses"
          : tier === "gold"
          ? "For Expanding Enterprises"
          : "For Large Corporations",
      price: convertedPrice,
      multipliedPrice: multiplied[tier] ?? 1,
      features: features.map((f) => ({
        plan: f.plan,
        available: f[tier],
        description: f.description || "",
      })),
      isCategoryDisabled,
      categoryView,
    };
  };

  const plans = [
    {
      ...makePlan("bronze"),
      color: "#f6ede3",
      icon: <FaMedal />,
      currency,
      isYear,
    },
    {
      ...makePlan("silver"),
      color: "#f4f4f4",
      icon: <BiShield />,
      currency,
      isYear,
    },
    {
      ...makePlan("gold"),
      color: "#e7e7e7",
      icon: <PiStarFill />,
      currency,
      isYear,
    },
    {
      ...makePlan("platinum"),
      color: "#d9d9d9",
      icon: <BiDiamond />,
      isPopular: true,
      currency,
      isYear,
    },
  ];

  const categoryTitle =
    categoryView === "individual"
      ? "Individual Category"
      : "Business / Enterprise Category";

  const categoryDescription =
    categoryView === "individual"
      ? "Bronze and Silver plans are active. Gold and Platinum stay visible in disabled view."
      : "Gold and Platinum plans are active. Bronze and Silver stay visible in disabled view.";

  return (
    <div style={{ padding: "0 16px 32px" }}>
      <div
        className="d-flex justify-content-center align-items-center flex-wrap gap-3 mt-3 pt-3"
        style={{ textAlign: "center" }}
      >
        <h5 className="mb-0 me-3">Grow better with the right plan</h5>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="btn-group rounded-pill shadow-sm me-2">
            <button
              type="button"
              style={{ borderRadius: "50px", padding: "0.5rem 1.2rem" }}
              className={`btn ${currency === "INR" ? "btn-dark active" : "btn-light"}`}
              onClick={() => setCurrency("INR")}
            >
              INR
            </button>
            <button
              type="button"
              style={{ borderRadius: "50px", padding: "0.5rem 1.2rem" }}
              className={`btn ${currency === "USD" ? "btn-dark active" : "btn-light"}`}
              onClick={() => setCurrency("USD")}
            >
              USD
            </button>
          </div>

          <div className="btn-group rounded-pill shadow-sm me-2">
            <button
              type="button"
              style={{ borderRadius: "50px", padding: "0.5rem 1.2rem" }}
              className={`btn ${!isYear ? "btn-dark active" : "btn-light"}`}
              onClick={() => setIsYear(false)}
            >
              Month
            </button>
            <button
              type="button"
              style={{ borderRadius: "50px", padding: "0.5rem 1.2rem" }}
              className={`btn ${isYear ? "btn-dark active" : "btn-light"}`}
              onClick={() => setIsYear(true)}
            >
              Yearly
            </button>
          </div>

          <div className="btn-group rounded-pill shadow-sm">
            <button
              type="button"
              style={{ borderRadius: "50px", padding: "0.5rem 1.2rem" }}
              className={`btn ${categoryView === "individual" ? "btn-dark active" : "btn-light"}`}
              onClick={() => setCategoryView("individual")}
            >
              Individuals
            </button>
            <button
              type="button"
              style={{ borderRadius: "50px", padding: "0.5rem 1.2rem" }}
              className={`btn ${categoryView === "business" ? "btn-dark active" : "btn-light"}`}
              onClick={() => setCategoryView("business")}
            >
              Business
            </button>
          </div>
        </div>
      </div>

      {/* <div style={{ textAlign: "center", marginTop: "20px", marginBottom: "10px" }}>
        <h6 style={{ fontWeight: 700, marginBottom: "6px" }}>{categoryTitle}</h6>
        <p style={{ color: "#6b7280", fontSize: "0.92rem", marginBottom: 0 }}>
          {categoryDescription}
        </p>
      </div> */}

      <div
        style={{
          maxWidth: "1480px",
          margin: "24px auto 0",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          alignItems: "stretch",
        }}
      >
        {plans.map((p, i) => (
          <div key={p.key || i} style={{ minWidth: 0 }}>
            <PricingCard {...p} />
          </div>
        ))}
      </div>
    </div>
  );
}