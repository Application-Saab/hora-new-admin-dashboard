"use client";
import React, { useState, useEffect } from "react";
import { FaEye, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Popup from "../../../pages/popup/Popup";
import ActionPopup from "../../../pages/popup/ActionPop";
import "./orderdetails.css";
import {
  BASE_URL,
  ADMIN_USER_DETAILS,
  ADMIN_ORDER_LIST,
} from "../../../utils/apiconstant";
import axios from "axios";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [searchTerm, setSearchTerm] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [onlineCustomerNumbers, setOnlineCustomerNumbers] = useState({});
  const [orderDetails, setOrderDetails] = useState(null);
  const [popupType, setPopupType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [createdAtStart, setCreatedAtStart] = useState("");
  const [createdAtEnd, setCreatedAtEnd] = useState("");

  useEffect(() => {
    const url = `${BASE_URL}${ADMIN_ORDER_LIST}`;

    const fetchOrders = async () => {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page: currentPage,
            per_page: itemsPerPage,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data, "data");

        if (data && data.data && data.data.order) {
          setOrders(data.data.order);
          setTotalItems(data.data.paginate.total_item);
          setFilteredOrders(data.data.order);
        } else {
          console.warn("No orders found in response data");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();

    // Optionally, return a cleanup function if needed
    return () => {
      // Cleanup logic if necessary
    };
  }, [currentPage, itemsPerPage]); // Ensure all relevant dependencies are included

  useEffect(() => {
    if (searchTerm) {
      const filtered = orders.filter((order) =>
        order.order_id.toString().includes(searchTerm)
      );
      setFilteredOrders(filtered);
      setCurrentPage(1);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchTerm, orders]);

 // Fetch customer number and update state
const fetchCustomerNumbers = async () => {
  const updatedCustomerNumbers = {};

  // Loop through all orders and fetch the customer number for each
  for (const order of filteredOrders) {
   
      const url = `${BASE_URL}${ADMIN_USER_DETAILS}${order.fromId}`;
      try {
        const response = await axios.get(url);
        console.log("44444" , response.data.data.phone)
        updatedCustomerNumbers[order._id] = response.data.data.phone;
      } catch (error) {
        console.error("Error fetching customer data for order:", order._id, error);
      }
    
  }

  // Update the state with the fetched customer numbers
  setOnlineCustomerNumbers(updatedCustomerNumbers);
};

useEffect(() => {
  if (filteredOrders.length > 0) {
    fetchCustomerNumbers();
  }
}, [filteredOrders]);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const closePopup = () => {
    setPopupOpen(false);
    setSelectedAddress("");
  };

  const openActionPopup = (orderId, orderType, order_Id) => {
    let apiUrl;
    let popupTypeValue;

    // Determine the API URL based on the order type
    if (orderType === 1) {
      apiUrl = `https://horaservices.com:3000/api/order/order_details_decoration/${orderId}`;
      popupTypeValue = "decoration";
    } else if (orderType === 2) {
      apiUrl = `https://horaservices.com:3000/api/order/order_details/v1/${order_Id}`;
      popupTypeValue = "chef";
    } else if (orderType === 6 || orderType === 7) {
      apiUrl = `https://horaservices.com:3000/api/order/order_details_food_delivery/${orderId}`;
      popupTypeValue = "foodDelivery";
    } else {
      alert("Currently Data is Not Available");
      return;
    }

  setPopupType(popupTypeValue);

    // Fetch order details
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        console.log(data, "data12");
        if (!data.error && data.status === 200) {
          console.log(data.data, "se1");
          console.log(data.data[0], "se2");
          setOrderDetails(data.data);
          setPopupOpen(true);
        } else {
          console.warn("Error fetching order details:", data.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching order details:", error);
      });
  };

  const downloadOrders = () => {
    // Convert orders to CSV format
    const csvRows = [];
    const headers = [
      "Order ID",
      "Date & Time",
      "OTP",
      "Chef",
      "Helper",
      "Offline Order",
      "Online Order",
      "Supplier",
      "Order Address",
      "Start Time",
      "End Time",
      "Total Amount",
      "Status",
      "Created",
    ];
    csvRows.push(headers.join(",")); // Add headers

    filteredOrders.forEach((order) => {
      const row = [
        order.order_id,
        new Date(order.order_date).toLocaleString(),
        order.otp,
        order.chef,
        order.helper,
        order._id || "N/A",
        order.supplierUserIds.join(", ") || "N/A",
        order.addressId.length > 0 ? order.addressId[0].address1 : "N/A",
        order.job_start_time,
        order.job_end_time,
        order.total_amount,
        order.status === 0 ? "Booking" : "Expired",
        new Date(order.createdAt).toLocaleString(),
      ];
      csvRows.push(row.join(","));
    });
  };

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  const getOrderType = (orderTypeValue) => {
    const orderTypes = {
      1: "Decoration",
      2: "Chef",
      3: "Waiter",
      4: "Bar Tender",
      5: "Cleaner",
      6: "Food Delivery",
      7: "Live Catering",
    };

    return orderTypes[orderTypeValue] || "Unknown Order Type"; // Default value if not found
  };

  return (
    <div className="order-list-container">
      <div className="order-header">
        <h2>Order Details</h2>
      </div>

<div className="search-download-container">
  <div className="search-box">
    <input
      type="textS"
      className="small-search"
      placeholder="Search by Order ID"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>

  <div className="date-filter-box">
  <div className="date-filter-container top">
  <div className="date-input-container">
                    <label className="date-label">Start (Fulfillment)</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="Start Date"
                      className="date-input"
                    />
                  </div>

                  <div className="date-input-container">
                    <label className="date-label">End (Fulfillment)</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="End Date"
                      className="date-input"
                    />
                  </div>
    </div>

    

    <div className="date-filter-box">
                  <div className="date-input-container">
                    <label className="date-label">Start (Created)</label>
                    <input
                      type="date"
                      value={createdAtStart}
                      onChange={(e) => setCreatedAtStart(e.target.value)}
                      placeholder="Created At Start"
                      className="date-input"
                    />
                  </div>
                  <div className="date-input-container">
                    <label className="date-label">End (Created)</label>
                    <input
                      type="date"
                      value={createdAtEnd}
                      onChange={(e) => setCreatedAtEnd(e.target.value)}
                      placeholder="Created At End"
                      className="date-input"
                    />
                  </div>
                    </div>
    </div>
  
  <button className="download-button" onClick={downloadOrders}>
    Download All Orders
  </button>
</div>

      <div className="orders-box">
        <table className="order-table">
          <thead>
            <tr>
              <th>Order Id</th>
              <th>Order Type</th>
              <th>Date & Time</th>
              <th>Otp</th>
              <th>Offline Customer No.</th>
              <th>Online Customer No.</th>
              <th>Supplier</th>
              {/* <th>Order Address</th> */}
              <th>Order Start & End Time</th>
              <th>Total Amount</th>
              <th>Order Status</th>
              <th>Created</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => (
                <tr key={index}>
                  <td>{order.order_id}</td>
                  <td>{getOrderType(order.type)}</td>
                  <td>
  {order.order_date.split('T')[0]} {order.order_time}
</td>

                  <td>{order.otp}</td>
                  <td>
                    {order.phone_no || "N/A"}
                  </td>

                  <td>
              {onlineCustomerNumbers[order._id] || "Loading..."}
            </td>


             
                  <td>{order.supplierUserIds.join(", ") || "N/A"}</td>
                  {/* <td>
                    <FaEye
                      onClick={() =>
                        openPopup(
                          order.addressId.length > 0
                            ? order.addressId[0]
                            : { address1: "N/A", address2: "", city: "" }
                        )
                      }
                    />
                  </td> */}
                  <td>
                    {/* {order.job_start_time} to {order.job_end_time} */}
                    {"N/A"}
                  </td>
                  <td>₹{order.total_amount}</td>
                  <td>
                    <span
                      className={`status ${
                        order.status === 0 ? "booking" : "expired"
                      }`}
                    >
                      {order.status === 0 ? "Booking" : "Expired"}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                  <td>
                    <button
                      className={`status-button ${
                        order.order_status === 0 ? "active" : "inactive"
                      }`}
                    >
                      {order.order_status === 0 ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td>
                    <FaEye onClick={() => openActionPopup(order.order_id, order.type, order._id)} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="13">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="horizontal-scroll">
        <FaChevronLeft
          className="scroll-arrow"
          onClick={() => handlePageChange(currentPage - 1)}
        />
        <div className="pagination-slider">
          {pages.slice(currentPage - 1, currentPage + 4).map((page) => (
            <button
              key={page}
              className={`page-number ${page === currentPage ? "active" : ""}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>
        <FaChevronRight
          className="scroll-arrow"
          onClick={() => handlePageChange(currentPage + 1)}
        />
      </div>

      <Popup
        isOpen={popupOpen}
        address={selectedAddress}
        onClose={closePopup}
      />

      <ActionPopup
        isOpen={popupOpen}
        orderDetails={orderDetails}
        popupType={popupType}
        onClose={closePopup}
      />
    </div>
  );
};

export default OrderList;