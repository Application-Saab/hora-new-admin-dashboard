"use client";
import React, { useState } from "react";
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
import {
  BASE_URL,
  ADMIN_USER_LIST,
  ADMIN_USER_SIGNUP,
} from "../../../utils/apiconstant";
import { venueEventTypes, venueTypes } from "@/constants/venueListConstants";

const CreateVenuePopup = ({ isOpen, onClose, onSuccess }) => {
  // Customer
  const [customerNumber, setCustomerNumber] = useState("");
  const [customerId, setCustomerId] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);

  // New customer popup
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  // Venue fields
  const [venueType, setVenueType] = useState([]);
  const [venueName, setVenueName] = useState("");
  const [venueMaskName, setVenueMaskName] = useState("");
  const [location, setLocation] = useState("");
  const [locality, setLocality] = useState("");
  const [venueCity, setVenueCity] = useState("");
  const [googleMapLink, setGoogleMapLink] = useState("");
  const [eventTypes, setEventTypes] = useState([]);
  const [minGuestCapacity, setMinGuestCapacity] = useState("");
  const [guestCapacity, setGuestCapacity] = useState("");
  const [isParkingAvailable, setIsParkingAvailable] = useState(false);
  const [hallType, setHallType] = useState([]);
  const [foodTypes, setFoodTypes] = useState([]);
  const [startingPrice, setStartingPrice] = useState("");
  const [totalRoomsAvailable, setTotalRoomsAvailable] = useState("");
  const [venueImage, setVenueImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [message, setMessage] = useState({ text: "", type: "" });
  const [createLoading, setCreateLoading] = useState(false);

  // Options for react-select
  const venueTypeOptions =
    venueTypes?.map((item) => ({
      value: item,
      label: item,
    })) || [];

  const eventTypeOptions =
    venueEventTypes?.map((item) => ({
      value: item,
      label: item,
    })) || [];

  const hallTypeOptions = [
    { value: "Outdoor", label: "Outdoor" },
    { value: "Indoor", label: "Indoor" },
  ];

  const foodTypeOptions = [
    { value: "veg", label: "Veg" },
    { value: "non-veg", label: "Non-Veg" },
  ];

  // -------------------------------------------------
  // Check Customer
  // -------------------------------------------------
  const handleCheckCustomer = async () => {
    if (!customerNumber || customerNumber.length < 10) {
      setMessage({
        text: "Please enter a valid 10-digit number",
        type: "error",
      });
      return;
    }

    setCheckLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await axios.post(`${BASE_URL}${ADMIN_USER_LIST}`, {
        phone: customerNumber,
        per_page: 1,
        role: "customer",
      });

      const users = response?.data?.data?.users || [];
      const customer = users.find((u) => u.phone === customerNumber);

      if (customer) {
        setCustomerId(customer._id);
        setMessage({ text: "Customer found ✓", type: "success" });
        setShowAddCustomer(false);
      } else {
        setShowAddCustomer(true);
        setNewCustomerPhone(customerNumber);
        setMessage({
          text: "Customer not found. Please create one.",
          type: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setShowAddCustomer(true);
      setMessage({ text: "Error checking customer", type: "error" });
    } finally {
      setCheckLoading(false);
    }
  };

  // -------------------------------------------------
  // Add Customer
  // -------------------------------------------------
  const handleAddCustomer = async () => {
    if (!newCustomerName.trim() || !newCustomerPhone) {
      setMessage({ text: "Name and phone are required", type: "error" });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}${ADMIN_USER_SIGNUP}`, {
        name: newCustomerName,
        phone: newCustomerPhone,
        role: "customer",
      });

      setCustomerId(res.data.dataToSave._id);
      setShowAddCustomer(false);
      setMessage({ text: "Customer created successfully ✓", type: "success" });
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to create customer", type: "error" });
    }
  };

  // -------------------------------------------------
  // Create Venue
  // -------------------------------------------------
  const handleCreateVenue = async (e) => {
    e.preventDefault();

    if (!customerId) {
      setMessage({ text: "Please verify customer first", type: "error" });
      return;
    }

    if (!venueName || !location || !venueCity || venueType.length === 0) {
      setMessage({
        text: "Please fill all required fields (*)",
        type: "error",
      });
      return;
    }

    try {
      setCreateLoading(true);
      const formData = new FormData();

      formData.append("userId", customerId);
      formData.append(
        "venueType",
        JSON.stringify(venueType.map((v) => v.value)),
      );
      formData.append("venueName", venueName);
      formData.append("maskName", venueMaskName);
      formData.append("location", location);
      formData.append("locality", locality);
      formData.append("city", venueCity);
      formData.append("googleMapLink", googleMapLink);
      formData.append(
        "eventTypes",
        JSON.stringify(eventTypes.map((v) => v.value)),
      );
      formData.append("guestCapacity", guestCapacity);
      formData.append("minGuestCapacity", minGuestCapacity);
      formData.append("isParkingAvailable", isParkingAvailable);
      formData.append("hallType", JSON.stringify(hallType.map((v) => v.value)));
      formData.append(
        "foodTypes",
        JSON.stringify(foodTypes.map((v) => v.value)),
      );
      formData.append("startingPrice", startingPrice);
      formData.append("totalRoomsAvailable", totalRoomsAvailable);

      if (venueImage) {
        formData.append("image", venueImage);
      }

      const res = await axios.post(
        `${BASE_URL}/api/party-venue/create-party-venue`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (!res.data.error) {
        setMessage({ text: "Venue created successfully ✅", type: "success" });
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Error creating venue", type: "error" });
    } finally {
      setCreateLoading(false);
    }
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: 42,
      borderRadius: 8,
      borderColor: "#d1d5db",
      boxShadow: "none",
      zIndex: 10000,
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
      {/* Main Create Venue Dialog */}
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
            Create New Venue
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
          {/* Customer Section */}
          <Box mb={3}>
            <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
              Owner / Manager
            </Typography>

            <Box display="flex" gap={1.5} alignItems="flex-start">
              <TextField
                fullWidth
                size="small"
                label="Phone Number *"
                value={customerNumber}
                onChange={(e) =>
                  setCustomerNumber(
                    e.target.value.replace(/\D/g, "").slice(0, 10),
                  )
                }
                placeholder="10-digit number"
                disabled={!!customerId}
              />
              <Button
                variant="contained"
                onClick={handleCheckCustomer}
                disabled={checkLoading || !!customerId}
                size="small"
                sx={{
                  minWidth: 140,
                  height: 40,
                  textTransform: "none",
                  borderRadius: 2,
                }}
              >
                {checkLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Check Customer"
                )}
              </Button>
            </Box>

            {message.text && (
              <Alert
                severity={message.type === "success" ? "success" : "error"}
                sx={{ mt: 1.5 }}
              >
                {message.text}
              </Alert>
            )}
          </Box>

          {/* Venue Form - only after customer is verified */}
          {customerId && (
            <form id="create-venue-form" onSubmit={handleCreateVenue}>
              <Divider sx={{ mb: 3 }} />

              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Venue Details
              </Typography>

              {/* Venue Type */}
              <Box mb={2.5} display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <TextField
                  label="Venue Name *"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  size="small"
                  required
                  fullWidth
                />

                <TextField
                  label="Venue Mask Name"
                  value={venueMaskName}
                  onChange={(e) => setVenueMaskName(e.target.value)}
                  size="small"
                  fullWidth
                />
              </Box>

              {/* Name + Location row */}
              <Box
                display="grid"
                gridTemplateColumns="1fr 1fr"
                gap={2}
                mb={2.5}
              >
                <Box>
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
                    label="City *"
                    value={venueCity}
                    onChange={(e) => setVenueCity(e.target.value)}
                    size="small"
                    required
                    fullWidth
                  />
                </Box>
              </Box>

              <Box
                display="grid"
                gridTemplateColumns="1fr 1fr"
                gap={2}
                mb={2.5}
              >
                <TextField
                  label="Location *"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  size="small"
                  required
                  fullWidth
                />
                <TextField
                  label="Locality"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  size="small"
                  fullWidth
                />
              </Box>

              <TextField
                label="Google Map Link"
                value={googleMapLink}
                onChange={(e) => setGoogleMapLink(e.target.value)}
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

              {/* Hall Type + Food Type */}
              <Box
                display="grid"
                gridTemplateColumns="1fr 1fr"
                gap={2}
                mb={2.5}
              >
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

              {/* Image Upload */}
              <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
                Venue Image
              </Typography>
              <Button
                variant="outlined"
                component="label"
                sx={{ textTransform: "none", borderRadius: 2, mb: 2 }}
              >
                Choose Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setVenueImage(file);
                    setImagePreview(URL.createObjectURL(file));
                  }}
                />
              </Button>

              {imagePreview && (
                <Box mt={1}>
                  <img
                    src={imagePreview}
                    alt="preview"
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
          )}
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

          {customerId && (
            <Button
              type="submit"
              form="create-venue-form"
              variant="contained"
              disabled={createLoading}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                minWidth: 140,
              }}
            >
              {createLoading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "Create Venue"
              )}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Add New Customer Dialog */}
      <Dialog
        open={showAddCustomer}
        onClose={() => setShowAddCustomer(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography fontWeight={700}>Add New Customer</Typography>
          <IconButton size="small" onClick={() => setShowAddCustomer(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Full Name *"
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
            size="small"
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Phone Number *"
            value={newCustomerPhone}
            onChange={(e) =>
              setNewCustomerPhone(
                e.target.value.replace(/\D/g, "").slice(0, 10),
              )
            }
            size="small"
          />
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setShowAddCustomer(false)}
            variant="outlined"
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddCustomer}
            variant="contained"
            sx={{ textTransform: "none" }}
          >
            Create Customer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateVenuePopup;
