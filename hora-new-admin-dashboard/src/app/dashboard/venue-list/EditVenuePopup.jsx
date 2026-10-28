"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Divider,
  CircularProgress,
  IconButton,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { BASE_URL } from "@/utils/apiconstant";
import { venueEventTypes, venueTypes } from "@/constants/venueListConstants";
import {
  fetchVenueSuggestion,
  fetchVenuePackages,
  createVenueSuggestion,
} from "@/services/venueListServices";
import VenueDescriptionPromptModal from "../../component/VenueDescriptionPromptModal";

const EditVenuePopup = ({ isOpen, onClose, venueData, onSuccess }) => {
  const [formData, setFormData] = useState({
    venueName: "",
    maskName: "",
    location: "",
    locality: "",
    city: "",
    googleMapLink: "",
    description: "",
  });

  const [venueType, setVenueType] = useState([]);
  const [venueFeatures, setVenueFeatures] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [hallType, setHallType] = useState([]);
  const [foodTypes, setFoodTypes] = useState([]);
  const [minGuestCapacity, setMinGuestCapacity] = useState("");
  const [guestCapacity, setGuestCapacity] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [totalRoomsAvailable, setTotalRoomsAvailable] = useState("");
  const [isParkingAvailable, setIsParkingAvailable] = useState(false);

  const [venueImage, setVenueImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [featuresSuggestion, setFeaturesSuggestion] = useState([]);
  const [creatingFeature, setCreatingFeature] = useState(false);

  // Packages state for prompt generation context
  const [venuePackages, setVenuePackages] = useState([]);
  const [showPromptModal, setShowPromptModal] = useState(false);

  // Options for react-select
  const venueTypeOptions =
    venueTypes?.map((item) => ({ value: item, label: item })) || [];

  const eventTypeOptions =
    venueEventTypes?.map((item) => ({ value: item, label: item })) || [];

  const hallTypeOptions = [
    { value: "Outdoor", label: "Outdoor" },
    { value: "Indoor", label: "Indoor" },
  ];

  const foodTypeOptions = [
    { value: "veg", label: "Veg" },
    { value: "non-veg", label: "Non-Veg" },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchVenueSuggestion("SPECIAL_FEATURES").then((data) =>
        setFeaturesSuggestion(data || []),
      );
    }
  }, [isOpen]);

  // Pre-fill form when venueData changes & fetch packages for this venue
  useEffect(() => {
    if (venueData && isOpen) {
      setFormData({
        venueName: venueData.venueName || "",
        maskName: venueData.maskName || "",
        location: venueData.location || "",
        locality: venueData.locality || "",
        city: venueData.city || "",
        googleMapLink: venueData.googleMapLink || "",
        description: venueData?.description || "",
      });

      // Convert arrays to react-select format
      setVenueType(
        (venueData.venueType || []).map((item) => ({
          value: item,
          label: item,
        })),
      );
      setVenueFeatures(
        (venueData.venueFeatures || []).map((item) => ({
          value: item,
          label: item,
        })),
      );
      setEventTypes(
        (venueData.eventTypes || []).map((item) => ({
          value: item,
          label: item,
        })),
      );
      setHallType(
        (venueData.hallType || []).map((item) => ({
          value: item,
          label: item,
        })),
      );
      setFoodTypes(
        (venueData.foodTypes || []).map((item) => ({
          value: item,
          label: item,
        })),
      );

      setGuestCapacity(venueData.guestCapacity ?? "");
      setMinGuestCapacity(venueData.minGuestCapacity ?? "");
      setStartingPrice(venueData.startingPrice ?? "");
      setTotalRoomsAvailable(venueData.totalRoomsAvailable ?? "");
      setIsParkingAvailable(venueData.isParkingAvailable || false);
      setImagePreview(venueData.venueImageUrl || "");
      setVenueImage(null);
      setMessage({ text: "", type: "" });

      // Fetch packages for prompt context
      if (venueData._id) {
        fetchVenuePackages(
          venueData._id,
          (data) => setVenuePackages(data || []),
          () => {},
        );
      }
    }
  }, [venueData, isOpen]);

  const handleCreateFeature = async (inputValue) => {
    if (!inputValue || !inputValue.trim()) return;

    const trimmedValue = inputValue.trim();
    const newOption = { value: trimmedValue, label: trimmedValue };

    // Select immediately in UI
    setVenueFeatures((prev) => [...prev, newOption]);
    setCreatingFeature(true);

    try {
      const savedSuggestion = await createVenueSuggestion(
        trimmedValue,
        "SPECIAL_FEATURES",
      );

      // Append to suggestions dropdown list
      if (savedSuggestion) {
        setFeaturesSuggestion((prev) => [...prev, savedSuggestion]);
      }
    } catch (err) {
      console.error("Error creating suggestion:", err);
    } finally {
      setCreatingFeature(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVenueImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.venueName || !formData.location || !formData.city) {
      setMessage({
        text: "Please fill all required fields (*)",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      setMessage({ text: "", type: "" });

      const payload = new FormData();
      payload.append("venueName", formData.venueName);
      payload.append("maskName", formData.maskName);
      payload.append("location", formData.location);
      payload.append("locality", formData.locality);
      payload.append("city", formData.city);
      payload.append("googleMapLink", formData.googleMapLink);
      payload.append("description", formData.description);
      payload.append(
        "venueType",
        JSON.stringify(venueType.map((v) => v.value)),
      );
      if (venueFeatures) {
        payload.append(
          "venueFeatures",
          JSON.stringify(venueFeatures?.map((v) => v.value)),
        );
      }
      payload.append(
        "eventTypes",
        JSON.stringify(eventTypes.map((v) => v.value)),
      );
      payload.append("hallType", JSON.stringify(hallType.map((v) => v.value)));
      payload.append(
        "foodTypes",
        JSON.stringify(foodTypes.map((v) => v.value)),
      );
      payload.append("guestCapacity", guestCapacity);
      payload.append("minGuestCapacity", minGuestCapacity);
      payload.append("startingPrice", startingPrice);
      payload.append("totalRoomsAvailable", totalRoomsAvailable);
      payload.append("isParkingAvailable", isParkingAvailable);

      if (venueImage) {
        payload.append("image", venueImage);
      }

      await axios.put(
        `${BASE_URL}/api/party-venue/venue-details/${venueData._id}`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setMessage({ text: "Venue updated successfully ✅", type: "success" });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setMessage({ text: "Update failed. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: 42,
      borderRadius: 8,
      borderColor: "#d1d5db",
      boxShadow: "none",
      "&:hover": { borderColor: "#2563eb" },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#eff6ff",
      borderRadius: 6,
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#1d4ed8",
      fontWeight: 500,
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 100000,
    }),
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: "92vh",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* Fixed Header */}
        <DialogTitle
          sx={{
            m: 0,
            p: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #e5e7eb",
            bgcolor: "#fafafa",
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Edit Venue
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Scrollable Content */}
        <DialogContent
          dividers
          sx={{
            p: 3,
            overflowY: "auto",
            flex: 1,
          }}
          className="slim-scrollbar"
        >
          <form id="edit-venue-form" onSubmit={handleSubmit}>
            {message.text && (
              <Alert
                severity={message.type === "success" ? "success" : "error"}
                sx={{ mb: 2.5 }}
              >
                {message.text}
              </Alert>
            )}

            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Venue Details
            </Typography>

            {/* Venue Name + Mask Name */}
            <Box mb={2.5} display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <TextField
                name="venueName"
                label="Venue Name *"
                value={formData.venueName}
                onChange={handleChange}
                size="small"
                required
                fullWidth
              />
              <TextField
                name="maskName"
                label="Venue Mask Name"
                value={formData.maskName}
                onChange={handleChange}
                size="small"
                fullWidth
              />
            </Box>

            {/* Type + City */}
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2.5}>
              <Box mb={2.5}>
                <Typography variant="body2" fontWeight={500} mb={0.8}>
                  Venue Type *
                </Typography>
                <Select
                  isMulti
                  options={venueTypeOptions}
                  value={venueType}
                  onChange={setVenueType}
                  placeholder="Select venue types..."
                  styles={selectStyles}
                />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={500} mb={0.8}>
                  Venue City
                </Typography>
                <TextField
                  name="city"
                  label="City *"
                  value={formData.city}
                  onChange={handleChange}
                  size="small"
                  required
                  fullWidth
                />
              </Box>
            </Box>

            {/* Location + Locality */}
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2.5}>
              <TextField
                name="location"
                label="Location *"
                value={formData.location}
                onChange={handleChange}
                size="small"
                required
                fullWidth
              />
              <TextField
                name="locality"
                label="Locality"
                value={formData.locality}
                onChange={handleChange}
                size="small"
                fullWidth
              />
            </Box>

            {/* Google Map + Venue Features (Creatable) */}
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2.5}>
              <Box>
                <Typography variant="body2" fontWeight={500} mb={0.8}>
                  Google Map Link
                </Typography>
                <TextField
                  name="googleMapLink"
                  label="Google Map Link"
                  value={formData.googleMapLink}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  sx={{ mb: 3 }}
                />
              </Box>
              <Box mb={2.5}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={0.8}
                >
                  <Typography variant="body2" fontWeight={500}>
                    Special Features
                  </Typography>
                  {creatingFeature && (
                    <Typography variant="caption" color="text.secondary">
                      Saving new feature...
                    </Typography>
                  )}
                </Box>
                <CreatableSelect
                  isMulti
                  options={featuresSuggestion?.map((item) => ({
                    value: item?.title,
                    label: item?.title,
                  }))}
                  value={venueFeatures}
                  onChange={(selected) => setVenueFeatures(selected || [])}
                  onCreateOption={handleCreateFeature}
                  placeholder="Type or select features..."
                  styles={selectStyles}
                  formatCreateLabel={(inputValue) => `Add & Save "${inputValue}"`}
                />
              </Box>
            </Box>

            {/* Venue Description with AI Prompt Button */}
            <Box mb={3}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={1}
              >
                <Typography variant="body2" fontWeight={500}>
                  Venue Description (4-5 lines recommended)
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  startIcon={
                    <AutoAwesomeIcon sx={{ fontSize: "14px !important" }} />
                  }
                  onClick={() => setShowPromptModal(true)}
                  sx={{
                    textTransform: "none",
                    borderRadius: 1.5,
                    fontSize: 12,
                    px: 1.5,
                    py: 0.2,
                  }}
                >
                  Generate AI Prompt
                </Button>
              </Box>
              <TextField
                name="description"
                placeholder="Enter venue description here (or generate via AI prompt)..."
                value={formData.description}
                onChange={handleChange}
                size="small"
                multiline
                rows={4}
                fullWidth
              />
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Event & Amenities
            </Typography>

            {/* Event Types */}
            <Box mb={2.5}>
              <Typography variant="body2" fontWeight={500} mb={0.8}>
                Event Types
              </Typography>
              <Select
                isMulti
                options={eventTypeOptions}
                value={eventTypes}
                onChange={setEventTypes}
                placeholder="Select event types..."
                styles={selectStyles}
              />
            </Box>

            {/* Hall Type + Food Types */}
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2.5}>
              <Box>
                <Typography variant="body2" fontWeight={500} mb={0.8}>
                  Hall Type
                </Typography>
                <Select
                  isMulti
                  options={hallTypeOptions}
                  value={hallType}
                  onChange={setHallType}
                  placeholder="Select..."
                  styles={selectStyles}
                />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={500} mb={0.8}>
                  Food Types
                </Typography>
                <Select
                  isMulti
                  options={foodTypeOptions}
                  value={foodTypes}
                  onChange={setFoodTypes}
                  placeholder="Select..."
                  styles={selectStyles}
                />
              </Box>
            </Box>

            {/* Numbers */}
            <Box
              display="grid"
              gridTemplateColumns="1fr 1fr 1fr 1fr"
              gap={2}
              mb={2.5}
            >
              <TextField
                label="Min guest capacity"
                type="number"
                value={minGuestCapacity}
                onChange={(e) => setMinGuestCapacity(e.target.value)}
                size="small"
                fullWidth
              />

              <TextField
                label="Max guest capacity"
                type="number"
                value={guestCapacity}
                onChange={(e) => setGuestCapacity(e.target.value)}
                size="small"
                fullWidth
              />

              <TextField
                label="Starting Price"
                type="number"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                size="small"
                fullWidth
              />

              <TextField
                label="Rooms Available"
                type="number"
                value={totalRoomsAvailable}
                onChange={(e) => setTotalRoomsAvailable(e.target.value)}
                size="small"
                fullWidth
              />
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={isParkingAvailable}
                  onChange={(e) => setIsParkingAvailable(e.target.checked)}
                />
              }
              label="Parking Available"
              sx={{ mb: 2 }}
            />

            <Divider sx={{ mb: 3 }} />

            {/* Image */}
            <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
              Venue Image
            </Typography>

            <Button
              variant="outlined"
              component="label"
              sx={{ textTransform: "none", borderRadius: 2, mb: 2 }}
            >
              {imagePreview ? "Change Image" : "Choose Image"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>

            {imagePreview && (
              <Box mt={1}>
                <img
                  src={imagePreview}
                  alt="Venue Preview"
                  style={{
                    width: 160,
                    height: 110,
                    objectFit: "cover",
                    borderRadius: 10,
                    border: "1px solid #e5e7eb",
                  }}
                />
              </Box>
            )}
          </form>
        </DialogContent>

        {/* Fixed Footer */}
        <DialogActions
          sx={{
            p: 2.5,
            borderTop: "1px solid #e5e7eb",
            bgcolor: "#fafafa",
            gap: 1,
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="edit-venue-form"
            variant="contained"
            disabled={loading}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              minWidth: 140,
            }}
          >
            {loading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Update Venue"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Venue Description Prompt Modal */}
      {showPromptModal && (
        <VenueDescriptionPromptModal
          isOpen={showPromptModal}
          onClose={() => setShowPromptModal(false)}
          venueData={{
            venueName: formData.venueName,
            venueMaskName: formData.maskName,
            venueTypes: venueType.map((v) => v.value),
            venueFeatures: venueFeatures.map((v) => v.value),
            location: formData.location,
            locality: formData.locality,
            venueCity: formData.city,
            eventTypes: eventTypes.map((v) => v.value),
            guestCapacity,
            minGuestCapacity,
            hallTypes: hallType.map((v) => v.value),
            foodTypes: foodTypes.map((v) => v.value),
            startingPrice,
            totalRoomsAvailable,
            isParkingAvailable,
          }}
          packages={venuePackages}
        />
      )}
    </>
  );
};

export default EditVenuePopup;