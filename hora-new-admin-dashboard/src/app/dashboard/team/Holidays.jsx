"use client";

import { useEffect, useState } from "react";
import "./holidays.css";
import { BASE_URL } from "@/utils/apiconstant";


const initialForm = {
    holidayName: "",
    date: "",
    isOptional: false,
    description: "",
};

export default function HolidaysPage() {
    const [holidays, setHolidays] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [year, setYear] = useState(String(new Date().getFullYear()));

    const fetchHolidays = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `${BASE_URL}/api/holidays/all?year=${encodeURIComponent(year)}`
            );
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to fetch holidays");
            }

            setHolidays(result.data || []);
        } catch (error) {
            alert(error.message || "Failed to fetch holidays");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHolidays();
    }, [year]);

    const openAddModal = () => {
        setEditId(null);
        setForm(initialForm);
        setShowModal(true);
    };

    const openEditModal = (holiday) => {
        setEditId(holiday._id);

        setForm({
            holidayName: holiday.holidayName || "",
            date: holiday.date ? holiday.date.slice(0, 10) : "",
            isOptional: holiday.isOptional || false,
            description: holiday.description || "",
        });

        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);

            const url = editId
                ? `${BASE_URL}/api/holidays/edit/${editId}`
                : `${BASE_URL}/api/holidays/add`;

            const response = await fetch(url, {
                method: editId ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...form,
                    date: `${form.date}T00:00:00.000Z`,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to save holiday");
            }

            alert(result.message);
            setShowModal(false);
            setForm(initialForm);
            setEditId(null);

            await fetchHolidays();
        } catch (error) {
            alert(error.message || "Failed to save holiday");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this holiday?")) {
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/holidays/delete/${id}`, {
                method: "POST",
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to delete holiday");
            }

            alert(result.message);
            await fetchHolidays();
        } catch (error) {
            alert(error.message || "Failed to delete holiday");
        }
    };

    return (
        <div className="holidays-page">
            <div className="holidays-header">
                <div>
                    <h2>Leaves Management</h2>
                    <p>Manage optional leaves.</p>
                </div>

                <button className="holiday-add-btn" onClick={openAddModal}>
                    + Add Leaves
                </button>
            </div>

            <div className="holidays-toolbar">
                <label htmlFor="holiday-year">Year</label>

                <select
                    id="holiday-year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                >
                    {[2026, 2027, 2028, 2029, 2030].map((item) => (
                        <option key={item} value={String(item)}>
                            {item}
                        </option>
                    ))}
                </select>

                <span className="holiday-count">
                    Total Holidays: {holidays.length}
                </span>
            </div>

            <div className="holidays-table-wrapper">
                <table className="holidays-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Holiday Name</th>
                            <th>Date</th>
                            <th>Leave Type</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="holiday-empty">
                                    Loading holidays...
                                </td>
                            </tr>
                        ) : holidays.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="holiday-empty">
                                    No holidays found for {year}.
                                </td>
                            </tr>
                        ) : (
                            holidays.map((holiday, index) => (
                                <tr key={holiday._id}>
                                    <td>{index + 1}</td>

                                    <td className="holiday-name">
                                        {holiday.holidayName}
                                    </td>

                                    <td>
                                        {new Date(holiday.date).toLocaleDateString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                            timeZone: "UTC",
                                        })}
                                    </td>

                                    <td>
                                        <span
                                            className={
                                                holiday.isOptional
                                                    ? "holiday-badge optional"
                                                    : "holiday-badge regular"
                                            }
                                        >
                                            {holiday.isOptional ? "Optional Leave" : "Regular"}
                                        </span>
                                    </td>

                                    <td>{holiday.description || "—"}</td>

                                    <td>
                                        <div className="holiday-actions">
                                            <button
                                                className="holiday-edit-btn"
                                                onClick={() => openEditModal(holiday)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="holiday-delete-btn"
                                                onClick={() => handleDelete(holiday._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div
                    className="holiday-modal-overlay"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="holiday-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="holiday-modal-header">
                            <h3>{editId ? "Edit Holiday" : "Add Holiday"}</h3>

                            <button
                                type="button"
                                className="holiday-close-btn"
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="holiday-form-group">
                                <label>Holiday Name *</label>

                                <input
                                    type="text"
                                    value={form.holidayName}
                                    onChange={(e) =>
                                        setForm({ ...form, holidayName: e.target.value })
                                    }
                                    placeholder="e.g. Ram Navmi"
                                    required
                                />
                            </div>

                            <div className="holiday-form-group">
                                <label>Holiday Date *</label>

                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={(e) =>
                                        setForm({ ...form, date: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <div className="holiday-form-group">
                                <label>Description</label>

                                <textarea
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({ ...form, description: e.target.value })
                                    }
                                    placeholder="Optional leave or holiday details"
                                    rows={3}
                                />
                            </div>

                            <label className="holiday-checkbox">
                                <input
                                    type="checkbox"
                                    checked={form.isOptional}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            isOptional: e.target.checked,
                                        })
                                    }
                                />
                                Optional Leave
                            </label>

                            <div className="holiday-modal-actions">
                                <button
                                    type="button"
                                    className="holiday-cancel-btn"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="holiday-save-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editId
                                            ? "Update Holiday"
                                            : "Save Holiday"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}