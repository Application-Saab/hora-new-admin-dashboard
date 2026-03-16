"use client";
import React, { useState, useEffect } from "react";
import "./CreatePackagePopup.css";
import { BASE_URL, UPDATE_FOOD_PACKAGE } from "@/utils/apiconstant";

const EditPackagePopup = ({ isOpen, onClose, packageData, onSuccess }) => {

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    price: "",
    actualPrice: "",
    foodType: "",
    packageType: "",
  });

  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // Prefill Data
  useEffect(() => {
    if (packageData) {
      setFormData({
        name: packageData.name || "",
        image: packageData.image || "",
        price: packageData.price || "",
        actualPrice: packageData.actualPrice || "",
        foodType: packageData.foodType || "",
        packageType: packageData.packageType || "",
      });
    }
  }, [packageData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Image Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("https://horaservices.com:3000/api/image_upload", {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    setFormData((prev) => ({
      ...prev,
      image: data.data,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoadingUpdate(true);

    try {
      const res = await fetch(`${BASE_URL}${UPDATE_FOOD_PACKAGE}/${packageData._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data) {
        alert("Package Updated Successfully");
        onSuccess();
        onClose();
      }

      setLoadingUpdate(false);
    } catch (err) {
      console.log(err);
      alert("Error updating package");
      setLoadingUpdate(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">

        <button className="close-btn" onClick={onClose}>
          X
        </button>

        <h2>Edit Food Package</h2>

        <form onSubmit={handleSubmit}>
          <div className="package-form-container">

            <div className="package-create-input-ctn">

              <input
                type="text"
                name="name"
                placeholder="Package Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="package-create-input"
              />

              {/* Image Preview + Upload */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

                {formData.image && (
                  <img
                    src={`https://horaservices.com/api/uploads/${formData.image}`}
                    alt="preview"
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      border: "1px solid #ddd"
                    }}
                  />
                )}

                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="package-create-input"
                />

              </div>

            </div>

            <div className="package-create-input-ctn">

              <input
                type="text"
                name="price"
                placeholder="Discounted Price"
                value={formData.price}
                onChange={handleChange}
                required
                className="package-create-input"
              />

              <input
                type="text"
                name="actualPrice"
                placeholder="Non-discounted Price"
                value={formData.actualPrice}
                onChange={handleChange}
                required
                className="package-create-input"
              />

            </div>

            <div className="package-create-input-ctn">

              <select
                name="foodType"
                value={formData.foodType}
                onChange={handleChange}
                required
                className="package-create-input"
              >
                <option value="">Select Food Type</option>
                <option value="veg">Veg</option>
                <option value="non-veg">Non Veg</option>
                <option value="mixed">Mixed</option>
              </select>

              <select
                name="packageType"
                value={formData.packageType}
                onChange={handleChange}
                required
                className="package-create-input"
              >
                <option value="">Select Package Type</option>
                <option value="liveCatering">Live Catering</option>
                <option value="bulkFood">Bulk Food</option>
              </select>

            </div>

            <div
              style={{
                marginTop: "80px",
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >

              <button
                type="button"
                onClick={onClose}
                className="package-create-btn package-cancel-btn"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="package-create-btn"
                disabled={loadingUpdate}
              >
                {loadingUpdate ? "Updating..." : "Update"}
              </button>

            </div>

          </div>
        </form>

      </div>
    </div>
  );
};

export default EditPackagePopup;