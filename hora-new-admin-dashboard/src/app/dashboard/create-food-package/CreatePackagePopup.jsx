import React, { useState } from "react";
// import Image from "next/image";
import "./CreatePackagePopup.css";
import { BASE_URL, CREATE_FOOD_PACKAGE } from "@/utils/apiconstant";

const CreatePackagePopup = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    price: 0,
    actualPrice: 0,
    foodType: "",
    packageType: "",
  });
  const [loadingCreate, setLoadingCreate] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
    setLoadingCreate(true);
    try {
      const res = await fetch(`${BASE_URL}${CREATE_FOOD_PACKAGE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLoadingCreate(false);
        alert("Package Created Successfully");
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert("Error creating package");
      setLoadingCreate(false);
      console.log(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-btn" onClick={onClose}>
          X
        </button>
        <h2>Create Food Package</h2>

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

              <input
                type="file"
                onChange={handleFileUpload}
                className="package-create-input"
                required
              />
            </div>
            <div
              className="package-create-input-ctn"
              style={{ width: "95%", marginTop: "20px" }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                <label htmlFor="price" style={{ marginBottom: "5px" }}>
                  Discounted Price
                </label>
                <input
                  type="number"
                  name="price"
                  placeholder="Discounted Price"
                  value={formData.price}
                  onChange={handleChange}
                  className="package-create-input"
                  required
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                <label htmlFor="actualPrice" style={{ marginBottom: "5px" }}>
                  Non-Discounted Price
                </label>
                <input
                  type="number"
                  name="actualPrice"
                  placeholder="Non-discounted Price"
                  value={formData.actualPrice}
                  onChange={handleChange}
                  className="package-create-input"
                  required
                />
              </div>
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
                disabled={loadingCreate}
              >
                {loadingCreate ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePackagePopup;
