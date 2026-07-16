"use client";

import { useEffect, useState } from "react";
import "./pincodes.css";
import { BASE_URL } from "@/utils/apiconstant";

export default function Pincodes() {
    const [pincodes, setPincodes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filter states
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const [newCategory, setNewCategory] = useState("");
    const [updateLoading, setUpdateLoading] = useState(false);

    // Ek hi useEffect dependency array handle karega components ke load aur page updates ko
    useEffect(() => {
        const fetchPincodes = async () => {
            try {
                setLoading(true);
                let url = `${BASE_URL}/api/pincode/serviceability?page=${page}&limit=10`;
                if (search) url += `&search=${encodeURIComponent(search)}`;
                if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;
                if (categoryFilter) url += `&category=${encodeURIComponent(categoryFilter)}`;

                const response = await fetch(url);
                const result = await response.json();

                if (result.success) {
                    setPincodes(result.data);
                    setTotalPages(result.totalPages || 1);
                }
            } catch (error) {
                console.error("Error fetching pincodes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPincodes();
    }, [page, search, statusFilter, categoryFilter]);

    // Filters change hone par direct page status 1 reset karein
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleCategoryChange = (e) => {
        setCategoryFilter(e.target.value);
        setPage(1);
    };

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
        setPage(1);
    };

    const handleEditClick = (record) => {
        setSelectedRecord(record);
        setNewStatus(record.status || "Servisable");
        setNewCategory(record.category || "");
        setIsModalOpen(true);
    };

    const handleStatusUpdate = async (e) => {
        e.preventDefault();
        if (!selectedRecord || !selectedRecord._id) return;

        try {
            setUpdateLoading(true);

            const response = await fetch(`${BASE_URL}/api/pincode/update/${selectedRecord._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: newStatus,
                    category: newCategory
                }),
            });

            const result = await response.json();

            if (result.success) {
                setIsModalOpen(false);
                setPincodes((prev) =>
                    prev.map((item) =>
                        item._id === selectedRecord._id
                            ? { ...item, status: newStatus, category: newCategory }
                            : item
                    )
                );
            } else {
                alert(result.message || "Failed to update");
            }
        } catch (error) {
            console.error("Update error:", error);
        } finally {
            setUpdateLoading(false);
        }
    };

    return (
        <div className="pincode-container">
            <div className="header-section-pincode">
                <h2>Pincode Serviceability</h2>
            </div>

            {/* FILTER BAR TOP SECTION */}
            <div className="filter-wrapper" style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                <input
                    type="text"
                    placeholder="Search Pincode or City..."
                    value={search}
                    onChange={handleSearchChange}
                    style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px", maxWidth: "200px", flex: "1" }}
                />

                <select
                    value={categoryFilter}
                    onChange={handleCategoryChange}
                    style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px", minWidth: "150px" }}
                >
                    <option value="">All Categories</option>
                    <option value="Photography">Photography</option>
                    <option value="Decoration">Decoration</option>
                    <option value="Chef">Chef</option>
                    <option value="Food">Food</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={handleStatusChange}
                    style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px", minWidth: "150px" }}
                >
                    <option value="">All Statuses</option>
                    <option value="Servisable">Servisable</option>
                    <option value="Non Servisable">Non Servisable</option>
                    <option value="Servisable with travel charge">Servisable with travel charge</option>
                </select>
            </div>

            {/* Table structure hamesha stable rahegi aur table header visible rahega */}
            <div className="table-wrapper">
                <table className="pincode-table">
                    <thead>
                        <tr>
                            <th>Pincode</th>
                            <th>City</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center", padding: "30px", fontSize: "16px", color: "#666" }}>
                                Loading...
                                </td>
                            </tr>
                        ) : pincodes.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>No Data Found</td>
                            </tr>
                        ) : (
                            pincodes.map((row) => (
                                <tr key={row._id}>
                                    <td>{row.pincode || "N/A"}</td>
                                    <td>{row.city || "N/A"}</td>
                                    <td>{row.category && row.category.trim() !== "" ? row.category : "N/A"}</td>
                                    <td>
                                        <span className={`status-badge ${row.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                                            {row.status || "N/A"}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="edit-btn" onClick={() => handleEditClick(row)}>
                                            ✏️ Edit
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            {!loading && pincodes.length > 0 && (
                <div className="vendor-pagination">
                    <button disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>Prev</button>
                    <span>Page {page} / {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage((prev) => prev + 1)}>Next</button>
                </div>
            )}

            {/* MODAL POPUP */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Update Pincode Details</h3>
                        <p><strong>City:</strong> {selectedRecord?.city} ({selectedRecord?.pincode})</p>

                        <form onSubmit={handleStatusUpdate}>
                            <div style={{ marginBottom: "12px" }}>
                                <label htmlFor="category-select" style={{ fontWeight: "bold", display: "block" }}>Category:</label>
                                <select
                                    id="category-select"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                                >
                                    <option value="">Select Category</option>
                                    <option value="Photography">Photography</option>
                                    <option value="Decoration">Decoration</option>
                                    <option value="Chef">Chef</option>
                                    <option value="Food">Food</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: "20px" }}>
                                <label htmlFor="status-select" style={{ fontWeight: "bold", display: "block" }}>Status:</label>
                                <select
                                    id="status-select"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                                >
                                    <option value="Servisable">Servisable</option>
                                    <option value="Not Servisable">Not Servisable</option>
                                    <option value="Servisable with travel charge">Servisable with travel charge</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)} disabled={updateLoading}>
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn" disabled={updateLoading}>
                                    {updateLoading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}