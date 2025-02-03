'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Corrected import

const CreatePhotoProject = () => {
  const [customerName, setCustomerName] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [orderId, setOrderId] = useState('');
  const [createdFolders, setCreatedFolders] = useState([]);
  const router = useRouter();

  const handleCreateFolder = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!customerName.match(/^[a-zA-Z0-9]+$/)) {
      alert('Customer name should only contain letters and numbers.');
      return;
    }

    if (!orderId.match(/^[a-zA-Z0-9]+$/)) {
      alert('Order ID should only contain letters and numbers.');
      return;
    }

    // Validate customer number (must be exactly 10 digits)
    // if (!customerNumber.match(/^\d{10}$/)) {
    //   alert('Customer number must be exactly 10 digits.');
    //   return;
    // }

    // Create folder name based on customer name and order ID
    const folderId = `${customerName}_${orderId}`;

    try {
      // Make API call to create folder
      const response = await fetch('https://horaservices.com:3000/api/photo/CreateFolder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folderName: folderId,
          customerId: customerNumber,
          vendorId: '', // Add vendorId if available
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create folder');
      }

      const data = await response.json();
      console.log('Folder created successfully:', data);

      // Update the created folders state first
      // const updatedFolders = [...createdFolders, folderId];
      // setCreatedFolders(updatedFolders);

      // Store the folder name in localStorage for future reference
      localStorage.setItem('userDetails', JSON.stringify({ folderId, customerNumber }));

      // Redirect to the dynamic folder page using URL parameters
      router.push(`/dashboard/photography-upload/${encodeURIComponent(folderId)}`);
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Failed to create folder. Please try again.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Create a Dynamic Folder</h1>
      <form onSubmit={handleCreateFolder}>
        <input
          type="text"
          placeholder="Enter customer name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
          required
        />
        <input
          type="text"
          placeholder="Enter customer number*"
          value={customerNumber}
          onChange={(e) => setCustomerNumber(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
          required
        />
        <input
          type="text"
          placeholder="Enter order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
          required
        />
        <button type="submit" style={{ padding: '5px 10px' }}>Create Folder</button>
      </form>

      {/* {createdFolders.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>Previous Folders</h2>
          <ul>
            {createdFolders.map((folder, index) => (
              <li key={index}>
                <a
                  href={`/dashboard/photography-upload?folderId=${encodeURIComponent(folder)}`}
                  style={{ textDecoration: 'none' }}
                >
                  {folder}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )} */}
    </div>
  );
};

export default CreatePhotoProject;
