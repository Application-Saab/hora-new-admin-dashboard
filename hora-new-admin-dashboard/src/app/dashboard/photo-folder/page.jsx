
'use client';
import { useState } from 'react';
// import { useRouter } from 'next/navigation'; // Corrected import
import CheckCustomer from './CheckCustomer.jsx'; // Corrected import
import CheckExistFolder from './CheckExistFolder.jsx'; // Corrected import
import ImageUpload from './uploadInfolder/ImageUpload.jsx'; // Corrected import
import "./photoFolder.css"
const PhotoCreateProject = () => {
  const [folderTitle, setFolderTitle] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [showFolder, setShowFolder] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  // const router = useRouter();

  const handleCreateFolder = async (e) => {
    e.preventDefault();

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

      console.log('Folder created successfully:', data);
      setShowFolder(true);
    } catch (error) {
      console.error("Error creating folder:", error);
      alert(error.message); // Show the actual error message in an alert
    }
  };
  const handleCustomerId = (id) => {
    setCustomerId(id); // Update parent state when customer is found/added
  };
  const handleFolderCheck = (id) => {
    alert('id', id); // Update parent state when customer is found/added
  };
  return (<>
    <div style={{ padding: '20px' }}>
      <h1>Create a Dynamic Folder</h1>
      <form onSubmit={handleCreateFolder} className='createPhotoFolder'>
        <div>
          <div style={{ marginRight: '10px', padding: '5px' }}>
            <input
              type="text"
              placeholder="Enter Folder name"
              value={folderTitle}
              onChange={(e) => setFolderTitle(e.target.value)}

              required
            />
          </div>
          <CheckCustomer onCustomerIdChange={handleCustomerId} />

          <div style={{ marginRight: '10px', padding: '5px' }}>
            <input
              type="text"
              placeholder="Enter order/vendor  ID"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}


            />
          </div>
        </div>
        <button type="submit" className="buttonPrimary create-order" disabled={!customerId} >Create Folder</button>
      </form>
       <div className='checkFolder'>
        <h2>Check already existing folder</h2>
        <CheckExistFolder onCustomerFolderChange={handleFolderCheck}/>
      </div>
      
    </div>

    {showFolder && (
      <ImageUpload customerId={customerId} folderTitle={folderTitle} />)
    }

  </>);
};

export default PhotoCreateProject;

