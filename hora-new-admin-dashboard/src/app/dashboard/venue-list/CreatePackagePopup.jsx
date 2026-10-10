// // // "use client";

// // // import React, { useEffect, useState } from "react";

// // // import {
// // //   createVenuePackage,
// // //   fetchPackageCategories,
// // //   fetchPackageItems,
// // // } from "@/services/venueListServices";
// // // import { BASE_URL } from "@/utils/apiconstant";

// // // const CreatePackagePopup = ({ isOpen, onClose, onSuccess, venueId }) => {
// // //   const [loadingCreate, setLoadingCreate] = useState(false);
// // //   const [packageItemsMaster, setPackageItemsMaster] = useState([]);
// // //   const [filteredItems, setFilteredItems] = useState([]);
// // //   const [formData, setFormData] = useState({
// // //     title: "",
// // //     subTitle: "",
// // //     actualPrice: "",
// // //     discountedPrice: "",
// // //     maxGuests: "",
// // //     tag: "",
// // //     packageItems: [],
// // //     packageAddons: [""],
// // //   });

// // //   const [packageImage, setPackageImage] = useState(null);
// // //   const [imagePreview, setImagePreview] = useState("");
// // //   const [packageCategories, setPackageCategories] = useState([]);

// // //   const [newItemTitle, setNewItemTitle] = useState("");
// // //   const [selectedCategories, setSelectedCategories] = useState([]);
// // //   const [itemFoodtype, setItemFoodtype] = useState("");

// // //   const [showTagModal, setShowTagModal] = useState(false);
// // //   const [selectedCategory, setSelectedCategory] = useState(null);
// // //   const [categoryTagValue, setCategoryTagValue] = useState("");
// // //   const [packageCategoriesTags, setPackageCategoriesTags] = useState({});

// // //   useEffect(() => {
// // //     if (isOpen) {
// // //       fetchPackageItems(setPackageItemsMaster, setFilteredItems);
// // //     }
// // //   }, [isOpen]);

// // //   useEffect(() => {
// // //     if (isOpen) {
// // //       fetchPackageCategories(setPackageCategories);
// // //     }
// // //   }, [isOpen]);

// // //   const handleImageChange = (e) => {
// // //     const file = e.target.files?.[0];
// // //     if (!file) return;
// // //     setPackageImage(file);
// // //     setImagePreview(URL.createObjectURL(file));
// // //   };

// // //   useEffect(() => {
// // //     return () => {
// // //       if (imagePreview) {
// // //         URL.revokeObjectURL(imagePreview);
// // //       }
// // //     };
// // //   }, [imagePreview]);

// // //   const handleChange = (e) => {
// // //     const { name, value } = e.target;
// // //     setFormData((prev) => ({
// // //       ...prev,
// // //       [name]: value,
// // //     }));
// // //   };

// // //   const handleItemSelection = (itemId) => {
// // //     setFormData((prev) => {
// // //       const exists = prev.packageItems.includes(itemId);

// // //       return {
// // //         ...prev,
// // //         packageItems: exists
// // //           ? prev.packageItems.filter((id) => id !== itemId)
// // //           : [...prev.packageItems, itemId],
// // //       };
// // //     });
// // //   };

// // //   const groupedItems = filteredItems.reduce((acc, item) => {
// // //     if (!item.categoryIds?.length) {
// // //       if (!acc["Uncategorized"]) {
// // //         acc["Uncategorized"] = [];
// // //       }

// // //       acc["Uncategorized"].push(item);
// // //       return acc;
// // //     }

// // //     item.categoryIds.forEach((cat) => {
// // //       const categoryName =
// // //         typeof cat === "object" ? cat.title : "Unknown Category";

// // //       if (!acc[categoryName]) {
// // //         acc[categoryName] = [];
// // //       }

// // //       acc[categoryName].push(item);
// // //     });

// // //     return acc;
// // //   }, {});

// // //   const handleAddonChange = (index, value) => {
// // //     const updated = [...formData.packageAddons];

// // //     updated[index] = value;

// // //     setFormData((prev) => ({
// // //       ...prev,
// // //       packageAddons: updated,
// // //     }));
// // //   };

// // //   const addAddonField = () => {
// // //     setFormData((prev) => ({
// // //       ...prev,
// // //       packageAddons: [...prev.packageAddons, ""],
// // //     }));
// // //   };

// // //   const removeAddon = (index) => {
// // //     const updated = [...formData.packageAddons];

// // //     updated.splice(index, 1);

// // //     setFormData((prev) => ({
// // //       ...prev,
// // //       packageAddons: updated,
// // //     }));
// // //   };

// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault();
// // //     const payload = new FormData();
// // //     payload.append("venueId", venueId);
// // //     payload.append("title", formData.title);
// // //     payload.append("subTitle", formData.subTitle);
// // //     payload.append("actualPrice", formData.actualPrice);
// // //     payload.append("discountedPrice", formData.discountedPrice);
// // //     payload.append("maxGuests", formData.maxGuests);
// // //     payload.append("tag", formData.tag);
// // //     payload.append("packageItems", JSON.stringify(formData.packageItems));
// // //     payload.append("packageAddons", JSON.stringify(formData.packageAddons));
// // //     payload.append(
// // //       "packageCategoriesTags",
// // //       JSON.stringify(packageCategoriesTags),
// // //     );

// // //     if (packageImage) {
// // //       payload.append("image", packageImage);
// // //     }

// // //     createVenuePackage(payload, onSuccess, onClose, setLoadingCreate);
// // //   };

// // //   const handleAddItem = async () => {
// // //     if (!newItemTitle) return;

// // //     const payload = {
// // //       title: newItemTitle,
// // //       categoryIds: selectedCategories,
// // //       foodType: itemFoodtype,
// // //     };

// // //     try {
// // //       await fetch(`${BASE_URL}/api/party-venue/package-item/create-item`, {
// // //         method: "POST",
// // //         headers: {
// // //           "Content-Type": "application/json",
// // //         },
// // //         body: JSON.stringify(payload),
// // //       });

// // //       // reset
// // //       setNewItemTitle("");
// // //       setSelectedCategories([]);

// // //       // refetch items
// // //       fetchPackageItems(setPackageItemsMaster, setFilteredItems);
// // //     } catch (err) {
// // //       console.log(err);
// // //     }
// // //   };

// // //   if (!isOpen) return null;

// // //   return (
// // //     <div className="popup-overlay">
// // //       <div className="popup-content" style={{ maxWidth: "800px" }}>
// // //         <button className="close-btn" onClick={onClose}>
// // //           X
// // //         </button>

// // //         <h2>Create Package</h2>

// // //         <form onSubmit={handleSubmit}>
// // //           <div className="package-form-container">
// // //             <div className="package-create-input-ctn">
// // //               <input
// // //                 type="text"
// // //                 name="title"
// // //                 placeholder="Package Title"
// // //                 value={formData.title}
// // //                 onChange={handleChange}
// // //                 required
// // //                 className="package-create-input"
// // //               />

// // //               <input
// // //                 type="text"
// // //                 name="subTitle"
// // //                 placeholder="Package Subtitle"
// // //                 value={formData.subTitle}
// // //                 onChange={handleChange}
// // //                 required
// // //                 className="package-create-input"
// // //               />
// // //             </div>

// // //             <div className="package-create-input-ctn">
// // //               <input
// // //                 type="number"
// // //                 name="actualPrice"
// // //                 placeholder="Actual Price"
// // //                 value={formData.actualPrice}
// // //                 onChange={handleChange}
// // //                 required
// // //                 className="package-create-input"
// // //               />

// // //               <input
// // //                 type="number"
// // //                 name="discountedPrice"
// // //                 placeholder="Discounted Price"
// // //                 value={formData.discountedPrice}
// // //                 onChange={handleChange}
// // //                 className="package-create-input"
// // //               />
// // //             </div>

// // //             <div className="package-create-input-ctn">
// // //               <input
// // //                 type="number"
// // //                 name="maxGuests"
// // //                 placeholder="Min Guests"
// // //                 value={formData.maxGuests}
// // //                 onChange={handleChange}
// // //                 className="package-create-input"
// // //               />

// // //               <input
// // //                 type="text"
// // //                 name="tag"
// // //                 placeholder="Tag"
// // //                 value={formData.tag}
// // //                 onChange={handleChange}
// // //                 className="package-create-input"
// // //               />
// // //             </div>

// // //             <h4>Package Banner Image</h4>

// // //             <div
// // //               style={{
// // //                 marginBottom: "20px",
// // //               }}
// // //             >
// // //               <input
// // //                 type="file"
// // //                 accept="image/*"
// // //                 onChange={handleImageChange}
// // //               />

// // //               {imagePreview && (
// // //                 <div
// // //                   style={{
// // //                     marginTop: "10px",
// // //                   }}
// // //                 >
// // //                   <img
// // //                     src={imagePreview}
// // //                     alt="preview"
// // //                     style={{
// // //                       width: "200px",
// // //                       height: "120px",
// // //                       objectFit: "cover",
// // //                       borderRadius: "8px",
// // //                       border: "1px solid #ddd",
// // //                     }}
// // //                   />
// // //                 </div>
// // //               )}
// // //             </div>
// // //             <hr />
// // //             <h4>Package Items</h4>

// // //             <div style={{ display: "flex", gap: "20px" }}>
// // //               <div
// // //                 style={{
// // //                   maxHeight: "250px",
// // //                   overflowY: "auto",
// // //                   border: "1px solid #ddd",
// // //                   padding: "10px",
// // //                   marginBottom: "20px",
// // //                   width: "60%",
// // //                 }}
// // //               >
// // //                 <input
// // //                   type="text"
// // //                   placeholder="Search items..."
// // //                   className="package-create-input"
// // //                   style={{ marginBottom: "10px" }}
// // //                   onChange={(e) => {
// // //                     const searchTerm = e.target.value.toLowerCase();

// // //                     if (!searchTerm) {
// // //                       setFilteredItems(packageItemsMaster);
// // //                       return;
// // //                     }

// // //                     const filtered = packageItemsMaster.filter((item) =>
// // //                       item.title.toLowerCase().includes(searchTerm),
// // //                     );

