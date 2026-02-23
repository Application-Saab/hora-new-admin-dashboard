"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

const AddMoreImages = () => {
  const [url, setUrl] = useState("");
  const [folderName, setFolderName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadStatuses, setUploadStatuses] = useState({});

  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    const inputUrl = e.target.value;
    setUrl(inputUrl);

    try {
      const urlObj = new URL(inputUrl);
      const folder = urlObj.searchParams.get("folderName");
      const customer = urlObj.searchParams.get("customerId");

      setFolderName(folder || "");
      setCustomerId(customer || "");
      setPhoneNumber("");
      setError("");
    } catch {
      setFolderName("");
      setCustomerId("");
      setPhoneNumber("");
      setError("Invalid URL");
    }
  };

  // useEffect(() => {
  //   const fetchCustomerData = async () => {
  //     if (customerId) {
  //       try {
  //         const response = await axios.post(
  //           "https://horaservices.com:3000/api/admin/admin_user_list",
  //           {
  //             role: "customer",
  //             page: 1,
  //             per_page: 3000,
  //           }
  //         );

  //         const customers = response.data.data?.users || [];
  //         const match = customers.find((user) => user._id === customerId);

  //         if (match) {
  //           setPhoneNumber(match.phone || "Phone number not found");
  //         } else {
  //           setPhoneNumber("");
  //           setError("Customer ID not found.");
  //         }
  //       } catch (err) {
  //         console.error("API call failed:", err);
  //         setError("API call failed.");
  //         setPhoneNumber("");
  //       }
  //     }
  //   };

  //   fetchCustomerData();
  // }, [customerId]);
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (customerId) {
        try {
          const response = await axios.post(
            "https://horaservices.com:3000/api/admin/admin_user_list",
            {
              role: "customer",
              _id: customerId, // pass customerId as _id
            }
          );

          const customers = response.data.data?.users || [];
          const match = customers.find((user) => user._id === customerId);

          if (match) {
            setPhoneNumber(match.phone || "Phone number not found");
          } else {
            setPhoneNumber("");
            setError("Customer ID not found.");
          }
        } catch (err) {
          console.error("API call failed:", err);
          setError("API call failed.");
          setPhoneNumber("");
        }
      }
    };

    fetchCustomerData();
  }, [customerId]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    const newStatuses = {};
    files.forEach((file) => {
      newStatuses[file.name] = "Pending";
    });
    setUploadStatuses(newStatuses);
  };

  const handleUpload = async () => {
    const newStatuses = { ...uploadStatuses };

    const uploadPromises = selectedFiles.map(async (file) => {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("customerId", customerId);
      formData.append("phoneNo", phoneNumber);
      formData.append("folderName", folderName);

      newStatuses[file.name] = "Uploading...";
      setUploadStatuses({ ...newStatuses });

      try {
        await axios.post(
          "https://mediaprocess.horaservices.com/upload",
          formData
        );
        newStatuses[file.name] = "Uploaded";
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        newStatuses[file.name] = "Failed";
      }

      setUploadStatuses({ ...newStatuses });
    });

    await Promise.all(uploadPromises);
    fetchImages();
  };

  //  useEffect(() => {
  //   const fetchCustomerData = async () => {
  //     if (customerId) {

  const fetchImages = async () => {
    if (customerId) {
      try {
        const response = await axios.get(`https://horaservices.com:3000/api/photo/thumbnailsWithinProject?folderName=${folderName}&customerId=${customerId}`);
        setImages(response.data.thumbnails);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    }
  };

  useEffect(() => {
    fetchImages();
  }, [customerId, folderName]);


  // Delete image
  const deleteImage = async (id) => {
    try {
      await axios.delete(`https://mediaprocess.horaservices.com/delete-image/${id}`);

      // Update state after deletion
      setImages((prevImages) => prevImages.filter((img) => img._id !== id));
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  return (
    <>
      <div style={{ padding: "20px", maxWidth: "600px" }}>
        <h2>Paste URL</h2>
        <input
          type="text"
          placeholder="Paste your URL here"
          value={url}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            marginBottom: "20px",
          }}
        />

        {folderName && (
          <p>
            <strong>Folder Name:</strong> {folderName}
          </p>
        )}
        {customerId && (
          <p>
            <strong>Customer ID:</strong> {customerId}
          </p>
        )}
        {phoneNumber && (
          <p>
            <strong>Phone Number:</strong> {phoneNumber}
          </p>
        )}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {folderName && customerId && phoneNumber && (
          <div style={{ marginTop: "20px" }}>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007BFF",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            />
            {/* Image Preview */}
            <div style={{ display: "flex", flexWrap: "wrap", marginTop: "20px" }}>
              {selectedFiles.map((file, index) => {
                const isVideo = file.type.startsWith("video/");

                const previewUrl = URL.createObjectURL(file);

                return (
                  <div
                    key={index}
                    style={{
                      margin: "10px",
                      textAlign: "center",
                      border: "1px solid #ddd",
                      padding: "5px",
                      borderRadius: "8px",
                      position: "relative",
                      width: "150px",
                    }}
                  >
                    {isVideo ? (
                      <video
                        src={previewUrl}
                        style={{
                          width: "100%",
                          height: "90px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls
                      />
                    ) : (
                      <img
                        src={previewUrl}
                        alt={`preview-${index}`}
                        style={{
                          width: "100%",
                          height: "90px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    )}

                    <span
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background:
                          uploadStatuses[file.name] === "Uploaded"
                            ? "green"
                            : uploadStatuses[file.name] === "Failed"
                              ? "red"
                              : "#555",
                        color: "white",
                        padding: "2px 6px",
                        fontSize: "12px",
                        borderRadius: "5px",
                      }}
                    >
                      {uploadStatuses[file.name] || "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>

            {selectedFiles.length > 0 &&
              <button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0}
                style={{
                  marginLeft: "10px",
                  padding: "10px 16px",
                  border: "none",
                  background: "#007BFF",
                  color: "#FAFAFA",
                  borderRadius: "5px",
                  opacity: selectedFiles.length === 0 ? 0.85 : 1,
                  cursor: selectedFiles.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                Upload All Images
              </button>
            }
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {images.map((img) => {
          const isVideo = img.type === "video";

          return (
            <div
              key={img._id}
              style={{ position: "relative", margin: "10px" }}
            >
              {isVideo ? (
                <video
                  src={img.videoClipUrl || img.originalUrl}
                  style={{
                    width: "200px",
                    height: "auto",
                    borderRadius: "8px",
                  }}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                />
              ) : (
                <img
                  src={img.thumbnailImageUrl || img.originalUrl}
                  alt="thumbnail"
                  style={{
                    width: "200px",
                    height: "auto",
                    borderRadius: "8px",
                  }}
                />
              )}

              <button
                onClick={() => deleteImage(img._id)}
                style={{
                  position: "absolute",
                  top: "5px",
                  right: "5px",
                  background: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "25px",
                  height: "25px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

    </>
  );
};

export default AddMoreImages;
