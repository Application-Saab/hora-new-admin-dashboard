"use client";

import React, { useEffect, useState } from "react";
import "./user-cities-tracking.css";
import { fetchUserCitiesTracking } from "./useer-cities-tracking-service";

const CityNames = {
  delhi: "Delhi",
  mumbai: "Mumbai",
  bengaluru: "Bengaluru",
  noida: "Noida",
  ghaziabad: "Ghaziabad",
  gurugram: "Gurgaon",
  faridabad: "Faridabad",
  hyderabad: "Hyderabad",
  chennai: "Chennai",
  kolkata: "Kolkata",
  lucknow: "Lucknow",
  kanpur: "Kanpur",
  indore: "Indore",
  surat: "Surat",
  bhopal: "Bhopal",
  goa: "Goa",
  pune: "Pune",
};

const UserCitiesTracking = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [cityName, setCityName] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchUserCitiesTracking({
      setLoading,
      setData,
      setPagination,
      page,
      search: debouncedSearch,
      cityName,
      startDate,
      endDate,
    });
  }, [page, debouncedSearch, cityName, startDate, endDate]);

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
      <h1 className="header-title">User Cities Tracking</h1>

      {/* {stats && ( */}
      <div className="stats-container">
        <div className="card">
          Total {cityName} Users
          <br />
          <strong>{!loading ? pagination?.total : "Loading..." || 0}</strong>
        </div>
      </div>
      {/* )} */}

      <div className="filters-container">
        <input
          type="text"
          placeholder="Search by user name or phone"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{
            width: "300px",
            marginRight: "10px",
            padding: "5px",
          }}
        />

        <select
          value={cityName}
          onChange={(e) => {
            setCityName(e.target.value);
            setPage(1);
          }}
          style={{
            width: "220px",
            padding: "7px",
            cursor: "pointer",
          }}
        >
          <option value="">All Cities</option>

          {Object.entries(CityNames)
            .sort((a, b) => a[1].localeCompare(b[1]))
            .map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            setPage(1);
          }}
          style={{
            padding: "7px",
            marginLeft: "10px",
          }}
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            setPage(1);
          }}
          style={{
            padding: "7px",
            marginLeft: "10px",
          }}
        />

        <button
          onClick={() => {
            setSearch("");
            setDebouncedSearch("");
            setCityName("");
            setStartDate("");
            setEndDate("");
            setPage(1);
          }}
        >
          Clear Filters
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>User Name</th>
              <th>Phone</th>
              <th>City</th>
              <th>Visitor Id</th>
              <th>User Id</th>
              <th>Is Searched</th>
              <th>Created At</th>
            </tr>
          </thead>

          <tbody>
            {data.length ? (
              data.map((item) => (
                <tr key={item._id}>
                  <td>{item?.user?.name || "N/A"}</td>
                  <td>{item?.user?.phone || "N/A"}</td>
                  <td>{item.cityName || "N/A"}</td>
                  <td>{item.visitorId || "N/A"}</td>
                  <td>{item?.user?._id || "N/A"}</td>
                  <td>{item.isSearchedAnything ? "Yes" : "No"}</td>
                  <td>{formatDate(item.createdAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
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
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            Prev
          </button>

          <span>
            Page {page} of {pagination.totalPages || 1}
          </span>

          <button
            disabled={page >= (pagination.totalPages || 1)}
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

export default UserCitiesTracking;
