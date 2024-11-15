"use client";
import React, { useState, useEffect } from "react";
import { FaEye, FaChevronLeft, FaChevronRight, FaPhone } from "react-icons/fa";
import Popup from "../../../pages/popup/Popup";
import ActionPopup from "../../../pages/popup/ActionPop";
import "./orderdetails.css";
import {
  BASE_URL,
  ADMIN_USER_DETAILS,
  ADMIN_ORDER_LIST,
} from "../../../utils/apiconstant";
import axios from "axios";
import * as XLSX from "xlsx";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const [popupType, setPopupType] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedOrderType, setSelectedOrderType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedOrderStatus, setSelectedOrderStatus] = useState("");

  const [selectedCity, setSelectedCity] = useState("");

  const [createdAtStart, setCreatedAtStart] = useState("");
  const [createdAtEnd, setCreatedAtEnd] = useState("");

  const getOnlineCustomerNumber = (onlineCustomerId) => {
    const url = `${BASE_URL}${ADMIN_USER_DETAILS}${onlineCustomerId}`;
    return axios
      .get(url)
      .then((response) => {
        return response.data.data.phone;
      })
      .catch((error) => {
        console.error("Error fetching customer data:", error);
        return null;
      });
  };

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fetchOrders = async () => {
    setLoading(true);
    setProgress(0);

    const url = `${BASE_URL}${ADMIN_ORDER_LIST}`;
    console.log("Fetching orders from URL:", url);

    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 90) return prevProgress;
        return prevProgress + 1;
      });
    }, 30);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page: 1,
          per_page: 10,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.data && data.data.order) {
        const ordersWithPhoneNumbers = await Promise.all(
          data.data.order.map(async (order) => {
            const phoneNumber = await getOnlineCustomerNumber(order.fromId);
            return {
              ...order,
              phone_number: phoneNumber,
            };
          })
        );

        setOrders(ordersWithPhoneNumbers);
        setFilteredOrders(ordersWithPhoneNumbers);
      } else {
        console.warn("No orders found in response data");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      clearInterval(progressInterval);
      setProgress(100); 
      setTimeout(() => setLoading(false), 500); 
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const [phoneSearchTerm, setPhoneSearchTerm] = useState("");

  useEffect(() => {
    const filtered = orders.filter((order) => {
      const matchesSearch = order.order_id.toString().includes(searchTerm);

      const matchesPhoneNumber =
        (order.phone_number && order.phone_number.includes(phoneSearchTerm)) ||
        (order.phone_no && order.phone_no.includes(phoneSearchTerm));

      const orderCreatedAt = new Date(order.createdAt);
      const orderDate = new Date(order.order_date.split("T")[0]);
      const matchesDateRange =
        (!startDate || orderDate >= new Date(startDate)) &&
        (!endDate || orderDate <= new Date(endDate));

      const matchesCreatedAtRange =
        (!createdAtStart || orderCreatedAt >= new Date(createdAtStart)) &&
        (!createdAtEnd || orderCreatedAt <= new Date(createdAtEnd));

      const matchesOrderType =
        !selectedOrderType || getOrderType(order.type) === selectedOrderType;
      const matchesStatus =
        !selectedStatus ||
        (selectedStatus === "Active" && order.status === 1) ||
        (selectedStatus === "Inactive" && order.status === 0);
      // const matchesOrderStatus =
      //   !selectedOrderStatus ||
      //   (selectedOrderStatus === "Booking" && order.order_status === 0) ||
      //   (selectedOrderStatus === "Expired" && order.order_status === 1);
      const matchesOrderStatus =
        !selectedOrderStatus ||
        (selectedOrderStatus === "Booking" && order.order_status === 0) ||
        (selectedOrderStatus === "Accepted" && order.order_status === 1) ||
        (selectedOrderStatus === "In-progress" && order.order_status === 2) ||
        (selectedOrderStatus === "Completed" && order.order_status === 3) ||
        (selectedOrderStatus === "Cancelled" && order.order_status === 4) ||
        (selectedOrderStatus === "Expired" && order.order_status === 6);

      const matchesCity =
        !selectedCity || order.order_locality === selectedCity;

      return (
        matchesSearch &&
        matchesPhoneNumber &&
        matchesDateRange &&
        matchesCreatedAtRange &&
        matchesOrderType &&
        matchesStatus &&
        matchesOrderStatus &&
        matchesCity
      );
    });
    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [
    searchTerm,
    phoneSearchTerm,
    startDate,
    endDate,
    createdAtStart,
    createdAtEnd,
    selectedOrderType,
    selectedStatus,
    selectedOrderStatus,
    selectedCity,
    orders,
  ]);

  const getOrderStatus = (orderStatusValue) => {
    switch (orderStatusValue) {
      case 0:
        return { status: "Booked", className: "status-booked" };
      case 1:
        return { status: "Accepted", className: "status-accepted" };
      case 2:
        return { status: "In-progress", className: "status-in-progress" };
      case 3:
        return { status: "Completed", className: "status-completed" };
      case 4:
        return { status: "Cancelled", className: "status-cancelled" };
      case 5:
        return { status: "", className: "status-empty" };
      case 6:
        return { status: "Expired", className: "status-expired" };
      default:
        return { status: "Unknown", className: "status-unknown" };
    }
  };

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  console.log(totalPages,"totalpages");
  const displayedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getOrderType = (orderTypeValue) => {
    const orderTypes = {
      1: "Decoration",
      2: "Chef",
      6: "Food Delivery",
      7: "Live Catering",
    };
    return orderTypes[orderTypeValue] || "Unknown Order Type";
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

  const handleCallingStatus = (event, phone_no) => {
    const selectedValue = event.target.value;

    if (selectedValue === "one") {
      alert(`You selected One! Phone number: ${phone_no}`);
    } else if (selectedValue === "two") {
      alert(`You selected Two! Phone number: ${phone_no}`);
    } else if (selectedValue === "three") {
      alert(`You selected Three! Phone number: ${phone_no}`);
    }
  };

  const sendWelcomeMessage = async (mobileNumber) => {
    let formattedMobileNumber = mobileNumber;

    if (!formattedMobileNumber.startsWith("+91")) {
      formattedMobileNumber = "+91" + formattedMobileNumber;
    }

    formattedMobileNumber = formattedMobileNumber.replace(/\s+/g, "");

    console.log(
      "Sending WhatsApp message to mobile number:",
      formattedMobileNumber
    );

    const options = {
      method: "POST",
      url: "https://public.doubletick.io/whatsapp/message/template",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: "key_wZpn79uTfV",
      },
      data: {
        messages: [
          {
            content: {
              language: "en",
              templateData: {
                header: {
                  type: "IMAGE",
                  mediaUrl:
                    "https://quickscale-template-media.s3.ap-south-1.amazonaws.com/org_FGdNfMoTi9/2a2f1b0c-63e0-4c3e-a0fb-7ba269f23014.jpeg",
                },
                body: { placeholders: ["Hora Services"] },
              },
              templateName: "order_confirmation_message__v3",
            },
            from: "+917338584828",
            to: formattedMobileNumber,
          },
        ],
      },
    };

    try {
      const response = await axios.request(options);
      console.log("WhatsApp message response:", response.data);
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
    }
  };

  const showAlert = (status) => {
    alert(`Selected status: ${status}`);
  };

  const handleCallClick = (phoneNo) => {
    window.location.href = `tel:${phoneNo}`;
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const headers = [
      "Order Id",
      "Order Type",
      "City",
      "Fulfillment Date",
      "Otp",
      "Offline Customer No",
      "Online Customer No",
      "Supplier",
      "Order Start & End Time",
      "Total Amount",
      "Order Status",
      "Created",
      "Calling Status",
      "Status",
      "Action",
    ];

    const formattedData = filteredOrders.map((order) => ({
      "Order Id": order.order_id,
      "Order Type": getOrderType(order.type),
      City: order.order_locality || "N/A",
      "Fulfillment Date": `${order.order_date.split("T")[0]} ${
        order.order_time
      }`,
      Otp: order.otp,
      "Offline Customer No": order.phone_no || "N/A",
      "Online Customer No": order.phone_number || "N/A",
      Supplier: order.supplier ? order.supplier : "NA",
      "Order Start & End Time": `${order.start_time} - ${order.end_time}`,
      "Total Amount": order.total_amount,
      "Order Status": getOrderStatus(order.order_status).status,
      Created: new Date(order.createdAt).toLocaleString(),
      "Calling Status": order.calling_status || "N/A",
      Status: order.status === 1 ? "Active" : "Inactive",
      Action: "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData, { header: headers });
    XLSX.utils.book_append_sheet(wb, ws, "Filtered Orders");
    XLSX.writeFile(wb, "file.xlsx");
  };


   const handlePageChange = (page) => {
  if (page > 0 && page <= totalPages) {
    console.log(`Changing to page ${page}`);
    setCurrentPage(page);
  } else {
    console.warn(`Page ${page} is out of bounds. Must be between 1 and ${totalPages}`);
  }
};



  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(
        "https://horaservices.com:3000/api/order/update_order_status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // "Authorization": token
          },
          body: JSON.stringify({ _id: orderId, status: status }),
        }
      );

      const data = await response.json();

      console.log("API Response:", data);

      if (response.ok) {
        fetchOrders();
        console.log("Order status updated successfully!");
      } else {
        console.error("Failed to update order status.");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };


  const getOrderId = (e) => {
    const orderId1 = 10800 + e;
    const updateOrderId = "#" + orderId1;
    return updateOrderId;
  };

  return (
    <div>
      {loading ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            color: "#fff",
            fontSize: "1.5em",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "80%",
              height: "20px",
              backgroundColor: "#444",
              borderRadius: "10px",
              overflow: "hidden",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: "#4caf50",
                transition: "width 0.3s ease",
              }}
            ></div>
          </div>
          <div>Loading... {progress}%</div>
        </div>
      ) : (
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

              {/* Phone Number Search */}
              <input
                type="text"
                className="small-search"
                placeholder="Search by Phone Number"
                value={phoneSearchTerm}
                onChange={(e) => setPhoneSearchTerm(e.target.value)}
              />

              {/* Start Date and End Date Box */}
              <div className="date-filter-box">
                {/* <h3 className="date-filter-title">Start & End Date</h3> */}
                <div className="date-filter-container">
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
              </div>

              {/* Created At Date Box */}
              <div className="date-filter-box">
                {/* <h3 className="date-filter-title">Created At Date</h3> */}
                <div className="date-filter-container">
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
            </div>
          </div>

          <div className="orders-box">
            <button className="red-button" onClick={exportToExcel}>
              Download Excel
            </button>

            <table className="order-table">
              <thead>
                <tr>
                  <th>Order Id</th>
                  <th className="order-type-header">
                    Order Type
                    <select
                      value={selectedOrderType}
                      onChange={(e) => setSelectedOrderType(e.target.value)}
                      className="order-type-dropdown"
                    >
                      <option value="">All</option>
                      <option value="Decoration">Decoration</option>
                      <option value="Chef">Chef</option>
                      <option value="Food Delivery">Food Delivery</option>
                      <option value="Live Catering">Live Catering</option>
                    </select>
                  </th>

                  <th className="order-type-header">
                    City
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="order-type-dropdown"
                    >
                      <option value="">All</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi">Delhi</option>
                    </select>
                  </th>
                  <th>Fulfillment Date</th>
                  <th>Otp</th>
                  <th>Order Taken By</th>
                  <th>Offline Customer No</th>
                  <th>Online Customer No</th>
                  <th>Supplier</th>
                  <th>Order Start & End Time</th>
                  <th>Total Amount</th>
                  <th className="order-type-header">
                    Order Status
                    <select
                      value={selectedOrderStatus}
                      onChange={(e) => setSelectedOrderStatus(e.target.value)}
                      className="order-type-dropdown"
                    >
                      <option value="">All</option>
                      <option value="Booking">Booking</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </th>
                  <th>Created</th>
                  <th>Calling Status</th>
                  <th className="order-type-header">
                    Status
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="order-type-dropdown"
                    >
                      <option value="">All</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedOrders.length > 0 ? (
                  displayedOrders.map((order, index) => (
                    <tr key={index}>
                      <td>{getOrderId(order.order_id)}</td>
                      <td>{getOrderType(order.type)}</td>
                      <td>{order.order_locality || "N/A"}</td>
                      <td>
                        {order.order_date.split("T")[0]} {order.order_time}
                      </td>
                      <td>{order.otp}</td>
                      <td>"N/A"</td>
                      <td>{order.phone_no || "N/A"}</td>
                      {/* <td>
                    <FaEye
                      onClick={() => getOnlineCustomerNumber(order.fromId)}
                    />
                  </td> */}
                      <td>{order.phone_number || "N/A"}</td>
                      {/* <td>{order.supplierUserIds.join(", ") || "N/A"}</td> */}
                      <td>
                        {order.toId ? (
                          <FaEye
                            onClick={() => openSupplierPopup(order.toId)}
                          />
                        ) : (
                          <p>NA</p>
                        )}

                        {isPopupOpen && supplierDetails && (
                          <div className="popup-overlay" onClick={closePopup}>
                            <div
                              className="popup"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="close-button"
                                onClick={closePopup}
                              >
                                ×
                              </button>
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
                            position: relative;
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
                      {/* <td>
                    <span
                      className={`status ${
                        order.order_status === 0 ? "booking" : "expired"
                      }`}
                    >
                      {order.order_status === 0 ? "Booking" : "Expired"}
                    </span>
                  </td> */}
                      <td>
                        <span
                          className={`status ${
                            getOrderStatus(order.order_status).className
                          }`}
                        >
                          {getOrderStatus(order.order_status).status}
                        </span>
                      </td>

                      <td>{new Date(order.createdAt).toLocaleString()}</td>
                      <td>
                        <div style={styles.container}>
                          {/* Call Icon */}
                          <div
                            // style={styles.callIcon}
                            onClick={() => handleCallClick(order.phone_no)}
                          >
                            N/A
                            {/* <FaPhone /> */}
                          </div>

                          {/* Buttons for Call Status */}
                          <div style={styles.btnGroup}>
                            {/* <button
                              style={{ ...styles.btn, ...styles.btnCalled }}
                              onClick={() => showAlert("Called")}
                            >
                              Called
                            </button>
                            <button
                              style={{ ...styles.btn, ...styles.btnNotCalled }}
                              onClick={() => showAlert("Not Called")}
                            >
                              Not Called
                            </button>
                            <button
                              style={{
                                ...styles.btn,
                                ...styles.btnNotReceived,
                              }}
                              onClick={() => showAlert("Not Received")}
                            >
                              Not Received
                            </button> */}
                          </div>
                        </div>
                      </td>
                      {/* <td>
                    <button
                      className={`status-button ${
                        order.status === 0 ? "active" : "inactive"
                      }`}
                    >
                      {order.status === 1 ? "Active" : "Inactive"}
                    </button>
                  </td> */}
                      <td>
                        <button
                          className={`status-button ${
                            order.status === 0 ? "active" : "inactive"
                          }`}
                          onClick={() =>
                            updateOrderStatus(
                              order._id,
                              order.status === 1 ? 0 : 1
                            )
                          } // Toggle between 1 and 0
                        >
                          {order.status === 1 ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td>
                        <FaEye
                          onClick={() =>
                            openActionPopup(
                              order.order_id,
                              order.type,
                              order._id
                            )
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
      )}
    </div>
  );
};

export default OrderList;

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  callIcon: {
    fontSize: "24px",
    color: "#007bff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  btnGroup: {
    display: "flex",
    gap: "10px",
  },
  btn: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "20px",
    fontSize: "0.9em",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  btnCalled: {
    backgroundColor: "#28a745",
    color: "white",
  },
  btnNotCalled: {
    backgroundColor: "#ffc107",
    color: "white",
  },
  btnNotReceived: {
    backgroundColor: "#dc3545",
    color: "white",
  },
};
