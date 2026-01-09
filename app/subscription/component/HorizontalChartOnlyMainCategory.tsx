/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Ticks,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MainHorizontalChart = () => {
  const [mainCategory, setMainCategory] = useState<any>([]);
  const [chartLabels, setChartLabels] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state

  const staticData = [
    162000, 82000, 97000, 78000, 66000, 51000, 66000, 50000, 25000, 40000,
    30000, 60000, 43000, 23000, 51000, 34000,
  ];

  const mainCategoryApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/main-category`
      );
      const filtered = res.data
        .filter((item: any) => item.show_on_menu == 1)
        .map((item: any) => item.name);
      setChartLabels(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const data = {
    labels: chartLabels,
    datasets: [
      {
        axis: "y",
        data: staticData.slice(0, chartLabels.length),
        backgroundColor: ["rgba(106, 215, 84, 1)", "rgba(241, 243, 125, 1)"],
        borderColor: ["rgba(106, 215, 84, 1)", "rgba(241, 243, 125, 1)"],
        borderWidth: 1,
        borderRadius: 40, // Add rounded corners
      },
    ],
  };

  const options: any = {
    responsive: true,
    indexAxis: "y", // Horizontal bar chart

    plugins: {
      legend: {
        display: false, // Remove legend
      },
      //   tooltip: {
      //     enabled: false, // Disable tooltips
      //   },
    },
    // interaction: {
    //   mode: "nearest", // Default interaction mode
    //   intersect: true, // Disable tooltips even when hovering
    // },
    scales: {
      x: {
        stacked: true,
        // ticks: {
        //   display: false, // Disable the X-axis values
        // },
        grid: {
          display: false, // Remove grid lines
        },
      },
      y: {
        stacked: true,
        grid: {
          display: false, // Remove grid lines
        },
      },
    },
  };

  useEffect(() => {
    mainCategoryApi();
  }, []);

  return (
    <div className=" border-0 p-1">
      <div
        className="chart-container"
        style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}
      >
        {loading ? (
          <Skeleton
            height="100%"
            width="100%"
            style={{ aspectRatio: "16/9" }}
          />
        ) : (
          <Bar data={data} options={options} />
        )}
      </div>
    </div>
  );
};

export default MainHorizontalChart;
