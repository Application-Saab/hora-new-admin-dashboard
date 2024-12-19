"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import {
  BASE_URL,
  CONFIRM_ORDER_ENDPOINT,
  SAVE_LOCATION_ENDPOINT,
  GET_PHOTOGRAPHY_BY_NAME,
  ADMIN_USER_LIST,
  ADMIN_USER_SIGNUP,
  API_SUCCESS_CODE,
} from "../../../utils/apiconstant";
import { timeSlotOptions, pincodes } from "../../../utils/timeSlots";


const AddOrder = () => {
  const [dishName, setDishName] = useState("");
  const [productid, setProductID] = useState("");
  const [category, setCategory] = useState("");
  const [inclusion, setInclusion] = useState("");
  const [date, setDate] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");
  const [address, setAddress] = useState("");
  const [googleLocation, setGoogleLocation] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [product, setProduct] = useState(null);
  const [isContinueClicked, setIsContinueClicked] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [pincodeMessage, setPincodeMessage] = useState("");
  const [pincodeMessageColor, setPincodeMessageColor] = useState("");
  const [totalamount, setTotalAmount] = useState("");
  const [advanceamount, setAdvanceAmount] = useState("");
  const [balanceamount, setBalanceAmount] = useState("");
  const [orderTakenBy, setOrderTakenBy] = useState("");

  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");

  const [customerId, setCustomerId] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  const handleComment = (e) => {
    const commentText = e.target.value;
    setComment(commentText);
  };

  useEffect(() => {
    if (dishName && isContinueClicked && !isFetched) {
      const fetchProductDetails = async () => {
        try {
          const url = `${BASE_URL}${GET_PHOTOGRAPHY_BY_NAME}`;
          const response = await axios.get(url);
          if (
            response.data &&
            !response.data.error &&
            response.data.data.length > 0
          ) {
            const productData = response.data.data[0];
            console.log(productData, "productdata");
            console.log(productData.inclusion, "product inclusion");
            setProduct(productData);
            setProductID(productData._id);
            setCategory(productData.price);
            const inclusions =
              productData?.inclusion?.length > 0
                ? productData.inclusion[0].split(/<\/div><div>/).map((item) =>
                    item
                      .replace(/<\/?div>/g, "")
                      .replace(/<\/?span>/g, "")
                      .replace(/<br\s*\/?>/g, "")
                      .trim()
                  )
                : [];

            setInclusion(inclusions);
            setShowProductDetails(true);
            setIsFetched(true);
          } else {
            setShowProductDetails(false);
          }
        } catch (error) {
          console.error("Error fetching product:", error.message);
        }
      };

      fetchProductDetails();
    }
  }, [dishName, isContinueClicked, isFetched]);

  useEffect(() => {
    if (pincode) {
      if (pincodes.includes(pincode)) {
        setPincodeMessage("Pincode available");
        setPincodeMessageColor("green");
      } else {
        setPincodeMessage("Pincode not available");
        setPincodeMessageColor("red");
      }
    } else {
      setPincodeMessage("");
      setPincodeMessageColor("");
    }
  }, []);

  const handleCheckCustomer = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}${ADMIN_USER_LIST}`, {
        email: "",
        page: "",
        per_page: 2000,
        phone: "",
        role: "customer",
      });

      const users = response?.data?.data?.users;

      if (Array.isArray(users)) {
        const customer = users.find((user) => user.phone === customerNumber);
        console.log(customer, "customer");
        setCustomerId(customer);
        if (customer) {
          setMessage("Customer exists.");
          setMessageColor("green");
          setShowButton(true);
        } else {
          setMessage("Customer does not exist.");
          setMessageColor("red");
          setShowPopup(true);
          setShowButton(false);
        }
      } else {
        setMessage("No users found in the response.");
        setShowButton(false);
      }
    } catch (err) {
      setMessage("An error occurred while checking the customer.");
      console.error(err);
      setShowButton(false);
    } finally {
      setLoading(false);
    }
  };

  const [showButton, setShowButton] = useState(false);

  const handleAddCustomer = async () => {
    const requestData = {
      name: newCustomerName,
      phone: newCustomerPhone,
      email: "",
      role: "customer",
    };
    console.log(requestData, "requestion data");
    try {
      const response = await axios.post(
        `${BASE_URL}${ADMIN_USER_SIGNUP}`,
        requestData
      );

      setCustomerId(response.data.dataToSave);
      setMessage("Customer successfully added.");
      setMessageColor("green");
      setShowPopup(false);
      setShowButton(true);
    } catch (err) {
      console.error("Error adding customer:", err);
      setMessage("Failed to add customer.");
      setMessageColor("red");
    }
  };

  useEffect(() => {
    console.log("showButton state updated:", showButton);
  }, [showButton]);

  const handleContinueClick = () => {
    setIsContinueClicked(true);
  };

  const formatDate = (dateString) => {
    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", options);
  };

  const saveAddress = async () => {
    try {
      const url = BASE_URL + SAVE_LOCATION_ENDPOINT;

      const address2 = address + pincode;
      console.log(address2, "address2");
      const requestDataa = {
        address1: address2,
        address2: googleLocation,
        locality: city,
        city: city,
        userId: customerId,
      };

      console.log(requestDataa, "requestdataa");
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2VkYjIzOWQ2ODBkNDdkOTU4NzBmYTAiLCJuYW1lIjoiQmhhcmF0IiwiZW1haWwiOiJiaGFyYXRneWFuY2hhbmRhbmkwMDFAZ21haWwuY29tIiwicGhvbmUiOiI4ODg0MjIxNDg3Iiwicm9sZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzI2MTI1NDkyLCJleHAiOjE3NTc2NjE0OTJ9.HuVjkLUBi0sCpH9p3uPzQKtnO2OR910g9MviBlLY0QY";

      const response = await axios.post(url, requestDataa, {
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
      });

      if (response.status === API_SUCCESS_CODE) {
        return response.data.data._id;
      } else {
        console.error("Failed to save address", response.status);
        return null;
      }
    } catch (error) {
      console.log("Error in saveAddress:", error.message);
      return null;
    }
  };

  const [lloading, setlLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setlLoading(true);
    const formattedDate = date ? formatDate(date) : null;

    const addressID = await saveAddress();

    if (!addressID) {
      console.error("Address ID is missing");
      return;
    }

    const requestData = {
      add_on: inclusion,
      phone_no: customerNumber,
      toId: "",
      order_time: timeSlot.value,
      no_of_people: 0,
      type: 8,
      fromId: customerId,
      is_discount: "0",
      addressId: addressID,
      order_date: formattedDate,
      no_of_burner: 0,
      order_locality: city,
      total_amount: totalamount,
      orderApplianceIds: [],
      payable_amount: totalamount,
      advance_amount: advanceamount,
      is_gst: "0",
      order_type: true,
      items: [product._id],
      decoration_comments: comment,
      status: 1,
      balance_amount: balanceamount,
      order_taken_by: orderTakenBy,
    };

    try {
      const response = await axios.post(
        `${BASE_URL}${CONFIRM_ORDER_ENDPOINT}`,
        requestData
      );
      alert("Order created successfully:", response.data);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("There was an error creating the order. Please try again.");
    } finally {
      setlLoading(false);
    }
  };


  useEffect(() => {
    const balance = totalamount - advanceamount;
    setBalanceAmount(balance);
  }, [totalamount, advanceamount]);

  return (
    <div className="container">
      <h1>Photography 📸</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="dishName">Product Name *</label>
        <input
          type="text"
          id="dishName"
          value={dishName}
          onChange={(e) => {
            setDishName(e.target.value);
            setIsFetched(false);
            setIsContinueClicked(false);
            setShowProductDetails(false);
          }}
          placeholder="Product Name"
          required
        />

        {!isContinueClicked && (
          <button
            type="button"
            className="button1"
            onClick={handleContinueClick}
            style={{ marginTop: "10px" }}
          >
            Continue
          </button>
        )}
        {showProductDetails && product && (
          <>
            <label htmlFor="productid">Product ID</label>
            <input type="text" id="productid" value={productid} readOnly />
            <label htmlFor="category">Product Price</label>
            <input type="text" id="category" value={category} readOnly />
            <div>
              <label htmlFor="productid">Product Inclusions:</label>
              <ul>
                {inclusion.length > 0 ? (
                  inclusion.map((item, index) => <li key={index}>{item}</li>)
                ) : (
                  <li>No inclusions available</li>
                )}
              </ul>
            </div>
            <label htmlFor="orderTakenBy">Order Taken By*</label>
            <input
              type="text"
              id="orderTakenBy"
              value={orderTakenBy}
              onChange={(e) => setOrderTakenBy(e.target.value)}
              placeholder="Order Taken By"
              required
            />
            <div
              className="date-time-container"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                margin: "10px 0",
              }}
            >
              <div style={{ flex: 1, marginRight: "10px" }}>
                <label
                  htmlFor="date"
                  style={{
                    fontWeight: "bold",
                    marginBottom: "5px",
                    display: "block",
                  }}
                >
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  style={{
                    width: "90%",
                    padding: "10px",
                    fontSize: "16px",
                  }}
                />
              </div>

              <div style={{ flex: 1, marginLeft: "10px" }}>
                <label
                  htmlFor="timeSlot"
                  style={{
                    fontWeight: "bold",
                    marginBottom: "5px",
                    display: "block",
                  }}
                >
                  Time Slot*
                </label>
                <Select
                  options={timeSlotOptions}
                  value={timeSlot}
                  onChange={(selectedOption) => setTimeSlot(selectedOption)}
                  placeholder="Select Time Slot"
                  required
                />
              </div>
            </div>
            <label htmlFor="customerNumber">Customer Number*</label>
            <input
              type="text"
              id="customerNumber"
              value={customerNumber}
              onChange={(e) => setCustomerNumber(e.target.value)}
              placeholder="Customer Number"
              required
            />
            <button onClick={handleCheckCustomer} disabled={loading}>
              {loading ? "Checking..." : "Check Customer"}
            </button>
            {loading && <p>Loading...</p>} {/* Loader */}
            {<p style={{ color: messageColor }}>{message}</p>}
            <label htmlFor="address">Address*</label>
            <textarea
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
              style={{ width: "665px" }}
              required
            />
            <label htmlFor="googleLocation">Google Location</label>
            <textarea
              type="text"
              id="googleLocation"
              value={googleLocation}
              onChange={(e) => setGoogleLocation(e.target.value)}
              placeholder="googleLocation"
              style={{ width: "665px" }}
            />
            
            <label htmlFor="totalamount">Total Amount*</label>
            <input
              type="text"
              id="totalamount"
              value={totalamount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="Total Amount"
              required
            />
            <label htmlFor="advanceamount">Advance Amount</label>
            <input
              type="text"
              id="advanceamount"
              value={advanceamount}
              onChange={(e) => setAdvanceAmount(e.target.value)}
              placeholder="Advance Amount"
            />
            <label htmlFor="balanceamount">Balance Amount</label>
            <input
              type="text"
              id="balanceamount"
              value={balanceamount}
              placeholder="Balance Amount"
              disabled
            />
            <div className="checkoutInputType border-1 rounded-4">
              <h4>Share your comments (if any)</h4>
              <textarea
                className="rounded border border-1 p-1 bg-white text-black"
                value={comment}
                onChange={handleComment}
                rows={4}
                placeholder="Enter your comment."
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ margin: "10px 0", width: "100%" }}>
              <label
                htmlFor="city"
                style={{
                  fontWeight: "bold",
                  marginBottom: "5px",
                  display: "block",
                }}
              >
                City *
              </label>
              <select
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                style={{
                  width: "103%",
                  padding: "10px",
                  borderRadius: "5px",
                  fontSize: "16px",
                  transition: "border-color 0.3s",
                }}
              >
                <option value="" style={{ color: "#aaa" }}>
                  Select City
                </option>
                <option value="Bangalore">Bangalore</option>
                <option value="Delhi">Delhi</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Hyderbad">Hyderbad</option>
              </select>
            </div>
            <label htmlFor="pincode">Pincode *</label>
            <input
              type="text"
              id="pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />
            <p
              style={{
                fontWeight: "bold",
                fontSize: "15px",
                color: pincodeMessageColor,
              }}
            >
              {pincodeMessage}
            </p>
            {showButton && (
              <button className="button1" type="submit">
                {lloading ? "Creating Order..." : "Create Order"}
              </button>
            )}
          </>
        )}
      </form>
      {lloading && <div className="loader">Loading...</div>}
      {showPopup && (
        <div className="popup">
          <h2>Add New Customer</h2>
          <label>
            Name:
            <input
              type="text"
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
            />
          </label>
          <br />
          <label>
            Phone:
            <input
              type="text"
              value={newCustomerPhone}
              onChange={(e) => setNewCustomerPhone(e.target.value)}
            />
          </label>
          <br />
          <button onClick={handleAddCustomer}>Add Customer</button>
          <button onClick={() => setShowPopup(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default AddOrder;
