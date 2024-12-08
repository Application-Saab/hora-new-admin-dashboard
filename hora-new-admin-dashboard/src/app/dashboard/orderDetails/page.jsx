"use client";
import React, { useState, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import Popup from "../../component/Popup";
import ActionPopup from "../../component/ActionPop";
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
  const [selectedOffcusNum, setSelectedOffcusNum] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedOrderType, setSelectedOrderType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedOrderStatus, setSelectedOrderStatus] = useState("");
  const [actionPopupOrderId, setActionPopupOrderId] = useState("");
  const [actionPopupOrderType, setActionPopupOrderType] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [createdAtStart, setCreatedAtStart] = useState("");
  const [createdAtEnd, setCreatedAtEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phoneSearchTerm, setPhoneSearchTerm] = useState("");
  const [supplierDetails, setSupplierDetails] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const fetchOrders = async (page, orderId = '', status = '', orderType = '', orderCity = '', selectedDate = '' , selectedOfflineNum = '') => {
    console.log("Selected Date in fetchOrders:", selectedOfflineNum);  // Log the selected date for debugging
    setLoading(true);
    setProgress(0);
  
    // Handle orderType mapping
    let typeId;
    switch (orderType) {
      case "Decoration":
        typeId = 1;
        break;
      case "Chef":
        typeId = 2;
        break;
      case "Food Delivery":
        typeId = 6;
        break;
      case "Live Catering":
        typeId = 7;
        break;
      default:
        typeId = null; // or another default value if needed
    }
  
    const url = `${BASE_URL}${ADMIN_ORDER_LIST}`;
  
    // `newId` calculation - update this based on actual use case, or use `orderId` directly if needed
    let newId = Math.abs(orderId - 10800);  // Confirm if this is needed or if `orderId` should be used as is
  
    // Prepare requestData
    let requestData = {
      page: page,
      per_page: itemsPerPage,
      order_id: orderId.length > 0 ? newId : "", // Conditionally set order_id if `orderId` exists
      order_status: status ? Number(status) : "", // Convert status to number, or use empty string if invalid
      type: typeId || "", // Use typeId if available
      order_locality: orderCity || "",
      order_date: selectedDate || "" ,
      phone_no: selectedOfflineNum || ""
    };
  
    console.log(requestData);  // Log the request data for debugging
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
  
      if (response.status === 200) {
        // Success - handle valid response
        const data = await response.json();
        console.log("Fetched Orders:", data);
  
        if (data && data.data && data.data.order) {
          setOrders(data.data.order);
          setTotalPage(data.data.paginate.last_page);
        } else {
          // No orders found, show an alert with a message
          alert("No orders found.");
          console.warn("No orders found");
        }
      } 
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Show an alert with the error message
      alert(`Error fetching orders: ${error.message}`);
    } finally {
      setProgress(100);
      setTimeout(() => setLoading(false), 500);
    }
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
    fetchOrders(currentPage, searchTerm, selectedOrderStatus, selectedOrderType, selectedCity , selectedDate, selectedOffcusNum);
  }, [currentPage, searchTerm ,selectedOrderStatus, selectedOrderType, selectedCity , selectedDate  , selectedOffcusNum]);

  useEffect(()=> {
    for(let i = 0; i < orders.length;i++) {
      if(!orders[i].phone_no) {
      orders[i].online_phone_number = getOnlineCustomerNumber(orders[i].fromId);
      }
    }
  }, [orders]);

  // useEffect(() => {
  //   const filtered = orders.filter(order => {
  //     const phoneNumber = String(order.phone_no || ''); // Convert phone_no to string
  //     const onlinePhoneNumber = String(order.online_phone_number || ''); // Convert online_phone_number to string
  
  //     const matchesSearchTerm = order.order_id.toString().includes(searchTerm);
  
  //     // Check if phone search term exists in phone numbers
  //     const matchesPhoneSearchTerm = phoneNumber.includes(phoneSearchTerm) || onlinePhoneNumber.includes(phoneSearchTerm);
  
  //     return matchesSearchTerm && matchesPhoneSearchTerm;
  //   });
  
  //   setFilteredOrders(filtered);  // Set filtered orders
  // }, [searchTerm, phoneSearchTerm, orders]);
  

  const FilterSearch = (id) => {
    setSearchTerm(id);
    fetchOrders(currentPage, id, selectedOrderStatus, selectedOrderType, selectedCity , selectedOffcusNum);
  };
  const FilterByStatus = (status) => {
    setSelectedStatus(status);
    fetchOrders(currentPage, searchTerm, status, selectedOrderType, selectedCity , selectedOffcusNum);
  };
const FilterByType = (selectedType) => {
  setSelectedOrderType(selectedType);
  fetchOrders(currentPage, searchTerm, selectedOrderStatus, selectedType, selectedCity, selectedOffcusNum);
};
const FilterByCity = (selectedCity) => {
  setSelectedCity(selectedCity);
  fetchOrders(currentPage, searchTerm, selectedOrderStatus, selectedOrderType, selectedCity, selectedOffcusNum);
};

