"use client";

import { useEffect, useState } from "react";
import DateFilter from "../../component/DateFilter";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

export default function UserAnalysisPage() {
  const [data, setData] = useState([]);

  /*
  --------------------------------
  FETCH DATA
  --------------------------------
  */
  const fetchData = (query) => {
    fetch(
      `https://horaservices.com:3000/api/analytics/visits/unique/range?${query}`
    )
      .then(res => res.json())
      .then(res => setData(res.data || []))
      .catch(err => console.error("Fetch error:", err));
  };

  useEffect(() => {
    fetchData("days=7");
  }, []);

  /*
  --------------------------------
  BROWSER DATA
  --------------------------------
  */
  const browserSet = new Set();

  data.forEach(day => {
    day.browsers?.forEach(browser => browserSet.add(browser));
  });

  const browsers = Array.from(browserSet);

  const browserDatasets = browsers.map(browser => ({
    label: browser,
    data: data.map(day =>
      day.browsers?.filter(b => b === browser).length || 0
    ),
    tension: 0.4
  }));

  /*
  --------------------------------
  LINE CHART (USERS)
  --------------------------------
  */
  const labels = data.map(d =>
    new Date(d.date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short"
    })
  );

  const chartData = {
    labels,
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

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        mode: "index",
        intersect: false
      }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  /*
  --------------------------------
  PAGE ANALYTICS (FIXED)
  --------------------------------
  */
  const pageCounts = {};

  data.forEach(day => {
    const allPages = (day.pages || []).flat(Infinity);

    allPages.forEach(page => {
      if (!page || typeof page !== "string") return;

      const cleanPage = page.trim();
      if (!cleanPage) return;

      pageCounts[cleanPage] =
        (pageCounts[cleanPage] || 0) + 1;
    });
  });

  const sortedPages = Object.entries(pageCounts).sort(
    (a, b) => b[1] - a[1]
  );

  /*
  --------------------------------
  BAR CHART (TOP PAGES)
  --------------------------------
  */
  const topPages = sortedPages.slice(0, 5);

  // const pageChartData = {
  //   labels: topPages.map(([page]) =>
  //     page.split("/").pop() || "home"
  //   ),
  //   datasets: [
  //     {
  //       label: "Page Views",
  //       data: topPages.map(([, count]) => count),
  //       borderWidth: 2
  //     }
  //   ]
  // };

  /*
  --------------------------------
  🔥 PAGE TREND LINE CHART
  --------------------------------
  */
  const pageTrendDatasets = topPages.map(([page]) => ({
    label: page.split("/").pop() || "home",
    data: data.map(day => {
      const allPages = (day.pages || []).flat(Infinity);
      return allPages.filter(p => p === page).length;
    }),
    tension: 0.4
  }));

  const pageTrendChartData = {
    labels,
    datasets: pageTrendDatasets
  };

  /*
  --------------------------------
  SUMMARY
  --------------------------------
  */
  const totalUsers = data.reduce((sum, d) => sum + d.users, 0);

  const maxUsers =
    data.length > 0 ? Math.max(...data.map(d => d.users)) : 0;

  /*
  --------------------------------
  UI
  --------------------------------
  */
  return (
    <div style={{ maxWidth: "82%", margin: "10px auto" }}>
      <h2>User Analytics</h2>

      <DateFilter onApply={fetchData} />

      {/* USERS LINE CHART */}
      <div style={{ background: "#fff", padding: 20 }}>
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* 🔥 PAGE TREND LINE CHART */}
      <div style={{ background: "#fff", padding: 20, marginTop: 20 }}>
        <h3>Top Pages Trend</h3>
        <Line data={pageTrendChartData} options={chartOptions} />
      </div>

      {/* PAGE BAR CHART */}
      <div style={{ background: "#fff", padding: 20, marginTop: 20 }}>
        {/* <h3>Top Pages</h3> */}
        {/* <Bar data={pageChartData} /> */}

        {/* LIST */}
        <div style={{ marginTop: 20 }}>
          <h4>All Pages</h4>

          <ul style={{ display: "flex", flexDirection: "column" }}>
            {sortedPages.map(([page, count], index) => (
              <li
                key={page}
                style={{
                  marginBottom: 10,
                  display: "flex",
                  gap: 10
                }}
              >
                <strong>#{index + 1}</strong>
                <div>{page}</div>
                👁️ {count} views
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* SUMMARY */}
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