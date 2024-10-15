import React, { useState, useEffect } from "react";
import { FaEye, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Popup from "../popup/Popup";
import "./orderdetails.css";

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

  useEffect(() => {
    fetch(`https://horaservices.com:3000/api/admin/adminOrderList`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page: currentPage,
        per_page: itemsPerPage,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data, "data");
        if (data && data.data && data.data.order) {
          setOrders(data.data.order);
          setTotalItems(data.data.paginate.total_item);
          setFilteredOrders(data.data.order);
        } else {
          console.warn("No orders found in response data");
        }
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
      });
  }, [currentPage]);

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

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // const openPopup = (address) => {
  //   setSelectedAddress(address);
  //   setPopupOpen(true); // Open the popup
  // };

  const openPopup = (address) => {
    // Combine address1 and address2 if both exist
    const fullAddress = `${address.address1 || ''}, ${address.address2 || ''}, ${address.city || ''}`;
    
    setSelectedAddress(fullAddress);
    setPopupOpen(true); 
  };

  const closePopup = () => {
    setPopupOpen(false); 
    setSelectedAddress(""); 
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
      "Customer",
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
        order.customer || "N/A",
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

    // Create a Blob and download it
    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "orders.csv"); // Name of the file to download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="order-list-container">
      <div className="order-header">
        <h2>Order Details</h2>
      </div>

      <div className="search-download-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by Order ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
              <th>Date & Time</th>
              <th>Otp</th>
              <th>Chef & Helper</th>
              <th>Customer</th>
              <th>Supplier</th>
              <th>Order Address</th>
              <th>Order Start & End Time</th>
              <th>Total Item & Amount</th>
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
                  <td>{new Date(order.order_date).toLocaleString()}</td>
                  <td>{order.otp}</td>
                  <td>
                    {order.chef} & {order.helper}
                  </td>
                  <td>
                    <FaEye />
                  </td>
                  <td>{order.supplierUserIds.join(", ") || "N/A"}</td>
                  <td>
                    <FaEye onClick={() => openPopup(order.addressId.length > 0 ? order.addressId[0] : { address1: 'N/A', address2: '', city: '' })} />
                  </td>
                  <td>
                    {order.job_start_time} to {order.job_end_time}
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
                  <td>Actions</td>
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

      {/* Popup for Address */}
      <Popup
        isOpen={popupOpen}
        address={selectedAddress}
        onClose={closePopup}
      />
    </div>
  );
};

export default OrderList;
