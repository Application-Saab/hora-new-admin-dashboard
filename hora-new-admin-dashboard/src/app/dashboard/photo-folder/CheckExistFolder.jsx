import React, { useState, useEffect } from "react";
import CheckCustomer from "./CheckCustomer";
import ImageUpload from "./uploadInfolder/ImageUpload";

const CheckExistFolder = () => {
  const [customerId, setCustomerId] = useState("");
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enteredNum, setEnteredNum] = useState(null);
  const [isCustomer, setIsCustomer] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!customerId || !isCustomer) return;

    const fetchFolders = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://horaservices.com:3000/api/photo/GetFoldersByCustomerId/${customerId}`
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setFolders(data.folders || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFolders();
  }, [customerId, isCustomer]);

  const deleteFolder = async (folderName) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://horaservices.com:3000/api/photo/DeleteFolder",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ folderName, customerId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete folder.");
      }

      setFolders((prevFolders) =>
        prevFolders.filter((folder) => folder.folderName !== folderName)
      );

      alert(`Folder "${folderName}" deleted successfully.`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <CheckCustomer
        onCustomerIdChange={setCustomerId}
        setEnteredNum={setEnteredNum}
        setIsCustomer={setIsCustomer}
      />

      {/* {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>} */}

      {loading && <div>Loading...</div>}

      {!loading && folders.length > 0 ? (
        <div>
          <h3>Customer {enteredNum} has the following folders:</h3>
          <ul>
            {folders.map((folder) => (
              <li key={folder._id} style={{ marginBottom: "15px" }}>
                <h4>Folder Name: {folder.folderName}</h4>
                <p>Customer ID: {folder.customerId}</p>
                <button
                  onClick={() => deleteFolder(folder.folderName)}
                  disabled={loading}
                  style={{
                    backgroundColor: "#FF5733",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    padding: "5px 10px",
                    cursor: loading ? "not-allowed" : "pointer",
                    margin: "10px",
                  }}
                >
                  Delete Folder
                </button>
                <ImageUpload
                  customerId={folder.customerId}
                  folderTitle={folder.folderName}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        customerId && !loading && <div>Customer {enteredNum} has no folders.</div>
      )}
    </div>
  );
};

export default CheckExistFolder;