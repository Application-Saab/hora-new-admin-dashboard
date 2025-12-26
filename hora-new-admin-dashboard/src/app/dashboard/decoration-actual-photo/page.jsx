"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import "./actualImage.css";
import { BASE_URL, ACTUAL_IMAGE_BY_NAME } from "../../../utils/apiconstant";
import { FaClipboardCheck } from "react-icons/fa";

const ActualDecImage = () => {
  const [productName, setProductName] = useState("");
  const [ordersImages, setOrdersImages] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [errors, setErrors] = useState({ input: "", mainImage: "" });
  const [loading, setLoading] = useState(false);
  const [isContinueClicked, setIsContinueClicked] = useState(false);
  const [selectedImages, setSelectedImages] = useState({});
  const [mode, setMode] = useState("tag");
  const [hasChanges, setHasChanges] = useState(false);


  const getOrderId = (e) => "#" + (10800 + e);

  const toggleSelectImage = (key) => {
    setSelectedImages((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setHasChanges(true);
  };

  useEffect(() => {
    setSelectedImages({});
  }, [mode]);

  const copyImageUrl = (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url)
      .then(() => {
        alert("Image URL copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };


  const fetchProductImages = async () => {
    if (!productName) return;
    setLoading(true);
    setErrors({ input: "", mainImage: "" });
    setOrdersImages([]);
    setMainImage(null);
    setSelectedImages({});

    try {
      const url = `${BASE_URL}${ACTUAL_IMAGE_BY_NAME}${encodeURIComponent(
        productName
      )}/orders`;
      const response = await axios.get(url);
      const data = response.data?.data;

      if (!data)
        return setErrors({ input: "Decoration not found", mainImage: "" });

      if (data.decoration?.featured_image) {
        setMainImage(
          `https://horaservices.com/api/uploads/${data.decoration.featured_image}`
        );
      }

      const orders = (data.orders || [])
        .map((order) => {
          if (!order.userOrderDishImageArray?.length) return null;

          const images = order.userOrderDishImageArray.map((img) => ({
            _id: img._id || null,
            image: img.image,
            is_tagged: img.is_tagged || false,
            url: `https://horaservices.com/api/uploads/${img.image}`,
          }));

          return { orderId: order.order_id, images };
        })
        .filter(Boolean);

      const initialSelected = {};
      orders.forEach((o) =>
        o.images.forEach((img) => {
          if (img.is_tagged && img._id) initialSelected[img._id] = true;
        })
      );

      setOrdersImages(orders);
      setSelectedImages(initialSelected);

      if (!orders.length) {
        setErrors({
          input: "",
          mainImage: "No actual images found for this decoration",
        });
      }
    } catch (err) {
      console.error(err);
      setErrors({ input: "Decoration not found", mainImage: "" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isContinueClicked) fetchProductImages();
  }, [isContinueClicked]);

  const handleTagSubmit = async () => {
    try {
      await Promise.all(
        ordersImages.map(async (order) => {
          const imagesToUpdate = [];

          order.images.forEach((img) => {
            const key = img._id || img.image;

            const oldValue = img.is_tagged;
            const newValue = selectedImages[key] !== undefined ? selectedImages[key] : img.is_tagged;

            if (oldValue !== newValue) {
              if (img._id) {
                imagesToUpdate.push({
                  id: img.id,
                  _id: img._id,
                  image: img.image,
                  is_tagged: newValue,
                });
              } else {
                imagesToUpdate.push({
                  id: null,
                  _id: null,
                  image: img.image,
                  is_tagged: newValue,
                });
              }
            }
          });

          if (!imagesToUpdate.length) return;

          await axios.put(`${BASE_URL}/api/order/updateImageTags`, {
            orderId: order.orderId,
            images: imagesToUpdate,
          });
        })
      );

      fetchProductImages(); // refresh UI
    } catch (err) {
      console.error("Tagging failed:", err);
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      const requests = [];
      ordersImages.forEach((order) =>
        order.images.forEach((img) => {
          const key = img._id || img.image;
          if (selectedImages[key]) {
            requests.push(
              axios.post(`${BASE_URL}/api/decoration/delete-image`, {
                imageName: img.image,
              })
            );
          }
        })
      );
      if (!requests.length) return;
      await Promise.all(requests);
      fetchProductImages();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="container">
      <h1 className="pageHeading">Decoration Actual Images</h1>

      <label>Product Name *</label>
      <input
        type="text"
        value={productName}
        placeholder="Enter product name"
        onChange={(e) => {
          setProductName(e.target.value);
          setIsContinueClicked(false);
          setOrdersImages([]);
          setMainImage(null);
          setSelectedImages({});
          setErrors({ input: "", mainImage: "" });
        }}
      />

      {errors.input && <p className="error">{errors.input}</p>}

      {!isContinueClicked && (
        <button
          className="productCheck-btn"
          disabled={!productName}
          onClick={() => setIsContinueClicked(true)}
        >
          Continue
        </button>
      )}

      {loading && <p>Loading...</p>}

      {mainImage && (
        <div className="mainImageContainer">
          <div className="mainImageBox">
            <h4 className="main-image-head">Main Product Image</h4>
            <Image src={mainImage} alt="Main" width={180} height={180} />
            {errors.mainImage && <p className="error">{errors.mainImage}</p>}
          </div>
          {ordersImages.length > 0 && (
            <div className="modeButtonsBox">
              <button
                className={`mode-btn ${mode === "tag" ? "active" : ""}`}
                onClick={() => setMode("tag")}
              >
                Product Images On Website
              </button>
              <button
                className={`mode-btn ${mode === "delete" ? "active" : ""}`}
                onClick={() => setMode("delete")}
              >
                Delete Images from Server
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==== ACTUAL IMAGES GRID ==== */}
      <div className="actualImagesGrid">
        {ordersImages.flatMap((order) =>
          order.images.map((img) => {
            const key = img._id || img.image;
            return (
              <div key={key} className="imageCard">
                <div className="orderIdBadge">
                  Order ID: {getOrderId(Number(order.orderId))}
                </div>

                <Image
                  src={img.url}
                  alt="Order"
                  width={140}
                  height={140}
                  className={`orderImage ${selectedImages[key] ? "selected" : ""
                    }`}
                />

                <div className={`tagBadge ${img.is_tagged ? "tagged" : ""}`}>
                  {img.is_tagged ? "on website" : "not on website"}
                </div>

                <div className="image-selecter">
                  <label className="checkboxLabel">
                    {/* <input
                    type="checkbox"
                    checked={
                      mode === "tag"
                        ? selectedImages[key] !== undefined
                          ? selectedImages[key]
                          : img.is_tagged === true
                        : selectedImages[key] === true
                    }
                    onChange={() => toggleSelectImage(key)}
                  /> */}
                    <input
                      type="checkbox"
                      checked={
                        mode === "tag"
                          ? selectedImages[key] !== undefined
                            ? selectedImages[key]      // use toggled state
                            : img.is_tagged === true   // default checked for tagged images
                          : !!selectedImages[key]      // delete mode: checked only if user clicked
                      }
                      onChange={() => toggleSelectImage(key)}
                    />
                    Select
                  </label>
                  <div className="pointer" title="copy image" onClick={() => copyImageUrl(img.url)}>
                    <FaClipboardCheck color="#97538c" size={20} />
                  </div>

                </div>


              </div>

            );
          })
        )}
      </div>
      {hasChanges && ordersImages.length > 0 && (
        <button
          className="tagSelectedBtn"
          disabled={!hasChanges}
          onClick={mode === "tag" ? handleTagSubmit : handleDeleteSubmit}
        >
          Submit Images
        </button>
      )}

    </div>
  );
};

export default ActualDecImage;




















