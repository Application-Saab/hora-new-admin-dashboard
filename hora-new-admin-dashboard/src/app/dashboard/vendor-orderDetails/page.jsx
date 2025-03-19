"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL, ADMIN_ORDER_LIST, ADMIN_USER_LIST } from "../../../utils/apiconstant";
// import CityChart from "./city";
import TableRating from "./tablerating";
import CityTable from "./citytable";
import "./vendorOrderDetail.css";
const CheckVendorOrders = () => {
    const [number, setNumber] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [matchingOrders, setMatchingOrders] = useState([]);
    const [ratingFilter, setRatingFilter] = useState("");
    const [supplierId, setSupplierId] = useState("");
    const [allOrders, setAllOrders] = useState([]);
    // pagination
    const [totalOrders, setTotalOrders] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    // const [totalPage, setTotalPage] = useState(0);
    const itemsPerPage = 10;
    // block avtive supplier
    const [status, setStatus] = useState(null);
    const [userStatus, setUserStatus] = useState(status); // Local state for status
    const fetchOrdersByRating = async (supplierId, ratingFilter) => {

        if (!supplierId) return;

        try {
            const response = await fetch(BASE_URL + ADMIN_ORDER_LIST, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    order_status: 0,
                    per_page: 1000,
                    status: 0,
                    toId: supplierId,
                    userReviewRatingArray: ratingFilter ? [ratingFilter] : undefined,
                }),
            });

            if (!response.ok) throw new Error("Failed to fetch orders");
            if (response.status === 200) {
                const { data } = await response.json();
                setMatchingOrders(data?.order);


                // setTotalPage(totalPages);
            }
            else {
                setMatchingOrders([]);
                // setTotalPage('');
                console.warn("No orders found");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };
    useEffect(() => {


        fetchOrdersByRating(supplierId, ratingFilter); // Fetch for new page

    }, [supplierId, ratingFilter]);


    const handleCheckSupplier = async (e) => {
        e.preventDefault();
        const trimmedNumber = number.trim();
        if (!trimmedNumber) return;
        setRatingFilter('');
        setLoading(true);
        setResult(null);
        setMatchingOrders([]);
        setCurrentPage(1); // Reset to first page
        setAllOrders([]);
        try {
            const response = await axios.post(BASE_URL + ADMIN_USER_LIST, {
                per_page: 4000,
                role: "supplier",
            });

            if (!response?.data?.data?.users) throw new Error("Invalid response data");

            const supplier = response.data.data.users.find(
                (user) => user.phone?.trim() === trimmedNumber
            );

            if (supplier) {

                await fetchOrdersByRating(supplier._id);
                fetchAllOrders(supplier._id);
                setSupplierId(supplier._id);
                setStatus(supplier.status);
                setResult(supplier._id);
            } else {
                setResult("Number not present.");
                setSupplierId('');
            }
        } catch (err) {
            console.error("Error checking the number:", err);
            setResult("Error checking the number.");
        } finally {
            setLoading(false);
        }
    };

    const getOrderId = (e) => {
        const orderId1 = 10800 + e;
        const updateOrderId = "#" + orderId1;
        return updateOrderId;
    };

    const totalBalanceAmount = (allOrders || []).reduce(
        (acc, order) => acc + (parseFloat(order.balance_amount) || 0),
        0
    );
    const fetchAllOrders = async (supplierId) => {

        if (!supplierId) return;

        try {
            const response = await fetch(BASE_URL + ADMIN_ORDER_LIST, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    order_status: 0,
                    per_page: 1000,
                    status: 0,
                    toId: supplierId,
                }),
            });

            if (!response.ok) throw new Error("Failed to fetch orders");
            if (response.status === 200) {
                const { data } = await response.json();
                setAllOrders(data?.order);
                setTotalOrders(data?.paginate?.total_item);
            }
            else {
                setAllOrders([]);
                // setTotalPage('');
                console.warn("No orders found");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    const ratingSummary = {
        "9-10": { count: 0, total: 0 },
        "6-8": { count: 0, total: 0 },
        "0-6": { count: 0, total: 0 },
        "No Rating": { count: 0, total: 0 }
    };
    allOrders?.forEach(order => {
        let rating = order.userReviewRatingArray.length > 0 ? order.userReviewRatingArray[0] : 0;
        if (rating === "9-10") {
            ratingSummary["9-10"].count += 1;
            ratingSummary["9-10"].total += (parseFloat(order.balance_amount));
        } else if (rating === "6-8") {
            ratingSummary["6-8"].count += 1;
            ratingSummary["6-8"].total += (parseFloat(order.balance_amount));
        } else if (rating === "0-6") {
            ratingSummary["0-6"].count += 1;
            ratingSummary["0-6"].total += (parseFloat(order.balance_amount));
        } else {
            ratingSummary["No Rating"].count += 1; // New category for missing ratings
            ratingSummary["No Rating"].total += parseFloat(order.balance_amount) || 0;
        }
    });
    const totalCount =
        ratingSummary["9-10"].count +
        ratingSummary["6-8"].count +
        ratingSummary["0-6"].count +
        ratingSummary["No Rating"].count;

    // calculate the NPS
    const nps =
        (ratingSummary["9-10"].count - ratingSummary["0-6"].count) / totalCount;

    // pagination logic
    let totalPage = Math.ceil(matchingOrders?.length / itemsPerPage);
    const displayedOrders = (matchingOrders || []).slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    // block or avtive supplier
    const ButtonToActive_InActive = async (result, newStatus) => {
        console.log(newStatus, "Updating status for", result);

        try {
            const response = await fetch(
                "https://horaservices.com:3000/api/admin/update_user_status",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ _id: result, status: newStatus }),
                }
            );

            if (response.ok) {
                setUserStatus(newStatus); // Update status in state instead of reloading
                alert(newStatus === 1 ? "Activated Successfully" : "Deactivated Successfully");
            } else {
                console.error("Failed to update user status.");
            }
        } catch (error) {
            console.error("Error updating user status:", error);
        }
    };
    return (
        <>
            <h2 className="title">Vendor Details</h2>
            <div className="container">
                {/* Left side content (50% width) */}
                <div className="leftContent">
                    <h2 className="title">List of Vendor Orders</h2>

                    <div className="inputContainer">
                        <input
                            type="number"
                            placeholder="Enter a number"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            required
                            maxLength={10}
                            pattern="\d{10}"
                            inputMode="numeric"
                            className="inputField"
                        />
                        <button onClick={handleCheckSupplier} disabled={loading} className="checkButton">
                            {loading ? "Checking..." : "Check"}
                        </button>
                        {status !== null && (
                            <button
                                className={`status-button ${userStatus === 0 ? "inactive" : "active"}`}
                                onClick={() => ButtonToActive_InActive(result, userStatus === 1 ? 0 : 1)}
                                style={{
                                    backgroundColor: userStatus === 1 ? "green" : "red",
                                    color: "white",
                                    border: "none",
                                    padding: "10px 20px",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    marginLeft: "10px",
                                }}
                            >
                                {userStatus === 1 ? "Active" : "Inactive"}
                            </button>
                        )}

                    </div>

                    {result && (<div
                        style={{
                            textAlign: "center",
                            backgroundColor: result.includes("present") ? "#f8d7da" : "#d4edda",
                            color: result.includes("present") ? "#155724" : "#721c24",
                        }}>
                        <p className="resultMessage"> Supplier ID : {result}</p>
                        <h3>Net Promoter Score (NPS): {nps}</h3>
                    </div>)}



                    {result && (<>
                        <div>
                            <div className="orderSummary">
                                <span>📦 Total Orders: {totalOrders}</span>
                                <span>💰 Total Orders Value: ₹{totalBalanceAmount}</span>
                            </div>

                            <div className="orderSummarTableContainer">

                                <h2>📊 Order Summary</h2>
                                <table className="orderSummaryTable">
                                    <thead className="tableHeader">
                                        <tr>
                                            <th className="tableCell">Rating</th>
                                            <th className="tableCell">Order Count</th>
                                            <th className="tableCell">Total Value (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(ratingSummary).map(([key, value], index) => (
                                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff" }}>
                                                <td className="tableCell">{key}</td>
                                                <td className="tableCell">{value.count}</td>
                                                <td className="tableCell">₹{value.total}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                            </div>

                            <h3 style={{ textAlign: "center", fontSize: "18px", color: "#333" }}>Suppliers Orders</h3>
                            <table className="supplierTable">
                                <thead className="tableHeader">
                                    <tr>
                                        <th className="tableCell">Order ID</th>
                                        <th className="tableCell">Fulfillment Date</th>
                                        <th className="tableCell">
                                            Order Rating
                                            <select onChange={(e) => setRatingFilter(e.target.value)} value={ratingFilter} style={{ color: 'black' }}>
                                                <option value="">All</option>
                                                <option value="9-10">9-10</option>
                                                <option value="6-8">6-8</option>
                                                <option value="0-6">0-6</option>
                                            </select>
                                        </th>
                                        <th className="tableCell">Order Create</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedOrders.length > 0 ? (
                                        displayedOrders.map((order, index) => (
                                            <tr key={index}>
                                                <td className="tableCell">{order.order_id}</td>
                                                <td className="tableCell">{new Date(order.order_date).toLocaleDateString("en-GB")}</td>
                                                <td className="tableCell">{order.userReviewRatingArray?.[0] || "N/A"}</td>
                                                <td className="tableCell">{new Date(order.createdAt).toLocaleDateString("en-GB")}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: "center" }} className="tableCell">No orders found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* pagination */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                marginTop: "20px",
                            }}
                        >
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                {"<"}
                            </button>
                            <span style={{ margin: "0 10px" }}>
                                Page {currentPage} of {totalPage}
                            </span>
                            <button
                                onClick={() =>
                                    setCurrentPage((prev) => Math.min(prev + 1, totalPage))
                                }
                                disabled={currentPage === totalPage}
                            >
                                {">"}
                            </button>
                        </div>

                    </>)}
                </div>

                {/* Right side content */}
                <div className="rightContent">
                    <CityTable />
                    <TableRating />
                </div>
            </div >
        </>
    );
};

export default CheckVendorOrders;

