"use client";

import { useState } from "react";

export default function DateFilter({ onApply }) {
  const [mode, setMode] = useState("days"); // days | single | range
  const [days, setDays] = useState(7);
  const [date, setDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const applyFilter = () => {
    let query = "";

    if (mode === "days") {
      query = `days=${days}`;
    }

    if (mode === "single" && date) {
      query = `date=${date}`;
    }

    if (mode === "range" && startDate && endDate) {
      query = `startDate=${startDate}&endDate=${endDate}`;
    }

    onApply(query);
  };

  return (
    <div style={{ marginBottom: 10 }}>
        <h4>Date Filter</h4>

      <div style={{ backgroundColor: "#fff" , padding: "10px 10px"}}>
    
      {/* Mode selector */}
      <select value={mode} onChange={e => setMode(e.target.value)}>
        <option value="days">Last N Days</option>
        <option value="single">Specific Date</option>
        <option value="range">Date Range</option>
      </select>
      {/* Last N days */}
      {mode === "days" && (
        <input
          type="number"
          min="1"
          value={days}
          onChange={e => setDays(e.target.value)}
          style={{ marginLeft: 10 }}
        />
      )}

      {/* Single date */}
      {mode === "single" && (
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ marginLeft: 10 }}
        />
      )}

      {/* Date range */}
      {mode === "range" && (
        <>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            style={{ marginLeft: 10 }}
          />
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            style={{ marginLeft: 10 }}
          />
        </>
      )}

      <button onClick={applyFilter} style={{ 
        background: "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)",
    border: "none",
    color: "white",
    padding: "0px 38px",
    fontSize: "9px",
    fontWeight: 600,
    borderRadius: "3px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    height: "22px",
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
    marginLeft: "20px",
 }}>
        Apply
      </button>
       </div>
    </div>
  );
}
