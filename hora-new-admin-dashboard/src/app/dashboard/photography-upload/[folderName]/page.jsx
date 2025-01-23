"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Resizer from "react-image-file-resizer";
import { galleryPhoto } from "./gallery";

export default function Gallery() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [compressedPhotos, setCompressedPhotos] = useState([]);

  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(loggedInStatus === "true");

    if (loggedInStatus === "true") {
      compressImages(galleryPhoto);
    }
  }, []);

  const compressImages = async (photos) => {
    const compressedImages = await Promise.all(
      photos.map(async (photo) => {
        const blob = await fetchImageAsBlob(photo.url);
        return new Promise((resolve) => {
          Resizer.imageFileResizer(
            blob, // Pass the Blob instead of URL
            480, // Width
            320, // Height
            "JPEG", // Format
            80, // Quality (0-100)
            0, // Rotation (degrees)
            (uri) => {
              resolve({ id: photo.id, url: uri });
            },
            "base64" // Output type
          );
        });
      })
    );
    setCompressedPhotos(compressedImages);
  };

  const fetchImageAsBlob = async (url) => {
    const response = await fetch(url); // Fetch the image
    const blob = await response.blob(); // Convert response to Blob
    return blob;
  };

  return (
    <>
      {isLoggedIn ? (
        <div className="masonry">
          {compressedPhotos.map((photo) => (
            <div className="images masonry-item" key={photo.id}>
              <Image
                src={photo.url}
                width={480}
                height={320}
                sizes="100vw"
                alt={`Gallery Image ${photo.id}`}
              />
            </div>
          ))}
        </div>
      ) : (
        <div>Not Logged In</div>
      )}
    </>
  );
}
