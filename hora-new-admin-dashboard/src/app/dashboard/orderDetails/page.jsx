"use client";
import React, { useState, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import Popup from "../../../pages/popup/Popup";
import ActionPopup from "../../../pages/popup/ActionPop";
import "./orderdetails.css";
import {
  BASE_URL,
  ADMIN_USER_DETAILS,
  ADMIN_ORDER_LIST,
} from "../../../utils/apiconstant";
import axios from "axios";
// import * as XLSX from "xlsx";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  // const [setTotalItems] = useState(0);
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

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phoneSearchTerm, setPhoneSearchTerm] = useState("");

  const [supplierDetails, setSupplierDetails] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const fetchOrders = async (page , orderId = '' ,status = '' ) => {
    setLoading(true);
    setProgress(0);
    const url = `${BASE_URL}${ADMIN_ORDER_LIST}`;
    let newId  = Math.abs(orderId - 10800);


    let requestData = {
      page: page,
      per_page: itemsPerPage,
      order_id: searchTerm.length > 0 ? newId : "", // Conditionally set order_id
      order_status : Number(status ) || "",
    };
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data.data)
      if (data && data.data && data.data.order) {
        setOrders(data.data.order);
        setTotalPage(data.data.paginate.last_page);
      } else {
        console.warn("No orders found in response data");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } 
    // finally {
    //   setProgress(100);
    //   setTimeout(() => setLoading(false), 500);
    // }
  };

  const getOnlineCustomerNumber = async (onlineCustomerId) => {
  
    const url = `${BASE_URL}${ADMIN_USER_DETAILS}${onlineCustomerId}`;
    try {
      const response = await axios.get(url);
      const phone = response.data.data.phone;
  
      return phone;
    } catch (error) {
      console.error("Error fetching customer data:", error);
      return null;
    }
  
  };

  useEffect(() => {
   
    fetchOrders(currentPage);
  }, [currentPage]);

  useEffect(()=> {
    for(let i = 0; i < orders.length;i++) {
      if(!orders[i].phone_no) {
      orders[i].online_phone_number = getOnlineCustomerNumber(orders[i].fromId);
      }
    }
  }, [orders]);

