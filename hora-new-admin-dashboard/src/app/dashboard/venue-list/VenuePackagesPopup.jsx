// "use client";

// import React, { useEffect, useState, useMemo } from "react";

// import "./venue-packages-popup.css";

// import CreatePackagePopup from "./CreatePackagePopup";
// import EditPackagePopup from "./EditPackagePopup";
// import { fetchVenuePackages, togglePackageStatus } from "@/services/venueListServices";

// const VenuePackagesPopup = ({ isOpen, venue, onClose }) => {
//   const [packages, setPackages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [search, setSearch] = useState("");
//   const [showCreatePackagePopup, setShowCreatePackagePopup] = useState(false);
//   const [showEditPackagePopup, setShowEditPackagePopup] = useState(false);
//   const [isCloningPackage, setIsCloningPackage] = useState(false);
//   const [selectedPackage, setSelectedPackage] = useState(null);

//   const callPackageApi = () => {
//     if (!venue?._id) return;
//     fetchVenuePackages(venue._id, setPackages, setLoading);
//   };

//   useEffect(() => {
//     if (isOpen && venue?._id) {
//       callPackageApi();
//     }
//   }, [isOpen, venue]);

//   const filteredPackages = useMemo(() => {
//     if (!search) return packages;

//     return packages.filter(
//       (pkg) =>
//         pkg.title?.toLowerCase().includes(search.toLowerCase()) ||
//         pkg.subTitle?.toLowerCase().includes(search.toLowerCase()),
//     );
//   }, [packages, search]);

//   if (!isOpen) return null;

//   return (
//     <>
//       <div className="popup-overlay">
//         <div className="popup-content package-popup">
//           <button className="close-btn" onClick={onClose}>
//             X
//           </button>

//           <h2>Packages - {venue?.venueName}</h2>

//           {/* HEADER */}
//           <div className="package-header">
//             <input
//               type="text"
//               placeholder="Search Package..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />

//             <button
//               className="add-package-btn"
//               onClick={() => setShowCreatePackagePopup(true)}
//             >
//               Add Package
//             </button>
//           </div>

//           {/* TABLE */}
//           <div className="package-table-wrapper">
//             <table className="dish-table">
//               <thead>
//                 <tr>
//                   <th>Image</th>
//                   <th>Title</th>
//                   <th>Subtitle</th>
//                   <th>Actual Price</th>
//                   <th>Discounted</th>
//                   <th>Max Guests</th>
//                   <th>Package Items</th>
//                   <th>Addons</th>
//                   <th>Status</th>
//                   <th>Edit</th>
//                   <th>Clone</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {!loading && filteredPackages.length > 0 ? (
//                   filteredPackages.map((pkg) => (
//                     <tr key={pkg._id}>
//                       <td>
//                         {pkg.packageImageUrl ? (
//                           <img
//                             src={pkg.packageImageUrl}
//                             alt={pkg.title}
//                             style={{
//                               width: "60px",
//                               height: "40px",
//                               objectFit: "cover",
//                               borderRadius: "4px",
//                             }}
//                           />
//                         ) : (
//                           "-"
//                         )}
//                       </td>
//                       <td>{pkg.title}</td>
//                       <td>{pkg.subTitle}</td>
//                       <td>₹{pkg.actualPrice}</td>
//                       <td>₹{pkg.discountedPrice}</td>
//                       <td>{pkg.maxGuests}</td>
//                       <td>{pkg?.packageItems?.length || 0}</td>
//                       <td>{pkg?.packageAddons?.length || 0}</td>

//                       <td>
//                         <button
//                           onClick={() => {
//                             const newStatus = pkg.packageStatus === 1 ? 2 : 1;

//                             togglePackageStatus(
//                               pkg._id,
//                               newStatus,
//                               callPackageApi,
//                             );
//                           }}
//                           style={{
//                             padding: "5px 10px",
//                             borderRadius: "5px",
//                             border: "none",
//                             cursor: "pointer",
//                             background:
//                               pkg.packageStatus === 1 ? "green" : "red",
//                             color: "#fff",
//                           }}
//                         >
//                           {pkg.packageStatus === 1 ? "Active" : "Inactive"}
//                         </button>
//                       </td>

//                       <td>
//                         <button
//                           className="edit-btn"
//                           onClick={() => {
//                             setSelectedPackage(pkg);
//                             setShowEditPackagePopup(true);
//                           }}
//                         >
//                           Edit
//                         </button>
//                       </td>
//                       <td>
//                         <button
//                           className="edit-btn"
//                           onClick={() => {
//                             setIsCloningPackage(true)
//                             setSelectedPackage(pkg);
//                             setShowEditPackagePopup(true);
//                           }}
//                         >
//                           Clone Package
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 ) : !loading ? (
//                   <tr>
//                     <td colSpan={9} className="no-data">
//                       No Packages Found
//                     </td>
//                   </tr>
//                 ) : (
//                   <tr>
//                     <td colSpan={9} className="no-data">
//                       Loading...
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* CREATE */}

//       {showCreatePackagePopup && (
//         <CreatePackagePopup
//           isOpen={showCreatePackagePopup}
//           venueId={venue._id}
//           onClose={() => setShowCreatePackagePopup(false)}
//           onSuccess={callPackageApi}
//         />
//       )}

//       {/* EDIT */}

//       {showEditPackagePopup && (
//         <EditPackagePopup
//           isOpen={showEditPackagePopup}
//           packageData={selectedPackage}
//           onClose={() => setShowEditPackagePopup(false)}
//           onSuccess={callPackageApi}
//           isCloningPackage={isCloningPackage}
//         />
//       )}
//     </>
//   );
// };

// export default VenuePackagesPopup;

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
import CreatePackagePopup from "./CreatePackagePopup";
import EditPackagePopup from "./EditPackagePopup";
import {
  fetchVenuePackages,
  togglePackageStatus,
} from "@/services/venueListServices";

const VenuePackagesPopup = ({ isOpen, venue, onClose }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showCreatePackagePopup, setShowCreatePackagePopup] = useState(false);
  const [showEditPackagePopup, setShowEditPackagePopup] = useState(false);
  const [isCloningPackage, setIsCloningPackage] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

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
            <Typography variant="body" color="text.primary">
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
                  <TableCell
                    sx={{ fontWeight: 700, bgcolor: "#f8fafc", width: 80 }}
                  >
                    Image
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, bgcolor: "#f8fafc", minWidth: 140 }}
                  >
                    Title
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, bgcolor: "#f8fafc", minWidth: 220 }}
                  >
                    Subtitle
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}
                    align="right"
                  >
                    Actual
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}
                    align="right"
                  >
                    Discounted
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}
                    align="center"
                  >
                    Max Guests
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}
                    align="center"
                  >
                    Items
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}
                    align="center"
                  >
                    Addons
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}
                    align="center"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}
                    align="center"
                  >
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

                      <TableCell>
                        <Tooltip
                          title={pkg.subTitle || ""}
                          arrow
                          placement="top"
                          slotProps={{
                            tooltip: {
                              sx: {
                                backgroundColor: "black",
                                color: "white",
                              },
                            },
                            arrow: {
                              sx: {
                                color: "black",
                              },
                            },
                          }}
                        >
                          <Typography
                            fontSize={13}
                            color="text.secondary"
                            sx={{
                              maxWidth: 260,
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
                              px: 1.5,
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
                              px: 1.5,
                            }}
                          >
                            Clone
                          </Button>
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
    </>
  );
};

export default VenuePackagesPopup;
