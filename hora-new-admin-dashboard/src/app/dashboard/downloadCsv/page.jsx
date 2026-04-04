'use client';
import React, { useState, useCallback } from 'react';
import getOrderType from '../../../utils/getOrderType';
// import './ReportDownloader.css';

// --- Helpers ---
const formatDate = (iso) => {
  if (!iso) return 'NA';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day:'2-digit', month:'2-digit', year:'2-digit' });
};
const getNextDate = (d) => {
  const date = new Date(d);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
};
const buildOrderId = (id) => `#${10800 + id}`;
const buildCsv = (orders) => {
  const header = [
    'Order ID','Order Date','Created At','Order Taken By','Total Amount',
    'Type','Type Name','Order Pincode','Order Locality',
    'Advance Amount','Status','User Review Ratings','Phone No'
  ];
  const rows = orders.map(o => {
    const typeName = getOrderType(o.type) || 'NA';
    const status = o.status === 1 ? 'Active' : 'Inactive';
    const ratings = Array.isArray(o.userReviewRatingArray)
      ? o.userReviewRatingArray.join(';') : 'NA';
    return [
      buildOrderId(o.order_id),
      formatDate(o.order_date),
      formatDate(o.createdAt),
      o.order_taken_by || 'NA',
      o.total_amount ?? 'NA',
      o.type ?? 'NA',
      typeName,
      o.order_pincode || 'NA',
      o.order_locality || 'NA',
      o.advance_amount ?? 'NA',
      status,
      ratings,
      o.phone_no || 'NA',
    ].join(',');
  });
  return [header.join(','), ...rows].join('\n');
};

// --- Reusable Inputs ---
const DateInput = ({ label, name, value, onChange }) => (
  <div className="input-group-button">
    <label htmlFor={name}>{label}</label>
    <input id={name} type="date" name={name} value={value} onChange={onChange} required />
  </div>
);
const SelectInput = ({ label, name, value, onChange, options }) => (
  <div className="input-group-button">
    <label htmlFor={name}>{label}</label>
    <select id={name} name={name} value={value} onChange={onChange} required>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const ReportDownloader = () => {
  const [form, setForm] = useState({ startDate:'', endDate:'', city:'All', orderType:'All' });
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen(o => !o), []);
  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { startDate, endDate, city, orderType } = form;
    const payload = {
      start_createdAt: startDate,
      end_createdAt: getNextDate(endDate),
      page:1, per_page:2000,
      ...(city !== 'All' && { order_locality: city }),
      ...(orderType !== 'All' && { type: Number(orderType) }),
    };
    try {
      const res = await fetch('https://horaservices.com:3000/api/admin/adminOrderList', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const orders = data?.data?.order || [];
      if (!orders.length) return alert('No data found!');
      const csv = buildCsv(orders);
      const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'report.csv';
      link.click();
    } catch {
      alert('Error generating report');
    }
    toggle();
  };

  return (
    <div className="report-downloader">
      <button className="download-btn" onClick={toggle}>Download Report</button>
      {open && (
        <div className="modal-overlay" onClick={toggle}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Download Order Report</h2>
            <form onSubmit={handleSubmit} className="report-form">
              <div className="form-row">
                <DateInput label="Start Date" name="startDate" value={form.startDate} onChange={handleChange} />
                <DateInput label="End Date"   name="endDate"   value={form.endDate}   onChange={handleChange} />
                <SelectInput
                  label="City" name="city" value={form.city} onChange={handleChange}
                  options={[ 'All','Delhi','Mumbai','Hyderabad','Bangalore' ].map(v=>({ value:v, label:v }))}
                />
                <SelectInput
                  label="Order Type" name="orderType" value={form.orderType} onChange={handleChange}
                  options={[
                    {value:'All',label:'All'},
                    {value:'1',label:getOrderType(1)},
                    {value:'2',label:getOrderType(2)},
                    {value:'3',label:getOrderType(3)},
                    {value:'4',label:getOrderType(4)},
                    {value:'5',label:getOrderType(5)},
                    {value:'6',label:getOrderType(6)},
                    {value:'7',label:getOrderType(7)},
                    {value:'8',label:getOrderType(8)}
                  ]}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={toggle}>Cancel</button>
                <button type="submit" className="submit-btn">Submit & Download</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
);
};

export default ReportDownloader;