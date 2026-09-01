"use client";

import React, { useEffect, useState } from 'react';
import './leads.css';
import { BASE_URL } from '@/utils/apiconstant';

export default function LeadAnalytics() {
    const [agentData, setAgentData] = useState([]);
    const [sourceData, setSourceData] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('agent'); 

    const fetchAgentData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${BASE_URL}/api/leads/agent-analytics`);
            const result = await response.json();

            if (!result.error && result.data) {
                setAgentData(result.data);
            } else {
                setError(result.message || 'Failed to load agent analytics.');
            }
        } catch (err) {
            setError('Server error while fetching agent analytics.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSourceData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${BASE_URL}/api/leads/source-analytics`);
            const result = await response.json();

            if (!result.error && result.data) {
                setSourceData(result.data);
            } else {
                setError(result.message || 'Failed to load source analytics.');
            }
        } catch (err) {
            setError('Server error while fetching source analytics.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Tab switch hone par Lazy-Fetch handling
    useEffect(() => {
        if (activeTab === 'agent' && agentData.length === 0) {
            fetchAgentData();
        } else if (activeTab === 'source' && sourceData.length === 0) {
            fetchSourceData();
        }
    }, [activeTab]);

    const handleRetry = () => {
        if (activeTab === 'agent') fetchAgentData();
        if (activeTab === 'source') fetchSourceData();
    };

    return (
        <div className="analytics-container">
            {/* Header Section */}
            <div className="analytics-header">
                <div>
                    <h2 className="analytics-title">Leads Trackingg</h2>
                </div>

                {/* Tabs Switcher */}
                <div className="tab-container">
                    <button
                        className={`tab-btn ${activeTab === 'agent' ? 'active' : ''}`}
                        onClick={() => setActiveTab('agent')}
                    >
                        Agent Table
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'source' ? 'active' : ''}`}
                        onClick={() => setActiveTab('source')}
                    >
                        Source Table
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="analytics-state">
                    <div className="spinner"></div>
                    <p>Loading {activeTab === 'agent' ? 'Agent' : 'Source'} Analytics...</p>
                </div>
            )}

            {/* Error State */}
            {!loading && error && (
                <div className="analytics-state error-box">
                    <p>{error}</p>
                    <button onClick={handleRetry} className="retry-btn">Retry</button>
                </div>
            )}

            {/* Table 1: Agent Wise Analytics */}
            {!loading && !error && activeTab === 'agent' && (
                <div className="table-card">
                    <div className="table-card-header">
                        <span className="count-badge">Total :{agentData.length} Agents</span>
                    </div>
                    <div className="table-wrapper">
                        <table className="analytics-table">
                            <thead>
                                <tr>
                                    <th>Agent Assigned</th>
                                    <th>Total Leads Assigned</th>
                                    <th>Order Confirmed</th>
                                    <th>Conversion Ratio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agentData.length > 0 ? (
                                    agentData.map((item, index) => (
                                        <tr key={index}>
                                            <td className="font-semibold text-primary">{item.name}</td>
                                            <td>{item.totalLeadsAssigned}</td>
                                            <td>
                                                <span className="confirmed-pill">{item.orderConfirmed}</span>
                                            </td>
                                            <td>
                                                <span className="conversion-badge">{item.conversionRatio}</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="no-data">No Agent Data Available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Table 2: Source Wise Analytics */}
            {!loading && !error && activeTab === 'source' && (
                <div className="table-card">
                    <div className="table-card-header">
                        <span className="count-badge">Total : {sourceData.length} Sources</span>
                    </div>
                    <div className="table-wrapper">
                        <table className="analytics-table">
                            <thead>
                                <tr>
                                    <th>Source</th>
                                    <th>Total Leads Assigned</th>
                                    <th>Order Confirmed</th>
                                    <th>Conversion Ratio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sourceData.length > 0 ? (
                                    sourceData.map((item, index) => (
                                        <tr key={index}>
                                            <td className="font-semibold text-primary">{item.name}</td>
                                            <td>{item.totalLeadsAssigned}</td>
                                            <td>
                                                <span className="confirmed-pill">{item.orderConfirmed}</span>
                                            </td>
                                            <td>
                                                <span className="conversion-badge">{item.conversionRatio}</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="no-data">No Source Data Available</td>
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