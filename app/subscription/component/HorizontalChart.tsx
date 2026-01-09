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

interface ValueObject {
  [key: string]: number;
}

const MyHorizontalBarChart = () => {
  const [mainCategory, setMainCategory] = useState<any>([]);
  const [chartLabels, setChartLabels] = useState([]);
  const [subCategoryValues, setSubCategoryValues] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState(3);
  const [loading, setLoading] = useState(false); // Loading state

  const mainCategoryApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/main-category`
      );
      setMainCategory(res.data);
      setSelectedMainCategory(res.data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const subCategoryApi = async () => {
    setLoading(true); // Start loading
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/sub-category/parent/${selectedMainCategory}`
      );
      const labels = res.data.map((item: any) => item.name);
      setChartLabels(labels);

      const subIds = res.data.map((item: any) => item.id);
      const subscriberRes = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscribers/sub-category?ids=${subIds}`
      );
      const values = subscriberRes.data.map((item: any) => item.count);
      setSubCategoryValues(values);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleMainCategoryChange = (event: any) => {
    setSelectedMainCategory(event.target.value);
  };

  const data = {
    labels: chartLabels,
    datasets: [
      {
        axis: "y",
        data: subCategoryValues,
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
    },
    scales: {
      x: {
        stacked: true,
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

  useEffect(() => {
    subCategoryApi();
  }, [selectedMainCategory]);

  return (
    <div className=" border-0 p-1">
      <select
        className="form-select border-0"
        aria-label="Default select example"
        onChange={handleMainCategoryChange}
        style={{ width: 150 }}
      >
        {mainCategory.map((item: any) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

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

export default MyHorizontalBarChart;
