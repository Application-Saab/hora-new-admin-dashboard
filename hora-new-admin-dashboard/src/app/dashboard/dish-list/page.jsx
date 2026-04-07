"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DishTable.css";
import Image from "next/image";
import DishPopup from './DishDetailsPopup';

import { useRouter } from "next/navigation";
import { BASE_URL } from "@/utils/apiconstant";


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
    last_page: 1
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
   const router = useRouter();
   

  // Filter states
  const [searchName, setSearchName] = useState("");
  const [dishType, setDishType] = useState("");
  const [dishStatus, setDishStatus] = useState("");

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
        cuisineId: ""
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
        `${BASE_URL}/api/dish/admin_dish_list`,
        payload
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
  
  const handleEdit = (dish) => {
    localStorage.setItem('editDish', dish);
    router.push('/dashboard/edit-dish');
  };
  
  const [popupDish, setPopupDish] = useState(null);


  const handleDetails = (dish) => {
    console.log(dish, "dish");
    setPopupDish(dish);
  };

  const closePopup = () => {
    setPopupDish(null);
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
      const response = await fetch(`${BASE_URL}/api/dish/update_dish_status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: id,
          status: newStatus,
        }),
      });
  
      if (response.ok) {
        // Optional: Refresh your data or update state
        fetchData();
        console.log('Status updated successfully');
      } else {
        console.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  
  return (
    <div className="container">
      <h1 className="header-title">Dish List</h1>

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
              <th>Dish Image</th>
              <th>Dish Name</th>
              <th>Veg/Non-Veg</th>
              <th>Meal Type</th>
              <th>Cuisine</th>
              <th>Meal</th>
              <th>Preparation</th>
              <th>Cooking Time</th>
              <th>Prep Time</th>
              <th>Created</th>
              <th>Status</th>
              <th>View</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {dishes.length > 0 ? (
              dishes.map((dish) => (
                <tr key={dish._id}>
                  <td className="dish-image">
                    <Image src={`${BASE_URL}/api/uploads/${dish.image}`}
                         alt={dish.name} className="image" width={40} height={40}/>
                  </td>
                  <td>{dish.name}</td>
                  <td>{dish.is_dish === 1 ? "Veg" : "Non-Veg"}</td>
                  <td>{dish.mealId && dish.mealId.map ? dish.mealId.map((meal) => meal.name).join(", ") : "N/A"}</td>
                  <td>
                    <div className="chip-container">
                      {dish.cuisineId && dish.cuisineId.map ?
                        dish.cuisineId.map((cuisine, index) => (
                          <span key={cuisine._id || index} className="chip">
                            {cuisine.name}
                          </span>
                        )) : "N/A"}
                    </div>
                  </td>
                  <td>{dish.mealId && dish.mealId[0]?.name || "N/A"}</td>
                  <td>{dish.preperationtext || "N/A"}</td>
                  <td>{dish.cooking_min}</td>
                  <td>{dish.preparation_min}</td>
                  <td>{new Date(dish.createdAt).toLocaleDateString()}</td>
                  {/* <td>
                    <span className={`status ${dish.status === 1 ? "status-active" : "status-inactive"}`}>
                      {dish.status === 1 ? "Active" : "Inactive"}
                    </span>
                  </td> */}
<td>
  <button
    onClick={() => handleStatusToggle(dish._id, dish.status)}
    className={`status-button ${dish.status === 1 ? "active" : "inactive"}`}
  >
    {dish.status === 1 ? "Active" : "Inactive"}
  </button>
</td>

                  <td>
                    <button className="delete-btn" onClick={() => handleDetails(dish)}>View</button>
                  </td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(dish._id)}>Edit</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="13" className="no-data">No dishes found</td>
              </tr>
            )}
          </tbody>
        </table>
        {popupDish && <DishPopup dish={popupDish} onClose={closePopup} />}

      </div>

      {!loading && dishes.length > 0 && (
        <div className="pagination">
          <button className="pagination-btn"
                  onClick={() => handlePageChange(pagination.previous_page)}
                  disabled={page === pagination.first_page}>
            Previous
          </button>
          <span className="page-number">
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <button className="pagination-btn"
                  onClick={() => handlePageChange(pagination.next_page)}
                  disabled={page === pagination.last_page}>
            Next
          </button>
        </div>
      )}

      {loading && <div className="loading-overlay">Loading...</div>}
    </div>
  );
};

export default DishTable;
