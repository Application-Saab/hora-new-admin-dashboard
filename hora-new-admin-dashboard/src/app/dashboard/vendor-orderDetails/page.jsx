"use client";
import React, { useState ,useEffect} from "react";
import axios from "axios";
import { BASE_URL, ADMIN_ORDER_LIST, ADMIN_USER_LIST } from "../../../utils/apiconstant";

const CheckVendorOrders = () => {
    const [number, setNumber] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [matchingOrders, setMatchingOrders] = useState([]);
    const [ratingFilter, setRatingFilter] = useState("");
    const [supplierId, setSupplierId] = useState("");
    // pagination
    const [totalOrders, setTotalOrders] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const itemsPerPage = 10;
    const fetchOrdersBySupplierId = async (supplierId, page = 1 ,ratingFilter = '') => {
        if (!supplierId) return;
        try {
            const response = await fetch(BASE_URL + ADMIN_ORDER_LIST, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    order_status: 0,
                    page: page, // Use dynamic page
                    per_page: itemsPerPage,
                    status: 0,
                    toId: supplierId,
                    userReviewRatingArray: ratingFilter ? [ratingFilter] : undefined,
                }),
            });
    
            if (!response.ok) throw new Error("Failed to fetch orders");
            if (response.status === 200) {
            const { data } = await response.json();
            setMatchingOrders(data?.order);
            setTotalOrders(data?.paginate?.total_item);
            let totalPages = Math.ceil(data?.paginate?.total_item / itemsPerPage);
            setTotalPage(totalPages);}
            else{
            setMatchingOrders([]);
            setTotalPage('');
            console.warn("No orders found");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };
    useEffect(() => {
          
        fetchOrdersBySupplierId(supplierId, currentPage,ratingFilter); // Fetch for new page
        // if (result && result.includes("Supplier ID:")) {
        //     fetchOrdersBySupplierId(supplierId, currentPage,ratingFilter); // Fetch for new page
        // }
    }, [currentPage, ratingFilter]);
    
    
    const handleCheckSupplier = async (e) => {
        e.preventDefault();
        const trimmedNumber = number.trim();
        if (!trimmedNumber) return;
    
        setLoading(true);
        setResult(null);
        setMatchingOrders([]);
        setCurrentPage(1); // Reset to first page
    
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
                await fetchOrdersBySupplierId(supplier._id, 1);
                setSupplierId(supplier._id);
                setResult(`Supplier ID: ${supplier._id}`);
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

    const totalBalanceAmount = matchingOrders.reduce((acc, order) => acc + (parseFloat(order.balance_amount) || 0), 0);

    // const filteredOrders = matchingOrders.filter(order => {
    //     const rating = order.userReviewRatingArray?.[0] || "";
    //     if (ratingFilter === "9-10") return rating === "9-10";
    //     if (ratingFilter === "6-8") return rating === "6-8";
    //     if (ratingFilter === "0-6") return rating === "0-6";
    //     return true;
    // });

    const ratingSummary = {
        "9-10": { count: 0, total: 0 },
        "6-8": { count: 0, total: 0 },
        "0-6": { count: 0, total: 0 }
    };

    // filteredOrders.forEach(order => {
    //     const rawRating = order.userReviewRatingArray?.[0];
    //     const amount = Number(order.balance_amount) || 0;

    //     if (!rawRating || !["9-10", "6-8", "0-6"].includes(rawRating)) {
    //         console.warn("Invalid rating found, skipping order:", order);
    //         return; // Ignore orders with invalid ratings
    //     }

    //     ratingSummary[rawRating].count++;
    //     ratingSummary[rawRating].total += amount;
    // });

    return (
        <div style={{ padding: "20px", maxWidth: "600px", margin: "auto", fontFamily: "Arial, sans-serif" }}>
            <h2 style={{ textAlign: "center", fontSize: "24px", fontWeight: "bold", textTransform: "uppercase" }}>List of Vendor Orders</h2>
            <div style={{ display: "flex", alignItems: "center", width: "65px", marginLeft: "143px" }}>

                <input type="number" placeholder="Enter a number" value={number}
                    onChange={(e) => setNumber(e.target.value)}

                    required
                    maxLength={10}
                    pattern="\d{10}"
                    inputMode="numeric"
                    style={{ flex: 1, padding: "12px", borderRadius: "5px", border: "1px solid #ccc", }} />
                <button onClick={handleCheckSupplier} disabled={loading}
                    style={{
                        padding: "10px 20px",
                        background: "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)",
                        color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer",
                        fontSize: "16px", fontWeight: "bold", marginLeft: "10px", whiteSpace: "nowrap"
                    }}>
                    {loading ? "Checking..." : "Check"}
                </button>

            </div>


            {result && (
                <p style={{ marginTop: "20px", padding: "10px", backgroundColor: result.includes("present") ? "#f8d7da" : "#d4edda", color: result.includes("present") ? "#155724" : "#721c24", borderRadius: "5px" }}>{result}</p>
            )}

            {matchingOrders.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)", color: "white", padding: "10px", borderRadius: "8px", fontSize: "18px", fontWeight: "bold", maxWidth: "900px", margin: "20px auto", boxShadow: "0 4px 8px rgba(0,0,0,0.1)", }}>
                        <span className="aarti">📦 Total Orders: {totalOrders}</span>
                        <span>💰 Total Orders Value: ₹{totalBalanceAmount.toFixed(2)}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "center", padding: "20px", fontFamily: "Arial, sans-serif" }}>
                        <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)", maxWidth: "1000px", width: "100%", textAlign: "center", }}>
                            <h2 style={{ marginBottom: "20px", fontSize: "28px", fontWeight: "bold", color: "#333" }}>
                                📊 Order Summary
                            </h2>

                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)", color: "white", fontSize: "18px" }}>
                                        <th style={{ padding: "12px", border: "1px solid #ddd" }}>Rating</th>
                                        <th style={{ padding: "12px", border: "1px solid #ddd" }}>Order Count</th>
                                        <th style={{ padding: "12px", border: "1px solid #ddd" }}>Total Value (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ backgroundColor: "#f2f2f2" }}>
                                        <td style={{ padding: "12px", border: "1px solid #ddd" }}>⭐ 9-10 Rated Orders</td>
                                        <td style={{ padding: "12px", border: "1px solid #ddd" }}>{ratingSummary["9-10"].count}</td>
                                        <td style={{ padding: "12px", border: "1px solid #ddd" }}>₹{ratingSummary["9-10"].total}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "12px", border: "1px solid #ddd" }}>🌟 6-8 Rated Orders</td>
                                        <td style={{ padding: "12px", border: "1px solid #ddd" }}>{ratingSummary["6-8"].count}</td>
                                        <td style={{ padding: "12px", border: "1px solid #ddd" }}>₹{ratingSummary["6-8"].total}</td>
                                    </tr>
                                    <tr style={{ backgroundColor: "#f2f2f2" }}>
                                        <td style={{ padding: "12px", border: "1px solid #ddd" }}>⚠️ 0-6 Rated Orders</td>
                                        <td style={{ padding: "12px", border: "1px solid #ddd" }}>{ratingSummary["0-6"].count}</td>
                                        <td style={{ padding: "12px", border: "1px solid #ddd" }}>₹{ratingSummary["0-6"].total}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <h3 style={{ textAlign: "center", fontSize: "18px", color: "#333" }}>Suppliers Orders</h3>
                    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px", fontSize: "14px", textAlign: "left" }}>
                        <thead>
                            <tr style={{ background: "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)", color: "#fff" }}>
                                <th style={{ padding: "10px", border: "1px solid #ccc" }}>Order ID</th>
                                <th style={{ padding: "10px", border: "1px solid #ccc" }}>Fulfillment Date</th>
                                <th style={{ padding: "10px", border: "1px solid #ccc" }}>Order Rating
                                    <select
                                     onChange={(e) => setRatingFilter(e.target.value)} value={ratingFilter}
                                      style={{ marginLeft: "10px", borderRadius: "5px", fontSize: "12px" }}>
                                        <option value="" selected>All</option>
                                        <option value="9-10">9-10</option>
                                        <option value="6-8">6-8</option>
                                        <option value="0-6">0-6</option>
                                    </select>
                                </th>

                                <th style={{ padding: "10px", border: "1px solid #ccc" }}>Order Create</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matchingOrders.map((order, index) => (
                                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff" }}>
                                    <td style={{ padding: "10px", border: "1px solid #ccc" }}>{getOrderId(order.order_id)}</td>
                                    <td style={{ padding: "10px", border: "1px solid #ccc" }}>{new Date(order.order_date).toLocaleDateString("en-GB")}</td>
                                    <td style={{ padding: "10px", border: "1px solid #ccc" }}>{order.userReviewRatingArray?.[0] || "N/A"}</td>
                                    <td style={{ padding: "10px", border: "1px solid #ccc" }}>{new Date(order.createdAt).toLocaleDateString("en-GB")}</td>
                                </tr>
                            ))}
                            
                        </tbody>

                    </table>
                    {/* pagination */}
                    <div className="orderDetails_pagination" style={style.orderDetails_pagination}>
                                <button
                                    onClick={() => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))}
                                    disabled={currentPage === 1} // Disable Previous button on first page
                                >
                                    {"<"}
                                </button>
                                <span> Page {currentPage} of {totalPage} </span>
                                <button
                                    onClick={() => setCurrentPage((prevPage) => prevPage + 1)}
                                    disabled={currentPage === totalPage} // Disable Next button on last page
                                >
                                    {">"}
                                </button>
                            </div>
                </div>
            )}
        </div>
    );
};
const style = {
    orderDetails_pagination: {
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        padding: '8px'
    }
}
export default CheckVendorOrders;