// // //                     setFilteredItems(filtered);
// // //                   }}
// // //                 />
// // //                 {filteredItems.length === 0 && (
// // //                   <div style={{ textAlign: "center", color: "#888" }}>
// // //                     No items found.
// // //                   </div>
// // //                 )}
// // //                 {Object.entries(groupedItems).map(([categoryName, items]) => {
// // //                   const categoryId = items[0]?.categoryIds?.find(
// // //                     (cat) => cat.title === categoryName,
// // //                   )?._id;

// // //                   return (
// // //                     <div key={categoryName}>
// // //                       <div
// // //                         style={{
// // //                           display: "flex",
// // //                           justifyContent: "space-between",
// // //                           background: "#f5f5f5",
// // //                           padding: "8px 10px",
// // //                           fontWeight: 600,
// // //                           fontSize: "14px",
// // //                           borderBottom: "1px solid #ddd",
// // //                         }}
// // //                       >
// // //                         <div>
// // //                           {categoryName}

// // //                           {packageCategoriesTags[categoryId] && (
// // //                             <span
// // //                               style={{
// // //                                 marginLeft: "10px",
// // //                                 color: "#666",
// // //                                 fontWeight: 400,
// // //                               }}
// // //                             >
// // //                               ({packageCategoriesTags[categoryId]})
// // //                             </span>
// // //                           )}
// // //                         </div>

// // //                         <button
// // //                           type="button"
// // //                           style={{ cursor: "pointer" }}
// // //                           onClick={() => {
// // //                             setSelectedCategory({
// // //                               id: categoryId,
// // //                               title: categoryName,
// // //                             });

// // //                             setCategoryTagValue(
// // //                               packageCategoriesTags[categoryId] || "",
// // //                             );

// // //                             setShowTagModal(true);
// // //                           }}
// // //                         >
// // //                           Add Tag
// // //                         </button>
// // //                       </div>

// // //                       {items.map((item) => (
// // //                         <div
// // //                           key={item._id}
// // //                           className="items-dropdown-ctn"
// // //                           onClick={() => handleItemSelection(item._id)}
// // //                         >
// // //                           <div>
// // //                             <label
// // //                               style={{
// // //                                 fontSize: "12px",
// // //                                 margin: 0,
// // //                               }}
// // //                             >
// // //                               {item.foodType === "veg" ? "🟢" : "🔴"}{" "}
// // //                               {item.title}
// // //                             </label>
// // //                           </div>

// // //                           <div>
// // //                             <input
// // //                               type="checkbox"
// // //                               checked={formData.packageItems.includes(item._id)}
// // //                               onChange={() => handleItemSelection(item._id)}
// // //                             />
// // //                           </div>
// // //                         </div>
// // //                       ))}
// // //                     </div>
// // //                   );
// // //                 })}
// // //               </div>

// // //               {showTagModal && (
// // //                 <div className="popup-overlay">
// // //                   <div
// // //                     style={{
// // //                       background: "#fff",
// // //                       width: "400px",
// // //                       padding: "20px",
// // //                       borderRadius: "10px",
// // //                     }}
// // //                   >
// // //                     <h3>{selectedCategory?.title}</h3>

// // //                     <input
// // //                       type="text"
// // //                       placeholder="Example: Select 2 Appetisers"
// // //                       value={categoryTagValue}
// // //                       onChange={(e) => setCategoryTagValue(e.target.value)}
// // //                       className="package-create-input"
// // //                     />

// // //                     <div
// // //                       style={{
// // //                         display: "flex",
// // //                         justifyContent: "flex-end",
// // //                         gap: "10px",
// // //                         marginTop: "15px",
// // //                       }}
// // //                     >
// // //                       <button
// // //                         type="button"
// // //                         onClick={() => setShowTagModal(false)}
// // //                       >
// // //                         Cancel
// // //                       </button>

// // //                       <button
// // //                         type="button"
// // //                         onClick={() => {
// // //                           setPackageCategoriesTags((prev) => ({
// // //                             ...prev,
// // //                             [selectedCategory.id]: categoryTagValue,
// // //                           }));

// // //                           setShowTagModal(false);
// // //                         }}
// // //                       >
// // //                         Save
// // //                       </button>
// // //                     </div>
// // //                   </div>
// // //                 </div>
// // //               )}

// // //               <div>
// // //                 <h4 style={{ margin: "0px" }}>Add New Item</h4>
// // //                 <input
// // //                   type="text"
// // //                   placeholder="Item Title"
// // //                   value={newItemTitle}
// // //                   onChange={(e) => setNewItemTitle(e.target.value)}
// // //                 />
// // //                 <div
// // //                   style={{
// // //                     maxHeight: "150px",
// // //                     overflowY: "auto",
// // //                     border: "1px solid #ddd",
// // //                     padding: "10px",
// // //                     marginTop: "10px",
// // //                     width: "100%",
// // //                   }}
// // //                 >
// // //                   {packageCategories?.map((cat) => (
// // //                     <div
// // //                       key={cat._id}
// // //                       className="items-dropdown-ctn"
// // //                       // onClick={() => {
// // //                       //   if (selectedCategories.includes(cat._id)) {
// // //                       //     setSelectedCategories((prev) =>
// // //                       //       prev.filter((id) => id !== cat._id),
// // //                       //     );
// // //                       //   } else {
// // //                       //     setSelectedCategories((prev) => [...prev, cat._id]);
// // //                       //   }
// // //                       // }}
// // //                       onClick={() => {
// // //                         setSelectedCategories([cat._id]);
// // //                       }}
// // //                     >
// // //                       <div>
// // //                         <label style={{ fontSize: "12px", margin: "0px" }}>
// // //                           {cat.title}
// // //                         </label>
// // //                       </div>
// // //                       <div>
// // //                         <input
// // //                           type="radio"
// // //                           // checked={selectedCategories.includes(cat._id)}
// // //                           checked={selectedCategories[0] === cat._id}
// // //                           // onChange={() => {
// // //                           //   setSelectedCategories((prev) =>
// // //                           //     prev.includes(cat._id)
// // //                           //       ? prev.filter((id) => id !== cat._id)
// // //                           //       : [...prev, cat._id],
// // //                           //   );
// // //                           // }}
// // //                           onChange={() => {
// // //                             setSelectedCategories([cat._id]);
// // //                           }}
// // //                         />
// // //                       </div>
// // //                     </div>
// // //                   ))}
// // //                 </div>
// // //                 <div
// // //                   style={{
// // //                     display: "flex",
// // //                     justifyContent: "space-between",
// // //                     alignItems: "center",
// // //                     width: "100%",
// // //                   }}
// // //                 >
// // //                   <div
// // //                     style={{
// // //                       display: "flex",
// // //                       alignItems: "center",
// // //                       gap: "10px",
// // //                     }}
// // //                   >
// // //                     <input
// // //                       type="radio"
// // //                       name="foodType"
// // //                       value="veg"
// // //                       onChange={(e) => setItemFoodtype(e.target.value)}
// // //                     />
// // //                     <label
// // //                       for="foodType1"
// // //                       style={{ margin: "0px", fontSize: "12px" }}
// // //                     >
// // //                       Veg
// // //                     </label>
// // //                     <input
// // //                       type="radio"
// // //                       name="foodType"
// // //                       value="non-veg"
// // //                       style={{ marginLeft: "10px" }}
// // //                       onChange={(e) => setItemFoodtype(e.target.value)}
// // //                     />
// // //                     <label
// // //                       for="foodType2"
// // //                       style={{ margin: "0px", fontSize: "12px" }}
// // //                     >
// // //                       Non-Veg
// // //                     </label>
// // //                   </div>
// // //                   <div>
// // //                     <button
// // //                       style={{ marginTop: "5px", cursor: "pointer" }}
// // //                       onClick={handleAddItem}
// // //                       type="button"
// // //                     >
// // //                       Add Item
// // //                     </button>
// // //                   </div>
// // //                 </div>
// // //               </div>
// // //             </div>
// // //             <hr />

// // //             <h4>Addons</h4>

// // //             {formData.packageAddons.map((addon, index) => (
// // //               <div key={index} className="package-create-input-ctn">
// // //                 <input
// // //                   type="text"
// // //                   value={addon}
// // //                   placeholder="Addon"
// // //                   onChange={(e) => handleAddonChange(index, e.target.value)}
// // //                   className="package-create-input"
// // //                 />

// // //                 <button type="button" onClick={() => removeAddon(index)}>
// // //                   Remove
// // //                 </button>
// // //               </div>
// // //             ))}

// // //             <button type="button" onClick={addAddonField}>
// // //               Add Addon
// // //             </button>

// // //             <div
// // //               style={{
// // //                 marginTop: "30px",
// // //                 display: "flex",
// // //                 justifyContent: "flex-end",
// // //                 gap: "10px",
// // //               }}
// // //             >
// // //               <button
// // //                 type="button"
// // //                 onClick={onClose}
// // //                 className="package-create-btn package-cancel-btn"
// // //               >
// // //                 Cancel
// // //               </button>

// // //               <button
// // //                 type="submit"
// // //                 className="package-create-btn"
// // //                 disabled={loadingCreate}
// // //               >
// // //                 {loadingCreate ? "Creating..." : "Create Package"}
// // //               </button>
// // //             </div>
// // //           </div>
// // //         </form>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default CreatePackagePopup;

// // "use client";

// // import React, { useEffect, useState } from "react";
// // import {
// //   Dialog,
// //   DialogTitle,
// //   DialogContent,
// //   DialogActions,
// //   Button,
// //   TextField,
// //   Box,
// //   Typography,
// //   IconButton,
// //   Divider,
// //   CircularProgress,
// //   Checkbox,
// //   FormControlLabel,
// //   Radio,
// //   RadioGroup,
// //   Chip,
// //   Tooltip,
// // } from "@mui/material";
// // import CloseIcon from "@mui/icons-material/Close";
// // import AddIcon from "@mui/icons-material/Add";
// // import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
// // import {
// //   createVenuePackage,
// //   fetchPackageCategories,
// //   fetchPackageItems,
// // } from "@/services/venueListServices";
// // import { BASE_URL } from "@/utils/apiconstant";

