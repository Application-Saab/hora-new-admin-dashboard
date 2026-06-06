"use client";
import React, { useState, useEffect } from "react";
import "./adddecoration.css";
import {
  BASE_URL,
  PRODUCT_MEAL_TYPE,
  ADD_DECORATION_PRODUCT,
  GET_MATERIAL_FILTER_DATA,
} from "../../../utils/apiconstant";

const AddProductForm = () => {
  const [productName, setProductName] = useState("");
  const [productRate, setProductRate] = useState("");
  const [, setDescription] = useState("");
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [mealProductTypes, setMealProductTypes] = useState([]);
  const [images, setImages] = useState([]);
  const [showCategoryItems, setShowCategoryItems] = useState(false);
  const [alertMessage, setAlertMessage] = useState({
    show: false,
    message: "",
    type: "",
  });

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
  const [nextId, setNextId] = useState(2);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState("Option1");
  const [option2Text, setOption2Text] = useState("");

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

  const handleCheckboxChange = (id, type) => {
    if (type === "product") {
      // setSelectedProductTypes((prev) =>
      //   prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
      // );
    } else if (type === "meal") {
      setSelectedMealTypes((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
      );
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // const handleImageUpload = async (event) => {
  //   const file = event.target.files[0];
  //   if (!file) return;
  //   setFileData(file);
  //   setPreviewImage(URL.createObjectURL(file));

  //   // const formData = new FormData();
  //   // formData.append("file", file);

  //   // try {
  //   //   const response = await fetch(BASE_URL + IMAGE_UPLOAD, {
  //   //     method: "POST",
  //   //     body: formData,
  //   //   });
  //   //   const data = await response.json();
  //   //   if (data.error === false) {
  //   //     setUploadedImage(data.data);
  //   //   } else {
  //   //     console.error("Image upload failed:", data.message);
  //   //     showAlert("Image upload failed: " + data.message, "error");
  //   //   }
  //   // } catch (error) {
  //   //   console.error("Error uploading image:", error);
  //   //   showAlert("Error uploading image", "error");
  //   // }
  // };

  const resetForm = () => {
    setProductName("");
    setProductRate("");
    setDescription("");
    // setSelectedProductTypes([]);
    setSelectedMealTypes([]);
  };

  const showAlert = (message, type) => {
    setAlertMessage({ show: true, message, type });
    setTimeout(() => {
      setAlertMessage({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleSubmitProduct = async () => {
    try {
      console.log("Submitting product...");

      if (!productName || !productRate) {
        showAlert("Product name and rate are required", "error");
        return;
      }

      const customerPrice =
        (totalPrice + executionPrice) / (1 - (advancePercent || 0) / 100);

      const advanceAmountHora = customerPrice * ((advancePercent || 0) / 100);

      const formatText = (text = "") =>
        `<div>${text
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => `- ${line}`)
          .join(" ")}</div>`;

      const isOption1 = mode === "Option1";

      // 🧠 BASE FORM DATA (single source of truth)
      const formData = new FormData();

      // ✅ IMAGE
      // if (fileData) {
      //   formData.append("featured_image", fileData);
      // }

      images.forEach((img) => {
        formData.append("featured_images", img.file);
      });

      // ✅ BASIC FIELDS
      formData.append("name", productName);
      formData.append("dish_rate", productRate || 0);
      formData.append("description", "");
      formData.append("status", "1");

      // ✅ ARRAY / OBJECT FIELDS (IMPORTANT → stringify)
      formData.append(
        "cuisineId",
        JSON.stringify(["65a2c9d3513d9389d34e2ec9"]),
      );

      formData.append("mealId", JSON.stringify(selectedMealTypes || []));

      formData.append("serving_dish", JSON.stringify([]));
      formData.append("special_appliance_id", JSON.stringify([]));
      formData.append("general_appliance_id", JSON.stringify([]));
      formData.append("categoryIds", JSON.stringify([]));
      formData.append("catId", JSON.stringify([]));

      formData.append("per_plate_qty", JSON.stringify({ qty: "", unit: "" }));

      formData.append(
        "ingredientUsed",
        JSON.stringify([
          {
            _id: "641539dbbafd4ec2e102bc91",
            name: "Ajinomoto",
            image: "attachment78.png",
            unit: "",
            qty: "",
          },
        ]),
      );

      // ✅ FLAGS
      formData.append("is_dish", "1");
      formData.append("dish_allow", "true");
      formData.append("is_preparation", "true");
      formData.append("is_gas", "true");
      formData.append("cooking_min", "10");
      formData.append("preparation_min", "10");

      // ✅ PREPARATION TEXT
      formData.append(
        "preperationtext",
        isOption1 ? formatText(summaryText) : formatText(option2Text),
      );

      // ✅ OPTION 1 EXTRA FIELDS
      if (isOption1) {
        formData.append("vendorMaterialPrice", totalPrice || 0);
        formData.append("executionPrice", executionPrice || 0);
        formData.append("horaAdvance", advanceAmountHora || 0);
        formData.append("inclusionVariables", JSON.stringify(inclusions || []));
      }

      // 🚀 API CALL (IMPORTANT → NO JSON.stringify)
      const response = await fetch(BASE_URL + ADD_DECORATION_PRODUCT, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data?.error === false) {
        showAlert("Product successfully created!", "success");
        resetForm();
      } else {
        showAlert(
          "Failed to create product: " + (data?.message || "Unknown error"),
          "error",
        );
      }
    } catch (error) {
      console.error("Submit error:", error);
      showAlert("Error submitting product", "error");
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

  const handleSelectChange = (id, field, value) => {
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

  if (loading) return <div style={{ padding: "40px" }}>Loading...</div>;

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
            style={{ width: "100%" }}
            onClick={() => document.getElementById("imageUpload").click()}
          >
            {images?.length > 0 ? (
              // <img src={previewImage} alt="Preview" className="image-preview" />
              <div
                className="image-box"
                style={{ display: "flex", width: "100%", height: '200px' }}
              >
                {images?.map((img, index) => (
                  <React.Fragment key={index}>
                    <div style={{display: "flex", flexDirection: "column", alignItems: "center", marginRight: "10px"}}>
                      <img src={img.preview} className="image-preview" alt="" />
                      <button onClick={() => removeImage(index)}>Remove</button>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="image-placeholder">Click to Upload</div>
            )}
          </div>
          {/* 
          <div className="image-grid">
            {images.map((img, index) => (
              <div key={index} className="image-box">
                <img src={img.preview} alt="" />
                <button onClick={() => removeImage(index)}>Remove</button>
              </div>
            ))}
          </div> */}
          <input
            type="file"
            multiple
            id="imageUpload"
            style={{ display: "none" }}
            onChange={handleImageUpload}
            max={10}
          />

          {/* <input type="file" multiple onChange={handleImageUpload} /> */}
        </div>

      </div>

      <div className="form-row horizontal-fields">

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
                {mealProductTypes
                  .filter(
                    (type) =>
                      Array.isArray(type.configurationId) &&
                      type.configurationId.some(
                        (config) => config.name === "Decoration",
                      ),
                  )
                  .map((type) => (
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
                        handleSelectChange(inc.id, "specs", e.target.value)
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
                        handleSelectChange(inc.id, "type", e.target.value)
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
                        handleSelectChange(inc.id, "material", e.target.value)
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
                      style={{ ...select, backgroundColor: "#f5f5f5" }}
                    />

                    <input
                      type="text"
                      value={inc.moq}
                      placeholder="MOQ"
                      readOnly
                      style={{ ...select, backgroundColor: "#f5f5f5" }}
                    />

                    {inc.rentedConsumable === "Consumable" && (
                      <input
                        type="number"
                        placeholder="Qty"
                        value={inc.customQuantity}
                        onChange={(e) =>
                          handleCustomQuantityChange(inc.id, e.target.value)
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
                    {inc.matchedRow ? "✅ Matched" : "❌ Not Matched"}
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
                    setExecutionPrice(parseFloat(e.target.value) || 0)
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
                    setAdvancePercent(parseFloat(e.target.value) || 0)
                  }
                  style={input}
                  placeholder="e.g. 20"
                />
              </div>

              <div>
                <strong>Customer Price:</strong> ₹
                {advancePercent >= 100
                  ? "Invalid %"
                  : (
                      (totalPrice + executionPrice) /
                      (1 - advancePercent / 100)
                    ).toFixed(2)}
              </div>

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
            <textarea readOnly value={summaryText} style={summary} />
          </>
        ) : (
          <div>
            <label style={{ marginBottom: "8px" }}>📝 Product Inclusion</label>
            <textarea
              value={option2Text}
              onChange={(e) => setOption2Text(e.target.value)}
              placeholder="Enter your text here..."
              style={{ ...summary, height: "200px" }}
            />
          </div>
        )}
      </div>
      <button className="orderCheck-btn" onClick={handleSubmitProduct}>
        Create Product
      </button>
    </div>
  );
};

export default AddProductForm;
