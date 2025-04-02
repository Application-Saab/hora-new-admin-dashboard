"use client";

import React, { useState } from "react";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  Card,
  CardMedia,
  IconButton,
  Chip,
  Divider,
  Container,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Visibility as VisibilityIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";

const decCat = [
  { id: "2", subCategory: "Birthday" },
  { id: "3", subCategory: "FirstNight" },
  { id: "4", subCategory: "Anniversary" },
  { id: "5", subCategory: "KidsBirthday" },
  { id: "6", subCategory: "BabyShower" },
  { id: "7", subCategory: "WelcomeBaby" },
  { id: "8", subCategory: "PremiumDecoration" },
  { id: "9", subCategory: "BallonBouquets" },
  { id: "10", subCategory: "Haldi-Mehandi" },
  { id: "12", subCategory: "bachelorette" },
  { id: "13", subCategory: "Proposal-Decoration" },
];

const tagMapping = {
  "65a91598ae1586258cccffd4": "Birthday",
  "65a92085ae1586258ccd04ff": "FirstNight",
  "65a92271ae1586258ccd0628": "Anniversary",
  "65aeaf5147d5cb78ba19d4d3": "KidsBirthday",
  "65a95dcb6995e7401e78c2ea": "BabyShower",
  "65a2d129513d9389d34e31d4": "WelcomeBaby",
  "65a92efbae1586258ccd0c6e": "PremiumDecoration",
  "65aeaf3747d5cb78ba19d4b6": "BallonBouquets",
  "66ad224731c3672040d8d32a": "Haldi-Mehandi",
  "66c44baf8bd9c45aaa2c42b5": "Bachelorette",
  "66c9df0922ed47b721180334": "Proposal-Decoration",
};

// Styled components
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  maxHeight: 600,
}));

const ImagePreview = styled(CardMedia)(({ theme }) => ({
  width: 100,
  height: 100,
  objectFit: "cover",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
}));

