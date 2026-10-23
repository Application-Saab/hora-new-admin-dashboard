// // // // // "use client";

// // // // // import React, { useEffect, useState } from "react";

// // // // // import {
// // // // //   updateVenuePackage,
// // // // //   fetchPackageItems,
// // // // //   fetchPackageCategories,
// // // // //   createVenuePackage,
// // // // // } from "@/services/venueListServices";
// // // // // import { BASE_URL } from "@/utils/apiconstant";

// // // // // const EditPackagePopup = ({
// // // // //   isOpen,
// // // // //   onClose,
// // // // //   onSuccess,
// // // // //   packageData,
// // // // //   isCloningPackage,
// // // // // }) => {
// // // // //   const [loadingUpdate, setLoadingUpdate] = useState(false);
// // // // //   const [packageItemsMaster, setPackageItemsMaster] = useState([]);
// // // // //   const [filteredItems, setFilteredItems] = useState([]);
// // // // //   const [packageCategories, setPackageCategories] = useState([]);
// // // // //   const [newItemTitle, setNewItemTitle] = useState("");
// // // // //   const [selectedCategories, setSelectedCategories] = useState([]);
// // // // //   const [itemFoodtype, setItemFoodtype] = useState("");

// // // // //   const [showTagModal, setShowTagModal] = useState(false);
// // // // //   const [selectedCategory, setSelectedCategory] = useState(null);
// // // // //   const [categoryTagValue, setCategoryTagValue] = useState("");
// // // // //   const [packageCategoriesTags, setPackageCategoriesTags] = useState({});

// // // // //   const [formData, setFormData] = useState({
// // // // //     title: "",
// // // // //     subTitle: "",
// // // // //     actualPrice: "",
// // // // //     discountedPrice: "",
// // // // //     maxGuests: "",
// // // // //     packageItems: [],
// // // // //     packageAddons: [""],
// // // // //     tag: "",
// // // // //   });

// // // // //   const [packageImage, setPackageImage] = useState(null);

// // // // //   const [imagePreview, setImagePreview] = useState("");

// // // // //   useEffect(() => {
// // // // //     if (isOpen) {
// // // // //       fetchPackageItems(setPackageItemsMaster, setFilteredItems);
// // // // //       fetchPackageCategories(setPackageCategories);
// // // // //     }
// // // // //   }, [isOpen]);

// // // // //   const handleImageChange = (e) => {
// // // // //     const file = e.target.files?.[0];

// // // // //     if (!file) return;

// // // // //     setPackageImage(file);

// // // // //     setImagePreview(URL.createObjectURL(file));
// // // // //   };

// // // // //   const handleAddItem = async () => {
// // // // //     if (!newItemTitle) return;

// // // // //     const payload = {
// // // // //       title: newItemTitle,
// // // // //       categoryIds: selectedCategories,
// // // // //       foodType: itemFoodtype,
// // // // //     };

// // // // //     try {
// // // // //       await fetch(`${BASE_URL}/api/party-venue/package-item/create-item`, {
// // // // //         method: "POST",
// // // // //         headers: { "Content-Type": "application/json" },
// // // // //         body: JSON.stringify(payload),
// // // // //       });

// // // // //       // reset
// // // // //       setNewItemTitle("");
// // // // //       setSelectedCategories([]);
// // // // //       setItemFoodtype("");

// // // // //       // 🔥 refetch items
// // // // //       fetchPackageItems(setPackageItemsMaster, setFilteredItems);
// // // // //     } catch (err) {
// // // // //       console.log(err);
// // // // //     }
// // // // //   };

// // // // //   useEffect(() => {
// // // // //     return () => {
// // // // //       if (imagePreview) {
// // // // //         URL.revokeObjectURL(imagePreview);
// // // // //       }
// // // // //     };
// // // // //   }, [imagePreview]);

// // // // //   useEffect(() => {
// // // // //     if (isOpen && packageData) {
// // // // //       setFormData({
// // // // //         title: packageData.title || "",
// // // // //         subTitle: packageData.subTitle || "",
// // // // //         actualPrice: packageData.actualPrice || "",
// // // // //         discountedPrice: packageData.discountedPrice || "",
// // // // //         maxGuests: packageData.maxGuests || "",
// // // // //         packageItems: packageData.packageItems?.map((item) => item._id) || [],
// // // // //         packageAddons: packageData.packageAddons?.length
// // // // //           ? packageData.packageAddons
// // // // //           : [""],
// // // // //         tag: packageData.tag || "",
// // // // //       });

// // // // //       setImagePreview(packageData.packageImageUrl || "");
// // // // //       setPackageCategoriesTags(packageData.packageCategoriesTags || {});
// // // // //     }
// // // // //   }, [isOpen, packageData]);

// // // // //   const handleChange = (e) => {
// // // // //     const { name, value } = e.target;

// // // // //     setFormData((prev) => ({
// // // // //       ...prev,
// // // // //       [name]: value,
// // // // //     }));
// // // // //   };

// // // // //   const handleItemSelection = (itemId) => {
// // // // //     setFormData((prev) => {
// // // // //       const exists = prev.packageItems.includes(itemId);

// // // // //       return {
// // // // //         ...prev,
// // // // //         packageItems: exists
// // // // //           ? prev.packageItems.filter((id) => id !== itemId)
// // // // //           : [...prev.packageItems, itemId],
// // // // //       };
// // // // //     });
// // // // //   };

// // // // //   const groupedItems = filteredItems.reduce((acc, item) => {
// // // // //     if (!item.categoryIds?.length) {
// // // // //       if (!acc["Uncategorized"]) {
// // // // //         acc["Uncategorized"] = [];
// // // // //       }

// // // // //       acc["Uncategorized"].push(item);
// // // // //       return acc;
// // // // //     }

// // // // //     item.categoryIds.forEach((cat) => {
// // // // //       const categoryName =
// // // // //         typeof cat === "object" ? cat.title : "Unknown Category";

// // // // //       if (!acc[categoryName]) {
// // // // //         acc[categoryName] = [];
// // // // //       }

// // // // //       acc[categoryName].push(item);
// // // // //     });

// // // // //     return acc;
// // // // //   }, {});

// // // // //   const handleAddonChange = (index, value) => {
// // // // //     const updated = [...formData.packageAddons];

// // // // //     updated[index] = value;

// // // // //     setFormData((prev) => ({
// // // // //       ...prev,
// // // // //       packageAddons: updated,
// // // // //     }));
// // // // //   };

// // // // //   const addAddonField = () => {
// // // // //     setFormData((prev) => ({
// // // // //       ...prev,
// // // // //       packageAddons: [...prev.packageAddons, ""],
// // // // //     }));
// // // // //   };

// // // // //   const removeAddon = (index) => {
// // // // //     const updated = [...formData.packageAddons];

// // // // //     updated.splice(index, 1);

// // // // //     setFormData((prev) => ({
// // // // //       ...prev,
// // // // //       packageAddons: updated,
// // // // //     }));
// // // // //   };

// // // // //   const handleSubmit = async (e) => {
// // // // //     e.preventDefault();

// // // // //     const payload = new FormData();

// // // // //     payload.append("venueId", packageData.venueId); // create ke liye required

// // // // //     payload.append("title", formData.title);
// // // // //     payload.append("subTitle", formData.subTitle);
// // // // //     payload.append("actualPrice", formData.actualPrice);
// // // // //     payload.append("discountedPrice", formData.discountedPrice);
// // // // //     payload.append("maxGuests", formData.maxGuests);
// // // // //     payload.append("packageItems", JSON.stringify(formData.packageItems));
// // // // //     payload.append("packageAddons", JSON.stringify(formData.packageAddons));
// // // // //     payload.append("tag", formData.tag);
// // // // //     payload.append(
// // // // //       "packageCategoriesTags",
// // // // //       JSON.stringify(packageCategoriesTags),
// // // // //     );

// // // // //     if (packageImage) {
// // // // //       payload.append("image", packageImage);
// // // // //     }

// // // // //     if (isCloningPackage) {
// // // // //       createVenuePackage(payload, onSuccess, onClose, setLoadingUpdate);
// // // // //     } else {
// // // // //       updateVenuePackage(
// // // // //         packageData._id,
// // // // //         payload,
// // // // //         onSuccess,
// // // // //         onClose,
// // // // //         setLoadingUpdate,
// // // // //       );
// // // // //     }
// // // // //   };
// // // // //   if (!isOpen) return null;

// // // // //   return (
// // // // //     <div className="popup-overlay">
// // // // //       <div className="popup-content">
// // // // //         <button className="close-btn" onClick={onClose}>
// // // // //           X
// // // // //         </button>

// // // // //         <h2>{isCloningPackage ? "Clone Package" : "Edit Package"}</h2>

// // // // //         <form onSubmit={handleSubmit}>
// // // // //           <div className="package-form-container">
// // // // //             <div className="package-create-input-ctn">
// // // // //               <input
// // // // //                 type="text"
// // // // //                 name="title"
// // // // //                 placeholder="Package Title"
// // // // //                 value={formData.title}
// // // // //                 onChange={handleChange}
// // // // //                 required
// // // // //                 className="package-create-input"
// // // // //               />

// // // // //               <input
// // // // //                 type="text"
// // // // //                 name="subTitle"
// // // // //                 placeholder="Package Subtitle"
// // // // //                 value={formData.subTitle}
// // // // //                 onChange={handleChange}
// // // // //                 required
// // // // //                 className="package-create-input"
// // // // //               />
// // // // //             </div>

// // // // //             <div className="package-create-input-ctn">
// // // // //               <input
// // // // //                 type="number"
// // // // //                 name="actualPrice"
// // // // //                 placeholder="Actual Price"
// // // // //                 value={formData.actualPrice}
// // // // //                 onChange={handleChange}
// // // // //                 required
// // // // //                 className="package-create-input"
// // // // //               />

// // // // //               <input
// // // // //                 type="number"
// // // // //                 name="discountedPrice"
// // // // //                 placeholder="Discounted Price"
// // // // //                 value={formData.discountedPrice}
// // // // //                 onChange={handleChange}
// // // // //                 className="package-create-input"
// // // // //               />
// // // // //             </div>

// // // // //             <div className="package-create-input-ctn">
// // // // //               <input
// // // // //                 type="number"
// // // // //                 name="maxGuests"
// // // // //                 placeholder="Max Guests"
// // // // //                 value={formData.maxGuests}
// // // // //                 onChange={handleChange}
// // // // //                 className="package-create-input"
// // // // //               />
// // // // //               <input
// // // // //                 type="text"
// // // // //                 name="tag"
// // // // //                 placeholder="Tag"
// // // // //                 value={formData.tag}
// // // // //                 onChange={handleChange}
// // // // //                 className="package-create-input"
// // // // //               />
// // // // //             </div>

// // // // //             <h4>Package Banner Image</h4>

// // // // //             <div
// // // // //               style={{
// // // // //                 marginBottom: "20px",
// // // // //               }}
// // // // //             >
// // // // //               <input
// // // // //                 type="file"
// // // // //                 accept="image/*"
// // // // //                 onChange={handleImageChange}
// // // // //               />

// // // // //               {imagePreview && (
// // // // //                 <div
// // // // //                   style={{
// // // // //                     marginTop: "10px",
// // // // //                   }}
// // // // //                 >
// // // // //                   <img
// // // // //                     src={imagePreview}
// // // // //                     alt="preview"
// // // // //                     style={{
// // // // //                       width: "200px",
// // // // //                       height: "120px",
// // // // //                       objectFit: "cover",
// // // // //                       borderRadius: "8px",
// // // // //                       border: "1px solid #ddd",
// // // // //                     }}
// // // // //                   />
// // // // //                 </div>
// // // // //               )}
// // // // //             </div>

// // // // //             <h4>Package Items</h4>
// // // // //             <div style={{ display: "flex", gap: "20px" }}>
// // // // //               <div
// // // // //                 style={{
// // // // //                   maxHeight: "250px",
// // // // //                   overflowY: "auto",
// // // // //                   border: "1px solid #ddd",
// // // // //                   padding: "10px",
// // // // //                   marginBottom: "20px",
// // // // //                   width: "60%",
// // // // //                 }}
// // // // //               >
// // // // //                 <input
// // // // //                   type="text"
// // // // //                   placeholder="Search items..."
// // // // //                   className="package-create-input"
// // // // //                   style={{ marginBottom: "10px" }}
// // // // //                   onChange={(e) => {
// // // // //                     const searchTerm = e.target.value.toLowerCase();

// // // // //                     if (!searchTerm) {
// // // // //                       setFilteredItems(packageItemsMaster);
// // // // //                       return;
// // // // //                     }

// // // // //                     const filtered = packageItemsMaster.filter((item) =>
// // // // //                       item.title.toLowerCase().includes(searchTerm),
// // // // //                     );

// // // // //                     setFilteredItems(filtered);
// // // // //                   }}
// // // // //                 />
// // // // //                 {filteredItems.length === 0 && (
// // // // //                   <div style={{ textAlign: "center", color: "#888" }}>
// // // // //                     No items found.
// // // // //                   </div>
// // // // //                 )}
// // // // //                 {Object.entries(groupedItems).map(([categoryName, items]) => {
// // // // //                   const categoryId = items[0]?.categoryIds?.find(
// // // // //                     (cat) => cat.title === categoryName,
// // // // //                   )?._id;
// // // // //                   return (
// // // // //                     <div key={categoryName}>
// // // // //                       <div
// // // // //                         style={{
// // // // //                           display: "flex",
// // // // //                           justifyContent: "space-between",
// // // // //                           background: "#f5f5f5",
// // // // //                           padding: "8px 10px",
// // // // //                           fontWeight: 600,
// // // // //                           fontSize: "14px",
// // // // //                           borderBottom: "1px solid #ddd",
// // // // //                         }}
// // // // //                       >
// // // // //                         <div>
// // // // //                           {categoryName}

// // // // //                           {packageCategoriesTags[categoryId] && (
// // // // //                             <span
// // // // //                               style={{
// // // // //                                 marginLeft: "10px",
// // // // //                                 color: "#666",
// // // // //                                 fontWeight: 400,
// // // // //                               }}
// // // // //                             >
// // // // //                               ({packageCategoriesTags[categoryId]})
// // // // //                             </span>
// // // // //                           )}
// // // // //                         </div>
// // // // //                         <div style={{ display: "flex" }}>
// // // // //                           <button
// // // // //                             type="button"
// // // // //                             style={{ cursor: "pointer" }}
// // // // //                             onClick={() => {
// // // // //                               setSelectedCategory({
// // // // //                                 title: categoryName,
// // // // //                                 id: items[0]?.categoryIds?.find(
// // // // //                                   (cat) => cat.title === categoryName,
// // // // //                                 )?._id,
// // // // //                               });

// // // // //                               setCategoryTagValue(
// // // // //                                 packageCategoriesTags[
// // // // //                                   items[0]?.categoryIds?.find(
// // // // //                                     (cat) => cat.title === categoryName,
// // // // //                                   )?._id
// // // // //                                 ] || "",
// // // // //                               );

// // // // //                               setShowTagModal(true);
// // // // //                             }}
// // // // //                           >
// // // // //                             Add Tag
// // // // //                           </button>
// // // // //                         </div>
// // // // //                       </div>

// // // // //                       {items.map((item) => (
// // // // //                         <div
// // // // //                           key={item._id}
// // // // //                           className="items-dropdown-ctn"
// // // // //                           onClick={() => handleItemSelection(item._id)}
// // // // //                         >
// // // // //                           <div>
// // // // //                             <label
// // // // //                               style={{
// // // // //                                 fontSize: "12px",
// // // // //                                 margin: 0,
// // // // //                               }}
// // // // //                             >
// // // // //                               {item.foodType === "veg" ? "🟢" : "🔴"}{" "}
// // // // //                               {item.title}
// // // // //                             </label>
// // // // //                           </div>

// // // // //                           <div>
// // // // //                             <input
// // // // //                               type="checkbox"
// // // // //                               checked={formData.packageItems.includes(item._id)}
// // // // //                               onChange={() => handleItemSelection(item._id)}
// // // // //                             />
// // // // //                           </div>
// // // // //                         </div>
// // // // //                       ))}
// // // // //                     </div>
// // // // //                   );
// // // // //                 })}
// // // // //               </div>

// // // // //               {showTagModal && (
// // // // //                 <div className="popup-overlay">
// // // // //                   <div
// // // // //                     style={{
// // // // //                       background: "#fff",
// // // // //                       padding: "20px",
// // // // //                       borderRadius: "10px",
// // // // //                       width: "400px",
// // // // //                     }}
// // // // //                   >
// // // // //                     <h3>{selectedCategory?.title}</h3>

// // // // //                     <input
// // // // //                       type="text"
// // // // //                       placeholder="Enter tag"
// // // // //                       value={categoryTagValue}
// // // // //                       onChange={(e) => setCategoryTagValue(e.target.value)}
// // // // //                       className="package-create-input"
// // // // //                     />

// // // // //                     <div
// // // // //                       style={{
// // // // //                         display: "flex",
// // // // //                         justifyContent: "flex-end",
// // // // //                         gap: "10px",
// // // // //                         marginTop: "15px",
// // // // //                       }}
// // // // //                     >
// // // // //                       <button
// // // // //                         type="button"
// // // // //                         onClick={() => setShowTagModal(false)}
// // // // //                       >
// // // // //                         Cancel
// // // // //                       </button>

// // // // //                       <button
// // // // //                         type="button"
// // // // //                         onClick={() => {
// // // // //                           setPackageCategoriesTags((prev) => ({
// // // // //                             ...prev,
// // // // //                             [selectedCategory.id]: categoryTagValue,
// // // // //                           }));

// // // // //                           setShowTagModal(false);
// // // // //                         }}
// // // // //                       >
// // // // //                         Save
// // // // //                       </button>
// // // // //                     </div>
// // // // //                   </div>
// // // // //                 </div>
// // // // //               )}

