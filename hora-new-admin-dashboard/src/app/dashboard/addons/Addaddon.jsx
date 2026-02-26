"use client";
import React, { useState, useEffect, useMemo } from "react";
import { BASE_URL, ADD_ADDON, PRODUCT_MEAL_TYPE, IMAGE_UPLOAD } from "../../../utils/apiconstant";
import "./addon.css";
import SearchWithDropDown from "@/app/component/SearchWithDropDown";

const Addaddons = () => {
  const [selectedCategoryType, setSelectedCategoryType] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [mealProductTypes, setMealProductTypes] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectAllEvents, setSelectAllEvents] = useState(false);
  const [selectAllProducts, setSelectAllProducts] = useState(false);


  const productNames = useMemo(() => {
    return products.map((item) => item.name);
  }, [products]);

  // ---------------- FETCH MEAL TYPES ----------------
  useEffect(() => {
    const fetchMealTypes = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}${PRODUCT_MEAL_TYPE}?per_page=500`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          }
        );

        const data = await response.json();
        setMealProductTypes(data?.data?.meal || []);
      } catch (error) {
        console.error("Error fetching meals:", error);
      }
    };

    fetchMealTypes();
  }, []);

  // ---------------- HANDLE SUBCATEGORY ----------------
  const handleSubCategoryChange = async (e) => {
    const subCategoryId = e.target.value;

    setSelectedSubCategory(subCategoryId);
    setSelectedProduct("");
    setProducts([]);

    if (!subCategoryId || !selectedCategoryType) return;

    try {
      const response = await fetch(
        `${BASE_URL}/api/${selectedCategoryType}/searchByTag/${subCategoryId}`
      );

      const data = await response.json();
      setProducts(data?.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  // ---------------- FILTERED SUBCATEGORIES ----------------
  const filteredSubCategories = mealProductTypes.filter(
    (type) =>
      Array.isArray(type.configurationId) &&
      type.configurationId.some(
        (config) => config.name === selectedCategoryType
      )
  );

  // ---------------- VALIDATION ----------------
  const isFormValid =
    selectedCategoryType &&
    (
      selectAllEvents ||
      (selectedSubCategory && (selectAllProducts || selectedProduct))
    ) &&
    title.trim() !== "" &&
    price !== "" &&
    imageFile;

  // ---------------- SUBMIT ----------------
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // ---------------- STEP 1: UPLOAD IMAGE ----------------
    const imageForm = new FormData();
    imageForm.append("file", imageFile);

    const uploadResponse = await fetch(BASE_URL + IMAGE_UPLOAD, {
      method: "POST",
      body: imageForm,
    });

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok || uploadData.error) {
      throw new Error(uploadData.message || "Image upload failed");
    }

    const uploadedImageName = uploadData.data; 

    // ---------------- STEP 2: SEND ADDON DATA ----------------
    const payload = {
      title,
      price,
      description,
      image: uploadedImageName,
      categoryType: selectAllEvents || selectedSubCategory ? selectedCategoryType : "",
      productType: !selectAllEvents && !selectAllProducts ? selectedCategoryType : "",
      productId: !selectAllEvents && !selectAllProducts ? selectedProduct : "",
      eventType: !selectAllEvents && selectAllProducts ? selectedSubCategory : "",       
    };

    const response = await fetch(`${BASE_URL}${ADD_ADDON}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok ) {
      throw new Error(data.message || "Something went wrong");
    }

    alert("Addon created successfully");

    // ---------------- RESET ----------------
    setTitle("");
    setPrice("");
    setDescription("");
    setImageFile(null);
    setSelectedProduct("");
    setSelectedSubCategory("");
    setSelectAllEvents(false);
    setSelectAllProducts(false);
    setProducts([]);
    setSelectedCategoryType("");

  } catch (error) {
    console.error("Error creating addon:", error);
    alert(error.message);
  } finally {
    setIsLoading(false);
  }
};


 
  return (
    <div>
      <div className="d-flex mb-2">
        {/* CATEGORY */}
        <div style={{width: "35%"}} className="form-group">
          <label>Select Category</label>
          <select
            value={selectedCategoryType}
            onChange={(e) => {
              setSelectedCategoryType(e.target.value);
              setSelectedSubCategory("");
              setSelectedProduct("");
              setProducts([]);
            }}
          >
            <option value="">Select Category</option>
            <option value="Decoration">Decoration</option>
            <option value="Photography">Photography</option>
          </select>
        </div>

        {/* SUBCATEGORY */}
        {selectedCategoryType && (
          <div style={{width: "35%"}} className="form-group">

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {!selectAllEvents && (
                <label>Select Event</label>
              )}
             <div>
               <input
                type="checkbox"
                checked={selectAllEvents}
                className="addon-checkbox mb-4"
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSelectAllEvents(checked);

                  if (checked) {
                    setSelectedSubCategory("");
                    setSelectedProduct("");
                    setSelectAllProducts(false);
                    setProducts([]);
                  }
                }}
              />

              <span className="mb-6">Select All Events</span>
             </div>
            </div>

            {!selectAllEvents && (
              <select
                value={selectedSubCategory}
                onChange={handleSubCategoryChange}
              >
                <option value="">Select Event</option>
                {filteredSubCategories.map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {selectedSubCategory && !selectAllEvents && (
        <div className="form-group" style={{ marginTop: "10px" , width: "35%"}}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {!selectAllProducts && (
              <label>Select Product</label>
            )}
            <div>
              <input
              type="checkbox"
              checked={selectAllProducts}
              className="addon-checkbox mb-4"
              onChange={(e) => {
                const checked = e.target.checked;
                setSelectAllProducts(checked);

                if (checked) {
                  setSelectedProduct("");
                }
              }}
            />
            <span className="mb-6">Select All Products</span>
            </div>
          </div>

          {/* PRODUCT */}
          {selectedSubCategory &&
            products.length > 0 &&
            !selectAllProducts &&
            !selectAllEvents && (
              <div className="form-group product-dropdown">


                <SearchWithDropDown
                  options={productNames}
                  selectedValue={
                    products.find((p) => p._id === selectedProduct)?.name || ""
                  }
                  placeholder="Search Product..."
                  onChange={(selectedName) => {
                    const selectedObj = products.find(
                      (item) => item.name === selectedName
                    );
                    if (selectedObj) {
                      setSelectedProduct(selectedObj._id);
                    }
                  }}
                />
              </div>
            )}

        </div>
        )}
      </div>
      {/* FORM */}
      {(selectedCategoryType && (selectAllEvents || selectedProduct || selectAllProducts)) && (
        <div className="formWrapper">

         <div className="d-flex mb-2">
           <div className="form-group">
            <label>Addon Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
         </div>

         <div className="d-flex mb-2">
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </div>
         </div>

          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading}
            className={`submitButton ${!isFormValid || isLoading ? "disabledButton" : ""
              }`}
          >
            {isLoading ? "Adding..." : "Add Addon"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Addaddons;
