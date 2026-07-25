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
  const [stats, setStats] = useState();
  const [filters, setFilters] = useState({
    searchedUsers: false,
    eventDateUsers: false,
    whatsappUsers: false,
    loggedInUsers: false,
  });
  console.log(
    "%c [ stats ]",
    "font-size:13px; background:pink; color:#bf2c9f;",
    stats,
  );

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
      setStats,

      searchedUsers: filters.searchedUsers,
      eventDateUsers: filters.eventDateUsers,
      whatsappUsers: filters.whatsappUsers,
      loggedInUsers: filters.loggedInUsers
    });
  }, [
    page,
    debouncedSearch,
    cityName,
    startDate,
    endDate,
    filters.searchedUsers,
    filters.eventDateUsers,
    filters.whatsappUsers,
    filters.loggedInUsers
  ]);

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
          Total {cityName} Users | Total {cityName} Logged-In
          <br />
          <strong>{!loading ? pagination?.total : "Loading..." || 0} | {stats?.loggedInUsers}</strong>
        </div>
        <div className="card">
          Total {cityName} Users City Selected
          <br />
          <strong>
            {!loading
              ? pagination?.total - stats?.notSelectedUsers
              : "Loading..." || 0}
          </strong>
        </div>
        <div className="card">
          Used search | Total Searches
          <br />
          <strong>
            {!loading ? stats?.searchedUsers : "Loading..."} |{" "}
            {stats?.totalSearchCount}
          </strong>
        </div>
        <div className="card">
          Users give dates | Total dates
          <br />
          <strong>
            {!loading ? stats?.eventDateUsers : "Loading..."} |{" "}
            {stats?.totalEventDateCount}
          </strong>
        </div>
        <div className="card">
          Users Clicked Whatsapp | Total Clicks
          <br />
          <strong>
            {!loading ? stats?.whatsappUsers : "Loading..."} |{" "}
            {stats?.totalWhatsappClicks}
          </strong>
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
        <div style={{ display: "block" }}>
          <div>Start Date</div>
          <input
            type="date"
            name="startDate"
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
        </div>

       <div style={{display: 'block'}}>
        <div>End Date</div>
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
       </div>

        <button
          style={{backgroundColor: 'blue',
            color: "white",
            border: 'none',
            borderRadius: "10px",
            cursor: "pointer"
          }}
          onClick={() => {
            setSearch("");
            setDebouncedSearch("");
            setCityName("");
            setStartDate("");
            setEndDate("");
            setPage(1);
            setFilters({
              searchedUsers: false,
              eventDateUsers: false,
              whatsappUsers: false,
            });
          }}
        >
          Clear Filters
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
          // marginLeft: "15px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <label>
          <input
            type="checkbox"
            checked={filters.searchedUsers}
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                searchedUsers: e.target.checked,
              }));
              setPage(1);
            }}
          />{" "}
          Only Searched Users
        </label>

        <label>
          <input
            type="checkbox"
            checked={filters.eventDateUsers}
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                eventDateUsers: e.target.checked,
              }));
              setPage(1);
            }}
          />{" "}
          Only Event Date Users
        </label>

        <label>
          <input
            type="checkbox"
            checked={filters.whatsappUsers}
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                whatsappUsers: e.target.checked,
              }));
              setPage(1);
            }}
          />{" "}
          Only WhatsApp Users
        </label>

        <label>
          <input
            type="checkbox"
            checked={filters.loggedInUsers}
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                loggedInUsers: e.target.checked,
              }));
              setPage(1);
            }}
          />{" "}
          Only Loggedin users
        </label>
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
              <th>Search Count</th>
              <th>Event Date Count</th>
              <th>Whatsapp Clicks</th>
              <th>Create Date</th>
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
                  <td>{item.searchCount || 0}</td>
                  <td>{item.eventDateCount || 0}</td>
                  <td>{item?.clickCounts?.whatsapp || 0}</td>
                  <td>{formatDate(item.createdAt)}</td>
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
