"use client";
import { useState } from "react";
// import { useRouter } from 'next/navigation'; // Corrected import
import CheckCustomer from "./CheckCustomer.jsx"; // Corrected import
// import CheckExistFolder from './CheckExistFolder.jsx'; // Corrected import
import ImageUpload from "./uploadInfolder/ImageUpload.jsx"; // Corrected import
import "./photoFolder.css";
import { BASE_URL, DRIVE_FOLDER_UPLOAD } from "@/utils/apiconstant.jsx";

const PhotoCreateProject = () => {
  const [folderTitle, setFolderTitle] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [showFolder, setShowFolder] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [enteredNum, setEnteredNum] = useState(null);
  const [isCustomer, setIsCustomer] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [driveVendorId, setDriveVendorId] = useState("");
  const [driveFolderUrl, setDriveFolderUrl] = useState("");
  const [driveUploadLoading, setDriveUploadLoading] = useState(false);
  const [refetchDriveImages, setRefetchDriveImages] = useState(false);
  // const [activeTab, setActiveTab] = useState('create'); // state to handle active tab ('create' or 'check')

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    setShowFolder(false);
    try {
      // Make API call to create folder
      const response = await fetch(
        "http://localhost:5000/api/photo/CreateFolder",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            folderName: folderTitle,
            customerId: customerId,
            vendorId: vendorId || "HORA",
          }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create folder");
      }
      alert(`Folder created successfully for ${enteredNum}:`);
      console.log("Folder created successfully:", data);
      setShowFolder(true);
      setShowForm(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      alert(error.message); // Show the actual error message in an alert
    }
  };

  const handleCustomerId = (id) => {
    console.log(id, "id from check customer");
    console.log(isCustomer, "is custoimer");
    setCustomerId(id); // Update parent state when customer is found/added
  };

  // const handleFolderCheck = (id) => {
  //   alert('id', id); // Update parent state when customer is found/added
  // };

  // const handleTabSwitch = (tab) => {
  //   setActiveTab(tab); // Switch between tabs
  // };

  const handleUploadDriveUrl = async (e) => {
    e.preventDefault();
    setDriveUploadLoading(true);
    setShowFolder(false);
    try {
      // Make API call to create folder
      const response = await fetch(`${BASE_URL}${DRIVE_FOLDER_UPLOAD}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendorId: driveVendorId || "HORA",
          folderUrl: driveFolderUrl,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create folder");
      }

      const googleResp = await fetch(`${BASE_URL}/api/photo/drive/update-google-sheet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIdDb: driveVendorId - 10800,
          orderIdCustomer: driveVendorId,
          phone: data?.phoneNo,
          fulfillmentDate:  data?.order_date
                        ? new Date(data?.order_date).toLocaleDateString("en-GB")
                        : "N/A",
          services: "Photography",
          driveLink: driveFolderUrl,
          horaWebLink: data?.webLink,
        }),
      });
      console.log(
        "%c [ googleResp ]-95",
        "font-size:13px; background:pink; color:#bf2c9f;",
        googleResp
      );

      alert(`Images are uploading in background, will reflect on link in less then 1 hour for : ${driveVendorId}:`);
      console.log("........", data);
      setFolderTitle(data?.folderName);
      setCustomerId(data?.customerId);
      setEnteredNum(data?.phoneNo);
      setDriveUploadLoading(false);
      setShowFolder(true);
      setShowForm(false);
      setRefetchDriveImages(true);
    } catch (error) {
      setDriveUploadLoading(false);
      console.error("Error creating folder:", error);
      alert(error.message); // Show the actual error message in an alert
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* <h1>Manage Folders</h1> */}

      {/* <div className="tabs">
        <button
          className={activeTab === 'create' ? 'active-tab buttonSecondary' : 'checkFolder btn'}
          onClick={() => handleTabSwitch('create')}
        >
          Create Folder
        </button>
        <button
          className={activeTab === 'check' ? 'active-tab buttonSecondary' : 'checkFolder btn'}
          onClick={() => handleTabSwitch('check')}
        >
          Check Folder
        </button>
      </div> */}

      {showForm && (
        <>
          <div className="createPhotoFolderContainer">
            <div className="createPhotoFolderDiv">
              <h2>Create New Folder</h2>
              <form onSubmit={handleCreateFolder} className="createPhotoFolder">
                <div style={{ marginRight: "10px", padding: "5px" }}>
                  <input
                    type="text"
                    placeholder="Enter Folder name"
                    value={folderTitle}
                    onChange={(e) => setFolderTitle(e.target.value)}
                    required
                    style={{ marginRight: "10px", padding: "5px" }}
                  />
                </div>
                <CheckCustomer
                  onCustomerIdChange={handleCustomerId}
                  setEnteredNum={setEnteredNum}
                  setIsCustomer={setIsCustomer}
                />
                <div style={{ marginRight: "10px", padding: "5px" }}>
                  <input
                    type="text"
                    placeholder="Enter order/vendor ID"
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value)}
                    style={{ marginRight: "10px", padding: "5px" }}
                  />
                </div>
                <button
                  type="submit"
                  className="buttonPrimary create-order"
                  disabled={!customerId}
                >
                  Create Folder
                </button>
              </form>
            </div>
            <div className="createPhotoFolderDiv">
              <h2>Bulk Upload</h2>
              <form
                onSubmit={handleUploadDriveUrl}
                className="createPhotoFolder"
              >
                {/* <CheckCustomer
                  onCustomerIdChange={handleCustomerId}
                  setEnteredNum={setEnteredNum}
                  setIsCustomer={setIsCustomer}
                /> */}
                <p>
                  Use only publicly accessible drive link (Anyone with the link
                  access)
                </p>
                <div style={{ marginRight: "10px", padding: "5px" }}>
                  <input
                    type="text"
                    placeholder="Enter order/vendor ID"
                    value={driveVendorId}
                    onChange={(e) => setDriveVendorId(e.target.value)}
                    style={{ marginRight: "10px", padding: "5px" }}
                  />
                </div>
                <div
                  style={{ marginRight: "10px", padding: "5px", width: "100%" }}
                >
                  <input
                    type="text"
                    placeholder="Google drive public folder URL"
                    value={driveFolderUrl}
                    onChange={(e) => setDriveFolderUrl(e.target.value)}
                    style={{
                      marginRight: "10px",
                      padding: "5px",
                      width: "100%",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="buttonPrimary create-order"
                  disabled={!driveVendorId || !driveFolderUrl}
                >
                  {driveUploadLoading ? "Uploading..." : "Upload from Drive"}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {showFolder && (
        <ImageUpload
          refetchDriveImages={refetchDriveImages}
          customerId={customerId}
          folderTitle={folderTitle}
          enteredNum={enteredNum}
        />
      )}

      {/* {activeTab === 'check' && (
        <div className="checkFolder">
          <h2>Check already existing folder</h2>
          <CheckExistFolder onCustomerFolderChange={handleFolderCheck} />
        </div>
      )} */}
    </div>
  );
};

export default PhotoCreateProject;
