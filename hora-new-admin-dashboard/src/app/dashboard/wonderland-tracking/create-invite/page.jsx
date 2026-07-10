"use client";
import React, { useState } from "react";
import axios from "axios";
import {
  BASE_URL,
  ADMIN_USER_LIST,
  ADMIN_USER_SIGNUP,
  CREATE_WONDERLAND_EVENT,
} from "../../../../utils/apiconstant";
import "./CreateEventInvite.css";
import { inviteTypes } from "@/constants/venueListConstants";

const CreateEventInvitePage = () => {
  const [step, setStep] = useState(1); // 1: Customer, 2: Event Details

  // Customer States
  const [customerNumber, setCustomerNumber] = useState("");
  const [customerId, setCustomerId] = useState(null);
  const [hostName, setHostName] = useState("");

  // New Customer States
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);

  // Name Edit State (when customer exists but name is missing)
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const [checkLoading, setCheckLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Event States
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");

  const [location, setLocation] = useState("");
  const [googleMapLink, setGoogleMapLink] = useState("");
  const [fromInternational, setFromInternational] = useState(false);

  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");
  const [eventCreated, setEventCreated] = useState(false);
  const [createdEventId, setCreatedEventId] = useState("");

  // ==================== CHECK CUSTOMER ====================
  const handleCheckCustomer = async (e) => {
    e.preventDefault();
    if (!customerNumber || customerNumber.length !== 10) {
      setMessage("Please enter a valid 10-digit phone number");
      setMessageColor("red");
      return;
    }

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

        if (!customer.name || customer.name.trim() === "") {
          // Name missing → Show name edit form
          setEditedName("");
          setShowNameEdit(true);
          setMessage("Customer found but name is missing. Please add name.");
          setMessageColor("orange");
        } else {
          // setHostName(customer.name);
          setMessage("Customer found successfully!");
          setMessageColor("green");
          setStep(2);
        }
      } else {
        setShowNewCustomerForm(true);
        setMessage("Customer not found. Please create new host.");
        setMessageColor("orange");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error checking customer.");
      setMessageColor("red");
    } finally {
      setCheckLoading(false);
    }
  };

  // ==================== SAVE / UPDATE NAME ====================
  const handleSaveName = async () => {
    if (!editedName.trim()) {
      setMessage("Please enter a valid name");
      setMessageColor("red");
      return;
    }

    setEditLoading(true);

    try {
      // Replace UPDATE_USER_BY_ID with your actual constant if available
      const response = await axios.put(
        `${BASE_URL}/api/user/user-details/${customerId}`, // Adjust endpoint if needed
        { name: editedName.trim() },
        {
          headers: {
            Authorization: localStorage.getItem("token") || "", // Adjust according to your auth
          },
        }
      );

      if (!response.data.error) {
        // setHostName(editedName.trim());
        setShowNameEdit(false);
        setMessage("Name saved successfully!");
        setMessageColor("green");
        setStep(2); // Move to Event Details
      } else {
        setMessage("Failed to save name");
        setMessageColor("red");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error updating name. Please try again.");
      setMessageColor("red");
    } finally {
      setEditLoading(false);
    }
  };

  // ==================== CREATE NEW CUSTOMER ====================
  const handleCreateNewCustomer = async () => {
    if (
      !newCustomerName.trim() ||
      !newCustomerPhone ||
      newCustomerPhone.length !== 10
    ) {
      setMessage("Please fill Name and valid 10-digit Phone");
      setMessageColor("red");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}${ADMIN_USER_SIGNUP}`, {
        name: newCustomerName.trim(),
        phone: newCustomerPhone,
        role: "customer",
      });

      setCustomerId(res.data.dataToSave._id);
      //   setHostName(newCustomerName.trim());
      setShowNewCustomerForm(false);
      setNewCustomerName("");
      setNewCustomerPhone("");

      setMessage("Host created successfully!");
      setMessageColor("green");
      setStep(2); // Move to Event Form
    } catch (err) {
      console.error(err);
      setMessage("Failed to create host. Please try again.");
      setMessageColor("red");
    }
  };

  // ==================== TIME CONVERSION FUNCTION ====================
  const convertTo12HourFormat = (time24) => {
    if (!time24) return "";

    const [hours, minutes] = time24.split(":").map(Number);

    let period = hours >= 12 ? "PM" : "AM";
    let hour12 = hours % 12;

    if (hour12 === 0) hour12 = 12; // 00:00 -> 12:00 AM, 12:00 -> 12:00 PM

    const formattedHour = String(hour12).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");

    return `${formattedHour}:${formattedMinutes} ${period}`;
  };

  // ==================== CREATE EVENT ====================
  const handleCreateEvent = async (e) => {
    e.preventDefault();

    if (!hostName) {
      setMessage("Please fill Event Title");
      setMessageColor("red");
      return;
    }

    setCreateLoading(true);
    setMessage("");
    const formattedTime = convertTo12HourFormat(eventTime);

    try {
      const payload = {
        userId: customerId,
        eventType,
        hostName,
        eventDate,
        eventTime: formattedTime,
        location,
        googleMapLink,
        fromInternational: fromInternational ? "yes" : "no",
      };

      const res = await axios.post(
        `${BASE_URL}${CREATE_WONDERLAND_EVENT}`,
        payload
      );

      if (!res.data.error) {
        setMessage("🎉 Event Invite Created Successfully!");
        setMessageColor("green");
        setEventCreated(true);
        setCreatedEventId(res.data?.data?._id || res.data?.data?.event?._id);
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to create event");
      setMessageColor("red");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="create-event-page">
      <div className="page-container">
        <div className="header">
          <h1>✨ Create Event Invite</h1>
          <p className="subtitle">Host a memorable event with Wonderland</p>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? "active" : ""}`}>
            1. Host Details
          </div>
          <div className={`step ${step >= 2 ? "active" : ""}`}>
            2. Event Details
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && !showNameEdit && (
          <div className="section">
            <h2>Host Information</h2>
            <div className="input-group">
              <label>Host Phone Number <span className="required">*</span></label>
              <input
                type="text"
                value={customerNumber}
                onChange={(e) => setCustomerNumber(e.target.value.replace(/\D/g, ""))}
                maxLength={10}
                placeholder="Enter 10 digit phone number"
                className="input-field"
              />
            </div>

            <button
              onClick={handleCheckCustomer}
              className="primary-btn"
              disabled={checkLoading}
            >
              {checkLoading ? "Checking..." : "Verify Host"}
            </button>

            {message && <p className="message" style={{ color: messageColor }}>{message}</p>}
          </div>
        )}

        {/* Name Edit Form (When customer exists but name missing) */}
        {showNameEdit && (
          <div className="section">
            <h2>Add Host Name</h2>
            <div className="input-group">
              <label>Full Name <span className="required">*</span></label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Enter host full name"
                className="input-field"
              />
            </div>

            <div className="btn-group">
              <button 
                onClick={handleSaveName} 
                className="primary-btn"
                disabled={editLoading}
              >
                {editLoading ? "Saving..." : "Save Name & Continue"}
              </button>
              <button 
                onClick={() => setShowNameEdit(false)} 
                className="secondary-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* New Customer Form */}
        {showNewCustomerForm && (
          <div className="section new-customer-section">
            <h2>Create New Host</h2>
            <div className="input-group">
              <label>
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                placeholder="Enter host name"
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label>
                Phone Number <span className="required">*</span>
              </label>
              <input
                type="text"
                value={newCustomerPhone}
                onChange={(e) =>
                  setNewCustomerPhone(e.target.value.replace(/\D/g, ""))
                }
                maxLength={10}
                placeholder="Enter 10 digit number"
                className="input-field"
              />
            </div>

            <div className="btn-group">
              <button onClick={handleCreateNewCustomer} className="primary-btn">
                Create Host
              </button>
              <button
                onClick={() => setShowNewCustomerForm(false)}
                className="secondary-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Event Details */}
        {step === 2 && (
          <form onSubmit={handleCreateEvent} className="event-form">
            <div className="section">
              <h2>Event Details</h2>

              <div className="input-group">
                <label>
                  Event Type
                  {/* <span className="required">*</span> */}
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  //   required
                  className="input-field"
                >
                  <option value="">Select Event Type</option>
                  {inviteTypes?.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>
                  Event Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="Event Title"
                  required
                  className="input-field"
                  max={30}
                />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>
                    Event Date
                    {/* <span className="required">*</span> */}
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    // required
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label>Event Time</label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="input-group">
                <label>
                  Location
                  {/* <span className="required">*</span> */}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Full venue / event address"
                  //   required
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label>Google Map Link</label>
                <input
                  type="url"
                  value={googleMapLink}
                  onChange={(e) => setGoogleMapLink(e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="input-field"
                />
              </div>

              <div className="checkbox-container">
                <input
                  type="checkbox"
                  checked={fromInternational}
                  onChange={(e) => setFromInternational(e.target.checked)}
                  id="international"
                />
                <label htmlFor="international">
                  This is an International Event
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="create-event-btn"
              disabled={createLoading}
            >
              {createLoading ? "Creating Event..." : "🎉 Create Event Invite"}
            </button>

            {message && (
              <p
                className="message"
                style={{
                  color: messageColor,
                  textAlign: "center",
                  marginTop: "15px",
                }}
              >
                {message}
              </p>
            )}
            {eventCreated && (
              <p
                className="message"
                style={{
                  color: messageColor,
                  textAlign: "center",
                  marginTop: "15px",
                }}
              >
                Invite Link Admin :{" "}
                <a
                  target="_blank"
                  href={`https://horaservices.com/${fromInternational ? "wonderlandinternational" : "wonderland"}/invite?eventid=${createdEventId}&frompanel=true`}
                >{`https://horaservices.com/${fromInternational ? "wonderlandinternational" : "wonderland"}/invite?eventid=${createdEventId}&frompanel=true`}</a>
              </p>
            )}
            {eventCreated && (
              <p
                className="message"
                style={{
                  color: messageColor,
                  textAlign: "center",
                  marginTop: "15px",
                }}
              >
                Invite Link To Share :{" "}
                <a
                  target="_blank"
                  href={`https://horaservices.com/${fromInternational ? "wonderlandinternational" : "wonderland"}/invite?eventid=${createdEventId}`}
                >{`https://horaservices.com/${fromInternational ? "wonderlandinternational" : "wonderland"}/invite?eventid=${createdEventId}`}</a>
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateEventInvitePage;
