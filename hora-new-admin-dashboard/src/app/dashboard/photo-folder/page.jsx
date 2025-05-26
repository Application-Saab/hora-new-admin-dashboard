'use client';
import { useState } from 'react';
// import { useRouter } from 'next/navigation'; // Corrected import
import CheckCustomer from './CheckCustomer.jsx'; // Corrected import
// import CheckExistFolder from './CheckExistFolder.jsx'; // Corrected import
import ImageUpload from './uploadInfolder/ImageUpload.jsx'; // Corrected import
import "./photoFolder.css"

const PhotoCreateProject = () => {
  const [folderTitle, setFolderTitle] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [showFolder, setShowFolder] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [enteredNum, setEnteredNum] = useState(null);
  const [isCustomer, setIsCustomer] = useState(false);
  const [showForm , setShowForm] = useState(true);
  // const [activeTab, setActiveTab] = useState('create'); // state to handle active tab ('create' or 'check')

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    setShowFolder(false);
    try {
      // Make API call to create folder
      const response = await fetch('https://horaservices.com:3000/api/photo/CreateFolder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folderName: folderTitle,
          customerId: customerId,
          vendorId: vendorId || "HORA",
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create folder");
      }
      alert(`Folder created successfully for ${enteredNum}:`);
      console.log('Folder created successfully:', data);
      setShowFolder(true);
      setShowForm(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      alert(error.message); // Show the actual error message in an alert
    }
  };

  const handleCustomerId = (id) => {
    console.log(id, 'id from check customer');
    console.log(isCustomer ,'is custoimer')
    setCustomerId(id); // Update parent state when customer is found/added
  };

  // const handleFolderCheck = (id) => {
  //   alert('id', id); // Update parent state when customer is found/added
  // };

  // const handleTabSwitch = (tab) => {
  //   setActiveTab(tab); // Switch between tabs
  // };

  return (
    <div style={{ padding: '20px' }}>
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

      {showForm && (<>
         <h2>Create New Folder</h2>
        <form onSubmit={handleCreateFolder} className="createPhotoFolder">
          <div style={{ marginRight: '10px', padding: '5px' }}>
            <input
              type="text"
              placeholder="Enter Folder name"
              value={folderTitle}
              onChange={(e) => setFolderTitle(e.target.value)}
              required
              style={{ marginRight: '10px', padding: '5px' }}

            />
          </div>
          <CheckCustomer
            onCustomerIdChange={handleCustomerId}
            setEnteredNum={setEnteredNum}
            setIsCustomer={setIsCustomer}
          />
          <div style={{ marginRight: '10px', padding: '5px' }}>
            <input
              type="text"
              placeholder="Enter order/vendor ID"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              style={{ marginRight: '10px', padding: '5px' }}
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
        </>)}

      {showFolder && (
        <ImageUpload customerId={customerId} folderTitle={folderTitle} enteredNum={enteredNum} />
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