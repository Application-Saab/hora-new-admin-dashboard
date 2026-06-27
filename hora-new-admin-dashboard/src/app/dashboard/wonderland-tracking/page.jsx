"use client";
import React, { useEffect, useState } from "react";
import "./wonderland-tracking.css";
import {
  fetchWonderlandListingData,
  fetchWonderlandStats,
} from "./wonderlandTrackingServices";
import { useRouter } from "next/navigation";

const AdminAnalytics = () => {
  const router = useRouter();
  const [type, setType] = useState("byUsers");
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    fetchWonderlandStats(setStats);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchWonderlandListingData({
      setLoading,
      setData,
      setPagination,
      type,
      page,
      search: debouncedSearch,
      dateFilter,
      signal: controller.signal,
    });

    return () => {
      controller.abort();
    };
  }, [type, page, debouncedSearch, dateFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const formatDateDDMMYYYY = (dateInput) => {
    if (!dateInput) return "N/A";
    const d = new Date(dateInput);

    if (isNaN(d.getTime())) {
      return "Invalid Date";
    }

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };

  // Copy Function
  const handleCopy = async (text, itemId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(itemId);
      setTimeout(() => {
        setCopiedId("");
      }, 2000);
    } catch (err) {
      console.error("Link copy karne me dikkat aayi: ", err);
    }
  };

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
        <button
          className="create-invite-btn"
          type="button"
          onClick={() => {
            router.push("/dashboard/wonderland-tracking/create-invite");
          }}
        >
          + Create Invite
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
      <div className="table-container">
        <table>
          <thead>
            {type === "byUsers" ? (
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Hosted Events</th>
                <th>Guest Events</th>
                <th>Posts</th>
                <th>Wonderland</th>
              </tr>
            ) : (
              <tr>
                <th>Wonderland ID</th>
                <th>Event Name</th>
                <th>Host Phone</th>
                <th>Guests</th>
                <th>Posts</th>
                <th>Date</th>
                <th>View Event</th>
                <th>Copy Event Link</th>
              </tr>
            )}
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((item, i) =>
                type === "byUsers" ? (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td>{item.phone}</td>
                    <td>{item.hostedEventsCount}</td>
                    <td>{item.guestEventsCount}</td>
                    <td>{item.postsCount}</td>
                    <td>{item.fromWonderland ? "Yes" : "No"}</td>
                  </tr>
                ) : (
                  <tr key={i}>
                    <td>{item.wonderland_id}</td>
                    <td>{item.hostName}</td>
                    <td>{item.hostPhone}</td>
                    <td>{item.guestCount}</td>
                    <td>{item.photoCount}</td>
                    <td>{formatDateDDMMYYYY(item.eventDate)}</td>
                    <td>
                      <a
                        target="_blank"
                        href={`https://horaservices.com/${item?.fromInternational === "yes" ? "wonderlandinternational" : "wonderland"}/invite?eventid=${item?._id}&frompanel=true`}
                      >
                        View
                      </a>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() =>
                          handleCopy(
                            `https://horaservices.com/${item?.fromInternational === "yes" ? "wonderlandinternational" : "wonderland"}/invite?eventid=${item?._id}`,
                            item?._id,
                          )
                        }
                        style={{
                          background:
                            copiedId === item?._id ? "#22c55e" : "black",
                          color: "white",
                          padding: "8px 10px",
                          cursor: "pointer",
                          border: "none",
                          borderRadius: "4px",
                          transition: "background 0.2s ease",
                        }}
                      >
                        {copiedId === item?._id ? "Copied! ✓" : "Copy Link"}
                      </button>
                    </td>
                  </tr>
                ),
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
