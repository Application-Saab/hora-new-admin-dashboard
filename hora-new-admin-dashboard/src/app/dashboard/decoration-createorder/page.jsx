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
  ADMIN_USER_LIST,
  CREATE_WONDERLAND_EVENT,
} from "../../../utils/apiconstant";
import { pincodes } from "../../../utils/pincodes.js";
import SearchWithDropDown from "../../component/SearchWithDropDown";
import { eventList } from "../../../constants/eventList";
import { formatDate } from "../../../utils/formateDate";

const AddDecOrder = () => {
  const [dishName, setDishName] = useState("");
  const [productprice, setProductPrice] = useState("");
  const [date, setDate] = useState("");
  console.log(
    "%c [ date ]",
    "font-size:13px; background:pink; color:#bf2c9f;",
    date,
  );
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
  const [pincodeMessage, setPincodeMessage] = useState("");
  const [pincodeMessageColor, setPincodeMessageColor] = useState("");
  const [totalamount, setTotalAmount] = useState("");
  const [advanceamount, setAdvanceAmount] = useState("");
  const [balanceamount, setBalanceAmount] = useState("");
  const [orderTakenBy, setOrderTakenBy] = useState("");
  const [inclusion, setInclusion] = useState([]);
  const [products, setProducts] = useState([{ name: "", price: "" }]);
  const [comment, setComment] = useState("");
  const [dishNameError, setDishNameError] = useState("");
  const [commentFields, setCommentFields] = useState([0]);
  const [inclusionFields, setInclusionFields] = useState([0]);
  const [customInclusion, setCustomInclusion] = useState([""]);
    const [discountAmount, setDiscountAmount] = useState("");
  // const [error, setError] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");

  const [customerId, setCustomerId] = useState(null);
  const [showPopup, setShowPopup] = useState(false); // For toggling the popup
  const [newCustomerName, setNewCustomerName] = useState(""); // For name input
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  const [selectedItems, setSelectedItems] = useState({});
  const [teams, setTeams] = useState([]);

  const [isOrderCreated, setIsOrderCreated] = useState(false);

  // Wonderland Event states
  const [wonderlandevent, setWonderlandEvent] = useState("");
  const [eventResponse, setEventResponse] = useState({});
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

  const [productSuggestions, setProductSuggestions] = useState([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [isProductSelected, setIsProductSelected] = useState(false);

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
  const [addonData, setAddonData] = useState([]);
  const [addonIds, setAddonIds] = useState([]);

      const getTeams = async (number = "") => {
          try {
              setLoading(true);
  
              let url = `${BASE_URL}/api/team/getAll`;
  
              if (number) {
                  url += `?number=${encodeURIComponent(number)}`;
              }
  
              const response = await fetch(url);
  
              const contentType = response.headers.get("content-type");
  
              if (!contentType || !contentType.includes("application/json")) {
                  const text = await response.text();
  
                  console.error("API returned non-JSON response:", text);
  
                  throw new Error(
                      "Invalid API response. Please check BASE_URL and API route."
                  );
              }
  
              const result = await response.json();
  
              if (!response.ok) {
                  throw new Error(
                      result.message || "Failed to fetch teams"
                  );
              }
  
              setTeams(result.data || []);
          } catch (error) {
              console.error("Get team error:", error);
              alert(error.message);
          } finally {
              setLoading(false);
          }
      };
      useEffect(() => {
          getTeams();
      }, []);

  const toggleItem = (id) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: prev[id] ? undefined : { quantity: 1 },
    }));
  };

  const changeQuantity = (id, delta) => {
    setSelectedItems((prev) => {
      const qty = prev[id]?.quantity || 1;
      const newQty = Math.max(1, qty + delta);
      return {
        ...prev,
        [id]: { quantity: newQty },
      };
    });
  };

  const handleInputChange = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  const addProduct = () => {
    setProducts([...products, { name: "", price: "" }]);
  };

  const handleComment = (index, value) => {
    const lines = comment.split("\n");
    lines[index] = value;
    setComment(lines.join("\n"));
  };

  const addCommentField = () => {
    setCommentFields([...commentFields, commentFields.length]);
  };

  const handleInclusionChange = (index, value) => {
    setCustomInclusion((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addInclusionField = () => {
    setInclusionFields((prev) => [...prev, prev.length]);
    setCustomInclusion((prev) => [...prev, ""]);
  };

  const fetchProducts = async () => {
    if (!dishName.trim()) {
      setDishNameError("Please enter product name");
      return;
    }

    try {
      setLoading(true);
      setDishNameError("");

      const url = `${BASE_URL}${GET_DECORATION_BY_NAME}${encodeURIComponent(
        dishName.trim()
      )}`;

      const response = await axios.get(url);

      const products = response.data?.data || [];

      setProductSuggestions(products);
      setShowProductDropdown(products.length > 0);
      setIsContinueClicked(true);

      if (products.length === 0) {
        setDishNameError("No product found");
      }
    } catch (error) {
      console.error("Error fetching products:", error.message);
      setProductSuggestions([]);
      setShowProductDropdown(false);
      setDishNameError("Unable to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleProductInputChange = (e) => {
    const value = e.target.value;

    setDishName(value);

    // Product change ke time purani selection reset
    setProduct(null);
    setIsProductSelected(false);
    setShowProductDetails(false);
    setIsContinueClicked(false);
    setProductSuggestions([]);
    setDishNameError("");
  };

  const handleProductInputClick = () => {
    // Product already selected hai to input click par
    // dropdown dobara open ho jayega
    if (isProductSelected) {
      setShowProductDropdown(true);
      return;
    }

    // Continue ke baad suggestions already hain
    if (isContinueClicked && productSuggestions.length > 0) {
      setShowProductDropdown(true);
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
  }, [pincode]);

  // by aarti-----
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

  const handleAddCustomer = async () => {
    const requestData = {
      name: newCustomerName,
      phone: newCustomerPhone,
      email: "",
      role: "customer",
    };
    try {
      const response = await axios.post(
        `${BASE_URL}/api/admin/user_signup`,
        requestData,
      );
      setCustomerId(response.data.dataToSave);
      setMessage("Customer successfully added.");
      window.location.reload();
      // window.location.reload(false);
      setMessageColor("green");
      setShowPopup(false);
    } catch (err) {
      console.error("Error adding customer:", err);
      setMessage("Failed to add customer.");
      setMessageColor("red");
    }
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

    const add_on = Object.keys(selectedItems).map((id) => {

      const item = addonData.find((i) => i._id === id);

      if (!item) return null;

      return {
        ...item,
        quantity: selectedItems[id]?.quantity || 1,
        totalPrice: item?.price || 0 * (selectedItems[id]?.quantity || 1)
      };
    }).filter(Boolean);

    const addOnProduct = products
      .filter(product => product.name)
      .map((product) => ({
        title: product?.name,
        price: product?.price || 0,
        totalPrice: product?.price || 0,
        quantity: 1,
      }));
    const combinedAddOns = [...add_on, ...addOnProduct];
    const formattedDate = date ? formatDate(date) : null;

    const addressID = await saveAddress();

    if (!addressID) {
      console.error("Address ID is missing");
      return;
    }

    const requestData = {
      add_on: combinedAddOns,
      phone_no: customerNumber,
      toId: "",
      order_time: timeSlot.value,
      no_of_people: 0,
      type: 1,
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
      items: [product._id],
      decoration_comments: comment,
      status: 1,
      balance_amount: balanceamount,
      order_taken_by: orderTakenBy,
      eventName: selectedEvent,
      customInclusion: customInclusion.filter((item) => item.trim() !== ""),
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
      setIsOrderCreated(true);
      alert("Order created successfully:", response.data);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("There was an error creating the order. Please try again.");
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

  const proDuctInclusions = (product) => {
    if (!product.inclusion || product.inclusion.length === 0) {
      return "No inclusion details available"; // Return plain text for inclusion summary
    }

    const inclusionItems = product.inclusion[0]
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&#[^;]*;/g, " ") // Replace special characters
      .split("-") // Split by "-"
      .map((item) => item.trim())
      .filter((item) => item); // Remove empty items

    return inclusionItems.map((item) => `- ${item}`).join("\n"); // Format inclusion items as a list for text
  };

  const copyOrderSummary = () => {
    let addons = "";
    const inclusionSummary = proDuctInclusions(product);

    const selectedAddonItems = Object.keys(selectedItems || {})
      .map((id) => {
        const item = addonData?.find(
          (addon) => String(addon._id) === String(id)
        );

        if (!item) return null;

        const quantity = selectedItems[id]?.quantity || 1;
        const price = Number(item.price) || 0;
        const totalPrice = price * quantity;

        return {
          title: item.title,
          price,
          quantity,
          totalPrice,
        };
      })
      .filter(Boolean);

    // Selected API Addons
    selectedAddonItems.forEach((item, index) => {
      addons += `\n  ${index + 1}. ${item.title}: ₹${item.price} × ${item.quantity} = ₹${item.totalPrice}`;
    });

    // Manually added addons
    const manualAddons = products?.filter(
      (item) => item.name?.trim()
    ) || [];

    manualAddons.forEach((item, index) => {
      const addonIndex = selectedAddonItems.length + index + 1;

      addons += `\n  ${addonIndex}. ${item.name}: ₹${Number(item.price) || 0}`;
    });

    // No addons
    if (!addons) {
      addons = "\n  None";
    }

    const customInclusionSummary =
      customInclusion
        ?.filter((item) => item.trim() !== "")
        .map((item, index) => `  ${index + 1}. ${item}`)
        .join("\n") || "";

    let inclusionText = "";

    if (inclusionSummary) {
      inclusionText += `\n*Inclusions*:\n${inclusionSummary}\n`;
    }

    if (customInclusionSummary) {
      inclusionText += `\n*Inclusions*:\n${customInclusionSummary}\n`;
    }


    // Create the order summary string
    const orderSummary = `
  *Decoration Order Details*
  
  Date: ${date}
  Time Slot: ${timeSlot?.label || ""}
  Contact Number: ${customerNumber}
  Address: ${address}
  Google Map Location: ${googleLocation}
  
  Total Amount: ₹${totalamount || "N/A"}
  Advance Amount: ₹${advanceamount || "N/A"}
  Balance Amount: ₹${balanceamount || "N/A"}
  
  Product site Url :${product?.productUrl || "N/A"}
  *Product Name*: ${dishName}
  Product Image URL: ${BASE_URL}/api/uploads/${product?.featured_images.length > 0 ? product?.featured_images[0]?.fileName : ""}
  
  *Add-On Items*:
  ${addons}
  
${inclusionText}
  
  Comment: ${comment}
  Order Taken By: ${orderTakenBy}
    `;

    // Copy the order summary to clipboard
    navigator.clipboard.writeText(orderSummary.trim());

    // Alert the user
    alert("Order summary copied!");
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

        setAddonData(data.data || []);
      } catch (error) {
        console.error("Error fetching addons:", error);
      }
    };

    getAddons();
  }, [addonIds]);

  return (
    <div
    style={{display:"flex", gap:"10px"}}
    >
    <div className="createDecor-container">
      <h2 className="createOrder pageHeading">Create Decoration Order</h2>
      <form className="orderCreation form" onSubmit={handleSubmit}>
        {/* product check */}
        <div className="top-product-details">
          <div>
              <div className="product-search-wrapper">
                <label htmlFor="dishName">Product Name *</label>

                <input
                  type="text"
                  id="dishName"
                  className="product-input"
                  value={dishName}
                  onChange={handleProductInputChange}
                  onClick={handleProductInputClick}
                  placeholder="Product Name"
                  required
                />

                {/* Continue button */}
                <span style={{marginLeft:"10px"}}>
                {!isProductSelected && (
                  <button
                    type="button"
                    className="orderCheck-btn"
                    onClick={fetchProducts}
                    disabled={loading || !dishName.trim()}
                    style={{ marginTop: "10px" }}
                  >
                    {loading ? "Searching..." : "Continue"}
                  </button>
                )}
                </span>

                {dishNameError && (
                  <p style={{ color: "red", marginTop: "5px" }}>
                    {dishNameError}
                  </p>
                )}

                {/* Product Dropdown */}
                {showProductDropdown && productSuggestions.length > 0 && (
                  <div className="product-suggestions-dropdown">
                    {productSuggestions.map((item) => (
                      <div
                        key={item._id}
                        className="product-suggestion-item"
                        onMouseDown={(e) => {
                          e.preventDefault();

                          setDishName(item.name);
                          setProduct(item);
                          setAddonIds(item.addons || []);
                          setProductPrice(item.price);
                          setInclusion(item.inclusion || []);

                          setShowProductDetails(true);
                          setShowProductDropdown(false);
                          setDishNameError("");
                          setIsProductSelected(true);
                          setIsContinueClicked(true);
                        }}
                      >
                        {/* Product Image */}
                        <div className="product-suggestion-image-wrapper">
                          <img
                            src={`${BASE_URL}/api/uploads/${product?.featured_images.length > 0 ? product?.featured_images[0]?.fileName : item.featured_image}`}
                            alt={item.name || "Product"}
                            className="product-suggestion-image"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>

                        {/* Product Details */}
                        <div className="product-suggestion-details">
                          <div className="product-suggestion-name">
                            {item.name}
                          </div>

                          {item.price !== undefined && item.price !== null && (
                            <div className="product-suggestion-price">
                              ₹{item.price}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            {showProductDetails && product && (
              <>
                <div style={{ display: "flex", gap: "10px" }}>
                  <div>
                    {/* costumer chcek======================== */}
                    <label htmlFor="customerNumber">Customer Number*</label>
                    <input
                      type="text"
                      id="customerNumber"
                      className="number-input"
                      value={customerNumber}
                      onInput={(e) =>
                        setCustomerNumber(e.target.value.replace(/\D/g, ""))
                      } // Remove non-digits as the user types
                      placeholder="Customer Number"
                      required
                      maxLength={10} // Limit to 10 digits
                      pattern="\d{10}" // Enforce exactly 10 digits
                      inputMode="numeric" // Optimize for numeric input on mobile devices
                    />
                  </div>

                    <div>
                      <label htmlFor="orderTakenBy">Order Taken By*</label>

                      <SearchWithDropDown
                        options={teams?.map((team) => team.name) || []}
                        selectedValue={orderTakenBy}
                        onChange={(value) => setOrderTakenBy(value)}
                        placeholder="Search Team..."
                      />
                    </div>
                </div>
                <div>
                  {message !== "Customer exists." ?
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
                    :
                    <div></div>
                  }

                </div>
                  {message == "Customer exists." &&
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >


                  <div >
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

                  <div >
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
}
              </>
            )}
          </div>
          {showProductDetails &&
            <div className="product-image">
              <div>
                <Image
                  src={`${BASE_URL}/api/uploads/${product.featured_image}`}
                  alt="Product"
                  width={200}
                  height={200}
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
              <div style={{ fontSize: "18px" }}>₹ {productprice}</div>
            </div>
          }
        </div>

        {/* product details =================================================*/}

        {message === "Customer exists." && (
          <div
            className="ProductInclusions"
            style={{
              border: "1px solid #ccc",
              marginTop: "10px",
              padding: "10px",
              borderRadius: "6px",
            }}
          >
            <label>Product Inclusions:</label>

            {inclusion?.length > 0 ? (
              <div
                style={{ marginTop: "8px" }}
                dangerouslySetInnerHTML={{
                  __html: inclusion.join(""),
                }}
              />
            ) : (
              <div style={{ marginTop: "8px" }}>
                No inclusions available
              </div>
            )}
              {customInclusion?.some((item) => item.trim() !== "") && (
                <div style={{ marginTop: "15px" }}>

                  <ul style={{ paddingLeft: "22px" }}>
                    {customInclusion
                      .filter((item) => item.trim() !== "")
                      .map((item, index) => (
                        <li key={index} style={{ marginBottom: "5px" }}>
                          {item}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
          </div>
        )}
          {message === "Customer exists." && (
          <div
            className="amount-box"
          >
            <div className="city-box" style={{ flex: 1 }}>
              <label htmlFor="city">
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
          </div>
          )}

        {/* order details ==========================.Customer does not exist */}
        {message === "Customer exists." ? (
          <div className="orderDeatils">

            <div className="amount-box">
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
            </div>
            <div className="">
              <label htmlFor="addOn">Add On</label>

              <div className="addon-form">
                {products.map((product, index) => (
                  <div className="addon-row" key={index}>
                    <input
                      type="text"
                      className="addon-input name-input"
                      placeholder="Name"
                      value={product.name}
                      onChange={(e) =>
                        handleInputChange(index, "name", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      className="addon-input price-input"
                      placeholder="Price"
                      value={product.price}
                      onChange={(e) =>
                        handleInputChange(index, "price", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="add-new-btn"
                      onClick={addProduct}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="addon-heading">Select Addon Products</div>

            <div className="dropdown-container">
              {/* <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="selectAddon-btn"
              >
                <div className="addon-inner-text">
                  <span>Select Addon</span>

                  <span
                    className={`item-arrow ${dropdownOpen ? "arrow-down" : ""}`}
                  >
                    ›
                  </span>
                </div>
              </button> */}

              <div className="addon-menu">

                <div className="addon-grid">
                  {addonData &&
                    addonData.map((item) => {
                      const selected = selectedItems[item._id];

                      return (
                        <div className="item-row" key={item._id}>

                          {/* PRODUCT SECTION */}
                          <div className="left-section">

                            <input
                              type="checkbox"
                              checked={!!selected}
                              onChange={() => toggleItem(item._id)}
                              onClick={(e) => e.stopPropagation()}
                            />

                            <div
                              className="addon-product-clickable"
                              onClick={() => toggleItem(item._id)}
                            >
                              <img
                                src={`${BASE_URL}/api/uploads/compressed_webp/${item.image}`}
                                alt={item.title}
                                className="addon-product-image"
                              />

                              <div className="addon-product-info">
                                <div className="item-title">
                                  {item.title}
                                </div>

                                <div className="item-price">
                                  ₹{item.price}
                                </div>
                              </div>
                            </div>

                          </div>

                          {/* QUANTITY SECTION */}
                          {selected && (
                            <div className="right-section">

                              <button
                                type="button"
                                onClick={() => changeQuantity(item._id, -1)}
                                className="qty-btn"
                              >
                                −
                              </button>

                              <span className="qty">
                                {selected.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() => changeQuantity(item._id, 1)}
                                className="qty-btn"
                              >
                                +
                              </button>

                              <div className="total-price">
                                ₹{item.price * selected.quantity}
                              </div>

                            </div>
                          )}

                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="amount-box">
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
                  <label htmlFor="discountamount">Discount Amount*</label>
                  <input
                    type="text"
                    id="discountamount"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder="Discount Amount"
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

            <div className="amount-box">
              <div>
                <label htmlFor="wonderlandevent">Wonderland Occasion</label>
                <input
                  type="text"
                  id="wonderlandevent"
                  value={wonderlandevent}
                  onChange={(e) => setWonderlandEvent(e.target.value)}
                  placeholder="Wonderland Occasion"
                />
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
            <div className="checkoutInputType border-1 rounded-4 ">
              <h4 className="comments-heading">Share your comments (if any)</h4>
              <div className="addon-form">
                {commentFields.map((field, index) => (
                  <div key={index} className="comment-container">
                    <input
                      style={{ marginBottom: "8px" }}
                      className="comment-input"
                      value={comment.split("\n")[index] || ""}
                      onChange={(e) => handleComment(index, e.target.value)}
                      cols={90}
                      rows={4}
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
              {product?.name === "Custom Product" && (
              <div className="checkoutInputType border-1 rounded-4">
                <h4 className="comments-heading">Add Inclusion</h4>
                <div className="addon-form">
                  {inclusionFields.map((field, index) => (
                    <div key={index} className="comment-container">
                      <input
                        style={{ marginBottom: "8px" }}
                        className="comment-input"
                        value={customInclusion[index] || ""}
                        onChange={(e) =>
                          handleInclusionChange(index, e.target.value)
                        }
                        placeholder="Enter your inclusion."
                      />

                      <button
                        style={{ marginBottom: "8px" }}
                        type="button"
                        className="add-new-btn"
                        onClick={addInclusionField}
                      >
                        Add New
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              )}

            {!isOrderCreated && (
              <button
                className="createOrder-btn"
                type="button"
                onClick={handleSubmit}
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

    </div>
      {/* ================= ORDER SUMMARY ================= */}
      {product &&
        <div className="createDecor-container order-summary-container">

        <div className="summary-header">
          <h2 className="createOrder pageHeading">Order Summary</h2>
        </div>

        {/* Product */}
        <div className="summary-product">
            Product URL: {" "}{`${product?.productUrl || ""}`}

          <div>
            <div> Product Name: {" "}{product?.name || ""}</div>
            <div> Product Price: {" "}₹{product?.price || 0}</div>
          </div>
        </div>

        <div className="summary-divider" />

        {/* Customer Details */}
        <div className="summary-section">
          <h4>Customer Details:{" "}</h4>

          <div className="summary-row">
            <span>Contact Number:{" "}</span>
            <span>{customerNumber || "—"}</span>
          </div>

          <div className="summary-row">
            <span>Order Taken By:{" "}</span>
            <span>{orderTakenBy || "—"}</span>
          </div>
        </div>

        {/* Event Details */}
        <div className="summary-section">
          <h4>Event Details :{" "}</h4>



          <div className="summary-row">
            <span>Event Name :{" "}</span>
            <span>{ wonderlandevent ||selectedEvent || "—"}</span>
          </div>


          <div className="summary-row">
            <span>City :{" "}</span>
            <span>{city || "—"}</span>
          </div>


          <div className="summary-row">
            <span>Pincode :{" "}</span>
            <span>{pincode || "—"}</span>
          </div>

          <div className="summary-row">
            <span>Date :{" "}</span>
            <span>{date || "—"}</span>
          </div>

          <div className="summary-row">
            <span>Time Slot :{" "}</span>
            <span>{timeSlot?.label || "—"}</span>
          </div>

          <div className="summary-row summary-column">
            <span>Address :{" "}</span>
            <span>{address || "—"}</span>
          </div>

          <div className="summary-row summary-column">
            <span>Google Location :{" "}</span>
            <span>{googleLocation || "—"}</span>
          </div>
        </div>

        {/* Selected Addons */}
          {(Object.keys(selectedItems || {}).length > 0 ||
            products?.some((item) => item.name)) && (
              <div className="summary-section">
                <h4>Add-ons :</h4>

                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  {/* Selected Add-ons */}
                  {Object.keys(selectedItems || {}).map((id) => {
                    const item = addonData?.find(
                      (i) => String(i._id) === String(id)
                    );

                    if (!item) return null;

                    const quantity = selectedItems[id]?.quantity || 1;

                    return (
                      <li key={`selected-${id}`} style={{ marginBottom: "8px" }}>
                        <div>
                          <span>{item.title}</span>
                        </div>

                        <small>
                          ₹{item.price} × {quantity} = ₹{item.price * quantity}
                        </small>
                      </li>
                    );
                  })}

                  {/* Manually Added Add-ons */}
                  {products
                    ?.filter((item) => item.name)
                    .map((item, index) => (
                      <li key={`manual-${index}`} style={{ marginBottom: "8px" }}>
                        <div>
                          <span>{item.name}</span>
                        </div>

                        <small>
                          ₹{item.price || 0} × 1 = ₹{item.price || 0}
                        </small>
                      </li>
                    ))}
                </ul>
              </div>
            )}

        {/* Inclusions */}
        {product?.inclusion?.length > 0 && (
          <div className="summary-section">
            <h4>Inclusions :</h4>

            <div className="summary-inclusions">
              {product.inclusion.map((item, index) => (
                <div
                  key={index}
                  dangerouslySetInnerHTML={{
                    __html: item,
                  }}
                />
              ))}
                {customInclusion
                  ?.filter((item) => item.trim() !== "")
                  .map((item, index) => (
                    <div
                      key={`custom-inclusion-${index}`}
                      style={{
                        marginTop: "6px",
                      }}
                    >
                      • {item}
                    </div>
                  ))}
            </div>
          </div>
        )}

        {/* Comment */}
          {comment && (
            <div className="summary-section">
              <h4>Comments :</h4>

              <ul style={{ margin: 0, paddingLeft: "22px" }}>
                {comment
                  .split("\n")
                  .filter((item) => item.trim())
                  .map((item, index) => (
                    <li key={index} style={{ marginBottom: "6px" }}>
                      {item}
                    </li>
                  ))}
              </ul>
            </div>
          )}

        {/* Amount Summary */}
        <div className="summary-amount">

          <h4>Amount Details</h4>

          <div className="amount-summary-row">
            <span>Total Amount :</span>
            <span>
              ₹{totalamount || 0}
            </span>
          </div>

          <div className="amount-summary-row">
            <span>Advance Amount :</span>
            <span>
              ₹{advanceamount || 0}
            </span>
          </div>

          <div className="amount-summary-row balance-row">
            <span>Balance Amount :</span>
            <span>
              ₹{balanceamount || 0}
            </span>
          </div>

          {message === "Customer exists." && (
            <button onClick={copyOrderSummary} style={style.buttonPrimary}>
              Copy Order Summary(For Customer)
            </button>
          )}

        </div>

      </div>
}
    </div>

  );
};

const style = {
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
