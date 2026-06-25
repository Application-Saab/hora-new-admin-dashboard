"use client";
import React, { useState, useCallback } from "react";
import getOrderType from "../../../utils/getOrderType";
import { BASE_URL } from "@/utils/apiconstant";
// import './ReportDownloader.css';

// --- Helpers ---
const formatDate = (iso) => {
  if (!iso) return "NA";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};
const getNextDate = (d) => {
  const date = new Date(d);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
};

const formatFileDate = (dateStr) => {
  if (!dateStr) return "all";

  const date = new Date(dateStr);

  return date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, "-")
    .toLowerCase(); // 21-jun-2026
};

const getOrderTypeName = (orderType) => {
  if (orderType === "All") return "all-types";

  return getOrderType(Number(orderType))?.replace(/\s+/g, "-")?.toLowerCase();
};

const buildOrderId = (id) => `#${10800 + id}`;

const buildCsv = (orders) => {
  const headers = [
    "Order Id Panel",
    "Order Date",
    "Order Time",
    "Total Amount",
    "Payable Amount",
    "Order Status",
    "Order Id Db",
    "Order Locality",
    "Order Pincode",
    "Advance Amount",
    "Balance Amount",
    "Order Taken By",
    "Event Name",
    "CreatedAt",
    "OrderMongoId",
    "Status",
    "Customer Id",
    "Customer Name",
    "Customer Phone",
    "Supplier Id",
    "Supplier Name",
    "Supplier Phone",
    "Product Id",
    "Product Name",
    "Product Price",
    "Product Collection",
    "Rating",
    "Rating Range",
  ];

  const rows = orders.map((o) =>
    [
      buildOrderId(o.order_id),
      formatDate(o.order_date),
      o.order_time || "",
      o.total_amount || "",
      o.payable_amount || "",
      o.order_status || "",
      o.order_id || "",
      o.order_locality || "",
      o.order_pincode || "",
      o.advance_amount || "",
      o.balance_amount || "",
      o.order_taken_by || "",
      o.eventName || "",
      formatDate(o.createdAt),
      o.orderMongoId || "",
      o.status || "",
      o.customer_id || "",
      o.customer_name || "",
      o.customer_phone || "",
      o.supplier_id || "",
      o.supplier_name || "",
      o.supplier_phone || "",
      o.product_id || "",
      o.product_name || "",
      o.product_price || "",
      o.product_collection || "",
      o.rating || "",
      o.rating_range || "",
    ]
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
};

// --- Reusable Inputs ---
const DateInput = ({ label, name, value, onChange }) => (
  <div className="input-group-button">
    <label htmlFor={name}>{label}</label>
    <input
      id={name}
      type="date"
      name={name}
      value={value}
      onChange={onChange}
      required
    />
  </div>
);
const SelectInput = ({ label, name, value, onChange, options }) => (
  <div className="input-group-button">
    <label htmlFor={name}>{label}</label>
    <select id={name} name={name} value={value} onChange={onChange} required>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

const ReportDownloader = () => {
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    city: "All",
    orderType: "All",
  });
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((o) => !o), []);
  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { startDate, endDate, city, orderType } = form;

    const startDateFormatted = formatFileDate(startDate);
    const endDateFormatted = formatFileDate(endDate);

    const cityName =
      city === "All" ? "all-cities" : city.replace(/\s+/g, "-").toLowerCase();

    const orderTypeName = getOrderTypeName(orderType);

    const fileName = `${startDateFormatted} TO ${endDateFormatted} ${cityName} ${orderTypeName}.csv`;

    const payload = {
      start_createdAt: startDate,
      end_createdAt: getNextDate(endDate),
      page: 1,
      per_page: 2000,
      ...(city !== "All" && { order_locality: city }),
      ...(orderType !== "All" && { type: Number(orderType) }),
    };
    try {
      const res = await fetch(`${BASE_URL}/api/admin/downloadOrderReport`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      const orders = data?.data || [];
      if (!orders.length) return alert("No data found!");
      const csv = buildCsv(orders);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    } catch {
      alert("Error generating report");
    }
    toggle();
  };

  return (
    <div className="report-downloader">
      <button className="download-btn" onClick={toggle}>
        Download Report
      </button>
      {open && (
        <div className="modal-overlay" onClick={toggle}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Download Order Report</h2>
            <form onSubmit={handleSubmit} className="report-form">
              <div className="form-row">
                <DateInput
                  label="Start Date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                />
                <DateInput
                  label="End Date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                />
                <SelectInput
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  options={[
                    "All",
                    "Delhi",
                    "Mumbai",
                    "Hyderabad",
                    "Bangalore",
                  ].map((v) => ({ value: v, label: v }))}
                />
                <SelectInput
                  label="Order Type"
                  name="orderType"
                  value={form.orderType}
                  onChange={handleChange}
                  options={[
                    { value: "All", label: "All" },
                    { value: "1", label: getOrderType(1) },
                    { value: "2", label: getOrderType(2) },
                    { value: "3", label: getOrderType(3) },
                    { value: "4", label: getOrderType(4) },
                    { value: "5", label: getOrderType(5) },
                    { value: "6", label: getOrderType(6) },
                    { value: "7", label: getOrderType(7) },
                    { value: "8", label: getOrderType(8) },
                  ]}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={toggle}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Submit & Download
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDownloader;
