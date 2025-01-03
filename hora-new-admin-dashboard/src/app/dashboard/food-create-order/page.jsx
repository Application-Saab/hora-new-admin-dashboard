"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import {
  BASE_URL,
  CONFIRM_ORDER_ENDPOINT,
  SAVE_LOCATION_ENDPOINT,
  ADMIN_USER_LIST,
  ADMIN_USER_SIGNUP,
  API_SUCCESS_CODE,
  GET_MEAL_DISH_ENDPOINT,
} from "../../../utils/apiconstant";
import { timeSlotOptions } from "../../../utils/timeSlots";
import { pincodes } from "../../../utils/pincodes";
import Image from "next/image";

const AddOrder = () => {
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

  const [mealList, setMealList] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [numberOfPeople, setNumberOfPeople] = useState(10);
  const [selectedOption, setSelectedOption] = useState("");
  const [includeDisposable, setIncludeDisposable] = useState(false);
  const [includeTables, setIncludeTables] = useState(false);
  const deliveryCharges = 300;
  const packingCost = 200;

  const [selectedDishQuantities, setSelectedDishQuantities] = useState([]);

  const handleComment = (e) => {
    const commentText = e.target.value;
    setComment(commentText);
  };

  useEffect(() => {
    fetchDishes();
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const fetchDishes = async () => {
    try {
      setLoading(true);
      const url = BASE_URL + GET_MEAL_DISH_ENDPOINT;

      const requestData = {
        cuisineId: ["65f1b256aaba27208a89865f"],
        is_dish: 0,
      };

      const response = await axios.post(url, requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === API_SUCCESS_CODE) {
        const dishes = response.data.data.flatMap((entry) => entry.dish || []);
        setMealList(dishes);
        setFilteredDishes(dishes);
      }
    } catch (error) {
      console.error("Error Fetching Data:", error.message);
    } finally {
      setLoading(false);
    }
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

  const validMealIds = [
    "63f1b6b7ed240f7a09f7e2de",
    "63f1b39a4082ee76673a0a9f",
    "63edc4757e1b370928b149b3",
  ];

  const calculatePriceDetails = () => {
    const dishCount = selectedDishes.filter(
      (dish) =>
        dish.name !== "Tawa Rotis" &&
        dish.name !== "Rumali Rotis" &&
        validMealIds.some((id) => dish.mealId.includes(id))
    ).length;

    let subtotal = selectedDishes.reduce((total, dish) => {
      return total + dish.cuisineArray[0] * numberOfPeople;
    }, 0);

    const quantityDiscountPercent = (() => {
      if (dishCount === 4) return -15;
      if (dishCount === 5) return 0;
      if (dishCount === 6 || dishCount === 7) return 15;
      if (dishCount === 8) return 25;
      if (dishCount === 9 || dishCount === 10) return 35;
      if (dishCount === 11) return 40;
      if (dishCount === 12 || dishCount === 13) return 50;
      if (dishCount === 14) return 53;
      if (dishCount === 15) return 55;
      return 0;
    })();

    const peopleDiscountPercent = (() => {
      if (numberOfPeople >= 60) return 10;
      if (numberOfPeople >= 40) return 7;
      return 0;
    })();

    let priceAfterQuantityDiscount = subtotal;
    let quantityDiscountAmount = 0;

    if (selectedOption === "food-delivery") {
      selectedDishes.forEach((dish) => {
        if (
          dish.name !== "Tawa Rotis" &&
          dish.name !== "Rumali Rotis" &&
          validMealIds.some((id) => dish.mealId.includes(id))
        ) {
          const dishPrice = dish.cuisineArray[0] * numberOfPeople;
          const dishDiscount = dishPrice * (quantityDiscountPercent / 100);
          console.log(dishDiscount, "discounted");
          quantityDiscountAmount += dishDiscount;
          console.log(quantityDiscountAmount, "quantityDiscountAmount111");
          priceAfterQuantityDiscount -= dishDiscount;
          console.log(priceAfterQuantityDiscount, "priceAfterQuantityDiscount");
        }
      });
    } else if (selectedOption === "live-catering") {
      priceAfterQuantityDiscount = subtotal;
      if (quantityDiscountPercent !== 0) {
        quantityDiscountAmount = subtotal * (quantityDiscountPercent / 100);

        console.log(quantityDiscountAmount, "quantityDiscountAmount11111");
        priceAfterQuantityDiscount = subtotal - quantityDiscountAmount;

        console.log(priceAfterQuantityDiscount, "priceAfterQuantityDiscount");
      }
    }

    console.log(priceAfterQuantityDiscount, "priceafterquantitydisfdjfkldsf");
    const peopleDiscount =
      priceAfterQuantityDiscount * (peopleDiscountPercent / 100);
    let priceAfterAllDiscounts = priceAfterQuantityDiscount - peopleDiscount;

    let additionalCharges = 0;
    let finalTotal = priceAfterAllDiscounts;

    if (selectedOption === "food-delivery") {
      if (finalTotal <= 4000) additionalCharges += deliveryCharges;
      additionalCharges += packingCost;
      if (includeDisposable) {
        additionalCharges += 20 * numberOfPeople;
      }
    } else if (selectedOption === "live-catering") {
      const serviceCharge = finalTotal * 0.1;
      additionalCharges += serviceCharge + 6500;
      if (includeTables) {
        additionalCharges += 1200;
      }
    }

    finalTotal += additionalCharges;

    return {
      subtotal: Math.round(subtotal),
      quantityDiscountPercent,
      quantityDiscountAmount: Math.round(quantityDiscountAmount),
      peopleDiscountPercent,
      peopleDiscountAmount: Math.round(peopleDiscount),
      priceAfterDiscounts: Math.round(priceAfterAllDiscounts),
      additionalCharges: Math.round(additionalCharges),
      finalTotal: Math.round(finalTotal),
      advancePayment: Math.round(finalTotal * 0.65),
      dishCount,
    };
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = mealList.filter(
      (dish) => dish.name && dish.name.toLowerCase().includes(query)
    );

    setFilteredDishes(filtered);
  };

  const handleDishSelect = (dish) => {
    setSelectedDishes((prevSelected) => {
      const exists = prevSelected.some((item) => item.name === dish.name);
      return exists
        ? prevSelected.filter((item) => item.name !== dish.name)
        : [...prevSelected, dish];
    });
  };

  const handlePeopleChange = (e) => {
    const value = Math.max(10, Number(e.target.value));
    setNumberOfPeople(value);
  };

  const handleClickOutside = (e) => {
    if (
      !e.target.closest("#searchPopup") &&
      !e.target.closest("#searchInput")
    ) {
      setPopupOpen(false);
    }
  };

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };
  const calculateTotalPrice = () =>
    selectedDishes.reduce((total, dish) => {
      const price = dish.cuisineArray[0];
      return total + price * numberOfPeople;
    }, 0);

  var selectedDeliveryOption = "food-delivery";
  useEffect(() => {
    const updatedQuantities = selectedDishes.map((dish) => {
      let categoryId = "63edc4757e1b370928b149b3";
      if (dish.category === "main_course") {
        categoryId = "63f1b6b7ed240f7a09f7e2de";
      } else if (dish.category === "appetizer") {
        categoryId = "63f1b39a4082ee76673a0a9f";
      }

      return {
        name: dish.name,
        image: dish.image || "default-image.png",
        price: dish.cuisineArray[0],
        quantity: dish.cuisineArray[1],
        unit: dish.cuisineArray[2],
        id: [categoryId],
      };
    });

    setSelectedDishQuantities(updatedQuantities);
  }, [selectedDishes]);

  const RenderDishQuantity = ({ item }) => {
    const itemCount = selectedDishQuantities.length;

    const mainCourseItemCount = selectedDishQuantities.filter(
      (meal) => meal.id[0] === "63f1b6b7ed240f7a09f7e2de"
    ).length;

    const appetizerItemCount = selectedDishQuantities.filter(
      (meal) => meal.id[0] === "63f1b39a4082ee76673a0a9f"
    ).length;

    const breadItemCount = selectedDishQuantities.filter(
      (meal) => meal.id[0] === "63edc4757e1b370928b149b3"
    ).length;

    let quantity = parseFloat(item.quantity) * numberOfPeople;

    if (
      (item.id[0] === "63f1b6b7ed240f7a09f7e2de" && mainCourseItemCount > 1) ||
      (item.id[0] === "63f1b39a4082ee76673a0a9f" && appetizerItemCount > 1) ||
      (item.id[0] === "63edc4757e1b370928b149b3" && breadItemCount > 1)
    ) {
      if (itemCount <= 5) {
      } else if (itemCount === 6) {
        quantity = quantity * (1 - 0.15);
      } else if (itemCount === 7) {
        quantity = quantity * (1 - 0.15);
      } else if (itemCount === 8) {
        quantity = quantity * (1 - 0.25);
      } else if (itemCount === 9) {
        quantity = quantity * (1 - 0.3);
      } else if (itemCount === 10) {
        quantity = quantity * (1 - 0.35);
      } else if (itemCount === 11) {
        quantity = quantity * (1 - 0.4);
      } else if (itemCount === 12) {
        quantity = quantity * (1 - 0.5);
      } else if (itemCount === 13) {
        quantity = quantity * (1 - 0.53);
      } else if (itemCount === 15) {
        quantity = quantity * (1 - 0.55);
      }
    }

    quantity = Math.round(quantity);
    let unit = item.unit;

    if (quantity >= 1000) {
      quantity = quantity / 1000;
      if (unit === "Gram") unit = "KG";
      else if (unit === "ml") unit = "L";
    }

    return (
      <div className="ordersummaryproduct">
        <div className="ordersummary-sec1">
          <Image
            src={`https://horaservices.com/api/uploads/${item.image}`}
            alt={item.name}
            className="checkoutRightImg chef"
            width={300}
            height={300}
          />
        </div>
        <div
          style={{ color: "rgb(146, 82, 170)", fontWeight: "600" }}
          className="ordersummary-sec2"
        >
          <p className="ordersummeryname">{item.name}</p>
          {selectedOption === "food-delivery" && (
            <div
              style={{
                fontSize: "90%",
                fontWeight: "700",
                color: "#9252AA",
                textTransform: "uppercase",
              }}
              className="ingredientrightsecsibheading"
            >
              {`${quantity} ${unit}`}
            </div>
          )}
        </div>
      </div>
    );
  };

  const copyOrderSummary = () => {

    const formatDate = (inputDate) => {
      const dateObj = new Date(inputDate);
      const day = String(dateObj.getDate()).padStart(2, "0"); // Ensures 2-digit day
      const month = dateObj.toLocaleString("en-US", { month: "long" }); // Full month name
      const year = dateObj.getFullYear();
      return `${day}-${month}-${year}`;
    };
  
    const formattedDate = formatDate(date); // Format the date

    let orderData = `
      *Food Delivery Order Summary:*
  
City: ${city}
Date: ${formattedDate}
Guest Count: ${numberOfPeople}
Time of Delivery: ${timeSlot.value}
Address: ${address}
Google Map Location: ${googleLocation}
    `;
  
    if (selectedOption === "live-catering") {
      orderData += `
Dishes:
${selectedDishQuantities.map((item) => item.name).join("\n  ")}`;
  
      const priceDetails = calculatePriceDetails();
      const liveCateringTotal = (priceDetails.subtotal * 1.1 + 6500).toFixed(0);
      const liveCateringDiscount = (
        priceDetails.subtotal * 1.1 +
        6500 -
        (priceDetails.priceAfterDiscounts * 1.1 + 6500)
      ).toFixed(0);
  
      orderData += `
    
Total Amount: ₹ ${liveCateringTotal}
Discounts: ₹ ${liveCateringDiscount}
${includeTables ? `Table Charges: +₹ 1200` : ""}
    `;
    }
  
    if (selectedOption === "food-delivery") {
      orderData += `
Dishes:
${selectedDishQuantities
      .map((item) => {
        let quantity = parseFloat(item.quantity) * numberOfPeople;
        const itemCount = selectedDishQuantities.length;
        const mainCourseItemCount = selectedDishQuantities.filter(
          (meal) => meal.id[0] === "63f1b6b7ed240f7a09f7e2de"
        ).length;
        const appetizerItemCount = selectedDishQuantities.filter(
          (meal) => meal.id[0] === "63f1b39a4082ee76673a0a9f"
        ).length;
        const breadItemCount = selectedDishQuantities.filter(
          (meal) => meal.id[0] === "63edc4757e1b370928b149b3"
        ).length;
  
        if (
          (item.id[0] === "63f1b6b7ed240f7a09f7e2de" &&
            mainCourseItemCount > 1) ||
          (item.id[0] === "63f1b39a4082ee76673a0a9f" &&
            appetizerItemCount > 1) ||
          (item.id[0] === "63edc4757e1b370928b149b3" && breadItemCount > 1)
        ) {
          if (itemCount > 5) {
            const adjustment =
              itemCount === 6
                ? 0.15
                : itemCount === 8
                ? 0.25
                : itemCount === 9
                ? 0.3
                : itemCount === 10
                ? 0.35
                : itemCount >= 12
                ? 0.5
                : 0;
            quantity *= 1 - adjustment;
          }
        }
  
        quantity = Math.round(quantity);
        let unit = item.unit;
  
        if (quantity >= 1000) {
          quantity /= 1000;
          if (unit === "Gram") unit = "KG";
          else if (unit === "ml") unit = "L";
        }
  
        return `${item.name}: ${quantity} ${unit}`;
      })
      .join("\n")}`;
  
      const priceDetails = calculatePriceDetails();
  
    orderData += `

Total Amount: ₹${priceDetails.subtotal.toFixed(2)}
`;

      if (priceDetails.quantityDiscountAmount > 0) {
orderData += `Discounts: -₹${priceDetails.quantityDiscountAmount.toFixed(
          2
        )}
    `;
      }
  
      if (priceDetails.foodDeliveryDiscount > 0) {
orderData += `Food Delivery Discount: -₹${priceDetails.foodDeliveryDiscountAmount.toFixed(
          2
        )}
    `;
      }
    }
  
    orderData += `
*Final amount after discount: ₹${calculatePriceDetails().finalTotal.toFixed(
      2
    )}*
    `;
  
    orderData += `
Advance Amount: ₹${priceDetails.advancePayment}
Balance Amount: ₹${balanceamount}
    `;
  
    orderData += `
*Inclusions:*
  - Complementary - Green salad, Mint Chutney, Achar
  - Doorstep Delivery
  - Disposable plates, Fork, Spoon, Tissue papers, Bisleri Water bottles
  - Freshly cooked food.
    `;
  
    navigator.clipboard
      .writeText(orderData)
      .then(() => {
        alert("Order summary copied to clipboard!");
      })
      .catch((error) => {
        console.error("Error copying to clipboard", error);
      });
  };
  
  const priceDetails = calculatePriceDetails();

  useEffect(() => {
    const balance = priceDetails.finalTotal - priceDetails.advancePayment ;
    setBalanceAmount(balance);
  }, [priceDetails.finalTotal, priceDetails.advancePayment]);

  return (
    <div className="container">
      <h1>Food Create 🍲</h1>

      <div>
        <div>
<div style={{ margin: "20px", textAlign: "center", fontFamily: "Arial, sans-serif" }}>
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      gap: "30px",
      backgroundColor: "#f9f9f9",
      padding: "20px",
      borderRadius: "10px",
      border: "1px solid #ccc",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      width: "100%",
      margin: "0 auto",
      marginLeft: "-22px",
    }}
  >
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", 
          marginTop: "22px", marginLeft: "40px" }}>
    <label htmlFor="peopleInput" className="people-label" style={{  fontSize: "16px" }}>
        Select Category:
      </label>
      <select
        value={selectedOption}
        onChange={handleChange}
        style={{
          padding: "12px 20px",
          fontSize: "16px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          width: "200px",
          marginBottom: "15px",
        }}
      >
        <option value="" disabled>
          Select
        </option>
        <option value="food-delivery">Food Delivery</option>
        <option value="live-catering">Live Catering</option>
      </select>
    </div>

    <div className="people-input-container" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <label htmlFor="peopleInput" className="people-label" style={{ marginBottom: "10px", fontSize: "16px" }}>
        Number of People:
      </label>
      <div className="input-wrapper" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          type="button"
          className="btn decrement-btn"
          onClick={() =>
            handlePeopleChange({ target: { value: numberOfPeople - 1 } })
          }
          disabled={numberOfPeople <= 10}
          style={{
            padding: "8px 12px",
            fontSize: "16px",
            borderRadius: "50%",
            backgroundColor: "#f0f0f0",
            border: "1px solid #ccc",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
        >
          -
        </button>
        <input
          id="peopleInput"
          type="number"
          value={numberOfPeople}
          onChange={handlePeopleChange}
          min="10"
          className="people-input"
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            width: "80px",
            textAlign: "center",
            borderRadius: "8px",
            border: "1px solid #ccc",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        />
        <button
          type="button"
          className="btn increment-btn"
          onClick={() =>
            handlePeopleChange({ target: { value: numberOfPeople + 1 } })
          }
          style={{
            padding: "8px 12px",
            fontSize: "16px",
            borderRadius: "50%",
            backgroundColor: "#f0f0f0",
            border: "1px solid #ccc",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
        >
          +
        </button>
      </div>
    </div>
  </div>

  <div style={{ marginTop: "20px", fontSize: "18px", color: "#555" }}>
    {selectedOption === "" && <p>Please select a service to continue.</p>}
    {selectedOption === "food-delivery" && (
      <p style={{ fontWeight: "bold" }}>You have selected <strong>Food Delivery</strong>.</p>
    )}
    {selectedOption === "live-catering" && (
      <p style={{ fontWeight: "bold" }}>You have selected <strong>Live Catering</strong>.</p>
    )}
  </div>
</div>

          <div className="search-bar-container">
            <input
              id="searchInput"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by dish name"
              onClick={() => setPopupOpen(true)}
              className="search-input"
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              marginTop: 7,
              borderTop: "1px solid #efefef",
            }}
          >
            <div
              style={{
                marginHorizontal: 16,
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 5,
              }}
            >
              <p
                style={{
                  padding: 4,
                  color: "#000",
                  fontSize: 13,
                  fontWeight: "700",
                  marginBottom: 0,
                }}
              >
                Dishes selected
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                width: "100%",
                gap: "10px",
              }}
            >
              {selectedDishQuantities.map((item, index) => (
                <RenderDishQuantity key={index} item={item} />
              ))}
            </div>
          </div>
          {selectedDishes.length > 0 && (
            <div className="selected-dishes-container">
              <h3>Selected Dishes:</h3>
              <ul>
                {selectedDishes.map((dish) => (
                  <li key={dish._id}>{dish.name}</li>
                ))}
              </ul>

              {(() => {
                const priceDetails = calculatePriceDetails();
                return (
                  <div className="price-breakdown">
                    <h4>Price Breakdown</h4>
                    <p>
                      <span>Number of Dishes:</span>
                      <span>{priceDetails.dishCount}</span>
                    </p>
                    <p>
                      <span>Number of Guests:</span>
                      <span>{numberOfPeople}</span>
                    </p>

                    {selectedOption === "live-catering" && (
                      <>
                        <p>
                          <span>Live Catering Item Total:</span>
                          <span>
                            ₹ {(priceDetails.subtotal * 1.1 + 6500).toFixed(0)}
                          </span>
                        </p>
                        <p>
                          <span>Live Catering Item Discount:</span>
                          <span>
                            ₹{" "}
                            {(
                              priceDetails.subtotal * 1.1 +
                              6500 -
                              (priceDetails.priceAfterDiscounts * 1.1 + 6500)
                            ).toFixed(0)}
                          </span>
                        </p>
                        {includeTables && (
                          <p>
                            <span>Table Charges:</span>
                            <span>+₹ 1200</span>
                          </p>
                        )}
                        <div className="options-container">
                          <label>
                            <input
                              type="checkbox"
                              checked={includeTables}
                              onChange={(e) =>
                                setIncludeTables(e.target.checked)
                              }
                            />
                            3-4 Serving Tables with Cloth
                          </label>
                        </div>
                      </>
                    )}

                    {selectedOption === "food-delivery" && (
                      <>
                        <p>
                          <span>Item Total:</span>
                          <span>₹ {priceDetails.subtotal}</span>
                        </p>
                        {priceDetails.quantityDiscountAmount > 0 && (
                          <p>
                            <span>Item Discount:</span>
                            <span>
                              -₹ {priceDetails.quantityDiscountAmount}
                            </span>
                          </p>
                        )}
                        {priceDetails.foodDeliveryDiscount > 0 && (
                          <p>
                            <span>Food Delivery Discount:</span>
                            <span>
                              -₹ {priceDetails.foodDeliveryDiscountAmount}
                            </span>
                          </p>
                        )}
                        <p>
                          <span>Packing Charges:</span>
                          <span>+₹ {packingCost}</span>
                        </p>
                        {includeDisposable && (
                          <p>
                            <span>Disposable Charges:</span>
                            <span>+₹ {20 * numberOfPeople}</span>
                          </p>
                        )}
                        {priceDetails.priceAfterDiscounts <= 4000 ? (
                          <p>
                            <span>Delivery Charges:</span>
                            <span>+₹ {deliveryCharges}</span>
                          </p>
                        ) : (
                          <p>
                            <span>Delivery Charges:</span>
                            <span>FREE</span>
                          </p>
                        )}
                        <div className="options-container">
                          <label>
                            <input
                              type="checkbox"
                              checked={includeDisposable}
                              onChange={(e) =>
                                setIncludeDisposable(e.target.checked)
                              }
                            />
                            Disposable plates + water bottle: ₹ 20/Person
                          </label>
                        </div>
                      </>
                    )}

                    <h4>Final Amount: ₹ {priceDetails.finalTotal}</h4>
                    <p>
                      <span>Advance Payment (65%):</span>
                      <span>₹ {priceDetails.advancePayment}</span>
                    </p>
                  </div>
                );
              })()}
            </div>
          )}

          {loading && <p className="loading-text">Loading...</p>}

          {popupOpen && (
            <div
              id="searchPopup"
              className="popup-container"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="popup-dishes-list">
                {filteredDishes.length > 0 ? (
                  filteredDishes.map((dish) => {
                    const price = dish.cuisineArray[0];
                    const quantity = dish.per_plate_qty.qty;
                    const unit = dish.per_plate_qty.unit;

                    return (
                      <div key={dish._id} className="popup-dish-item">
                        <Image
                          src={`https://horaservices.com/api/uploads/${dish.image}`}
                          alt={dish.name}
                          className="bottom-sheet-image"
                          width={30}
                          height={30}
                        />
                        <span>{dish.name}</span>
                        <span>₹ {price}</span>
                        <span>
                          {quantity} {unit} per plate
                        </span>
                        <input
                          type="checkbox"
                          checked={selectedDishes.some(
                            (item) => item.name === dish.name
                          )}
                          onChange={() => handleDishSelect(dish)}
                          className="dish-checkbox"
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="no-dishes">No dishes found</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <>
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
            value={priceDetails.finalTotal}
            onChange={(e) => setTotalAmount(e.target.value)}
            placeholder="Total Amount"
            required
          />
          <label htmlFor="advanceamount">Advance Amount</label>
          <input
            type="text"
            id="advanceamount"
            // value={advanceamount}
            value={priceDetails.advancePayment}
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
          <button
            onClick={copyOrderSummary}
            style={{
              padding: "10px 20px",
              backgroundColor: "#9252AA",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Copy Order Summary
          </button>
          {showButton && (
            <button className="button1" type="submit">
              {lloading ? "Creating Order..." : "Create Order"}
            </button>
          )}
        </>
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
