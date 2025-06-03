// "use client";
// import { useState } from "react";
// import axios from "axios";
// import getOrderType from "../../../utils/getOrderType";
// import { ADMIN_ORDER_LIST, BASE_URL } from "../../../utils/apiconstant";
// import "./stats.css";

// const CityOrdersSummary = () => {
//   const [allOrders, setAllOrders] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [showTable, setShowTable] = useState(false);
//   const [selectedKey, setSelectedKey] = useState("");

//   // Define the four cities we want to track
//   const targetCities = ["Delhi", "Mumbai", "Bangalore", "Hyderabad"];

//   const handleDropdownChange = (e) => {
//     const key = e.target.value;
//     setSelectedKey(key);
//   };

//   const fetchAllOrders = async () => {
//     setLoading(true);

//     if (!selectedKey) {
//       alert("Please select an order type first.");
//       setLoading(false);
//       return;
//     }

//     try {
//       // Prepare the API payload - fetch all data without date filters
//       const payload = {
//         page: 1,
//         per_page: 5000,
//         status: 1,
//         order_locality: "",
//         start_date: null,
//         end_date: null,
//       };

//       // Only add type if "all" is not selected
//       if (selectedKey !== "all") {
//         payload.type = parseInt(selectedKey);
//       }

//       const { data } = await axios.post(BASE_URL + ADMIN_ORDER_LIST, payload);

//       setAllOrders(data.data?.order || []);
//       setShowTable(true);
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//     }
//     setLoading(false);
//   };

//   // Filter orders by date range on frontend
//   const getFilteredOrders = () => {
//     if (!startDate && !endDate) {
//       return allOrders;
//     }

//     return allOrders.filter((order) => {
//       if (!order.createdAt) return false;

//       const orderDate = new Date(order.createdAt).toISOString().split("T")[0];

//       if (startDate && endDate) {
//         return orderDate >= startDate && orderDate <= endDate;
//       } else if (startDate) {
//         return orderDate >= startDate;
//       } else if (endDate) {
//         return orderDate <= endDate;
//       }

//       return true;
//     });
//   };

//   // Calculate city orders and totals from filtered data
//   const getCityOrdersSummary = () => {
//     const filteredOrders = getFilteredOrders();

//     // Initialize summary for our target cities
//     const citySummary = {};
//     targetCities.forEach((city) => {
//       citySummary[city] = {
//         orderCount: 0,
//         totalAmount: 0,
//       };
//     });

//     let totalOrders = 0;
//     let totalAmount = 0;

//     filteredOrders.forEach((order) => {
//       // Only process if order status is 1
//       if (order.status !== 1) return;

//       // Normalize city name
//       let city = order?.order_locality?.trim() || "";
//       if (city.toLowerCase() === "hyderbad") city = "Hyderabad";

//       // Only process if it's one of our target cities
//       if (!targetCities.includes(city)) return;

//       citySummary[city].orderCount += 1;

//       // Handle vendor_amount properly, converting empty strings to 0
//       const vendorAmount = order?.vendor_amount
//         ? parseFloat(order.vendor_amount)
//         : 0;
//       citySummary[city].totalAmount += vendorAmount;

//       // Add to grand totals
//       totalOrders += 1;
//       totalAmount += vendorAmount;
//     });

//     return { citySummary, totalOrders, totalAmount };
//   };

//   const { citySummary, totalOrders, totalAmount } = getCityOrdersSummary();

//   return (
//     <div className="city-orders-container">
//       <h2 className="city-orders-title">
//         Order Filter: Start Date, End Date, And Type
//       </h2>

//       <div className="filter-container">
//         <div className="filter-block">
//           <label htmlFor="startDate">Start Date</label>
//           <input
//             type="date"
//             id="startDate"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//           />
//         </div>
//         <div className="filter-block">
//           <label htmlFor="endDate">End Date</label>
//           <input
//             type="date"
//             id="endDate"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//           />
//         </div>

//         <div className="filter-block">
//           <label htmlFor="orderType">Order Type</label>
//           <select
//             onChange={handleDropdownChange}
//             value={selectedKey}
//             className="dropdown-select"
//           >
//             <option value="" disabled>
//               -- Select --
//             </option>
//             <option value="all">All Order Types</option>
//             {[...Array(8)].map((_, i) => {
//               const value = i + 1;
//               return (
//                 <option key={value} value={value}>
//                   {getOrderType(value)}
//                 </option>
//               );
//             })}
//           </select>
//         </div>
//       </div>

