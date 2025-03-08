import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { PieChart, Pie, Tooltip, Legend, Cell } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A52A2A"];

const VendorCity = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
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

      const newOrders = data.data?.order || [];
      setOrders(newOrders);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const chartData = useMemo(() => {
    if (!Array.isArray(orders)) {
      return [];
    }

    const cities = ["Hyderabad", "Delhi", "Mumbai", "Bangalore"];
    let otherCount = 0;

    const cityCounts = orders.reduce((acc, order) => {
      const city = order?.order_locality || "Unknown";

      if (cities.includes(city)) {
        acc[city] = (acc[city] || 0) + 1;
      } else {
        otherCount += 1;
      }

      return acc;
    }, {});

    const chartDataArray = Object.entries(cityCounts).map(([city, count]) => ({
      name: city,
      value: count,
    }));

    if (otherCount > 0) {
      chartDataArray.push({ name: "Others", value: otherCount });
    }

    return chartDataArray;
  }, [orders]);

  const renderCustomLabel = ({ name, percent }) => {
    return `${name} (${(percent * 100).toFixed(1)}%)`;
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "40px auto",
        textAlign: "center",
        background: "#fff",
        padding: "20px",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
        borderRadius: "10px",
      }}
    >
      <h2 style={{ color: "#444", marginBottom: "10px" }}>Orders By Cities</h2>
      <div>
        {loading ? (
          <p>Loading orders...</p>
        ) : chartData.length > 0 ? (
          <PieChart width={500} height={300}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              label={renderCustomLabel}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        ) : (
          <p>No data available.</p>
        )}
      </div>
    </div>
  );
};

export default VendorCity;
