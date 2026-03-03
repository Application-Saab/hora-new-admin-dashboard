"use client";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../photoFolder.css";
import {BASE_URL} from '../../../../utils/apiconstant'

const ThumbnailGallery = ({ folderName, customerId }) => {
  const [thumbnails, setThumbnails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    const fetchThumbnails = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/photo/thumbnailsWithinProject?folderName=${folderName}&customerId=${customerId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch thumbnails");
        }
        const data = await response.json();
        setThumbnails(data.thumbnails || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchThumbnails();
  }, [folderName, customerId]);

  const handleImageClick = (index) => {
    setSelectedIndex(index);
  };

  const closePopup = () => {
    setSelectedIndex(null);
  };

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: selectedIndex,

  };

  return (
    <div className="container">
      <h2 className="title">Uploaded Images in your Folder</h2>
      {loading && <p>Loading thumbnails...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      <div className="masonryGrid">
        {thumbnails.length > 0 ? (
          thumbnails.map((thumbnail, index) => {
            const isVideo = thumbnail.type == "video"

            return (
              <div key={index}>
                {isVideo ? (
                  <video
                    src={thumbnail.videoClipUrl}
                    className="selectedImages thumbnail"
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    onClick={() => handleImageClick(index)}
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      border: "2px solid #ccc",
                    }}
                  />
                ) : (
                  <img
                    src={thumbnail.thumbnailImageUrl}
                    alt={`Thumbnail ${index + 1}`}
                    className="thumbnail"
                    onClick={() => handleImageClick(index)}
                  />
                )}
              </div>
            );
          })
        ) : (
          !loading && <p>No thumbnails found.</p>
        )}
      </div>
      {selectedIndex !== null && (
        <div className="popupOverlay" onClick={closePopup}>
          <div className="popupContent" onClick={(e) => e.stopPropagation()}>
            <button className="closeButton" onClick={closePopup}>X</button>
            <Slider {...sliderSettings} initialSlide={selectedIndex}>
              {thumbnails.map((thumbnail, index) => {
                const imageUrl = thumbnail.originalUrl || thumbnail.thumbnailImageUrl;
                const isVideo = thumbnail.type == "video";

                const copyToClipboard = () => {
                  navigator.clipboard.writeText(imageUrl).then(() => {
                    alert("Link copied to clipboard!");
                  }).catch((err) => {
                    console.error("Failed to copy:", err);
                  });
                };

                return (
                  <div key={index}>
                    {isVideo ? (
                      <video
                        src={imageUrl}
                        className="popupImage"
                        controls
                        autoPlay
                        playsInline
                      />
                    ) : (
                      <img
                        src={imageUrl}
                        alt="Original"
                        className="popupImage"
                      />
                    )}

                    <div className="buttonContainer">
                      {/* Download Button */}
                      <a href={imageUrl} download={`image-${index}.jpg`} className="downloadButton">
                        Download Original Image
                      </a>

                      {/* Copy Link Button */}
                      <button onClick={copyToClipboard} className="buttonSecondary">
                        Copy Link
                      </button>
                    </div>
                  </div>
                );
              })}
            </Slider>
          </div>
        </div>
      )}

    </div>
  );
};

export default ThumbnailGallery;