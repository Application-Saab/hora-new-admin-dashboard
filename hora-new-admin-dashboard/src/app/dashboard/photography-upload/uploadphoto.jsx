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

// export default ImageResizerComponent;
// 'use client';
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// const CreatePhotoProject = () => {
//   const [customerName, setCustomerName] = useState('');
//   const [customerNumber, setCustomerNumber] = useState('');
//   const [vendorId, setVendorId] = useState('');
//   const [createdFolders, setCreatedFolders] = useState([]);
//   const router = useRouter();

//   useEffect(() => {
//     // Load previously created folders from localStorage
//     const storedFolders = JSON.parse(localStorage.getItem('createdFolders')) || [];
//     setCreatedFolders(storedFolders);
//   }, []);

//   const handleCreateFolder = async (e) => {
//     e.preventDefault();

//     // Validate inputs
//     if (!customerName.match(/^[a-zA-Z0-9]+$/)) {
//       alert('Customer name should only contain letters and numbers.');
//       return;
//     }

//     if (!vendorId.match(/^[a-zA-Z0-9]+$/)) {
//       alert('Order ID should only contain letters and numbers.');
//       return;
//     }

//     // Create folder name based on customer name and order ID
//     const folderName = `${customerName}_${vendorId}`;

//     try {
//       // Make API call to create folder
//       const response = await fetch('https://horaservices.com:3000/api/photo/CreateFolder', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           folderName: folderName,
//           customerId: customerNumber,
//           vendorId: vendorId // Add vendorId if available
//         }),
//       });
// console.log(response)
//       if (!response.ok) {
//         throw new Error('Failed to create folder');
//       }

//       const data = await response.json();
//       console.log('Folder created successfully:', data);

//       // Store the folder name in localStorage for future reference
//       const updatedFolders = [...createdFolders, folderName];
//       localStorage.setItem('createdFolders', JSON.stringify(updatedFolders));

//       // Update the created folders state
//       setCreatedFolders(updatedFolders);

//       // Redirect to the dynamic folder page
//       // router.push(`/dashboard/photography-upload/${folderName}`);
//     } catch (error) {
//       console.error('Error creating folder:', error);
//       alert('Failed to create folder. Please try again.');
//     }
//   };

//   return (
//     <div style={{ padding: '20px' }}>
//       <h1>Create a Dynamic Folder</h1>
//       <form onSubmit={handleCreateFolder}>
//         <input
//           type="text"
//           placeholder="Enter customer name* "
//           value={customerName}
//           onChange={(e) => setCustomerName(e.target.value)}
//           style={{ marginRight: '10px', padding: '5px' }}
//           required
//         />
//         <input
//           type="text"
//           placeholder="Enter customer number* "
//           value={customerNumber}
//           onChange={(e) => setCustomerNumber(e.target.value)}
//           style={{ marginRight: '10px', padding: '5px' }}
//           required
//         />
//         <input
//           type="text"
//           placeholder="Enter Vendor ID"
//           value={vendorId}
//           onChange={(e) => setVendorId(e.target.value)}
//           style={{ marginRight: '10px', padding: '5px' }}
//         />
//         <button type="submit" style={{ padding: '5px 10px' }}>Create Folder</button>
//       </form>

//       {createdFolders.length > 0 && (
//         <div style={{ marginTop: '20px' }}>
//           <h2>Previous Folders</h2>
//           <ul>
//             {createdFolders.map((folder, index) => (
//               <li key={index}>
//                 <a href={`/dashboard/photography-upload/${folder}`} style={{ textDecoration: 'none' }}>
//                   {folder}
//                 </a>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CreatePhotoProject;
// -==================================================================================
"use client";
import React, { useState, useEffect } from "react";
import Resizer from "react-image-file-resizer";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

const ImageResizerComponent = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [resizedImages, setResizedImages] = useState([]);
  const [fullSizeImages, setFullSizeImages] = useState([]);
  const [popupImage, setPopupImage] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);

  const searchParams = useSearchParams();
  const folderName = searchParams.get("folderName");

  // Ensure localStorage is accessed only on client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("userDetails");
      if (storedUser) setUserDetails(JSON.parse(storedUser));

      // Restore uploaded images
      const storedImages = localStorage.getItem("uploadedImages");
      if (storedImages) setUploadedImages(JSON.parse(storedImages));
    }
  }, []);

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
          resolve({
            uri,
            name: file.name.replace(/\.[^/.]+$/, ".webp"),
            file: new File([uri], file.name.replace(/\.[^/.]+$/, ".webp"), { type: "image/webp" })
          });
        },
        "blob"
      );
    });
  };

  // Handle file selection
  const handleFileChange = async (event) => {
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

  // Resize and Upload Images
  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !userDetails) return;

    const resizedFiles = await Promise.all(selectedFiles.map((file) => resizeImage(file)));

    // Update the UI with resized images
    setResizedImages((prev) => [...prev, ...resizedFiles]);

    // Prepare FormData
    const formData = new FormData();
    formData.append("folderName", userDetails.folderId);
    formData.append("customerId", userDetails.customerNumber);

    resizedFiles.forEach((image) => {
      formData.append("files", image.file);
    });

    try {
      const response = await fetch("https://horaservices.com:3000/api/photo/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      console.log("Upload Success:", result);

      // Save uploaded images
      const updatedImages = [...uploadedImages, ...resizedFiles];
      setUploadedImages(updatedImages);
      localStorage.setItem("uploadedImages", JSON.stringify(updatedImages));
    } catch (error) {
      console.error("Error uploading images:", error);
    }

    // Keep images after upload
    setSelectedFiles([]);
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

  return (
    <div style={{ padding: "20px" }}>
      <h2>Image Upload & Resizer</h2>
      {userDetails ? (
        <p><strong>Folder Name:</strong> {userDetails.folderId || "No folder selected"}</p>
      ) : (
        <p>Loading user details...</p>
      )}

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
            {fullSizeImages.map((image, index) => (
              <div key={index} style={{ margin: "10px", position: "relative" }}>
                <Image
                  src={image.uri}
                  alt={`Selected ${index}`}
                  width={200}
                  height={200}
                  style={{ objectFit: "cover", cursor: "pointer" }}
                  onClick={() => handleImageClick(image.uri, index)}
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

      {uploadedImages.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Previously Uploaded Images:</h3>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {uploadedImages.map((image, index) => (
              <div key={index} style={{ margin: "10px", position: "relative" }}>
                <Image
                  src={URL.createObjectURL(image.file)}
                  alt={`Uploaded ${index}`}
                  width={200}
                  height={200}
                  style={{ objectFit: "cover", cursor: "pointer" }}
                />
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
          onClick={() => setPopupImage(null)}
        >
          <img
            src={popupImage.uri}
            alt="Popup"
            width={800}
            style={{
              maxHeight: "90%",
              maxWidth: "90%",
              cursor: "zoom-out",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageResizerComponent;
