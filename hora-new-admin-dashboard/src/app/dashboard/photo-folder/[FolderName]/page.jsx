"use client";
import React, { useState, useEffect } from "react";
import ThumbnailGallery from "./ThumbnailGallery";

const ImageUpload = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [allImages, setAllImages] = useState([]);
  const [updatedImg, setUpdatedImg] = useState(true);
  const [showLink, setShowLink] = useState(true);
  const [folderTitle, setFolderTitle] = useState("");
  const [customerId, setCustomerId] = useState("");

  // Fetch user details from localStorage safely (only on the client side)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = JSON.parse(localStorage.getItem("userDetails")) || {};
      setFolderTitle(storedUser.folderTitle || "");
      setCustomerId(storedUser.customerId || "");
    }
  }, []);
  // resizer Handle Local File Selection
  // const handleImageChange = (e) => {
  //   const files = Array.from(e.target.files);
  //   const resizedImages = [];

  //   files.forEach((file) => {
  //     Resizer.imageFileResizer(
  //       file,
  //       800,
  //       800,
  //       "JPEG",
  //       80,
  //       0,
  //       (uri) => {
  //         resizedImages.push({ file: uri, name: file.name });
  //         if (resizedImages.length === files.length) {
  //           setSelectedImages((prev) => [...prev, ...resizedImages]);
  //         }
  //       },
  //       "file"
  //     );
  //   });
  // };
  
  // Handle file selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const selectedImages = files.map((file) => ({
      file,
      name: file.name
    }));

    setSelectedImages((prev) => [...prev, ...selectedImages]);
  };

  // Upload images
  const handleUpload = async () => {
    if (!folderTitle || !customerId) {
      alert("Missing user details in local storage.");
      return;
    }

    if (selectedImages.length === 0) {
      alert("No images selected for upload.");
      return;
    }

    const formData = new FormData();
    formData.append("folderName", folderTitle);
    formData.append("customerId", customerId);

    selectedImages.forEach((image) => {
      formData.append("files", image.file, image.name);
    });

    try {
      const response = await fetch("https://horaservices.com:3000/api/photo/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      setAllImages((prev) => [...prev, ...selectedImages]);
      setSelectedImages([]);
      setShowLink(true);

      // Force a re-render of the gallery
      setUpdatedImg(false);
      setTimeout(() => setUpdatedImg(true), 100);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed");
      setUpdatedImg(false);
      setShowLink(false);
    }
  };

  return (
    <>
      <div className="p-4">
        <input
          type="file"
          multiple
          onChange={handleImageChange}
          accept="image/*"
          style={{
            padding: "10px 20px",
            backgroundColor: "#007BFF",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        />

        {selectedImages.length > 0 && (
          <div className="mt-4">
            <h3>Newly Selected Images:</h3>
            <div className="selectedImages masonryGrid">
              {selectedImages.map((image, index) => (
                <img key={index} src={URL.createObjectURL(image.file)} alt={image.name} />
              ))}
            </div>
            <button
              onClick={handleUpload}
              className="mt-4"
              style={{
                padding: "10px 20px",
                backgroundColor: "#007BFF",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Upload All Images
            </button>
          </div>
        )}
      </div>

      {showLink && folderTitle && customerId && (
        <>
          <h3>Folder link to share:</h3>
          <a href={`http://localhost:3001/photo-gallery?folderName=${folderTitle}&customerId=${customerId}`}>
            {`http://localhost:3001/photo-gallery?folderName=${folderTitle}&customerId=${customerId}`}
          </a>
        </>
      )}

      {updatedImg && folderTitle && customerId && (
        <ThumbnailGallery folderName={folderTitle} customerId={customerId} />
      )}
    </>
  );
};

export default ImageUpload;