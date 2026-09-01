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
  CREATE_WONDERLAND_EVENT,
} from "../../../utils/apiconstant";
import { timeSlotOptions } from "../../../utils/timeSlots";
import { pincodes } from "../../../utils/pincodes";
import SearchWithDropDown from "../../component/SearchWithDropDown";
import { eventList } from "../../../constants/eventList";
import { formatDate } from "../../../utils/formateDate";

const AddPhotoOrder = () => {
  const [selectedTag, setSelectedTag] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [dishName, setDishName] = useState("");
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
  const [commentFields, setCommentFields] = useState([0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");
  const [selectedItems, setSelectedItems] = useState({});

  const [customerId, setCustomerId] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [lloading, setlLoading] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [addOnProducts, setAddOnProducts] = useState([]);
  const [addonIds, setAddonIds] = useState([]);
  const [themeIds, setThemeIds] = useState([]);
  const [themeProducts, setThemeProducts] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState([]);
  const [selectedThemeItems, setSelectedThemeItems] = useState({});

  // const [addOnsTotalPrice, setAddOnsTotalPrice] = useState(0);

  // Wonderland Event states
  const [wonderlandevent, setWonderlandEvent] = useState("");
  const [eventResponse, setEventResponse] = useState({});
  console.log(
    "%c [ eventResponse ]",
    "font-size:13px; background:pink; color:#bf2c9f;",
    eventResponse,
  );
  const [eventFormData, setEventFormData] = useState({
    userId: "",
    eventType: "",
    hostName: "",
    eventDate: "",
    eventTime: "",
    location: "",
    googleMapLink: "",
    fromInternational: "NO",
    orderId: "",
  });

  const createWonderlandEvent = async (orderId) => {
    try {
      const response = await axios.post(
        `${BASE_URL}${CREATE_WONDERLAND_EVENT}`,
        {
          ...eventFormData,
          orderId,
        },
      );
      if (response.status === 200 || response.status === 201) {
        setEventResponse(response?.data?.data);
      }
    } catch (error) {
      console.error("Error creating wonderland event:", error);
      alert("There was an error creating wonderland event.");
    }
  };

  console.log(
    "%c [ eventFormData ]",
    "font-size:13px; background:pink; color:#bf2c9f;",
    eventFormData,
  );

  const handleComment = (index, value) => {
    const lines = comment.split("\n");
    lines[index] = value;
    setComment(lines.join("\n"));
  };

  const addCommentField = () => {
    setCommentFields([...commentFields, commentFields.length]);
  };


  useEffect(() => {
    if (!addonIds || addonIds.length === 0) return; // wait until addonIds is available

    const getAddons = async () => {
      try {
        const query = new URLSearchParams();
        addonIds.forEach(id => {
          if (id) query.append("ids", id);
        });

        if ([...query].length === 0) return; // no valid IDs

        const url = `${BASE_URL}/api/addon/get?${query.toString()}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.message || "Failed to fetch addons");
        }

        setAddOnProducts(data.data || []);
      } catch (error) {
        console.error("Error fetching addons:", error);
      }
    };

    getAddons();
  }, [addonIds]);

  useEffect(() => {
    if (!themeIds || themeIds.length === 0) return; 

    const getThemes = async () => {
      try {
        const query = new URLSearchParams();
        themeIds.forEach(id => {
          if (id) query.append("ids", id);
        });

        if ([...query].length === 0) return; // no valid IDs

        const url = `${BASE_URL}/api/photography-theme/get?${query.toString()}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.message || "Failed to fetch addons");
        }

        setThemeProducts(data.data || []);
      } catch (error) {
        console.error("Error fetching addons:", error);
      }
    };

    getThemes();
  }, [themeIds]);

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
        setter(data.data.meal || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Handle product selection and fetch details
  useEffect(() => {
    if (dishName && products.length > 0) {
      const selectedProduct = products.find(
        (product) => product.name === dishName,
      );

      if (selectedProduct) {
        console.log(selectedProduct, "productdata");
        setProduct(selectedProduct);
        setAddonIds(selectedProduct.addons || []);
        setThemeIds(selectedProduct.ThemesId || []);
        setCategory(selectedProduct.price);

        const inclusions =
          selectedProduct?.inclusion?.length > 0
            ? selectedProduct.inclusion[0].split(/<\/div><div>/).map((item) =>
                item
                  .replace(/<\/?div>/g, "")
                  .replace(/<\/?span>/g, "")
                  .replace(/<br\s*\/?>/g, "")
                  .trim(),
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
        err?.response?.data?.message ||
        "An error occurred while checking the customer.";

      setMessage(apiMessage);
      setMessageColor("red");
      setShowPopup(true); // ✅ always show popup on error
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
        requestData,
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

    const add_on = Object.keys(selectedItems).map((id) => {

      const item = addOnProducts.find((i) => i._id === id);

      if (!item) return null;

      return {
        ...item,
        quantity: selectedItems[id]?.quantity || 1,
        totalPrice: item.price * (selectedItems[id]?.quantity || 1)
      };

    }).filter(Boolean);

    const themes = Object.keys(selectedThemeItems).map((id) => {

      const item = themeProducts.find((i) => i._id === id);

      if (!item) return null;

      return {
        ...item,
      };

    }).filter(Boolean);

    const requestData = {
      add_on: add_on,
      themes: themes,
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
      eventName: selectedEvent,
    };

    try {
      const response = await axios.post(
        `${BASE_URL}${CONFIRM_ORDER_ENDPOINT}`,
        requestData,
      );
      if (response.status === 200 || response.status === 201) {
        if (wonderlandevent) {
          createWonderlandEvent(response.data.data.order_id);
        }
      }
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

  const convertToISO = (date) => {
    if (!date) return "";
    return new Date(`${date}T00:00:00.000Z`).toISOString();
  };

  useEffect(() => {
    setEventFormData((prev) => ({
      ...prev,
      userId: customerId?._id || "",
      eventType: selectedEvent || "",
      hostName: wonderlandevent || "",
      eventDate: (date && convertToISO(date)) || "",
      location: address || "",
      googleMapLink: googleLocation || "",
    }));
  }, [customerId, wonderlandevent, date, address, googleLocation]);

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
  // selectedAddOns update
  setSelectedAddOns(prev => {
    if (isChecked) {
      return [...prev, addOn];
    } else {
      return prev.filter(item => item._id !== addOn._id);
    }
  });

  setSelectedItems(prev => {
    const updated = { ...prev };

    if (isChecked) {
      updated[addOn._id] = { quantity: 1 };
    } else {
      delete updated[addOn._id];
    }

    return updated;
  });
};


  const handleThemeChange = (theme, isChecked) => {
    setSelectedTheme(prev => {
      if (isChecked) {
        return [...prev, theme];
      } else {
        return prev.filter(item => item._id !== theme._id);
      }
    });

    setSelectedThemeItems(prev => {
      const updated = { ...prev };

      if (isChecked) {
        updated[theme._id] = { quantity: 1 };
      } else {
        delete updated[theme._id];
      }

      return updated;
    });
  };



const changeQuantity = (id, delta) => {
  setSelectedItems((prev) => {
    const qty = prev[id]?.quantity || 1;
    const newQty = Math.max(1, qty + delta);
    return {
      ...prev,
      [id]: { quantity: newQty }
    };
  });
};


  return (
    <div className="container">
      <h2 className="createOrder pageHeading">Create Photography Order</h2>
      <form className="" onSubmit={handleSubmit}>
        <div className="category-product-row" >
        <div>
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
                (config) => config.name === "Photography",
              ),
            )
            .map((type) => (
              <option key={type._id} value={type._id}>
                {type.name}
              </option>
            ))}
        </select>

        {isLoadingProducts && <p>Loading products...</p>}

        </div>
       <div>
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
                border: "1px solid #ccc",
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
        </div>
        </div>

        <div className="" >
        {showProductDetails && product && (
          <>
              <div className="category-product-row">
          <div>
            <label htmlFor="category">Product Price</label>
            <input type="text" id="category" value={category} readOnly />
              </div>

<div>

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
                  {message !== "Customer exists." &&
                  <div>
              <button
                className="orderCheck-btn"
                onClick={handleCheckCustomer}
                disabled={loading || customerNumber.length !== 10}
              >
                {loading ? "Checking..." : "Check Customer"}
              </button>
              {<p style={{ color: messageColor }}>{message}</p>}
                    </div>
                  }
              </div>
              </div>
            <div
              className="ProductInclusions"
              style={{
                border: "1px solid #ccc",
                marginTop: "10px",
                padding: "10px",
                borderRadius:"6px",
              }}
            >
              <label htmlFor="productid">Product Inclusions:</label>
              <ul style={{ listStyle: "disc", paddingLeft: "10px" }}>
                {inclusion.length > 0 ? (
                  inclusion.map((item, index) => <li key={index}>{item}</li>)
                ) : (
                  <li>No inclusions available</li>
                )}
              </ul>
            </div>
            {/* customer check  */}
          </>
        )}
        {message === "Customer exists." ? (
          <div className="orderDeatils">
            <div
                className="amount-box"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "2%",
                }}
            >
              <div >
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
              <div >
                <label htmlFor="date">Date *</label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div >
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
              <div
                className="address-row" >
            <div>
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
            <div>
              <label htmlFor="googleLocation">Google Location</label>
              <textarea
                type="text"
                id="googleLocation"
                value={googleLocation}
                onChange={(e) => setGoogleLocation(e.target.value)}
                placeholder="googleLocation"
              />
            </div>
              </div>
              <div className="address-row">
              <div>
              <label htmlFor="totalamount">Total Amount*</label>
              <input
                type="text"
                id="totalamount"
                value={totalamount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="Total Amount"
                required
              />
                </div>
                <div>
              <label htmlFor="advanceamount">Advance Amount</label>
              <input
                type="text"
                id="advanceamount"
                value={advanceamount}
                onChange={(e) => setAdvanceAmount(e.target.value)}
                placeholder="Advance Amount"
              />
              </div>
              <div>
              <label htmlFor="balanceamount">Balance Amount</label>
              <input
                type="text"
                id="balanceamount"
                value={balanceamount}
                placeholder="Balance Amount"
                disabled
              />
            </div>
            </div>

            {/* Add-On Products */}
            {addOnProducts.length > 0 && (
              <div
                className="add-on-section"
                style={{
                  border: "1px solid #ccc",
                  padding: "15px",
                  borderRadius: "5px",
                  marginBottom: "10px",
                  marginTop:"15px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <div style={{fontSize:"18px", fontWeight:"600", marginBottom:"8px"}}>Add-On Products</div>
                <div
                  className="add-on-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "15px"
                  }}>
                    {addOnProducts.map((addOn, index) => {
                      const selected = selectedItems[addOn._id];
                      return (
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
                            src={`${BASE_URL}/api/uploads/compressed_webp/${addOn.image}`}
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
                          <div className="right-section">
                            <button onClick={() => changeQuantity(addOn._id, -1)} className="qty-btn">−</button>
                            <span className="qty">{selected?.quantity || 1}</span>
                            <button onClick={() => changeQuantity(addOn._id, 1)} className="qty-btn">+</button>
                            <div className="total-price">₹{addOn.price * (selected?.quantity || 1)}</div>
                          </div>
                        </div>
                      )
                    })}               </div>
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
                        {selectedAddOns.map((addOn, index) => {
                          const qty = selectedItems[addOn._id]?.quantity || 1;

                          return (
                            <li key={index} style={{ marginBottom: "5px" }}>
                              {addOn.title} - ₹{addOn.price} × {qty}
                            </li>
                          );
                        })}

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


            {themeProducts.length > 0 && (
              <div
                className="add-on-section"
                style={{
                  border: "1px solid #ccc",
                  padding: "15px",
                  borderRadius: "5px",
                  marginBottom: "20px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <h3>Themes</h3>
                <div
                  className="add-on-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "15px"
                  }}>
                  {themeProducts.map((theme, index) => {
                    return (
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
                          checked={selectedTheme.some(item => item.title === theme.title)}
                          onChange={(e) => handleThemeChange(theme, e.target.checked)}
                          style={{ transform: "scale(1.2)" }}
                        />
                        <img
                          src={`${BASE_URL}/api/uploads/compressed_webp/${theme.image}`}
                          alt={theme.title}
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
                            {theme.title}
                          </label>
                          <p style={{
                            margin: "0",
                            fontSize: "12px",
                            color: "#666",
                            marginBottom: "4px"
                          }}>
                            {theme.description}
                          </p>
                        </div>

                      </div>
                    )
                  })}               </div>
                {selectedTheme.length > 0 && (
                  <div style={{
                    marginTop: "15px",
                    padding: "10px",
                    backgroundColor: "#e8f5e8",
                    borderRadius: "5px",
                    border: "1px solid #28a745"
                  }}>
                    <h4 style={{ margin: "0 0 10px 0", color: "#28a745" }}>Selected Themes:</h4>
                    <ul style={{ margin: "0", paddingLeft: "20px" }}>
                      {selectedTheme.map((theme, index) => {
                        return (
                          <li key={index} style={{ marginBottom: "5px" }}>
                            {theme.title}
                          </li>
                        );
                      })}

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

            <div
              className="cityPincode-box"
              style={{
                margin: "10px 0",
                width: "100%",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
              }}
            >
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
                  style={{
                    padding: "11px",
                    borderRadius: "5px",
                    fontSize: "16px",
                    width: "100%",
                    marginTop: "0px",
                    boxSizing: "border-box",
                  }}
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
            <div style={{ marginTop: "10px" }}>
              <label htmlFor="wonderlandevent">Wonderland Occasion</label>
              <input
                type="text"
                id="wonderlandevent"
                value={wonderlandevent}
                onChange={(e) => setWonderlandEvent(e.target.value)}
                placeholder="Wonderland Occasion"
              />
            </div>
            <div className="checkoutInputType border-1 rounded-4">
                <div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px", marginTop:"12px" }}>Share your comments (if any)</div>
              <div className="addon-form">
                {commentFields.map((field, index) => (
                  <div key={index} className="comment-container">
                    <input
                      style={{ marginBottom: "8px" }}
                      className="comment-input"
                      value={comment.split("\n")[index] || ""}
                      onChange={(e) => handleComment(index, e.target.value)}
                      placeholder="Enter your comment."
                    />

                    <button
                      style={{ marginBottom: "8px" }}
                      type="button"
                      className="add-new-btn"
                      onClick={addCommentField}
                    >
                      Add New
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Order */}
              <button className="createOrder-btn" type="submit">
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
                      setNewCustomerPhone(e.target.value.replace(/\D/g, ""))
                    }
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
        )}
        </div>
      </form>

      {eventResponse?._id && (
        <p
          className="message"
          style={{
            color: messageColor,
            textAlign: "center",
            marginTop: "15px",
          }}
        >
          Invite Link Admin :{" "}
          <a
            target="_blank"
            href={`https://horaservices.com/wonderland/invite?eventid=${eventResponse?._id}&frompanel=true`}
          >{`https://horaservices.com/wonderland/invite?eventid=${eventResponse?._id}&frompanel=true`}</a>
        </p>
      )}
      {eventResponse?._id && (
        <p
          className="message"
          style={{
            color: messageColor,
            textAlign: "center",
            marginTop: "15px",
          }}
        >
          Invite Link To Share :{" "}
          <a
            target="_blank"
            href={`https://horaservices.com/wonderland/invite?eventid=${eventResponse?._id}`}
          >{`https://horaservices.com/wonderland/invite?eventid=${eventResponse?._id}`}</a>
        </p>
      )}

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

export default AddPhotoOrder;
