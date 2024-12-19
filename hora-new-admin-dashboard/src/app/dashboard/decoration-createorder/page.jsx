"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import Image from "next/image";
import axios from "axios";
import {
  BASE_URL,
  GET_DECORATION_BY_NAME,
  CONFIRM_ORDER_ENDPOINT,
  SAVE_LOCATION_ENDPOINT,
} from "../../../utils/apiconstant";

const AddOrder = () => {
  const [dishName, setDishName] = useState("");
  const [productid, setProductID] = useState("");
  const [category, setCategory] = useState("");
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
          const url = `${BASE_URL}${GET_DECORATION_BY_NAME}${encodeURIComponent(
            dishName
          )}`;
          const response = await axios.get(url);
          if (
            response.data &&
            !response.data.error &&
            response.data.data.length > 0
          ) {
            const productData = response.data.data[0];
            setProduct(productData);
            setProductID(productData._id);
            setCategory(productData.price);
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
        "https://horaservices.com:3000/api/admin/user_signup",
        requestData
      );

      console.log("Customer added:", response.data.dataToSave._id);
      setCustomerId(response.data.dataToSave);
      setMessage("Customer successfully added.");
      setMessageColor("green");
      setShowPopup(false);
      setShowButton(true); // Show button if response is successful
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

  const API_SUCCESS_CODE = 200;

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
      const response = await axios.post(
        `${BASE_URL}${CONFIRM_ORDER_ENDPOINTT}`,
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

  const timeSlotOptions = [
    { value: "7:00 AM - 10:00 AM", label: "7:00 AM - 10:00 AM" },
    { value: "10:00 AM - 1:00 PM", label: "10:00 AM - 1:00 PM" },
    { value: "1:00 PM - 4:00 PM", label: "1:00 PM - 4:00 PM" },
    { value: "4:00 PM - 7:00 PM", label: "4:00 PM - 7:00 PM" },
    { value: "7:00 PM - 10:00 PM", label: "7:00 PM - 10:00 PM" },
  ];

  const pincodes = [
    "400097",
    "560035",
    "122004",
    "122051",
    "400104",
    "400094",
    "400089",
    "201009",
    "110043",
    "400053",
    "400068",
    "400076",
    "410210",
    "400089",
    "122051",
    "400104",
    "400067",
    "400094",
    "400089",
    "201301",
    "410026",
    "400043",
    "500072",
    "400043",
    "400075",
    "500050",
    "560063",
    "560030",
    "560034",
    "560007",
    "560092",
    "560024",
    "562106",
    "560045",
    "560003",
    "560050",
    "562107",
    "560064",
    "560047",
    "560026",
    "560086",
    "560002",
    "560070",
    "560073",
    "562149",
    "560053",
    "560085",
    "560043",
    "560017",
    "560001",
    "560009",
    "560025",
    "560083",
    "560076",
    "560004",
    "560079",
    "560103",
    "560046",
    "562157",
    "560010",
    "560049",
    "560056",
    "560068",
    "560093",
    "560018",
    "560040",
    "560097",
    "560061",
    "562130",
    "560067",
    "560036",
    "560029",
    "560062",
    "560037",
    "560071",
    "562125",
    "560016",
    "560100",
    "560005",
    "560065",
    "560019",
    "560021",
    "560022",
    "560013",
    "560087",
    "560008",
    "560051",
    "560102",
    "560104",
    "560048",
    "560094",
    "560066",
    "560038",
    "560078",
    "560006",
    "560014",
    "560015",
    "560041",
    "560069",
    "560011",
    "560020",
    "560084",
    "560096",
    "560098",
    "560095",
    "560077",
    "560074",
    "560054",
    "560023",
    "560033",
    "560055",
    "560099",
    "560072",
    "560039",
    "560075",
    "560032",
    "560058",
    "560059",
    "560080",
    "560027",
    "560012",
    "560042",
    "560028",
    "560052",
    "560091",
    "572213",
    "560035",
    "110001",
    "110002",
    "110003",
    "110004",
    "110005",
    "110006",
    "110007",
    "110008",
    "110009",
    "110010",
    "110011",
    "110012",
    "110013",
    "110014",
    "110015",
    "110016",
    "110017",
    "110018",
    "110019",
    "110020",
    "110021",
    "110022",
    "110023",
    "110024",
    "110025",
    "110026",
    "110027",
    "110028",
    "110029",
    "110030",
    "110031",
    "110032",
    "110033",
    "110034",
    "110035",
    "110036",
    "110037",
    "110038",
    "110039",
    "110040",
    "110041",
    "110042",
    "110043",
    "110044",
    "110045",
    "110046",
    "110047",
    "110048",
    "110049",
    "110051",
    "110052",
    "110053",
    "110054",
    "110055",
    "110056",
    "110057",
    "110058",
    "110059",
    "110060",
    "110061",
    "110062",
    "110063",
    "110064",
    "110065",
    "110066",
    "110067",
    "110068",
    "110070",
    "110071",
    "110073",
    "110074",
    "110075",
    "110076",
    "110078",
    "110081",
    "110082",
    "110083",
    "110084",
    "110085",
    "110086",
    "110087",
    "110088",
    "110091",
    "110092",
    "110093",
    "110094",
    "110095",
    "110096",
    "122102",
    "201302",
    "201303",
    "201304",
    "201305",
    "201306",
    "201307",
    "201309",
    "201312",
    "201308",
    "201312",
    "201315",
    "201310",
    "201318",
    "122001",
    "122002",
    "122003",
    "122004",
    "122006",
    "122008",
    "122009",
    "122010",
    "122011",
    "122015",
    "122016",
    "122017",
    "122018",
    "201009",
    "201001",
    "201002",
    "201003",
    "201004",
    "201005",
    "201006",
    "201007",
    "201008",
    "201010",
    "201011",
    "201012",
    "201013",
    "201014",
    "201015",
    "201016",
    "201017",
    "201018",
    "121002",
    "121001",
    "121003",
    "121004",
    "121005",
    "121006",
    "121007",
    "121008",
    "121009",
    "121010",
    "122022",
    "500030",
    "500004",
    "500045",
    "500007",
    "500012",
    "500015",
    "500044",
    "500013",
    "501201",
    "501301",
    "500040",
    "500020",
    "500048",
    "500058",
    "500064",
    "500005",
    "500034",
    "500027",
    "500016",
    "500003",
    "500018",
    "500080",
    "500039",
    "500022",
    "500024",
    "500081",
    "500008",
    "500028",
    "500006",
    "500060",
    "500062",
    "500053",
    "500065",
    "500029",
    "500043",
    "500001",
    "500068",
    "500052",
    "500066",
    "500025",
    "500051",
    "500035",
    "500002",
    "500076",
    "500082",
    "500031",
    "500079",
    "500085",
    "500033",
    "500077",
    "500067",
    "500074",
    "500063",
    "500017",
    "500089",
    "500036",
    "500026",
    "500095",
    "500069",
    "500071",
    "500041",
    "500023",
    "500055",
    "500059",
    "500038",
    "500046",
    "500061",
    "500073",
    "502032",
    "500070",
    "500057",
    "501101",
    "502300",
    "500049",
    "500060",
    "501218",
    "501505",
    "500070",
    "500019",
    "500101",
    "501504",
    "501815",
    "500072",
    "500078",
    "500050",
    "400065",
    "400011",
    "400099",
    "400004",
    "400053",
    "400069",
    "400058",
    "400037",
    "400005",
    "400003",
    "400051",
    "400050",
    "400090",
    "400001",
    "400012",
    "400007",
    "400028",
    "400091",
    "400066",
    "400092",
    "400013",
    "400020",
    "400030",
    "400022",
    "400093",
    "400067",
    "400033",
    "400026",
    "400014",
    "400068",
    "400052",
    "400017",
    "400010",
    "400008",
    "400062",
    "400063",
    "400034",
    "400070",
    "400057",
    "400032",
    "400056",
    "400076",
    "400095",
    "400059",
    "400060",
    "400102",
    "400080",
    "400049",
    "400002",
    "400101",
    "400016",
    "400031",
    "400064",
    "400061",
    "400006",
    "400097",
    "400103",
    "400019",
    "400104",
    "400021",
    "400023",
    "400025",
    "400035",
    "400054",
    "400029",
    "400055",
    "400096",
    "400015",
    "400027",
    "400098",
    "400018",
    "410221",
    "402301",
    "412803",
    "416301",
    "400614",
    "400702",
    "400708",
    "400615",
    "203125",
    "410206",
    "401602",
    "410208",
    "410210",
    "400612",
    "422401",
    "400707",
    "400703",
    "422605",
    "400701",
    "410207",
    "400705",
    "410218",
    "410202",
    "410203",
    "400710",
    "400709",
    "402107",
    "421302",
    "400704",
    "401102",
    "412206",
    "400706",
    "413511",
    "412203",
    "412104",
    "410222",
    "441906",
    "401405",
    "401501",
    "421306",
    "421312",
    "414604",
    "410220",
    "401301",
    "421301",
    "421601",
    "421501",
    "400610",
    "401302",
    "421102",
    "421504",
    "400608",
    "401201",
    "401202",
    "421002",
    "421603",
    "401105",
    "401101",
    "421308",
    "401701",
    "421001",
    "401503",
    "401601",
    "401608",
    "401610",
    "421402",
    "421201",
    "421203",
    "401206",
    "421403",
    "401702",
    "400602",
    "401603",
    "400606",
    "400605",
    "401607",
    "421602",
    "421401",
    "401401",
    "401402",
    "421311",
    "400603",
    "401703",
    "400607",
    "400601",
    "421503",
    "421605",
    "401403",
    "421204",
    "401104",
    "401107",
    "401604",
    "401209",
    "421505",
    "401304",
    "421502",
    "421101",
    "401404",
    "401207",
    "421103",
    "401203",
    "401609",
    "401606",
    "401502",
    "401504",
    "401506",
    "421004",
    "421005",
    "401106",
    "401204",
    "401103",
    "401208",
    "421604",
    "421305",
    "401605",
    "401303",
    "401305",
    "421202",
    "421303",
    "400604",
    "410401",
    "410201",
    "400074",
    "400043",
    "400075",
    "400072",
    "400089",
  ];

  useEffect(() => {
    const balance = totalamount - advanceamount;
    setBalanceAmount(balance);
  }, [totalamount, advanceamount]);

  return (
    <div className="container">
      <h1>Create Customer Order</h1>
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
