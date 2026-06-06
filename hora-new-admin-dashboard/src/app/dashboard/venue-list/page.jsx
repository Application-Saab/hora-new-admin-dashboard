// "use client";

// import React, { useState } from "react";
// import axios from "axios";

// import {
//   BASE_URL,
//   ADMIN_USER_LIST,
//   ADMIN_USER_SIGNUP,
// } from "../../../utils/apiconstant";

// import "./createVenue.css";

// // import EventWallSection from "./eventWall/EventWallSection";

// const AddVenue = () => {
//   const [customerNumber, setCustomerNumber] = useState("");
//   const [customerId, setCustomerId] = useState(null);

//   const [venueType, setVenueType] = useState("");
//   const [venueName, setVenueName] = useState("");
//   const [location, setLocation] = useState("");
//   const [googleMapLink, setGoogleMapLink] = useState("");

//   const [message, setMessage] = useState("");
//   const [messageColor, setMessageColor] = useState("");

//   const [checkLoading, setCheckLoading] = useState(false);
//   const [createLoading, setCreateLoading] = useState(false);

//   const [showPopup, setShowPopup] = useState(false);

//   const [newCustomerName, setNewCustomerName] =
//     useState("");

//   const [newCustomerPhone, setNewCustomerPhone] =
//     useState("");

//   // NEW
//   const [createdVenue, setCreatedVenue] =
//     useState(null);

//   // -------------------------------------------------
//   // Check Customer
//   // -------------------------------------------------
//   const handleCheckCustomer = async (e) => {
//     e.preventDefault();

//     setCheckLoading(true);
//     setMessage("");

//     try {
//       const response = await axios.post(
//         `${BASE_URL}${ADMIN_USER_LIST}`,
//         {
//           phone: customerNumber,
//           per_page: 1,
//           role: "customer",
//         }
//       );

//       const users =
//         response?.data?.data?.users || [];

//       const customer = users.find(
//         (u) => u.phone === customerNumber
//       );

//       if (customer) {
//         setCustomerId(customer._id);

//         setMessage("Customer exists");
//         setMessageColor("green");

//         setShowPopup(false);
//       } else {
//         setShowPopup(true);

//         setMessage("Customer not found");
//         setMessageColor("red");
//       }
//     } catch (err) {
//       setShowPopup(true);

//       setMessage("Error checking customer");
//       setMessageColor("red");
//     } finally {
//       setCheckLoading(false);
//     }
//   };

//   // -------------------------------------------------
//   // Add Customer
//   // -------------------------------------------------
//   const handleAddCustomer = async () => {
//     try {
//       const res = await axios.post(
//         `${BASE_URL}${ADMIN_USER_SIGNUP}`,
//         {
//           name: newCustomerName,
//           phone: newCustomerPhone,
//           role: "customer",
//         }
//       );

//       setCustomerId(res.data.dataToSave._id);

//       setShowPopup(false);

//       setMessage(
//         "Customer created successfully"
//       );

//       setMessageColor("green");
//     } catch (err) {
//       setMessage("Failed to create customer");

//       setMessageColor("red");
//     }
//   };

//   // -------------------------------------------------
//   // Create Venue
//   // -------------------------------------------------
//   const handleCreateVenue = async (e) => {
//     e.preventDefault();

//     if (!customerId) {
//       setMessage(
//         "Please verify customer first"
//       );

//       setMessageColor("red");

//       return;
//     }

//     try {
//       setCreateLoading(true);

//       const res = await axios.post(
//         "http://localhost:5000/api/party-venue/create-party-venue",
//         {
//           userId: customerId,
//           venueType,
//           venueName,
//           location,
//           googleMapLink,
//         }
//       );

//       if (!res.data.error) {
//         setCreatedVenue(res.data.data);

//         setMessage(
//           "Venue created successfully ✅"
//         );

//         setMessageColor("green");
//       }
//     } catch (err) {
//       console.error(err);

//       setMessage("Error creating venue");

//       setMessageColor("red");
//     } finally {
//       setCreateLoading(false);
//     }
//   };

//   return (
//     <div className="container">
//       <h3>Create Venue 🏛️</h3>

//       {/* Customer Section */}
//       <label>
//         Owner or Manager Number *
//       </label>

//       <input
//         type="text"
//         value={customerNumber}
//         onInput={(e) =>
//           setCustomerNumber(
//             e.target.value.replace(/\D/g, "")
//           )
//         }
//         maxLength={10}
//       />

//       <button
//         onClick={handleCheckCustomer}
//         disabled={checkLoading}
//       >
//         {checkLoading
//           ? "Checking..."
//           : "Check Customer"}
//       </button>

//       <p style={{ color: messageColor }}>
//         {message}
//       </p>

//       {/* Venue Form */}
//       {customerId && (
//         <form onSubmit={handleCreateVenue}>
//           <label>Venue Type *</label>

//           <input
//             value={venueType}
//             onChange={(e) =>
//               setVenueType(e.target.value)
//             }
//             placeholder="Hall / Lawn"
//             required
//           />

//           <label>Venue Name *</label>

//           <input
//             value={venueName}
//             onChange={(e) =>
//               setVenueName(e.target.value)
//             }
//             required
//           />

//           <label>Location *</label>

//           <input
//             value={location}
//             onChange={(e) =>
//               setLocation(e.target.value)
//             }
//             required
//           />

