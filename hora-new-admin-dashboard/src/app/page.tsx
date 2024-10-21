"use client";
import React from 'react';
import { HashRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Dashboard from '../pages/dashboard/index';
import CreateOrder from '../pages/decoration-createorder/index';
import OrderDetails from '../pages/orderDetails/index';
import './globals.css';
import { FaTachometerAlt, FaPlusCircle } from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <ul>
        <li>
          <button onClick={() => navigate('/dashboard')}>
            <FaTachometerAlt style={{ marginRight: '8px' }} /> Dashboard
          </button>
        </li>
        <li>
          <button onClick={() => navigate('/dashboard/decoration-create-order')}>
            <FaPlusCircle style={{ marginRight: '8px' }} /> Decoration Create Order
          </button>
        </li>
        <li>
          <button onClick={() => navigate('/dashboard/orderdetails')}>
            <FaTachometerAlt style={{ marginRight: '8px' }} /> Order Details
          </button>
        </li>
      </ul>
    </div>
  );
};

const Page = () => {
  return (
    <Router>
      <div >
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/decoration-create-order" element={<CreateOrder />} />
            <Route path="/dashboard/orderdetails" element={<OrderDetails />} />
            <Route path="*" element={<Dashboard />} /> {/* Default route */}
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default Page;
