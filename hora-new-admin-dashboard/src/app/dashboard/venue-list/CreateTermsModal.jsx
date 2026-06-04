"use client";

import React, {
  useEffect,
  useState,
} from "react";

import dynamic from "next/dynamic";

import {
  updateVenueTerms,
} from "@/services/venueListServices";

import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(
  () => import("react-quill"),
  {
    ssr: false,
  }
);

const EditTermsPopup = ({
  isOpen,
  onClose,
  venue,
  onSuccess,
}) => {
  const [loading,
    setLoading] =
    useState(false);

  const [html,
    setHtml] =
    useState("");

  useEffect(() => {
    if (venue) {
      setHtml(
        venue
          .termsAndConditionsHtml ||
          ""
      );
    }
  }, [venue]);

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      await updateVenueTerms(
        venue._id,
        html,
        onSuccess,
        onClose,
        setLoading
      );
    };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div
        className="popup-content terms-popup-content"
      >
        <button
          className="close-btn"
          onClick={onClose}
        >
          X
        </button>

        <h2>
          Edit Terms &
          Conditions
        </h2>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <div className="package-form-container">

            <ReactQuill
              theme="snow"
              value={html}
              onChange={
                setHtml
              }
              className="terms-editor"
            />

            <div
              style={{
                marginTop:
                  "80px",
                display:
                  "flex",
                justifyContent:
                  "flex-end",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={
                  onClose
                }
                className="package-create-btn package-cancel-btn"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="package-create-btn"
                disabled={
                  loading
                }
              >
                {loading
                  ? "Saving..."
                  : "Save Terms"}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTermsPopup;