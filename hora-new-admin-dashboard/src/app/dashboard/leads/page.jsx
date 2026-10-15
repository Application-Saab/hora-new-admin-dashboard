"use client";

import React, { useEffect, useState, useRef } from "react";
import "./leads.css";
import { BASE_URL } from "@/utils/apiconstant";

export default function LeadAnalytics() {
    const [agentData, setAgentData] = useState([]);
    const [totalLeads, setTotalLeads] = useState(0);
    const [sourceData, setSourceData] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("all");

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const sourceDropdownRef = useRef(null);

    const [sourceOptions, setSourceOptions] = useState([]);
    const [selectedSources, setSelectedSources] = useState([]);
    const [allLeads, setAllLeads] = useState([]);
    const [allLeadsLoading, setAllLeadsLoading] = useState(false);
    const [allLeadsError, setAllLeadsError] = useState("");
    const [leadPage, setLeadPage] = useState(1);
    const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
    const [leadPagination, setLeadPagination] = useState({});
    const [leadFilters, setLeadFilters] = useState({
        name: "",
        phoneNumber: "",
        source: "",
        startDate: "",
        endDate: "",
        startEventDate: "",
        endEventDate: "",
    });


    const fetchUniqueSources = async () => {
        try {
            const response = await fetch(
                `${BASE_URL}/api/leads/unique-sources`
            );

            const result = await response.json();

            if (response.ok && !result.error) {
                setSourceOptions(
                    (result.data || [])
                        .map((item) => item.name)
                        .filter(Boolean)
                );
            }
        } catch (err) {
            console.error("Error fetching unique sources:", err);
        }
    };



    const fetchAllLeads = async (page = 1, filters = leadFilters, sources = selectedSources) => {
        try {
            setAllLeadsLoading(true);
            setAllLeadsError("");

            const params = new URLSearchParams({
                page: String(page),
                limit: "40"
            });


            Object.entries(filters).forEach(([key, value]) => {
                if (value.trim()) {
                    params.append(key, value.trim());
                }
                if (sources.length > 0) {
                    params.set("sources", sources.join(","));
                }
            });


            const response = await fetch(
                `${BASE_URL}/api/leads/admin-leads?${params.toString()}`
            );

            const result = await response.json();

            if (!response.ok || result.error) {
                throw new Error(result.message || "Failed to load leads.");
            }

            setAllLeads(result.data || []);
            setLeadPagination(result.pagination || {});
            setLeadPage(page);
        } catch (err) {
            console.error(err);
            setAllLeadsError(err.message || "Error fetching leads.");
        } finally {
            setAllLeadsLoading(false);
        }
    };



    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                sourceDropdownRef.current &&
                !sourceDropdownRef.current.contains(event.target)
            ) {
                setSourceDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("touchstart", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("touchstart", handleOutsideClick);
        };
    }, []);

    const agentConfirmedOrders = agentData.reduce(
        (total, item) =>
            total + Number(item.orderConfirmed || 0),
        0
    );

    const sourceConfirmedOrders = sourceData.reduce(
        (total, item) =>
            total + Number(item.orderConfirmed || 0),
        0
    );

    const getDateQuery = () => {
        const params = new URLSearchParams();

        if (startDate) {
            params.append("startDate", startDate);
        }

        if (endDate) {
            params.append("endDate", endDate);
        }

        if (activeTab === "source" && selectedSources.length > 0) {
            params.set("sources", selectedSources.join(","));
        }

        console.log("Selected sources:", selectedSources);

        return params.toString() ? `?${params.toString()}` : "";
    };

    const fetchAgentData = async () => {
        try {
            setLoading(true);
            setError(null);

            const query = getDateQuery();

            const response = await fetch(
                `${BASE_URL}/api/leads/agent-analytics${query}`
            );

            const result = await response.json();

            if (!result.error && result.data) {
                setAgentData(result.data);
                setTotalLeads(result.totalLeads || 0);
            } else {
                setError(
                    result.message ||
                    "Failed to load agent analytics."
                );
            }
        } catch (err) {
            console.error(err);

            setError(
                "Server error while fetching agent analytics."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchSourceData = async () => {
        try {
            setLoading(true);
            setError(null);

            const query = getDateQuery();

            const response = await fetch(
                `${BASE_URL}/api/leads/source-analytics${query}`
            );

            const result = await response.json();

            if (!result.error && result.data) {
                setSourceData(result.data);
                setTotalLeads(result.totalLeads || 0);
            } else {
                setError(
                    result.message ||
                    "Failed to load source analytics."
                );
            }
        } catch (err) {
            console.error(err);

            setError(
                "Server error while fetching source analytics."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "agent") {
            fetchAgentData();
        } else if (activeTab === "source") {
            fetchSourceData();
            fetchUniqueSources();
        } else if (activeTab === "all") {
            fetchAllLeads(1, leadFilters);
            fetchUniqueSources();
        }
    }, [activeTab]);

    const handleApplyFilter = () => {
        setError(null);

        if (startDate && endDate && startDate > endDate) {
            setError(
                "Start date cannot be greater than end date."
            );
            return;
        }

        if (activeTab === "agent") {
            fetchAgentData();
        } else {
            fetchSourceData();
        }
    };

    const handleClearFilter = () => {
        setStartDate("");
        setEndDate("");
        setSelectedSources([])

        if (activeTab === "agent") {
            fetchAgentDataWithoutFilter();
        } else {
            setSelectedSources([]);
            fetchSourceDataWithoutFilter();
        }
    };

    const fetchAgentDataWithoutFilter = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `${BASE_URL}/api/leads/agent-analytics`
            );

            const result = await response.json();

            if (!result.error && result.data) {
                setAgentData(result.data);
                setTotalLeads(result.totalLeads || 0);
            } else {
                setError(
                    result.message ||
                    "Failed to load agent analytics."
                );
            }
        } catch (err) {
            console.error(err);

            setError(
                "Server error while fetching agent analytics."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchSourceDataWithoutFilter = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `${BASE_URL}/api/leads/source-analytics`
            );

            const result = await response.json();

            if (!result.error && result.data) {
                setSourceData(result.data);
                setTotalLeads(result.totalLeads || 0);
            } else {
                setError(
                    result.message ||
                    "Failed to load source analytics."
                );
            }
        } catch (err) {
            console.error(err);

            setError(
                "Server error while fetching source analytics."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        if (activeTab === "agent") {
            fetchAgentData();
        } else {
            fetchSourceData();
        }
    };

    

    return (
        <div className="analytics-container">

            <div className="analytics-header">
                <div>
                    <h2 className="analytics-title">
                        Leads Tracking
                    </h2>
                </div>

                {/* Tabs */}
                <div className="tab-container">

                    <button
                        className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
                        onClick={() => setActiveTab("all")}
                    >
                        All Leads
                    </button>

                    <button
                        className={`tab-btn ${activeTab === "agent"
                                ? "active"
                                : ""
                            } `}
                        onClick={() =>
                            setActiveTab("agent")
                        }
                    >
                        Agent Table
                    </button>

                    <button
                        className={`tab-btn ${activeTab === "source"
                                ? "active"
                                : ""
                            } `}
                        onClick={() =>
                            setActiveTab("source")
                        }
                    >
                        Source Table
                    </button>
                </div>
            </div>

            {activeTab !== "all" &&
            <div className="date-filter">

                <div className="date-field">
                    <label>Start Date</label>

                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) =>
                            setStartDate(e.target.value)
                        }
                    />
                </div>

                <div className="date-field">
                    <label>End Date</label>

                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) =>
                            setEndDate(e.target.value)
                        }
                    />
                </div>

                    {activeTab === "source" && (
                        <div className="source-dropdown" ref={sourceDropdownRef}>
                            <label>Search Source</label>

                            <button
                                type="button"
                                className="source-dropdown-btn"
                                onClick={() =>
                                    setSourceDropdownOpen((prev) => !prev)
                                }
                            >
                                {selectedSources.length === 0
                                    ? "All Sources"
                                    : `${selectedSources.length} sources selected`}

                                <span>
                                    {sourceDropdownOpen ? "▲" : "▼"}
                                </span>
                            </button>

                            {sourceDropdownOpen && (
                                <div className="source-dropdown-menu">
                                    {sourceOptions.length > 0 ? (
                                        sourceOptions.map((source) => (
                                            <label
                                                key={source}
                                                className="source-checkbox-option"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSources.includes(source)}
                                                    onChange={() => {
                                                        setSelectedSources((prev) =>
                                                            prev.includes(source)
                                                                ? prev.filter(
                                                                    (item) => item !== source
                                                                )
                                                                : [...prev, source]
                                                        );
                                                    }}
                                                />

                                                <span>{source}</span>
                                            </label>
                                        ))
                                    ) : (
                                        <p className="source-empty">
                                            No sources available
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    
                <button
                    className="apply-btn"
                    onClick={handleApplyFilter}
                >
                    Apply Filter
                </button>

                <button
                    className="clear-btn"
                    onClick={handleClearFilter}
                >
                    Clear
                </button>
            </div>
}

            {loading && (
                <div className="analytics-state">
                    <div className="spinner"></div>

                    <p>
                        Loading{" "}
                        {activeTab === "agent"
                            ? "Agent"
                            : "Source"}{" "}
                        Analytics...
                    </p>
                </div>
            )}

            {!loading && error && (
                <div className="analytics-state error-box">
                    <p>{error}</p>

                    <button
                        onClick={handleRetry}
                        className="retry-btn"
                    >
                        Retry
                    </button>
                </div>
            )}



            {activeTab === "all" && (
                <div className="table-card">

                    <div className="date-filter-all">
                        <div className="date-field">
                            <label>Name / Agent</label>
                            <input
                                type="text"
                                placeholder="Search name..."
                                value={leadFilters.name}
                                onChange={(e) =>
                                    setLeadFilters({
                                        ...leadFilters,
                                        name: e.target.value
                                    })
                                }
                            />
                        </div>

                        <div className="date-field">
                            <label>Phone Number</label>
                            <input
                                type="text"
                                placeholder="Search phone..."
                                value={leadFilters.phoneNumber}
                                onChange={(e) =>
                                    setLeadFilters({
                                        ...leadFilters,
                                        phoneNumber: e.target.value
                                    })
                                }
                            />
                        </div>



                        <div className="source-dropdown" ref={sourceDropdownRef}>
                            <label>Search Source</label>

                            <button
                                type="button"
                                className="source-dropdown-btn"
                                onClick={() =>
                                    setSourceDropdownOpen((prev) => !prev)
                                }
                            >
                                {selectedSources.length === 0
                                    ? "All Sources"
                                    : `${selectedSources.length} sources selected`}

                                <span>
                                    {sourceDropdownOpen ? "▲" : "▼"}
                                </span>
                            </button>

                            {sourceDropdownOpen && (
                                <div className="source-dropdown-menu">
                                    {sourceOptions.length > 0 ? (
                                        sourceOptions.map((source) => (
                                            <label
                                                key={source}
                                                className="source-checkbox-option"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSources.includes(source)}
                                                    onChange={() => {
                                                        setSelectedSources((prev) =>
                                                            prev.includes(source)
                                                                ? prev.filter((item) => item !== source)
                                                                : [...prev, source]
                                                        );
                                                    }}
                                                />

                                                <span>{source}</span>
                                            </label>
                                        ))
                                    ) : (
                                        <p className="source-empty">
                                            No sources available
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                            
                        <div className="date-field">
                            <label>Create Start Date</label>
                            <input
                                type="date"
                                value={leadFilters.startDate}
                                onChange={(e) =>
                                    setLeadFilters({
                                        ...leadFilters,
                                        startDate: e.target.value
                                    })
                                }
                            />
                        </div>

                        <div className="date-field">
                            <label>Create End Date</label>
                            <input
                                type="date"
                                value={leadFilters.endDate}
                                onChange={(e) =>
                                    setLeadFilters({
                                        ...leadFilters,
                                        endDate: e.target.value
                                    })
                                }
                            />
                        </div>

                        <div className="date-field">
                            <label>Event Start Date</label>
                            <input
                                type="date"
                                value={leadFilters.startEventDate}
                                onChange={(e) =>
                                    setLeadFilters({
                                        ...leadFilters,
                                        startEventDate: e.target.value
                                    })
                                }
                            />
                        </div>

                        <div className="date-field">
                            <label>Event End Date</label>
                            <input
                                type="date"
                                value={leadFilters.endEventDate}
                                onChange={(e) =>
                                    setLeadFilters({
                                        ...leadFilters,
                                        endEventDate: e.target.value
                                    })
                                }
                            />
                        </div>

                        <button
                            className="apply-btn"
                            onClick={() => {
                                if (
                                    leadFilters.startDate &&
                                    leadFilters.endDate &&
                                    leadFilters.startDate > leadFilters.endDate
                                ) {
                                    setAllLeadsError(
                                        "Start date cannot be greater than end date."
                                    );
                                    return;
                                }

                                if (
                                    leadFilters.startEventDate &&
                                    leadFilters.endEventDate &&
                                    leadFilters.startEventDate > leadFilters.endEventDate
                                ) {
                                    setAllLeadsError(
                                        "Event start date cannot be greater than event end date."
                                    );
                                    return;
                                }

                                fetchAllLeads(1, leadFilters);
                            }}
                        >
                            Apply
                        </button>

                        <button
                            className="clear-btn"
                            onClick={() => {
                                const emptyFilters = {
                                    name: "",
                                    phoneNumber: "",
                                    source: "",
                                    startDate: "",
                                    endDate: "",
                                    startEventDate: "",
                                    endEventDate: "",
                                };


                                setLeadFilters(emptyFilters);
                                setSelectedSources([]);
                                setSourceDropdownOpen(false);
                                fetchAllLeads(1, emptyFilters, []);
                                fetchUniqueSources();

                            }}
                        >
                            Clear
                        </button>
                    </div>

                    

                    <div className="leads-pagination-row">
                        <div className="analytics-summary">
                            <div className="summary-box">
                                <span>Total Leads</span>
                                <strong>{leadPagination.totalRecords || 0}</strong>
                            </div>
                        </div>

                        <div className="leads-pagination">
                            <span className="leads-page-info">
                                Page {leadPagination.currentPage || 1} of{" "}
                                {leadPagination.totalPages || 0}
                            </span>

                            <button
                                className="clear-btn"
                                disabled={
                                    allLeadsLoading ||
                                    !leadPagination.hasPrevPage
                                }
                                onClick={() => fetchAllLeads(leadPage - 1)}
                            >
                                Previous
                            </button>

                            <button
                                className="apply-btn"
                                disabled={
                                    allLeadsLoading ||
                                    !leadPagination.hasNextPage
                                }
                                onClick={() => fetchAllLeads(leadPage + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>


                    {allLeadsLoading ? (
                        <div className="analytics-state">
                            <div className="spinner"></div>
                            <p>Loading leads...</p>
                        </div>
                    ) : allLeadsError ? (
                        <div className="analytics-state error-box">
                            <p>{allLeadsError}</p>
                            <button
                                className="retry-btn"
                                onClick={() => fetchAllLeads(leadPage)}
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="table-wrapper">
                                <table className="analytics-table">
                                    <thead>
                                        <tr>
                                            <th>Phone Number</th>
                                            <th>Agent Name</th>
                                            <th>Source</th>
                                            <th>Create Date</th>
                                            <th>Event Date</th>
                                            <th>Order Summary</th>
                                            <th>Order Confirmed</th>
                                            <th>Event Details</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {allLeads.length > 0 ? (
                                            allLeads.map((lead, index) => (
                                                <tr key={lead._id || index}>
                                                    <td>{lead.phoneNumber || "-"}</td>
                                                    <td>{lead.agentName || "-"}</td>
                                                    <td>{lead.source || "-"}</td>
                                                    <td>{lead.date || "-"}</td>
                                                    <td>{lead.eventDate || "-"}</td>
                                                    <td>
                                                        <span
                                                            className={
                                                                lead.orderSummary === "Yes"
                                                                    ? "confirmed-pill"
                                                                    : "not-confirmed-pill"
                                                            }
                                                        >
                                                            {lead.orderStatus || "No"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={
                                                                lead.orderStatus === "Yes"
                                                                    ? "confirmed-pill"
                                                                    : "not-confirmed-pill"
                                                            }
                                                        >
                                                            {lead.orderStatus || "No"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={
                                                                lead.eventDetails === "Yes"
                                                                    ? "confirmed-pill"
                                                                    : "not-confirmed-pill"
                                                            }
                                                        >
                                                            {lead.orderStatus || "No"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="no-data">
                                                    No Leads Available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                        </>
                    )}
                </div>
            )}


            {!loading &&
                !error &&
                activeTab === "agent" && (
                    <div className="table-card">

                        {/* AGENT SUMMARY */}
                        <div className="analytics-summary">

                            <div className="summary-box">
                                <span>
                                    Total Agents
                                </span>

                                <strong>
                                    {agentData.length}
                                </strong>
                            </div>

                            <div className="summary-box">
                                <span>
                                    Total Leads
                                </span>

                                <strong>
                                    {totalLeads}
                                </strong>
                            </div>

                            <div className="summary-box">
                                <span>
                                    Confirmed Orders
                                </span>

                                <strong>
                                    {agentConfirmedOrders}
                                </strong>
                            </div>

                        </div>

                        <div className="table-wrapper">
                            <table className="analytics-table">

                                <thead>
                                    <tr>
                                        <th>
                                            Agent Assigned
                                        </th>

                                        <th>
                                            Total Leads Assigned
                                        </th>

                                        <th>
                                            Order Confirmed
                                        </th>

                                        <th>
                                            Conversion Ratio
                                        </th>

                                    <th>
                                        Order Summary
                                    </th>


                                    <th>
                                       Event Details
                                    </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {agentData.length > 0 ? (
                                        agentData.map(
                                            (item, index) => (
                                                <tr key={index}>

                                                    <td className="font-semibold text-primary">
                                                        {item.name}
                                                    </td>

                                                    <td>
                                                        {
                                                            item.totalLeadsAssigned
                                                        }
                                                    </td>

                                                    <td>
                                                        <span className="confirmed-pill">
                                                            {
                                                                item.orderConfirmed
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span className="conversion-badge">
                                                            {
                                                                item.conversionRatio
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span className="confirmed-pill">
                                                            {
                                                                item.orderSummaryCount
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span className="confirmed-pill">
                                                            {
                                                                item.eventDetailsCount
                                                            }
                                                        </span>
                                                    </td>

                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="no-data"
                                            >
                                                No Agent Data Available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                            </table>
                        </div>
                    </div>
                )}

            {!loading &&
                !error &&
                activeTab === "source" && (
                    <div className="table-card">

                        {/* SOURCE SUMMARY */}
                        <div className="analytics-summary">

                            <div className="summary-box">
                                <span>
                                    Total Sources
                                </span>

                                <strong>
                                    {sourceData.length}
                                </strong>
                            </div>

                            <div className="summary-box">
                                <span>
                                    Total Leads
                                </span>

                                <strong>
                                    {totalLeads}
                                </strong>
                            </div>

                            <div className="summary-box">
                                <span>
                                    Confirmed Orders
                                </span>

                                <strong>
                                    {sourceConfirmedOrders}
                                </strong>
                            </div>

                        </div>

                        {/* SOURCE TABLE */}
                        <div className="table-wrapper">
                            <table className="analytics-table">

                                <thead>
                                    <tr>
                                        <th>Source</th>

                                        <th>
                                            Total Leads Assigned
                                        </th>

                                        <th>
                                            Order Confirmed
                                        </th>

                                        <th>
                                            Conversion Ratio
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {sourceData.length > 0 ? (
                                        sourceData.map(
                                            (item, index) => (
                                                <tr key={index}>

                                                    <td className="font-semibold text-primary">
                                                        {item.name}
                                                    </td>

                                                    <td>
                                                        {
                                                            item.totalLeadsAssigned
                                                        }
                                                    </td>

                                                    <td>
                                                        <span className="confirmed-pill">
                                                            {
                                                                item.orderConfirmed
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span className="conversion-badge">
                                                            {
                                                                item.conversionRatio
                                                            }
                                                        </span>
                                                    </td>

                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="no-data"
                                            >
                                                No Source Data Available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                            </table>
                        </div>
                    </div>
                )}
        </div>
    );
}