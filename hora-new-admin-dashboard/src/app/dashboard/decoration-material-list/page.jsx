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
import { IMAGE_BASE_URL } from '../../../utils/apiconstant';

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

  const [searchName, setSearchName] = useState("");
  const [materialCategory, setMaterialCategory] = useState("");
  const [materialStatus, setMaterialStatus] = useState("");
  const [showCreateMaterialPopup, setShowCreateMaterialPopup] = useState(false);
  const [showEditMaterialPopup, setShowEditMaterialPopup] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Image Preview Popup
  const [previewImage, setPreviewImage] = useState(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [isPreparing, setIsPreparing] = useState(false);

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

  const handleSearchChange = (e) => {
    setSearchName(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e) => {
    setMaterialCategory(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setMaterialStatus(e.target.value);
    setPage(1);
  };

  const openImagePreview = async (dish) => {
    if (!dish?.images) return;

    const url = `${IMAGE_BASE_URL}/${dish.images}`;

    setPreviewImage({
      url,
      name: dish.materialName || "Material",
      blob: null,
    });
    setCopyStatus("");
    setIsPreparing(true);

    try {
      const response = await fetch(url, { mode: "cors" });

      if (!response.ok) {
        throw new Error(`Image fetch failed: ${response.status}`);
      }

      const blob = await response.blob();
      const clipboardBlob = await convertToPng(blob, 1920);

      setPreviewImage((prev) => ({
        ...prev,
        blob: clipboardBlob,
      }));
    } catch (error) {
      console.error("Failed to prepare image:", error);
    } finally {
      setIsPreparing(false);
    }
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
    setCopyStatus("");
    setIsPreparing(false);
  };

  // Copy Image URL
  const handleCopyUrl = async () => {
    if (!previewImage?.url) return;

    try {
      await navigator.clipboard.writeText(previewImage.url);
      setCopyStatus("url");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
      alert("Failed to copy URL");
    }
  };

  // Copy Image (PNG only)
  const handleCopyImage = async () => {
    if (!previewImage?.blob) {
      alert("Image is still preparing. Please wait a moment.");
      return;
    }

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": previewImage.blob,
        }),
      ]);

      setCopyStatus("image");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch (err) {
      console.error("Failed to copy image:", err);

      if (err?.name === "NotAllowedError") {
        alert("Browser blocked image clipboard access. Please try again.");
      } else {
        alert("Failed to copy image. You can still copy the URL.");
      }
    }
  };

  const convertToPng = (blob, maxSize = 1920) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(blob);

      img.onload = () => {
        try {
          let { naturalWidth: width, naturalHeight: height } = img;

          // Resize if too large (keeps aspect ratio)
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            } else {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Canvas context unavailable"));
            return;
          }

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (pngBlob) => {
              URL.revokeObjectURL(objectUrl);

              if (pngBlob) {
                resolve(pngBlob);
              } else {
                reject(new Error("PNG conversion failed"));
              }
            },
            "image/png",
            0.92,
          );
        } catch (err) {
          URL.revokeObjectURL(objectUrl);
          reject(err);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Image load failed"));
      };

      img.src = objectUrl;
    });
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
                    <div
                      className="image-clickable"
                      onClick={() => openImagePreview(dish)}
                      title="Click to preview"
                    >
                      <Image
                        src={`${IMAGE_BASE_URL}/${dish?.images}`}
                        alt={dish.materialName || "Material"}
                        className="image"
                        width={40}
                        height={40}
                      />
                    </div>
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
                      className={`status-button ${
                        dish.materialStatus === 1 ? "active" : "inactive"
                      }`}
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
                <td colSpan="12" className="no-data">
                  No materials found
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

      {previewImage && (
        <div className="image-preview-overlay" onClick={closeImagePreview}>
          <div
            className="image-preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="image-preview-close" onClick={closeImagePreview}>
              ×
            </button>

            <div className="image-preview-title">{previewImage.name}</div>

            <div className="image-preview-body">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="image-preview-img"
              />
            </div>

            <div className="image-preview-actions">
              <button
                className="preview-btn copy-image-btn"
                onClick={handleCopyImage}
                disabled={isPreparing || !previewImage?.blob}
              >
                {isPreparing
                  ? "Preparing..."
                  : copyStatus === "image"
                    ? "✓ Copied!"
                    : "Copy Image"}
              </button>

              <button
                className="preview-btn copy-url-btn"
                onClick={handleCopyUrl}
              >
                {copyStatus === "url" ? "✓ Copied!" : "Copy Image URL"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DishTable;
