"use client"; 
import React, { useState } from "react";
import Resizer from "react-image-file-resizer";
import Image from "next/image";
import { useSearchParams } from "next/navigation"; // Corrected router usage

const ImageResizerComponent = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [resizedImages, setResizedImages] = useState([]);
  const [fullSizeImages, setFullSizeImages] = useState([]);
  const [popupImage, setPopupImage] = useState(null);
  const searchParams = useSearchParams();
  const folderName = searchParams.get("folderName"); // Correctly access the folder name
  const userDetails = JSON.parse(localStorage.getItem('userDetails'));
  // Resize Image function
  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      Resizer.imageFileResizer(
        file,
        800, // Max width
        800, // Max height
        "WEBP", // Format
        80, // Quality
        0, // Rotation
        (uri) => {
          resolve({ uri, name: file.name.replace(/\.[^/.]+$/, ".webp") });
        },
        "base64",
        100 // Max file size in KB
      );
    });
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Avoid duplicate files
    const newFiles = files.filter(
      (file) => !selectedFiles.some((selected) => selected.name === file.name)
    );

    if (newFiles.length === 0) return;

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    
    // Store full-size images
    const newFullSizeImages = newFiles.map((file) => ({
      uri: URL.createObjectURL(file),
      name: file.name,
    }));
    setFullSizeImages((prev) => [...prev, ...newFullSizeImages]);
  };

  // Simplified Resize and Upload Images Function
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
  
    const resizedFiles = await Promise.all(
      selectedFiles.map((file) => resizeImage(file))
    );
  
    setResizedImages(resizedFiles);
    setSelectedFiles([]);
  
    // Prepare data to send to the API
    const folderData = {
      folderName: userDetails.folderId,
      customerId: userDetails.customerNumber,
      files: resizedFiles.map((image) => (image.name)) // Image file name (or another identifier if necessary)),
    };
  
    try {
      const response = await fetch("https://horaservices.com:3000/api/photo/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",  // Send as JSON
        },
        body: JSON.stringify(folderData),
      });
  
      if (!response.ok) throw new Error("Upload failed");
  
      const result = await response.json();
      console.log("Upload Success:", result);
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  };
  

  // Handle Image Click for Full Preview
  const handleImageClick = (imageUri, fullSizeIndex) => {
    if (!fullSizeImages[fullSizeIndex]) return;

    setPopupImage({
      uri: imageUri,
      fullSize: fullSizeImages[fullSizeIndex].uri,
      name: fullSizeImages[fullSizeIndex].name,
    });
  };

  // Close Image Popup
  const handleClosePopup = () => setPopupImage(null);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Image Upload & Resizer</h2>
      <p><strong>Folder Name:</strong> {userDetails.folderId || "No folder selected"}</p>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="image-upload"
      />
      <button
        onClick={() => document.getElementById("image-upload").click()}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007BFF",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Upload Images
      </button>

      {selectedFiles.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Selected Images:</h3>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {selectedFiles.map((file, index) => (
              <div key={index} style={{ margin: "10px", position: "relative" }}>
                <Image
                  src={fullSizeImages[index]?.uri}
                  alt={`Selected ${index}`}
                  width={200}
                  height={200}
                  style={{ objectFit: "cover", cursor: "pointer" }}
                  onClick={() => handleImageClick(fullSizeImages[index]?.uri, index)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={selectedFiles.length === 0}
        style={{
          padding: "10px 20px",
          backgroundColor: "#28a745",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          marginLeft: "10px",
          cursor: selectedFiles.length === 0 ? "not-allowed" : "pointer",
        }}
      >
        Resize and Upload
      </button>

      {resizedImages.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Resized Thumbnails:</h3>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {resizedImages.map((image, index) => (
              <div key={index} style={{ margin: "10px", position: "relative" }}>
                <Image
                  src={image.uri}
                  alt={`Resized ${index}`}
                  width={200}
                  height={200}
                  style={{ objectFit: "cover", cursor: "pointer" }}
                  onClick={() => handleImageClick(image.uri, index)}
                />
                <a
                  href={fullSizeImages[index]?.uri || image.uri}
                  download={fullSizeImages[index]?.name || image.name}
                  style={{
                    display: "block",
                    marginTop: "5px",
                    textAlign: "center",
                    padding: "5px 10px",
                    backgroundColor: "#007BFF",
                    color: "#fff",
                    textDecoration: "none",
                    borderRadius: "5px",
                  }}
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {popupImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={handleClosePopup}
        >
          <div style={{ position: "relative", textAlign: "center" }}>
            <img
              src={popupImage.uri}
              alt="Popup"
              width={800}
              style={{
                maxHeight: "90%",
                maxWidth: "90%",
                boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                cursor: "zoom-out",
              }}
              onClick={(e) => e.stopPropagation()} // Prevent closing on image click
            />
            <a
              href={popupImage.fullSize}
              download={popupImage.name}
              style={{
                display: "block",
                marginTop: "20px",
                padding: "10px 20px",
                backgroundColor: "#007BFF",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "5px",
              }}
            >
              Download Full Image
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageResizerComponent;
