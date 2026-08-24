"use client";
import React, { useState, useEffect } from "react";
import { BASE_URL, ADD_THEME, PRODUCT_MEAL_TYPE, IMAGE_UPLOAD } from "../../../utils/apiconstant";
import "./theme.css";

const Addtheme = () => {
  const [selectedCategoryType, setSelectedCategoryType] = useState("");
  const [mealProductTypes, setMealProductTypes] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectAllEvents, setSelectAllEvents] = useState(false);
  const [selectAllProducts, setSelectAllProducts] = useState(false);

  // ---------------- FETCH MEAL TYPES ----------------
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
            : data.data.configuration || [],
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchOptions(BASE_URL + PRODUCT_MEAL_TYPE, setMealProductTypes, {
      per_page: "500",
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInsideEventDropdown =
        event.target.closest(".event-dropdown");

      const isInsideProductDropdown =
        event.target.closest(".product-dropdown");

      if (!isInsideEventDropdown) {
        setIsEventDropdownOpen(false);
      }

      if (!isInsideProductDropdown) {
        setIsProductDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ---------------- HANDLE SUBCATEGORY ----------------
  const handleSubCategoryChange = async (selectedEventIds) => {
    setSelectedSubCategories(selectedEventIds);
    setSelectedProducts([]);
    setProducts([]);

    if (!selectedEventIds?.length || !selectedCategoryType) {
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/api/${selectedCategoryType}/searchByTags`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tags: selectedEventIds,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        setProducts([]);
        return;
      }

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
      (
        selectedSubCategories.length > 0 &&
        (
          selectAllProducts ||
          selectedProducts.length > 0
        )
      )
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

      // ---------------- STEP 2: SEND Theme DATA ----------------
      const payload = {
        title,
        price,
        description,
        image: uploadedImageName,
        categoryType: selectedCategoryType,
        productId:
          !selectAllEvents && !selectAllProducts
            ? selectedProducts
            : [],
        eventType:
          !selectAllEvents && selectAllProducts
            ? selectedSubCategories
            : [],
      };

      const response = await fetch(`${BASE_URL}${ADD_THEME}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      alert("Theme created successfully");

      // ---------------- RESET ----------------
      setTitle("");
      setPrice("");
      setDescription("");
      setImageFile(null);
      setSelectedProducts([]);
      setSelectedSubCategories([]);
      setSelectAllEvents(false);
      setSelectAllProducts(false);
      setProducts([]);
      setSelectedCategoryType("");

    } catch (error) {
      console.error("Error creating Theme:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div>
      <div className="d-flex mb-2">
        {/* CATEGORY */}
        <div style={{ width: "35%" }} className="form-group">
          <label>Select Category</label>
          <select
            value={selectedCategoryType}
            onChange={(e) => {
              setSelectedCategoryType(e.target.value);
              setSelectedSubCategories([]);
              setSelectedProducts([]);
              setProducts([]);
            }}
          >
            <option value="">Select Category</option>
            <option value="Photography">Photography</option>
          </select>
        </div>

        {/* SUBCATEGORY */}
        {selectedCategoryType && (
          <div className="event-dropdown-wrapper">
            <label>Select Event</label>

            <div className="event-dropdown product-dropdown">
              <button
                type="button"
                className="event-dropdown-button"
                onClick={() => setIsEventDropdownOpen((prev) => !prev)}
              >
                <span>
                  {selectedSubCategories.length === 0
                    ? "Select Event"
                    : `${selectedSubCategories.length} Event${selectedSubCategories.length > 1 ? "s" : ""
                    } Selected`}
                </span>

                <span>▾</span>
              </button>

              {isEventDropdownOpen && (
                <div className="event-dropdown-menu">

                  {/* SELECT ALL */}
                  <label className="event-option">
                    <input
                      type="checkbox"
                      checked={selectAllEvents}
                      onChange={(e) => {
                        const checked = e.target.checked;

                        setSelectAllEvents(checked);

                        if (checked) {
                          const allEventIds = filteredSubCategories.map(
                            (type) => type._id
                          );

                          setSelectedSubCategories(allEventIds);
                          setSelectedProducts([]);
                          setProducts([]);
                          setSelectAllProducts(false);
                        } else {
                          setSelectedSubCategories([]);
                          setSelectedProducts([]);
                          setProducts([]);
                          setSelectAllProducts(false);
                        }
                      }}
                    />

                    <span>Select All Events</span>
                  </label>

                  {/* EVENTS */}
                  {filteredSubCategories.map((type) => (
                    <label key={type._id} className="event-option">
                      <input
                        type="checkbox"
                        checked={selectedSubCategories.includes(type._id)}
                        onChange={(e) => {
                          const eventId = type._id;

                          setSelectedSubCategories((prev) => {
                            let updated;

                            if (prev.includes(eventId)) {
                              updated = prev.filter((id) => id !== eventId);
                            } else {
                              updated = [...prev, eventId];
                            }
                            handleSubCategoryChange(updated);

                            return updated;
                          });
                        }}
                      />

                      <span>{type.name}</span>
                    </label>
                  ))}

                </div>
              )}
            </div>
          </div>
        )}

        {selectedSubCategories.length > 0 && !selectAllEvents && (
          <div
            className="form-group"
            style={{ marginTop: "10px", width: "35%" }}
          >
            <label>Select Product</label>

            <div className="event-dropdown product-dropdown">
              {/* PRODUCT DROPDOWN BUTTON */}
              <button
                type="button"
                className="event-dropdown-button"
                onClick={() => setIsProductDropdownOpen((prev) => !prev)}
              >
                <span>
                  {selectedProducts.length === 0
                    ? "Select Product"
                    : `${selectedProducts.length} Product${selectedProducts.length > 1 ? "s" : ""
                    } Selected`}
                </span>

                <span>▾</span>
              </button>

              {/* PRODUCT DROPDOWN */}
              {isProductDropdownOpen && (
                <div className="event-dropdown-menu">

                  {/* SELECT ALL PRODUCTS */}
                  <label className="event-option">
                    <input
                      type="checkbox"
                      checked={selectAllProducts}
                      onChange={(e) => {
                        const checked = e.target.checked;

                        setSelectAllProducts(checked);

                        if (checked) {
                          const allProductIds = products.map(
                            (product) => product._id
                          );

                          setSelectedProducts(allProductIds);
                        } else {
                          setSelectedProducts([]);
                        }
                      }}
                    />

                    <span>Select All Products</span>
                  </label>

                  {/* PRODUCTS */}
                  {products.map((product) => (
                    <label
                      key={product._id}
                      className="event-option"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={(e) => {
                          const productId = product._id;

                          setSelectedProducts((prev) => {
                            let updated;

                            if (prev.includes(productId)) {
                              updated = prev.filter(
                                (id) => id !== productId
                              );
                            } else {
                              updated = [...prev, productId];
                            }
                            return updated;
                          });
                        }}
                      />

                      <span>{product.name}</span>
                    </label>
                  ))}

                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* FORM */}
      {selectedCategoryType &&
        (
          selectAllEvents ||
          selectAllProducts ||
          selectedProducts.length > 0
        ) && (
          <div className="formWrapper">

            <div className="d-flex mb-2">
              <div className="form-group">
                <label>Theme Title</label>
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
            {isLoading ? "Adding..." : "Add Theme"}
            </button>
          </div>
        )}
    </div>
  );
};

export default Addtheme;

