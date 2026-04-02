'use client';
import React, { useState } from "react";

const tagMapping = {
  "65a91598ae1586258cccffd4": "Birthday",
  "65a92085ae1586258ccd04ff": "FirstNight",
  "65a92271ae1586258ccd0628": "Anniversary",
  "65aeaf5147d5cb78ba19d4d3": "KidsBirthday",
  "65a95dcb6995e7401e78c2ea": "BabyShower",
  "65a2d129513d9389d34e31d4": "WelcomeBaby",
  "65a92efbae1586258ccd0c6e": "PremiumDecoration",
  "65aeaf3747d5cb78ba19d4b6": "BallonBouquets",
  "66ad224731c3672040d8d32a": "Haldi-Mehandi",
  "66c44baf8bd9c45aaa2c42b5": "Bachelorette",
  "66c9df0922ed47b721180334": "Proposal-Decoration",
  "68590e84ac7f23b432086de9": "Wedding-Decoration"
};

export default function OrderReportDownloader() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
  if (!startDate || !endDate) {
    alert("Please select both start and end date");
    return;
  }
  setLoading(true);

  try {
    // ✅ Add +1 day to endDate so the full day is included
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
    const formattedEndDate = adjustedEndDate.toISOString().split("T")[0];

    // Step 1: Fetch all tag data
    const tagIds = Object.keys(tagMapping);
    const tagResponses = await Promise.all(
      tagIds.map(tag =>
        fetch(`http://localhost:5000/api/Decoration/searchByTag/${tag}`)
          .then(res => res.json())
      )
    );

    const allTagData = tagResponses.flatMap(res =>
      (res.data || []).map(item => ({
        _id: item._id,
        name: item.name || "",
        tag: tagMapping[item.tag?.[0]] || ""
      }))
    );

    // Step 2: Fetch admin order list
    const adminResponse = await fetch(`http://localhost:5000/api/admin/adminOrderList`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start_createdAt: startDate,
        end_createdAt: formattedEndDate, // ✅ fixed here
        type: 1,
        page: 1,
        per_page: 5000
      })
    });

    const adminData = await adminResponse.json();
    const orders = adminData.data?.order || [];

    // Step 3: Match items with tag data
    const matchedRows = [];
    orders.forEach(order => {
      order.items.forEach(itemId => {
        const match = allTagData.find(p => p._id === itemId);
        if (match) {
          matchedRows.push({
            order_id: order.order_id,
            createdAt: order.createdAt || "",
            order_locality: order.order_locality,
            item_id: match._id,
            tag: match.tag,
            name: match.name,
            status: order.status,
            total_amount: order.total_amount,
            phone_no: order.phone_no
          });
        }
      });
    });

    // Step 4: Create CSV
    let csvContent = "order_id,10800_id,createdAt,order_locality,item_id,tag,name,status,total_amount,customer_phone_number\n";
    matchedRows.forEach(row => {
      const updatedOrderId = Number(row.order_id) + 10800;
      const statusText = row.status === 1 ? "active" : "inactive";
      const date = row.createdAt ? new Date(row.createdAt) : null;
      const formattedDate = date
        ? `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getFullYear()).slice(2)}`
        : "";
      csvContent += `${row.order_id},${updatedOrderId},${formattedDate},${row.order_locality},${row.item_id},${row.tag},${row.name},${statusText},${row.total_amount},${row.phone_no}\n`;
    });

    // Step 5: Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "orders_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    console.error("Error generating report:", error);
    alert("Failed to generate report");
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{
      padding: "30px",
      maxWidth: "420px",
      margin: "50px auto",
      borderRadius: "12px",
      background: "#ffffff",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      fontFamily: "Arial, sans-serif"
    }}>
      <h3 style={{
        textAlign: "center",
        marginBottom: "20px",
        color: "#333"
      }}>📊 Decoration Order Report Downloader </h3>
      

      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "6px" }}>Created Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "14px"
          }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "6px" }}>Created End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "14px"
          }}
        />
      </div>

      <button
        onClick={handleDownload}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          background: loading ? "#ccc" : "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px"
        }}
      >
        {loading ? (
          <>
            <span style={{
              width: "18px",
              height: "18px",
              border: "3px solid #fff",
              borderTop: "3px solid transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }}></span>
            Generating...
          </>
        ) : "Download CSV"}
      </button>

      {/* Inline spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
