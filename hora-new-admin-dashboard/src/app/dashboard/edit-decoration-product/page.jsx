// // "use client";

// // import React, { useState, useEffect } from "react";
// // import "./DecorationEditor.css";
// // import {
// //   BASE_URL,
// //   EDIT_DECORATION_PRODUCT,
// //   GET_MATERIAL_FILTER_DATA,
// //   PRODUCT_MEAL_TYPE,
// // } from "../../../utils/apiconstant";
// // import Image from "next/image";
// // import axios from "axios";
// // import CheckboxGroup from "@/app/component/CheckboxGroup";

// // const DecorationEditor = () => {
// //   const [selectedSubCategory, setSelectedSubCategory] = useState("");
// //   const [responseData, setResponseData] = useState([]);
// //   const [popupData, setPopupData] = useState(null);
// //   const [name, setName] = useState("");
// //   const [price, setPrice] = useState("");
// //   const [selectedTags, setSelectedTags] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [mealProductTypes, setMealProductTypes] = useState([]);
// //   const [mode, setMode] = useState("Option2");
// //   const [data, setData] = useState([]);
// //   const [options, setOptions] = useState({
// //     specs: [],
// //     type: [],
// //     material: [],
// //   });
// //   const [existingImages, setExistingImages] = useState([]);
// //   const [newImages, setNewImages] = useState([]);
// //   const [removedImages, setRemovedImages] = useState([]);
// //   const [inclusions, setInclusions] = useState([
// //     {
// //       id: 1,
// //       specs: "",
// //       type: "",
// //       material: "",
// //       rentedConsumable: "",
// //       moq: "",
// //       customQuantity: "",
// //       matchedRow: null,
// //       price: 0,
// //       previewText: "",
// //     },
// //   ]);
// //   const [executionPrice, setExecutionPrice] = useState(0);
// //   const [advancePercent, setAdvancePercent] = useState(0);
// //   const [option2Text, setOption2Text] = useState("");
// //   const [nextId, setNextId] = useState(1);
// //   const [callChecklist, setCallChecklist] = useState({
// //     designType: {},
// //   });

// //   const designTypeOptions = [
// //     "Wall",
// //     "Ring",
// //     "Ring + Flex",
// //     "Sequined",
// //     "U Shape",
// //     "Square Stand",
// //     "Room Decor",
// //     "Cradle",
// //     "Flex",
// //     "Artificial Flower",
// //     "Real Flower",
// //     "On Wall", 
// //     "Personalized Flex On Wall", 
// //     "On Ring",
// //     "Ring + Personalised Flex", 
// //     "Sequins Design",
// //     "U Shape Stand",
// //     "U stand + Personalized flex", 
// //     "U Shape Wooden stand", 
// //     "Canopy",
// //     "Personalized Flex on Stand", 
// //     "Multi - Panel Backdrop",
// //     "On Square Stand",
// //     "Car Decor",
// //     "Entry Arch",    
// //   ];

// //   const getDefaultDesignType = (data = {}) => {
// //     const result = {};
// //     designTypeOptions.forEach((item) => {
// //       result[item] = data?.[item] || false;
// //     });
// //     return result;
// //   };

// //   const handleSelectChange = async (event) => {
// //     const subCategory = event.target.value;
// //     setSelectedSubCategory(subCategory);
// //     setLoading(true);

// //     if (subCategory) {
// //       try {
// //         const response = await fetch(
// //           `${BASE_URL}/api/meals/idByTag?tag=${subCategory}`,
// //         );
// //         const data = await response.json();

