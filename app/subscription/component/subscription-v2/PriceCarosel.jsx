'use client'
import React, { useEffect, useState } from "react";
import axios from "axios";
import PricingCard from './SubscriptionCard'
import { BiDiamond, BiShield } from "react-icons/bi";
import { PiStarFill } from "react-icons/pi";

export default function PricingCarousel() {
    const [planData, setPlanData] = useState([]);
    const [currency, setCurrency] = useState("INR");
    const [isYear, setIsYear] = useState(false);

    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription`)
            .then(res => setPlanData(res.data))
            .catch(console.error);
    }, []);

    // split into features vs pricing
    const pricingKeys = ["monthly price", "annual price", "usd", "multiplied_price"];
    const features = planData.filter(r => !pricingKeys.includes(r.plan.toLowerCase()));
    const monthly = planData.find(r => r.plan.toLowerCase() === "monthly price") || {};
    const annual = planData.find(r => r.plan.toLowerCase() === "annual price") || {};
    const multiplied = planData.find(r => r.plan.toLowerCase() === "multiplied_price") || {};

    const usdValueArray = planData.filter((item) => item.plan === "usd");
    // Use a common conversion rate from the usdValueArray (for example, platinum rate conversion)
    const usdValue = usdValueArray[0]?.platinum || 1;

    const makePlan = (tier, priceSource = isYear ? annual : monthly) => {
        const basePrice = priceSource[tier];

        const convertedPrice = currency === "USD"
            ? Math.round((basePrice / usdValue) * 100) / 100
            : basePrice;

        return {
            title: tier.charAt(0).toUpperCase() + tier.slice(1),
            subtitle:
                tier === "silver" ? "For Growing Businesses" :
                    tier === "gold" ? "For Expanding Enterprises" :
                        "For Large Corporations",
            price: convertedPrice,
            multipliedPrice: multiplied[tier],  // include raw multiplied price
            features: features.map(f => ({
                plan: f.plan,
                available: f[tier],
                description: f.description || ""
            })),
        };
    };



    const plans = [
        { ...makePlan("silver"), color: "#f4f4f4", icon: <BiShield />, currency, isYear },
        { ...makePlan("gold"), color: "#e4e4e4", icon: <PiStarFill />, currency, isYear },
        { ...makePlan("platinum"), color: "#d3d3d3", icon: <BiDiamond />, isPopular: true, currency, isYear }
    ];


    return (
        <>
            <div className="d-flex justify-content-center align-items-center flex-wrap gap-3 mt-3 pt-3">
                {/* Left-side text */}
                <h5 className="mb-0 me-3">Grow better with the right plan</h5>

                {/* Right-side toggles (Currency + Duration) */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                    {/* Currency Toggle */}
                    <div className="btn-group rounded-pill shadow-sm me-2">
                        <button
                            type="button"
                            style={{ borderRadius: "50px", padding: "0.5rem 1.2rem", }}
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

                    {/* Duration Toggle */}
                    <div className="btn-group rounded-pill shadow-sm">
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
                </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
                {plans.map((p, i) => (
                    <PricingCard key={i} {...p} />
                ))}
            </div>
        </>
    );
}
