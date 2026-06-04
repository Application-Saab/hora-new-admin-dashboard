"use client";
import React, { useEffect, useState } from "react";
import "./capsuleTracking.css";
import { getCapsuleTracking, getCapsuleUsers } from "../../../services/capsuleTracking";

const Capsuletracking = () => {
  const [activeTab, setActiveTab] = useState("capsule"); // 'capsule' or 'user'
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

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
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [page, activeTab, search]);

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

        <div style={{ marginBottom: "20px" }}>
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
                  <th>Total Likes</th>
                  <th>Face Recognition</th>
                  <th>Folders</th>
                  <th>Downloaded</th>
                  <th>Shared</th>
                  <th>Total Registered users</th>
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
                           target="_blank" rel="noreferrer">
                            {order?.orderWebLink}
                          </a>
                        </td>
                        <td>{order?.counts?.imageCount || 0}</td>
                        <td>{order?.counts?.totalLikes || 0}</td>
                        <td>{order?.counts?.faceRecognitionCount || 0}</td>
                        <td>{order?.counts?.otherSubFoldersCount || 0}</td>
                        <td>{order?.counts?.totalDownloads || 0}</td>
                        <td>{order?.counts?.totalShares || 0}</td>
                        <td>{order?.counts?.totalViews || 0}</td>
                        <td>{order?.counts?.totalClicks || 0}</td>
                        <td>{order?.counts?.firstDeviceType || "-"}</td>
                        <td>{order?.counts?.secondDeviceType || "-"}</td>
                      </>
                    ) : (
                      <>
                        {/* User Table Body (Adjust keys based on your User API response) */}
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