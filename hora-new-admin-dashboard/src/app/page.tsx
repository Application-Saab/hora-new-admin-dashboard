// "use client";
// import React, { useState, useEffect } from 'react';
// import Dashboard from '../pages/Dashboard/index'; 
// import CreateOrder from '../pages/CreateOrder/index';
// import './globals.css';
// import { FaTachometerAlt, FaPlusCircle } from 'react-icons/fa';

// const Sidebar = ({ setActivePage }) => {
//   return (
//     <div className="sidebar">
//       <ul>
//         <li>
//           <button onClick={() => setActivePage('dashboard')}>
//             <FaTachometerAlt style={{ marginRight: '8px' }} /> Dashboard
//           </button>
//         </li>
//         <li>
//           <button onClick={() => setActivePage('createOrder')}>
//             <FaPlusCircle style={{ marginRight: '8px' }} /> Create Order
//           </button>
//         </li>
//       </ul>
//     </div>
//   );
// };

// const Page = () => {
//   const [activePage, setActivePage] = useState('dashboard');

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const page = params.get('page') || 'dashboard'; 
//     setActivePage(page);
//   }, []);

//   useEffect(() => {
//     if (activePage) {
//       const newUrl = activePage === 'createOrder' ? '/dashboard/createorder' : `/${activePage}`;
//       window.history.pushState(null, '', newUrl); 
//     }
//   }, [activePage]);

//   const renderComponent = () => {
//     if (activePage === 'createOrder') {
//       return <CreateOrder />;
//     }
//     return <Dashboard />;
//   };

//   return (
//     <div style={{ display: 'flex' }}>
//       <Sidebar setActivePage={setActivePage} /> 
//       <div className="main-content">
//         {renderComponent()}
//       </div>
//     </div>
//   );
// };

// export default Page;



"use client";
import React from 'react';
import { HashRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Dashboard from '../pages/dashboard/index';
import CreateOrder from '../pages/createorder/index';
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
          <button onClick={() => navigate('/dashboard/createorder')}>
            <FaPlusCircle style={{ marginRight: '8px' }} /> Create Order
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
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/createorder" element={<CreateOrder />} />
            <Route path="/dashboard/orderdetails" element={<OrderDetails />} />
            <Route path="*" element={<Dashboard />} /> {/* Default route */}
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default Page;
