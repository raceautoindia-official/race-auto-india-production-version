"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { formatDate } from "@/components/Time";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
);

interface ViewRow {
  view_date: string;
  page_type: string;
  view_count: number;
}

export default function PageViewsStackedBarChart() {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const fetchViews = async () => {
      const res = await fetch("/api/admin/page-views");
      const data: ViewRow[] = await res.json();
  
      const datesSet = new Set<string>();
      const pageTypes = new Set<string>();
      const viewsMap: { [key: string]: { [date: string]: number } } = {};
  
      data.forEach(({ view_date, page_type, view_count }) => {
        const formattedDate = formatDate(view_date); // Apply your formatter here
        datesSet.add(formattedDate);
        pageTypes.add(page_type);
  
        if (!viewsMap[page_type]) viewsMap[page_type] = {};
        viewsMap[page_type][formattedDate] = view_count;
      });
  
      const dates = Array.from(datesSet).sort();
  
      const datasets = Array.from(pageTypes).map((type, index) => ({
        label: type,
        data: dates.map((d) => viewsMap[type]?.[d] || 0),
        backgroundColor: getColor(index),
        stack: "views",
      }));
  
      const totalViews = dates.map((d) =>
        Array.from(pageTypes).reduce((sum, type) => sum + (viewsMap[type]?.[d] || 0), 0)
      );
  
      datasets.push({
        label: "Total Views",
        data: totalViews,
        backgroundColor: "rgba(17, 24, 39, 0.5)",
        stack: "total",
      });
  
      setChartData({
        labels: dates,
        datasets,
      });
    };
  
    fetchViews();
  }, []);
  
  const getColor = (i: number, alpha = 1) => {
    const colors = [
      `rgba(59, 130, 246, ${alpha})`,   // Blue
      `rgba(16, 185, 129, ${alpha})`,   // Green
      `rgba(249, 115, 22, ${alpha})`,   // Orange
      `rgba(236, 72, 153, ${alpha})`,   // Pink
    ];
    return colors[i % colors.length];
  };

  if (!chartData) return <p>Loading...</p>;

  return (
    <div className="card shadow border-0 p-1" style={{ height: "100%" }}>
      <h6 className="mt-3">Site Views Overview (Past 30 Days)</h6>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              labels: {
                color: "#4B5563",
              },
            },
            tooltip: {
              mode: "index",
              intersect: false,
            },
          },
          interaction: {
            mode: "nearest",
            intersect: false,
          },
          scales: {
            x: {
              stacked: true,
              ticks: {
                color: "#6B7280",
                maxRotation: 90,
                minRotation: 45,
              },
              grid: {
                color: "rgba(209, 213, 219, 0.3)",
              },
            },
            y: {
              stacked: true,
              beginAtZero: true,
              ticks: {
                color: "#6B7280",
              },
              grid: {
                color: "rgba(209, 213, 219, 0.3)",
              },
            },
          },
        }}
      />
    </div>
  );
}
