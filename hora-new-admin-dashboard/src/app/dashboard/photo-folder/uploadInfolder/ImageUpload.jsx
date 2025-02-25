"use client";
import React, { useState } from "react";
import ThumbnailGallery from "./ThumbnailGallery";
const ImageUpload = ({ folderTitle, customerId }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [showThumbnailComp, setShowThumbnailComp] = useState(false);
  const [updatedImg, setUpdatedImg] = useState(true);
  const [showLink, setShowLink] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Handle file selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const selectedImages = files.map((file) => ({
      file,
      name: file.name,
    }));

    setSelectedImages((prev) => [...prev, ...selectedImages]);
  };

  // Upload images
  const handleUpload = async () => {
    if (!folderTitle || !customerId) {
      alert("Missing user details.");
      return;
    }

    if (selectedImages.length === 0) {
      alert("No images selected for upload.");
      return;
    }

    setIsUploading(true);
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

      // if (!response.ok) {
      //   throw new Error("Upload failed");
      // }
      if (response.status === 201) {
      // setAllImages((prev) => [...prev, ...selectedImages]);
      setSelectedImages([]);
      setShowLink(true);
      setUpdatedImg(false);
      
      setTimeout(() => setUpdatedImg(true), 100);
    }
   } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed");
      setShowLink(false);
      setShowThumbnailComp(false);
    } finally {
      setIsUploading(false);
      setShowThumbnailComp(true);
    }
  };

  return (
    <>
      {showLink && folderTitle && customerId && (
        <>
       
          <h4>Folder link to share:</h4>
          <p><a href={`https://horaservices.com/photo-gallery?folderName=${folderTitle}&customerId=${customerId}`} target="_blank" rel="noreferrer">
            {`https://horaservices.com/photo-gallery?folderName=${folderTitle}&customerId=${customerId}`}
          </a></p>
        </>
      )}
      <div className="imageupload-container">
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
              disabled={isUploading}
              style={{
                padding: "10px 20px",
                backgroundColor: isUploading ? "#ccc" : "#007BFF",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: isUploading ? "not-allowed" : "pointer",
                position: "relative",
              }}
            >
              {isUploading ? "Uploading..." : "Upload All Images"}
            </button>
            {isUploading && <p>Uploading, please wait...</p>}
          </div>
        )}
      </div>

    

      {updatedImg  && folderTitle && customerId && showThumbnailComp &&(
        <ThumbnailGallery folderName={folderTitle} customerId={customerId} />
      )}
    </>
  );
};

export default ImageUpload;





// dnt delete
// Fetch user details from localStorage safely (only on the client side)
  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     const storedUser = JSON.parse(localStorage.getItem("userDetails")) || {};
  //     setFolderTitle(storedUser.folderTitle || "");
  //     setCustomerId(storedUser.customerId || "");
  //   }
  // }, []);
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