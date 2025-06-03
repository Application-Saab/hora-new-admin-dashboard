// "use client";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import getOrderType from "../../../utils/getOrderType";
// import { ADMIN_ORDER_LIST, BASE_URL } from "../../../utils/apiconstant";
// import Stats from "../stats/page";
// import GoogleMarketingTable from "../testingbro/page";
// import "./analysis.css";

// const CityOrdersSummary = () => {
//   const [filteredOrders, setFilteredOrders] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [showTable, setShowTable] = useState(false);
//   const [selectedKey, setSelectedKey] = useState("");
//   const [selectedCity, setSelectedCity] = useState("");
//   console.log(startDate, endDate, "startDate, endDate");
//   console.log(selectedKey, selectedCity, "selectedKey, selectedCity");

//   // login popup
//   const [showLogin, setShowLogin] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [, setUser] = useState(null);
//   const [timerId, setTimerId] = useState(null);

//   const cities = [
//     { value: "", label: "All" },
//     { value: "Mumbai", label: "Mumbai" },
//     { value: "Bangalore", label: "Bangalore" },
//     { value: "Hyderabad", label: "Hyderabad" },
//     { value: "Delhi", label: "Delhi" },
//   ];

//   const handleDropdownChange = (e) => {
//     const key = e.target.value;
//     setSelectedKey(key);
//   };

//   const handleCityChange = (e) => {
//     const city = e.target.value;
//     setSelectedCity(city);
//   };

//   const fetchOrders = async () => {
//     setLoading(true);

//     try {
//       // Prepare API payload
//       const payload = {
//         page: 1,
//         per_page: 2000,
//         status: 1,
//       };

//       // Add type only if not "All" (empty string)
//       if (selectedKey !== "") {
//         payload.type = parseInt(selectedKey);
//       }

//       // Add order_locality only if not "All" (empty string)
//       if (selectedCity !== "") {
//         payload.order_locality = selectedCity;
//       }

//       const { data } = await axios.post(BASE_URL + ADMIN_ORDER_LIST, payload);

//       const orders = data.data?.order || [];
//       setFilteredOrders(orders);
//       setShowTable(true);
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//     }

//     setLoading(false);
//   };

//   const fillMissingDates = (dateWiseData) => {
//     if (!startDate || !endDate) return dateWiseData;

//     const result = [...dateWiseData];
//     const dateMap = {};

//     dateWiseData.forEach((item) => {
//       dateMap[item.date] = true;
//     });

//     const start = new Date(startDate + "T00:00:00");
//     const end = new Date(endDate + "T00:00:00");

//     // Iterate through each day in the range
//     for (
//       let day = new Date(start);
//       day <= end;
//       day.setDate(day.getDate() + 1)
//     ) {
//       const dateStr =
//         day.getFullYear() +
//         "-" +
//         String(day.getMonth() + 1).padStart(2, "0") +
//         "-" +
//         String(day.getDate()).padStart(2, "0");

//       if (!dateMap[dateStr]) {
//         result.push({
//           date: dateStr,
//           orderCount: 0,
//           advanceAmount: 0,
//           totalAmount: 0,
//           vendorAmount: 0,
//         });
//       }
//     }

//     return result.sort((a, b) => a.date.localeCompare(b.date));
//   };

//   const getOrdersSummary = () => {
//     let totalOrders = 0;
//     let totalAdvance = 0;
//     let totalOverallAmount = 0;
//     let totalVendorAmount = 0;

//     const dateWiseSummary = {};

//     // Debug: Log total orders received from API
//     console.log("Total orders from API:", filteredOrders.length);
//     console.log("Date range:", startDate, "to", endDate);

//     // Filter orders based on date range
//     const dateFilteredOrders = filteredOrders.filter((order) => {
//       if (order.status !== 1) return false;

//       // Parse the ISO date string and convert to UTC date only
//       const orderDate = new Date(order.createdAt);
//       // Get UTC date to match the API data exactly
//       const orderDateUTC =
//         orderDate.getUTCFullYear() +
//         "-" +
//         String(orderDate.getUTCMonth() + 1).padStart(2, "0") +
//         "-" +
//         String(orderDate.getUTCDate()).padStart(2, "0");

