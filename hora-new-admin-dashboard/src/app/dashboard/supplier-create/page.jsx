"use client";
import React, { useState } from "react";
import axios from "axios";
import "./testing.css";

const Testing = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [city, setCity] = useState("delhi");
  const [orderType, setOrderType] = useState("Decorator");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "https://horaservices.com:3000/api/admin/user_signup",
        {
          name,
          phone,
          role: "supplier",
        },
      );
      if (!response.data.error) {
        setToken(response.data.token);
        setUserId(response.data.dataToSave._id);
        setShowModal(true);
      } else {
        alert("Supplier Already Added");
      }
    } catch (err) {
      console.error(err);
      alert("Error signing up");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDetails = async () => {
    setLoading(true);
    const orderTypeValue = orderType === "Decorator" ? 1 : 8;

    try {
      await axios.post(
        `https://horaservices.com:3000/api/users/supplier_personal_details_update/${userId}`,
        {
          _id: userId,
          city: city,
          order_type: orderTypeValue,
          job_profile: orderType,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        },
      );
      alert("Details saved successfully!");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Error saving details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {loading && <div className="loader"></div>}

      <h2>Supplier Signup</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
      </form>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Enter Additional Details</h3>
            <label>City:</label>
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="delhi">Delhi</option>
              <option value="mumbai">Mumbai</option>
              <option value="bangalore">Bangalore</option>
              <option value="hyderabad">Hyderabad</option>
            </select>
            <label>Order Type:</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
            >
              <option value="Decorator">Decorator</option>
              <option value="photography">Photography</option>
              <option value="chef">Chef</option>
              <option value="waiter">Waiter</option>
              <option value="bar_tender">Bar Tender</option>
              <option value="cleaner">Cleaner</option>
              <option value="food_delivery">Food Delivery</option>
              <option value="live_catering">Live Catering</option>
              <option value="magician">Magician</option>
              <option value="tattoo_artist">Tattoo Artist</option>
            </select>
            <button onClick={handleSubmitDetails}>Submit</button>
            <button onClick={() => setShowModal(false)} className="close-btn">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Testing;
