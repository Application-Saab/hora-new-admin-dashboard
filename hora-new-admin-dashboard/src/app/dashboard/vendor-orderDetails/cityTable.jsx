import { useState, useEffect } from "react";
import axios from "axios";

const VendorCityTable = () => {
  const [allOrders, setAllOrders] = useState([]); // Store all orders
  const [orders, setOrders] = useState([]); // Store filtered orders
//   const [loading, setLoading] = useState(false);
  const [filteringOrders, setFilteringOrders] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showTable, setShowTable] = useState(false); // Hide table initially

  useEffect(() => {
    const fetchAllOrders = async () => {
     
      try {
        const { data } = await axios.post(
          "https://horaservices.com:3000/api/admin/adminOrderList",
          {
            page: 1,
            per_page: 1000,
            order_status: 0,
            status: 0,
            type: "",
            order_locality: "",
          }
        );

        setAllOrders(data.data?.order || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
   
    };

    fetchAllOrders();
  }, []);

  const filterOrders = () => {
    setFilteringOrders(true);
    if (!startDate || !endDate) {
      setOrders(allOrders);
    } else {
      const filtered = allOrders.filter((order) => {
        const orderDate = new Date(order.order_date);
        return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
      });
      setOrders(filtered);
    }

    setShowTable(true); // Show table after first submit
    setFilteringOrders(false);
  };

  const ratingRanges = ["0-6", "6-8", "9-10", "No Rating"];
  const cities = ["Hyderabad", "Delhi", "Mumbai", "Bangalore"];

  const cityRatings = {
    Hyderabad: { "0-6": 0, "6-8": 0, "9-10": 0, "No Rating": 0 },
    Delhi: { "0-6": 0, "6-8": 0, "9-10": 0, "No Rating": 0 },
    Mumbai: { "0-6": 0, "6-8": 0, "9-10": 0, "No Rating": 0 },
    Bangalore: { "0-6": 0, "6-8": 0, "9-10": 0, "No Rating": 0 },
    "Unknown City": { "0-6": 0, "6-8": 0, "9-10": 0, "No Rating": 0 },
  };

  orders.forEach((order) => {
    let city = order?.order_locality?.trim() || "Unknown City";
    if (city.toLowerCase() === "hyderbad") city = "Hyderabad";
    if (!cities.includes(city)) city = "Unknown City";

    const ratingArray = order?.userReviewRatingArray || [];
    if (ratingArray.length === 0) {
      cityRatings[city]["No Rating"] += 1;
    } else {
      const rating = ratingArray[0];
      if (rating === "0-6") cityRatings[city]["0-6"] += 1;
      else if (rating === "6-8") cityRatings[city]["6-8"] += 1;
      else if (rating === "9-10") cityRatings[city]["9-10"] += 1;
    }
  });

  return (
    <div style={{ maxWidth: "500px", margin: "0 0 40px 0", textAlign: "center", background: "#fff", padding: "20px", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)", borderRadius: "10px" }}>
      <h2 style={{ textAlign: "center", fontSize: "32px", fontWeight: "bold", marginBottom: "20px", color: "#333", textShadow: "2px 2px 8px rgba(0,0,0,0.2)" }}>Cities Ratings</h2>

      {/* Date Filters */}
      {/* <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "20px" }}>
        <div>
          <label style={{ fontWeight: "bold" }}>Start Date:</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: "8px", marginLeft: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />
        </div>
        <div>
          <label style={{ fontWeight: "bold" }}>End Date:</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: "8px", marginLeft: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />
        </div>
        <button onClick={filterOrders} style={{ padding: "8px 16px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>Submit</button>
      </div> */}

      <div className="flex space-x-4">
        <div className="w-full">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            id="startDate"
            className="p-2 border rounded-md w-full mb-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="w-full">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            id="endDate"
            className="p-2 border rounded-md w-full mb-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        {/* <button onClick={filterOrders} style={{ padding: "8px 16px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>Submit</button> */}
      </div>

      <button onClick={filterOrders} style={{
        padding: "8px 16px", background:
          "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer"
      }}>Submit</button>
      {filteringOrders ? (
        <p style={{ textAlign: "center", fontSize: "18px", color: "#666" }}>Loading orders...</p>
      ) : showTable ? ( 
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd", borderRadius: "10px", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)", backdropFilter: "blur(10px)", background: "rgba(255, 255, 255, 0.7)" }}>
            <thead>
              <tr style={{ background: "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)", color: "#fff" }}>
                <th style={{ padding: "12px", fontSize: "18px" }}>City</th>
                {ratingRanges.map((range) => (
                  <th key={range} style={{ padding: "12px", fontSize: "18px", textAlign: "center" }}>{range}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(cityRatings).map(([city, ratings]) => (
                <tr key={city} style={{ backgroundColor: "#fff", transition: "background 0.3s ease-in-out", borderBottom: "1px solid #ddd" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f8ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
                >
                  <td style={{ padding: "12px", fontSize: "18px", color: "#444" }}>{city}</td>
                  {ratingRanges.map((range) => (
                    <td key={range} style={{ padding: "12px", fontSize: "18px", textAlign: "center", color: "#222" }}>{ratings[range]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null} {/* Hide table initially */}
    </div>
  );
};

export default VendorCityTable;