// "use client";
// import React, { useEffect, useRef, useState } from "react";
// import axios from "axios";
// import "./VenueImageGallery.css";
// import { useSearchParams } from "next/navigation";
// import {
//   BASE_URL,
//   GET_VENUE_IMAGES,
//   GETVENUE_DETAILS_BY_ID,
//   MEDIA_WORKER_URL,
//   UPLOAD_VENUE_MEDIA,
// } from "@/utils/apiconstant";

// const VenueImageGallery = () => {
//   const searchParams = useSearchParams();
//   const venueId = searchParams.get("venueid");
//   const [images, setImages] = useState([]);
//   const [uploadQueue, setUploadQueue] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const [venueDetails, setVenueDetails] = useState(null);

//   const [folders, setFolders] = useState([]);
//   const [selectedFolder, setSelectedFolder] = useState(null);
//   const [selectedImages, setSelectedImages] = useState([]);
//   const [showCreateFolder, setShowCreateFolder] = useState(false);

//   const fileInputRef = useRef();

//   const [folderName, setFolderName] = useState("");

//   const createFolder = async () => {
//     await axios.post(
//       `${BASE_URL}/api/party-venue/venue/create-subfolder/${venueId}`,
//       {
//         folderName,
//         userId: venueDetails.userId,
//       },
//     );

//     setFolderName("");
//     fetchVenueDetails();
//   };

//   // ---------------- FETCH EXISTING ----------------
//   const fetchImages = async () => {
//     try {
//       const res = await axios.get(`${BASE_URL}${GET_VENUE_IMAGES}/${venueId}`);
//       setImages(res.data.data || []);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   // ---------------- FETCH EXISTING ----------------
//   const fetchVenueDetails = async () => {
//     const res = await axios.get(
//       `${BASE_URL}${GETVENUE_DETAILS_BY_ID}/${venueId}`,
//     );

//     setVenueDetails(res.data.data);
//     setFolders(res.data.data.subFolders || []);
//   };

//   useEffect(() => {
//     if (venueId) {
//       fetchImages();
//       fetchVenueDetails();
//     }
//   }, [venueId]);

//   // ---------------- SELECT FILES ----------------
//   const handleFileSelect = (e) => {
//     const files = Array.from(e.target.files || []);
//     if (!files.length) return;

//     const prepared = files.map((file, index) => ({
//       file,
//       tempId: `${Date.now()}-${index}`,
//       status: "waiting",
//       preview: URL.createObjectURL(file),
//     }));

//     setUploadQueue((prev) => [...prev, ...prepared]);
//   };

//   // ---------------- UPLOAD ONE BY ONE ----------------
//   const uploadSequentially = async (queue) => {
//     setUploading(true);

//     for (let item of queue) {
//       updateQueueStatus(item.tempId, "uploading");

//       try {
//         const formData = new FormData();
//         formData.append("files", item.file);
//         formData.append("postById", venueDetails?.userId || "unknown");
//         formData.append("postByName", "admin");
//         formData.append("folder", "venue");

//         const res = await axios.post(
//           `${MEDIA_WORKER_URL}${UPLOAD_VENUE_MEDIA}/${venueId}`,
//           formData,
//         );

//         const uploadedImage = res.data.images?.[0];

//         // mark success
//         updateQueueStatus(item.tempId, "success");

//         // add instantly on top
//         if (uploadedImage) {
//           //   setImages((prev) => [uploadedImage, ...prev]);
//           // fetchImages(); // optional refresh OR
//         }
//       } catch (err) {
//         console.log(err);
//         updateQueueStatus(item.tempId, "failed");
//       }
//     }

//     setUploading(false);
//   };

//   // ---------------- STATUS UPDATE ----------------
//   const updateQueueStatus = (id, status) => {
//     setUploadQueue((prev) =>
//       prev.map((item) => (item.tempId === id ? { ...item, status } : item)),
//     );
//   };

//   // ---------------- START UPLOAD ----------------
//   const handleUpload = async () => {
//     if (!uploadQueue.length || uploading) return;
//     await uploadSequentially(uploadQueue);
//   };

//   const toggleSelectImage = (id) => {
//     setSelectedImages((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
//     );
//   };

//   const assignToFolder = async () => {
//     if (!selectedFolder || !selectedImages.length) return;

//     await axios.put(`${BASE_URL}/api/party-venue/venue/assign-subfolder`, {
//       subFolderId: selectedFolder,
//       addImageIds: selectedImages,
//     });

