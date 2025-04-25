"use client";
import { useEffect, useState } from "react";
import "./users.css";

const fetchAdminUsers = async (params) => {
  try {
    const response = await fetch(
      "https://horaservices.com:3000/api/admin/admin_user_list",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
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

  const loadUsers = async () => {
    const data = await fetchAdminUsers({
      page: currentPage,
      per_page: 15,
      role: "customer",
      status: 1,
    });
    if (data && data.data && data.data.users) {
      setUsers(data.data.users);
      setLastPage(data.data.paginate.last_page);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  useEffect(() => {
    if (!phone) {
      loadUsers(); // Fetch all users when input is cleared
    }
  }, [phone]);

  const handleSearch = async () => {
    if (!phone) {
      loadUsers(); // Reset to full user list if search box is empty
      return;
    }

    const data = await fetchAdminUsers({
      page: 1,
      per_page: 2000,
      role: "customer",
      status: 1,
      phone,
    });

    if (data && data.data && data.data.users) {
      setUsers(data.data.users);
    }
  };


   // State for modal visibility
   const [isModalOpen, setIsModalOpen] = useState(false);

   // Renamed state for user list
   const [userList, setUserList] = useState([]);
 
   // Loading indicator
   const [loading, setLoading] = useState(false);
 
   // Fetch users from API
   const fetchUsers = async () => {
     setLoading(true);
     try {
       const response = await fetch('https://horaservices.com:3000/api/admin/admin_user_list', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           // 'Authorization': 'Bearer YOUR_TOKEN' // Uncomment if needed
         },
         body: JSON.stringify({
           role: 'customer',
           page: 1,
           per_page: 250,
           status: 1,
           phone: ''
         }),
       });
 
       const data = await response.json();
 
       // Extracting users from the response (adjusting based on the correct path)
       if (data && data.data && Array.isArray(data.data.users)) {
         setUserList(data.data.users);  // Now using the 'users' array from the response
       } else {
         setUserList([]);  // Handle cases where the expected data is not found
       }
     } catch (error) {
       console.error('Error fetching users:', error);
       setUserList([]); // Optionally, you can reset userList in case of error
     } finally {
       setLoading(false);
     }
   };
 
   const handleShowUsers = () => {
     setIsModalOpen(true);
     fetchUsers();
   };
 
   const handleCloseModal = () => {
     setIsModalOpen(false);
   };

   
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Customer Users</h2>
      <input
        type="text"
        placeholder="Enter phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        style={{
          padding: "10px",
          marginBottom: "20px",
          width: "300px",
          textAlign: "center",
        }}
      />

<button onClick={handleShowUsers}>Show Customer List</button>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Customer List</h2>

            {loading ? (
              <p>Loading users...</p>
            ) : (
              <div className="table-container">
                {Array.isArray(userList) && userList.length > 0 ? (
                  <table>
                    <thead>
                      <tr
                       style={{
                        color: "white",
                        background:
                          "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)",
                      }}
                      >
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userList.map((user, index) => (
                        <tr key={index}>
                          <td>{user.name || 'N/A'}</td>
                          <td>{user.phone || 'No phone'}</td>
                          <td>{new Date(user.createdAt).toLocaleString() || 'No date'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No users found</p>
                )}
              </div>
            )}

            <button className="close-btn" onClick={handleCloseModal}>Close</button>
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
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Name</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Phone</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Created At
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user._id}
              style={{ backgroundColor: "#f9f9f9", textAlign: "center" }}
            >
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {user._id}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {user.name}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {user.phone}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: "20px" }}>
        <button
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            cursor: "pointer",
            background:
              "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
          disabled={currentPage === 1}
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
            cursor: "pointer",
            background:
              "linear-gradient(90deg, rgba(221, 94, 137, 0.8), #97538c)",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
          disabled={currentPage === lastPage}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminUsers;
