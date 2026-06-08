"use client";
import React, { useState } from "react";
import axios from "axios";

import {
  BASE_URL,
  ADMIN_USER_LIST,
  ADMIN_USER_SIGNUP,
} from "../../../utils/apiconstant";
import "./createVenue.css";
import { venueEventTypes, venueTypes } from "@/constants/venueListConstants";

const CreateVenuePopup = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [customerNumber, setCustomerNumber] = useState("");
  const [customerId, setCustomerId] = useState(null);

  const [venueType, setVenueType] = useState("");
  const [venueName, setVenueName] = useState("");
  const [location, setLocation] = useState("");
  const [venueCity, setVenueCity] = useState("");
  const [googleMapLink, setGoogleMapLink] = useState("");
  const [venueImage, setVenueImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [eventTypes, setEventTypes] = useState([]);
  const [guestCapacity, setGuestCapacity] = useState("");
  const [isParkingAvailable, setIsParkingAvailable] = useState(false);
  const [hallType, setHallType] = useState([]);
  const [foodTypes, setFoodTypes] = useState([]);
  const [startingPrice, setStartingPrice] = useState("");
  const [totalRoomsAvailable, setTotalRoomsAvailable] = useState("");

  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");

  const [checkLoading, setCheckLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [showPopup, setShowPopup] = useState(false);

  const [newCustomerName, setNewCustomerName] = useState("");

  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  const toggleValue = (value, setState) => {
    setState((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  // -------------------------------------------------
  // Check Customer
  // -------------------------------------------------
  const handleCheckCustomer = async (e) => {
    e.preventDefault();

    setCheckLoading(true);
    setMessage("");

    try {
      const response = await axios.post(`${BASE_URL}${ADMIN_USER_LIST}`, {
        phone: customerNumber,
        per_page: 1,
        role: "customer",
      });

      const users = response?.data?.data?.users || [];

      const customer = users.find((u) => u.phone === customerNumber);

      if (customer) {
        setCustomerId(customer._id);

        setMessage("Customer exists");
        setMessageColor("green");

        setShowPopup(false);
      } else {
        setShowPopup(true);

        setMessage("Customer not found");
        setMessageColor("red");
      }
    } catch (err) {
      console.log(
        "%c [ err ]",
        "font-size:13px; background:pink; color:#bf2c9f;",
        err,
      );
      setShowPopup(true);

      setMessage("Error checking customer");
      setMessageColor("red");
    } finally {
      setCheckLoading(false);
    }
  };

  // -------------------------------------------------
  // Add Customer
  // -------------------------------------------------
  const handleAddCustomer = async () => {
    try {
      const res = await axios.post(`${BASE_URL}${ADMIN_USER_SIGNUP}`, {
        name: newCustomerName,
        phone: newCustomerPhone,
        role: "customer",
      });

      setCustomerId(res.data.dataToSave._id);

      setShowPopup(false);

      setMessage("Customer created successfully");

      setMessageColor("green");
    } catch (err) {
      console.log(
        "%c [ err ]",
        "font-size:13px; background:pink; color:#bf2c9f;",
        err,
      );
      setMessage("Failed to create customer");

      setMessageColor("red");
    }
  };

  // -------------------------------------------------
  // Create Venue
  // -------------------------------------------------
  const handleCreateVenue = async (e) => {
    e.preventDefault();

    if (!customerId) {
      setMessage("Please verify customer first");

      setMessageColor("red");

      return;
    }

    try {
      setCreateLoading(true);
      const formData = new FormData();

      formData.append("userId", customerId);
      formData.append("venueType", venueType);
      formData.append("venueName", venueName);
      formData.append("location", location);
      formData.append("city", venueCity);
      formData.append("googleMapLink", googleMapLink);
      formData.append("eventTypes", JSON.stringify(eventTypes));
      formData.append("guestCapacity", guestCapacity);
      formData.append("isParkingAvailable", isParkingAvailable);
      formData.append("hallType", JSON.stringify(hallType));
      formData.append("foodTypes", JSON.stringify(foodTypes));
      formData.append("startingPrice", startingPrice);
      formData.append("totalRoomsAvailable", totalRoomsAvailable);

      if (venueImage) {
        formData.append("image", venueImage);
      }

      const res = await axios.post(
        `${BASE_URL}/api/party-venue/create-party-venue`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (!res.data.error) {
        setMessage("Venue created successfully ✅");

        setMessageColor("green");

        alert("Venue Created");

        onSuccess();

        onClose();
      }
    } catch (err) {
      console.error(err);

      setMessage("Error creating venue");

      setMessageColor("red");
    } finally {
      setCreateLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-btn" onClick={onClose}>
          X
        </button>

        <h2>Create Venue</h2>
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
          {/* Customer Section */}
          <label>Owner or Manager Number *</label>

          <input
            type="text"
            value={customerNumber}
            onInput={(e) =>
              setCustomerNumber(e.target.value.replace(/\D/g, ""))
            }
            maxLength={10}
          />

          <button
            onClick={handleCheckCustomer}
            className="create-popup-btn"
            disabled={checkLoading}
          >
            {checkLoading ? "Checking..." : "Check Customer"}
          </button>

          <p style={{ color: messageColor }}>{message}</p>

          {/* Venue Form */}
          {customerId && (
            <div
            // className="venue-form-ctn"
            >
              <form onSubmit={handleCreateVenue}>
                <label>Venue Type *</label>

                <select
                  value={venueType}
                  onChange={(e) => setVenueType(e.target.value)}
                  required
                >
                  {venueTypes?.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <label>Venue Name *</label>

                <input
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  required
                />

                <label>Location *</label>

                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />

                <label>City *</label>

                <input
                  value={venueCity}
                  onChange={(e) => setVenueCity(e.target.value)}
                  required
                />

                <label>Google Map Link</label>

                <input
                  value={googleMapLink}
                  onChange={(e) => setGoogleMapLink(e.target.value)}
                />

                <hr />
                <label>Event Types</label>
                <div className="scroll-box">
                  {venueEventTypes?.map((type) => (
                    <div
                      key={type}
                      className="items-dropdown-ctn"
                      onClick={() =>
                        toggleValue(type, setEventTypes, eventTypes)
                      }
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
                <label>Venue Image</label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (!file) return;

                    setVenueImage(file);

                    setImagePreview(URL.createObjectURL(file));
                  }}
                />

                {imagePreview && (
                  <div style={{ marginTop: "10px" }}>
                    <img
                      src={imagePreview}
                      alt="preview"
                      style={{
                        width: "150px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="create-popup-btn"
                  disabled={createLoading}
                >
                  {createLoading ? "Creating..." : "Create Venue"}
                </button>
              </form>
            </div>
          )}

          {/* Popup */}
          {showPopup && (
            <div className="popup">
              <h3>Add New Customer</h3>

              <input
                placeholder="Name"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
              />

              <input
                placeholder="Phone"
                value={newCustomerPhone}
                onInput={(e) =>
                  setNewCustomerPhone(e.target.value.replace(/\D/g, ""))
                }
                maxLength={10}
              />

              <button onClick={handleAddCustomer} className="popup-modal-btn">
                Create Customer
              </button>

              <button
                onClick={() => setShowPopup(false)}
                className="popup-modal-btn"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateVenuePopup;
