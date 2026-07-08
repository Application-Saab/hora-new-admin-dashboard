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
  GET_MATERIAL_FILTER_DATA,
} from "../../../utils/apiconstant";
import { pincodes } from "../../../utils/pincodes.js";
import { itemsData } from "../../../utils/itemData";
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

  const [products, setProducts] = useState([{ name: "", price: "" }]);
  const [comment, setComment] = useState("");
  const [dishNameError, setDishNameError] = useState("");
  const [commentFields, setCommentFields] = useState([0]);
  // const [error, setError] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");

  const [customerId, setCustomerId] = useState(null);

  const [showPopup, setShowPopup] = useState(false); // For toggling the popup
  const [newCustomerName, setNewCustomerName] = useState(""); // For name input
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  const [selectedItems, setSelectedItems] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [isOrderCreated, setIsOrderCreated] = useState(false);

  const [data, setData] = useState([]);
  const [options, setOptions] = useState({
    specs: [],
    type: [],
    material: [],
  });
  const [inclusions, setInclusions] = useState([
    {
      id: 1,
      specs: "",
      type: "",
      material: "",
      rentedConsumable: "",
      moq: "",
      customQuantity: "",
      matchedRow: null,
      price: 0,
      previewText: "",
    },
  ]);
    const [executionPrice, setExecutionPrice] = useState(0);
  const [advancePercent, setAdvancePercent] = useState(0);
  const [nextId, setNextId] = useState(2);
  const [mode, setMode] = useState("Option1");
  const [option2Text, setOption2Text] = useState("");

  useEffect(() => {
    const fetchMaterialFilterData = async () => {
      try {
        const res = await fetch(`${BASE_URL}${GET_MATERIAL_FILTER_DATA}`);
        const result = await res.json();

        if (
          result?.error === false ||
          result?.success === false ||
          result?.data
        ) {
          const apiData = result.data || {};

          const specsData = Array.isArray(apiData.specs) ? apiData.specs : [];
          const typeData = Array.isArray(apiData.type) ? apiData.type : [];
          const materialData = Array.isArray(apiData.material)
            ? apiData.material
            : [];

          setData(specsData);

          setOptions({
            specs: specsData.map((item) => item.value).filter(Boolean),
            type: typeData.map((item) => item.value).filter(Boolean),
            material: materialData.map((item) => item.value).filter(Boolean),
          });
        }
      } catch (err) {
        console.error("Error fetching material filter data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialFilterData();
  }, []);

    const buildPreviewText = (item) => {
    let previewText = `${item.specs || "-"} ${item.type || "-"} ${item.material || "-"}`;

    if (item.rentedConsumable === "Rented") {
      previewText += ` ${item.moq || "-"}`;
    } else if (item.rentedConsumable === "Consumable") {
      previewText += ` ${item.customQuantity || item.moq || 1}`;
    }

    return previewText;
  };

  const extractNumber = (value) => {
    return parseFloat(String(value || "").replace(/[^\d.]/g, "")) || 0;
  };

  const getCalculatedPrice = (matchedRow, rentedConsumable, customQuantity) => {
    if (!matchedRow) return 0;

    const vendorPrice = parseFloat(matchedRow.vendorMaterialPrice) || 0;

    if (rentedConsumable === "Consumable") {
      const qty = parseFloat(customQuantity) || 0;
      const moqNumber = extractNumber(matchedRow.minimumOrderQuantity) || 1;
      return (qty * vendorPrice) / moqNumber;
    }

    return vendorPrice;
  };

  
  const handleSelectChange = (id, field, value) => {
    setInclusions((prev) =>
      prev.map((inc) => {
        if (inc.id !== id) return inc;

        let updated = {
          ...inc,
          [field]: value,
        };

        // agar specs change hua hai to us specs ki first matched row auto-fill kar do
        if (field === "specs") {
          const firstMatch = data.find((row) => row.value === value);

          if (firstMatch) {
            updated = {
              ...updated,
              specs: firstMatch.value || "",
              type: firstMatch.type || "",
              material: firstMatch.material || "",
              rentedConsumable: firstMatch.materialCategory || "",
              moq: firstMatch.minimumOrderQuantity || "",
              matchedRow: firstMatch,
            };

            // consumable me default qty blank ho to MOQ number ya 1 le sakte ho
            const defaultQty =
              updated.customQuantity ||
              extractNumber(firstMatch.minimumOrderQuantity) ||
              1;

            updated.customQuantity =
              firstMatch.materialCategory === "Consumable"
                ? updated.customQuantity || defaultQty
                : "";

            updated.price = getCalculatedPrice(
              firstMatch,
              firstMatch.materialCategory,
              updated.customQuantity,
            );

            updated.previewText = buildPreviewText(updated);
            return updated;
          } else {
            updated = {
              ...updated,
              type: "",
              material: "",
              rentedConsumable: "",
              moq: "",
              customQuantity: "",
              matchedRow: null,
              price: 0,
            };
            updated.previewText = buildPreviewText(updated);
            return updated;
          }
        }

        // agar type change hua
        if (field === "type") {
          // pehle same specs + new type ka first material dhundo
          let firstMatch = data.find(
            (row) => row.value === updated.specs && row.type === value,
          );

          if (firstMatch) {
            updated = {
              ...updated,
              type: firstMatch.type || "",
              material: firstMatch.material || "",
              rentedConsumable: firstMatch.materialCategory || "",
              moq: firstMatch.minimumOrderQuantity || "",
              matchedRow: firstMatch,
            };

            if (firstMatch.materialCategory !== "Consumable") {
              updated.customQuantity = "";
            }

            updated.price = getCalculatedPrice(
              firstMatch,
              firstMatch.materialCategory,
              updated.customQuantity,
            );
          } else {
            updated = {
              ...updated,
              type: value,
              material: "",
              rentedConsumable: "",
              moq: "",
              customQuantity: "",
              matchedRow: null,
              price: 0,
            };
          }

          updated.previewText = buildPreviewText(updated);
          return updated;
        }

        // agar material change hua
        if (field === "material") {
          const exactMatch = data.find(
            (row) =>
              row.value === updated.specs &&
              row.type === updated.type &&
              row.material === value,
          );

          if (exactMatch) {
            updated = {
              ...updated,
              material: exactMatch.material || "",
              rentedConsumable: exactMatch.materialCategory || "",
              moq: exactMatch.minimumOrderQuantity || "",
              matchedRow: exactMatch,
            };

            if (exactMatch.materialCategory !== "Consumable") {
              updated.customQuantity = "";
            }

            updated.price = getCalculatedPrice(
              exactMatch,
              exactMatch.materialCategory,
              updated.customQuantity,
            );
          } else {
            updated = {
              ...updated,
              material: value,
              rentedConsumable: "",
              moq: "",
              customQuantity: "",
              matchedRow: null,
              price: 0,
            };
          }

          updated.previewText = buildPreviewText(updated);
          return updated;
        }

        return updated;
      }),
    );
  };

    const handleCustomQuantityChange = (id, value) => {
    setInclusions((prev) =>
      prev.map((inc) => {
        if (inc.id !== id) return inc;

        const updated = {
          ...inc,
          customQuantity: value,
        };

        updated.price = getCalculatedPrice(
          updated.matchedRow,
          updated.rentedConsumable,
          value,
        );

        updated.previewText = buildPreviewText(updated);

        return updated;
      }),
    );
  };

    const handlePriceChange = (id, value) => {
    const num = parseFloat(value) || 0;
    setInclusions((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          let previewText = `${i.specs || "-"} ${i.type || "-"} ${
            i.material || "-"
          }`;
          if (i.rentedConsumable === "Rented") {
            previewText += ` ${i.moq || "-"}`;
          } else if (i.rentedConsumable === "Consumable") {
            previewText += ` ${i.customQuantity || 1} PCS`;
          }
          // previewText += `, Price: $${num.toFixed(2)}`;
          return { ...i, price: num, previewText };
        }
        return i;
      }),
    );
  };

  const handlePreviewChange = (id, value) => {
    setInclusions((prev) =>
      prev.map((i) => (i.id === id ? { ...i, previewText: value } : i)),
    );
  };

  const handleAddInclusion = () => {
    setInclusions((prev) => [
      ...prev,
      {
        id: nextId,
        specs: "",
        type: "",
        material: "",
        rentedConsumable: "",
        moq: "",
        customQuantity: "",
        matchedRow: null,
        price: 0,
        previewText: "",
      },
    ]);
    setNextId(nextId + 1);
  };

  const handleRemoveInclusion = (id) => {
    if (inclusions.length > 1) {
      setInclusions(inclusions.filter((i) => i.id !== id));
    }
  };

  const totalPrice = inclusions.reduce((sum, i) => sum + i.price, 0);
  // const finalPrice = totalPrice + executionPrice;
  const summaryText = inclusions.map((i) => i.previewText).join("\n");


  
  const getFilteredMaterials = (specs, type) => {
    let filtered = data;

    if (specs) {
      filtered = filtered.filter((row) => row.value === specs);
    }

    if (type) {
      filtered = filtered.filter((row) => row.type === type);
    }

    return [...new Set(filtered.map((row) => row.material).filter(Boolean))];
  };
  
  const getFilteredTypes = (specs) => {
    if (!specs) return options.type;

    return [
      ...new Set(
        data
          .filter((row) => row.value === specs)
          .map((row) => row.type)
          .filter(Boolean),
      ),
    ];
  };

  useEffect(() => {
  if (product?.inclusionVariables?.length) {
    const mapped = product?.inclusionVariables?.map((inc, index) => ({
      ...inc,
      id: index + 1,
      matchedRow: data.find(
        (row) =>
          row.value === inc.specs &&
          row.type === inc.type &&
          row.material === inc.material
      ),
    }));

    setInclusions(mapped);
    setNextId(mapped.length + 1);
  } else {
    setInclusions([
      {
        id: 1,
        specs: "",
        type: "",
        material: "",
        rentedConsumable: "",
        moq: "",
        customQuantity: "",
        matchedRow: null,
        price: 0,
        previewText: "",
      },
    ]);
  }
  }, [product]) 



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

  useEffect(() => {
    if (dishName && isContinueClicked && !isFetched) {
      const fetchProductDetails = async () => {
        try {
          const url = `${BASE_URL}${GET_DECORATION_BY_NAME}${encodeURIComponent(dishName)}`;
          const response = await axios.get(url);
          const productData = response.data?.data?.[0];
          if (productData) {
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
        requestData
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

    const add_on = Object.keys(selectedItems).map((id) => {
      const item = itemsData.find((i) => i.id === parseInt(id));
      return {
        name: item.title + " - Quantity " + selectedItems[id].quantity,
        price: item.price,
      };
    });

    const addOnProduct = products.map((product) => ({
      name: product.name,
      price: product.price,
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
      inclusionVariables: inclusions
    };
    
    try {
      const response = await axios.post(
        `${BASE_URL}${CONFIRM_ORDER_ENDPOINT}`,
        requestData,
      );
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

    // Check if products exist and loop over them
    if (products && products.length > 0) {
      products.forEach((item, index) => {
        addons += `\n  ${index + 1}. ${item.name}: ₹${item.price}`;
      });
    } else {
      addons += " None"; // Show "None" directly if there are no add-ons
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
  
  *Product Name*: ${dishName}
  Product Image URL: ${BASE_URL}/api/uploads/${product?.featured_images.length > 0 ? product?.featured_images[0]?.fileName : ""}
  
  *Add-On Items*:
  ${addons}
  
  *Inclusions*:
  ${inclusionSummary}
  
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
                  src={`${BASE_URL}/api/uploads/${product.featured_image}`}
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
              } // Remove non-digits as the user types
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
                  // min={new Date().toISOString().split("T")[0]} // Directly setting min date is this need?
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
            <div className="addon-container">
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
                      Add New
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="dropdown-container">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="orderCheck-btn"
              >
                Select AddOn ▼
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  {itemsData &&
                    itemsData.map((item) => {
                      const selected = selectedItems[item.id];
                      return (
                        <div className="item-row" key={item.id}>
                          <div className="left-section">
                            <input
                              type="checkbox"
                              checked={!!selected}
                              onChange={() => toggleItem(item.id)}
                            />
                            <div>
                              <div className="item-title">{item.title}</div>
                              <div className="item-price">₹{item.price}</div>
                            </div>
                          </div>

                          {selected && (
                            <div className="right-section">
                              <button
                                type="button"
                                onClick={() => changeQuantity(item.id, -1)}
                                className="qty-btn"
                              >
                                −
                              </button>
                              <span className="qty">{selected.quantity}</span>
                              <button
                                type="button"
                                onClick={() => changeQuantity(item.id, 1)}
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
              )}
            </div>
            {Object.keys(selectedItems).length > 0 && (
              <div className="selected-summary">
                <h4>Selected Add-ons</h4>
                <ul>
                  {Object.keys(selectedItems).map((id) => {
                    const item = itemsData.find((i) => i.id === parseInt(id));

                    return (
                      <li key={id}>
                        {item.title} — ₹{item.price} ×{" "}
                        {selectedItems[id].quantity}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

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
            <div className='checkoutInputType border-1 rounded-4 '>
              <h4>Share your comments (if any)</h4>
              <div className="addon-form">
              {commentFields.map((field, index) => (
    <div key={index} className="comment-container">
      <input
      style={{marginBottom : "8px"}}
        className='comment-input'
        value={comment.split("\n")[index] || ""}
        onChange={(e) => handleComment(index, e.target.value)}
        cols={90}
        rows={4}
        placeholder="Enter your comment."
      />

      <button 
      style={{marginBottom : "8px"}}
      type="button" className="add-new-btn" onClick={addCommentField}>
        Add New
      </button>
    </div>
  ))}
  </div>
            </div>

            <div style={container}>
              {/* Dropdown to select mode */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ marginRight: "8px" }}>Choose Mode:</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  style={select}
                >
                  <option value="Option1">Option 1</option>
                  <option value="Option2">Option 2</option>
                </select>
              </div>

              {mode === "Option1" ? (
                <>
                  <button
                    onClick={handleAddInclusion}
                    style={{
                      ...button,
                      backgroundColor: "#3498db",
                      color: "#fff",
                      marginBottom: "20px",
                    }}
                  >
                    + Add Inclusion
                  </button>
                  {inclusions.map((inc) => {
                    const filteredTypes = getFilteredTypes(inc.specs);
                    const filteredMaterials = getFilteredMaterials(
                      inc.specs,
                      inc.type,
                    );
                    return (
                      <div key={inc.id} style={inclusionBox}>
                        <div style={row}>
                          <select
                            value={inc.specs}
                            onChange={(e) =>
                              handleSelectChange(
                                inc.id,
                                "specs",
                                e.target.value,
                              )
                            }
                            style={select}
                          >
                            <option value="">Specs</option>
                            {options.specs.map((o, i) => (
                              <option key={i} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>

                          <select
                            value={inc.type}
                            onChange={(e) =>
                              handleSelectChange(inc.id, "type", e.target.value)
                            }
                            style={select}
                          >
                            <option value="">Type</option>
                            {filteredTypes?.map((o, i) => (
                              <option key={i} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>

                          <select
                            value={inc.material}
                            onChange={(e) =>
                              handleSelectChange(
                                inc.id,
                                "material",
                                e.target.value,
                              )
                            }
                            style={select}
                          >
                            <option value="">Material</option>
                            {filteredMaterials?.map((o, i) => (
                              <option key={i} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>

                          <input
                            type="text"
                            value={inc.rentedConsumable}
                            placeholder="Rented/Consumable"
                            readOnly
                            style={{ ...select, backgroundColor: "#f5f5f5" }}
                          />

                          <input
                            type="text"
                            value={inc.moq}
                            placeholder="MOQ"
                            readOnly
                            style={{ ...select, backgroundColor: "#f5f5f5" }}
                          />

                          {inc.rentedConsumable === "Consumable" && (
                            <input
                              type="number"
                              placeholder="Qty"
                              value={inc.customQuantity}
                              onChange={(e) =>
                                handleCustomQuantityChange(
                                  inc.id,
                                  e.target.value,
                                )
                              }
                              // readOnly
                              style={input}
                            />
                          )}

                          <input
                            type="number"
                            placeholder="Price"
                            value={inc.price}
                            onChange={(e) =>
                              handlePriceChange(inc.id, e.target.value)
                            }
                            style={input}
                          />

                          <button
                            onClick={() => handleRemoveInclusion(inc.id)}
                            style={{
                              ...button,
                              backgroundColor: "#e74c3c",
                              color: "#fff",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                        <div
                          style={{
                            marginTop: "4px",
                            fontWeight: "bold",
                            color: inc.matchedRow ? "#27ae60" : "#c0392b",
                          }}
                        >
                          {inc.matchedRow ? "✅ Matched" : "❌ Not Matched"}
                        </div>

                        <textarea
                          value={inc.previewText}
                          onChange={(e) =>
                            handlePreviewChange(inc.id, e.target.value)
                          }
                          style={preview}
                        />
                      </div>
                    );
                  })}

                  <div style={totalsBox}>
                    <div>
                      <strong>Hora Vendor Material Price:</strong> ₹
                      {totalPrice.toFixed(2)}
                    </div>

                    <div>
                      <strong>Execution Price:</strong>{" "}
                      <input
                        type="number"
                        value={executionPrice}
                        onChange={(e) =>
                          setExecutionPrice(parseFloat(e.target.value) || 0)
                        }
                        style={input}
                      />
                    </div>

                    <div>
                      <strong>Advance %:</strong>{" "}
                      <input
                        type="number"
                        value={advancePercent}
                        onChange={(e) =>
                          setAdvancePercent(parseFloat(e.target.value) || 0)
                        }
                        style={input}
                        placeholder="e.g. 20"
                      />
                    </div>

                    {/* Customer Price Calculation */}
                    <div>
                      <strong>Customer Price:</strong> ₹
                      {advancePercent >= 100
                        ? "Invalid %"
                        : (
                            (totalPrice + executionPrice) /
                            (1 - advancePercent / 100)
                          ).toFixed(2)}
                    </div>

                    {/* Advance Amount Calculation */}
                    <div>
                      <strong>Advance Hora Amount:</strong> ₹
                      {advancePercent >= 100
                        ? "Invalid %"
                        : (
                            ((totalPrice + executionPrice) /
                              (1 - advancePercent / 100)) *
                            (advancePercent / 100)
                          ).toFixed(2)}
                    </div>
                  </div>

                  {/* <div style={totalsBox}>
              <div>
                <strong>Hora Vendor Material Price:</strong> ₹
                {totalPrice.toFixed(2)}
              </div>
              <div>
                <strong>Execution Price:</strong>{" "}
                <input
                  type="number"
                  value={executionPrice}
                  onChange={(e) =>
                    setExecutionPrice(parseFloat(e.target.value) || 0)
                  }
                  style={input}
                />
              </div>
               <div>
    <strong>Advance %:</strong>{" "}
    <input
      type="number"
      value={advancePercent}
      onChange={(e) => setAdvancePercent(parseFloat(e.target.value) || 0)}
      style={input}
      placeholder="e.g. 20"
    />
  </div>

  <div>
    <strong>Customer Price:</strong> ₹
    {advancePercent >= 100
      ? "Invalid %"
      : ((totalPrice + executionPrice) / (1 - advancePercent / 100)).toFixed(2)}
  </div>
              <div>
                <strong>Final Price:</strong> ₹{finalPrice.toFixed(2)}
              </div>
            </div> */}

                  <h4 style={{ marginTop: "30px", marginBottom: "8px" }}>
                    📝 Inclusion Summary
                  </h4>
                  <textarea readOnly value={summaryText} style={summary} />
                </>
              ) : (
                <div>
                  <label style={{ marginBottom: "8px" }}>
                    📝 Product Inclusion
                  </label>
                  <textarea
                    value={option2Text}
                    onChange={(e) => setOption2Text(e.target.value)}
                    placeholder="Enter your text here..."
                    style={{ ...summary, height: "200px" }}
                  />
                </div>
              )}
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

const container = {
  maxWidth: "1450px",
  margin: "40px auto",
  padding: "2px",
  fontFamily: "Segoe UI, sans-serif",
};
const row = {
  display: "flex",
  flexWrap: "wrap",
  gap: "6px",
  alignItems: "center",
  marginBottom: "8px",
};
const select = {
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  minWidth: "100px",
};
const input = {
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  width: "40px",
};
const button = {
  padding: "8px 12px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  transition: "0.2s",
};
const inclusionBox = {
  backgroundColor: "#fefefe",
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "20px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};
const preview = {
  width: "90%",
  height: "auto",
  marginTop: "8px",
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  fontSize: "14px",
  background: "#f9f9f9",
};
const summary = {
  width: "100%",
  height: "150px",
  padding: "16px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  backgroundColor: "#fafafa",
  marginTop: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  fontFamily: "monospace",
  whiteSpace: "pre-wrap",
};
const totalsBox = {
  background: "#f2f8f9",
  padding: "20px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "20px",
  fontSize: "16px",
};

export default AddDecOrder;
