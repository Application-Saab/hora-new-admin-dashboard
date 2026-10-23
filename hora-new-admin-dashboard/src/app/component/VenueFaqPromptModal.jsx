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

// Helper function to clean HTML tags from termsAndConditions
const stripHtml = (html = "") => {
  if (typeof window === "undefined") {
    return html.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
  }
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").replace(/\s+/g, " ").trim();
};

const VenueFaqPromptModal = ({ isOpen, onClose, venue, packages = [] }) => {
  const [promptText, setPromptText] = useState("");
  const [copied, setCopied] = useState(false);

  const defaultPrompt = useMemo(() => {
    if (!venue) return "";

    const termsText = stripHtml(venue.termsAndConditionsHtml || "");

    const venueInfo = [
      `- Venue Name: ${venue.venueName || "N/A"}`,
      `- Venue Type: ${Array.isArray(venue.venueType) ? venue.venueType.join(", ") : "N/A"}`,
      `- Location: ${venue.location || ""}, ${venue.locality || ""}, ${venue.city || ""}`,
      `- Hall Types: ${Array.isArray(venue.hallType) ? venue.hallType.join(", ") : "N/A"}`,
      `- Guest Capacity: Min ${venue.minGuestCapacity || 0} to Max ${venue.guestCapacity || 0}`,
      `- Total Rooms Available: ${venue.totalRoomsAvailable ?? 0}`,
      `- Food Types Offered: ${Array.isArray(venue.foodTypes) ? venue.foodTypes.join(", ") : "N/A"}`,
      `- Parking Available: ${venue.isParkingAvailable ? "Yes, dedicated parking available" : "No"}`,
      `- Starting Price: ₹${venue.startingPrice ?? 0}`,
      termsText ? `- Policies & Terms:\n  ${termsText}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const packageSummary = packages && packages.length > 0
      ? packages
          .map((pkg, idx) => {
            const items = Array.isArray(pkg.packageItems)
              ? pkg.packageItems
                  .map((it) => (typeof it?.itemId === "object" ? it?.itemId?.title : null))
                  .filter(Boolean)
                  .join(", ")
              : "";
            const addons = Array.isArray(pkg.packageAddons) ? pkg.packageAddons.filter(Boolean).join(", ") : "";

            return `Package ${idx + 1}: "${pkg.title}"
  - Subtitle: ${pkg.subTitle || "N/A"}
  - Pricing: Actual ₹${pkg.actualPrice || 0}, Discounted ₹${pkg.discountedPrice || 0}
  - Max Guests: ${pkg.maxGuests || 0}
  ${items ? `- Key Food/Items: ${items}` : ""}
  ${addons ? `- Addons: ${addons}` : ""}`;
          })
          .join("\n\n")
      : "No package details available.";

    return (
      `You are a hospitality and venue management content strategist.\n` +
      `Your task is to generate comprehensive, highly relevant, and professional Frequently Asked Questions (FAQs) along with precise answers for the venue detailed below.\n\n` +
      `=== VENUE DETAILS ===\n${venueInfo}\n\n` +
      `=== AVAILABLE PACKAGES ===\n${packageSummary}\n\n` +
      `=== INSTRUCTIONS FOR OUTPUT ===\n` +
      `1. Generate at least 10 to 15 practical FAQs covering:\n` +
      `   - Booking, advances, payment modes, and billing calculation rules.\n` +
      `   - Cancellation, rescheduling, and refund terms.\n` +
      `   - Hall types, guest capacities, and room availability.\n` +
      `   - Catering policies (Veg/Non-veg, kids charges, food guarantee margins).\n` +
      `   - Decorators, external vendors, setup timing, and security deposits.\n` +
      `   - Parking, power backup, and package specifics.\n` +
      `2. Format the response strictly as a two-column CSV / Excel table so that I can copy or save it as an .xlsx/.csv file.\n` +
      `3. Use exact column headers in the first row:\n` +
      `Question\tAnswer\n` +
      `4. Keep answers professional, concise (2-4 sentences), factual based ONLY on the provided venue rules, and free of special quotation characters that break CSV parsing.`
    );
  }, [venue, packages]);

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
              Generate AI FAQs Prompt
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2.5 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Copy this prompt and paste it into <strong>Gemini</strong> or <strong>ChatGPT</strong>. Download or save the output as an <strong>.xlsx</strong> or <strong>.csv</strong> file, then use the <strong>&quot;Import Excel/CSV&quot;</strong> button to load them into the form.
          </Typography>

          <TextField
            multiline
            rows={12}
            fullWidth
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            variant="outlined"
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
            <Button onClick={onClose} variant="outlined" sx={{ textTransform: "none", borderRadius: 2 }}>
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

export default VenueFaqPromptModal;