"use client";
import React, { useState, useEffect } from "react";
import {
  BASE_URL,
  ADD_THEME,
  PRODUCT_MEAL_TYPE,
  IMAGE_UPLOAD,
} from "../../../utils/apiconstant";
import "./theme.css";

const Addtheme = () => {
  const [selectedCategoryType, setSelectedCategoryType] = useState([]);
  const [mealProductTypes, setMealProductTypes] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectAllEvents, setSelectAllEvents] = useState(false);
  const [selectAllProducts, setSelectAllProducts] = useState(false);

  const fetchOptions = async (url, setter, body) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
  useEffect(() => {
    fetchOptions(
      BASE_URL + PRODUCT_MEAL_TYPE,
      setMealProductTypes,
      {
        per_page: "500",
      }
    );
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".category-dropdown")) {
        setIsCategoryDropdownOpen(false);
      }

      if (!event.target.closest(".event-dropdown-wrapper")) {
        setIsEventDropdownOpen(false);
      }

      if (!event.target.closest(".product-dropdown")) {
        setIsProductDropdownOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const filteredSubCategories = mealProductTypes.filter(
    (type) =>
      Array.isArray(type.configurationId) &&
      type.configurationId.some((config) =>
        selectedCategoryType.includes(config.name)
      )
  );

  const fetchProductsByEvents = async (events) => {
    if (
      !Array.isArray(events) ||
      events.length === 0 ||
      selectedCategoryType.length === 0
    ) {
      setProducts([]);
      return;
    }

    const eventIds = events.map(
      (event) => event.id
    );

    try {
      const response = await fetch(
        `${BASE_URL}/api/photography/searchByTags`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tags: eventIds,
            categoryType: selectedCategoryType,
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
      console.error(
        "Error fetching products:",
        error
      );

      setProducts([]);
    }
  };

  const handleCategoryChange = (
    category,
    checked
  ) => {
    setSelectedCategoryType((prev) => {
      if (checked) {
        if (prev.includes(category)) {
          return prev;
        }

        return [...prev, category];
      }

      return prev.filter(
        (item) => item !== category
      );
    });

    setSelectedSubCategories([]);
    setSelectedProducts([]);
    setProducts([]);

    setSelectAllEvents(false);
    setSelectAllProducts(false);
  };

  const handleEventChange = (type) => {
    const eventId = type._id;

    const category =
      type.configurationId?.find((config) =>
        selectedCategoryType.includes(
          config.name
        )
      )?.name;

    const alreadySelected =
      selectedSubCategories.some(
        (item) => item.id === eventId
      );

    let updatedEvents;

    if (alreadySelected) {
      updatedEvents =
        selectedSubCategories.filter(
          (item) => item.id !== eventId
        );
    } else {
      updatedEvents = [
        ...selectedSubCategories,
        {
          id: eventId,
          category,
        },
      ];
    }

    setSelectedSubCategories(
      updatedEvents
    );

    if (
      filteredSubCategories.length > 0 &&
      updatedEvents.length ===
      filteredSubCategories.length
    ) {
      setSelectAllEvents(true);
    } else {
      setSelectAllEvents(false);
    }

    setSelectedProducts([]);
    setSelectAllProducts(false);

    fetchProductsByEvents(
      updatedEvents
    );
  };

  const handleSelectAllEvents = (
    checked
  ) => {
    setSelectAllEvents(checked);

    setSelectedProducts([]);
    setSelectAllProducts(false);

    if (checked) {
      const allEvents =
        filteredSubCategories.map(
          (type) => {
            const category =
              type.configurationId?.find(
                (config) =>
                  selectedCategoryType.includes(
                    config.name
                  )
              )?.name;

            return {
              id: type._id,
              category,
            };
          }
        );

      setSelectedSubCategories(
        allEvents
      );

      fetchProductsByEvents(
        allEvents
      );
    } else {
      setSelectedSubCategories([]);
      setSelectedProducts([]);
      setProducts([]);
    }
  };

  const handleProductChange = (
    productId
  ) => {
    const alreadySelected =
      selectedProducts.includes(
        productId
      );

    let updatedProducts;

    if (alreadySelected) {
      updatedProducts =
        selectedProducts.filter(
          (id) => id !== productId
        );
    } else {
      updatedProducts = [
        ...selectedProducts,
        productId,
      ];
    }

    setSelectedProducts(
      updatedProducts
    );

    if (
      products.length > 0 &&
      updatedProducts.length ===
      products.length
    ) {
      setSelectAllProducts(true);
    } else {
      setSelectAllProducts(false);
    }
  };

  const handleSelectAllProducts = (
    checked
  ) => {
    setSelectAllProducts(checked);

    if (checked) {
      const allProductIds =
        products.map(
          (product) =>
            product._id
        );

      setSelectedProducts(
        allProductIds
      );
    } else {
      setSelectedProducts([]);
    }
  };

  const isFormValid =
    selectedCategoryType.length > 0 &&
    selectedSubCategories.length > 0 &&
    imageFile &&
    (selectAllEvents ||
      selectAllProducts ||
      selectedProducts.length > 0) &&
    title.trim() !== "" &&
    price !== "";


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      return;
    }

    setIsLoading(true);

    try {

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

      let productId = [];

      if (selectAllProducts) {
        productId = products.map(
          (product) => product._id
        );
      } else {
        productId = [...selectedProducts];
      }

      let eventType = [];

      if (selectAllEvents) {
        eventType = filteredSubCategories.map(
          (event) => event._id
        );

        productId = products.map(
          (product) => product._id
        );

      } else {
        eventType = selectedSubCategories.map(
          (event) => event.id
        );
      }

      const payload = {
        title,
        price,
        description,
        image: uploadedImageName,
        categoryType: selectedCategoryType,
        productId,
        eventType,
      };

      const response = await fetch(
        `${BASE_URL}${ADD_THEME}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Something went wrong"
        );
      }

      alert("Theme created successfully");

      setTitle("");
      setPrice("");
      setDescription("");
      setImageFile(null);

      setSelectedProducts([]);
      setSelectedSubCategories([]);
      setProducts([]);

      setSelectAllEvents(false);
      setSelectAllProducts(false);

      setSelectedCategoryType([]);

      setIsCategoryDropdownOpen(false);
      setIsEventDropdownOpen(false);
      setIsProductDropdownOpen(false);

    } catch (error) {
      console.error(
        "Error creating Theme:",
        error
      );

      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex mb-2">

        <div className="event-dropdown-wrapper category-dropdown">
          <label>Select Category</label>

          <div className="event-dropdown product-dropdown">
            <button
              type="button"
              className="event-dropdown-button"
              onClick={() =>
                setIsCategoryDropdownOpen(
                  (prev) => !prev
                )
              }
            >
              <span>
                {selectedCategoryType.length ===
                  0
                  ? "Select Category"
                  : `${selectedCategoryType.length} Categor${selectedCategoryType.length >
                    1
                    ? "ies"
                    : "y"
                  } Selected`}
              </span>

              <span>▾</span>
            </button>

            {isCategoryDropdownOpen && (
              <div className="event-dropdown-menu">
                <label className="event-option">
                  <input
                    type="checkbox"
                    checked={selectedCategoryType.includes(
                      "Photography"
                    )}
                    onChange={(e) =>
                      handleCategoryChange(
                        "Photography",
                        e.target.checked
                      )
                    }
                  />

                  <span>
                    Photography
                  </span>
                </label>

              </div>
            )}
          </div>
        </div>

        {selectedCategoryType.length >
          0 && (
            <div className="event-dropdown-wrapper">
              <label>
                Select Event
              </label>

              <div className="event-dropdown product-dropdown">
                <button
                  type="button"
                  className="event-dropdown-button"
                  onClick={() =>
                    setIsEventDropdownOpen(
                      (prev) => !prev
                    )
                  }
                >
                  <span>
                    {selectedSubCategories.length ===
                      0
                      ? "Select Event"
                      : `${selectedSubCategories.length} Event${selectedSubCategories.length >
                        1
                        ? "s"
                        : ""
                      } Selected`}
                  </span>

                  <span>▾</span>
                </button>

                {isEventDropdownOpen && (
                  <div className="event-dropdown-menu">


                    <label
                      className="event-option"
                      onMouseDown={(e) =>
                        e.stopPropagation()
                      }
                    >
                      <input
                        type="checkbox"
                        checked={
                          selectAllEvents
                        }
                        onChange={(e) =>
                          handleSelectAllEvents(
                            e.target.checked
                          )
                        }
                      />

                      <span>
                        Select All Events
                      </span>
                    </label>

                    {filteredSubCategories.map(
                      (type) => {
                        const isSelected =
                          selectedSubCategories.some(
                            (item) =>
                              item.id ===
                              type._id
                          );

                        return (
                          <label
                            key={type._id}
                            className="event-option"
                            onMouseDown={(e) =>
                              e.stopPropagation()
                            }
                          >
                            <input
                              type="checkbox"
                              checked={
                                isSelected
                              }
                              onChange={() =>
                                handleEventChange(
                                  type
                                )
                              }
                            />

                            <span>
                              {type.name}
                            </span>
                          </label>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        {selectedSubCategories.length >
          0 &&
          !selectAllEvents && (
            <div
              className="form-group"
              style={{
                marginTop: "10px",
                width: "35%",
              }}
            >
              <label>
                Select Product
              </label>

              <div className="event-dropdown product-dropdown">
                <button
                  type="button"
                  className="event-dropdown-button"
                  onClick={() =>
                    setIsProductDropdownOpen(
                      (prev) => !prev
                    )
                  }
                >
                  <span>
                    {selectedProducts.length ===
                      0
                      ? "Select Product"
                      : `${selectedProducts.length} Product${selectedProducts.length >
                        1
                        ? "s"
                        : ""
                      } Selected`}
                  </span>

                  <span>▾</span>
                </button>
                {isProductDropdownOpen && (
                  <div className="event-dropdown-menu">
                    <label
                      className="event-option"
                      onMouseDown={(e) =>
                        e.stopPropagation()
                      }
                    >
                      <input
                        type="checkbox"
                        checked={
                          selectAllProducts
                        }
                        onChange={(e) =>
                          handleSelectAllProducts(
                            e.target.checked
                          )
                        }
                      />

                      <span>
                        Select All Products
                      </span>
                    </label>
                    {products.map(
                      (product) => (
                        <label
                          key={
                            product._id
                          }
                          className="event-option"
                          onMouseDown={(e) =>
                            e.stopPropagation()
                          }
                        >
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(
                              product._id
                            )}
                            onChange={() =>
                              handleProductChange(
                                product._id
                              )
                            }
                          />

                          <span>
                            {product.name}
                          </span>
                        </label>
                      )
                    )}

                  </div>
                )}
              </div>
            </div>
          )}
      </div>

      {selectedCategoryType.length >
        0 &&
        (selectAllEvents ||
          selectAllProducts ||
          selectedProducts.length >
          0) && (
          <div className="formWrapper">
            <div className="d-flex mb-2">

              <div className="form-group">
                <label>
                  Theme Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Price
                </label>

                <input
                  type="number"
                  value={price}
                  onChange={(e) =>
                    setPrice(
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
            <div className="d-flex mb-2">
              <div className="form-group">
                <label>
                  Description
                </label>

                <textarea
                  value={
                    description
                  }
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Upload Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setImageFile(
                      e.target.files?.[0] ||
                      null
                    )
                  }
                />
              </div>
            </div>
            <button
              onClick={
                handleSubmit
              }
              disabled={
                !isFormValid ||
                isLoading
              }
              className={`submitButton ${!isFormValid ||
                isLoading
                ? "disabledButton"
                : ""
                }`}
            >
              {isLoading
                ? "Adding..."
              : "Add Theme"}
            </button>
          </div>
        )}
    </div>
  );
};

export default Addtheme;