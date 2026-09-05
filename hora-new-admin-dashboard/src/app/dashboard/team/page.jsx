"use client";

import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../../utils/apiconstant";
import AttendancePage from "./AttendancePage"
import "./team.css";
import CommonPopup from "../../component/CommonPopup";

const TeamPage = () => {
    const [activeTab, setActiveTab] = useState("list");

    const [formData, setFormData] = useState({
        name: "",
        number: "",
        alternativeNumber: "",
        dob: "",
        address: "",
        weekOff: "",
    });

    const [teams, setTeams] = useState([]);
    const [searchNumber, setSearchNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState("");
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteTeamId, setDeleteTeamId] = useState("");
    const [editModal, setEditModal] = useState(false);

    const [editData, setEditData] = useState({
        _id: "",
        name: "",
        number: "",
        alternativeNumber: "",
        dob: "",
        address: "",
    });

    const [originalEditData, setOriginalEditData] = useState({
        name: "",
        number: "",
        alternativeNumber: "",
        dob: "",
        address: "",
    });

    const [editLoading, setEditLoading] = useState(false);

    const [viewModal, setViewModal] = useState(false);
    const [viewData, setViewData] = useState(null);

    const handleEditClick = (item) => {
        const data = {
            _id: item._id,
            name: item.name || "",
            number: item.number ? String(item.number) : "",
            alternativeNumber: item.alternativeNumber
                ? String(item.alternativeNumber)
                : "",
            dob: item.dob || "",
            address: item.address || "",
            weekOff: item.weekOff || "",
        };

        setEditData(data);

        setOriginalEditData({
            name: data.name,
            number: data.number,
            alternativeNumber: data.alternativeNumber,
            dob: data.dob,
            address: data.address,
            weekOff: data.weekOff,
        });

        setEditModal(true);
    };

    const handleViewClick = (item) => {
        setViewData(item);
        setViewModal(true);
    };

    const hasEditChanges =
        editData.name !== originalEditData.name ||
        editData.number !== originalEditData.number ||
        editData.alternativeNumber !== originalEditData.alternativeNumber ||
        editData.dob !== originalEditData.dob ||
        editData.address !== originalEditData.address ||
        editData.weekOff !== originalEditData.weekOff
        ;

    const handleUpdateTeam = async () => {
        if (!hasEditChanges) return;

        try {
            setEditLoading(true);

            const payload = {
                name: editData.name,
                number: editData.number ? Number(editData.number) : 0,
                alternativeNumber: editData.alternativeNumber
                    ? Number(editData.alternativeNumber)
                    : 0,
                dob: editData.dob,
                address: editData.address,
                weekOff: editData.weekOff || "",
            };

            const response = await fetch(
                `${ BASE_URL }/api/team/edit/${ editData._id } `,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const contentType = response.headers.get("content-type");

            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error("API returned non-JSON response:", text);
                throw new Error(
                    "Invalid API response. Please check BASE_URL and API route."
                );
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to update team");
            }

            alert("Team updated successfully");

            setEditModal(false);

            setEditData({
                _id: "",
                name: "",
                number: "",
                alternativeNumber: "",
                dob: "",
                address: "",
            });

            setOriginalEditData({
                name: "",
                number: "",
                alternativeNumber: "",
                dob: "",
                address: "",
            });

            getTeams(searchNumber);
        } catch (error) {
            console.error("Update team error:", error);
            alert(error.message);
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteTeam = async (id) => {
        try {
            setDeleteLoading(id);

            const response = await fetch(
                `${BASE_URL}/api/team/delete/${id}`,
                {
                    method: "POST",
                }
            );

            const contentType = response.headers.get("content-type");

            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error("API returned non-JSON response:", text);

                throw new Error(
                    "Invalid API response. Please check BASE_URL and API route."
                );
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to delete team");
            }

            setDeleteModal(false);
            setDeleteTeamId("");

            alert("Team deleted successfully");

            getTeams(searchNumber);
        } catch (error) {
            console.error("Delete team error:", error);
            alert(error.message);
        } finally {
            setDeleteLoading("");
        }
    };

const getTeams = async (number = "") => {
    try {
        setLoading(true);

        let url = `${BASE_URL}/api/team/getAll`;

        if (number) {
            url += `?number=${encodeURIComponent(number)}`;
        }

        const response = await fetch(url);
        const contentType = response.headers.get("content-type");

        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("API returned non-JSON response:", text);
            throw new Error(
                "Invalid API response. Please check BASE_URL and API route."
            );
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to fetch teams");
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

const handleAddTeam = async (e) => {
    e.preventDefault();

    try {
        setAddLoading(true);

        const payload = {
            name: formData.name,
            number: formData.number ? Number(formData.number) : 0,
            alternativeNumber: formData.alternativeNumber
                ? Number(formData.alternativeNumber)
                : 0,
            dob: formData.dob,
            address: formData.address,
            weekOff: formData.weekOff || "",
        };

        const response = await fetch(`${BASE_URL}/api/team/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const contentType = response.headers.get("content-type");

        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("API returned non-JSON response:", text);
            throw new Error(
                "Invalid API response. Please check BASE_URL and API route."
            );
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to add team");
        }

        alert("Team added successfully");

        setFormData({
            name: "",
            number: "",
            alternativeNumber: "",
            dob: "",
            address: "",
        });

        setActiveTab("list");
        getTeams();
    } catch (error) {
        console.error("Add team error:", error);
        alert(error.message);
    } finally {
        setAddLoading(false);
    }
};

const handleNumberSearch = (e) => {
    const value = e.target.value.replace(/\D/g, "");

    setSearchNumber(value);

    if (value.length === 10) {
        getTeams(value);
    }

    if (value.length === 0) {
        getTeams();
    }
};

const handleListClick = () => {
    setActiveTab("list");
    setSearchNumber("");
    getTeams();
};

const handleAddClick = () => {
    setActiveTab("add");
};

    const handleAttendanceClick = () => {
        setActiveTab("attendance");
    };

return (
    <div className="team-page">
        <div className="team-header">
            <h1 className="team-title">Team</h1>

            <div className="team-tabs">
                <button
                    type="button"
                    onClick={handleAddClick}
                    className={`team-tab ${activeTab === "add" ? "team-tab-active" : ""
                        }`}
                >
                    Add Member
                </button>

                <button
                    type="button"
                    onClick={handleListClick}
                    className={`team-tab ${activeTab === "list" ? "team-tab-active" : ""
                        }`}
                >
                    Member List
                </button>

                <button
                    type="button"
                    onClick={handleAttendanceClick}
                    className={`team-tab ${activeTab === "attendance" ? "team-tab-active" : ""}`}
                >
                    Attendance Sheet
                </button>

            </div>
        </div>

        {activeTab === "add" && (
            <div className="team-card flex">
                <h2 className="team-card-title">Add Team</h2>

                <form onSubmit={handleAddTeam} className="team-form">
                    <div className="team-form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            placeholder="Enter name"
                        />
                    </div>

                    <div className="team-form-group">
                        <label>Number</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={formData.number}
                            maxLength={10}
                            onChange={(e) => {
                                const value = e.target.value.replace(
                                    /\D/g,
                                    ""
                                );

                                setFormData({
                                    ...formData,
                                    number: value,
                                });
                            }}
                            placeholder="Enter number"
                        />
                    </div>

                    <div className="team-form-group">
                        <label>Alternative Number</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={formData.alternativeNumber}
                            maxLength={10}
                            onChange={(e) => {
                                const value = e.target.value.replace(
                                    /\D/g,
                                    ""
                                );

                                setFormData({
                                    ...formData,
                                    alternativeNumber: value,
                                });
                            }}
                            placeholder="Enter alternative number"
                        />
                    </div>

                    <div className="team-form-group">
                        <label>DOB</label>
                        <input
                            type="date"
                            value={formData.dob}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    dob: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="team-form-group">
                        <label>Address</label>
                        <textarea
                            value={formData.address}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    address: e.target.value,
                                })
                            }
                            placeholder="Enter address"
                            rows={3}
                        />
                    </div>

                    <div className="team-form-group">
                        <label>WeekOff</label>
                        <select
                            value={formData.weekOff}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    weekOff: e.target.value,
                                })
                            }
                        >
                            <option value="">Select Week Off</option>
                            <option value="Sunday">Sunday</option>
                            <option value="Monday">Monday</option>
                            <option value="Tuesday">Tuesday</option>
                            <option value="Wednesday">Wednesday</option>
                            <option value="Thursday">Thursday</option>
                            <option value="Friday">Friday</option>
                            <option value="Saturday">Saturday</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={addLoading}
                        className="team-submit-btn"
                    >
                        {addLoading ? "Adding..." : "Add Team"}
                    </button>
                </form>
            </div>
        )}

        {activeTab === "list" && (
            <div className="team-card2">
                <h2 className="team-card-title">Team List</h2>

                <div className="team-search">
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        value={searchNumber}
                        onChange={handleNumberSearch}
                        placeholder="Search by 10 digit number"
                    />
                </div>

                <div className="team-table-wrapper">
                    <table className="team-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Number</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="team-empty">
                                        Loading...
                                    </td>
                                </tr>
                            ) : teams.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="team-empty">
                                        No team found
                                    </td>
                                </tr>
                            ) : (
                                teams.map((item, index) => (
                                    <tr key={item._id}>
                                        <td>{index + 1}</td>
                                        <td>{item.name || "-"}</td>
                                        <td>{item.number || "-"}</td>
                                        <td>
                                            <div className="team-action-buttons">
                                                <button
                                                    type="button"
                                                    className="team-view-btn"
                                                    onClick={() =>
                                                        handleViewClick(item)
                                                    }
                                                >
                                                    View
                                                </button>

                                                <button
                                                    type="button"
                                                    className="team-edit-btn"
                                                    onClick={() =>
                                                        handleEditClick(item)
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="team-delete-btn"
                                                    onClick={() => {
                                                        setDeleteTeamId(item._id);
                                                        setDeleteModal(true);
                                                    }}
                                                    disabled={
                                                        deleteLoading ===
                                                        item._id
                                                    }
                                                >
                                                    {deleteLoading ===
                                                        item._id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === "attendance" && (
            <AttendancePage />
        )}

        <CommonPopup
            isOpen={editModal}
            onClose={() => setEditModal(false)}
            heading="Edit Team"
            buttonText={editLoading ? "Updating..." : "Update"}
            disabled={!hasEditChanges || editLoading}
            mainButtonAction={handleUpdateTeam}
            popupBody={
                <div className="team-edit-form">
                    <div className="team-form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            value={editData.name}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    name: e.target.value,
                                })
                            }
                            placeholder="Enter name"
                        />
                    </div>

                    <div className="team-form-group">
                        <label>Number</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={10}
                            value={editData.number}
                            onChange={(e) => {
                                const value = e.target.value.replace(
                                    /\D/g,
                                    ""
                                );

                                setEditData({
                                    ...editData,
                                    number: value,
                                });
                            }}
                            placeholder="Enter number"
                        />
                    </div>

                    <div className="team-form-group">
                        <label>Alternative Number</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={10}
                            value={editData.alternativeNumber}
                            onChange={(e) => {
                                const value = e.target.value.replace(
                                    /\D/g,
                                    ""
                                );

                                setEditData({
                                    ...editData,
                                    alternativeNumber: value,
                                });
                            }}
                            placeholder="Enter alternative number"
                        />
                    </div>

                    <div className="team-form-group">
                        <label>DOB</label>
                        <input
                            type="date"
                            value={editData.dob}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    dob: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="team-form-group">
                        <label>Address</label>
                        <textarea
                            value={editData.address}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    address: e.target.value,
                                })
                            }
                            placeholder="Enter address"
                            rows={3}
                        />
                    </div>

                    <div className="team-form-group">
                        <label>WeekOff</label>
                        <select
                            value={editData.weekOff || ""}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    weekOff: e.target.value,
                                })
                            }
                        >
                            <option value="">Select Week Off</option>
                            <option value="Sunday">Sunday</option>
                            <option value="Monday">Monday</option>
                            <option value="Tuesday">Tuesday</option>
                            <option value="Wednesday">Wednesday</option>
                            <option value="Thursday">Thursday</option>
                            <option value="Friday">Friday</option>
                            <option value="Saturday">Saturday</option>
                        </select>
                    </div>
                </div>
            }
        />

        <CommonPopup
            isOpen={viewModal}
            onClose={() => {
                setViewModal(false);
                setViewData(null);
            }}
            heading="Member Details"
            buttonText="Close"
            mainButtonAction={() => {
                setViewModal(false);
                setViewData(null);
            }}
            mainBtnVisible={false}
            popupBody={
                viewData && (
                    <div className="team-view-details">
                        <div className="team-view-row">
                            <span>Name</span>
                            <strong>{viewData.name || "-"}</strong>
                        </div>

                        <div className="team-view-row">
                            <span>Number</span>
                            <strong>{viewData.number || "-"}</strong>
                        </div>

                        <div className="team-view-row">
                            <span>Alternative Number</span>
                            <strong>
                                {viewData.alternativeNumber || "-"}
                            </strong>
                        </div>

                        <div className="team-view-row">
                            <span>DOB</span>
                            <strong>{viewData.dob || "-"}</strong>
                        </div>

                        <div className="team-view-row">
                            <span>Address</span>
                            <strong>{viewData.address || "-"}</strong>
                        </div>

                        <div className="team-view-row">
                            <span>Week Off</span>
                            <strong>{viewData.weekOff || "-"}</strong>
                        </div>
                    </div>
                )
            }
        />

        <CommonPopup
            isOpen={deleteModal}
            onClose={() => {
                setDeleteModal(false);
                setDeleteTeamId("");
            }}
            heading="Delete Team"
            buttonText={deleteLoading ? "Deleting..." : "Delete"}
            mainButtonAction={() => handleDeleteTeam(deleteTeamId)}
            disabled={deleteLoading === deleteTeamId}
            popupBody={
                <div className="team-delete-popup">
                    <p>
                        Are you sure you want to delete this team member?
                    </p>
                </div>
            }
        />
    </div>
);
};

export default TeamPage;