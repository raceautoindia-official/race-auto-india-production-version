/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import { useSelectedLayoutSegment } from "next/navigation";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);


const MyBarChart = () => {
  const [value, setValue] = useState({});
  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const chartValue = [];
  const optionSelect = [];
  for (let year = currentYear; year >= currentYear - 3; year--) {
    optionSelect.push(
      <option key={year} value={year}>
        {year}
      </option>
    );
  }

  const chartapi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/dashboard/bar-chart/${selectedYear}`
      );
      setValue(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const labels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const datasets = chartValue;
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Articles Reports",
        data: datasets,
        barPercentage: 1,
        barThickness: 20,
        backgroundColor: ["rgb(1,112,192)"],
        borderColor: ["rgb(1,112,192)"],
        borderWidth: 0.5,

        borderRadius: {
          topLeft: 8,
          topRight: 8,
        },
      },
      // insert similar in dataset object for making multi bar chart
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: true,

    scales: {
      y: {
        display: true,
        beginAtZero: true,
      },
      x: {
        display: true,
      },
    },
  };

  useEffect(() => {
    chartapi();
  }, [selectedYear]);

  Object.keys(value).forEach((key) => {
    const propertyValue = value[key];

    chartValue.push(propertyValue);
  });

  return (
    <div className="card shadow border-0 p-1">
      <select
        className="form-select border-0"
        aria-label="Default select example"
        value={selectedYear}
        onChange={handleYearChange}
        style={{ width: 100 }}
      >
        {optionSelect}
      </select>

      <div
        className="chart-container"
        style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}
      >
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default MyBarChart;
