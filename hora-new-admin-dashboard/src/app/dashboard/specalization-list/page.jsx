"use client";

import React, { useEffect, useState } from "react";
import { BASE_URL } from "@/utils/apiconstant";
import "./specialization.css";
import CommonPopup from "../../component/CommonPopup";

const Specialization = () => {
    const [specializations, setSpecializations] = useState([]);

    const [name, setName] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");

    const [editingId, setEditingId] = useState(null);
    // const [oldImage, setOldImage] = useState("");

    // Add / Edit popup
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Delete confirmation popup
    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // Success popup
    const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const [loading, setLoading] = useState(false);

    // ==========================================
    // GET SPECIALIZATIONS
    // ==========================================
    const getSpecializations = async () => {
        try {
            const response = await fetch(
                `${BASE_URL}/api/specializations/get`
            );

            const result = await response.json();

            if (result.status === 200) {
                setSpecializations(result.data);
            }
        } catch (error) {
            console.error(
                "Get Specializations Error:",
                error
            );
        }
    };

    useEffect(() => {
        getSpecializations();
    }, []);

    // ==========================================
    // OPEN ADD POPUP
    // ==========================================
    const openAddModal = () => {
        setEditingId(null);
        setName("");
        setImage(null);
        setPreview("");
        // setOldImage("");

        setIsModalOpen(true);
    };

    // ==========================================
    // OPEN EDIT POPUP
    // ==========================================
    const openEditModal = (item) => {
        setEditingId(item._id);
        setName(item.name);

        setImage(null);
        setPreview(item.image);
        // setOldImage(item.image);

        setIsModalOpen(true);
    };

    // ==========================================
    // IMAGE CHANGE
    // ==========================================
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    // ==========================================
    // ADD / EDIT
    // ==========================================
    // ==========================================
    const handleSubmit = async (e) => {
        if (e) {
            e.preventDefault();
        }

        if (!name.trim()) {
            alert("Please enter specialization name");
            return;
        }

        // Image required only for ADD
        if (!editingId && !image) {
            alert("Please select an image");
            return;
        }

        try {
            setLoading(true);

            // ==========================================
            // 1. SPECIALIZATION ADD / EDIT API
            // ==========================================
            const url = editingId
                ? `${BASE_URL}/api/specializations/edit/${editingId}`
                : `${BASE_URL}/api/specializations/add`;

            let response;

            // ==========================================
            // ADD
            // ==========================================
            if (!editingId) {
                const formData = new FormData();

                formData.append("name", name.trim());
                formData.append("image", image);

                response = await fetch(url, {
                    method: "POST",
                    body: formData,
                });
            }

            // ==========================================
            // EDIT
            // ==========================================
            else {
                const formData = new FormData();

                formData.append("name", name.trim());

                // New image selected hai tabhi bhejo
                if (image) {
                    formData.append("image", image);
                }

                response = await fetch(url, {
                    method: "PUT",
                    body: formData,
                });
            }

            // ==========================================
            // 2. RESPONSE
            // ==========================================
            const result = await response.json();

            console.log(
                "Specialization Response:",
                result
            );

            if (!response.ok || result.error) {
                throw new Error(
                    result.message ||
                    "Something went wrong"
                );
            }

            // ==========================================
            // 3. SUCCESS POPUP
            // ==========================================
            setSuccessMessage(
                editingId
                    ? "Specialization updated successfully"
                    : "Specialization added successfully"
            );

            setIsSuccessPopupOpen(true);

            // Close Add/Edit popup
            setIsModalOpen(false);

            // ==========================================
            // 4. RESET FORM
            // ==========================================
            setName("");
            setImage(null);
            setPreview("");
            setEditingId(null);
            // setOldImage("");

            // ==========================================
            // 5. REFRESH LIST
            // ==========================================
            await getSpecializations();

        } catch (error) {
            console.error(
                "Specialization Submit Error:",
                error
            );

            alert(
                error.message ||
                "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // OPEN DELETE POPUP
    // ==========================================
    const openDeletePopup = (id) => {
        setDeleteId(id);
        setIsDeletePopupOpen(true);
    };

    // ==========================================
    // DELETE
    // ==========================================
    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            setLoading(true);

            const response = await fetch(
                `${BASE_URL}/api/specializations/delete/${deleteId}`,
                {
                    method: "POST",
                }
            );

            const result = await response.json();

            console.log(
                "Delete Specialization Response:",
                result
            );

            if (
                !response.ok ||
                result.error
            ) {
                throw new Error(
                    result.message ||
                    "Specialization delete failed"
                );
            }

            if (result.status === 200) {

                // Close delete confirmation
                setIsDeletePopupOpen(false);
                setDeleteId(null);

                // Refresh list
                await getSpecializations();

                // Open success popup
                setSuccessMessage(
                    "Specialization deleted successfully"
                );

                setIsSuccessPopupOpen(true);
            }

        } catch (error) {
            console.error(
                "Delete Specialization Error:",
                error
            );

            alert(
                error.message ||
                "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="specialization-page">

            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="specialization-header">

                <h2>
                    Specialization
                </h2>

                <button
                    className="add-btn"
                    onClick={openAddModal}
                >
                    + Add
                </button>

            </div>

            {/* ==========================================
                SPECIALIZATION LIST
            ========================================== */}

            <div className="specialization-list">

                {specializations.map((item) => (

                    <div
                        className="specialization-item"
                        key={item._id}
                    >

                        <img
                            src={`${BASE_URL}/api/uploads/specialization/${item.image}`}
                            alt={item.name}
                            className="specialization-image"
                        />

                        <div className="specialization-info">

                            <p>
                                {item.name}
                            </p>

                        </div>

                        <div className="specialization-actions">

                            {/* EDIT */}
                            <button
                                onClick={() =>
                                    openEditModal(item)
                                }
                            >
                                Edit
                            </button>

                            {/* DELETE */}
                            <button
                                className="delete-action"
                                onClick={() =>
                                    openDeletePopup(
                                        item._id
                                    )
                                }
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                ))}

            </div>

            {/* ==========================================
                ADD / EDIT COMMON POPUP
            ========================================== */}

            <CommonPopup
                isOpen={isModalOpen}
                onClose={() => {
                    if (!loading) {
                        setIsModalOpen(false);
                    }
                }}
                heading={
                    editingId
                        ? "Edit Specialization"
                        : "Add Specialization"
                }
                popupBody={
                    <div className="specialization-popup-form">

                        <div className="form-group">
                            <label>Name</label>

                            <input
                                type="text"
                                value={name}
                                placeholder="Birthday Photography"
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label>Image</label>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>

                        {preview && (
                            <div className="preview-wrapper">
                                <img
                                    src={
                                        preview.startsWith("blob:")
                                            ? preview
                                            : `${BASE_URL}/api/uploads/specialization/${preview}`
                                    }
                                    alt="Preview"
                                    className="image-preview"
                                />
                            </div>
                        )}

                    </div>
                }
                buttonText={
                    loading
                        ? "Saving..."
                        : editingId
                            ? "Update"
                            : "Add"
                }
                mainButtonAction={handleSubmit}
                disabled={loading}
                mainBtnVisible={true}
            />

            {/* ==========================================
                DELETE CONFIRMATION COMMON POPUP
            ========================================== */}

            <CommonPopup
                isOpen={isDeletePopupOpen}
                onClose={() => {
                    if (!loading) {
                        setIsDeletePopupOpen(false);
                        setDeleteId(null);
                    }
                }}
                heading="Delete Specialization?"
                popupBody={
                    "Are you sure you want to delete this?"
                }
                buttonText={
                    loading
                        ? "Deleting..."
                        : "Delete"
                }
                mainButtonAction={
                    handleDelete
                }
                disabled={loading}
                mainBtnVisible={true}
            />

            {/* ==========================================
                SUCCESS COMMON POPUP
            ========================================== */}

            <CommonPopup
                isOpen={isSuccessPopupOpen}
                onClose={() =>
                    setIsSuccessPopupOpen(false)
                }
                heading="Success"
                popupBody={
                    successMessage
                }
                buttonText="OK"
                mainButtonAction={() =>
                    setIsSuccessPopupOpen(false)
                }
                mainBtnVisible={true}
            />

        </div>
    );
};

export default Specialization;