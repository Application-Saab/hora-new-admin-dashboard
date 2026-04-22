"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./boosters-listing.css";
import Image from "next/image";
import CreateBoosterPopup from "./CreateCelebrationBoosterPopup";
import EditBoosterPopup from "./EditCelebrationBoosterPopup";
import {
  BASE_URL,
  GET_CELEBRATION_BOOSTERS,
  UPDATE_CELEBRATION_BOOSTER,
} from "@/utils/apiconstant";

const DishTable = () => {
  const [boosters, setBoosters] = useState([]);
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
  const [boosterStatus, setBoosterStatus] = useState("");
  const [showCreateBoosterPopup, setShowCreateBoosterPopup] = useState(false);
  const [showEditBoosterPopup, setShowEditBoosterPopup] = useState(false);
  const [selectedBooster, setSelectedBooster] = useState(null);

  useEffect(() => {
    fetchData();
  }, [page, searchName, boosterStatus]);

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);

      // Prepare request payload
      const payload = {
        page: page,
        per_page: 10,
        name: searchName,
      };

      // Add status filter if selected
      if (boosterStatus) {
        payload.status = parseInt(boosterStatus);
      }

      const response = await axios.post(
        `${BASE_URL}${GET_CELEBRATION_BOOSTERS}`,
        payload,
      );

      setBoosters(response.data.data.boosters);
      setPagination(response.data.data.paginate);
    } catch (error) {
      setError("Error fetching booster data");
      console.error("Error fetching booster data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => setPage(newPage);
  const handleClickEditpackage = (packageData) => {
    setSelectedBooster(packageData);
    setShowEditBoosterPopup(true);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchName(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  // Handle status filter change
  const handleStatusChange = (e) => {
    setBoosterStatus(e.target.value);
    setPage(1); // Reset to first page when filtering
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;

    try {
      const response = await axios.put(
        `${BASE_URL}${UPDATE_CELEBRATION_BOOSTER}/${id}`,
        {
          _id: id,
          status: newStatus,
        },
      );
      if (response.status === 200) {
        fetchData();
      }
    } catch (error) {
      console.error(
        "Error updating status:",
        error.response?.data || error.message,
      );
    }
  };

  return (
    <div className="container">
      <h1 className="header-title">Celebration Boosters</h1>
      <div className="add-package-btn-ctn">
        <button
          className="add-package-btn"
          type="button"
          onClick={() => setShowCreateBoosterPopup(true)}
        >
          Add Booster
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
          value={boosterStatus}
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
              <th>Booster Image</th>
              <th>Booster Name</th>
              <th>Created</th>
              <th>Status</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {boosters.length > 0 ? (
              boosters.map((dish) => (
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
                  <td>{new Date(dish.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => handleStatusToggle(dish._id, dish.status)}
                      className={`status-button ${dish.status === 1 ? "active" : "inactive"}`}
                    >
                      {dish.status === 1 ? "Active" : "Inactive"}
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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="13" className="no-data">
                  No Booster found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {showCreateBoosterPopup && (
          <CreateBoosterPopup
            isOpen={showCreateBoosterPopup}
            onClose={() => setShowCreateBoosterPopup(false)}
            onSuccess={fetchData}
          />
        )}
        {showEditBoosterPopup && (
          <EditBoosterPopup
            isOpen={showEditBoosterPopup}
            onClose={() => setShowEditBoosterPopup(false)}
            onSuccess={fetchData}
            boosterData={selectedBooster}
          />
        )}
      </div>

      {!loading && boosters.length > 0 && (
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
