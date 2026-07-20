"use client";

import React, { useEffect, useState } from "react";
import "./error-logs-tracking.css";
import { fetchErrorLogs } from "./error-logs-service";
import ErrorLogModal from "./ErrorLogModal";

const ErrorLogs = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [type, setType] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedLog, setSelectedLog] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchErrorLogs({
      setLoading,
      setData,
      setPagination,
      page,
      search: debouncedSearch,
      type,
      startDate,
      endDate,
    });
  }, [page, debouncedSearch, type, startDate, endDate]);

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

  const formatTime = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <>
      <div className="container">
        <h1 className="header-title">Error Logs</h1>

        <div className="filters-container">
          <input
            type="text"
            placeholder="Search message, endpoint, page, browser..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              width: "320px",
              marginRight: "10px",
              padding: "5px",
            }}
          />

          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Types</option>
            <option value="frontend">Frontend</option>
            <option value="api">API</option>
            <option value="server">Server</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            style={{
              marginLeft: "10px",
              padding: "6px",
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
              marginLeft: "10px",
              padding: "6px",
            }}
          />

          <button
            onClick={() => {
              setSearch("");
              setDebouncedSearch("");
              setType("");
              setStartDate("");
              setEndDate("");
              setPage(1);
            }}
            style={{
              marginLeft: "10px",
              padding: "6px 12px",
              cursor: "pointer",
            }}
          >
            Clear Filter
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Status</th>
                <th>Browser</th>
                <th>Device</th>
                <th>User/Visitor ID</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {data.length ? (
                data.map((item) => (
                  <tr key={item._id}>
                    <td>{item.type || "N/A"}</td>
                    <td>{item.statusCode || "N/A"}</td>
                    <td>{item.browser || "N/A"}</td>
                    <td>{item.device || "N/A"}</td>
                    <td>{item.userId || item.visitorId || "N/A"}</td>

                    <td>
                      {formatDate(item.timestamp)} |{" "}
                      {formatTime(item.timestamp)}
                    </td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => {
                          setSelectedLog(item);
                          setOpenModal(true);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={11}
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
      <ErrorLogModal
        open={openModal}
        data={selectedLog}
        onClose={() => {
          setOpenModal(false);
          setSelectedLog(null);
        }}
      />
    </>
  );
};

export default ErrorLogs;