const FilterSearch = (id) => {
  setSearchTerm(id)
  fetchOrders(currentPage ,searchTerm)
};
const FilterByStatus = (status) => {
  console.log(status)
  fetchOrders(currentPage ,'' ,status)
};
const FilterByCity = (selectedCity) => {
  fetchOrders(currentPage ,'' ,'', selectedCity)
}


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



  const getOrderType = (orderTypeValue) => {
    const orderTypes = {
      1: "Decoration",
      2: "Chef",
      6: "Food Delivery",
      7: "Live Catering",
    };
    return orderTypes[orderTypeValue] || "Unknown Order Type";
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(
        "https://horaservices.com:3000/api/order/update_order_status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ _id: orderId, status: status }),
        }
      );

      // const data = await response.json();

      if (response.ok) {
        fetchOrders();
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
  const openActionPopup = (currentId) => {
    // Find the specific order using find() instead of filter()
    const selectedOrder = orders.find(order => order.order_id === currentId);
  
    if (selectedOrder) {
      // Perform actions with the found order if needed
      console.log("Selected Order:", selectedOrder);
      setOrderDetails(selectedOrder)
      // setPopupType(popupTypeValue); // Assuming popupTypeValue is defined
      setPopupOpen(true);
    } else {
      console.warn("No matching order found!");
    }
  };



  const closePopup = () => {
    setPopupOpen(false);
    setSelectedAddress("");
    setIsPopupOpen(false);
    setSupplierDetails(null);
  };
  return (
    <div className="orderDetailsList">
      {/* {loading ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
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
              width: "20%",
              height: "10px",
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
      ) :
       <> */}
        <div className="order-list-container">
          <div className="order-header">
            <h2>Order Details</h2>
          </div>

          <div className="search-download-container">
            <div className="search-box">
              <input
                type="text"
                className="small-search byId"
                placeholder="Search by Order ID"
                value={searchTerm}
                onChange={(e) => 
                  setSearchTerm(e.target.value)
                     
                }
                />
              <button onClick={() => FilterSearch(searchTerm)}>Search</button>
              

              {/* Phone Number Search */}
              {/* <input
                type="text"
                className="small-search byPhone"
                placeholder="Search by Phone Number"
                value={phoneSearchTerm}
                onChange={(e) => setPhoneSearchTerm(e.target.value)}
              /> */}

              {/* Start Date and End Date Box */}
              {/* <div className="date-filter-box">
                <h3 className="date-filter-title">Start & End Date</h3> 
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
              </div> */}

              {/* Created At Date Box */}
                {/* <div className="date-filter-box">
                  <h3 className="date-filter-title">Created At Date</h3>
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
                </div> */}
            </div>
          </div>

          <div className="orders-box">
            {/* <button className="red-button" onClick={exportToExcel}>
              Download Excel
            </button> */}

            <table className="order-table">
              <thead>
                <tr>
                  <th>Order Id</th>
                  <th className="order-type-header">
                    <span> Order Type</span>
                    <span>
                      {" "}
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
                    </span>
                  </th>

                  <th className="order-type-header">
                    <span> City</span>
                    <span>
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
                    </span>
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
                    <span>Order Status</span>
                    <span>
                      <select
                        value={selectedOrderStatus}
                        onChange={(e) => {
                          const newStatus = e.target.value; // Get the updated value directly
                          setSelectedOrderStatus(newStatus);  // Update state
                          FilterByStatus(newStatus);          // Pass the updated value immediately
                        }}
                        className="order-type-dropdown"
                      >
                        <option value="">All</option>
                        <option value="0">Booking</option>                       
                        <option value="1">Accepted</option>
                        <option value="2">In-progress</option>
                        <option value="3">Completed</option>
                        <option value="6">Expired</option>
                        <option value="4">Cancelled</option>
                      </select>
                    </span>
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
                      <option value="All">All</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>

                {orders.length > 0 ? (
                  orders.map((order, index) => (

                    <tr key={index}>
                      <td>{getOrderId(order.order_id)}</td>
                      <td>{getOrderType(order.type)}</td>
                      <td>{order.order_locality || "N/A"}</td>
                      <td>
                        {order?.order_date
                          ? `${order.order_date.split("T")[0]} ${order.order_time || ""
                          }`
                          : "N/A"}
                      </td>
                      <td>{order.otp}</td>
                      <td>{order.order_taken_by || "N/A"}</td>
                      <td>{order.phone_no || "N/A"}</td>
                       <td>{order.online_phone_number || "N/A"}</td>
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
                              <p>Name: {supplierDetails.data.name}</p>
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
                            background: rgba(0, 0, 0, 0.2);
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

                      <td>
                        {`${order.job_start_time.replace(/(\d{4})(\d{1,2}:\d{2}:\d{2} (AM|PM))/, '$1 $2')} - 
    ${order.job_end_time}`}
                      </td>

                      <td>₹{order.total_amount}</td>

                      <td>
                        <span
                          className={`status ${getOrderStatus(order.order_status).className
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
                          <div style={styles.btnGroup}>
                          </div>
                        </div>
                      </td>
                      <td>
                        <button
                          className={`status-button ${order.status === 0 ? "active" : "inactive"
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
                          onClick={() =>{
                            console.log('ji')
                            openActionPopup(
                              order.order_id,
                              
                            )
                           } }
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



          {/* <Popup
            isOpen={popupOpen}
            address={selectedAddress}
            onClose={closePopup}
          /> */}
          <ActionPopup
            isOpen={popupOpen}
            orderDetails={orderDetails}
            popupType={popupType}
            onClose={closePopup}
          />
        </div>
        {/* pagination */}
        <div className="orderDetails_pagination">
          <button
            onClick={() => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))}
            disabled={currentPage === 1} // Disable Previous button on first page
          >
            {"<"} 
          </button>
          <span> Page {currentPage} of {totalPage} </span>
          <button
            onClick={() => setCurrentPage((prevPage) => prevPage + 1)}
            disabled={currentPage === totalPage} // Disable Next button on last page
          >
            {">"}
          </button>
        </div>

      {/* </>} */}
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