// // const CreatePackagePopup = ({ isOpen, onClose, onSuccess, venueId }) => {
// //   const [loadingCreate, setLoadingCreate] = useState(false);
// //   const [packageItemsMaster, setPackageItemsMaster] = useState([]);
// //   const [filteredItems, setFilteredItems] = useState([]);
// //   const [formData, setFormData] = useState({
// //     title: "",
// //     subTitle: "",
// //     actualPrice: "",
// //     discountedPrice: "",
// //     maxGuests: "",
// //     tag: "",
// //     packageItems: [],
// //     packageAddons: [""],
// //   });

// //   const [packageImage, setPackageImage] = useState(null);
// //   const [imagePreview, setImagePreview] = useState("");
// //   const [packageCategories, setPackageCategories] = useState([]);

// //   // Add New Item
// //   const [newItemTitle, setNewItemTitle] = useState("");
// //   const [selectedCategories, setSelectedCategories] = useState([]);
// //   const [itemFoodtype, setItemFoodtype] = useState("");

// //   // Category Tags
// //   const [packageCategoriesTags, setPackageCategoriesTags] = useState({});
// //   const [editingTagCategoryId, setEditingTagCategoryId] = useState(null);
// //   const [tempTagValue, setTempTagValue] = useState("");

// //   useEffect(() => {
// //     if (isOpen) {
// //       fetchPackageItems(setPackageItemsMaster, setFilteredItems);
// //       fetchPackageCategories(setPackageCategories);
// //       // Reset form when opened
// //       setFormData({
// //         title: "",
// //         subTitle: "",
// //         actualPrice: "",
// //         discountedPrice: "",
// //         maxGuests: "",
// //         tag: "",
// //         packageItems: [],
// //         packageAddons: [""],
// //       });
// //       setPackageImage(null);
// //       setImagePreview("");
// //       setPackageCategoriesTags({});
// //       setNewItemTitle("");
// //       setSelectedCategories([]);
// //       setItemFoodtype("");
// //     }
// //   }, [isOpen]);

// //   useEffect(() => {
// //     return () => {
// //       if (imagePreview) URL.revokeObjectURL(imagePreview);
// //     };
// //   }, [imagePreview]);

// //   const handleImageChange = (e) => {
// //     const file = e.target.files?.[0];
// //     if (!file) return;
// //     setPackageImage(file);
// //     setImagePreview(URL.createObjectURL(file));
// //   };

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData((prev) => ({ ...prev, [name]: value }));
// //   };

// //   const handleItemSelection = (itemId) => {
// //     setFormData((prev) => {
// //       const exists = prev.packageItems.includes(itemId);
// //       return {
// //         ...prev,
// //         packageItems: exists
// //           ? prev.packageItems.filter((id) => id !== itemId)
// //           : [...prev.packageItems, itemId],
// //       };
// //     });
// //   };

// //   const groupedItems = filteredItems.reduce((acc, item) => {
// //     if (!item.categoryIds?.length) {
// //       if (!acc["Uncategorized"]) acc["Uncategorized"] = [];
// //       acc["Uncategorized"].push(item);
// //       return acc;
// //     }

// //     item.categoryIds.forEach((cat) => {
// //       const categoryName =
// //         typeof cat === "object" ? cat.title : "Unknown Category";
// //       if (!acc[categoryName]) acc[categoryName] = [];
// //       acc[categoryName].push(item);
// //     });

// //     return acc;
// //   }, {});

// //   const handleAddonChange = (index, value) => {
// //     const updated = [...formData.packageAddons];
// //     updated[index] = value;
// //     setFormData((prev) => ({ ...prev, packageAddons: updated }));
// //   };

// //   const addAddonField = () => {
// //     setFormData((prev) => ({
// //       ...prev,
// //       packageAddons: [...prev.packageAddons, ""],
// //     }));
// //   };

// //   const removeAddon = (index) => {
// //     const updated = [...formData.packageAddons];
// //     updated.splice(index, 1);
// //     setFormData((prev) => ({ ...prev, packageAddons: updated }));
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     const payload = new FormData();
// //     payload.append("venueId", venueId);
// //     payload.append("title", formData.title);
// //     payload.append("subTitle", formData.subTitle);
// //     payload.append("actualPrice", formData.actualPrice);
// //     payload.append("discountedPrice", formData.discountedPrice);
// //     payload.append("maxGuests", formData.maxGuests);
// //     payload.append("tag", formData.tag);
// //     payload.append("packageItems", JSON.stringify(formData.packageItems));
// //     payload.append("packageAddons", JSON.stringify(formData.packageAddons));
// //     payload.append(
// //       "packageCategoriesTags",
// //       JSON.stringify(packageCategoriesTags)
// //     );

// //     if (packageImage) {
// //       payload.append("image", packageImage);
// //     }

// //     createVenuePackage(payload, onSuccess, onClose, setLoadingCreate);
// //   };

// //   const handleAddItem = async () => {
// //     if (!newItemTitle.trim()) return;

// //     const payload = {
// //       title: newItemTitle,
// //       categoryIds: selectedCategories,
// //       foodType: itemFoodtype,
// //     };

// //     try {
// //       await fetch(`${BASE_URL}/api/party-venue/package-item/create-item`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify(payload),
// //       });

// //       setNewItemTitle("");
// //       setSelectedCategories([]);
// //       setItemFoodtype("");
// //       fetchPackageItems(setPackageItemsMaster, setFilteredItems);
// //     } catch (err) {
// //       console.error(err);
// //     }
// //   };

// //   const handleSearchItems = (e) => {
// //     const searchTerm = e.target.value.toLowerCase();
// //     if (!searchTerm) {
// //       setFilteredItems(packageItemsMaster);
// //       return;
// //     }
// //     const filtered = packageItemsMaster.filter((item) =>
// //       item.title.toLowerCase().includes(searchTerm)
// //     );
// //     setFilteredItems(filtered);
// //   };

// //   return (
// //     <Dialog
// //       open={isOpen}
// //       onClose={onClose}
// //       maxWidth="xl"
// //       fullWidth
// //       PaperProps={{
// //         sx: {
// //           borderRadius: 3,
// //           maxHeight: "92vh",
// //           display: "flex",
// //           flexDirection: "column",
// //         },
// //       }}
// //     >
// //       {/* Header */}
// //       <DialogTitle
// //         sx={{
// //           m: 0,
// //           p: 2.5,
// //           display: "flex",
// //           alignItems: "center",
// //           justifyContent: "space-between",
// //           borderBottom: "1px solid #e5e7eb",
// //           bgcolor: "#fafafa",
// //         }}
// //       >
// //         <Typography variant="h6" fontWeight={700}>
// //           Create Package
// //         </Typography>
// //         <IconButton onClick={onClose} size="small">
// //           <CloseIcon />
// //         </IconButton>
// //       </DialogTitle>

// //       {/* Scrollable Content */}
// //       <DialogContent dividers sx={{ p: 3, overflowY: "auto", flex: 1 }}>
// //         <form id="create-package-form" onSubmit={handleSubmit}>
// //           {/* ========== BASIC INFO ========== */}
// //           <Typography variant="subtitle1" fontWeight={700} mb={2}>
// //             Basic Information
// //           </Typography>

// //           <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
// //             <TextField
// //               name="title"
// //               label="Package Title *"
// //               value={formData.title}
// //               onChange={handleChange}
// //               size="small"
// //               required
// //               fullWidth
// //             />
// //             <TextField
// //               name="subTitle"
// //               label="Package Subtitle *"
// //               value={formData.subTitle}
// //               onChange={handleChange}
// //               size="small"
// //               required
// //               fullWidth
// //             />
// //           </Box>

// //           <Box display="grid" gridTemplateColumns="1fr 1fr 1fr 1fr" gap={2} mb={2}>
// //             <TextField
// //               name="actualPrice"
// //               label="Actual Price *"
// //               type="number"
// //               value={formData.actualPrice}
// //               onChange={handleChange}
// //               size="small"
// //               required
// //               fullWidth
// //             />
// //             <TextField
// //               name="discountedPrice"
// //               label="Discounted Price"
// //               type="number"
// //               value={formData.discountedPrice}
// //               onChange={handleChange}
// //               size="small"
// //               fullWidth
// //             />
// //             <TextField
// //               name="maxGuests"
// //               label="Min Guests"
// //               type="number"
// //               value={formData.maxGuests}
// //               onChange={handleChange}
// //               size="small"
// //               fullWidth
// //             />
// //             <TextField
// //               name="tag"
// //               label="Tag"
// //               value={formData.tag}
// //               onChange={handleChange}
// //               size="small"
// //               fullWidth
// //             />
// //           </Box>

// //           {/* Image */}
// //           <Box mb={3}>
// //             <Typography variant="body2" fontWeight={500} mb={1}>
// //               Package Banner Image
// //             </Typography>
// //             <Button
// //               variant="outlined"
// //               component="label"
// //               size="small"
// //               sx={{ textTransform: "none", borderRadius: 2 }}
// //             >
// //               {imagePreview ? "Change Image" : "Choose Image"}
// //               <input
// //                 type="file"
// //                 hidden
// //                 accept="image/*"
// //                 onChange={handleImageChange}
// //               />
// //             </Button>
// //             {imagePreview && (
// //               <Box mt={1.5}>
// //                 <img
// //                   src={imagePreview}
// //                   alt="preview"
// //                   style={{
// //                     width: 180,
// //                     height: 110,
// //                     objectFit: "cover",
// //                     borderRadius: 8,
// //                     border: "1px solid #e5e7eb",
// //                   }}
// //                 />
// //               </Box>
// //             )}
// //           </Box>

// //           <Divider sx={{ mb: 3 }} />

// //           {/* ========== PACKAGE ITEMS ========== */}
// //           <Typography variant="subtitle1" fontWeight={700} mb={2}>
// //             Package Items
// //             <Chip
// //               label={`${formData.packageItems.length} selected`}
// //               size="small"
// //               sx={{ ml: 1.5, fontWeight: 600 }}
// //               color={formData.packageItems.length > 0 ? "primary" : "default"}
// //             />
// //           </Typography>

