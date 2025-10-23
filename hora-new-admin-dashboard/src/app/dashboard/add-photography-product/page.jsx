"use client";
import React, { useState, useEffect } from "react";
import "./addphotography.css";
import {
  BASE_URL,
  PRODUCT_MEAL_TYPE,
  IMAGE_UPLOAD,
  ADD_PHOTOGRAPHY_PRODUCT,
} from "../../../utils/apiconstant";

const AddProductForm = () => {
  const [productName, setProductName] = useState("");
  const [productRate, setProductRate] = useState("");
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [mealProductTypes, setMealProductTypes] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showCategoryItems, setShowCategoryItems] = useState(false);
  const [option2Text, setOption2Text] = useState("");
  const [alertMessage, setAlertMessage] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [selectedTag, setSelectedTag] = useState(null); // optional tags if needed

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

const handleCheckboxChange = (id) => {
  setSelectedMealTypes((prev) => {
    const updated = prev.includes(id)
      ? prev.filter((item) => item !== id)
      : [...prev, id];
    if (updated.length > 0) {
      setSelectedTag(updated[0]);
    } else {
      setSelectedTag(null);
    }

    return updated;
  });
};

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setPreviewImage(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(BASE_URL + IMAGE_UPLOAD, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.error === false) {
        setUploadedImage(data.data);
      } else {
        showAlert("Image upload failed: " + data.message, "error");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      showAlert("Error uploading image", "error");
    }
  };

  const showAlert = (message, type) => {
    setAlertMessage({ show: true, message, type });
    setTimeout(() => {
      setAlertMessage({ show: false, message: "", type: "" });
    }, 3000);
  };

  const resetForm = () => {
    setProductName("");
    setProductRate("");
    setSelectedMealTypes([]);
    setUploadedImage(null);
    setPreviewImage(null);
    setOption2Text("");
    setSelectedTag(null);
  };

  const handleSubmitProduct = async () => {
    // Format inclusions as list inside <div> tags
    const formatText = (text) =>
      text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((item) => `<div>- ${item}</div>`);

    const formattedInclusions = formatText(option2Text);
    const formattedOption2Text = formatText(option2Text);

    // Create full data object as required by backend
    const productData = {
      name: productName || "",
      short_link: "",
      featured_image: uploadedImage || "",
      caption: "",
      badge: null,
      price: productRate ? String(productRate) : "0",
      type: null,
      is_wishlisted: null,
      ratings: null,
      attributes: null,
      inclusion: formattedInclusions.length ? formattedInclusions : [],
      tag: selectedTag ? [selectedTag] : [],
      status: 1,
      cuisineId: ["66c96b2a22ed47b72117e089"],
      mealId: selectedMealTypes,
      categoryIds: [],
      catId: [],
    };

    try {
      const response = await fetch(BASE_URL + ADD_PHOTOGRAPHY_PRODUCT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      const data = await response.json();

      if (data.error === false) {
        showAlert("✅ Product successfully created!", "success");
        resetForm();
      } else {
        showAlert(
          "❌ Failed to create product: " + (data.message || "Unknown error"),
          "error"
        );
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      showAlert("Error submitting product", "error");
    }
  };

  return (
    <div className="form-container">
      {alertMessage.show && (
        <div className={`alert ${alertMessage.type}`}>
          {alertMessage.message}
        </div>
      )}

      <h1 className="createOrder pageHeading">Add Product</h1>

      {/* Product Name */}
      <div className="form-row">
        <div className="form-group">
          <label>Product Name *</label>
          <input
            className="input"
            type="text"
            placeholder="Product Name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>
      </div>

      {/* Image + Category + Rate */}
      <div className="form-row horizontal-fields">
        <div className="form-group">
          <label>Product Image *</label>
          <div
            className="image-upload-container"
            onClick={() => document.getElementById("imageUpload").click()}
          >
            {previewImage ? (
              <img src={previewImage} alt="Preview" className="image-preview" />
            ) : (
              <div className="image-placeholder">Click to Upload</div>
            )}
          </div>
          <input
            type="file"
            id="imageUpload"
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />
        </div>

<div className="form-group">
  <label>Product Category Type *</label>
  <div
    className="category-dropdown"
    onClick={() => setShowCategoryItems(!showCategoryItems)}
  >
    {selectedMealTypes.length > 0
      ? mealProductTypes
          .filter((t) => selectedMealTypes.includes(t._id))
          .map((t) => t.name)
          .join(", ")
      : "Select categories"}

    {showCategoryItems && (
      <div className="category-items">
        {mealProductTypes.map((type) => (
          <label key={type._id} className="checkbox-label">
            <input
              type="checkbox"
              checked={selectedMealTypes.includes(type._id)}
              onChange={() => handleCheckboxChange(type._id)}
            />
            {type.name}
          </label>
        ))}
      </div>
    )}
  </div>
</div>

        <div className="form-group">
          <label>Product Rate *</label>
          <input
            className="input"
            type="text"
            placeholder="Product Rate"
            value={productRate}
            onChange={(e) => setProductRate(e.target.value)}
          />
        </div>
      </div>

      {/* Inclusion Textarea */}
      <div className="form-group" style={{ marginTop: "20px" }}>
        <label>📝 Product Inclusion</label>
        <textarea
          value={option2Text}
          onChange={(e) => setOption2Text(e.target.value)}
          placeholder="Enter inclusion details here..."
          style={{
            width: "100%",
            height: "200px",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            backgroundColor: "#fafafa",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
          }}
        />
      </div>

      <button className="orderCheck-btn" onClick={handleSubmitProduct}>
        Create Product
      </button>
    </div>
  );
};

export default AddProductForm;
