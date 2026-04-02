"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BASE_URL, ADMIN_USER_LIST } from "../../../utils/apiconstant";

const CheckCustomer = ({ onCustomerIdChange , setEnteredNum }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageColor, setMessageColor] = useState("");
    const [customerNumber, setCustomerNumber] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState("");
    const [newCustomerPhone, setNewCustomerPhone] = useState("");

    const handleCheckCustomer = useCallback(async () => {
        if (customerNumber.length !== 10) return;

        setMessage("");
        setLoading(true);

        try {
            const response = await axios.post(`${BASE_URL}${ADMIN_USER_LIST}`, {
                phone: customerNumber,
                per_page: 1,
                role: "customer",
            });

            const users = response?.data?.data?.users || [];

            if (users.length > 0) {
                const foundCustomerId = users[0]._id;
                setMessage("Customer exists.");
                setMessageColor("green");
                setEnteredNum(customerNumber);
                onCustomerIdChange(foundCustomerId); // Pass customerId to parent
                setShowPopup(false);
            } else {
                setMessage("Customer does not exist.");
                setMessageColor("red");
                setShowPopup(true);
            }
        } catch (err) {
            setMessage("An error occurred while checking the customer.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [customerNumber, onCustomerIdChange]);

    useEffect(() => {
        handleCheckCustomer();
    }, [customerNumber, handleCheckCustomer]);

    const handleAddCustomer = async () => {
        const requestData = {
            name: newCustomerName,
            phone: newCustomerPhone,
            email: "",
            role: "customer",
        };

        try {
            const response = await axios.post(
                "http://localhost:5000/api/admin/user_signup",
                requestData
            );

            const newCustomerId = response.data.dataToSave._id;
        
            onCustomerIdChange(newCustomerId); // Pass new customerId to parent
            setMessage("Customer successfully added.");
            setMessageColor("green");
            setShowPopup(false);
        } catch (err) {
            console.error("Error adding customer:", err);
            setMessage("Failed to add customer.");
            setMessageColor("red");
        }
    };

    return (
        <div className="container checkcustomer">
            <div className="orderCreation form">
                <input
                    type="text"
                    id="customerNumber"
                    value={customerNumber}
                    onInput={(e) => setCustomerNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter customer number*"
                    required
                    maxLength={10}
                    pattern="\d{10}"
                    inputMode="numeric"
                    style={{ marginRight: '10px', padding: '5px' }}
                />
                {message && <p style={{ color: messageColor }}>{message}</p>}
            </div>

            {loading && <div className="loader">Loading...</div>}

            {showPopup && (
                <div className="popup" style={style.popup}>
                <h2 style={style.title}>Add New Customer</h2>
            
                <label style={style.label}>
                    Name:
                    <input
                        type="text"
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                        style={style.input}
                    />
                </label>
            
                <label style={style.label}>
                    Phone:
                    <input
                        type="text"
                        value={newCustomerPhone}
                        onInput={(e) => setNewCustomerPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="Customer Number"
                        required
                        maxLength={10}
                        pattern="\d{10}"
                        inputMode="numeric"
                        style={style.input}
                    />
                </label>
            
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <button onClick={handleAddCustomer} style={style.button}>
                        Add Customer
                    </button>
                    <button onClick={() => setShowPopup(false)} style={{ ...style.button, ...style.cancelButton }}>
                        Cancel
                    </button>
                </div>
            </div>
            
            )}
        </div>
    );
};
const style = {
    popup: {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "400px",
      padding: "20px",
      background: "#ffffff",
      borderRadius: "16px",
      boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.1)",
      zIndex: 1000,
      animation: "fade-in 0.3s ease-in-out",
    },
  
    "@keyframes fade-in": {
      from: {
        opacity: 0,
        transform: "translate(-50%, -60%)",
      },
      to: {
        opacity: 1,
        transform: "translate(-50%, -50%)",
      },
    },
  
    title: {
      margin: "0 0 15px",
      fontSize: "1.6rem",
      fontWeight: 600,
      color: "#333",
      textAlign: "center",
    },
  
    label: {
      display: "block",
      margin: "12px 0 6px",
      fontSize: "0.9rem",
      color: "#555",
    },
  
    input: {
      width: "calc(100% - 20px)",
      padding: "12px",
      marginBottom: "15px",
      border: "1px solid #ddd",
      borderRadius: "12px",
      background: "#f9f9f9",
      fontSize: "1rem",
      outline: "none",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    },
  
    inputFocus: {
      borderColor: "#4caf50",
      boxShadow: "0 4px 8px rgba(76, 175, 80, 0.2)",
    },
  
    button: {
      width: "48%",
      padding: "12px",
      margin: "10px 1%",
      border: "none",
      borderRadius: "12px",
      background: "#4caf50",
      color: "#ffffff",
      fontSize: "1rem",
      fontWeight: 600,
      cursor: "pointer",
      transition: "background-color 0.3s ease, transform 0.2s ease",
    },
  
    buttonHover: {
      backgroundColor: "#45a049",
      transform: "translateY(-2px)",
    },
  
    cancelButton: {
      background: "#e0e0e0",
      color: "#333",
    },
  
    cancelButtonHover: {
      background: "#d6d6d6",
    },

 
    "@media (max-width: 480px)": {
      popup: {
        width: "90%",
        padding: "15px",
      },
      title: {
        fontSize: "1.4rem",
      },
    },
  };
export default CheckCustomer;