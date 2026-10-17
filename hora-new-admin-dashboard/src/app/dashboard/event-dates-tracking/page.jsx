"use client";

import React, { useEffect, useState } from "react";
import "./event-dates-tracking.css";
import { fetchEventDatesListingData } from "./event-dates-tracking-service";

const EventDatesTracking = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch with AbortController
  useEffect(() => {
    const controller = new AbortController();

    fetchEventDatesListingData({
      setLoading,
      setData,
      setPagination,
      page,
      search: debouncedSearch,
      startDate,
      endDate,
      signal: controller.signal,
    });

    return () => {
      controller.abort();
    };
  }, [page, debouncedSearch, startDate, endDate]);

  const formatDateDDMMYYYY = (dateInput) => {
    if (!dateInput) return "N/A";

    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "Invalid Date";

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };

  return (
    <div className="container">
      <h1 className="header-title">Event Dates Tracking</h1>

      <div className="filters-container">
        <input
          type="text"
          placeholder="Search by phone, name, pincode and event title"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{ width: "300px", marginRight: "10px", padding: "5px" }}
        />

        <div style={{ display: "block" }}>
          <div>Event Start Date</div>
          <input
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div style={{ display: "block" }}>
          <div>Event End Date</div>
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {(startDate || endDate) && (
          <button
            style={{
              backgroundColor: "blue",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              padding: "8px 15px",
            }}
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setPage(1);
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>User Name</th>
              <th>Phone</th>
              <th>Pincode</th>
              <th>Event Title</th>
              <th>Event Date</th>
              <th>Create Date</th>
              <th>Visitor ID</th>
              <th>User ID</th>
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((item) => (
                <tr key={`${item._id}-${item.date}`}>
                  <td>{item.user?.name || "N/A"}</td>
                  <td>{item.user?.phone || "N/A"}</td>
                  <td>{item.pincode || "N/A"}</td>
                  <td>{item.eventTitle || "N/A"}</td>
                  <td>{formatDateDDMMYYYY(item.date)}</td>
                  <td>{formatDateDDMMYYYY(item.createdAt)}</td>
                  <td>{item.visitorId || "N/A"}</td>
                  <td>{item?.user?._id || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="no-data" style={{ textAlign: "center" }}>
                  <b>{loading ? "Loading..." : "No Data Found"}</b>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data.length > 0 && (
        <div className="pagination">
          <button
            disabled={page === 1 || loading}
            onClick={() => setPage((prev) => prev - 1)}
          >
            Prev
          </button>

          <span>
            Page {page} of {pagination?.totalPages || 1}
          </span>

          <button
            disabled={loading || page >= (pagination?.totalPages || 1)}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      )}

      {loading && <div className="loading">Loading...</div>}
    </div>
  );
};

export default EventDatesTracking;