//           <label>Google Map Link</label>

//           <input
//             value={googleMapLink}
//             onChange={(e) =>
//               setGoogleMapLink(
//                 e.target.value
//               )
//             }
//           />

//           <button
//             type="submit"
//             className="buttonPrimary"
//             disabled={createLoading}
//           >
//             {createLoading
//               ? "Creating..."
//               : "Create Venue"}
//           </button>
//         </form>
//       )}

//       {/* SHOW EVENT WALL ONLY AFTER VENUE CREATED */}
//       {/*   {createdVenue && (
//         <div className="event-wall-container">
//           <h2 className="wall-heading text-center m-0 p-0">
//             Explore Spaces
//           </h2>

//           <EventWallSection
//             venueId={createdVenue._id}
//             customerId={customerId}
//           />
//         </div>
//       )}  */}

//       {/* Popup */}
//       {showPopup && (
//         <div className="popup">
//           <h3>Add New Customer</h3>

//           <input
//             placeholder="Name"
//             value={newCustomerName}
//             onChange={(e) =>
//               setNewCustomerName(
//                 e.target.value
//               )
//             }
//           />

//           <input
//             placeholder="Phone"
//             value={newCustomerPhone}
//             onInput={(e) =>
//               setNewCustomerPhone(
//                 e.target.value.replace(
//                   /\D/g,
//                   ""
//                 )
//               )
//             }
//             maxLength={10}
//           />

//           <button
//             onClick={handleAddCustomer}
//           >
//             Create Customer
//           </button>

//           <button
//             onClick={() =>
//               setShowPopup(false)
//             }
//           >
//             Cancel
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AddVenue;

"use client";

import React, { useEffect, useState } from "react";
import "./venue-list.css";

import CreateVenuePopup from "./CreateVenuePopup";
import EditVenuePopup from "./EditVenuePopup";
import VenuePackagesPopup from "./VenuePackagesPopup";
import EditTermsPopup from "./CreateTermsModal";
import { fetchVenues } from "../../../services/venueListServices";
import { useRouter } from "next/navigation";

const VenueList = () => {
  const router = useRouter();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [venueType, setVenueType] = useState("");
  const [pagination, setPagination] = useState({});
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [showPackagesPopup, setShowPackagesPopup] = useState(false);
  const [showCreateTermsPopup, setShowCreateTermsPopup] = useState(false);

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

  return (
    <div className="container">
      <h1>Venue List</h1>

      {/* <div className="add-package-btn-ctn">
        <button
          className="add-package-btn"
          onClick={() => setShowCreatePopup(true)}
        >
          Add Venue
        </button>
      </div> */}

      <div className="filters-container">
        <div style={{ display: "flex", gap: "10px", width: "100%" }}>
          <input
            type="text"
            placeholder="Search venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={venueType}
            onChange={(e) => setVenueType(e.target.value)}
          >
            <option value="">All Venue Types</option>

            <option value="Hall">Hall</option>

            <option value="Lawn">Lawn</option>
          </select>
        </div>
        <div>
          <button
            className="add-package-btn"
            onClick={() => setShowCreatePopup(true)}
          >
            Add Venue
          </button>
        </div>
      </div>

      <table className="dish-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Type</th>
            <th>Location</th>
            <th>Map</th>
            <th>Created</th>
            <th>Edit</th>
            <th>Add Terms</th>
            <th>Venue Link</th>
            <th>View Packages</th>
          </tr>
        </thead>

        <tbody>
          {venues.length > 0 ? (
            venues.map((venue) => (
              <tr key={venue._id}>
                <td>
                  {venue.venueImageUrl ? (
                    <img
                      src={venue.venueImageUrl}
                      alt={venue.venueName}
                      style={{
                        width: "60px",
                        height: "40px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td>{venue.venueName}</td>

                <td>{venue.venueType}</td>

                <td>{venue.location}</td>

                <td>
                  <a href={venue.googleMapLink} target="_blank">
                    Open
                  </a>
                </td>

                <td>{new Date(venue.createdAt).toLocaleDateString()}</td>

                <td>
                  <button
                    className="edit-btn"
                    onClick={() => {
                      router.push(`/dashboard/venue-list/image-gallery?venueid=${venue._id}`);
                    }}
                  >
                    View Gallery
                  </button>
                </td>

                <td>
                  <button
                    className="edit-btn"
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
                    className="edit-btn"
                    onClick={() => {
                      setSelectedVenue(venue);

                      setShowCreateTermsPopup(true);
                    }}
                  >
                    Add Terms
                  </button>
                </td>

                <td>
                  <a
                    href={`http://localhost:3001/venue-list/venue?venueid=${venue._id}`}
                    target="_blank"
                  >
                    View Venue
                  </a>
                </td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setSelectedVenue(venue);
                      setShowPackagesPopup(true);
                    }}
                  >
                    View Packages
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="no-data">
                No Venue Found
              </td>
            </tr>
          )}
        </tbody>
      </table>

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

      <div className="pagination">
        <button onClick={() => setPage(pagination.previous_page)}>
          Previous
        </button>

        <span>
          Page {pagination.current_page} of {pagination.last_page}
        </span>

        <button onClick={() => setPage(pagination.next_page)}>Next</button>
      </div>
    </div>
  );
};

export default VenueList;