//       let includeOrder = true;

//       if (startDate && endDate) {
//         includeOrder = orderDateUTC >= startDate && orderDateUTC <= endDate;
//       } else if (startDate) {
//         includeOrder = orderDateUTC >= startDate;
//       } else if (endDate) {
//         includeOrder = orderDateUTC <= endDate;
//       }

//       // Debug log for date comparison
//       if (startDate || endDate) {
//         console.log(
//           `Order ${order.id || "unknown"}: ${
//             order.createdAt
//           } -> ${orderDateUTC}, Include: ${includeOrder}`
//         );
//       }

//       return includeOrder;
//     });

//     console.log("Filtered orders count:", dateFilteredOrders.length);

//     dateFilteredOrders.forEach((order) => {
//       // Format the date consistently for grouping using UTC
//       const orderDate = new Date(order.createdAt);
//       const orderDateUTC =
//         orderDate.getUTCFullYear() +
//         "-" +
//         String(orderDate.getUTCMonth() + 1).padStart(2, "0") +
//         "-" +
//         String(orderDate.getUTCDate()).padStart(2, "0");

//       if (!dateWiseSummary[orderDateUTC]) {
//         dateWiseSummary[orderDateUTC] = {
//           orderCount: 0,
//           advanceAmount: 0,
//           totalAmount: 0,
//           vendorAmount: 0,
//         };
//       }

//       const advanceAmount = parseFloat(order.advance_amount || 0);
//       const fullAmount = parseFloat(order.total_amount || 0);
//       const vendorAmount = parseFloat(order.vendor_amount || 0);

//       dateWiseSummary[orderDateUTC].orderCount += 1;
//       dateWiseSummary[orderDateUTC].advanceAmount += advanceAmount;
//       dateWiseSummary[orderDateUTC].totalAmount += fullAmount;
//       dateWiseSummary[orderDateUTC].vendorAmount += vendorAmount;

//       totalOrders += 1;
//       totalAdvance += advanceAmount;
//       totalOverallAmount += fullAmount;
//       totalVendorAmount += vendorAmount;
//     });

//     const dateWiseData = Object.keys(dateWiseSummary)
//       .sort()
//       .map((date) => ({
//         date,
//         orderCount: dateWiseSummary[date].orderCount,
//         advanceAmount: dateWiseSummary[date].advanceAmount,
//         totalAmount: dateWiseSummary[date].totalAmount,
//         vendorAmount: dateWiseSummary[date].vendorAmount,
//       }));

//     return {
//       dateWiseData,
//       totalOrders,
//       totalAdvance,
//       totalOverallAmount,
//       totalVendorAmount,
//     };
//   };

//   const {
//     dateWiseData: rawDateWiseData,
//     totalOrders,
//     totalAdvance,
//     totalOverallAmount,
//     totalVendorAmount,
//   } = getOrdersSummary();
//   const dateWiseData = fillMissingDates(rawDateWiseData);

//   // login function

//   // useEffect(() => {
//   //   const sessionData = JSON.parse(localStorage.getItem('analysis-session'));
//   //   if (!sessionData || Date.now() > sessionData.expiry) {
//   //     setShowLogin(true);
//   //   } else {
//   //     setUser(sessionData.user);
//   //   }
//   // }, []);
//   useEffect(() => {
//     const sessionData = JSON.parse(localStorage.getItem("analysis-session"));

//     if (!sessionData || Date.now() > sessionData.expiry) {
//       setShowLogin(true);
//     } else {
//       setUser(sessionData.user);
//       const timeLeft = sessionData.expiry - Date.now();

//       const timeout = setTimeout(() => {
//         handleLogout(); // auto logout
//       }, timeLeft);

//       setTimerId(timeout);
//     }