//     setSelectedImages([]);
//     fetchImages();
//   };

//   const removeFromFolder = async () => {
//     if (!selectedFolder || !selectedImages.length) return;

//     await axios.put(`${BASE_URL}/api/party-venue/venue/assign-subfolder`, {
//       subFolderId: selectedFolder,
//       removeImageIds: selectedImages,
//     });

//     setSelectedImages([]);
//     fetchImages();
//   };

//   return (
//     <div className="venue-gallery-wrapper">
//       <div className="folder-bar">
//         {folders.map((f) => (
//           <div
//             key={f._id}
//             className={`folder ${selectedFolder === f._id ? "active" : ""}`}
//             onClick={() => setSelectedFolder(f._id)}
//           >
//             📁 {f.folderName}
//           </div>
//         ))}
//       </div>

//       <div className="actions">
//         <button onClick={assignToFolder}>Assign to Folder</button>

//         <button onClick={removeFromFolder}>Remove from Folder</button>
//       </div>

//       <div className="create-folder">
//         <input
//           value={folderName}
//           onChange={(e) => setFolderName(e.target.value)}
//           placeholder="New folder name"
//         />

//         <button onClick={() => setShowCreateFolder(true)}>Create Folder</button>
//       </div>
//       {/* HEADER */}
//       <div className="vg-header">
//         <h2>Venue Image Gallery</h2>

//         <div className="vg-actions">
//           <input
//             type="file"
//             multiple
//             hidden
//             ref={fileInputRef}
//             onChange={handleFileSelect}
//           />

//           <button onClick={() => fileInputRef.current.click()}>
//             Select Images
//           </button>

//           <button onClick={handleUpload} disabled={uploading}>
//             {uploading ? "Uploading..." : "Upload"}
//           </button>
//         </div>
//       </div>

//       {/* GRID CONTAINER */}
//       <div className="vg-scroll-container">
//         <div className="vg-grid">
//           {/* QUEUE IMAGES */}
//           {uploadQueue.map((item) => (
//             <div className="vg-card" key={item.tempId}>
//               <img src={item.preview} />

//               {item.status === "uploading" && (
//                 <span className="badge uploading">Uploading...</span>
//               )}

//               {item.status === "success" && (
//                 <span className="badge success">Success</span>
//               )}

//               {item.status === "failed" && (
//                 <span className="badge failed">Failed</span>
//               )}

//               {item.status === "waiting" && (
//                 <span className="badge waiting">Waiting</span>
//               )}
//             </div>
//           ))}

//           {/* EXISTING IMAGES */}
//           {/* {images.map((img) => (
//             <div className="vg-card" key={img._id}>
//               <img src={img.postWebpUrl || img.postUrl} />
//             </div>
//           ))} */}

//           {images.map((img) => (
//             <div
//               key={img._id}
//               className={`vg-card ${
//                 selectedImages.includes(img._id) ? "selected" : ""
//               }`}
//               onClick={() => toggleSelectImage(img._id)}
//             >
//               <img src={img.postWebpUrl || img.postUrl} />
//             </div>
//           ))}
//         </div>
//       </div>
//       {showCreateFolder && (
//         <div className="modal">
//           <div className="modal-box">
//             <h3>Create Folder</h3>

//             <input
//               value={folderName}
//               onChange={(e) => setFolderName(e.target.value)}
//               placeholder="Folder name"
//             />

//             <button
//               onClick={async () => {
//                 await axios.post(
//                   `${BASE_URL}/api/party-venue/venue/create-subfolder/${venueId}`,
//                   {
//                     folderName,
//                     userId: venueDetails.userId,
//                   },
//                 );

//                 setFolderName("");
//                 setShowCreateFolder(false);
//                 fetchVenueDetails();
//               }}
//             >
//               Create
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VenueImageGallery;

// "use client";
// import React, { useEffect, useRef, useState } from "react";
// import axios from "axios";
// import "./VenueImageGallery.css";
// import { useSearchParams } from "next/navigation";
// import {
//   BASE_URL,
//   GET_VENUE_IMAGES,
//   GETVENUE_DETAILS_BY_ID,
//   MEDIA_WORKER_URL,
//   UPLOAD_VENUE_MEDIA,
// } from "@/utils/apiconstant";

// const VenueImageGallery = () => {
//   const searchParams = useSearchParams();
//   const venueId = searchParams.get("venueid");

//   const [images, setImages] = useState([]); // All images
//   const [filteredImages, setFilteredImages] = useState([]);
//   const [folders, setFolders] = useState([]);
//   const [selectedFolderId, setSelectedFolderId] = useState("all"); // "all" or folder _id