// const FilterByOfflineCustomer = (selectedOfflineNum) => {
//   setSelectedOffcusNum(selectedOfflineNum);
//   fetchOrders(currentPage, searchTerm, selectedOrderStatus, selectedOrderType, selectedCity, selectedOffcusNum);
// }


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
  
  const openActionPopup = (orderId, orderType) => {
    setActionPopupOrderId(orderId);
    setActionPopupOrderType(orderType)
    setPopupOpen(true); // Open the popup
  };

  const closePopup = () => {
    setPopupOpen(false); // Close the popup
    setOrderDetails(null); // Clear selected order details
  };

  return (
    <div className="orderDetailsList">
        <div className="order-list-container">
          <div className="order-header">
            <h2>Order Details</h2>
          </div>
          <div className="filter-container">
            <div className="left">
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
              {/* <button onClick={() => FilterSearch(searchTerm)}>Search</button> */}
              
                </div>
                </div>
              {/* Phone Number Search */}
          <div>
          <input
                type="text"
                className="small-search byPhone"
                placeholder="Search by offline customer"
                value={selectedOffcusNum}

                onChange={(e) => 
                  setSelectedOffcusNum(e.target.value)
                     
                }
                />
              {/* <button onClick={() => FilterByOfflineCustomer(selectedOffcusNum)}>Search</button> */}
              <input
                type="text"
                className="small-search byPhone"
                placeholder="Search by online customer"
                value={selectedOffcusNum}

                onChange={(e) => 
                  setSelectedOnlinecusNum(e.target.value)
                     
                }
                />
          </div>
          <div className="date-filter-box">
  <div className="date-filter-container">
    <div className="date-input-container">
      <label className="date-label">Order Date</label>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}  // Update the selectedDate state
        placeholder="Select Date"
        className="date-input"
      />
    </div>
  </div>
</div>
          </div> 
          <div className="right">
     

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
  onChange={(e) => {
    const newOrderType = e.target.value;
    setSelectedOrderType(newOrderType);
    FilterByType(newOrderType); // Trigger the filter
  }}
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
                        onChange={(e) => {
                          const newOrderCity = e.target.value; // Get the updated value directly
                          setSelectedCity(newOrderCity);  // Update state
                          FilterByCity(newOrderCity);          // Pass the updated value immediately
                        }}
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
                  <th>Fulfillment Time</th>
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
                        <option value="0">Booked</option>                       
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
                      ? `${order.order_date.split("T")[0]}`
                      : "N/A"}
                      </td>
                      <td>
                      {order?.order_time
                      ? `${order.order_time}` // If `order_time` is available, show it
                      : order?.order_date
                      ? `${order.order_date.split("T")[1].slice(0, 8)}`
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
                            openActionPopup( order.order_id, order.type )
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



{/* 
  {filteredOrders.length > 0 ? (
    filteredOrders.map((order, index) => (
      <tr key={index}>
        <td>{getOrderId(order.order_id)}</td>
        <td>{getOrderType(order.type)}</td>
        <td>{order.order_locality || "N/A"}</td>
        <td>{order?.order_date ? `${order.order_date.split("T")[0]}` : "N/A"}</td>
        <td>{order?.order_time ? `${order.order_time}` : order?.order_date ? `${order.order_date.split("T")[1].slice(0, 8)}` : "N/A"}</td>
        <td>{order.otp}</td>
        <td>{order.order_taken_by || "N/A"}</td>
        <td>{order.phone_no || "N/A"}</td>
        <td>{order.online_phone_number || "N/A"}</td>
        <td>
          {order.toId ? (
            <FaEye onClick={() => openSupplierPopup(order.toId)} />
          ) : (
            <p>NA</p>
          )}
        </td>
        <td>{`${order.job_start_time.replace(/(\d{4})(\d{1,2}:\d{2}:\d{2} (AM|PM))/, '$1 $2')} - ${order.job_end_time}`}</td>
        <td>₹{order.total_amount}</td>
        <td>
          <span className={`status ${getOrderStatus(order.order_status).className}`}>
            {getOrderStatus(order.order_status).status}
          </span>
        </td>
        <td>{new Date(order.createdAt).toLocaleString()}</td>
        <td>
          <div style={styles.container}>
            <div onClick={() => handleCallClick(order.phone_no)}>N/A</div>
            <div style={styles.btnGroup}></div>
          </div>
        </td>
        <td>
          <button
            className={`status-button ${order.status === 0 ? "active" : "inactive"}`}
            onClick={() => updateOrderStatus(order._id, order.status === 1 ? 0 : 1)}
          >
            {order.status === 1 ? "Active" : "Inactive"}
          </button>
        </td>
        <td>
          <FaEye onClick={() => openActionPopup(order.order_id, order.type)} />
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="13">No orders found</td>
    </tr>
  )} */}


              </tbody>
            </table>
          </div>

          <ActionPopup
          isOpen={popupOpen}
          actionPopupOrderId={actionPopupOrderId}
          actionPopupOrderType={actionPopupOrderType}
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
