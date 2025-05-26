"use client";
import React, { useState } from "react";
import ThumbnailGallery from "./ThumbnailGallery";

const ImageUpload = ({ folderTitle, customerId, enteredNum }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [showThumbnailComp, setShowThumbnailComp] = useState(false);
  const [updatedImg, setUpdatedImg] = useState(true);
  const [showLink, setShowLink] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // To track current image during upload

   const [refreshKey, setRefreshKey] = useState(0);
  //  const [isUploading, setIsUploading] = useState(false);


  // const handleImageUpload = async (event) => {
  //   const files = event.target.files;
  //   if (!files || files.length === 0) return;

  //   const fileArray = Array.from(files);

  //   console.log(`You selected ${fileArray.length} image(s):`);
  //   fileArray.forEach((file, index) => {
  //     console.log(`Image ${index + 1}: ${file.name}`);
  //   });

  //   const formData = new FormData();
  //   fileArray.forEach(file => {
  //     formData.append('files', file);
  //   });


  //   formData.append('customerId', customerId);
  //   formData.append('folderName', folderTitle);
  //   formData.append('phoneNo', '9340785987');

  //   try {
  //      const res = await fetch(
  //         "https://horaservices.com:3000/api/photo/upload",
  //         {
  //           method: "POST",
  //           body: formData,
  //         }
  //       );

  //        const data = await res.json();
  //       console.log("Uploaded123:", data);
  //     // On success, refresh the ThumbnailGallery
  //     setRefreshKey(prev => prev + 1);
  //   } catch (error) {
  //     console.error('Upload failed:', error);
  //     alert('Failed to upload image');
  //   }
  // };

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
    formData.append('files', file); // Keep 'files' if that's what backend expects
    formData.append('customerId', customerId);
    formData.append('folderName', folderTitle);
    formData.append('phoneNo', '9340785987');

    try {
      const res = await fetch(
        "https://horaservices.com:3000/api/photo/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      console.log(`Uploaded ${file.name}:`, data);
    } catch (error) {
      console.error(`Upload failed for ${file.name}:`, error);
      alert(`Failed to upload ${file.name}`);
    }
  }

  // All uploads completed
  setIsUploading(false);
  setRefreshKey(prev => prev + 1);
};

  // Handle file selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const selectedImages = files.map((file) => ({
      file,
      name: file.name,
    }));

    setSelectedImages((prev) => [...prev, ...selectedImages]);
  };
  let uploadCount = 0; 
  // Upload single image
  const uploadImage = async (image) => {
    console.log("upload button hit")
    const formData = new FormData();
    formData.append("folderName", folderTitle);
    formData.append("customerId", customerId);
    formData.append("files", image.file, image.name);
    formData.append("phoneNo", enteredNum);

    try {
      const response = await fetch("https://horaservices.com:3000/api/photo/upload", {
        method: "POST",
        body: formData,
      });

      if (response.status === 201) {
        console.log("completd upload")
        console.log(`${image.name} uploaded successfully.`);
        uploadCount++;  // Increment the upload count
        console.log(`Total images uploaded: ${uploadCount}`); // Log the count
        return true; // Image uploaded successfully
      } else {
        console.error(`${image.name} upload failed.`);
        return false; // Failed to upload
      }
    } catch (error) {
      console.error("Upload failed", error);
      return false; // Failed to upload due to an error
    }
  };

  // Handle the upload of all images one by one
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
    let uploadSuccess = true;

    // Start uploading images one by one
    for (let i = currentImageIndex; i < selectedImages.length; i++) {
      setCurrentImageIndex(i + 1); // Move to the next image
      const success = await uploadImage(selectedImages[i]);
      if (!success) {
        uploadSuccess = false; // If any upload fails, set uploadSuccess to false
        break;
      }
    }

    // If all uploads are successful, show the success message and update the state
    if (uploadSuccess) {
      setSelectedImages([]);
      setShowLink(true);
      setUpdatedImg(false);
      setTimeout(() => setUpdatedImg(true), 100); // Refresh thumbnails
    } else {
      alert("One or more images failed to upload.");
    }

    setIsUploading(false);
    setShowThumbnailComp(true);
  };

  return (
    <>
      {showLink && folderTitle && customerId && (
        <>
          <h4>Folder link to share:</h4>
          <p>
            <a
              href={`https://horaservices.com/photo-gallery?folderName=${folderTitle}&customerId=${customerId}`}
              target="_blank"
              rel="noreferrer"
            >
              {`https://horaservices.com/photo-gallery?folderName=${folderTitle}&customerId=${customerId}`}
            </a>
          </p>
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

      {isUploading && <p style={{ color: 'green' }}>Uploading images, please wait...</p>}

      {updatedImg && folderTitle && customerId && showThumbnailComp && (
        <>
        <div style={{ marginTop: '30px' }}>
        <label
  htmlFor="imageUpload"
  style={{
    display: 'inline-block',
    cursor: 'pointer',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    borderRadius: '4px',
    textAlign: 'center',
  }}
>
  Add More Images
</label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            multiple
            style={{
              cursor: 'pointer',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: '#007bff',
              color: '#fff',
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
