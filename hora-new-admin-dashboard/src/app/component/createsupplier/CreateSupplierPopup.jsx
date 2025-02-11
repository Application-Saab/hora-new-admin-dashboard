import React, { useState } from "react";
import axios from "axios";
import "./CreateSupplierPopup.css";

const CreateSupplierPopup = ({ isOpen, onClose }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [foodType, setFoodType] = useState("true");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    const supplierData = {
      aadhar_no: "",
      age: "",
      city: city,
      email: email,
      experience: "",
      is_veg: foodType,
      job_type: "",
      name: fullName,
      phone: mobileNumber,
      role: "supplier",
      userAppliance: [],
      userCuisioness: [],
      vechicle_type: "",
    };

    try {
      const response = await axios.post(
        "https://horaservices.com:3000/api/admin/user_signup",
        supplierData
      );

      if (response.data.error && response.data.status === 503) {
        alert("Supplier Already Exists");
      } else if (response.status === 200) {
        alert("Supplier Created Successfully!");
        onClose(); // Close popup
      }
    } catch (error) {
      console.error("Error creating supplier:", error);
      alert("Failed to create supplier. Try again.");
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
        <div className="popup-field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            required
          />
        </div>
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
          <label>Food Type</label>
          <select
            value={foodType}
            onChange={(e) => setFoodType(e.target.value)}
          >
            <option value="true">Veg</option>
            <option value="false">Non-Veg</option>
          </select>
        </div>
        <div className="popup-field">
          <label>City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city"
            required
          />
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
