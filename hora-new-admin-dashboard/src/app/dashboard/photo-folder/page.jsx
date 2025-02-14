
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Corrected import
import CheckCustomer from './CheckCustomer.jsx'; // Corrected import
import CheckExistFolder from './CheckExistFolder.jsx'; // Corrected import
import "./photoFolder.css"
const PhotoCreateProject = () => {
  const [folderTitle, setfolderTitle] = useState('');
  const [vendorId, setVendorId] = useState('');

  const [customerId, setCustomerId] = useState(null);
  const router = useRouter();

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
          vendorId: vendorId || "HORA", // Add vendorId if available
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create folder"); // Show actual error message if available
      }
  
      console.log('Folder created successfully:', data);

      // Store the folder name in localStorage for future reference
      localStorage.setItem('userDetails', JSON.stringify({ folderTitle, customerId }));

      // Redirect to the dynamic folder page using URL parameters
      router.push(`/dashboard/photo-folder/${encodeURIComponent(folderTitle)}`);
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
          <input
            type="text"
            placeholder="Enter Folder name"
            value={folderTitle}
            onChange={(e) => setfolderTitle(e.target.value)}
            style={{ marginRight: '10px', padding: '5px' }}
            required
          />
        </div>
        <CheckCustomer onCustomerIdChange={handleCustomerId} />
        <div>

          <input
            type="text"
            placeholder="Enter order/vendor  ID"
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            style={{ marginRight: '10px', padding: '5px' }}

          />
        </div>
        <button type="submit" className="buttonPrimary" disabled={!customerId}>Create Folder</button>
      </form>
      <div className='checkFolder'>
        <h2>Check already existing folder</h2>
        <CheckExistFolder onCustomerFolderChange={handleFolderCheck} />
      </div>
    </div>



  </>);
};

export default PhotoCreateProject;