//     return () => {
//       if (timerId) clearTimeout(timerId);
//     };
//   }, []);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {
//       const res = await fetch(
//         "https://horaservices.com:3000/api/admin/admin_user_list",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ role: "adminanalysis" }),
//         }
//       );

//       const responseData = await res.json();
//       console.log(responseData, "responseData");
//       const users = responseData?.data?.users || [];
//       console.log(users, "users");

//       const matchedUser = users.find(
//         (u) =>
//           u.email?.toLowerCase() === email.toLowerCase() &&
//           u.password === password
//       );

//       console.log(matchedUser, "matchedUser");

//       if (matchedUser) {
//         const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
//         localStorage.setItem(
//           "analysis-session",
//           JSON.stringify({ user: matchedUser, expiry })
//         );
//         setUser(matchedUser);
//         setShowLogin(false);
//         const timeout = setTimeout(() => {
//           handleLogout(); // auto logout
//         }, 10 * 60 * 1000);

//         setTimerId(timeout);
//       } else {
//         setError("Incorrect email or password");
//       }
//     } catch {
//       setError("Login failed. Please try again.");
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("analysis-session");
//     setUser(null);
//     setShowLogin(true);
//     if (timerId) clearTimeout(timerId);
//   };

//   return (
//     <div style={{ padding: "2rem" }}>
//       {showLogin ? (
//         <div style={popupStyle}>
//           <h3>Login to view Analysis</h3>
//           {error && <p style={{ color: "red" }}>{error}</p>}
//           <form onSubmit={handleLogin}>
//             <input
//               type="email"
//               placeholder="Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               style={inputStyle}
//             />
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               style={inputStyle}
//             />
//             <button type="submit" style={buttonStyle}>
//               Login
//             </button>
//           </form>
//         </div>
//       ) : (
//         <>
//           <div style={{ display: "flex", gap: "10px" }}>
//             {/* Left Side - Main Content */}
//             <div style={{ flex: "2" }}>
//               <div
//                 style={{
//                   maxWidth: "95%",
//                   margin: "0 auto",
//                   textAlign: "center",
//                   background: "#fff",
//                   padding: "10px",
//                   boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
//                   borderRadius: "10px",
//                   marginLeft: "-30px",
//                   // marginRight: "40px",
//                   marginTop: "20px",
//                 }}
//               >
//                 <h2
//                   style={{
//                     textAlign: "center",
//                     fontSize: "18px",
//                     fontWeight: "bold",
//                     marginBottom: "15px",
//                     color: "#333",
//                     textShadow: "2px 2px 8px rgba(0,0,0,0.2)",
//                   }}
//                 >
//                   Search Orders by Date Range, Order Type, and City
//                 </h2>

//                 <div className="filter-container">
//                   <div className="filter-block">
//                     <label htmlFor="startDate">Start Date</label>
//                     <input
//                       type="date"
//                       id="startDate"
//                       value={startDate}
//                       onChange={(e) => setStartDate(e.target.value)}
//                     />
//                   </div>
//                   <div className="filter-block">
//                     <label htmlFor="endDate">End Date</label>
//                     <input
//                       type="date"
//                       id="endDate"
//                       value={endDate}
//                       onChange={(e) => setEndDate(e.target.value)}
//                     />
//                   </div>
//                   <div className="filter-block">
//                     <label htmlFor="city">Select City</label>
//                     <select
//                       id="city"
//                       value={selectedCity}
//                       onChange={handleCityChange}
//                     >
//                       {cities.map((city) => (
//                         <option key={city.value} value={city.value}>
//                           {city.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <div className="filter-block">
//                     <label htmlFor="orderType">Order Type</label>
//                     <select
//                       id="orderType"
//                       value={selectedKey}
//                       onChange={handleDropdownChange}
//                     >
//                       <option value="">All</option>
//                       {[...Array(8)].map((_, i) => {
//                         const value = i + 1;
//                         return (
//                           <option key={value} value={value}>
//                             {getOrderType(value)}
//                           </option>
//                         );
//                       })}
//                     </select>
//                   </div>
//                 </div>
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "center",
//                     gap: "10px",
//                   }}
//                 >
//                   <button
//                     onClick={fetchOrders}
//                     style={{
//                       padding: "8px 16px",
//                       background:
//                         "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)",
//                       color: "#fff",
//                       border: "none",
//                       borderRadius: "4px",
//                       cursor: "pointer",
//                       marginBottom: "15px",
//                       fontWeight: "bold",
//                       fontSize: "13px",
//                     }}
//                   >
//                     Fetch Orders
//                   </button>
//                 </div>

