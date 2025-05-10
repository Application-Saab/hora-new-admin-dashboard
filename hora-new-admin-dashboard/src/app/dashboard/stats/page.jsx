"use client";
import { useState } from "react";
import axios from "axios";
import getOrderType from "../../../utils/getOrderType";
import { ADMIN_ORDER_LIST, BASE_URL } from "../../../utils/apiconstant";

const CityOrdersSummary = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");

  // Define the four cities we want to track
  const targetCities = ["Delhi", "Mumbai", "Bangalore", "Hyderabad"];

  const handleDropdownChange = (e) => {
    const key = parseInt(e.target.value);
    setSelectedKey(key);
  };

  const fetchFilteredOrders = async () => {
    setLoading(true);
    
    if (!selectedKey) {
      alert("Please select an order type first.");
      setLoading(false);
      return;
    }
    
    try {
      const { data } = await axios.post(BASE_URL + ADMIN_ORDER_LIST, {
        page: 1,
        per_page: 5000,
        status: 1,
        type: selectedKey,
        order_locality: "", // We'll filter the cities in our code
        start_date: startDate || null,
        end_date: endDate || null,
      });

      setOrders(data.data?.order || []);
      setShowTable(true);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
    setLoading(false);
  };

  // Calculate city orders and totals
  const getCityOrdersSummary = () => {
    // Initialize summary for our target cities
    const citySummary = {};
    targetCities.forEach(city => {
      citySummary[city] = {
        orderCount: 0,
        totalAmount: 0
      };
    });
    
    let totalOrders = 0;
    let totalAmount = 0;

    orders.forEach((order) => {
      // Only process if order status is 1
      if (order.status !== 1) return;
      
      // Normalize city name
      let city = order?.order_locality?.trim() || "";
      if (city.toLowerCase() === "hyderbad") city = "Hyderabad";
      
      // Only process if it's one of our target cities
      if (!targetCities.includes(city)) return;
      
      citySummary[city].orderCount += 1;
      
      // Handle vendor_amount properly, converting empty strings to 0
      const vendorAmount = order?.vendor_amount ? parseFloat(order.vendor_amount) : 0;
      citySummary[city].totalAmount += vendorAmount;
      
      // Add to grand totals
      totalOrders += 1;
      totalAmount += vendorAmount;
    });

    return { citySummary, totalOrders, totalAmount };
  };

  const { citySummary, totalOrders, totalAmount } = getCityOrdersSummary();

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
        Status Orders By City
      </h2>
      <div className="flex space-x-4">
        <div className="w-full">
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700"
          >
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
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700"
          >
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
        <label style={{ display: "block", marginBottom: "8px" }}>
          Select Order Type:
        </label>
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

      <button
        onClick={fetchFilteredOrders}
        style={{
          padding: "12px 24px",
          background:
            "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "20px",
          fontWeight: "bold",
          fontSize: "16px",
        }}
      >
        Submit
      </button>
      
      {loading ? (
        <p style={{ textAlign: "center", fontSize: "18px", color: "#666" }}>
          Loading orders...
        </p>
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
                  background:
                    "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)",
                  color: "#fff",
                }}
              >
                <th style={{ padding: "12px", fontSize: "18px" }}>City</th>
                <th style={{ padding: "12px", fontSize: "18px", textAlign: "center" }}>
                  Total Orders
                </th>
                <th style={{ padding: "12px", fontSize: "18px", textAlign: "center" }}>
                  Vendor Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Show only our target cities in a consistent order */}
              {targetCities.map((city) => {
                const data = citySummary[city] || { orderCount: 0, totalAmount: 0 };
                return (
                  <tr
                    key={city}
                    style={{
                      backgroundColor: "#fff",
                      transition: "background 0.3s ease-in-out",
                      borderBottom: "1px solid #ddd",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f3f8ff")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#fff")
                    }
                  >
                    <td
                      style={{ padding: "12px", fontSize: "16px", color: "#444", fontWeight: "bold" }}
                    >
                      {city}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        fontSize: "16px",
                        textAlign: "center",
                        color: "#222",
                      }}
                    >
                      {data.orderCount}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        fontSize: "16px",
                        textAlign: "center",
                        color: "#222",
                      }}
                    >
                      ₹{data.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
              <tr
                style={{
                  backgroundColor: "#f8f4ff",
                  borderTop: "2px solid #97538c",
                  fontWeight: "bold",
                }}
              >
                <td
                  style={{
                    padding: "15px",
                    fontSize: "18px",
                    color: "#333",
                  }}
                >
                  Grand Total
                </td>
                <td
                  style={{
                    padding: "15px",
                    fontSize: "18px",
                    textAlign: "center",
                    color: "#333",
                  }}
                >
                  {totalOrders}
                </td>
                <td
                  style={{
                    padding: "15px",
                    fontSize: "18px",
                    textAlign: "center",
                    color: "#333",
                  }}
                >
                  ₹{totalAmount.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
          
        </div>
      ) : null}
    </div>
  );
};

export default CityOrdersSummary;