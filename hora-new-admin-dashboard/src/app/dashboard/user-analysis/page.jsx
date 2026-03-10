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
  Legend
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

  // Fetch analytics data
  const fetchData = (query) => {
    fetch(
      `https://horaservices.com:3000/api/analytics/visits/unique/range?${query}`
    )
      .then(res => res.json())
      .then(res => setData(res.data || []));
  };

  useEffect(() => {
    fetchData("days=7");
  }, []);

  /*
  --------------------------------
  GET UNIQUE BROWSERS
  --------------------------------
  */

  const browserSet = new Set();

  data.forEach(day => {
    day.browsers?.forEach(browser => browserSet.add(browser));
  });

  const browsers = Array.from(browserSet);

  /*
  --------------------------------
  CREATE BROWSER DATASETS
  --------------------------------
  */

  const browserDatasets = browsers.map(browser => ({
    label: browser,
    data: data.map(day =>
      day.browsers?.filter(b => b === browser).length || 0
    ),
    tension: 0.4
  }));

  /*
  --------------------------------
  MAIN CHART DATA
  --------------------------------
  */

  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: "Users",
        data: data.map(d => d.users),
        borderWidth: 3,
        tension: 0.4
      },
      ...browserDatasets
    ]
  };

  /*
  --------------------------------
  CHART OPTIONS
  --------------------------------
  */

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top"
      },
      tooltip: {
        mode: "index",
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  /*
  --------------------------------
  SUMMARY
  --------------------------------
  */

  const totalUsers = data.reduce((sum, d) => sum + d.users, 0);
  // const maxUsers =
  //   data.length > 0 ? Math.max(...data.map(d => d.users)) : 0;

  return (
    <div style={{ maxWidth: "82%", margin: "10px auto" }}>

      <h2>User Analytics</h2>

      <DateFilter onApply={fetchData} />

      <div style={{ background: "#fff", padding: 20 }}>
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Summary */}

      <div
        style={{
          background: "#fff",
          padding: 20,
          marginTop: 20
        }}
      >

        <h3>Summary</h3>

        <div style={{ display: "flex", gap: 30 }}>

          <div>
            <strong>Total Users:</strong>{" "}
            {totalUsers.toLocaleString()}
          </div>

          <div>
            <strong>Max Daily Users:</strong>{" "}
            {maxUsers.toLocaleString()}
          </div>

        </div>

      </div>

    </div>
  );
}