//                 {loading ? (
//                   <p
//                     style={{
//                       textAlign: "center",
//                       fontSize: "14px",
//                       color: "#666",
//                     }}
//                   >
//                     Loading orders...
//                   </p>
//                 ) : showTable ? (
//                   <div style={{ overflowX: "auto" }}>
//                     <table
//                       style={{
//                         width: "100%",
//                         borderCollapse: "collapse",
//                         border: "1px solid #ddd",
//                         borderRadius: "6px",
//                         boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
//                         backdropFilter: "blur(10px)",
//                         background: "rgba(255, 255, 255, 0.7)",
//                         marginBottom: "15px",
//                         fontSize: "12px",
//                       }}
//                     >
//                       <thead>
//                         <tr
//                           style={{
//                             background:
//                               "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)",
//                             color: "#fff",
//                           }}
//                         >
//                           <th style={{ padding: "8px", fontSize: "13px" }}>
//                             Date
//                           </th>
//                           <th style={{ padding: "8px", fontSize: "13px" }}>
//                             Order Count
//                           </th>
//                           <th style={{ padding: "8px", fontSize: "13px" }}>
//                             Advance Amount (₹)
//                           </th>
//                           <th style={{ padding: "8px", fontSize: "13px" }}>
//                             Total Amount (₹)
//                           </th>
//                           <th style={{ padding: "8px", fontSize: "13px" }}>
//                             Vendor Amount (₹)
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {dateWiseData.map(
//                           ({
//                             date,
//                             orderCount,
//                             advanceAmount,
//                             totalAmount,
//                             vendorAmount,
//                           }) => (
//                             <tr key={date}>
//                               <td style={{ padding: "6px", fontSize: "11px" }}>
//                                 {date}
//                               </td>
//                               <td style={{ padding: "6px", fontSize: "11px" }}>
//                                 {orderCount}
//                               </td>
//                               <td style={{ padding: "6px", fontSize: "11px" }}>
//                                 {advanceAmount.toFixed(2)}
//                               </td>
//                               <td style={{ padding: "6px", fontSize: "11px" }}>
//                                 {totalAmount.toFixed(2)}
//                               </td>
//                               <td style={{ padding: "6px", fontSize: "11px" }}>
//                                 {vendorAmount.toFixed(2)}
//                               </td>
//                             </tr>
//                           )
//                         )}
//                         <tr
//                           style={{ fontWeight: "bold", background: "#f3f3f3" }}
//                         >
//                           <td style={{ padding: "6px", fontSize: "11px" }}>
//                             Total
//                           </td>
//                           <td style={{ padding: "6px", fontSize: "11px" }}>
//                             {totalOrders}
//                           </td>
//                           <td style={{ padding: "6px", fontSize: "11px" }}>
//                             {totalAdvance.toFixed(2)}
//                           </td>
//                           <td style={{ padding: "6px", fontSize: "11px" }}>
//                             {totalOverallAmount.toFixed(2)}
//                           </td>
//                           <td style={{ padding: "6px", fontSize: "11px" }}>
//                             {totalVendorAmount.toFixed(2)}
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>
//                 ) : null}
//               </div>
//             </div>

//             {/* Right Side - Stats */}
//             <div style={{ flex: "1", minWidth: "450px" }}>
//               <Stats />
//             </div>
//           </div>

//           <GoogleMarketingTable
//             startDate={startDate}
//             endDate={endDate}
//             selectedCity={selectedCity}
//             selectedKey={selectedKey}
//           />
//         </>
//       )}
//     </div>
//   );
// };

// const popupStyle = {
//   position: "fixed",
//   top: "20%",
//   left: "50%",
//   transform: "translate(-50%, -20%)",
//   backgroundColor: "#fff",
//   padding: "2rem",
//   borderRadius: "8px",
//   boxShadow: "0 0 10px rgba(0,0,0,0.2)",
//   zIndex: 1000,
// };

// const inputStyle = {
//   display: "block",
//   width: "100%",
//   marginBottom: "1rem",
//   padding: "0.5rem",
// };

// const buttonStyle = {
//   padding: "12px 12px",
//   background: "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)",
//   color: "#fff",
//   border: "none",
//   borderRadius: "5px",
//   cursor: "pointer",
//   marginBottom: "20px",
//   fontWeight: "bold",
//   fontSize: "16px",
//   marginLeft: "75px",
// };

// export default CityOrdersSummary;

"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import getOrderType from "../../../utils/getOrderType";
import { ADMIN_ORDER_LIST, BASE_URL } from "../../../utils/apiconstant";
import Stats from "../stats/page";
import GoogleMarketingTable from "../testingbro/page";
import "./analysis.css";

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
      // Prepare API payload
      const payload = {
        page: 1,
        per_page: 2000,
        status: 1,
      };

      // Add type only if not "All" (empty string)
      if (selectedKey !== "") {
        payload.type = parseInt(selectedKey);
      }

      // Add order_locality only if not "All" (empty string)
      if (selectedCity !== "") {
        payload.order_locality = selectedCity;
      }

      const { data } = await axios.post(BASE_URL + ADMIN_ORDER_LIST, payload);

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

    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");

    // Iterate through each day in the range
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

    // Debug: Log total orders received from API
    console.log("Total orders from API:", filteredOrders.length);
    console.log("Date range:", startDate, "to", endDate);

    // Filter orders based on date range
    const dateFilteredOrders = filteredOrders.filter((order) => {
      if (order.status !== 1) return false;

      // Parse the ISO date string and convert to UTC date only
      const orderDate = new Date(order.createdAt);
      // Get UTC date to match the API data exactly
      const orderDateUTC =
        orderDate.getUTCFullYear() +
        "-" +
        String(orderDate.getUTCMonth() + 1).padStart(2, "0") +
        "-" +
        String(orderDate.getUTCDate()).padStart(2, "0");

      let includeOrder = true;

      if (startDate && endDate) {
        includeOrder = orderDateUTC >= startDate && orderDateUTC <= endDate;
      } else if (startDate) {
        includeOrder = orderDateUTC >= startDate;
      } else if (endDate) {
        includeOrder = orderDateUTC <= endDate;
      }

      // Debug log for date comparison
      if (startDate || endDate) {
        console.log(
          `Order ${order.id || "unknown"}: ${
            order.createdAt
          } -> ${orderDateUTC}, Include: ${includeOrder}`
        );
      }

      return includeOrder;
    });

    console.log("Filtered orders count:", dateFilteredOrders.length);

    dateFilteredOrders.forEach((order) => {
      // Format the date consistently for grouping using UTC
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
        const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
        localStorage.setItem(
          "analysis-session",
          JSON.stringify({ user: matchedUser, expiry })
        );
        setUser(matchedUser);
        setShowLogin(false);
        const timeout = setTimeout(() => {
          handleLogout(); // auto logout
        }, 10 * 60 * 1000);

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
                  Order Split by Date
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
                <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                  <button onClick={fetchOrders} className="fetch-button">
                    Fetch Orders
                  </button>
                </div>

                {loading ? (
                  <p className="loading-text">Loading orders...</p>
                ) : showTable ? (
                  <>
                  <div className="table-container">
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
            
              {/* <div>
                <GoogleMarketingTable
              startDate={startDate}
              endDate={endDate}
              selectedCity={selectedCity}
              selectedKey={selectedKey}
            />
              </div> */}
              
          </div>

        
        </>
      )}
    </div>
  );
};

export default CityOrdersSummary;