
import React, { useState } from "react";
import axios from "axios";
import "./CreateSupplierPopup.css";
import {supplierType} from "../../../utils/supplierType";
import { BASE_URL } from "@/utils/apiconstant";
import {updateSupplierDetailsApi} from './supplierDetails.js';

const CreateSupplierPopup = ({ isOpen, onClose ,CustomerNumber}) => {
  const [fullName, setFullName] = useState("");
  // const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState(CustomerNumber);
  const [orderType, setOrderType] = useState("Decorator");
  const [city, setCity] = useState("delhi");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
  
    if (!fullName.trim()) {
      alert("Full Name is required.");
      setLoading(false);
      return;
    }
    if (!city.trim()) {
      alert("City is required.");
      setLoading(false);
      return;
    }
    if (mobileNumber.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      setLoading(false);
      return;
    }

    const supplierData = {
      name: fullName.trim(),
      phone: mobileNumber,
      role: "supplier",
    };
  
    console.log("Supplier Data:", supplierData); // Debugging
  
    try {
      const response = await axios.post(
        `${BASE_URL}/api/admin/user_signup`,
        supplierData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (!response?.data?.error) {
      const newUserId = response?.data?.dataToSave?._id;
      const newToken = response?.data?.token;

      await handleSubmitDetails(newUserId, newToken);
      } else {
        alert("Supplier Already Added");
      }
    } catch (error) {
      console.error("Error creating supplier:", error?.response?.data || error);
      alert(`Error: ${error?.response?.data?.message || "Invalid request."}`);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmitDetails = async (id, authToken) => {
    setLoading(true);
    const orderTypeValue = orderType === "Decorator" ? 1 : 8;
    try {
    await updateSupplierDetailsApi(id,
    {
    _id: id,
    city: city,
    order_type: orderTypeValue,
    job_profile: orderType,
    },
  authToken
);
      alert("Details saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving details");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <h2>Create Supplier</h2>
        <div className="popup-field">
          <label>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter full name"
            required
          />
        </div>
        {/* <div className="popup-field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            required
          />
        </div> */}
        <div className="popup-field">
          <label>Mobile Number</label>
          <input
            type="text"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter mobile number"
            maxLength={10}
            required
          />
        </div>
        <div className="popup-field">
          <label>Order Type:</label>
          <select
  value={orderType}
  onChange={(e) => setOrderType(e.target.value)}
>
  <option value="">Select Type</option>

  {supplierType.map((item, index) => (
    <option key={index} value={item.value}>
      {item.label}
    </option>
  ))}
</select>
        </div>
        <div className="popup-field">
          <label>City:</label>
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="delhi">Delhi</option>
              <option value="mumbai">Mumbai</option>
              <option value="bangalore">Bangalore</option>
              <option value="hyderabad">Hyderabad</option>
            </select>
        </div>
        
        <div className="popup-buttons">
          <button
            className="create-btn"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create"}
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSupplierPopup;