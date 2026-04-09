"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import "./booster-createorder.css";
import Image from "next/image";
import axios from "axios";
import {
  BASE_URL,
  GET_CELEBRATION_BOOSTERS_BY_NAME,
  CONFIRM_ORDER_ENDPOINT,
  SAVE_LOCATION_ENDPOINT,
  API_SUCCESS_CODE,
  ADMIN_USER_LIST,
} from "../../../utils/apiconstant";
import { pincodes } from "../../../utils/pincodes.js";
import SearchWithDropDown from "../../component/SearchWithDropDown";
import { eventList } from "../../../constants/eventList";

const AddDecOrder = () => {
  const [dishName, setDishName] = useState("");
  const [productid, setProductID] = useState("");
  const [productprice, setProductPrice] = useState("");
  const [date, setDate] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
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
  const [dishNameError, setDishNameError] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");

  const [customerId, setCustomerId] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [isOrderCreated, setIsOrderCreated] = useState(false);

  const handleComment = (e) => {
    const commentText = e.target.value;
    setComment(commentText);
  };

  useEffect(() => {
    if (dishName && isContinueClicked && !isFetched) {
      const fetchProductDetails = async () => {
        try {
          const url = `${BASE_URL}${GET_CELEBRATION_BOOSTERS_BY_NAME}/${encodeURIComponent(dishName)}`;
          const response = await axios.get(url);
          const productData = response.data?.data;
          if (productData?._id) {
            setProduct(productData);
            setProductID(productData._id);
            setProductPrice(productData.price);
            setShowProductDetails(true);
            setDishNameError("");
          } else {
            setShowProductDetails(false);
            setDishNameError("No product found");
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
  }, [pincode]);

  const handleCheckCustomer = async (e) => {
    e.preventDefault();
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
        setMessage("Customer exists.");
        setMessageColor("green");
        setCustomerId(users[0]);
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
  };

  const handleAddCustomer = async () => {
    const requestData = {
      name: newCustomerName,
      phone: newCustomerPhone,
      email: "",
      role: "customer",
    };
    try {
      const response = await axios.post(
<<<<<<< HEAD
        "https://horaservices.com:3000/api/admin/user_signup",
=======
        `${BASE_URL}/api/admin/user_signup`,
>>>>>>> b5e5102970d939bbe3a320fe94a8c81add566da4
        requestData,
      );
      setCustomerId(response.data.dataToSave);
      setMessage("Customer successfully added.");
      window.location.reload();
      setMessageColor("green");
      setShowPopup(false);
    } catch (err) {
      console.error("Error adding customer:", err);
      setMessage("Failed to add customer.");
      setMessageColor("red");
    }
  };

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
      const requestDataa = {
        address1: address2,
        address2: googleLocation,
        locality: city,
        city: city,
        userId: customerId,
      };
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGMxMGQxY2M5YzY3Y2M0N2NlYWU5MGEiLCJuYW1lIjoiIiwiZW1haWwiOiIiLCJwaG9uZSI6IjExMDAxMjMyNTIiLCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NTc0ODIyODAsImV4cCI6MTc4OTAxODI4MH0.pQYGg7IKV36-5p-ko2FNksYZ9JvoIjkXmAl1snlXALs";

      const response = await axios.post(url, requestDataa, {
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
      });

      if (response.status === API_SUCCESS_CODE) {
        setIsOrderCreated(true);
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
      phone_no: customerNumber,
      order_time: timeSlot.value,
      type: 9,
      fromId: customerId,
      addressId: addressID,
      order_pincode: pincode,
      order_date: formattedDate,
      order_locality: city,
      total_amount: totalamount,
      payable_amount: totalamount,
      advance_amount: advanceamount,
      balance_amount: balanceamount,
      items: [product._id],
      decoration_comments: comment,
      status: 1,
      order_taken_by: orderTakenBy,
      eventName: selectedEvent,
    };

    try {
      await axios.post(
        `${BASE_URL}${CONFIRM_ORDER_ENDPOINT}`,
        requestData,
      );
      alert("Booster Order created successfully");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Error creating order");
    } finally {
      setlLoading(false);
    }
  };

  const timeSlotOptions = [
    { value: "7:00 AM - 10:00 AM", label: "7:00 AM - 10:00 AM" },
    { value: "10:00 AM - 1:00 PM", label: "10:00 AM - 1:00 PM" },
    { value: "1:00 PM - 4:00 PM", label: "1:00 PM - 4:00 PM" },
    { value: "4:00 PM - 7:00 PM", label: "4:00 PM - 7:00 PM" },
    { value: "7:00 PM - 10:00 PM", label: "7:00 PM - 10:00 PM" },
  ];

  useEffect(() => {
    const balance = totalamount - advanceamount;
    setBalanceAmount(balance);
  }, [totalamount, advanceamount]);

  const copyOrderSummary = () => {
    const orderSummary = `
*Celebration Booster Order*

Date: ${date}
Time Slot: ${timeSlot?.label || ""}
Contact Number: ${customerNumber}
Address: ${address}

Total Amount: ₹${totalamount || "N/A"}
Advance Amount: ₹${advanceamount || "N/A"}
Balance Amount: ₹${balanceamount || "N/A"}

*Booster Name*: ${dishName}
<<<<<<< HEAD
Image: https://horaservices.com/api/uploads/${product.featured_image}
=======
Image: ${BASE_URL}/api/uploads/${product.featured_image}
>>>>>>> b5e5102970d939bbe3a320fe94a8c81add566da4

Comment: ${comment}
Order Taken By: ${orderTakenBy}
`;

    // Copy the order summary to clipboard
    navigator.clipboard.writeText(orderSummary.trim());

    // Alert the user
    alert("Order summary copied!");
  };

  return (
    <div className="container">
      <h1 className="createOrder pageHeading">Create Decoration Order</h1>
      <form className="orderCreation form" onSubmit={handleSubmit}>
        {/* product check */}
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

        {!showProductDetails && (
          <button
            type="button"
            className="orderCheck-btn"
            onClick={handleContinueClick}
            style={{ marginTop: "10px" }}
            disabled={dishName === "" ? true : false}
          >
            Continue
          </button>
        )}
        {
          <p className="error-msg" style={{ color: " red" }}>
            {dishName && isContinueClicked ? dishNameError : ""}
          </p>
        }

        {/* product details =================================================*/}

        {showProductDetails && product && (
          <>
            <label htmlFor="productid">Product ID</label>
            <input type="text" id="productid" value={productid} readOnly />
            <label htmlFor="productprice">Product Price</label>
            <input
              type="text"
              id="productprice"
              value={productprice}
              readOnly
            />
            <div style={{ marginTop: "10px" }}>
              <label htmlFor="featuredImage">Product Image</label>
              <div>
                <Image
<<<<<<< HEAD
                  src={`https://horaservices.com/api/uploads/${product.featured_image}`}
=======
                  src={`${BASE_URL}/api/uploads/${product.featured_image}`}
>>>>>>> b5e5102970d939bbe3a320fe94a8c81add566da4
                  alt="Product"
                  width={200}
                  height={200}
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
            </div>
            {/* costumer chcek======================== */}
            <label htmlFor="customerNumber">Customer Number*</label>
            <input
              type="text"
              id="customerNumber"
              value={customerNumber}
              onInput={(e) =>
                setCustomerNumber(e.target.value.replace(/\D/g, ""))
              }
              placeholder="Customer Number"
              required
              maxLength={10}
              pattern="\d{10}"
              inputMode="numeric"
            />
            <button
              className="orderCheck-btn"
              onClick={handleCheckCustomer}
              disabled={loading || customerNumber.length !== 10}
            >
              {loading ? "Checking..." : "Check Customer"}
            </button>
            {loading && <p>Loading...</p>} {/* Loader */}
            {<p style={{ color: messageColor }}>{message}</p>}
          </>
        )}
        {/* order details ==========================.Customer does not exist */}
        {message === "Customer exists." ? (
          <div className="orderDeatils">
            <div
              className="date-time-container"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2%",
              }}
            >
              <div style={{ marginRight: "18px" }}>
                <label htmlFor="orderTakenBy">Order Taken By*</label>
                <input
                  type="text"
                  id="orderTakenBy"
                  value={orderTakenBy}
                  onChange={(e) => setOrderTakenBy(e.target.value)}
                  placeholder="Order Taken By"
                  required
                />
              </div>

              <div style={{ marginRight: "18px" }}>
                <label htmlFor="date">Date *</label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginRight: "18px" }}>
                <label
                  htmlFor="timeSlot"
                  style={{
                    display: "block",
                    marginBottom: "10px",
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

            <div className="address-box">
              <label htmlFor="address">Address*</label>
              <textarea
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address"
                required
              />
            </div>
            <div className="googleLocation-box">
              <label htmlFor="googleLocation">Google Location</label>
              <textarea
                type="text"
                id="googleLocation"
                value={googleLocation}
                onChange={(e) => setGoogleLocation(e.target.value)}
                placeholder="googleLocation"
              />
            </div>
            <div className="amount-box">
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
            </div>

            <div
              className="cityPincode-box"
              style={{
                marginTop: "10px",
                width: "100%",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                alignItems: "flex-start",
                flexWrap: "nowrap",
              }}
            >
              <div className="city-box" style={{ flex: 1 }}>
                <label
                  htmlFor="city"
                  style={{
                    width: "100%",
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
                    width: "100%",
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
                  <option value="Hyderabad">Hyderabad</option>
                </select>
              </div>
              <div className="pincode-box" style={{ flex: 1 }}>
                <label htmlFor="pincode">Pincode *</label>
                <input
                  type="text"
                  id="pincode"
                  value={pincode}
                  style={{
                    padding: "11px",
                    borderRadius: "5px",
                    fontSize: "16px",
                    marginTop: "0px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  onChange={(e) => setPincode(e.target.value)}
                />
                <p
                  style={{
                    fontWeight: "bold",
                    marginTop: "5px",
                    marginBottom: "5px",
                    fontSize: "15px",
                    color: pincodeMessageColor,
                  }}
                >
                  {pincodeMessage}
                </p>
              </div>
              <div className="event-box" style={{ flex: 1 }}>
                <label htmlFor="pincode">Add Event</label>
                <SearchWithDropDown
                  options={eventList}
                  selectedValue={selectedEvent}
                  onChange={(val) => setSelectedEvent(val)}
                  placeholder="Search event..."
                />
              </div>
            </div>
            <div className="checkoutInputType border-1 rounded-4">
              <h4>Share your comments (if any)</h4>
              <textarea
                className="rounded border border-1 p-1 bg-white text-black"
                value={comment}
                onChange={handleComment}
                cols={90}
                rows={4}
                placeholder="Enter your comment."
              />
            </div>

            {!isOrderCreated && (
              <button
                className="orderCheck-btn"
                type="submit"
                disabled={lloading}
              >
                {lloading ? "Creating Order..." : "Create Order"}
              </button>
            )}
          </div>
        ) : (
          <>
            {" "}
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
                    id="customerNumber"
                    value={newCustomerPhone}
                    onInput={(e) =>
                      setNewCustomerPhone(e.target.value.replace(/\D/g, ""))
                    } // Remove non-digits as the user types
                    placeholder="Customer Number"
                    required
                    maxLength={10} // Limit to 10 digits
                    pattern="\d{10}" // Enforce exactly 10 digits
                    inputMode="numeric" // Optimize for numeric input on mobile devices
                  />
                </label>
                <br />
                <button onClick={handleAddCustomer}>Add Customer</button>
                <button onClick={() => setShowPopup(false)}>Cancel</button>
              </div>
            )}
          </>
        )}
      </form>
      {message === "Customer exists." && (
        <button onClick={copyOrderSummary} style={style.buttonPrimary}>
          Copy Order Summary(For Customer)
        </button>
      )}
    </div>
  );
};
const style = {
  buttonSecondary: {
    padding: "10px 20px",
    backgroundColor: "#9252AA",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  buttonPrimary: {
    padding: "10px 20px",
    backgroundColor: "#9252AA",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
    width: "100%",
  },
};
export default AddDecOrder;