// // // // //               <div>
// // // // //                 <h4 style={{ margin: "0px" }}>Add New Item</h4>
// // // // //                 <input
// // // // //                   type="text"
// // // // //                   placeholder="Item Title"
// // // // //                   value={newItemTitle}
// // // // //                   onChange={(e) => setNewItemTitle(e.target.value)}
// // // // //                 />
// // // // //                 <div
// // // // //                   style={{
// // // // //                     maxHeight: "150px",
// // // // //                     overflowY: "auto",
// // // // //                     border: "1px solid #ddd",
// // // // //                     padding: "10px",
// // // // //                     marginTop: "10px",
// // // // //                     width: "100%",
// // // // //                   }}
// // // // //                 >
// // // // //                   {packageCategories?.map((cat) => (
// // // // //                     <div
// // // // //                       key={cat._id}
// // // // //                       className="items-dropdown-ctn"
// // // // //                       onClick={() => {
// // // // //                         if (selectedCategories.includes(cat._id)) {
// // // // //                           setSelectedCategories((prev) =>
// // // // //                             prev.filter((id) => id !== cat._id),
// // // // //                           );
// // // // //                         } else {
// // // // //                           setSelectedCategories((prev) => [...prev, cat._id]);
// // // // //                         }
// // // // //                       }}
// // // // //                     >
// // // // //                       <div>
// // // // //                         <label style={{ fontSize: "12px", margin: "0px" }}>
// // // // //                           {cat.title}
// // // // //                         </label>
// // // // //                       </div>
// // // // //                       <div>
// // // // //                         <input
// // // // //                           type="checkbox"
// // // // //                           checked={selectedCategories.includes(cat._id)}
// // // // //                           onChange={() => {
// // // // //                             setSelectedCategories((prev) =>
// // // // //                               prev.includes(cat._id)
// // // // //                                 ? prev.filter((id) => id !== cat._id)
// // // // //                                 : [...prev, cat._id],
// // // // //                             );
// // // // //                           }}
// // // // //                         />
// // // // //                       </div>
// // // // //                     </div>
// // // // //                   ))}
// // // // //                 </div>
// // // // //                 <div
// // // // //                   style={{
// // // // //                     display: "flex",
// // // // //                     justifyContent: "space-between",
// // // // //                     alignItems: "center",
// // // // //                     width: "100%",
// // // // //                   }}
// // // // //                 >
// // // // //                   <div
// // // // //                     style={{
// // // // //                       display: "flex",
// // // // //                       alignItems: "center",
// // // // //                       gap: "10px",
// // // // //                     }}
// // // // //                   >
// // // // //                     <input
// // // // //                       type="radio"
// // // // //                       name="foodType"
// // // // //                       value="veg"
// // // // //                       onChange={(e) => setItemFoodtype(e.target.value)}
// // // // //                     />
// // // // //                     <label
// // // // //                       for="foodType1"
// // // // //                       style={{ margin: "0px", fontSize: "12px" }}
// // // // //                     >
// // // // //                       Veg
// // // // //                     </label>
// // // // //                     <input
// // // // //                       type="radio"
// // // // //                       name="foodType"
// // // // //                       value="non-veg"
// // // // //                       style={{ marginLeft: "10px" }}
// // // // //                       onChange={(e) => setItemFoodtype(e.target.value)}
// // // // //                     />
// // // // //                     <label
// // // // //                       for="foodType2"
// // // // //                       style={{ margin: "0px", fontSize: "12px" }}
// // // // //                     >
// // // // //                       Non-Veg
// // // // //                     </label>
// // // // //                   </div>
// // // // //                   <div>
// // // // //                     <button
// // // // //                       style={{ marginTop: "5px", cursor: "pointer" }}
// // // // //                       onClick={handleAddItem}
// // // // //                       type="button"
// // // // //                     >
// // // // //                       Add Item
// // // // //                     </button>
// // // // //                   </div>
// // // // //                 </div>
// // // // //               </div>
// // // // //             </div>

// // // // //             <h4>Addons</h4>

// // // // //             {formData.packageAddons.map((addon, index) => (
// // // // //               <div key={index} className="package-create-input-ctn">
// // // // //                 <input
// // // // //                   type="text"
// // // // //                   value={addon}
// // // // //                   placeholder="Addon"
// // // // //                   onChange={(e) => handleAddonChange(index, e.target.value)}
// // // // //                   className="package-create-input"
// // // // //                 />

// // // // //                 <button type="button" onClick={() => removeAddon(index)}>
// // // // //                   Remove
// // // // //                 </button>
// // // // //               </div>
// // // // //             ))}

// // // // //             <button type="button" onClick={addAddonField}>
// // // // //               Add Addon
// // // // //             </button>

// // // // //             <div
// // // // //               style={{
// // // // //                 marginTop: "30px",
// // // // //                 display: "flex",
// // // // //                 justifyContent: "flex-end",
// // // // //                 gap: "10px",
// // // // //               }}
// // // // //             >
// // // // //               <button
// // // // //                 type="button"
// // // // //                 onClick={onClose}
// // // // //                 className="package-create-btn package-cancel-btn"
// // // // //               >
// // // // //                 Cancel
// // // // //               </button>

// // // // //               <button
// // // // //                 type="submit"
// // // // //                 className="package-create-btn"
// // // // //                 disabled={loadingUpdate}
// // // // //               >
// // // // //                 {loadingUpdate ? "Updating..." : "Update Package"}
// // // // //               </button>
// // // // //             </div>
// // // // //           </div>
// // // // //         </form>
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default EditPackagePopup;




// // // // "use client";

// // // // import React, { useEffect, useState, useCallback } from "react";
// // // // import {
// // // //   Dialog,
// // // //   DialogTitle,
// // // //   DialogContent,
// // // //   DialogActions,
// // // //   Button,
// // // //   TextField,
// // // //   Box,
// // // //   Typography,
// // // //   IconButton,
// // // //   Divider,
// // // //   CircularProgress,
// // // //   Checkbox,
// // // //   FormControlLabel,
// // // //   Radio,
// // // //   RadioGroup,
// // // //   Chip,
// // // //   List,
// // // //   ListItemButton,
// // // //   ListItemText,
// // // //   Popover,
// // // //   InputAdornment,
// // // // } from "@mui/material";
// // // // import CloseIcon from "@mui/icons-material/Close";
// // // // import AddIcon from "@mui/icons-material/Add";
// // // // import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
// // // // import SearchIcon from "@mui/icons-material/Search";
// // // // import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
// // // // import {
// // // //   updateVenuePackage,
// // // //   createVenuePackage,
// // // //   fetchPackageCategories,
// // // //   fetchPackageItemsByCategory,
// // // // } from "@/services/venueListServices";
// // // // import { BASE_URL } from "@/utils/apiconstant";

// // // // const EditPackagePopup = ({
// // // //   isOpen,
// // // //   onClose,
// // // //   onSuccess,
// // // //   packageData,
// // // //   isCloningPackage,
// // // // }) => {
// // // //   const [loadingUpdate, setLoadingUpdate] = useState(false);
// // // //   const [formData, setFormData] = useState({
// // // //     title: "",
// // // //     subTitle: "",
// // // //     actualPrice: "",
// // // //     discountedPrice: "",
// // // //     maxGuests: "",
// // // //     tag: "",
// // // //     packageItems: [],
// // // //     packageAddons: [""],
// // // //   });

// // // //   const [packageImage, setPackageImage] = useState(null);
// // // //   const [imagePreview, setImagePreview] = useState("");
// // // //   const [packageCategories, setPackageCategories] = useState([]);

// // // //   // Add New Item
// // // //   const [newItemTitle, setNewItemTitle] = useState("");
// // // //   const [selectedCategories, setSelectedCategories] = useState([]);
// // // //   const [itemFoodtype, setItemFoodtype] = useState("");

// // // //   // Category Tags
// // // //   const [packageCategoriesTags, setPackageCategoriesTags] = useState({});

// // // //   // UX states
// // // //   const [selectedCategoryId, setSelectedCategoryId] = useState("");
// // // //   const [selectedCategoryName, setSelectedCategoryName] = useState("");
// // // //   const [itemSearch, setItemSearch] = useState("");
// // // //   const [tagAnchorEl, setTagAnchorEl] = useState(null);
// // // //   const [tagCategoryId, setTagCategoryId] = useState(null);
// // // //   const [tempTagValue, setTempTagValue] = useState("");

// // // //   // Lazy loading
// // // //   const [itemsCache, setItemsCache] = useState({});
// // // //   const [loadingItems, setLoadingItems] = useState(false);
// // // //   const [displayedItems, setDisplayedItems] = useState([]);

// // // //   // ========== RESET + PREFILL ==========
// // // //   useEffect(() => {
// // // //     if (isOpen) {
// // // //       fetchPackageCategories(setPackageCategories);

// // // //       // Reset form first
// // // //       setFormData({
// // // //         title: "",
// // // //         subTitle: "",
// // // //         actualPrice: "",
// // // //         discountedPrice: "",
// // // //         maxGuests: "",
// // // //         tag: "",
// // // //         packageItems: [],
// // // //         packageAddons: [""],
// // // //       });
// // // //       setPackageImage(null);
// // // //       setImagePreview("");
// // // //       setPackageCategoriesTags({});
// // // //       setNewItemTitle("");
// // // //       setSelectedCategories([]);
// // // //       setItemFoodtype("");
// // // //       setSelectedCategoryId("");
// // // //       setSelectedCategoryName("");
// // // //       setItemSearch("");
// // // //       setItemsCache({});
// // // //       setDisplayedItems([]);

// // // //       // Prefill if packageData exists
// // // //       if (packageData) {
// // // //         setFormData({
// // // //           title: packageData.title || "",
// // // //           subTitle: packageData.subTitle || "",
// // // //           actualPrice: packageData.actualPrice || "",
// // // //           discountedPrice: packageData.discountedPrice || "",
// // // //           maxGuests: packageData.maxGuests || "",
// // // //           tag: packageData.tag || "",
// // // //           packageItems:
// // // //             packageData.packageItems?.map((item) =>
// // // //               typeof item === "object" ? item._id : item
// // // //             ) || [],
// // // //           packageAddons: packageData.packageAddons?.length
// // // //             ? packageData.packageAddons
// // // //             : [""],
// // // //         });

// // // //         setImagePreview(packageData.packageImageUrl || "");
// // // //         setPackageCategoriesTags(packageData.packageCategoriesTags || {});
// // // //       }
// // // //     }
// // // //   }, [isOpen, packageData]);

// // // //   useEffect(() => {
// // // //     return () => {
// // // //       if (imagePreview && imagePreview.startsWith("blob:")) {
// // // //         URL.revokeObjectURL(imagePreview);
// // // //       }
// // // //     };
// // // //   }, [imagePreview]);

// // // //   // ========== LOAD ITEMS ==========
// // // //   const loadItemsForCategory = useCallback(
// // // //     async (categoryId, search = "", force = false) => {
// // // //       if (!categoryId) {
// // // //         setDisplayedItems([]);
// // // //         return;
// // // //       }

// // // //       if (!force && !search && itemsCache[categoryId]) {
// // // //         setDisplayedItems(itemsCache[categoryId]);
// // // //         return;
// // // //       }

// // // //       setLoadingItems(true);
// // // //       try {
// // // //         const { items } = await fetchPackageItemsByCategory({
// // // //           categoryId,
// // // //           search,
// // // //           limit: 200,
// // // //         });

// // // //         if (!search) {
// // // //           setItemsCache((prev) => ({
// // // //             ...prev,
// // // //             [categoryId]: items,
// // // //           }));
// // // //         }

// // // //         setDisplayedItems(items);
// // // //       } catch (err) {
// // // //         console.error(err);
// // // //         setDisplayedItems([]);
// // // //       } finally {
// // // //         setLoadingItems(false);
// // // //       }
// // // //     },
// // // //     [itemsCache]
// // // //   );

// // // //   const handleCategorySelect = (catId, catTitle) => {
// // // //     setSelectedCategoryId(catId);
// // // //     setSelectedCategoryName(catTitle);
// // // //     setItemSearch("");
// // // //     loadItemsForCategory(catId);
// // // //   };

// // // //   // Debounced search
// // // //   useEffect(() => {
// // // //     if (!selectedCategoryId) return;

// // // //     const timer = setTimeout(() => {
// // // //       loadItemsForCategory(selectedCategoryId, itemSearch.trim());
// // // //     }, 350);

// // // //     return () => clearTimeout(timer);
// // // //   }, [itemSearch]); // eslint-disable-line

// // // //   // ========== HANDLERS ==========
// // // //   const handleImageChange = (e) => {
// // // //     const file = e.target.files?.[0];
// // // //     if (!file) return;
// // // //     setPackageImage(file);
// // // //     setImagePreview(URL.createObjectURL(file));
// // // //   };

// // // //   const handleChange = (e) => {
// // // //     const { name, value } = e.target;
// // // //     setFormData((prev) => ({ ...prev, [name]: value }));
// // // //   };

// // // //   const handleItemSelection = (itemId) => {
// // // //     setFormData((prev) => {
// // // //       const exists = prev.packageItems.includes(itemId);
// // // //       return {
// // // //         ...prev,
// // // //         packageItems: exists
// // // //           ? prev.packageItems.filter((id) => id !== itemId)
// // // //           : [...prev.packageItems, itemId],
// // // //       };
// // // //     });
// // // //   };

// // // //   const handleAddonChange = (index, value) => {
// // // //     const updated = [...formData.packageAddons];
// // // //     updated[index] = value;
// // // //     setFormData((prev) => ({ ...prev, packageAddons: updated }));
// // // //   };

// // // //   const addAddonField = () => {
// // // //     setFormData((prev) => ({
// // // //       ...prev,
// // // //       packageAddons: [...prev.packageAddons, ""],
// // // //     }));
// // // //   };

// // // //   const removeAddon = (index) => {
// // // //     const updated = [...formData.packageAddons];
// // // //     updated.splice(index, 1);
// // // //     setFormData((prev) => ({ ...prev, packageAddons: updated }));
// // // //   };

// // // //   const handleSubmit = async (e) => {
// // // //     e.preventDefault();

// // // //     const payload = new FormData();
// // // //     payload.append("venueId", packageData.venueId);
// // // //     payload.append("title", formData.title);
// // // //     payload.append("subTitle", formData.subTitle);
// // // //     payload.append("actualPrice", formData.actualPrice);
// // // //     payload.append("discountedPrice", formData.discountedPrice);
// // // //     payload.append("maxGuests", formData.maxGuests);
// // // //     payload.append("tag", formData.tag);
// // // //     payload.append("packageItems", JSON.stringify(formData.packageItems));
// // // //     payload.append("packageAddons", JSON.stringify(formData.packageAddons));
// // // //     payload.append(
// // // //       "packageCategoriesTags",
// // // //       JSON.stringify(packageCategoriesTags)
// // // //     );

// // // //     if (packageImage) {
// // // //       payload.append("image", packageImage);
// // // //     }

// // // //     if (isCloningPackage) {
// // // //       createVenuePackage(payload, onSuccess, onClose, setLoadingUpdate);
// // // //     } else {
// // // //       updateVenuePackage(
// // // //         packageData._id,
// // // //         payload,
// // // //         onSuccess,
// // // //         onClose,
// // // //         setLoadingUpdate
// // // //       );
// // // //     }
// // // //   };

// // // //   // Fixed Add Item (force refresh)
// // // //   const handleAddItem = async () => {
// // // //     if (!newItemTitle.trim() || selectedCategories.length === 0) return;

// // // //     const categoryIdToRefresh = selectedCategories[0];

// // // //     const payload = {
// // // //       title: newItemTitle,
// // // //       categoryIds: selectedCategories,
// // // //       foodType: itemFoodtype,
// // // //     };

// // // //     try {
// // // //       await fetch(`${BASE_URL}/api/party-venue/package-item/create-item`, {
// // // //         method: "POST",
// // // //         headers: { "Content-Type": "application/json" },
// // // //         body: JSON.stringify(payload),
// // // //       });

// // // //       setNewItemTitle("");
// // // //       setSelectedCategories([]);
// // // //       setItemFoodtype("");

// // // //       // Clear cache for that category
// // // //       setItemsCache((prev) => {
// // // //         const copy = { ...prev };
// // // //         delete copy[categoryIdToRefresh];
// // // //         return copy;
// // // //       });

// // // //       // If currently viewing that category → force reload
// // // //       if (selectedCategoryId === categoryIdToRefresh) {
// // // //         setLoadingItems(true);
// // // //         try {
// // // //           const { items } = await fetchPackageItemsByCategory({
// // // //             categoryId: selectedCategoryId,
// // // //             search: itemSearch.trim(),
// // // //             limit: 200,
// // // //           });

// // // //           setItemsCache((prev) => ({
// // // //             ...prev,
// // // //             [selectedCategoryId]: items,
// // // //           }));
// // // //           setDisplayedItems(items);
// // // //         } catch (err) {
// // // //           console.error(err);
// // // //         } finally {
// // // //           setLoadingItems(false);
// // // //         }
// // // //       }
// // // //     } catch (err) {
// // // //       console.error(err);
// // // //     }
// // // //   };

// // // //   // Tag popover
// // // //   const openTagPopover = (event, categoryId) => {
// // // //     setTagAnchorEl(event.currentTarget);
// // // //     setTagCategoryId(categoryId);
// // // //     setTempTagValue(packageCategoriesTags[categoryId] || "");
// // // //   };

// // // //   const closeTagPopover = () => {
// // // //     setTagAnchorEl(null);
// // // //     setTagCategoryId(null);
// // // //     setTempTagValue("");
// // // //   };

