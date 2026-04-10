"use client";
import React, { useEffect, useState } from "react";
import "./decoration-material-list.css";
import Image from "next/image";
import CreateMaterialPopup from "./CreateNewMaterialPopup";
import EditMaterialPopup from "./EditMaterialPopup";
import {
  fetchDecorationMaterials,
  handleMaterialStatusToggle,
} from "../../../services/decorationMaterialListServices";
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
    last_page: 1,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchName, setSearchName] = useState("");
  const [materialCategory, setMaterialCategory] = useState("");
  const [materialStatus, setMaterialStatus] = useState("");
  const [showCreateMaterialPopup, setShowCreateMaterialPopup] = useState(false);
  const [showEditMaterialPopup, setShowEditMaterialPopup] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const callMaterialAPi = () => {
    fetchDecorationMaterials(
      setError,
      setLoading,
      setDishes,
      setPagination,
      page,
      searchName,
      materialCategory,
      materialStatus,
    );
  };

  useEffect(() => {
    callMaterialAPi();
  }, [page, searchName, materialCategory, materialStatus]);

  const handlePageChange = (newPage) => setPage(newPage);

  const handleClickEditMaterial = (materialData) => {
    setSelectedMaterial(materialData);
    setShowEditMaterialPopup(true);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchName(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  // Handle material category filter change
  const handleCategoryChange = (e) => {
    setMaterialCategory(e.target.value);
    setPage(1); // Reset to first page when filtering
  };

  // Handle material status filter change
  const handleStatusChange = (e) => {
    setMaterialStatus(e.target.value);
    setPage(1); // Reset to first page when filtering
  };

  return (
    <div className="container">
      <h1 className="header-title">Decoration Material List</h1>
      <div className="add-package-btn-ctn">
        <button
          className="add-package-btn"
          type="button"
          onClick={() => setShowCreateMaterialPopup(true)}
        >
          Add Material
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
          value={materialCategory}
          onChange={handleCategoryChange}
        >
          <option value="">--Select Category--</option>
          <option value="Rented">Rented</option>
          <option value="Consumable">Consumable</option>
        </select>

        <select
          className="filter-select"
          value={materialStatus}
          onChange={handleStatusChange}
        >
          <option value="">--Select Status--</option>
          <option value="1">Active</option>
          <option value="2">Inactive</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table className="dish-table">
          <thead>
            <tr>
              <th>Material Image</th>
              <th>Specs</th>
              <th>Type</th>
              <th>Material Name</th>
              <th>MOQ</th>
              <th>Material Category</th>
              <th>Vendor Material Price</th>
              <th>Vendor Rate Retail</th>
              <th>Vendor Rate Wholesale</th>
              <th>Created</th>
              <th>Status</th>
              <th>Edit</th>
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
                  <td>{dish.specs}</td>
                  <td>{dish.type}</td>
                  <td>{dish.materialName}</td>
                  <td>{dish.minimumOrderQuantity}</td>
                  <td>{dish.materialCategory}</td>
                  <td>{dish.vendorMaterialPrice}</td>
                  <td>{dish.vendorMaterialRateRetail}</td>
                  <td>{dish.vendorMaterialRateWholesale}</td>
                  <td>{new Date(dish.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() =>
                        handleMaterialStatusToggle(
                          dish._id,
                          dish.materialStatus,
                          () => callMaterialAPi(),
                        )
                      }
                      className={`status-button ${dish.materialStatus === 1 ? "active" : "inactive"}`}
                    >
                      {dish.materialStatus === 1 ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleClickEditMaterial(dish)}
                    >
                      Edit
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
        {showCreateMaterialPopup && (
          <CreateMaterialPopup
            isOpen={showCreateMaterialPopup}
            onClose={() => setShowCreateMaterialPopup(false)}
            onSuccess={callMaterialAPi}
          />
        )}
        {showEditMaterialPopup && (
          <EditMaterialPopup
            isOpen={showEditMaterialPopup}
            onClose={() => setShowEditMaterialPopup(false)}
            onSuccess={callMaterialAPi}
            materialData={selectedMaterial}
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
