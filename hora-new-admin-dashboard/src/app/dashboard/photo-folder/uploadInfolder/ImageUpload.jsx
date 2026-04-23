"use client";
import React, { useState, useEffect } from "react";
import ThumbnailGallery from "./ThumbnailGallery";
import Image from "next/image";
import {MEDIA_WORKER_URL} from '../../../../utils/apiconstant'


const ImageUpload = ({ folderTitle, customerId, enteredNum, refetchDriveImages, isWeblink =false, weblink }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [showThumbnailComp, setShowThumbnailComp] = useState(false);
  const [updatedImg, setUpdatedImg] = useState(true);
  const [showLink, setShowLink] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSummary, setUploadSummary] = useState({ success: 0, failed: 0 });
  const [progress, setProgress] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const MAX_CONCURRENT_UPLOADS = selectedImages.length;

  useEffect(() => {
  if (folderTitle && customerId) {
    setShowLink(true);
  }
}, [folderTitle, customerId]);

  useEffect(() => {
    if (refetchDriveImages) {
      setShowThumbnailComp(true);
      setShowLink(true);
    }
  }, [refetchDriveImages])

  useEffect(() => {
    selectedImages.forEach((image) => {
      if (!image.preview) {
        image.preview = URL.createObjectURL(image.file);
      }
    });
    return () => {
      selectedImages.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, [selectedImages]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const images = files.map((file) => ({
      file,
      name: file.name,
      type: file.type,
      preview: URL.createObjectURL(file),
      status: "pending",
    }));
    setSelectedImages((prev) => [...prev, ...images]);
    setUploadSummary({ success: 0, failed: 0 });
    setProgress(0);
  };

  const uploadImage = async (image) => {
    const formData = new FormData();
    formData.append("folderName", folderTitle);
    formData.append("customerId", customerId);
    formData.append("files", image.file, image.name);
    formData.append("phoneNo", enteredNum);

    try {
      const response = await fetch(`${MEDIA_WORKER_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      return response.status === 201;
    } catch (error) {
      console.error("Upload failed:", error);
      return false;
    }
  };

  const limitConcurrency = async (tasks, limit) => {
    let index = 0;
    let active = 0;
    const results = [];

    return new Promise((resolve) => {
      const next = () => {
        while (active < limit && index < tasks.length) {
          const currentIndex = index++;
          active++;
          tasks[currentIndex]().then((result) => {
            results[currentIndex] = result;
            active--;
            const completed = results.filter((r) => r !== undefined).length;
            setProgress(Math.round((completed / tasks.length) * 100));
            next();
            if (
              results.length === tasks.length &&
              !results.includes(undefined)
            ) {
              resolve(results);
            }
          });
        }
      };
      next();
    });
  };

  const handleUpload = async () => {
    if (!folderTitle || !customerId) return alert("Missing user details.");
    if (selectedImages.length === 0) return alert("No images selected.");

    setIsUploading(true);
    setUploadSummary({ success: 0, failed: 0 });

    // Set all to pending initially
    const pendingImages = selectedImages.map((img) => ({
      ...img,
      status: "pending",
    }));
    setSelectedImages(pendingImages);

    // Prepare upload tasks
    const uploadTasks = pendingImages.map((img, idx) => async () => {
      const uploadingImages = [...pendingImages];
      uploadingImages[idx].status = "uploading";
      setSelectedImages([...uploadingImages]);

      const success = await uploadImage(img);
      uploadingImages[idx].status = success ? "success" : "failed";
      setSelectedImages([...uploadingImages]);

      return success;
    });

    const results = await limitConcurrency(uploadTasks, MAX_CONCURRENT_UPLOADS);

    const successCount = results.filter(Boolean).length;
    const failedCount = results.length - successCount;

    setUploadSummary({ success: successCount, failed: failedCount });
    setIsUploading(false);
    setProgress(100);
    setShowLink(true);
    setUpdatedImg(false);
    setTimeout(() => setUpdatedImg(true), 100);
    setShowThumbnailComp(true);
  };

  const retryFailedUploads = async () => {
    const failedImages = selectedImages.filter(
      (img) => img.status === "failed"
    );
    if (failedImages.length === 0) return;

    setIsUploading(true);
    const retryImages = [...selectedImages];

    const uploadTasks = failedImages.map((img) => async () => {
      const idx = retryImages.findIndex((x) => x.name === img.name);
      retryImages[idx].status = "uploading";
      setSelectedImages([...retryImages]);

      const success = await uploadImage(img);
      retryImages[idx].status = success ? "success" : "failed";
      setSelectedImages([...retryImages]);
      return success;
    });

    const results = await limitConcurrency(uploadTasks, MAX_CONCURRENT_UPLOADS);
    console.log("Retry results:", results);
    const success = retryImages.filter((x) => x.status === "success").length;
    const failed = retryImages.length - success;
    setUploadSummary({ success, failed });
    setIsUploading(false);
    setProgress(100);
    setUpdatedImg(false);
    setTimeout(() => setUpdatedImg(true), 100);
  };

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    console.log(`You selected ${fileArray.length} image(s):`);
    fileArray.forEach((file, index) => {
      console.log(`Image ${index + 1}: ${file.name}`);
    });

    // Show loading
    setIsUploading(true);

    for (let file of fileArray) {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("customerId", customerId);
      formData.append("folderName", folderTitle);
      formData.append("phoneNo", enteredNum);

      try {
        const res = await fetch(`${MEDIA_WORKER_URL}/upload`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        console.log(`Uploaded ${file.name}:`, data);
      } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    // All uploads completed
    setIsUploading(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      {/* Link Section */}
      {showLink && folderTitle && customerId && (
        <div style={{ marginBottom: "1rem" }}>
          <h4>Folder link to share:</h4>
          <a
            href={
              isWeblink? weblink :
              `https://horaservices.com/photo-gallery?folderName=${folderTitle}&customerId=${customerId}`}
            target="_blank"
            rel="noreferrer"
          >
            {isWeblink? weblink :  `https://horaservices.com/photo-gallery?folderName=${folderTitle} 
            &customerId=${customerId}`}
            
          </a>
        </div>
      )}

      {/* Upload UI */}
      <div className="imageupload-container">
        <input
          type="file"
          multiple
          onChange={handleImageChange}
          accept="image/*,video/*"
          disabled={isUploading}
          style={{
            padding: "10px 20px",
            backgroundColor: isUploading ? "#ccc" : "#007BFF",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: isUploading ? "not-allowed" : "pointer",
          }}
        />

        {/* Summary & Progress */}
        {selectedImages.length > 0 && (
          <>
            <div className="mt-4">
              <p>
                ✅ Uploaded: {uploadSummary.success} | ❌ Failed:{" "}
                {uploadSummary.failed} | 📷 Total: {selectedImages.length}
              </p>

              <div
                style={{
                  background: "#e0e0e0",
                  borderRadius: "10px",
                  overflow: "hidden",
                  height: "10px",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    background: "#007BFF",
                    height: "100%",
                    width: `${progress}%`,
                    transition: "width 0.3s ease-in-out",
                  }}
                />
              </div>
            </div>

            {/* Image Grid */}
            <div
              className="selectedImages masonryGrid"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              {selectedImages.map((image, index) => (
                <div
                  key={index}
                  style={{ position: "relative", width: "150px" }}
                >
                  {image.type.startsWith("image/") ? (
                    <Image
                      src={image.preview}
                      alt={image.name}
                      width={100}
                      height={100}
                      style={{
                        width: "100%",
                        borderRadius: "8px",
                        border: "2px solid #ccc",
                      }}
                    />
                  ) : image.type.startsWith("video/") ? (
                    <video
                      src={image.preview}
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{
                        width: "100%",
                        borderRadius: "8px",
                        border: "2px solid #ccc",
                      }}
                    />
                  ) : null}
                  <span
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      background:
                        image.status === "success"
                          ? "green"
                          : image.status === "failed"
                            ? "red"
                            : image.status === "uploading"
                              ? "orange"
                              : "#555",
                      color: "white",
                      padding: "2px 6px",
                      fontSize: "12px",
                      borderRadius: "5px",
                    }}
                  >
                    {image.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                style={{
                  padding: "10px 20px",
                  backgroundColor: isUploading ? "#ccc" : "#007BFF",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: isUploading ? "not-allowed" : "pointer",
                }}
              >
                {isUploading ? "Uploading..." : "Upload All Images"}
              </button>

              {uploadSummary.failed > 0 && (
                <button
                  onClick={retryFailedUploads}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#DC3545",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Retry Failed
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Preview */}
      {isUploading && (
        <p style={{ color: "green" }}>Uploading images, please wait...</p>
      )}

      {updatedImg && folderTitle && customerId && showThumbnailComp && (
        <>
          <div style={{ marginTop: "30px" }}>
            <label
              htmlFor="imageUpload"
              style={{
                display: "inline-block",
                cursor: "pointer",
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "#fff",
                borderRadius: "4px",
                textAlign: "center",
              }}
            >
              Add More Images
            </label>

            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleImageUpload}
              multiple
              style={{
                cursor: "pointer",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                backgroundColor: "#007bff",
                color: "#fff",
              }}
            />
          </div>
          <ThumbnailGallery
            key={refreshKey}
            folderName={folderTitle}
            customerId={customerId}
          />
        </>
      )}
    </>
  );
};

export default ImageUpload;
