"use client";

import React, { useEffect, useMemo, useState } from "react";
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

const DEFAULT_FILTERS = {
  cityName: "",
  startDate: "",
  endDate: "",
  searchedUsers: false,
  eventDateUsers: false,
  whatsappUsers: false,
  loggedInUsers: false,
};

const UserCitiesTracking = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [pendingFilters, setPendingFilters] = useState(DEFAULT_FILTERS);

  const [appliedFilters, setAppliedFilters] =
    useState(DEFAULT_FILTERS);

  const [stats, setStats] = useState();

  const hasPendingFilterChanges = useMemo(() => {
    return (
      JSON.stringify(pendingFilters) !==
      JSON.stringify(appliedFilters)
    );
  }, [pendingFilters, appliedFilters]);

  const hasAppliedFilters = useMemo(() => {
    return (
      appliedFilters.cityName !== "" ||
      appliedFilters.startDate !== "" ||
      appliedFilters.endDate !== "" ||
      appliedFilters.searchedUsers === true ||
      appliedFilters.eventDateUsers === true ||
      appliedFilters.whatsappUsers === true ||
      appliedFilters.loggedInUsers === true
    );
  }, [appliedFilters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    fetchUserCitiesTracking({
      setLoading,
      setData,
      setPagination,
      setStats,

      page,
      search: debouncedSearch,

      cityName: appliedFilters.cityName,
      startDate: appliedFilters.startDate,
      endDate: appliedFilters.endDate,

      searchedUsers: appliedFilters.searchedUsers,
      eventDateUsers: appliedFilters.eventDateUsers,
      whatsappUsers: appliedFilters.whatsappUsers,
      loggedInUsers: appliedFilters.loggedInUsers,

      signal: controller.signal,
    });

    return () => {
      controller.abort();
    };
  }, [
    page,
    debouncedSearch,

    appliedFilters.cityName,
    appliedFilters.startDate,
    appliedFilters.endDate,

    appliedFilters.searchedUsers,
    appliedFilters.eventDateUsers,
    appliedFilters.whatsappUsers,
    appliedFilters.loggedInUsers,
  ]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCityChange = (e) => {
    setPendingFilters((prev) => ({
      ...prev,
      cityName: e.target.value,
    }));
  };

  const handleStartDateChange = (e) => {
    setPendingFilters((prev) => ({
      ...prev,
      startDate: e.target.value,
    }));
  };

  const handleEndDateChange = (e) => {
    setPendingFilters((prev) => ({
      ...prev,
      endDate: e.target.value,
    }));
  };

  const handleCheckboxChange = (filterName, checked) => {
    setPendingFilters((prev) => ({
      ...prev,
      [filterName]: checked,
    }));
  };

  const handleApplyFilters = () => {
    if (!hasPendingFilterChanges) {
      return;
    }

    setPage(1);

    setAppliedFilters({
      ...pendingFilters,
    });
  };

  const handleClearFilters = () => {
    if (!hasAppliedFilters) {
      return;
    }

    setSearch("");
    setDebouncedSearch("");

    setPage(1);

    setPendingFilters({
      ...DEFAULT_FILTERS,
    });

    setAppliedFilters({
      ...DEFAULT_FILTERS,
    });
  };

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString("en-IN");
  };

  return (
    <div className="container">
      <h1 className="header-title">
        User Cities Tracking
      </h1>

      <div className="stats-container">
        <div className="card">
          Total {appliedFilters.cityName || "All"} Users | Total{" "}
          {appliedFilters.cityName || "All"} Logged-In
          <br />

          <strong>
            {!loading
              ? pagination?.total ?? 0
              : "Loading..."}{" "}
            |{" "}
            {!loading
              ? stats?.loggedInUsers ?? 0
              : "Loading..."}
          </strong>
        </div>

        <div className="card">
          Total {appliedFilters.cityName || "All"} Users City Selected
          <br />

          <strong>
            {!loading
              ? Math.max(
                  0,
                  (pagination?.total ?? 0) -
                    (stats?.notSelectedUsers ?? 0)
                )
              : "Loading..."}
          </strong>
        </div>

        <div className="card">
          Used search | Total Searches
          <br />

          <strong>
            {!loading
              ? stats?.searchedUsers ?? 0
              : "Loading..."}{" "}
            |{" "}
            {!loading
              ? stats?.totalSearchCount ?? 0
              : "Loading..."}
          </strong>
        </div>

        <div className="card">
          Users give dates | Total dates
          <br />

          <strong>
            {!loading
              ? stats?.eventDateUsers ?? 0
              : "Loading..."}{" "}
            |{" "}
            {!loading
              ? stats?.totalEventDateCount ?? 0
              : "Loading..."}
          </strong>
        </div>

        <div className="card">
          Users Clicked Whatsapp | Total Clicks
          <br />

          <strong>
            {!loading
              ? stats?.whatsappUsers ?? 0
              : "Loading..."}{" "}
            |{" "}
            {!loading
              ? stats?.totalWhatsappClicks ?? 0
              : "Loading..."}
          </strong>
        </div>
      </div>

      <div className="filters-container">
        <input
          type="text"
          placeholder="Search by user name or phone"
          value={search}
          onChange={handleSearchChange}
          style={{
            width: "300px",
            marginRight: "10px",
            padding: "5px",
          }}
        />

        <select
          value={pendingFilters.cityName}
          onChange={handleCityChange}
          style={{
            width: "220px",
            padding: "7px",
            cursor: "pointer",
          }}
        >
          <option value="">All Cities</option>

          {Object.entries(CityNames)
            .sort((a, b) =>
              a[1].localeCompare(b[1])
            )
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
            value={pendingFilters.startDate}
            onChange={handleStartDateChange}
            style={{
              padding: "7px",
              marginLeft: "10px",
            }}
          />
        </div>

        <div style={{ display: "block" }}>
          <div>End Date</div>

          <input
            type="date"
            name="endDate"
            value={pendingFilters.endDate}
            onChange={handleEndDateChange}
            style={{
              padding: "7px",
              marginLeft: "10px",
            }}
          />
        </div>

        <button
          type="button"
          disabled={!hasPendingFilterChanges}
          onClick={handleApplyFilters}
          style={{
            backgroundColor: hasPendingFilterChanges
              ? "green"
              : "#ccc",
            color: hasPendingFilterChanges
              ? "white"
              : "#666",
            border: "none",
            borderRadius: "10px",
            padding: "8px 15px",
            cursor: hasPendingFilterChanges
              ? "pointer"
              : "not-allowed",
          }}
        >
          Apply Filters
        </button>

        <button
          type="button"
          disabled={!hasAppliedFilters}
          onClick={handleClearFilters}
          style={{
            backgroundColor: hasAppliedFilters
              ? "blue"
              : "#ccc",
            color: hasAppliedFilters
              ? "white"
              : "#666",
            border: "none",
            borderRadius: "10px",
            padding: "8px 15px",
            cursor: hasAppliedFilters
              ? "pointer"
              : "not-allowed",
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
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <label>
          <input
            type="checkbox"
            checked={pendingFilters.searchedUsers}
            onChange={(e) =>
              handleCheckboxChange(
                "searchedUsers",
                e.target.checked
              )
            }
          />{" "}
          Only Searched Users
        </label>

        <label>
          <input
            type="checkbox"
            checked={pendingFilters.eventDateUsers}
            onChange={(e) =>
              handleCheckboxChange(
                "eventDateUsers",
                e.target.checked
              )
            }
          />{" "}
          Only Event Date Users
        </label>

        <label>
          <input
            type="checkbox"
            checked={pendingFilters.whatsappUsers}
            onChange={(e) =>
              handleCheckboxChange(
                "whatsappUsers",
                e.target.checked
              )
            }
          />{" "}
          Only WhatsApp Users
        </label>

        <label>
          <input
            type="checkbox"
            checked={pendingFilters.loggedInUsers}
            onChange={(e) =>
              handleCheckboxChange(
                "loggedInUsers",
                e.target.checked
              )
            }
          />{" "}
          Only Logged-in Users
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
            {data.length > 0 ? (
              data.map((item) => (
                <tr key={item._id}>
                  <td>
                    {item?.user?.name || "N/A"}
                  </td>

                  <td>
                    {item?.user?.phone || "N/A"}
                  </td>

                  <td>
                    {item?.cityName || "N/A"}
                  </td>

                  <td>
                    {item?.visitorId || "N/A"}
                  </td>

                  <td>
                    {item?.user?._id || "N/A"}
                  </td>

                  <td>
                    {item?.searchCount || 0}
                  </td>

                  <td>
                    {item?.eventDateCount || 0}
                  </td>

                  <td>
                    {item?.clickCounts?.whatsapp || 0}
                  </td>

                  <td>
                    {formatDate(item?.createdAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="no-data"
                  style={{
                    textAlign: "center",
                  }}
                >
                  <b>
                    {loading
                      ? "Loading..."
                      : "No Data Found"}
                  </b>
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
            onClick={() =>
              setPage((prev) => prev - 1)
            }
          >
            Prev
          </button>

          <span>
            Page {page} of{" "}
            {pagination?.totalPages || 1}
          </span>

          <button
            disabled={
              loading ||
              page >=
                (pagination?.totalPages || 1)
            }
            onClick={() =>
              setPage((prev) => prev + 1)
            }
          >
            Next
          </button>
        </div>
      )}

      {loading && (
        <div className="loading">
          Loading...
        </div>
      )}
    </div>
  );
};

export default UserCitiesTracking;