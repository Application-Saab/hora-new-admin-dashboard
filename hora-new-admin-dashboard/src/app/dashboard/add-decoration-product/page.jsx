"use client";
import React, { useState, useEffect } from "react";
import "./adddecoration.css";
import {
  BASE_URL,
  PRODUCT_MEAL_TYPE,
  IMAGE_UPLOAD,
  ADD_DECORATION_PRODUCT,
} from "../../../utils/apiconstant";
// import axios from "axios";

const AddProductForm = () => {
  const [productName, setProductName] = useState("");
  const [productRate, setProductRate] = useState("");
  const [, setDescription] = useState("");
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

   const [data, setData] = useState([]);
  const [options, setOptions] = useState({
    specs: [],
    type: [],
    material: [],
    rentedConsumable: [],
    moqs: [],
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
      // preperationtext: description,
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


    const formatText = (text) => [
    `<div>- ${text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join(" - ")}</div>`
  ];


  const formattedSummary = formatText(summaryText);
  const formattedOption2Text = formatText(option2Text);

      let payload;
  if (mode === "Option1") {
    payload = {
      ...productData,
   preperationtext: formattedSummary,
    };
  } else {
    payload = {
      ...productData,
      preperationtext: formattedOption2Text,
    };
  }
    

    try {
      const response = await fetch(BASE_URL + ADD_DECORATION_PRODUCT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        console.log(selectedProductTypes)
      console.error("Error submitting product:", error);
      showAlert("Error submitting product", "error");
    }
  };

  // new inclustion style
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "https://script.google.com/macros/s/AKfycbw4xPYuAXPztRz8fD5-txc-_zDlkZwXllmlQH_r5IAj855Xvr0ylEedJoIAJUVRMEzp/exec"
        );
        const data = await res.json();
        setData(data);

        const specs = [...new Set(data.map((r) => r.Specs).filter(Boolean))];
        const type = [...new Set(data.map((r) => r.Type).filter(Boolean))];
        const material = [...new Set(data.map((r) => r.Material).filter(Boolean))];
        const rented = [...new Set(data.map((r) => r["Rented/Consumable"]).filter(Boolean))];
        const moqs = [...new Set(data.map((r) => r.MOQ).filter(Boolean))];

        setOptions({ specs, type, material, rentedConsumable: rented, moqs });
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectChange = (id, field, value) => {
    setInclusions((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          const updated = { ...inc, [field]: value };

          const { specs, type, material, rentedConsumable, moq, customQuantity } = updated;

          let matchedRow = null;
          let price = 0;

          if (specs && type && material && rentedConsumable) {
            matchedRow = data.find(
              (row) =>
                row.Specs === specs &&
                row.Type === type &&
                row.Material === material &&
                row["Rented/Consumable"] === rentedConsumable
            );

            if (matchedRow) {
              if (rentedConsumable === "Consumable") {
                const qty = parseFloat(customQuantity) || 0;
                price = (qty / 100) * matchedRow["Hora Vendor Price"];
              } else {
                price = matchedRow["Hora Vendor Price"];
              }
            }
          }

          let previewText = `${specs || "-"} ${type || "-"} ${material || "-"}`;
          if (rentedConsumable === "Rented") {
            previewText += ` ${moq || "-"}`;
          } else if (rentedConsumable === "Consumable") {
            previewText += ` ${customQuantity || 1} PCS`;
          }
          // previewText += `, Price: $${price.toFixed(2)}`;

          return { ...updated, matchedRow, price, previewText };
        }
        return inc;
      })
    );
  };

  const handleCustomQuantityChange = (id, value) => {
    setInclusions((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          let price = inc.price;
          let matchedRow = inc.matchedRow;
          if (inc.rentedConsumable === "Consumable" && matchedRow) {
            const qty = parseFloat(value) || 0;
            price = (qty / 100) * matchedRow["Hora Vendor Price"];
          }
          let previewText = `${inc.specs || "-"} ${inc.type || "-"}  ${inc.material || "-"}`;
          if (inc.rentedConsumable === "Rented") {
            previewText += ` ${inc.moq || "-"}`;
          } else if (inc.rentedConsumable === "Consumable") {
            previewText += ` ${value || 1} PCS`;
          }
          // previewText += `, Price: $${price.toFixed(2)}`;

          return { ...inc, customQuantity: value, price, previewText };
        }
        return inc;
      })
    );
  };

  const handleMoqChange = (id, value) => {
    setInclusions((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          let previewText = `${inc.specs || "-"} ${inc.type || "-"} ${inc.material || "-"}`;
          if (inc.rentedConsumable === "Rented") {
            previewText += ` ${value || "-"}`;
          } else if (inc.rentedConsumable === "Consumable") {
            previewText += ` ${inc.customQuantity || 1} PCS`;
          }
          // previewText += `, Price: $${inc.price.toFixed(2)}`;

          return { ...inc, moq: value, previewText };
        }
        return inc;
      })
    );
  };

  const handlePriceChange = (id, value) => {
    const num = parseFloat(value) || 0;
    setInclusions((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          let previewText = `${i.specs || "-"} ${i.type || "-"} ${i.material || "-"}`;
          if (i.rentedConsumable === "Rented") {
            previewText += ` ${i.moq || "-"}`;
          } else if (i.rentedConsumable === "Consumable") {
            previewText += ` ${i.customQuantity || 1} PCS`;
          }
          // previewText += `, Price: $${num.toFixed(2)}`;
          return { ...i, price: num, previewText };
        }
        return i;
      })
    );
  };

  const handlePreviewChange = (id, value) => {
    setInclusions((prev) =>
      prev.map((i) => (i.id === id ? { ...i, previewText: value } : i))
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
  const finalPrice = totalPrice + executionPrice;
  const summaryText = inclusions.map(i => i.previewText).join("\n");

  const container = { maxWidth: "1450px", margin: "40px auto", padding: "2px", fontFamily: "Segoe UI, sans-serif" };
  const row = { display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", marginBottom: "8px" };
  const select = { padding: "8px", borderRadius: "6px", border: "1px solid #ccc", minWidth: "100px" };
  const input = { padding: "8px", borderRadius: "6px", border: "1px solid #ccc", width: "40px" };
  const button = { padding: "8px 12px", borderRadius: "6px", border: "none", cursor: "pointer", transition: "0.2s" };
  const inclusionBox = { backgroundColor: "#fefefe", border: "1px solid #ddd", borderRadius: "8px", padding: "16px", marginBottom: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" };
  const preview = { width: "90%",height: "auto", marginTop: "8px", padding: "10px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", background: "#f9f9f9" };
  const summary = { width: "100%", height: "150px", padding: "16px", borderRadius: "8px", border: "1px solid #ccc", backgroundColor: "#fafafa", marginTop: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontFamily: "monospace", whiteSpace: "pre-wrap" };
  const totalsBox = { background: "#f2f8f9", padding: "20px", borderRadius: "8px", border: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", fontSize: "16px" };

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

      {/* <div className="form-group">
        <label>Product Inclusion</label>
        <textarea
          placeholder="Enter text here..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
      </div> */}


 <div style={container}>

      {/* Dropdown to select mode */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "8px" }}>Choose Mode:</label>
        <select value={mode} onChange={(e) => setMode(e.target.value)} style={select}>
          <option value="Option1">Option 1</option>
          <option value="Option2">Option 2</option>
        </select>
      </div>

      {mode === "Option1" ? (
        <>
         <button onClick={handleAddInclusion} style={{ ...button, backgroundColor: "#3498db", color: "#fff", marginBottom: "20px" }}>+ Add Inclusion</button>
          {inclusions.map((inc) => (
            <div key={inc.id} style={inclusionBox}>
              <div style={row}>
                <select value={inc.specs} onChange={(e) => handleSelectChange(inc.id, "specs", e.target.value)} style={select}>
                  <option value="">Specs</option>
                  {options.specs.map((o, i) => <option key={i} value={o}>{o}</option>)}
                </select>
                <select value={inc.type} onChange={(e) => handleSelectChange(inc.id, "type", e.target.value)} style={select}>
                  <option value="">Type</option>
                  {options.type.map((o, i) => <option key={i} value={o}>{o}</option>)}
                </select>
                <select value={inc.material} onChange={(e) => handleSelectChange(inc.id, "material", e.target.value)} style={select}>
                  <option value="">Material</option>
                  {options.material.map((o, i) => <option key={i} value={o}>{o}</option>)}
                </select>
                <select value={inc.rentedConsumable} onChange={(e) => handleSelectChange(inc.id, "rentedConsumable", e.target.value)} style={select}>
                  <option value="">Rented/Consumable</option>
                  {options.rentedConsumable.map((o, i) => <option key={i} value={o}>{o}</option>)}
                </select>

                {inc.rentedConsumable === "Rented" && (
                  <select value={inc.moq} onChange={(e) => handleMoqChange(inc.id, e.target.value)} style={select}>
                    <option value="">MOQ</option>
                    {options.moqs.map((o, i) => <option key={i} value={o}>{o}</option>)}
                  </select>
                )}

                {inc.rentedConsumable === "Consumable" && (
                  <input type="number" placeholder="Qty" value={inc.customQuantity} onChange={(e) => handleCustomQuantityChange(inc.id, e.target.value)} style={input} />
                )}

                <input type="number" placeholder="Price" value={inc.price} onChange={(e) => handlePriceChange(inc.id, e.target.value)} style={input} />

                <button onClick={() => handleRemoveInclusion(inc.id)} style={{ ...button, backgroundColor: "#e74c3c", color: "#fff" }}>Remove</button>
              </div>

              <div style={{ marginTop: "4px", fontWeight: "bold", color: inc.matchedRow ? "#27ae60" : "#c0392b" }}>
                {inc.matchedRow ? "✅ Matched" : "❌ Not Matched"}
              </div>

              <textarea value={inc.previewText} onChange={(e) => handlePreviewChange(inc.id, e.target.value)} style={preview} />
            </div>
          ))}

         

          <div style={totalsBox}>
            <div><strong>Hora Vendor Price:</strong> ₹{totalPrice.toFixed(2)}</div>
            <div><strong>Execution Price:</strong> <input type="number" value={executionPrice} onChange={(e) => setExecutionPrice(parseFloat(e.target.value) || 0)} style={input} /></div>
            <div><strong>Final Price:</strong> ₹{finalPrice.toFixed(2)}</div>
          </div>

          <h4 style={{ marginTop: "30px", marginBottom: "8px" }}>📝 Inclusion Summary</h4>
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


      <button className="orderCheck-btn" onClick={handleSubmit}>
        Create Product
      </button>

  
    </div>
  );
};

export default AddProductForm;