//   const [selectedImages, setSelectedImages] = useState([]);
//   const [uploadQueue, setUploadQueue] = useState([]);
//   const [uploading, setUploading] = useState(false);

//   const [venueDetails, setVenueDetails] = useState(null);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showAddToFolderModal, setShowAddToFolderModal] = useState(false);
//   const [newFolderName, setNewFolderName] = useState("");
//   const [folderDpFile, setFolderDpFile] = useState(null);
//   const [folderDpPreview, setFolderDpPreview] = useState(null);

//   const fileInputRef = useRef();
//   const folderDpInputRef = useRef();

//   // Fetch data
//   const fetchImages = async () => {
//     try {
//       const res = await axios.get(`${BASE_URL}${GET_VENUE_IMAGES}/${venueId}`);
//       setImages(res.data.data || []);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const fetchVenueDetails = async () => {
//     try {
//       const res = await axios.get(`${BASE_URL}${GETVENUE_DETAILS_BY_ID}/${venueId}`);
//       setVenueDetails(res.data.data);
//       setFolders(res.data.data.subFolders || []);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     if (venueId) {
//       fetchImages();
//       fetchVenueDetails();
//     }
//   }, [venueId]);

//   // Filter images based on selected folder
//   useEffect(() => {
//     if (selectedFolderId === "all") {
//       setFilteredImages(images);
//     } else {
//       const filtered = images.filter((img) =>
//         img.folderIds?.includes(selectedFolderId)
//       );
//       setFilteredImages(filtered);
//     }
//   }, [selectedFolderId, images]);

//   // File select for upload
//   const handleFileSelect = (e) => {
//     const files = Array.from(e.target.files || []);
//     if (!files.length) return;

//     const prepared = files.map((file, i) => ({
//       file,
//       tempId: `${Date.now()}-${i}`,
//       status: "waiting",
//       preview: URL.createObjectURL(file),
//     }));

//     setUploadQueue((prev) => [...prev, ...prepared]);
//   };

//   // Sequential upload
//   const uploadSequentially = async () => {
//     if (!uploadQueue.length || uploading) return;
//     setUploading(true);

//     for (let item of uploadQueue) {
//       try {
//         updateQueueStatus(item.tempId, "uploading");

//         const formData = new FormData();
//         formData.append("files", item.file);
//         formData.append("postById", venueDetails?.userId || "unknown");
//         formData.append("postByName", "admin");
//         formData.append("folder", "venue");

//         const res = await axios.post(
//           `${MEDIA_WORKER_URL}${UPLOAD_VENUE_MEDIA}/${venueId}`,
//           formData
//         );

//         updateQueueStatus(item.tempId, "success");
//       } catch (err) {
//         console.error(err);
//         updateQueueStatus(item.tempId, "failed");
//       }
//     }

//     setUploading(false);
//     setUploadQueue([]); // clear queue after upload
//     fetchImages(); // refresh
//   };

//   const updateQueueStatus = (tempId, status) => {
//     setUploadQueue((prev) =>
//       prev.map((item) =>
//         item.tempId === tempId ? { ...item, status } : item
//       )
//     );
//   };

//   // Create Folder with optional DP
//   const createFolder = async () => {
//     if (!newFolderName.trim()) return;

//     const formData = new FormData();
//     formData.append("folderName", newFolderName.trim());
//     formData.append("userId", venueDetails.userId);

//     if (folderDpFile) {
//       formData.append("image", folderDpFile);
//     }

//     try {
//       await axios.post(
//         `${BASE_URL}/api/party-venue/venue/create-subfolder/${venueId}`,
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       setNewFolderName("");
//       setFolderDpFile(null);
//       setFolderDpPreview(null);
//       setShowCreateModal(false);
//       fetchVenueDetails();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // Add selected images to folder
//   const addToFolder = async () => {
//     if (!selectedFolderId || selectedFolderId === "all" || !selectedImages.length) return;

//     try {
//       await axios.put(`${BASE_URL}/api/party-venue/venue/assign-subfolder`, {
//         subFolderId: selectedFolderId,
//         addImageIds: selectedImages,
//       });

//       setSelectedImages([]);
//       setShowAddToFolderModal(false);
//       fetchImages();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const toggleSelect = (id) => {
//     setSelectedImages((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//     );
//   };

