import React, { useState, useEffect } from "react";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import "./createorder.css";
import Image from "next/image";
import axios from "axios";
import { BASE_URL, GET_DECORATION_BY_NAME, CONFIRM_ORDER_ENDPOINT, SAVE_LOCATION_ENDPOINT } from "../../utils/apiconstant";

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
  const [totalamount, setTotalAmount] = useState("");
  const [advanceamount, setAdvanceAmount] = useState("");
  const [balanceamount, setBalanceAmount] = useState("");


  const [products, setProducts] = useState([{ name: '', price: '' }]);
  const [comment, setComment] = useState([{ name: '' }]);

  const handleInputChange = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  const addProduct = () => {
    setProducts([...products, { name: '', price: '' }]);
  };


  // Function to handle input change
  const handleInputChangeComment = (index, field, value) => {
    const updatedComments = [...comment];
    updatedComments[index][field] = value;
    setComment(updatedComments);
  };

  // Function to add a new comment input field
  const addProductComment = () => {
    setComment([...comment, { name: '' }]); // Add an empty comment
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
    // Pincode validation
    if (pincode) {
      if (pincodes.includes(pincode)) {
        setPincodeMessage("Pincode available");
      } else {
        setPincodeMessage("Pincode not available");
      }
    } else {
      setPincodeMessage("");
    }
  }, [dishName, isContinueClicked, isFetched, pincode]);

  const handleContinueClick = () => {
    setIsContinueClicked(true);
  };


  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
};



// const saveAddress = async () => {
//   try {
//     console.log("Inside saveAddress");
//     const url = BASE_URL + SAVE_LOCATION_ENDPOINT;
//     // Retrieve userID from localStorage
//     let userId = "63edb239d680d47d95870fa0";
//     console.log(userId, "userid63");
//     if (!userId) {
//       console.error('Error retrieving userID');
//       return;
//     }
//     const address2 = address + 560063;
//     const requestDataa = {
//       address1: address2,
//       address2: address2,
//       locality: city,
//       city: city,
//       userId: userId
//     };
//     console.log(address2, "address263");

//     const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2VkYjIzOWQ2ODBkNDdkOTU4NzBmYTAiLCJuYW1lIjoiQmhhcmF0IiwiZW1haWwiOiJiaGFyYXRneWFuY2hhbmRhbmkwMDFAZ21haWwuY29tIiwicGhvbmUiOiI4ODg0MjIxNDg3Iiwicm9sZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzI2MTI1NDkyLCJleHAiOjE3NTc2NjE0OTJ9.HuVjkLUBi0sCpH9p3uPzQKtnO2OR910g9MviBlLY0QY";
//     const response = await axios.post(url, requestDataa, {
//       headers: {
//         'Content-Type': 'application/json',
//         'authorization': token
//       },
//     });

//     if (response.status === API_SUCCESS_CODE) {
//       // Handle navigation in React (e.g., using React Router)
//       console.log("Address saved successfully");
//       return response.data.data._id
//     }
//   } catch (error) {
//     console.log('Error  Data:', error.message);
//   }
// };
 


//   const handleSubmit = async (e) => {
//     e.preventDefault();

//      // Create the decorationProduct array from the products state
//      const addOnProduct = products.map(product => ({
//       name: product.name,
//       price: product.price,
//   }));

//   console.log(addOnProduct, "addOnProduct");

//     // Create the comments array from the state
//     const decorationComments = comment.map(comment => comment.name);


//     const DP = JSON.stringify(addOnProduct) + decorationComments;

//      // Format the selected date
//      const formattedDate = date ? formatDate(date) : null;

//      const addressID =  saveAddress();

//      console.log(addressID, "addressIDFDS12");

//     const requestData = {
//       toId: "",
//       order_time: timeSlot.value,
//       no_of_people: 0,
//       type: 1,
//       fromId: "63edb239d680d47d95870fa0",
//       is_discount: "0",
//       addressId: addressID,
//       // addressId: `${address}, ${googleLocation}`,
//       order_date: formattedDate,
//       no_of_burner: 0,
//       order_locality: city,
//       total_amount: totalamount,
//       orderApplianceIds: [],
//       payable_amount: product.price,
//       is_gst: "0",
//       order_type: true,
//       items: [product._id],
//       decoration_comments: DP,
//       status: 0,
//   };
  

//     console.log(requestData, "requestData");

//     try {
//         const response = await axios.post(`${BASE_URL}${CONFIRM_ORDER_ENDPOINT}`, requestData);
//         console.log("Order created successfully:", response.data);
//         // Handle success (e.g., show a success message, reset form, etc.)
//     } catch (error) {
//         console.error("Error creating order:", error.message);
//         // Handle error (e.g., show an error message)
//     }
// };

const API_SUCCESS_CODE = 200; // Replace with actual success status code

