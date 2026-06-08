"use client";

import React, { useEffect, useState } from "react";
import "./venue-list.css";

import CreateVenuePopup from "./CreateVenuePopup";
import EditVenuePopup from "./EditVenuePopup";
import VenuePackagesPopup from "./VenuePackagesPopup";
import EditTermsPopup from "./CreateTermsModal";
import { fetchVenues, toggleVenueStatus  } from "../../../services/venueListServices";
import { useRouter } from "next/navigation";
import { venueTypes } from "@/constants/venueListConstants";
import { BASE_URL } from "@/utils/apiconstant";

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
            {venueTypes?.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
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
            <th>View Gallery</th>
            <th>Edit</th>
            <th>Status</th>
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
                      router.push(
                        `/dashboard/venue-list/image-gallery?venueid=${venue._id}`,
                      );
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
                    onClick={() => {
                      const newStatus = venue.venueStatus === 1 ? 2 : 1;

                      toggleVenueStatus(venue._id, newStatus, callVenueApi);
                    }}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "5px",
                      border: "none",
                      cursor: "pointer",
                      background: venue.venueStatus === 1 ? "green" : "red",
                      color: "#fff",
                    }}
                  >
                    {venue.venueStatus === 1 ? "Active" : "Inactive"}
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
                    href={`${BASE_URL}/venue-list/venue?venueid=${venue._id}`}
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
