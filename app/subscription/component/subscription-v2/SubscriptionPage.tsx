import React from "react";
import PricingCarousel from "./PriceCarosel";
import Image from "next/image";
import RefreshOnVerified from "@/app/Verifies";

const SubscriptionPage = () => {
  return (
    <>
      <RefreshOnVerified />

      <div className="container">
        <PricingCarousel />
        <div className="row">
          <div className="col-12">
            <h2 className="text-center my-3 text-primary">
              We’re reaching subscribers worldwide!
            </h2>
            <div className="d-flex justify-content-center">
              <div
                style={{
                  position: "relative",
                  width: "60%",
                  aspectRatio: "16/9",
                }}
              >
                <Image
                  src="/images/subscribers map.gif"
                  alt="subscriber map"
                  fill
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubscriptionPage;
