"use client";
import React, { useState } from "react";
import "./CreateCelebrationPopup.css";
import { BASE_URL, CREATE_CELEBRATION_BOOSTER } from "@/utils/apiconstant";

const CreateCelebrationBoosterPopup = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    featured_image: "",
    price: "",
    cost_price: "",
    type: "",
    caption: "",
    badge: "",
    discount: "",
    inclusionText: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatText = (text) => [
    `<div>- ${text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join(" - ")}</div>`,
  ];

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
      featured_image: data.data,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    // Format inclusion
    const formattedInclusion = formatText(formData.inclusionText);

    const payload = {
      ...formData,
      inclusion: formattedInclusion,
    };
    try {
      const res = await fetch(`${BASE_URL}${CREATE_CELEBRATION_BOOSTER}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data) {
        alert("Booster Created Successfully");
        onSuccess();
        onClose();
      }

      setLoading(false);
    } catch (err) {
      console.log(err);
      alert("Error creating booster");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-btn" onClick={onClose}>
          X
        </button>

        <h2>Create Celebration Booster</h2>

        <form onSubmit={handleSubmit}>
          <div className="package-form-container">
            {/* Name + Image */}
            <div className="package-create-input-ctn">
              <input
                type="text"
                name="name"
                placeholder="Booster Name"
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

            {/* Price */}
            <div className="package-create-input-ctn">
              <input
                type="text"
                name="price"
                placeholder="Selling Price"
                value={formData.price}
                onChange={handleChange}
                required
                className="package-create-input"
              />

              <input
                type="text"
                name="cost_price"
                placeholder="Cost Price"
                value={formData.cost_price}
                onChange={handleChange}
                className="package-create-input"
              />
            </div>

            {/* Type + Discount */}
            <div className="package-create-input-ctn">
              <input
                type="text"
                name="type"
                placeholder="Type (Decoration / Cake / etc)"
                value={formData.type}
                onChange={handleChange}
                className="package-create-input"
              />

              <input
                type="number"
                name="discount"
                placeholder="Discount (%)"
                value={formData.discount}
                onChange={handleChange}
                className="package-create-input"
              />
            </div>

            {/* Caption + Badge */}
            <div className="package-create-input-ctn">
              <input
                type="text"
                name="caption"
                placeholder="Caption"
                value={formData.caption}
                onChange={handleChange}
                className="package-create-input"
              />

              <input
                type="text"
                name="badge"
                placeholder="Badge (Best Seller / New)"
                value={formData.badge}
                onChange={handleChange}
                className="package-create-input"
              />
            </div>

            {/* Inclusion Text */}
            <div
              className="package-create-input-ctn"
              style={{ flexDirection: "column" }}
            >
              <label>Inclusion (One per line)</label>

              <textarea
                name="inclusionText"
                value={formData.inclusionText}
                onChange={handleChange}
                placeholder="Enter each inclusion on a new line"
                className="package-create-input"
                style={{ minHeight: "120px" }}
              />
            </div>

            {/* Buttons */}
            <div
              style={{
                marginTop: "60px",
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
                disabled={loading}
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCelebrationBoosterPopup;