// // // //   const saveTag = () => {
// // // //     if (tagCategoryId) {
// // // //       setPackageCategoriesTags((prev) => ({
// // // //         ...prev,
// // // //         [tagCategoryId]: tempTagValue,
// // // //       }));
// // // //     }
// // // //     closeTagPopover();
// // // //   };

// // // //   return (
// // // //     <Dialog
// // // //       open={isOpen}
// // // //       onClose={onClose}
// // // //       maxWidth="xl"
// // // //       fullWidth
// // // //       PaperProps={{
// // // //         sx: {
// // // //           borderRadius: 3,
// // // //           maxHeight: "94vh",
// // // //           display: "flex",
// // // //           flexDirection: "column",
// // // //         },
// // // //       }}
// // // //     >
// // // //       {/* Header */}
// // // //       <DialogTitle
// // // //         sx={{
// // // //           m: 0,
// // // //           p: 2.5,
// // // //           display: "flex",
// // // //           alignItems: "center",
// // // //           justifyContent: "space-between",
// // // //           borderBottom: "1px solid #e5e7eb",
// // // //           bgcolor: "#fafafa",
// // // //         }}
// // // //       >
// // // //         <Typography variant="h6" fontWeight={700}>
// // // //           {isCloningPackage ? "Clone Package" : "Edit Package"}
// // // //         </Typography>
// // // //         <IconButton onClick={onClose} size="small">
// // // //           <CloseIcon />
// // // //         </IconButton>
// // // //       </DialogTitle>

// // // //       <DialogContent
// // // //         dividers
// // // //         sx={{ p: 3, overflowY: "auto", flex: 1 }}
// // // //         className="slim-scrollbar"
// // // //       >
// // // //         <form id="edit-package-form" onSubmit={handleSubmit}>
// // // //           {/* ========== BASIC INFO ========== */}
// // // //           <Typography variant="subtitle1" fontWeight={700} mb={2}>
// // // //             Basic Information
// // // //           </Typography>

// // // //           <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
// // // //             <TextField
// // // //               name="title"
// // // //               label="Package Title *"
// // // //               value={formData.title}
// // // //               onChange={handleChange}
// // // //               size="small"
// // // //               required
// // // //               fullWidth
// // // //             />
// // // //             <TextField
// // // //               name="subTitle"
// // // //               label="Package Subtitle *"
// // // //               value={formData.subTitle}
// // // //               onChange={handleChange}
// // // //               size="small"
// // // //               required
// // // //               fullWidth
// // // //             />
// // // //           </Box>

// // // //           <Box
// // // //             display="grid"
// // // //             gridTemplateColumns="1fr 1fr 1fr 1fr"
// // // //             gap={2}
// // // //             mb={2}
// // // //           >
// // // //             <TextField
// // // //               name="actualPrice"
// // // //               label="Actual Price *"
// // // //               type="number"
// // // //               value={formData.actualPrice}
// // // //               onChange={handleChange}
// // // //               size="small"
// // // //               required
// // // //               fullWidth
// // // //             />
// // // //             <TextField
// // // //               name="discountedPrice"
// // // //               label="Discounted Price"
// // // //               type="number"
// // // //               value={formData.discountedPrice}
// // // //               onChange={handleChange}
// // // //               size="small"
// // // //               fullWidth
// // // //             />
// // // //             <TextField
// // // //               name="maxGuests"
// // // //               label="Min Guests"
// // // //               type="number"
// // // //               value={formData.maxGuests}
// // // //               onChange={handleChange}
// // // //               size="small"
// // // //               fullWidth
// // // //             />
// // // //             <TextField
// // // //               name="tag"
// // // //               label="Tag"
// // // //               value={formData.tag}
// // // //               onChange={handleChange}
// // // //               size="small"
// // // //               fullWidth
// // // //             />
// // // //           </Box>

// // // //           <Box mb={3}>
// // // //             <Typography variant="body2" fontWeight={500} mb={1}>
// // // //               Package Banner Image
// // // //             </Typography>
// // // //             <Button
// // // //               variant="outlined"
// // // //               component="label"
// // // //               size="small"
// // // //               sx={{ textTransform: "none", borderRadius: 2 }}
// // // //             >
// // // //               {imagePreview ? "Change Image" : "Choose Image"}
// // // //               <input
// // // //                 type="file"
// // // //                 hidden
// // // //                 accept="image/*"
// // // //                 onChange={handleImageChange}
// // // //               />
// // // //             </Button>
// // // //             {imagePreview && (
// // // //               <Box mt={1.5}>
// // // //                 <img
// // // //                   src={imagePreview}
// // // //                   alt="preview"
// // // //                   style={{
// // // //                     width: 180,
// // // //                     height: 110,
// // // //                     objectFit: "cover",
// // // //                     borderRadius: 8,
// // // //                     border: "1px solid #e5e7eb",
// // // //                   }}
// // // //                 />
// // // //               </Box>
// // // //             )}
// // // //           </Box>

// // // //           <Divider sx={{ mb: 3 }} />

// // // //           {/* ========== PACKAGE ITEMS ========== */}
// // // //           <Box display="flex" alignItems="center" gap={1.5} mb={2}>
// // // //             <Typography variant="subtitle1" fontWeight={700}>
// // // //               Package Items
// // // //             </Typography>
// // // //             <Chip
// // // //               label={`${formData.packageItems.length} selected`}
// // // //               size="small"
// // // //               color={formData.packageItems.length > 0 ? "primary" : "default"}
// // // //               sx={{ fontWeight: 600 }}
// // // //             />
// // // //           </Box>

// // // //           {/* 3-Column Layout */}
// // // //           <Box
// // // //             display="flex"
// // // //             sx={{
// // // //               border: "1px solid #e5e7eb",
// // // //               borderRadius: 2,
// // // //               overflow: "hidden",
// // // //               height: 440,
// // // //             }}
// // // //           >
// // // //             {/* LEFT: Categories */}
// // // //             <Box
// // // //               sx={{
// // // //                 width: "22%",
// // // //                 minWidth: 200,
// // // //                 borderRight: "1px solid #e5e7eb",
// // // //                 bgcolor: "#f8fafc",
// // // //                 display: "flex",
// // // //                 flexDirection: "column",
// // // //               }}
// // // //             >
// // // //               <Box sx={{ p: 1.5, borderBottom: "1px solid #e5e7eb" }}>
// // // //                 <Typography
// // // //                   fontWeight={600}
// // // //                   fontSize={13}
// // // //                   color="text.secondary"
// // // //                 >
// // // //                   Categories ({packageCategories.length})
// // // //                 </Typography>
// // // //               </Box>

// // // //               <List
// // // //                 dense
// // // //                 className="slim-scrollbar"
// // // //                 sx={{ overflowY: "auto", flex: 1, py: 0 }}
// // // //               >
// // // //                 {packageCategories.map((cat) => (
// // // //                   <ListItemButton
// // // //                     key={cat._id}
// // // //                     selected={selectedCategoryId === cat._id}
// // // //                     onClick={() => handleCategorySelect(cat._id, cat.title)}
// // // //                     sx={{ py: 1 }}
// // // //                   >
// // // //                     <ListItemText
// // // //                       primary={cat.title}
// // // //                       secondary={
// // // //                         packageCategoriesTags[cat._id]
// // // //                           ? packageCategoriesTags[cat._id]
// // // //                           : null
// // // //                       }
// // // //                       primaryTypographyProps={{ fontSize: 13, noWrap: true }}
// // // //                       secondaryTypographyProps={{
// // // //                         fontSize: 11,
// // // //                         noWrap: true,
// // // //                       }}
// // // //                     />
// // // //                   </ListItemButton>
// // // //                 ))}
// // // //               </List>
// // // //             </Box>

// // // //             {/* MIDDLE: Items */}
// // // //             <Box
// // // //               sx={{
// // // //                 width: "53%",
// // // //                 display: "flex",
// // // //                 flexDirection: "column",
// // // //                 borderRight: "1px solid #e5e7eb",
// // // //               }}
// // // //             >
// // // //               <Box
// // // //                 sx={{
// // // //                   p: 1.5,
// // // //                   borderBottom: "1px solid #e5e7eb",
// // // //                   display: "flex",
// // // //                   gap: 1,
// // // //                   alignItems: "center",
// // // //                 }}
// // // //               >
// // // //                 <TextField
// // // //                   size="small"
// // // //                   placeholder={
// // // //                     selectedCategoryId
// // // //                       ? "Search in this category..."
// // // //                       : "Select a category first"
// // // //                   }
// // // //                   value={itemSearch}
// // // //                   onChange={(e) => setItemSearch(e.target.value)}
// // // //                   disabled={!selectedCategoryId}
// // // //                   fullWidth
// // // //                   InputProps={{
// // // //                     startAdornment: (
// // // //                       <InputAdornment position="start">
// // // //                         <SearchIcon fontSize="small" color="action" />
// // // //                       </InputAdornment>
// // // //                     ),
// // // //                   }}
// // // //                 />

// // // //                 {selectedCategoryId && (
// // // //                   <Button
// // // //                     variant="outlined"
// // // //                     size="small"
// // // //                     startIcon={<LocalOfferOutlinedIcon />}
// // // //                     onClick={(e) => openTagPopover(e, selectedCategoryId)}
// // // //                     sx={{
// // // //                       textTransform: "none",
// // // //                       whiteSpace: "nowrap",
// // // //                       minWidth: 140,
// // // //                     }}
// // // //                   >
// // // //                     {packageCategoriesTags[selectedCategoryId]
// // // //                       ? "Edit Category Tag"
// // // //                       : "Add Category Tag"}
// // // //                   </Button>
// // // //                 )}
// // // //               </Box>

// // // //               <Box
// // // //                 className="slim-scrollbar"
// // // //                 sx={{
// // // //                   overflowY: "auto",
// // // //                   flex: 1,
// // // //                   p: 1,
// // // //                   position: "relative",
// // // //                 }}
// // // //               >
// // // //                 {!selectedCategoryId ? (
// // // //                   <Typography
// // // //                     color="text.secondary"
// // // //                     textAlign="center"
// // // //                     py={8}
// // // //                     fontSize={14}
// // // //                   >
// // // //                     ← Select a category to view items
// // // //                   </Typography>
// // // //                 ) : loadingItems ? (
// // // //                   <Box
// // // //                     display="flex"
// // // //                     justifyContent="center"
// // // //                     alignItems="center"
// // // //                     height="100%"
// // // //                   >
// // // //                     <CircularProgress size={28} />
// // // //                   </Box>
// // // //                 ) : displayedItems.length === 0 ? (
// // // //                   <Typography
// // // //                     color="text.secondary"
// // // //                     textAlign="center"
// // // //                     py={6}
// // // //                     fontSize={14}
// // // //                   >
// // // //                     {itemSearch
// // // //                       ? "No items match your search"
// // // //                       : "No items in this category"}
// // // //                   </Typography>
// // // //                 ) : (
// // // //                   displayedItems.map((item) => (
// // // //                     <FormControlLabel
// // // //                       key={item._id}
// // // //                       control={
// // // //                         <Checkbox
// // // //                           size="small"
// // // //                           checked={formData.packageItems.includes(item._id)}
// // // //                           onChange={() => handleItemSelection(item._id)}
// // // //                         />
// // // //                       }
// // // //                       label={
// // // //                         <Typography fontSize={13}>
// // // //                           {item.foodType === "veg" ? "🟢" : "🔴"} {item.title}
// // // //                         </Typography>
// // // //                       }
// // // //                       sx={{
// // // //                         display: "flex",
// // // //                         ml: 0.5,
// // // //                         borderRadius: 1,
// // // //                         width: "100%",
// // // //                         "&:hover": { bgcolor: "#f8fafc" },
// // // //                       }}
// // // //                     />
// // // //                   ))
// // // //                 )}
// // // //               </Box>
// // // //             </Box>

// // // //             {/* RIGHT: Create New Item */}
// // // //             <Box
// // // //               sx={{
// // // //                 width: "25%",
// // // //                 minWidth: 220,
// // // //                 bgcolor: "#fafafa",
// // // //                 display: "flex",
// // // //                 flexDirection: "column",
// // // //                 p: 2,
// // // //               }}
// // // //             >
// // // //               <Typography fontWeight={700} fontSize={14} mb={2}>
// // // //                 Create New Item
// // // //               </Typography>

// // // //               <TextField
// // // //                 size="small"
// // // //                 label="Item Title"
// // // //                 value={newItemTitle}
// // // //                 onChange={(e) => setNewItemTitle(e.target.value)}
// // // //                 fullWidth
// // // //                 sx={{ mb: 2 }}
// // // //               />

// // // //               <Typography
// // // //                 fontSize={12}
// // // //                 fontWeight={500}
// // // //                 mb={0.8}
// // // //                 color="text.secondary"
// // // //               >
// // // //                 Category
// // // //               </Typography>
// // // //               <Box
// // // //                 className="slim-scrollbar"
// // // //                 sx={{
// // // //                   flex: 1,
// // // //                   maxHeight: 160,
// // // //                   overflowY: "auto",
// // // //                   border: "1px solid #e5e7eb",
// // // //                   borderRadius: 1.5,
// // // //                   bgcolor: "white",
// // // //                   mb: 2,
// // // //                   px: 0.5,
// // // //                 }}
// // // //               >
// // // //                 {packageCategories?.map((cat) => (
// // // //                   <FormControlLabel
// // // //                     key={cat._id}
// // // //                     control={
// // // //                       <Radio
// // // //                         size="small"
// // // //                         checked={selectedCategories[0] === cat._id}
// // // //                         onChange={() => setSelectedCategories([cat._id])}
// // // //                       />
// // // //                     }
// // // //                     label={
// // // //                       <Typography fontSize={12.5} noWrap>
// // // //                         {cat.title}
// // // //                       </Typography>
// // // //                     }
// // // //                     sx={{
// // // //                       display: "flex",
// // // //                       width: "100%",
// // // //                       ml: 0.5,
// // // //                       my: 0.2,
// // // //                     }}
// // // //                   />
// // // //                 ))}
// // // //               </Box>

// // // //               <Typography
// // // //                 fontSize={12}
// // // //                 fontWeight={500}
// // // //                 mb={0.8}
// // // //                 color="text.secondary"
// // // //               >
// // // //                 Food Type
// // // //               </Typography>
// // // //               <RadioGroup
// // // //                 row
// // // //                 value={itemFoodtype}
// // // //                 onChange={(e) => setItemFoodtype(e.target.value)}
// // // //                 sx={{ mb: 2 }}
// // // //               >
// // // //                 <FormControlLabel
// // // //                   value="veg"
// // // //                   control={<Radio size="small" />}
// // // //                   label={<Typography fontSize={13}>Veg</Typography>}
// // // //                 />
// // // //                 <FormControlLabel
// // // //                   value="non-veg"
// // // //                   control={<Radio size="small" />}
// // // //                   label={<Typography fontSize={13}>Non-Veg</Typography>}
// // // //                 />
// // // //               </RadioGroup>

// // // //               <Button
// // // //                 variant="contained"
// // // //                 size="small"
// // // //                 fullWidth
// // // //                 onClick={handleAddItem}
// // // //                 disabled={
// // // //                   !newItemTitle.trim() || selectedCategories.length === 0
// // // //                 }
// // // //                 sx={{ textTransform: "none", borderRadius: 2, mt: "auto" }}
// // // //               >
// // // //                 Add Item
// // // //               </Button>
// // // //             </Box>
// // // //           </Box>

// // // //           {/* Tag Popover */}
// // // //           <Popover
// // // //             open={Boolean(tagAnchorEl)}
// // // //             anchorEl={tagAnchorEl}
// // // //             onClose={closeTagPopover}
// // // //             anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
// // // //             transformOrigin={{ vertical: "top", horizontal: "left" }}
// // // //           >
// // // //             <Box sx={{ p: 2, width: 320 }}>
// // // //               <Typography fontWeight={600} fontSize={14} mb={2}>
// // // //                 Category: {selectedCategoryName}
// // // //               </Typography>
// // // //               <TextField
// // // //                 size="small"
// // // //                 fullWidth
// // // //                 autoFocus
// // // //                 placeholder={`e.g. Select 2 ${selectedCategoryName}`}
// // // //                 value={tempTagValue}
// // // //                 onChange={(e) => setTempTagValue(e.target.value)}
// // // //                 sx={{ mb: 2 }}
// // // //               />
// // // //               <Box display="flex" justifyContent="flex-end" gap={1}>
// // // //                 <Button size="small" onClick={closeTagPopover}>
// // // //                   Cancel
// // // //                 </Button>
// // // //                 <Button size="small" variant="contained" onClick={saveTag}>
// // // //                   Save Tag
// // // //                 </Button>
// // // //               </Box>
// // // //             </Box>
// // // //           </Popover>

// // // //           <Divider sx={{ my: 3 }} />

// // // //           {/* ========== ADDONS ========== */}
// // // //           <Box
// // // //             display="flex"
// // // //             alignItems="center"
// // // //             justifyContent="space-between"
// // // //             mb={1.5}
// // // //           >
// // // //             <Typography variant="subtitle1" fontWeight={700}>
// // // //               Addons
// // // //             </Typography>
// // // //             <Button
// // // //               size="small"
// // // //               startIcon={<AddIcon />}
// // // //               onClick={addAddonField}
// // // //               sx={{ textTransform: "none" }}
// // // //             >
// // // //               Add Addon
// // // //             </Button>
// // // //           </Box>

