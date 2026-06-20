"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./VenueImageGallery.css";
import { useSearchParams } from "next/navigation";
import { deleteVenueMedia } from "@/services/venueListServices";
import { MdDelete } from "react-icons/md";
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
  const [deletingId, setDeletingId] = useState(null);

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

  // const openManageModal = () => {
  //   setInitialSelectedImages(selectedImages); // snapshot
  //   setShowAddToFolderModal(true);
  // };

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

  const handleDeleteMedia = async (imageId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this media?",
    );

    if (!confirmed) return;

    try {
      setDeletingId(imageId);

      await deleteVenueMedia(imageId, () => {}, fetchImages);
    } catch (err) {
      console.error(err);
      alert("Failed to delete media");
    } finally {
      setDeletingId(null);
    }
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
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
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
              {/* <img src={item.preview} alt="preview" /> */}
              {item.file.type.startsWith("video/") ? (
                <video
                  src={item.preview}
                  muted
                  controls
                  style={{
                    width: "100%",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              ) : (
                <img
                  src={item.preview}
                  alt="preview"
                  style={{
                    width: "100%",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              )}
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
            className="image-card"
            onClick={() => toggleSelect(img._id)}
          >
            <button
              className="delete-media-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteMedia(img._id);
              }}
            >
              {deletingId === img._id ? "..." : <MdDelete color="red" />}
            </button>

            {img.postUrl?.match(/\.(mp4|mov|avi|webm|gif)$/i) ? (
              <video
                src={img.postUrl}
                muted
                controls
                preload="metadata"
                className="gallery-media"
              />
            ) : (
              <img
                src={img.postWebpUrl || img.postUrl}
                alt="venue"
                className="gallery-media"
              />
            )}
          </div>
        ))}
      </div>

      <input
        type="file"
        multiple
        hidden
        accept="image/*,video/*"
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
                  {/* <img src={img.postWebpUrl || img.postUrl} alt="" /> */}
                  {img.postUrl?.match(/\.(mp4|mov|avi|webm|gif)$/i) ? (
                    <video
                      src={img.postUrl}
                      muted
                      controls
                      preload="metadata"
                      className="gallery-media"
                    />
                  ) : (
                    <img
                      src={img.postWebpUrl || img.postUrl}
                      alt=""
                      className="gallery-media"
                    />
                  )}
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
              {/* <button
                onClick={updateFolderAssignment}
                disabled={selectedImages.length === 0}
              >
                Save Changes ({selectedImages.length} selected)
              </button> */}
              <button
                onClick={updateFolderAssignment}
                disabled={
                  getDiff().addImageIds.length === 0 &&
                  getDiff().removeImageIds.length === 0
                }
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
