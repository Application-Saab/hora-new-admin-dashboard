"use client";
import React, { useState, useEffect } from "react";
import "./CreateCelebrationPopup.css";
import { BASE_URL, UPDATE_CELEBRATION_BOOSTER } from "@/utils/apiconstant";

const EditCelebrationBoosterPopup = ({
  isOpen,
  onClose,
  boosterData,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    featured_image: "",
    price: "",
    cost_price: "",
    type: "",
    caption: "",
    badge: "",
    discount: "",
  });
  const [inclusionText, setInclusionText] = useState("");
  const [loading, setLoading] = useState(false);

  const formatText = (text) => [
    `<div>- ${text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join(" - ")}</div>`,
  ];

  // ✅ Prefill data
  useEffect(() => {
    if (boosterData) {
      setFormData({
        name: boosterData.name || "",
        featured_image: boosterData.featured_image || "",
        price: boosterData.price || "",
        cost_price: boosterData.cost_price || "",
        type: boosterData.type || "",
        caption: boosterData.caption || "",
        badge: boosterData.badge || "",
        discount: boosterData.discount || "",
      });

      // ✅ Convert HTML → normal text
      if (boosterData.inclusion?.length) {
        const cleanText = boosterData.inclusion[0]
          .replace(/<[^>]*>/g, "")
          .replace(/-/g, "\n")
          .trim();

        setInclusionText(cleanText);
      }
    }
  }, [boosterData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Image Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("http://localhost:5000/api/image_upload", {
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

    const formattedInclusion = formatText(inclusionText);

    const payload = {
      ...formData,
      inclusion: formattedInclusion, // 🔥 same structure as decoration
    };

    try {
      const res = await fetch(
        `${BASE_URL}${UPDATE_CELEBRATION_BOOSTER}/${boosterData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (data) {
        alert("Booster Updated Successfully");
        onSuccess();
        onClose();
      }

      setLoading(false);
    } catch (err) {
      console.log(err);
      alert("Error updating booster");
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

        <h2>Edit Celebration Booster</h2>

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

              {/* Image Preview + Upload */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                {formData.featured_image && (
                  <img
                    src={`https://horaservices.com/api/uploads/${formData.featured_image}`}
                    alt="preview"
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
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
                placeholder="Type"
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
                placeholder="Badge"
                value={formData.badge}
                onChange={handleChange}
                className="package-create-input"
              />
            </div>
            {/* Inclusion */}
            <div className="package-create-input-ctn">
              <textarea
                placeholder="Enter Inclusion (each line = one item)"
                value={inclusionText}
                onChange={(e) => setInclusionText(e.target.value)}
                className="package-create-input"
                style={{ height: "120px", width: "100%" }}
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
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCelebrationBoosterPopup;
