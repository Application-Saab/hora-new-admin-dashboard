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

  // Generate dynamic promotional image prompt
  const defaultPrompt = useMemo(() => {
    if (!packageData) return "";

    const packageName = packageData.title || "Special Event Package";

    const venueName = venue?.venueName || "Luxury Venue";

    const venueTypes =
      Array.isArray(venue?.venueType) && venue.venueType.length > 0
        ? venue.venueType.join(", ")
        : "Banquet Hall, Restaurant";

    const hallTypes =
      Array.isArray(venue?.hallType) && venue.hallType.length > 0
        ? venue.hallType.join(", ")
        : "Indoor";

    const eventTypes =
      Array.isArray(venue?.eventTypes) && venue.eventTypes.length > 0
        ? venue.eventTypes.join(", ")
        : "Birthdays, Corporate Events, Celebrations";

    // Extract all package food item names
    const allItemNames = Array.isArray(packageData.packageItems)
      ? packageData.packageItems
          .map((pi) =>
            typeof pi?.itemId === "object"
              ? pi?.itemId?.title
              : null
          )
          .filter(Boolean)
      : [];

    // Select first 6 items for featured dishes
    const featuredDishes = allItemNames.slice(0, 6);

    // Package addons
    const addons =
      Array.isArray(packageData.packageAddons) &&
      packageData.packageAddons.length > 0
        ? packageData.packageAddons
            .slice(0, 4)
            .map((addon) =>
              typeof addon === "object"
                ? addon?.title || addon?.name
                : addon
            )
            .filter(Boolean)
        : [];

    // Package inclusions (use actual data only)
    const packageInclusions =
      typeof packageData.packageInclusions === "string"
        ? packageData.packageInclusions
        : Array.isArray(packageData.packageInclusions)
          ? packageData.packageInclusions.join(" | ")
          : typeof packageData.inclusions === "string"
            ? packageData.inclusions
            : `${allItemNames.length} curated menu items included`;

    const guestCount = packageData.maxGuests || 50;

    return `
Create a premium luxury hospitality and catering promotional poster.

IMPORTANT: This must look like a professionally designed commercial advertisement with actual TEXT RENDERED DIRECTLY ON THE IMAGE, not just a photograph.

[PACKAGE BRANDING - TOP SECTION]

Main Package Title:
"${packageName}"

Venue Branding:
"${venueName}"

Display the venue name prominently at the top in elegant premium gold typography.

Display the package title immediately below it in large, bold, sophisticated serif typography.

Both names MUST be visibly rendered as text on the image.

[VENUE ENVIRONMENT]

Venue Type: ${venueTypes}
Venue Name: ${venueName}
Hall Type: ${hallTypes}
Guest Capacity: ${guestCount} guests.

Create a beautiful high-end indoor banquet or restaurant environment with:
- Elegant banquet tables and premium table settings.
- Warm golden chandelier lighting.
- Luxury interior architecture.
- Beautiful ambient lighting.
- Subtle background bokeh.
- Sophisticated event atmosphere.

The environment should visually represent a premium venue suitable for ${eventTypes}.

[FOOD PHOTOGRAPHY]

Showcase an appetizing gourmet buffet arrangement.

Featured food items:
${featuredDishes.length > 0
  ? featuredDishes.map((item, index) => `${index + 1}. ${item}`).join("\n")
  : "Beautiful gourmet food selections representing the package."}

Use realistic food photography with:
- Elegant ceramic serving dishes.
- Fresh garnishes and herbs.
- Visible steam on hot dishes.
- Rich appetizing textures.
- Beautiful food styling.
- Premium restaurant presentation.

[FEATURED DISHES - TEXT OVERLAY]

IMPORTANT: Render these exact dish names directly on the image.

${featuredDishes.length > 0
  ? featuredDishes.map((item) => `• ${item}`).join("\n")
  : "Showcase selected gourmet dishes."}

Create a stylish FEATURED DISHES heading.

Display the dish names in a clean two-column layout with small elegant food icons where appropriate.

[PACKAGE INCLUSIONS - BOTTOM SECTION]

Create a separate premium bordered panel at the bottom of the poster.

Heading:
PACKAGE INCLUDES

Actual package inclusions:
${packageInclusions}

${allItemNames.length > 0
  ? `Total food items: ${allItemNames.length}`
  : ""}

${addons.length > 0
  ? `Additional Amenities: ${addons.join(", ")}`
  : ""}

Render the inclusion information directly on the image using a clean, compact and readable layout.

Do not invent any package quantities, menu categories or amenities that are not supplied in the actual package data.

[TYPOGRAPHY & GRAPHIC DESIGN]

Use a premium luxury advertisement design.

Color palette:
- Rich black and dark brown background.
- Metallic gold typography.
- Warm ivory and cream text.
- Subtle golden decorative borders and dividers.

Typography hierarchy:

1. Venue name - elegant gold branding at the top.
2. Package title - large and visually dominant.
3. Featured Dishes - clear heading and readable dish names.
4. Package Includes - premium bordered bottom panel.

Use refined serif fonts for headings and clean sans-serif fonts for descriptions.

Maintain excellent contrast and spacing.

[COMPOSITION & IMAGE SPECIFICATIONS]

- Portrait orientation.
- Exact aspect ratio: 1:2.
- Target display dimensions: 230px × 460px.
- High-resolution source rendering.
- Keep all important text inside safe margins.
- Do not overlap text with food photography.
- Maintain a balanced composition.
- Food should remain visually prominent.
- Typography must remain legible after resizing to 230 × 460 px.
- No spelling mistakes.
- No random or invented text.
- No watermarks.
- Photorealistic commercial food photography.
- Premium luxury hospitality advertising quality.

[FINAL OUTPUT]

The final image must look like a professionally art-directed luxury catering package advertisement.

The package title, venue name, featured dishes and package inclusions must all be visibly rendered as actual text on the image.

Do not treat the supplied text as visual references only.

Make the final result visually similar to a premium restaurant buffet advertisement with dark backgrounds, golden typography, beautiful food photography and elegant information panels.
`.trim();
  }, [packageData, venue]);

  useEffect(() => {
    if (isOpen) {
      setPromptText(defaultPrompt);
      setCopied(false);
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
    setCopied(false);
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
            <Typography
              variant="caption"
              sx={{
                bgcolor: "#f1f5f9",
                px: 1,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              Target: <strong>230 × 460 px (1:2)</strong>
            </Typography>

            <Typography
              variant="caption"
              sx={{
                bgcolor: "#f1f5f9",
                px: 1,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              Target File Size: <strong>&lt; 300 KB</strong>
            </Typography>

            <Typography
              variant="caption"
              sx={{
                bgcolor: "#f1f5f9",
                px: 1,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              Package: <strong>{packageData?.title || "—"}</strong>
            </Typography>
          </Box>

          <TextField
            multiline
            rows={16}
            fullWidth
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="AI prompt will appear here..."
            variant="outlined"
            helperText="Edit the prompt before copying. Reset restores the dynamically generated default prompt."
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

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
            justifyContent: "space-between",
          }}
        >
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
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{
                textTransform: "none",
                borderRadius: 2,
              }}
            >
              Close
            </Button>

            <Button
              onClick={handleCopy}
              variant="contained"
              startIcon={<ContentCopyIcon />}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                px: 2.5,
              }}
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
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert
          severity="success"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          Prompt copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default PackagePromptModal;