const Dropdown = () => {
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [responseData, setResponseData] = useState([]);
  const [popupData, setPopupData] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [inclusion, setInclusion] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectChange = async (event) => {
    const subCategory = event.target.value;
    setSelectedSubCategory(subCategory);
    setLoading(true);

    if (subCategory) {
      try {
        const response = await fetch(
          `https://horaservices.com:3000/api/meals/idByTag?tag=${subCategory}`
        );
        const data = await response.json();

        if (data && data.data && data.data._id) {
          await fetchSecondAPI(data.data._id);
        } else {
          setResponseData([]);
        }
      } catch (error) {
        console.error("Error fetching _id:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setResponseData([]);
      setLoading(false);
    }
  };

  const fetchSecondAPI = async (_id) => {
    try {
      const response = await fetch(
        `https://horaservices.com:3000/api/Decoration/searchByTag/${_id}`
      );
      const data = await response.json();

      if (data && data.data) {
        setResponseData(data.data);
      } else {
        setResponseData([]);
      }
    } catch (error) {
      console.error("Error fetching second API:", error);
    }
  };

  const handlePopupOpen = (item) => {
    setPopupData(item);
    setName(item.name);
    setPrice(item.price);
    setImage(null);
    setSelectedTags(item.tag || []);

    // Format inclusion text
    const inclusionText = item.inclusion
      .map((item) => item.replace(/<[^>]*>/g, "")) // Remove HTML tags
      .join("\n") // Ensure each item is on a new line
      .replace(/-\s*/g, "\n- "); // Ensure each `-` starts a new line

    setInclusion(inclusionText);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadingImage(true);

    try {
      const response = await fetch(
        "https://horaservices.com:3000/api/image_upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok && data.data) {
        // Just store the filename, not the full URL
        setImage(data.data);
      } else {
        console.error("Image upload failed:", data);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleTagChange = (tagId) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tagId)
        ? prevTags.filter((id) => id !== tagId)
        : [...prevTags, tagId]
    );
  };

  const handlePopupClose = () => {
    setPopupData(null);
    setName("");
    setPrice("");
    setImage(null);
    setSelectedTags([]);
    setInclusion("");
  };

  const handleSaveChanges = async () => {
    // Format inclusion with HTML div tags
    const formattedInclusion = [
      inclusion
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => `<div>${line}</div>`)
        .join(""),
    ];

    // Prepare the request data
    const requestData = {
      _id: popupData._id,
      name: name,
      price: price,
      featured_image: image ? image : popupData.featured_image,
      tag: selectedTags,
      inclusion: formattedInclusion,
    };

    try {
      // Log all the data to console
      console.log("Sending data:", requestData);

      // Make the API request
      const response = await fetch(
        "https://horaservices.com:3000/api/decoration/edit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      const result = await response.json();
      console.log("API response:", result);

      if (response.ok) {
        // Optionally show success message or refresh data
        if (selectedSubCategory) {
          handleSelectChange({ target: { value: selectedSubCategory } });
        }
      } else {
        console.error("API error:", result);
        // Optionally show error message
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      // Optionally show error message
    }

    setPopupData(null); // Close the popup after saving
  };

  // Add this function to filter the data
  const filteredData = responseData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tag.some((tagId) =>
        tagMapping[tagId]?.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Decoration Editing
        </Typography>

        <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
          <InputLabel id="subcategory-select-label">
            Select Subcategory
          </InputLabel>
          <Select
            labelId="subcategory-select-label"
            value={selectedSubCategory}
            onChange={handleSelectChange}
            label="Select Subcategory"
          >
            <MenuItem value="">
              <em>Select SubCategory</em>
            </MenuItem>
            {decCat.map((item) => (
              <MenuItem key={item.id} value={item.subCategory}>
                {item.subCategory}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="Search designs"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, ID or tag"
        />
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : // ) : responseData.length > 0 ? (
        filteredData.length > 0 ? (
          <StyledTableContainer component={Paper}>
            <Table stickyHeader aria-label="decoration items table">
              <TableHead>
                <TableRow>
                  {/* <TableCell>ID</TableCell> */}
                  <TableCell>Name</TableCell>
                  <TableCell>Featured Image</TableCell>
                  <TableCell>Price</TableCell>
                  {/* <TableCell>Inclusion</TableCell> */}
                  <TableCell>Tags</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item._id} hover>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      {item.featured_image ? (
                        <Box
                          component="img"
                          src={`https://horaservices.com/api/uploads/${item.featured_image}`}
                          alt={item.name}
                          sx={{ width: 100, height: "auto", borderRadius: 1 }}
                        />
                      ) : (
                        "No Image"
                      )}
                    </TableCell>
                    <TableCell>₹{item.price}</TableCell>

                    <TableCell>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {item.tag.map((tagId) => (
                          <Chip
                            key={tagId}
                            label={tagMapping[tagId] || "Unknown"}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {/* <IconButton 
                        color="primary"
                        onClick={() => handlePopupOpen(item)}
                        aria-label="view details"
                      >
                        <VisibilityIcon />
                      </IconButton> */}
                      <Button
                        color="primary"
                        onClick={() => handlePopupOpen(item)}
                        aria-label="view details"
                        startIcon={<VisibilityIcon />}
                      >
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
        ) : (
          selectedSubCategory && (
            <Box sx={{ my: 4, textAlign: "center" }}>
              <Typography variant="body1">
                No items found for this subcategory.
              </Typography>
            </Box>
          )
        )}

        <Dialog
          open={popupData !== null}
          onClose={handlePopupClose}
          fullWidth
          maxWidth="md"
        >
          {popupData && (
            <>
              <DialogTitle>
                <Typography variant="h6">
                  Editing Details for: {popupData.name}
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                >
                  ID: {popupData._id}
                </Typography>
              </DialogTitle>
              <DialogContent dividers>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Name"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />

                    <TextField
                      label="Price"
                      type="number"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      InputProps={{ startAdornment: "₹" }}
                    />

                    <Box sx={{ mt: 3, mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Image Upload
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Button
                          component="label"
                          variant="contained"
                          startIcon={<CloudUploadIcon />}
                          disabled={uploadingImage}
                        >
                          {uploadingImage ? "Uploading..." : "Upload Image"}
                          <VisuallyHiddenInput
                            type="file"
                            onChange={handleImageChange}
                          />
                        </Button>

                        {uploadingImage && <CircularProgress size={24} />}
                      </Box>

                      {image ? (
                        <Box sx={{ mt: 2 }}>
                          <Typography
                            variant="caption"
                            display="block"
                            gutterBottom
                          >
                            New Image:
                          </Typography>
                          <ImagePreview
                            component="img"
                            image={image}
                            alt="New uploaded image"
                          />
                        </Box>
                      ) : popupData.featured_image ? (
                        <Box sx={{ mt: 2 }}>
                          <Typography
                            variant="caption"
                            display="block"
                            gutterBottom
                          >
                            Current Image:
                          </Typography>
                          <ImagePreview
                            component="img"
                            image={`https://horaservices.com/api/uploads/${popupData.featured_image}`}
                            alt={popupData.name}
                          />
                        </Box>
                      ) : null}
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Tags
                    </Typography>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        maxHeight: 300,
                        width: "140%",
                        overflow: "auto",
                      }}
                    >
                      <FormGroup>
                        {Object.entries(tagMapping).map(([tagId, tagName]) => (
                          <FormControlLabel
                            key={tagId}
                            control={
                              <Checkbox
                                checked={selectedTags.includes(tagId)}
                                onChange={() => handleTagChange(tagId)}
                              />
                            }
                            label={tagName}
                          />
                        ))}
                      </FormGroup>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Inclusion (one item per line)
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={8}
                      variant="outlined"
                      value={inclusion}
                      onChange={(e) => setInclusion(e.target.value)}
                      placeholder="Enter inclusion items, one per line"
                      sx={{
                        width: "100%",
                        "& .MuiInputBase-root": { width: "400%" },
                      }}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handlePopupClose} color="inherit">
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveChanges}
                  variant="contained"
                  color="primary"
                >
                  Save Changes
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Container>
  );
};

export default Dropdown;
