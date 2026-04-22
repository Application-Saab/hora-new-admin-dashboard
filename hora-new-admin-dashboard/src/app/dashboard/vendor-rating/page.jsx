"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./vendorRating.css";
import { BASE_URL, ADMIN_USER_LIST, SUPPLIER_PERSONALDETAILS_UPDATE } from "../../../utils/apiconstant";

const VendorRating = () => {
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedKey, setSelectedKey] = useState("");
  const [vendors, setVendors] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBadge, setSelectedBadge] = useState("");
  const [phone, setPhone] = useState("");

  // Mapping number → job_profile string
  const orderTypeMap = {
    1: "Decorator",
    2: "Chef",
    8: "Photography"
  };


  // Fetch Vendors from API
  const fetchVendors = async () => {
    try {
      const response = await axios.post(`${BASE_URL}${ADMIN_USER_LIST}`, {
        email: "",
        phone: phone || "",
        role: "supplier",
        page: page,
        per_page: 100,
        city: selectedCity || undefined,
        job_profile:
          selectedKey && selectedKey !== "all"
            ? orderTypeMap[selectedKey]
            : undefined,
        performanceBadge: selectedBadge,
      });

      const data = (response?.data?.data?.users || []).map(prev => ({
        ...prev,
        supplierOrderLimit: prev.supplierOrderLimit ?? 4,
        editing: false
      }));
      const paginate = response?.data?.data?.paginate || {};

      setVendors(data);
      setTotalPages(paginate.last_page || 1);
    } catch (err) {
      console.error("Error fetching vendors", err);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [page, selectedCity, selectedKey, selectedBadge, phone]);

  const handleEditClick = (index) => {
    const updated = [...vendors];
    updated[index].editing = true;
    updated[index].supplierOrderLimit = "";
    setVendors(updated);
  };

  const updateOrderLimit = async (vendorId, limit, index) => {
    try {

      await axios.post(
        `${BASE_URL}/${SUPPLIER_PERSONALDETAILS_UPDATE}/${vendorId}`,
        { supplierOrderLimit: limit }
      );

      const updated = [...vendors];
      updated[index].editing = false;

      setVendors(updated);
      alert("Supplier Order Limit Update Successfully")

    } catch (error) {
      console.error("Update error", error);
    }
  };

  // Handle Order Limit Edit
  const handleLimitChange = (index, value) => {
    const updated = [...vendors];
    updated[index].supplierOrderLimit = value === "" ? "" : Number(value);
    setVendors(updated);
  };

  // Dropdown Handlers
  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
    setPage(1);
  };
  // Dropdown Handlers
  const handleBadgeChange = (e) => {
    setSelectedBadge(e.target.value);
    setPage(1);
  };

  const handleOrderTypeChange = (e) => {
    setSelectedKey(e.target.value);
    setPage(1);
  };

  return (
    <div className="vendor-container">
      <div className="vendor-card">
        <h2 className="vendor-title">Vendor Rating</h2>

        {/* Filters */}
        <div className="vendor-dropdown-container">
          <div className="dropdown-group">
            <label>Select City</label>
            <select value={selectedCity} onChange={handleCityChange}>
              <option value="">All</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Delhi">Delhi</option>
              <option value="Mumbai">Mumbai</option>
            </select>
          </div>
          <div className="dropdown-group">
            <label>Select Order Type</label>
            <select onChange={handleOrderTypeChange} value={selectedKey}>
              <option value="" disabled>
                All
              </option>
              <option value="all">All</option>
              {Object.entries(orderTypeMap).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="dropdown-group">
            <label>Select Badge</label>
            <select value={selectedBadge} onChange={handleBadgeChange}>
              <option value="">All</option>
              <option value="Elite">Elite</option>
              <option value="Good">Good</option>
              <option value="Average">Average</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="dropdown-group">
            <label>Vendor Phone</label>
            <input
              type="text"
              placeholder="Enter phone number"
              value={phone}
              className="vendor-rating-input"
              onChange={(e) => {
                setPhone(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <table className="vendor-table">
          <thead>
            <tr>
              <th>Vendor Name</th>
              <th>Phone Number</th>
              <th>Badge</th>
              <th>Order Limit (Of Given Day)</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor, index) => {
              return (
                <tr key={vendor._id}>
                  <td className="vendor-name">
                    {vendor.firstName
                      ? `${vendor.firstName || ""} ${vendor.lastName || ""}`.trim()
                      : vendor.name || "-"}
                  </td>

                  <td>{vendor.phone || "-"}</td>

                  <td>{vendor?.performanceBadge || "Low"}</td>


                  <td>
                    <div className="limit-wrapper">

                      <input
                        type="number"
                        className="limit-input"
                        value={vendor.supplierOrderLimit}
                        disabled={!vendor.editing}
                        onChange={(e) =>
                          handleLimitChange(index, e.target.value)
                        }
                      />

                      <button
                        className="edit-btn"
                        onClick={() => handleEditClick(index)}
                      >
                        ✏️
                      </button>

                    </div>

                    <button
                      className="save-limit-btn"
                      disabled={
                        !vendor.editing ||
                        vendor.supplierOrderLimit === "" ||
                        vendor.supplierOrderLimit <= 0
                      }
                      onClick={() =>
                        updateOrderLimit(vendor._id, vendor.supplierOrderLimit, index)
                      }
                    >
                      Save
                    </button>

                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Pagination */}
        <div className="vendor-pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
};

export default VendorRating;