"use client";

import React, { useEffect, useState } from "react";

import axios from "axios";

import { BASE_URL } from "@/utils/apiconstant";

const EditVenuePopup = ({ isOpen, onClose, venueData, onSuccess }) => {
  const [formData, setFormData] = useState({
    venueName: "",
    venueType: "",
    location: "",
    googleMapLink: "",
  });

  const [loading, setLoading] = useState(false);

  const [venueImage, setVenueImage] = useState(null);

  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (venueData) {
      setFormData({
        venueName: venueData.venueName || "",
        venueType: venueData.venueType || "",
        location: venueData.location || "",
        googleMapLink: venueData.googleMapLink || "",
      });

      setImagePreview(venueData.venueImageUrl || "");
    }
  }, [venueData]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setVenueImage(file);

    setImagePreview(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // await axios.put(
      //   `${BASE_URL}/api/party-venue/venue-details/${venueData._id}`,
      //   formData,
      // );

      const payload = new FormData();

      payload.append("venueName", formData.venueName);

      payload.append("venueType", formData.venueType);

      payload.append("location", formData.location);

      payload.append("googleMapLink", formData.googleMapLink);

      if (venueImage) {
        payload.append("image", venueImage);
      }

      await axios.put(
        `${BASE_URL}/api/party-venue/venue-details/${venueData._id}`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      alert("Venue Updated Successfully");

      onSuccess();

      onClose();
    } catch (err) {
      console.log(
        "%c [ err ]",
        "font-size:13px; background:pink; color:#bf2c9f;",
        err,
      );
      alert("Update Failed");
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

        <h2>Edit Venue</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="venueName"
            value={formData.venueName}
            onChange={handleChange}
            placeholder="Venue Name"
          />

          <input
            name="venueType"
            value={formData.venueType}
            onChange={handleChange}
            placeholder="Venue Type"
          />

          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
          />

          <input
            name="googleMapLink"
            value={formData.googleMapLink}
            onChange={handleChange}
            placeholder="Google Map Link"
          />

          <div
            style={{
              marginTop: "15px",
            }}
          >
            <label>Venue Image</label>

            <input type="file" accept="image/*" onChange={handleImageChange} />

            {imagePreview && (
              <div
                style={{
                  marginTop: "10px",
                }}
              >
                <img
                  src={imagePreview}
                  alt="Venue"
                  style={{
                    width: "200px",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                  }}
                />
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "flex-end",
            }}
          >
            <button type="button" onClick={onClose} className="popup-modal-btn">
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="popup-modal-btn"
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVenuePopup;
