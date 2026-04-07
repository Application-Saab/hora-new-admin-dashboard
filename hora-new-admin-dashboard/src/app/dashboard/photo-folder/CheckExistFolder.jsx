import React, { useState, useEffect } from "react";
import CheckCustomer from "./CheckCustomer"; // Import the CheckCustomer component
import ImageUpload from "./uploadInfolder/ImageUpload"; // Import the ImageUpload component
import { BASE_URL } from "../../../utils/apiconstant";
const CheckExistFolder = () => {
  const [customerId, setCustomerId] = useState("");
  const [folders, setFolders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [enteredNum, setEnteredNum] = useState(null);
const [ setError] = useState(null);
  // Fetch folder details based on customerId
  useEffect(() => {
    if (customerId) {
      const fetchFolders = async () => {
        setLoading(true);
        // Reset previous folders
        // setCustomerId(''); // Reset previous errors
        try {
          const response = await fetch(
            `${BASE_URL}/api/photo/GetFoldersByCustomerId/${customerId}`
          );
          if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
          }
          const data = await response.json();
          setFolders(data.folders); // Store the folder details
         
          // Store the first folder's name and customerId in localStorage
          // if (data.folders.length > 0) {
          //   localStorage.setItem(
          //     'userDetails',
          //     JSON.stringify({ folderTitle: data.folders[0].folderName, customerId })
          //   );
          // }
          setLoading(false);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchFolders();
    }
  }, [customerId]);

  // Function to delete the folder
  // const deleteFolder = async (folderName) => {
  //   setLoading(true);
  //   try {
  //     const response = await fetch(
  //       `${BASE_URL}/api/photo/DeleteFolder`,
  //       {
  //         method: "DELETE",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           folderName: folderName,
  //           customerId: customerId,
  //         }),
  //       }
  //     );

  //     if (response.ok) {
  //       // Remove the folder from the state without making a new fetch request
  //       setFolders(folders.filter((folder) => folder.folderName !== folderName));
  //       alert(`Folder "${folderName}" deleted successfully.`);
  //     } else {
  //       const data = await response.json();
  //       setError(data.message || "An error occurred while deleting the folder.");
  //     }
  //   } catch (error) {
  //     console.log(error)
  //     setError("Failed to delete folder.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
useEffect(() => {

setFolders(null);

}, [customerId]);
  return (
    <div>
      {/* CheckCustomer component to get customer ID */}
      <CheckCustomer onCustomerIdChange={setCustomerId} setEnteredNum={setEnteredNum} />

      {loading ? (
        <div>Loading...</div>
      ) : folders && folders.length > 0  ? (
        <div>
          <h3>Customer {enteredNum} has the following folders:</h3>
          <ul>
            {folders.map((folder) => (
              <li key={folder._id}>
         
                <h4>Folder Name: {folder.folderName}</h4>
                <p>Customer ID: {folder.customerId}</p>
                {/* <button
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
                  className="buttonSecondary"
                >
                  Delete Folder
                </button> */}
                <ImageUpload customerId={folder.customerId} folderTitle={folder.folderName} />
              </li>
            
              
            ))}
          </ul>
        </div>
      ) : (
        customerId && <div>Customer {enteredNum} has no folders.</div>
      )}


    </div>
  );
};

export default CheckExistFolder;