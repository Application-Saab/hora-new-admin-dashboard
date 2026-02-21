"use client";
import React, { useState, useEffect, useMemo } from "react";
import { BASE_URL, DELETE_ADDON, EDIT_ADDON, IMAGE_UPLOAD } from "../../../utils/apiconstant";
import { FaPen, FaTrash } from "react-icons/fa";
import "./addon.css";

const AddonList = () => {
  const [addons, setAddons] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [editModel, setEditModel] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    image: null,
  });

  useEffect(() => {
    const fetchAddons = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/addon/getAll`);
        const data = await res.json();
        setAddons(data?.data || []);
      } catch (err) {
        console.error("Error fetching addons:", err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchAddons();
  }, []);

  const handleDeleteClick = (addon) => {
    setSelectedAddon(addon);
    setDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsLoading(true);

      const res = await fetch(
        `${BASE_URL}${DELETE_ADDON}/${selectedAddon._id}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (!data.error) {
        setAddons((prev) =>
          prev.filter((a) => a._id !== selectedAddon._id)
        );
        setDeleteModal(false);
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (addon) => {
    setSelectedAddon(addon);
    setFormData({
      title: addon.title,
      price: addon.price,
      description: addon.description || "",
      image: null,
    });
    setEditModel(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const uploadImage = async () => {
    const imageForm = new FormData();
    imageForm.append("file", formData.image);

    const res = await fetch(BASE_URL + IMAGE_UPLOAD, {
      method: "POST",
      body: imageForm,
    });

    const data = await res.json();
    return data.data;
  };

  const handleUpdate = async () => {
    try {
      setIsLoading(true);

      let imageName = selectedAddon.image;
      if (formData.image) imageName = await uploadImage();

      const payload = {
        title: formData.title,
        price: formData.price,
        description: formData.description,
        image: imageName,
      };

      const res = await fetch(
        `${BASE_URL}${EDIT_ADDON}/${selectedAddon._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (!result.error) {
        setAddons((prev) =>
          prev.map((item) =>
            item._id === selectedAddon._id
              ? { ...item, ...payload }
              : item
          )
        );
        setEditModel(false);
      }
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const isChanged = useMemo(() => {
    if (!selectedAddon) return false;
    return (
      formData.title !== selectedAddon.title ||
      formData.price !== selectedAddon.price ||
      formData.description !== selectedAddon.description ||
      formData.image !== null
    );
  }, [formData, selectedAddon]);

  return (
    <div>

      {/* CENTER MESSAGE (Loading / Empty) */}
      {pageLoading ? (
        <div className="center-message">Loading...</div>
      ) : addons.length === 0 ? (
        <div className="center-message">No Addon Found</div>
      ) : (
        <div className="addon-list">
          {addons.map((addon) => (
            <div key={addon._id} className="addon-item">
             <div className="image-wrapper">
               <img
               key={addon._id}
                src={`https://horaservices.com/api/uploads/compressed_webp/${addon.image}`}
                alt={addon.title}
                className="addon-image"
              />
             </div>
              <h3 className="addonlist-title">{addon.title}</h3>
              <p className="addonlist-discription">
                {addon.description}
              </p>
               <div>
                  <strong className="addon-label">Category :</strong> {addon?.categoryType[0]}
                </div>

              <div className="addonCard-footer">
                 
                <div>
                  <strong className="addon-label">Price :</strong> {addon?.price}
                </div>
              
                <div className="action-buttons">
                  <div
                    onClick={() => handleEditClick(addon)}
                    className="edit-action"
                  >
                    <FaPen size={14} />
                  </div>

                  <div
                    onClick={() => handleDeleteClick(addon)}
                    className="delete-action"
                  >
                    <FaTrash size={14} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      {editModel && (
        <div className="edit-model-container">
          <div className="edit-box">

            {isLoading && (
              <div className="loading-overlay">Updating...</div>
            )}

            <h2>Edit Addon</h2>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />

            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
            />

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />

            <input type="file" onChange={handleImageChange} />

            <div className="modal-buttons">
              <button
                className="update-btn"
                onClick={handleUpdate}
                disabled={!isChanged || isLoading}
              >
                Update
              </button>

              <button
                className="cancel-btn"
                onClick={() => setEditModel(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal && (
        <div className="delete-modal-container">
          <div className="delete-box">

            {isLoading && (
              <div className="loading-overlay">Deleting...</div>
            )}

            <h2 className="confrim-text">Confirm Delete</h2>
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedAddon?.title}</strong>?
            </p>

            <div className="modal-buttons">
              <button
                className="update-btn"
                onClick={handleDeleteConfirm}
                disabled={isLoading}
              >
                Yes, Delete
              </button>

              <button
                className="cancel-btn"
                onClick={() => setDeleteModal(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddonList;
