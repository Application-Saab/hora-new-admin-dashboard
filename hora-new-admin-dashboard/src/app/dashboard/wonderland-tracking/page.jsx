"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./wonderland-tracking.css";
import {
  BASE_URL,
  GET_WONDERLAND_GLOBAL_STATS,
  GET_WONDERLAND_LISTING_DATA,
} from "@/utils/apiconstant";
import { WonderlandTrackingTable } from "./wonderlandTrackingServices.jsx";

const AdminAnalytics = () => {
  const [type, setType] = useState("byUsers");
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchData();
  }, [type, page, debouncedSearch, dateFilter]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}${GET_WONDERLAND_GLOBAL_STATS}`);
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${BASE_URL}${GET_WONDERLAND_LISTING_DATA}`,
        {
          type,
          page,
          per_page: 10,
          search,
          dateFilter,
        },
      );

      setData(res.data.data.data);
      setPagination(res.data.data.paginate);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="container">
      <h1 className="header-title">Admin Analytics Dashboard</h1>

      {stats && (
        <div className="stats-container">
          <div className="card">Total Users: {stats.totalUniqueEventUsers}</div>
          <div className="card">
            Only Wonderland logins: {stats.totalWonderlandUsers}
          </div>
          <div className="card">Total Events: {stats.totalEvents}</div>
          <div className="card">Total Hosts: {stats.totalHosts}</div>
          <div className="card">Total Guests: {stats.totalGuests}</div>
          <div className="card">Total Posts: {stats.totalPosts}</div>
        </div>
      )}

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

      <div className="filters-container">
        <input
          type="text"
          placeholder={
            type === "byUsers" ? "Search by phone" : "Search by event name"
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

      <WonderlandTrackingTable data={data} type={type} />

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
