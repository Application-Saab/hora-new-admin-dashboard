"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  Divider,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  Popover,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import {
  updateVenuePackage,
  createVenuePackage,
  fetchPackageCategories,
  fetchPackageItemsByCategory,
  fetchPackageItems,
} from "@/services/venueListServices";
import { BASE_URL } from "@/utils/apiconstant";

const EditPackagePopup = ({
  isOpen,
  onClose,
  onSuccess,
  packageData,
  isCloningPackage,
}) => {
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subTitle: "",
    actualPrice: "",
    discountedPrice: "",
    maxGuests: "",
    tag: "",
    packageItems: [],
    packageAddons: [""],
  });

  const [packageImage, setPackageImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [packageCategories, setPackageCategories] = useState([]);

  // Add New Item
  const [newItemTitle, setNewItemTitle] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [itemFoodtype, setItemFoodtype] = useState("");

  // Category Tags
  const [packageCategoriesTags, setPackageCategoriesTags] = useState({});

  // UX states
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [tagAnchorEl, setTagAnchorEl] = useState(null);
  const [tagCategoryId, setTagCategoryId] = useState(null);
  const [tempTagValue, setTempTagValue] = useState("");

  // Lazy loading & category mapping
  const [itemsCache, setItemsCache] = useState({});
  const [loadingItems, setLoadingItems] = useState(false);
  const [displayedItems, setDisplayedItems] = useState([]);
  const [itemCategoryMap, setItemCategoryMap] = useState({});

  // Helper to safely extract category ID from any structure (flat, populated, nested)
  const extractCategoryId = (item) => {
    if (!item) return null;
    if (typeof item.categoryId === "object" && item.categoryId?._id) return item.categoryId._id;
    if (typeof item.categoryId === "string") return item.categoryId;

    const targetItem = item.itemId || item;
    if (Array.isArray(targetItem?.categoryIds) && targetItem.categoryIds.length > 0) {
      const first = targetItem.categoryIds[0];
      return typeof first === "object" ? first._id : first;
    }
    if (typeof targetItem?.category === "object" && targetItem.category?._id) return targetItem.category._id;
    if (typeof targetItem?.category === "string") return targetItem.category;

    return null;
  };

  // Helper to safely extract item ID from flat string or populated object
  const extractItemId = (item) => {
    if (!item) return null;
    if (typeof item === "string") return item;
    if (item.itemId) {
      return typeof item.itemId === "object" ? item.itemId?._id : item.itemId;
    }
    return item._id || null;
  };

  // ========== RESET + PREFILL ==========
  useEffect(() => {
    if (isOpen) {
      fetchPackageCategories(setPackageCategories);

      fetchPackageItems(
        (allMasterItems) => {
          const mapping = {};
          (allMasterItems || []).forEach((item) => {
            const catId = extractCategoryId(item);
            if (catId && item._id) {
              mapping[item._id] = catId;
            }
          });
          setItemCategoryMap((prev) => ({ ...prev, ...mapping }));
        },
        () => {}
      );

      // Reset form defaults
      setFormData({
        title: "",
        subTitle: "",
        actualPrice: "",
        discountedPrice: "",
        maxGuests: "",
        tag: "",
        packageItems: [],
        packageAddons: [""],
      });
      setPackageImage(null);
      setImagePreview("");
      setPackageCategoriesTags({});
      setNewItemTitle("");
      setSelectedCategories([]);
      setItemFoodtype("");
      setSelectedCategoryId("");
      setSelectedCategoryName("");
      setCategorySearch("");
      setItemSearch("");
      setItemsCache({});
      setDisplayedItems([]);

      // Prefill if packageData exists
      if (packageData) {
        const itemIds = [];
        const directMap = {};

        (packageData.packageItems || []).forEach((item) => {
          const rawItemId = extractItemId(item);
          const rawCatId = extractCategoryId(item);

          if (rawItemId) {
            itemIds.push(rawItemId);
            if (rawCatId) {
              directMap[rawItemId] = rawCatId;
            }
          }
        });

        if (Object.keys(directMap).length > 0) {
          setItemCategoryMap((prev) => ({ ...prev, ...directMap }));
        }

        setFormData({
          title: packageData.title || "",
          subTitle: packageData.subTitle || "",
          actualPrice: packageData.actualPrice ?? "",
          discountedPrice: packageData.discountedPrice ?? "",
          maxGuests: packageData.maxGuests ?? "",
          tag: packageData.tag || "",
          packageItems: itemIds,
          packageAddons: packageData.packageAddons?.length
            ? packageData.packageAddons
            : [""],
        });

        setImagePreview(packageData.packageImageUrl || "");
        setPackageCategoriesTags(packageData.packageCategoriesTags || {});
      }
    }
  }, [isOpen, packageData]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // ========== CATEGORY COUNTS & AUTO-SORTING ==========
  const categorySelectedCounts = useMemo(() => {
    const counts = {};
    const selectedItemSet = new Set(formData.packageItems);

    selectedItemSet.forEach((itemId) => {
      const catId = itemCategoryMap[itemId];
      if (catId) {
        counts[catId] = (counts[catId] || 0) + 1;
      }
    });

    return counts;
  }, [formData.packageItems, itemCategoryMap]);

  const sortedAndFilteredCategories = useMemo(() => {
    let list = [...packageCategories];

    if (categorySearch.trim()) {
      const q = categorySearch.toLowerCase().trim();
      list = list.filter((cat) => cat.title?.toLowerCase().includes(q));
    }

    return list.sort((a, b) => {
      const countA = categorySelectedCounts[a._id] || 0;
      const countB = categorySelectedCounts[b._id] || 0;

      const hasA = countA > 0 ? 1 : 0;
      const hasB = countB > 0 ? 1 : 0;

      if (hasB !== hasA) {
        return hasB - hasA;
      }
      return countB - countA;
    });
  }, [packageCategories, categorySearch, categorySelectedCounts]);

  // ========== LOAD ITEMS ==========
  const loadItemsForCategory = useCallback(
    async (categoryId, search = "", force = false) => {
      if (!categoryId) {
        setDisplayedItems([]);
        return;
      }

      if (!force && !search && itemsCache[categoryId]) {
        setDisplayedItems(itemsCache[categoryId]);
        return;
      }

      setLoadingItems(true);
      try {
        const { items } = await fetchPackageItemsByCategory({
          categoryId,
          search,
          limit: 200,
        });

        if (!search) {
          setItemsCache((prev) => ({
            ...prev,
            [categoryId]: items,
          }));
        }

        setItemCategoryMap((prev) => {
          const updated = { ...prev };
          (items || []).forEach((it) => {
            updated[it._id] = categoryId;
          });
          return updated;
        });

        setDisplayedItems(items || []);
      } catch (err) {
        console.error(err);
        setDisplayedItems([]);
      } finally {
        setLoadingItems(false);
      }
    },
    [itemsCache]
  );

  const handleCategorySelect = (catId, catTitle) => {
    setSelectedCategoryId(catId);
    setSelectedCategoryName(catTitle);
    setItemSearch("");
    loadItemsForCategory(catId);
  };

  useEffect(() => {
    if (!selectedCategoryId) return;

    const timer = setTimeout(() => {
      loadItemsForCategory(selectedCategoryId, itemSearch.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [itemSearch, selectedCategoryId, loadItemsForCategory]);

  // ========== FORM ACTIONS ==========
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPackageImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemSelection = (itemId) => {
    setFormData((prev) => {
      const exists = prev.packageItems.includes(itemId);
      return {
        ...prev,
        packageItems: exists
          ? prev.packageItems.filter((id) => id !== itemId)
          : [...prev.packageItems, itemId],
      };
    });
  };

  const handleAddonChange = (index, value) => {
    const updated = [...formData.packageAddons];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, packageAddons: updated }));
  };

  const addAddonField = () => {
    setFormData((prev) => ({
      ...prev,
      packageAddons: [...prev.packageAddons, ""],
    }));
  };

  const removeAddon = (index) => {
    const updated = [...formData.packageAddons];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, packageAddons: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append("venueId", packageData.venueId);
    payload.append("title", formData.title);
    payload.append("subTitle", formData.subTitle);
    payload.append("actualPrice", formData.actualPrice);
    payload.append("discountedPrice", formData.discountedPrice);
    payload.append("maxGuests", formData.maxGuests);
    payload.append("tag", formData.tag);

    // Format & filter packageItems with categoryIds
    const formattedPackageItems = formData.packageItems
      .map((itemId) => ({
        itemId,
        categoryId: itemCategoryMap[itemId] || null,
      }))
      .filter((item) => Boolean(item.categoryId));

    payload.append("packageItems", JSON.stringify(formattedPackageItems));
    payload.append("packageAddons", JSON.stringify(formData.packageAddons));
    payload.append(
      "packageCategoriesTags",
      JSON.stringify(packageCategoriesTags)
    );

    if (packageImage) {
      payload.append("image", packageImage);
    }

    if (isCloningPackage) {
      createVenuePackage(payload, onSuccess, onClose, setLoadingUpdate);
    } else {
      updateVenuePackage(
        packageData._id,
        payload,
        onSuccess,
        onClose,
        setLoadingUpdate
      );
    }
  };

  const handleAddItem = async () => {
    if (!newItemTitle.trim() || selectedCategories.length === 0) return;

    const categoryIdToRefresh = selectedCategories[0];

    const payload = {
      title: newItemTitle,
      categoryIds: selectedCategories,
      foodType: itemFoodtype,
    };

    try {
      const res = await fetch(`${BASE_URL}/api/party-venue/package-item/create-item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      const createdItem = data.data;

      if (createdItem?._id) {
        setItemCategoryMap((prev) => ({
          ...prev,
          [createdItem._id]: categoryIdToRefresh,
        }));
      }

      setNewItemTitle("");
      setSelectedCategories([]);
      setItemFoodtype("");

      setItemsCache((prev) => {
        const copy = { ...prev };
        delete copy[categoryIdToRefresh];
        return copy;
      });

      if (selectedCategoryId === categoryIdToRefresh) {
        loadItemsForCategory(selectedCategoryId, itemSearch.trim(), true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openTagPopover = (event, categoryId) => {
    setTagAnchorEl(event.currentTarget);
    setTagCategoryId(categoryId);
    setTempTagValue(packageCategoriesTags[categoryId] || "");
  };

  const closeTagPopover = () => {
    setTagAnchorEl(null);
    setTagCategoryId(null);
    setTempTagValue("");
  };

  const saveTag = () => {
    if (tagCategoryId) {
      setPackageCategoriesTags((prev) => ({
        ...prev,
        [tagCategoryId]: tempTagValue,
      }));
    }
    closeTagPopover();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "94vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
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
          {isCloningPackage ? "Clone Package" : "Edit Package"}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{ p: 3, overflowY: "auto", flex: 1 }}
        className="slim-scrollbar"
      >
        <form id="edit-package-form" onSubmit={handleSubmit}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            Basic Information
          </Typography>

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
            <TextField
              name="title"
              label="Package Title *"
              value={formData.title}
              onChange={handleChange}
              size="small"
              required
              fullWidth
            />
            <TextField
              name="subTitle"
              label="Package Subtitle *"
              value={formData.subTitle}
              onChange={handleChange}
              size="small"
              required
              fullWidth
            />
          </Box>

          <Box
            display="grid"
            gridTemplateColumns="1fr 1fr 1fr 1fr"
            gap={2}
            mb={2}
          >
            <TextField
              name="actualPrice"
              label="Actual Price *"
              type="number"
              value={formData.actualPrice}
              onChange={handleChange}
              size="small"
              required
              fullWidth
            />
            <TextField
              name="discountedPrice"
              label="Discounted Price"
              type="number"
              value={formData.discountedPrice}
              onChange={handleChange}
              size="small"
              fullWidth
            />
            <TextField
              name="maxGuests"
              label="Min Guests"
              type="number"
              value={formData.maxGuests}
              onChange={handleChange}
              size="small"
              fullWidth
            />
            <TextField
              name="tag"
              label="Tag"
              value={formData.tag}
              onChange={handleChange}
              size="small"
              fullWidth
            />
          </Box>

          <Box mb={3}>
            <Typography variant="body2" fontWeight={500} mb={1}>
              Package Banner Image
            </Typography>
            <Button
              variant="outlined"
              component="label"
              size="small"
              sx={{ textTransform: "none", borderRadius: 2 }}
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
              <Box mt={1.5}>
                <img
                  src={imagePreview}
                  alt="preview"
                  style={{
                    width: 180,
                    height: 110,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                />
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* ========== PACKAGE ITEMS ========== */}
          <Box display="flex" alignItems="center" gap={1.5} mb={2}>
            <Typography variant="subtitle1" fontWeight={700}>
              Package Items
            </Typography>
            <Chip
              label={`${formData.packageItems.length} selected`}
              size="small"
              color={formData.packageItems.length > 0 ? "primary" : "default"}
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Box
            display="flex"
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: 2,
              overflow: "hidden",
              height: 440,
            }}
          >
            {/* LEFT: Categories */}
            <Box
              sx={{
                width: "25%",
                minWidth: 230,
                borderRight: "1px solid #e5e7eb",
                bgcolor: "#f8fafc",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ p: 1.5, borderBottom: "1px solid #e5e7eb" }}>
                <Typography
                  fontWeight={600}
                  fontSize={13}
                  color="text.secondary"
                  mb={1}
                >
                  Categories ({packageCategories.length})
                </Typography>
                <TextField
                  size="small"
                  placeholder="Search category..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      bgcolor: "white",
                      fontSize: 13,
                    },
                  }}
                />
              </Box>

              <List
                dense
                className="slim-scrollbar"
                sx={{ overflowY: "auto", flex: 1, py: 0 }}
              >
                {sortedAndFilteredCategories.length === 0 ? (
                  <Typography
                    color="text.secondary"
                    textAlign="center"
                    py={4}
                    fontSize={13}
                  >
                    No category found
                  </Typography>
                ) : (
                  sortedAndFilteredCategories.map((cat) => {
                    const selectedCount = categorySelectedCounts[cat._id] || 0;
                    return (
                      <ListItemButton
                        key={cat._id}
                        selected={selectedCategoryId === cat._id}
                        onClick={() => handleCategorySelect(cat._id, cat.title)}
                        sx={{
                          py: 1,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <ListItemText
                          primary={cat.title}
                          secondary={
                            packageCategoriesTags[cat._id]
                              ? packageCategoriesTags[cat._id]
                              : null
                          }
                          primaryTypographyProps={{
                            fontSize: 13,
                            fontWeight: selectedCount > 0 ? 600 : 400,
                            noWrap: true,
                          }}
                          secondaryTypographyProps={{
                            fontSize: 11,
                            noWrap: true,
                          }}
                        />
                        {selectedCount > 0 && (
                          <Chip
                            label={selectedCount}
                            size="small"
                            color="primary"
                            sx={{
                              height: 20,
                              fontSize: 11,
                              fontWeight: 700,
                              minWidth: 24,
                              "& .MuiChip-label": { px: 0.8 },
                            }}
                          />
                        )}
                      </ListItemButton>
                    );
                  })
                )}
              </List>
            </Box>

            {/* MIDDLE: Items */}
            <Box
              sx={{
                width: "50%",
                display: "flex",
                flexDirection: "column",
                borderRight: "1px solid #e5e7eb",
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <TextField
                  size="small"
                  placeholder={
                    selectedCategoryId
                      ? "Search in this category..."
                      : "Select a category first"
                  }
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  disabled={!selectedCategoryId}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                {selectedCategoryId && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<LocalOfferOutlinedIcon />}
                    onClick={(e) => openTagPopover(e, selectedCategoryId)}
                    sx={{
                      textTransform: "none",
                      whiteSpace: "nowrap",
                      minWidth: 140,
                    }}
                  >
                    {packageCategoriesTags[selectedCategoryId]
                      ? "Edit Category Tag"
                      : "Add Category Tag"}
                  </Button>
                )}
              </Box>

              <Box
                className="slim-scrollbar"
                sx={{
                  overflowY: "auto",
                  flex: 1,
                  p: 1,
                  position: "relative",
                }}
              >
                {!selectedCategoryId ? (
                  <Typography
                    color="text.secondary"
                    textAlign="center"
                    py={8}
                    fontSize={14}
                  >
                    ← Select a category to view items
                  </Typography>
                ) : loadingItems ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100%"
                  >
                    <CircularProgress size={28} />
                  </Box>
                ) : displayedItems.length === 0 ? (
                  <Typography
                    color="text.secondary"
                    textAlign="center"
                    py={6}
                    fontSize={14}
                  >
                    {itemSearch
                      ? "No items match your search"
                      : "No items in this category"}
                  </Typography>
                ) : (
                  displayedItems.map((item) => (
                    <FormControlLabel
                      key={item._id}
                      control={
                        <Checkbox
                          size="small"
                          checked={formData.packageItems.includes(item._id)}
                          onChange={() => handleItemSelection(item._id)}
                        />
                      }
                      label={
                        <Typography fontSize={13}>
                          {item.foodType === "veg" ? "🟢" : "🔴"} {item.title}
                        </Typography>
                      }
                      sx={{
                        display: "flex",
                        ml: 0.5,
                        borderRadius: 1,
                        width: "100%",
                        "&:hover": { bgcolor: "#f8fafc" },
                      }}
                    />
                  ))
                )}
              </Box>
            </Box>

            {/* RIGHT: Create New Item */}
            <Box
              sx={{
                width: "25%",
                minWidth: 220,
                bgcolor: "#fafafa",
                display: "flex",
                flexDirection: "column",
                p: 2,
              }}
            >
              <Typography fontWeight={700} fontSize={14} mb={2}>
                Create New Item
              </Typography>

              <TextField
                size="small"
                label="Item Title"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              />

              <Typography
                fontSize={12}
                fontWeight={500}
                mb={0.8}
                color="text.secondary"
              >
                Category
              </Typography>
              <Box
                className="slim-scrollbar"
                sx={{
                  flex: 1,
                  maxHeight: 160,
                  overflowY: "auto",
                  border: "1px solid #e5e7eb",
                  borderRadius: 1.5,
                  bgcolor: "white",
                  mb: 2,
                  px: 0.5,
                }}
              >
                {packageCategories?.map((cat) => (
                  <FormControlLabel
                    key={cat._id}
                    control={
                      <Radio
                        size="small"
                        checked={selectedCategories[0] === cat._id}
                        onChange={() => setSelectedCategories([cat._id])}
                      />
                    }
                    label={
                      <Typography fontSize={12.5} noWrap>
                        {cat.title}
                      </Typography>
                    }
                    sx={{
                      display: "flex",
                      width: "100%",
                      ml: 0.5,
                      my: 0.2,
                    }}
                  />
                ))}
              </Box>

              <Typography
                fontSize={12}
                fontWeight={500}
                mb={0.8}
                color="text.secondary"
              >
                Food Type
              </Typography>
              <RadioGroup
                row
                value={itemFoodtype}
                onChange={(e) => setItemFoodtype(e.target.value)}
                sx={{ mb: 2 }}
              >
                <FormControlLabel
                  value="veg"
                  control={<Radio size="small" />}
                  label={<Typography fontSize={13}>Veg</Typography>}
                />
                <FormControlLabel
                  value="non-veg"
                  control={<Radio size="small" />}
                  label={<Typography fontSize={13}>Non-Veg</Typography>}
                />
              </RadioGroup>

              <Button
                variant="contained"
                size="small"
                fullWidth
                onClick={handleAddItem}
                disabled={
                  !newItemTitle.trim() || selectedCategories.length === 0
                }
                sx={{ textTransform: "none", borderRadius: 2, mt: "auto" }}
              >
                Add Item
              </Button>
            </Box>
          </Box>

          <Popover
            open={Boolean(tagAnchorEl)}
            anchorEl={tagAnchorEl}
            onClose={closeTagPopover}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <Box sx={{ p: 2, width: 320 }}>
              <Typography fontWeight={600} fontSize={14} mb={2}>
                Category: {selectedCategoryName}
              </Typography>
              <TextField
                size="small"
                fullWidth
                autoFocus
                placeholder={`e.g. Select 2 ${selectedCategoryName}`}
                value={tempTagValue}
                onChange={(e) => setTempTagValue(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box display="flex" justifyContent="flex-end" gap={1}>
                <Button size="small" onClick={closeTagPopover}>
                  Cancel
                </Button>
                <Button size="small" variant="contained" onClick={saveTag}>
                  Save Tag
                </Button>
              </Box>
            </Box>
          </Popover>

          <Divider sx={{ my: 3 }} />

          {/* ========== ADDONS ========== */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={1.5}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              Addons
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={addAddonField}
              sx={{ textTransform: "none" }}
            >
              Add Addon
            </Button>
          </Box>

          {formData.packageAddons.map((addon, index) => (
            <Box
              key={index}
              display="flex"
              gap={1}
              mb={1.5}
              alignItems="center"
            >
              <TextField
                size="small"
                placeholder={`Addon ${index + 1}`}
                value={addon}
                onChange={(e) => handleAddonChange(index, e.target.value)}
                fullWidth
              />
              <IconButton
                size="small"
                color="error"
                onClick={() => removeAddon(index)}
                disabled={formData.packageAddons.length === 1}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </form>
      </DialogContent>

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
          form="edit-package-form"
          variant="contained"
          disabled={loadingUpdate}
          sx={{ textTransform: "none", borderRadius: 2, minWidth: 160 }}
        >
          {loadingUpdate ? (
            <CircularProgress size={22} color="inherit" />
          ) : isCloningPackage ? (
            "Clone Package"
          ) : (
            "Update Package"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPackagePopup;
