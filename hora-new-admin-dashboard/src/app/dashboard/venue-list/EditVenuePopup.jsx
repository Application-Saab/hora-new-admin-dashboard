"use client";

import React, { useEffect, useState } from "react";

import axios from "axios";

import { BASE_URL } from "@/utils/apiconstant";
import { venueEventTypes, venueTypes } from "@/constants/venueListConstants";

const EditVenuePopup = ({ isOpen, onClose, venueData, onSuccess }) => {
  const [formData, setFormData] = useState({
    venueName: "",
    venueType: "",
    location: "",
    city: "",
    googleMapLink: "",
  });
  const [loading, setLoading] = useState(false);
  const [venueImage, setVenueImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [eventTypes, setEventTypes] = useState([]);
  const [guestCapacity, setGuestCapacity] = useState("");
  const [isParkingAvailable, setIsParkingAvailable] = useState(false);
  const [hallType, setHallType] = useState([]);
  const [foodTypes, setFoodTypes] = useState([]);
  const [startingPrice, setStartingPrice] = useState("");
  const [totalRoomsAvailable, setTotalRoomsAvailable] = useState("");

  useEffect(() => {
    if (venueData) {
      setFormData({
        venueName: venueData.venueName || "",
        venueType: venueData.venueType || "",
        location: venueData.location || "",
        city: venueData.city || "",
        googleMapLink: venueData.googleMapLink || "",
      });

      setEventTypes(venueData.eventTypes || []);
      setGuestCapacity(venueData.guestCapacity || "");
      setIsParkingAvailable(venueData.isParkingAvailable || false);
      setHallType(venueData.hallType || []);
      setFoodTypes(venueData.foodTypes || []);
      setStartingPrice(venueData.startingPrice || "");
      setTotalRoomsAvailable(venueData.totalRoomsAvailable || "");

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

  const toggleValue = (value, setState) => {
    setState((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const payload = new FormData();
      payload.append("venueName", formData.venueName);
      payload.append("venueType", formData.venueType);
      payload.append("location", formData.location);
      payload.append("city", formData.city);
      payload.append("googleMapLink", formData.googleMapLink);
      payload.append("eventTypes", JSON.stringify(eventTypes));
      payload.append("guestCapacity", guestCapacity);
      payload.append("isParkingAvailable", isParkingAvailable);
      payload.append("hallType", JSON.stringify(hallType));
      payload.append("foodTypes", JSON.stringify(foodTypes));
      payload.append("startingPrice", startingPrice);
      payload.append("totalRoomsAvailable", totalRoomsAvailable);
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
        <div
          className="container"
          style={{
            maxHeight: "700px",
            overflowY: "auto",
            paddingBottom: "10px",
            width: "100%",
            maxWidth: "90%",
          }}
        >
          <form onSubmit={handleSubmit}>
            <input
              name="venueName"
              value={formData.venueName}
              onChange={handleChange}
              placeholder="Venue Name"
            />

            <select
              value={formData.venueType}
              name="venueType"
              onChange={handleChange}
              required
              style={{marginTop: "20px"}}
            >
              {venueTypes?.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Location"
            />
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Venue City"
            />

            <input
              name="googleMapLink"
              value={formData.googleMapLink}
              onChange={handleChange}
              placeholder="Google Map Link"
            />

            <hr />
            <label>Event Types</label>
            <div className="scroll-box">
              {venueEventTypes.map((type) => (
                <div
                  key={type}
                  className="items-dropdown-ctn"
                  onClick={() => toggleValue(type, setEventTypes, eventTypes)}
                >
                  <div>
                    <label>{type}</label>
                  </div>

                  <input
                    type="checkbox"
                    checked={eventTypes.includes(type)}
                    readOnly
                  />
                </div>
              ))}
            </div>

            <hr />

            <label>Hall Type</label>

            <div className="scroll-box">
              {["Outdoor", "Indoor"].map((type) => (
                <div
                  key={type}
                  className="items-dropdown-ctn"
                  onClick={() => toggleValue(type, setHallType, hallType)}
                >
                  <div>
                    <label>{type}</label>
                  </div>

                  <input
                    type="checkbox"
                    checked={hallType.includes(type)}
                    readOnly
                  />
                </div>
              ))}
            </div>

            <hr />

            <label>Food Types</label>

            <div className="scroll-box">
              {["veg", "non-veg"].map((type) => (
                <div
                  key={type}
                  className="items-dropdown-ctn"
                  onClick={() => toggleValue(type, setFoodTypes, foodTypes)}
                >
                  <div>
                    <label>{type}</label>
                  </div>

                  <input
                    type="checkbox"
                    checked={foodTypes.includes(type)}
                    readOnly
                  />
                </div>
              ))}
            </div>
            <hr />
            <label>Guest Capacity</label>
            <input
              type="number"
              value={guestCapacity}
              onChange={(e) => setGuestCapacity(e.target.value)}
            />
            <hr />
            <label>Starting Price</label>

            <input
              type="number"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
            />
            <hr />
            <label>Rooms Available</label>

            <input
              type="number"
              value={totalRoomsAvailable}
              onChange={(e) => setTotalRoomsAvailable(e.target.value)}
            />
            <hr />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              <label>Parking Available</label>
              <input
                type="checkbox"
                checked={isParkingAvailable}
                onChange={(e) => setIsParkingAvailable(e.target.checked)}
              />
            </div>
            <hr />

            <div
              style={{
                marginTop: "15px",
              }}
            >
              <label>Venue Image</label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />

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
              <button
                type="button"
                onClick={onClose}
                className="popup-modal-btn"
              >
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
    </div>
  );
};

export default EditVenuePopup;
