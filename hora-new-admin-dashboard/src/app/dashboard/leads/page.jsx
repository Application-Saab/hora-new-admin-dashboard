"use client";

import React, { useEffect, useState } from "react";
import "./leads.css";
import { BASE_URL } from "@/utils/apiconstant";

export default function LeadAnalytics() {
    const [agentData, setAgentData] = useState([]);
    const [totalLeads, setTotalLeads] = useState(0);
    const [sourceData, setSourceData] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("agent");

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

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

        const query = params.toString();

        return query ? `?${query}` : "";
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
                `${BASE_URL}/api/leads/source-analytics${query} `
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
        } else {
            fetchSourceData();
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

        if (activeTab === "agent") {
            fetchAgentDataWithoutFilter();
        } else {
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