// //           <Box display="flex" gap={2.5} mb={3}>
// //             {/* LEFT: Item List */}
// //             <Box
// //               sx={{
// //                 flex: 1.4,
// //                 border: "1px solid #e5e7eb",
// //                 borderRadius: 2,
// //                 overflow: "hidden",
// //                 display: "flex",
// //                 flexDirection: "column",
// //                 maxHeight: 380,
// //               }}
// //             >
// //               <Box sx={{ p: 1.5, borderBottom: "1px solid #e5e7eb", bgcolor: "#f8fafc" }}>
// //                 <TextField
// //                   size="small"
// //                   placeholder="Search items..."
// //                   fullWidth
// //                   onChange={handleSearchItems}
// //                 />
// //               </Box>

// //               <Box sx={{ overflowY: "auto", flex: 1, p: 1 }}>
// //                 {Object.keys(groupedItems).length === 0 ? (
// //                   <Typography
// //                     color="text.secondary"
// //                     textAlign="center"
// //                     py={4}
// //                     fontSize={14}
// //                   >
// //                     No items found
// //                   </Typography>
// //                 ) : (
// //                   Object.entries(groupedItems).map(([categoryName, items]) => {
// //                     const categoryId = items[0]?.categoryIds?.find(
// //                       (cat) => cat.title === categoryName
// //                     )?._id;

// //                     return (
// //                       <Box key={categoryName} mb={1.5}>
// //                         {/* Category Header */}
// //                         <Box
// //                           sx={{
// //                             display: "flex",
// //                             alignItems: "center",
// //                             justifyContent: "space-between",
// //                             bgcolor: "#f1f5f9",
// //                             px: 1.5,
// //                             py: 1,
// //                             borderRadius: 1,
// //                             mb: 0.5,
// //                           }}
// //                         >
// //                           <Box>
// //                             <Typography fontWeight={600} fontSize={13}>
// //                               {categoryName}
// //                             </Typography>
// //                             {packageCategoriesTags[categoryId] && (
// //                               <Typography fontSize={11} color="text.secondary">
// //                                 {packageCategoriesTags[categoryId]}
// //                               </Typography>
// //                             )}
// //                           </Box>

// //                           {editingTagCategoryId === categoryId ? (
// //                             <Box display="flex" gap={0.5} alignItems="center">
// //                               <TextField
// //                                 size="small"
// //                                 value={tempTagValue}
// //                                 onChange={(e) => setTempTagValue(e.target.value)}
// //                                 placeholder="e.g. Select 2"
// //                                 sx={{ width: 120 }}
// //                                 autoFocus
// //                               />
// //                               <Button
// //                                 size="small"
// //                                 onClick={() => {
// //                                   setPackageCategoriesTags((prev) => ({
// //                                     ...prev,
// //                                     [categoryId]: tempTagValue,
// //                                   }));
// //                                   setEditingTagCategoryId(null);
// //                                 }}
// //                                 sx={{ textTransform: "none", minWidth: 0 }}
// //                               >
// //                                 Save
// //                               </Button>
// //                             </Box>
// //                           ) : (
// //                             <Button
// //                               size="small"
// //                               onClick={() => {
// //                                 setEditingTagCategoryId(categoryId);
// //                                 setTempTagValue(
// //                                   packageCategoriesTags[categoryId] || ""
// //                                 );
// //                               }}
// //                               sx={{ textTransform: "none", fontSize: 12 }}
// //                             >
// //                               {packageCategoriesTags[categoryId]
// //                                 ? "Edit Tag"
// //                                 : "Add Tag"}
// //                             </Button>
// //                           )}
// //                         </Box>

// //                         {/* Items */}
// //                         {items.map((item) => (
// //                           <FormControlLabel
// //                             key={item._id}
// //                             control={
// //                               <Checkbox
// //                                 size="small"
// //                                 checked={formData.packageItems.includes(item._id)}
// //                                 onChange={() => handleItemSelection(item._id)}
// //                               />
// //                             }
// //                             label={
// //                               <Typography fontSize={13}>
// //                                 {item.foodType === "veg" ? "🟢" : "🔴"} {item.title}
// //                               </Typography>
// //                             }
// //                             sx={{
// //                               display: "flex",
// //                               ml: 0.5,
// //                               "&:hover": { bgcolor: "#f8fafc" },
// //                               borderRadius: 1,
// //                               width: "100%",
// //                             }}
// //                           />
// //                         ))}
// //                       </Box>
// //                     );
// //                   })
// //                 )}
// //               </Box>
// //             </Box>

// //             {/* RIGHT: Add New Item */}
// //             <Box
// //               sx={{
// //                 flex: 1,
// //                 border: "1px solid #e5e7eb",
// //                 borderRadius: 2,
// //                 p: 2,
// //                 bgcolor: "#fafafa",
// //                 maxHeight: 380,
// //                 overflowY: "auto",
// //               }}
// //             >
// //               <Typography fontWeight={600} fontSize={14} mb={1.5}>
// //                 Add New Item
// //               </Typography>

// //               <TextField
// //                 size="small"
// //                 label="Item Title"
// //                 value={newItemTitle}
// //                 onChange={(e) => setNewItemTitle(e.target.value)}
// //                 fullWidth
// //                 sx={{ mb: 2 }}
// //               />

// //               <Typography fontSize={12} fontWeight={500} mb={0.5} color="text.secondary">
// //                 Category
// //               </Typography>
// //               <Box
// //                 sx={{
// //                   maxHeight: 140,
// //                   overflowY: "auto",
// //                   border: "1px solid #e5e7eb",
// //                   borderRadius: 1.5,
// //                   mb: 2,
// //                   bgcolor: "white",
// //                 }}
// //               >
// //                 {packageCategories?.map((cat) => (
// //                   <FormControlLabel
// //                     key={cat._id}
// //                     control={
// //                       <Radio
// //                         size="small"
// //                         checked={selectedCategories[0] === cat._id}
// //                         onChange={() => setSelectedCategories([cat._id])}
// //                       />
// //                     }
// //                     label={<Typography fontSize={13}>{cat.title}</Typography>}
// //                     sx={{
// //                       display: "flex",
// //                       ml: 0.5,
// //                       width: "100%",
// //                       "&:hover": { bgcolor: "#f8fafc" },
// //                     }}
// //                   />
// //                 ))}
// //               </Box>

// //               <Typography fontSize={12} fontWeight={500} mb={0.5} color="text.secondary">
// //                 Food Type
// //               </Typography>
// //               <RadioGroup
// //                 row
// //                 value={itemFoodtype}
// //                 onChange={(e) => setItemFoodtype(e.target.value)}
// //                 sx={{ mb: 2 }}
// //               >
// //                 <FormControlLabel
// //                   value="veg"
// //                   control={<Radio size="small" />}
// //                   label={<Typography fontSize={13}>Veg</Typography>}
// //                 />
// //                 <FormControlLabel
// //                   value="non-veg"
// //                   control={<Radio size="small" />}
// //                   label={<Typography fontSize={13}>Non-Veg</Typography>}
// //                 />
// //               </RadioGroup>

// //               <Button
// //                 variant="contained"
// //                 size="small"
// //                 fullWidth
// //                 onClick={handleAddItem}
// //                 disabled={!newItemTitle.trim()}
// //                 sx={{ textTransform: "none", borderRadius: 2 }}
// //               >
// //                 Add Item
// //               </Button>
// //             </Box>
// //           </Box>

// //           <Divider sx={{ mb: 3 }} />

// //           {/* ========== ADDONS ========== */}
// //           <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
// //             <Typography variant="subtitle1" fontWeight={700}>
// //               Addons
// //             </Typography>
// //             <Button
// //               size="small"
// //               startIcon={<AddIcon />}
// //               onClick={addAddonField}
// //               sx={{ textTransform: "none" }}
// //             >
// //               Add Addon
// //             </Button>
// //           </Box>

// //           {formData.packageAddons.map((addon, index) => (
// //             <Box key={index} display="flex" gap={1} mb={1.5} alignItems="center">
// //               <TextField
// //                 size="small"
// //                 placeholder={`Addon ${index + 1}`}
// //                 value={addon}
// //                 onChange={(e) => handleAddonChange(index, e.target.value)}
// //                 fullWidth
// //               />
// //               <IconButton
// //                 size="small"
// //                 color="error"
// //                 onClick={() => removeAddon(index)}
// //                 disabled={formData.packageAddons.length === 1}
// //               >
// //                 <DeleteOutlineIcon fontSize="small" />
// //               </IconButton>
// //             </Box>
// //           ))}
// //         </form>
// //       </DialogContent>

// //       {/* Footer */}
// //       <DialogActions
// //         sx={{
// //           p: 2.5,
// //           borderTop: "1px solid #e5e7eb",
// //           bgcolor: "#fafafa",
// //           gap: 1,
// //         }}
// //       >
// //         <Button
// //           onClick={onClose}
// //           variant="outlined"
// //           sx={{ textTransform: "none", borderRadius: 2 }}
// //         >
// //           Cancel
// //         </Button>
// //         <Button
// //           type="submit"
// //           form="create-package-form"
// //           variant="contained"
// //           disabled={loadingCreate}
// //           sx={{
// //             textTransform: "none",
// //             borderRadius: 2,
// //             minWidth: 150,
// //           }}
// //         >
// //           {loadingCreate ? (
// //             <CircularProgress size={22} color="inherit" />
// //           ) : (
// //             "Create Package"
// //           )}
// //         </Button>
// //       </DialogActions>
// //     </Dialog>
// //   );
// // };

// // export default CreatePackagePopup;

// "use client";

// import React, { useEffect, useState, useMemo } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
//   Box,
//   Typography,
//   IconButton,
//   Divider,
//   CircularProgress,
//   Checkbox,
//   FormControlLabel,
//   Radio,
//   RadioGroup,
//   Chip,
//   List,
//   ListItemButton,
//   ListItemText,
//   Popover,
//   InputAdornment,
// } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
// import AddIcon from "@mui/icons-material/Add";
// import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
// import SearchIcon from "@mui/icons-material/Search";
// import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
// import {
//   createVenuePackage,
//   fetchPackageCategories,
//   fetchPackageItems,
// } from "@/services/venueListServices";
// import { BASE_URL } from "@/utils/apiconstant";