// // // //           {formData.packageAddons.map((addon, index) => (
// // // //             <Box
// // // //               key={index}
// // // //               display="flex"
// // // //               gap={1}
// // // //               mb={1.5}
// // // //               alignItems="center"
// // // //             >
// // // //               <TextField
// // // //                 size="small"
// // // //                 placeholder={`Addon ${index + 1}`}
// // // //                 value={addon}
// // // //                 onChange={(e) => handleAddonChange(index, e.target.value)}
// // // //                 fullWidth
// // // //               />
// // // //               <IconButton
// // // //                 size="small"
// // // //                 color="error"
// // // //                 onClick={() => removeAddon(index)}
// // // //                 disabled={formData.packageAddons.length === 1}
// // // //               >
// // // //                 <DeleteOutlineIcon fontSize="small" />
// // // //               </IconButton>
// // // //             </Box>
// // // //           ))}
// // // //         </form>
// // // //       </DialogContent>

// // // //       {/* Footer */}
// // // //       <DialogActions
// // // //         sx={{
// // // //           p: 2.5,
// // // //           borderTop: "1px solid #e5e7eb",
// // // //           bgcolor: "#fafafa",
// // // //           gap: 1,
// // // //         }}
// // // //       >
// // // //         <Button
// // // //           onClick={onClose}
// // // //           variant="outlined"
// // // //           sx={{ textTransform: "none", borderRadius: 2 }}
// // // //         >
// // // //           Cancel
// // // //         </Button>
// // // //         <Button
// // // //           type="submit"
// // // //           form="edit-package-form"
// // // //           variant="contained"
// // // //           disabled={loadingUpdate}
// // // //           sx={{ textTransform: "none", borderRadius: 2, minWidth: 160 }}
// // // //         >
// // // //           {loadingUpdate ? (
// // // //             <CircularProgress size={22} color="inherit" />
// // // //           ) : isCloningPackage ? (
// // // //             "Clone Package"
// // // //           ) : (
// // // //             "Update Package"
// // // //           )}
// // // //         </Button>
// // // //       </DialogActions>
// // // //     </Dialog>
// // // //   );
// // // // };

// // // // export default EditPackagePopup;




// // // "use client";

// // // import React, { useEffect, useState, useCallback, useMemo } from "react";
// // // import {
// // //   Dialog,
// // //   DialogTitle,
// // //   DialogContent,
// // //   DialogActions,
// // //   Button,
// // //   TextField,
// // //   Box,
// // //   Typography,
// // //   IconButton,
// // //   Divider,
// // //   CircularProgress,
// // //   Checkbox,
// // //   FormControlLabel,
// // //   Radio,
// // //   RadioGroup,
// // //   Chip,
// // //   List,
// // //   ListItemButton,
// // //   ListItemText,
// // //   Popover,
// // //   InputAdornment,
// // //   Badge,
// // // } from "@mui/material";
// // // import CloseIcon from "@mui/icons-material/Close";
// // // import AddIcon from "@mui/icons-material/Add";
// // // import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
// // // import SearchIcon from "@mui/icons-material/Search";
// // // import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
// // // import {
// // //   updateVenuePackage,
// // //   createVenuePackage,
// // //   fetchPackageCategories,
// // //   fetchPackageItemsByCategory,
// // // } from "@/services/venueListServices";
// // // import { BASE_URL } from "@/utils/apiconstant";

// // // const EditPackagePopup = ({
// // //   isOpen,
// // //   onClose,
// // //   onSuccess,
// // //   packageData,
// // //   isCloningPackage,
// // // }) => {
// // //   const [loadingUpdate, setLoadingUpdate] = useState(false);
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

// // //   // Add New Item
// // //   const [newItemTitle, setNewItemTitle] = useState("");
// // //   const [selectedCategories, setSelectedCategories] = useState([]);
// // //   const [itemFoodtype, setItemFoodtype] = useState("");

// // //   // Category Tags
// // //   const [packageCategoriesTags, setPackageCategoriesTags] = useState({});

// // //   // UX states
// // //   const [selectedCategoryId, setSelectedCategoryId] = useState("");
// // //   const [selectedCategoryName, setSelectedCategoryName] = useState("");
// // //   const [categorySearch, setCategorySearch] = useState("");
// // //   const [itemSearch, setItemSearch] = useState("");
// // //   const [tagAnchorEl, setTagAnchorEl] = useState(null);
// // //   const [tagCategoryId, setTagCategoryId] = useState(null);
// // //   const [tempTagValue, setTempTagValue] = useState("");

// // //   // Lazy loading & tracking
// // //   const [itemsCache, setItemsCache] = useState({});
// // //   const [loadingItems, setLoadingItems] = useState(false);
// // //   const [displayedItems, setDisplayedItems] = useState([]);
// // //   const [itemCategoryMap, setItemCategoryMap] = useState({});

// // //   // ========== RESET + PREFILL ==========
// // //   useEffect(() => {
// // //     if (isOpen) {
// // //       fetchPackageCategories(setPackageCategories);

// // //       // Reset form first
// // //       setFormData({
// // //         title: "",
// // //         subTitle: "",
// // //         actualPrice: "",
// // //         discountedPrice: "",
// // //         maxGuests: "",
// // //         tag: "",
// // //         packageItems: [],
// // //         packageAddons: [""],
// // //       });
// // //       setPackageImage(null);
// // //       setImagePreview("");
// // //       setPackageCategoriesTags({});
// // //       setNewItemTitle("");
// // //       setSelectedCategories([]);
// // //       setItemFoodtype("");
// // //       setSelectedCategoryId("");
// // //       setSelectedCategoryName("");
// // //       setCategorySearch("");
// // //       setItemSearch("");
// // //       setItemsCache({});
// // //       setDisplayedItems([]);
// // //       setItemCategoryMap({});

// // //       // Prefill if packageData exists
// // //       if (packageData) {
// // //         const itemIds = [];
// // //         const initialMap = {};

// // //         (packageData.packageItems || []).forEach((item) => {
// // //           if (typeof item === "object" && item !== null) {
// // //             itemIds.push(item._id);
// // //             const catId = item.categoryId?._id || item.categoryId || item.category;
// // //             if (catId) {
// // //               initialMap[item._id] = catId;
// // //             }
// // //           } else if (item) {
// // //             itemIds.push(item);
// // //           }
// // //         });

// // //         setItemCategoryMap(initialMap);

// // //         setFormData({
// // //           title: packageData.title || "",
// // //           subTitle: packageData.subTitle || "",
// // //           actualPrice: packageData.actualPrice || "",
// // //           discountedPrice: packageData.discountedPrice || "",
// // //           maxGuests: packageData.maxGuests || "",
// // //           tag: packageData.tag || "",
// // //           packageItems: itemIds,
// // //           packageAddons: packageData.packageAddons?.length
// // //             ? packageData.packageAddons
// // //             : [""],
// // //         });

// // //         setImagePreview(packageData.packageImageUrl || "");
// // //         setPackageCategoriesTags(packageData.packageCategoriesTags || {});
// // //       }
// // //     }
// // //   }, [isOpen, packageData]);

// // //   useEffect(() => {
// // //     return () => {
// // //       if (imagePreview && imagePreview.startsWith("blob:")) {
// // //         URL.revokeObjectURL(imagePreview);
// // //       }
// // //     };
// // //   }, [imagePreview]);

// // //   // ========== CATEGORY SELECTION COUNTS & SORTING ==========
// // //   const categorySelectedCounts = useMemo(() => {
// // //     const counts = {};
// // //     const selectedItemSet = new Set(formData.packageItems);

// // //     // 1. Check fetched/cached items
// // //     Object.entries(itemsCache).forEach(([catId, items]) => {
// // //       let count = 0;
// // //       items.forEach((item) => {
// // //         if (selectedItemSet.has(item._id)) {
// // //           count += 1;
// // //         }
// // //       });
// // //       counts[catId] = count;
// // //     });

// // //     // 2. Fallback check from prefilled items
// // //     Object.entries(itemCategoryMap).forEach(([itemId, catId]) => {
// // //       if (selectedItemSet.has(itemId) && !itemsCache[catId]) {
// // //         counts[catId] = (counts[catId] || 0) + 1;
// // //       }
// // //     });

// // //     return counts;
// // //   }, [formData.packageItems, itemsCache, itemCategoryMap]);

// // //   // Client search + prioritize categories with >=1 selected items
// // //   const sortedAndFilteredCategories = useMemo(() => {
// // //     let list = [...packageCategories];

// // //     if (categorySearch.trim()) {
// // //       const q = categorySearch.toLowerCase().trim();
// // //       list = list.filter((cat) => cat.title?.toLowerCase().includes(q));
// // //     }

// // //     return list.sort((a, b) => {
// // //       const countA = categorySelectedCounts[a._id] || 0;
// // //       const countB = categorySelectedCounts[b._id] || 0;

// // //       const hasSelectedA = countA > 0 ? 1 : 0;
// // //       const hasSelectedB = countB > 0 ? 1 : 0;

// // //       if (hasSelectedB !== hasSelectedA) {
// // //         return hasSelectedB - hasSelectedA;
// // //       }
// // //       return countB - countA;
// // //     });
// // //   }, [packageCategories, categorySearch, categorySelectedCounts]);

// // //   // ========== LOAD ITEMS ==========
// // //   const loadItemsForCategory = useCallback(
// // //     async (categoryId, search = "", force = false) => {
// // //       if (!categoryId) {
// // //         setDisplayedItems([]);
// // //         return;
// // //       }

// // //       if (!force && !search && itemsCache[categoryId]) {
// // //         setDisplayedItems(itemsCache[categoryId]);
// // //         return;
// // //       }

// // //       setLoadingItems(true);
// // //       try {
// // //         const { items } = await fetchPackageItemsByCategory({
// // //           categoryId,
// // //           search,
// // //           limit: 200,
// // //         });

// // //         if (!search) {
// // //           setItemsCache((prev) => ({
// // //             ...prev,
// // //             [categoryId]: items,
// // //           }));
// // //         }

// // //         setItemCategoryMap((prev) => {
// // //           const updated = { ...prev };
// // //           items.forEach((it) => {
// // //             updated[it._id] = categoryId;
// // //           });
// // //           return updated;
// // //         });

// // //         setDisplayedItems(items);
// // //       } catch (err) {
// // //         console.error(err);
// // //         setDisplayedItems([]);
// // //       } finally {
// // //         setLoadingItems(false);
// // //       }
// // //     },
// // //     [itemsCache]
// // //   );

// // //   const handleCategorySelect = (catId, catTitle) => {
// // //     setSelectedCategoryId(catId);
// // //     setSelectedCategoryName(catTitle);
// // //     setItemSearch("");
// // //     loadItemsForCategory(catId);
// // //   };

// // //   // Debounced item search
// // //   useEffect(() => {
// // //     if (!selectedCategoryId) return;

// // //     const timer = setTimeout(() => {
// // //       loadItemsForCategory(selectedCategoryId, itemSearch.trim());
// // //     }, 350);

// // //     return () => clearTimeout(timer);
// // //   }, [itemSearch]); // eslint-disable-line

// // //   // ========== HANDLERS ==========
// // //   const handleImageChange = (e) => {
// // //     const file = e.target.files?.[0];
// // //     if (!file) return;
// // //     setPackageImage(file);
// // //     setImagePreview(URL.createObjectURL(file));
// // //   };

// // //   const handleChange = (e) => {
// // //     const { name, value } = e.target;
// // //     setFormData((prev) => ({ ...prev, [name]: value }));
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

// // //   const handleAddonChange = (index, value) => {
// // //     const updated = [...formData.packageAddons];
// // //     updated[index] = value;
// // //     setFormData((prev) => ({ ...prev, packageAddons: updated }));
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
// // //     setFormData((prev) => ({ ...prev, packageAddons: updated }));
// // //   };

// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault();

// // //     const payload = new FormData();
// // //     payload.append("venueId", packageData.venueId);
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
// // //       JSON.stringify(packageCategoriesTags)
// // //     );

// // //     if (packageImage) {
// // //       payload.append("image", packageImage);
// // //     }

// // //     if (isCloningPackage) {
// // //       createVenuePackage(payload, onSuccess, onClose, setLoadingUpdate);
// // //     } else {
// // //       updateVenuePackage(
// // //         packageData._id,
// // //         payload,
// // //         onSuccess,
// // //         onClose,
// // //         setLoadingUpdate
// // //       );
// // //     }
// // //   };

// // //   // Fixed Add Item
// // //   const handleAddItem = async () => {
// // //     if (!newItemTitle.trim() || selectedCategories.length === 0) return;

// // //     const categoryIdToRefresh = selectedCategories[0];

// // //     const payload = {
// // //       title: newItemTitle,
// // //       categoryIds: selectedCategories,
// // //       foodType: itemFoodtype,
// // //     };

// // //     try {
// // //       await fetch(`${BASE_URL}/api/party-venue/package-item/create-item`, {
// // //         method: "POST",
// // //         headers: { "Content-Type": "application/json" },
// // //         body: JSON.stringify(payload),
// // //       });

// // //       setNewItemTitle("");
// // //       setSelectedCategories([]);
// // //       setItemFoodtype("");

// // //       setItemsCache((prev) => {
// // //         const copy = { ...prev };
// // //         delete copy[categoryIdToRefresh];
// // //         return copy;
// // //       });

// // //       if (selectedCategoryId === categoryIdToRefresh) {
// // //         setLoadingItems(true);
// // //         try {
// // //           const { items } = await fetchPackageItemsByCategory({
// // //             categoryId: selectedCategoryId,
// // //             search: itemSearch.trim(),
// // //             limit: 200,
// // //           });

// // //           setItemsCache((prev) => ({
// // //             ...prev,
// // //             [selectedCategoryId]: items,
// // //           }));
// // //           setDisplayedItems(items);
// // //         } catch (err) {
// // //           console.error(err);
// // //         } finally {
// // //           setLoadingItems(false);
// // //         }
// // //       }
// // //     } catch (err) {
// // //       console.error(err);
// // //     }
// // //   };

// // //   // Tag popover
// // //   const openTagPopover = (event, categoryId) => {
// // //     setTagAnchorEl(event.currentTarget);
// // //     setTagCategoryId(categoryId);
// // //     setTempTagValue(packageCategoriesTags[categoryId] || "");
// // //   };

// // //   const closeTagPopover = () => {
// // //     setTagAnchorEl(null);
// // //     setTagCategoryId(null);
// // //     setTempTagValue("");
// // //   };

// // //   const saveTag = () => {
// // //     if (tagCategoryId) {
// // //       setPackageCategoriesTags((prev) => ({
// // //         ...prev,
// // //         [tagCategoryId]: tempTagValue,
// // //       }));
// // //     }
// // //     closeTagPopover();
// // //   };

// // //   return (
// // //     <Dialog
// // //       open={isOpen}
// // //       onClose={onClose}
// // //       maxWidth="xl"
// // //       fullWidth
// // //       PaperProps={{
// // //         sx: {
// // //           borderRadius: 3,
// // //           maxHeight: "94vh",
// // //           display: "flex",
// // //           flexDirection: "column",
// // //         },
// // //       }}
// // //     >
// // //       {/* Header */}
// // //       <DialogTitle
// // //         sx={{
// // //           m: 0,
// // //           p: 2.5,
// // //           display: "flex",
// // //           alignItems: "center",
// // //           justifyContent: "space-between",
// // //           borderBottom: "1px solid #e5e7eb",
// // //           bgcolor: "#fafafa",
// // //         }}
// // //       >
// // //         <Typography variant="h6" fontWeight={700}>
// // //           {isCloningPackage ? "Clone Package" : "Edit Package"}
// // //         </Typography>
// // //         <IconButton onClick={onClose} size="small">
// // //           <CloseIcon />
// // //         </IconButton>
// // //       </DialogTitle>

// // //       <DialogContent
// // //         dividers
// // //         sx={{ p: 3, overflowY: "auto", flex: 1 }}
// // //         className="slim-scrollbar"
// // //       >
// // //         <form id="edit-package-form" onSubmit={handleSubmit}>
// // //           {/* ========== BASIC INFO ========== */}
// // //           <Typography variant="subtitle1" fontWeight={700} mb={2}>
// // //             Basic Information
// // //           </Typography>

// // //           <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
// // //             <TextField
// // //               name="title"
// // //               label="Package Title *"
// // //               value={formData.title}
// // //               onChange={handleChange}
// // //               size="small"
// // //               required
// // //               fullWidth
// // //             />
// // //             <TextField
// // //               name="subTitle"
// // //               label="Package Subtitle *"
// // //               value={formData.subTitle}
// // //               onChange={handleChange}
// // //               size="small"
// // //               required
// // //               fullWidth
// // //             />
// // //           </Box>

// // //           <Box
// // //             display="grid"
// // //             gridTemplateColumns="1fr 1fr 1fr 1fr"
// // //             gap={2}
// // //             mb={2}
// // //           >
// // //             <TextField
// // //               name="actualPrice"
// // //               label="Actual Price *"
// // //               type="number"
// // //               value={formData.actualPrice}
// // //               onChange={handleChange}
// // //               size="small"
// // //               required
// // //               fullWidth
// // //             />
// // //             <TextField
// // //               name="discountedPrice"
// // //               label="Discounted Price"
// // //               type="number"
// // //               value={formData.discountedPrice}
// // //               onChange={handleChange}
// // //               size="small"
// // //               fullWidth
// // //             />
// // //             <TextField
// // //               name="maxGuests"
// // //               label="Min Guests"
// // //               type="number"
// // //               value={formData.maxGuests}
// // //               onChange={handleChange}
// // //               size="small"
// // //               fullWidth
// // //             />
// // //             <TextField
// // //               name="tag"
// // //               label="Tag"
// // //               value={formData.tag}
// // //               onChange={handleChange}
// // //               size="small"
// // //               fullWidth
// // //             />
// // //           </Box>

