// "use client";
// import React, { useEffect, useState } from "react";
// import "./venue-list.css";
// import CreateVenuePopup from "./CreateVenuePopup";
// import EditVenuePopup from "./EditVenuePopup";
// import VenuePackagesPopup from "./VenuePackagesPopup";
// import EditTermsPopup from "./CreateTermsModal";
// import {
//   fetchVenues,
//   toggleVenueStatus,
// } from "../../../services/venueListServices";
// import { useRouter } from "next/navigation";
// import { venueTypes } from "@/constants/venueListConstants";
// import { BASE_URL } from "@/utils/apiconstant";

// const VenueList = () => {
//   const router = useRouter();
//   const [venues, setVenues] = useState([]);
//   const [, setLoading] = useState(false);
//   const [, setError] = useState("");
//   const [page, setPage] = useState(1);
//   const [search, setSearch] = useState("");
//   const [venueType, setVenueType] = useState("");
//   const [pagination, setPagination] = useState({});
//   const [showCreatePopup, setShowCreatePopup] = useState(false);
//   const [showEditPopup, setShowEditPopup] = useState(false);
//   const [selectedVenue, setSelectedVenue] = useState(null);
//   const [showPackagesPopup, setShowPackagesPopup] = useState(false);
//   const [showCreateTermsPopup, setShowCreateTermsPopup] = useState(false);

//   const callVenueApi = () => {
//     fetchVenues(
//       setError,
//       setLoading,
//       setVenues,
//       setPagination,
//       page,
//       search,
//       venueType,
//     );
//   };

//   useEffect(() => {
//     callVenueApi();
//   }, [page, search, venueType]);

//   return (
//     <div className="venue-page">
//       <div className="venue-header">
//         <h1 className="venue-title">Venue List</h1>
//         <button
//           className="btn-primary"
//           onClick={() => setShowCreatePopup(true)}
//         >
//           + Add Venue
//         </button>
//       </div>

//       <div className="venue-filters">
//         <input
//           type="text"
//           className="filter-input"
//           placeholder="Search venue..."
//           value={search}
//           onChange={(e) => {
//             setSearch(e.target.value);
//             setPage(1);
//           }}
//         />
//         <select
//           className="filter-select"
//           value={venueType}
//           onChange={(e) => {
//             setVenueType(e.target.value);
//             setPage(1);
//           }}
//         >
//           <option value="">All Venue Types</option>
//           {venueTypes?.map((item, index) => (
//             <option key={index} value={item}>
//               {item}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="table-wrapper">
//         <table className="venue-table">
//           <thead>
//             <tr>
//               <th>Image</th>
//               <th>Name</th>
//               <th>Type</th>
//               <th>Location</th>
//               <th>Map</th>
//               <th>Created</th>
//               <th>Gallery</th>
//               <th>Edit</th>
//               <th>Status</th>
//               <th>Terms</th>
//               <th>Venue Link</th>
//               <th>Packages</th>
//             </tr>
//           </thead>
//           <tbody>
//             {venues.length > 0 ? (
//               venues.map((venue) => (
//                 <tr key={venue._id}>
//                   <td>
//                     {venue.venueImageUrl ? (
//                       <img
//                         src={venue.venueImageUrl}
//                         alt={venue.venueName}
//                         className="venue-thumb"
//                       />
//                     ) : (
//                       <span className="no-img">—</span>
//                     )}
//                   </td>
//                   <td className="name-cell">{venue.venueName}</td>
//                   <td>
//                     {Array.isArray(venue.venueType)
//                       ? venue.venueType.join(", ")
//                       : venue.venueType || "—"}
//                   </td>
//                   <td>{venue.location || "—"}</td>
//                   <td>
//                     {venue.googleMapLink ? (
//                       <a
//                         href={venue.googleMapLink}
//                         target="_blank"
//                         rel="noreferrer"
//                         className="link-btn"
//                       >
//                         Open
//                       </a>
//                     ) : (
//                       "—"
//                     )}
//                   </td>
//                   <td>{new Date(venue.createdAt).toLocaleDateString()}</td>
//                   <td>
//                     <button
//                       className="btn-sm btn-blue"
//                       onClick={() =>
//                         router.push(
//                           `/dashboard/venue-list/image-gallery?venueid=${venue._id}`,
//                         )
//                       }
//                     >
//                       Gallery
//                     </button>
//                   </td>
//                   <td>
//                     <button
//                       className="btn-sm btn-blue"
//                       onClick={() => {
//                         setSelectedVenue(venue);
//                         setShowEditPopup(true);
//                       }}
//                     >
//                       Edit
//                     </button>
//                   </td>
//                   <td>
//                     <button
//                       className={`status-btn ${
//                         venue.venueStatus === 1 ? "active" : "inactive"
//                       }`}
//                       onClick={() => {
//                         const newStatus = venue.venueStatus === 1 ? 2 : 1;
//                         toggleVenueStatus(venue._id, newStatus, callVenueApi);
//                       }}
//                     >
//                       {venue.venueStatus === 1 ? "Active" : "Inactive"}
//                     </button>
//                   </td>
//                   <td>
//                     <button
//                       className="btn-sm btn-blue"
//                       onClick={() => {
//                         setSelectedVenue(venue);
//                         setShowCreateTermsPopup(true);
//                       }}
//                     >
//                       Terms
//                     </button>
//                   </td>
//                   <td>
//                     <a
//                       href={`${BASE_URL}/venue-list/venue?venueid=${venue._id}`}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="link-btn"
//                     >
//                       View
//                     </a>
//                   </td>
//                   <td>
//                     <button
//                       className="btn-sm btn-blue"
//                       onClick={() => {
//                         setSelectedVenue(venue);
//                         setShowPackagesPopup(true);
//                       }}
//                     >
//                       Packages
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={12} className="no-data">
//                   No Venue Found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className="pagination">
//         <button
//           className="page-btn"
//           disabled={!pagination.previous_page || page <= 1}
//           onClick={() => setPage(pagination.previous_page)}
//         >
//           Previous
//         </button>
//         <span className="page-info">
//           Page {pagination.current_page || page} of{" "}
//           {pagination.last_page || 1}
//         </span>
//         <button
//           className="page-btn"
//           disabled={
//             !pagination.next_page ||
//             page >= (pagination.last_page || 1)
//           }
//           onClick={() => setPage(pagination.next_page)}
//         >
//           Next
//         </button>
//       </div>

