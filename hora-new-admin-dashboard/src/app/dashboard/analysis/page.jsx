"use client";
import { useState } from "react";
import axios from "axios";
import getOrderType from "../../../utils/getOrderType";
import { ADMIN_ORDER_LIST, BASE_URL } from "../../../utils/apiconstant";

const CityOrdersSummary = () => {
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");

  const handleDropdownChange = (e) => {
    const key = parseInt(e.target.value);
    setSelectedKey(key);
  };

  // Fixed date formatting function to handle timezone properly
  const formatDateToLocal = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    // Get local date components to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to create date from YYYY-MM-DD string in local timezone
  const createLocalDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
  };

  const fetchOrders = async () => {
    setLoading(true);

    if (!selectedKey) {
      alert("Please select an order type first.");
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(BASE_URL + ADMIN_ORDER_LIST, {
        page: 1,
        per_page: 2000,
        status: 1,
        type: selectedKey,
        order_locality: "",
      });

      const orders = data.data?.order || [];
      setFilteredOrders(orders);
      setShowTable(true);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }

    setLoading(false);
  };

  const fillMissingDates = (dateWiseData) => {
    if (!startDate || !endDate) return dateWiseData;

    const result = [...dateWiseData];
    const dateMap = {};

    dateWiseData.forEach((item) => {
      dateMap[item.date] = true;
    });

    const start = createLocalDate(startDate);
    const end = createLocalDate(endDate);

    // Iterate through each day in the range
    for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
      const dateStr = formatDateToLocal(day);
      if (!dateMap[dateStr]) {
        result.push({
          date: dateStr,
          orderCount: 0,
          advanceAmount: 0,
          totalAmount: 0,
        });
      }
    }

    return result.sort((a, b) => a.date.localeCompare(b.date));
  };

  const getOrdersSummary = () => {
    let totalOrders = 0;
    let totalAdvance = 0;
    let totalOverallAmount = 0;

    const dateWiseSummary = {};

    // Filter orders based on date range
    const dateFilteredOrders = filteredOrders.filter(order => {
      if (order.status !== 1) return false;

      // Get the order date in local timezone
      const orderDate = new Date(order.createdAt);
      const orderDateLocal = formatDateToLocal(orderDate);

      if (startDate && endDate) {
        // Compare date strings directly (YYYY-MM-DD format)
        return orderDateLocal >= startDate && orderDateLocal <= endDate;
      } else if (startDate) {
        return orderDateLocal >= startDate;
      } else if (endDate) {
        return orderDateLocal <= endDate;
      }
      
      return true;
    });

    dateFilteredOrders.forEach((order) => {
      // Format the date consistently
      const orderDate = formatDateToLocal(order.createdAt);

      if (!dateWiseSummary[orderDate]) {
        dateWiseSummary[orderDate] = {
          orderCount: 0,
          advanceAmount: 0,
          totalAmount: 0,
        };
      }

      const advanceAmount = parseFloat(order.advance_amount || 0);
      const fullAmount = parseFloat(order.total_amount || 0);

      dateWiseSummary[orderDate].orderCount += 1;
      dateWiseSummary[orderDate].advanceAmount += advanceAmount;
      dateWiseSummary[orderDate].totalAmount += fullAmount;

      totalOrders += 1;
      totalAdvance += advanceAmount;
      totalOverallAmount += fullAmount;
    });

    const dateWiseData = Object.keys(dateWiseSummary)
      .sort()
      .map((date) => ({
        date,
        orderCount: dateWiseSummary[date].orderCount,
        advanceAmount: dateWiseSummary[date].advanceAmount,
        totalAmount: dateWiseSummary[date].totalAmount,
      }));

    return { dateWiseData, totalOrders, totalAdvance, totalOverallAmount };
  };

  const { dateWiseData: rawDateWiseData, totalOrders, totalAdvance, totalOverallAmount } = getOrdersSummary();
  const dateWiseData = fillMissingDates(rawDateWiseData);

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        textAlign: "center",
        background: "#fff",
        padding: "20px",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
        borderRadius: "10px",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: "32px",
          fontWeight: "bold",
          marginBottom: "20px",
          color: "#333",
          textShadow: "2px 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        Status Orders Summary
      </h2>

      <div className="flex space-x-4">
        <div className="w-full">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            className="p-2 border rounded-md w-full mb-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="w-full">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            className="p-2 border rounded-md w-full mb-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div
        style={{
          padding: "16px",
          borderRadius: "8px",
          maxWidth: "300px",
          margin: "0 auto",
          marginBottom: "20px",
        }}
      >
        <label style={{ display: "block", marginBottom: "8px" }}>Select Order Type:</label>
        <select
          onChange={handleDropdownChange}
          defaultValue=""
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        >
          <option value="" disabled>
            -- Select --
          </option>
          {[...Array(8)].map((_, i) => {
            const value = i + 1;
            return (
              <option key={value} value={value}>
                {getOrderType(value)}
              </option>
            );
          })}
        </select>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <button
          onClick={fetchOrders}
          style={{
            padding: "12px 24px",
            background: "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginBottom: "20px",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          Fetch Orders
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", fontSize: "18px", color: "#666" }}>Loading orders...</p>
      ) : showTable ? (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #ddd",
              borderRadius: "10px",
              boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
              backdropFilter: "blur(10px)",
              background: "rgba(255, 255, 255, 0.7)",
              marginBottom: "20px",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)",
                  color: "#fff",
                }}
              >
                <th style={{ padding: "12px", fontSize: "18px" }}>Date</th>
                <th style={{ padding: "12px", fontSize: "18px" }}>Order Count</th>
                <th style={{ padding: "12px", fontSize: "18px" }}>Advance Amount (₹)</th>
                <th style={{ padding: "12px", fontSize: "18px" }}>Total Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {dateWiseData.map(({ date, orderCount, advanceAmount, totalAmount }) => (
                <tr key={date}>
                  <td style={{ padding: "10px" }}>{date}</td>
                  <td style={{ padding: "10px" }}>{orderCount}</td>
                  <td style={{ padding: "10px" }}>{advanceAmount.toFixed(2)}</td>
                  <td style={{ padding: "10px" }}>{totalAmount.toFixed(2)}</td>
                </tr>
              ))}
              <tr style={{ fontWeight: "bold", background: "#f3f3f3" }}>
                <td style={{ padding: "10px" }}>Total</td>
                <td style={{ padding: "10px" }}>{totalOrders}</td>
                <td style={{ padding: "10px" }}>{totalAdvance.toFixed(2)}</td>
                <td style={{ padding: "10px" }}>{totalOverallAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

export default CityOrdersSummary;