"use client";

import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Register required chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const DonutChart_V2 = () => {
  const [marketLabel, setMarketLabel] = useState<string[]>([]);
  const [marketids, setMarketids] = useState<number[]>([]);
  const [marketValue, setMarketValue] = useState<number[]>([]);
  const [loading, setLoading] = useState(true); // Loading state

  const staticData = [220000, 40000, 65000, 105000, 80000, 45000];

  const fetchMarketData = async () => {
    setLoading(true); // Start loading
    try {
      // First API call
      const marketRes = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/market`
      );
      const filteredName = marketRes.data.map((item: any) => item.title);
      const filteredId = marketRes.data.map((item: any) => item.id);

      setMarketLabel(filteredName);
      setMarketids(filteredId);

      // Second API call using IDs from the first response
      const subscriberRes = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscribers/market?ids=${filteredId}`
      );
      const values = subscriberRes.data.map((item: any) => item.count);
      setMarketValue(values);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); // End loading
    }
  };

  const data = {
    labels: marketLabel,
    datasets: [
      {
        data: staticData.slice(0, marketLabel.length),
        backgroundColor: [
          "rgba(0, 56, 99, 1)", // Domestic - Dark Blue
          "rgba(246, 121, 39, 1)", // UK Market - Orange
          "rgba(130, 32, 130, 1)", // AUS-NZ Market - Purple
          "rgba(53, 182, 163, 1)", // Asia Market - Teal
          "rgba(218, 230, 100, 1)", // Europe - Yellow-Green
        ],
        borderWidth: 2, // Creates the white space
        borderColor: "#ffffff",
        hoverOffset: 8, // Creates hover spacing
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: "50%", // Inner radius for the donut
    plugins: {
      tooltip: {
        enabled: true,
      },
    },
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  return (
    <div style={{ width: "100%", margin: "0 auto", position: "relative" }}>
      <h3 className="text-center">Region</h3>
      <div style={{ position: "relative" }}>
        {loading ? (
          // Circular skeleton while loading
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Skeleton
              circle
              height={250}
              width={250}
              style={{ margin: "0 auto" }}
            />
          </div>
        ) : (
          <Doughnut data={data} options={options} />
        )}
      </div>
    </div>
  );
};

export default DonutChart_V2;
