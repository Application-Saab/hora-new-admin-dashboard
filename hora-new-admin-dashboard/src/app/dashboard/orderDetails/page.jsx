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
  const [searchTerm, setSearchTerm] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const [popupType, setPopupType] = useState("");

  const fetchOrders = async () => {
    const url = `${BASE_URL}${ADMIN_ORDER_LIST}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page: 1,
          per_page: 200, // Load all data initially
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data, "data123");
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

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const filtered = orders.filter((order) =>
      order.order_id.toString().includes(searchTerm)
    );
    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [searchTerm, orders]);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const [supplierDetails, setSupplierDetails] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const openSupplierPopup = async (orderId) => {
    try {
      const response = await fetch(
        `https://horaservices.com:3000/api/admin/getUserDetails/${orderId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }
      const data = await response.json();
      console.log(data, "datasuppopup");
      setSupplierDetails(data);
      setIsPopupOpen(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const openActionPopup = (orderId, orderType, order_Id) => {
    let apiUrl;
    let popupTypeValue;
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
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (!data.error && data.status === 200) {
          setOrderDetails(data.data);
          setPopupOpen(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching order details:", error);
      });
  };

  const closePopup = () => {
    setPopupOpen(false);
    setSelectedAddress("");
    setIsPopupOpen(false);
    setSupplierDetails(null);
  };

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
    return orderTypes[orderTypeValue] || "Unknown Order Type";
  };


    const getOnlineCustomerNumber = (onlineCustomerId) => {
      const url = `${BASE_URL}${ADMIN_USER_DETAILS}${onlineCustomerId}`;
      axios.get(url)
          .then(response => {
              alert("online customer Number:   "+ response.data.data.phone);

          })
          .catch(error => {
              console.error('Error fetching customer data:', error);
              throw error; // Rethrow the error for handling elsewhere if needed
          });
  };


  // Calculate total pages based on filteredOrders
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const displayedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="order-list-container">
      <div className="order-header">
        <h2>Order Details</h2>
      </div>
      <div className="search-download-container">
        <div className="search-box">
          <input
            type="text"
            className="small-search"
            placeholder="Search by Order ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="orders-box">
        <table className="order-table">
          <thead>
            <tr>
              <th>Order Id</th>
              <th>Order Type</th>
              <th>Date & Time</th>
              <th>Otp</th>
              <th>Offline Order No.</th>
              <th>Online Order No.</th>
              <th>Supplier</th>
              <th>Order Start & End Time</th>
              <th>Total Amount</th>
              <th>Order Status</th>
              <th>Created</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {displayedOrders.length > 0 ? (
              displayedOrders.map((order, index) => (
                <tr key={index}>
                  <td>{order.order_id}</td>
                  <td>{getOrderType(order.type)}</td>
                  <td>
                    {order.order_date.split("T")[0]} {order.order_time}
                  </td>
                  <td>{order.otp}</td>
                  <td>{order.phone_no || "N/A"}</td>
                  <td>
                    <FaEye
                      onClick={() => getOnlineCustomerNumber(order.fromId)}
                    />
                  </td>
                  {/* <td>{order.supplierUserIds.join(", ") || "N/A"}</td> */}
                  <td>
                    {order.toId ? (
                      <FaEye onClick={() => openSupplierPopup(order.toId)} />
                    ) : (
                      <p>NA</p>
                    )}

                    {isPopupOpen && supplierDetails && (
                      <div onClick={closePopup}>
                        <div onClick={(e) => e.stopPropagation()}>
                          <button onClick={closePopup}>×</button>
                          <h3>Supplier Details</h3>
                          <p>Name: {supplierDetails.name}</p>
                          <p>Phone: {supplierDetails.data.phone}</p>
                          <p>City: {supplierDetails.data.city}</p>
                          <p>Role: {supplierDetails.data.role}</p>
                        </div>
                      </div>
                    )}

                    <style jsx>{`
                      .popup-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.5);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                      }
                      .popup {
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        max-width: 400px;
                        width: 100%;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                      }
                      .close-button {
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: transparent;
                        border: none;
                        font-size: 18px;
                        cursor: pointer;
                      }
                    `}</style>
                  </td>
                  <td>{"N/A"}</td>
                  <td>₹{order.total_amount}</td>
                  <td>
                    <span
                      className={`status ${
                        order.order_status === 0 ? "booking" : "expired"
                      }`}
                    >
                      {order.order_status === 0 ? "Booking" : "Expired"}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                  <td>
                    <button
                      className={`status-button ${
                        order.status === 0 ? "active" : "inactive"
                      }`}
                    >
                      {order.status === 1 ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td>
                    <FaEye
                      onClick={() =>
                        openActionPopup(order.order_id, order.type, order._id)
                      }
                    />
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
          {Array.from({ length: totalPages }, (_, index) => index + 1)
            .slice(currentPage - 1, currentPage + 14)
            .map((page) => (
              <button
                key={page}
                className={`page-number ${
                  page === currentPage ? "active" : ""
                }`}
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
}

export default OrderList;