//   return (
//     <div className="venue-gallery-wrapper">
//       {/* Top Navigation Tabs */}
//       <div className="folder-tabs">
//         <div
//           className={`tab ${selectedFolderId === "all" ? "active" : ""}`}
//           onClick={() => setSelectedFolderId("all")}
//         >
//           All
//         </div>

//         {folders.map((folder) => (
//           <div
//             key={folder._id}
//             className={`tab ${selectedFolderId === folder._id ? "active" : ""}`}
//             onClick={() => setSelectedFolderId(folder._id)}
//           >
//             {folder.folderName}
//           </div>
//         ))}

//         <div className="tab create-tab" onClick={() => setShowCreateModal(true)}>
//           + Create Album
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className="gallery-actions">
//         <button onClick={() => fileInputRef.current.click()}>+ Add Photos</button>

//         {selectedFolderId !== "all" && (
//           <button onClick={() => setShowAddToFolderModal(true)}>
//             Add Photos To This Album
//           </button>
//         )}

//         <button onClick={uploadSequentially} disabled={uploading || uploadQueue.length === 0}>
//           {uploading ? "Uploading..." : "Upload Selected"}
//         </button>
//       </div>

//       {/* Upload Queue Previews */}
//       {uploadQueue.length > 0 && (
//         <div className="upload-queue">
//           {uploadQueue.map((item) => (
//             <div key={item.tempId} className="queue-item">
//               <img src={item.preview} alt="preview" />
//               <span className={`status ${item.status}`}>{item.status}</span>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Image Grid */}
//       <div className="image-grid">
//         {filteredImages.map((img) => (
//           <div
//             key={img._id}
//             className={`image-card ${selectedImages.includes(img._id) ? "selected" : ""}`}
//             onClick={() => toggleSelect(img._id)}
//           >
//             <img src={img.postWebpUrl || img.postUrl} alt="venue" />
//             <div className="checkbox">
//               {selectedImages.includes(img._id) ? "✅" : "⬜"}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Hidden File Input */}
//       <input
//         type="file"
//         multiple
//         hidden
//         ref={fileInputRef}
//         onChange={handleFileSelect}
//       />

//       {/* === Create Folder Modal === */}
//       {showCreateModal && (
//         <div className="modal">
//           <div className="modal-content">
//             <h3>Create New Album</h3>

//             <input
//               type="text"
//               placeholder="Album Name"
//               value={newFolderName}
//               onChange={(e) => setNewFolderName(e.target.value)}
//             />

//             <div className="folder-dp-upload">
//               <input
//                 type="file"
//                 accept="image/*"
//                 hidden
//                 ref={folderDpInputRef}
//                 onChange={(e) => {
//                   const file = e.target.files[0];
//                   if (file) {
//                     setFolderDpFile(file);
//                     setFolderDpPreview(URL.createObjectURL(file));
//                   }
//                 }}
//               />
//               <button onClick={() => folderDpInputRef.current.click()}>
//                 {folderDpPreview ? "Change Cover" : "Upload Cover Photo (Optional)"}
//               </button>
//               {folderDpPreview && <img src={folderDpPreview} alt="preview" className="dp-preview" />}
//             </div>

//             <div className="modal-actions">
//               <button onClick={() => setShowCreateModal(false)}>Cancel</button>
//               <button onClick={createFolder} disabled={!newFolderName.trim()}>
//                 Create
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* === Add Photos to Folder Modal === */}
//       {showAddToFolderModal && (
//         <div className="modal">
//           <div className="modal-content large">
//             <h3>Add Photos to "{folders.find(f => f._id === selectedFolderId)?.folderName}"</h3>

//             <div className="modal-image-grid">
//               {images.map((img) => (
//                 <div
//                   key={img._id}
//                   className={`modal-image-card ${selectedImages.includes(img._id) ? "selected" : ""}`}
//                   onClick={() => toggleSelect(img._id)}
//                 >
//                   <img src={img.postWebpUrl || img.postUrl} alt="" />
//                   <div className="modal-checkbox">
//                     {selectedImages.includes(img._id) ? "✅" : "⬜"}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="modal-actions">
//               <button onClick={() => { setShowAddToFolderModal(false); setSelectedImages([]); }}>
//                 Cancel
//               </button>
//               <button onClick={addToFolder} disabled={selectedImages.length === 0}>
//                 Add {selectedImages.length} Photos
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VenueImageGallery;

"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./VenueImageGallery.css";
import { useSearchParams } from "next/navigation";
import {
  BASE_URL,
  GET_VENUE_IMAGES,
  GETVENUE_DETAILS_BY_ID,
  MEDIA_WORKER_URL,
  UPLOAD_VENUE_MEDIA,
} from "@/utils/apiconstant";

