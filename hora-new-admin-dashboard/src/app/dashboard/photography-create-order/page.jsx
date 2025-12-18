"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import "../decoration-createorder/createorder.css";
import axios from "axios";
import {
  BASE_URL,
  CONFIRM_ORDER_ENDPOINT,
  SAVE_LOCATION_ENDPOINT,
  // GET_PHOTOGRAPHY_BY_NAME,
  ADMIN_USER_LIST,
  ADMIN_USER_SIGNUP,
  API_SUCCESS_CODE,
  PRODUCT_MEAL_TYPE,
} from "../../../utils/apiconstant";
import { timeSlotOptions } from "../../../utils/timeSlots";
import { pincodes } from "../../../utils/pincodes";
import { addOnProductsById } from '../../../utils/addOnProducts';
import SearchWithDropDown from "../../component/SearchWithDropDown";
import { eventList } from "../../../constants/eventList";

// const tagIds = {
// Intimate_Moments: "66c96b4e22ed47b72117e09a",
//   Grand_Celebrations: "66c96b5922ed47b72117e0a7",
//   Mega_Occasions: "66c96b6922ed47b72117e0b4",
// };

const AddPhotoOrder = () => {
  const [selectedTag, setSelectedTag] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
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
  const [setIsContinueClicked] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [, setIsFetched] = useState(false);
  const [pincodeMessage, setPincodeMessage] = useState("");
  const [pincodeMessageColor, setPincodeMessageColor] = useState("");
  const [totalamount, setTotalAmount] = useState("");
  const [advanceamount, setAdvanceAmount] = useState("");
  const [balanceamount, setBalanceAmount] = useState("");
  const [orderTakenBy, setOrderTakenBy] = useState("");
const [mealProductTypes, setMealProductTypes] = useState([]);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");

  const [customerId, setCustomerId] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [lloading, setlLoading] = useState(false);
  const [showButton, setShowButton] = useState(false);

 const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [addOnProducts, setAddOnProducts] = useState([]);
  // const [addOnsTotalPrice, setAddOnsTotalPrice] = useState(0);

  const handleComment = (e) => {
    const commentText = e.target.value;
    setComment(commentText);
  };

  useEffect(() => {
    if (selectedTag) {
      const fetchProductsByTag = async () => {
        setIsLoadingProducts(true);
        try {
          const url = `${BASE_URL}/api/photography/searchByTag/${selectedTag}`;
          const response = await axios.get(url);
          
          if (response.data?.data?.length > 0) {
            setProducts(response.data.data);
          } else {
            setProducts([]);
          }
          // Set add-on products for the selected tag
          const tagId = selectedTag;
          setAddOnProducts(addOnProductsById[tagId] || []);
        } catch (error) {
          console.error("Error fetching products:", error);
          setProducts([]);
        } finally {
          setIsLoadingProducts(false);
        }
      };

      fetchProductsByTag();
    } else {
      setProducts([]);
    }
  }, [selectedTag]);

  useEffect(() => {
          fetchOptions(BASE_URL + PRODUCT_MEAL_TYPE, setMealProductTypes, {
            per_page: "500",
          });
        }, []);
    
        const fetchOptions = async (url, setter, body) => {
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const data = await response.json();
          if (data.error === false && data.data) {
            setter(
              url.includes("admin_meals_list")
                ? data.data.meal || []
                : data.data.configuration || []
            );
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

  // Handle product selection and fetch details
  useEffect(() => {
    if (dishName && products.length > 0) {
      const selectedProduct = products.find(
        (product) => product.name === dishName
      );

      if (selectedProduct) {
        console.log(selectedProduct, "productdata");
        setProduct(selectedProduct);
        setProductID(selectedProduct._id);
        setCategory(selectedProduct.price);

        const inclusions =
          selectedProduct?.inclusion?.length > 0
            ? selectedProduct.inclusion[0]
                .split(/<\/div><div>/)
                .map((item) =>
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
        setProduct(null);
        setIsFetched(false);
      }
    } else {
      setShowProductDetails(false);
      setProduct(null);
      setIsFetched(false);
    }
  }, [dishName, products]);

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


  // const handleCheckCustomer = async (e) => {
  //   e.preventDefault();
  //   setMessage("");
  //   setLoading(true);

  //   try {
  //     const response = await axios.post(`${BASE_URL}${ADMIN_USER_LIST}`, {
  //       phone: customerNumber,  
  //         per_page: 1,          
  //         role: "customer",
  //     });

  //     const users = response?.data?.data?.users;

  //     if (Array.isArray(users)) {
  //       const customer = users.find((user) => user.phone === customerNumber);
  //       console.log(customer, "customer");
  //       setCustomerId(customer);
  //       if (customer) {
  //         setMessage("Customer exists.");
  //         setMessageColor("green");
  //         setShowButton(true);
  //       } else {
  //         setMessage("Customer does not exist.");
  //         setMessageColor("red");
  //         setShowPopup(true);
  //         setShowButton(false);
  //       }
  //     } else {
  //       setMessage("No users found in the response.");
  //       setShowButton(false);
  //     }
  //   } catch (err) {
  //     setMessage("An error occurred while checking the customer.");
  //     console.error(err);
  //     setShowButton(false);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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

    console.log("API response:", response?.data);

    const users = response?.data?.data?.users;

    if (Array.isArray(users) && users.length > 0) {
      const customer = users.find((user) => user.phone === customerNumber);

      console.log("Matched customer:", customer);

      if (customer) {
        setMessage("Customer exists.");
        setMessageColor("green");
        setShowButton(true);
        setShowPopup(false);
        setCustomerId(customer);
      } else {
        // User list returned but phone not matched
        setMessage("Customer does not exist.");
        setMessageColor("red");
        setShowPopup(true);
        setShowButton(false);
        setCustomerId(null);
      }
    } else {
      // Users array is empty or undefined
      setMessage("Customer does not exist.");
      setMessageColor("red");
      setShowPopup(true);
      setShowButton(false);
      setCustomerId(null);
    }

  } catch (err) {
    console.error("API error:", err);

    // Try to get backend message
    const apiMessage =
      err?.response?.data?.message || "An error occurred while checking the customer.";

    setMessage(apiMessage);
    setMessageColor("red");
    setShowPopup(true);   // ✅ always show popup on error
    setShowButton(false);
    setCustomerId(null);
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
        `${BASE_URL}${ADMIN_USER_SIGNUP}`,
        requestData
      );

      setCustomerId(response.data.dataToSave);
      setMessage("Customer successfully added.");
      window.location.reload();
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

  // const handleContinueClick = () => {
  //   setIsContinueClicked(true);
  // };

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
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGMxMGQxY2M5YzY3Y2M0N2NlYWU5MGEiLCJuYW1lIjoiIiwiZW1haWwiOiIiLCJwaG9uZSI6IjExMDAxMjMyNTIiLCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NTc0ODIyODAsImV4cCI6MTc4OTAxODI4MH0.pQYGg7IKV36-5p-ko2FNksYZ9JvoIjkXmAl1snlXALs";

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
      add_on: selectedAddOns,
      inclusion: inclusion,
      selecteditems: dishName,
      phone_no: customerNumber,
      toId: "",
      order_time: timeSlot.value,
      no_of_people: 0,
      type: 8,
      fromId: customerId,
      is_discount: "0",
      addressId: addressID,
      order_pincode: pincode,
      order_date: formattedDate,
      no_of_burner: 0,
      order_locality: city,
      total_amount: totalamount,
      orderApplianceIds: [],
      payable_amount: totalamount,
      advance_amount: advanceamount,
      is_gst: "0",
      order_type: true,
      items: [product?._id],
      decoration_comments: comment,
      status: 1,
      balance_amount: balanceamount,
      order_taken_by: orderTakenBy,
      eventName: selectedEvent
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

  const copyOrderSummary = () => {
    const orderSummary = `

      Date: ${date}
      Time Slot: ${timeSlot?.label || "N/A"}

      *Product Name*: ${dishName}
      Product Price: ${category || "N/A"}
      Product Inclusions:
       ${inclusion.length > 0 ? inclusion.join("\n -") : "None"}
      
      Contact number Number: ${customerNumber}
      
      Total Amount: ${totalamount}
      Advance Amount: ${advanceamount || "N/A"}
      Balance Amount: ${balanceamount || "N/A"}

      *Address*: ${address}
      Google Location: ${googleLocation || "N/A"}
      City: ${city}
      Pincode: ${pincode}
      Comments: ${comment || "None"}
      Order Taken By: ${orderTakenBy}
    `;

    navigator.clipboard.writeText(orderSummary.trim()).then(() => {
      alert("Order Summary copied to clipboard!");
    }).catch((err) => {
      alert("Failed to copy: ", err);
    });
  };


  // Handle add-on selection
  const handleAddOnChange = (addOn, isChecked) => {
    setSelectedAddOns(prev => {
      if (isChecked) {
        return [...prev, addOn];
      } else {
        return prev.filter(item => item.title !== addOn.title);
      }
    });
  };

  return (
    <div className="container">
      <h1>Photography 📸</h1>
      <form onSubmit={handleSubmit}>
        {/* Tag Selection */}
        <label htmlFor="tagSelect">Select Category *</label>
        {/* <select
          id="tagSelect"
          value={selectedTag}
          onChange={(e) => {
            setSelectedTag(e.target.value);
            setDishName(""); // Reset product selection when tag changes
            setShowProductDetails(false);
            setIsFetched(false);
          }}
          required
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "5px",
            fontSize: "16px",
            marginBottom: "10px",
            border: "1px solid #ccc"
          }}
        >
          <option value="">Select a category</option>
          {Object.keys(tagIds).map((tag) => (
            <option key={tag} value={tag}>
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </option>
          ))}
        </select> */}

        <select
  id="tagSelect"
  value={selectedTag}
  onChange={(e) => {
    setSelectedTag(e.target.value);
    setDishName(""); 
    setShowProductDetails(false);
    setIsFetched(false);
  }}
  required
  style={{
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    fontSize: "16px",
    marginBottom: "10px",
    border: "1px solid #ccc",
  }}
>
  <option value="">Select Photography Category</option>

  {mealProductTypes
    .filter((type) =>
      type.configurationId?.some(
        (config) => config.name === "Photography"
      )
    )
    .map((type) => (
      <option key={type._id} value={type._id}>
        {type.name}
      </option>
    ))}
</select>


        {isLoadingProducts && <p>Loading products...</p>}

      
        {/* Product Selection */}
        {products.length > 0 && (
          <>
            <label htmlFor="productSelect">Select Product *</label>
            <select
              id="productSelect"
              value={dishName}
              onChange={(e) => {
                setDishName(e.target.value);
                setIsFetched(false);
                setIsContinueClicked(false);
              }}
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                fontSize: "16px",
                marginBottom: "10px",
                border: "1px solid #ccc"
              }}
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product._id} value={product.name}>
                  {product.name}
                </option>
              ))}
            </select>
          </>
        )}

        {showProductDetails && product && (
          <>
            <label htmlFor="productid">Product ID</label>
            <input type="text" id="productid" value={productid} readOnly />
            <label htmlFor="category">Product Price</label>
            <input type="text" id="category" value={category} readOnly />
            <div className="ProductInclusions" style={{border:"1px solid black" ,marginTop:"10px", padding:"10px"}}>
              <label htmlFor="productid">Product Inclusions:</label>
              <ul style={{listStyle:"disc", paddingLeft:"10px"}}>
                {inclusion.length > 0 ? (
                  inclusion.map((item, index) => <li key={index}>{item}</li>)
                ) : (
                  <li>No inclusions available</li>
                )}
              </ul>
            </div>
            {/* customer check  */}

            <label htmlFor="customerNumber">Customer Number*</label>
            <input
              type="text"
              id="customerNumber"
              value={customerNumber}
              onInput={(e) => setCustomerNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="Customer Number"
              required
              maxLength={10}
              pattern="\d{10}"
              inputMode="numeric"
            />
            <button className="orderCheck-btn" onClick={handleCheckCustomer} disabled={loading || customerNumber.length !== 10}>
              {loading ? "Checking..." : "Check Customer"}
            </button>
            {loading && <p>Loading...</p>}
            {<p style={{ color: messageColor }}>{message}</p>}

          </>
        )}
        {message === "Customer exists."
          ?
          (
          <div className='orderDeatils'>
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
                <label
                  htmlFor="date"
                >
                  Date *
                </label>
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
                    marginBottom: "10px",
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

    {/* Add-On Products */}
        {addOnProducts.length > 0 && (
          <div className="add-on-section" style={{ 
            border: "1px solid #ccc", 
            padding: "15px", 
            borderRadius: "5px", 
            marginBottom: "20px",
            backgroundColor: "#f9f9f9"
          }}>
            <h3>Add-On Products</h3>
            <div className="add-on-grid" style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
              gap: "15px" 
            }}>
              {addOnProducts.map((addOn, index) => (
                <div key={index} className="add-on-card" style={{ 
                  border: "1px solid #ddd", 
                  borderRadius: "8px", 
                  padding: "12px",
                  backgroundColor: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  <input
                    type="checkbox"
                    id={`addon-${index}`}
                    checked={selectedAddOns.some(item => item.title === addOn.title)}
                    onChange={(e) => handleAddOnChange(addOn, e.target.checked)}
                    style={{ transform: "scale(1.2)" }}
                  />
                  <img 
                    src={addOn.image} 
                    alt={addOn.title}
                    style={{ 
                      width: "60px", 
                      height: "60px", 
                      objectFit: "cover", 
                      borderRadius: "4px" 
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <label htmlFor={`addon-${index}`} style={{ 
                      fontWeight: "bold", 
                      cursor: "pointer",
                      display: "block",
                      marginBottom: "4px"
                    }}>
                      {addOn.title}
                    </label>
                    <p style={{ 
                      margin: "0", 
                      fontSize: "12px", 
                      color: "#666",
                      marginBottom: "4px"
                    }}>
                      {addOn.description}
                    </p>
                    <p style={{ 
                      margin: "0", 
                      fontWeight: "bold", 
                      color: "#28a745",
                      fontSize: "14px"
                    }}>
                      ₹{addOn.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {selectedAddOns.length > 0 && (
              <div style={{ 
                marginTop: "15px", 
                padding: "10px", 
                backgroundColor: "#e8f5e8", 
                borderRadius: "5px",
                border: "1px solid #28a745"
              }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#28a745" }}>Selected Add-Ons:</h4>
                <ul style={{ margin: "0", paddingLeft: "20px" }}>
                  {selectedAddOns.map((addOn, index) => (
                    <li key={index} style={{ marginBottom: "5px" }}>
                      {addOn.title} - ₹{addOn.price}
                    </li>
                  ))}
                </ul>
                {/* <p style={{ 
                  margin: "10px 0 0 0", 
                  fontWeight: "bold", 
                  fontSize: "16px",
                  color: "#28a745"
                }}>
                  Total Add-Ons: ₹{addOnsTotalPrice}
                </p> */}
              </div>
            )}
          </div>
        )}


            <div className="cityPincode-box" style={{ margin: "10px 0",
    width: "100%",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",}}>
              <div className="city-box" style={{ flex: 1 }}>
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
              <div className="pincode-box" style={{ flex: 1 }}>
                <label htmlFor="pincode">Pincode *</label>
                <input
                  type="text"
                  id="pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  style={{ padding: "11px", borderRadius: "5px", fontSize: "16px", width: "100%", marginTop: "0px", boxSizing: "border-box" }}
                />
                <p style={{ fontWeight: "bold", fontSize: "15px", color: pincodeMessageColor }}>{pincodeMessage}</p>
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
           
            {/* Create Order */}
            <button className="orderCheck-btn" type="submit" >
              {lloading ? "Creating Order..." : "Create Order"}
            </button>
          </div>)
          :
          <> {lloading && <div className="loader">Loading...</div>}
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
                    onInput={(e) => setNewCustomerPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Customer Number"
                    required
                    maxLength={10}
                    pattern="\d{10}"
                    inputMode="numeric"
                  />
                </label>
                <br />
                <button onClick={handleAddCustomer}>Add Customer</button>
                <button onClick={() => setShowPopup(false)}>Cancel</button>
              </div>
            )}

          </>
        }

      </form>

      {message === "Customer exists." && <button onClick={copyOrderSummary} style={style.buttonPrimary}>
        Copy Order Summary(For Customer)
      </button>
      }
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
    width: "100%"
  },
}

export default AddPhotoOrder;