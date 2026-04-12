import React from "react";
import PricingCarousel from "./PriceCarosel";
import Image from "next/image";
import RefreshOnVerified from "@/app/Verifies";
import "./pricingShowcase.css";

const SubscriptionPage = () => {
  return (
    <>
      <RefreshOnVerified />

      <div className="container">
        <PricingCarousel />

        <section className="subscription-map-section">
          <h2 className="subscription-map-section__title">Trusted by subscribers across regions</h2>
          <p className="subscription-map-section__subtitle">
            Our subscriber base continues to grow worldwide with access across individual and business memberships.
          </p>
          <div className="subscription-map-section__media">
            <Image
              src="/images/subscribers map.gif"
              alt="Subscriber coverage map"
              fill
              unoptimized
            />
          </div>
        </section>
      </div>
    </>
  );
};

export default SubscriptionPage;