const saveAddress = async () => {
  try {
    console.log("Inside saveAddress");
    const url = BASE_URL + SAVE_LOCATION_ENDPOINT;

    // Hardcoded userId for now; retrieve this from localStorage or another source
    let userId = "63edb239d680d47d95870fa0";
    console.log(userId, "userid63");

    if (!userId) {
      console.error('Error retrieving userID');
      return null; // Exit if no userId found
    }

    // Construct address information
    const address2 = address + pincode; 
    const requestDataa = {
      address1: address2,
      address2: googleLocation,
      locality: city,
      city: city,
      userId: userId
    };
    console.log(address2, "address263");

    // Using a hardcoded token; replace this with a dynamic token if needed
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2VkYjIzOWQ2ODBkNDdkOTU4NzBmYTAiLCJuYW1lIjoiQmhhcmF0IiwiZW1haWwiOiJiaGFyYXRneWFuY2hhbmRhbmkwMDFAZ21haWwuY29tIiwicGhvbmUiOiI4ODg0MjIxNDg3Iiwicm9sZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzI2MTI1NDkyLCJleHAiOjE3NTc2NjE0OTJ9.HuVjkLUBi0sCpH9p3uPzQKtnO2OR910g9MviBlLY0QY";

    const response = await axios.post(url, requestDataa, {
      headers: {
        'Content-Type': 'application/json',
        'authorization': token
      },
    });

    if (response.status === API_SUCCESS_CODE) {
      console.log("Address saved successfully");
      return response.data.data._id; // Return address ID if successful
    } else {
      console.error("Failed to save address", response.status);
      return null; // Handle failure in saving the address
    }
  } catch (error) {
    console.log('Error in saveAddress:', error.message);
    return null; // Return null in case of error
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();

  // Create the decorationProduct array from the products state
  const addOnProduct = products.map(product => ({
    name: product.name,
    price: product.price,
  }));

  console.log(addOnProduct, "addOnProduct");

  // Create the comments array from the state
  const decorationComments = comment.map(comment => comment.name);

  const DP = JSON.stringify(addOnProduct) + decorationComments;

  // Format the selected date
  const formattedDate = date ? formatDate(date) : null;

  try {
    // Await the result of saveAddress to ensure it completes before moving forward
    const addressID = await saveAddress();

    // Check if addressID is valid
    if (!addressID) {
      console.error("Address ID is missing");
      return; // Stop the function if addressID is missing
    }

    console.log(addressID, "addressIDFDS12");

    const requestData = {
      toId: "",
      order_time: timeSlot.value,
      no_of_people: 0,
      type: 1,
      fromId: "63edb239d680d47d95870fa0",
      is_discount: "0",
      addressId: addressID, 
      order_date: formattedDate,
      no_of_burner: 0,
      order_locality: city,
      total_amount: totalamount,
      orderApplianceIds: [],
      payable_amount: product.price,
      is_gst: "0",
      order_type: true,
      items: [product._id],
      decoration_comments: DP,
      status: 0,
    };

    console.log(requestData, "requestData");

    // Make the second API call to create the order
    const response = await axios.post(`${BASE_URL}${CONFIRM_ORDER_ENDPOINT}`, requestData);
    console.log("Order created successfully:", response.data);
    // Handle success (e.g., show a success message, reset form, etc.)
  } catch (error) {
    console.error("Error creating order:", error.message);
    // Handle error (e.g., show an error message)
  }
};


  const timeSlotOptions = [
    { value: "7:00 AM - 10:00 AM", label: "9:00 AM - 11:00 AM" },
    { value: "10:00 AM - 1:00 PM", label: "10:00 AM - 1:00 PM" },
    { value: "1:00 PM - 4:00 PM", label: "1:00 PM - 4:00 PM" },
    { value: "4:00 PM - 7:00 PM", label: "4:00 PM - 7:00 PM" },
    { value: "7:00 PM - 10:00 PM", label: "7:00 PM - 10:00 PM" },
  ];

  const pincodes = [    
    "560063",
  ];

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
                  Time Slot
                </label>
                <Select
                  options={timeSlotOptions}
                  value={timeSlot}
                  onChange={(selectedOption) => setTimeSlot(selectedOption)}
                  placeholder="Select Time Slot"
                />
              </div>
            </div>

            <label htmlFor="customerNumber">Customer Number</label>
            <input
              type="text"
              id="customerNumber"
              value={customerNumber}
              onChange={(e) => setCustomerNumber(e.target.value)}
              placeholder="Customer Number"
            />

            <label htmlFor="address">Address</label>
            <textarea
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
              style={{ width: "665px" }}
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
<div>
<form className="form_css">
      {products.map((product, index) => (
        <div key={index}>
          <input 
            type="text1" 
            placeholder="Name" 
            value={product.name} 
            onChange={(e) => handleInputChange(index, 'name', e.target.value)} 
          />
          <input 
            type="number1" 
            placeholder="Price" 
            value={product.price} 
            onChange={(e) => handleInputChange(index, 'price', e.target.value)} 
          />
        </div>
      ))}
      <button type="button" onClick={addProduct}>Add New</button>
    </form>
    </div>


    <label htmlFor="totalamount">Total Amount</label>
            <input
              type="text"
              id="totalamount"
              value={totalamount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="Total Amount"
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
              onChange={(e) => setBalanceAmount(e.target.value)}
              placeholder="Balance Amount"
            />
        
    
<div>
      <label htmlFor="comments">Comments</label>
      <form className="form_css">
        {comment.map((product, index) => (
          <div key={index}>
            <input
            style={{width: "100px"}}
              type="text"
              placeholder="Add Comment"
              value={product.name}
              onChange={(e) => handleInputChangeComment(index, 'name', e.target.value)}
            />
          </div>
        ))}
        <button type="button" onClick={addProductComment}>Comment</button>
      </form>
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
              required
            />
            <p>{pincodeMessage}</p>

            <button className="button1" type="submit">
              Create Order
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default AddOrder;
