"use client";
import React, { useState } from "react";
import Resizer from "react-image-file-resizer";

const ImageResizerComponent = ({ params }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [resizedImages, setResizedImages] = useState([]);
  const [fullSizeImages, setFullSizeImages] = useState([]);
  const [popupImage, setPopupImage] = useState(null);
  const { folderName } = params; // Extract the folderName parameter
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
          resolve({ uri, name: file.name.split(".").slice(0, -1).join(".") + ".webp" });
        },
        "base64", // Output type
        100, // Max file size in KB
      );
    });
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    // Store the full-size image URIs for download purposes
    const fullSizeURIs = files.map((file) => ({
      uri: URL.createObjectURL(file),
      name: file.name,
    }));
    setFullSizeImages(fullSizeURIs);
  };

  const handleUpload = async () => {
    const resizedFiles = await Promise.all(selectedFiles.map((file) => resizeImage(file)));
    setSelectedFiles([]);
    setResizedImages(resizedFiles);
  };

  const handleImageClick = (imageUri, fullSizeIndex) => {
    setPopupImage({
      uri: imageUri,
      fullSize: fullSizeImages[fullSizeIndex]?.uri,
      name: fullSizeImages[fullSizeIndex]?.name,
    });
  };

  const handleClosePopup = () => {
    setPopupImage(null);
  };

  return (
    <div>
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

      <div style={{ marginTop: "20px" }}>
        <h3>Selected Images:</h3>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {selectedFiles.length > 0 &&
            selectedFiles.map((file, index) => (
              <div className="selectedImg" key={index} style={{ margin: "10px" }}>
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Selected ${index}`}
                  style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "cover" }}
                  onClick={() => handleImageClick(URL.createObjectURL(file), index)}
                />
              </div>
            ))}
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        {resizedImages.length > 0 && (
          <div>
            <h3>Resized Thumbnails:</h3>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {resizedImages.map((image, index) => (
                <div key={index} style={{ margin: "10px" }}>
                  <img
                    src={image.uri}
                    alt={`Resized Thumbnail ${index}`}
                    style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "cover" }}
                    onClick={() => handleImageClick(image.uri, index)}
                  />
                  <a
                    href={fullSizeImages[index]?.uri || image.uri} // Use full-size image for download
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
      </div>

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
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
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
