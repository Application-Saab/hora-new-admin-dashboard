"use client";

import React, { useState, useEffect } from "react";
import "./DecorationEditor.css";
import {
  BASE_URL,
  EDIT_DECORATION_PRODUCT,
  GET_MATERIAL_FILTER_DATA,
  PRODUCT_MEAL_TYPE,
} from "../../../utils/apiconstant";
import Image from "next/image";
import axios from "axios";
import CheckboxGroup from "@/app/component/CheckboxGroup";

const DecorationEditor = () => {
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [responseData, setResponseData] = useState([]);
  const [popupData, setPopupData] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mealProductTypes, setMealProductTypes] = useState([]);
  const [mode, setMode] = useState("Option2");
  const [data, setData] = useState([]);
  const [options, setOptions] = useState({
    specs: [],
    type: [],
    material: [],
  });
  const [inclusions, setInclusions] = useState([
    {
      id: 1,
      specs: "",
      type: "",
      material: "",
      rentedConsumable: "",
      moq: "",
      customQuantity: "",
      matchedRow: null,
      price: 0,
      previewText: "",
    },
  ]);
  const [executionPrice, setExecutionPrice] = useState(0);
  const [advancePercent, setAdvancePercent] = useState(0);
  const [option2Text, setOption2Text] = useState("");
  const [nextId, setNextId] = useState(1);
const [callChecklist, setCallChecklist] = useState({
  designType: {}
});

const designTypeOptions = [
  "Wall",
  "Ring",
  "Ring + Flex",
  "Sequined",
  "U Shape",
  "Square Stand",
  "Room Decor",
  "Cradle",
  "Flex",
  "Artificial Flower",
  "Real Flower",
];

