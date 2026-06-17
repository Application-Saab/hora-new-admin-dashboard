"use client";

import React, { useEffect, useState } from "react";

import {
  createVenuePackage,
  fetchPackageCategories,
  fetchPackageItems,
} from "@/services/venueListServices";
import { BASE_URL } from "@/utils/apiconstant";

const CreatePackagePopup = ({ isOpen, onClose, onSuccess, venueId }) => {
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [packageItemsMaster, setPackageItemsMaster] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    subTitle: "",
    actualPrice: "",
    discountedPrice: "",
    maxGuests: "",
    tag: "",
    packageItems: [],
    packageAddons: [""],
  });

  const [packageImage, setPackageImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [packageCategories, setPackageCategories] = useState([]);

  const [newItemTitle, setNewItemTitle] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [itemFoodtype, setItemFoodtype] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchPackageItems(setPackageItemsMaster, setFilteredItems);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchPackageCategories(setPackageCategories);
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
    payload.append("venueId", venueId);
    payload.append("title", formData.title);
    payload.append("subTitle", formData.subTitle);
    payload.append("actualPrice", formData.actualPrice);
    payload.append("discountedPrice", formData.discountedPrice);
    payload.append("maxGuests", formData.maxGuests);
    payload.append("tag", formData.tag);
    payload.append("packageItems", JSON.stringify(formData.packageItems));
    payload.append("packageAddons", JSON.stringify(formData.packageAddons));

    if (packageImage) {
      payload.append("image", packageImage);
    }

    createVenuePackage(payload, onSuccess, onClose, setLoadingCreate);
  };

  const handleAddItem = async () => {
    if (!newItemTitle) return;

    const payload = {
      title: newItemTitle,
      categoryIds: selectedCategories,
      foodType: itemFoodtype,
    };

    try {
      await fetch(`${BASE_URL}/api/party-venue/package-item/create-item`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // reset
      setNewItemTitle("");
      setSelectedCategories([]);

      // refetch items
      fetchPackageItems(setPackageItemsMaster, setFilteredItems);
    } catch (err) {
      console.log(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content" style={{ maxWidth: "800px" }}>
        <button className="close-btn" onClick={onClose}>
          X
        </button>

        <h2>Create Package</h2>

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
                placeholder="Min Guests"
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
            <hr />
            <h4>Package Items</h4>

            <div style={{ display: "flex", gap: "20px" }}>
              <div
                style={{
                  maxHeight: "250px",
                  overflowY: "auto",
                  border: "1px solid #ddd",
                  padding: "10px",
                  marginBottom: "20px",
                  width: "60%",
                }}
              >
                <input
                  type="text"
                  placeholder="Search items..."
                  className="package-create-input"
                  style={{ marginBottom: "10px" }}
                  onChange={(e) => {
                    const searchTerm = e.target.value.toLowerCase();

                    if (!searchTerm) {
                      setFilteredItems(packageItemsMaster);
                      return;
                    }

                    const filtered = packageItemsMaster.filter((item) =>
                      item.title.toLowerCase().includes(searchTerm),
                    );

                    setFilteredItems(filtered);
                  }}
                />
                {filteredItems.length === 0 && (
                  <div style={{ textAlign: "center", color: "#888" }}>
                    No items found.
                  </div>
                )}
                {filteredItems?.map((item) => (
                  <div
                    key={item._id}
                    className="items-dropdown-ctn"
                    onClick={() => handleItemSelection(item._id)}
                  >
                    <div>
                      <label style={{ fontSize: "12px", margin: "0px" }}>
                        {item?.foodType === "veg" ? "🟢" : "🔴"} {item.title}
                      </label>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        checked={formData.packageItems.includes(item._id)}
                        onChange={() => handleItemSelection(item._id)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h4 style={{ margin: "0px" }}>Add New Item</h4>
                <input
                  type="text"
                  placeholder="Item Title"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                />
                <div
                  style={{
                    maxHeight: "150px",
                    overflowY: "auto",
                    border: "1px solid #ddd",
                    padding: "10px",
                    marginTop: "10px",
                    width: "100%",
                  }}
                >
                  {packageCategories?.map((cat) => (
                    <div
                      key={cat._id}
                      className="items-dropdown-ctn"
                      // onClick={() => {
                      //   if (selectedCategories.includes(cat._id)) {
                      //     setSelectedCategories((prev) =>
                      //       prev.filter((id) => id !== cat._id),
                      //     );
                      //   } else {
                      //     setSelectedCategories((prev) => [...prev, cat._id]);
                      //   }
                      // }}
                      onClick={() => {
                        setSelectedCategories([cat._id]);
                      }}
                    >
                      <div>
                        <label style={{ fontSize: "12px", margin: "0px" }}>
                          {cat.title}
                        </label>
                      </div>
                      <div>
                        <input
                          type="radio"
                          // checked={selectedCategories.includes(cat._id)}
                          checked={selectedCategories[0] === cat._id}
                          // onChange={() => {
                          //   setSelectedCategories((prev) =>
                          //     prev.includes(cat._id)
                          //       ? prev.filter((id) => id !== cat._id)
                          //       : [...prev, cat._id],
                          //   );
                          // }}
                          onChange={() => {
                            setSelectedCategories([cat._id]);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <input
                      type="radio"
                      name="foodType"
                      value="veg"
                      onChange={(e) => setItemFoodtype(e.target.value)}
                    />
                    <label
                      for="foodType1"
                      style={{ margin: "0px", fontSize: "12px" }}
                    >
                      Veg
                    </label>
                    <input
                      type="radio"
                      name="foodType"
                      value="non-veg"
                      style={{ marginLeft: "10px" }}
                      onChange={(e) => setItemFoodtype(e.target.value)}
                    />
                    <label
                      for="foodType2"
                      style={{ margin: "0px", fontSize: "12px" }}
                    >
                      Non-Veg
                    </label>
                  </div>
                  <div>
                    <button
                      style={{ marginTop: "5px", cursor: "pointer" }}
                      onClick={handleAddItem}
                      type="button"
                    >
                      Add Item
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <hr />

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
                disabled={loadingCreate}
              >
                {loadingCreate ? "Creating..." : "Create Package"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePackagePopup;
