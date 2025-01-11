import React from 'react'
import { useState, useEffect } from 'react'
import { timeSlotOptions } from "../../utils/timeSlots";
import { pincodes } from "../../utils/pincodes";
import Select from "react-select";
import "../../app/dashboard/decoration-createorder/createorder.css";
import axios from "axios";
import {
    BASE_URL,
    CONFIRM_ORDER_ENDPOINT,
    SAVE_LOCATION_ENDPOINT,
    API_SUCCESS_CODE,
} from "../../utils/apiconstant";
// import { json } from 'stream/consumers';


const CreateOrderForm = ({ calculateFinalTotal, numberOfPeople, selectedOption, selectedDishQuantities }) => {
    const [newCustomerName, setNewCustomerName] = useState("");
    const [newCustomerPhone, setNewCustomerPhone] = useState("");
    const [date, setDate] = useState("");
    const [customerNumber, setCustomerNumber] = useState("");
    const [address, setAddress] = useState("");
    const [googleLocation, setGoogleLocation] = useState("");
    const [timeSlot, setTimeSlot] = useState("");
    const [city, setCity] = useState("");
    const [pincode, setPincode] = useState("");
    const [isContinueClicked, setIsContinueClicked] = useState(false);
    const [pincodeMessage, setPincodeMessage] = useState("");
    const [pincodeMessageColor, setPincodeMessageColor] = useState("");
    const [totalamount, setTotalAmount] = useState("");
    const [advanceamount, setAdvanceAmount] = useState("");
    const [balanceamount, setBalanceAmount] = useState("");
    const [orderTakenBy, setOrderTakenBy] = useState("");
    const [comment, setComment] = useState("");
    const [showPopup, setShowPopup] = useState(false)
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageColor, setMessageColor] = useState("");
    const [customerId, setCustomerId] = useState(null);
    const [showButton, setShowButton] = useState(false);
    const [inclusion, setInclusion] = useState("");
    // const [includeTables, setIncludeTables] = useState(false);
    const [lloading, setlLoading] = useState(false);
    const [itemDataId, setItemDataId] = useState({ items: [] });
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
    useEffect(() => {
        console.log(calculateFinalTotal)
        const balance = priceDetails.finalTotal - priceDetails.advancePayment;
        setBalanceAmount(balance);
    }, [priceDetails.finalTotal, priceDetails.advancePayment]);
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
            console.log(JSON.stringify(response.data), "aarti");
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
            const requestDataa = {
                address1: address2,
                address2: googleLocation,
                locality: city,
                city: city,
                userId: customerId,
            };

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
    const handleComment = (e) => {
        const commentText = e.target.value;
        setComment(commentText);
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

        let type;

        if (selectedOption === "food-delivery") {
            type = 6;
        } else if (selectedOption === "live-catering") {
            type = 7;
        }

        const requestData = {
            add_on: inclusion,
            phone_no: customerNumber,
            toId: "",
            order_time: timeSlot.value,
            no_of_people: numberOfPeople,
            type: type,
            fromId: customerId,
            is_discount: "0",
            addressId: addressID,
            order_date: formattedDate,
            no_of_burner: true,
            order_locality: city,
            total_amount: priceDetails.finalTotal,
            orderApplianceIds: [],
            payable_amount: priceDetails.finalTotal,
            advance_amount: priceDetails.advancePayment,
            is_gst: "0",
            order_type: true,
            items: itemDataId,
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
        ${selectedDishQuantities.map((item) => item.name).join("\n -")}`;

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

            // const priceDetails = calculatePriceDetails();

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
        // aarti
        orderData += `
        *Final amount after discount: ₹${priceDetails.finalTotal.toFixed(
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
    return (<>

        <form onSubmit={handleSubmit}>
            <>
                <label htmlFor="customerNumber" style={style.label}>Customer Number*</label>
                <input
                    type="text"
                    id="customerNumber"
                    value={customerNumber}
                    onInput={(e) => setCustomerNumber(e.target.value.replace(/\D/g, ''))} // Remove non-digits as the user types
                    placeholder="Customer Number"
                    required
                    maxLength={10}  // Limit to 10 digits
                    pattern="\d{10}" // Enforce exactly 10 digits
                    inputMode="numeric" // Optimize for numeric input on mobile devices
                />
                <button onClick={handleCheckCustomer}  className='orderCheck-btn'disabled={loading || customerNumber.length !== 10}>
                    {loading ? "Checking..." : "Check Customer"}
                </button>
                {loading && <p>Loading...</p>} {/* Loader */}
                {<p style={{ color: messageColor }}>{message}</p>}

                {message === "Customer exists." ?

                    (<div className='orderDeatils'>
                        <label htmlFor="orderTakenBy" style={style.label}>Order Taken By*</label>
                        <input
                            type="text"
                            id="orderTakenBy"
                            value={orderTakenBy}
                            onChange={(e) => setOrderTakenBy(e.target.value)}
                            placeholder="Order Taken By"
                            required
                        />

                        <div className="date-time-container" style={style.dateTimeContainer}>
                            <div style={style.dateTimeField}>
                                <label htmlFor="date" style={style.label}>Date *</label>
                                <input
                                    type="date"
                                    id="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                    style={style.input}
                                />
                            </div>

                            <div style={style.dateTimeField}>
                                <label htmlFor="timeSlot" style={style.label}>Time Slot*</label>
                                <Select
                                    options={timeSlotOptions}
                                    value={timeSlot}
                                    onChange={(selectedOption) => setTimeSlot(selectedOption)}
                                    placeholder="Select Time Slot"
                                    required
                                />
                            </div>
                        </div>



                        <label htmlFor="address" style={style.label}>Address*</label>
                        <textarea
                            type="text"
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Address"
                            style={style.textArea}
                            required
                        />

                        <label htmlFor="googleLocation" style={style.label}>Google Location</label>
                        <textarea
                            type="text"
                            id="googleLocation"
                            value={googleLocation}
                            onChange={(e) => setGoogleLocation(e.target.value)}
                            placeholder="googleLocation"
                            style={style.textArea}
                        />

                        <label htmlFor="totalamount" style={style.label}>Total Amount*</label>
                        <input
                            type="text"
                            id="totalamount"
                            value={priceDetails.finalTotal}
                            onChange={(e) => setTotalAmount(e.target.value)}
                            placeholder="Total Amount"
                            required
                        />

                        <label htmlFor="advanceamount" style={style.label}>Advance Amount</label>
                        <input
                            type="text"
                            id="advanceamount"
                            value={priceDetails.advancePayment}
                            onChange={(e) => setAdvanceAmount(e.target.value)}
                            placeholder="Advance Amount"
                        />

                        <label htmlFor="balanceamount" style={style.label}>Balance Amount</label>
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
                            <label htmlFor="city" style={style.label}>City *</label>
                            <select
                                id="city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                                style={style.citySelect}
                            >
                                <option value="" style={{ color: "#aaa" }}>Select City</option>
                                <option value="Bangalore">Bangalore</option>
                                <option value="Delhi">Delhi</option>
                                <option value="Mumbai">Mumbai</option>
                                <option value="Hyderabad">Hyderabad</option>
                            </select>
                        </div>

                        <label htmlFor="pincode" style={style.label}>Pincode *</label>
                        <input
                            type="text"
                            id="pincode"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                        />
                        <p style={style.pincodeMessage}>
                            {pincodeMessage}
                        </p>

                       


                        <button className="orderCheck-btn" type="submit" >
                            {lloading ? "Creating Order..." : "Create Order"}
                        </button>
                    </div>
                    ) :
                    (<> {lloading && <div className="loader">Loading...</div>}
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
                                        onInput={(e) => setNewCustomerPhone(e.target.value.replace(/\D/g, ''))} // Remove non-digits as the user types
                                        placeholder="Customer Number"
                                        required
                                        maxLength={10}  // Limit to 10 digits
                                        pattern="\d{10}" // Enforce exactly 10 digits
                                        inputMode="numeric" // Optimize for numeric input on mobile devices
                                    />
                                </label>
                                <br />
                                <button onClick={handleAddCustomer}>Add Customer</button>
                                <button onClick={() => setShowPopup(false)}>Cancel</button>
                            </div>
                        )}
                    </>)
                }
            </>
        </form>
       { message === "Customer exists." && <button onClick={copyOrderSummary} style={style.buttonPrimary}>
                            Copy Order Summary
                        </button>
                        }

    </>)
}
const style = {

    // form csss
    dateTimeContainer: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        margin: "10px 0",
    },
    dateTimeField: {
        flex: 1,
    },
    input: {
        width: "90%",
        padding: "10px",
        fontSize: "16px",
    },
    label: {
        fontWeight: "bold",
        marginBottom: "5px",
        display: "block",
    },
    textArea: {
        width: "665px",
    },
    citySelect: {
        width: "103%",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "16px",
        transition: "border-color 0.3s",
    },
    buttonPrimary: {
        padding: "10px 20px",
        backgroundColor: "#9252AA",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginTop:"10px",
        width:"100%"
    },
    buttonSecondary: {
        padding: "10px 20px",
        backgroundColor: "#9252AA",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    pincodeMessage: {
        fontWeight: "bold",
        fontSize: "15px",
    },





}

export default CreateOrderForm