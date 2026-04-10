"use client";
import React, { useState } from "react";
import "./CreateCelebrationPopup.css";
import { BASE_URL, CREATE_CELEBRATION_BOOSTER } from "@/utils/apiconstant";
import axios from "axios";

const CreateCelebrationBoosterPopup = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    featured_image: "",
    price: "",
    tag: ["69b91f42ab5ae5291cee5621"],
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await axios.post(
        `${BASE_URL}/api/image_upload`,
        form,
      );

      const data = res.data;

      setFormData((prev) => ({
        ...prev,
        featured_image: data.data,
      }));
    } catch (error) {
      console.error(
        "Error uploading file:",
        error.response?.data || error.message,
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formattedInclusion = formatText(formData.inclusionText);
    const payload = {
      ...formData,
      inclusion: formattedInclusion,
    };

    try {
      const res = await axios.post(
        `${BASE_URL}${CREATE_CELEBRATION_BOOSTER}`,
        payload,
      );

      if (res.data) {
        alert("Booster Created Successfully");
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(
        "Error creating booster:",
        err.response?.data || err.message,
      );
      alert(err.response?.data?.message || "Error creating booster");
    } finally {
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
