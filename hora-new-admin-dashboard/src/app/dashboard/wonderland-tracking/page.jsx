"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./wonderland-tracking.css";
import { BASE_URL, GET_WONDERLAND_GLOBAL_STATS, GET_WONDERLAND_LISTING_DATA } from "@/utils/apiconstant";

const AdminAnalytics = () => {
  const [type, setType] = useState("byUsers"); // byUsers | byEvents
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchData();
  }, [type, page, search, dateFilter]);

  // 🔥 Global Stats API
  const fetchStats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}${GET_WONDERLAND_GLOBAL_STATS}`);
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 Listing API
  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await axios.post(`${BASE_URL}${GET_WONDERLAND_LISTING_DATA}`, {
        type,
        page,
        per_page: 10,
        search,
        dateFilter,
      });

      setData(res.data.data.data);
      setPagination(res.data.data.paginate);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="header-title">Admin Analytics Dashboard</h1>

      {/* 🔥 GLOBAL STATS */}
      {stats && (
        <div className="stats-container">
          <div className="card">Total Users: {stats.totalUsers}</div>
          <div className="card">Total Events: {stats.totalEvents}</div>
          <div className="card">Total Posts: {stats.totalPosts}</div>
          <div className="card">Total Guests: {stats.totalGuests}</div>
        </div>
      )}

      {/* 🔥 TOGGLE */}
      <div className="toggle-container">
        <button
          className={type === "byUsers" ? "active" : ""}
          onClick={() => {
            setType("byUsers");
            setPage(1);
          }}
        >
          By Users
        </button>

        <button
          className={type === "byEvents" ? "active" : ""}
          onClick={() => {
            setType("byEvents");
            setPage(1);
          }}
        >
          By Events
        </button>
      </div>

      {/* 🔥 FILTERS */}
      <div className="filters-container">
        <input
          type="text"
          placeholder={
            type === "byUsers"
              ? "Search User Name..."
              : "Search Host Name..."
          }
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <select
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All</option>
          <option value="last_1_week">Last 1 Week</option>
          <option value="last_1_month">Last 1 Month</option>
          <option value="last_1_year">Last 1 Year</option>
        </select>
      </div>

      {/* 🔥 TABLE */}
      <div className="table-container">
        <table>
          <thead>
            {type === "byUsers" ? (
              <tr>
                <th>Name</th>
                <th>Hosted Events</th>
                <th>Guest Events</th>
                <th>Posts</th>
                <th>Wonderland</th>
              </tr>
            ) : (
              <tr>
                <th>Event Type</th>
                <th>Host Name</th>
                <th>Guests</th>
                <th>Posts</th>
                <th>Date</th>
              </tr>
            )}
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((item, i) =>
                type === "byUsers" ? (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td>{item.hostedEventsCount}</td>
                    <td>{item.guestEventsCount}</td>
                    <td>{item.postsCount}</td>
                    <td>{item.fromWonderland ? "Yes" : "No"}</td>
                  </tr>
                ) : (
                  <tr key={i}>
                    <td>{item.eventType}</td>
                    <td>{item.hostName}</td>
                    <td>{item.guestCount}</td>
                    <td>{item.photoCount}</td>
                    <td>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                )
              )
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔥 PAGINATION */}
      {data.length > 0 && (
        <div className="pagination">
          <button
            onClick={() => setPage(pagination.previous_page)}
            disabled={page === pagination.first_page}
          >
            Prev
          </button>

          <span>
            Page {pagination.current_page} of {pagination.last_page}
          </span>

          <button
            onClick={() => setPage(pagination.next_page)}
            disabled={page === pagination.last_page}
          >
            Next
          </button>
        </div>
      )}

      {loading && <div className="loading">Loading...</div>}
    </div>
  );
};

export default AdminAnalytics;