"use client";
import React, { useState } from "react";
import axios from "axios";

import {
  BASE_URL,
  ADMIN_USER_LIST,
  ADMIN_USER_SIGNUP,
} from "../../../utils/apiconstant";
import "./createVenue.css";

const CreateVenuePopup = ({
  isOpen,
  onClose,
  //   materialData,
  onSuccess,
}) => {
  const [customerNumber, setCustomerNumber] = useState("");
  const [customerId, setCustomerId] = useState(null);

  const [venueType, setVenueType] = useState("");
  const [venueName, setVenueName] = useState("");
  const [location, setLocation] = useState("");
  const [googleMapLink, setGoogleMapLink] = useState("");
  const [venueImage, setVenueImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");

  const [checkLoading, setCheckLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [showPopup, setShowPopup] = useState(false);

  const [newCustomerName, setNewCustomerName] = useState("");

  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  // NEW
  // const [createdVenue, setCreatedVenue] = useState(null);

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
      formData.append("googleMapLink", googleMapLink);

      if (venueImage) {
        formData.append("image", venueImage);
      }

      const res = await axios.post(
        "http://localhost:5000/api/party-venue/create-party-venue",
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
        <div className="container">
          <h3>Create Venue 🏛️</h3>

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
            <form onSubmit={handleCreateVenue}>
              <label>Venue Type *</label>

              <input
                value={venueType}
                onChange={(e) => setVenueType(e.target.value)}
                placeholder="Hall / Lawn"
                required
              />

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

              <label>Google Map Link</label>

              <input
                value={googleMapLink}
                onChange={(e) => setGoogleMapLink(e.target.value)}
              />

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
          )}

          {/* SHOW EVENT WALL ONLY AFTER VENUE CREATED */}
          {/*   {createdVenue && (
        <div className="event-wall-container">
          <h2 className="wall-heading text-center m-0 p-0">
            Explore Spaces
          </h2>

          <EventWallSection
            venueId={createdVenue._id}
            customerId={customerId}
          />
        </div>
      )}  */}

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
