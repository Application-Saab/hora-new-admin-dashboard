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
import Select from "react-select";
import { BASE_URL } from "@/utils/apiconstant";
import { venueEventTypes, venueTypes } from "@/constants/venueListConstants";

const EditVenuePopup = ({ isOpen, onClose, venueData, onSuccess }) => {
  const [formData, setFormData] = useState({
    venueName: "",
    maskName: "",
    location: "",
    locality: "",
    city: "",
    googleMapLink: "",
  });

  const [venueType, setVenueType] = useState([]);
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

  // Pre-fill form when venueData changes
  useEffect(() => {
    if (venueData) {
      setFormData({
        venueName: venueData.venueName || "",
        maskName: venueData.maskName || "",
        location: venueData.location || "",
        locality: venueData.locality || "",
        city: venueData.city || "",
        googleMapLink: venueData.googleMapLink || "",
      });

      // Convert arrays to react-select format
      setVenueType(
        (venueData.venueType || []).map((item) => ({
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

      setGuestCapacity(venueData.guestCapacity || "");
      setMinGuestCapacity(venueData.minGuestCapacity || "");
      setStartingPrice(venueData.startingPrice || "");
      setTotalRoomsAvailable(venueData.totalRoomsAvailable || "");
      setIsParkingAvailable(venueData.isParkingAvailable || false);
      setImagePreview(venueData.venueImageUrl || "");
      setVenueImage(null);
      setMessage({ text: "", type: "" });
    }
  }, [venueData]);

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
      payload.append(
        "venueType",
        JSON.stringify(venueType.map((v) => v.value)),
      );
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

          {/* Venue Type */}
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

          {/* Name + City */}
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

          <TextField
            name="googleMapLink"
            label="Google Map Link"
            value={formData.googleMapLink}
            onChange={handleChange}
            size="small"
            fullWidth
            sx={{ mb: 3 }}
          />

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
  );
};

export default EditVenuePopup;
