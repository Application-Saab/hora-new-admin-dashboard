"use client";
import React, { useEffect, useState, useMemo } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  CircularProgress,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CreatePackagePopup from "./CreatePackagePopup";
import EditPackagePopup from "./EditPackagePopup";
import {
  fetchVenuePackages,
  togglePackageStatus,
} from "@/services/venueListServices";
import PackagePromptModal from '../../component/PackagePromptModal';

const VenuePackagesPopup = ({ isOpen, venue, onClose }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showCreatePackagePopup, setShowCreatePackagePopup] = useState(false);
  const [showEditPackagePopup, setShowEditPackagePopup] = useState(false);
  const [isCloningPackage, setIsCloningPackage] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // AI Prompt popup state
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [promptPackage, setPromptPackage] = useState(null);

  const callPackageApi = () => {
    if (!venue?._id) return;
    fetchVenuePackages(venue._id, setPackages, setLoading);
  };

  useEffect(() => {
    if (isOpen && venue?._id) {
      callPackageApi();
      setSearch("");
    }
  }, [isOpen, venue]);

  const filteredPackages = useMemo(() => {
    if (!search.trim()) return packages;
    const q = search.toLowerCase();
    return packages.filter(
      (pkg) =>
        pkg.title?.toLowerCase().includes(q) ||
        pkg.subTitle?.toLowerCase().includes(q),
    );
  }, [packages, search]);

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="xl"
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
          <Box>
            <Typography variant="h6" fontWeight={700}>
              All Packages
            </Typography>
            <Typography variant="body2" color="text.primary">
              Venue Name : {venue?.venueName || "Venue"}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Content */}
        <DialogContent
          dividers
          sx={{
            p: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            flex: 1,
          }}
        >
          {/* Search + Add */}
          <Box
            sx={{
              p: 2.5,
              display: "flex",
              gap: 2,
              alignItems: "center",
              borderBottom: "1px solid #f1f5f9",
              bgcolor: "white",
            }}
          >
            <TextField
              size="small"
              placeholder="Search by title or subtitle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              sx={{ maxWidth: 420 }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowCreatePackagePopup(true)}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                whiteSpace: "nowrap",
                px: 2.5,
              }}
            >
              Add Package
            </Button>
          </Box>

          {/* Table */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              flex: 1,
              overflow: "auto",
              borderRadius: 0,
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc", width: 80 }}>
                    Image
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc", minWidth: 140 }}>
                    Title
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc", minWidth: 220 }}>
                    Subtitle
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }} align="right">
                    Actual
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }} align="right">
                    Discounted
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }} align="center">
                    Max Guests
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }} align="center">
                    Items
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }} align="center">
                    Addons
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }} align="center">
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                      <CircularProgress size={32} />
                      <Typography mt={1.5} color="text.secondary">
                        Loading packages...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredPackages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                      <Typography color="text.secondary">
                        {search
                          ? "No packages match your search"
                          : "No packages found"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPackages?.map((pkg) => (
                    <TableRow
                      key={pkg._id}
                      hover
                      sx={{ "&:last-child td": { borderBottom: 0 } }}
                    >
                      {/* Image */}
                      <TableCell>
                        {pkg.packageImageUrl ? (
                          <Box
                            component="img"
                            src={pkg.packageImageUrl}
                            alt={pkg.title}
                            sx={{
                              width: 56,
                              height: 40,
                              objectFit: "cover",
                              borderRadius: 1.5,
                              border: "1px solid #e5e7eb",
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 56,
                              height: 40,
                              bgcolor: "#f1f5f9",
                              borderRadius: 1.5,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#94a3b8",
                              fontSize: 12,
                            }}
                          >
                            —
                          </Box>
                        )}
                      </TableCell>

                      {/* Title */}
                      <TableCell>
                        <Typography fontWeight={600} fontSize={14}>
                          {pkg.title || "—"}
                        </Typography>
                      </TableCell>

                      {/* Subtitle */}
                      <TableCell>
                        <Tooltip
                          title={pkg.subTitle || ""}
                          arrow
                          placement="top"
                          slotProps={{
                            tooltip: {
                              sx: { backgroundColor: "black", color: "white" },
                            },
                            arrow: { sx: { color: "black" } },
                          }}
                        >
                          <Typography
                            fontSize={13}
                            color="text.secondary"
                            sx={{
                              maxWidth: 240,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              cursor: pkg.subTitle ? "help" : "default",
                            }}
                          >
                            {pkg.subTitle || "—"}
                          </Typography>
                        </Tooltip>
                      </TableCell>

                      {/* Prices */}
                      <TableCell align="right">
                        <Typography fontSize={14}>
                          ₹{pkg.actualPrice ?? 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          fontSize={14}
                          fontWeight={600}
                          color="success.main"
                        >
                          ₹{pkg.discountedPrice ?? 0}
                        </Typography>
                      </TableCell>

                      {/* Counts */}
                      <TableCell align="center">{pkg.maxGuests ?? 0}</TableCell>
                      <TableCell align="center">
                        {pkg?.packageItems?.length || 0}
                      </TableCell>
                      <TableCell align="center">
                        {pkg?.packageAddons?.length || 0}
                      </TableCell>

                      {/* Status */}
                      <TableCell align="center">
                        <Chip
                          label={
                            pkg.packageStatus === 1 ? "Active" : "Inactive"
                          }
                          size="small"
                          onClick={() => {
                            const newStatus = pkg.packageStatus === 1 ? 2 : 1;
                            togglePackageStatus(
                              pkg._id,
                              newStatus,
                              callPackageApi,
                            );
                          }}
                          sx={{
                            fontWeight: 600,
                            cursor: "pointer",
                            bgcolor:
                              pkg.packageStatus === 1 ? "#dcfce7" : "#fee2e2",
                            color:
                              pkg.packageStatus === 1 ? "#15803d" : "#b91c1c",
                            "&:hover": {
                              bgcolor:
                                pkg.packageStatus === 1 ? "#bbf7d0" : "#fecaca",
                            },
                          }}
                        />
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setIsCloningPackage(false);
                              setSelectedPackage(pkg);
                              setShowEditPackagePopup(true);
                            }}
                            sx={{
                              textTransform: "none",
                              borderRadius: 1.5,
                              fontSize: 12,
                              px: 1.2,
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            onClick={() => {
                              setIsCloningPackage(true);
                              setSelectedPackage(pkg);
                              setShowEditPackagePopup(true);
                            }}
                            sx={{
                              textTransform: "none",
                              borderRadius: 1.5,
                              fontSize: 12,
                              px: 1.2,
                            }}
                          >
                            Clone
                          </Button>
                          <Tooltip title="Generate & Copy AI Prompt">
                            <Button
                              size="small"
                              variant="outlined"
                              color="info"
                              startIcon={<AutoAwesomeIcon sx={{ fontSize: "14px !important" }} />}
                              onClick={() => {
                                setPromptPackage(pkg);
                                setShowPromptModal(true);
                              }}
                              sx={{
                                textTransform: "none",
                                borderRadius: 1.5,
                                fontSize: 12,
                                px: 1.2,
                                bgcolor: "#eff6ff",
                                borderColor: "#bfdbfe",
                                color: "#1d4ed8",
                                "&:hover": {
                                  bgcolor: "#dbeafe",
                                  borderColor: "#93c5fd",
                                },
                              }}
                            >
                              Prompt
                            </Button>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        {/* Footer */}
        <DialogActions
          sx={{
            p: 2,
            borderTop: "1px solid #e5e7eb",
            bgcolor: "#fafafa",
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Package */}
      {showCreatePackagePopup && (
        <CreatePackagePopup
          isOpen={showCreatePackagePopup}
          venueId={venue._id}
          onClose={() => setShowCreatePackagePopup(false)}
          onSuccess={callPackageApi}
        />
      )}

      {/* Edit / Clone Package */}
      {showEditPackagePopup && (
        <EditPackagePopup
          isOpen={showEditPackagePopup}
          packageData={selectedPackage}
          onClose={() => {
            setShowEditPackagePopup(false);
            setIsCloningPackage(false);
          }}
          onSuccess={callPackageApi}
          isCloningPackage={isCloningPackage}
        />
      )}

      {/* AI Prompt Generator Modal */}
      {showPromptModal && (
        <PackagePromptModal
          isOpen={showPromptModal}
          packageData={promptPackage}
          venue={venue}
          onClose={() => {
            setShowPromptModal(false);
            setPromptPackage(null);
          }}
        />
      )}
    </>
  );
};

export default VenuePackagesPopup;