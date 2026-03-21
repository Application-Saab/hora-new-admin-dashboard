"use client";
import React, { useState } from "react";
import "./UserFilter.css";

const InputGroup = ({ label, children }) => (
  <div className="input-group">
    <label>{label}</label>
    {children}
  </div>
);

const UserFilter = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [role, setRole] = useState("customer");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/admin_user_list",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: role,
            page: 1,
            per_page: 3000,
          }),
        }
      );

      const result = await response.json();

      if (result?.data?.users) {
        const filtered = result.data.users.filter((user) => {
          const createdAt = new Date(user.createdAt);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return createdAt >= start && createdAt <= end;
        });

        setUsers(filtered);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error(error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-filter">
      {/* <h2>Filter Users</h2> */}

 <h2 className="content-title">
                  Filter Users <span style={{fontSize: "10px"}}>(CreatedAt date)</span>
                </h2>
      <form className="filter-form" onSubmit={handleSubmit}>
        <div className="input-row">
          <InputGroup label="Start Date">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup label="End Date">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup label="Role">
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="customer">Customer</option>
              <option value="supplier">Supplier</option>
            </select>
          </InputGroup>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Fetching..." : "Submit"}
        </button>
      </form>

      <div className="results">
        <h3>Users Found: {users.length}</h3>

        {users.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Phone Number</th>
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 10000).map((user, index) => (
                  <tr key={user._id}>
                    <td>{index + 1}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>{user.phone || "-"}</td>
                    <td>
                      <td>
                        {typeof user.name === "string" && user.name.trim()
                          ? user.name.split(" ").slice(0, 2).join(" ")
                          : "N/A"}
                      </td>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserFilter;