"use client";
import React, { useState } from "react";
import axios from "axios";
import {BASE_URL, ADMIN_ORDER_LIST, ADMIN_USER_LIST} from "../../../utils/apiconstant";

const CheckVendorOrders = () => {
  const [number, setNumber] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [matchingOrders, setMatchingOrders] = useState([]);
  const [ratingFilter, setRatingFilter] = useState("");

  const fetchOrdersBySupplierId = async (supplierId) => {
    try {
      const response = await fetch(BASE_URL + ADMIN_ORDER_LIST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_date: "", order_id: "", order_locality: "", order_status: 0, page: 1, per_page: 4000, phone_no: "", status: 0, type: "" }),
      });
      const orderData = await response.json();
      const orders = orderData?.data?.order || [];
      const matchedOrders = orders.filter((order) => order.toId === supplierId);
      setMatchingOrders(matchedOrders.length > 0 ? matchedOrders : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleCheckCustomer = async (e) => {
    e.preventDefault();
    if (!number.trim()) return;
    setLoading(true);
    setResult(null);
    setMatchingOrders([]);
    try {
      const response = await axios.post(BASE_URL + ADMIN_USER_LIST, {
        email: "", page: "", per_page: 4000, phone: "", role: "supplier",
      });
      const users = response?.data?.data?.users || [];
      const supplier = users.find((user) => user.phone?.trim() === number.trim());
      if (supplier) {
        await fetchOrdersBySupplierId(supplier._id);
        setResult(`Number is present. Supplier ID: ${supplier._id}`);
      } else {
        setResult("Number not present.");
      }
    } catch (err) {
      console.error("Error checking the number:", err);
      setResult("Error checking the number.");
    } finally {
      setLoading(false);
    }
  };

  const getOrderId = (e) => {
    const orderId1 = 10800 + e;
    const updateOrderId = "#" + orderId1;
    return updateOrderId;
  };

  const totalBalanceAmount = matchingOrders.reduce((acc, order) => acc + (parseFloat(order.balance_amount) || 0), 0);

  const filteredOrders = matchingOrders.filter(order => {
    const rating = order.userReviewRatingArray?.[0] || ""; 
    if (ratingFilter === "9-10") return rating === "9-10";
    if (ratingFilter === "6-8") return rating === "6-8";
    if (ratingFilter === "0-6") return rating === "0-6";
    return true;
  });

  const ratingSummary = {
    "9-10": { count: 0, total: 0 },
    "6-8": { count: 0, total: 0 },
    "0-6": { count: 0, total: 0 }
  };
  
  filteredOrders.forEach(order => {
    const rawRating = order.userReviewRatingArray?.[0];
    const amount = Number(order.balance_amount) || 0; 
  
    if (!rawRating || !["9-10", "6-8", "0-6"].includes(rawRating)) {
      console.warn("Invalid rating found, skipping order:", order);
      return; // Ignore orders with invalid ratings
    }
  
    ratingSummary[rawRating].count++;
    ratingSummary[rawRating].total += amount;
  });

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", fontSize: "24px", fontWeight: "bold", textTransform: "uppercase" }}>List of Vendor Orders</h2>  
      <div style={{ display: "flex", alignItems: "center", width: "65px", marginLeft: "143px" }}>

  <input type="number" placeholder="Enter a number" value={number} onChange={(e) => setNumber(e.target.value)} style={{ flex: 1, padding: "12px", borderRadius: "5px", border: "1px solid #ccc", }}/>
  <button onClick={handleCheckCustomer} disabled={loading} style={{padding: "10px 20px", background: "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px", fontWeight: "bold", marginLeft: "10px", whiteSpace: "nowrap" }}>
    {loading ? "Checking..." : "Check"}
  </button>
</div>

      {/* show vendor _id */}
      {/* {result && (
        <p style={{ marginTop: "20px", padding: "10px", backgroundColor: result.includes("present") ? "#d4edda" : "#f8d7da", color: result.includes("present") ? "#155724" : "#721c24", borderRadius: "5px" }}>{result}</p>
      )} */}

        {matchingOrders.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)", color: "white", padding: "10px", borderRadius: "8px", fontSize: "18px", fontWeight: "bold", maxWidth: "900px", margin: "20px auto", boxShadow: "0 4px 8px rgba(0,0,0,0.1)", }}>
            <span>📦 Total Orders: {matchingOrders.length}</span>
            <span>💰 Total Orders Value: ₹{totalBalanceAmount.toFixed(2)}</span>
          </div>
          
        <div style={{ display: "flex", justifyContent: "center", padding: "20px", fontFamily: "Arial, sans-serif" }}>
          <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)", maxWidth: "1000px", width: "100%", textAlign: "center", }}>
            <h2 style={{ marginBottom: "20px", fontSize: "28px", fontWeight: "bold", color: "#333" }}>
              📊 Order Summary
            </h2>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)", color: "white", fontSize: "18px" }}>
                <th style={{ padding: "12px", border: "1px solid #ddd" }}>Rating</th>
                <th style={{ padding: "12px", border: "1px solid #ddd" }}>Order Count</th>
                <th style={{ padding: "12px", border: "1px solid #ddd" }}>Total Value (₹)</th>
              </tr>
            </thead>
                <tbody>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>⭐ 9-10 Rated Orders</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{ratingSummary["9-10"].count}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>₹{ratingSummary["9-10"].total}</td>
              </tr>
              <tr>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>🌟 6-8 Rated Orders</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{ratingSummary["6-8"].count}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>₹{ratingSummary["6-8"].total}</td>
              </tr>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>⚠️ 0-6 Rated Orders</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{ratingSummary["0-6"].count}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>₹{ratingSummary["0-6"].total}</td>
              </tr>
              </tbody>
            </table>
            </div>
          </div>

          <h3 style={{ textAlign: "center", fontSize: "18px", color: "#333" }}>Matching Orders</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px", fontSize: "14px", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)", color: "#fff" }}>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>Order ID</th>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>Fulfillment Date</th>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>Order Rating
                    <select onChange={(e) => setRatingFilter(e.target.value)} value={ratingFilter} style={{ marginLeft: "10px",  borderRadius: "5px", fontSize: "12px" }}>
                      <option value="">All</option>
                      <option value="9-10">9-10</option>
                      <option value="6-8">6-8</option>
                      <option value="0-6">0-6</option>
                    </select>
                </th>

                <th style={{ padding: "10px", border: "1px solid #ccc" }}>Order Create</th>
              </tr>
            </thead>
            <tbody>
            {filteredOrders.map((order, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff" }}>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>{getOrderId(order.order_id)}</td>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>{new Date(order.order_date).toLocaleDateString("en-GB")}</td>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>{order.userReviewRatingArray?.[0] || "N/A"}</td>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>{new Date(order.createdAt).toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CheckVendorOrders;

