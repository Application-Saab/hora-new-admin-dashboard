"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import getOrderType from "../../../utils/getOrderType";
import { ADMIN_ORDER_LIST, BASE_URL } from "../../../utils/apiconstant";
import Stats from "../stats/page";
import "./analysis.css";
import NewUserCount from "../new-user-count/page";
import CancelOrderPage from "../CancelOrderPage/page";

const CityOrdersSummary = () => {
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  console.log(startDate, endDate, "startDate, endDate");
  console.log(selectedKey, selectedCity, "selectedKey, selectedCity");

  // login popup
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, setUser] = useState(null);
  const [timerId, setTimerId] = useState(null);

  const [sendingDataToPage, setSendingDataToPage] = useState("");
  console.log(sendingDataToPage, "sendingDataToPage");

  const cities = [
    { value: "", label: "All" },
    { value: "Mumbai", label: "Mumbai" },
    { value: "Bangalore", label: "Bangalore" },
    { value: "Hyderabad", label: "Hyderabad" },
    { value: "Delhi", label: "Delhi" },
  ];

  const handleDropdownChange = (e) => {
    const key = e.target.value;
    setSelectedKey(key);
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
  };

  const fetchOrders = async () => {
    setLoading(true);

    try {
      const payload = {
        page: 1,
        per_page: 2000,
        status: 1,
      };

      if (selectedKey !== "") {
        payload.type = parseInt(selectedKey);
      }

      if (selectedCity !== "") {
        payload.order_locality = selectedCity;
      }

      if (startDate) {
        payload.start_createdAt = startDate;
      }

      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1);
        const adjustedEndDate = endDateObj.toISOString().split("T")[0];
        payload.end_createdAt = adjustedEndDate;
      }

      console.log("API Payload:", payload);

      const { data } = await axios.post(BASE_URL + ADMIN_ORDER_LIST, payload);

      const orders = data.data?.order || [];
      console.log("Fetched orders:", orders);
      setSendingDataToPage(orders);
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

    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");

    for (
      let day = new Date(start);
      day <= end;
      day.setDate(day.getDate() + 1)
    ) {
      const dateStr =
        day.getFullYear() +
        "-" +
        String(day.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(day.getDate()).padStart(2, "0");

      if (!dateMap[dateStr]) {
        result.push({
          date: dateStr,
          orderCount: 0,
          advanceAmount: 0,
          totalAmount: 0,
          vendorAmount: 0,
        });
      }
    }

    return result.sort((a, b) => a.date.localeCompare(b.date));
  };

  const getOrdersSummary = () => {
    let totalOrders = 0;
    let totalAdvance = 0;
    let totalOverallAmount = 0;
    let totalVendorAmount = 0;

    const dateWiseSummary = {};

    console.log("Total orders from API:", filteredOrders.length);
    console.log("Date range:", startDate, "to", endDate);

    const processedOrders = filteredOrders.filter((order) => {
      return order.status === 1;
    });

    console.log("Processed orders count:", processedOrders.length);

    processedOrders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const orderDateUTC =
        orderDate.getUTCFullYear() +
        "-" +
        String(orderDate.getUTCMonth() + 1).padStart(2, "0") +
        "-" +
        String(orderDate.getUTCDate()).padStart(2, "0");

      if (!dateWiseSummary[orderDateUTC]) {
        dateWiseSummary[orderDateUTC] = {
          orderCount: 0,
          advanceAmount: 0,
          totalAmount: 0,
          vendorAmount: 0,
        };
      }

      const advanceAmount = parseFloat(order.advance_amount || 0);
      const fullAmount = parseFloat(order.total_amount || 0);
      const vendorAmount = parseFloat(order.vendor_amount || 0);

      dateWiseSummary[orderDateUTC].orderCount += 1;
      dateWiseSummary[orderDateUTC].advanceAmount += advanceAmount;
      dateWiseSummary[orderDateUTC].totalAmount += fullAmount;
      dateWiseSummary[orderDateUTC].vendorAmount += vendorAmount;

      totalOrders += 1;
      totalAdvance += advanceAmount;
      totalOverallAmount += fullAmount;
      totalVendorAmount += vendorAmount;
    });

    const dateWiseData = Object.keys(dateWiseSummary)
      .sort()
      .map((date) => ({
        date,
        orderCount: dateWiseSummary[date].orderCount,
        advanceAmount: dateWiseSummary[date].advanceAmount,
        totalAmount: dateWiseSummary[date].totalAmount,
        vendorAmount: dateWiseSummary[date].vendorAmount,
      }));

    return {
      dateWiseData,
      totalOrders,
      totalAdvance,
      totalOverallAmount,
      totalVendorAmount,
    };
  };

  const {
    dateWiseData: rawDateWiseData,
    totalOrders,
    totalAdvance,
    totalOverallAmount,
    totalVendorAmount,
  } = getOrdersSummary();
  const dateWiseData = fillMissingDates(rawDateWiseData);

  // login function
  useEffect(() => {
    const sessionData = JSON.parse(localStorage.getItem("analysis-session"));

    if (!sessionData || Date.now() > sessionData.expiry) {
      setShowLogin(true);
    } else {
      setUser(sessionData.user);
      const timeLeft = sessionData.expiry - Date.now();

      const timeout = setTimeout(() => {
        handleLogout(); // auto logout
      }, timeLeft);

      setTimerId(timeout);
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(
        "https://horaservices.com:3000/api/admin/admin_user_list",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "adminanalysis" }),
        }
      );

      const responseData = await res.json();
      console.log(responseData, "responseData");
      const users = responseData?.data?.users || [];
      console.log(users, "users");

      const matchedUser = users.find(
        (u) =>
          u.email?.toLowerCase() === email.toLowerCase() &&
          u.password === password
      );

      console.log(matchedUser, "matchedUser");

      if (matchedUser) {
        const expiry = Date.now() + 60 * 60 * 1000; // 60 minutes
        localStorage.setItem(
          "analysis-session",
          JSON.stringify({ user: matchedUser, expiry })
        );
        setUser(matchedUser);
        setShowLogin(false);
        const timeout = setTimeout(() => {
          handleLogout(); // auto logout
        }, 60 * 60 * 1000); // 60 minutes

        setTimerId(timeout);
      } else {
        setError("Incorrect email or password");
      }
    } catch {
      setError("Login failed. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("analysis-session");
    setUser(null);
    setShowLogin(true);
    if (timerId) clearTimeout(timerId);
  };

  return (
    <div className="analysis-container">
      {showLogin ? (
        <div className="login-popup">
          <h3>Login to view Analysis</h3>
          {error && <p className="login-error">{error}</p>}
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
            />
            <button type="submit" className="login-button">
              Login
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="main-layout">
            {/* Left Side - Main Content */}
            <div className="main-content">
              <div className="content-card">
                <h2 className="content-title">
                  Order Split by Date{" "}
                  <span style={{ fontSize: "10px" }}>(CreatedAt date)</span>
                </h2>

                <div className="filter-container">
                  <div className="filter-block">
                    <label htmlFor="startDate">Start Date</label>
                    <input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="filter-block">
                    <label htmlFor="endDate">End Date</label>
                    <input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div className="filter-block">
                    <label htmlFor="city">Select City</label>
                    <select
                      id="city"
                      value={selectedCity}
                      onChange={handleCityChange}
                    >
                      {cities.map((city) => (
                        <option key={city.value} value={city.value}>
                          {city.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-block">
                    <label htmlFor="orderType">Order Type</label>
                    <select
                      id="orderType"
                      value={selectedKey}
                      onChange={handleDropdownChange}
                    >
                      <option value="">All</option>
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
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                  }}
                >
                  <button onClick={fetchOrders} className="fetch-button">
                    Fetch Orders
                  </button>
                </div>

                {loading ? (
                  <p className="loading-text">Loading orders...</p>
                ) : showTable ? (
                  <>
                    <div
                      className="table-container"
                      style={{
                        maxHeight: "300px",
                        overflowY: "auto",
                        border: "1px solid #ccc",
                      }}
                    >
                      <table className="data-table">
                        <thead className="table-header">
                          <tr>
                            <th>Date</th>
                            <th>Order Count</th>
                            <th>Advance Amount (₹)</th>
                            <th>Total Amount (₹)</th>
                            <th>Extra Pay (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="table-body">
                          {dateWiseData.map(
                            ({
                              date,
                              orderCount,
                              advanceAmount,
                              totalAmount,
                              vendorAmount,
                            }) => (
                              <tr key={date}>
                                <td>{date}</td>
                                <td>{orderCount}</td>
                                <td>{advanceAmount.toFixed(2)}</td>
                                <td>{totalAmount.toFixed(2)}</td>
                                <td>{vendorAmount.toFixed(2)}</td>
                              </tr>
                            )
                          )}
                          <tr className="table-total-row">
                            <td>Total</td>
                            <td>{totalOrders}</td>
                            <td>{totalAdvance.toFixed(2)}</td>
                            <td>{totalOverallAmount.toFixed(2)}</td>
                            <td>{totalVendorAmount.toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            {/* Right Side - Stats */}
            <div className="stats-sidebar">
              <Stats />
            </div>
          </div>

        <div style={{ display: 'flex' }}>
  <div style={{ flex: 1 }}>
    <NewUserCount />
  </div>
  <div style={{ flex: 1 }}>
    <CancelOrderPage />
  </div>
</div>

        </>
      )}
    </div>
  );
};

export default CityOrdersSummary;