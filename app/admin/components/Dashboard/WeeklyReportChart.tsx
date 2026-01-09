"use client";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement } from "chart.js";
import { useEffect, useState } from "react";
import axios from "axios";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

const LineChartAdmin = () => {
  const [days, setDays] = useState<string[]>([]);
  const [views, setViews] = useState<number[]>([]);

  const chartApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/dashboard/weekly-views`
      );
      const dayLabels = res.data.map((item: { post_date: string }) => item.post_date); 
      const viewCounts = res.data.map((item: { total_pageviews: number }) => item.total_pageviews);

      setDays(dayLabels);
      setViews(viewCounts);
    } catch (err) {
      console.error(err);
    }
  };

  const data = {
    labels: days, // Monday to Friday
    datasets: [
      {
        label: "Page Views",
        data: views, // Corresponding views for the days
        borderColor: "#42A5F5", // Blue line
        backgroundColor: "rgba(66, 165, 245, 0.2)", // Light blue fill
        fill: true,
        tension: 0.4, // Smooth curve
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,

        },
      },
      y: {
        title: {
          display: true,
          text: "Views",
        },
        beginAtZero: true,
      },
    },
  };

  useEffect(() => {
    chartApi();
  }, []);

  return (
    <div className="card shadow border-0 p-1" style={{ height: "100%" }}>
      <h6>Articles Views Overview (Past 30 Days)</h6>
      <div
        className="chart-container mt-2"
        style={{ position: "relative", width: "100%", aspectRatio: "2/1" }}
      >
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default LineChartAdmin;