// // //           <Box mb={3}>
// // //             <Typography variant="body2" fontWeight={500} mb={1}>
// // //               Package Banner Image
// // //             </Typography>
// // //             <Button
// // //               variant="outlined"
// // //               component="label"
// // //               size="small"
// // //               sx={{ textTransform: "none", borderRadius: 2 }}
// // //             >
// // //               {imagePreview ? "Change Image" : "Choose Image"}
// // //               <input
// // //                 type="file"
// // //                 hidden
// // //                 accept="image/*"
// // //                 onChange={handleImageChange}
// // //               />
// // //             </Button>
// // //             {imagePreview && (
// // //               <Box mt={1.5}>
// // //                 <img
// // //                   src={imagePreview}
// // //                   alt="preview"
// // //                   style={{
// // //                     width: 180,
// // //                     height: 110,
// // //                     objectFit: "cover",
// // //                     borderRadius: 8,
// // //                     border: "1px solid #e5e7eb",
// // //                   }}
// // //                 />
// // //               </Box>
// // //             )}
// // //           </Box>

// // //           <Divider sx={{ mb: 3 }} />

// // //           {/* ========== PACKAGE ITEMS ========== */}
// // //           <Box display="flex" alignItems="center" gap={1.5} mb={2}>
// // //             <Typography variant="subtitle1" fontWeight={700}>
// // //               Package Items
// // //             </Typography>
// // //             <Chip
// // //               label={`${formData.packageItems.length} selected`}
// // //               size="small"
// // //               color={formData.packageItems.length > 0 ? "primary" : "default"}
// // //               sx={{ fontWeight: 600 }}
// // //             />
// // //           </Box>

// // //           {/* 3-Column Layout */}
// // //           <Box
// // //             display="flex"
// // //             sx={{
// // //               border: "1px solid #e5e7eb",
// // //               borderRadius: 2,
// // //               overflow: "hidden",
// // //               height: 440,
// // //             }}
// // //           >
// // //             {/* LEFT: Categories */}
// // //             <Box
// // //               sx={{
// // //                 width: "25%",
// // //                 minWidth: 230,
// // //                 borderRight: "1px solid #e5e7eb",
// // //                 bgcolor: "#f8fafc",
// // //                 display: "flex",
// // //                 flexDirection: "column",
// // //               }}
// // //             >
// // //               <Box sx={{ p: 1.5, borderBottom: "1px solid #e5e7eb" }}>
// // //                 <Typography
// // //                   fontWeight={600}
// // //                   fontSize={13}
// // //                   color="text.secondary"
// // //                   mb={1}
// // //                 >
// // //                   Categories ({packageCategories.length})
// // //                 </Typography>
// // //                 <TextField
// // //                   size="small"
// // //                   placeholder="Search category..."
// // //                   value={categorySearch}
// // //                   onChange={(e) => setCategorySearch(e.target.value)}
// // //                   fullWidth
// // //                   InputProps={{
// // //                     startAdornment: (
// // //                       <InputAdornment position="start">
// // //                         <SearchIcon fontSize="small" color="action" />
// // //                       </InputAdornment>
// // //                     ),
// // //                   }}
// // //                   sx={{
// // //                     "& .MuiInputBase-root": {
// // //                       bgcolor: "white",
// // //                       fontSize: 13,
// // //                     },
// // //                   }}
// // //                 />
// // //               </Box>

// // //               <List
// // //                 dense
// // //                 className="slim-scrollbar"
// // //                 sx={{ overflowY: "auto", flex: 1, py: 0 }}
// // //               >
// // //                 {sortedAndFilteredCategories.length === 0 ? (
// // //                   <Typography
// // //                     color="text.secondary"
// // //                     textAlign="center"
// // //                     py={4}
// // //                     fontSize={13}
// // //                   >
// // //                     No category found
// // //                   </Typography>
// // //                 ) : (
// // //                   sortedAndFilteredCategories.map((cat) => {
// // //                     const selectedCount = categorySelectedCounts[cat._id] || 0;
// // //                     return (
// // //                       <ListItemButton
// // //                         key={cat._id}
// // //                         selected={selectedCategoryId === cat._id}
// // //                         onClick={() => handleCategorySelect(cat._id, cat.title)}
// // //                         sx={{
// // //                           py: 1,
// // //                           display: "flex",
// // //                           justifyContent: "space-between",
// // //                           alignItems: "center",
// // //                           gap: 1,
// // //                         }}
// // //                       >
// // //                         <ListItemText
// // //                           primary={cat.title}
// // //                           secondary={
// // //                             packageCategoriesTags[cat._id]
// // //                               ? packageCategoriesTags[cat._id]
// // //                               : null
// // //                           }
// // //                           primaryTypographyProps={{
// // //                             fontSize: 13,
// // //                             fontWeight: selectedCount > 0 ? 600 : 400,
// // //                             noWrap: true,
// // //                           }}
// // //                           secondaryTypographyProps={{
// // //                             fontSize: 11,
// // //                             noWrap: true,
// // //                           }}
// // //                         />
// // //                         {selectedCount > 0 && (
// // //                           <Chip
// // //                             label={selectedCount}
// // //                             size="small"
// // //                             color="primary"
// // //                             sx={{
// // //                               height: 20,
// // //                               fontSize: 11,
// // //                               fontWeight: 700,
// // //                               minWidth: 24,
// // //                               "& .MuiChip-label": { px: 0.8 },
// // //                             }}
// // //                           />
// // //                         )}
// // //                       </ListItemButton>
// // //                     );
// // //                   })
// // //                 )}
// // //               </List>
// // //             </Box>

// // //             {/* MIDDLE: Items */}
// // //             <Box
// // //               sx={{
// // //                 width: "50%",
// // //                 display: "flex",
// // //                 flexDirection: "column",
// // //                 borderRight: "1px solid #e5e7eb",
// // //               }}
// // //             >
// // //               <Box
// // //                 sx={{
// // //                   p: 1.5,
// // //                   borderBottom: "1px solid #e5e7eb",
// // //                   display: "flex",
// // //                   gap: 1,
// // //                   alignItems: "center",
// // //                 }}
// // //               >
// // //                 <TextField
// // //                   size="small"
// // //                   placeholder={
// // //                     selectedCategoryId
// // //                       ? "Search in this category..."
// // //                       : "Select a category first"
// // //                   }
// // //                   value={itemSearch}
// // //                   onChange={(e) => setItemSearch(e.target.value)}
// // //                   disabled={!selectedCategoryId}
// // //                   fullWidth
// // //                   InputProps={{
// // //                     startAdornment: (
// // //                       <InputAdornment position="start">
// // //                         <SearchIcon fontSize="small" color="action" />
// // //                       </InputAdornment>
// // //                     ),
// // //                   }}
// // //                 />

// // //                 {selectedCategoryId && (
// // //                   <Button
// // //                     variant="outlined"
// // //                     size="small"
// // //                     startIcon={<LocalOfferOutlinedIcon />}
// // //                     onClick={(e) => openTagPopover(e, selectedCategoryId)}
// // //                     sx={{
// // //                       textTransform: "none",
// // //                       whiteSpace: "nowrap",
// // //                       minWidth: 140,
// // //                     }}
// // //                   >
// // //                     {packageCategoriesTags[selectedCategoryId]
// // //                       ? "Edit Category Tag"
// // //                       : "Add Category Tag"}
// // //                   </Button>
// // //                 )}
// // //               </Box>

// // //               <Box
// // //                 className="slim-scrollbar"
// // //                 sx={{
// // //                   overflowY: "auto",
// // //                   flex: 1,
// // //                   p: 1,
// // //                   position: "relative",
// // //                 }}
// // //               >
// // //                 {!selectedCategoryId ? (
// // //                   <Typography
// // //                     color="text.secondary"
// // //                     textAlign="center"
// // //                     py={8}
// // //                     fontSize={14}
// // //                   >
// // //                     ← Select a category to view items
// // //                   </Typography>
// // //                 ) : loadingItems ? (
// // //                   <Box
// // //                     display="flex"
// // //                     justifyContent="center"
// // //                     alignItems="center"
// // //                     height="100%"
// // //                   >
// // //                     <CircularProgress size={28} />
// // //                   </Box>
// // //                 ) : displayedItems.length === 0 ? (
// // //                   <Typography
// // //                     color="text.secondary"
// // //                     textAlign="center"
// // //                     py={6}
// // //                     fontSize={14}
// // //                   >
// // //                     {itemSearch
// // //                       ? "No items match your search"
// // //                       : "No items in this category"}
// // //                   </Typography>
// // //                 ) : (
// // //                   displayedItems.map((item) => (
// // //                     <FormControlLabel
// // //                       key={item._id}
// // //                       control={
// // //                         <Checkbox
// // //                           size="small"
// // //                           checked={formData.packageItems.includes(item._id)}
// // //                           onChange={() => handleItemSelection(item._id)}
// // //                         />
// // //                       }
// // //                       label={
// // //                         <Typography fontSize={13}>
// // //                           {item.foodType === "veg" ? "🟢" : "🔴"} {item.title}
// // //                         </Typography>
// // //                       }
// // //                       sx={{
// // //                         display: "flex",
// // //                         ml: 0.5,
// // //                         borderRadius: 1,
// // //                         width: "100%",
// // //                         "&:hover": { bgcolor: "#f8fafc" },
// // //                       }}
// // //                     />
// // //                   ))
// // //                 )}
// // //               </Box>
// // //             </Box>

// // //             {/* RIGHT: Create New Item */}
// // //             <Box
// // //               sx={{
// // //                 width: "25%",
// // //                 minWidth: 220,
// // //                 bgcolor: "#fafafa",
// // //                 display: "flex",
// // //                 flexDirection: "column",
// // //                 p: 2,
// // //               }}
// // //             >
// // //               <Typography fontWeight={700} fontSize={14} mb={2}>
// // //                 Create New Item
// // //               </Typography>

// // //               <TextField
// // //                 size="small"
// // //                 label="Item Title"
// // //                 value={newItemTitle}
// // //                 onChange={(e) => setNewItemTitle(e.target.value)}
// // //                 fullWidth
// // //                 sx={{ mb: 2 }}
// // //               />

// // //               <Typography
// // //                 fontSize={12}
// // //                 fontWeight={500}
// // //                 mb={0.8}
// // //                 color="text.secondary"
// // //               >
// // //                 Category
// // //               </Typography>
// // //               <Box
// // //                 className="slim-scrollbar"
// // //                 sx={{
// // //                   flex: 1,
// // //                   maxHeight: 160,
// // //                   overflowY: "auto",
// // //                   border: "1px solid #e5e7eb",
// // //                   borderRadius: 1.5,
// // //                   bgcolor: "white",
// // //                   mb: 2,
// // //                   px: 0.5,
// // //                 }}
// // //               >
// // //                 {packageCategories?.map((cat) => (
// // //                   <FormControlLabel
// // //                     key={cat._id}
// // //                     control={
// // //                       <Radio
// // //                         size="small"
// // //                         checked={selectedCategories[0] === cat._id}
// // //                         onChange={() => setSelectedCategories([cat._id])}
// // //                       />
// // //                     }
// // //                     label={
// // //                       <Typography fontSize={12.5} noWrap>
// // //                         {cat.title}
// // //                       </Typography>
// // //                     }
// // //                     sx={{
// // //                       display: "flex",
// // //                       width: "100%",
// // //                       ml: 0.5,
// // //                       my: 0.2,
// // //                     }}
// // //                   />
// // //                 ))}
// // //               </Box>

// // //               <Typography
// // //                 fontSize={12}
// // //                 fontWeight={500}
// // //                 mb={0.8}
// // //                 color="text.secondary"
// // //               >
// // //                 Food Type
// // //               </Typography>
// // //               <RadioGroup
// // //                 row
// // //                 value={itemFoodtype}
// // //                 onChange={(e) => setItemFoodtype(e.target.value)}
// // //                 sx={{ mb: 2 }}
// // //               >
// // //                 <FormControlLabel
// // //                   value="veg"
// // //                   control={<Radio size="small" />}
// // //                   label={<Typography fontSize={13}>Veg</Typography>}
// // //                 />
// // //                 <FormControlLabel
// // //                   value="non-veg"
// // //                   control={<Radio size="small" />}
// // //                   label={<Typography fontSize={13}>Non-Veg</Typography>}
// // //                 />
// // //               </RadioGroup>

// // //               <Button
// // //                 variant="contained"
// // //                 size="small"
// // //                 fullWidth
// // //                 onClick={handleAddItem}
// // //                 disabled={
// // //                   !newItemTitle.trim() || selectedCategories.length === 0
// // //                 }
// // //                 sx={{ textTransform: "none", borderRadius: 2, mt: "auto" }}
// // //               >
// // //                 Add Item
// // //               </Button>
// // //             </Box>
// // //           </Box>

// // //           {/* Tag Popover */}
// // //           <Popover
// // //             open={Boolean(tagAnchorEl)}
// // //             anchorEl={tagAnchorEl}
// // //             onClose={closeTagPopover}
// // //             anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
// // //             transformOrigin={{ vertical: "top", horizontal: "left" }}
// // //           >
// // //             <Box sx={{ p: 2, width: 320 }}>
// // //               <Typography fontWeight={600} fontSize={14} mb={2}>
// // //                 Category: {selectedCategoryName}
// // //               </Typography>
// // //               <TextField
// // //                 size="small"
// // //                 fullWidth
// // //                 autoFocus
// // //                 placeholder={`e.g. Select 2 ${selectedCategoryName}`}
// // //                 value={tempTagValue}
// // //                 onChange={(e) => setTempTagValue(e.target.value)}
// // //                 sx={{ mb: 2 }}
// // //               />
// // //               <Box display="flex" justifyContent="flex-end" gap={1}>
// // //                 <Button size="small" onClick={closeTagPopover}>
// // //                   Cancel
// // //                 </Button>
// // //                 <Button size="small" variant="contained" onClick={saveTag}>
// // //                   Save Tag
// // //                 </Button>
// // //               </Box>
// // //             </Box>
// // //           </Popover>

// // //           <Divider sx={{ my: 3 }} />

// // //           {/* ========== ADDONS ========== */}
// // //           <Box
// // //             display="flex"
// // //             alignItems="center"
// // //             justifyContent="space-between"
// // //             mb={1.5}
// // //           >
// // //             <Typography variant="subtitle1" fontWeight={700}>
// // //               Addons
// // //             </Typography>
// // //             <Button
// // //               size="small"
// // //               startIcon={<AddIcon />}
// // //               onClick={addAddonField}
// // //               sx={{ textTransform: "none" }}
// // //             >
// // //               Add Addon
// // //             </Button>
// // //           </Box>

// // //           {formData.packageAddons.map((addon, index) => (
// // //             <Box
// // //               key={index}
// // //               display="flex"
// // //               gap={1}
// // //               mb={1.5}
// // //               alignItems="center"
// // //             >
// // //               <TextField
// // //                 size="small"
// // //                 placeholder={`Addon ${index + 1}`}
// // //                 value={addon}
// // //                 onChange={(e) => handleAddonChange(index, e.target.value)}
// // //                 fullWidth
// // //               />
// // //               <IconButton
// // //                 size="small"
// // //                 color="error"
// // //                 onClick={() => removeAddon(index)}
// // //                 disabled={formData.packageAddons.length === 1}
// // //               >
// // //                 <DeleteOutlineIcon fontSize="small" />
// // //               </IconButton>
// // //             </Box>
// // //           ))}
// // //         </form>
// // //       </DialogContent>

// // //       {/* Footer */}
// // //       <DialogActions
// // //         sx={{
// // //           p: 2.5,
// // //           borderTop: "1px solid #e5e7eb",
// // //           bgcolor: "#fafafa",
// // //           gap: 1,
// // //         }}
// // //       >
// // //         <Button
// // //           onClick={onClose}
// // //           variant="outlined"
// // //           sx={{ textTransform: "none", borderRadius: 2 }}
// // //         >
// // //           Cancel
// // //         </Button>
// // //         <Button
// // //           type="submit"
// // //           form="edit-package-form"
// // //           variant="contained"
// // //           disabled={loadingUpdate}
// // //           sx={{ textTransform: "none", borderRadius: 2, minWidth: 160 }}
// // //         >
// // //           {loadingUpdate ? (
// // //             <CircularProgress size={22} color="inherit" />
// // //           ) : isCloningPackage ? (
// // //             "Clone Package"
// // //           ) : (
// // //             "Update Package"
// // //           )}
// // //         </Button>
// // //       </DialogActions>
// // //     </Dialog>
// // //   );
// // // };

// // // export default EditPackagePopup;






// // "use client";

// // import React, { useEffect, useState, useCallback, useMemo } from "react";
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
// //   List,
// //   ListItemButton,
// //   ListItemText,
// //   Popover,
// //   InputAdornment,
// // } from "@mui/material";
// // import CloseIcon from "@mui/icons-material/Close";
// // import AddIcon from "@mui/icons-material/Add";
// // import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
// // import SearchIcon from "@mui/icons-material/Search";
// // import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
// // import {
// //   updateVenuePackage,
// //   createVenuePackage,
// //   fetchPackageCategories,
// //   fetchPackageItemsByCategory,
// //   fetchPackageItems,
// // } from "@/services/venueListServices";
// // import { BASE_URL } from "@/utils/apiconstant";

// // const EditPackagePopup = ({
// //   isOpen,
// //   onClose,
// //   onSuccess,
// //   packageData,
// //   isCloningPackage,
// // }) => {
// //   console.log('%c [ packageData ]', 'font-size:13px; background:pink; color:#bf2c9f;', packageData)
// //   const [loadingUpdate, setLoadingUpdate] = useState(false);
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

// //   // UX states
// //   const [selectedCategoryId, setSelectedCategoryId] = useState("");
// //   const [selectedCategoryName, setSelectedCategoryName] = useState("");
// //   const [categorySearch, setCategorySearch] = useState("");
// //   const [itemSearch, setItemSearch] = useState("");
// //   const [tagAnchorEl, setTagAnchorEl] = useState(null);
// //   const [tagCategoryId, setTagCategoryId] = useState(null);
// //   const [tempTagValue, setTempTagValue] = useState("");