// const CreatePackagePopup = ({ isOpen, onClose, onSuccess, venueId }) => {
//   const [loadingCreate, setLoadingCreate] = useState(false);
//   const [packageItemsMaster, setPackageItemsMaster] = useState([]);
//   const [formData, setFormData] = useState({
//     title: "",
//     subTitle: "",
//     actualPrice: "",
//     discountedPrice: "",
//     maxGuests: "",
//     tag: "",
//     packageItems: [],
//     packageAddons: [""],
//   });

//   const [packageImage, setPackageImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState("");
//   const [packageCategories, setPackageCategories] = useState([]);

//   // Add New Item
//   const [newItemTitle, setNewItemTitle] = useState("");
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [itemFoodtype, setItemFoodtype] = useState("");

//   // Category Tags
//   const [packageCategoriesTags, setPackageCategoriesTags] = useState({});

//   // New UX states
//   const [selectedCategoryId, setSelectedCategoryId] = useState("all");
//   const [selectedCategoryName, setSelectedCategoryName] = useState("");
//   const [itemSearch, setItemSearch] = useState("");
//   const [tagAnchorEl, setTagAnchorEl] = useState(null);
//   const [tagCategoryId, setTagCategoryId] = useState(null);
//   const [tempTagValue, setTempTagValue] = useState("");

//   useEffect(() => {
//     if (isOpen) {
//       fetchPackageItems(setPackageItemsMaster, () => {});
//       fetchPackageCategories(setPackageCategories);
//       setFormData({
//         title: "",
//         subTitle: "",
//         actualPrice: "",
//         discountedPrice: "",
//         maxGuests: "",
//         tag: "",
//         packageItems: [],
//         packageAddons: [""],
//       });
//       setPackageImage(null);
//       setImagePreview("");
//       setPackageCategoriesTags({});
//       setNewItemTitle("");
//       setSelectedCategories([]);
//       setItemFoodtype("");
//       setSelectedCategoryId("all");
//       setSelectedCategoryName("");
//       setItemSearch("");
//     }
//   }, [isOpen]);

//   useEffect(() => {
//     return () => {
//       if (imagePreview) URL.revokeObjectURL(imagePreview);
//     };
//   }, [imagePreview]);

//   // Group items by category
//   const { categoriesWithItems, uncategorizedItems } = useMemo(() => {
//     const map = {};
//     const uncategorized = [];

//     packageItemsMaster.forEach((item) => {
//       if (!item.categoryIds?.length) {
//         uncategorized.push(item);
//         return;
//       }
//       item.categoryIds.forEach((cat) => {
//         const id = typeof cat === "object" ? cat._id : cat;
//         const title = typeof cat === "object" ? cat.title : "Unknown";
//         if (!map[id]) {
//           map[id] = { id, title, items: [] };
//         }
//         // avoid duplicates
//         if (!map[id].items.find((i) => i._id === item._id)) {
//           map[id].items.push(item);
//         }
//       });
//     });

//     return {
//       categoriesWithItems: Object.values(map).sort((a, b) =>
//         a.title.localeCompare(b.title),
//       ),
//       uncategorizedItems: uncategorized,
//     };
//   }, [packageItemsMaster]);

//   // Filtered items based on selected category + search
//   const displayedItems = useMemo(() => {
//     let items = [];

//     if (selectedCategoryId === "all") {
//       items = packageItemsMaster;
//     } else if (selectedCategoryId === "uncategorized") {
//       items = uncategorizedItems;
//     } else {
//       const cat = categoriesWithItems.find((c) => c.id === selectedCategoryId);
//       items = cat ? cat.items : [];
//     }

//     if (itemSearch.trim()) {
//       const q = itemSearch.toLowerCase();
//       items = items.filter((item) => item.title.toLowerCase().includes(q));
//     }

//     return items;
//   }, [
//     selectedCategoryId,
//     itemSearch,
//     packageItemsMaster,
//     categoriesWithItems,
//     uncategorizedItems,
//   ]);

