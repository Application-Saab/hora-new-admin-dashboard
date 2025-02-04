"use client";
import React, { useState } from "react";
import Resizer from "react-image-file-resizer";
// import { button } from "@/components/ui/button";

const ImageUpload = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [allImages, setAllImages] = useState([]);
  const storedUser = JSON.parse(localStorage.getItem("userDetails")) || {};
  const { folderId, customerNumber } = storedUser;

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const resizedImages = [];

    files.forEach((file) => {
      Resizer.imageFileResizer(
        file,
        800,
        800,
        "JPEG",
        80,
        0,
        (uri) => {
          resizedImages.push({ file: uri, name: file.name });
          if (resizedImages.length === files.length) {
            setSelectedImages(resizedImages);
          }
        },
        "file"
      );
    });
  };

  const handleUpload = async () => {
    if (!folderId || !customerNumber) {
      alert("Missing user details in local storage.");
      return;
    }

    const formData = new FormData();
    formData.append("folderName", folderId);
    formData.append("customerId", customerNumber);
    selectedImages.forEach((image) => {
      formData.append("files", image.file, image.name);
    });

    try {
      const response = await fetch("https://horaservices.com:3000/api/photo/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      alert(data.uploadedFiles[0].fileName);
      setAllImages((prev) => [...prev, ...selectedImages]);
      setSelectedImages([]);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed");
    }
  };

  return (
    <div className="p-4">
      <input type="file" multiple onChange={handleImageChange} accept="image/*"  style={{
              padding: "10px 20px",
              backgroundColor: "#007BFF",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}/>
      {
        selectedImages.length > 0 && (<>
          <div className="mt-4">

            <h3>Newly Selected Images:</h3>
            <div className="flex flex-wrap">
              {selectedImages.map((image, index) => (
                <img key={index} src={URL.createObjectURL(image.file)} alt={image.name} className="w-32 h-32 m-2 object-cover rounded" />
              ))}
            </div>
          </div>
          <button onClick={handleUpload} className="mt-4"
            style={{
              padding: "10px 20px",
              backgroundColor: "#007BFF",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >Upload</button>
        </>)
      }

      {
        allImages.length > 0 &&(<>
        <div className="mt-4">
          <h3>All Uploaded Images:</h3>
          <div className="flex flex-wrap">
            {allImages.map((image, index) => (
              <img key={index} src={URL.createObjectURL(image.file)} alt={image.name} className="w-32 h-32 m-2 object-cover rounded" />
            ))}
          </div>
        </div>
        </>)
      }
    </div>
  )
};

export default ImageUpload;