//       <button onClick={fetchAllOrders} className="load-data-button">
//         Load Data
//       </button>

//       {loading ? (
//         <p className="loading-text">Loading orders...</p>
//       ) : showTable ? (
//         <div className="table-container">
//           <table className="orders-table">
//             <thead>
//               <tr className="table-header">
//                 <th>City</th>
//                 <th>Total Orders</th>
//                 <th>Vendor Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               {/* Show only our target cities in a consistent order */}
//               {targetCities.map((city) => {
//                 const data = citySummary[city] || {
//                   orderCount: 0,
//                   totalAmount: 0,
//                 };
//                 return (
//                   <tr key={city} className="table-row">
//                     <td className="table-cell city-name">{city}</td>
//                     <td className="table-cell">{data.orderCount}</td>
//                     <td className="table-cell amount">
//                       ₹{data.totalAmount.toFixed(2)}
//                     </td>
//                   </tr>
//                 );
//               })}
//               <tr className="grand-total-row">
//                 <td className="grand-total-cell">Grand Total</td>
//                 <td className="grand-total-cell">{totalOrders}</td>
//                 <td className="grand-total-cell">₹{totalAmount.toFixed(2)}</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       ) : null}
//     </div>
//   );
// };

// export default CityOrdersSummary;

"use client";
import { useState } from "react";
import axios from "axios";
import getOrderType from "../../../utils/getOrderType";
import { ADMIN_ORDER_LIST, BASE_URL } from "../../../utils/apiconstant";
import "./stats.css";