//   const handleImageChange = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setPackageImage(file);
//     setImagePreview(URL.createObjectURL(file));
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleItemSelection = (itemId) => {
//     setFormData((prev) => {
//       const exists = prev.packageItems.includes(itemId);
//       return {
//         ...prev,
//         packageItems: exists
//           ? prev.packageItems.filter((id) => id !== itemId)
//           : [...prev.packageItems, itemId],
//       };
//     });
//   };

//   const handleAddonChange = (index, value) => {
//     const updated = [...formData.packageAddons];
//     updated[index] = value;
//     setFormData((prev) => ({ ...prev, packageAddons: updated }));
//   };

//   const addAddonField = () => {
//     setFormData((prev) => ({
//       ...prev,
//       packageAddons: [...prev.packageAddons, ""],
//     }));
//   };

//   const removeAddon = (index) => {
//     const updated = [...formData.packageAddons];
//     updated.splice(index, 1);
//     setFormData((prev) => ({ ...prev, packageAddons: updated }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const payload = new FormData();
//     payload.append("venueId", venueId);
//     payload.append("title", formData.title);
//     payload.append("subTitle", formData.subTitle);
//     payload.append("actualPrice", formData.actualPrice);
//     payload.append("discountedPrice", formData.discountedPrice);
//     payload.append("maxGuests", formData.maxGuests);
//     payload.append("tag", formData.tag);
//     payload.append("packageItems", JSON.stringify(formData.packageItems));
//     payload.append("packageAddons", JSON.stringify(formData.packageAddons));
//     payload.append(
//       "packageCategoriesTags",
//       JSON.stringify(packageCategoriesTags),
//     );

//     if (packageImage) {
//       payload.append("image", packageImage);
//     }

//     createVenuePackage(payload, onSuccess, onClose, setLoadingCreate);
//   };

//   const handleAddItem = async () => {
//     if (!newItemTitle.trim()) return;

//     const payload = {
//       title: newItemTitle,
//       categoryIds: selectedCategories,
//       foodType: itemFoodtype,
//     };

//     try {
//       await fetch(`${BASE_URL}/api/party-venue/package-item/create-item`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       setNewItemTitle("");
//       setSelectedCategories([]);
//       setItemFoodtype("");
//       fetchPackageItems(setPackageItemsMaster, () => {});
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // Tag popover handlers
//   const openTagPopover = (event, categoryId) => {
//     setTagAnchorEl(event.currentTarget);
//     setTagCategoryId(categoryId);
//     setTempTagValue(packageCategoriesTags[categoryId] || "");
//   };

//   const closeTagPopover = () => {
//     setTagAnchorEl(null);
//     setTagCategoryId(null);
//     setTempTagValue("");
//   };

//   const saveTag = () => {
//     if (tagCategoryId) {
//       setPackageCategoriesTags((prev) => ({
//         ...prev,
//         [tagCategoryId]: tempTagValue,
//       }));
//     }
//     closeTagPopover();
//   };

//   const selectedCountInCategory = (catId) => {
//     if (catId === "all") return formData.packageItems.length;
//     const cat = categoriesWithItems.find((c) => c.id === catId);
//     if (!cat) return 0;
//     return cat.items.filter((i) => formData.packageItems.includes(i._id))
//       .length;
//   };

//   return (
//     <Dialog
//       open={isOpen}
//       onClose={onClose}
//       maxWidth="xl"
//       fullWidth
//       PaperProps={{
//         sx: {
//           borderRadius: 3,
//           maxHeight: "94vh",
//           display: "flex",
//           flexDirection: "column",
//         },
//       }}
//     >
//       {/* Header */}
//       <DialogTitle
//         sx={{
//           m: 0,
//           p: 2.5,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           borderBottom: "1px solid #e5e7eb",
//           bgcolor: "#fafafa",
//         }}
//       >
//         <Typography variant="h6" fontWeight={700}>
//           Create Package
//         </Typography>
//         <IconButton onClick={onClose} size="small">
//           <CloseIcon />
//         </IconButton>
//       </DialogTitle>

//       <DialogContent dividers sx={{ p: 3, overflowY: "auto", flex: 1 }} className="slim-scrollbar">
//         <form id="create-package-form" onSubmit={handleSubmit}>
//           {/* ========== BASIC INFO ========== */}
//           <Typography variant="subtitle1" fontWeight={700} mb={2}>
//             Basic Information
//           </Typography>

//           <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
//             <TextField
//               name="title"
//               label="Package Title *"
//               value={formData.title}
//               onChange={handleChange}
//               size="small"
//               required
//               fullWidth
//             />
//             <TextField
//               name="subTitle"
//               label="Package Subtitle *"
//               value={formData.subTitle}
//               onChange={handleChange}
//               size="small"
//               required
//               fullWidth
//             />
//           </Box>

//           <Box
//             display="grid"
//             gridTemplateColumns="1fr 1fr 1fr 1fr"
//             gap={2}
//             mb={2}
//           >
//             <TextField
//               name="actualPrice"
//               label="Actual Price *"
//               type="number"
//               value={formData.actualPrice}
//               onChange={handleChange}
//               size="small"
//               required
//               fullWidth
//             />
//             <TextField
//               name="discountedPrice"
//               label="Discounted Price"
//               type="number"
//               value={formData.discountedPrice}
//               onChange={handleChange}
//               size="small"
//               fullWidth
//             />
//             <TextField
//               name="maxGuests"
//               label="Min Guests"
//               type="number"
//               value={formData.maxGuests}
//               onChange={handleChange}
//               size="small"
//               fullWidth
//             />
//             <TextField
//               name="tag"
//               label="Tag"
//               value={formData.tag}
//               onChange={handleChange}
//               size="small"
//               fullWidth
//             />
//           </Box>

//           <Box mb={3}>
//             <Typography variant="body2" fontWeight={500} mb={1}>
//               Package Banner Image
//             </Typography>
//             <Button
//               variant="outlined"
//               component="label"
//               size="small"
//               sx={{ textTransform: "none", borderRadius: 2 }}
//             >
//               {imagePreview ? "Change Image" : "Choose Image"}
//               <input
//                 type="file"
//                 hidden
//                 accept="image/*"
//                 onChange={handleImageChange}
//               />
//             </Button>
//             {imagePreview && (
//               <Box mt={1.5}>
//                 <img
//                   src={imagePreview}
//                   alt="preview"
//                   style={{
//                     width: 180,
//                     height: 110,
//                     objectFit: "cover",
//                     borderRadius: 8,
//                     border: "1px solid #e5e7eb",
//                   }}
//                 />
//               </Box>
//             )}
//           </Box>

//           <Divider sx={{ mb: 3 }} />

//           {/* ========== PACKAGE ITEMS (Improved UX) ========== */}
//           <Box display="flex" alignItems="center" gap={1.5} mb={2}>
//             <Typography variant="subtitle1" fontWeight={700}>
//               Package Items
//             </Typography>
//             <Chip
//               label={`${formData.packageItems.length} selected`}
//               size="small"
//               color={formData.packageItems.length > 0 ? "primary" : "default"}
//               sx={{ fontWeight: 600 }}
//             />
//           </Box>

//           <Box
//             display="flex"
//             gap={2}
//             sx={{
//               border: "1px solid #e5e7eb",
//               borderRadius: 2,
//               overflowY: "auto",
//               height: 420,
//             }}
//             className="slim-scrollbar"
//           >
//             {/* LEFT: Categories */}
//             <Box
//               sx={{
//                 width: 240,
//                 borderRight: "1px solid #e5e7eb",
//                 bgcolor: "#f8fafc",
//                 display: "flex",
//                 flexDirection: "column",
//               }}
//             >
//               <Box sx={{ p: 1.5, borderBottom: "1px solid #e5e7eb" }}>
//                 <Typography
//                   fontWeight={600}
//                   fontSize={13}
//                   color="text.secondary"
//                 >
//                   Categories ({categoriesWithItems.length})
//                 </Typography>
//               </Box>

//               <List
//                 dense
//                 className="slim-scrollbar"
//                 sx={{
//                   overflowY: "auto",
//                   flex: 1,
//                   py: 0,
//                 }}
//               >
//                 <ListItemButton
//                   selected={selectedCategoryId === "all"}
//                   onClick={() => setSelectedCategoryId("all")}
//                   sx={{ py: 1 }}
//                 >
//                   <ListItemText
//                     primary="All Items"
//                     primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
//                   />
//                   <Chip
//                     label={packageItemsMaster.length}
//                     size="small"
//                     sx={{ height: 20, fontSize: 11 }}
//                   />
//                 </ListItemButton>

//                 {uncategorizedItems.length > 0 && (
//                   <ListItemButton
//                     selected={selectedCategoryId === "uncategorized"}
//                     onClick={() => setSelectedCategoryId("uncategorized")}
//                     sx={{ py: 1 }}
//                   >
//                     <ListItemText
//                       primary="Uncategorized"
//                       primaryTypographyProps={{ fontSize: 13 }}
//                     />
//                     <Chip
//                       label={uncategorizedItems.length}
//                       size="small"
//                       sx={{ height: 20, fontSize: 11 }}
//                     />
//                   </ListItemButton>
//                 )}

//                 {categoriesWithItems.map((cat) => {
//                   const selectedInCat = selectedCountInCategory(cat.id);
//                   return (
//                     <ListItemButton
//                       key={cat.id}
//                       selected={selectedCategoryId === cat.id}
//                       onClick={() => {setSelectedCategoryId(cat.id); setSelectedCategoryName(cat.title)}}
//                       sx={{ py: 1 }}
//                     >
//                       <ListItemText
//                         primary={cat.title}
//                         secondary={
//                           packageCategoriesTags[cat.id]
//                             ? packageCategoriesTags[cat.id]
//                             : null
//                         }
//                         primaryTypographyProps={{
//                           fontSize: 13,
//                           noWrap: true,
//                         }}
//                         secondaryTypographyProps={{
//                           fontSize: 11,
//                           noWrap: true,
//                         }}
//                       />
//                       <Box display="flex" alignItems="center" gap={0.5}>
//                         {selectedInCat > 0 && (
//                           <Chip
//                             label={selectedInCat}
//                             size="small"
//                             color="primary"
//                             sx={{ height: 18, fontSize: 10 }}
//                           />
//                         )}
//                         <Chip
//                           label={cat.items.length}
//                           size="small"
//                           sx={{ height: 18, fontSize: 10 }}
//                         />
//                       </Box>
//                     </ListItemButton>
//                   );
//                 })}
//               </List>
//             </Box>

//             {/* RIGHT: Items of selected category */}
//             <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
//               {/* Search + Tag button */}
//               <Box
//                 sx={{
//                   p: 1.5,
//                   borderBottom: "1px solid #e5e7eb",
//                   display: "flex",
//                   gap: 1,
//                   alignItems: "center",
//                 }}
//               >
//                 <TextField
//                   size="small"
//                   placeholder="Search in this category..."
//                   value={itemSearch}
//                   onChange={(e) => setItemSearch(e.target.value)}
//                   fullWidth
//                   InputProps={{
//                     startAdornment: (
//                       <InputAdornment position="start">
//                         <SearchIcon fontSize="small" color="action" />
//                       </InputAdornment>
//                     ),
//                   }}
//                 />

//                 {selectedCategoryId !== "all" &&
//                   selectedCategoryId !== "uncategorized" && (
//                     <Button
//                       variant="outlined"
//                       size="small"
//                       fullWidth
//                       startIcon={<LocalOfferOutlinedIcon />}
//                       onClick={(e) => openTagPopover(e, selectedCategoryId)}
//                       sx={{ textTransform: "none", whiteSpace: "nowrap", width: "25%", height : "100%" }}
//                     >
//                       {packageCategoriesTags[selectedCategoryId]
//                         ? "Edit Category Tag"
//                         : "Add Category Tag"}
//                     </Button>
//                   )}
//               </Box>

//               {/* Items list */}
//               <Box sx={{ overflowX : "hidden", flex: 1, p: 1 }} className="slim-scrollbar">
//                 {displayedItems.length === 0 ? (
//                   <Typography
//                     color="text.secondary"
//                     textAlign="center"
//                     py={6}
//                     fontSize={14}
//                   >
//                     {itemSearch
//                       ? "No items match your search"
//                       : "No items in this category"}
//                   </Typography>
//                 ) : (
//                   displayedItems.map((item) => (
//                     <FormControlLabel
//                       key={item._id}
//                       control={
//                         <Checkbox
//                           size="small"
//                           checked={formData.packageItems.includes(item._id)}
//                           onChange={() => handleItemSelection(item._id)}
//                         />
//                       }
//                       label={
//                         <Typography fontSize={13}>
//                           {item.foodType === "veg" ? "🟢" : "🔴"} {item.title}
//                         </Typography>
//                       }
//                       sx={{
//                         display: "flex",
//                         ml: 0.5,
//                         borderRadius: 1,
//                         width: "100%",
//                         "&:hover": { bgcolor: "#f8fafc" },
//                       }}
//                     />
//                   ))
//                 )}
//               </Box>
//             </Box>
//           </Box>

//           {/* Tag Popover */}
//           <Popover
//             open={Boolean(tagAnchorEl)}
//             anchorEl={tagAnchorEl}
//             onClose={closeTagPopover}
//             anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
//             transformOrigin={{ vertical: "top", horizontal: "left" }}
//           >
//             <Box sx={{ p: 2, width: 320 }}>
//               <Typography fontWeight={600} fontSize={14} mb={3}>
//                 Category Name : {selectedCategoryName}
//               </Typography>
//               {/* <Typography fontSize={12} color="text.secondary" mb={1.5}>
//                 Example: “Select any 2” or “Compulsory”
//               </Typography> */}
//               <TextField
//                 size="small"
//                 fullWidth
//                 autoFocus
//                 placeholder={`e.g. Select 2 ${selectedCategoryName}`}
//                 value={tempTagValue}
//                 onChange={(e) => setTempTagValue(e.target.value)}
//                 sx={{ mb: 2 }}
//               />
//               <Box display="flex" justifyContent="flex-end" gap={1}>
//                 <Button size="small" onClick={closeTagPopover}>
//                   Cancel
//                 </Button>
//                 <Button size="small" variant="contained" onClick={saveTag}>
//                   Save Tag
//                 </Button>
//               </Box>
//             </Box>
//           </Popover>

//           <Divider sx={{ my: 3 }} />

//           {/* ========== ADD NEW ITEM ========== */}
//           <Typography variant="subtitle1" fontWeight={700} mb={2}>
//             Add New Item (Optional)
//           </Typography>

//           <Box
//             sx={{
//               border: "1px solid #e5e7eb",
//               borderRadius: 2,
//               p: 2,
//               bgcolor: "#fafafa",
//               mb: 3,
//             }}
//           >
//             <Box
//               display="grid"
//               gridTemplateColumns="1fr 1fr 1fr auto"
//               gap={2}
//               alignItems="end"
//             >
//               <TextField
//                 size="small"
//                 label="Item Title"
//                 value={newItemTitle}
//                 onChange={(e) => setNewItemTitle(e.target.value)}
//                 fullWidth
//               />

//               <Box>
//                 <Typography
//                   fontSize={12}
//                   fontWeight={500}
//                   mb={0.5}
//                   color="text.secondary"
//                 >
//                   Category
//                 </Typography>
//                 <Box
//                 className="slim-scrollbar"
//                   sx={{
//                     maxHeight: 100,
//                     // overflowY: "auto",
//                     overflowX : "hidden",
//                     border: "1px solid #e5e7eb",
//                     borderRadius: 1,
//                     bgcolor: "white",
//                     px: 1,
//                   }}
//                 >
//                   {packageCategories?.map((cat) => (
//                     <FormControlLabel
//                       key={cat._id}
//                       control={
//                         <Radio
//                           size="small"
//                           checked={selectedCategories[0] === cat._id}
//                           onChange={() => setSelectedCategories([cat._id])}
//                         />
//                       }
//                       label={<Typography fontSize={13}>{cat.title}</Typography>}
//                       sx={{ display: "flex", width: "100%" }}
//                     />
//                   ))}
//                 </Box>
//               </Box>

//               <Box>
//                 <Typography
//                   fontSize={12}
//                   fontWeight={500}
//                   mb={0.5}
//                   color="text.secondary"
//                 >
//                   Food Type
//                 </Typography>
//                 <RadioGroup
//                   row
//                   value={itemFoodtype}
//                   onChange={(e) => setItemFoodtype(e.target.value)}
//                 >
//                   <FormControlLabel
//                     value="veg"
//                     control={<Radio size="small" />}
//                     label={<Typography fontSize={13}>Veg</Typography>}
//                   />
//                   <FormControlLabel
//                     value="non-veg"
//                     control={<Radio size="small" />}
//                     label={<Typography fontSize={13}>Non-Veg</Typography>}
//                   />
//                 </RadioGroup>
//               </Box>

//               <Button
//                 variant="contained"
//                 size="small"
//                 onClick={handleAddItem}
//                 disabled={!newItemTitle.trim()}
//                 sx={{ textTransform: "none", height: 40 }}
//               >
//                 Add Item
//               </Button>
//             </Box>
//           </Box>

//           <Divider sx={{ mb: 3 }} />

//           {/* ========== ADDONS ========== */}
//           <Box
//             display="flex"
//             alignItems="center"
//             justifyContent="space-between"
//             mb={1.5}
//           >
//             <Typography variant="subtitle1" fontWeight={700}>
//               Addons
//             </Typography>
//             <Button
//               size="small"
//               startIcon={<AddIcon />}
//               onClick={addAddonField}
//               sx={{ textTransform: "none" }}
//             >
//               Add Addon
//             </Button>
//           </Box>

//           {formData.packageAddons.map((addon, index) => (
//             <Box
//               key={index}
//               display="flex"
//               gap={1}
//               mb={1.5}
//               alignItems="center"
//             >
//               <TextField
//                 size="small"
//                 placeholder={`Addon ${index + 1}`}
//                 value={addon}
//                 onChange={(e) => handleAddonChange(index, e.target.value)}
//                 fullWidth
//               />
//               <IconButton
//                 size="small"
//                 color="error"
//                 onClick={() => removeAddon(index)}
//                 disabled={formData.packageAddons.length === 1}
//               >
//                 <DeleteOutlineIcon fontSize="small" />
//               </IconButton>
//             </Box>
//           ))}
//         </form>
//       </DialogContent>

//       {/* Footer */}
//       <DialogActions
//         sx={{
//           p: 2.5,
//           borderTop: "1px solid #e5e7eb",
//           bgcolor: "#fafafa",
//           gap: 1,
//         }}
//       >
//         <Button
//           onClick={onClose}
//           variant="outlined"
//           sx={{ textTransform: "none", borderRadius: 2 }}
//         >
//           Cancel
//         </Button>
//         <Button
//           type="submit"
//           form="create-package-form"
//           variant="contained"
//           disabled={loadingCreate}
//           sx={{ textTransform: "none", borderRadius: 2, minWidth: 150 }}
//         >
//           {loadingCreate ? (
//             <CircularProgress size={22} color="inherit" />
//           ) : (
//             "Create Package"
//           )}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default CreatePackagePopup;












"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Divider,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  Popover,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import {
  createVenuePackage,
  fetchPackageCategories,
  fetchPackageItems,
} from "@/services/venueListServices";
import { BASE_URL } from "@/utils/apiconstant";

