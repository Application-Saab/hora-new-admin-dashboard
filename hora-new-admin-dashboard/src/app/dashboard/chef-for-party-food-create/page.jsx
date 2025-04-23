"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import "./styles.css";
import {
  BASE_URL,
  CONFIRM_ORDER_ENDPOINT,
  SAVE_LOCATION_ENDPOINT,
  API_SUCCESS_CODE,
  ADMIN_USER_LIST,
  GET_MEAL_DISH_ENDPOINT,
  ADMIN_USER_SIGNUP,
} from "../../../utils/apiconstant";
import axios from "axios";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { pincodes } from "../../../utils/pincodes.js";
import { chefTimeSlots } from "../../../utils/chefTimeSlots";

const ChefForPartyCreateOrderComponent = () => {
  const [items, setItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const [peopleCount, setPeopleCount] = useState(10);
  const [selectedDishPrice, setSelectedDishPrice] = useState(0);
  const [ingredients, setIngredients] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [totalDishes, setTotalDishes] = useState(0);

  const [customerNumber, setCustomerNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");
  const [customerId, setCustomerId] = useState(null);
  const [date, setDate] = useState("");
  const [address, setAddress] = useState("");
  const [googleLocation, setGoogleLocation] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [product, setProduct] = useState(null);
  const [isContinueClicked, setIsContinueClicked] = useState(false);
  const [pincodeMessage, setPincodeMessage] = useState("");
  const [pincodeMessageColor, setPincodeMessageColor] = useState("");
  const [orderTakenBy, setOrderTakenBy] = useState("");

  const [products, setProducts] = useState([{ name: "", price: "" }]);
  const [comment, setComment] = useState("");
  const [dishNameError, setDishNameError] = useState("");

  const [showPopup, setShowPopup] = useState(false); // For toggling the popup
  const [newCustomerName, setNewCustomerName] = useState(""); // For name input
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  const cuisineIds = [
    "63edfa1c74aafa0d9a24cbbc",
    "63f08e361976aaf885f161fd",
    "63f08e1a1976aaf885f161f3",
    "63f08e401976aaf885f16202",
    "63ee472c6f4f9c2af1da490b",
    "63f08ebe1976aaf885f16234",
    "63f08e4d1976aaf885f16207",
  ];

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };

      // Set initial value
      handleResize();

      // Add event listener
      window.addEventListener("resize", handleResize);

      // Clean up
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(
          BASE_URL + GET_MEAL_DISH_ENDPOINT,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cuisineId: cuisineIds }),
          }
        );
        const data = await response.json();
        const allDishes = data.data.flatMap((meal) => meal.dish);
        setItems(allDishes);
      } catch (error) {
        console.error("API Error:", error);
      }
    };

    fetchItems(); // Fetch all dishes on component mount
  }, []);

  const handleInputClick = () => {
    setShowDropdown(true);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleCheckboxChange = (itemId) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(itemId)
        ? prevSelected.filter((id) => id !== itemId)
        : [...prevSelected, itemId]
    );
  };

  const handlePeopleChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setPeopleCount(value);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery)
  );

  useEffect(() => {
    const selectedPrices = items
      .filter((item) => selectedItems.includes(item._id))
      .reduce((sum, item) => sum + parseInt(item.price), 0);
    setSelectedDishPrice(selectedPrices);

    // Set total dishes count
    setTotalDishes(selectedItems.length);

    // Create a dictionary of selected dishes for ingredient calculation
    const selectedDishDictionary = {};
    items
      .filter((item) => selectedItems.includes(item._id))
      .forEach((item) => {
        selectedDishDictionary[item._id] = item;
      });

    // Calculate ingredients based on selected dishes
    setIngredients(getTotalIngredients(selectedDishDictionary));
  }, [selectedItems, items]);

  console.log(peopleCount, "peopleCount");
  const priceForPeople = peopleCount * 49;
  console.log(priceForPeople, "priceForPeople");
  console.log(selectedDishPrice, "selectedDishPrice");

  let totalPrice = parseInt(selectedDishPrice) + priceForPeople;
  console.log(totalPrice, "totalPrice");
  if (selectedItems.length > 7) {
    totalPrice += 700;
    console.log(totalPrice, "totalPrice with 700 extra charge");
  }

  console.log(totalPrice, "totalpricehehehehe");
  const itemTotal = selectedDishPrice;
  const finalAmount = totalPrice;
  // const advancePayment = 0;
  const advancePayment = Math.round(finalAmount / 5);
  const balanceamount = finalAmount - advancePayment;

  // Function to get total ingredients from selected dishes
  const getTotalIngredients = (data) => {
    let totalIngredients = {};
    const defaultImage =
      "https://horaservices.com/api/uploads/default-ingredient.png";

    for (const dishId in data) {
      const dish = data[dishId];
      if (dish.ingredientUsed) {
        dish.ingredientUsed.forEach((ingredient) => {
          const { _id, name, image, unit, qty } = ingredient;

          if (!totalIngredients[_id]) {
            totalIngredients[_id] = {
              _id,
              name,
              image: image && image.trim() !== "" ? image : defaultImage,
              unit: "",
              qty: 0,
              count: 0,
            };
          }

          totalIngredients[_id].qty += parseInt(qty, 10);
          totalIngredients[_id].count += 1;

          // Normalize units
          if (unit && unit.toLowerCase() === "gram") {
            totalIngredients[_id].unit = "g";
          } else if (unit && unit.toLowerCase() === "ml") {
            totalIngredients[_id].unit = "ml";
          } else {
            totalIngredients[_id].unit = unit || ""; // Keep the original unit if it's not 'gram' or 'ml'
          }
        });
      }
    }
    return Object.values(totalIngredients);
  };

  const handleCheckCustomer = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}${ADMIN_USER_LIST}`, {
        phone: customerNumber, // Filter by phone directly
        per_page: 1, // Fetch only 1 result
        role: "customer",
      });

      const users = response?.data?.data?.users || [];
      console.log(users, "users");

      if (users.length > 0) {
        setMessage("Customer exists.");
        setMessageColor("green");
        setCustomerId(users[0]); // Store the first matching user
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
        BASE_URL + ADMIN_USER_SIGNUP,
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

      console.log(response, "response save address");
      console.log(response.data.data._id, "response id save address");
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
    console.log("handlesubmit");

    const formattedDate = date ? formatDate(date) : null;

    const addressID = await saveAddress();

    if (!addressID) {
      console.error("Address ID is missing");
      return;
    }

    console.log("selectedItems", selectedItems);

    const requestData = {
      add_on: [],
      phone_no: customerNumber,
      toId: "",
      order_time: timeSlot.value,
      no_of_people: peopleCount,
      type: 2,
      fromId: customerId,
      is_discount: "0",
      addressId: addressID,
      order_pincode: pincode,
      order_date: formattedDate,
      no_of_burner: 0,
      order_locality: city,
      total_amount: totalPrice,
      orderApplianceIds: [],
      payable_amount: totalPrice,
      advance_amount: advancePayment,
      is_gst: "0",
      order_type: true,
      items: selectedItems,
      decoration_comments: comment,
      status: 1,
      balance_amount: balanceamount,
      order_taken_by: orderTakenBy,
    };

    console.log(requestData, "requestData decoration");

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

  const copyOrderSummary = () => {
    // Create selected dishes list
    let selectedDishesText = "";
    const selectedDishItems = items.filter((item) =>
      selectedItems.includes(item._id)
    );
    if (selectedDishItems.length > 0) {
      selectedDishesText += "\n*Selected Dishes*:";
      selectedDishItems.forEach((item, index) => {
        selectedDishesText += `\n  ${index + 1}. ${item.name}`;
      });
    } else {
      selectedDishesText += "\n*Selected Dishes*: None";
    }

    // Create ingredients list
    let ingredientsText = "";
    if (ingredients.length > 0) {
      ingredientsText += "\n\n*Required Ingredients*:";
      ingredients.forEach((ingredient, index) => {
        let quantity = ingredient.qty * peopleCount;

        // Apply the same scaling logic as in the component
        if (ingredient.count == 4) {
          quantity = quantity * 0.7;
        } else if (ingredient.count == 5) {
          quantity = quantity * 0.6;
        } else if (ingredient.count == 6) {
          quantity = quantity * 0.5;
        } else if (ingredient.count == 7) {
          quantity = quantity * 0.4;
        } else if (ingredient.count == 8) {
          quantity = quantity * 0.35;
        } else if (ingredient.count == 9) {
          quantity = quantity * 0.3;
        } else if (ingredient.count == 10) {
          quantity = quantity * 0.28;
        } else if (ingredient.count == 11) {
          quantity = quantity * 0.25;
        }

        quantity = Math.round(quantity);
        let unit = ingredient.unit;
        if (quantity >= 1000) {
          quantity = quantity / 1000;
          if (unit === "g") unit = "kg";
          else if (unit === "ml") unit = "L";
        }

        ingredientsText += `\n  ${index + 1}. ${
          ingredient.name
        }: ${quantity} ${unit}`;
      });
    }

    // Create the order summary string
    const orderSummary = `
  *Chef For Party Details*
    
  Date: ${date ? formatDate(date) : "N/A"}
  Time Slot: ${timeSlot?.label || "N/A"}
  Contact Number: ${customerNumber}
  Address: ${address}
  Google Map Location: ${googleLocation || "N/A"}
  City: ${city || "N/A"}
  Pincode: ${pincode || "N/A"}
  
  Number of People: ${peopleCount}
  Total Dishes: ${totalDishes}
  
  *Price Details*:
  ${
    selectedItems.length > 7 ? "Extra Charge (>7 dishes): ₹700\n" : ""
  }Total Amount: ₹${finalAmount}
  Advance Amount: ₹${advancePayment}
  Balance Amount: ₹${balanceamount}
  ${selectedDishesText}
  ${ingredientsText}
  
  ${comment ? `*Comments*: ${comment}` : ""}
 
  `;

    // Copy the order summary to clipboard
    navigator.clipboard.writeText(orderSummary.trim());

    // Alert the user
    alert("Order summary copied!");
  };

  return (
    <div
      //  className="main-container"
      className="container"
    >
      <h1 className="page-title">Create Chef For Party Order</h1>

      <div className="order-form">
        <div className="form-row">
          <div className="form-column">
            <label className="form-label">Number of People:</label>
            <input
              type="number"
              value={peopleCount}
              onChange={handlePeopleChange}
              className="form-input number-input"
            />
          </div>
        </div>
        <div className="slider-container">
          <input
            type="range"
            min="1"
            max="35"
            value={peopleCount}
            onChange={handlePeopleChange}
            step={1}
            className="people-range"
          />
        </div>
        <div className="service-info">
          <p>Please select a dish to continue.</p>

          <div className="search-container">
            <input
              type="text"
              placeholder="Search by dish name"
              onClick={handleInputClick}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          {showDropdown && (
            <div className="dropdown" ref={dropdownRef}>
              {filteredItems.length === 0 ? (
                <p className="loading">No items found</p>
              ) : (
                filteredItems.map((item, index) => (
                  <div key={index} className="dish-card">
                    <div className="dish-item">
                      <div className="dish-image">
                        <Image
                          src={`https://horaservices.com/api/uploads/${item.image}`}
                          alt={item.name}
                          width={50}
                          height={50}
                        />
                      </div>
                      <div className="dish-name">{item.name}</div>
                      <div className="dish-price">₹{item.price}</div>
                      <div className="dish-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item._id)}
                          onChange={() => handleCheckboxChange(item._id)}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="stats-row">
            <div className="stat-box">
              <span className="stat-label">Total Dishes</span>
              <span className="stat-value">{totalDishes}</span>
            </div>

            <div className="stat-box">
              <span className="stat-label">No. of People</span>
              <span className="stat-value">{peopleCount}</span>
            </div>
          </div>

          <div className="price-details">
            <div className="price-row">
              <span className="price-label">Item Total</span>
              <span className="price-value">₹ {itemTotal}</span>
            </div>

            {selectedItems.length > 7 && (
              <div className="price-row extra-charge">
                <span className="price-label">Extra Charge (7 dishes)</span>
                <span className="price-value">₹ 700</span>
              </div>
            )}

            <div className="price-row">
              <span className="price-label">Final Amount</span>
              <span className="price-value">₹ {finalAmount}</span>
            </div>

            <div className="price-row">
              <span className="price-label">Advance Payment</span>
              <span className="price-value">₹ {advancePayment}</span>
            </div>

            <div className="price-row">
              <span className="price-label">Balance Amount</span>
              <span className="price-value">₹ {balanceamount}</span>
            </div>
          </div>

          {selectedItems.length > 0 && (
            <div className="selected-items">
              <h2>Selected Items</h2>
              <div className="selected-items-grid">
                {items
                  .filter((item) => selectedItems.includes(item._id))
                  .map((item, index) => (
                    <div key={index} className="selected-item-card">
                      <div className="selected-item-image">
                        <Image
                          src={`https://horaservices.com/api/uploads/${item.image}`}
                          alt={item.name}
                          width={50}
                          height={50}
                        />
                      </div>
                      <div className="selected-item-name">{item.name}</div>
                      <div className="selected-item-price">₹{item.price}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {ingredients.length > 0 && (
            <div className="ingredients-section">
              <h2>Required Ingredients</h2>
              <div className="ingredients-grid">
                {ingredients.map((ingredient, index) => {
                  let quantity = ingredient.qty * peopleCount;

                  if (ingredient.count == 4) {
                    quantity = quantity * 0.7;
                  } else if (ingredient.count == 5) {
                    quantity = quantity * 0.6;
                  } else if (ingredient.count == 6) {
                    quantity = quantity * 0.5;
                  } else if (ingredient.count == 7) {
                    quantity = quantity * 0.4;
                  } else if (ingredient.count == 8) {
                    quantity = quantity * 0.35;
                  } else if (ingredient.count == 9) {
                    quantity = quantity * 0.3;
                  } else if (ingredient.count == 10) {
                    quantity = quantity * 0.28;
                  } else if (ingredient.count == 11) {
                    quantity = quantity * 0.25;
                  }

                  quantity = Math.round(quantity);
                  let unit = ingredient.unit;
                  if (quantity >= 1000) {
                    quantity = quantity / 1000;
                    if (unit === "g") unit = "kg";
                    else if (unit === "ml") unit = "L";
                  }

                  return (
                    <div key={index} className="ingredient-card">
                      <div className="ingredient-image">
                        <Image
                          src={`https://horaservices.com/api/uploads/${ingredient.image}`}
                          alt={ingredient.name}
                          width={isMobile ? 60 : 80}
                          height={isMobile ? 60 : 80}
                        />
                      </div>
                      <div className="ingredient-details">
                        <div className="ingredient-name">{ingredient.name}</div>
                        <div className="ingredient-quantity">
                          {quantity + " " + unit}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {/* costumer chcek======================== */}
        <label htmlFor="customerNumber">Customer Number*</label>
        <input
          type="text"
          id="customerNumber"
          value={customerNumber}
          onInput={(e) => setCustomerNumber(e.target.value.replace(/\D/g, ""))} // Remove non-digits as the user types
          placeholder="Customer Number"
          required
          maxLength={10} // Limit to 10 digits
          pattern="\d{10}" // Enforce exactly 10 digits
          inputMode="numeric" // Optimize for numeric input on mobile devices
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
        {message === "Customer exists." ? <h1></h1> : <h1></h1>}
        <>
          <div>
            <form className="orderCreation form" onSubmit={handleSubmit}>
              {/* order details ==========================.Customer does not exist */}
              {message === "Customer exists." ? (
                <div className="orderDeatils">
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
                      alignItems: "center",
                      gap: "2%",
                    }}
                  >
                    <div style={{ marginRight: "10px" }}>
                      <label htmlFor="date">Date *</label>
                      <input
                        type="date"
                        id="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        // min={new Date().toISOString().split("T")[0]} // Directly setting min date is this need?
                        required
                      />
                    </div>

                    <div style={{ marginLeft: "10px" }}>
                      <label
                        htmlFor="timeSlot"
                        style={{
                          marginBottom: "5px",
                          display: "block",
                        }}
                      >
                        Time Slot*
                      </label>
                      <Select
                        options={chefTimeSlots}
                        value={timeSlot}
                        onChange={(selectedOption) =>
                          setTimeSlot(selectedOption)
                        }
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
                

                  <div
                    className="cityPincode-box"
                    style={{ margin: "10px 0", width: "100%" }}
                  >
                    <div className="city-box">
                      <label
                        htmlFor="city"
                        style={{
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
                    <div className="pincode-box">
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

                  <button className="orderCheck-btn" type="submit">
                    {/* Create Order */}
                    {lloading ? "Creating Order..." : "Create Order"}
                  </button>
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
                            setNewCustomerPhone(
                              e.target.value.replace(/\D/g, "")
                            )
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
                      <button onClick={() => setShowPopup(false)}>
                        Cancel
                      </button>
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
        </>
      </div>
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

export default ChefForPartyCreateOrderComponent;
