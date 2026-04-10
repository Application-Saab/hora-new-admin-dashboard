import React, { useState } from "react";
import "./CreateNewMaterialPopup.css";
import { handleEditMaterialList, handleFileUploadMaterialList } from "./decorationMaterialListServices";

const CreateDecoarationMaterialPopup = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    specs: "",
    type: "",
    materialName: "",
    packet: "",
    minimumOrderQuantity: "",
    materialCategory: "",
    vendorMaterialPrice: "",
    vendorMaterialRateRetail: "",
    vendorMaterialRateWholesale: "",
    rateCard: "",
    images: "",
    materialStatus: 1,
  });

  const [loadingCreate, setLoadingCreate] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = async (e) => {
    handleFileUploadMaterialList(e, setFormData);
  };

  const handleSubmit = async (e) => {
    handleEditMaterialList(
      e,
      formData,
      null,
      onSuccess,
      onClose,
      setLoadingCreate,
      false,
    );
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-btn" onClick={onClose}>
          X
        </button>

        <h2>Create Decoration Material</h2>

        <form onSubmit={handleSubmit}>
          <div className="package-form-container">
            <div className="package-create-input-ctn">
              <input
                type="text"
                name="materialName"
                placeholder="Material Name"
                value={formData.materialName}
                onChange={handleChange}
                required
                className="package-create-input"
              />

              <input
                type="text"
                name="type"
                placeholder="Type"
                value={formData.type}
                onChange={handleChange}
                required
                className="package-create-input"
              />
            </div>

            <div className="package-create-input-ctn">
              <input
                type="text"
                name="specs"
                placeholder="Specs"
                value={formData.specs}
                onChange={handleChange}
                required
                className="package-create-input"
              />

              <input
                type="text"
                name="packet"
                placeholder="Packet"
                value={formData.packet}
                onChange={handleChange}
                className="package-create-input"
              />
            </div>

            <div className="package-create-input-ctn">
              <input
                type="text"
                name="minimumOrderQuantity"
                placeholder="Minimum Order Quantity (eg: 10 pcs)"
                value={formData.minimumOrderQuantity}
                onChange={handleChange}
                className="package-create-input"
              />

              <select
                name="materialCategory"
                value={formData.materialCategory}
                onChange={handleChange}
                className="package-create-input"
              >
                <option value="">Select Material Category</option>
                <option value="Rented">Rented</option>
                <option value="Consumable">Consumable</option>
              </select>
            </div>

            <div className="package-create-input-ctn">
              <input
                type="text"
                name="vendorMaterialPrice"
                placeholder="Vendor Material Price (eg: 1000)"
                value={formData.vendorMaterialPrice}
                onChange={handleChange}
                className="package-create-input"
              />

              <input
                type="text"
                name="vendorMaterialRateRetail"
                placeholder="Retail Rate (eg: 1500)"
                value={formData.vendorMaterialRateRetail}
                onChange={handleChange}
                className="package-create-input"
              />
            </div>

            <div className="package-create-input-ctn">
              <input
                type="text"
                name="vendorMaterialRateWholesale"
                placeholder="Wholesale Rate (eg: 1200)"
                value={formData.vendorMaterialRateWholesale}
                onChange={handleChange}
                className="package-create-input"
              />

              <input
                type="text"
                name="rateCard"
                placeholder="Rate Card"
                value={formData.rateCard}
                onChange={handleChange}
                className="package-create-input"
              />
            </div>

            <div className="package-create-input-ctn">
              <input
                type="file"
                onChange={handleFileUpload}
                className="package-create-input"
              />

              <select
                name="materialStatus"
                value={formData.materialStatus}
                onChange={handleChange}
                className="package-create-input"
              >
                <option value={1}>Active</option>
                <option value={2}>Inactive</option>
              </select>
            </div>

            <div
              style={{
                marginTop: "80px",
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                className="package-create-btn package-cancel-btn"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="package-create-btn"
                disabled={loadingCreate}
              >
                {loadingCreate ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDecoarationMaterialPopup;
