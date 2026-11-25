"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Calendar,
  MessageCircle,
  Users,
  Building2,
  Sparkles,
  Box,
  Filter,
  RotateCcw,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./user-cities-tracking.css";
import {
  fetchUserCitiesTrackingList,
  fetchUserCitiesTrackingStats,
} from "./useer-cities-tracking-service";

const CityNames = {
  delhi: "Delhi",
  mumbai: "Mumbai",
  bengaluru: "Bengaluru",
  bangalore: "Bangalore",
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

const USER_SOURCES = [
  { value: "", label: "All Sources" },
  { value: "venue", label: "Venue" },
  { value: "wonderland", label: "Wonderland" },
  { value: "capsule", label: "Capsule" },
];

const DEFAULT_FILTERS = {
  cityName: "",
  startDate: "",
  endDate: "",
  userSource: "",
  searchedUsers: false,
  eventDateUsers: false,
  whatsappUsers: false,
  loggedInUsers: false,
};

const UserCitiesTracking = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({});

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [pendingFilters, setPendingFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

  const [stats, setStats] = useState({});
  const [copiedId, setCopiedId] = useState("");

  const hasPendingFilterChanges = useMemo(() => {
    return JSON.stringify(pendingFilters) !== JSON.stringify(appliedFilters);
  }, [pendingFilters, appliedFilters]);

  const hasAppliedFilters = useMemo(() => {
    return (
      debouncedSearch.trim() !== "" ||
      appliedFilters.cityName !== "" ||
      appliedFilters.startDate !== "" ||
      appliedFilters.endDate !== "" ||
      appliedFilters.userSource !== "" ||
      appliedFilters.searchedUsers ||
      appliedFilters.eventDateUsers ||
      appliedFilters.whatsappUsers ||
      appliedFilters.loggedInUsers
    );
  }, [debouncedSearch, appliedFilters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 450);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    const commonParams = {
      search: debouncedSearch,
      cityName: appliedFilters.cityName,
      startDate: appliedFilters.startDate,
      endDate: appliedFilters.endDate,
      userSource: appliedFilters.userSource,
      searchedUsers: appliedFilters.searchedUsers,
      eventDateUsers: appliedFilters.eventDateUsers,
      whatsappUsers: appliedFilters.whatsappUsers,
      loggedInUsers: appliedFilters.loggedInUsers,
      signal: controller.signal,
    };

    fetchUserCitiesTrackingList({
      ...commonParams,
      setLoading,
      setData,
      setPagination,
      page,
      limit,
    });

    fetchUserCitiesTrackingStats({
      ...commonParams,
      setStats,
    });

    return () => controller.abort();
  }, [page, limit, debouncedSearch, appliedFilters]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterFieldChange = (field, value) => {
    setPendingFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApplyFilters = () => {
    if (!hasPendingFilterChanges) return;
    setPage(1);
    setAppliedFilters({ ...pendingFilters });
  };

  const handleClearFilters = () => {
    if (!hasAppliedFilters && !hasPendingFilterChanges) return;
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
    setPendingFilters({ ...DEFAULT_FILTERS });
    setAppliedFilters({ ...DEFAULT_FILTERS });
  };

  const handleQuickSourceFilter = (sourceValue) => {
    const nextSource =
      appliedFilters.userSource === sourceValue ? "" : sourceValue;
    const updated = { ...pendingFilters, userSource: nextSource };
    setPage(1);
    setPendingFilters(updated);
    setAppliedFilters(updated);
  };

  const handleCopy = (value) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedId(value);
    setTimeout(() => setCopiedId(""), 1500);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getUserSourceBadge = (user) => {
    if (user?.fromVenue) {
      return <span className="uct-badge uct-badge-venue">Venue</span>;
    }
    if (user?.fromWonderland) {
      return (
        <span className="uct-badge uct-badge-wonderland">Wonderland</span>
      );
    }
    if (user?.fromCapsule) {
      return <span className="uct-badge uct-badge-capsule">Capsule</span>;
    }
    return <span className="uct-badge uct-badge-guest">Other / Guest</span>;
  };

  const renderTruncatedId = (id) => {
    if (!id) return <span className="uct-muted">N/A</span>;
    const shortId =
      id.length > 14 ? `${id.slice(0, 8)}...${id.slice(-4)}` : id;

    return (
      <div className="uct-id-box">
        <span title={id}>{shortId}</span>
        <button
          type="button"
          onClick={() => handleCopy(id)}
          title="Copy full ID"
          className="uct-copy-btn"
        >
          {copiedId === id ? (
            <Check size={13} color="#16a34a" />
          ) : (
            <Copy size={13} />
          )}
        </button>
      </div>
    );
  };

  const cityLabel = appliedFilters.cityName || "All";
  const totalRecords = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages || 1;
  const startRecord = totalRecords === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalRecords);

  return (
    <div className="uct-page">
      {/* Header */}
      <div className="uct-header">
        <h1 className="uct-title">User Cities Tracking</h1>
        <p className="uct-subtitle">
          Monitor city selection, search intent, event dates, WhatsApp leads,
          and acquisition sources.
        </p>
      </div>

      {/* Primary KPI Cards */}
      <div className="uct-kpi-grid">
        <div className="uct-kpi-card">
          <div className="uct-kpi-top">
            <span>{cityLabel} Users / Logged-In</span>
            <Users size={16} className="uct-text-indigo" />
          </div>
          <div className="uct-kpi-value">
            <span>{loading ? "..." : totalRecords.toLocaleString()}</span>
            <span className="uct-kpi-sub uct-text-indigo">
              / {loading ? "..." : (stats?.loggedInUsers ?? 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="uct-kpi-card">
          <div className="uct-kpi-top">
            <span>{cityLabel} City Selected</span>
            <MapPin size={16} className="uct-text-emerald" />
          </div>
          <div className="uct-kpi-value">
            {loading
              ? "..."
              : Math.max(
                  0,
                  totalRecords - (stats?.notSelectedUsers ?? 0)
                ).toLocaleString()}
          </div>
        </div>

        <div className="uct-kpi-card">
          <div className="uct-kpi-top">
            <span>Searched Users / Searches</span>
            <Search size={16} className="uct-text-sky" />
          </div>
          <div className="uct-kpi-value">
            <span>{loading ? "..." : (stats?.searchedUsers ?? 0).toLocaleString()}</span>
            <span className="uct-kpi-sub uct-text-sky">
              /{" "}
              {loading
                ? "..."
                : (stats?.totalSearchCount ?? 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="uct-kpi-card">
          <div className="uct-kpi-top">
            <span>Event Date Users / Dates</span>
            <Calendar size={16} className="uct-text-amber" />
          </div>
          <div className="uct-kpi-value">
            <span>
              {loading ? "..." : (stats?.eventDateUsers ?? 0).toLocaleString()}
            </span>
            <span className="uct-kpi-sub uct-text-amber">
              /{" "}
              {loading
                ? "..."
                : (stats?.totalEventDateCount ?? 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="uct-kpi-card">
          <div className="uct-kpi-top">
            <span>WhatsApp Users / Clicks</span>
            <MessageCircle size={16} className="uct-text-green" />
          </div>
          <div className="uct-kpi-value">
            <span>
              {loading ? "..." : (stats?.whatsappUsers ?? 0).toLocaleString()}
            </span>
            <span className="uct-kpi-sub uct-text-green">
              /{" "}
              {loading
                ? "..."
                : (stats?.totalWhatsappClicks ?? 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* User Source Breakdown Cards */}
      <div className="uct-source-grid">
        <button
          type="button"
          onClick={() => handleQuickSourceFilter("venue")}
          className={`uct-source-card ${
            appliedFilters.userSource === "venue" ? "active-venue" : ""
          }`}
        >
          <div>
            <p className="uct-source-label">From Venue</p>
            <p className="uct-source-count">
              {loading ? "..." : (stats?.venueUsers ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="uct-source-icon uct-bg-emerald">
            <Building2 size={20} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleQuickSourceFilter("wonderland")}
          className={`uct-source-card ${
            appliedFilters.userSource === "wonderland"
              ? "active-wonderland"
              : ""
          }`}
        >
          <div>
            <p className="uct-source-label">From Wonderland</p>
            <p className="uct-source-count">
              {loading ? "..." : (stats?.wonderlandUsers ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="uct-source-icon uct-bg-purple">
            <Sparkles size={20} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleQuickSourceFilter("capsule")}
          className={`uct-source-card ${
            appliedFilters.userSource === "capsule" ? "active-capsule" : ""
          }`}
        >
          <div>
            <p className="uct-source-label">From Capsule</p>
            <p className="uct-source-count">
              {loading ? "..." : (stats?.capsuleUsers ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="uct-source-icon uct-bg-amber">
            <Box size={20} />
          </div>
        </button>
      </div>

      {/* Filters Panel */}
      <div className="uct-filter-box">
        <div className="uct-filter-row-top">
          <div className="uct-field">
            <label>Search User</label>
            <div className="uct-input-wrap">
              <Search size={15} className="uct-input-icon" />
              <input
                type="text"
                placeholder="Search by user name or phone..."
                value={search}
                onChange={handleSearchChange}
                className="uct-input has-icon"
              />
            </div>
          </div>

          <div className="uct-field">
            <label>City</label>
            <select
              value={pendingFilters.cityName}
              onChange={(e) =>
                handleFilterFieldChange("cityName", e.target.value)
              }
              className="uct-select"
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
          </div>

          <div className="uct-field">
            <label>Start Date</label>
            <input
              type="date"
              value={pendingFilters.startDate}
              onChange={(e) =>
                handleFilterFieldChange("startDate", e.target.value)
              }
              className="uct-input"
            />
          </div>

          <div className="uct-field">
            <label>End Date</label>
            <input
              type="date"
              value={pendingFilters.endDate}
              onChange={(e) =>
                handleFilterFieldChange("endDate", e.target.value)
              }
              className="uct-input"
            />
          </div>

          <div className="uct-btn-group">
            <button
              type="button"
              disabled={!hasPendingFilterChanges}
              onClick={handleApplyFilters}
              className="uct-btn uct-btn-apply"
            >
              <Filter size={15} />
              Apply
            </button>

            <button
              type="button"
              disabled={!hasAppliedFilters && !hasPendingFilterChanges}
              onClick={handleClearFilters}
              className="uct-btn uct-btn-reset"
            >
              <RotateCcw size={15} />
              Reset
            </button>
          </div>
        </div>

        <div className="uct-filter-row-bottom">
          <div className="uct-pills-group">
            <span className="uct-group-label">User From:</span>
            {USER_SOURCES.map((src) => (
              <button
                key={src.value || "all"}
                type="button"
                onClick={() =>
                  handleFilterFieldChange("userSource", src.value)
                }
                className={`uct-pill ${
                  pendingFilters.userSource === src.value ? "active" : ""
                }`}
              >
                {src.label}
              </button>
            ))}
          </div>

          <div className="uct-chips-group">
            {[
              { key: "searchedUsers", label: "Only Searched" },
              { key: "eventDateUsers", label: "Only Event Date" },
              { key: "whatsappUsers", label: "Only WhatsApp" },
              { key: "loggedInUsers", label: "Only Logged-in" },
            ].map((item) => {
              const checked = pendingFilters[item.key];
              return (
                <label
                  key={item.key}
                  className={`uct-chip ${checked ? "checked" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      handleFilterFieldChange(item.key, e.target.checked)
                    }
                  />
                  {item.label}
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="uct-table-card">
        <div className="uct-table-scroll">
          <table className="uct-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Phone</th>
                <th>User From</th>
                <th>City</th>
                <th>Visitor ID</th>
                <th>User ID</th>
                <th className="uct-text-center">Searches</th>
                <th className="uct-text-center">Event Dates</th>
                <th className="uct-text-center">WhatsApp</th>
                <th>Created Date</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="uct-empty-row">
                    Loading tracking records...
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item) => {
                  const waClicks = item?.clickCounts?.whatsapp || 0;
                  return (
                    <tr key={item._id}>
                      <td className="uct-bold">
                        {item?.user?.name || (
                          <span className="uct-muted">Guest</span>
                        )}
                      </td>
                      <td>{item?.user?.phone || "N/A"}</td>
                      <td>{getUserSourceBadge(item?.user)}</td>
                      <td className="uct-capitalize">
                        {item?.cityName === "NOT_SELECTED" ? (
                          <span className="uct-badge uct-badge-not-selected">
                            Not Selected
                          </span>
                        ) : (
                          item?.cityName || "N/A"
                        )}
                      </td>
                      <td>{renderTruncatedId(item?.visitorId)}</td>
                      <td>{renderTruncatedId(item?.user?._id)}</td>
                      <td className="uct-text-center uct-bold">
                        {item?.searchCount || 0}
                      </td>
                      <td className="uct-text-center uct-bold">
                        {item?.eventDateCount || 0}
                      </td>
                      <td className="uct-text-center">
                        <span
                          className={`uct-wa-pill ${
                            waClicks > 0 ? "active" : ""
                          }`}
                        >
                          {waClicks}
                        </span>
                      </td>
                      <td className="uct-muted">
                        {formatDate(item?.createdAt)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="uct-empty-row">
                    No tracking records match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalRecords > 0 && (
          <div className="uct-pagination-bar">
            <div className="uct-pagination-left">
              <span>
                Showing <strong>{startRecord.toLocaleString()}</strong> –{" "}
                <strong>{endRecord.toLocaleString()}</strong> of{" "}
                <strong>{totalRecords.toLocaleString()}</strong>
              </span>

              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="uct-limit-select"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>

            <div className="uct-pagination-right">
              <button
                type="button"
                disabled={page === 1 || loading}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="uct-page-btn"
              >
                <ChevronLeft size={15} />
                Prev
              </button>

              <span>
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </span>

              <button
                type="button"
                disabled={loading || page >= totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className="uct-page-btn"
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCitiesTracking;