"use client";
import React, { useEffect, useState } from "react";
import "./capsuleTracking.css";
import { getCapsuleTracking } from "../../../services/capsuleTracking"; // path adjust karo


const Capsuletracking = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const { data, pagination } = await getCapsuleTracking({
        page,
        limit: 10,
      });

      setOrders(data);
      setTotalPages(pagination.totalPages || 1);

    } catch (err) {
      console.error("Error fetching vendors", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const getOrderId = (e) => {
    const orderId1 = 10800 + e;
    const updateOrderId = "#" + orderId1;
    return updateOrderId;
  };


  return (

    <div className="vendor-container">
      <div className="vendor-card">
        <h2 className="vendor-title">Capsule Tracking</h2>
        <div className="table-wrapper">
          <table className="vendor-table">
            <thead className="capsule-table-header">
              <tr>
                <th>Order ID</th>
                <th>User ID</th>
                <th>Capsule Link</th>
                <th>Total Photos Uploaded</th>
                <th>Total Likes</th>
                <th>Face Recognition Users</th>
                <th>User Folders</th>
                <th>Photos Downloaded</th>
                <th>Photos Shared</th>
                <th>Times link opened</th>
                <th>Total Regsitred users</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "20px" }}>
                    Fetching data...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center" }}>
                    No data found
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr key={index}>
                    <td>{getOrderId(order?.order_id)}</td>
                    <td>{order?.fromId}</td>
                    <td>
                      <a href={order?.orderWebLink} target="_blank" rel="noreferrer">
                        {order?.orderWebLink}
                      </a>
                    </td>
                    <td>{order?.counts?.imageCount || 0}</td>
                    <td>{order?.counts?.totalLikes || 0}</td>
                    <td>{order?.counts?.faceRecognitionCount || 0}</td>
                    <td>{order?.counts?.otherSubFoldersCount || 0}</td>
                    <td>{order?.counts?.totalDownloads || 0}</td>
                    <td>{order?.counts?.totalShares || 0}</td>
                    <td>{order?.counts?.totalClicks || 0}</td>
                    <td>{order?.counts?.totalViews || 0}</td>
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