const getDefaultDesignType = (data = {}) => {
  const result = {};
  designTypeOptions.forEach(item => {
    result[item] = data?.[item] || false;
  });
  return result;
};

  const handleSelectChange = async (event) => {
    const subCategory = event.target.value;
    setSelectedSubCategory(subCategory);
    setLoading(true);

    if (subCategory) {
      try {
        const response = await fetch(
          `${BASE_URL}/api/meals/idByTag?tag=${subCategory}`
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

  useEffect(() => {
    const fetchMaterialFilterData = async () => {
      try {
        const res = await fetch(`${BASE_URL}${GET_MATERIAL_FILTER_DATA}`);
        const result = await res.json();

        if (
          result?.error === false ||
          result?.success === false ||
          result?.data
        ) {
          const apiData = result.data || {};

          const specsData = Array.isArray(apiData.specs) ? apiData.specs : [];
          const typeData = Array.isArray(apiData.type) ? apiData.type : [];
          const materialData = Array.isArray(apiData.material)
            ? apiData.material
            : [];

          setData(specsData);

          setOptions({
            specs: specsData.map((item) => item.value).filter(Boolean),
            type: typeData.map((item) => item.value).filter(Boolean),
            material: materialData.map((item) => item.value).filter(Boolean),
          });
        }
      } catch (err) {
        console.error("Error fetching material filter data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialFilterData();
  }, []);

  const buildPreviewText = (item) => {
    let previewText = `${item.specs || "-"} ${item.type || "-"} ${item.material || "-"}`;

    if (item.rentedConsumable === "Rented") {
      previewText += ` ${item.moq || "-"}`;
    } else if (item.rentedConsumable === "Consumable") {
      previewText += ` ${item.customQuantity || item.moq || 1}`;
    }

    return previewText;
  };

  const extractNumber = (value) => {
    return parseFloat(String(value || "").replace(/[^\d.]/g, "")) || 0;
  };

  const getCalculatedPrice = (matchedRow, rentedConsumable, customQuantity) => {
    if (!matchedRow) return 0;

    const vendorPrice = parseFloat(matchedRow.vendorMaterialPrice) || 0;

    if (rentedConsumable === "Consumable") {
      const qty = parseFloat(customQuantity) || 0;
      const moqNumber = extractNumber(matchedRow.minimumOrderQuantity) || 1;
      return (qty * vendorPrice) / moqNumber;
    }

    return vendorPrice;
  };

  const handleSelectChangeInc = (id, field, value) => {
    setInclusions((prev) =>
      prev.map((inc) => {
        if (inc.id !== id) return inc;

        let updated = {
          ...inc,
          [field]: value,
        };

        if (field === "specs") {
          const firstMatch = data.find((row) => row.value === value);

          if (firstMatch) {
            updated = {
              ...updated,
              specs: firstMatch.value || "",
              type: firstMatch.type || "",
              material: firstMatch.material || "",
              rentedConsumable: firstMatch.materialCategory || "",
              moq: firstMatch.minimumOrderQuantity || "",
              matchedRow: firstMatch,
            };

            const defaultQty =
              updated.customQuantity ||
              extractNumber(firstMatch.minimumOrderQuantity) ||
              1;

            updated.customQuantity =
              firstMatch.materialCategory === "Consumable"
                ? updated.customQuantity || defaultQty
                : "";

            updated.price = getCalculatedPrice(
              firstMatch,
              firstMatch.materialCategory,
              updated.customQuantity,
            );

            updated.previewText = buildPreviewText(updated);
            return updated;
          } else {
            updated = {
              ...updated,
              type: "",
              material: "",
              rentedConsumable: "",
              moq: "",
              customQuantity: "",
              matchedRow: null,
              price: 0,
            };
            updated.previewText = buildPreviewText(updated);
            return updated;
          }
        }

        if (field === "type") {
          let firstMatch = data.find(
            (row) => row.value === updated.specs && row.type === value,
          );

          if (firstMatch) {
            updated = {
              ...updated,
              type: firstMatch.type || "",
              material: firstMatch.material || "",
              rentedConsumable: firstMatch.materialCategory || "",
              moq: firstMatch.minimumOrderQuantity || "",
              matchedRow: firstMatch,
            };

            if (firstMatch.materialCategory !== "Consumable") {
              updated.customQuantity = "";
            }

            updated.price = getCalculatedPrice(
              firstMatch,
              firstMatch.materialCategory,
              updated.customQuantity,
            );
          } else {
            updated = {
              ...updated,
              type: value,
              material: "",
              rentedConsumable: "",
              moq: "",
              customQuantity: "",
              matchedRow: null,
              price: 0,
            };
          }

          updated.previewText = buildPreviewText(updated);
          return updated;
        }

        if (field === "material") {
          const exactMatch = data.find(
            (row) =>
              row.value === updated.specs &&
              row.type === updated.type &&
              row.material === value,
          );

          if (exactMatch) {
            updated = {
              ...updated,
              material: exactMatch.material || "",
              rentedConsumable: exactMatch.materialCategory || "",
              moq: exactMatch.minimumOrderQuantity || "",
              matchedRow: exactMatch,
            };

            if (exactMatch.materialCategory !== "Consumable") {
              updated.customQuantity = "";
            }

            updated.price = getCalculatedPrice(
              exactMatch,
              exactMatch.materialCategory,
              updated.customQuantity,
            );
          } else {
            updated = {
              ...updated,
              material: value,
              rentedConsumable: "",
              moq: "",
              customQuantity: "",
              matchedRow: null,
              price: 0,
            };
          }

          updated.previewText = buildPreviewText(updated);
          return updated;
        }

        return updated;
      }),
    );
  };

  const handleCustomQuantityChange = (id, value) => {
    setInclusions((prev) =>
      prev.map((inc) => {
        if (inc.id !== id) return inc;

        const updated = {
          ...inc,
          customQuantity: value,
        };

        updated.price = getCalculatedPrice(
          updated.matchedRow,
          updated.rentedConsumable,
          value,
        );

        updated.previewText = buildPreviewText(updated);

        return updated;
      }),
    );
  };

  const handleAddInclusion = () => {
    setInclusions((prev) => [
      ...prev,
      {
        id: nextId,
        specs: "",
        type: "",
        material: "",
        rentedConsumable: "",
        moq: "",
        customQuantity: "",
        matchedRow: null,
        price: 0,
        previewText: "",
      },
    ]);
    setNextId(nextId + 1);
  };

  const handleRemoveInclusion = (id) => {
    if (inclusions.length > 1) {
      setInclusions(inclusions.filter((i) => i.id !== id));
    }
  };

  const totalPrice = inclusions.reduce((sum, i) => sum + i.price, 0);
  // const finalPrice = totalPrice + executionPrice;
  const summaryText = inclusions.map((i) => i.previewText).join("\n");

  const container = {
    maxWidth: "1450px",
    margin: "40px auto",
    padding: "2px",
    fontFamily: "Segoe UI, sans-serif",
  };
  const row = {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    alignItems: "center",
    marginBottom: "8px",
  };
  const select = {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    minWidth: "100px",
  };
  const input = {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    width: "40px",
  };
  const button = {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    transition: "0.2s",
  };
  const inclusionBox = {
    backgroundColor: "#fefefe",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  };
  const preview = {
    width: "90%",
    height: "auto",
    marginTop: "8px",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    background: "#f9f9f9",
  };
  const summary = {
    width: "100%",
    height: "150px",
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    backgroundColor: "#fafafa",
    marginTop: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    fontFamily: "monospace",
    whiteSpace: "pre-wrap",
  };
  const totalsBox = {
    background: "#f2f8f9",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
    fontSize: "16px",
  };

  const getFilteredTypes = (specs) => {
    if (!specs) return options.type;

    return [
      ...new Set(
        data
          .filter((row) => row.value === specs)
          .map((row) => row.type)
          .filter(Boolean),
      ),
    ];
  };

  const getFilteredMaterials = (specs, type) => {
    let filtered = data;

    if (specs) {
      filtered = filtered.filter((row) => row.value === specs);
    }

    if (type) {
      filtered = filtered.filter((row) => row.type === type);
    }

    return [...new Set(filtered.map((row) => row.material).filter(Boolean))];
  };

  const fetchSecondAPI = async (_id) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/Decoration/searchByTag/${_id}`
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
            : data.data.configuration || [],
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handlePopupOpen = (item) => {
    setPopupData(item);
    setName(item.name);
    setPrice(item.price);
    setImage(null);
    setSelectedTags(item.tag || []);

    // OPTION DECIDE
    if (item.inclusionVariables && item.inclusionVariables.length > 0) {
      setMode("Option1");

      const mapped = item.inclusionVariables.map((inc, index) => ({
        ...inc,
        id: index + 1,
      }));

      setInclusions(mapped);
      setNextId(mapped.length + 1);
    } else {
      setMode("Option2");

      const inclusionText = item.inclusion
        ?.map((i) => i.replace(/<[^>]*>/g, ""))
        .join("\n")
        .replace(/-\s*/g, "\n- ");

      setOption2Text(inclusionText || "");
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadingImage(true);

    try {
      const response = await fetch(
        `${BASE_URL}/api/image_upload`,
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
        : [...prevTags, tagId],
    );
  };

  const handlePopupClose = () => {
    setPopupData(null);
    setName("");
    setPrice("");
    setImage(null);
    setSelectedTags([]);
    setInclusions([]);
  };
  let formattedInclusion = [];
  const handleSaveChanges = async () => {
    let requestData = {
      _id: popupData._id,
      name,
      price,
      featured_image: image ? image : popupData.featured_image,
      tag: selectedTags,
      inclusion: formattedInclusion,
      designType: callChecklist.designType
    };

    if (mode === "Option1") {
      console.log("Saving Option1 changes...");
      requestData = {
        ...requestData,
        inclusionVariables: inclusions,
      };
    } else {
      console.log("Saving Option2 changes...");
      formattedInclusion = [
        `<div>- ${option2Text
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .join(" - ")}</div>`,
      ];

      requestData = {
        ...requestData,
        inclusion: formattedInclusion,
      };
    }

    try {
      // Make the API request
      const response = await fetch(BASE_URL + EDIT_DECORATION_PRODUCT, {
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

  const handlePriceChange = (id, value) => {
    const num = parseFloat(value) || 0;
    setInclusions((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          let previewText = `${i.specs || "-"} ${i.type || "-"} ${
            i.material || "-"
          }`;
          if (i.rentedConsumable === "Rented") {
            previewText += ` ${i.moq || "-"}`;
          } else if (i.rentedConsumable === "Consumable") {
            previewText += ` ${i.customQuantity || 1} PCS`;
          }
          // previewText += `, Price: $${num.toFixed(2)}`;
          return { ...i, price: num, previewText };
        }
        return i;
      }),
    );
  };
  const handlePreviewChange = (id, value) => {
    setInclusions((prev) =>
      prev.map((i) => (i.id === id ? { ...i, previewText: value } : i)),
    );
  };
const handleCheckboxChange = (section, item) => {
  setCallChecklist(prev => ({
    ...prev,
    [section]: {
      ...prev[section],
      [item]: !prev[section]?.[item]   // toggle true/false
    }
  }));
};
useEffect(() => {
  if (popupData?.designType) {
    setCallChecklist(prev => ({
      ...prev,
      designType: getDefaultDesignType(popupData.designType)
    }));
  } else {
    setCallChecklist(prev => ({
      ...prev,
      designType: getDefaultDesignType()
    }));
  }
}, [popupData]);


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
        <h1 className="page-title">Decoration Editing</h1>

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
                  (config) => config.name === "Decoration",
                ),
              )
              .map((item) => (
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
                          src={`${BASE_URL}/api/uploads/compressed_webp/${
                            item?.featured_image.split(".")[0]
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
                          const tag = mealProductTypes.find(
                            (t) => t._id === tagId,
                          );
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

                          await axios.post(`${BASE_URL}/api/dish/update_decoration_status`, {
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
                            src={`${BASE_URL}/api/uploads/${image}`}
                            alt="New uploaded image"
                            className="image-preview"
                          />
                        </div>
                      ) : popupData.featured_image ? (
                        <div className="image-preview-container">
                          <p className="image-label">Current Image:</p>
                          <img
                            src={`${BASE_URL}/api/uploads/compressed_webp/${popupData.featured_image}`}
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
                            (config) => config.name === "Decoration",
                          ),
                        )
                        .map((type) => (
                          <div key={type._id} className="checkbox-item">
                            <input
                              type="checkbox"
                              id={`tag-${type._id}`}
                              checked={selectedTags.includes(type._id)}
                              onChange={() => handleTagChange(type._id)}
                            />
                            <label htmlFor={`tag-${type._id}`}>
                              {type.name}
                            </label>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="checkbox-container">
  <div className="checklist-body">
    <CheckboxGroup
      key={"designType"}
      title={"Explain the type of design"}
      items={designTypeOptions}
      section={"designType"}
      checklist={callChecklist}
      onChange={handleCheckboxChange}
    />
  </div>
</div>

                  <div style={container}>
                    <div style={{ marginBottom: "20px" }}>
                      <label style={{ marginRight: "8px" }}>Choose Mode:</label>
                      <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        style={select}
                      >
                        <option value="Option1">Option 1</option>
                        <option value="Option2">Option 2</option>
                      </select>
                    </div>

                    {mode === "Option1" ? (
                      <>
                        <button
                          onClick={handleAddInclusion}
                          style={{
                            ...button,
                            backgroundColor: "#3498db",
                            color: "#fff",
                            marginBottom: "20px",
                          }}
                        >
                          + Add Inclusion
                        </button>
                        {inclusions.map((inc) => {
                          const filteredTypes = getFilteredTypes(inc.specs);
                          const filteredMaterials = getFilteredMaterials(
                            inc.specs,
                            inc.type,
                          );
                          return (
                            <div key={inc.id} style={inclusionBox}>
                              <div style={row}>
                                <select
                                  value={inc.specs}
                                  onChange={(e) =>
                                    handleSelectChangeInc(
                                      inc.id,
                                      "specs",
                                      e.target.value,
                                    )
                                  }
                                  style={select}
                                >
                                  <option value="">Specs</option>
                                  {options.specs.map((o, i) => (
                                    <option key={i} value={o}>
                                      {o}
                                    </option>
                                  ))}
                                </select>

                                <select
                                  value={inc.type}
                                  onChange={(e) =>
                                    handleSelectChangeInc(
                                      inc.id,
                                      "type",
                                      e.target.value,
                                    )
                                  }
                                  style={select}
                                >
                                  <option value="">Type</option>
                                  {filteredTypes?.map((o, i) => (
                                    <option key={i} value={o}>
                                      {o}
                                    </option>
                                  ))}
                                </select>

                                <select
                                  value={inc.material}
                                  onChange={(e) =>
                                    handleSelectChangeInc(
                                      inc.id,
                                      "material",
                                      e.target.value,
                                    )
                                  }
                                  style={select}
                                >
                                  <option value="">Material</option>
                                  {filteredMaterials?.map((o, i) => (
                                    <option key={i} value={o}>
                                      {o}
                                    </option>
                                  ))}
                                </select>

                                <input
                                  type="text"
                                  value={inc.rentedConsumable}
                                  placeholder="Rented/Consumable"
                                  readOnly
                                  style={{
                                    ...select,
                                    backgroundColor: "#f5f5f5",
                                  }}
                                />

                                <input
                                  type="text"
                                  value={inc.moq}
                                  placeholder="MOQ"
                                  readOnly
                                  style={{
                                    ...select,
                                    backgroundColor: "#f5f5f5",
                                  }}
                                />

                                {inc.rentedConsumable === "Consumable" && (
                                  <input
                                    type="number"
                                    placeholder="Qty"
                                    value={inc.customQuantity}
                                    onChange={(e) =>
                                      handleCustomQuantityChange(
                                        inc.id,
                                        e.target.value,
                                      )
                                    }
                                    style={input}
                                  />
                                )}

                                <input
                                  type="number"
                                  placeholder="Price"
                                  value={inc.price}
                                  onChange={(e) =>
                                    handlePriceChange(inc.id, e.target.value)
                                  }
                                  style={input}
                                />

                                <button
                                  onClick={() => handleRemoveInclusion(inc.id)}
                                  style={{
                                    ...button,
                                    backgroundColor: "#e74c3c",
                                    color: "#fff",
                                  }}
                                >
                                  Remove
                                </button>
                              </div>
                              <div
                                style={{
                                  marginTop: "4px",
                                  fontWeight: "bold",
                                  color: inc.matchedRow ? "#27ae60" : "#c0392b",
                                }}
                              >
                                {inc.matchedRow
                                  ? "✅ Matched"
                                  : "❌ Not Matched"}
                              </div>

                              <textarea
                                value={inc.previewText}
                                onChange={(e) =>
                                  handlePreviewChange(inc.id, e.target.value)
                                }
                                style={preview}
                              />
                            </div>
                          );
                        })}

                        <div style={totalsBox}>
                          <div>
                            <strong>Hora Vendor Material Price:</strong> ₹
                            {totalPrice.toFixed(2)}
                          </div>

                          <div>
                            <strong>Execution Price:</strong>{" "}
                            <input
                              type="number"
                              value={executionPrice}
                              onChange={(e) =>
                                setExecutionPrice(
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              style={input}
                            />
                          </div>

                          <div>
                            <strong>Advance %:</strong>{" "}
                            <input
                              type="number"
                              value={advancePercent}
                              onChange={(e) =>
                                setAdvancePercent(
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              style={input}
                              placeholder="e.g. 20"
                            />
                          </div>

                          {/* Customer Price Calculation */}
                          <div>
                            <strong>Customer Price:</strong> ₹
                            {advancePercent >= 100
                              ? "Invalid %"
                              : (
                                  (totalPrice + executionPrice) /
                                  (1 - advancePercent / 100)
                                ).toFixed(2)}
                          </div>

                          {/* Advance Amount Calculation */}
                          <div>
                            <strong>Advance Hora Amount:</strong> ₹
                            {advancePercent >= 100
                              ? "Invalid %"
                              : (
                                  ((totalPrice + executionPrice) /
                                    (1 - advancePercent / 100)) *
                                  (advancePercent / 100)
                                ).toFixed(2)}
                          </div>
                        </div>

                        <h4 style={{ marginTop: "30px", marginBottom: "8px" }}>
                          📝 Inclusion Summary
                        </h4>
                        <textarea
                          readOnly
                          value={summaryText}
                          style={summary}
                        />
                      </>
                    ) : (
                      <div>
                        <label style={{ marginBottom: "8px" }}>
                          📝 Product Inclusion
                        </label>
                        <textarea
                          value={option2Text}
                          onChange={(e) => setOption2Text(e.target.value)}
                          placeholder="Enter your text here..."
                          style={{ ...summary, height: "200px" }}
                        />
                      </div>
                    )}
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
