"use client";

// const Dashboard = () => {
//     return (
//       <div>
//        <h1 className="dashborad pageHeading">Welcome to Hora Dashboard Page</h1>
//       </div>
//     );
//   };
  
//   export default Dashboard;

import React, { useEffect, useState } from "react";
import { FaUsers, FaTruck, FaUtensils, FaCity, FaShoppingCart } from "react-icons/fa";
import axios from "axios";
import { Card, CardContent, CardMedia, Typography, Grid } from "@mui/material";

const DashboardStats = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => { 
  
    axios
      .get("https://horaservices.com:3000/api/admin/getDashboardCount")
      .then((response) => {
        if (!response.data.error) {
          setStats(response.data.data);
        }
      })
      .catch((error) => console.error("Error fetching dashboard stats:", error));
  }, []);

  const statsData = [
    { label: "Customers", value: stats?.total_customer, icon: <FaUsers /> },
    { label: "Suppliers", value: stats?.total_supplier, icon: <FaTruck /> },
    { label: "Cuisines", value: stats?.total_cousine, icon: <FaUtensils /> },
    { label: "Cities", value: stats?.total_city, icon: <FaCity /> },
    { label: "Orders", value: stats?.total_order, icon: <FaShoppingCart /> },
  ];

  return (
    <Grid container spacing={3} justifyContent="center" sx={{ p: 4 }}>
      {stats ? (
        statsData.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ display: "flex", alignItems: "center", p: 3, boxShadow: 5, borderRadius: 4, bgcolor: "#f5f5f5" }}>
              <CardMedia sx={{ fontSize: 50, color: "#1976D2", mr: 3 }}>{item.icon}</CardMedia>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" color="textSecondary">{item.label}</Typography>
                <Typography variant="h4" color="primary" fontWeight="bold">{item.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))
      ) : (
        <Typography align="center" width="100%" variant="h6">Loading...</Typography>
      )}
    </Grid>
  );
};

export default DashboardStats;
