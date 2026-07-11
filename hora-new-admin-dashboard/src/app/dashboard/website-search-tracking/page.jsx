"use client";

import React, { useEffect, useState } from "react";
import "./website-search-tracking.css";
import {
  fetchWebsiteSearchStats,
  fetchWebsiteSearchTracking,
} from "./website-search-tracking-service";

const WebsiteSearchTracking = () => {
  const [stats, setStats] = useState(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [clickedType, setClickedType] = useState("");

  useEffect(() => {
    fetchWebsiteSearchStats(setStats);
  }, []);

  useEffect(() => {
    fetchWebsiteSearchTracking({
      setLoading,
      setData,
      setPagination,
      page,
      search: debouncedSearch,
      clickedType,
    });
  }, [page, debouncedSearch, clickedType]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN");
  };

  return (
    <div className="container">
      <h1 className="header-title">Website Search Tracking</h1>

      {stats && (
        <div className="stats-container">
          <div className="card">
            Total Searches
            <br />
            <strong>{stats.totalSearches}</strong>
          </div>

          <div className="card">
            Total Clicks
            <br />
            <strong>{stats.totalClicks}</strong>
          </div>

          <div className="card">
            Logged In Users
            <br />
            <strong>{stats.uniqueLoggedInUsers}</strong>
          </div>

          <div className="card">
            Guest Visitors
            <br />
            <strong>{stats.uniqueGuestVisitors}</strong>
          </div>

          <div className="card">
            Top Search Term
            <br />
            <strong>{stats?.topSearchTerms[0]?.searchTerm || "N/A"}</strong>
          </div>
        </div>
      )}

      <div className="filters-container">
        <input
          type="text"
          placeholder="Search by term, title, user name or phone"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{ width: "300px", marginRight: "10px", padding: "5px" }}
        />

        <select
          value={clickedType}
          onChange={(e) => {
            setClickedType(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Types</option>
          <option value="theme">Theme</option>
          <option value="product">Product</option>
          <option value="category">Category</option>
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>User Name</th>
              <th>Phone</th>
              <th>Search Term</th>
              <th>Clicked Title</th>
              <th>Clicked Type</th>
              <th>Clicked Item Id</th>
              <th>Created At</th>
              <th>Visitor Id</th>
              <th>User Id</th>
            </tr>
          </thead>

          <tbody>
            {data.length ? (
              data.map((item) => (
                <tr key={item._id}>
                  <td>{item?.user?.name || "N/A"}</td>
                  <td>{item?.user?.phone || "N/A"}</td>
                  <td>{item.searchTerm || "N/A"}</td>
                  <td>{item.clickedTitle || "N/A"}</td>
                  <td>{item.clickedType || "N/A"}</td>
                  <td>{item.clickedItemId || "N/A"}</td>
                  <td>{formatDate(item.createdAt)}</td>
                  <td>{item.visitorId || "N/A"}</td>
                  <td>{item?.user?._id || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="no-data"
                  style={{ textAlign: "center" }}
                >
                  <b>No Data Found</b>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data.length > 0 && (
        <div className="pagination">
          <button
            onClick={() => setPage((prev) => prev - 1)}
            disabled={page === 1}
          >
            Prev
          </button>

          <span>
            Page {page} of {pagination.totalPages || 1}
          </span>

          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page >= (pagination.totalPages || 1)}
          >
            Next
          </button>
        </div>
      )}

      {loading && <div className="loading">Loading...</div>}
    </div>
  );
};

export default WebsiteSearchTracking;