// //   // Lazy loading & category mapping
// //   const [itemsCache, setItemsCache] = useState({});
// //   const [loadingItems, setLoadingItems] = useState(false);
// //   const [displayedItems, setDisplayedItems] = useState([]);
// //   const [itemCategoryMap, setItemCategoryMap] = useState({});

// //   // Helper to extract category ID safely from any structure
// //   const extractCategoryId = (item) => {
// //     if (!item) return null;
// //     if (typeof item.categoryId === "object" && item.categoryId?._id) return item.categoryId._id;
// //     if (typeof item.categoryId === "string") return item.categoryId;
// //     if (typeof item.category === "object" && item.category?._id) return item.category._id;
// //     if (typeof item.category === "string") return item.category;
// //     if (Array.isArray(item.categoryIds) && item.categoryIds.length > 0) {
// //       const first = item.categoryIds[0];
// //       return typeof first === "object" ? first._id : first;
// //     }
// //     return null;
// //   };

// //   // ========== RESET + PREFILL ==========
// //   useEffect(() => {
// //     if (isOpen) {
// //       fetchPackageCategories(setPackageCategories);

// //       // Pre-fetch items catalog to map all selected IDs immediately
// //       fetchPackageItems(
// //         (allMasterItems) => {
// //           const mapping = {};
// //           (allMasterItems || []).forEach((item) => {
// //             const catId = extractCategoryId(item);
// //             if (catId) {
// //               mapping[item._id] = catId;
// //             }
// //           });
// //           setItemCategoryMap((prev) => ({ ...prev, ...mapping }));
// //         },
// //         () => {}
// //       );

// //       // Reset form
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
// //       setSelectedCategoryId("");
// //       setSelectedCategoryName("");
// //       setCategorySearch("");
// //       setItemSearch("");
// //       setItemsCache({});
// //       setDisplayedItems([]);

// //       // Prefill if packageData exists
// //       if (packageData) {
// //         const itemIds = [];
// //         const directMap = {};

// //         (packageData.packageItems || []).forEach((item) => {
// //           if (typeof item === "object" && item !== null) {
// //             itemIds.push(item._id);
// //             const catId = extractCategoryId(item);
// //             if (catId) {
// //               directMap[item._id] = catId;
// //             }
// //           } else if (item) {
// //             itemIds.push(item);
// //           }
// //         });

// //         if (Object.keys(directMap).length > 0) {
// //           setItemCategoryMap((prev) => ({ ...prev, ...directMap }));
// //         }

// //         setFormData({
// //           title: packageData.title || "",
// //           subTitle: packageData.subTitle || "",
// //           actualPrice: packageData.actualPrice || "",
// //           discountedPrice: packageData.discountedPrice || "",
// //           maxGuests: packageData.maxGuests || "",
// //           tag: packageData.tag || "",
// //           packageItems: itemIds,
// //           packageAddons: packageData.packageAddons?.length
// //             ? packageData.packageAddons
// //             : [""],
// //         });

// //         setImagePreview(packageData.packageImageUrl || "");
// //         setPackageCategoriesTags(packageData.packageCategoriesTags || {});
// //       }
// //     }
// //   }, [isOpen, packageData]);

// //   useEffect(() => {
// //     return () => {
// //       if (imagePreview && imagePreview.startsWith("blob:")) {
// //         URL.revokeObjectURL(imagePreview);
// //       }
// //     };
// //   }, [imagePreview]);

// //   // ========== CATEGORY COUNTS & AUTO-SORTING ==========
// //   const categorySelectedCounts = useMemo(() => {
// //     const counts = {};
// //     const selectedItemSet = new Set(formData.packageItems);

// //     selectedItemSet.forEach((itemId) => {
// //       const catId = itemCategoryMap[itemId];
// //       if (catId) {
// //         counts[catId] = (counts[catId] || 0) + 1;
// //       }
// //     });

// //     return counts;
// //   }, [formData.packageItems, itemCategoryMap]);

// //   const sortedAndFilteredCategories = useMemo(() => {
// //     let list = [...packageCategories];

// //     if (categorySearch.trim()) {
// //       const q = categorySearch.toLowerCase().trim();
// //       list = list.filter((cat) => cat.title?.toLowerCase().includes(q));
// //     }

// //     return list.sort((a, b) => {
// //       const countA = categorySelectedCounts[a._id] || 0;
// //       const countB = categorySelectedCounts[b._id] || 0;

// //       const hasA = countA > 0 ? 1 : 0;
// //       const hasB = countB > 0 ? 1 : 0;

// //       if (hasB !== hasA) {
// //         return hasB - hasA;
// //       }
// //       return countB - countA;
// //     });
// //   }, [packageCategories, categorySearch, categorySelectedCounts]);

// //   // ========== LOAD ITEMS ==========
// //   const loadItemsForCategory = useCallback(
// //     async (categoryId, search = "", force = false) => {
// //       if (!categoryId) {
// //         setDisplayedItems([]);
// //         return;
// //       }

// //       if (!force && !search && itemsCache[categoryId]) {
// //         setDisplayedItems(itemsCache[categoryId]);
// //         return;
// //       }

// //       setLoadingItems(true);
// //       try {
// //         const { items } = await fetchPackageItemsByCategory({
// //           categoryId,
// //           search,
// //           limit: 200,
// //         });

// //         if (!search) {
// //           setItemsCache((prev) => ({
// //             ...prev,
// //             [categoryId]: items,
// //           }));
// //         }

// //         setItemCategoryMap((prev) => {
// //           const updated = { ...prev };
// //           items.forEach((it) => {
// //             updated[it._id] = categoryId;
// //           });
// //           return updated;
// //         });

// //         setDisplayedItems(items);
// //       } catch (err) {
// //         console.error(err);
// //         setDisplayedItems([]);
// //       } finally {
// //         setLoadingItems(false);
// //       }
// //     },
// //     [itemsCache]
// //   );

// //   const handleCategorySelect = (catId, catTitle) => {
// //     setSelectedCategoryId(catId);
// //     setSelectedCategoryName(catTitle);
// //     setItemSearch("");
// //     loadItemsForCategory(catId);
// //   };

// //   useEffect(() => {
// //     if (!selectedCategoryId) return;

// //     const timer = setTimeout(() => {
// //       loadItemsForCategory(selectedCategoryId, itemSearch.trim());
// //     }, 350);

// //     return () => clearTimeout(timer);
// //   }, [itemSearch]); // eslint-disable-line

// //   // ========== HANDLERS ==========
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
// //     payload.append("venueId", packageData.venueId);
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

// //     if (isCloningPackage) {
// //       createVenuePackage(payload, onSuccess, onClose, setLoadingUpdate);
// //     } else {
// //       updateVenuePackage(
// //         packageData._id,
// //         payload,
// //         onSuccess,
// //         onClose,
// //         setLoadingUpdate
// //       );
// //     }
// //   };

// //   const handleAddItem = async () => {
// //     if (!newItemTitle.trim() || selectedCategories.length === 0) return;

// //     const categoryIdToRefresh = selectedCategories[0];

// //     const payload = {
// //       title: newItemTitle,
// //       categoryIds: selectedCategories,
// //       foodType: itemFoodtype,
// //     };

// //     try {
// //       const res = await fetch(`${BASE_URL}/api/party-venue/package-item/create-item`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify(payload),
// //       });
// //       const data = await res.json();
// //       const createdItem = data.data;

// //       if (createdItem?._id) {
// //         setItemCategoryMap((prev) => ({
// //           ...prev,
// //           [createdItem._id]: categoryIdToRefresh,
// //         }));
// //       }

// //       setNewItemTitle("");
// //       setSelectedCategories([]);
// //       setItemFoodtype("");

// //       setItemsCache((prev) => {
// //         const copy = { ...prev };
// //         delete copy[categoryIdToRefresh];
// //         return copy;
// //       });

// //       if (selectedCategoryId === categoryIdToRefresh) {
// //         setLoadingItems(true);
// //         try {
// //           const { items } = await fetchPackageItemsByCategory({
// //             categoryId: selectedCategoryId,
// //             search: itemSearch.trim(),
// //             limit: 200,
// //           });

// //           setItemsCache((prev) => ({
// //             ...prev,
// //             [selectedCategoryId]: items,
// //           }));
// //           setDisplayedItems(items);
// //         } catch (err) {
// //           console.error(err);
// //         } finally {
// //           setLoadingItems(false);
// //         }
// //       }
// //     } catch (err) {
// //       console.error(err);
// //     }
// //   };

// //   const openTagPopover = (event, categoryId) => {
// //     setTagAnchorEl(event.currentTarget);
// //     setTagCategoryId(categoryId);
// //     setTempTagValue(packageCategoriesTags[categoryId] || "");
// //   };

// //   const closeTagPopover = () => {
// //     setTagAnchorEl(null);
// //     setTagCategoryId(null);
// //     setTempTagValue("");
// //   };

// //   const saveTag = () => {
// //     if (tagCategoryId) {
// //       setPackageCategoriesTags((prev) => ({
// //         ...prev,
// //         [tagCategoryId]: tempTagValue,
// //       }));
// //     }
// //     closeTagPopover();
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
// //           maxHeight: "94vh",
// //           display: "flex",
// //           flexDirection: "column",
// //         },
// //       }}
// //     >
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
// //           {isCloningPackage ? "Clone Package" : "Edit Package"}
// //         </Typography>
// //         <IconButton onClick={onClose} size="small">
// //           <CloseIcon />
// //         </IconButton>
// //       </DialogTitle>

// //       <DialogContent
// //         dividers
// //         sx={{ p: 3, overflowY: "auto", flex: 1 }}
// //         className="slim-scrollbar"
// //       >
// //         <form id="edit-package-form" onSubmit={handleSubmit}>
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

// //           <Box
// //             display="grid"
// //             gridTemplateColumns="1fr 1fr 1fr 1fr"
// //             gap={2}
// //             mb={2}
// //           >
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
// //           <Box display="flex" alignItems="center" gap={1.5} mb={2}>
// //             <Typography variant="subtitle1" fontWeight={700}>
// //               Package Items
// //             </Typography>
// //             <Chip
// //               label={`${formData.packageItems.length} selected`}
// //               size="small"
// //               color={formData.packageItems.length > 0 ? "primary" : "default"}
// //               sx={{ fontWeight: 600 }}
// //             />
// //           </Box>

// //           <Box
// //             display="flex"
// //             sx={{
// //               border: "1px solid #e5e7eb",
// //               borderRadius: 2,
// //               overflow: "hidden",
// //               height: 440,
// //             }}
// //           >
// //             {/* LEFT: Categories */}
// //             <Box
// //               sx={{
// //                 width: "25%",
// //                 minWidth: 230,
// //                 borderRight: "1px solid #e5e7eb",
// //                 bgcolor: "#f8fafc",
// //                 display: "flex",
// //                 flexDirection: "column",
// //               }}
// //             >
// //               <Box sx={{ p: 1.5, borderBottom: "1px solid #e5e7eb" }}>
// //                 <Typography
// //                   fontWeight={600}
// //                   fontSize={13}
// //                   color="text.secondary"
// //                   mb={1}
// //                 >
// //                   Categories ({packageCategories.length})
// //                 </Typography>
// //                 <TextField
// //                   size="small"
// //                   placeholder="Search category..."
// //                   value={categorySearch}
// //                   onChange={(e) => setCategorySearch(e.target.value)}
// //                   fullWidth
// //                   InputProps={{
// //                     startAdornment: (
// //                       <InputAdornment position="start">
// //                         <SearchIcon fontSize="small" color="action" />
// //                       </InputAdornment>
// //                     ),
// //                   }}
// //                   sx={{
// //                     "& .MuiInputBase-root": {
// //                       bgcolor: "white",
// //                       fontSize: 13,
// //                     },
// //                   }}
// //                 />
// //               </Box>

// //               <List
// //                 dense
// //                 className="slim-scrollbar"
// //                 sx={{ overflowY: "auto", flex: 1, py: 0 }}
// //               >
// //                 {sortedAndFilteredCategories.length === 0 ? (
// //                   <Typography
// //                     color="text.secondary"
// //                     textAlign="center"
// //                     py={4}
// //                     fontSize={13}
// //                   >
// //                     No category found
// //                   </Typography>
// //                 ) : (
// //                   sortedAndFilteredCategories.map((cat) => {
// //                     const selectedCount = categorySelectedCounts[cat._id] || 0;
// //                     return (
// //                       <ListItemButton
// //                         key={cat._id}
// //                         selected={selectedCategoryId === cat._id}
// //                         onClick={() => handleCategorySelect(cat._id, cat.title)}
// //                         sx={{
// //                           py: 1,
// //                           display: "flex",
// //                           justifyContent: "space-between",
// //                           alignItems: "center",
// //                           gap: 1,
// //                         }}
// //                       >
// //                         <ListItemText
// //                           primary={cat.title}
// //                           secondary={
// //                             packageCategoriesTags[cat._id]
// //                               ? packageCategoriesTags[cat._id]
// //                               : null
// //                           }
// //                           primaryTypographyProps={{
// //                             fontSize: 13,
// //                             fontWeight: selectedCount > 0 ? 600 : 400,
// //                             noWrap: true,
// //                           }}
// //                           secondaryTypographyProps={{
// //                             fontSize: 11,
// //                             noWrap: true,
// //                           }}
// //                         />
// //                         {selectedCount > 0 && (
// //                           <Chip
// //                             label={selectedCount}
// //                             size="small"
// //                             color="primary"
// //                             sx={{
// //                               height: 20,
// //                               fontSize: 11,
// //                               fontWeight: 700,
// //                               minWidth: 24,
// //                               "& .MuiChip-label": { px: 0.8 },
// //                             }}
// //                           />
// //                         )}
// //                       </ListItemButton>
// //                     );
// //                   })
// //                 )}
// //               </List>
// //             </Box>

// //             {/* MIDDLE: Items */}
// //             <Box
// //               sx={{
// //                 width: "50%",
// //                 display: "flex",
// //                 flexDirection: "column",
// //                 borderRight: "1px solid #e5e7eb",
// //               }}
// //             >
// //               <Box
// //                 sx={{
// //                   p: 1.5,
// //                   borderBottom: "1px solid #e5e7eb",
// //                   display: "flex",
// //                   gap: 1,
// //                   alignItems: "center",
// //                 }}
// //               >
// //                 <TextField
// //                   size="small"
// //                   placeholder={
// //                     selectedCategoryId
// //                       ? "Search in this category..."
// //                       : "Select a category first"
// //                   }
// //                   value={itemSearch}
// //                   onChange={(e) => setItemSearch(e.target.value)}
// //                   disabled={!selectedCategoryId}
// //                   fullWidth
// //                   InputProps={{
// //                     startAdornment: (
// //                       <InputAdornment position="start">
// //                         <SearchIcon fontSize="small" color="action" />
// //                       </InputAdornment>
// //                     ),
// //                   }}
// //                 />

// //                 {selectedCategoryId && (
// //                   <Button
// //                     variant="outlined"
// //                     size="small"
// //                     startIcon={<LocalOfferOutlinedIcon />}
// //                     onClick={(e) => openTagPopover(e, selectedCategoryId)}
// //                     sx={{
// //                       textTransform: "none",
// //                       whiteSpace: "nowrap",
// //                       minWidth: 140,
// //                     }}
// //                   >
// //                     {packageCategoriesTags[selectedCategoryId]
// //                       ? "Edit Category Tag"
// //                       : "Add Category Tag"}
// //                   </Button>
// //                 )}
// //               </Box>

// //               <Box
// //                 className="slim-scrollbar"
// //                 sx={{
// //                   overflowY: "auto",
// //                   flex: 1,
// //                   p: 1,
// //                   position: "relative",
// //                 }}
// //               >
// //                 {!selectedCategoryId ? (
// //                   <Typography
// //                     color="text.secondary"
// //                     textAlign="center"
// //                     py={8}
// //                     fontSize={14}
// //                   >
// //                     ← Select a category to view items
// //                   </Typography>
// //                 ) : loadingItems ? (
// //                   <Box
// //                     display="flex"
// //                     justifyContent="center"
// //                     alignItems="center"
// //                     height="100%"
// //                   >
// //                     <CircularProgress size={28} />
// //                   </Box>
// //                 ) : displayedItems.length === 0 ? (
// //                   <Typography
// //                     color="text.secondary"
// //                     textAlign="center"
// //                     py={6}
// //                     fontSize={14}
// //                   >
// //                     {itemSearch
// //                       ? "No items match your search"
// //                       : "No items in this category"}
// //                   </Typography>
// //                 ) : (
// //                   displayedItems.map((item) => (
// //                     <FormControlLabel
// //                       key={item._id}
// //                       control={
// //                         <Checkbox
// //                           size="small"
// //                           checked={formData.packageItems.includes(item._id)}
// //                           onChange={() => handleItemSelection(item._id)}
// //                         />
// //                       }
// //                       label={
// //                         <Typography fontSize={13}>
// //                           {item.foodType === "veg" ? "🟢" : "🔴"} {item.title}
// //                         </Typography>
// //                       }
// //                       sx={{
// //                         display: "flex",
// //                         ml: 0.5,
// //                         borderRadius: 1,
// //                         width: "100%",
// //                         "&:hover": { bgcolor: "#f8fafc" },
// //                       }}
// //                     />
// //                   ))
// //                 )}
// //               </Box>
// //             </Box>

// //             {/* RIGHT: Create New Item */}
// //             <Box
// //               sx={{
// //                 width: "25%",
// //                 minWidth: 220,
// //                 bgcolor: "#fafafa",
// //                 display: "flex",
// //                 flexDirection: "column",
// //                 p: 2,
// //               }}
// //             >
// //               <Typography fontWeight={700} fontSize={14} mb={2}>
// //                 Create New Item
// //               </Typography>

