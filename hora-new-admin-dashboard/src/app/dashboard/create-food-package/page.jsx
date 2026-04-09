"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./create-food-package.css";
import Image from "next/image";
import CreatePackagePopup from "./CreatePackagePopup";
import AddDishToPackagePopup from "./AddDishPopup";
import EditPackagePopup from "./EditPackagePopup";
import {
  BASE_URL,
  GET_FOOD_PACKAGES,
  UPDATE_FOOD_PACKAGE,
} from "@/utils/apiconstant";

const DishTable = () => {
  const [dishes, setDishes] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total_item: 0,
    showing: 10,
    first_page: 1,
    previous_page: 1,
    current_page: 1,
    next_page: 2,
    last_page: 1,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchName, setSearchName] = useState("");
  const [dishType, setDishType] = useState("");
  const [dishStatus, setDishStatus] = useState("");
  const [showCreatePackagePopup, setShowCreatePackagePopup] = useState(false);
  const [showEditPackagePopup, setShowEditPackagePopup] = useState(false);
  const [showAddDishPopup, setShowAddDishPopup] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    fetchData();
  }, [page, searchName, dishType, dishStatus]);

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);

      // Prepare request payload
      const payload = {
        page: page,
        per_page: 10,
        name: searchName,
        mealId: "",
        cuisineId: "",
      };

      // Add is_dish filter if selected
      if (dishType) {
        payload.is_dish = parseInt(dishType);
      }

      // Add status filter if selected
      if (dishStatus) {
        payload.status = parseInt(dishStatus);
      }

      const response = await axios.post(
        `${BASE_URL}${GET_FOOD_PACKAGES}`,
        payload,
      );

      setDishes(response.data.data.dish);
      setPagination(response.data.data.paginate);
    } catch (error) {
      setError("Error fetching dish data");
      console.error("Error fetching dish data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => setPage(newPage);

  const handleClickAddDish = (packageData) => {
    setSelectedPackage(packageData);
    setShowAddDishPopup(true);
  };

  const handleClickEditpackage = (packageData) => {
    setSelectedPackage(packageData);
    setShowEditPackagePopup(true);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchName(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  // Handle dish type filter change
  const handleDishTypeChange = (e) => {
    setDishType(e.target.value);
    setPage(1); // Reset to first page when filtering
  };

  // Handle status filter change
  const handleStatusChange = (e) => {
    setDishStatus(e.target.value);
    setPage(1); // Reset to first page when filtering
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;

    try {
      const response = await axios.patch(
        `${BASE_URL}${UPDATE_FOOD_PACKAGE}/${id}`,
        {
          _id: id,
          packageStatus: newStatus,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200) {
        fetchData();
        console.log("Status updated successfully");
      } else {
        console.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const formatDishType = (type) => {
    if (type === "non-veg") return "Non Veg";
    else if (type === "veg") return "Veg";
    else if (type === "mixed") return "Mixed";
    else return "N/A";
  };

  return (
    <div className="container">
      <h1 className="header-title">Food Packages List</h1>
      <div className="add-package-btn-ctn">
        <button
          className="add-package-btn"
          type="button"
          onClick={() => setShowCreatePackagePopup(true)}
        >
          Add Package
        </button>
      </div>

      <div className="filters-container">
        <input
          type="text"
          placeholder="Search By Name..."
          className="filter-input"
          value={searchName}
          onChange={handleSearchChange}
        />

        <select
          className="filter-select"
          value={dishType}
          onChange={handleDishTypeChange}
        >
          <option value="">--Select Veg/Non--</option>
          <option value="1">Veg</option>
          <option value="2">Non-Veg</option>
        </select>

        <select
          className="filter-select"
          value={dishStatus}
          onChange={handleStatusChange}
        >
          <option value="">--Select Status--</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table className="dish-table">
          <thead>
            <tr>
              <th>Package Image</th>
              <th>Package Name</th>
              <th>Veg/Non-Veg</th>
              <th>Package Type</th>
              <th>Created</th>
              <th>Status</th>
              <th>Edit</th>
              <th>Add Dish</th>
            </tr>
          </thead>
          <tbody>
            {dishes.length > 0 ? (
              dishes.map((dish) => (
                <tr key={dish._id}>
                  <td className="dish-image">
                    <Image
                      src={`${BASE_URL}/api/uploads/${dish.image}`}
                      alt={dish.name}
                      className="image"
                      width={40}
                      height={40}
                    />
                  </td>
                  <td>{dish.name}</td>
                  <td>{formatDishType(dish.foodType)}</td>
                  <td>
                    {dish?.packageType === "bulkFood" && "Bulk Food"}
                    {dish?.packageType === "liveCatering" && "Live Catering"}
                  </td>
                  <td>{new Date(dish.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() =>
                        handleStatusToggle(dish._id, dish.packageStatus)
                      }
                      className={`status-button ${dish.packageStatus === 1 ? "active" : "inactive"}`}
                    >
                      {dish.packageStatus === 1 ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleClickEditpackage(dish)}
                    >
                      Edit
                    </button>
                  </td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleClickAddDish(dish)}
                    >
                      Add Dishes
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="13" className="no-data">
                  No dishes found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {showCreatePackagePopup && (
          <CreatePackagePopup
            isOpen={showCreatePackagePopup}
            onClose={() => setShowCreatePackagePopup(false)}
            onSuccess={fetchData}
          />
        )}
        {showEditPackagePopup && (
          <EditPackagePopup
            isOpen={showEditPackagePopup}
            onClose={() => setShowEditPackagePopup(false)}
            onSuccess={fetchData}
            packageData={selectedPackage}
          />
        )}
        {showAddDishPopup && (
          <AddDishToPackagePopup
            isOpen={showAddDishPopup}
            onClose={() => {
              setShowAddDishPopup(false);
              fetchData();
            }}
            packageData={selectedPackage}
          />
        )}
      </div>

      {!loading && dishes.length > 0 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(pagination.previous_page)}
            disabled={page === pagination.first_page}
          >
            Previous
          </button>
          <span className="page-number">
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(pagination.next_page)}
            disabled={page === pagination.last_page}
          >
            Next
          </button>
        </div>
      )}

      {loading && <div className="loading-overlay">Loading...</div>}
    </div>
  );
};

export default DishTable;
