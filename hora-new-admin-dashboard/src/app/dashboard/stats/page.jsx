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

  const fetchData = async (city, startDate, endDate, categoryNumber) => {
    console.log(categoryNumber, "categoryNumber");
    try {
      // For Google Sheets API, always use 6 for types 6, 7, and 8
      let googleSheetsCategoryNumber = categoryNumber;
      if (categoryNumber === 7 || categoryNumber === 8) {
        googleSheetsCategoryNumber = 6;
      }
      
      // Build URL with conditional categoryNumber parameter
      let url = `https://script.google.com/macros/s/AKfycbzODlS3to4AC-sA7UvD6qY_SH8cNfvUoXZ9jGu8sp3DnvXKXHRIvvX9WowHdLCFy_yv/exec?city=${city}&startDate=${startDate}&endDate=${endDate}`;
      
      // Only add categoryNumber if it's not null (for "all" case, we don't send categoryNumber)
      if (googleSheetsCategoryNumber !== null) {
        url += `&categoryNumber=${googleSheetsCategoryNumber}`;
      }

      const response = await fetch(url);
      const result = await response.json();
      console.log(result, "result");

      return result;
    } catch (error) {
      console.error("Error fetching marketing data:", error);
      return [];
    }
  };

  const fetchAllMarketingData = async (type) => {
    if (!startDate || !endDate) {
      return [];
    }

    // If type is "all", fetch all data without category filter
    if (type === "all") {
      const fetchPromises = targetCities.map(city =>
        fetchData(city, startDate, endDate, null) 
      );

      try {
        const results = await Promise.all(fetchPromises);
        const allMarketingData = results.flat().filter(Boolean);
        return allMarketingData;
      } catch (error) {
        console.error("Error fetching all marketing data:", error);
        return [];
      }
    }

    // For types 6, 7, and 8, all will get categoryNumber=6 for Google Sheets
    const fetchPromises = targetCities.map(city =>
      fetchData(city, startDate, endDate, type)
    );

    try {
      const results = await Promise.all(fetchPromises); // Parallel fetching

      // Flatten the array of arrays
      const allMarketingData = results.flat().filter(Boolean); 

      return allMarketingData;
    } catch (error) {
      console.error("Error fetching all marketing data:", error);
      return [];
    }
  };

  // New function to fetch orders by type with date filtering
  const fetchOrdersByType = async (orderType) => {
    const payload = {
      page: 1,
      per_page: 1000,
      status: 1,
      order_locality: "",
      type: orderType,
    };

    if (startDate) {
      payload.start_createdAt = startDate;
    }
    if (endDate) {
      const endDatePlusOne = new Date(endDate);
      endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
      payload.end_createdAt = endDatePlusOne.toISOString().split('T')[0];
    }

    const { data } = await axios.post(BASE_URL + ADMIN_ORDER_LIST, payload);
    return data.data?.order || [];
  };

  const fetchAllOrders = async () => {
    setLoading(true);

    if (!selectedKey) {
      alert("Please select an order type first.");
      setLoading(false);
      return;
    }

    try {
      let ordersData = [];
      let marketingResult = [];

      // Handle type 8 (Food Delivery + Live Catering) - fetch both types and combine
      if (selectedKey === "8") {
        console.log("Fetching data for type 8 (Food Delivery + Live Catering) - calling both type 6 and 7");
        
        // Fetch orders for both types
        const [ordersType6, ordersType7] = await Promise.all([
          fetchOrdersByType(6),
          fetchOrdersByType(7)
        ]);
        
        // Combine orders from both types
        ordersData = [...ordersType6, ...ordersType7];
        
        // For marketing data, pass type 8 but it will use categoryNumber=6 in Google Sheets
        marketingResult = await fetchAllMarketingData(8); 
        
        console.log("Combined orders for type 8:", ordersData.length);
        console.log("Marketing data for type 8:", marketingResult.length);
        
      } else if (selectedKey === "6") {
        // Handle type 6 (Food Delivery only)
        console.log("Fetching data for type 6 (Food Delivery only)");
        
        ordersData = await fetchOrdersByType(6);
        marketingResult = await fetchAllMarketingData(6);
        
        console.log("Orders for type 6:", ordersData.length);
        console.log("Marketing data for type 6:", marketingResult.length);
        
      } else if (selectedKey === "7") {
        // Handle type 7 (Live Catering only)
        console.log("Fetching data for type 7 (Live Catering only)");
        
        ordersData = await fetchOrdersByType(7);
        marketingResult = await fetchAllMarketingData(7);
        
        console.log("Orders for type 7:", ordersData.length);
        console.log("Marketing data for type 7:", marketingResult.length);
        
      } else if (selectedKey === "all") {
        // Handle "all" case
        const payload = {
          page: 1,
          per_page: 1000,
          status: 1,
          order_locality: "",
        };

        if (startDate) {
          payload.start_createdAt = startDate;
        }
        if (endDate) {
          const endDatePlusOne = new Date(endDate);
          endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
          payload.end_createdAt = endDatePlusOne.toISOString().split('T')[0];
        }

        // Don't add type parameter for "all" - this will fetch all order types
        const { data } = await axios.post(BASE_URL + ADMIN_ORDER_LIST, payload);
        ordersData = data.data?.order || [];
        
        // For "all", fetch marketing data for all categories
        marketingResult = await fetchAllMarketingData("all");
        
      } else {
        // Handle other specific types (1, 2, 3, 4, 5)
        const orderType = parseInt(selectedKey);
        ordersData = await fetchOrdersByType(orderType);
        marketingResult = await fetchAllMarketingData(orderType);
      }

      setAllOrders(ordersData);
      setMarketingData(marketingResult);
      setShowTable(true);
      
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
    setLoading(false);
  };

  const getFilteredOrders = () => {
    return allOrders;
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

  // Custom function to get order type names including the new type 8
  const getCustomOrderType = (value) => {
    if (value === 8) {
      return "Food Delivery + Live Catering";
    }
    return getOrderType(value);
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
        Order Split by City  <span style={{fontSize: "10px"}}>(CreatedAt date)</span>
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
            {[...Array(5)].map((_, i) => {
              const value = i + 1;
              return (
                <option key={value} value={value}>
                  {getCustomOrderType(value)}
                </option>
              );
            })}
            {/* Separate options for Food Delivery and Live Catering */}
            <option value="6">Food Delivery</option>
            <option value="7">Live Catering</option>
            {/* Combined option */}
            <option value="8">Food Delivery + Live Catering</option>
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
                
                console.log(
                  `City: ${city}, Total Order Amount: ${data.totalOrderAmount}`
                );
                console.log("Marketing Cost:", data.marketingCost);
                const marketingContributionRatio =
                  data.totalOrderAmount > 0
                    ? data.marketingCost / data.totalOrderAmount
                    : 0;
                console.log("Marketing Contribution Ratio:", marketingContributionRatio);

                const marketingContributionPercentage = marketingContributionRatio * 100;

                console.log("Marketing Contribution Percentage:", marketingContributionPercentage + "%");

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