// //               <TextField
// //                 size="small"
// //                 label="Item Title"
// //                 value={newItemTitle}
// //                 onChange={(e) => setNewItemTitle(e.target.value)}
// //                 fullWidth
// //                 sx={{ mb: 2 }}
// //               />

// //               <Typography
// //                 fontSize={12}
// //                 fontWeight={500}
// //                 mb={0.8}
// //                 color="text.secondary"
// //               >
// //                 Category
// //               </Typography>
// //               <Box
// //                 className="slim-scrollbar"
// //                 sx={{
// //                   flex: 1,
// //                   maxHeight: 160,
// //                   overflowY: "auto",
// //                   border: "1px solid #e5e7eb",
// //                   borderRadius: 1.5,
// //                   bgcolor: "white",
// //                   mb: 2,
// //                   px: 0.5,
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
// //                     label={
// //                       <Typography fontSize={12.5} noWrap>
// //                         {cat.title}
// //                       </Typography>
// //                     }
// //                     sx={{
// //                       display: "flex",
// //                       width: "100%",
// //                       ml: 0.5,
// //                       my: 0.2,
// //                     }}
// //                   />
// //                 ))}
// //               </Box>

// //               <Typography
// //                 fontSize={12}
// //                 fontWeight={500}
// //                 mb={0.8}
// //                 color="text.secondary"
// //               >
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
// //                 disabled={
// //                   !newItemTitle.trim() || selectedCategories.length === 0
// //                 }
// //                 sx={{ textTransform: "none", borderRadius: 2, mt: "auto" }}
// //               >
// //                 Add Item
// //               </Button>
// //             </Box>
// //           </Box>

// //           <Popover
// //             open={Boolean(tagAnchorEl)}
// //             anchorEl={tagAnchorEl}
// //             onClose={closeTagPopover}
// //             anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
// //             transformOrigin={{ vertical: "top", horizontal: "left" }}
// //           >
// //             <Box sx={{ p: 2, width: 320 }}>
// //               <Typography fontWeight={600} fontSize={14} mb={2}>
// //                 Category: {selectedCategoryName}
// //               </Typography>
// //               <TextField
// //                 size="small"
// //                 fullWidth
// //                 autoFocus
// //                 placeholder={`e.g. Select 2 ${selectedCategoryName}`}
// //                 value={tempTagValue}
// //                 onChange={(e) => setTempTagValue(e.target.value)}
// //                 sx={{ mb: 2 }}
// //               />
// //               <Box display="flex" justifyContent="flex-end" gap={1}>
// //                 <Button size="small" onClick={closeTagPopover}>
// //                   Cancel
// //                 </Button>
// //                 <Button size="small" variant="contained" onClick={saveTag}>
// //                   Save Tag
// //                 </Button>
// //               </Box>
// //             </Box>
// //           </Popover>

// //           <Divider sx={{ my: 3 }} />

// //           {/* ========== ADDONS ========== */}
// //           <Box
// //             display="flex"
// //             alignItems="center"
// //             justifyContent="space-between"
// //             mb={1.5}
// //           >
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
// //             <Box
// //               key={index}
// //               display="flex"
// //               gap={1}
// //               mb={1.5}
// //               alignItems="center"
// //             >
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
// //           form="edit-package-form"
// //           variant="contained"
// //           disabled={loadingUpdate}
// //           sx={{ textTransform: "none", borderRadius: 2, minWidth: 160 }}
// //         >
// //           {loadingUpdate ? (
// //             <CircularProgress size={22} color="inherit" />
// //           ) : isCloningPackage ? (
// //             "Clone Package"
// //           ) : (
// //             "Update Package"
// //           )}
// //         </Button>
// //       </DialogActions>
// //     </Dialog>
// //   );
// // };

// // export default EditPackagePopup;








// "use client";

// import React, { useEffect, useState, useCallback, useMemo } from "react";
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
//   updateVenuePackage,
//   createVenuePackage,
//   fetchPackageCategories,
//   fetchPackageItemsByCategory,
//   fetchPackageItems,
// } from "@/services/venueListServices";
// import { BASE_URL } from "@/utils/apiconstant";

// const EditPackagePopup = ({
//   isOpen,
//   onClose,
//   onSuccess,
//   packageData,
//   isCloningPackage,
// }) => {
//   const [loadingUpdate, setLoadingUpdate] = useState(false);
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

//   // UX states
//   const [selectedCategoryId, setSelectedCategoryId] = useState("");
//   const [selectedCategoryName, setSelectedCategoryName] = useState("");
//   const [categorySearch, setCategorySearch] = useState("");
//   const [itemSearch, setItemSearch] = useState("");
//   const [tagAnchorEl, setTagAnchorEl] = useState(null);
//   const [tagCategoryId, setTagCategoryId] = useState(null);
//   const [tempTagValue, setTempTagValue] = useState("");

//   // Lazy loading & category mapping
//   const [itemsCache, setItemsCache] = useState({});
//   const [loadingItems, setLoadingItems] = useState(false);
//   const [displayedItems, setDisplayedItems] = useState([]);
//   const [itemCategoryMap, setItemCategoryMap] = useState({});

//   // Helper to safely extract category ID from any structure (flat, populated, nested)
//   const extractCategoryId = (item) => {
//     if (!item) return null;
//     // Direct categoryId object or string
//     if (typeof item.categoryId === "object" && item.categoryId?._id) return item.categoryId._id;
//     if (typeof item.categoryId === "string") return item.categoryId;

//     // Inside nested itemId object if categoryIds array exists
//     const targetItem = item.itemId || item;
//     if (Array.isArray(targetItem?.categoryIds) && targetItem.categoryIds.length > 0) {
//       const first = targetItem.categoryIds[0];
//       return typeof first === "object" ? first._id : first;
//     }
//     if (typeof targetItem?.category === "object" && targetItem.category?._id) return targetItem.category._id;
//     if (typeof targetItem?.category === "string") return targetItem.category;

//     return null;
//   };

//   // Helper to safely extract item ID from flat string or populated object
//   const extractItemId = (item) => {
//     if (!item) return null;
//     if (typeof item === "string") return item;
//     if (item.itemId) {
//       return typeof item.itemId === "object" ? item.itemId?._id : item.itemId;
//     }
//     return item._id || null;
//   };

//   // ========== RESET + PREFILL ==========
//   useEffect(() => {
//     if (isOpen) {
//       fetchPackageCategories(setPackageCategories);

//       // Pre-fetch items catalog to map all selected IDs
//       fetchPackageItems(
//         (allMasterItems) => {
//           const mapping = {};
//           (allMasterItems || []).forEach((item) => {
//             const catId = extractCategoryId(item);
//             if (catId && item._id) {
//               mapping[item._id] = catId;
//             }
//           });
//           setItemCategoryMap((prev) => ({ ...prev, ...mapping }));
//         },
//         () => {}
//       );

//       // Reset form defaults
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
//       setSelectedCategoryId("");
//       setSelectedCategoryName("");
//       setCategorySearch("");
//       setItemSearch("");
//       setItemsCache({});
//       setDisplayedItems([]);

//       // Prefill if packageData exists
//       if (packageData) {
//         const itemIds = [];
//         const directMap = {};

//         (packageData.packageItems || []).forEach((item) => {
//           const rawItemId = extractItemId(item);
//           const rawCatId = extractCategoryId(item);

//           if (rawItemId) {
//             itemIds.push(rawItemId);
//             if (rawCatId) {
//               directMap[rawItemId] = rawCatId;
//             }
//           }
//         });

//         if (Object.keys(directMap).length > 0) {
//           setItemCategoryMap((prev) => ({ ...prev, ...directMap }));
//         }

//         setFormData({
//           title: packageData.title || "",
//           subTitle: packageData.subTitle || "",
//           actualPrice: packageData.actualPrice ?? "",
//           discountedPrice: packageData.discountedPrice ?? "",
//           maxGuests: packageData.maxGuests ?? "",
//           tag: packageData.tag || "",
//           packageItems: itemIds,
//           packageAddons: packageData.packageAddons?.length
//             ? packageData.packageAddons
//             : [""],
//         });

//         setImagePreview(packageData.packageImageUrl || "");
//         setPackageCategoriesTags(packageData.packageCategoriesTags || {});
//       }
//     }
//   }, [isOpen, packageData]);

//   useEffect(() => {
//     return () => {
//       if (imagePreview && imagePreview.startsWith("blob:")) {
//         URL.revokeObjectURL(imagePreview);
//       }
//     };
//   }, [imagePreview]);

//   // ========== CATEGORY COUNTS & AUTO-SORTING ==========
//   const categorySelectedCounts = useMemo(() => {
//     const counts = {};
//     const selectedItemSet = new Set(formData.packageItems);

//     selectedItemSet.forEach((itemId) => {
//       const catId = itemCategoryMap[itemId];
//       if (catId) {
//         counts[catId] = (counts[catId] || 0) + 1;
//       }
//     });

//     return counts;
//   }, [formData.packageItems, itemCategoryMap]);

//   const sortedAndFilteredCategories = useMemo(() => {
//     let list = [...packageCategories];

//     if (categorySearch.trim()) {
//       const q = categorySearch.toLowerCase().trim();
//       list = list.filter((cat) => cat.title?.toLowerCase().includes(q));
//     }

//     return list.sort((a, b) => {
//       const countA = categorySelectedCounts[a._id] || 0;
//       const countB = categorySelectedCounts[b._id] || 0;

//       const hasA = countA > 0 ? 1 : 0;
//       const hasB = countB > 0 ? 1 : 0;

//       if (hasB !== hasA) {
//         return hasB - hasA;
//       }
//       return countB - countA;
//     });
//   }, [packageCategories, categorySearch, categorySelectedCounts]);

//   // ========== LOAD ITEMS ==========
//   const loadItemsForCategory = useCallback(
//     async (categoryId, search = "", force = false) => {
//       if (!categoryId) {
//         setDisplayedItems([]);
//         return;
//       }

//       if (!force && !search && itemsCache[categoryId]) {
//         setDisplayedItems(itemsCache[categoryId]);
//         return;
//       }

//       setLoadingItems(true);
//       try {
//         const { items } = await fetchPackageItemsByCategory({
//           categoryId,
//           search,
//           limit: 200,
//         });

//         if (!search) {
//           setItemsCache((prev) => ({
//             ...prev,
//             [categoryId]: items,
//           }));
//         }

//         setItemCategoryMap((prev) => {
//           const updated = { ...prev };
//           (items || []).forEach((it) => {
//             updated[it._id] = categoryId;
//           });
//           return updated;
//         });

//         setDisplayedItems(items || []);
//       } catch (err) {
//         console.error(err);
//         setDisplayedItems([]);
//       } finally {
//         setLoadingItems(false);
//       }
//     },
//     [itemsCache]
//   );

//   const handleCategorySelect = (catId, catTitle) => {
//     setSelectedCategoryId(catId);
//     setSelectedCategoryName(catTitle);
//     setItemSearch("");
//     loadItemsForCategory(catId);
//   };

//   useEffect(() => {
//     if (!selectedCategoryId) return;

//     const timer = setTimeout(() => {
//       loadItemsForCategory(selectedCategoryId, itemSearch.trim());
//     }, 350);

//     return () => clearTimeout(timer);
//   }, [itemSearch, selectedCategoryId, loadItemsForCategory]);

//   // ========== HANDLERS ==========
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
//     payload.append("venueId", packageData.venueId);
//     payload.append("title", formData.title);
//     payload.append("subTitle", formData.subTitle);
//     payload.append("actualPrice", formData.actualPrice);
//     payload.append("discountedPrice", formData.discountedPrice);
//     payload.append("maxGuests", formData.maxGuests);
//     payload.append("tag", formData.tag);

//     // Schema expects items with their category reference:
//     // [ { itemId: "...", categoryId: "..." } ]
//     const formattedPackageItems = formData.packageItems.map((itemId) => ({
//       itemId,
//       categoryId: itemCategoryMap[itemId] || null,
//     }));

//     payload.append("packageItems", JSON.stringify(formattedPackageItems));
//     payload.append("packageAddons", JSON.stringify(formData.packageAddons));
//     payload.append(
//       "packageCategoriesTags",
//       JSON.stringify(packageCategoriesTags)
//     );

//     if (packageImage) {
//       payload.append("image", packageImage);
//     }

//     if (isCloningPackage) {
//       createVenuePackage(payload, onSuccess, onClose, setLoadingUpdate);
//     } else {
//       updateVenuePackage(
//         packageData._id,
//         payload,
//         onSuccess,
//         onClose,
//         setLoadingUpdate
//       );
//     }
//   };

//   const handleAddItem = async () => {
//     if (!newItemTitle.trim() || selectedCategories.length === 0) return;

//     const categoryIdToRefresh = selectedCategories[0];

//     const payload = {
//       title: newItemTitle,
//       categoryIds: selectedCategories,
//       foodType: itemFoodtype,
//     };

//     try {
//       const res = await fetch(`${BASE_URL}/api/party-venue/package-item/create-item`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       const createdItem = data.data;

//       if (createdItem?._id) {
//         setItemCategoryMap((prev) => ({
//           ...prev,
//           [createdItem._id]: categoryIdToRefresh,
//         }));
//       }

//       setNewItemTitle("");
//       setSelectedCategories([]);
//       setItemFoodtype("");

//       setItemsCache((prev) => {
//         const copy = { ...prev };
//         delete copy[categoryIdToRefresh];
//         return copy;
//       });

//       if (selectedCategoryId === categoryIdToRefresh) {
//         loadItemsForCategory(selectedCategoryId, itemSearch.trim(), true);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

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
//           {isCloningPackage ? "Clone Package" : "Edit Package"}
//         </Typography>
//         <IconButton onClick={onClose} size="small">
//           <CloseIcon />
//         </IconButton>
//       </DialogTitle>

//       <DialogContent
//         dividers
//         sx={{ p: 3, overflowY: "auto", flex: 1 }}
//         className="slim-scrollbar"
//       >
//         <form id="edit-package-form" onSubmit={handleSubmit}>
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

//           {/* ========== PACKAGE ITEMS ========== */}
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
//             sx={{
//               border: "1px solid #e5e7eb",
//               borderRadius: 2,
//               overflow: "hidden",
//               height: 440,
//             }}
//           >
//             {/* LEFT: Categories */}
//             <Box
//               sx={{
//                 width: "25%",
//                 minWidth: 230,
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
//                   mb={1}
//                 >
//                   Categories ({packageCategories.length})
//                 </Typography>
//                 <TextField
//                   size="small"
//                   placeholder="Search category..."
//                   value={categorySearch}
//                   onChange={(e) => setCategorySearch(e.target.value)}
//                   fullWidth
//                   InputProps={{
//                     startAdornment: (
//                       <InputAdornment position="start">
//                         <SearchIcon fontSize="small" color="action" />
//                       </InputAdornment>
//                     ),
//                   }}
//                   sx={{
//                     "& .MuiInputBase-root": {
//                       bgcolor: "white",
//                       fontSize: 13,
//                     },
//                   }}
//                 />
//               </Box>

//               <List
//                 dense
//                 className="slim-scrollbar"
//                 sx={{ overflowY: "auto", flex: 1, py: 0 }}
//               >
//                 {sortedAndFilteredCategories.length === 0 ? (
//                   <Typography
//                     color="text.secondary"
//                     textAlign="center"
//                     py={4}
//                     fontSize={13}
//                   >
//                     No category found
//                   </Typography>
//                 ) : (
//                   sortedAndFilteredCategories.map((cat) => {
//                     const selectedCount = categorySelectedCounts[cat._id] || 0;
//                     return (
//                       <ListItemButton
//                         key={cat._id}
//                         selected={selectedCategoryId === cat._id}
//                         onClick={() => handleCategorySelect(cat._id, cat.title)}
//                         sx={{
//                           py: 1,
//                           display: "flex",
//                           justifyContent: "space-between",
//                           alignItems: "center",
//                           gap: 1,
//                         }}
//                       >
//                         <ListItemText
//                           primary={cat.title}
//                           secondary={
//                             packageCategoriesTags[cat._id]
//                               ? packageCategoriesTags[cat._id]
//                               : null
//                           }
//                           primaryTypographyProps={{
//                             fontSize: 13,
//                             fontWeight: selectedCount > 0 ? 600 : 400,
//                             noWrap: true,
//                           }}
//                           secondaryTypographyProps={{
//                             fontSize: 11,
//                             noWrap: true,
//                           }}
//                         />
//                         {selectedCount > 0 && (
//                           <Chip
//                             label={selectedCount}
//                             size="small"
//                             color="primary"
//                             sx={{
//                               height: 20,
//                               fontSize: 11,
//                               fontWeight: 700,
//                               minWidth: 24,
//                               "& .MuiChip-label": { px: 0.8 },
//                             }}
//                           />
//                         )}
//                       </ListItemButton>
//                     );
//                   })
//                 )}
//               </List>
//             </Box>

//             {/* MIDDLE: Items */}
//             <Box
//               sx={{
//                 width: "50%",
//                 display: "flex",
//                 flexDirection: "column",
//                 borderRight: "1px solid #e5e7eb",
//               }}
//             >
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
//                   placeholder={
//                     selectedCategoryId
//                       ? "Search in this category..."
//                       : "Select a category first"
//                   }
//                   value={itemSearch}
//                   onChange={(e) => setItemSearch(e.target.value)}
//                   disabled={!selectedCategoryId}
//                   fullWidth
//                   InputProps={{
//                     startAdornment: (
//                       <InputAdornment position="start">
//                         <SearchIcon fontSize="small" color="action" />
//                       </InputAdornment>
//                     ),
//                   }}
//                 />

