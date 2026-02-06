"use client";

import { useEffect, useState } from "react";
import DateFilter from "../../component/DateFilter";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function UserAnalysisPage() {
  const [data, setData] = useState([]);

  // 🔹 Fetch data from backend
  const fetchData = (query) => {
    fetch(
      `https://horaservices.com:3000/api/analytics/visits/unique/range?${query}`
    )
      .then(res => res.json())
      .then(res => setData(res.data || []));
  };

  useEffect(() => {
    fetchData("days=7"); // default
  }, []);

  // 🔹 Chart data
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: "Daily Unique Users",
        data: data.map(d => d.users),
        tension: 0.4,
      },
    ],
  };

  // 🔹 Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) =>
            `Users: ${context.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => value.toLocaleString(),
        },
      },
    },
  };

  // 🔹 Summary calculations (SAFE)
  const totalUsers = data.reduce((sum, d) => sum + d.users, 0);
  const maxUsers =
    data.length > 0 ? Math.max(...data.map(d => d.users)) : 0;

  return (
    <div style={{ maxWidth: "82%", margin: "10px auto" }}>
      <h2>User Analytics</h2>

      <DateFilter onApply={fetchData} />

      <div style={{ backgroundColor: "#fff" , padding: "10px 10px"}}>
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* 🔹 Summary Section */}
      <div style={{ backgroundColor: "#fff" , padding: "10px 10px" , marginTop:"10px"}}>
        <h3>Summary</h3>
        <div style={{ display: "flex", gap: 20 }}>
         
          <div>
            <strong>Total Users (range):</strong>{" "}
            {totalUsers.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
