"use client";

import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../../utils/apiconstant";
import "./team.css";
import CommonPopup from '../../component/CommonPopup'


const TeamPage = () => {
    const [activeTab, setActiveTab] = useState("list");

    const [formData, setFormData] = useState({
        name: "", 
        number: "",
        dob: "",
    });

    const [teams, setTeams] = useState([]);
    const [searchNumber, setSearchNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [addLoading, setAddLoading] = useState(false);

    const [editModal, setEditModal] = useState(false);

    const [editData, setEditData] = useState({
        _id: "",
        name: "",
        number: "",
        dob: "",
    });

    const [originalEditData, setOriginalEditData] = useState({
        name: "",
        number: "",
        dob: "",
    });

    const [editLoading, setEditLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState("");


    const handleEditClick = (item) => {
        const data = {
            _id: item._id,
            name: item.name || "",
            number: item.number ? String(item.number) : "",
            dob: item.dob || "",
        };

        setEditData(data);

        setOriginalEditData({
            name: data.name,
            number: data.number,
            dob: data.dob,
        });

        setEditModal(true);
    };

    const hasEditChanges =
        editData.name !== originalEditData.name ||
        editData.number !== originalEditData.number ||
        editData.dob !== originalEditData.dob;

    const handleUpdateTeam = async () => {
        if (!hasEditChanges) return;

        try {
            setEditLoading(true);

            const payload = {
                name: editData.name,
                number: editData.number
                    ? Number(editData.number)
                    : undefined,
                dob: editData.dob,
            };

            const response = await fetch(
                `${BASE_URL}/api/team/edit/${editData._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to update team"
                );
            }

            alert("Team updated successfully");

            setEditModal(false);

            setEditData({
                _id: "",
                name: "",
                number: "",
                dob: "",
            });

            setOriginalEditData({
                name: "",
                number: "",
                dob: "",
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
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this team?"
        );

        if (!confirmDelete) return;

        try {
            setDeleteLoading(id);

            const response = await fetch(
                `${BASE_URL}/api/team/delete/${id}`,
                {
                    method: "POST",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to delete team"
                );
            }

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
    const handleAddTeam = async (e) => {
        e.preventDefault();

        try {
            setAddLoading(true);

            const payload = {
                name: formData.name,
                number: formData.number
                    ? Number(formData.number)
                    : undefined,
                dob: formData.dob,
            };

            const response = await fetch(
                `${BASE_URL}/api/team/add`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const contentType = response.headers.get("content-type");

            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();

                console.error(
                    "API returned non-JSON response:",
                    text
                );

                throw new Error(
                    "Invalid API response. Please check BASE_URL and API route."
                );
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to add team"
                );
            }

            alert("Team added successfully");

            // Reset form
            setFormData({
                name: "",
                number: "",
                dob: "",
            });

            // Go to list
            setActiveTab("list");

            // Refresh list
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

    return (
        <div className="team-page">

            <div className="team-header">

                <h1 className="team-title">
                    Team
                </h1>

                <div className="team-tabs">

                    <button
                        type="button"
                        onClick={handleAddClick}
                        className={`team-tab ${activeTab === "add"
                            ? "team-tab-active"
                            : ""
                            }`}
                    >
                        Add Team
                    </button>

                    <button
                        type="button"
                        onClick={handleListClick}
                        className={`team-tab ${activeTab === "list"
                            ? "team-tab-active"
                            : ""
                            }`}
                    >
                        Team List
                    </button>

                </div>

            </div>
            {activeTab === "add" && (
                <div className="team-card flex">

                    <h2 className="team-card-title">
                        Add Team
                    </h2>

                    <form
                        onSubmit={handleAddTeam}
                        className="team-form"
                    >

                        {/* NAME */}
                        <div className="team-form-group">

                            <label>
                                Name
                            </label>

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

                        {/* NUMBER */}
                        <div className="team-form-group">

                            <label>
                                Number
                            </label>

                            <input
                                type="text"
                                inputMode="numeric"
                                value={formData.number}
                                maxLength={10}
                                onChange={(e) => {
                                    const value =
                                        e.target.value.replace(
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

                        {/* DOB */}
                        <div className="team-form-group">

                            <label>
                                DOB
                            </label>

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

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            disabled={addLoading}
                            className="team-submit-btn"
                        >
                            {addLoading
                                ? "Adding..."
                                : "Add Team"}
                        </button>

                    </form>

                </div>
            )}
            {activeTab === "list" && (
                <div className="team-card2">

                    <h2 className="team-card-title">
                        Team List
                    </h2>

                    {/* SEARCH */}
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

                    {/* TABLE */}
                    <div className="team-table-wrapper">

                        <table className="team-table">

                            <thead>
                                <tr>

                                    <th>
                                        #
                                    </th>

                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        Number
                                    </th>

                                    <th>
                                        DOB
                                    </th>

                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="team-empty"
                                        >
                                            Loading...
                                        </td>
                                    </tr>
                                ) : teams.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="team-empty"
                                        >
                                            No team found
                                        </td>
                                    </tr>
                                ) : (
                                    teams.map(
                                        (item, index) => (
                                            <tr
                                                key={item._id}
                                            >

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
                                                    {item.dob || "-"}
                                                </td>

                                                <td>
                                                    <div className="team-action-buttons">

                                                        <button
                                                            type="button"
                                                            className="team-edit-btn"
                                                            onClick={() => handleEditClick(item)}
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="team-delete-btn"
                                                            onClick={() =>
                                                                handleDeleteTeam(item._id)
                                                            }
                                                            disabled={deleteLoading === item._id}
                                                        >
                                                            {deleteLoading === item._id
                                                                ? "Deleting..."
                                                                : "Delete"}
                                                        </button>

                                                    </div>
                                                </td>

                                            </tr>
                                        )
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>
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
                            <label>
                                Name
                            </label>

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
                            <label>
                                Number
                            </label>

                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={10}
                                value={editData.number}
                                onChange={(e) => {
                                    const value =
                                        e.target.value.replace(/\D/g, "");

                                    setEditData({
                                        ...editData,
                                        number: value,
                                    });
                                }}
                                placeholder="Enter number"
                            />
                        </div>

                        <div className="team-form-group">
                            <label>
                                DOB
                            </label>

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

                    </div>
                }
            />

        </div>
    );
};

export default TeamPage;