//       {/* Popups – same as before */}
//       {showCreatePopup && (
//         <CreateVenuePopup
//           isOpen={showCreatePopup}
//           onClose={() => setShowCreatePopup(false)}
//           onSuccess={callVenueApi}
//         />
//       )}
//       {showEditPopup && (
//         <EditVenuePopup
//           isOpen={showEditPopup}
//           venueData={selectedVenue}
//           onClose={() => setShowEditPopup(false)}
//           onSuccess={callVenueApi}
//         />
//       )}
//       {showPackagesPopup && (
//         <VenuePackagesPopup
//           isOpen={showPackagesPopup}
//           venue={selectedVenue}
//           onClose={() => setShowPackagesPopup(false)}
//         />
//       )}
//       {showCreateTermsPopup && (
//         <EditTermsPopup
//           isOpen={showCreateTermsPopup}
//           venue={selectedVenue}
//           onClose={() => setShowCreateTermsPopup(false)}
//           onSuccess={callVenueApi}
//         />
//       )}
//     </div>
//   );
// };

// export default VenueList;

"use client";
import React, { useEffect, useState } from "react";
import "./venue-list.css";
import CreateVenuePopup from "./CreateVenuePopup";
import EditVenuePopup from "./EditVenuePopup";
import VenuePackagesPopup from "./VenuePackagesPopup";
import EditTermsPopup from "./CreateTermsModal";
import VenueFaqPopup from "./CreateVenueFAQ"
import {
  fetchVenues,
  toggleVenueStatus,
} from "../../../services/venueListServices";
import { useRouter } from "next/navigation";
import { venueTypes } from "@/constants/venueListConstants";
import Image from "next/image";
import "./createVenue.css";
const VenueList = () => {
  const router = useRouter();
  const [venues, setVenues] = useState([]);
  const [, setLoading] = useState(false);
  const [, setError] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [venueType, setVenueType] = useState("");
  const [pagination, setPagination] = useState({});
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [showPackagesPopup, setShowPackagesPopup] = useState(false);
  const [showFaqPopup, setShowFaqPopup] = useState(false);
  const [showCreateTermsPopup, setShowCreateTermsPopup] = useState(false);

  // Image Preview Popup
  const [previewImage, setPreviewImage] = useState(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [isPreparing, setIsPreparing] = useState(false);

  const callVenueApi = () => {
    fetchVenues(
      setError,
      setLoading,
      setVenues,
      setPagination,
      page,
      search,
      venueType,
    );
  };

  useEffect(() => {
    callVenueApi();
  }, [page, search, venueType]);

  const openImagePreview = async (dish) => {
    if (!dish?.venueImageUrl) return;

    const url = dish.venueImageUrl;

    setPreviewImage({
      url,
      name: dish.venueName || "Material",
      blob: null,
    });
    setCopyStatus("");
    setIsPreparing(true);

    try {
      const response = await fetch(url, { mode: "cors" });

      if (!response.ok) {
        throw new Error(`Image fetch failed: ${response.status}`);
      }

      const blob = await response.blob();
      const clipboardBlob = await convertToPng(blob, 1920);

      setPreviewImage((prev) => ({
        ...prev,
        blob: clipboardBlob,
      }));
    } catch (error) {
      console.error("Failed to prepare image:", error);
    } finally {
      setIsPreparing(false);
    }
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
    setCopyStatus("");
    setIsPreparing(false);
  };

  // Copy Image URL
  const handleCopyUrl = async () => {
    if (!previewImage?.url) return;

    try {
      await navigator.clipboard.writeText(previewImage.url);
      setCopyStatus("url");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
      alert("Failed to copy URL");
    }
  };

  // Copy Image (PNG only)
  const handleCopyImage = async () => {
    if (!previewImage?.blob) {
      alert("Image is still preparing. Please wait a moment.");
      return;
    }

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": previewImage.blob,
        }),
      ]);

      setCopyStatus("image");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch (err) {
      console.error("Failed to copy image:", err);

      if (err?.name === "NotAllowedError") {
        alert("Browser blocked image clipboard access. Please try again.");
      } else {
        alert("Failed to copy image. You can still copy the URL.");
      }
    }
  };

  const convertToPng = (blob, maxSize = 1920) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(blob);

      img.onload = () => {
        try {
          let { naturalWidth: width, naturalHeight: height } = img;

          // Resize if too large (keeps aspect ratio)
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            } else {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Canvas context unavailable"));
            return;
          }

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (pngBlob) => {
              URL.revokeObjectURL(objectUrl);

              if (pngBlob) {
                resolve(pngBlob);
              } else {
                reject(new Error("PNG conversion failed"));
              }
            },
            "image/png",
            0.92,
          );
        } catch (err) {
          URL.revokeObjectURL(objectUrl);
          reject(err);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Image load failed"));
      };

      img.src = objectUrl;
    });
  };

  return (
    <>
      <div className="venue-page">
        {/* Header */}
        <div className="venue-header">
          <div>
            <h1 className="venue-title">Venue List</h1>
            <p className="venue-subtitle">
              Manage all venues, packages & terms
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={() => setShowCreatePopup(true)}
          >
            + Add Venue
          </button>
        </div>

        {/* Filters */}
        <div className="venue-filters">
          <div className="search-wrapper">
            <input
              type="text"
              className="filter-input"
              placeholder="Search by venue name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            className="filter-select"
            value={venueType}
            onChange={(e) => {
              setVenueType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Venue Types</option>
            {venueTypes?.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="table-card">
          <div className="table-scroll">
            <table className="venue-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Map</th>
                  <th>Created</th>
                  <th>Gallery</th>
                  <th>Edit</th>
                  <th>FAQs</th>
                  <th>Status</th>
                  <th>Terms</th>
                  <th>Venue Link</th>
                  <th>Packages</th>
                </tr>
              </thead>
              <tbody>
                {venues.length > 0 ? (
                  venues.map((venue) => (
                    <tr key={venue._id}>
                      <td>
                        {venue.venueImageUrl ? (
                          <>
                            {/* <img
                          src={venue.venueImageUrl}
                          alt={venue.venueName}
                          className="venue-thumb"
                        /> */}
                            <div
                              className="image-clickable"
                              onClick={() => openImagePreview(venue)}
                              title="Click to preview"
                            >
                              <Image
                                src={venue?.venueImageUrl}
                                alt={venue.venueName || "Venue"}
                                className="venue-thumb"
                                width={40}
                                height={40}
                              />
                            </div>
                          </>
                        ) : (
                          <div className="no-img">—</div>
                        )}
                      </td>
                      <td className="name-cell">{venue.venueName}</td>
                      <td>
                        {Array.isArray(venue.venueType)
                          ? venue.venueType.join(", ")
                          : venue.venueType || "—"}
                      </td>
                      <td>{venue.location || "—"}</td>
                      <td>
                        {venue.googleMapLink ? (
                          <a
                            href={venue.googleMapLink}
                            target="_blank"
                            rel="noreferrer"
                            className="link-btn"
                          >
                            Open
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{new Date(venue.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn-sm btn-blue"
                          onClick={() =>
                            router.push(
                              `/dashboard/venue-list/image-gallery?venueid=${venue._id}`,
                            )
                          }
                        >
                          Gallery
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn-sm btn-blue"
                          onClick={() => {
                            setSelectedVenue(venue);
                            setShowEditPopup(true);
                          }}
                        >
                          Edit
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn-sm btn-blue"
                          onClick={() => {
                            setSelectedVenue(venue);
                            setShowFaqPopup(true);
                          }}
                        >
                          FAQs
                        </button>
                      </td>
                      <td>
                        <button
                          className={`status-btn ${
                            venue.venueStatus === 1 ? "active" : "inactive"
                          }`}
                          onClick={() => {
                            const newStatus = venue.venueStatus === 1 ? 2 : 1;
                            toggleVenueStatus(
                              venue._id,
                              newStatus,
                              callVenueApi,
                            );
                          }}
                        >
                          {venue.venueStatus === 1 ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn-sm btn-blue"
                          onClick={() => {
                            setSelectedVenue(venue);
                            setShowCreateTermsPopup(true);
                          }}
                        >
                          Terms
                        </button>
                      </td>
                      <td>
                        <a
                          href={`https://horaservices.com/venue-list/venue?venueid=${venue._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="link-btn"
                        >
                          View
                        </a>
                      </td>
                      <td>
                        <button
                          className="btn-sm btn-blue"
                          onClick={() => {
                            setSelectedVenue(venue);
                            setShowPackagesPopup(true);
                          }}
                        >
                          Packages
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={12} className="no-data">
                      No Venue Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button
            className="page-btn"
            disabled={!pagination.previous_page || page <= 1}
            onClick={() => setPage(pagination.previous_page)}
          >
            Previous
          </button>
          <span className="page-info">
            Page {pagination.current_page || page} of{" "}
            {pagination.last_page || 1}
          </span>
          <button
            className="page-btn"
            disabled={
              !pagination.next_page || page >= (pagination.last_page || 1)
            }
            onClick={() => setPage(pagination.next_page)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Popups */}
      {showCreatePopup && (
        <CreateVenuePopup
          isOpen={showCreatePopup}
          onClose={() => setShowCreatePopup(false)}
          onSuccess={callVenueApi}
        />
      )}
      {showEditPopup && (
        <EditVenuePopup
          isOpen={showEditPopup}
          venueData={selectedVenue}
          onClose={() => setShowEditPopup(false)}
          onSuccess={callVenueApi}
        />
      )}
      {showPackagesPopup && (
        <VenuePackagesPopup
          isOpen={showPackagesPopup}
          venue={selectedVenue}
          onClose={() => setShowPackagesPopup(false)}
        />
      )}
      {showCreateTermsPopup && (
        <EditTermsPopup
          isOpen={showCreateTermsPopup}
          venue={selectedVenue}
          onClose={() => setShowCreateTermsPopup(false)}
          onSuccess={callVenueApi}
        />
      )}

      {showFaqPopup && (
        <VenueFaqPopup
          isOpen={showFaqPopup}
          venue={selectedVenue}
          onClose={() => setShowFaqPopup(false)}
          onSuccess={callVenueApi}
        />
      )}

      {previewImage && (
        <div className="image-preview-overlay" onClick={closeImagePreview}>
          <div
            className="image-preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="image-preview-close" onClick={closeImagePreview}>
              ×
            </button>

            <div className="image-preview-title">{previewImage.name}</div>

            <div className="image-preview-body">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="image-preview-img"
              />
            </div>

            <div className="image-preview-actions">
              <button
                className="preview-btn copy-image-btn"
                onClick={handleCopyImage}
                disabled={isPreparing || !previewImage?.blob}
              >
                {isPreparing
                  ? "Preparing..."
                  : copyStatus === "image"
                    ? "✓ Copied!"
                    : "Copy Image"}
              </button>

              <button
                className="preview-btn copy-url-btn"
                onClick={handleCopyUrl}
              >
                {copyStatus === "url" ? "✓ Copied!" : "Copy Image URL"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VenueList;
