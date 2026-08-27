"use client";

import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../../utils/apiconstant";
import CommonPop from "../../component/CommonPopup";
import "../team/team.css";

const TeamPage = () => {
    const [teams, setTeams] = useState([]);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);

    const [leaveForm, setLeaveForm] = useState({
        days: "",
        startDate: "",
        endDate: "",
    });

    const [searchNumber, setSearchNumber] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [loading, setLoading] = useState(false);
    const [addLoading, setAddLoading] = useState(false);

    const getTeams = async (
        number = searchNumber,
        filterStartDate = startDate,
        filterEndDate = endDate
    ) => {
        try {
            setLoading(true);

            let url = `${BASE_URL}/api/team/getAll`;
            const params = new URLSearchParams();

            if (number) {
                params.append("number", number);
            }

            if (filterStartDate) {
                params.append("startDate", filterStartDate);
            }

            if (filterEndDate) {
                params.append("endDate", filterEndDate);
            }

            const queryString = params.toString();

            if (queryString) {
                url += `?${queryString}`;
            }

            console.log("GET TEAM API:", url);

            const response = await fetch(url);
            const contentType = response.headers.get("content-type");

            if (
                !contentType ||
                !contentType.includes("application/json")
            ) {
                const text = await response.text();
                console.error("API returned non-JSON:", text);
                throw new Error("Invalid API response");
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to fetch teams"
                );
            }

            setTeams(result.data || []);
        } catch (error) {
            console.error("Get team error:", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getTeams();
    }, []);

    const handleAddLeaveClick = (item) => {
        setSelectedTeam(item);

        setLeaveForm({
            days: "",
            startDate: "",
            endDate: "",
        });

        setShowLeaveModal(true);
    };

    const handleCloseModal = () => {
        if (addLoading) {
            return;
        }

        setShowLeaveModal(false);
        setSelectedTeam(null);

        setLeaveForm({
            days: "",
            startDate: "",
            endDate: "",
        });
    };

    const handleAddLeave = async () => {
        if (!selectedTeam?._id) {
            alert("Team member not selected");
            return;
        }

        if (!leaveForm.days) {
            alert("Please enter leave days");
            return;
        }

        if (Number(leaveForm.days) <= 0) {
            alert("Leave days must be greater than 0");
            return;
        }

        if (!leaveForm.startDate) {
            alert("Please select start date");
            return;
        }

        if (!leaveForm.endDate) {
            alert("Please select end date");
            return;
        }

        const startDateObj = new Date(
            `${leaveForm.startDate}T00:00:00`
        );

        const endDateObj = new Date(
            `${leaveForm.endDate}T00:00:00`
        );

        if (endDateObj < startDateObj) {
            alert("End date cannot be before start date");
            return;
        }

        const calculatedDays =
            Math.floor(
                (endDateObj - startDateObj) /
                (1000 * 60 * 60 * 24)
            ) + 1;

        if (calculatedDays !== Number(leaveForm.days)) {
            alert(
                `Please select exactly ${leaveForm.days} leave days. Dates should not be more or less.`
            );
            return;
        }

        try {
            setAddLoading(true);

            const response = await fetch(
                `${BASE_URL}/api/team/edit/${selectedTeam._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        days: Number(leaveForm.days),
                        startDate: leaveForm.startDate,
                        endDate: leaveForm.endDate,
                    }),
                }
            );

            const contentType =
                response.headers.get("content-type");

            if (
                !contentType ||
                !contentType.includes("application/json")
            ) {
                const text = await response.text();
                console.error("API returned non-JSON:", text);
                throw new Error("Invalid API response");
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to add leave"
                );
            }

            alert("Leave added successfully");

            setShowLeaveModal(false);
            setSelectedTeam(null);

            setLeaveForm({
                days: "",
                startDate: "",
                endDate: "",
            });

            getTeams(
                searchNumber,
                startDate,
                endDate
            );
        } catch (error) {
            console.error("Add leave error:", error);
            alert(error.message);
        } finally {
            setAddLoading(false);
        }
    };

    const handleNumberSearch = (e) => {
        const value = e.target.value.replace(/\D/g, "");

        setSearchNumber(value);

        if (value.length === 10) {
            getTeams(value, startDate, endDate);
        }

        if (value.length === 0) {
            getTeams("", startDate, endDate);
        }
    };

    const handleStartDateChange = (e) => {
        const value = e.target.value;

        setStartDate(value);

        getTeams(
            searchNumber,
            value,
            endDate
        );
    };

    const handleEndDateChange = (e) => {
        const value = e.target.value;

        setEndDate(value);

        getTeams(
            searchNumber,
            startDate,
            value
        );
    };

    const handleClearFilter = () => {
        setSearchNumber("");
        setStartDate("");
        setEndDate("");

        getTeams("", "", "");
    };

    const leavePopupBody = selectedTeam && (
        <div className="leave-popup-form">
            <div className="leave-popup-employee">
                <div>
                    <span>Employee: </span>
                    <strong>
                        {selectedTeam.name || "-"}
                    </strong>
                </div>

                <div>
                    <span>Number: </span>
                    <strong>
                        {selectedTeam.number || "-"}
                    </strong>
                </div>
            </div>

            <div className="team-form-group">
                <label>Leave Days</label>

                <input
                    type="number"
                    min="1"
                    value={leaveForm.days}
                    onChange={(e) =>
                        setLeaveForm({
                            ...leaveForm,
                            days: e.target.value,
                        })
                    }
                    placeholder="Enter leave days"
                />
            </div>

            <div className="team-form-group">
                <label>Start Date</label>

                <input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) =>
                        setLeaveForm({
                            ...leaveForm,
                            startDate: e.target.value,
                        })
                    }
                />
            </div>

            <div className="team-form-group">
                <label>End Date</label>

                <input
                    type="date"
                    min={leaveForm.startDate || undefined}
                    value={leaveForm.endDate}
                    onChange={(e) =>
                        setLeaveForm({
                            ...leaveForm,
                            endDate: e.target.value,
                        })
                    }
                />
            </div>
        </div>
    );

    return (
        <div className="team-page">
            <div className="team-header">
                <h1 className="team-title">
                    Leave System
                </h1>
            </div>

            <div className="team-card2">
                <div
                    className="team-search"
                    style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                        alignItems: "end",
                    }}
                >
                    <div>
                        <div>
                            <label>Number</label>
                        </div>

                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={10}
                            value={searchNumber}
                            onChange={handleNumberSearch}
                            placeholder="Search by number"
                        />
                    </div>

                    <div>
                        <div>
                            <label>Start Date</label>
                        </div>

                        <input
                            type="date"
                            value={startDate}
                            onChange={handleStartDateChange}
                        />
                    </div>

                    <div>
                        <div>
                            <label>End Date</label>
                        </div>

                        <input
                            type="date"
                            value={endDate}
                            min={startDate || undefined}
                            onChange={handleEndDateChange}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleClearFilter}
                        className="team-submit-btn"
                    >
                        Clear
                    </button>
                </div>

                <div className="team-table-wrapper">
                    <table className="team-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Number</th>
                                <th>Total Leave</th>
                                <th>Month Leave</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="team-empty"
                                    >
                                        Loading...
                                    </td>
                                </tr>
                            ) : teams.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="team-empty"
                                    >
                                        No team found
                                    </td>
                                </tr>
                            ) : (
                                teams.map((item, index) => (
                                    <tr key={item._id}>
                                        <td>
                                            {index + 1}
                                        </td>

                                        <td>
                                            {item.name || "-"}
                                        </td>

                                        <td>
                                            {item.number || "-"}
                                        </td>

                                        <td>
                                            {item.totalLeave || 0}
                                        </td>

                                        <td>
                                            <strong>
                                                {item.leaveDetailsTotal || 0}
                                            </strong>
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                className="team-submit-btn"
                                                onClick={() =>
                                                    handleAddLeaveClick(
                                                        item
                                                    )
                                                }
                                            >
                                                Add Leave
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CommonPop
                isOpen={showLeaveModal}
                onClose={handleCloseModal}
                heading="Add Leave"
                popupBody={leavePopupBody}
                buttonText={
                    addLoading
                        ? "Adding Leave..."
                        : "Add Leave"
                }
                mainButtonAction={handleAddLeave}
                disabled={addLoading}
                mainBtnVisible={true}
            />
        </div>
    );
};

export default TeamPage;