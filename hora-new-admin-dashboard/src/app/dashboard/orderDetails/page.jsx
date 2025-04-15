"use client";
import React, { useState, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import ActionPopup from "../../component/ActionPop";
import "./orderdetails.css";
import { BASE_URL, ADMIN_ORDER_LIST } from "../../../utils/apiconstant";
// import * as XLSX from "xlsx";
import CheckSupplier from "../../component/createsupplier/CheckSupplier";
import axios from "axios";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  // const [setTotalItems] = useState(0);
  const itemsPerPage = 15;
  const [searchTerm, setSearchTerm] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState("");
  const [selectedOrderType, setSelectedOrderType] = useState("");
  const [selectedActiveStatus, setSelectedActiveStatus] = useState("");
  const [selectedOrderStatus, setSelectedOrderStatus] = useState("");
  const [actionPopupOrderId, setActionPopupOrderId] = useState("");
  const [actionPopupChefOrderId, setActionPopupChefOrderId] = useState("");
  const [actionPopupOrderType, setActionPopupOrderType] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  // supplier
  const [isSupplierAssigned, setIsSupplierAssigned] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplierOrder, setSelectedSupplierOrder] = useState(null);
  const [supplierDetails, setSupplierDetails] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  // vendor amount
  const [showPopup, setShowPopup] = useState(false);
  const [vendorAmount, setVendorAmountInput] = useState("");
  const [orderId1, setOrderId] = useState("");

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [decorationComment, setDecorationComment] = useState("");

  const fetchOrders = async (
    page,
    orderId = "",
    orderstatus = "",
    activeStatus = "",
    orderType = "",
    orderCity = "",
    selectedDate = "",
    selectedOfflineNum = ""
  ) => {
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
      case "Photography":
        typeId = 8;
        break;
      default:
        typeId = null; // or another default value if needed
    }

    const url = `${BASE_URL}${ADMIN_ORDER_LIST}`;

    // `newId` calculation - update this based on actual use case, or use `orderId` directly if needed
    let filteredId = Math.abs(orderId - 10800); // Confirm if this is needed or if `orderId` should be used as is
    // Prepare requestData
    console.log(Number(orderstatus));
    let requestData = {
      page: page,
      per_page: itemsPerPage,
      order_id: orderId.length > 0 ? filteredId : "", // `match orderId`
      order_status:
        Number(orderstatus) === 0 || Number(orderstatus)
          ? Number(orderstatus)
          : "", // 'match OrderStatus'
      status:
        Number(activeStatus) === 0 || Number(activeStatus) === 1
          ? Number(activeStatus)
          : "",
      type: typeId || "", // match order type
      order_locality: orderCity || "",
      order_date: selectedDate || "",
      phone_no: selectedOfflineNum || "",
      // online_phone_no :selectedOfflineNum || "",
    };

    console.log(requestData);

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

        if (data && data.data && data.data.order) {
          setOrders(data.data.order);
          // setTotalPage(data.data.paginate.last_page);
          let totalPages = Math.ceil(
            data.data.paginate.total_item / itemsPerPage
          );
          setTotalPage(totalPages);
        } else {
          // No orders found, show an alert with a message
          setOrders("");
          setTotalPage("");
          console.warn("No orders found");
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Show an alert with the error message
      alert(`Error fetching orders: ${error.message}`);
    } finally {
      console.log("filan");
    }
  };

  useEffect(() => {
    fetchOrders(
      currentPage,
      searchTerm,
      selectedOrderStatus,
      selectedActiveStatus,
      selectedOrderType,
      selectedCity,
      selectedDate,
      selectedPhoneNumber
    );
  }, [
    currentPage,
    searchTerm,
    selectedOrderStatus,
    selectedActiveStatus,
    selectedOrderType,
    selectedCity,
    selectedDate,
    selectedPhoneNumber,
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

  const getOrderType = (orderTypeValue) => {
    const orderTypes = {
      1: "Decoration",
      2: "Chef",
      6: "Food Delivery",
      7: "Live Catering",
      8: "Photography",
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

  const openActionPopup = (orderId, order_id, orderType) => {
    setActionPopupOrderId(orderId);
    setActionPopupChefOrderId(order_id);
    setActionPopupOrderType(orderType);
    setPopupOpen(true); // Open the popup
  };
  const openSupplierDeatilsPopup = async (orderId) => {
    try {
      const response = await fetch(
        `https://horaservices.com:3000/api/admin/getUserDetails/${orderId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }
      const data = await response.json();
      setSupplierDetails(data);
      setIsPopupOpen(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const closePopup = () => {
    setPopupOpen(false);
    setIsPopupOpen(false);
    setSupplierDetails(null);
  };

  const openSupplierAssignPopup = (order) => {
    setSelectedSupplierOrder(order);
    setIsModalOpen(true);
  };

  // const CloseSupplierAssignPopup = () => {
  //   setIsModalOpen(false);
  // };

  const handleOpenEditOrderPopup = (orderId,decoration_comments) => {
    console.log(orderId,"ordereditorder");
    console.log(decoration_comments, "decoration_comments");
    setSelectedOrderId(orderId);
    setDecorationComment(decoration_comments || ""); 
    setIsPopupOpen(true);
  };

  // const handleSave = () => {
  //   console.log("Saved Comment:", decorationComment);
  //   console.log("Order ID:", selectedOrderId);
  //   setIsPopupOpen(false); // Close the popup after saving
  // };
  const handleSave = async () => {
    const requestData = {
      _id: selectedOrderId,
      decoration_comments: decorationComment,
    };

    try {
      const response = await fetch("https://horaservices.com:3000/api/order/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      if (response.ok) {
        console.log("Success:", result);
        alert("Order updated successfully!"); 
      } else {
        console.error("Error:", result);
        alert("Failed to update order.");
      }
    } catch (error) {
      console.error("Request failed:", error);
      alert("Network error, please try again.");
    }

    setIsPopupOpen(false); // Close the popup after saving
  };

  const handleOpenVendorAmountPopup = (orderId) => {
    console.log(orderId, "orderId");
    setOrderId(orderId);
    setShowPopup(true);
  };

  const handleCloseVendorAmountPopup = () => setShowPopup(false);

  const handleSaveVendorAmount = async () => {
    try {
      console.log("Order ID:", orderId1);
      console.log("Vendor Amount:", vendorAmount);

      const requestBody = {
        _id: orderId1,
        vendor_amount: vendorAmount,
      };

      console.log("Request Body:", requestBody);

      const response = await axios.post(
        "https://horaservices.com:3000/api/order/edit",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response:", response.data);

      if (response.status === 200) {
        alert("Vendor amount updated successfully");
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId1
              ? { ...order, vendor_amount: vendorAmount }
              : order
          )
        );
        handleCloseVendorAmountPopup();
        setVendorAmountInput("");
      } else {
        alert("Failed to update vendor amount");
      }
    } catch (error) {
      console.error(
        "Error updating vendor amount:",
        error.response ? error.response.data : error.message
      );
      alert("Error updating vendor amount");
    }
  };

  const StatusDropdown = ({
    selectedActiveStatus,
    setSelectedActiveStatus,
  }) => {
    return (
      <select
        value={selectedActiveStatus}
        onChange={(e) => setSelectedActiveStatus(e.target.value)}
        className="order-type-dropdown"
      >
        <option value="All">All</option>
        <option value="1">Active</option>
        <option value="0">Inactive</option>
      </select>
    );
  };

  return (
    <div className="orderDetailsList">
      <div className="order-list-container">
        <div className="order-header">
          <h1>Order Details</h1>
        </div>
        <div className="filter-wrapper">
          <div className="filter-container">
            <div className="search filter-box">
              <input
                type="text"
                className="small-search byId"
                placeholder="Search by Order ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="phone filter-box">
              <input
                type="text"
                className="small-search byPhone"
                placeholder="Search by Customer Number"
                value={selectedPhoneNumber}
                onChange={(e) => setSelectedPhoneNumber(e.target.value)}
              />
            </div>

            <div className="date filter-box">
              <label className="date-label">Order Fulfillment Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-input"
              />
            </div>

            <div className="right-part">
              <button
                className="filter-btn"
                onClick={() => window.location.reload()}
              >
                Reset All Filters
              </button>
            </div>

            <div className="status-dropdown-container">
              <label htmlFor="statusDropdown" className="status-label">
                Status
              </label>
              <StatusDropdown
                id="statusDropdown"
                selectedActiveStatus={selectedActiveStatus}
                setSelectedActiveStatus={setSelectedActiveStatus}
              />
            </div>
          </div>
        </div>

        <div className="orders-box">
          <table className="order-table">
            <thead>
              <tr style={styles.tableHeading}>
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
                        // FilterByType(newOrderType); // Trigger the filter
                      }}
                      className="order-type-dropdown"
                    >
                      <option value="">All</option>
                      <option value="Decoration">Decoration</option>
                      <option value="Chef">Chef</option>
                      <option value="Food Delivery">Food Delivery</option>
                      <option value="Live Catering">Live Catering</option>
                      <option value="Photography">Photography</option>
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
                        setSelectedCity(newOrderCity); // Update state
                        // FilterByCity(newOrderCity);          // Pass the updated value immediately
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
                <th>Customer No</th>
                {/* <th>Online Customer No</th> */}
                <th>Supplier</th>
                <th>Order Start & End Time</th>
                <th>Total Amount</th>
                <th className="order-type-header">
                  <span>Order Status</span>
                  <span>
                    <select
                      value={selectedOrderStatus}
                      onChange={(e) => {
                        const filterdStatus = e.target.value; // Get the updated value directly
                        setSelectedOrderStatus(filterdStatus); // Update state
                        // FilterByStatus(newStatus);          // Pass the updated value immediately
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
                  {/* <select
                    value={selectedActiveStatus}
                    onChange={(e) => setSelectedActiveStatus(e.target.value)}
                    className="order-type-dropdown"
                  >
                    <option value="All">All</option>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select> */}
                </th>
                <th>Action</th>
                <th>Rating</th>
                <th>Extra Pay</th>
                <th>Edit Order</th>
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
                        ? new Date(
                            order.order_date.split("T")[0]
                          ).toLocaleDateString()
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
                    {/* <td>{order.online_phone_no || "N/A"}</td> */}
                    <td>
                      {order.toId ? (
                        <>
                          <button
                            onClick={() => openSupplierDeatilsPopup(order.toId)}
                            className="assigningBtn assigned"
                          >
                            <FaEye />
                            <span>Assigned</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="assigningBtn not-assigned"
                            onClick={() => openSupplierAssignPopup(order)}
                          >
                            Not Assigned
                          </button>
                          {/* supplier assign popup */}
                          {isModalOpen && selectedSupplierOrder && (
                            <>
                              {console.log(isSupplierAssigned)}
                              <CheckSupplier
                                SelectedOrder={selectedSupplierOrder}
                                setShowModal={setIsModalOpen}
                                setIsSupplierAssigned={setIsSupplierAssigned}
                              />
                            </>
                          )}
                        </>
                      )}
                    </td>
                    <td>
                      {`${order.job_start_time.replace(
                        /(\d{4})(\d{1,2}:\d{2}:\d{2} (AM|PM))/,
                        "$1 $2"
                      )} - 
                               ${order.job_end_time}`}
                    </td>

                    <td>₹{order.total_amount}</td>

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
                        <div onClick={() => handleCallClick(order.phone_no)}>
                          N/A
                          {/* <FaPhone /> */}
                        </div>
                        <div style={styles.btnGroup}></div>
                      </div>
                    </td>
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
                        onClick={() => {
                          openActionPopup(
                            order.order_id,
                            order._id,
                            order.type
                          );
                        }}
                      />
                    </td>
                    <td style={{ width: "100px", paddingLeft: "16px" }}>
                      {order.type === 2 ? (
                        <ul style={{ paddingLeft: "0" }}>
                          {order.userReviewRatingArray.map((i, index) => (
                            <li key={index}>
                              {i.name}-{i.rating}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        order.userReviewRatingArray[0]
                      )}
                    </td>
                    <td>
                      {order.vendor_amount ? (
                        <span>₹{order.vendor_amount}</span>
                      ) : (
                        <button
                          onClick={() => handleOpenVendorAmountPopup(order._id)}
                          style={styles.amountPopupBtn}
                        >
                          Set Vendor Amount
                        </button>
                      )}
                    </td>
                    {/* order._id */}
                    {/* <td>
              <button
                style={styles.editOrderPopupBtn}
                onClick={() => handleOpenEditOrderPopup(order._id, order.decoration_comments)}
              >
                Edit Order
              </button>
            </td> */}
            <td>
  {(() => {
    const now = new Date();
    const orderDate = new Date(order.order_date);

    // Strip the time to compare only the date
    now.setHours(0, 0, 0, 0);
    orderDate.setHours(0, 0, 0, 0);

    // Show button only if order date is in the future
    return orderDate > now;
  })() && (
    <button
      style={styles.editOrderPopupBtn}
      onClick={() =>
        handleOpenEditOrderPopup(order._id, order.decoration_comments)
      }
    >
      Edit Order
    </button>
  )}
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

          {isPopupOpen && (
        <div className="popup-overlay">
      <div className="popup">
        <h2>Edit Order</h2>
        <p>Order ID: {selectedOrderId}</p>
        <h3>Decoration Comments</h3>
        <input
            type="text"
            value={decorationComment}
            onChange={(e) => setDecorationComment(e.target.value)}
            placeholder="Enter decoration comment"
            className="input-field"
          />
          <button onClick={handleSave}>Save</button>
        <button onClick={() => setIsPopupOpen(false)}>Close</button>
      </div>
      </div>
    )}

        </div>

        <ActionPopup
          isOpen={popupOpen}
          actionPopupOrderId={actionPopupOrderId}
          actionPopupChefOrderId={actionPopupChefOrderId}
          actionPopupOrderType={actionPopupOrderType}
          onClose={closePopup}
        />
      </div>

      {/* vendor extra amount popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Enter Vendor Amount</h3>
            <input
              type="number"
              value={vendorAmount}
              onChange={(e) => setVendorAmountInput(e.target.value)}
              placeholder="Enter Amount"
              className="input-field"
            />
            <div className="popup-buttons">
              <button
                className="submit-btn"
                onClick={() => handleSaveVendorAmount()}
              >
                Submit
              </button>

              <button
                className="cancel-btn"
                onClick={handleCloseVendorAmountPopup}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* supplier details popup */}
      {isPopupOpen && supplierDetails && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closePopup}>
              ×
            </button>
            <h3>Supplier Details</h3>
            <p>Name: {supplierDetails.data?.name || "NA"}</p>
            <p>Phone: {supplierDetails.data?.phone || "NA"}</p>
          </div>
        </div>
      )}


      {/* pagination */}
      <div className="orderDetails_pagination">
        <button
          onClick={() =>
            setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))
          }
          disabled={currentPage === 1} // Disable Previous button on first page
        >
          {"<"}
        </button>
        <span>
          {" "}
          Page {currentPage} of {totalPage}{" "}
        </span>
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
  tableHeading: {
    background:
      "linear-gradient(90deg, rgba(221, 94, 137, 0.8), rgb(151, 83, 140))",
    color: "rgb(255, 255, 255)",
    // width: "100%",
  },
  amountPopupBtn: {
    width: "85px",
    height: "40px",
    backgroundColor: "transparent",
    backgroundImage: "linear-gradient(135deg, #ff6b6b, #ffa500)",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    color: "white",
    fontSize: "10px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  editOrderPopupBtn: {
    width: "85px",
    height: "40px",
    backgroundColor: "transparent",
    backgroundImage: "linear-gradient(135deg, #ff6b6b,rgb(148, 140, 124))",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    color: "white",
    fontSize: "10px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
