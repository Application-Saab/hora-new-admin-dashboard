import React, { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import "tailwindcss/tailwind.css";

const AdminRatingsTable = () => {
  const [adminData, setAdminData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const usersPerPage = 50;
  const [searchTriggered, setSearchTriggered] = useState(false);

  const fetchData = async (newPage = page) => {
    if (!searchTriggered || loading || !hasMore) return;
    setLoading(true);
    try {
      const adminUsersRes = await axios.post(
        "https://horaservices.com:3000/api/admin/admin_user_list",
        {
          email: "",
          page: newPage,
          per_page: usersPerPage,
          phone: "",
          role: "supplier",
        }
      );
  
      let adminUsers = adminUsersRes.data.data?.users || [];
      if (selectedCity) {
        adminUsers = adminUsers.filter((user) => user.city === selectedCity);
      }
  
      if (adminUsers.length === 0) {
        setHasMore(false);
        setLoading(false);
        return;
      }
  
      const adminRatingsPromises = adminUsers.map(async (admin) => {
        const ordersRes = await axios.post(
          "https://horaservices.com:3000/api/admin/adminOrderList",
          {
            page: "",
            per_page: "",
            order_id: "",
            order_status: 0,
            status: 0,
            type: "",
            toId: admin._id,
          }
        );
  
        const orders = ordersRes.data.data?.order || [];
        const adminRatings = {
          ...admin,
          "0-6": 0,
          "6-8": 0,
          "9-10": 0,
          "No-Rating": 0,
          totalOrders: 0, // Initialize count
        };
  
        orders.forEach((order) => {
          if (order.order_date) {
            const orderDate = new Date(order.order_date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
  
            if (
              (start && orderDate < start) || // Exclude orders before startDate
              (end && orderDate > end) // Exclude orders after endDate
            ) {
              return;
            }
  
            adminRatings.totalOrders++; // Count only filtered orders
  
            if (
              Array.isArray(order.userReviewRatingArray) &&
              order.userReviewRatingArray.length > 0
            ) {
              let validRatingFound = false;
              order.userReviewRatingArray.forEach((rating) => {
                let numericRating = parseFloat(rating);
                if (!isNaN(numericRating)) {
                  validRatingFound = true;
                  if (numericRating <= 6) adminRatings["0-6"]++;
                  else if (numericRating <= 8) adminRatings["6-8"]++;
                  else adminRatings["9-10"]++;
                }
              });
              if (!validRatingFound) adminRatings["No-Rating"]++;
            } else {
              adminRatings["No-Rating"]++;
            }
          }
        });
  
        return adminRatings;
      });
  
      const newAdminData = await Promise.all(adminRatingsPromises);
      setAdminData((prevData) =>
        newPage === 1 ? newAdminData : [...prevData, ...newAdminData]
      ); // Reset data if new search
      setPage(newPage + 1);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };
  

  const handleSubmit = () => {
    setSearchTriggered(true);
    setAdminData([]);
    setPage(1);
    setHasMore(true);
    fetchData(1);
  };

  const lastUserRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchData();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white shadow-lg rounded-lg w-full ">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Vendor Ratings Table
      </h2>
      <div className="mb-4">
        <select
          className="p-2 border rounded-md w-full mb-2"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          <option value="">All Cities</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Delhi">Delhi</option>
          <option value="Mumbai">Mumbai</option>
        </select>
        <div className="flex space-x-4">
          <div className="w-full">
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 ml-1"
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
              className="block text-sm font-medium text-gray-700 ml-1"
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

        <button
          style={{
            background:
              "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)",
          }}
          className="p-2 bg-blue-600 text-white rounded-md w-full hover:bg-blue-700"
          onClick={handleSubmit}
          disabled={loading}
        >
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
              <th className="border p-2 w-32">Total Orders</th>
              <th className="border p-2 w-12">0-6</th>
              <th className="border p-2 w-12">6-8</th>
              <th className="border p-2 w-14">9-10</th>
              <th className="border p-2 w-28">No-Rating</th>
              <th className="border p-2">City</th>
            </tr>
          </thead>
          <tbody>
            {adminData.map((admin, index) => (
              <tr
                key={admin._id}
                ref={index === adminData.length - 1 ? lastUserRef : null}
                className="hover:bg-gray-50"
              >
                <td className="border p-2">{admin.name}</td>
                <td className="border p-2">{admin.totalOrders}</td>
                <td className="border p-2">{admin["0-6"]}</td>
                <td className="border p-2">{admin["6-8"]}</td>
                <td className="border p-2">{admin["9-10"]}</td>
                <td className="border p-2">{admin["No-Rating"]}</td>
                <td className="border p-2">{admin.city}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && <p className="text-center mt-2">Loading...</p>}
      {!hasMore && (
        <p className="text-center mt-2 text-gray-500">No more data to load</p>
      )}
    </div>
  );
};

export default AdminRatingsTable;