const CityOrdersSummary = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [marketingData, setMarketingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");

  const targetCities = ["Delhi", "Mumbai", "Bangalore", "Hyderabad"];

  const handleDropdownChange = (e) => {
    const key = e.target.value;
    setSelectedKey(key);
  };

  const fetchData = async (city, startDate, endDate) => {
    try {
      const url = `https://script.google.com/macros/s/AKfycbw-cjT3C4o3qIBA5zA8u4Nb3gWb_sZtU08f6lfVwYeLzqk7WA80Idd79RM9CUytgVsS/exec?city=${city}&startDate=${startDate}&endDate=${endDate}`;

      const response = await fetch(url);
      const result = await response.json();

      return result;
    } catch (error) {
      console.error("Error fetching marketing data:", error);
      return [];
    }
  };

  const fetchAllMarketingData = async () => {
    if (!startDate || !endDate) {
      return [];
    }

    const allMarketingData = [];

    for (const city of targetCities) {
      const cityData = await fetchData(city, startDate, endDate);
      if (Array.isArray(cityData)) {
        allMarketingData.push(...cityData);
      }
    }

    return allMarketingData;
  };

  const fetchAllOrders = async () => {
    setLoading(true);

    if (!selectedKey) {
      alert("Please select an order type first.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        page: 1,
        per_page: 3000,
        status: 1,
        order_locality: "",
        start_date: null,
        end_date: null,
      };

      if (selectedKey !== "all") {
        payload.type = parseInt(selectedKey);
      }

      const { data } = await axios.post(BASE_URL + ADMIN_ORDER_LIST, payload);
      setAllOrders(data.data?.order || []);

      const marketingResult = await fetchAllMarketingData();
      setMarketingData(marketingResult);

      setShowTable(true);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
    setLoading(false);
  };

  const getFilteredOrders = () => {
    if (!startDate && !endDate) {
      return allOrders;
    }

    return allOrders.filter((order) => {
      if (!order.createdAt) return false;

      const orderDate = new Date(order.createdAt).toISOString().split("T")[0];

      if (startDate && endDate) {
        return orderDate >= startDate && orderDate <= endDate;
      } else if (startDate) {
        return orderDate >= startDate;
      } else if (endDate) {
        return orderDate <= endDate;
      }

      return true;
    });
  };

  const getMarketingCostByCity = (cityName) => {
    return marketingData
      .filter((item) => item.city === cityName)
      .reduce((total, item) => total + (parseFloat(item.cost) || 0), 0);
  };

  const getCityOrdersSummary = () => {
    const filteredOrders = getFilteredOrders();

    const citySummary = {};
    targetCities.forEach((city) => {
      citySummary[city] = {
        orderCount: 0,
        totalAmount: 0,
        totalOrderAmount: 0,
        marketingCost: getMarketingCostByCity(city) * 1.18,
      };
    });

    let totalOrders = 0;
    let totalAmount = 0;
    let totalOrderAmount = 0;
    let totalMarketingCost = 0;

    filteredOrders.forEach((order) => {
      if (order.status !== 1) return;

      let city = order?.order_locality?.trim() || "";
      if (city.toLowerCase() === "hyderbad") city = "Hyderabad";

      if (!targetCities.includes(city)) return;

      citySummary[city].orderCount += 1;

      const vendorAmount = order?.vendor_amount
        ? parseFloat(order.vendor_amount)
        : 0;
      citySummary[city].totalAmount += vendorAmount;

      let totalOrderAmount = order?.total_amount
        ? parseFloat(order.total_amount)
        : 0;
      citySummary[city].totalOrderAmount += totalOrderAmount;

      totalOrders += 1;
      totalAmount += vendorAmount;
      totalOrderAmount += totalOrderAmount;
    });

    targetCities.forEach((city) => {
      totalMarketingCost += citySummary[city].marketingCost;
    });

    return {
      citySummary,
      totalOrders,
      totalAmount,
      totalOrderAmount,
      totalMarketingCost,
    };
  };

  const {
    citySummary,
    totalOrders,
    totalAmount,
    // totalOrderAmount,
    totalMarketingCost,
  } = getCityOrdersSummary();

  // Ensure totalOrderAmount is calculated correctly
  const grandTotalOrderAmount = Object.values(citySummary).reduce(
    (sum, cityData) => sum + cityData.totalOrderAmount,
    0
  );

  return (
    <div className="city-orders-container">
      <h2 className="city-orders-title">
Order Split by City
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
          <label htmlFor="orderType">Order Type</label>
          <select
            onChange={handleDropdownChange}
            value={selectedKey}
            className="dropdown-select"
          >
            <option value="" disabled>
              -- Select --
            </option>
            <option value="all">All Order Types</option>
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

      <button onClick={fetchAllOrders} className="load-data-button">
        Load Data
      </button>

      {loading ? (
        <p className="loading-text">Loading orders...</p>
      ) : showTable ? (
        <div className="table-container">
          <table className="orders-table">
            <thead>
              <tr className="table-header">
                <th>City</th>
                <th>Total Orders</th>
                <th>Extra Pay</th>
                <th>Total Order Amount</th>
                <th>Marketing Cost</th>
                <th>Marketing Contribution</th>
              </tr>
            </thead>
            <tbody>
              {targetCities.map((city) => {
                const data = citySummary[city] || {
                  orderCount: 0,
                  totalAmount: 0,
                  totalOrderAmount: 0,
                  marketingCost: 0,
                };
                // const marketingContribution =
                //   data.totalOrderAmount > 0
                //     ? data.marketingCost / data.totalOrderAmount
                //     : 0;
                console.log(
                  `City: ${city}, Total Order Amount: ${data.totalOrderAmount}`
                );
                const marketingContributionRatio =
                  data.totalOrderAmount > 0
                    ? data.marketingCost / data.totalOrderAmount
                    : 0;
                const marketingContributionPercentage =
                  marketingContributionRatio * 100;

                return (
                  <tr key={city} className="table-row">
                    <td className="table-cell city-name">{city}</td>
                    <td className="table-cell">{data.orderCount}</td>
                    <td className="table-cell amount">
                      ₹{data.totalAmount.toFixed(2)}
                    </td>
                    <td className="table-cell amount">
                      ₹{data.totalOrderAmount.toFixed(2)}
                    </td>
                    <td className="table-cell amount">
                      ₹{data.marketingCost.toFixed(2)}
                    </td>
                    <td className="table-cell amount">
                      {marketingContributionPercentage.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
              <tr className="grand-total-row">
                <td className="grand-total-cell">Grand Total</td>
                <td className="grand-total-cell">{totalOrders}</td>
                <td className="grand-total-cell">₹{totalAmount.toFixed(2)}</td>
                <td className="grand-total-cell">
                  ₹{grandTotalOrderAmount.toFixed(2)}
                </td>
                <td className="grand-total-cell">
                  ₹{totalMarketingCost.toFixed(2)}
                </td>
                <td className="grand-total-cell">
                  {grandTotalOrderAmount > 0
                    ? (
                        (totalMarketingCost / grandTotalOrderAmount) *
                        100
                      ).toFixed(2) + "%"
                    : "0%"}
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

// "use client";
// import { useState } from "react";
// import axios from "axios";
// import getOrderType from "../../../utils/getOrderType";
// import { ADMIN_ORDER_LIST, BASE_URL } from "../../../utils/apiconstant";
// import "./stats.css";

// const CityOrdersSummary = () => {
//   const [allOrders, setAllOrders] = useState([]);
//   const [marketingData, setMarketingData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [showTable, setShowTable] = useState(false);
//   const [selectedKey, setSelectedKey] = useState("");

//   // Define the four cities we want to track
//   const targetCities = ["Delhi", "Mumbai", "Bangalore", "Hyderabad"];

//   const handleDropdownChange = (e) => {
//     const key = e.target.value;
//     setSelectedKey(key);
//   };

//   const fetchData = async (city, startDate, endDate) => {
//     try {
//       const url = `https://script.google.com/macros/s/AKfycbw-cjT3C4o3qIBA5zA8u4Nb3gWb_sZtU08f6lfVwYeLzqk7WA80Idd79RM9CUytgVsS/exec?city=${city}&startDate=${startDate}&endDate=${endDate}`;

//       const response = await fetch(url);
//       const result = await response.json();

//       console.log(response, "response");
//       console.log(result, "result");

//       return result;
//     } catch (error) {
//       console.error("Error fetching marketing data:", error);
//       return [];
//     }
//   };

//   const fetchAllMarketingData = async () => {
//     if (!startDate || !endDate) {
//       return [];
//     }

//     const allMarketingData = [];

//     // Fetch marketing data for each target city
//     for (const city of targetCities) {
//       const cityData = await fetchData(city, startDate, endDate);
//       if (Array.isArray(cityData)) {
//         allMarketingData.push(...cityData);
//       }
//     }

//     return allMarketingData;
//   };

//   const fetchAllOrders = async () => {
//     setLoading(true);

//     if (!selectedKey) {
//       alert("Please select an order type first.");
//       setLoading(false);
//       return;
//     }

//     try {
//       // Prepare the API payload - fetch all data without date filters
//       const payload = {
//         page: 1,
//         per_page: 2000,
//         status: 1,
//         order_locality: "",
//         start_date: null,
//         end_date: null,
//       };

//       // Only add type if "all" is not selected
//       if (selectedKey !== "all") {
//         payload.type = parseInt(selectedKey);
//       }

//       // Fetch orders data
//       const { data } = await axios.post(BASE_URL + ADMIN_ORDER_LIST, payload);
//       setAllOrders(data.data?.order || []);

//       // Fetch marketing data
//       const marketingResult = await fetchAllMarketingData();
//       setMarketingData(marketingResult);

//       setShowTable(true);
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//     }
//     setLoading(false);
//   };

//   // Filter orders by date range on frontend
//   const getFilteredOrders = () => {
//     if (!startDate && !endDate) {
//       return allOrders;
//     }

//     return allOrders.filter((order) => {
//       if (!order.createdAt) return false;

//       const orderDate = new Date(order.createdAt).toISOString().split("T")[0];

//       if (startDate && endDate) {
//         return orderDate >= startDate && orderDate <= endDate;
//       } else if (startDate) {
//         return orderDate >= startDate;
//       } else if (endDate) {
//         return orderDate <= endDate;
//       }

//       return true;
//     });
//   };

//   // Calculate marketing cost by city
//   const getMarketingCostByCity = (cityName) => {
//     return marketingData
//       .filter(item => item.city === cityName)
//       .reduce((total, item) => total + (parseFloat(item.cost) || 0), 0);
//   };

//   // Calculate city orders and totals from filtered data
//   const getCityOrdersSummary = () => {
//     const filteredOrders = getFilteredOrders();

//     // Initialize summary for our target cities
//     const citySummary = {};
//     targetCities.forEach((city) => {
//       citySummary[city] = {
//         orderCount: 0,
//         totalAmount: 0,
//         marketingCost: getMarketingCostByCity(city)  * 1.18,
//       };
//     });

//     let totalOrders = 0;
//     let totalAmount = 0;
//     let totalMarketingCost = 0;

//     filteredOrders.forEach((order) => {
//       // Only process if order status is 1
//       if (order.status !== 1) return;

//       // Normalize city name
//       let city = order?.order_locality?.trim() || "";
//       if (city.toLowerCase() === "hyderbad") city = "Hyderabad";

//       // Only process if it's one of our target cities
//       if (!targetCities.includes(city)) return;

//       citySummary[city].orderCount += 1;

//       // Handle vendor_amount properly, converting empty strings to 0
//       const vendorAmount = order?.vendor_amount
//         ? parseFloat(order.vendor_amount)
//         : 0;
//       citySummary[city].totalAmount += vendorAmount;

//       // Add to grand totals
//       totalOrders += 1;
//       totalAmount += vendorAmount;
//     });

//     // Calculate total marketing cost
//     targetCities.forEach((city) => {
//       totalMarketingCost += citySummary[city].marketingCost;
//     });

//     return { citySummary, totalOrders, totalAmount, totalMarketingCost };
//   };

//   const { citySummary, totalOrders, totalAmount, totalMarketingCost } = getCityOrdersSummary();

//   return (
//     <div className="city-orders-container">
//       <h2 className="city-orders-title">
//         Order Filter: Start Date, End Date, And Type
//       </h2>

//       <div className="filter-container">
//         <div className="filter-block">
//           <label htmlFor="startDate">Start Date</label>
//           <input
//             type="date"
//             id="startDate"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//           />
//         </div>
//         <div className="filter-block">
//           <label htmlFor="endDate">End Date</label>
//           <input
//             type="date"
//             id="endDate"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//           />
//         </div>

//         <div className="filter-block">
//           <label htmlFor="orderType">Order Type</label>
//           <select
//             onChange={handleDropdownChange}
//             value={selectedKey}
//             className="dropdown-select"
//           >
//             <option value="" disabled>
//               -- Select --
//             </option>
//             <option value="all">All Order Types</option>
//             {[...Array(8)].map((_, i) => {
//               const value = i + 1;
//               return (
//                 <option key={value} value={value}>
//                   {getOrderType(value)}
//                 </option>
//               );
//             })}
//           </select>
//         </div>
//       </div>

//       <button onClick={fetchAllOrders} className="load-data-button">
//         Load Data
//       </button>

//       {loading ? (
//         <p className="loading-text">Loading orders...</p>
//       ) : showTable ? (
//         <div className="table-container">
//           <table className="orders-table">
//             <thead>
//               <tr className="table-header">
//                 <th>City</th>
//                 <th>Total Orders</th>
//                 <th>Vendor Amount</th>
//                 <th>Marketing Cost</th>
//               </tr>
//             </thead>
//             <tbody>
//               {/* Show only our target cities in a consistent order */}
//               {targetCities.map((city) => {
//                 const data = citySummary[city] || {
//                   orderCount: 0,
//                   totalAmount: 0,
//                   marketingCost: 0,
//                 };
//                 return (
//                   <tr key={city} className="table-row">
//                     <td className="table-cell city-name">{city}</td>
//                     <td className="table-cell">{data.orderCount}</td>
//                     <td className="table-cell amount">
//                       ₹{data.totalAmount.toFixed(2)}
//                     </td>
//                     <td className="table-cell amount">
//                       ₹{data.marketingCost.toFixed(2)}
//                     </td>
//                   </tr>
//                 );
//               })}
//               <tr className="grand-total-row">
//                 <td className="grand-total-cell">Grand Total</td>
//                 <td className="grand-total-cell">{totalOrders}</td>
//                 <td className="grand-total-cell">₹{totalAmount.toFixed(2)}</td>
//                 <td className="grand-total-cell">₹{totalMarketingCost.toFixed(2) }</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       ) : null}
//     </div>
//   );
// };

// export default CityOrdersSummary;
