"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const AddFeatureWithIconModal = ({
  open,
  featureName = "",
  onClose,
  onSave,
  saving = false,
}) => {
  const [svgCode, setSvgCode] = useState("");
  const [copied, setCopied] = useState(false);
  
const promptText = `Generate a high-quality, modern hospitality amenity SVG icon for the feature: "${featureName}".

CRITICAL OUTPUT FORMAT INSTRUCTION:
- DO NOT render the SVG preview or graphic.
- You MUST provide ONLY the raw SVG code wrapped inside a markdown code block (\`\`\`xml ... \`\`\`) with NO explanation or conversational text before/after it.
- Single click copy hona chahiye.

🎨 DESIGN & STYLE REQUIREMENTS (Must strictly match existing UI theme):
1. Style: Modern filled/solid silhouette or bold dual-tone icon with smooth rounded corners (matching hotel amenity badges like Airbnb/Booking.com). DO NOT make thin wireframe or skinny 1px outline icons.
2. Contextual Color (Use inline hex fill):
   - Water / Pool / Spa: Aqua / Sky Blue (#0288D1, #00ACC1)
   - Rooms / AC / Stay: Rich Royal Blue (#1976D2, #1E88E5)
   - Food / Drinks / Dining / Bar / Dance Bar: Warm Amber, Sunset Orange, or Wine Pink (#E65100, #F57C00, #C2185B)
   - Gym / Fitness / Sports: Energetic Red or Coral (#E53935, #D32F2F)
   - Guests / Party / People / Music: Elegant Purple or Violet (#7B1FA2, #8E24AA)
   - Parking / Lawn / Outdoor / Nature: Fresh Green (#2E7D32, #43A047)
   - Halls / Buildings / Architecture: Warm Amber / Terracotta (#FB8C00, #E65100)
3. Technical SVG Specs:
   - Must start with <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" viewBox="0 0 24 24"> and end with </svg>.
   - Use <path fill="#HEX" ... /> elements with solid shapes.`;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const handleSave = () => {
    if (!svgCode.trim()) return;
    onSave?.({
      title: featureName,
      iconSvg: svgCode.trim(),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography fontWeight={700}>
          Add Feature Icon – {featureName}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Step 1: Prompt */}
        <Typography variant="subtitle2" fontWeight={600} mb={1}>
          1. Copy this prompt → paste in Gemini / ChatGPT
        </Typography>

        <Box
          sx={{
            bgcolor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 2,
            p: 1.5,
            mb: 1,
            position: "relative",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              whiteSpace: "pre-wrap",
              fontFamily: "monospace",
              fontSize: 12.5,
              lineHeight: 1.5,
              color: "#334155",
            }}
          >
            {promptText}
          </Typography>

          <Button
            size="small"
            startIcon={<ContentCopyIcon sx={{ fontSize: 16 }} />}
            onClick={handleCopyPrompt}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              textTransform: "none",
              fontSize: 12,
              bgcolor: "white",
              border: "1px solid #e2e8f0",
              "&:hover": { bgcolor: "#f1f5f9" },
            }}
          >
            {copied ? "Copied!" : "Copy Prompt"}
          </Button>
        </Box>

        {/* Step 2: Paste SVG */}
        <Typography variant="subtitle2" fontWeight={600} mb={1} mt={2.5}>
          2. Paste the SVG code below
        </Typography>

        <TextField
          fullWidth
          multiline
          minRows={5}
          maxRows={10}
          placeholder={`<svg viewBox="0 0 24 24" ...>...</svg>`}
          value={svgCode}
          onChange={(e) => setSvgCode(e.target.value)}
          size="small"
          sx={{
            "& .MuiInputBase-input": {
              fontFamily: "monospace",
              fontSize: 13,
            },
          }}
        />

        {/* Live Preview */}
        {svgCode.trim() && (
          <Box mt={2} display="flex" alignItems="center" gap={1.5}>
            <Typography variant="body2" color="text.secondary">
              Preview:
            </Typography>
            <Box
              sx={{
                width: 36,
                height: 36,
                border: "1px solid #e2e8f0",
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#fafafa",
                "& svg": {
                  width: 20,
                  height: 20,
                },
              }}
              dangerouslySetInnerHTML={{ __html: svgCode }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!svgCode.trim() || saving}
          sx={{ textTransform: "none", minWidth: 120 }}
        >
          {saving ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Save Feature"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddFeatureWithIconModal;