//                 {selectedCategoryId && (
//                   <Button
//                     variant="outlined"
//                     size="small"
//                     startIcon={<LocalOfferOutlinedIcon />}
//                     onClick={(e) => openTagPopover(e, selectedCategoryId)}
//                     sx={{
//                       textTransform: "none",
//                       whiteSpace: "nowrap",
//                       minWidth: 140,
//                     }}
//                   >
//                     {packageCategoriesTags[selectedCategoryId]
//                       ? "Edit Category Tag"
//                       : "Add Category Tag"}
//                   </Button>
//                 )}
//               </Box>

//               <Box
//                 className="slim-scrollbar"
//                 sx={{
//                   overflowY: "auto",
//                   flex: 1,
//                   p: 1,
//                   position: "relative",
//                 }}
//               >
//                 {!selectedCategoryId ? (
//                   <Typography
//                     color="text.secondary"
//                     textAlign="center"
//                     py={8}
//                     fontSize={14}
//                   >
//                     ← Select a category to view items
//                   </Typography>
//                 ) : loadingItems ? (
//                   <Box
//                     display="flex"
//                     justifyContent="center"
//                     alignItems="center"
//                     height="100%"
//                   >
//                     <CircularProgress size={28} />
//                   </Box>
//                 ) : displayedItems.length === 0 ? (
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

//             {/* RIGHT: Create New Item */}
//             <Box
//               sx={{
//                 width: "25%",
//                 minWidth: 220,
//                 bgcolor: "#fafafa",
//                 display: "flex",
//                 flexDirection: "column",
//                 p: 2,
//               }}
//             >
//               <Typography fontWeight={700} fontSize={14} mb={2}>
//                 Create New Item
//               </Typography>

//               <TextField
//                 size="small"
//                 label="Item Title"
//                 value={newItemTitle}
//                 onChange={(e) => setNewItemTitle(e.target.value)}
//                 fullWidth
//                 sx={{ mb: 2 }}
//               />

//               <Typography
//                 fontSize={12}
//                 fontWeight={500}
//                 mb={0.8}
//                 color="text.secondary"
//               >
//                 Category
//               </Typography>
//               <Box
//                 className="slim-scrollbar"
//                 sx={{
//                   flex: 1,
//                   maxHeight: 160,
//                   overflowY: "auto",
//                   border: "1px solid #e5e7eb",
//                   borderRadius: 1.5,
//                   bgcolor: "white",
//                   mb: 2,
//                   px: 0.5,
//                 }}
//               >
//                 {packageCategories?.map((cat) => (
//                   <FormControlLabel
//                     key={cat._id}
//                     control={
//                       <Radio
//                         size="small"
//                         checked={selectedCategories[0] === cat._id}
//                         onChange={() => setSelectedCategories([cat._id])}
//                       />
//                     }
//                     label={
//                       <Typography fontSize={12.5} noWrap>
//                         {cat.title}
//                       </Typography>
//                     }
//                     sx={{
//                       display: "flex",
//                       width: "100%",
//                       ml: 0.5,
//                       my: 0.2,
//                     }}
//                   />
//                 ))}
//               </Box>

//               <Typography
//                 fontSize={12}
//                 fontWeight={500}
//                 mb={0.8}
//                 color="text.secondary"
//               >
//                 Food Type
//               </Typography>
//               <RadioGroup
//                 row
//                 value={itemFoodtype}
//                 onChange={(e) => setItemFoodtype(e.target.value)}
//                 sx={{ mb: 2 }}
//               >
//                 <FormControlLabel
//                   value="veg"
//                   control={<Radio size="small" />}
//                   label={<Typography fontSize={13}>Veg</Typography>}
//                 />
//                 <FormControlLabel
//                   value="non-veg"
//                   control={<Radio size="small" />}
//                   label={<Typography fontSize={13}>Non-Veg</Typography>}
//                 />
//               </RadioGroup>

//               <Button
//                 variant="contained"
//                 size="small"
//                 fullWidth
//                 onClick={handleAddItem}
//                 disabled={
//                   !newItemTitle.trim() || selectedCategories.length === 0
//                 }
//                 sx={{ textTransform: "none", borderRadius: 2, mt: "auto" }}
//               >
//                 Add Item
//               </Button>
//             </Box>
//           </Box>

//           <Popover
//             open={Boolean(tagAnchorEl)}
//             anchorEl={tagAnchorEl}
//             onClose={closeTagPopover}
//             anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
//             transformOrigin={{ vertical: "top", horizontal: "left" }}
//           >
//             <Box sx={{ p: 2, width: 320 }}>
//               <Typography fontWeight={600} fontSize={14} mb={2}>
//                 Category: {selectedCategoryName}
//               </Typography>
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
//           form="edit-package-form"
//           variant="contained"
//           disabled={loadingUpdate}
//           sx={{ textTransform: "none", borderRadius: 2, minWidth: 160 }}
//         >
//           {loadingUpdate ? (
//             <CircularProgress size={22} color="inherit" />
//           ) : isCloningPackage ? (
//             "Clone Package"
//           ) : (
//             "Update Package"
//           )}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default EditPackagePopup;



// Is version me humne item me item id ke sath category id bhi send ki hia 

"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  updateVenuePackage,
  createVenuePackage,
  fetchPackageCategories,
  fetchPackageItemsByCategory,
  fetchPackageItems,
} from "@/services/venueListServices";
import { BASE_URL } from "@/utils/apiconstant";

const EditPackagePopup = ({
  isOpen,
  onClose,
  onSuccess,
  packageData,
  isCloningPackage,
}) => {
  const [loadingUpdate, setLoadingUpdate] = useState(false);
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
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [tagAnchorEl, setTagAnchorEl] = useState(null);
  const [tagCategoryId, setTagCategoryId] = useState(null);
  const [tempTagValue, setTempTagValue] = useState("");

  // Lazy loading & category mapping
  const [itemsCache, setItemsCache] = useState({});
  const [loadingItems, setLoadingItems] = useState(false);
  const [displayedItems, setDisplayedItems] = useState([]);
  const [itemCategoryMap, setItemCategoryMap] = useState({});

  // Helper to safely extract category ID from any structure (flat, populated, nested)
  const extractCategoryId = (item) => {
    if (!item) return null;
    if (typeof item.categoryId === "object" && item.categoryId?._id) return item.categoryId._id;
    if (typeof item.categoryId === "string") return item.categoryId;

    const targetItem = item.itemId || item;
    if (Array.isArray(targetItem?.categoryIds) && targetItem.categoryIds.length > 0) {
      const first = targetItem.categoryIds[0];
      return typeof first === "object" ? first._id : first;
    }
    if (typeof targetItem?.category === "object" && targetItem.category?._id) return targetItem.category._id;
    if (typeof targetItem?.category === "string") return targetItem.category;

    return null;
  };

  // Helper to safely extract item ID from flat string or populated object
  const extractItemId = (item) => {
    if (!item) return null;
    if (typeof item === "string") return item;
    if (item.itemId) {
      return typeof item.itemId === "object" ? item.itemId?._id : item.itemId;
    }
    return item._id || null;
  };

  // ========== RESET + PREFILL ==========
  useEffect(() => {
    if (isOpen) {
      fetchPackageCategories(setPackageCategories);

      fetchPackageItems(
        (allMasterItems) => {
          const mapping = {};
          (allMasterItems || []).forEach((item) => {
            const catId = extractCategoryId(item);
            if (catId && item._id) {
              mapping[item._id] = catId;
            }
          });
          setItemCategoryMap((prev) => ({ ...prev, ...mapping }));
        },
        () => {}
      );

      // Reset form defaults
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
      setSelectedCategoryId("");
      setSelectedCategoryName("");
      setCategorySearch("");
      setItemSearch("");
      setItemsCache({});
      setDisplayedItems([]);

      // Prefill if packageData exists
      if (packageData) {
        const itemIds = [];
        const directMap = {};

        (packageData.packageItems || []).forEach((item) => {
          const rawItemId = extractItemId(item);
          const rawCatId = extractCategoryId(item);

          if (rawItemId) {
            itemIds.push(rawItemId);
            if (rawCatId) {
              directMap[rawItemId] = rawCatId;
            }
          }
        });

        if (Object.keys(directMap).length > 0) {
          setItemCategoryMap((prev) => ({ ...prev, ...directMap }));
        }

        setFormData({
          title: packageData.title || "",
          subTitle: packageData.subTitle || "",
          actualPrice: packageData.actualPrice ?? "",
          discountedPrice: packageData.discountedPrice ?? "",
          maxGuests: packageData.maxGuests ?? "",
          tag: packageData.tag || "",
          packageItems: itemIds,
          packageAddons: packageData.packageAddons?.length
            ? packageData.packageAddons
            : [""],
        });

        setImagePreview(packageData.packageImageUrl || "");
        setPackageCategoriesTags(packageData.packageCategoriesTags || {});
      }
    }
  }, [isOpen, packageData]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // ========== CATEGORY COUNTS & AUTO-SORTING ==========
  const categorySelectedCounts = useMemo(() => {
    const counts = {};
    const selectedItemSet = new Set(formData.packageItems);

    selectedItemSet.forEach((itemId) => {
      const catId = itemCategoryMap[itemId];
      if (catId) {
        counts[catId] = (counts[catId] || 0) + 1;
      }
    });

    return counts;
  }, [formData.packageItems, itemCategoryMap]);

  const sortedAndFilteredCategories = useMemo(() => {
    let list = [...packageCategories];

    if (categorySearch.trim()) {
      const q = categorySearch.toLowerCase().trim();
      list = list.filter((cat) => cat.title?.toLowerCase().includes(q));
    }

    return list.sort((a, b) => {
      const countA = categorySelectedCounts[a._id] || 0;
      const countB = categorySelectedCounts[b._id] || 0;

      const hasA = countA > 0 ? 1 : 0;
      const hasB = countB > 0 ? 1 : 0;

      if (hasB !== hasA) {
        return hasB - hasA;
      }
      return countB - countA;
    });
  }, [packageCategories, categorySearch, categorySelectedCounts]);

  // ========== LOAD ITEMS ==========
  const loadItemsForCategory = useCallback(
    async (categoryId, search = "", force = false) => {
      if (!categoryId) {
        setDisplayedItems([]);
        return;
      }

      if (!force && !search && itemsCache[categoryId]) {
        setDisplayedItems(itemsCache[categoryId]);
        return;
      }

      setLoadingItems(true);
      try {
        const { items } = await fetchPackageItemsByCategory({
          categoryId,
          search,
          limit: 200,
        });

        if (!search) {
          setItemsCache((prev) => ({
            ...prev,
            [categoryId]: items,
          }));
        }

        setItemCategoryMap((prev) => {
          const updated = { ...prev };
          (items || []).forEach((it) => {
            updated[it._id] = categoryId;
          });
          return updated;
        });

        setDisplayedItems(items || []);
      } catch (err) {
        console.error(err);
        setDisplayedItems([]);
      } finally {
        setLoadingItems(false);
      }
    },
    [itemsCache]
  );

  const handleCategorySelect = (catId, catTitle) => {
    setSelectedCategoryId(catId);
    setSelectedCategoryName(catTitle);
    setItemSearch("");
    loadItemsForCategory(catId);
  };

  useEffect(() => {
    if (!selectedCategoryId) return;

    const timer = setTimeout(() => {
      loadItemsForCategory(selectedCategoryId, itemSearch.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [itemSearch, selectedCategoryId, loadItemsForCategory]);

  // ========== FORM ACTIONS ==========
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
    payload.append("venueId", packageData.venueId);
    payload.append("title", formData.title);
    payload.append("subTitle", formData.subTitle);
    payload.append("actualPrice", formData.actualPrice);
    payload.append("discountedPrice", formData.discountedPrice);
    payload.append("maxGuests", formData.maxGuests);
    payload.append("tag", formData.tag);

    // Format & filter packageItems with categoryIds
    const formattedPackageItems = formData.packageItems
      .map((itemId) => ({
        itemId,
        categoryId: itemCategoryMap[itemId] || null,
      }))
      .filter((item) => Boolean(item.categoryId));

    payload.append("packageItems", JSON.stringify(formattedPackageItems));
    payload.append("packageAddons", JSON.stringify(formData.packageAddons));
    payload.append(
      "packageCategoriesTags",
      JSON.stringify(packageCategoriesTags)
    );

    if (packageImage) {
      payload.append("image", packageImage);
    }

    if (isCloningPackage) {
      createVenuePackage(payload, onSuccess, onClose, setLoadingUpdate);
    } else {
      updateVenuePackage(
        packageData._id,
        payload,
        onSuccess,
        onClose,
        setLoadingUpdate
      );
    }
  };

  const handleAddItem = async () => {
    if (!newItemTitle.trim() || selectedCategories.length === 0) return;

    const categoryIdToRefresh = selectedCategories[0];

    const payload = {
      title: newItemTitle,
      categoryIds: selectedCategories,
      foodType: itemFoodtype,
    };

    try {
      const res = await fetch(`${BASE_URL}/api/party-venue/package-item/create-item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      const createdItem = data.data;

      if (createdItem?._id) {
        setItemCategoryMap((prev) => ({
          ...prev,
          [createdItem._id]: categoryIdToRefresh,
        }));
      }

      setNewItemTitle("");
      setSelectedCategories([]);
      setItemFoodtype("");

      setItemsCache((prev) => {
        const copy = { ...prev };
        delete copy[categoryIdToRefresh];
        return copy;
      });

      if (selectedCategoryId === categoryIdToRefresh) {
        loadItemsForCategory(selectedCategoryId, itemSearch.trim(), true);
      }
    } catch (err) {
      console.error(err);
    }
  };

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
          {isCloningPackage ? "Clone Package" : "Edit Package"}
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
        <form id="edit-package-form" onSubmit={handleSubmit}>
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

          <Box
            display="flex"
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: 2,
              overflow: "hidden",
              height: 440,
            }}
          >
            {/* LEFT: Categories */}
            <Box
              sx={{
                width: "25%",
                minWidth: 230,
                borderRight: "1px solid #e5e7eb",
                bgcolor: "#f8fafc",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ p: 1.5, borderBottom: "1px solid #e5e7eb" }}>
                <Typography
                  fontWeight={600}
                  fontSize={13}
                  color="text.secondary"
                  mb={1}
                >
                  Categories ({packageCategories.length})
                </Typography>
                <TextField
                  size="small"
                  placeholder="Search category..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      bgcolor: "white",
                      fontSize: 13,
                    },
                  }}
                />
              </Box>

              <List
                dense
                className="slim-scrollbar"
                sx={{ overflowY: "auto", flex: 1, py: 0 }}
              >
                {sortedAndFilteredCategories.length === 0 ? (
                  <Typography
                    color="text.secondary"
                    textAlign="center"
                    py={4}
                    fontSize={13}
                  >
                    No category found
                  </Typography>
                ) : (
                  sortedAndFilteredCategories.map((cat) => {
                    const selectedCount = categorySelectedCounts[cat._id] || 0;
                    return (
                      <ListItemButton
                        key={cat._id}
                        selected={selectedCategoryId === cat._id}
                        onClick={() => handleCategorySelect(cat._id, cat.title)}
                        sx={{
                          py: 1,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <ListItemText
                          primary={cat.title}
                          secondary={
                            packageCategoriesTags[cat._id]
                              ? packageCategoriesTags[cat._id]
                              : null
                          }
                          primaryTypographyProps={{
                            fontSize: 13,
                            fontWeight: selectedCount > 0 ? 600 : 400,
                            noWrap: true,
                          }}
                          secondaryTypographyProps={{
                            fontSize: 11,
                            noWrap: true,
                          }}
                        />
                        {selectedCount > 0 && (
                          <Chip
                            label={selectedCount}
                            size="small"
                            color="primary"
                            sx={{
                              height: 20,
                              fontSize: 11,
                              fontWeight: 700,
                              minWidth: 24,
                              "& .MuiChip-label": { px: 0.8 },
                            }}
                          />
                        )}
                      </ListItemButton>
                    );
                  })
                )}
              </List>
            </Box>

            {/* MIDDLE: Items */}
            <Box
              sx={{
                width: "50%",
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
                  placeholder={
                    selectedCategoryId
                      ? "Search in this category..."
                      : "Select a category first"
                  }
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  disabled={!selectedCategoryId}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                {selectedCategoryId && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<LocalOfferOutlinedIcon />}
                    onClick={(e) => openTagPopover(e, selectedCategoryId)}
                    sx={{
                      textTransform: "none",
                      whiteSpace: "nowrap",
                      minWidth: 140,
                    }}
                  >
                    {packageCategoriesTags[selectedCategoryId]
                      ? "Edit Category Tag"
                      : "Add Category Tag"}
                  </Button>
                )}
              </Box>

              <Box
                className="slim-scrollbar"
                sx={{
                  overflowY: "auto",
                  flex: 1,
                  p: 1,
                  position: "relative",
                }}
              >
                {!selectedCategoryId ? (
                  <Typography
                    color="text.secondary"
                    textAlign="center"
                    py={8}
                    fontSize={14}
                  >
                    ← Select a category to view items
                  </Typography>
                ) : loadingItems ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100%"
                  >
                    <CircularProgress size={28} />
                  </Box>
                ) : displayedItems.length === 0 ? (
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

            {/* RIGHT: Create New Item */}
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
                Create New Item
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
                disabled={
                  !newItemTitle.trim() || selectedCategories.length === 0
                }
                sx={{ textTransform: "none", borderRadius: 2, mt: "auto" }}
              >
                Add Item
              </Button>
            </Box>
          </Box>

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
          form="edit-package-form"
          variant="contained"
          disabled={loadingUpdate}
          sx={{ textTransform: "none", borderRadius: 2, minWidth: 160 }}
        >
          {loadingUpdate ? (
            <CircularProgress size={22} color="inherit" />
          ) : isCloningPackage ? (
            "Clone Package"
          ) : (
            "Update Package"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPackagePopup;
