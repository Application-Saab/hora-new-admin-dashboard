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
  const [selectedCategoryType, setSelectedCategoryType] = useState([]);
  const [selectAllProducts, setSelectAllProducts] = useState(false);
  const [products, setProducts] = useState([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [selectAllEvents, setSelectAllEvents] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

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
  const handleSelectAllEvents = (
    checked
  ) => {
    setSelectAllEvents(checked);

    // Reset products
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

      // Fetch all products
      fetchProductsByEvents(
        allEvents
      );
    } else {
      setSelectedSubCategories([]);
      setSelectedProducts([]);
      setProducts([]);
    }
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

    // selectedEvents IDs update
    const updatedEventIds =
      updatedEvents.map(
        (event) => event.id
      );

    setSelectedEvents(
      updatedEventIds
    );

    setFormData((prev) => ({
      ...prev,
      eventId: updatedEventIds,
    }));

    // Select All Events
    setSelectAllEvents(
      filteredSubCategories.length > 0 &&
      updatedEvents.length ===
      filteredSubCategories.length
    );

    fetchProductsByEvents(
      updatedEvents
    );
  };

  const fetchProductsByEvents = async (events) => {
    if (!Array.isArray(events) || events.length === 0) {
      setProducts([]);
      setSelectedProducts([]);
      setSelectAllProducts(false);
      return;
    }

    if (
      !Array.isArray(selectedCategoryType) ||
      selectedCategoryType.length === 0
    ) {
      setProducts([]);
      setSelectedProducts([]);
      setSelectAllProducts(false);
      return;
    }

    const eventIds = events
      .map((event) => {
        if (typeof event === "object" && event !== null) {
          return event.id;
        }

        return event;
      })
      .filter(Boolean)
      .map((id) => String(id));

    if (eventIds.length === 0) {
      setProducts([]);
      setSelectedProducts([]);
      setSelectAllProducts(false);
      return;
    }

    try {
      const requestBody = {
        tags: eventIds,
        categoryType: selectedCategoryType,
      };

      const response = await fetch(
        `${BASE_URL}/api/photography/searchByTags`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        setProducts([]);
        setSelectedProducts([]);
        setSelectAllProducts(false);
        return;
      }

      const fetchedProducts = Array.isArray(data?.data)
        ? data.data
        : [];

      setProducts(fetchedProducts);

      // Only pre-check products whose id actually came from the backend
      // (selectedAddon.productId). Nothing gets auto-selected anymore -
      // the user has to manually check the rest.
      const oldProductIds = (selectedAddon?.productId || []).map((id) =>
        String(id)
      );

      const matchingProductIds = fetchedProducts
        .filter((product) =>
          oldProductIds.includes(String(product._id))
        )
        .map((product) => String(product._id));

      setSelectedProducts(matchingProductIds);

      setSelectAllProducts(
        fetchedProducts.length > 0 &&
        matchingProductIds.length === fetchedProducts.length
      );

    } catch (error) {
      console.error(
        "Error fetching products:",
        error
      );

      setProducts([]);
      setSelectedProducts([]);
      setSelectAllProducts(false);
    }
  };

  const handleSelectAllProducts = (checked) => {
    setSelectAllProducts(checked);

    if (checked) {
      const allProductIds = products.map((product) =>
        String(product._id)
      );

      setSelectedProducts(allProductIds);
    } else {
      setSelectedProducts([]);
    }
  };

  const handleProductChange = (productId) => {
    const id = String(productId);

    setSelectedProducts((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];

      setSelectAllProducts(
        products.length > 0 &&
        updated.length === products.length
      );

      return updated;
    });
  };


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

  // Whenever the addon being edited, the meal/product types list, or the
  // currently selected category types change -> recompute which events
  // should show as CHECKED. Only events whose id came from the backend
  // (selectedAddon.eventId) are checked; everything else in
  // filteredSubCategories is just shown (visible) and unchecked until the
  // user manually ticks it.
  useEffect(() => {
    if (
      !selectedAddon ||
      mealProductTypes.length === 0
    ) {
      return;
    }

    const oldEventIds = selectedAddon?.eventId || [];

    const matchingEvents =
      mealProductTypes
        .filter((event) =>
          oldEventIds.includes(event._id)
        )
        .map((event) => {
          const category =
            event.configurationId?.find(
              (config) =>
                selectedCategoryType.includes(
                  config.name
                )
            )?.name;

          return {
            id: event._id,
            category,
          };
        });

    setSelectedSubCategories(
      matchingEvents
    );

    setSelectedEvents(oldEventIds);

    setFormData((prev) => ({
      ...prev,
      eventId: oldEventIds,
    }));

    setSelectAllEvents(
      oldEventIds.length > 0 &&
      oldEventIds.length ===
      filteredSubCategories.length
    );
    fetchProductsByEvents(matchingEvents);
  }, [
    selectedAddon,
    mealProductTypes,
    selectedCategoryType,
  ]);


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
    setSelectedCategoryType(addon?.categoryType || []);

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
        productId: selectedProducts,
        categoryType: selectedCategoryType,
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

    const oldEventIds = (selectedAddon?.eventId || []).map(String);
    const oldProductIds = (selectedAddon?.productId || []).map(String);
    const oldCategoryTypes = selectedAddon?.categoryType || [];

    const currentEventIds = selectedEvents.map(String);
    const currentProductIds = selectedProducts.map(String);

    const eventsChanged =
      JSON.stringify([...oldEventIds].sort()) !==
      JSON.stringify([...currentEventIds].sort());

    const productsChanged =
      JSON.stringify([...oldProductIds].sort()) !==
      JSON.stringify([...currentProductIds].sort());

    const categoriesChanged =
      JSON.stringify(
        [...oldCategoryTypes].sort()
      ) !==
      JSON.stringify(
        [...selectedCategoryType].sort()
      );

    return (
      formData.title !== selectedAddon.title ||
      String(formData.price) !== String(selectedAddon.price) ||
      formData.description !==
      (selectedAddon.description || "") ||
      formData.image !== null ||
      eventsChanged ||
      productsChanged ||
      categoriesChanged
    );

  }, [
    formData,
    selectedAddon,
    selectedEvents,
    selectedProducts,
    selectedCategoryType,
  ]);

  const filteredSubCategories = mealProductTypes.filter(
    (type) =>
      Array.isArray(type.configurationId) &&
      type.configurationId.some(
        (config) => selectedCategoryType.includes(config.name)
      )
  );

  return (
    <div>

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
                <strong className="addon-label">Category :</strong> {addon?.categoryType?.[0]} ,  {addon?.categoryType?.[1] || ""}
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

            <div className="event-dropdown-wrapper2 category-dropdown">
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
                          "Decoration"
                        )}
                        onChange={(e) =>
                          handleCategoryChange(
                            "Decoration",
                            e.target.checked
                          )
                        }
                      />

                      <span>
                        Decoration
                      </span>
                    </label>

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
                <div className="event-dropdown-wrapper2">
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
              0 && (
                <div
                  className="form-group"
                  style={{
                    marginTop: "10px",
                    width: "100%",
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