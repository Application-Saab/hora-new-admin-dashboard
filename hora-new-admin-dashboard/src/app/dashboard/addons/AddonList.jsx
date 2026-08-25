"use client";
import React, { useState, useEffect, useMemo } from "react";
import { BASE_URL, DELETE_ADDON, EDIT_ADDON, IMAGE_UPLOAD, PRODUCT_MEAL_TYPE } from "../../../utils/apiconstant";
import { FaPen, FaTrash } from "react-icons/fa";
import "./addon.css";
import CommonPopup from '../../component/CommonPopup'

const AddonList = () => {
  const [addons, setAddons] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [editModel, setEditModel] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
    const [mealProductTypes, setMealProductTypes] = useState([]);
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    image: null,
    eventId: [],
  });

    useEffect(() => {
      const fetchEvents = async () => {
        try {
          const response = await fetch(`${BASE_URL}${PRODUCT_MEAL_TYPE}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              per_page: "500",
            }),
          });
  
          const data = await response.json();
  
          if (data.error === false) {
            setMealProductTypes(data?.data?.meal || []);
          }
        } catch (error) {
          console.error("Error fetching events:", error);
        }
      };
  
      fetchEvents();
    }, []);

  useEffect(() => {
    if (!selectedAddon || mealProductTypes.length === 0) {
      return;
    }

    const oldEventIds = selectedAddon?.eventId || [];
    const productIds = selectedAddon?.productId || [];

    const isGenericAddon =
      oldEventIds.length === 0 &&
      productIds.length === 0;

    if (isGenericAddon) {
      const allEventIds = mealProductTypes.map(
        (event) => event._id
      );

      setSelectedEvents(allEventIds);
      setFormData((prev) => ({
        ...prev,
        eventId: allEventIds,
      }));
    } else {
      setSelectedEvents(oldEventIds);
    }
  }, [selectedAddon, mealProductTypes]);

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

      if (data?.success) {
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
      eventId: addon?.eventId || [],
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
        eventId: selectedEvents,
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

      if (result.success) {
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

    const oldEventIds = selectedAddon?.eventId || [];
    const oldProductIds = selectedAddon?.productId || [];

    const isGenericAddon =
      oldEventIds.length === 0 &&
      oldProductIds.length === 0;

    let eventsChanged = false;

    if (isGenericAddon) {
      const allEventIds = mealProductTypes.map(
        (event) => event._id
      );

      eventsChanged =
        JSON.stringify([...selectedEvents].sort()) !==
        JSON.stringify([...allEventIds].sort());
    } else {
      eventsChanged =
        JSON.stringify([...oldEventIds].sort()) !==
        JSON.stringify([...selectedEvents].sort());
    }

    return (
      formData.title !== selectedAddon.title ||
      formData.price !== selectedAddon.price ||
      formData.description !== (selectedAddon.description || "") ||
      formData.image !== null ||
      eventsChanged
    );
  }, [
    formData,
    selectedAddon,
    selectedEvents,
    mealProductTypes,
  ]);

  const filteredSubCategories = mealProductTypes.filter(
    (type) =>
      Array.isArray(type.configurationId) &&
      type.configurationId.some(
        (config) => config.name === selectedAddon?.categoryType?.[0]
      )
  );

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
                <strong className="addon-label">Category :</strong> {addon?.categoryType?.[0]}
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
      <CommonPopup
        isOpen={editModel}
        onClose={() => setEditModel(false)}
        heading="Edit Addon"
        buttonText={isLoading ? "Updating.." : "Update"}
        mainButtonAction={handleUpdate}
        disabled={!isChanged || isLoading}
        popupBody={
          <div className="edit-box">

            <div className="popup-form-group">
              <label>Name</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="popup-form-group">
              <label>Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
              />
            </div>

            <div className="popup-form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            {(!selectedAddon?.productId ||
              selectedAddon?.productId?.length === 0) ? (

            <div className="popup-form-group">
              <label>Events</label>

              <div className="event-dropdown product-dropdown">

                <button
                  type="button"
                  className="event-dropdown-button"
                  onClick={() =>
                    setIsEventDropdownOpen((prev) => !prev)
                  }
                >
                  <span>
                    {selectedEvents.length === 0
                      ? "Select Event"
                      : `${selectedEvents.length} Event${selectedEvents.length > 1 ? "s" : ""
                      } Selected`}
                  </span>

                  <span>▾</span>
                </button>

                {isEventDropdownOpen && (
                  <div className="event-dropdown-menu">

                      {filteredSubCategories.map((event) => (
                      <label
                        key={event._id}
                        className="event-option"
                      >
                        <input
                          type="checkbox"
                          checked={selectedEvents.includes(event._id)}
                          onChange={() => {
                            setSelectedEvents((prev) =>
                              prev.includes(event._id)
                                ? prev.filter((id) => id !== event._id)
                                : [...prev, event._id]
                            );
                          }}
                        />

                        <span>{event.name}</span>
                      </label>
                    ))}

                  </div>
                )}
              </div>
            </div>
            ) : (
            <div
              style={{
                padding: "10px 12px",
                background: "#f5f5f5",
                border: "1px solid #ddd",
                borderRadius: "6px",
                color: "#666",
                fontSize: "13px",
              }}
            >
              ℹ️ This add-on is linked to a specific product, so event
              selection is not available.
            </div>
)}

            <div className="popup-form-group">
              <label>Upload Image</label>
              <input
                type="file"
                onChange={handleImageChange}
              />
            </div>

          </div>
        }
      />

      {/* DELETE MODAL */}
      {deleteModal && (
        <CommonPopup
          isOpen={deleteModal}
          onClose={() => setDeleteModal(false)}
          heading="Confirm Delete"
          buttonText={isLoading ? "Deleting.." : "Delete"}
          mainButtonAction={() => handleDeleteConfirm()}
          disabled={isLoading}
          popupBody={
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedAddon?.title}</strong>?
            </p>
          }
        />
      )}
    </div>
  );
};

export default AddonList;
