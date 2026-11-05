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

  const promptText = `Create a clean, minimal, single-color SVG icon for the feature: "${featureName}".

Requirements:
- Output ONLY valid SVG code (no markdown, no explanation)
- viewBox="0 0 24 24"
- stroke-based or simple fill, prefer currentColor
- Simple, professional, line-style icon suitable for UI (like material icons)
- No text inside the SVG
- Keep it small and readable at 18-20px size`;

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
        <Button onClick={onClose} variant="outlined" sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!svgCode.trim() || saving}
          sx={{ textTransform: "none", minWidth: 120 }}
        >
          {saving ? <CircularProgress size={20} color="inherit" /> : "Save Feature"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddFeatureWithIconModal;