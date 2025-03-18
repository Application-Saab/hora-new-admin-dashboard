"use client";
import React, { useState, useEffect } from "react";
import "./adddecoration.css";
import {
  BASE_URL,
  PRODUCT_MEAL_TYPE,
  IMAGE_UPLOAD,
  ADD_DECORATION_PRODUCT,
} from "../../../utils/apiconstant";

const AddProductForm = () => {
  const [productName, setProductName] = useState("");
  const [productRate, setProductRate] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProductTypes, setSelectedProductTypes] = useState([]);
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [mealProductTypes, setMealProductTypes] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showCategoryItems, setShowCategoryItems] = useState(false);
  const [alertMessage, setAlertMessage] = useState({
    show: false,
    message: "",
    type: "",
  });

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

  const handleCheckboxChange = (id, type) => {
    if (type === "product") {
      setSelectedProductTypes((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else if (type === "meal") {
      setSelectedMealTypes((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    }
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
        console.error("Image upload failed:", data.message);
        showAlert("Image upload failed: " + data.message, "error");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      showAlert("Error uploading image", "error");
    }
  };

  const resetForm = () => {
    setProductName("");
    setProductRate("");
    setDescription("");
    setSelectedProductTypes([]);
    setSelectedMealTypes([]);
    setUploadedImage(null);
    setPreviewImage(null);
  };

  const showAlert = (message, type) => {
    setAlertMessage({ show: true, message, type });
    setTimeout(() => {
      setAlertMessage({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleSubmit = async () => {
    const productData = {
      name: productName,
      dish_rate: productRate,
      description: "",
      image: uploadedImage,
      cuisineId: ["65a2c9d3513d9389d34e2ec9"],
      mealId: selectedMealTypes,
      is_dish: "1",
      dish_allow: "true",
      serving_dish: [],
      is_preparation: "true",
      per_plate_qty: {
        qty: "",
        unit: "",
      },
      cooking_min: 10,
      preparation_min: 10,
      special_appliance_id: [],
      general_appliance_id: [],
      is_gas: "true",
      preperationtext: description,
      noofpeopleServedByDish: "",
      ingredientUsed: [
        {
          _id: "641539dbbafd4ec2e102bc91",
          name: "Ajinomoto",
          image: "attachment78.png",
          unit: "",
          qty: "",
        },
      ],
      categoryIds: [],
      catId: [],
      status: "1",
    };

    console.log(productData, "productdata");

    try {
      const response = await fetch(BASE_URL + ADD_DECORATION_PRODUCT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      const data = await response.json();

      if (data.error === false) {
        showAlert("Product successfully created!", "success");
        resetForm();
      } else {
        showAlert(
          "Failed to create product: " + (data.message || "Unknown error"),
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
              ? `${selectedMealTypes.length} categories selected`
              : "Select categories"}
            {showCategoryItems && (
              <div className="category-items">
                {mealProductTypes.map((type) => (
                  <label key={type._id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedMealTypes.includes(type._id)}
                      onChange={() => handleCheckboxChange(type._id, "meal")}
                    />
                    {type.name}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label style={{ marginLeft: "-80px", width: "100%" }}>
            Product Rate *
          </label>
          <input
            style={{ marginLeft: "-80px", width: "100%" }}
            className="input"
            type="text"
            placeholder="Product Rate"
            value={productRate}
            onChange={(e) => setProductRate(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Product Inclusion</label>
        <textarea
          placeholder="Enter text here..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
      </div>

      <button className="orderCheck-btn" onClick={handleSubmit}>
        Create Product
      </button>

      <style jsx>{`
        .alert {
          padding: 12px;
          margin-bottom: 15px;
          border-radius: 6px;
          text-align: center;
          animation: fadeIn 0.3s, fadeOut 0.5s 2.5s;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        .success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .horizontal-fields {
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }

        .image-upload-container {
          width: 150px;
          height: 150px;
          border: 2px dashed #aaa;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .image-placeholder {
          color: #666;
          text-align: center;
        }

        .image-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .category-dropdown {
          position: relative;
          width: 300px;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 6px;
          cursor: pointer;
          background-color: white;
          margin-right: 100px;
        }

        .category-items {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          max-height: 150px;
          overflow-y: auto;
          background: white;
          border: 1px solid #ccc;
          border-radius: 0 0 6px 6px;
          z-index: 100;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          transition: background 0.2s;
        }

        .checkbox-label:hover {
          background: #f0f0f0;
        }
      `}</style>
    </div>
  );
};

export default AddProductForm;
