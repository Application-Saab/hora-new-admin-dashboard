"use client";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../photoFolder.css";

const ThumbnailGallery = ({ folderName, customerId }) => {
  const [thumbnails, setThumbnails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [originalImages, setOriginalImages] = useState({});

  useEffect(() => {
    const fetchThumbnails = async () => {
      try {
        const response = await fetch(
          `https://horaservices.com:3000/api/photo/thumbnailsWithinProject?folderName=${folderName}&customerId=${customerId}`
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

  useEffect(() => {
    const fetchOriginalImages = async () => {
      const newOriginals = {};
      for (let thumbnail of thumbnails) {
        try {
          const response = await fetch(
            `https://horaservices.com:3000/api/photo/originalImage?thumbnailKey=${thumbnail.key}`
          );
          const data = await response.json();
          newOriginals[thumbnail.key] = data.originalImageUrl;
        } catch (error) {
          console.error("Failed to fetch original image:", error);
        }
      }
      setOriginalImages(newOriginals);
    };
    if (thumbnails.length > 0) {
      fetchOriginalImages();
    }
  }, [thumbnails]);

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
      <h2 className="title">Project Thumbnails</h2>
      {loading && <p>Loading thumbnails...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      <div className="masonryGrid">
        {thumbnails.length > 0 ? (
          thumbnails.map((thumbnail, index) => (
            <img
              key={index}
              src={thumbnail.url}
              alt={`Thumbnail ${index + 1}`}
              className="thumbnail"
              onClick={() => handleImageClick(index)}
            />
          ))
        ) : (
          !loading && <p>No thumbnails found.</p>
        )}
      </div>
      {selectedIndex !== null && (
        <div className="popupOverlay" onClick={closePopup}>
          <div className="popupContent" onClick={(e) => e.stopPropagation()}>
            <button className="closeButton" onClick={closePopup}>X</button>
            <Slider {...sliderSettings} initialSlide={selectedIndex}>
              {thumbnails.map((thumbnail, index) => (
                <div key={index}>
                  <img
                    src={originalImages[thumbnail.key] || thumbnail.url}
                    alt="Original"
                    className="popupImage"
                  />
                  <a
                    href={originalImages[thumbnail.key] || thumbnail.url}
                    download
                    className="downloadButton"
                  >
                    Download Original Image
                  </a>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThumbnailGallery;
