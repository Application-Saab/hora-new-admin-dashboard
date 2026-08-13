"use client";
import React, { useEffect, useState } from "react";
import "./capsuleTracking.css";
import { getCapsuleTracking, getCapsuleUsers } from "../../../services/capsuleTracking";
import { BASE_URL, DRIVE_FOLDER_UPLOAD } from "@/utils/apiconstant.jsx";

const Capsuletracking = () => {
  const [activeTab, setActiveTab] = useState("capsule"); // 'capsule' or 'user'
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [retryLoadingRow, setRetryLoadingRow] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  const handleRetryDriveUpload = async (orderId, driveUrl, index) => {
    if (!driveUrl) {
      alert("Google Drive Link nahi mila is order ke liye.");
      return;
    }

    setRetryLoadingRow(index); 
    try {
      const response = await fetch(`${BASE_URL}${DRIVE_FOLDER_UPLOAD}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendorId: orderId + 10800, 
          folderUrl: driveUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create folder");
      }

      alert(`Images are uploading in background, will reflect on link in less than 1 hour for Order: ${orderId}`);

      fetchOrders();
    } catch (error) {
      console.error("Error in retry logic:", error);
      alert(error.message);
    } finally {
      setRetryLoadingRow(null);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);

      let response;
      let finalSearch = search;

      if (activeTab === "capsule" && search) {
        const numericValue = Number(search.replace("#", ""));

        if (!isNaN(numericValue)) {
          finalSearch =
            numericValue > 10800
              ? numericValue - 10800
              : numericValue;
        }
      }

      if (activeTab === "capsule") {
        response = await getCapsuleTracking({
          page,
          limit: 10,
          search: finalSearch,
          date:selectedDate,
        });
      } else {
        response = await getCapsuleUsers({
          page,
          limit: 10,
          search,
        });
      }

      setOrders(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);

    } catch (err) {
      console.error("Error fetching data", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setSearch("");
    setSelectedDate("");
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [page, activeTab, search, selectedDate]);

  const getOrderId = (e) => {
    const orderId1 = 10800 + e;
    return "#" + orderId1;
  };

  return (
    <div className="vendor-container">
      <div className="vendor-card">



        <h2 className="vendor-title">
          Capsule Tracking
        </h2>


        {/* Tab Buttons */}
        <div className="tab-container" style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
          <button
            className={`tab-btn ${activeTab === "capsule" ? "active" : ""}`}
            onClick={() => setActiveTab("capsule")}
            style={{ padding: "10px 20px", cursor: "pointer", backgroundColor: activeTab === "capsule" ? "#000" : "#ccc", color: activeTab === "capsule" ? "#fff" : "#000", border: "none", borderRadius: "5px" }}
          >
            By Capsule
          </button>
          <button
            className={`tab-btn ${activeTab === "user" ? "active" : ""}`}
            onClick={() => setActiveTab("user")}
            style={{ padding: "10px 20px", cursor: "pointer", backgroundColor: activeTab === "user" ? "#000" : "#ccc", color: activeTab === "user" ? "#fff" : "#000", border: "none", borderRadius: "5px" }}
          >
            By User
          </button>
        </div>

        <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder={
              activeTab === "capsule"
                ? "Search by Order ID"
                : "Search by Phone Number"
            }
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // reset page on search
            }}
            style={{
              padding: "10px",
              width: "300px",
              borderRadius: "5px",
              border: "1px solid #ccc"
            }}
          />

          {activeTab === "capsule" && (
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setPage(1);
                  }}
                  style={{
                    padding: "8px",
                    borderRadius: "5px",
                    border: "1px solid #ccc"
                  }}
                />
              </div>
            </div>
          )}

        </div>

        <div className="table-wrapper">
          <table className="vendor-table">
            <thead className="capsule-table-header">
              {activeTab === "capsule" ? (
                // Capsule Table Headers
                <tr>
                  <th>Order ID</th>
                  <th>Created At</th>
                  <th>Capsule Link</th>
                  <th>Total Photos</th>
                  <th>Total From Drive</th>
                  <th>Status</th>
                  <th>Total Registered users</th>
                  <th>Face Counts</th>
                  <th>Face Recognition</th>
                  <th>Folders</th>
                  <th>Total Likes</th>
                  <th>Downloaded</th>
                  <th>Total Image Shared</th>
                  <th>Capsule Share Count</th>
                  <th>Locker Image Count</th>
                  <th>Times link opened</th>
                  <th>First Device Type</th>
                  <th>Second Device Type</th>
                  
                </tr>
              ) : (
                // User Table Headers
                <tr>
                  <th>User Number</th>
                  <th>Host</th>
                  <th>Guest</th>
                  <th>Like</th>
                  <th>Upload</th>
                  <th>By Capsule</th>
                </tr>
              )}
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={activeTab === "capsule" ? "11" : "6"} style={{ textAlign: "center", padding: "20px" }}>
                    Fetching data...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === "capsule" ? "11" : "6"} style={{ textAlign: "center" }}>
                    No data found
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr key={index}>
                    {activeTab === "capsule" ? (
                      (() => {
                        let driveUrl = "";

                        if (order?.allDriveLinks && order.allDriveLinks.length > 0) {
                          const foundObj = order.allDriveLinks.find(d => d.linkType === "rawPhotos") || order.allDriveLinks[0];
                          driveUrl = foundObj?.link || order?.orderDriveLink || "";
                        } else {
                          driveUrl = order?.orderDriveLink || "";
                        }

                        const isDisabled = order?.folderStatus === "processing" ||
                          retryLoadingRow === index ||
                          !driveUrl ||
                          order?.counts?.totalPersonCount !== 0;

                        return (
                          <>
                            <td>{getOrderId(order?.order_id)}</td>
                            <td>
                              {order?.imageUploadCounts?.driveProvidedAt
                                ? new Date(order.imageUploadCounts.driveProvidedAt).toLocaleString("en-IN")
                                : "-"}
                            </td>
                            <td>
                              <a
                                href={`${order?.orderWebLink}${order?.orderWebLink?.includes('?') ? '&' : '?'}fromPanel=true`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {order?.orderWebLink}
                              </a>
                            </td>
                            <td>{order?.counts?.imageCount || 0}</td>

                            {/* Drive Count aur payload handling */}
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "120px" }}>
                                {driveUrl ? (
                                  <a
                                    href={driveUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: "#007bff", textDecoration: "underline" }}
                                  >
                                    {order?.imageUploadCounts?.totalFromDrive || 0}
                                  </a>
                                ) : (
                                  <span>{order?.imageUploadCounts?.totalFromDrive || 0}</span>
                                )}

                                <button
                                  onClick={() =>
                                    handleRetryDriveUpload(
                                      order?.order_id,
                                      driveUrl,
                                      index,
                                    )
                                  }
                                  disabled={isDisabled}
                                  style={{
                                    padding: "4px 8px",
                                    fontSize: "12px",
                                    backgroundColor:
                                      order?.counts?.totalPersonCount === 0 ||
                                      !order?.counts?.totalPersonCount
                                        ? "#d9534f"
                                        : "#97538c",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "4px",
                                    display: "flex",
                                    alignItems: "center",
                                    opacity: isDisabled ? 0.5 : 1,
                                    cursor: isDisabled
                                      ? "not-allowed"
                                      : "pointer",
                                  }}
                                >
                                  {retryLoadingRow === index
                                    ? "Retring..."
                                    : "Retry"}
                                </button>
                              </div>
                            </td>
                            <td>
                              <span
                                style={{
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  fontWeight: "500",
                                  textTransform: "capitalize",
                                  backgroundColor:
                                    order?.folderStatus === "done"
                                      ? "#d4edda"
                                      : order?.folderStatus === "processing"
                                        ? "#fff3cd"
                                        : "#f8d7da",
                                  color:
                                    order?.folderStatus === "done"
                                      ? "#155724"
                                      : order?.folderStatus === "processing"
                                        ? "#856404"
                                        : "#721c24",
                                }}
                              >
                                {order?.folderStatus || "pending"}
                              </span>
                            </td>
                            <td>{order?.counts?.totalViews || 0}</td>
                            <td>{order?.counts?.totalPersonCount || 0}</td>
                            <td>{order?.counts?.faceRecognitionCount || 0}</td>
                            <td>{order?.counts?.otherSubFoldersCount || 0}</td>
                            <td>{order?.counts?.totalLikes || 0}</td>
                            <td>{order?.counts?.totalDownloads || 0}</td>
                            <td>{order?.counts?.totalShares || 0}</td>
                            <td>{order?.counts?.shareCapsuleClicks || 0}</td>
                            <td>{order?.counts?.lockerImageCount || 0}</td>
                            <td>{order?.counts?.totalClicks || 0}</td>
                            <td>{order?.counts?.firstDeviceType || "-"}</td>
                            <td>{order?.counts?.secondDeviceType || "-"}</td>
                            
                          </>
                        );
                      })()
                    ) : (
                      <>
                        <td>{order?.phone || "-"}</td>
                        <td>{order?.totalOrders || 0}</td>
                        <td>{order?.guestCapsulesCount || 0}</td>
                        <td>{order?.totalLikes || 0}</td>
                        <td>{order?.totalUploads || 0}</td>
                        <td>{order?.fromCapsule ? "yes" : "No" || "-"}</td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="vendor-pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Capsuletracking;