// //         if (data && data.data && data.data._id) {
// //           await fetchSecondAPI(data.data._id);
// //         } else {
// //           setResponseData([]);
// //         }
// //       } catch (error) {
// //         console.error("Error fetching _id:", error);
// //       } finally {
// //         setLoading(false);
// //       }
// //     } else {
// //       setResponseData([]);
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     const fetchMaterialFilterData = async () => {
// //       try {
// //         const res = await fetch(`${BASE_URL}${GET_MATERIAL_FILTER_DATA}`);
// //         const result = await res.json();

// //         if (
// //           result?.error === false ||
// //           result?.success === false ||
// //           result?.data
// //         ) {
// //           const apiData = result.data || {};

// //           const specsData = Array.isArray(apiData.specs) ? apiData.specs : [];
// //           const typeData = Array.isArray(apiData.type) ? apiData.type : [];
// //           const materialData = Array.isArray(apiData.material)
// //             ? apiData.material
// //             : [];

// //           setData(specsData);

// //           setOptions({
// //             specs: specsData.map((item) => item.value).filter(Boolean),
// //             type: typeData.map((item) => item.value).filter(Boolean),
// //             material: materialData.map((item) => item.value).filter(Boolean),
// //           });
// //         }
// //       } catch (err) {
// //         console.error("Error fetching material filter data:", err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchMaterialFilterData();
// //   }, []);

// //   const buildPreviewText = (item) => {
// //     let previewText = `${item.specs || "-"} ${item.type || "-"} ${item.material || "-"}`;

// //     if (item.rentedConsumable === "Rented") {
// //       previewText += ` ${item.moq || "-"}`;
// //     } else if (item.rentedConsumable === "Consumable") {
// //       previewText += ` ${item.customQuantity || item.moq || 1}`;
// //     }

// //     return previewText;
// //   };

// //   const extractNumber = (value) => {
// //     return parseFloat(String(value || "").replace(/[^\d.]/g, "")) || 0;
// //   };

// //   const getCalculatedPrice = (matchedRow, rentedConsumable, customQuantity) => {
// //     if (!matchedRow) return 0;

// //     const vendorPrice = parseFloat(matchedRow.vendorMaterialPrice) || 0;

// //     if (rentedConsumable === "Consumable") {
// //       const qty = parseFloat(customQuantity) || 0;
// //       const moqNumber = extractNumber(matchedRow.minimumOrderQuantity) || 1;
// //       return (qty * vendorPrice) / moqNumber;
// //     }

// //     return vendorPrice;
// //   };

// //   const handleSelectChangeInc = (id, field, value) => {
// //     setInclusions((prev) =>
// //       prev.map((inc) => {
// //         if (inc.id !== id) return inc;

// //         let updated = {
// //           ...inc,
// //           [field]: value,
// //         };

// //         if (field === "specs") {
// //           const firstMatch = data.find((row) => row.value === value);

// //           if (firstMatch) {
// //             updated = {
// //               ...updated,
// //               specs: firstMatch.value || "",
// //               type: firstMatch.type || "",
// //               material: firstMatch.material || "",
// //               rentedConsumable: firstMatch.materialCategory || "",
// //               moq: firstMatch.minimumOrderQuantity || "",
// //               matchedRow: firstMatch,
// //             };

// //             const defaultQty =
// //               updated.customQuantity ||
// //               extractNumber(firstMatch.minimumOrderQuantity) ||
// //               1;

// //             updated.customQuantity =
// //               firstMatch.materialCategory === "Consumable"
// //                 ? updated.customQuantity || defaultQty
// //                 : "";

// //             updated.price = getCalculatedPrice(
// //               firstMatch,
// //               firstMatch.materialCategory,
// //               updated.customQuantity,
// //             );

// //             updated.previewText = buildPreviewText(updated);
// //             return updated;
// //           } else {
// //             updated = {
// //               ...updated,
// //               type: "",
// //               material: "",
// //               rentedConsumable: "",
// //               moq: "",
// //               customQuantity: "",
// //               matchedRow: null,
// //               price: 0,
// //             };
// //             updated.previewText = buildPreviewText(updated);
// //             return updated;
// //           }
// //         }

// //         if (field === "type") {
// //           let firstMatch = data.find(
// //             (row) => row.value === updated.specs && row.type === value,
// //           );

// //           if (firstMatch) {
// //             updated = {
// //               ...updated,
// //               type: firstMatch.type || "",
// //               material: firstMatch.material || "",
// //               rentedConsumable: firstMatch.materialCategory || "",
// //               moq: firstMatch.minimumOrderQuantity || "",
// //               matchedRow: firstMatch,
// //             };

// //             if (firstMatch.materialCategory !== "Consumable") {
// //               updated.customQuantity = "";
// //             }

// //             updated.price = getCalculatedPrice(
// //               firstMatch,
// //               firstMatch.materialCategory,
// //               updated.customQuantity,
// //             );
// //           } else {
// //             updated = {
// //               ...updated,
// //               type: value,
// //               material: "",
// //               rentedConsumable: "",
// //               moq: "",
// //               customQuantity: "",
// //               matchedRow: null,
// //               price: 0,
// //             };
// //           }

// //           updated.previewText = buildPreviewText(updated);
// //           return updated;
// //         }

// //         if (field === "material") {
// //           const exactMatch = data.find(
// //             (row) =>
// //               row.value === updated.specs &&
// //               row.type === updated.type &&
// //               row.material === value,
// //           );

// //           if (exactMatch) {
// //             updated = {
// //               ...updated,
// //               material: exactMatch.material || "",
// //               rentedConsumable: exactMatch.materialCategory || "",
// //               moq: exactMatch.minimumOrderQuantity || "",
// //               matchedRow: exactMatch,
// //             };

// //             if (exactMatch.materialCategory !== "Consumable") {
// //               updated.customQuantity = "";
// //             }

// //             updated.price = getCalculatedPrice(
// //               exactMatch,
// //               exactMatch.materialCategory,
// //               updated.customQuantity,
// //             );
// //           } else {
// //             updated = {
// //               ...updated,
// //               material: value,
// //               rentedConsumable: "",
// //               moq: "",
// //               customQuantity: "",
// //               matchedRow: null,
// //               price: 0,
// //             };
// //           }

// //           updated.previewText = buildPreviewText(updated);
// //           return updated;
// //         }

// //         return updated;
// //       }),
// //     );
// //   };

// //   const handleCustomQuantityChange = (id, value) => {
// //     setInclusions((prev) =>
// //       prev.map((inc) => {
// //         if (inc.id !== id) return inc;

// //         const updated = {
// //           ...inc,
// //           customQuantity: value,
// //         };

// //         updated.price = getCalculatedPrice(
// //           updated.matchedRow,
// //           updated.rentedConsumable,
// //           value,
// //         );

// //         updated.previewText = buildPreviewText(updated);

// //         return updated;
// //       }),
// //     );
// //   };

// //   const handleAddInclusion = () => {
// //     setInclusions((prev) => [
// //       ...prev,
// //       {
// //         id: nextId,
// //         specs: "",
// //         type: "",
// //         material: "",
// //         rentedConsumable: "",
// //         moq: "",
// //         customQuantity: "",
// //         matchedRow: null,
// //         price: 0,
// //         previewText: "",
// //       },
// //     ]);
// //     setNextId(nextId + 1);
// //   };

// //   const handleRemoveInclusion = (id) => {
// //     if (inclusions.length > 1) {
// //       setInclusions(inclusions.filter((i) => i.id !== id));
// //     }
// //   };

// //   const totalPrice = inclusions.reduce((sum, i) => sum + i.price, 0);
// //   // const finalPrice = totalPrice + executionPrice;
// //   const summaryText = inclusions.map((i) => i.previewText).join("\n");

// //   const container = {
// //     maxWidth: "1450px",
// //     margin: "40px auto",
// //     padding: "2px",
// //     fontFamily: "Segoe UI, sans-serif",
// //   };
// //   const row = {
// //     display: "flex",
// //     flexWrap: "wrap",
// //     gap: "6px",
// //     alignItems: "center",
// //     marginBottom: "8px",
// //   };
// //   const select = {
// //     padding: "8px",
// //     borderRadius: "6px",
// //     border: "1px solid #ccc",
// //     minWidth: "100px",
// //   };
// //   const input = {
// //     padding: "8px",
// //     borderRadius: "6px",
// //     border: "1px solid #ccc",
// //     width: "40px",
// //   };
// //   const button = {
// //     padding: "8px 12px",
// //     borderRadius: "6px",
// //     border: "none",
// //     cursor: "pointer",
// //     transition: "0.2s",
// //   };
// //   const inclusionBox = {
// //     backgroundColor: "#fefefe",
// //     border: "1px solid #ddd",
// //     borderRadius: "8px",
// //     padding: "16px",
// //     marginBottom: "20px",
// //     boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
// //   };
// //   const preview = {
// //     width: "90%",
// //     height: "auto",
// //     marginTop: "8px",
// //     padding: "10px",
// //     border: "1px solid #ddd",
// //     borderRadius: "6px",
// //     fontSize: "14px",
// //     background: "#f9f9f9",
// //   };
// //   const summary = {
// //     width: "100%",
// //     height: "150px",
// //     padding: "16px",
// //     borderRadius: "8px",
// //     border: "1px solid #ccc",
// //     backgroundColor: "#fafafa",
// //     marginTop: "12px",
// //     boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
// //     fontFamily: "monospace",
// //     whiteSpace: "pre-wrap",
// //   };
// //   const totalsBox = {
// //     background: "#f2f8f9",
// //     padding: "20px",
// //     borderRadius: "8px",
// //     border: "1px solid #ddd",
// //     display: "flex",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     marginTop: "20px",
// //     fontSize: "16px",
// //   };

// //   const getFilteredTypes = (specs) => {
// //     if (!specs) return options.type;

// //     return [
// //       ...new Set(
// //         data
// //           .filter((row) => row.value === specs)
// //           .map((row) => row.type)
// //           .filter(Boolean),
// //       ),
// //     ];
// //   };

// //   const getFilteredMaterials = (specs, type) => {
// //     let filtered = data;

// //     if (specs) {
// //       filtered = filtered.filter((row) => row.value === specs);
// //     }

// //     if (type) {
// //       filtered = filtered.filter((row) => row.type === type);
// //     }

// //     return [...new Set(filtered.map((row) => row.material).filter(Boolean))];
// //   };

// //   const fetchSecondAPI = async (_id) => {
// //     try {
// //       const response = await fetch(
// //         `${BASE_URL}/api/Decoration/searchByTag/${_id}`,
// //       );
// //       const data = await response.json();

// //       if (data && data.data) {
// //         setResponseData(data.data);
// //       } else {
// //         setResponseData([]);
// //       }
// //     } catch (error) {
// //       console.error("Error fetching second API:", error);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchOptions(BASE_URL + PRODUCT_MEAL_TYPE, setMealProductTypes, {
// //       per_page: "500",
// //     });
// //   }, []);

// //   const fetchOptions = async (url, setter, body) => {
// //     try {
// //       const response = await fetch(url, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify(body),
// //       });
// //       const data = await response.json();
// //       if (data.error === false && data.data) {
// //         setter(
// //           url.includes("admin_meals_list")
// //             ? data.data.meal || []
// //             : data.data.configuration || [],
// //         );
// //       }
// //     } catch (error) {
// //       console.error("Error fetching data:", error);
// //     }
// //   };

// //   const handlePopupOpen = (item) => {
// //     setPopupData(item);
// //     setName(item.name);
// //     setPrice(item.price);
// //     setSelectedTags(item.tag || []);

// //     setExistingImages(item.featured_images || []);
// //     setNewImages([]);
// //     setRemovedImages([]);

// //     // OPTION DECIDE
// //     if (item.inclusionVariables && item.inclusionVariables.length > 0) {
// //       setMode("Option1");

// //       let mapped;
// //       if (typeof item?.inclusionVariables === "string") {
// //         mapped = JSON.parse(item?.inclusionVariables)?.map((inc, index) => ({
// //           ...inc,
// //           id: index + 1,
// //         }));
// //       } else {
// //         mapped = item.inclusionVariables;
// //       }

// //       setInclusions(mapped);
// //       setNextId(mapped.length + 1);
// //     } else {
// //       setMode("Option2");

// //       const inclusionText = item.inclusion
// //         ?.map((i) => i.replace(/<[^>]*>/g, ""))
// //         .join("\n")
// //         .replace(/-\s*/g, "\n- ");

// //       setOption2Text(inclusionText || "");
// //     }
// //   };

// //   const handleImageChange = (e) => {
// //     const files = Array.from(e.target.files);
// //     setNewImages((prev) => [...prev, ...files]);
// //   };

// //   const removeExistingImage = (img) => {
// //     setRemovedImages((prev) => [...prev, img]);

// //     setExistingImages((prev) =>
// //       prev.filter((i) => i.fileName !== img.fileName),
// //     );
// //   };

// //   const removeNewImage = (index) => {
// //     setNewImages((prev) => prev.filter((_, i) => i !== index));
// //   };

// //   const handleTagChange = (tagId) => {
// //     setSelectedTags((prevTags) =>
// //       prevTags.includes(tagId)
// //         ? prevTags.filter((id) => id !== tagId)
// //         : [...prevTags, tagId],
// //     );
// //   };

// //   const handlePopupClose = () => {
// //     setPopupData(null);
// //     setName("");
// //     setPrice("");
// //     setSelectedTags([]);
// //     setInclusions([]);
// //   };
// //   const handleSaveChanges = async () => {
// //     try {
// //       const formData = new FormData();

// //       formData.append("_id", popupData._id);
// //       formData.append("name", name);
// //       formData.append("price", price);

// //       formData.append("tag", JSON.stringify(selectedTags));
// //       formData.append("designType", JSON.stringify(callChecklist.designType));

// //       // NEW IMAGES
// //       newImages.forEach((file) => {
// //         formData.append("featured_images", file);
// //       });

// //       // REMOVED IMAGES
// //       formData.append("removedImages", JSON.stringify(removedImages));
// //       if (mode === "Option1") {
// //         const formattedInclusion = [
// //           inclusions
// //             .filter((i) => i.previewText?.trim())
// //             .map((i) => `<div>-${i.previewText.trim()}</div>`)
// //             .join(""),
// //         ];

// //         formData.append("inclusionVariables", JSON.stringify(inclusions));

// //         formData.append("inclusion", JSON.stringify(formattedInclusion));
// //       } else {
// //         const formatted = [
// //           option2Text
// //             .split("\n")
// //             .map((line) => line.trim())
// //             .filter(Boolean)
// //             .map(
// //               (line) =>
// //                 `<div>${line.startsWith("-") ? line : `-${line}`}</div>`,
// //             )
// //             .join(""),
// //         ];

// //         formData.append("inclusion", JSON.stringify(formatted));
// //       }

// //       const response = await fetch(BASE_URL + EDIT_DECORATION_PRODUCT, {
// //         method: "POST",
// //         body: formData,
// //       });

// //       const result = await response.json();
// //       console.log("Response:", result);

// //       if (result.error === false) {
// //         if (selectedSubCategory) {
// //           handleSelectChange({
// //             target: { value: selectedSubCategory },
// //           });
// //         }
// //         setPopupData(null);
// //       } else {
// //         console.error("API error:", result);
// //       }
// //     } catch (error) {
// //       console.error("Save error:", error);
// //     }
// //   };

// //   const handlePriceChange = (id, value) => {
// //     const num = parseFloat(value) || 0;
// //     setInclusions((prev) =>
// //       prev.map((i) => {
// //         if (i.id === id) {
// //           let previewText = `${i.specs || "-"} ${i.type || "-"} ${
// //             i.material || "-"
// //           }`;
// //           if (i.rentedConsumable === "Rented") {
// //             previewText += ` ${i.moq || "-"}`;
// //           } else if (i.rentedConsumable === "Consumable") {
// //             previewText += ` ${i.customQuantity || 1} PCS`;
// //           }
// //           // previewText += `, Price: $${num.toFixed(2)}`;
// //           return { ...i, price: num, previewText };
// //         }
// //         return i;
// //       }),
// //     );
// //   };
// //   const handlePreviewChange = (id, value) => {
// //     setInclusions((prev) =>
// //       prev.map((i) => (i.id === id ? { ...i, previewText: value } : i)),
// //     );
// //   };
// //   const handleCheckboxChange = (section, item) => {
// //     setCallChecklist((prev) => ({
// //       ...prev,
// //       [section]: {
// //         ...prev[section],
// //         [item]: !prev[section]?.[item], // toggle true/false
// //       },
// //     }));
// //   };
// //   useEffect(() => {
// //     if (popupData?.designType) {
// //       setCallChecklist((prev) => ({
// //         ...prev,
// //         designType: getDefaultDesignType(popupData.designType),
// //       }));
// //     } else {
// //       setCallChecklist((prev) => ({
// //         ...prev,
// //         designType: getDefaultDesignType(),
// //       }));
// //     }
// //   }, [popupData]);

// //   // Add this function to filter the data
// //   const filteredData = responseData.filter((item) => {
// //     const lowerQuery = searchQuery.toLowerCase();

// //     return (
// //       item.name.toLowerCase().includes(lowerQuery) ||
// //       item._id.toLowerCase().includes(lowerQuery) ||
// //       item.tag.some((tagId) => {
// //         const tag = mealProductTypes.find((t) => t._id === tagId);
// //         return tag?.name.toLowerCase().includes(lowerQuery);
// //       })
// //     );
// //   });

// //   return (
// //     <div className="container">
// //       <div className="content-wrapper">
// //         <h1 className="page-title">Decoration Editing</h1>

// //         <div className="form-control full-width">
// //           <label htmlFor="subcategory-select" className="select-label">
// //             Select Subcategory
// //           </label>
// //           <select
// //             id="subcategory-select"
// //             value={selectedSubCategory}
// //             onChange={handleSelectChange}
// //             className="select-dropdown"
// //           >
// //             <option value="">Select SubCategory</option>
// //             {mealProductTypes
// //               .filter((type) =>
// //                 type.configurationId?.some(
// //                   (config) => config.name === "Decoration",
// //                 ),
// //               )
// //               .map((item) => (
// //                 <option key={item._id} value={item.name}>
// //                   {item.name}
// //                 </option>
// //               ))}
// //           </select>
// //         </div>

// //         <div className="form-control full-width">
// //           <input
// //             type="text"
// //             className="search-input"
// //             value={searchQuery}
// //             onChange={(e) => setSearchQuery(e.target.value)}
// //             placeholder="Search by name, ID or tag"
// //           />
// //         </div>

// //         {loading ? (
// //           <div className="loading-container">
// //             <div className="loading-spinner"></div>
// //           </div>
// //         ) : filteredData.length > 0 ? (
// //           <div className="table-container">
// //             <table className="data-table">
// //               <thead>
// //                 <tr>
// //                   <th>Name</th>
// //                   <th>Featured Image</th>
// //                   <th>Price</th>
// //                   <th>Tags</th>
// //                   <th>Actions</th>
// //                   <th>Status</th>
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {filteredData.map((item) => (
// //                   <tr key={item._id} className="table-row">
// //                     <td>{item.name}</td>
// //                     <td>
// //                       {item?.featured_images?.length &&
// //                       item?.featured_images[0] ? (
// //                         <Image
// //                           src={`${BASE_URL}/api/uploads/compressed_webp/${
// //                             item?.featured_images[0]?.fileName?.split(".")[0]
// //                           }.webp`}
// //                           alt={item.name}
// //                           className="thumbnail"
// //                           width={80}
// //                           height={40}
// //                         />
// //                       ) : (
// //                         "No Image"
// //                       )}
// //                     </td>
// //                     <td>₹{item.price}</td>
// //                     <td>
// //                       <div className="chip-container">
// //                         {item.tag.map((tagId) => {
// //                           const tag = mealProductTypes.find(
// //                             (t) => t._id === tagId,
// //                           );
// //                           return (
// //                             <span key={tagId} className="chip">
// //                               {tag ? tag.name : "Unknown"}
// //                             </span>
// //                           );
// //                         })}
// //                       </div>
// //                     </td>
// //                     <td className="actions-cell">
// //                       <button
// //                         className="action-button"
// //                         onClick={() => handlePopupOpen(item)}
// //                       >
// //                         <i className="icon-visibility"></i>
// //                         Update
// //                       </button>
// //                     </td>
// //                     <td className="actions-cell">
// //                       <button
// //                         className="action-button"
// //                         onClick={async () => {
// //                           const newStatus = item.status === 1 ? 0 : 1;

// //                           await axios.post(
// //                             `${BASE_URL}/api/dish/update_decoration_status`,
// //                             {
// //                               id: item._id,
// //                               status: newStatus,
// //                             },
// //                           );

// //                           window.location.reload(); // reload the page s
// //                         }}
// //                         style={{
// //                           backgroundColor: item.status === 1 ? "green" : "red",
// //                         }}
// //                       >
// //                         {item.status === 1 ? "Active" : "Inactive"}
// //                       </button>
// //                     </td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>
// //           </div>
// //         ) : (
// //           selectedSubCategory && (
// //             <div className="no-data-message">
// //               <p>No items found for this subcategory.</p>
// //             </div>
// //           )
// //         )}

// //         {popupData && (
// //           <div className="modal-overlay">
// //             <div className="modal-dialog">
// //               <div className="modal-header">
// //                 <h2 className="modal-title">
// //                   Editing Details for: {popupData.name}
// //                 </h2>
// //                 <span className="modal-subtitle">ID: {popupData._id}</span>
// //               </div>
// //               <div className="modal-content">
// //                 <div className="modal-grid">
// //                   <div className="modal-column">
// //                     <div className="form-group">
// //                       <label htmlFor="name-input">Name</label>
// //                       <input
// //                         id="name-input"
// //                         type="text"
// //                         className="form-input"
// //                         value={name}
// //                         onChange={(e) => setName(e.target.value)}
// //                       />
// //                     </div>

// //                     <div className="form-group">
// //                       <label htmlFor="price-input">Price</label>
// //                       <div className="price-input-container">
// //                         <span className="price-symbol">₹</span>
// //                         <input
// //                           id="price-input"
// //                           type="number"
// //                           className="form-input price-input"
// //                           value={price}
// //                           onChange={(e) => setPrice(e.target.value)}
// //                         />
// //                       </div>
// //                     </div>

// //                     <div>
// //                       {/* EXISTING IMAGES */}
// //                       <div style={{ display: "flex", gap: 10 }}>
// //                         {existingImages?.map((img) => (
// //                           <div key={img.fileName}>
// //                             <img
// //                               src={`${BASE_URL}/api/uploads/compressed_webp/${img.fileName}`}
// //                               width={80}
// //                             />
// //                             <button onClick={() => removeExistingImage(img)}>
// //                               Remove
// //                             </button>
// //                           </div>
// //                         ))}
// //                       </div>

// //                       {/* NEW IMAGES */}
// //                       <div style={{ display: "flex", gap: 10 }}>
// //                         {newImages.map((file, index) => (
// //                           <div key={index}>
// //                             <img src={URL.createObjectURL(file)} width={80} />
// //                             <button onClick={() => removeNewImage(index)}>
// //                               Remove
// //                             </button>
// //                           </div>
// //                         ))}
// //                       </div>

// //                       <input
// //                         type="file"
// //                         multiple
// //                         onChange={handleImageChange}
// //                       />
// //                     </div>
// //                   </div>

// //                   <div className="modal-column">
// //                     <h3 className="section-title">Tags</h3>
// //                     <div className="tags-container">
// //                       {mealProductTypes
// //                         .filter((type) =>
// //                           type.configurationId?.some(
// //                             (config) => config.name === "Decoration",
// //                           ),
// //                         )
// //                         .map((type) => (
// //                           <div key={type._id} className="checkbox-item">
// //                             <input
// //                               type="checkbox"
// //                               id={`tag-${type._id}`}
// //                               checked={selectedTags.includes(type._id)}
// //                               onChange={() => handleTagChange(type._id)}
// //                             />
// //                             <label htmlFor={`tag-${type._id}`}>
// //                               {type.name}
// //                             </label>
// //                           </div>
// //                         ))}
// //                     </div>
// //                   </div>
// //                   <div className="checkbox-container">
// //                     <div className="checklist-body">
// //                       <CheckboxGroup
// //                         key={"designType"}
// //                         title={"Explain the type of design"}
// //                         items={designTypeOptions}
// //                         section={"designType"}
// //                         checklist={callChecklist}
// //                         onChange={handleCheckboxChange}
// //                       />
// //                     </div>
// //                   </div>

// //                   <div style={container}>
// //                     <div style={{ marginBottom: "20px" }}>
// //                       <label style={{ marginRight: "8px" }}>Choose Mode:</label>
// //                       <select
// //                         value={mode}
// //                         onChange={(e) => setMode(e.target.value)}
// //                         style={select}
// //                       >
// //                         <option value="Option1">Option 1</option>
// //                         <option value="Option2">Option 2</option>
// //                       </select>
// //                     </div>

// //                     {mode === "Option1" ? (
// //                       <>
// //                         <button
// //                           onClick={handleAddInclusion}
// //                           style={{
// //                             ...button,
// //                             backgroundColor: "#3498db",
// //                             color: "#fff",
// //                             marginBottom: "20px",
// //                           }}
// //                         >
// //                           + Add Inclusion
// //                         </button>
// //                         {inclusions.map((inc) => {
// //                           const filteredTypes = getFilteredTypes(inc.specs);
// //                           const filteredMaterials = getFilteredMaterials(
// //                             inc.specs,
// //                             inc.type,
// //                           );
// //                           return (
// //                             <div key={inc.id} style={inclusionBox}>
// //                               <div style={row}>
// //                                 <select
// //                                   value={inc.specs}
// //                                   onChange={(e) =>
// //                                     handleSelectChangeInc(
// //                                       inc.id,
// //                                       "specs",
// //                                       e.target.value,
// //                                     )
// //                                   }
// //                                   style={select}
// //                                 >
// //                                   <option value="">Specs</option>
// //                                   {options.specs.map((o, i) => (
// //                                     <option key={i} value={o}>
// //                                       {o}
// //                                     </option>
// //                                   ))}
// //                                 </select>

// //                                 <select
// //                                   value={inc.type}
// //                                   onChange={(e) =>
// //                                     handleSelectChangeInc(
// //                                       inc.id,
// //                                       "type",
// //                                       e.target.value,
// //                                     )
// //                                   }
// //                                   style={select}
// //                                 >
// //                                   <option value="">Type</option>
// //                                   {filteredTypes?.map((o, i) => (
// //                                     <option key={i} value={o}>
// //                                       {o}
// //                                     </option>
// //                                   ))}
// //                                 </select>

// //                                 <select
// //                                   value={inc.material}
// //                                   onChange={(e) =>
// //                                     handleSelectChangeInc(
// //                                       inc.id,
// //                                       "material",
// //                                       e.target.value,
// //                                     )
// //                                   }
// //                                   style={select}
// //                                 >
// //                                   <option value="">Material</option>
// //                                   {filteredMaterials?.map((o, i) => (
// //                                     <option key={i} value={o}>
// //                                       {o}
// //                                     </option>
// //                                   ))}
// //                                 </select>

// //                                 <input
// //                                   type="text"
// //                                   value={inc.rentedConsumable}
// //                                   placeholder="Rented/Consumable"
// //                                   readOnly
// //                                   style={{
// //                                     ...select,
// //                                     backgroundColor: "#f5f5f5",
// //                                   }}
// //                                 />

// //                                 <input
// //                                   type="text"
// //                                   value={inc.moq}
// //                                   placeholder="MOQ"
// //                                   readOnly
// //                                   style={{
// //                                     ...select,
// //                                     backgroundColor: "#f5f5f5",
// //                                   }}
// //                                 />

// //                                 {inc.rentedConsumable === "Consumable" && (
// //                                   <input
// //                                     type="number"
// //                                     placeholder="Qty"
// //                                     value={inc.customQuantity}
// //                                     onChange={(e) =>
// //                                       handleCustomQuantityChange(
// //                                         inc.id,
// //                                         e.target.value,
// //                                       )
// //                                     }
// //                                     style={input}
// //                                   />
// //                                 )}

// //                                 <input
// //                                   type="number"
// //                                   placeholder="Price"
// //                                   value={inc.price}
// //                                   onChange={(e) =>
// //                                     handlePriceChange(inc.id, e.target.value)
// //                                   }
// //                                   style={input}
// //                                 />

// //                                 <button
// //                                   onClick={() => handleRemoveInclusion(inc.id)}
// //                                   style={{
// //                                     ...button,
// //                                     backgroundColor: "#e74c3c",
// //                                     color: "#fff",
// //                                   }}
// //                                 >
// //                                   Remove
// //                                 </button>
// //                               </div>
// //                               <div
// //                                 style={{
// //                                   marginTop: "4px",
// //                                   fontWeight: "bold",
// //                                   color: inc.matchedRow ? "#27ae60" : "#c0392b",
// //                                 }}
// //                               >
// //                                 {inc.matchedRow
// //                                   ? "✅ Matched"
// //                                   : "❌ Not Matched"}
// //                               </div>

// //                               <textarea
// //                                 value={inc.previewText}
// //                                 onChange={(e) =>
// //                                   handlePreviewChange(inc.id, e.target.value)
// //                                 }
// //                                 style={preview}
// //                               />
// //                             </div>
// //                           );
// //                         })}

// //                         <div style={totalsBox}>
// //                           <div>
// //                             <strong>Hora Vendor Material Price:</strong> ₹
// //                             {totalPrice.toFixed(2)}
// //                           </div>

// //                           <div>
// //                             <strong>Execution Price:</strong>{" "}
// //                             <input
// //                               type="number"
// //                               value={executionPrice}
// //                               onChange={(e) =>
// //                                 setExecutionPrice(
// //                                   parseFloat(e.target.value) || 0,
// //                                 )
// //                               }
// //                               style={input}
// //                             />
// //                           </div>

// //                           <div>
// //                             <strong>Advance %:</strong>{" "}
// //                             <input
// //                               type="number"
// //                               value={advancePercent}
// //                               onChange={(e) =>
// //                                 setAdvancePercent(
// //                                   parseFloat(e.target.value) || 0,
// //                                 )
// //                               }
// //                               style={input}
// //                               placeholder="e.g. 20"
// //                             />
// //                           </div>

// //                           {/* Customer Price Calculation */}
// //                           <div>
// //                             <strong>Customer Price:</strong> ₹
// //                             {advancePercent >= 100
// //                               ? "Invalid %"
// //                               : (
// //                                   (totalPrice + executionPrice) /
// //                                   (1 - advancePercent / 100)
// //                                 ).toFixed(2)}
// //                           </div>

// //                           {/* Advance Amount Calculation */}
// //                           <div>
// //                             <strong>Advance Hora Amount:</strong> ₹
// //                             {advancePercent >= 100
// //                               ? "Invalid %"
// //                               : (
// //                                   ((totalPrice + executionPrice) /
// //                                     (1 - advancePercent / 100)) *
// //                                   (advancePercent / 100)
// //                                 ).toFixed(2)}
// //                           </div>
// //                         </div>

// //                         <h4 style={{ marginTop: "30px", marginBottom: "8px" }}>
// //                           📝 Inclusion Summary
// //                         </h4>
// //                         <textarea
// //                           readOnly
// //                           value={summaryText}
// //                           style={summary}
// //                         />
// //                       </>
// //                     ) : (
// //                       <div>
// //                         <label style={{ marginBottom: "8px" }}>
// //                           📝 Product Inclusion
// //                         </label>
// //                         <textarea
// //                           value={option2Text}
// //                           onChange={(e) => setOption2Text(e.target.value)}
// //                           placeholder="Enter your text here..."
// //                           style={{ ...summary, height: "200px" }}
// //                         />
// //                       </div>
// //                     )}
// //                   </div>
// //                 </div>
// //               </div>
// //               <div className="modal-footer">
// //                 <button
// //                   className="button button-secondary"
// //                   onClick={handlePopupClose}
// //                 >
// //                   Cancel
// //                 </button>
// //                 <button
// //                   className="button button-primary"
// //                   onClick={handleSaveChanges}
// //                 >
// //                   Save Changes
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default DecorationEditor;











// // // // // Without Croping System

// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import {
//   Alert,
//   Autocomplete,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Checkbox,
//   Chip,
//   CircularProgress,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Divider,
//   FormControl,
//   FormControlLabel,
//   Grid,
//   IconButton,
//   InputAdornment,
//   InputLabel,
//   MenuItem,
//   Paper,
//   Radio,
//   RadioGroup,
//   Select,
//   Snackbar,
//   Stack,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TextField,
//   Tooltip,
//   Typography,
// } from "@mui/material";
// import {
//   Edit as EditIcon,
//   Search as SearchIcon,
//   CloudUpload as CloudUploadIcon,
//   DeleteOutline as DeleteIcon,
//   AddCircleOutline as AddIcon,
//   CheckCircle as CheckCircleIcon,
//   Cancel as CancelIcon,
//   Videocam as VideocamIcon,
//   Image as ImageIcon,
//   ReceiptLong as SummaryIcon,
//   CurrencyRupee as RupeeIcon,
//   Save as SaveIcon,
//   Close as CloseIcon,
// } from "@mui/icons-material";

// import {
//   BASE_URL,
//   EDIT_DECORATION_PRODUCT,
//   GET_MATERIAL_FILTER_DATA,
//   PRODUCT_MEAL_TYPE,
// } from "../../../utils/apiconstant";
// import CheckboxGroup from "@/app/component/CheckboxGroup";

// const BRAND_PRIMARY = "#924286";
// const BRAND_DARK = "#733069";
// const BRAND_LIGHT_BG = "#fcf6fb";

// const isVideoMedia = (media) => {
//   if (!media) return false;
//   if (typeof media === "object" && media.mediaType === "video") return true;
//   const name =
//     typeof media === "string" ? media : media.fileName || media.url || "";
//   return /\.(mp4|webm|ogg|mov|mkv|avi)$/i.test(name);
// };

// const getExistingMediaUrl = (media) => {
//   if (!media) return "";
//   const fileName = typeof media === "string" ? media : media.fileName;
//   if (!fileName) return "";
//   if (/^https?:\/\//i.test(fileName)) return fileName;

//   if (isVideoMedia(media)) {
//     return `${BASE_URL}/api/uploads/compressed_webp/${fileName}`;
//   }
//   return `${BASE_URL}/api/uploads/compressed_webp/${fileName.split(".")[0]}.webp`;
// };

// const DecorationEditor = () => {
//   const [selectedSubCategory, setSelectedSubCategory] = useState("");
//   const [responseData, setResponseData] = useState([]);
//   const [popupData, setPopupData] = useState(null);
//   const [name, setName] = useState("");
//   const [price, setPrice] = useState("");
//   const [selectedTags, setSelectedTags] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [mealProductTypes, setMealProductTypes] = useState([]);
//   const [mode, setMode] = useState("Option2");
//   const [data, setData] = useState([]);
//   const [options, setOptions] = useState({
//     specs: [],
//     type: [],
//     material: [],
//   });

//   // Media States (Images + Videos)
//   const [existingImages, setExistingImages] = useState([]);
//   const [newImages, setNewImages] = useState([]); // Array of { file, preview, isVideo }
//   const [removedImages, setRemovedImages] = useState([]);
//   const fileInputRef = useRef(null);

//   const [inclusions, setInclusions] = useState([
//     {
//       id: 1,
//       specs: "",
//       type: "",
//       material: "",
//       rentedConsumable: "",
//       moq: "",
//       customQuantity: "",
//       matchedRow: null,
//       price: 0,
//       previewText: "",
//     },
//   ]);
//   const [executionPrice, setExecutionPrice] = useState(0);
//   const [advancePercent, setAdvancePercent] = useState(0);
//   const [option2Text, setOption2Text] = useState("");
//   const [nextId, setNextId] = useState(1);
//   const [callChecklist, setCallChecklist] = useState({
//     designType: {},
//   });

//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "info",
//   });

//   const showToast = (message, severity = "info") => {
//     setSnackbar({ open: true, message, severity });
//   };

//   const designTypeOptions = [
//     "Wall",
//     "Ring",
//     "Ring + Flex",
//     "Sequined",
//     "U Shape",
//     "Square Stand",
//     "Room Decor",
//     "Cradle",
//     "Flex",
//     "Artificial Flower",
//     "Real Flower",
//     "On Wall",
//     "Personalized Flex On Wall",
//     "On Ring",
//     "Ring + Personalised Flex",
//     "Sequins Design",
//     "U Shape Stand",
//     "U stand + Personalized flex",
//     "U Shape Wooden stand",
//     "Canopy",
//     "Personalized Flex on Stand",
//     "Multi - Panel Backdrop",
//     "On Square Stand",
//     "Car Decor",
//     "Entry Arch",
//   ];

//   const getDefaultDesignType = (designData = {}) => {
//     const result = {};
//     designTypeOptions.forEach((item) => {
//       result[item] = designData?.[item] || false;
//     });
//     return result;
//   };

//   const handleSelectChange = async (event) => {
//     const subCategory = event.target.value;
//     setSelectedSubCategory(subCategory);
//     setLoading(true);

//     if (subCategory) {
//       try {
//         const res = await axios.get(
//           `${BASE_URL}/api/meals/idByTag?tag=${encodeURIComponent(subCategory)}`
//         );
//         const result = res.data;

//         if (result?.data?._id) {
//           await fetchSecondAPI(result.data._id);
//         } else {
//           setResponseData([]);
//         }
//       } catch (error) {
//         console.error("Error fetching _id:", error);
//         showToast("Failed to load subcategory items", "error");
//       } finally {
//         setLoading(false);
//       }
//     } else {
//       setResponseData([]);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const fetchMaterialFilterData = async () => {
//       try {
//         const res = await axios.get(`${BASE_URL}${GET_MATERIAL_FILTER_DATA}`);
//         const result = res.data;

//         if (
//           result?.error === false ||
//           result?.success === false ||
//           result?.data
//         ) {
//           const apiData = result.data || {};
//           const specsData = Array.isArray(apiData.specs) ? apiData.specs : [];
//           const typeData = Array.isArray(apiData.type) ? apiData.type : [];
//           const materialData = Array.isArray(apiData.material)
//             ? apiData.material
//             : [];

//           setData(specsData);
//           setOptions({
//             specs: specsData.map((item) => item.value).filter(Boolean),
//             type: typeData.map((item) => item.value).filter(Boolean),
//             material: materialData.map((item) => item.value).filter(Boolean),
//           });
//         }
//       } catch (err) {
//         console.error("Error fetching material filter data:", err);
//       }
//     };

//     fetchMaterialFilterData();
//   }, []);

//   const buildPreviewText = (item) => {
//     let previewText = `${item.specs || "-"} ${item.type || "-"} ${
//       item.material || "-"
//     }`;

//     if (item.rentedConsumable === "Rented") {
//       previewText += ` ${item.moq || "-"}`;
//     } else if (item.rentedConsumable === "Consumable") {
//       previewText += ` ${item.customQuantity || item.moq || 1}`;
//     }

//     return previewText;
//   };

//   const extractNumber = (value) => {
//     return parseFloat(String(value || "").replace(/[^\d.]/g, "")) || 0;
//   };

//   const getCalculatedPrice = (matchedRow, rentedConsumable, customQuantity) => {
//     if (!matchedRow) return 0;

//     const vendorPrice = parseFloat(matchedRow.vendorMaterialPrice) || 0;

//     if (rentedConsumable === "Consumable") {
//       const qty = parseFloat(customQuantity) || 0;
//       const moqNumber = extractNumber(matchedRow.minimumOrderQuantity) || 1;
//       return (qty * vendorPrice) / moqNumber;
//     }

//     return vendorPrice;
//   };

//   const handleSelectChangeInc = (id, field, value) => {
//     setInclusions((prev) =>
//       prev.map((inc) => {
//         if (inc.id !== id) return inc;

//         let updated = {
//           ...inc,
//           [field]: value,
//         };

//         if (field === "specs") {
//           const firstMatch = data.find((row) => row.value === value);

//           if (firstMatch) {
//             updated = {
//               ...updated,
//               specs: firstMatch.value || "",
//               type: firstMatch.type || "",
//               material: firstMatch.material || "",
//               rentedConsumable: firstMatch.materialCategory || "",
//               moq: firstMatch.minimumOrderQuantity || "",
//               matchedRow: firstMatch,
//             };

//             const defaultQty =
//               updated.customQuantity ||
//               extractNumber(firstMatch.minimumOrderQuantity) ||
//               1;

//             updated.customQuantity =
//               firstMatch.materialCategory === "Consumable"
//                 ? updated.customQuantity || defaultQty
//                 : "";

//             updated.price = getCalculatedPrice(
//               firstMatch,
//               firstMatch.materialCategory,
//               updated.customQuantity
//             );

//             updated.previewText = buildPreviewText(updated);
//             return updated;
//           } else {
//             updated = {
//               ...updated,
//               type: "",
//               material: "",
//               rentedConsumable: "",
//               moq: "",
//               customQuantity: "",
//               matchedRow: null,
//               price: 0,
//             };
//             updated.previewText = buildPreviewText(updated);
//             return updated;
//           }
//         }

//         if (field === "type") {
//           const firstMatch = data.find(
//             (row) => row.value === updated.specs && row.type === value
//           );

//           if (firstMatch) {
//             updated = {
//               ...updated,
//               type: firstMatch.type || "",
//               material: firstMatch.material || "",
//               rentedConsumable: firstMatch.materialCategory || "",
//               moq: firstMatch.minimumOrderQuantity || "",
//               matchedRow: firstMatch,
//             };

//             if (firstMatch.materialCategory !== "Consumable") {
//               updated.customQuantity = "";
//             }

//             updated.price = getCalculatedPrice(
//               firstMatch,
//               firstMatch.materialCategory,
//               updated.customQuantity
//             );
//           } else {
//             updated = {
//               ...updated,
//               type: value,
//               material: "",
//               rentedConsumable: "",
//               moq: "",
//               customQuantity: "",
//               matchedRow: null,
//               price: 0,
//             };
//           }

//           updated.previewText = buildPreviewText(updated);
//           return updated;
//         }

//         if (field === "material") {
//           const exactMatch = data.find(
//             (row) =>
//               row.value === updated.specs &&
//               row.type === updated.type &&
//               row.material === value
//           );

//           if (exactMatch) {
//             updated = {
//               ...updated,
//               material: exactMatch.material || "",
//               rentedConsumable: exactMatch.materialCategory || "",
//               moq: exactMatch.minimumOrderQuantity || "",
//               matchedRow: exactMatch,
//             };

//             if (exactMatch.materialCategory !== "Consumable") {
//               updated.customQuantity = "";
//             }

//             updated.price = getCalculatedPrice(
//               exactMatch,
//               exactMatch.materialCategory,
//               updated.customQuantity
//             );
//           } else {
//             updated = {
//               ...updated,
//               material: value,
//               rentedConsumable: "",
//               moq: "",
//               customQuantity: "",
//               matchedRow: null,
//               price: 0,
//             };
//           }

//           updated.previewText = buildPreviewText(updated);
//           return updated;
//         }

//         return updated;
//       })
//     );
//   };

//   const handleCustomQuantityChange = (id, value) => {
//     setInclusions((prev) =>
//       prev.map((inc) => {
//         if (inc.id !== id) return inc;

//         const updated = {
//           ...inc,
//           customQuantity: value,
//         };

//         updated.price = getCalculatedPrice(
//           updated.matchedRow,
//           updated.rentedConsumable,
//           value
//         );

//         updated.previewText = buildPreviewText(updated);
//         return updated;
//       })
//     );
//   };

//   const handleAddInclusion = () => {
//     setInclusions((prev) => [
//       ...prev,
//       {
//         id: nextId,
//         specs: "",
//         type: "",
//         material: "",
//         rentedConsumable: "",
//         moq: "",
//         customQuantity: "",
//         matchedRow: null,
//         price: 0,
//         previewText: "",
//       },
//     ]);
//     setNextId((prev) => prev + 1);
//   };

//   const handleRemoveInclusion = (id) => {
//     if (inclusions.length > 1) {
//       setInclusions((prev) => prev.filter((i) => i.id !== id));
//     }
//   };

//   const getFilteredTypes = (specs) => {
//     if (!specs) return options.type;
//     return [
//       ...new Set(
//         data
//           .filter((row) => row.value === specs)
//           .map((row) => row.type)
//           .filter(Boolean)
//       ),
//     ];
//   };

//   const getFilteredMaterials = (specs, type) => {
//     let filtered = data;
//     if (specs) filtered = filtered.filter((row) => row.value === specs);
//     if (type) filtered = filtered.filter((row) => row.type === type);
//     return [...new Set(filtered.map((row) => row.material).filter(Boolean))];
//   };

//   const fetchSecondAPI = async (_id) => {
//     try {
//       const response = await axios.get(
//         `${BASE_URL}/api/Decoration/searchByTag/${_id}`
//       );
//       const resData = response.data;

//       if (resData?.data) {
//         setResponseData(resData.data);
//       } else {
//         setResponseData([]);
//       }
//     } catch (error) {
//       console.error("Error fetching second API:", error);
//     }
//   };

//   useEffect(() => {
//     fetchOptions(BASE_URL + PRODUCT_MEAL_TYPE, setMealProductTypes, {
//       per_page: "500",
//     });
//   }, []);

//   const fetchOptions = async (url, setter, body) => {
//     try {
//       const response = await axios.post(url, body, {
//         headers: { "Content-Type": "application/json" },
//       });
//       const resData = response.data;
//       if (resData?.error === false && resData?.data) {
//         setter(
//           url.includes("admin_meals_list")
//             ? resData.data.meal || []
//             : resData.data.configuration || []
//         );
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   const handlePopupOpen = (item) => {
//     setPopupData(item);
//     setName(item.name || "");
//     setPrice(item.price || "");
//     setSelectedTags(item.tag || []);

//     setExistingImages(item.featured_images || []);
//     setNewImages([]);
//     setRemovedImages([]);

//     if (item.inclusionVariables && item.inclusionVariables.length > 0) {
//       setMode("Option1");

//       let mapped;
//       if (typeof item?.inclusionVariables === "string") {
//         mapped = JSON.parse(item?.inclusionVariables)?.map((inc, index) => ({
//           ...inc,
//           id: index + 1,
//         }));
//       } else {
//         mapped = item.inclusionVariables.map((inc, index) => ({
//           ...inc,
//           id: inc.id || index + 1,
//         }));
//       }

//       setInclusions(mapped);
//       setNextId(mapped.length + 1);
//     } else {
//       setMode("Option2");

//       const inclusionText = item.inclusion
//         ?.map((i) => i.replace(/<[^>]*>/g, ""))
//         .join("\n")
//         .replace(/-\s*/g, "\n- ")
//         .trim();

//       setOption2Text(inclusionText || "");
//     }
//   };

//   const handleMediaChange = (e) => {
//     const files = Array.from(e.target.files || []);
//     if (!files.length) return;

//     const totalCurrent = existingImages.length + newImages.length;
//     const allowedCount = Math.max(0, 10 - totalCurrent);
//     const selected = files.slice(0, allowedCount);

//     if (files.length > allowedCount) {
//       showToast("Maximum 10 total media files allowed per product.", "warning");
//     }

//     const mapped = selected.map((file) => {
//       const isVideo =
//         file.type.startsWith("video/") ||
//         /\.(mp4|webm|ogg|mov|mkv|avi)$/i.test(file.name);
//       return {
//         file,
//         preview: URL.createObjectURL(file),
//         isVideo,
//       };
//     });

//     setNewImages((prev) => [...prev, ...mapped]);
//     e.target.value = "";
//   };

//   const removeExistingImage = (img) => {
//     setRemovedImages((prev) => [...prev, img]);
//     setExistingImages((prev) =>
//       prev.filter((i) => i.fileName !== img.fileName)
//     );
//   };

//   const removeNewImage = (index) => {
//     setNewImages((prev) => {
//       const target = prev[index];
//       if (target?.preview) URL.revokeObjectURL(target.preview);
//       return prev.filter((_, i) => i !== index);
//     });
//   };

//   const handlePopupClose = () => {
//     newImages.forEach((m) => {
//       if (m.preview) URL.revokeObjectURL(m.preview);
//     });
//     setPopupData(null);
//     setName("");
//     setPrice("");
//     setSelectedTags([]);
//     setNewImages([]);
//     setRemovedImages([]);
//     setInclusions([]);
//   };

//   const handleSaveChanges = async () => {
//     try {
//       if (!name.trim()) {
//         showToast("Product name is required", "error");
//         return;
//       }

//       setSaving(true);
//       const formData = new FormData();

//       formData.append("_id", popupData._id);
//       formData.append("name", name);
//       formData.append("price", price);
//       formData.append("tag", JSON.stringify(selectedTags));
//       formData.append("designType", JSON.stringify(callChecklist.designType));

//       // Unified NEW MEDIA (Images & Videos under `featured_images`)
//       newImages.forEach((item) => {
//         formData.append("featured_images", item.file);
//       });

//       // REMOVED MEDIA (Images & Videos)
//       formData.append("removedImages", JSON.stringify(removedImages));

//       if (mode === "Option1") {
//         const formattedInclusion = [
//           inclusions
//             .filter((i) => i.previewText?.trim())
//             .map((i) => `<div>-${i.previewText.trim()}</div>`)
//             .join(""),
//         ];

//         formData.append("inclusionVariables", JSON.stringify(inclusions));
//         formData.append("inclusion", JSON.stringify(formattedInclusion));
//       } else {
//         const formatted = [
//           option2Text
//             .split("\n")
//             .map((line) => line.trim())
//             .filter(Boolean)
//             .map(
//               (line) =>
//                 `<div>${line.startsWith("-") ? line : `-${line}`}</div>`
//             )
//             .join(""),
//         ];

//         formData.append("inclusion", JSON.stringify(formatted));
//       }

//       const response = await axios.post(
//         BASE_URL + EDIT_DECORATION_PRODUCT,
//         formData
//       );
//       const result = response.data;

//       if (result.error === false) {
//         showToast(
//           result.message || "Decoration updated successfully!",
//           "success"
//         );
//         if (selectedSubCategory) {
//           await handleSelectChange({
//             target: { value: selectedSubCategory },
//           });
//         }
//         handlePopupClose();
//       } else {
//         showToast(result.message || "Failed to update decoration", "error");
//       }
//     } catch (error) {
//       console.error("Save error:", error);
//       showToast(
//         error?.response?.data?.message || "Error saving changes",
//         "error"
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handlePriceChange = (id, value) => {
//     const num = parseFloat(value) || 0;
//     setInclusions((prev) =>
//       prev.map((i) => {
//         if (i.id === id) {
//           let previewText = `${i.specs || "-"} ${i.type || "-"} ${
//             i.material || "-"
//           }`;
//           if (i.rentedConsumable === "Rented") {
//             previewText += ` ${i.moq || "-"}`;
//           } else if (i.rentedConsumable === "Consumable") {
//             previewText += ` ${i.customQuantity || 1} PCS`;
//           }
//           return { ...i, price: num, previewText };
//         }
//         return i;
//       })
//     );
//   };

//   const handlePreviewChange = (id, value) => {
//     setInclusions((prev) =>
//       prev.map((i) => (i.id === id ? { ...i, previewText: value } : i))
//     );
//   };

//   const handleCheckboxChange = (section, item) => {
//     setCallChecklist((prev) => ({
//       ...prev,
//       [section]: {
//         ...prev[section],
//         [item]: !prev[section]?.[item],
//       },
//     }));
//   };

//   useEffect(() => {
//     if (popupData?.designType) {
//       setCallChecklist((prev) => ({
//         ...prev,
//         designType: getDefaultDesignType(popupData.designType),
//       }));
//     } else {
//       setCallChecklist((prev) => ({
//         ...prev,
//         designType: getDefaultDesignType(),
//       }));
//     }
//   }, [popupData]);

//   const handleToggleStatus = async (item) => {
//     try {
//       const newStatus = item.status === 1 ? 0 : 1;
//       await axios.post(`${BASE_URL}/api/dish/update_decoration_status`, {
//         id: item._id,
//         status: newStatus,
//       });

//       setResponseData((prev) =>
//         prev.map((row) =>
//           row._id === item._id ? { ...row, status: newStatus } : row
//         )
//       );
//       showToast(
//         `Status updated to ${newStatus === 1 ? "Active" : "Inactive"}`,
//         "success"
//       );
//     } catch (error) {
//       console.error("Status toggle error:", error);
//       showToast("Failed to update status", "error");
//     }
//   };

//   const decorationCategories = mealProductTypes.filter((type) =>
//     type.configurationId?.some((config) => config.name === "Decoration")
//   );

//   const selectedTagObjects = decorationCategories.filter((cat) =>
//     selectedTags.includes(cat._id)
//   );

//   const filteredData = responseData.filter((item) => {
//     const lowerQuery = searchQuery.toLowerCase();
//     return (
//       item.name.toLowerCase().includes(lowerQuery) ||
//       item._id.toLowerCase().includes(lowerQuery) ||
//       item.tag?.some((tagId) => {
//         const tag = mealProductTypes.find((t) => t._id === tagId);
//         return tag?.name.toLowerCase().includes(lowerQuery);
//       })
//     );
//   });

//   const totalPrice = inclusions.reduce((sum, i) => sum + (i.price || 0), 0);
//   const summaryText = inclusions.map((i) => i.previewText).join("\n");

//   const calculatedCustomerPrice =
//     advancePercent >= 100
//       ? null
//       : (totalPrice + executionPrice) / (1 - advancePercent / 100);

//   const calculatedAdvanceAmount =
//     calculatedCustomerPrice === null
//       ? null
//       : calculatedCustomerPrice * (advancePercent / 100);

//   return (
//     <Box
//       sx={{
//         maxWidth: 1380,
//         mx: "auto",
//         px: { xs: 2, sm: 3, md: 4 },
//         py: 4,
//       }}
//     >
//       {/* Toast Feedback */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3500}
//         onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
//         anchorOrigin={{ vertical: "top", horizontal: "right" }}
//       >
//         <Alert
//           onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
//           severity={snackbar.severity}
//           variant="filled"
//           sx={{ borderRadius: 2 }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>

//       {/* Header */}
//       <Box sx={{ mb: 3 }}>
//         <Typography variant="h4" fontWeight={700} color="#1e1420">
//           Decoration Editor
//         </Typography>
//         <Typography variant="body2" color="text.secondary">
//           Select a decoration subcategory to manage pricing, media (images & videos), tags, and inclusions.
//         </Typography>
//       </Box>

//       {/* Filter & Search Bar Card */}
//       <Paper
//         elevation={0}
//         sx={{
//           p: 2.5,
//           mb: 3,
//           borderRadius: 3,
//           border: "1px solid #e6dce4",
//           bgcolor: "#fff",
//         }}
//       >
//         <Grid container spacing={2.5} alignItems="center">
//           <Grid size={{ xs: 12, md: 5 }}>
//             <FormControl fullWidth size="small">
//               <InputLabel id="subcategory-select-label">
//                 Select Subcategory
//               </InputLabel>
//               <Select
//                 labelId="subcategory-select-label"
//                 value={selectedSubCategory}
//                 label="Select Subcategory"
//                 onChange={handleSelectChange}
//               >
//                 <MenuItem value="">
//                   <em>Select SubCategory</em>
//                 </MenuItem>
//                 {decorationCategories.map((item) => (
//                   <MenuItem key={item._id} value={item.name}>
//                     {item.name}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Grid>

//           <Grid size={{ xs: 12, md: 7 }}>
//             <TextField
//               fullWidth
//               size="small"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               placeholder="Search by product name, ID, or tag..."
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <SearchIcon fontSize="small" color="action" />
//                   </InputAdornment>
//                 ),
//               }}
//             />
//           </Grid>
//         </Grid>
//       </Paper>

//       {/* Data Table / States */}
//       {loading ? (
//         <Box
//           sx={{
//             py: 8,
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             gap: 2,
//           }}
//         >
//           <CircularProgress sx={{ color: BRAND_PRIMARY }} />
//           <Typography variant="body2" color="text.secondary">
//             Loading decoration products...
//           </Typography>
//         </Box>
//       ) : filteredData.length > 0 ? (
//         <TableContainer
//           component={Paper}
//           elevation={0}
//           sx={{
//             borderRadius: 3,
//             border: "1px solid #e6dce4",
//             overflowX: "auto",
//           }}
//         >
//           <Table sx={{ minWidth: 750 }}>
//             <TableHead sx={{ bgcolor: BRAND_LIGHT_BG }}>
//               <TableRow>
//                 <TableCell sx={{ fontWeight: 700, color: "#2b1329" }}>
//                   Product Name
//                 </TableCell>
//                 <TableCell sx={{ fontWeight: 700, color: "#2b1329" }}>
//                   Media Preview
//                 </TableCell>
//                 <TableCell sx={{ fontWeight: 700, color: "#2b1329" }}>
//                   Price
//                 </TableCell>
//                 <TableCell sx={{ fontWeight: 700, color: "#2b1329" }}>
//                   Tags
//                 </TableCell>
//                 <TableCell
//                   align="center"
//                   sx={{ fontWeight: 700, color: "#2b1329" }}
//                 >
//                   Actions
//                 </TableCell>
//                 <TableCell
//                   align="center"
//                   sx={{ fontWeight: 700, color: "#2b1329" }}
//                 >
//                   Status
//                 </TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {filteredData.map((item) => {
//                 const firstMedia = item?.featured_images?.[0];
//                 const hasVideo = isVideoMedia(firstMedia);
//                 const mediaSrc = getExistingMediaUrl(firstMedia);

//                 return (
//                   <TableRow
//                     key={item._id}
//                     hover
//                     sx={{ "&:last-child td": { border: 0 } }}
//                   >
//                     <TableCell>
//                       <Typography variant="body2" fontWeight={600}>
//                         {item.name}
//                       </Typography>
//                       <Typography variant="caption" color="text.secondary">
//                         ID: {item._id}
//                       </Typography>
//                     </TableCell>

//                     <TableCell>
//                       {mediaSrc ? (
//                         <Box
//                           sx={{
//                             position: "relative",
//                             width: 84,
//                             height: 54,
//                             borderRadius: 1.5,
//                             overflow: "hidden",
//                             bgcolor: "#141414",
//                             border: "1px solid #e0d4de",
//                           }}
//                         >
//                           {hasVideo ? (
//                             <>
//                               <video
//                                 src={mediaSrc}
//                                 muted
//                                 playsInline
//                                 style={{
//                                   width: "100%",
//                                   height: "100%",
//                                   objectFit: "cover",
//                                 }}
//                               />
//                               <Chip
//                                 label="VIDEO"
//                                 size="small"
//                                 sx={{
//                                   position: "absolute",
//                                   bottom: 2,
//                                   right: 2,
//                                   height: 16,
//                                   fontSize: "0.6rem",
//                                   fontWeight: 700,
//                                   bgcolor: BRAND_PRIMARY,
//                                   color: "#fff",
//                                 }}
//                               />
//                             </>
//                           ) : (
//                             <img
//                               src={mediaSrc}
//                               alt={item.name}
//                               style={{
//                                 width: "100%",
//                                 height: "100%",
//                                 objectFit: "cover",
//                               }}
//                             />
//                           )}
//                         </Box>
//                       ) : (
//                         <Typography variant="caption" color="text.secondary">
//                           No Media
//                         </Typography>
//                       )}
//                     </TableCell>

//                     <TableCell>
//                       <Typography
//                         variant="body2"
//                         fontWeight={700}
//                         color={BRAND_PRIMARY}
//                       >
//                         ₹{item.price}
//                       </Typography>
//                     </TableCell>

//                     <TableCell sx={{ maxWidth: 280 }}>
//                       <Stack direction="row" flexWrap="wrap" gap={0.6}>
//                         {item.tag?.map((tagId) => {
//                           const tag = mealProductTypes.find(
//                             (t) => t._id === tagId
//                           );
//                           return (
//                             <Chip
//                               key={tagId}
//                               label={tag ? tag.name : "Unknown"}
//                               size="small"
//                               sx={{
//                                 bgcolor: BRAND_LIGHT_BG,
//                                 color: BRAND_PRIMARY,
//                                 border: `1px solid ${BRAND_PRIMARY}33`,
//                                 fontSize: "0.72rem",
//                               }}
//                             />
//                           );
//                         })}
//                       </Stack>
//                     </TableCell>

//                     <TableCell align="center">
//                       <Button
//                         size="small"
//                         variant="contained"
//                         startIcon={<EditIcon fontSize="small" />}
//                         onClick={() => handlePopupOpen(item)}
//                         sx={{
//                           bgcolor: BRAND_PRIMARY,
//                           "&:hover": { bgcolor: BRAND_DARK },
//                           textTransform: "none",
//                           borderRadius: 1.5,
//                           fontWeight: 600,
//                         }}
//                       >
//                         Update
//                       </Button>
//                     </TableCell>

//                     <TableCell align="center">
//                       <Button
//                         size="small"
//                         variant="contained"
//                         color={item.status === 1 ? "success" : "error"}
//                         onClick={() => handleToggleStatus(item)}
//                         sx={{
//                           textTransform: "none",
//                           borderRadius: 1.5,
//                           minWidth: 88,
//                           fontWeight: 600,
//                         }}
//                       >
//                         {item.status === 1 ? "Active" : "Inactive"}
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 );
//               })}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       ) : (
//         selectedSubCategory && (
//           <Paper
//             elevation={0}
//             sx={{
//               p: 5,
//               textAlign: "center",
//               borderRadius: 3,
//               border: "1px dashed #d6c7d4",
//             }}
//           >
//             <Typography variant="body1" color="text.secondary">
//               No items found for this subcategory.
//             </Typography>
//           </Paper>
//         )
//       )}

//       {/* =====================================================================
//           EDIT MODAL DIALOG (All Edit Controls Inside Popup)
//           ===================================================================== */}
//       <Dialog
//         open={Boolean(popupData)}
//         onClose={handlePopupClose}
//         maxWidth="lg"
//         fullWidth
//         scroll="paper"
//         PaperProps={{
//           sx: { borderRadius: 3 },
//         }}
//       >
//         {popupData && (
//           <>
//             <DialogTitle
//               sx={{
//                 bgcolor: BRAND_LIGHT_BG,
//                 borderBottom: "1px solid #e6dce4",
//                 py: 2,
//                 px: 3,
//               }}
//             >
//               <Stack
//                 direction="row"
//                 justifyContent="space-between"
//                 alignItems="center"
//               >
//                 <Box>
//                   <Typography variant="h6" fontWeight={700} color="#1e1420">
//                     Edit Decoration: {popupData.name}
//                   </Typography>
//                   <Typography variant="caption" color="text.secondary">
//                     Product ID: {popupData._id}
//                   </Typography>
//                 </Box>
//                 <IconButton onClick={handlePopupClose} size="small">
//                   <CloseIcon />
//                 </IconButton>
//               </Stack>
//             </DialogTitle>

//             <DialogContent dividers sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#fcfafc" }}>
//               <Stack spacing={3}>
//                 {/* 1. BASIC DETAILS & TAGS */}
//                 <Paper
//                   elevation={0}
//                   sx={{
//                     p: 2.5,
//                     borderRadius: 2.5,
//                     border: "1px solid #e6dce4",
//                   }}
//                 >
//                   <Typography
//                     variant="subtitle1"
//                     fontWeight={700}
//                     color={BRAND_PRIMARY}
//                     sx={{ mb: 2 }}
//                   >
//                     1. Basic Details & Category Tags
//                   </Typography>

//                   <Grid container spacing={2.5}>
//                     <Grid size={{ xs: 12, md: 5 }}>
//                       <TextField
//                         fullWidth
//                         label="Product Name"
//                         value={name}
//                         onChange={(e) => setName(e.target.value)}
//                       />
//                     </Grid>

//                     <Grid size={{ xs: 12, md: 3 }}>
//                       <TextField
//                         fullWidth
//                         type="number"
//                         label="Price"
//                         value={price}
//                         onChange={(e) => setPrice(e.target.value)}
//                         InputProps={{
//                           startAdornment: (
//                             <InputAdornment position="start">
//                               <RupeeIcon fontSize="small" />
//                             </InputAdornment>
//                           ),
//                         }}
//                       />
//                     </Grid>

//                     <Grid size={{ xs: 12, md: 4 }}>
//                       <Autocomplete
//                         multiple
//                         options={decorationCategories}
//                         disableCloseOnSelect
//                         getOptionLabel={(option) => option.name || ""}
//                         value={selectedTagObjects}
//                         onChange={(_, newValue) => {
//                           setSelectedTags(newValue.map((item) => item._id));
//                         }}
//                         renderOption={(props, option, { selected }) => {
//                           const { key, ...optionProps } = props;
//                           return (
//                             <li key={option._id} {...optionProps}>
//                               <Checkbox
//                                 checked={selected}
//                                 sx={{
//                                   mr: 1,
//                                   color: BRAND_PRIMARY,
//                                   "&.Mui-checked": { color: BRAND_PRIMARY },
//                                 }}
//                               />
//                               {option.name}
//                             </li>
//                           );
//                         }}
//                         renderTags={(tagValue, getTagProps) =>
//                           tagValue.map((option, index) => {
//                             const { key, ...tagProps } = getTagProps({ index });
//                             return (
//                               <Chip
//                                 key={option._id}
//                                 label={option.name}
//                                 size="small"
//                                 sx={{
//                                   bgcolor: BRAND_LIGHT_BG,
//                                   color: BRAND_PRIMARY,
//                                   border: `1px solid ${BRAND_PRIMARY}40`,
//                                 }}
//                                 {...tagProps}
//                               />
//                             );
//                           })
//                         }
//                         renderInput={(params) => (
//                           <TextField
//                             {...params}
//                             label="Category Tags"
//                             placeholder="Select tags"
//                           />
//                         )}
//                       />
//                     </Grid>
//                   </Grid>
//                 </Paper>

//                 {/* 2. MEDIA GALLERY (EXISTING + NEW IMAGES & VIDEOS) */}
//                 <Paper
//                   elevation={0}
//                   sx={{
//                     p: 2.5,
//                     borderRadius: 2.5,
//                     border: "1px solid #e6dce4",
//                   }}
//                 >
//                   <Stack
//                     direction="row"
//                     justifyContent="space-between"
//                     alignItems="center"
//                     sx={{ mb: 2 }}
//                   >
//                     <Box>
//                       <Typography
//                         variant="subtitle1"
//                         fontWeight={700}
//                         color={BRAND_PRIMARY}
//                       >
//                         2. Product Media (Images & Videos)
//                       </Typography>
//                       <Typography variant="caption" color="text.secondary">
//                         Manage existing media or upload new images/videos (Max 10 total).
//                       </Typography>
//                     </Box>
//                     <Chip
//                       label={`${existingImages.length + newImages.length} / 10 Files`}
//                       size="small"
//                       sx={{
//                         bgcolor: BRAND_LIGHT_BG,
//                         color: BRAND_PRIMARY,
//                         fontWeight: 600,
//                       }}
//                     />
//                   </Stack>

//                   {/* Upload Trigger */}
//                   <Box
//                     onClick={() => fileInputRef.current?.click()}
//                     sx={{
//                       border: `2px dashed ${BRAND_PRIMARY}66`,
//                       borderRadius: 2,
//                       bgcolor: BRAND_LIGHT_BG,
//                       p: 2.5,
//                       textAlign: "center",
//                       cursor: "pointer",
//                       "&:hover": {
//                         borderColor: BRAND_PRIMARY,
//                         bgcolor: "#f7eaf5",
//                       },
//                     }}
//                   >
//                     <CloudUploadIcon
//                       sx={{ fontSize: 34, color: BRAND_PRIMARY, mb: 0.5 }}
//                     />
//                     <Typography variant="body2" fontWeight={600} color="#2b1329">
//                       Click to Add More Images or Videos
//                     </Typography>
//                     <Typography variant="caption" color="text.secondary">
//                       Supports JPG, PNG, WEBP, MP4, MOV, WEBM
//                     </Typography>
//                     <input
//                       ref={fileInputRef}
//                       type="file"
//                       multiple
//                       accept="image/*,video/*"
//                       style={{ display: "none" }}
//                       onChange={handleMediaChange}
//                     />
//                   </Box>

//                   {/* Existing + New Media Grid */}
//                   {(existingImages.length > 0 || newImages.length > 0) && (
//                     <Grid container spacing={2} sx={{ mt: 1.5 }}>
//                       {/* EXISTING MEDIA */}
//                       {existingImages.map((img) => {
//                         const isVid = isVideoMedia(img);
//                         const src = getExistingMediaUrl(img);
//                         return (
//                           <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={img.fileName}>
//                             <Card
//                               variant="outlined"
//                               sx={{
//                                 borderRadius: 2,
//                                 overflow: "hidden",
//                                 borderColor: "#dfd2dc",
//                               }}
//                             >
//                               <Box
//                                 sx={{
//                                   height: 145,
//                                   bgcolor: "#141414",
//                                   position: "relative",
//                                 }}
//                               >
//                                 {isVid ? (
//                                   <video
//                                     src={src}
//                                     muted
//                                     loop
//                                     playsInline
//                                     onMouseEnter={(e) => e.target.play()}
//                                     onMouseLeave={(e) => e.target.pause()}
//                                     style={{
//                                       width: "100%",
//                                       height: "100%",
//                                       objectFit: "cover",
//                                     }}
//                                   />
//                                 ) : (
//                                   <img
//                                     src={src}
//                                     alt={img.fileName}
//                                     style={{
//                                       width: "100%",
//                                       height: "100%",
//                                       objectFit: "cover",
//                                     }}
//                                   />
//                                 )}

//                                 <Chip
//                                   icon={
//                                     isVid ? (
//                                       <VideocamIcon
//                                         sx={{
//                                           fontSize: 13,
//                                           color: "#fff !important",
//                                         }}
//                                       />
//                                     ) : (
//                                       <ImageIcon
//                                         sx={{
//                                           fontSize: 13,
//                                           color: "#fff !important",
//                                         }}
//                                       />
//                                     )
//                                   }
//                                   label={isVid ? "VIDEO" : "SAVED"}
//                                   size="small"
//                                   sx={{
//                                     position: "absolute",
//                                     top: 6,
//                                     left: 6,
//                                     height: 20,
//                                     fontSize: "0.65rem",
//                                     fontWeight: 700,
//                                     bgcolor: isVid
//                                       ? "rgba(146, 66, 134, 0.92)"
//                                       : "rgba(0, 0, 0, 0.65)",
//                                     color: "#fff",
//                                   }}
//                                 />

//                                 <Tooltip title="Remove existing file">
//                                   <IconButton
//                                     size="small"
//                                     onClick={() => removeExistingImage(img)}
//                                     sx={{
//                                       position: "absolute",
//                                       top: 5,
//                                       right: 5,
//                                       bgcolor: "rgba(255,255,255,0.9)",
//                                       color: "#d32f2f",
//                                       "&:hover": { bgcolor: "#fff" },
//                                     }}
//                                   >
//                                     <DeleteIcon fontSize="small" />
//                                   </IconButton>
//                                 </Tooltip>
//                               </Box>
//                               <Box sx={{ px: 1, py: 0.6, bgcolor: "#fff" }}>
//                                 <Typography
//                                   variant="caption"
//                                   noWrap
//                                   display="block"
//                                   color="text.secondary"
//                                 >
//                                   {img.fileName}
//                                 </Typography>
//                               </Box>
//                             </Card>
//                           </Grid>
//                         );
//                       })}

//                       {/* NEWLY ADDED MEDIA */}
//                       {newImages.map((item, index) => (
//                         <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={`new-${index}`}>
//                           <Card
//                             variant="outlined"
//                             sx={{
//                               borderRadius: 2,
//                               overflow: "hidden",
//                               borderColor: BRAND_PRIMARY,
//                             }}
//                           >
//                             <Box
//                               sx={{
//                                 height: 145,
//                                 bgcolor: "#141414",
//                                 position: "relative",
//                               }}
//                             >
//                               {item.isVideo ? (
//                                 <video
//                                   src={item.preview}
//                                   muted
//                                   loop
//                                   playsInline
//                                   onMouseEnter={(e) => e.target.play()}
//                                   onMouseLeave={(e) => e.target.pause()}
//                                   style={{
//                                     width: "100%",
//                                     height: "100%",
//                                     objectFit: "cover",
//                                   }}
//                                 />
//                               ) : (
//                                 <img
//                                   src={item.preview}
//                                   alt="New upload"
//                                   style={{
//                                     width: "100%",
//                                     height: "100%",
//                                     objectFit: "cover",
//                                   }}
//                                 />
//                               )}

//                               <Chip
//                                 label={item.isVideo ? "NEW VIDEO" : "NEW IMG"}
//                                 size="small"
//                                 sx={{
//                                   position: "absolute",
//                                   top: 6,
//                                   left: 6,
//                                   height: 20,
//                                   fontSize: "0.65rem",
//                                   fontWeight: 700,
//                                   bgcolor: "#2e7d32",
//                                   color: "#fff",
//                                 }}
//                               />

//                               <Tooltip title="Remove new file">
//                                 <IconButton
//                                   size="small"
//                                   onClick={() => removeNewImage(index)}
//                                   sx={{
//                                     position: "absolute",
//                                     top: 5,
//                                     right: 5,
//                                     bgcolor: "rgba(255,255,255,0.9)",
//                                     color: "#d32f2f",
//                                     "&:hover": { bgcolor: "#fff" },
//                                   }}
//                                 >
//                                   <DeleteIcon fontSize="small" />
//                                 </IconButton>
//                               </Tooltip>
//                             </Box>
//                             <Box sx={{ px: 1, py: 0.6, bgcolor: "#fff" }}>
//                               <Typography
//                                 variant="caption"
//                                 noWrap
//                                 display="block"
//                                 color="text.secondary"
//                               >
//                                 {item.file.name}
//                               </Typography>
//                             </Box>
//                           </Card>
//                         </Grid>
//                       ))}
//                     </Grid>
//                   )}
//                 </Paper>

//                 {/* 3. DESIGN TYPE CHECKLIST */}
//                 <Paper
//                   elevation={0}
//                   sx={{
//                     p: 2.5,
//                     borderRadius: 2.5,
//                     border: "1px solid #e6dce4",
//                   }}
//                 >
//                   <Typography
//                     variant="subtitle1"
//                     fontWeight={700}
//                     color={BRAND_PRIMARY}
//                     sx={{ mb: 1.5 }}
//                   >
//                     3. Design Type Classification
//                   </Typography>
//                   <CheckboxGroup
//                     key="designType"
//                     title="Explain the type of design"
//                     items={designTypeOptions}
//                     section="designType"
//                     checklist={callChecklist}
//                     onChange={handleCheckboxChange}
//                   />
//                 </Paper>

//                 {/* 4. INCLUSION & PRICING BUILDER */}
//                 <Paper
//                   elevation={0}
//                   sx={{
//                     p: 2.5,
//                     borderRadius: 2.5,
//                     border: "1px solid #e6dce4",
//                   }}
//                 >
//                   <Stack
//                     direction={{ xs: "column", sm: "row" }}
//                     justifyContent="space-between"
//                     alignItems={{ xs: "flex-start", sm: "center" }}
//                     spacing={1.5}
//                     sx={{ mb: 2 }}
//                   >
//                     <Typography
//                       variant="subtitle1"
//                       fontWeight={700}
//                       color={BRAND_PRIMARY}
//                     >
//                       4. Inclusions & Pricing Configuration
//                     </Typography>

//                     <FormControl component="fieldset">
//                       <RadioGroup
//                         row
//                         value={mode}
//                         onChange={(e) => setMode(e.target.value)}
//                       >
//                         <FormControlLabel
//                           value="Option1"
//                           control={
//                             <Radio
//                               sx={{
//                                 color: BRAND_PRIMARY,
//                                 "&.Mui-checked": { color: BRAND_PRIMARY },
//                               }}
//                             />
//                           }
//                           label="Option 1 (Material Builder)"
//                         />
//                         <FormControlLabel
//                           value="Option2"
//                           control={
//                             <Radio
//                               sx={{
//                                 color: BRAND_PRIMARY,
//                                 "&.Mui-checked": { color: BRAND_PRIMARY },
//                               }}
//                             />
//                           }
//                           label="Option 2 (Manual Text)"
//                         />
//                       </RadioGroup>
//                     </FormControl>
//                   </Stack>

//                   <Divider sx={{ mb: 2.5 }} />

//                   {mode === "Option1" ? (
//                     <Box>
//                       <Stack
//                         direction="row"
//                         justifyContent="space-between"
//                         alignItems="center"
//                         sx={{ mb: 2 }}
//                       >
//                         <Typography variant="body2" fontWeight={600}>
//                           Material Inclusions ({inclusions.length})
//                         </Typography>
//                         <Button
//                           variant="outlined"
//                           size="small"
//                           startIcon={<AddIcon />}
//                           onClick={handleAddInclusion}
//                           sx={{
//                             borderColor: BRAND_PRIMARY,
//                             color: BRAND_PRIMARY,
//                             textTransform: "none",
//                             fontWeight: 600,
//                             "&:hover": {
//                               borderColor: BRAND_DARK,
//                               bgcolor: BRAND_LIGHT_BG,
//                             },
//                           }}
//                         >
//                           + Add Inclusion
//                         </Button>
//                       </Stack>

//                       <Stack spacing={2}>
//                         {inclusions.map((inc, idx) => {
//                           const filteredTypes = getFilteredTypes(inc.specs);
//                           const filteredMaterials = getFilteredMaterials(
//                             inc.specs,
//                             inc.type
//                           );

//                           return (
//                             <Card
//                               key={inc.id}
//                               variant="outlined"
//                               sx={{
//                                 borderRadius: 2,
//                                 borderColor: inc.matchedRow
//                                   ? "#c8e6c9"
//                                   : "#e2d7e0",
//                                 bgcolor: "#fafafa",
//                               }}
//                             >
//                               <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
//                                 <Stack
//                                   direction="row"
//                                   justifyContent="space-between"
//                                   alignItems="center"
//                                   sx={{ mb: 1.5 }}
//                                 >
//                                   <Stack
//                                     direction="row"
//                                     spacing={1}
//                                     alignItems="center"
//                                   >
//                                     <Typography
//                                       variant="caption"
//                                       fontWeight={700}
//                                     >
//                                       Item #{idx + 1}
//                                     </Typography>
//                                     <Chip
//                                       size="small"
//                                       icon={
//                                         inc.matchedRow ? (
//                                           <CheckCircleIcon />
//                                         ) : (
//                                           <CancelIcon />
//                                         )
//                                       }
//                                       label={
//                                         inc.matchedRow
//                                           ? "Matched"
//                                           : "Not Matched"
//                                       }
//                                       color={
//                                         inc.matchedRow ? "success" : "error"
//                                       }
//                                       variant="outlined"
//                                       sx={{ height: 22, fontSize: "0.72rem" }}
//                                     />
//                                   </Stack>

//                                   <Button
//                                     size="small"
//                                     color="error"
//                                     startIcon={<DeleteIcon />}
//                                     disabled={inclusions.length === 1}
//                                     onClick={() => handleRemoveInclusion(inc.id)}
//                                     sx={{ textTransform: "none" }}
//                                   >
//                                     Remove
//                                   </Button>
//                                 </Stack>

//                                 <Grid container spacing={1.5}>
//                                   <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
//                                     <FormControl
//                                       fullWidth
//                                       size="small"
//                                       sx={{ bgcolor: "#fff" }}
//                                     >
//                                       <InputLabel>Specs</InputLabel>
//                                       <Select
//                                         label="Specs"
//                                         value={inc.specs}
//                                         onChange={(e) =>
//                                           handleSelectChangeInc(
//                                             inc.id,
//                                             "specs",
//                                             e.target.value
//                                           )
//                                         }
//                                       >
//                                         <MenuItem value="">
//                                           <em>Select Specs</em>
//                                         </MenuItem>
//                                         {options.specs.map((o, i) => (
//                                           <MenuItem key={i} value={o}>
//                                             {o}
//                                           </MenuItem>
//                                         ))}
//                                       </Select>
//                                     </FormControl>
//                                   </Grid>

//                                   <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
//                                     <FormControl
//                                       fullWidth
//                                       size="small"
//                                       sx={{ bgcolor: "#fff" }}
//                                     >
//                                       <InputLabel>Type</InputLabel>
//                                       <Select
//                                         label="Type"
//                                         value={inc.type}
//                                         onChange={(e) =>
//                                           handleSelectChangeInc(
//                                             inc.id,
//                                             "type",
//                                             e.target.value
//                                           )
//                                         }
//                                       >
//                                         <MenuItem value="">
//                                           <em>Select Type</em>
//                                         </MenuItem>
//                                         {filteredTypes?.map((o, i) => (
//                                           <MenuItem key={i} value={o}>
//                                             {o}
//                                           </MenuItem>
//                                         ))}
//                                       </Select>
//                                     </FormControl>
//                                   </Grid>

//                                   <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
//                                     <FormControl
//                                       fullWidth
//                                       size="small"
//                                       sx={{ bgcolor: "#fff" }}
//                                     >
//                                       <InputLabel>Material</InputLabel>
//                                       <Select
//                                         label="Material"
//                                         value={inc.material}
//                                         onChange={(e) =>
//                                           handleSelectChangeInc(
//                                             inc.id,
//                                             "material",
//                                             e.target.value
//                                           )
//                                         }
//                                       >
//                                         <MenuItem value="">
//                                           <em>Select Material</em>
//                                         </MenuItem>
//                                         {filteredMaterials?.map((o, i) => (
//                                           <MenuItem key={i} value={o}>
//                                             {o}
//                                           </MenuItem>
//                                         ))}
//                                       </Select>
//                                     </FormControl>
//                                   </Grid>

//                                   <Grid size={{ xs: 6, sm: 4, md: 1.6 }}>
//                                     <TextField
//                                       fullWidth
//                                       size="small"
//                                       label="Category"
//                                       value={inc.rentedConsumable}
//                                       InputProps={{ readOnly: true }}
//                                       sx={{ bgcolor: "#f0f0f0" }}
//                                     />
//                                   </Grid>

//                                   <Grid size={{ xs: 6, sm: 4, md: 1.2 }}>
//                                     <TextField
//                                       fullWidth
//                                       size="small"
//                                       label="MOQ"
//                                       value={inc.moq}
//                                       InputProps={{ readOnly: true }}
//                                       sx={{ bgcolor: "#f0f0f0" }}
//                                     />
//                                   </Grid>

//                                   {inc.rentedConsumable === "Consumable" && (
//                                     <Grid size={{ xs: 6, sm: 4, md: 1 }}>
//                                       <TextField
//                                         fullWidth
//                                         size="small"
//                                         type="number"
//                                         label="Qty"
//                                         value={inc.customQuantity}
//                                         onChange={(e) =>
//                                           handleCustomQuantityChange(
//                                             inc.id,
//                                             e.target.value
//                                           )
//                                         }
//                                         sx={{ bgcolor: "#fff" }}
//                                       />
//                                     </Grid>
//                                   )}

//                                   <Grid
//                                     size={{
//                                       xs: 6,
//                                       sm: 4,
//                                       md:
//                                         inc.rentedConsumable === "Consumable"
//                                           ? 1
//                                           : 2,
//                                     }}
//                                   >
//                                     <TextField
//                                       fullWidth
//                                       size="small"
//                                       type="number"
//                                       label="Price (₹)"
//                                       value={inc.price}
//                                       onChange={(e) =>
//                                         handlePriceChange(inc.id, e.target.value)
//                                       }
//                                       sx={{ bgcolor: "#fff" }}
//                                     />
//                                   </Grid>

//                                   <Grid size={{ xs: 12 }}>
//                                     <TextField
//                                       fullWidth
//                                       size="small"
//                                       label="Preview Text (Editable)"
//                                       value={inc.previewText}
//                                       onChange={(e) =>
//                                         handlePreviewChange(
//                                           inc.id,
//                                           e.target.value
//                                         )
//                                       }
//                                       sx={{ bgcolor: "#fff" }}
//                                     />
//                                   </Grid>
//                                 </Grid>
//                               </CardContent>
//                             </Card>
//                           );
//                         })}
//                       </Stack>

//                       {/* Pricing Summary Box */}
//                       <Paper
//                         variant="outlined"
//                         sx={{
//                           mt: 2.5,
//                           p: 2,
//                           borderRadius: 2,
//                           bgcolor: BRAND_LIGHT_BG,
//                           borderColor: `${BRAND_PRIMARY}40`,
//                         }}
//                       >
//                         <Grid container spacing={2} alignItems="center">
//                           <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
//                             <Typography variant="caption" color="text.secondary">
//                               Hora Vendor Material Price
//                             </Typography>
//                             <Typography variant="subtitle1" fontWeight={700}>
//                               ₹{totalPrice.toFixed(2)}
//                             </Typography>
//                           </Grid>

//                           <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
//                             <TextField
//                               fullWidth
//                               size="small"
//                               type="number"
//                               label="Execution Price"
//                               value={executionPrice}
//                               onChange={(e) =>
//                                 setExecutionPrice(
//                                   parseFloat(e.target.value) || 0
//                                 )
//                               }
//                               sx={{ bgcolor: "#fff" }}
//                             />
//                           </Grid>

//                           <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
//                             <TextField
//                               fullWidth
//                               size="small"
//                               type="number"
//                               label="Advance %"
//                               placeholder="e.g. 20"
//                               value={advancePercent}
//                               onChange={(e) =>
//                                 setAdvancePercent(
//                                   parseFloat(e.target.value) || 0
//                                 )
//                               }
//                               sx={{ bgcolor: "#fff" }}
//                             />
//                           </Grid>

//                           <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
//                             <Typography variant="caption" color="text.secondary">
//                               Customer Price
//                             </Typography>
//                             <Typography
//                               variant="subtitle1"
//                               fontWeight={700}
//                               color={
//                                 calculatedCustomerPrice === null
//                                   ? "error.main"
//                                   : BRAND_PRIMARY
//                               }
//                             >
//                               {calculatedCustomerPrice === null
//                                 ? "Invalid %"
//                                 : `₹${calculatedCustomerPrice.toFixed(2)}`}
//                             </Typography>
//                           </Grid>

//                           <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
//                             <Typography variant="caption" color="text.secondary">
//                               Advance Hora Amount
//                             </Typography>
//                             <Typography
//                               variant="subtitle1"
//                               fontWeight={700}
//                               color={
//                                 calculatedAdvanceAmount === null
//                                   ? "error.main"
//                                   : "success.main"
//                               }
//                             >
//                               {calculatedAdvanceAmount === null
//                                 ? "Invalid %"
//                                 : `₹${calculatedAdvanceAmount.toFixed(2)}`}
//                             </Typography>
//                           </Grid>
//                         </Grid>
//                       </Paper>

//                       {/* Inclusion Summary */}
//                       <Box sx={{ mt: 2.5 }}>
//                         <Stack
//                           direction="row"
//                           spacing={1}
//                           alignItems="center"
//                           sx={{ mb: 1 }}
//                         >
//                           <SummaryIcon
//                             fontSize="small"
//                             sx={{ color: BRAND_PRIMARY }}
//                           />
//                           <Typography variant="subtitle2" fontWeight={700}>
//                             Inclusion Summary
//                           </Typography>
//                         </Stack>
//                         <TextField
//                           fullWidth
//                           multiline
//                           rows={4}
//                           value={summaryText}
//                           InputProps={{
//                             readOnly: true,
//                             sx: { fontFamily: "monospace", bgcolor: "#fafafa" },
//                           }}
//                         />
//                       </Box>
//                     </Box>
//                   ) : (
//                     <Box>
//                       <Stack
//                         direction="row"
//                         spacing={1}
//                         alignItems="center"
//                         sx={{ mb: 1 }}
//                       >
//                         <SummaryIcon
//                           fontSize="small"
//                           sx={{ color: BRAND_PRIMARY }}
//                         />
//                         <Typography variant="subtitle2" fontWeight={700}>
//                           Product Inclusion (Each line becomes a bullet item)
//                         </Typography>
//                       </Stack>
//                       <TextField
//                         fullWidth
//                         multiline
//                         rows={6}
//                         value={option2Text}
//                         onChange={(e) => setOption2Text(e.target.value)}
//                         placeholder="Enter your text here..."
//                         InputProps={{
//                           sx: { fontFamily: "monospace", bgcolor: "#fafafa" },
//                         }}
//                       />
//                     </Box>
//                   )}
//                 </Paper>
//               </Stack>
//             </DialogContent>

//             <DialogActions
//               sx={{
//                 px: 3,
//                 py: 2,
//                 bgcolor: "#fff",
//                 borderTop: "1px solid #e6dce4",
//               }}
//             >
//               <Button
//                 variant="outlined"
//                 onClick={handlePopupClose}
//                 disabled={saving}
//                 sx={{
//                   borderColor: "#ccc",
//                   color: "#555",
//                   textTransform: "none",
//                   px: 3,
//                 }}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 variant="contained"
//                 startIcon={
//                   saving ? (
//                     <CircularProgress size={16} color="inherit" />
//                   ) : (
//                     <SaveIcon />
//                   )
//                 }
//                 disabled={saving}
//                 onClick={handleSaveChanges}
//                 sx={{
//                   bgcolor: BRAND_PRIMARY,
//                   "&:hover": { bgcolor: BRAND_DARK },
//                   textTransform: "none",
//                   fontWeight: 600,
//                   px: 3.5,
//                   borderRadius: 2,
//                 }}
//               >
//                 {saving ? "Saving Changes..." : "Save Changes"}
//               </Button>
//             </DialogActions>
//           </>
//         )}
//       </Dialog>
//     </Box>
//   );
// };

// export default DecorationEditor;



























"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Slider,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Edit as EditIcon,
  Search as SearchIcon,
  CloudUpload as CloudUploadIcon,
  DeleteOutline as DeleteIcon,
  AddCircleOutline as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Videocam as VideocamIcon,
  Image as ImageIcon,
  ReceiptLong as SummaryIcon,
  CurrencyRupee as RupeeIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Crop as CropIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as ResetIcon,
  OpenWith as PanIcon,
} from "@mui/icons-material";

import {
  BASE_URL,
  EDIT_DECORATION_PRODUCT,
  GET_MATERIAL_FILTER_DATA,
  PRODUCT_MEAL_TYPE,
} from "../../../utils/apiconstant";
import CheckboxGroup from "@/app/component/CheckboxGroup";

const BRAND_PRIMARY = "#924286";
const BRAND_DARK = "#733069";
const BRAND_LIGHT_BG = "#fcf6fb";

// Fixed Crop Grid Dimensions (Max 480x470)
const CROP_MAX_WIDTH = 480;
const CROP_MAX_HEIGHT = 470;
const CROP_ASPECT = CROP_MAX_WIDTH / CROP_MAX_HEIGHT;

const isVideoMedia = (media) => {
  if (!media) return false;
  if (typeof media === "object" && media.mediaType === "video") return true;
  const name =
    typeof media === "string" ? media : media.fileName || media.url || "";
  return /\.(mp4|webm|ogg|mov|mkv|avi)$/i.test(name);
};

const getExistingMediaUrl = (media) => {
  if (!media) return "";
  const fileName = typeof media === "string" ? media : media.fileName;
  if (!fileName) return "";
  if (/^https?:\/\//i.test(fileName)) return fileName;

  if (isVideoMedia(media)) {
    return `${BASE_URL}/api/uploads/compressed_videos/${fileName}`;
  }
  return `${BASE_URL}/api/uploads/compressed_webp/${fileName.split(".")[0]}.webp`;
};

// ============================================================================
// INTERACTIVE FIXED-GRID IMAGE CROPPER DIALOG (480x470 Aspect Ratio)
// ============================================================================
const ImageCropModal = ({
  open,
  imageSrc,
  fileName,
  queueProgress,
  onCancel,
  onConfirm,
}) => {
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [frameSize, setFrameSize] = useState({
    width: CROP_MAX_WIDTH,
    height: CROP_MAX_HEIGHT,
  });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!open) return;
    const updateFrame = () => {
      const availableW = Math.min(CROP_MAX_WIDTH, window.innerWidth - 64);
      const calculatedH = Math.round(availableW / CROP_ASPECT);
      setFrameSize({ width: availableW, height: calculatedH });
    };
    updateFrame();
    window.addEventListener("resize", updateFrame);
    return () => window.removeEventListener("resize", updateFrame);
  }, [open]);

  useEffect(() => {
    if (open) {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    }
  }, [open, imageSrc]);

  const getCoverDimensions = useCallback(
    (natW, natH, frmW, frmH, currentZoom) => {
      if (!natW || !natH || !frmW || !frmH) {
        return { baseW: frmW, baseH: frmH, scaledW: frmW, scaledH: frmH };
      }
      const scaleCover = Math.max(frmW / natW, frmH / natH);
      const baseW = natW * scaleCover;
      const baseH = natH * scaleCover;
      return {
        baseW,
        baseH,
        scaledW: baseW * currentZoom,
        scaledH: baseH * currentZoom,
      };
    },
    []
  );

  const clampOffset = useCallback(
    (nextX, nextY, currentZoom) => {
      const { scaledW, scaledH } = getCoverDimensions(
        naturalSize.width,
        naturalSize.height,
        frameSize.width,
        frameSize.height,
        currentZoom
      );
      const maxOffsetX = Math.max(0, (scaledW - frameSize.width) / 2);
      const maxOffsetY = Math.max(0, (scaledH - frameSize.height) / 2);

      return {
        x: Math.min(maxOffsetX, Math.max(-maxOffsetX, nextX)),
        y: Math.min(maxOffsetY, Math.max(-maxOffsetY, nextY)),
      };
    },
    [naturalSize, frameSize, getCoverDimensions]
  );

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setNaturalSize({ width: naturalWidth, height: naturalHeight });
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleZoomChange = (newZoom) => {
    const clampedZoom = Math.min(3.5, Math.max(1, Number(newZoom)));
    setZoom(clampedZoom);
    setOffset((prev) => clampOffset(prev.x, prev.y, clampedZoom));
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    dragStartRef.current = { x: clientX - offset.x, y: clientY - offset.y };
  };

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const rawX = clientX - dragStartRef.current.x;
      const rawY = clientY - dragStartRef.current.y;
      setOffset(clampOffset(rawX, rawY, zoom));
    },
    [isDragging, clampOffset, zoom]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp);
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.12 : -0.12;
    handleZoomChange(+(zoom + delta).toFixed(2));
  };

  const handleApplyCrop = () => {
    const imgEl = imgRef.current;
    if (!imgEl || !naturalSize.width) return;

    const { scaledW, scaledH } = getCoverDimensions(
      naturalSize.width,
      naturalSize.height,
      frameSize.width,
      frameSize.height,
      zoom
    );

    const imgLeftInFrame = (frameSize.width - scaledW) / 2 + offset.x;
    const imgTopInFrame = (frameSize.height - scaledH) / 2 + offset.y;

    const scaleToNaturalX = naturalSize.width / scaledW;
    const scaleToNaturalY = naturalSize.height / scaledH;

    const srcX = Math.max(0, -imgLeftInFrame * scaleToNaturalX);
    const srcY = Math.max(0, -imgTopInFrame * scaleToNaturalY);
    const srcW = Math.min(
      naturalSize.width - srcX,
      frameSize.width * scaleToNaturalX
    );
    const srcH = Math.min(
      naturalSize.height - srcY,
      frameSize.height * scaleToNaturalY
    );

    const exportScale = Math.min(2, srcW / CROP_MAX_WIDTH || 1);
    const outW = Math.round(CROP_MAX_WIDTH * Math.max(1, exportScale));
    const outH = Math.round(CROP_MAX_HEIGHT * Math.max(1, exportScale));

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(imgEl, srcX, srcY, srcW, srcH, 0, 0, outW, outH);

    const isPng = /\.png$/i.test(fileName || "");
    const mimeType = isPng ? "image/png" : "image/jpeg";
    const ext = isPng ? ".png" : ".jpg";
    const baseName = (fileName || "cropped-image").replace(/\.[^/.]+$/, "");

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], `${baseName}${ext}`, {
          type: mimeType,
          lastModified: Date.now(),
        });
        const previewUrl = URL.createObjectURL(blob);
        onConfirm(croppedFile, previewUrl);
      },
      mimeType,
      0.95
    );
  };

  const { scaledW, scaledH } = getCoverDimensions(
    naturalSize.width,
    naturalSize.height,
    frameSize.width,
    frameSize.height,
    zoom
  );

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      sx={{ zIndex: 1450 }}
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          bgcolor: BRAND_LIGHT_BG,
          borderBottom: "1px solid #e6dce4",
          py: 1.8,
          px: 3,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <CropIcon sx={{ color: BRAND_PRIMARY }} />
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="#1e1420">
                Crop Product Image
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Fixed Grid: 480 × 470 px • Drag image to position & zoom
              </Typography>
            </Box>
          </Stack>
          {queueProgress && (
            <Chip
              label={queueProgress}
              size="small"
              sx={{
                bgcolor: BRAND_PRIMARY,
                color: "#fff",
                fontWeight: 700,
              }}
            />
          )}
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          bgcolor: "#141116",
        }}
      >
        <Box
          ref={containerRef}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          onWheel={handleWheel}
          sx={{
            position: "relative",
            width: frameSize.width,
            height: frameSize.height,
            overflow: "hidden",
            borderRadius: 2,
            border: `2px solid ${BRAND_PRIMARY}`,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55)",
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: "none",
            touchAction: "none",
            bgcolor: "#000",
          }}
        >
          {imageSrc && (
            <img
              ref={imgRef}
              src={imageSrc}
              crossOrigin="anonymous"
              alt="Crop target"
              onLoad={handleImageLoad}
              draggable={false}
              style={{
                position: "absolute",
                width: `${scaledW}px`,
                height: `${scaledH}px`,
                left: `${(frameSize.width - scaledW) / 2 + offset.x}px`,
                top: `${(frameSize.height - scaledH) / 2 + offset.y}px`,
                maxWidth: "none",
                pointerEvents: "none",
              }}
            />
          )}

          {/* Fixed Rule-of-Thirds Grid */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              border: "1px solid rgba(255,255,255,0.45)",
              "&::before": {
                content: '""',
                position: "absolute",
                top: "33.33%",
                bottom: "33.33%",
                left: 0,
                right: 0,
                borderTop: "1px dashed rgba(255,255,255,0.45)",
                borderBottom: "1px dashed rgba(255,255,255,0.45)",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                left: "33.33%",
                right: "33.33%",
                top: 0,
                bottom: 0,
                borderLeft: "1px dashed rgba(255,255,255,0.45)",
                borderRight: "1px dashed rgba(255,255,255,0.45)",
              },
            }}
          />

          <Chip
            icon={<PanIcon sx={{ fontSize: 14, color: "#fff !important" }} />}
            label="Drag to adjust"
            size="small"
            sx={{
              position: "absolute",
              bottom: 10,
              left: "50%",
              transform: "translateX(-50%)",
              bgcolor: "rgba(0,0,0,0.65)",
              color: "#fff",
              fontSize: "0.7rem",
              pointerEvents: "none",
            }}
          />
        </Box>

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ width: "100%", maxWidth: frameSize.width, mt: 2.5, px: 1 }}
        >
          <IconButton
            size="small"
            onClick={() => handleZoomChange(+(zoom - 0.15).toFixed(2))}
            disabled={zoom <= 1}
            sx={{ color: "#fff" }}
          >
            <ZoomOutIcon />
          </IconButton>

          <Slider
            value={zoom}
            min={1}
            max={3.5}
            step={0.05}
            onChange={(_, val) => handleZoomChange(val)}
            sx={{
              color: BRAND_PRIMARY,
              "& .MuiSlider-thumb": { bgcolor: "#fff" },
            }}
          />

          <IconButton
            size="small"
            onClick={() => handleZoomChange(+(zoom + 0.15).toFixed(2))}
            disabled={zoom >= 3.5}
            sx={{ color: "#fff" }}
          >
            <ZoomInIcon />
          </IconButton>

          <Tooltip title="Reset Zoom & Position">
            <IconButton
              size="small"
              onClick={() => {
                setZoom(1);
                setOffset({ x: 0, y: 0 });
              }}
              sx={{ color: "#ccc" }}
            >
              <ResetIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 1.8,
          bgcolor: "#fff",
          borderTop: "1px solid #e6dce4",
        }}
      >
        <Button
          onClick={onCancel}
          sx={{ color: "#666", textTransform: "none", fontWeight: 600 }}
        >
          Skip / Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<CropIcon />}
          onClick={handleApplyCrop}
          sx={{
            bgcolor: BRAND_PRIMARY,
            "&:hover": { bgcolor: BRAND_DARK },
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            borderRadius: 2,
          }}
        >
          Crop & Save Image
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================================================
// MAIN DECORATION EDITOR COMPONENT
// ============================================================================
const DecorationEditor = () => {
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [responseData, setResponseData] = useState([]);
  const [popupData, setPopupData] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mealProductTypes, setMealProductTypes] = useState([]);
  const [mode, setMode] = useState("Option2");
  const [data, setData] = useState([]);
  const [options, setOptions] = useState({
    specs: [],
    type: [],
    material: [],
  });

  // Media States (Images + Videos)
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]); // { file, preview, originalUrl, originalName, isVideo }
  const [removedImages, setRemovedImages] = useState([]);
  const fileInputRef = useRef(null);

  // Cropper States (New upload queue + Re-crop new image + Re-crop existing saved image)
  const [cropQueue, setCropQueue] = useState([]); // [{ originalFile, originalUrl }]
  const [cropTotalCount, setCropTotalCount] = useState(0);
  const [editingNewIndex, setEditingNewIndex] = useState(null);
  const [editingExistingTarget, setEditingExistingTarget] = useState(null); // { imgObj, blobUrl }
  const [loadingExistingCrop, setLoadingExistingCrop] = useState(false);

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
    designType: {},
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const showToast = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

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
    "On Wall",
    "Personalized Flex On Wall",
    "On Ring",
    "Ring + Personalised Flex",
    "Sequins Design",
    "U Shape Stand",
    "U stand + Personalized flex",
    "U Shape Wooden stand",
    "Canopy",
    "Personalized Flex on Stand",
    "Multi - Panel Backdrop",
    "On Square Stand",
    "Car Decor",
    "Entry Arch",
  ];

  const getDefaultDesignType = (designData = {}) => {
    const result = {};
    designTypeOptions.forEach((item) => {
      result[item] = designData?.[item] || false;
    });
    return result;
  };

  const handleSelectChange = async (event) => {
    const subCategory = event.target.value;
    setSelectedSubCategory(subCategory);
    setLoading(true);

    if (subCategory) {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/meals/idByTag?tag=${encodeURIComponent(subCategory)}`
        );
        const result = res.data;

        if (result?.data?._id) {
          await fetchSecondAPI(result.data._id);
        } else {
          setResponseData([]);
        }
      } catch (error) {
        console.error("Error fetching _id:", error);
        showToast("Failed to load subcategory items", "error");
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
        const res = await axios.get(`${BASE_URL}${GET_MATERIAL_FILTER_DATA}`);
        const result = res.data;

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
      }
    };

    fetchMaterialFilterData();
  }, []);

  const buildPreviewText = (item) => {
    let previewText = `${item.specs || "-"} ${item.type || "-"} ${
      item.material || "-"
    }`;

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
              updated.customQuantity
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
          const firstMatch = data.find(
            (row) => row.value === updated.specs && row.type === value
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
              updated.customQuantity
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
              row.material === value
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
              updated.customQuantity
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
      })
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
          value
        );

        updated.previewText = buildPreviewText(updated);
        return updated;
      })
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
    setNextId((prev) => prev + 1);
  };

  const handleRemoveInclusion = (id) => {
    if (inclusions.length > 1) {
      setInclusions((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const getFilteredTypes = (specs) => {
    if (!specs) return options.type;
    return [
      ...new Set(
        data
          .filter((row) => row.value === specs)
          .map((row) => row.type)
          .filter(Boolean)
      ),
    ];
  };

  const getFilteredMaterials = (specs, type) => {
    let filtered = data;
    if (specs) filtered = filtered.filter((row) => row.value === specs);
    if (type) filtered = filtered.filter((row) => row.type === type);
    return [...new Set(filtered.map((row) => row.material).filter(Boolean))];
  };

  const fetchSecondAPI = async (_id) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/Decoration/searchByTag/${_id}`
      );
      const resData = response.data;

      if (resData?.data) {
        setResponseData(resData.data);
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
      const response = await axios.post(url, body, {
        headers: { "Content-Type": "application/json" },
      });
      const resData = response.data;
      if (resData?.error === false && resData?.data) {
        setter(
          url.includes("admin_meals_list")
            ? resData.data.meal || []
            : resData.data.configuration || []
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handlePopupOpen = (item) => {
    setPopupData(item);
    setName(item.name || "");
    setPrice(item.price || "");
    setSelectedTags(item.tag || []);

    setExistingImages(item.featured_images || []);
    setNewImages([]);
    setRemovedImages([]);
    setCropQueue([]);
    setEditingNewIndex(null);
    setEditingExistingTarget(null);

    if (item.inclusionVariables && item.inclusionVariables.length > 0) {
      setMode("Option1");

      let mapped;
      if (typeof item?.inclusionVariables === "string") {
        mapped = JSON.parse(item?.inclusionVariables)?.map((inc, index) => ({
          ...inc,
          id: index + 1,
        }));
      } else {
        mapped = item.inclusionVariables.map((inc, index) => ({
          ...inc,
          id: inc.id || index + 1,
        }));
      }

      setInclusions(mapped);
      setNextId(mapped.length + 1);
    } else {
      setMode("Option2");

      const inclusionText = item.inclusion
        ?.map((i) => i.replace(/<[^>]*>/g, ""))
        .join("\n")
        .replace(/-\s*/g, "\n- ")
        .trim();

      setOption2Text(inclusionText || "");
    }
  };

  // =========================================================================
  // MEDIA UPLOAD & CROP HANDLERS (NEW + EXISTING IMAGES)
  // =========================================================================
  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const totalCurrent =
      existingImages.length + newImages.length + cropQueue.length;
    const allowedCount = Math.max(0, 10 - totalCurrent);
    const selected = files.slice(0, allowedCount);

    if (files.length > allowedCount) {
      showToast("Maximum 10 total media files allowed per product.", "warning");
    }

    const directVideos = [];
    const imagesToCrop = [];

    selected.forEach((file) => {
      const isVideo =
        file.type.startsWith("video/") ||
        /\.(mp4|webm|ogg|mov|mkv|avi)$/i.test(file.name);

      if (isVideo) {
        directVideos.push({
          file,
          preview: URL.createObjectURL(file),
          isVideo: true,
        });
      } else {
        imagesToCrop.push({
          originalFile: file,
          originalUrl: URL.createObjectURL(file),
        });
      }
    });

    if (directVideos.length > 0) {
      setNewImages((prev) => [...prev, ...directVideos]);
    }

    if (imagesToCrop.length > 0) {
      setEditingNewIndex(null);
      setEditingExistingTarget(null);
      setCropQueue((prev) => {
        const updated = [...prev, ...imagesToCrop];
        setCropTotalCount(updated.length);
        return updated;
      });
    }

    e.target.value = "";
  };

  // Open Cropper for an ALREADY SAVED image
  const handleRecropExistingImage = async (imgObj) => {
    if (isVideoMedia(imgObj)) return;
    const imageUrl = getExistingMediaUrl(imgObj);
    if (!imageUrl) return;

    try {
      setLoadingExistingCrop(true);
      // Fetch as blob to avoid CORS canvas taint issues when exporting cropped image
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      setEditingNewIndex(null);
      setEditingExistingTarget({
        imgObj,
        blobUrl,
      });
    } catch (err) {
      console.error("Failed to fetch image for cropping:", err);
      // Fallback to direct URL if fetch blocked
      setEditingNewIndex(null);
      setEditingExistingTarget({
        imgObj,
        blobUrl: imageUrl,
      });
    } finally {
      setLoadingExistingCrop(false);
    }
  };

  // Open Cropper for a NEWLY UPLOADED image
  const handleRecropNewImage = (index) => {
    const target = newImages[index];
    if (!target || target.isVideo) return;
    setEditingExistingTarget(null);
    setEditingNewIndex(index);
  };

  // Confirm Crop from Modal
  const handleConfirmCrop = (croppedFile, croppedPreviewUrl) => {
    // Case A: Re-cropped an already saved image -> mark old one removed, add cropped file to newImages
    if (editingExistingTarget) {
      const { imgObj, blobUrl } = editingExistingTarget;
      if (blobUrl && blobUrl.startsWith("blob:")) {
        URL.revokeObjectURL(blobUrl);
      }

      setRemovedImages((prev) => [...prev, imgObj]);
      setExistingImages((prev) =>
        prev.filter((i) => i.fileName !== imgObj.fileName)
      );

      setNewImages((prev) => [
        ...prev,
        {
          file: croppedFile,
          preview: croppedPreviewUrl,
          originalUrl: croppedPreviewUrl,
          originalName: imgObj.fileName,
          isVideo: false,
        },
      ]);

      setEditingExistingTarget(null);
      showToast("Saved image cropped! Click 'Save Changes' to apply.", "info");
      return;
    }

    // Case B: Re-cropped an image already inside newImages
    if (editingNewIndex !== null) {
      setNewImages((prev) =>
        prev.map((item, idx) => {
          if (idx !== editingNewIndex) return item;
          if (item.preview) URL.revokeObjectURL(item.preview);
          return {
            ...item,
            file: croppedFile,
            preview: croppedPreviewUrl,
          };
        })
      );
      setEditingNewIndex(null);
      return;
    }

    // Case C: Next image from fresh upload queue
    const currentQueueItem = cropQueue[0];
    if (currentQueueItem) {
      setNewImages((prev) => [
        ...prev,
        {
          file: croppedFile,
          preview: croppedPreviewUrl,
          originalUrl: currentQueueItem.originalUrl,
          originalName: currentQueueItem.originalFile.name,
          isVideo: false,
        },
      ]);
      setCropQueue((prev) => prev.slice(1));
    }
  };

  const handleCancelCrop = () => {
    if (editingExistingTarget) {
      if (
        editingExistingTarget.blobUrl &&
        editingExistingTarget.blobUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(editingExistingTarget.blobUrl);
      }
      setEditingExistingTarget(null);
      return;
    }

    if (editingNewIndex !== null) {
      setEditingNewIndex(null);
      return;
    }

    const currentQueueItem = cropQueue[0];
    if (currentQueueItem?.originalUrl) {
      URL.revokeObjectURL(currentQueueItem.originalUrl);
    }
    setCropQueue((prev) => prev.slice(1));
  };

  const removeExistingImage = (img) => {
    setRemovedImages((prev) => [...prev, img]);
    setExistingImages((prev) =>
      prev.filter((i) => i.fileName !== img.fileName)
    );
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => {
      const target = prev[index];
      if (target?.preview) URL.revokeObjectURL(target.preview);
      if (target?.originalUrl) URL.revokeObjectURL(target.originalUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handlePopupClose = () => {
    newImages.forEach((m) => {
      if (m.preview) URL.revokeObjectURL(m.preview);
      if (m.originalUrl) URL.revokeObjectURL(m.originalUrl);
    });
    cropQueue.forEach((q) => {
      if (q.originalUrl) URL.revokeObjectURL(q.originalUrl);
    });
    if (
      editingExistingTarget?.blobUrl &&
      editingExistingTarget.blobUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(editingExistingTarget.blobUrl);
    }

    setPopupData(null);
    setName("");
    setPrice("");
    setSelectedTags([]);
    setNewImages([]);
    setRemovedImages([]);
    setCropQueue([]);
    setEditingNewIndex(null);
    setEditingExistingTarget(null);
    setInclusions([]);
  };

  const handleSaveChanges = async () => {
    try {
      if (!name.trim()) {
        showToast("Product name is required", "error");
        return;
      }

      setSaving(true);
      const formData = new FormData();

      formData.append("_id", popupData._id);
      formData.append("name", name);
      formData.append("price", price);
      formData.append("tag", JSON.stringify(selectedTags));
      formData.append("designType", JSON.stringify(callChecklist.designType));

      // Unified NEW MEDIA (Cropped Images & Videos under `featured_images`)
      newImages.forEach((item) => {
        formData.append("featured_images", item.file);
      });

      // REMOVED MEDIA (Images & Videos)
      formData.append("removedImages", JSON.stringify(removedImages));

      if (mode === "Option1") {
        const formattedInclusion = [
          inclusions
            .filter((i) => i.previewText?.trim())
            .map((i) => `<div>-${i.previewText.trim()}</div>`)
            .join(""),
        ];

        formData.append("inclusionVariables", JSON.stringify(inclusions));
        formData.append("inclusion", JSON.stringify(formattedInclusion));
      } else {
        const formatted = [
          option2Text
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map(
              (line) =>
                `<div>${line.startsWith("-") ? line : `-${line}`}</div>`
            )
            .join(""),
        ];

        formData.append("inclusion", JSON.stringify(formatted));
      }

      const response = await axios.post(
        BASE_URL + EDIT_DECORATION_PRODUCT,
        formData
      );
      const result = response.data;

      if (result.error === false) {
        showToast(
          result.message || "Decoration updated successfully!",
          "success"
        );
        if (selectedSubCategory) {
          await handleSelectChange({
            target: { value: selectedSubCategory },
          });
        }
        handlePopupClose();
      } else {
        showToast(result.message || "Failed to update decoration", "error");
      }
    } catch (error) {
      console.error("Save error:", error);
      showToast(
        error?.response?.data?.message || "Error saving changes",
        "error"
      );
    } finally {
      setSaving(false);
    }
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

  const handleCheckboxChange = (section, item) => {
    setCallChecklist((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [item]: !prev[section]?.[item],
      },
    }));
  };

  useEffect(() => {
    if (popupData?.designType) {
      setCallChecklist((prev) => ({
        ...prev,
        designType: getDefaultDesignType(popupData.designType),
      }));
    } else {
      setCallChecklist((prev) => ({
        ...prev,
        designType: getDefaultDesignType(),
      }));
    }
  }, [popupData]);

  const handleToggleStatus = async (item) => {
    try {
      const newStatus = item.status === 1 ? 0 : 1;
      await axios.post(`${BASE_URL}/api/dish/update_decoration_status`, {
        id: item._id,
        status: newStatus,
      });

      setResponseData((prev) =>
        prev.map((row) =>
          row._id === item._id ? { ...row, status: newStatus } : row
        )
      );
      showToast(
        `Status updated to ${newStatus === 1 ? "Active" : "Inactive"}`,
        "success"
      );
    } catch (error) {
      console.error("Status toggle error:", error);
      showToast("Failed to update status", "error");
    }
  };

  const decorationCategories = mealProductTypes.filter((type) =>
    type.configurationId?.some((config) => config.name === "Decoration")
  );

  const selectedTagObjects = decorationCategories.filter((cat) =>
    selectedTags.includes(cat._id)
  );

  const filteredData = responseData.filter((item) => {
    const lowerQuery = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(lowerQuery) ||
      item._id.toLowerCase().includes(lowerQuery) ||
      item.tag?.some((tagId) => {
        const tag = mealProductTypes.find((t) => t._id === tagId);
        return tag?.name.toLowerCase().includes(lowerQuery);
      })
    );
  });

  const totalPrice = inclusions.reduce((sum, i) => sum + (i.price || 0), 0);
  const summaryText = inclusions.map((i) => i.previewText).join("\n");

  const calculatedCustomerPrice =
    advancePercent >= 100
      ? null
      : (totalPrice + executionPrice) / (1 - advancePercent / 100);

  const calculatedAdvanceAmount =
    calculatedCustomerPrice === null
      ? null
      : calculatedCustomerPrice * (advancePercent / 100);

  // Active Crop Target Resolution
  const isRecroppingNew =
    editingNewIndex !== null && Boolean(newImages[editingNewIndex]);
  const isRecroppingExisting = Boolean(editingExistingTarget);

  const activeCropSrc = isRecroppingExisting
    ? editingExistingTarget.blobUrl
    : isRecroppingNew
    ? newImages[editingNewIndex].originalUrl ||
      newImages[editingNewIndex].preview
    : cropQueue[0]?.originalUrl || null;

  const activeCropFileName = isRecroppingExisting
    ? editingExistingTarget.imgObj.fileName || "image.jpg"
    : isRecroppingNew
    ? newImages[editingNewIndex].originalName ||
      newImages[editingNewIndex].file.name
    : cropQueue[0]?.originalFile?.name || "image.jpg";

  const activeQueueLabel = isRecroppingExisting
    ? "Editing Saved Image"
    : isRecroppingNew
    ? "Re-cropping Image"
    : cropTotalCount > 1
    ? `Image ${cropTotalCount - cropQueue.length + 1} of ${cropTotalCount}`
    : null;

  return (
    <Box
      sx={{
        maxWidth: 1380,
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        py: 4,
      }}
    >
      {/* Image Crop Modal (480x470 Fixed Grid) */}
      <ImageCropModal
        open={Boolean(activeCropSrc)}
        imageSrc={activeCropSrc}
        fileName={activeCropFileName}
        queueProgress={activeQueueLabel}
        onCancel={handleCancelCrop}
        onConfirm={handleConfirmCrop}
      />

      {/* Toast Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} color="#1e1420">
          Decoration Editor
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select a decoration subcategory to manage pricing, media (images & videos), tags, and inclusions.
        </Typography>
      </Box>

      {/* Filter & Search Bar Card */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          border: "1px solid #e6dce4",
          bgcolor: "#fff",
        }}
      >
        <Grid container spacing={2.5} alignItems="center">
          <Grid size={{ xs: 12, md: 5 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="subcategory-select-label">
                Select Subcategory
              </InputLabel>
              <Select
                labelId="subcategory-select-label"
                value={selectedSubCategory}
                label="Select Subcategory"
                onChange={handleSelectChange}
              >
                <MenuItem value="">
                  <em>Select SubCategory</em>
                </MenuItem>
                {decorationCategories.map((item) => (
                  <MenuItem key={item._id} value={item.name}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <TextField
              fullWidth
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, ID, or tag..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Data Table / States */}
      {loading ? (
        <Box
          sx={{
            py: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress sx={{ color: BRAND_PRIMARY }} />
          <Typography variant="body2" color="text.secondary">
            Loading decoration products...
          </Typography>
        </Box>
      ) : filteredData.length > 0 ? (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e6dce4",
            overflowX: "auto",
          }}
        >
          <Table sx={{ minWidth: 750 }}>
            <TableHead sx={{ bgcolor: BRAND_LIGHT_BG }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#2b1329" }}>
                  Product Name
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#2b1329" }}>
                  Media Preview
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#2b1329" }}>
                  Price
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#2b1329" }}>
                  Tags
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 700, color: "#2b1329" }}
                >
                  Actions
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 700, color: "#2b1329" }}
                >
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((item) => {
                const firstMedia = item?.featured_images?.[0];
                const hasVideo = isVideoMedia(firstMedia);
                const mediaSrc = getExistingMediaUrl(firstMedia);

                return (
                  <TableRow
                    key={item._id}
                    hover
                    sx={{ "&:last-child td": { border: 0 } }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {item._id}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {mediaSrc ? (
                        <Box
                          sx={{
                            position: "relative",
                            width: 84,
                            height: 54,
                            borderRadius: 1.5,
                            overflow: "hidden",
                            bgcolor: "#141414",
                            border: "1px solid #e0d4de",
                          }}
                        >
                          {hasVideo ? (
                            <>
                              <video
                                src={mediaSrc}
                                muted
                                playsInline
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                              <Chip
                                label="VIDEO"
                                size="small"
                                sx={{
                                  position: "absolute",
                                  bottom: 2,
                                  right: 2,
                                  height: 16,
                                  fontSize: "0.6rem",
                                  fontWeight: 700,
                                  bgcolor: BRAND_PRIMARY,
                                  color: "#fff",
                                }}
                              />
                            </>
                          ) : (
                            <img
                              src={mediaSrc}
                              alt={item.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          )}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No Media
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={BRAND_PRIMARY}
                      >
                        ₹{item.price}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ maxWidth: 280 }}>
                      <Stack direction="row" flexWrap="wrap" gap={0.6}>
                        {item.tag?.map((tagId) => {
                          const tag = mealProductTypes.find(
                            (t) => t._id === tagId
                          );
                          return (
                            <Chip
                              key={tagId}
                              label={tag ? tag.name : "Unknown"}
                              size="small"
                              sx={{
                                bgcolor: BRAND_LIGHT_BG,
                                color: BRAND_PRIMARY,
                                border: `1px solid ${BRAND_PRIMARY}33`,
                                fontSize: "0.72rem",
                              }}
                            />
                          );
                        })}
                      </Stack>
                    </TableCell>

                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<EditIcon fontSize="small" />}
                        onClick={() => handlePopupOpen(item)}
                        sx={{
                          bgcolor: BRAND_PRIMARY,
                          "&:hover": { bgcolor: BRAND_DARK },
                          textTransform: "none",
                          borderRadius: 1.5,
                          fontWeight: 600,
                        }}
                      >
                        Update
                      </Button>
                    </TableCell>

                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="contained"
                        color={item.status === 1 ? "success" : "error"}
                        onClick={() => handleToggleStatus(item)}
                        sx={{
                          textTransform: "none",
                          borderRadius: 1.5,
                          minWidth: 88,
                          fontWeight: 600,
                        }}
                      >
                        {item.status === 1 ? "Active" : "Inactive"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        selectedSubCategory && (
          <Paper
            elevation={0}
            sx={{
              p: 5,
              textAlign: "center",
              borderRadius: 3,
              border: "1px dashed #d6c7d4",
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No items found for this subcategory.
            </Typography>
          </Paper>
        )
      )}

      {/* =====================================================================
          EDIT MODAL DIALOG (All Edit Controls Inside Popup)
          ===================================================================== */}
      <Dialog
        open={Boolean(popupData)}
        onClose={handlePopupClose}
        maxWidth="lg"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        {popupData && (
          <>
            <DialogTitle
              sx={{
                bgcolor: BRAND_LIGHT_BG,
                borderBottom: "1px solid #e6dce4",
                py: 2,
                px: 3,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="h6" fontWeight={700} color="#1e1420">
                    Edit Decoration: {popupData.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Product ID: {popupData._id}
                  </Typography>
                </Box>
                <IconButton onClick={handlePopupClose} size="small">
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>

            <DialogContent
              dividers
              sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#fcfafc" }}
            >
              <Stack spacing={3}>
                {/* 1. BASIC DETAILS & TAGS */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    border: "1px solid #e6dce4",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color={BRAND_PRIMARY}
                    sx={{ mb: 2 }}
                  >
                    1. Basic Details & Category Tags
                  </Typography>

                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, md: 5 }}>
                      <TextField
                        fullWidth
                        label="Product Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <RupeeIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Autocomplete
                        multiple
                        options={decorationCategories}
                        disableCloseOnSelect
                        getOptionLabel={(option) => option.name || ""}
                        value={selectedTagObjects}
                        onChange={(_, newValue) => {
                          setSelectedTags(newValue.map((item) => item._id));
                        }}
                        renderOption={(props, option, { selected }) => {
                          const { key, ...optionProps } = props;
                          return (
                            <li key={option._id} {...optionProps}>
                              <Checkbox
                                checked={selected}
                                sx={{
                                  mr: 1,
                                  color: BRAND_PRIMARY,
                                  "&.Mui-checked": { color: BRAND_PRIMARY },
                                }}
                              />
                              {option.name}
                            </li>
                          );
                        }}
                        renderTags={(tagValue, getTagProps) =>
                          tagValue.map((option, index) => {
                            const { key, ...tagProps } = getTagProps({ index });
                            return (
                              <Chip
                                key={option._id}
                                label={option.name}
                                size="small"
                                sx={{
                                  bgcolor: BRAND_LIGHT_BG,
                                  color: BRAND_PRIMARY,
                                  border: `1px solid ${BRAND_PRIMARY}40`,
                                }}
                                {...tagProps}
                              />
                            );
                          })
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Category Tags"
                            placeholder="Select tags"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                {/* 2. MEDIA GALLERY (EXISTING + NEW IMAGES WITH CROP & VIDEOS) */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    border: "1px solid #e6dce4",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        color={BRAND_PRIMARY}
                      >
                        2. Product Media (Images & Videos)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Click the Crop icon on any existing or new image to adjust inside the 480×470 grid.
                      </Typography>
                    </Box>
                    <Chip
                      label={`${existingImages.length + newImages.length} / 10 Files`}
                      size="small"
                      sx={{
                        bgcolor: BRAND_LIGHT_BG,
                        color: BRAND_PRIMARY,
                        fontWeight: 600,
                      }}
                    />
                  </Stack>

                  {/* Upload Trigger */}
                  <Box
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      border: `2px dashed ${BRAND_PRIMARY}66`,
                      borderRadius: 2,
                      bgcolor: BRAND_LIGHT_BG,
                      p: 2.5,
                      textAlign: "center",
                      cursor: "pointer",
                      "&:hover": {
                        borderColor: BRAND_PRIMARY,
                        bgcolor: "#f7eaf5",
                      },
                    }}
                  >
                    <CloudUploadIcon
                      sx={{ fontSize: 34, color: BRAND_PRIMARY, mb: 0.5 }}
                    />
                    <Typography variant="body2" fontWeight={600} color="#2b1329">
                      Click to Add More Images or Videos
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      New images open in 480×470 cropper • Videos upload directly
                    </Typography>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      style={{ display: "none" }}
                      onChange={handleMediaChange}
                    />
                  </Box>

                  {/* Existing + New Media Grid */}
                  {(existingImages.length > 0 || newImages.length > 0) && (
                    <Grid container spacing={2} sx={{ mt: 1.5 }}>
                      {/* EXISTING SAVED MEDIA */}
                      {existingImages.map((img) => {
                        const isVid = isVideoMedia(img);
                        const src = getExistingMediaUrl(img);
                        return (
                          <Grid
                            size={{ xs: 6, sm: 4, md: 2.4 }}
                            key={img.fileName}
                          >
                            <Card
                              variant="outlined"
                              sx={{
                                borderRadius: 2,
                                overflow: "hidden",
                                borderColor: "#dfd2dc",
                              }}
                            >
                              <Box
                                sx={{
                                  height: 155,
                                  bgcolor: "#141414",
                                  position: "relative",
                                }}
                              >
                                {isVid ? (
                                  <video
                                    src={src}
                                    muted
                                    loop
                                    playsInline
                                    onMouseEnter={(e) => e.target.play()}
                                    onMouseLeave={(e) => e.target.pause()}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <img
                                    src={src}
                                    alt={img.fileName}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                )}

                                <Chip
                                  icon={
                                    isVid ? (
                                      <VideocamIcon
                                        sx={{
                                          fontSize: 13,
                                          color: "#fff !important",
                                        }}
                                      />
                                    ) : (
                                      <ImageIcon
                                        sx={{
                                          fontSize: 13,
                                          color: "#fff !important",
                                        }}
                                      />
                                    )
                                  }
                                  label={isVid ? "VIDEO" : "SAVED"}
                                  size="small"
                                  sx={{
                                    position: "absolute",
                                    top: 6,
                                    left: 6,
                                    height: 20,
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                    bgcolor: isVid
                                      ? "rgba(146, 66, 134, 0.92)"
                                      : "rgba(0, 0, 0, 0.65)",
                                    color: "#fff",
                                  }}
                                />

                                {/* Edit (Crop) & Delete Buttons for Existing Media */}
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  sx={{
                                    position: "absolute",
                                    top: 5,
                                    right: 5,
                                  }}
                                >
                                  {!isVid && (
                                    <Tooltip title="Crop / Edit image">
                                      <IconButton
                                        size="small"
                                        disabled={loadingExistingCrop}
                                        onClick={() =>
                                          handleRecropExistingImage(img)
                                        }
                                        sx={{
                                          bgcolor: "rgba(255,255,255,0.92)",
                                          color: BRAND_PRIMARY,
                                          "&:hover": { bgcolor: "#fff" },
                                        }}
                                      >
                                        <CropIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}

                                  <Tooltip title="Remove existing file">
                                    <IconButton
                                      size="small"
                                      onClick={() => removeExistingImage(img)}
                                      sx={{
                                        bgcolor: "rgba(255,255,255,0.92)",
                                        color: "#d32f2f",
                                        "&:hover": { bgcolor: "#fff" },
                                      }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </Box>
                              <Box sx={{ px: 1, py: 0.6, bgcolor: "#fff" }}>
                                <Typography
                                  variant="caption"
                                  noWrap
                                  display="block"
                                  color="text.secondary"
                                >
                                  {img.fileName}
                                </Typography>
                              </Box>
                            </Card>
                          </Grid>
                        );
                      })}

                      {/* NEWLY ADDED MEDIA */}
                      {newImages.map((item, index) => (
                        <Grid
                          size={{ xs: 6, sm: 4, md: 2.4 }}
                          key={`new-${index}`}
                        >
                          <Card
                            variant="outlined"
                            sx={{
                              borderRadius: 2,
                              overflow: "hidden",
                              borderColor: BRAND_PRIMARY,
                            }}
                          >
                            <Box
                              sx={{
                                height: 155,
                                bgcolor: "#141414",
                                position: "relative",
                              }}
                            >
                              {item.isVideo ? (
                                <video
                                  src={item.preview}
                                  muted
                                  loop
                                  playsInline
                                  onMouseEnter={(e) => e.target.play()}
                                  onMouseLeave={(e) => e.target.pause()}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <img
                                  src={item.preview}
                                  alt="New upload"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              )}

                              <Chip
                                label={
                                  item.isVideo ? "NEW VIDEO" : "CROPPED NEW"
                                }
                                size="small"
                                sx={{
                                  position: "absolute",
                                  top: 6,
                                  left: 6,
                                  height: 20,
                                  fontSize: "0.64rem",
                                  fontWeight: 700,
                                  bgcolor: "#2e7d32",
                                  color: "#fff",
                                }}
                              />

                              <Stack
                                direction="row"
                                spacing={0.5}
                                sx={{
                                  position: "absolute",
                                  top: 5,
                                  right: 5,
                                }}
                              >
                                {!item.isVideo && (
                                  <Tooltip title="Re-crop image">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRecropNewImage(index)}
                                      sx={{
                                        bgcolor: "rgba(255,255,255,0.92)",
                                        color: BRAND_PRIMARY,
                                        "&:hover": { bgcolor: "#fff" },
                                      }}
                                    >
                                      <CropIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}

                                <Tooltip title="Remove new file">
                                  <IconButton
                                    size="small"
                                    onClick={() => removeNewImage(index)}
                                    sx={{
                                      bgcolor: "rgba(255,255,255,0.92)",
                                      color: "#d32f2f",
                                      "&:hover": { bgcolor: "#fff" },
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Box>
                            <Box sx={{ px: 1, py: 0.6, bgcolor: "#fff" }}>
                              <Typography
                                variant="caption"
                                noWrap
                                display="block"
                                color="text.secondary"
                              >
                                {item.file.name}
                              </Typography>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Paper>

                {/* 3. DESIGN TYPE CHECKLIST */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    border: "1px solid #e6dce4",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color={BRAND_PRIMARY}
                    sx={{ mb: 1.5 }}
                  >
                    3. Design Type Classification
                  </Typography>
                  <CheckboxGroup
                    key="designType"
                    title="Explain the type of design"
                    items={designTypeOptions}
                    section="designType"
                    checklist={callChecklist}
                    onChange={handleCheckboxChange}
                  />
                </Paper>

                {/* 4. INCLUSION & PRICING BUILDER */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    border: "1px solid #e6dce4",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={1.5}
                    sx={{ mb: 2 }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      color={BRAND_PRIMARY}
                    >
                      4. Inclusions & Pricing Configuration
                    </Typography>

                    <FormControl component="fieldset">
                      <RadioGroup
                        row
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                      >
                        <FormControlLabel
                          value="Option1"
                          control={
                            <Radio
                              sx={{
                                color: BRAND_PRIMARY,
                                "&.Mui-checked": { color: BRAND_PRIMARY },
                              }}
                            />
                          }
                          label="Option 1 (Material Builder)"
                        />
                        <FormControlLabel
                          value="Option2"
                          control={
                            <Radio
                              sx={{
                                color: BRAND_PRIMARY,
                                "&.Mui-checked": { color: BRAND_PRIMARY },
                              }}
                            />
                          }
                          label="Option 2 (Manual Text)"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Stack>

                  <Divider sx={{ mb: 2.5 }} />

                  {mode === "Option1" ? (
                    <Box>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 2 }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          Material Inclusions ({inclusions.length})
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={handleAddInclusion}
                          sx={{
                            borderColor: BRAND_PRIMARY,
                            color: BRAND_PRIMARY,
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": {
                              borderColor: BRAND_DARK,
                              bgcolor: BRAND_LIGHT_BG,
                            },
                          }}
                        >
                          + Add Inclusion
                        </Button>
                      </Stack>

                      <Stack spacing={2}>
                        {inclusions.map((inc, idx) => {
                          const filteredTypes = getFilteredTypes(inc.specs);
                          const filteredMaterials = getFilteredMaterials(
                            inc.specs,
                            inc.type
                          );

                          return (
                            <Card
                              key={inc.id}
                              variant="outlined"
                              sx={{
                                borderRadius: 2,
                                borderColor: inc.matchedRow
                                  ? "#c8e6c9"
                                  : "#e2d7e0",
                                bgcolor: "#fafafa",
                              }}
                            >
                              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="center"
                                  sx={{ mb: 1.5 }}
                                >
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                  >
                                    <Typography
                                      variant="caption"
                                      fontWeight={700}
                                    >
                                      Item #{idx + 1}
                                    </Typography>
                                    <Chip
                                      size="small"
                                      icon={
                                        inc.matchedRow ? (
                                          <CheckCircleIcon />
                                        ) : (
                                          <CancelIcon />
                                        )
                                      }
                                      label={
                                        inc.matchedRow
                                          ? "Matched"
                                          : "Not Matched"
                                      }
                                      color={
                                        inc.matchedRow ? "success" : "error"
                                      }
                                      variant="outlined"
                                      sx={{ height: 22, fontSize: "0.72rem" }}
                                    />
                                  </Stack>

                                  <Button
                                    size="small"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    disabled={inclusions.length === 1}
                                    onClick={() => handleRemoveInclusion(inc.id)}
                                    sx={{ textTransform: "none" }}
                                  >
                                    Remove
                                  </Button>
                                </Stack>

                                <Grid container spacing={1.5}>
                                  <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                                    <FormControl
                                      fullWidth
                                      size="small"
                                      sx={{ bgcolor: "#fff" }}
                                    >
                                      <InputLabel>Specs</InputLabel>
                                      <Select
                                        label="Specs"
                                        value={inc.specs}
                                        onChange={(e) =>
                                          handleSelectChangeInc(
                                            inc.id,
                                            "specs",
                                            e.target.value
                                          )
                                        }
                                      >
                                        <MenuItem value="">
                                          <em>Select Specs</em>
                                        </MenuItem>
                                        {options.specs.map((o, i) => (
                                          <MenuItem key={i} value={o}>
                                            {o}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  </Grid>

                                  <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                                    <FormControl
                                      fullWidth
                                      size="small"
                                      sx={{ bgcolor: "#fff" }}
                                    >
                                      <InputLabel>Type</InputLabel>
                                      <Select
                                        label="Type"
                                        value={inc.type}
                                        onChange={(e) =>
                                          handleSelectChangeInc(
                                            inc.id,
                                            "type",
                                            e.target.value
                                          )
                                        }
                                      >
                                        <MenuItem value="">
                                          <em>Select Type</em>
                                        </MenuItem>
                                        {filteredTypes?.map((o, i) => (
                                          <MenuItem key={i} value={o}>
                                            {o}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  </Grid>

                                  <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                                    <FormControl
                                      fullWidth
                                      size="small"
                                      sx={{ bgcolor: "#fff" }}
                                    >
                                      <InputLabel>Material</InputLabel>
                                      <Select
                                        label="Material"
                                        value={inc.material}
                                        onChange={(e) =>
                                          handleSelectChangeInc(
                                            inc.id,
                                            "material",
                                            e.target.value
                                          )
                                        }
                                      >
                                        <MenuItem value="">
                                          <em>Select Material</em>
                                        </MenuItem>
                                        {filteredMaterials?.map((o, i) => (
                                          <MenuItem key={i} value={o}>
                                            {o}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  </Grid>

                                  <Grid size={{ xs: 6, sm: 4, md: 1.6 }}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      label="Category"
                                      value={inc.rentedConsumable}
                                      InputProps={{ readOnly: true }}
                                      sx={{ bgcolor: "#f0f0f0" }}
                                    />
                                  </Grid>

                                  <Grid size={{ xs: 6, sm: 4, md: 1.2 }}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      label="MOQ"
                                      value={inc.moq}
                                      InputProps={{ readOnly: true }}
                                      sx={{ bgcolor: "#f0f0f0" }}
                                    />
                                  </Grid>

                                  {inc.rentedConsumable === "Consumable" && (
                                    <Grid size={{ xs: 6, sm: 4, md: 1 }}>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        label="Qty"
                                        value={inc.customQuantity}
                                        onChange={(e) =>
                                          handleCustomQuantityChange(
                                            inc.id,
                                            e.target.value
                                          )
                                        }
                                        sx={{ bgcolor: "#fff" }}
                                      />
                                    </Grid>
                                  )}

                                  <Grid
                                    size={{
                                      xs: 6,
                                      sm: 4,
                                      md:
                                        inc.rentedConsumable === "Consumable"
                                          ? 1
                                          : 2,
                                    }}
                                  >
                                    <TextField
                                      fullWidth
                                      size="small"
                                      type="number"
                                      label="Price (₹)"
                                      value={inc.price}
                                      onChange={(e) =>
                                        handlePriceChange(inc.id, e.target.value)
                                      }
                                      sx={{ bgcolor: "#fff" }}
                                    />
                                  </Grid>

                                  <Grid size={{ xs: 12 }}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      label="Preview Text (Editable)"
                                      value={inc.previewText}
                                      onChange={(e) =>
                                        handlePreviewChange(
                                          inc.id,
                                          e.target.value
                                        )
                                      }
                                      sx={{ bgcolor: "#fff" }}
                                    />
                                  </Grid>
                                </Grid>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </Stack>

                      {/* Pricing Summary Box */}
                      <Paper
                        variant="outlined"
                        sx={{
                          mt: 2.5,
                          p: 2,
                          borderRadius: 2,
                          bgcolor: BRAND_LIGHT_BG,
                          borderColor: `${BRAND_PRIMARY}40`,
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
                            <Typography variant="caption" color="text.secondary">
                              Hora Vendor Material Price
                            </Typography>
                            <Typography variant="subtitle1" fontWeight={700}>
                              ₹{totalPrice.toFixed(2)}
                            </Typography>
                          </Grid>

                          <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              label="Execution Price"
                              value={executionPrice}
                              onChange={(e) =>
                                setExecutionPrice(
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              sx={{ bgcolor: "#fff" }}
                            />
                          </Grid>

                          <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              label="Advance %"
                              placeholder="e.g. 20"
                              value={advancePercent}
                              onChange={(e) =>
                                setAdvancePercent(
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              sx={{ bgcolor: "#fff" }}
                            />
                          </Grid>

                          <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
                            <Typography variant="caption" color="text.secondary">
                              Customer Price
                            </Typography>
                            <Typography
                              variant="subtitle1"
                              fontWeight={700}
                              color={
                                calculatedCustomerPrice === null
                                  ? "error.main"
                                  : BRAND_PRIMARY
                              }
                            >
                              {calculatedCustomerPrice === null
                                ? "Invalid %"
                                : `₹${calculatedCustomerPrice.toFixed(2)}`}
                            </Typography>
                          </Grid>

                          <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
                            <Typography variant="caption" color="text.secondary">
                              Advance Hora Amount
                            </Typography>
                            <Typography
                              variant="subtitle1"
                              fontWeight={700}
                              color={
                                calculatedAdvanceAmount === null
                                  ? "error.main"
                                  : "success.main"
                              }
                            >
                              {calculatedAdvanceAmount === null
                                ? "Invalid %"
                                : `₹${calculatedAdvanceAmount.toFixed(2)}`}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>

                      {/* Inclusion Summary */}
                      <Box sx={{ mt: 2.5 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ mb: 1 }}
                        >
                          <SummaryIcon
                            fontSize="small"
                            sx={{ color: BRAND_PRIMARY }}
                          />
                          <Typography variant="subtitle2" fontWeight={700}>
                            Inclusion Summary
                          </Typography>
                        </Stack>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          value={summaryText}
                          InputProps={{
                            readOnly: true,
                            sx: { fontFamily: "monospace", bgcolor: "#fafafa" },
                          }}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ mb: 1 }}
                      >
                        <SummaryIcon
                          fontSize="small"
                          sx={{ color: BRAND_PRIMARY }}
                        />
                        <Typography variant="subtitle2" fontWeight={700}>
                          Product Inclusion (Each line becomes a bullet item)
                        </Typography>
                      </Stack>
                      <TextField
                        fullWidth
                        multiline
                        rows={6}
                        value={option2Text}
                        onChange={(e) => setOption2Text(e.target.value)}
                        placeholder="Enter your text here..."
                        InputProps={{
                          sx: { fontFamily: "monospace", bgcolor: "#fafafa" },
                        }}
                      />
                    </Box>
                  )}
                </Paper>
              </Stack>
            </DialogContent>

            <DialogActions
              sx={{
                px: 3,
                py: 2,
                bgcolor: "#fff",
                borderTop: "1px solid #e6dce4",
              }}
            >
              <Button
                variant="outlined"
                onClick={handlePopupClose}
                disabled={saving}
                sx={{
                  borderColor: "#ccc",
                  color: "#555",
                  textTransform: "none",
                  px: 3,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={
                  saving ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                disabled={saving}
                onClick={handleSaveChanges}
                sx={{
                  bgcolor: BRAND_PRIMARY,
                  "&:hover": { bgcolor: BRAND_DARK },
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3.5,
                  borderRadius: 2,
                }}
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default DecorationEditor;