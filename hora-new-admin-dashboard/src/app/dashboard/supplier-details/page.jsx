"use client";

import { useEffect, useState } from "react";
import { BASE_URL } from "../../../utils/apiconstant";

const fetchAdminUsers = async (page, phone, setUsers, setLastPage) => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/admin/admin_user_list`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page,
          per_page: 15,
          role: "supplier",
          status: 1,
          phone: phone || undefined,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.data && data.data.users) {
      setUsers(data?.data?.users);
      setLastPage(data?.data?.paginate?.last_page);
    }
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      await fetchAdminUsers(currentPage, phone, setUsers, setLastPage);
      setIsLoading(false);
    };
    loadUsers();
  }, [currentPage, phone]);

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Supplier Users</h2>
      <input
        type="text"
        placeholder="Enter phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ padding: "10px", marginBottom: "20px", width: "300px" }}
      />

      <div style={{ position: "relative", minHeight: "300px" }}>
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            <div
              style={{
                padding: "15px 30px",
                backgroundColor: "white",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                borderRadius: "5px",
                fontWeight: "bold",
              }}
            >
              Loading...
            </div>
          </div>
        )}

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <thead>
            <tr
              style={{
                color: "white",
                background:
                  "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)",
              }}
            >
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>ID</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                Name
              </th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                City
              </th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                Phone
              </th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                Job Profile
              </th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                Created At
              </th>
            </tr>
          </thead>
          <tbody>
            {users?.length > 0 ? (
              users?.map((user) => (
                <tr
                  key={user?._id}
                  style={{ backgroundColor: "#f9f9f9", textAlign: "center" }}
                >
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {user?._id}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {user?.name?.length > 22
                      ? user?.name?.substring(0, 22) + "..."
                      : user?.name}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {user?.city}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {user?.phone}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {user?.job_profile}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  style={{ padding: "20px", textAlign: "center" }}
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            cursor: currentPage === 1 || isLoading ? "not-allowed" : "pointer",
            background:
              "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)",
            color: "white",
            border: "none",
            borderRadius: "5px",
            opacity: currentPage === 1 || isLoading ? 0.6 : 1,
          }}
          disabled={currentPage === 1 || isLoading}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>
        <span style={{ fontSize: "18px", fontWeight: "bold" }}>
          {" "}
          Page {currentPage} of {lastPage}{" "}
        </span>
        <button
          style={{
            padding: "10px 20px",
            marginLeft: "10px",
            cursor:
              currentPage === lastPage || isLoading ? "not-allowed" : "pointer",
            background:
              "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)",
            color: "white",
            border: "none",
            borderRadius: "5px",
            opacity: currentPage === lastPage || isLoading ? 0.6 : 1,
          }}
          disabled={currentPage === lastPage || isLoading}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminUsers;
