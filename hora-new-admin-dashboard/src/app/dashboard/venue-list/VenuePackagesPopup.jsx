"use client";

import React, { useEffect, useState, useMemo } from "react";

import "./venue-packages-popup.css";

import CreatePackagePopup from "./CreatePackagePopup";
import EditPackagePopup from "./EditPackagePopup";
import { fetchVenuePackages } from "@/services/venueListServices";

const VenuePackagesPopup = ({ isOpen, venue, onClose }) => {
  const [packages, setPackages] = useState([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [showCreatePackagePopup, setShowCreatePackagePopup] = useState(false);

  const [showEditPackagePopup, setShowEditPackagePopup] = useState(false);

  const [selectedPackage, setSelectedPackage] = useState(null);

  const callPackageApi = () => {
    if (!venue?._id) return;

    fetchVenuePackages(venue._id, setPackages, setLoading);
  };

  useEffect(() => {
    if (isOpen && venue?._id) {
      callPackageApi();
    }
  }, [isOpen, venue]);

  const filteredPackages = useMemo(() => {
    if (!search) return packages;

    return packages.filter(
      (pkg) =>
        pkg.title?.toLowerCase().includes(search.toLowerCase()) ||
        pkg.subTitle?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [packages, search]);

  if (!isOpen) return null;

  return (
    <>
      <div className="popup-overlay">
        <div className="popup-content package-popup">
          <button className="close-btn" onClick={onClose}>
            X
          </button>

          <h2>Packages - {venue?.venueName}</h2>

          {/* HEADER */}
          <div className="package-header">
            <input
              type="text"
              placeholder="Search Package..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button
              className="add-package-btn"
              onClick={() => setShowCreatePackagePopup(true)}
            >
              Add Package
            </button>
          </div>

          {/* TABLE */}
          <div className="package-table-wrapper">
            <table className="dish-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>

                  <th>Subtitle</th>

                  <th>Actual Price</th>

                  <th>Discounted</th>

                  <th>Max Guests</th>

                  <th>Package Items</th>

                  <th>Addons</th>

                  <th>Status</th>

                  <th>Edit</th>
                </tr>
              </thead>

              <tbody>
                {!loading && filteredPackages.length > 0 ? (
                  filteredPackages.map((pkg) => (
                    <tr key={pkg._id}>
                      <td>
                        {pkg.packageImageUrl ? (
                          <img
                            src={pkg.packageImageUrl}
                            alt={pkg.title}
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
                      <td>{pkg.title}</td>

                      <td>{pkg.subTitle}</td>

                      <td>₹{pkg.actualPrice}</td>

                      <td>₹{pkg.discountedPrice}</td>

                      <td>{pkg.maxGuests}</td>

                      <td>{pkg?.packageItems?.length || 0}</td>

                      <td>{pkg?.packageAddons?.length || 0}</td>

                      <td>
                        <span
                          className={`status-badge ${
                            pkg.packageStatus === 1 ? "active" : "inactive"
                          }`}
                        >
                          {pkg.packageStatus === 1 ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => {
                            setSelectedPackage(pkg);

                            setShowEditPackagePopup(true);
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : !loading ? (
                  <tr>
                    <td colSpan={9} className="no-data">
                      No Packages Found
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={9} className="no-data">
                      Loading...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE */}

      {showCreatePackagePopup && (
        <CreatePackagePopup
          isOpen={showCreatePackagePopup}
          venueId={venue._id}
          onClose={() => setShowCreatePackagePopup(false)}
          onSuccess={callPackageApi}
        />
      )}

      {/* EDIT */}

      {showEditPackagePopup && (
        <EditPackagePopup
          isOpen={showEditPackagePopup}
          packageData={selectedPackage}
          onClose={() => setShowEditPackagePopup(false)}
          onSuccess={callPackageApi}
        />
      )}
    </>
  );
};

export default VenuePackagesPopup;