const CreatePackagePopup = ({ isOpen, onClose, onSuccess, venueId }) => {
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [packageItemsMaster, setPackageItemsMaster] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    subTitle: "",
    actualPrice: "",
    discountedPrice: "",
    maxGuests: "",
    tag: "",
    packageItems: [],
    packageAddons: [""],
  });

  const [packageImage, setPackageImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [packageCategories, setPackageCategories] = useState([]);

  // Add New Item
  const [newItemTitle, setNewItemTitle] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [itemFoodtype, setItemFoodtype] = useState("");

  // Category Tags
  const [packageCategoriesTags, setPackageCategoriesTags] = useState({});

  // UX states
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [tagAnchorEl, setTagAnchorEl] = useState(null);
  const [tagCategoryId, setTagCategoryId] = useState(null);
  const [tempTagValue, setTempTagValue] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchPackageItems(setPackageItemsMaster, () => {});
      fetchPackageCategories(setPackageCategories);
      setFormData({
        title: "",
        subTitle: "",
        actualPrice: "",
        discountedPrice: "",
        maxGuests: "",
        tag: "",
        packageItems: [],
        packageAddons: [""],
      });
      setPackageImage(null);
      setImagePreview("");
      setPackageCategoriesTags({});
      setNewItemTitle("");
      setSelectedCategories([]);
      setItemFoodtype("");
      setSelectedCategoryId("all");
      setSelectedCategoryName("");
      setItemSearch("");
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // Group items by category
  const { categoriesWithItems, uncategorizedItems } = useMemo(() => {
    const map = {};
    const uncategorized = [];

    packageItemsMaster.forEach((item) => {
      if (!item.categoryIds?.length) {
        uncategorized.push(item);
        return;
      }
      item.categoryIds.forEach((cat) => {
        const id = typeof cat === "object" ? cat._id : cat;
        const title = typeof cat === "object" ? cat.title : "Unknown";
        if (!map[id]) {
          map[id] = { id, title, items: [] };
        }
        if (!map[id].items.find((i) => i._id === item._id)) {
          map[id].items.push(item);
        }
      });
    });

    return {
      categoriesWithItems: Object.values(map).sort((a, b) =>
        a.title.localeCompare(b.title)
      ),
      uncategorizedItems: uncategorized,
    };
  }, [packageItemsMaster]);

  // Filtered items
  const displayedItems = useMemo(() => {
    let items = [];

    if (selectedCategoryId === "all") {
      items = packageItemsMaster;
    } else if (selectedCategoryId === "uncategorized") {
      items = uncategorizedItems;
    } else {
      const cat = categoriesWithItems.find((c) => c.id === selectedCategoryId);
      items = cat ? cat.items : [];
    }

    if (itemSearch.trim()) {
      const q = itemSearch.toLowerCase();
      items = items.filter((item) => item.title.toLowerCase().includes(q));
    }

    return items;
  }, [
    selectedCategoryId,
    itemSearch,
    packageItemsMaster,
    categoriesWithItems,
    uncategorizedItems,
  ]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPackageImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemSelection = (itemId) => {
    setFormData((prev) => {
      const exists = prev.packageItems.includes(itemId);
      return {
        ...prev,
        packageItems: exists
          ? prev.packageItems.filter((id) => id !== itemId)
          : [...prev.packageItems, itemId],
      };
    });
  };

  const handleAddonChange = (index, value) => {
    const updated = [...formData.packageAddons];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, packageAddons: updated }));
  };

  const addAddonField = () => {
    setFormData((prev) => ({
      ...prev,
      packageAddons: [...prev.packageAddons, ""],
    }));
  };

  const removeAddon = (index) => {
    const updated = [...formData.packageAddons];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, packageAddons: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append("venueId", venueId);
    payload.append("title", formData.title);
    payload.append("subTitle", formData.subTitle);
    payload.append("actualPrice", formData.actualPrice);
    payload.append("discountedPrice", formData.discountedPrice);
    payload.append("maxGuests", formData.maxGuests);
    payload.append("tag", formData.tag);
    payload.append("packageItems", JSON.stringify(formData.packageItems));
    payload.append("packageAddons", JSON.stringify(formData.packageAddons));
    payload.append(
      "packageCategoriesTags",
      JSON.stringify(packageCategoriesTags)
    );

    if (packageImage) {
      payload.append("image", packageImage);
    }

    createVenuePackage(payload, onSuccess, onClose, setLoadingCreate);
  };

  const handleAddItem = async () => {
    if (!newItemTitle.trim()) return;

    const payload = {
      title: newItemTitle,
      categoryIds: selectedCategories,
      foodType: itemFoodtype,
    };

    try {
      await fetch(`${BASE_URL}/api/party-venue/package-item/create-item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setNewItemTitle("");
      setSelectedCategories([]);
      setItemFoodtype("");
      fetchPackageItems(setPackageItemsMaster, () => {});
    } catch (err) {
      console.error(err);
    }
  };

  // Tag popover
  const openTagPopover = (event, categoryId) => {
    setTagAnchorEl(event.currentTarget);
    setTagCategoryId(categoryId);
    setTempTagValue(packageCategoriesTags[categoryId] || "");
  };

  const closeTagPopover = () => {
    setTagAnchorEl(null);
    setTagCategoryId(null);
    setTempTagValue("");
  };

  const saveTag = () => {
    if (tagCategoryId) {
      setPackageCategoriesTags((prev) => ({
        ...prev,
        [tagCategoryId]: tempTagValue,
      }));
    }
    closeTagPopover();
  };

  const selectedCountInCategory = (catId) => {
    if (catId === "all") return formData.packageItems.length;
    const cat = categoriesWithItems.find((c) => c.id === catId);
    if (!cat) return 0;
    return cat.items.filter((i) => formData.packageItems.includes(i._id)).length;
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "94vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          m: 0,
          p: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #e5e7eb",
          bgcolor: "#fafafa",
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Create Package
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{ p: 3, overflowY: "auto", flex: 1 }}
        className="slim-scrollbar"
      >
        <form id="create-package-form" onSubmit={handleSubmit}>
          {/* ========== BASIC INFO ========== */}
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            Basic Information
          </Typography>

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
            <TextField
              name="title"
              label="Package Title *"
              value={formData.title}
              onChange={handleChange}
              size="small"
              required
              fullWidth
            />
            <TextField
              name="subTitle"
              label="Package Subtitle *"
              value={formData.subTitle}
              onChange={handleChange}
              size="small"
              required
              fullWidth
            />
          </Box>

          <Box
            display="grid"
            gridTemplateColumns="1fr 1fr 1fr 1fr"
            gap={2}
            mb={2}
          >
            <TextField
              name="actualPrice"
              label="Actual Price *"
              type="number"
              value={formData.actualPrice}
              onChange={handleChange}
              size="small"
              required
              fullWidth
            />
            <TextField
              name="discountedPrice"
              label="Discounted Price"
              type="number"
              value={formData.discountedPrice}
              onChange={handleChange}
              size="small"
              fullWidth
            />
            <TextField
              name="maxGuests"
              label="Min Guests"
              type="number"
              value={formData.maxGuests}
              onChange={handleChange}
              size="small"
              fullWidth
            />
            <TextField
              name="tag"
              label="Tag"
              value={formData.tag}
              onChange={handleChange}
              size="small"
              fullWidth
            />
          </Box>

          <Box mb={3}>
            <Typography variant="body2" fontWeight={500} mb={1}>
              Package Banner Image
            </Typography>
            <Button
              variant="outlined"
              component="label"
              size="small"
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              {imagePreview ? "Change Image" : "Choose Image"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
            {imagePreview && (
              <Box mt={1.5}>
                <img
                  src={imagePreview}
                  alt="preview"
                  style={{
                    width: 180,
                    height: 110,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                />
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* ========== PACKAGE ITEMS ========== */}
          <Box display="flex" alignItems="center" gap={1.5} mb={2}>
            <Typography variant="subtitle1" fontWeight={700}>
              Package Items
            </Typography>
            <Chip
              label={`${formData.packageItems.length} selected`}
              size="small"
              color={formData.packageItems.length > 0 ? "primary" : "default"}
              sx={{ fontWeight: 600 }}
            />
          </Box>

          {/* 3-Column Layout */}
          <Box
            display="flex"
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: 2,
              overflow: "hidden",
              height: 440,
            }}
          >
            {/* LEFT: Categories (~22%) */}
            <Box
              sx={{
                width: "22%",
                minWidth: 200,
                borderRight: "1px solid #e5e7eb",
                bgcolor: "#f8fafc",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ p: 1.5, borderBottom: "1px solid #e5e7eb" }}>
                <Typography fontWeight={600} fontSize={13} color="text.secondary">
                  Categories ({categoriesWithItems.length})
                </Typography>
              </Box>

              <List
                dense
                className="slim-scrollbar"
                sx={{ overflowY: "auto", flex: 1, py: 0 }}
              >
                <ListItemButton
                  selected={selectedCategoryId === "all"}
                  onClick={() => {
                    setSelectedCategoryId("all");
                    setSelectedCategoryName("");
                  }}
                  sx={{ py: 1 }}
                >
                  <ListItemText
                    primary="All Items"
                    primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
                  />
                  <Chip
                    label={packageItemsMaster.length}
                    size="small"
                    sx={{ height: 20, fontSize: 11 }}
                  />
                </ListItemButton>

                {uncategorizedItems.length > 0 && (
                  <ListItemButton
                    selected={selectedCategoryId === "uncategorized"}
                    onClick={() => {
                      setSelectedCategoryId("uncategorized");
                      setSelectedCategoryName("Uncategorized");
                    }}
                    sx={{ py: 1 }}
                  >
                    <ListItemText
                      primary="Uncategorized"
                      primaryTypographyProps={{ fontSize: 13 }}
                    />
                    <Chip
                      label={uncategorizedItems.length}
                      size="small"
                      sx={{ height: 20, fontSize: 11 }}
                    />
                  </ListItemButton>
                )}

                {categoriesWithItems.map((cat) => {
                  const selectedInCat = selectedCountInCategory(cat.id);
                  return (
                    <ListItemButton
                      key={cat.id}
                      selected={selectedCategoryId === cat.id}
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        setSelectedCategoryName(cat.title);
                      }}
                      sx={{ py: 1 }}
                    >
                      <ListItemText
                        primary={cat.title}
                        secondary={
                          packageCategoriesTags[cat.id]
                            ? packageCategoriesTags[cat.id]
                            : null
                        }
                        primaryTypographyProps={{ fontSize: 13, noWrap: true }}
                        secondaryTypographyProps={{ fontSize: 11, noWrap: true }}
                      />
                      <Box display="flex" alignItems="center" gap={0.5}>
                        {selectedInCat > 0 && (
                          <Chip
                            label={selectedInCat}
                            size="small"
                            color="primary"
                            sx={{ height: 18, fontSize: 10 }}
                          />
                        )}
                        <Chip
                          label={cat.items.length}
                          size="small"
                          sx={{ height: 18, fontSize: 10 }}
                        />
                      </Box>
                    </ListItemButton>
                  );
                })}
              </List>
            </Box>

            {/* MIDDLE: Items List (~53%) */}
            <Box
              sx={{
                width: "53%",
                display: "flex",
                flexDirection: "column",
                borderRight: "1px solid #e5e7eb",
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <TextField
                  size="small"
                  placeholder="Search in this category..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                {selectedCategoryId !== "all" &&
                  selectedCategoryId !== "uncategorized" && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<LocalOfferOutlinedIcon />}
                      onClick={(e) => openTagPopover(e, selectedCategoryId)}
                      sx={{
                        textTransform: "none",
                        whiteSpace: "nowrap",
                        minWidth: 130,
                      }}
                    >
                      {packageCategoriesTags[selectedCategoryId]
                        ? "Edit Tag"
                        : "Add Tag"}
                    </Button>
                  )}
              </Box>

              <Box
                className="slim-scrollbar"
                sx={{ overflowY: "auto", flex: 1, p: 1 }}
              >
                {displayedItems.length === 0 ? (
                  <Typography
                    color="text.secondary"
                    textAlign="center"
                    py={6}
                    fontSize={14}
                  >
                    {itemSearch
                      ? "No items match your search"
                      : "No items in this category"}
                  </Typography>
                ) : (
                  displayedItems.map((item) => (
                    <FormControlLabel
                      key={item._id}
                      control={
                        <Checkbox
                          size="small"
                          checked={formData.packageItems.includes(item._id)}
                          onChange={() => handleItemSelection(item._id)}
                        />
                      }
                      label={
                        <Typography fontSize={13}>
                          {item.foodType === "veg" ? "🟢" : "🔴"} {item.title}
                        </Typography>
                      }
                      sx={{
                        display: "flex",
                        ml: 0.5,
                        borderRadius: 1,
                        width: "100%",
                        "&:hover": { bgcolor: "#f8fafc" },
                      }}
                    />
                  ))
                )}
              </Box>
            </Box>

            {/* RIGHT: Add New Item (~25%) */}
            <Box
              sx={{
                width: "25%",
                minWidth: 220,
                bgcolor: "#fafafa",
                display: "flex",
                flexDirection: "column",
                p: 2,
              }}
            >
              <Typography fontWeight={700} fontSize={14} mb={2}>
                Add New Item
              </Typography>

              <TextField
                size="small"
                label="Item Title"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              />

              <Typography
                fontSize={12}
                fontWeight={500}
                mb={0.8}
                color="text.secondary"
              >
                Category
              </Typography>
              <Box
                className="slim-scrollbar"
                sx={{
                  flex: 1,
                  maxHeight: 160,
                  overflowY: "auto",
                  border: "1px solid #e5e7eb",
                  borderRadius: 1.5,
                  bgcolor: "white",
                  mb: 2,
                  px: 0.5,
                }}
              >
                {packageCategories?.map((cat) => (
                  <FormControlLabel
                    key={cat._id}
                    control={
                      <Radio
                        size="small"
                        checked={selectedCategories[0] === cat._id}
                        onChange={() => setSelectedCategories([cat._id])}
                      />
                    }
                    label={
                      <Typography fontSize={12.5} noWrap>
                        {cat.title}
                      </Typography>
                    }
                    sx={{
                      display: "flex",
                      width: "100%",
                      ml: 0.5,
                      my: 0.2,
                    }}
                  />
                ))}
              </Box>

              <Typography
                fontSize={12}
                fontWeight={500}
                mb={0.8}
                color="text.secondary"
              >
                Food Type
              </Typography>
              <RadioGroup
                row
                value={itemFoodtype}
                onChange={(e) => setItemFoodtype(e.target.value)}
                sx={{ mb: 2 }}
              >
                <FormControlLabel
                  value="veg"
                  control={<Radio size="small" />}
                  label={<Typography fontSize={13}>Veg</Typography>}
                />
                <FormControlLabel
                  value="non-veg"
                  control={<Radio size="small" />}
                  label={<Typography fontSize={13}>Non-Veg</Typography>}
                />
              </RadioGroup>

              <Button
                variant="contained"
                size="small"
                fullWidth
                onClick={handleAddItem}
                disabled={!newItemTitle.trim() || selectedCategories.length === 0}
                sx={{ textTransform: "none", borderRadius: 2, mt: "auto" }}
              >
                Add Item
              </Button>
            </Box>
          </Box>

          {/* Tag Popover */}
          <Popover
            open={Boolean(tagAnchorEl)}
            anchorEl={tagAnchorEl}
            onClose={closeTagPopover}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <Box sx={{ p: 2, width: 320 }}>
              <Typography fontWeight={600} fontSize={14} mb={2}>
                Category: {selectedCategoryName}
              </Typography>
              <TextField
                size="small"
                fullWidth
                autoFocus
                placeholder={`e.g. Select 2 ${selectedCategoryName}`}
                value={tempTagValue}
                onChange={(e) => setTempTagValue(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box display="flex" justifyContent="flex-end" gap={1}>
                <Button size="small" onClick={closeTagPopover}>
                  Cancel
                </Button>
                <Button size="small" variant="contained" onClick={saveTag}>
                  Save Tag
                </Button>
              </Box>
            </Box>
          </Popover>

          <Divider sx={{ my: 3 }} />

          {/* ========== ADDONS ========== */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={1.5}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              Addons
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={addAddonField}
              sx={{ textTransform: "none" }}
            >
              Add Addon
            </Button>
          </Box>

          {formData.packageAddons.map((addon, index) => (
            <Box
              key={index}
              display="flex"
              gap={1}
              mb={1.5}
              alignItems="center"
            >
              <TextField
                size="small"
                placeholder={`Addon ${index + 1}`}
                value={addon}
                onChange={(e) => handleAddonChange(index, e.target.value)}
                fullWidth
              />
              <IconButton
                size="small"
                color="error"
                onClick={() => removeAddon(index)}
                disabled={formData.packageAddons.length === 1}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </form>
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          p: 2.5,
          borderTop: "1px solid #e5e7eb",
          bgcolor: "#fafafa",
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="create-package-form"
          variant="contained"
          disabled={loadingCreate}
          sx={{ textTransform: "none", borderRadius: 2, minWidth: 150 }}
        >
          {loadingCreate ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            "Create Package"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePackagePopup;