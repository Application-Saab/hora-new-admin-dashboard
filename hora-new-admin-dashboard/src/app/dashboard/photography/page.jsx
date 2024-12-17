"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./photography.css";
import {
  BASE_URL,
  SAVE_LOCATION_ENDPOINT,
  API_SUCCESS_CODE,
  CONFIRM_ORDER_ENDPOINT,
} from "../../../utils/apiconstant";
import CircularProgress from "@mui/material/CircularProgress";

const timeSlotOptions = [
  { value: "7:00 AM - 10:00 AM", label: "7:00 AM - 10:00 AM" },
  { value: "10:00 AM - 1:00 PM", label: "10:00 AM - 1:00 PM" },
  { value: "1:00 PM - 4:00 PM", label: "1:00 PM - 4:00 PM" },
  { value: "4:00 PM - 7:00 PM", label: "4:00 PM - 7:00 PM" },
  { value: "7:00 PM - 10:00 PM", label: "7:00 PM - 10:00 PM" },
];

const cityOptions = [
  { value: "Bangalore", label: "Bangalore" },
  { value: "Hyderbad", label: "Hyderbad" },
  { value: "Mumbai", label: "Mumbai" },
  { value: "Delhi", label: "Delhi" },
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

function Photography() {
  const [formData, setFormData] = useState({
    package: "",
    customerNumber: "",
    orderTakenBy: "",
    date: "",
    timeSlot: "",
    totalAmount: "",
    advance: "",
    balance: 0,
    address: "",
    pincode: "",
    googleLocation: "",
    city: "",
    comments: "",
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [loadingCheckCustomerNumber, setLoadingCheckCustomerNumber] =
    useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [messagePincode, setMessagePincode] = useState("");

  const [loadingOrder, setLoadingOrder] = useState(false);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://horaservices.com:3000/api/photography/searchByTag/64b8c4e8f5a4c9e341234568"
        );
        if (!response.data.error) {
          setData(response.data.data);
        } else {
          console.error("Error fetching data:", response.data.message);
        }
      } catch (error) {
        console.error("API fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: value };

      if (name === "totalAmount" || name === "advance") {
        updatedData.balance = calculateBalance(
          updatedData.totalAmount,
          updatedData.advance
        );
      }
      return updatedData;
    });
  };

  const calculateBalance = (totalAmount, advance) => {
    const total = parseFloat(totalAmount || 0);
    const advanceAmount = parseFloat(advance || 0);
    return total > advanceAmount ? total - advanceAmount : 0;
  };

  const saveAddress = async () => {
    try {
      const url = BASE_URL + SAVE_LOCATION_ENDPOINT;

      const address2 = formData.address + formData.pincode;
      console.log(address2, "address2");
      const requestDataa = {
        address1: address2,
        address2: formData.googleLocation,
        locality: formData.city,
        city: formData.city,
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
        console.log(response.data.data._id, "responseid");
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
    setLoadingOrder(true);

    const addressID = await saveAddress();

    const requestData = {
      add_on: selectedPackage?.inclusion,
      phone_no: formData.customerNumber,
      toId: "",
      order_time: formData.timeSlot,
      no_of_people: 0,
      type: 8,
      fromId: customerId,
      is_discount: "0",
      addressId: addressID,
      order_date: formData.date,
      no_of_burner: 0,
      order_locality: formData.city,
      total_amount: formData.totalAmount,
      orderApplianceIds: [],
      payable_amount: formData.totalAmount,
      advance_amount: formData.advance,
      is_gst: "0",
      order_type: true,
      items: [selectedPackage._id],
      decoration_comments: formData.comments,
      status: 1,
      balance_amount: formData.balance,
      order_taken_by: formData.orderTakenBy,
    };

    console.log("Request Data:", requestData);

    try {
      const response = await axios.post(
        `${BASE_URL}${CONFIRM_ORDER_ENDPOINT}`,
        requestData
      );

      console.log("Response:", response.data);

      if (response.status === API_SUCCESS_CODE) {
        alert("Order successfully created!");

        setFormData({
          package: "",
          customerNumber: "",
          date: "",
          timeSlot: "",
          totalAmount: "",
          advance: "",
          balance: 0,
          address: "",
          pincode: "",
          googleLocation: "",
          city: "",
          orderTakenBy: "",
        });

        setCustomerId(null);
        setMessage("Order successfully created!");
        setMessageColor("green");
      } else {
        console.error("Unexpected response:", response.status);
        alert("Error while creating order. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Error while creating order. Please try again.");
    }finally {
      setLoadingOrder(false); // Hide loading spinner
    }
  };

  const selectedPackage = data.find((item) => item.name === formData.package);

  const handleCheckCustomer = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoadingCheckCustomerNumber(true);

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
        const customer = users.find(
          (user) => user.phone === formData.customerNumber
        );
        console.log(customer, "custoemer");
        setCustomerId(customer || null);

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
      setLoadingCheckCustomerNumber(false);
    }
  };

  const handleAddCustomer = async () => {
    const requestData = {
      name: newCustomerName,
      phone: newCustomerPhone,
      email: "",
      role: "customer",
    };
    console.log(requestData, "requesting data");

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

  const handlePincodeChange = (e) => {
    const enteredPincode = e.target.value;

    setFormData({
      ...formData,
      pincode: enteredPincode,
    });

    if (pincodes.includes(enteredPincode)) {
      setMessageColor({ color: "green" });
      setMessagePincode("Pincode available");
    } else {
      setMessageColor({ color: "red" });
      setMessagePincode("Pincode not available");
    }
  };

  return (
    <div className="app">
      <h1>Photography 📸</h1>
      <form onSubmit={handleSubmit} className="form">
        {/* Package Name */}
        <div className="form-group">
          <label htmlFor="package">Select Name:</label>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <select
              name="package"
              id="package"
              value={formData.package}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>
                Select Name
              </option>
              {data.map((item, index) => (
                <option key={index} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Package ID */}
        {selectedPackage && (
          <div className="form-group">
            <label>Package ID:</label>
            <input type="text" value={selectedPackage?._id || ""} readOnly />
          </div>
        )}

        {selectedPackage && (
          <div className="form-group">
            <label>Package Price:</label>
            <input type="text" value={selectedPackage?.price || ""} readOnly />
          </div>
        )}

        {/* Display Inclusion */}
        {selectedPackage?.inclusion?.length > 0 && (
          <div className="form-group">
            <label>Inclusions:</label>
            <ul>
              {selectedPackage.inclusion.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Customer Number */}
        <div className="form-group">
          <label htmlFor="customerNumber">Customer Number:</label>
          <input
            type="text"
            name="customerNumber"
            value={formData.customerNumber}
            onChange={handleInputChange}
            placeholder="Customer Number"
            required
          />
        </div>

        {/* Button to Check Customer */}
        <button
          type="button"
          onClick={handleCheckCustomer}
          disabled={loadingCheckCustomerNumber}
          className="button1"
        >
          {loadingCheckCustomerNumber ? "Checking..." : "Check Customer"}
        </button>

        {/* Message Display */}
        {message && <p style={{ color: messageColor }}>{message}</p>}

        {/* Conditionally Render */}
        {customerId && (
          <>
            {/* Order Taken By */}
            <div className="form-group">
              <label htmlFor="orderTakenBy">Order Taken By:</label>
              <input
                type="text"
                name="orderTakenBy"
                value={formData.orderTakenBy}
                onChange={handleInputChange}
                placeholder="Enter Order Taken By"
                required
              />
            </div>

            <div
              className="date-time-container"
              style={{
                display: "flex",
                justifyContent: "space-between",
                margin: "8px 0",
              }}
            >
              <div style={{ flex: 1, marginRight: "8px" }}>
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
                  name="date"
                  id="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  style={{ width: "90%", padding: "10px", fontSize: "16px" }}
                />
              </div>

              <div style={{ flex: 1, marginLeft: "8px" }}>
                <label
                  htmlFor="timeSlot"
                  style={{
                    fontWeight: "bold",
                    marginBottom: "5px",
                    display: "block",
                  }}
                >
                  Time Slot *
                </label>
                <select
                  name="timeSlot"
                  id="timeSlot"
                  value={formData.timeSlot}
                  onChange={handleInputChange}
                  required
                  style={{ width: "90%", padding: "10px", fontSize: "16px" }}
                >
                  <option value="" disabled>
                    Select a time slot
                  </option>
                  {timeSlotOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Google Location */}
            <div className="form-group">
              <label htmlFor="googleLocation">Google Location:</label>
              <input
                type="text"
                name="googleLocation"
                value={formData.googleLocation}
                onChange={handleInputChange}
                placeholder="Enter Google Location"
                required
              />
            </div>

            {/* Address */}
            <div className="form-group">
              <label htmlFor="address">Address:</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter Address"
                required
              />
            </div>

            {/* Total Amount, Advance & Balance */}
            <div className="form-group">
              <label>Total Amount:</label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleInputChange}
                placeholder="Total Amount"
              />
            </div>
            <div className="form-group">
              <label>Advance Amount:</label>
              <input
                type="number"
                name="advance"
                value={formData.advance}
                onChange={handleInputChange}
                placeholder="Advance Amount"
              />
            </div>
            <div className="form-group">
              <label>Balance Amount:</label>
              <input
                type="number"
                name="balance"
                value={formData.balance}
                readOnly
              />
            </div>

            <div className="form-group">
              <label htmlFor="comments">Share any comments:</label>
              <input
                type="text"
                name="comments"
                value={formData.comments}
                onChange={handleInputChange}
                placeholder="comments"
                required
              />
            </div>

            {/* City Dropdown */}
            <div className="form-group">
              <label htmlFor="city">City:</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>
                  Select City
                </option>
                {cityOptions.map((city, index) => (
                  <option key={index} value={city.value}>
                    {city.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Pincode */}
            <div className="form-group">
              <label htmlFor="pincode">Pincode:</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handlePincodeChange}
                placeholder="Enter Pincode"
                required
              />
              {messagePincode && <p style={messageColor}>{messagePincode}</p>}
            </div>
 
            <button type="submit" className="submit-btn" disabled={loadingOrder}>
              {/* Create Order */}
              {loadingOrder ? "Creating Order..." : "Create Order"}
            </button>
          </>
        )}
      </form>

      {/* Progress Bar */}
      {loadingOrder && (
        <div className="loading-overlay">
          <CircularProgress disableShrink />
          <p>Creating your order, please wait...</p>
        </div>
      )}

      {/* Popup for Adding Customer */}
      {showPopup && (
        <div className="popup">
          <h2>Add New Customer</h2>
          <label>
            Name:
            <input
              type="text"
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
              placeholder="Enter Name"
            />
          </label>
          <label>
            Phone:
            <input
              type="text"
              value={newCustomerPhone}
              onChange={(e) => setNewCustomerPhone(e.target.value)}
              placeholder="Enter Phone"
            />
          </label>
          <div style={{ textAlign: "center" }}>
            <button onClick={handleAddCustomer}>Add Customer</button>
            <button className="cancel" onClick={() => setShowPopup(false)}>
              Cancel
            </button>
          </div>
          {message && (
            <p style={{ color: messageColor, textAlign: "center" }}>
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Photography;
