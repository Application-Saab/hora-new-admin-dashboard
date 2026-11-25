"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Slider,
  Snackbar,
  Alert,
  Stack,
  TextField,
  Typography,
  Autocomplete,
  Tooltip,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  DeleteOutline as DeleteIcon,
  AddCircleOutline as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Videocam as VideocamIcon,
  Image as ImageIcon,
  ReceiptLong as SummaryIcon,
  CurrencyRupee as RupeeIcon,
  Save as SaveIcon,
  Crop as CropIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as ResetIcon,
  OpenWith as PanIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

import {
  BASE_URL,
  PRODUCT_MEAL_TYPE,
  ADD_DECORATION_PRODUCT,
  GET_MATERIAL_FILTER_DATA,
} from "../../../utils/apiconstant";
import { DESIGN_TYPE_OPTIONS } from "../../../utils/constants";

const BRAND_PRIMARY = "#924286";
const BRAND_DARK = "#733069";
const BRAND_LIGHT_BG = "#fcf6fb";

// Fixed Crop Grid Dimensions (Max 480x470)
const CROP_MAX_WIDTH = 480;
const CROP_MAX_HEIGHT = 470;
const CROP_ASPECT = CROP_MAX_WIDTH / CROP_MAX_HEIGHT;

const getDefaultDesignType = (initial = {}) => {
  const result = {};
  DESIGN_TYPE_OPTIONS.forEach((item) => {
    result[item] = Boolean(initial?.[item]);
  });
  return result;
};

