"use client";
import React, { useState, useEffect } from 'react';
import './OrderDashboard.css';

const OrderDashboard = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allOrders, setAllOrders] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Set default dates to current month
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  // First API call to get _id from phone number
  const getUserIdFromPhone = async (phone) => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/admin_user_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
         body: JSON.stringify({
          phone: phone,
          per_page: 1,
          role: "supplier"
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Handle array format response
      if (result && result.data && result.data.users && result.data.users.length > 0) {
        return result.data.users[0]._id;
      } else {
        throw new Error('User not found');
      }
    } catch (err) {
      throw new Error(`Failed to get user ID: ${err.message}`);
    }
  };

  const fetchOrders = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a valid phone number');
      return;
    }

    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    setLoading(true);
    setError('');
    setReport(null);

    try {
      // Step 1: Get user ID from phone number
      const userId = await getUserIdFromPhone(phoneNumber.trim());
      
      // Step 2: Get orders using the retrieved user ID
      const response = await fetch('http://localhost:5000/api/admin/adminOrderList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: 1,
          per_page: 5000,
          toId: userId,
          start_date: startDate,
          end_date: endDate,
          status: 1
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result && result.data && result.data.order && Array.isArray(result.data.order)) {
        setAllOrders(result.data.order);
        // Generate report with API filtered data (no additional filtering needed)
        generateReport(result.data.order);
      } else {
        setError('No orders found in response or invalid data structure');
        setAllOrders([]);
      }
    } catch (err) {
      setError(`${err.message}`);
      setAllOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = (orderData) => {
    // Since API already filters by date range, use all data directly
    // Only filter by order_date to ensure we're using the correct date field
    const filteredOrders = orderData.filter(order => {
      return order.order_date; // Only include orders that have order_date
    });

    const monthlyData = {};

    filteredOrders.forEach(order => {
      // Use order_date for grouping (this is the field that matters for business logic)
      const orderDate = new Date(order.order_date);
      const monthKey = `${orderDate.getUTCFullYear()}-${String(orderDate.getUTCMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          total_amount: 0,
          balance_amount: 0,
          vendor_amount: 0,
          advance_amount: 0,
          total_count: 0
        };
      }

      // Safely parse numeric values
      monthlyData[monthKey].total_amount += parseFloat(order.total_amount) || 0;
      monthlyData[monthKey].balance_amount += parseFloat(order.balance_amount) || 0;
      monthlyData[monthKey].vendor_amount += parseFloat(order.vendor_amount) || 0;
      monthlyData[monthKey].advance_amount += parseFloat(order.advance_amount) || 0;
      monthlyData[monthKey].total_count += 1;
    });

    setReport({
      summary: {
        total_amount: filteredOrders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0),
        balance_amount: filteredOrders.reduce((sum, o) => sum + (parseFloat(o.balance_amount) || 0), 0),
        vendor_amount: filteredOrders.reduce((sum, o) => sum + (parseFloat(o.vendor_amount) || 0), 0),
        advance_amount: filteredOrders.reduce((sum, o) => sum + (parseFloat(o.advance_amount) || 0), 0),
        total_count: filteredOrders.length
      },
      monthly: Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)),
      filteredOrders: filteredOrders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date))
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderStatus = (orderStatusValue) => {
    switch (orderStatusValue) {
      case 0:
        return { status: "Booked", className: "status-booked" };
      case 1:
        return { status: "Accepted", className: "status-accepted" };
      case 2:
        return { status: "In-progress", className: "status-in-progress" };
      case 3:
        return { status: "Completed", className: "status-completed" };
      case 4:
        return { status: "Cancelled", className: "status-cancelled" };
      case 5:
        return { status: "", className: "status-empty" };
      case 6:
        return { status: "Expired", className: "status-expired" };
      default:
        return { status: "Unknown", className: "status-unknown" };
    }
  };

  
  const getOrderId = (e) => {
    const orderId1 = 10800 + e;
    const updateOrderId = "#" + orderId1;
    return updateOrderId;
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Order Analytics Dashboard</h1>
        {/* <p className="dashboard-subtitle">Comprehensive order reports and analytics</p> */}
      </div>

      {/* Control Panel */}
      <div className="control-panel">
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number"
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label>Start Date(fulfillment)</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label>End Date(fullfillment)</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="generate-btn"
          >
            {loading ? 'Loading...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {allOrders.length > 0 && (
        <div className="status-message success">
          Data loaded successfully! Found {allOrders.length} orders for selected date range
        </div>
      )}
      
      {error && (
        <div className="status-message error">
          {error}
        </div>
      )}

      {/* Summary Table */}
      {report && (
        <>
          <div className="section">
            <h2 className="section-title">Summary Report ({startDate} to {endDate})</h2>
            <div className="table-container">
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Amount</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="metric-name">Total Amount</td>
                    <td className="amount total">{formatCurrency(report.summary.total_amount)}</td>
                    <td className="percentage">100%</td>
                  </tr>
                  <tr>
                    <td className="metric-name">Balance Amount</td>
                    <td className="amount balance">{formatCurrency(report.summary.balance_amount)}</td>
                    <td className="percentage">
                      {report.summary.total_amount ? ((report.summary.balance_amount / report.summary.total_amount) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td className="metric-name">Extra Pay</td>
                    <td className="amount vendor">{formatCurrency(report.summary.vendor_amount)}</td>
                    <td className="percentage">
                      {report.summary.total_amount ? ((report.summary.vendor_amount / report.summary.total_amount) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td className="metric-name">Advance Amount</td>
                    <td className="amount advance">{formatCurrency(report.summary.advance_amount)}</td>
                    <td className="percentage">
                      {report.summary.total_amount ? ((report.summary.advance_amount / report.summary.total_amount) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr className="total-row">
                    <td className="metric-name">Total Orders</td>
                    <td className="amount">{report.summary.total_count.toLocaleString()}</td>
                    <td className="percentage">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Analysis Table */}
          {report.monthly.length > 0 && (
            <div className="section">
              <h2 className="section-title">Month-on-Month Analysis</h2>
              <div className="table-container">
                <table className="monthly-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Total Amount</th>
                      <th>Balance Amount</th>
                      <th>Extra Pay</th>
                      <th>Advance Amount</th>
                      <th>Order Count</th>
                      <th>Avg Order Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.monthly.map((monthData, index) => (
                      <tr key={monthData.month} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                        <td className="month-cell">
                          {new Date(monthData.month + '-01').toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
                        </td>
                        <td className="amount total">{formatCurrency(monthData.total_amount)}</td>
                        <td className="amount balance">{formatCurrency(monthData.balance_amount)}</td>
                        <td className="amount vendor">{formatCurrency(monthData.vendor_amount)}</td>
                        <td className="amount advance">{formatCurrency(monthData.advance_amount)}</td>
                        <td className="count">{monthData.total_count}</td>
                        <td className="amount avg">
                          {formatCurrency(monthData.total_count ? monthData.total_amount / monthData.total_count : 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders Detail Table */}
          {report.filteredOrders.length > 0 && (
            <div className="section">
              <h2 className="section-title">Order Details ({report.filteredOrders.length} orders)</h2>
              <div className="table-container">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Order Date</th>
                      <th>Created At</th>
                      <th>Total Amount</th>
                      <th>Balance Amount</th>
                      <th>Advance Amount</th>
                      <th>Extra Pay</th>
                      <th>Status</th>
                      <th>Phone</th>
                      <th>Locality</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.filteredOrders.slice(0, 100).map((order, index) => {
                      const orderStatus = getOrderStatus(order.order_status);
                      return (
                        <tr key={order._id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                          <td className="order-id">{getOrderId(order.order_id)}</td>
                          <td className="date-cell">{formatDate(order.order_date)}</td>
                          <td className="date-cell">{formatDate(order.createdAt)}</td>
                          <td className="amount total">{formatCurrency(order.total_amount || 0)}</td>
                          <td className="amount balance">{formatCurrency(order.balance_amount || 0)}</td>
                          <td className="amount advance">{formatCurrency(order.advance_amount || 0)}</td>
                          <td className="amount vendor">{formatCurrency(order.vendor_amount || 0)}</td>
                          <td>
                            <span className={`status-badge ${orderStatus.className}`}>
                              {orderStatus.status}
                            </span>
                          </td>
                          <td className="phone-cell">{order.phone_no || 'N/A'}</td>
                          <td className="locality-cell">{order.order_locality || 'N/A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {report.filteredOrders.length > 100 && (
                <div className="pagination-info">
                  Showing first 100 orders out of {report.filteredOrders.length} total orders
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderDashboard;