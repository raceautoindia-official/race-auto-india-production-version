"use client";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useEffect, useState } from "react";
import axios from "axios";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChartAdmin = () => {
  const [userName, setUserName] = useState([]);
  const [count, setCount] = useState([]);
  const colors = [
    "#FFDB33", // Yellow
    "#FF00FF", // Light cyan
    "#8E33FF", // Purple
    "#FF8333", // Coral orange
    "#33FF99", // Mint green
    "#FF3333", 
    "#FF5733", // Vibrant orange-red
    "#33FF57", // Bright green
    "#3357FF", // Bright blue
    "#FF33A1", // Bright red
  ];


  const chartapi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/dashboard/pie-chart`
      );
      const username = res.data.userPostCountv2.map(
        (item: { username: string }) => item.username
      );
      const count = res.data.userPostCountv2.map(
        (item: { post_count: number }) => item.post_count
      );

      setUserName(username);
      setCount(count);
    } catch (err) {
      console.log(err);
    }
  };
  const data = {
    labels: userName,
    datasets: [
      {
        data: count,
        backgroundColor: colors.slice(0, userName.length),
        borderWidth: 1,
      },
    ],
  };

  useEffect(() => {
    chartapi();
  }, []);
  return (
    <div className="card shadow border-0 p-1" style={{ height: "100%" }}>
      <div
        className="chart-container mt-2"
        style={{ position: "relative", width: "100%", aspectRatio: "1/1" }}
      >
        <Pie data={data} />
      </div>
      <p className="mt-4 ms-2">Stats as per current month*</p>
    </div>
  );
};

export default PieChartAdmin;
