"use client";

import React, { useState, useEffect } from "react";
import "./PhotographyEditor.css";
import { BASE_URL, EDIT_PHOTOGRAPHY_PRODUCT, PRODUCT_MEAL_TYPE } from "../../../utils/apiconstant";
import Image from "next/image";
import axios from "axios";

const DecorationEditor = () => {
    const [selectedSubCategory, setSelectedSubCategory] = useState("");
    const [responseData, setResponseData] = useState([]);
    const [popupData, setPopupData] = useState(null);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState(null);
    const [duration, setDuration] = useState("");
    const [advanceAmount, setAdvanceAmount] = useState("");
const [mealProductTypes, setMealProductTypes] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [inclusion, setInclusion] = useState("");
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

     useEffect(() => {
          fetchOptions(BASE_URL + PRODUCT_MEAL_TYPE, setMealProductTypes, {
            per_page: "500",
          });
        }, []);
    
        const fetchOptions = async (url, setter, body) => {
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const data = await response.json();
          if (data.error === false && data.data) {
            setter(
              url.includes("admin_meals_list")
                ? data.data.meal || []
                : data.data.configuration || []
            );
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

    const handleSelectChange = async (event) => {
        const subCategory = event.target.value;
        setSelectedSubCategory(subCategory);
        setLoading(true);

        if (subCategory) {
            try {
                const response = await fetch(
                    `https://horaservices.com:3000/api/meals/idByTag?tag=${subCategory}`
                );
                const data = await response.json();

                if (data && data.data && data.data._id) {
                    await fetchSecondAPI(data.data._id);
                } else {
                    setResponseData([]);
                }
            } catch (error) {
                console.error("Error fetching _id:", error);
            } finally {
                setLoading(false);
            }
        } else {
            setResponseData([]);
            setLoading(false);
        }
    };

    const fetchSecondAPI = async (_id) => {
        try {
            const response = await fetch(
                `https://horaservices.com:3000/api/photography/searchByTag/${_id}`
            );
            const data = await response.json();
            if (data && data.data) {
                setResponseData(data.data);
            } else {
                setResponseData([]);
            }
        } catch (error) {
            console.error("Error fetching second API:", error);
        }
    };

    const handlePopupOpen = (item) => {
        setPopupData(item);
        setName(item.name);
        setPrice(item.price);
        setImage(null);
        setSelectedTags(item.tag || []);
        setDuration(item.duration || "");
        setAdvanceAmount(item.advance_amount || "");

        // Format inclusion text
        const inclusionText = item.inclusion
            .map((item) => item.replace(/<[^>]*>/g, "")) // Remove HTML tags
            .join("\n") // Ensure each item is on a new line
            .replace(/-\s*/g, "\n- "); // Ensure each `-` starts a new line

        setInclusion(inclusionText);
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploadingImage(true);

        try {
            const response = await fetch(
                "https://horaservices.com:3000/api/image_upload",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();
            if (response.ok && data.data) {
                // Just store the filename, not the full URL
                setImage(data.data);
            } else {
                console.error("Image upload failed:", data);
            }
        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleTagChange = (tagId) => {
        setSelectedTags((prevTags) =>
            prevTags.includes(tagId)
                ? prevTags.filter((id) => id !== tagId)
                : [...prevTags, tagId]
        );
    };

    const handlePopupClose = () => {
        setPopupData(null);
        setName("");
        setPrice("");
        setImage(null);
        setSelectedTags([]);
        setInclusion("");
    };

    const handleSaveChanges = async () => {
        // Format inclusion with HTML div tags
        const formattedInclusion = [
            inclusion
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => `<div>${line}</div>`)
                .join(""),
        ];

        // Prepare the request data
        const requestData = {
            _id: popupData._id,
            name: name,
            price: price,
            featured_image: image ? image : popupData.featured_image,
            tag: selectedTags,
            inclusion: formattedInclusion,
            duration: duration || "",
            advance_amount: advanceAmount || "",

        };

        try {
            // Log all the data to console
            console.log("Sending data:", requestData);

            // Make the API request
            const response = await fetch(BASE_URL + EDIT_PHOTOGRAPHY_PRODUCT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            const result = await response.json();
            console.log("API response:", result);

            if (response.ok) {
                if (selectedSubCategory) {
                    handleSelectChange({ target: { value: selectedSubCategory } });
                }
            } else {
                console.error("API error:", result);
                // Optionally show error message
            }
        } catch (error) {
            console.error("Error saving changes:", error);
            // Optionally show error message
        }

        setPopupData(null); // Close the popup after saving
    };

    // Add this function to filter the data
    const filteredData = responseData.filter((item) => {
  const lowerQuery = searchQuery.toLowerCase();

  return (
    item.name.toLowerCase().includes(lowerQuery) ||
    item._id.toLowerCase().includes(lowerQuery) ||
    item.tag.some((tagId) => {
      const tag = mealProductTypes.find((t) => t._id === tagId);
      return tag?.name.toLowerCase().includes(lowerQuery);
    })
  );
});

    return (
        <div className="container">
            <div className="content-wrapper">
                <h1 className="page-title">Photography Editing</h1>

                <div className="form-control full-width">
                    <label htmlFor="subcategory-select" className="select-label">
                        Select Subcategory
                    </label>
                    <select
                        id="subcategory-select"
                        value={selectedSubCategory}
                        onChange={handleSelectChange}
                        className="select-dropdown"
                    >
                        <option value="">Select SubCategory</option>
                        {mealProductTypes
                .filter((type) =>
                type.configurationId?.some(
                (config) => config.name === "Photography"
                )
                ) .map((item) => (
              <option key={item._id} value={item.name}>
                {item.name}
              </option>
            ))}
                    </select>
                </div>

                <div className="form-control full-width">
                    <input
                        type="text"
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, ID or tag"
                    />
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                    </div>
                ) : filteredData.length > 0 ? (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Featured Image</th>
                                    <th>Price</th>
                                    <th>Tags</th>
                                    <th>Actions</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item) => (
                                    <tr key={item._id} className="table-row">
                                        <td>{item.name}</td>
                                        <td>
                                            {item.featured_image ? (
                                                <Image
                                                    // src={`https://horaservices.com/api/uploads/compressed_webp/${item.featured_image}`}
                                                    src={`https://horaservices.com/api/uploads/compressed_webp/${item?.featured_image.split(".")[0]
                                                        }.webp`}
                                                    alt={item.name}
                                                    className="thumbnail"
                                                    width={80}
                                                    height={40}
                                                />
                                            ) : (
                                                "No Image"
                                            )}
                                        </td>
                                        <td>₹{item.price}</td>
                                        <td>
                                            <div className="chip-container">
                                                {item.tag.map((tagId) => {
                        const tag = mealProductTypes.find((t) => t._id === tagId);
                        return (
                       <span key={tagId} className="chip">
                       {tag ? tag.name : "Unknown"}
                       </span>
                       );
                        })}
                                            </div>
                                        </td>
                                        <td className="actions-cell">
                                            <button
                                                className="action-button"
                                                onClick={() => handlePopupOpen(item)}
                                            >
                                                <i className="icon-visibility"></i>
                                                Update
                                            </button>
                                        </td>
                                        <td className="actions-cell">
                                            <button
                                                className="action-button"
                                                onClick={async () => {
                                                    const newStatus = item.status === 1 ? 0 : 1;

                                                    await axios.post("https://horaservices.com:3000/api/dish/update_decoration_status", {
                                                        id: item._id,
                                                        status: newStatus,
                                                    });

                                                    window.location.reload(); // reload the page s
                                                }}
                                                style={{
                                                    backgroundColor: item.status === 1 ? "green" : "red",
                                                }}
                                            >
                                                {item.status === 1 ? "Active" : "Inactive"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    selectedSubCategory && (
                        <div className="no-data-message">
                            <p>No items found for this subcategory.</p>
                        </div>
                    )
                )}

                {popupData && (
                    <div className="modal-overlay">
                        <div className="modal-dialog">
                            <div className="modal-header">
                                <h2 className="modal-title">
                                    Editing Details for: {popupData.name}
                                </h2>
                                <span className="modal-subtitle">ID: {popupData._id}</span>
                            </div>
                            <div className="modal-content">
                                <div className="modal-grid">
                                    <div className="modal-column">
                                        <div className="form-group">
                                            <label htmlFor="name-input">Name</label>
                                            <input
                                                id="name-input"
                                                type="text"
                                                className="form-input"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="price-input">Price</label>
                                            <div className="price-input-container">
                                                <span className="price-symbol">₹</span>
                                                <input
                                                    id="price-input"
                                                    type="number"
                                                    className="form-input price-input"
                                                    value={price}
                                                    onChange={(e) => setPrice(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="duration-input">Duration</label>
                                            <input
                                                id="duration-input"
                                                type="text"
                                                className="form-input"
                                                placeholder="e.g. 2 Hours"
                                                value={duration}
                                                onChange={(e) => setDuration(e.target.value)}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="advance-input">Advance Amount (₹)</label>
                                            <input
                                                id="advance-input"
                                                type="number"
                                                className="form-input"
                                                placeholder="Enter advance amount"
                                                value={advanceAmount}
                                                onChange={(e) => setAdvanceAmount(e.target.value)}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <h3 className="section-title">Image Upload</h3>
                                            <div className="upload-container">
                                                <label htmlFor="image-upload" className="upload-button">
                                                    {uploadingImage ? "Uploading..." : "Upload Image"}
                                                    <input
                                                        id="image-upload"
                                                        type="file"
                                                        className="hidden-input"
                                                        onChange={handleImageChange}
                                                    />
                                                </label>
                                                {uploadingImage && (
                                                    <div className="upload-spinner"></div>
                                                )}
                                            </div>

                                            {image ? (
                                                <div className="image-preview-container">
                                                    <p className="image-label">New Image:</p>
                                                    <img
                                                        src={`https://horaservices.com/api/uploads/${image}`}
                                                        alt="New uploaded image"
                                                        className="image-preview"
                                                    />
                                                </div>
                                            ) : popupData.featured_image ? (
                                                <div className="image-preview-container">
                                                    <p className="image-label">Current Image:</p>
                                                    <img
                                                        src={`https://horaservices.com/api/uploads/compressed_webp/${popupData.featured_image}`}
                                                        alt={popupData.name}
                                                        className="image-preview"
                                                    />
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="modal-column">
                                        <h3 className="section-title">Tags</h3>
                                        <div className="tags-container">
                                           
                                            {mealProductTypes
                .filter((type) =>
                type.configurationId?.some(
                (config) => config.name === "Photography"
                )
                ) 
               .map((type) => (
               <div key={type._id} className="checkbox-item">
                <input
                type="checkbox"
                id={`tag-${type._id}`}
                checked={selectedTags.includes(type._id)}
                onChange={() => handleTagChange(type._id)}
                />
                <label htmlFor={`tag-${type._id}`}>{type.name}</label>
                </div>
                ))}
                                        </div>
                                    </div>

                                    <div className="modal-full-width">
                                        <div className="divider"></div>
                                        <h3 className="section-title">
                                            Inclusion (one item per line)
                                        </h3>
                                        <textarea
                                            className="textarea-input"
                                            rows="8"
                                            value={inclusion}
                                            onChange={(e) => setInclusion(e.target.value)}
                                            placeholder="Enter inclusion items, one per line"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="button button-secondary"
                                    onClick={handlePopupClose}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="button button-primary"
                                    onClick={handleSaveChanges}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DecorationEditor;