const VenueImageGallery = () => {
  const searchParams = useSearchParams();
  const venueId = searchParams.get("venueid");

  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState("all");

  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [venueDetails, setVenueDetails] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddToFolderModal, setShowAddToFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderDpFile, setFolderDpFile] = useState(null);
  const [folderDpPreview, setFolderDpPreview] = useState(null);
  const [initialSelectedImages, setInitialSelectedImages] = useState([]);

  const fileInputRef = useRef();
  const folderDpInputRef = useRef();

  // Fetch Data
  const fetchImages = async () => {
    try {
      const res = await axios.get(`${BASE_URL}${GET_VENUE_IMAGES}/${venueId}`);
      setImages(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVenueDetails = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}${GETVENUE_DETAILS_BY_ID}/${venueId}`,
      );
      setVenueDetails(res.data.data);
      setFolders(res.data.data.subFolders || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (venueId) {
      fetchImages();
      fetchVenueDetails();
    }
  }, [venueId]);

  // Filter Images + Auto Select already assigned images
  useEffect(() => {
    let filtered = [];
    let preSelected = [];

    if (selectedFolderId === "all") {
      filtered = images;
    } else {
      filtered = images.filter((img) =>
        img.folderIds?.includes(selectedFolderId),
      );
      preSelected = filtered.map((img) => img._id);
    }

    setFilteredImages(filtered);
    setSelectedImages(preSelected); // Auto check images already in folder
    setInitialSelectedImages(preSelected);
  }, [selectedFolderId, images]);

  const getDiff = () => {
    const addImageIds = selectedImages.filter(
      (id) => !initialSelectedImages.includes(id),
    );

    const removeImageIds = initialSelectedImages.filter(
      (id) => !selectedImages.includes(id),
    );

    return { addImageIds, removeImageIds };
  };

  const openManageModal = () => {
    setInitialSelectedImages(selectedImages); // snapshot
    setShowAddToFolderModal(true);
  };

  // File Select
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const prepared = files.map((file, i) => ({
      file,
      tempId: `${Date.now()}-${i}`,
      status: "waiting",
      preview: URL.createObjectURL(file),
    }));

    setUploadQueue((prev) => [...prev, ...prepared]);
  };

  // Upload
  const uploadSequentially = async () => {
    if (!uploadQueue.length || uploading) return;
    setUploading(true);

    for (let item of uploadQueue) {
      try {
        updateQueueStatus(item.tempId, "uploading");
        const formData = new FormData();
        formData.append("files", item.file);
        formData.append("postById", venueDetails?.userId || "unknown");
        formData.append("postByName", "admin");
        formData.append("folder", "venue");

        await axios.post(
          `${MEDIA_WORKER_URL}${UPLOAD_VENUE_MEDIA}/${venueId}`,
          formData,
        );
        updateQueueStatus(item.tempId, "success");
      } catch (err) {
        console.error(err);
        updateQueueStatus(item.tempId, "failed");
      }
    }
    setUploading(false);
    setUploadQueue([]);
    fetchImages();
  };

  const updateQueueStatus = (tempId, status) => {
    setUploadQueue((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, status } : item)),
    );
  };

  // Create Folder
  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    const formData = new FormData();
    formData.append("folderName", newFolderName.trim());
    formData.append("userId", venueDetails.userId);
    if (folderDpFile) formData.append("image", folderDpFile);

    try {
      await axios.post(
        `${BASE_URL}/api/party-venue/venue/create-subfolder/${venueId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setNewFolderName("");
      setFolderDpFile(null);
      setFolderDpPreview(null);
      setShowCreateModal(false);
      fetchVenueDetails();
    } catch (err) {
      console.error(err);
    }
  };

  // Add / Remove from Folder
const updateFolderAssignment = async () => {
  if (selectedFolderId === "all") return;

  const { addImageIds, removeImageIds } = getDiff();

  if (!addImageIds.length && !removeImageIds.length) return;

  try {
    await axios.put(`${BASE_URL}/api/party-venue/venue/assign-subfolder`, {
      subFolderId: selectedFolderId,
      addImageIds,
      removeImageIds,
    });

    setShowAddToFolderModal(false);

    fetchImages();
    fetchVenueDetails();
  } catch (err) {
    console.error(err);
  }
};

//   const toggleSelect = (id) => {
//     if (selectedFolderId === "all") return; // No selection in All tab
//     setSelectedImages((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
//     );
//   };

const toggleSelect = (id) => {
  setSelectedImages((prev) =>
    prev.includes(id)
      ? prev.filter((x) => x !== id)
      : [...prev, id],
  );
};

  return (
    <div className="venue-gallery-wrapper">
      {/* Tabs with Folder DP */}
      <div className="folder-tabs">
        <div
          className={`tab ${selectedFolderId === "all" ? "active" : ""}`}
          onClick={() => setSelectedFolderId("all")}
        >
          All
        </div>

        <div
          className="tab create-tab"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Album
        </div>

        {folders.map((folder) => {
          const hasDp =
            folder.folderDp?.thumbnailUrl || folder.folderDp?.fileUrl;
          const firstLetter = folder.folderName?.[0]?.toUpperCase() || "📁";

          return (
            <div
              key={folder._id}
              className={`tab ${selectedFolderId === folder._id ? "active" : ""}`}
              onClick={() => setSelectedFolderId(folder._id)}
            >
              <div className="folder-tab-content">
                {hasDp ? (
                  <img
                    src={hasDp}
                    alt={folder.folderName}
                    className="folder-dp"
                  />
                ) : (
                  <div className="folder-dp-placeholder">{firstLetter}</div>
                )}
                <span>{folder.folderName}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="gallery-actions">
        {selectedFolderId === "all" && (
          <button onClick={() => fileInputRef.current.click()}>
            + Add Photos
          </button>
        )}

        {selectedFolderId !== "all" && (
          <button onClick={() => setShowAddToFolderModal(true)}>
            Manage Photos in Album
          </button>
        )}
        {selectedFolderId === "all" && (
          <button
            onClick={uploadSequentially}
            disabled={uploading || uploadQueue.length === 0}
          >
            {uploading ? "Uploading..." : "Upload Selected"}
          </button>
        )}
      </div>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <div className="upload-queue">
          {uploadQueue.map((item) => (
            <div key={item.tempId} className="queue-item">
              <img src={item.preview} alt="preview" />
              <span className={`status ${item.status}`}>{item.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Image Grid */}
      <div className="image-grid">
        {filteredImages.map((img) => (
          <div
            key={img._id}
            className={`image-card`}
            onClick={() => toggleSelect(img._id)}
          >
            <img src={img.postWebpUrl || img.postUrl} alt="venue" />

            {/* {selectedFolderId !== "all" && (
              <div className="checkbox">
                {selectedImages.includes(img._id) ? "✅" : "⬜"}
              </div>
            )} */}
          </div>
        ))}
      </div>

      <input
        type="file"
        multiple
        hidden
        ref={fileInputRef}
        onChange={handleFileSelect}
      />

      {/* Create Folder Modal */}
      {showCreateModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Create New Album</h3>
            <input
              type="text"
              placeholder="Album Name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />

            <div className="folder-dp-upload">
              <input
                type="file"
                accept="image/*"
                hidden
                ref={folderDpInputRef}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setFolderDpFile(file);
                    setFolderDpPreview(URL.createObjectURL(file));
                  }
                }}
              />
              <button onClick={() => folderDpInputRef.current.click()}>
                {folderDpPreview
                  ? "Change Cover"
                  : "Upload Cover Photo (Optional)"}
              </button>
              {folderDpPreview && (
                <img
                  src={folderDpPreview}
                  alt="preview"
                  className="dp-preview"
                />
              )}
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button onClick={createFolder} disabled={!newFolderName.trim()}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Photos in Folder Modal */}
      {showAddToFolderModal && (
        <div className="modal">
          <div className="modal-content large">
            <h3>
              Manage Photos in{" "}
              {folders.find((f) => f._id === selectedFolderId)?.folderName}
            </h3>

            <div className="modal-image-grid">
              {images.map((img) => (
                <div
                  key={img._id}
                  className={`modal-image-card ${selectedImages.includes(img._id) ? "selected" : ""}`}
                  onClick={() => toggleSelect(img._id)}
                >
                  <img src={img.postWebpUrl || img.postUrl} alt="" />
                  <div className="modal-checkbox">
                    {selectedImages.includes(img._id) ? "✅" : "⬜"}
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowAddToFolderModal(false);
                }}
              >
                Cancel
              </button>
              <button
                onClick={updateFolderAssignment}
                disabled={selectedImages.length === 0}
              >
                Save Changes ({selectedImages.length} selected)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueImageGallery;
