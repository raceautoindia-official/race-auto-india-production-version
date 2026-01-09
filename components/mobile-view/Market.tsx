import React from "react";
// import HomeMarketCard from "./HomeMarketCard";
import db from "@/lib/db";
import "@/components/Home-Market/home-market.css";
import HomeMarketCard from "./HomeMarketCard";

const HomeMarket = async () => {
  const [marketList]: any = await db.execute("SELECT * FROM post_market");

  return (
    <>
    <div className="container-fluid">
      <div className="row mt-1 mb-1">
        <h2 className="text-center" style={{ fontWeight: 700 }}>
          Market
        </h2>
        {marketList
          .map((item: any) => (
            <HomeMarketCard key={item.id} category={item.title_slug} />
          ))
          .slice(0, 4)}
      </div>
      </div>
    </>
  );
};

export default HomeMarket;