const ImageCropModal = ({
  open,
  imageSrc,
  fileName,
  queueProgress,
  onCancel,
  onConfirm,
}) => {
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [frameSize, setFrameSize] = useState({
    width: CROP_MAX_WIDTH,
    height: CROP_MAX_HEIGHT,
  });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!open) return;
    const updateFrame = () => {
      const availableW = Math.min(CROP_MAX_WIDTH, window.innerWidth - 64);
      const calculatedH = Math.round(availableW / CROP_ASPECT);
      setFrameSize({ width: availableW, height: calculatedH });
    };
    updateFrame();
    window.addEventListener("resize", updateFrame);
    return () => window.removeEventListener("resize", updateFrame);
  }, [open]);

  useEffect(() => {
    if (open) {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    }
  }, [open, imageSrc]);

  const getCoverDimensions = useCallback(
    (natW, natH, frmW, frmH, currentZoom) => {
      if (!natW || !natH || !frmW || !frmH) {
        return { baseW: frmW, baseH: frmH, scaledW: frmW, scaledH: frmH };
      }
      const scaleCover = Math.max(frmW / natW, frmH / natH);
      const baseW = natW * scaleCover;
      const baseH = natH * scaleCover;
      return {
        baseW,
        baseH,
        scaledW: baseW * currentZoom,
        scaledH: baseH * currentZoom,
      };
    },
    []
  );

  const clampOffset = useCallback(
    (nextX, nextY, currentZoom) => {
      const { scaledW, scaledH } = getCoverDimensions(
        naturalSize.width,
        naturalSize.height,
        frameSize.width,
        frameSize.height,
        currentZoom
      );
      const maxOffsetX = Math.max(0, (scaledW - frameSize.width) / 2);
      const maxOffsetY = Math.max(0, (scaledH - frameSize.height) / 2);

      return {
        x: Math.min(maxOffsetX, Math.max(-maxOffsetX, nextX)),
        y: Math.min(maxOffsetY, Math.max(-maxOffsetY, nextY)),
      };
    },
    [naturalSize, frameSize, getCoverDimensions]
  );

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setNaturalSize({ width: naturalWidth, height: naturalHeight });
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleZoomChange = (newZoom) => {
    const clampedZoom = Math.min(3.5, Math.max(1, Number(newZoom)));
    setZoom(clampedZoom);
    setOffset((prev) => clampOffset(prev.x, prev.y, clampedZoom));
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    dragStartRef.current = { x: clientX - offset.x, y: clientY - offset.y };
  };

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const rawX = clientX - dragStartRef.current.x;
      const rawY = clientY - dragStartRef.current.y;
      setOffset(clampOffset(rawX, rawY, zoom));
    },
    [isDragging, clampOffset, zoom]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp);
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.12 : -0.12;
    handleZoomChange(+(zoom + delta).toFixed(2));
  };

  const handleApplyCrop = () => {
    const imgEl = imgRef.current;
    if (!imgEl || !naturalSize.width) return;

    const { scaledW, scaledH } = getCoverDimensions(
      naturalSize.width,
      naturalSize.height,
      frameSize.width,
      frameSize.height,
      zoom
    );

    const imgLeftInFrame = (frameSize.width - scaledW) / 2 + offset.x;
    const imgTopInFrame = (frameSize.height - scaledH) / 2 + offset.y;

    const scaleToNaturalX = naturalSize.width / scaledW;
    const scaleToNaturalY = naturalSize.height / scaledH;

    const srcX = Math.max(0, -imgLeftInFrame * scaleToNaturalX);
    const srcY = Math.max(0, -imgTopInFrame * scaleToNaturalY);
    const srcW = Math.min(
      naturalSize.width - srcX,
      frameSize.width * scaleToNaturalX
    );
    const srcH = Math.min(
      naturalSize.height - srcY,
      frameSize.height * scaleToNaturalY
    );

    const exportScale = Math.min(2, srcW / CROP_MAX_WIDTH || 1);
    const outW = Math.round(CROP_MAX_WIDTH * Math.max(1, exportScale));
    const outH = Math.round(CROP_MAX_HEIGHT * Math.max(1, exportScale));

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(imgEl, srcX, srcY, srcW, srcH, 0, 0, outW, outH);

    const isPng = /\.png$/i.test(fileName || "");
    const mimeType = isPng ? "image/png" : "image/jpeg";
    const ext = isPng ? ".png" : ".jpg";
    const baseName = (fileName || "cropped-image").replace(/\.[^/.]+$/, "");

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], `${baseName}${ext}`, {
          type: mimeType,
          lastModified: Date.now(),
        });
        const previewUrl = URL.createObjectURL(blob);
        onConfirm(croppedFile, previewUrl);
      },
      mimeType,
      0.95
    );
  };

  const { scaledW, scaledH } = getCoverDimensions(
    naturalSize.width,
    naturalSize.height,
    frameSize.width,
    frameSize.height,
    zoom
  );

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          bgcolor: BRAND_LIGHT_BG,
          borderBottom: "1px solid #e6dce4",
          py: 1.8,
          px: 3,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <CropIcon sx={{ color: BRAND_PRIMARY }} />
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="#1e1420">
                Crop Product Image
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Fixed Grid: 480 × 470 px • Drag image to position & zoom
              </Typography>
            </Box>
          </Stack>
          {queueProgress && (
            <Chip
              label={queueProgress}
              size="small"
              sx={{
                bgcolor: BRAND_PRIMARY,
                color: "#fff",
                fontWeight: 700,
              }}
            />
          )}
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          bgcolor: "#141116",
        }}
      >
        <Box
          ref={containerRef}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          onWheel={handleWheel}
          sx={{
            position: "relative",
            width: frameSize.width,
            height: frameSize.height,
            overflow: "hidden",
            borderRadius: 2,
            border: `2px solid ${BRAND_PRIMARY}`,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55)",
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: "none",
            touchAction: "none",
            bgcolor: "#000",
          }}
        >
          {imageSrc && (
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop target"
              onLoad={handleImageLoad}
              draggable={false}
              style={{
                position: "absolute",
                width: `${scaledW}px`,
                height: `${scaledH}px`,
                left: `${(frameSize.width - scaledW) / 2 + offset.x}px`,
                top: `${(frameSize.height - scaledH) / 2 + offset.y}px`,
                maxWidth: "none",
                pointerEvents: "none",
              }}
            />
          )}

          {/* Fixed Rule-of-Thirds Overlay Grid */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              border: "1px solid rgba(255,255,255,0.45)",
              "&::before": {
                content: '""',
                position: "absolute",
                top: "33.33%",
                bottom: "33.33%",
                left: 0,
                right: 0,
                borderTop: "1px dashed rgba(255,255,255,0.45)",
                borderBottom: "1px dashed rgba(255,255,255,0.45)",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                left: "33.33%",
                right: "33.33%",
                top: 0,
                bottom: 0,
                borderLeft: "1px dashed rgba(255,255,255,0.45)",
                borderRight: "1px dashed rgba(255,255,255,0.45)",
              },
            }}
          />

          <Chip
            icon={<PanIcon sx={{ fontSize: 14, color: "#fff !important" }} />}
            label="Drag to adjust"
            size="small"
            sx={{
              position: "absolute",
              bottom: 10,
              left: "50%",
              transform: "translateX(-50%)",
              bgcolor: "rgba(0,0,0,0.65)",
              color: "#fff",
              fontSize: "0.7rem",
              pointerEvents: "none",
            }}
          />
        </Box>

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ width: "100%", maxWidth: frameSize.width, mt: 2.5, px: 1 }}
        >
          <IconButton
            size="small"
            onClick={() => handleZoomChange(+(zoom - 0.15).toFixed(2))}
            disabled={zoom <= 1}
            sx={{ color: "#fff" }}
          >
            <ZoomOutIcon />
          </IconButton>

          <Slider
            value={zoom}
            min={1}
            max={3.5}
            step={0.05}
            onChange={(_, val) => handleZoomChange(val)}
            sx={{
              color: BRAND_PRIMARY,
              "& .MuiSlider-thumb": { bgcolor: "#fff" },
            }}
          />

          <IconButton
            size="small"
            onClick={() => handleZoomChange(+(zoom + 0.15).toFixed(2))}
            disabled={zoom >= 3.5}
            sx={{ color: "#fff" }}
          >
            <ZoomInIcon />
          </IconButton>

          <Tooltip title="Reset Zoom & Position">
            <IconButton
              size="small"
              onClick={() => {
                setZoom(1);
                setOffset({ x: 0, y: 0 });
              }}
              sx={{ color: "#ccc" }}
            >
              <ResetIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 1.8,
          bgcolor: "#fff",
          borderTop: "1px solid #e6dce4",
        }}
      >
        <Button
          onClick={onCancel}
          sx={{ color: "#666", textTransform: "none", fontWeight: 600 }}
        >
          Skip / Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<CropIcon />}
          onClick={handleApplyCrop}
          sx={{
            bgcolor: BRAND_PRIMARY,
            "&:hover": { bgcolor: BRAND_DARK },
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            borderRadius: 2,
          }}
        >
          Crop & Save Image
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AddProductForm = () => {
  const [productName, setProductName] = useState("");
  const [productRate, setProductRate] = useState("");
  const [, setDescription] = useState("");
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [mealProductTypes, setMealProductTypes] = useState([]);
  const [designType, setDesignType] = useState(() => getDefaultDesignType());
  const [designSearch, setDesignSearch] = useState("");

  const [mediaFiles, setMediaFiles] = useState([]);
  const fileInputRef = useRef(null);

  const [cropQueue, setCropQueue] = useState([]);
  const [cropTotalCount, setCropTotalCount] = useState(0);
  const [editingMediaIndex, setEditingMediaIndex] = useState(null);

  const [alertMessage, setAlertMessage] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const [data, setData] = useState([]);
  const [options, setOptions] = useState({
    specs: [],
    type: [],
    material: [],
  });
  const [inclusions, setInclusions] = useState([
    {
      id: 1,
      specs: "",
      type: "",
      material: "",
      rentedConsumable: "",
      moq: "",
      customQuantity: "",
      matchedRow: null,
      price: 0,
      previewText: "",
    },
  ]);
  const [executionPrice, setExecutionPrice] = useState(0);
  const [advancePercent, setAdvancePercent] = useState(0);
  const [nextId, setNextId] = useState(2);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [mode, setMode] = useState("Option1");
  const [option2Text, setOption2Text] = useState("");

  useEffect(() => {
    fetchOptions(BASE_URL + PRODUCT_MEAL_TYPE, setMealProductTypes, {
      per_page: "500",
    });
  }, []);

  const fetchOptions = async (url, setter, body) => {
    try {
      const response = await axios.post(url, body, {
        headers: { "Content-Type": "application/json" },
      });
      const resData = response.data;
      if (resData?.error === false && resData?.data) {
        setter(
          url.includes("admin_meals_list")
            ? resData.data.meal || []
            : resData.data.configuration || []
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleToggleDesignType = (item) => {
    setDesignType((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = Math.max(
      0,
      10 - (mediaFiles.length + cropQueue.length)
    );
    const allowedFiles = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      showAlert("Maximum 10 media files (images/videos) allowed.", "warning");
    }

    const directVideos = [];
    const imagesToCrop = [];

    allowedFiles.forEach((file) => {
      const isVideo =
        file.type.startsWith("video/") ||
        /\.(mp4|webm|ogg|mov|mkv|avi)$/i.test(file.name);

      if (isVideo) {
        directVideos.push({
          file,
          preview: URL.createObjectURL(file),
          isVideo: true,
        });
      } else {
        imagesToCrop.push({
          originalFile: file,
          originalUrl: URL.createObjectURL(file),
        });
      }
    });

    if (directVideos.length > 0) {
      setMediaFiles((prev) => [...prev, ...directVideos]);
    }

    if (imagesToCrop.length > 0) {
      setEditingMediaIndex(null);
      setCropQueue((prev) => {
        const updated = [...prev, ...imagesToCrop];
        setCropTotalCount(updated.length);
        return updated;
      });
    }

    e.target.value = "";
  };

  const handleOpenRecrop = (index) => {
    const target = mediaFiles[index];
    if (!target || target.isVideo) return;
    setEditingMediaIndex(index);
  };

  const handleConfirmCrop = (croppedFile, croppedPreviewUrl) => {
    if (editingMediaIndex !== null) {
      setMediaFiles((prev) =>
        prev.map((item, idx) => {
          if (idx !== editingMediaIndex) return item;
          if (item.preview) URL.revokeObjectURL(item.preview);
          return {
            ...item,
            file: croppedFile,
            preview: croppedPreviewUrl,
          };
        })
      );
      setEditingMediaIndex(null);
      return;
    }

    const currentQueueItem = cropQueue[0];
    if (currentQueueItem) {
      setMediaFiles((prev) => [
        ...prev,
        {
          file: croppedFile,
          preview: croppedPreviewUrl,
          originalUrl: currentQueueItem.originalUrl,
          originalName: currentQueueItem.originalFile.name,
          isVideo: false,
        },
      ]);
      setCropQueue((prev) => prev.slice(1));
    }
  };

  const handleCancelCrop = () => {
    if (editingMediaIndex !== null) {
      setEditingMediaIndex(null);
      return;
    }

    const currentQueueItem = cropQueue[0];
    if (currentQueueItem?.originalUrl) {
      URL.revokeObjectURL(currentQueueItem.originalUrl);
    }
    setCropQueue((prev) => prev.slice(1));
  };

  const removeMedia = (index) => {
    setMediaFiles((prev) => {
      const target = prev[index];
      if (target?.preview) URL.revokeObjectURL(target.preview);
      if (target?.originalUrl) URL.revokeObjectURL(target.originalUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const resetForm = () => {
    mediaFiles.forEach((m) => {
      if (m.preview) URL.revokeObjectURL(m.preview);
      if (m.originalUrl) URL.revokeObjectURL(m.originalUrl);
    });
    cropQueue.forEach((q) => {
      if (q.originalUrl) URL.revokeObjectURL(q.originalUrl);
    });
    setProductName("");
    setProductRate("");
    setDescription("");
    setSelectedMealTypes([]);
    setDesignType(getDefaultDesignType());
    setDesignSearch("");
    setMediaFiles([]);
    setCropQueue([]);
    setEditingMediaIndex(null);
    setExecutionPrice(0);
    setAdvancePercent(0);
    setOption2Text("");
    setInclusions([
      {
        id: 1,
        specs: "",
        type: "",
        material: "",
        rentedConsumable: "",
        moq: "",
        customQuantity: "",
        matchedRow: null,
        price: 0,
        previewText: "",
      },
    ]);
    setNextId(2);
  };

  const showAlert = (message, type = "info") => {
    setAlertMessage({ show: true, message, type });
  };

  const handleCloseAlert = () => {
    setAlertMessage((prev) => ({ ...prev, show: false }));
  };

  const handleSubmitProduct = async () => {
    try {
      if (!productName.trim() || !productRate) {
        showAlert("Product name and rate are required", "error");
        return;
      }

      if (mediaFiles.length === 0) {
        showAlert("Please upload at least one product image or video", "error");
        return;
      }

      if (advancePercent >= 100) {
        showAlert("Advance % cannot be 100% or more", "error");
        return;
      }

      setSubmitting(true);

      const customerPrice =
        (totalPrice + executionPrice) / (1 - (advancePercent || 0) / 100);
      const advanceAmountHora = customerPrice * ((advancePercent || 0) / 100);

      const formatText = (text = "") =>
        text
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map(
            (line) => `<div>${line.startsWith("-") ? line : `- ${line}`}</div>`
          )
          .join("");

      const isOption1 = mode === "Option1";
      const formData = new FormData();

      mediaFiles.forEach((item) => {
        formData.append("featured_images", item.file);
      });

      formData.append("name", productName);
      formData.append("dish_rate", productRate || 0);
      formData.append("description", "");
      formData.append("status", "1");

      formData.append(
        "cuisineId",
        JSON.stringify(["65a2c9d3513d9389d34e2ec9"])
      );
      formData.append("mealId", JSON.stringify(selectedMealTypes || []));
      formData.append("designType", JSON.stringify(designType));
      formData.append("serving_dish", JSON.stringify([]));
      formData.append("special_appliance_id", JSON.stringify([]));
      formData.append("general_appliance_id", JSON.stringify([]));
      formData.append("categoryIds", JSON.stringify([]));
      formData.append("catId", JSON.stringify([]));
      formData.append("per_plate_qty", JSON.stringify({ qty: "", unit: "" }));

      formData.append(
        "ingredientUsed",
        JSON.stringify([
          {
            _id: "641539dbbafd4ec2e102bc91",
            name: "Ajinomoto",
            image: "attachment78.png",
            unit: "",
            qty: "",
          },
        ])
      );

      formData.append("is_dish", "1");
      formData.append("dish_allow", "true");
      formData.append("is_preparation", "true");
      formData.append("is_gas", "true");
      formData.append("cooking_min", "10");
      formData.append("preparation_min", "10");

      formData.append(
        "preperationtext",
        isOption1 ? formatText(summaryText) : formatText(option2Text)
      );

      // OPTION 1 EXTRA FIELDS
      if (isOption1) {
        formData.append("vendorMaterialPrice", totalPrice || 0);
        formData.append("executionPrice", executionPrice || 0);
        formData.append("horaAdvance", advanceAmountHora || 0);
        formData.append("inclusionVariables", JSON.stringify(inclusions || []));
      }

      const response = await axios.post(
        BASE_URL + ADD_DECORATION_PRODUCT,
        formData
      );
      const resData = response.data;

      if (resData?.error === false) {
        showAlert(
          resData?.message || "Product successfully created!",
          "success"
        );
        resetForm();
      } else {
        showAlert(
          "Failed to create product: " + (resData?.message || "Unknown error"),
          "error"
        );
      }
    } catch (error) {
      console.error("Submit error:", error);
      showAlert(
        error?.response?.data?.message || "Error submitting product",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchMaterialFilterData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}${GET_MATERIAL_FILTER_DATA}`);
        const result = res.data;

        if (
          result?.error === false ||
          result?.success === false ||
          result?.data
        ) {
          const apiData = result.data || {};
          const specsData = Array.isArray(apiData.specs) ? apiData.specs : [];
          const typeData = Array.isArray(apiData.type) ? apiData.type : [];
          const materialData = Array.isArray(apiData.material)
            ? apiData.material
            : [];

          setData(specsData);
          setOptions({
            specs: specsData.map((item) => item.value).filter(Boolean),
            type: typeData.map((item) => item.value).filter(Boolean),
            material: materialData.map((item) => item.value).filter(Boolean),
          });
        }
      } catch (err) {
        console.error("Error fetching material filter data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialFilterData();
  }, []);

  const buildPreviewText = (item) => {
    let previewText = `${item.specs || "-"} ${item.type || "-"} ${
      item.material || "-"
    }`;

    if (item.rentedConsumable === "Rented") {
      previewText += ` ${item.moq || "-"}`;
    } else if (item.rentedConsumable === "Consumable") {
      previewText += ` ${item.customQuantity || item.moq || 1}`;
    }

    return previewText;
  };

  const extractNumber = (value) => {
    return parseFloat(String(value || "").replace(/[^\d.]/g, "")) || 0;
  };

  const getCalculatedPrice = (matchedRow, rentedConsumable, customQuantity) => {
    if (!matchedRow) return 0;

    const vendorPrice = parseFloat(matchedRow.vendorMaterialPrice) || 0;

    if (rentedConsumable === "Consumable") {
      const qty = parseFloat(customQuantity) || 0;
      const moqNumber = extractNumber(matchedRow.minimumOrderQuantity) || 1;
      return (qty * vendorPrice) / moqNumber;
    }

    return vendorPrice;
  };

  const handleSelectChange = (id, field, value) => {
    setInclusions((prev) =>
      prev.map((inc) => {
        if (inc.id !== id) return inc;

        let updated = {
          ...inc,
          [field]: value,
        };

        if (field === "specs") {
          const firstMatch = data.find((row) => row.value === value);

          if (firstMatch) {
            updated = {
              ...updated,
              specs: firstMatch.value || "",
              type: firstMatch.type || "",
              material: firstMatch.material || "",
              rentedConsumable: firstMatch.materialCategory || "",
              moq: firstMatch.minimumOrderQuantity || "",
              matchedRow: firstMatch,
            };

            const defaultQty =
              updated.customQuantity ||
              extractNumber(firstMatch.minimumOrderQuantity) ||
              1;

            updated.customQuantity =
              firstMatch.materialCategory === "Consumable"
                ? updated.customQuantity || defaultQty
                : "";

            updated.price = getCalculatedPrice(
              firstMatch,
              firstMatch.materialCategory,
              updated.customQuantity
            );

            updated.previewText = buildPreviewText(updated);
            return updated;
          } else {
            updated = {
              ...updated,
              type: "",
              material: "",
              rentedConsumable: "",
              moq: "",
              customQuantity: "",
              matchedRow: null,
              price: 0,
            };
            updated.previewText = buildPreviewText(updated);
            return updated;
          }
        }

        if (field === "type") {
          const firstMatch = data.find(
            (row) => row.value === updated.specs && row.type === value
          );

          if (firstMatch) {
            updated = {
              ...updated,
              type: firstMatch.type || "",
              material: firstMatch.material || "",
              rentedConsumable: firstMatch.materialCategory || "",
              moq: firstMatch.minimumOrderQuantity || "",
              matchedRow: firstMatch,
            };

            if (firstMatch.materialCategory !== "Consumable") {
              updated.customQuantity = "";
            }

            updated.price = getCalculatedPrice(
              firstMatch,
              firstMatch.materialCategory,
              updated.customQuantity
            );
          } else {
            updated = {
              ...updated,
              type: value,
              material: "",
              rentedConsumable: "",
              moq: "",
              customQuantity: "",
              matchedRow: null,
              price: 0,
            };
          }

          updated.previewText = buildPreviewText(updated);
          return updated;
        }

        if (field === "material") {
          const exactMatch = data.find(
            (row) =>
              row.value === updated.specs &&
              row.type === updated.type &&
              row.material === value
          );

          if (exactMatch) {
            updated = {
              ...updated,
              material: exactMatch.material || "",
              rentedConsumable: exactMatch.materialCategory || "",
              moq: exactMatch.minimumOrderQuantity || "",
              matchedRow: exactMatch,
            };

            if (exactMatch.materialCategory !== "Consumable") {
              updated.customQuantity = "";
            }

            updated.price = getCalculatedPrice(
              exactMatch,
              exactMatch.materialCategory,
              updated.customQuantity
            );
          } else {
            updated = {
              ...updated,
              material: value,
              rentedConsumable: "",
              moq: "",
              customQuantity: "",
              matchedRow: null,
              price: 0,
            };
          }

          updated.previewText = buildPreviewText(updated);
          return updated;
        }

        return updated;
      })
    );
  };

  const handleCustomQuantityChange = (id, value) => {
    setInclusions((prev) =>
      prev.map((inc) => {
        if (inc.id !== id) return inc;

        const updated = {
          ...inc,
          customQuantity: value,
        };

        updated.price = getCalculatedPrice(
          updated.matchedRow,
          updated.rentedConsumable,
          value
        );

        updated.previewText = buildPreviewText(updated);
        return updated;
      })
    );
  };

  const handlePriceChange = (id, value) => {
    const num = parseFloat(value) || 0;
    setInclusions((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          let previewText = `${i.specs || "-"} ${i.type || "-"} ${
            i.material || "-"
          }`;
          if (i.rentedConsumable === "Rented") {
            previewText += ` ${i.moq || "-"}`;
          } else if (i.rentedConsumable === "Consumable") {
            previewText += ` ${i.customQuantity || 1} PCS`;
          }
          return { ...i, price: num, previewText };
        }
        return i;
      })
    );
  };

  const handlePreviewChange = (id, value) => {
    setInclusions((prev) =>
      prev.map((i) => (i.id === id ? { ...i, previewText: value } : i))
    );
  };

  const handleAddInclusion = () => {
    setInclusions((prev) => [
      ...prev,
      {
        id: nextId,
        specs: "",
        type: "",
        material: "",
        rentedConsumable: "",
        moq: "",
        customQuantity: "",
        matchedRow: null,
        price: 0,
        previewText: "",
      },
    ]);
    setNextId((prev) => prev + 1);
  };

  const handleRemoveInclusion = (id) => {
    if (inclusions.length > 1) {
      setInclusions((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const getFilteredTypes = (specs) => {
    if (!specs) return options.type;
    return [
      ...new Set(
        data
          .filter((row) => row.value === specs)
          .map((row) => row.type)
          .filter(Boolean)
      ),
    ];
  };

  const getFilteredMaterials = (specs, type) => {
    let filtered = data;
    if (specs) filtered = filtered.filter((row) => row.value === specs);
    if (type) filtered = filtered.filter((row) => row.type === type);
    return [...new Set(filtered.map((row) => row.material).filter(Boolean))];
  };

  const decorationCategories = mealProductTypes.filter(
    (type) =>
      Array.isArray(type.configurationId) &&
      type.configurationId.some((config) => config.name === "Decoration")
  );

  const selectedCategoryObjects = decorationCategories.filter((cat) =>
    selectedMealTypes.includes(cat._id)
  );

  const selectedDesignList = DESIGN_TYPE_OPTIONS.filter((opt) =>
    Boolean(designType[opt])
  );
  const filteredDesignOptions = DESIGN_TYPE_OPTIONS.filter((opt) =>
    opt.toLowerCase().includes(designSearch.toLowerCase())
  );

  const totalPrice = inclusions.reduce((sum, i) => sum + i.price, 0);
  const summaryText = inclusions.map((i) => i.previewText).join("\n");

  const calculatedCustomerPrice =
    advancePercent >= 100
      ? null
      : (totalPrice + executionPrice) / (1 - advancePercent / 100);

  const calculatedAdvanceAmount =
    calculatedCustomerPrice === null
      ? null
      : calculatedCustomerPrice * (advancePercent / 100);

  // Active Crop Target
  const isRecropping =
    editingMediaIndex !== null && Boolean(mediaFiles[editingMediaIndex]);
  const activeCropSrc = isRecropping
    ? mediaFiles[editingMediaIndex].originalUrl ||
      mediaFiles[editingMediaIndex].preview
    : cropQueue[0]?.originalUrl || null;
  const activeCropFileName = isRecropping
    ? mediaFiles[editingMediaIndex].originalName ||
      mediaFiles[editingMediaIndex].file.name
    : cropQueue[0]?.originalFile?.name || "image.jpg";
  const activeQueueLabel = isRecropping
    ? "Re-cropping Image"
    : cropTotalCount > 1
    ? `Image ${cropTotalCount - cropQueue.length + 1} of ${cropTotalCount}`
    : null;

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: BRAND_PRIMARY }} />
        <Typography variant="body2" color="text.secondary">
          Loading decoration catalog & material configurations...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 1320,
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        py: 4,
      }}
    >
      <ImageCropModal
        open={Boolean(activeCropSrc)}
        imageSrc={activeCropSrc}
        fileName={activeCropFileName}
        queueProgress={activeQueueLabel}
        onCancel={handleCancelCrop}
        onConfirm={handleConfirmCrop}
      />

      <Snackbar
        open={alertMessage.show}
        autoHideDuration={3500}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alertMessage.type || "info"}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {alertMessage.message}
        </Alert>
      </Snackbar>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} color="#1e1420">
            Add Decoration Product
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure product details, crop & upload images/videos, and build material inclusions.
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={3}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: 3,
            border: "1px solid #e6dce4",
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={700}
            color={BRAND_PRIMARY}
            sx={{ mb: 2.5 }}
          >
            1. Basic Product Details
          </Typography>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                required
                label="Product Name"
                placeholder="e.g. Pastel Ring Birthday Decor"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                size="medium"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Autocomplete
                multiple
                options={decorationCategories}
                disableCloseOnSelect
                getOptionLabel={(option) => option.name || ""}
                value={selectedCategoryObjects}
                onChange={(_, newValue) => {
                  setSelectedMealTypes(newValue.map((item) => item._id));
                }}
                renderOption={(props, option, { selected }) => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { key, ...optionProps } = props;
                  return (
                    <li key={option._id} {...optionProps}>
                      <Checkbox
                        checked={selected}
                        sx={{
                          mr: 1,
                          color: BRAND_PRIMARY,
                          "&.Mui-checked": { color: BRAND_PRIMARY },
                        }}
                      />
                      {option.name}
                    </li>
                  );
                }}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={option._id}
                        label={option.name}
                        size="small"
                        sx={{
                          bgcolor: BRAND_LIGHT_BG,
                          color: BRAND_PRIMARY,
                          border: `1px solid ${BRAND_PRIMARY}40`,
                          fontWeight: 500,
                        }}
                        {...tagProps}
                      />
                    );
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Product Category Type *"
                    placeholder="Select categories"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                required
                type="number"
                label="Product Rate"
                placeholder="e.g. 4999"
                value={productRate}
                onChange={(e) => setProductRate(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <RupeeIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: 3,
            border: "1px solid #e6dce4",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                color={BRAND_PRIMARY}
              >
                2. Product Media (Images & Videos) *
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Images open in a fixed 480×470 cropper before saving. You can also re-crop any image before submitting.
              </Typography>
            </Box>
            <Chip
              label={`${mediaFiles.length} / 10 Selected`}
              size="small"
              sx={{
                bgcolor: BRAND_LIGHT_BG,
                color: BRAND_PRIMARY,
                fontWeight: 600,
              }}
            />
          </Stack>

          <Box
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: `2px dashed ${BRAND_PRIMARY}66`,
              borderRadius: 2.5,
              bgcolor: BRAND_LIGHT_BG,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: BRAND_PRIMARY,
                bgcolor: "#f7eaf5",
              },
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 40, color: BRAND_PRIMARY, mb: 1 }} />
            <Typography variant="body1" fontWeight={600} color="#2b1329">
              Click to Upload Product Images or Videos
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Images will open for 480×470 cropping • Videos upload directly
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              style={{ display: "none" }}
              onChange={handleMediaUpload}
            />
          </Box>

          {/* Media Previews Grid */}
          {mediaFiles.length > 0 && (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {mediaFiles.map((media, index) => (
                <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={index}>
                  <Card
                    variant="outlined"
                    sx={{
                      position: "relative",
                      borderRadius: 2,
                      overflow: "hidden",
                      borderColor: "#dfd2dc",
                    }}
                  >
                    <Box
                      sx={{
                        height: 175,
                        bgcolor: "#141414",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      {media.isVideo ? (
                        <video
                          src={media.preview}
                          muted
                          loop
                          playsInline
                          onMouseEnter={(e) => e.target.play()}
                          onMouseLeave={(e) => e.target.pause()}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <img
                          src={media.preview}
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )}

                      <Chip
                        icon={
                          media.isVideo ? (
                            <VideocamIcon
                              sx={{ fontSize: 14, color: "#fff !important" }}
                            />
                          ) : (
                            <ImageIcon
                              sx={{ fontSize: 14, color: "#fff !important" }}
                            />
                          )
                        }
                        label={media.isVideo ? "VIDEO" : "CROPPED"}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          height: 22,
                          fontSize: "0.66rem",
                          fontWeight: 700,
                          bgcolor: media.isVideo
                            ? "rgba(146, 66, 134, 0.92)"
                            : "rgba(46, 125, 50, 0.9)",
                          color: "#fff",
                        }}
                      />

                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                        }}
                      >
                        {!media.isVideo && (
                          <Tooltip title="Re-crop image">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenRecrop(index);
                              }}
                              sx={{
                                bgcolor: "rgba(255,255,255,0.92)",
                                color: BRAND_PRIMARY,
                                "&:hover": { bgcolor: "#fff" },
                              }}
                            >
                              <CropIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        <Tooltip title="Remove file">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeMedia(index);
                            }}
                            sx={{
                              bgcolor: "rgba(255,255,255,0.92)",
                              color: "#d32f2f",
                              "&:hover": { bgcolor: "#fff" },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>

                    <Box sx={{ px: 1.2, py: 0.8, bgcolor: "#fff" }}>
                      <Typography
                        variant="caption"
                        noWrap
                        display="block"
                        color="text.secondary"
                      >
                        {media.file.name}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: 3,
            border: "1px solid #e6dce4",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.5}
            sx={{ mb: 2 }}
          >
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  color={BRAND_PRIMARY}
                >
                  3. Design Type Classification
                </Typography>
                <Chip
                  label={`${selectedDesignList.length} Selected`}
                  size="small"
                  sx={{
                    bgcolor:
                      selectedDesignList.length > 0 ? BRAND_PRIMARY : "#eee",
                    color: selectedDesignList.length > 0 ? "#fff" : "#666",
                    fontWeight: 600,
                    height: 22,
                  }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Select all design structures/styles applicable to this decoration
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                placeholder="Filter design types..."
                value={designSearch}
                onChange={(e) => setDesignSearch(e.target.value)}
                sx={{ width: { xs: "100%", sm: 220 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              {selectedDesignList.length > 0 && (
                <Button
                  size="small"
                  color="error"
                  onClick={() => setDesignType(getDefaultDesignType())}
                  sx={{ textTransform: "none", whiteSpace: "nowrap" }}
                >
                  Clear All
                </Button>
              )}
            </Stack>
          </Stack>

          {selectedDesignList.length > 0 && (
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: 2,
                bgcolor: BRAND_LIGHT_BG,
                border: `1px solid ${BRAND_PRIMARY}33`,
              }}
            >
              <Typography
                variant="caption"
                fontWeight={600}
                color={BRAND_PRIMARY}
                display="block"
                sx={{ mb: 1 }}
              >
                Active Design Types:
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.8}>
                {selectedDesignList.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    size="small"
                    onDelete={() => handleToggleDesignType(item)}
                    sx={{
                      bgcolor: "#fff",
                      color: BRAND_PRIMARY,
                      fontWeight: 600,
                      border: `1px solid ${BRAND_PRIMARY}66`,
                      "& .MuiChip-deleteIcon": {
                        color: BRAND_PRIMARY,
                        "&:hover": { color: BRAND_DARK },
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          <Grid container spacing={1.2}>
            {filteredDesignOptions.map((item) => {
              const isChecked = Boolean(designType[item]);
              return (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item}>
                  <Box
                    onClick={() => handleToggleDesignType(item)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      px: 1.2,
                      py: 0.6,
                      borderRadius: 1.8,
                      cursor: "pointer",
                      userSelect: "none",
                      border: "1px solid",
                      borderColor: isChecked ? BRAND_PRIMARY : "#e2d7e0",
                      bgcolor: isChecked ? BRAND_LIGHT_BG : "#ffffff",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        borderColor: BRAND_PRIMARY,
                        bgcolor: BRAND_LIGHT_BG,
                      },
                    }}
                  >
                    <Checkbox
                      checked={isChecked}
                      size="small"
                      sx={{
                        p: 0.5,
                        mr: 0.8,
                        color: "#9e8c9b",
                        "&.Mui-checked": {
                          color: BRAND_PRIMARY,
                        },
                      }}
                    />
                    <Typography
                      variant="body2"
                      fontWeight={isChecked ? 600 : 400}
                      color={isChecked ? "#2b1329" : "#444"}
                      noWrap
                      title={item}
                    >
                      {item}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: 3,
            border: "1px solid #e6dce4",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                color={BRAND_PRIMARY}
              >
                4. Inclusion & Pricing Configuration
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Choose between structured material calculation (Option 1) or manual description (Option 2).
              </Typography>
            </Box>

            <FormControl component="fieldset">
              <RadioGroup
                row
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <FormControlLabel
                  value="Option1"
                  control={
                    <Radio
                      sx={{
                        color: BRAND_PRIMARY,
                        "&.Mui-checked": { color: BRAND_PRIMARY },
                      }}
                    />
                  }
                  label="Option 1 (Material Builder)"
                />
                <FormControlLabel
                  value="Option2"
                  control={
                    <Radio
                      sx={{
                        color: BRAND_PRIMARY,
                        "&.Mui-checked": { color: BRAND_PRIMARY },
                      }}
                    />
                  }
                  label="Option 2 (Manual Text)"
                />
              </RadioGroup>
            </FormControl>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {mode === "Option1" ? (
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography variant="body2" fontWeight={600}>
                  Material Inclusions ({inclusions.length})
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddInclusion}
                  sx={{
                    borderColor: BRAND_PRIMARY,
                    color: BRAND_PRIMARY,
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: BRAND_DARK,
                      bgcolor: BRAND_LIGHT_BG,
                    },
                  }}
                >
                  Add Inclusion Row
                </Button>
              </Stack>

              <Stack spacing={2}>
                {inclusions.map((inc, idx) => {
                  const filteredTypes = getFilteredTypes(inc.specs);
                  const filteredMaterials = getFilteredMaterials(
                    inc.specs,
                    inc.type
                  );

                  return (
                    <Card
                      key={inc.id}
                      variant="outlined"
                      sx={{
                        borderRadius: 2.5,
                        borderColor: inc.matchedRow ? "#c8e6c9" : "#e2d7e0",
                        bgcolor: "#fafafa",
                      }}
                    >
                      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mb: 1.5 }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="caption" fontWeight={700}>
                              Item #{idx + 1}
                            </Typography>
                            <Chip
                              size="small"
                              icon={
                                inc.matchedRow ? (
                                  <CheckCircleIcon />
                                ) : (
                                  <CancelIcon />
                                )
                              }
                              label={
                                inc.matchedRow ? "Matched" : "Not Matched"
                              }
                              color={inc.matchedRow ? "success" : "error"}
                              variant="outlined"
                              sx={{ height: 22, fontSize: "0.72rem" }}
                            />
                          </Stack>

                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            disabled={inclusions.length === 1}
                            onClick={() => handleRemoveInclusion(inc.id)}
                            sx={{ textTransform: "none" }}
                          >
                            Remove
                          </Button>
                        </Stack>

                        <Grid container spacing={1.5}>
                          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <FormControl
                              fullWidth
                              size="small"
                              sx={{ bgcolor: "#fff" }}
                            >
                              <InputLabel>Specs</InputLabel>
                              <Select
                                label="Specs"
                                value={inc.specs}
                                onChange={(e) =>
                                  handleSelectChange(
                                    inc.id,
                                    "specs",
                                    e.target.value
                                  )
                                }
                              >
                                <MenuItem value="">
                                  <em>Select Specs</em>
                                </MenuItem>
                                {options.specs.map((o, i) => (
                                  <MenuItem key={i} value={o}>
                                    {o}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <FormControl
                              fullWidth
                              size="small"
                              sx={{ bgcolor: "#fff" }}
                            >
                              <InputLabel>Type</InputLabel>
                              <Select
                                label="Type"
                                value={inc.type}
                                onChange={(e) =>
                                  handleSelectChange(
                                    inc.id,
                                    "type",
                                    e.target.value
                                  )
                                }
                              >
                                <MenuItem value="">
                                  <em>Select Type</em>
                                </MenuItem>
                                {filteredTypes?.map((o, i) => (
                                  <MenuItem key={i} value={o}>
                                    {o}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <FormControl
                              fullWidth
                              size="small"
                              sx={{ bgcolor: "#fff" }}
                            >
                              <InputLabel>Material</InputLabel>
                              <Select
                                label="Material"
                                value={inc.material}
                                onChange={(e) =>
                                  handleSelectChange(
                                    inc.id,
                                    "material",
                                    e.target.value
                                  )
                                }
                              >
                                <MenuItem value="">
                                  <em>Select Material</em>
                                </MenuItem>
                                {filteredMaterials?.map((o, i) => (
                                  <MenuItem key={i} value={o}>
                                    {o}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid size={{ xs: 6, sm: 4, md: 1.6 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Category"
                              value={inc.rentedConsumable}
                              InputProps={{ readOnly: true }}
                              sx={{ bgcolor: "#f0f0f0" }}
                            />
                          </Grid>

                          <Grid size={{ xs: 6, sm: 4, md: 1.2 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="MOQ"
                              value={inc.moq}
                              InputProps={{ readOnly: true }}
                              sx={{ bgcolor: "#f0f0f0" }}
                            />
                          </Grid>

                          {inc.rentedConsumable === "Consumable" && (
                            <Grid size={{ xs: 6, sm: 4, md: 1 }}>
                              <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Qty"
                                value={inc.customQuantity}
                                onChange={(e) =>
                                  handleCustomQuantityChange(
                                    inc.id,
                                    e.target.value
                                  )
                                }
                                sx={{ bgcolor: "#fff" }}
                              />
                            </Grid>
                          )}

                          <Grid
                            size={{
                              xs: 6,
                              sm: 4,
                              md:
                                inc.rentedConsumable === "Consumable" ? 1 : 2,
                            }}
                          >
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              label="Price (₹)"
                              value={inc.price}
                              onChange={(e) =>
                                handlePriceChange(inc.id, e.target.value)
                              }
                              sx={{ bgcolor: "#fff" }}
                            />
                          </Grid>

                          <Grid size={{ xs: 12 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Line Preview Text (Editable)"
                              value={inc.previewText}
                              onChange={(e) =>
                                handlePreviewChange(inc.id, e.target.value)
                              }
                              sx={{ bgcolor: "#fff" }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>

              <Paper
                variant="outlined"
                sx={{
                  mt: 3,
                  p: 2.5,
                  borderRadius: 2.5,
                  bgcolor: BRAND_LIGHT_BG,
                  borderColor: `${BRAND_PRIMARY}40`,
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color={BRAND_PRIMARY}
                  sx={{ mb: 2 }}
                >
                  Cost & Customer Pricing Breakdown
                </Typography>

                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                    <Typography variant="caption" color="text.secondary">
                      Vendor Material Price
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      ₹{totalPrice.toFixed(2)}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Execution Price (₹)"
                      value={executionPrice}
                      onChange={(e) =>
                        setExecutionPrice(parseFloat(e.target.value) || 0)
                      }
                      sx={{ bgcolor: "#fff" }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Advance %"
                      placeholder="e.g. 20"
                      value={advancePercent}
                      onChange={(e) =>
                        setAdvancePercent(parseFloat(e.target.value) || 0)
                      }
                      sx={{ bgcolor: "#fff" }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                    <Typography variant="caption" color="text.secondary">
                      Customer Price
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color={
                        calculatedCustomerPrice === null
                          ? "error.main"
                          : BRAND_PRIMARY
                      }
                    >
                      {calculatedCustomerPrice === null
                        ? "Invalid %"
                        : `₹${calculatedCustomerPrice.toFixed(2)}`}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                    <Typography variant="caption" color="text.secondary">
                      Advance Hora Amount
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color={
                        calculatedAdvanceAmount === null
                          ? "error.main"
                          : "success.main"
                      }
                    >
                      {calculatedAdvanceAmount === null
                        ? "Invalid %"
                        : `₹${calculatedAdvanceAmount.toFixed(2)}`}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Box sx={{ mt: 3 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <SummaryIcon fontSize="small" sx={{ color: BRAND_PRIMARY }} />
                  <Typography variant="subtitle2" fontWeight={700}>
                    Inclusion Summary (Auto-generated)
                  </Typography>
                </Stack>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  value={summaryText}
                  InputProps={{
                    readOnly: true,
                    sx: { fontFamily: "monospace", bgcolor: "#fafafa" },
                  }}
                />
              </Box>
            </Box>
          ) : (
            <Box>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <SummaryIcon fontSize="small" sx={{ color: BRAND_PRIMARY }} />
                <Typography variant="subtitle2" fontWeight={700}>
                  Product Inclusion (Each line becomes a bullet point)
                </Typography>
              </Stack>
              <TextField
                fullWidth
                multiline
                rows={7}
                value={option2Text}
                onChange={(e) => setOption2Text(e.target.value)}
                placeholder="Enter each inclusion on a new line..."
                InputProps={{
                  sx: { fontFamily: "monospace", bgcolor: "#fafafa" },
                }}
              />
            </Box>
          )}
        </Paper>

        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button
            variant="outlined"
            onClick={resetForm}
            disabled={submitting}
            sx={{
              borderColor: "#ccc",
              color: "#555",
              textTransform: "none",
              px: 3,
            }}
          >
            Reset Form
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={
              submitting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            disabled={submitting}
            onClick={handleSubmitProduct}
            sx={{
              bgcolor: BRAND_PRIMARY,
              "&:hover": { bgcolor: BRAND_DARK },
              px: 4,
              py: 1.3,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 4px 14px rgba(146, 66, 134, 0.3)",
            }}
          >
            {submitting ? "Creating Product..." : "Create Product"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default AddProductForm;