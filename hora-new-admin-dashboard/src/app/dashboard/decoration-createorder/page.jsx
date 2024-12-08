"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import "./createorder.css";
import Image from "next/image";
import axios from "axios";
import {
  BASE_URL,
  GET_DECORATION_BY_NAME,
  CONFIRM_ORDER_ENDPOINT,
  SAVE_LOCATION_ENDPOINT,
  API_SUCCESS_CODE,
} from "../../../utils/apiconstant";
import { pincodes } from '../../../utils/pincodes.js';

const AddOrder = () => {
  const [dishName, setDishName] = useState("");
  const [productid, setProductID] = useState("");
  const [productprice, setProductPrice] = useState("");
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

  const [products, setProducts] = useState([{ name: "", price: "" }]);
  const [comment, setComment] = useState("");

  // const [error, setError] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");

  const [customerId, setCustomerId] = useState(null);

  const [showPopup, setShowPopup] = useState(false); // For toggling the popup
  const [newCustomerName, setNewCustomerName] = useState(""); // For name input
  const [newCustomerPhone, setNewCustomerPhone] = useState("");



  const handleInputChange = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  const addProduct = () => {
    setProducts([...products, { name: "", price: "" }]);
  };

  const handleComment = (e) => {
    const commentText = e.target.value;
    setComment(commentText);
  };

  useEffect(() => {
    if (dishName && isContinueClicked && !isFetched) {
      const fetchProductDetails = async () => {
        try {
          const url = `${BASE_URL}${GET_DECORATION_BY_NAME}${encodeURIComponent(dishName)}`;
          const response = await axios.get(url);
          const productData = response.data?.data?.[0];
          console.log(response.data?.data?.[0])
          if (productData) {
            setProduct(productData);
            setProductID(productData._id);
            setProductPrice(productData.price);
            setShowProductDetails(true);
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
  }, [pincode]);


  const handleCheckCustomer = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://horaservices.com:3000/api/admin/admin_user_list",
        {
          email: "",
          page: "",
          per_page: 2000,
          phone: "",
          role: "customer",
        }
      );

      const users = response?.data?.data?.users;

      if (users.length > 0) {
        console.log(users.length)
        const customer = users.find((user) => user.phone === customerNumber);

        setCustomerId(customer);
        if (customer) {
          setMessage("Customer exists.");
          setMessageColor("green");
        } else {
          setMessage("Customer does not exist.");
          setMessageColor("red");
          setShowPopup(true);
        }
      } else {
        setMessage("No users found in the response.");
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
    console.log(requestData, "requestion data");
    try {
      const response = await axios.post(
        "https://horaservices.com:3000/api/admin/user_signup",
        requestData
      );

      console.log("Customer added:", response.data.dataToSave._id);
      setCustomerId(response.data.dataToSave);
      setMessage("Customer successfully added.");
      // window.location.reload(false);
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
    console.log('handlesubmit')
    const addOnProduct = products.map((product) => ({
      name: product.name,
      price: product.price,
    }));

    const formattedDate = date ? formatDate(date) : null;

    const addressID = await saveAddress();

    if (!addressID) {
      console.error("Address ID is missing");
      return;
    }

    const requestData = {
      add_on: addOnProduct,
      phone_no: customerNumber,
      toId: "",
      order_time: timeSlot.value,
      no_of_people: 0,
      type: 1,
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
    
    console.log(requestData, "requestData decoration");

    try {
      const response = await axios.post(`${BASE_URL}${CONFIRM_ORDER_ENDPOINT}`, requestData);
      alert("Order created successfully:", response.data);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("There was an error creating the order. Please try again.");
    }
    finally {
      setlLoading(false);
    }
  }


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

  return (
    <div className="container">
      <h1 className="createOrder pageHeading">Create Decoration Order</h1>
      <form onSubmit={handleSubmit}>
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
        {/* product details =================================================*/}

        {showProductDetails && product && (
          <>
            <label htmlFor="productid">Product ID</label>
            <input type="text" id="productid" value={productid} readOnly />
            <label htmlFor="productprice">Product Price</label>
            <input type="text" id="productprice" value={productprice} readOnly />
            <div style={{ marginTop: "10px" }}>
              <label htmlFor="featuredImage">Product Image</label>
              <div>
                <Image
                  src={`https://horaservices.com/api/uploads/${product.featured_image}`}
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
              onChange={(e) => setCustomerNumber(e.target.value)}
              placeholder="Customer Number"
              required
            />
            <button onClick={handleCheckCustomer} disabled={loading}>
              {loading ? "Checking..." : "Check Customer"}
            </button>
            {loading && <p>Loading...</p>} {/* Loader */}
            {<p style={{ color: messageColor }}>{message}</p>}

            {/* order details ==========================.Customer does not exist */}
            {message === "Customer exists."
              ?
              (<div className='orderDeatils'>
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

                <label htmlFor="addOn">Add On</label>
                <div className="addon-container">
                  <form className="addon-form">
                    {products.map((product, index) => (
                      <div className="addon-row" key={index}>
                        <input
                          type="text"
                          className="addon-input name-input"
                          placeholder="Name"
                          value={product.name}
                          onChange={(e) => handleInputChange(index, "name", e.target.value)}
                        />
                        <input
                          type="number"
                          className="addon-input price-input"
                          placeholder="Price"
                          value={product.price}
                          onChange={(e) => handleInputChange(index, "price", e.target.value)}
                        />
                        <button type="button" className="add-new-btn" onClick={addProduct}>
                          Add New
                        </button>
                      </div>
                    ))}
                  </form>
                </div>



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
                <p style={{ fontWeight: "bold", fontSize: "15px", color: pincodeMessageColor }}>{pincodeMessage}</p>
                <div className='checkoutInputType border-1 rounded-4'>
                  <h4>Share your comments (if any)</h4>
                  <textarea className='rounded border border-1 p-1 bg-white text-black'
                    value={comment}
                    onChange={handleComment}
                    cols={90}
                    rows={4}
                    placeholder="Enter your comment."


                  />
                </div>
                <button className="button1" type="submit">
                  {/* Create Order */}
                  {lloading ? "Creating Order..." : "Create Order"}
                </button>
              </div>)
              :
              <> {lloading && <div className="loader">Loading...</div>}
                {/* Pop of NEW CUSTOMER ADD=============================== */}

              </>
            }
          </>
        )}
      </form>
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
