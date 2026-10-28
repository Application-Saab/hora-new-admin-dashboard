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

const PackagePromptModal = ({ isOpen, onClose, packageData, venue }) => {
  const [promptText, setPromptText] = useState("");
  const [copied, setCopied] = useState(false);

  // Generate dynamic prompt based on venue + package specifics
  const defaultPrompt = useMemo(() => {
    if (!packageData) return "";

    const venueName = venue?.venueName || "Luxury Venue";
    const venueTypes = Array.isArray(venue?.venueType) && venue.venueType.length > 0
      ? venue.venueType.join(", ")
      : "Banquet Hall, Resort";
    const hallTypes = Array.isArray(venue?.hallType) && venue.hallType.length > 0
      ? venue.hallType.join("/")
      : "Indoor";
    const eventTypes = Array.isArray(venue?.eventTypes) && venue.eventTypes.length > 0
      ? venue.eventTypes.join(", ")
      : "Weddings, Celebrations";

    // Extract item names
    const itemNames = Array.isArray(packageData.packageItems)
      ? packageData.packageItems
          .map((pi) => (typeof pi?.itemId === "object" ? pi?.itemId?.title : null))
          .filter(Boolean)
          .slice(0, 6)
          .join(", ")
      : "";

    const addons = Array.isArray(packageData.packageAddons) && packageData.packageAddons.length > 0
      ? packageData.packageAddons.slice(0, 3).join(", ")
      : "";

    return (
      `Vertical promotional banner card photograph for luxury hospitality and catering package.\n\n` +
      `[SUBJECT]: "${packageData.title || "Special Event Package"}" - ${packageData.subTitle || "Exclusive celebration feast and setup"}.\n` +
      `[VENUE SETTING]: Styled at a high-end ${venueTypes} (${venueName}), showcasing elegant ${hallTypes} banquet decor, ambient warm chandelier lighting, neatly set guest tables for ${packageData.maxGuests || 50} guests.\n` +
      (itemNames ? `[CUISINE HIGHLIGHTS]: Gourmet presentation of ${itemNames}, plated on elegant ceramic dishes with steam and fresh garnishes.\n` : "") +
      (addons ? `[INCLUDED AMENITIES]: Subtle visual accents representing ${addons}.\n` : "") +
      `[STYLE & MOOD]: Commercial lifestyle photography, appetizing food presentation, rich warm festive tones, soft bokeh depth of field, suitable for ${eventTypes}.\n` +
      `[COMPOSITION & SPECS]: Vertical composition (portrait orientation), dimensions 230px width by 460px height (aspect ratio 1:2), high sharpness, clean negative space at the top/bottom for overlay text, optimized crisp digital rendering for lightweight web asset (<300KB WebP target). No watermarks, photorealistic, 8k render quality.`
    );
  }, [packageData, venue]);

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
      console.error("Failed to copy prompt:", err);
    }
  };

  const handleReset = () => {
    setPromptText(defaultPrompt);
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 0.5 },
        }}
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
              AI Image Prompt Generator
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2.5 }}>
          <Box mb={2} display="flex" gap={1} flexWrap="wrap">
            <Typography variant="caption" sx={{ bgcolor: "#f1f5f9", px: 1, py: 0.5, borderRadius: 1 }}>
              Target: <strong>230 × 460 px (1:2)</strong>
            </Typography>
            <Typography variant="caption" sx={{ bgcolor: "#f1f5f9", px: 1, py: 0.5, borderRadius: 1 }}>
              Target File Size: <strong>&lt; 300 KB</strong>
            </Typography>
            <Typography variant="caption" sx={{ bgcolor: "#f1f5f9", px: 1, py: 0.5, borderRadius: 1 }}>
              Package: <strong>{packageData?.title || "—"}</strong>
            </Typography>
          </Box>

          <TextField
            multiline
            rows={10}
            fullWidth
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="AI prompt will appear here..."
            variant="outlined"
            helperText="Feel free to edit details before copying. Clicking 'Reset' restores the default generated prompt."
            sx={{
              "& .MuiOutlinedInput-root": {
                fontFamily: "monospace",
                fontSize: 13,
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
              onClick={handleReset}
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

export default PackagePromptModal;