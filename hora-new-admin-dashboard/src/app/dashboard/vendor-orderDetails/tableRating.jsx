import React, { useState } from "react";
import axios from "axios";
import "tailwindcss/tailwind.css";
import getOrderType from '../../../utils/getOrderType';
import { ADMIN_ORDER_LIST, ADMIN_USER_LIST, BASE_URL } from "../../../utils/apiconstant";

const AdminRatingsTable = () => {
  const [adminData, setAdminData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  
  const [selectedKey, setSelectedKey] = useState('');

  const handleDropdownChange = (e) => {
    const value = e.target.value;
    setSelectedKey(value);
  };

  const handleSubmit = async () => {
    if (!selectedKey) {
      alert('Please select an order type first.');
      return;
    }
    setLoading(true);
    setAdminData([]);
  
    try {
      
      // Prepare the request payload
      const requestPayload = {
        page: 1,
        per_page: 5000,
        status: 1,
        order_locality: selectedCity || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined
      };

      // Only add type if selectedKey is not "all"
      if (selectedKey !== "all") {
        requestPayload.type = parseInt(selectedKey);
      }

      const ordersRes = await axios.post(
        BASE_URL + ADMIN_ORDER_LIST,
        requestPayload
      );
  
      const orders = ordersRes.data.data?.order || [];
  
      if (orders.length === 0) {
        setLoading(false);
        return;
      }
  
      const vendorOrdersMap = {};
      let vendorDetailsMap = {};
      orders.forEach(order => {
        if (!order.toId) return;
        
        if (!vendorOrdersMap[order.toId]) {
          vendorOrdersMap[order.toId] = {
            _id: order.toId,
            "0-6": 0,
            "6-8": 0,
            "9-10": 0,
            Positive: 0,
            Negative: 0,
            "No-Rating": 0,
            totalOrders: 0,
            order_locality: order.order_locality || selectedCity || "Unknown",
          };
        }
        vendorOrdersMap[order.toId].totalOrders++;


        // Review Status
        if (order.reviewStatus === "positive") {
          vendorOrdersMap[order.toId].Positive++;
        }
        else if (order.reviewStatus === "negative") {
          vendorOrdersMap[order.toId].Negative++;
        }

  
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
  
      if (vendorIds.length === 0) {
        setLoading(false);
        return;
      }
  
      try {
        const adminUserRes = await axios.post(
          BASE_URL + ADMIN_USER_LIST,
          {
            page: 1,
            per_page: 2000,
            role: "supplier",
          }
        );
  
        const users = adminUserRes.data.data?.users || [];
  
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
  
  
      // Updating state
      setAdminData((prevData) => [...prevData, ...vendorData]);
  
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  
    setLoading(false);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4 bg-white shadow-lg rounded-lg w-full">
      <h2 className="text-xl font-semibold mb-4 text-center">Vendor Ratings Table <span style={{fontSize: "10px"}}>(Fullfillment date)</span></h2>
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
    value={selectedKey}
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
    <option value="all">All</option>  
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
              <th className="border p-2 w-14">Positive review</th>
              <th className="border p-2 w-14">Negative review</th>
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
                  <td className="border p-2">{admin.Positive}</td>
                  <td className="border p-2">{admin.Negative}</td>
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