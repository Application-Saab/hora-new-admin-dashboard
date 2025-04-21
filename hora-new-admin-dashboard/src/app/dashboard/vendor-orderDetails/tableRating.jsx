import React, { useState } from "react";
import axios from "axios";
import "tailwindcss/tailwind.css";
import getOrderType from '../../../utils/getOrderType';

const AdminRatingsTable = () => {
  const [adminData, setAdminData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  
  const [selectedKey, setSelectedKey] = useState('');

  const handleDropdownChange = (e) => {
    const key = parseInt(e.target.value);
    console.log(key, "key");
    setSelectedKey(key);
  };

  const handleSubmit = async () => {
    console.log(selectedKey,"selectedkey");
    if (!selectedKey) {
      alert('Please select an order type first.');
      return;
    }
    console.log("handleSubmit started");
    setLoading(true);
    setAdminData([]);
  
    try {
      console.log("Fetching orders with date range from backend...");
      const ordersRes = await axios.post(
        "https://horaservices.com:3000/api/admin/adminOrderList",
        {
          page: 1,
          per_page: 5000,
          status: 1,
          type: selectedKey,
          order_locality: selectedCity || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined
        }
      );
  
      const orders = ordersRes.data.data?.order || [];
      console.log("Fetched orders:", orders);
  
      if (orders.length === 0) {
        console.log("No orders found. Stopping process.");
        setLoading(false);
        return;
      }
  
      const vendorOrdersMap = {};
      let vendorDetailsMap = {};
      orders.forEach(order => {
        console.log(`Processing order for vendor: ${order.toId}`);
        if (!order.toId) return;
        
        if (!vendorOrdersMap[order.toId]) {
          vendorOrdersMap[order.toId] = {
            _id: order.toId,
            "0-6": 0,
            "6-8": 0,
            "9-10": 0,
            "No-Rating": 0,
            totalOrders: 0,
            order_locality: order.order_locality || selectedCity || "Unknown",
          };
        }
        vendorOrdersMap[order.toId].totalOrders++;
  
        if (Array.isArray(order.userReviewRatingArray) && order.userReviewRatingArray.length > 0) {
          let validRatingFound = false;
  
          order.userReviewRatingArray.forEach(rating => {
            if (rating === "0-6") {
              vendorOrdersMap[order.toId]["0-6"]++;
              validRatingFound = true;
            } else if (rating === "6-8") {
              vendorOrdersMap[order.toId]["6-8"]++;
              validRatingFound = true;
            } else if (rating === "9-10") {
              vendorOrdersMap[order.toId]["9-10"]++;
              validRatingFound = true;
            }
          });
  
          if (!validRatingFound) vendorOrdersMap[order.toId]["No-Rating"]++;
        } else {
          vendorOrdersMap[order.toId]["No-Rating"]++;
        }
      });
  
      const vendorIds = Object.keys(vendorOrdersMap);
      console.log("Vendor IDs extracted:", vendorIds);
  
      if (vendorIds.length === 0) {
        console.log("No vendors found in orders.");
        setLoading(false);
        return;
      }
  
      console.log("Fetching all vendors at once...");
      let vendorNamesMap = {};
  
      try {
        const adminUserRes = await axios.post(
          "https://horaservices.com:3000/api/admin/admin_user_list",
          {
            page: 1,
            per_page: 2000,
            role: "supplier",
          }
        );
  
        const users = adminUserRes.data.data?.users || [];
        console.log("Fetched all supplier users:", users);
  
        // Create a map of vendorId -> vendor name
        vendorDetailsMap = users.reduce((acc, user) => {
          acc[user._id] = {
            name: user.name || "Unknown Vendor",
            phone: user.phone || "N/A",
          };
          return acc;
        }, {});
        // vendorNamesMap = users.reduce((acc, user) => {
        //   acc[user._id] = user.name || "Unknown Vendor",;
        //   return acc;
        // }, {});
  
        console.log("Mapped Vendor Names:", vendorNamesMap);
      } catch (error) {
        console.error("Error fetching vendor list:", error);
      }
  
      // After resolving all vendor names, map data to final structure
      const vendorData = vendorIds.map((vendorId) => ({
        ...vendorOrdersMap[vendorId],
        name: vendorDetailsMap[vendorId]?.name || "Unknown Vendor",
        phone: vendorDetailsMap[vendorId]?.phone || "N/A",
      }));
      
      // const vendorData = vendorIds.map((vendorId) => ({
      //   ...vendorOrdersMap[vendorId],
      //   name: vendorNamesMap[vendorId] || "Unknown Vendor",
      // }));
  
      console.log("Final Vendor Data:", vendorData);
  
      // Updating state
      setAdminData((prevData) => [...prevData, ...vendorData]);
  
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  
    console.log("handleSubmit completed");
    setLoading(false);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4 bg-white shadow-lg rounded-lg w-full">
      <h2 className="text-xl font-semibold mb-4 text-center">Vendor Ratings Table</h2>
      <div className="mb-4">
        <select className="p-2 border rounded-md w-full mb-2" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
          <option value="">All Cities</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Delhi">Delhi</option>
          <option value="Mumbai">Mumbai</option>
        </select>
        <div className="flex space-x-4">
          <div className="w-full">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 ml-1">Start Date</label>
            <input type="date" id="startDate" className="p-2 border rounded-md w-full mb-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="w-full">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 ml-1">End Date</label>
            <input type="date" id="endDate" className="p-2 border rounded-md w-full mb-2" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        
<div
  style={{
    padding: '16px',
    borderRadius: '8px',
    maxWidth: '300px',
    marginLeft: "170px",
    marginBottom: '10px',
  }}
>
  <label style={{ display: 'block', marginBottom: '8px', marginLeft: "70px" }}>Select Order Type:</label>
  <select
    onChange={handleDropdownChange}
    defaultValue=""
    style={{
      width: '100%',
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid #ccc'
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
        <button className="p-2 bg-blue-600 text-white rounded-md w-full hover:bg-blue-700" 
        style={{
          background:
            "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)",
        }}
        onClick={handleSubmit} disabled={loading}>
          {loading ? "Loading..." : "Submit"}
        </button>
      </div>
      <div className="overflow-y-auto max-h-96 border rounded-md custom-scrollbar">
        <table className="min-w-full border-collapse text-sm">
        <thead
            style={{
              background:
                "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)",
            }}
            className="bg-gray-100 sticky top-0 text-white"
          >
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2 w-32">Total Orders</th>
              <th className="border p-2 w-12">0-6</th>
              <th className="border p-2 w-12">6-8</th>
              <th className="border p-2 w-14">9-10</th>
              <th className="border p-2 w-28">No-Rating</th>
              <th className="border p-2">Order Locality</th>
            </tr>
          </thead>
          <tbody>
            {adminData.length > 0 ? (
              adminData.map(admin => (
                <tr key={admin._id} className="hover:bg-gray-50">
                  <td className="border p-2">{admin.name}</td>
                  <td className="border p-2">{admin.phone}</td>
                  <td className="border p-2">{admin.totalOrders}</td>
                  <td className="border p-2">{admin["0-6"]}</td>
                  <td className="border p-2">{admin["6-8"]}</td>
                  <td className="border p-2">{admin["9-10"]}</td>
                  <td className="border p-2">{admin["No-Rating"]}</td>
                  <td className="border p-2">{admin.order_locality}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-4">{loading ? "Loading data..." : "No data available"}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRatingsTable;