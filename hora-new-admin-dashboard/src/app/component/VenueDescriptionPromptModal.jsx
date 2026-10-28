"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const VenueDescriptionPromptModal = ({
  isOpen,
  onClose,
  venueData = {},
  packages = [],
}) => {
  const [promptText, setPromptText] = useState("");
  const [copied, setCopied] = useState(false);

  const defaultPrompt = useMemo(() => {
    const {
      venueName,
      venueMaskName,
      venueTypes = [],
      venueFeatures = [],
      location,
      locality,
      venueCity,
      eventTypes = [],
      guestCapacity,
      minGuestCapacity,
      hallTypes = [],
      foodTypes = [],
      startingPrice,
      totalRoomsAvailable,
      isParkingAvailable,
    } = venueData;

    // Package stats if any
    let packageInsights = "No active packages yet.";
    if (packages && packages.length > 0) {
      const prices = packages
        .map((p) => p.discountedPrice || p.actualPrice)
        .filter(Boolean);
      const minPrice = prices.length ? Math.min(...prices) : startingPrice;
      const maxPrice = prices.length ? Math.max(...prices) : startingPrice;
      const guestCaps = packages.map((p) => p.maxGuests).filter(Boolean);
      const maxPkgGuests = guestCaps.length ? Math.max(...guestCaps) : guestCapacity;

      packageInsights =
        `Total Packages: ${packages.length} options available. ` +
        `Package Pricing Range: ₹${minPrice || startingPrice || 0} to ₹${maxPrice || startingPrice || 0}. ` +
        `Max Guest Hosting per package: up to ${maxPkgGuests || guestCapacity || 0} guests.`;
    }

    const venueTypesStr = venueTypes.length
      ? venueTypes.join(", ")
      : "Luxury Banquet & Celebration Venue";
    const featuresStr = venueFeatures.length
      ? venueFeatures.join(", ")
      : "Modern hospitality amenities";
    const hallTypesStr = hallTypes.length ? hallTypes.join(" and ") : "Indoor/Outdoor";
    const foodTypesStr = foodTypes.length ? foodTypes.join(" & ") : "Veg & Non-Veg";
    const eventsStr = eventTypes.length
      ? eventTypes.join(", ")
      : "Weddings, Corporate Gatherings, Engagements, and Private Parties";

    return (
      `You are a professional luxury hospitality copywriter.\n` +
      `Generate an engaging, high-converting, and SEO-friendly VENUE DESCRIPTION (strictly 4 to 5 lines maximum) for marketing and booking portals.\n\n` +
      `=== VENUE SPECIFICATIONS ===\n` +
      `- Venue Name: ${venueName || "Premier Celebration Venue"}${venueMaskName ? ` (Brand: ${venueMaskName})` : ""}\n` +
      `- Venue Category: ${venueTypesStr}\n` +
      `- Location: ${location || ""}${locality ? `, ${locality}` : ""}, ${venueCity || ""}\n` +
      `- Event Focus: Ideal for ${eventsStr}\n` +
      `- Capacity: Accommodates ${minGuestCapacity ? `${minGuestCapacity} to ` : ""}${guestCapacity || 500} guests\n` +
      `- Ambience & Setup: ${hallTypesStr} spaces with ${featuresStr}\n` +
      `- Culinary & Stay: ${foodTypesStr} catering options, ${totalRoomsAvailable ? `${totalRoomsAvailable} well-appointed guest rooms` : "stay accommodations"}\n` +
      `- Amenities: ${isParkingAvailable ? "Dedicated valet/on-site parking" : "Convenient access"}, Starting from ₹${startingPrice || "affordable packages"}\n` +
      `- Package Highlights: ${packageInsights}\n\n` +
      `=== STRICT WRITING GUIDELINES ===\n` +
      `1. Length: Exactly 4 to 5 concise and impactful sentences (one single cohesive paragraph).\n` +
      `2. Tone: Warm, celebratory, premium, and trustworthy.\n` +
      `3. Content flow:\n` +
      `   - Line 1: Captivating hook introducing the venue name, its location, and primary ambience.\n` +
      `   - Line 2: Scale and events it specializes in (guest capacity and indoor/outdoor versatile spaces).\n` +
      `   - Line 3: Culinary delights, catering choices, and key comfort features/amenities.\n` +
      `   - Line 4-5: Value proposition (custom packages, guest rooms, seamless parking) ending with an inviting call to celebrate memorable occasions here.\n` +
      `4. Do NOT include bullet points, headings, hashtags, or quotation marks. Output only the pure description paragraph ready for direct paste.`
    );
  }, [venueData, packages]);

  useEffect(() => {
    if (isOpen) {
      setPromptText(defaultPrompt);
    }
  }, [isOpen, defaultPrompt]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 0.5 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f1f5f9",
            pb: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <AutoAwesomeIcon color="primary" fontSize="small" />
            <Typography variant="h6" fontWeight={700}>
              AI Venue Description Prompt Generator
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2.5 }}>
          <Box mb={2} display="flex" gap={1} flexWrap="wrap">
            <Typography
              variant="caption"
              sx={{ bgcolor: "#f1f5f9", px: 1, py: 0.5, borderRadius: 1 }}
            >
              Output Target: <strong>4 to 5 lines</strong>
            </Typography>
            <Typography
              variant="caption"
              sx={{ bgcolor: "#f1f5f9", px: 1, py: 0.5, borderRadius: 1 }}
            >
              Tone: <strong>Luxury Hospitality / Marketing</strong>
            </Typography>
          </Box>

          <TextField
            multiline
            rows={11}
            fullWidth
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            variant="outlined"
            helperText="Copy this prompt into Gemini / ChatGPT, then paste the generated 4-5 line result directly into the Venue Description field."
            sx={{
              "& .MuiOutlinedInput-root": {
                fontFamily: "monospace",
                fontSize: 12.5,
                lineHeight: 1.6,
                bgcolor: "#fcfcfd",
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: "space-between" }}>
          <Tooltip title="Reset to auto-generated default">
            <Button
              startIcon={<RefreshIcon />}
              onClick={() => setPromptText(defaultPrompt)}
              color="inherit"
              size="small"
              sx={{ textTransform: "none" }}
            >
              Reset Prompt
            </Button>
          </Tooltip>

          <Box display="flex" gap={1.5}>
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              Close
            </Button>
            <Button
              onClick={handleCopy}
              variant="contained"
              startIcon={<ContentCopyIcon />}
              sx={{ textTransform: "none", borderRadius: 2, px: 2.5 }}
            >
              Copy Prompt
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={copied}
        autoHideDuration={2500}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%", borderRadius: 2 }}>
          Prompt copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default VenueDescriptionPromptModal;