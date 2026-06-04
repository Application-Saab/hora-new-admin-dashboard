// import React from 'react'

// const EditPackagePopup = () => {
//   return (
//     <div>EditPackagePopup</div>
//   )
// }

// export default EditPackagePopup

"use client";

import React, { useEffect, useState } from "react";

import {
  updateVenuePackage,
  fetchPackageItems,
} from "@/services/venueListServices";

const EditPackagePopup = ({ isOpen, onClose, onSuccess, packageData }) => {
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const [packageItemsMaster, setPackageItemsMaster] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    subTitle: "",
    actualPrice: "",
    discountedPrice: "",
    maxGuests: "",
    packageItems: [],
    packageAddons: [""],
    tag: "",
  });

  const [packageImage, setPackageImage] = useState(null);

  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchPackageItems(setPackageItemsMaster);
    }
  }, [isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setPackageImage(file);

    setImagePreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    if (isOpen && packageData) {
      setFormData({
        title: packageData.title || "",
        subTitle: packageData.subTitle || "",
        actualPrice: packageData.actualPrice || "",
        discountedPrice: packageData.discountedPrice || "",
        maxGuests: packageData.maxGuests || "",
        packageItems: packageData.packageItems?.map((item) => item._id) || [],
        packageAddons: packageData.packageAddons?.length
          ? packageData.packageAddons
          : [""],
        tag: packageData.tag || "",
      });

      setImagePreview(packageData.packageImageUrl || "");
    }
  }, [isOpen, packageData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemSelection = (itemId) => {
    setFormData((prev) => {
      const exists = prev.packageItems.includes(itemId);

      return {
        ...prev,
        packageItems: exists
          ? prev.packageItems.filter((id) => id !== itemId)
          : [...prev.packageItems, itemId],
      };
    });
  };

  const handleAddonChange = (index, value) => {
    const updated = [...formData.packageAddons];

    updated[index] = value;

    setFormData((prev) => ({
      ...prev,
      packageAddons: updated,
    }));
  };

  const addAddonField = () => {
    setFormData((prev) => ({
      ...prev,
      packageAddons: [...prev.packageAddons, ""],
    }));
  };

  const removeAddon = (index) => {
    const updated = [...formData.packageAddons];

    updated.splice(index, 1);

    setFormData((prev) => ({
      ...prev,
      packageAddons: updated,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();

    payload.append("title", formData.title);

    payload.append("subTitle", formData.subTitle);

    payload.append("actualPrice", formData.actualPrice);

    payload.append("discountedPrice", formData.discountedPrice);

    payload.append("maxGuests", formData.maxGuests);

    payload.append("packageItems", JSON.stringify(formData.packageItems));

    payload.append("packageAddons", JSON.stringify(formData.packageAddons));
    payload.append("tag", formData.tag);

    if (packageImage) {
      payload.append("image", packageImage);
    }

    updateVenuePackage(
      packageData._id,
      payload,
      onSuccess,
      onClose,
      setLoadingUpdate,
    );
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-btn" onClick={onClose}>
          X
        </button>

        <h2>Edit Package</h2>

        <form onSubmit={handleSubmit}>
          <div className="package-form-container">
            <div className="package-create-input-ctn">
              <input
                type="text"
                name="title"
                placeholder="Package Title"
                value={formData.title}
                onChange={handleChange}
                required
                className="package-create-input"
              />

              <input
                type="text"
                name="subTitle"
                placeholder="Package Subtitle"
                value={formData.subTitle}
                onChange={handleChange}
                required
                className="package-create-input"
              />
            </div>

            <div className="package-create-input-ctn">
              <input
                type="number"
                name="actualPrice"
                placeholder="Actual Price"
                value={formData.actualPrice}
                onChange={handleChange}
                required
                className="package-create-input"
              />

              <input
                type="number"
                name="discountedPrice"
                placeholder="Discounted Price"
                value={formData.discountedPrice}
                onChange={handleChange}
                className="package-create-input"
              />
            </div>

            <div className="package-create-input-ctn">
              <input
                type="number"
                name="maxGuests"
                placeholder="Max Guests"
                value={formData.maxGuests}
                onChange={handleChange}
                className="package-create-input"
              />
              <input
                type="text"
                name="tag"
                placeholder="Tag"
                value={formData.tag}
                onChange={handleChange}
                className="package-create-input"
              />
            </div>

            <h4>Package Banner Image</h4>

            <div
              style={{
                marginBottom: "20px",
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />

              {imagePreview && (
                <div
                  style={{
                    marginTop: "10px",
                  }}
                >
                  <img
                    src={imagePreview}
                    alt="preview"
                    style={{
                      width: "200px",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                    }}
                  />
                </div>
              )}
            </div>

            <h4>Package Items</h4>

            <div
              style={{
                maxHeight: "250px",
                overflowY: "auto",
                border: "1px solid #ddd",
                padding: "10px",
                marginBottom: "20px",
              }}
            >
              {packageItemsMaster.map((item) => (
                <label
                  key={item._id}
                  style={{
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.packageItems.includes(item._id)}
                    onChange={() => handleItemSelection(item._id)}
                  />{" "}
                  {item.title}
                </label>
              ))}
            </div>

            <h4>Addons</h4>

            {formData.packageAddons.map((addon, index) => (
              <div key={index} className="package-create-input-ctn">
                <input
                  type="text"
                  value={addon}
                  placeholder="Addon"
                  onChange={(e) => handleAddonChange(index, e.target.value)}
                  className="package-create-input"
                />

                <button type="button" onClick={() => removeAddon(index)}>
                  Remove
                </button>
              </div>
            ))}

            <button type="button" onClick={addAddonField}>
              Add Addon
            </button>

            <div
              style={{
                marginTop: "30px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                className="package-create-btn package-cancel-btn"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="package-create-btn"
                disabled={loadingUpdate}
              >
                {loadingUpdate ? "Updating..." : "Update Package"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPackagePopup;
