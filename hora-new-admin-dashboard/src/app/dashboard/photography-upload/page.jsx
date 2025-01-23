'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CreatePhotoProject = () => {
  const [customerName, setCustomerName] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [orderId, setOrderId] = useState('');
  const [createdFolders, setCreatedFolders] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Load previously created folders from localStorage
    const storedFolders = JSON.parse(localStorage.getItem('createdFolders')) || [];
    setCreatedFolders(storedFolders);
  }, []);

  const handleCreateFolder = (e) => {
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

    // Create folder name based on customer name and order ID
    const folderName = `${customerName}_${orderId}`;

    // Store the folder name in localStorage for future reference
    const updatedFolders = [...createdFolders, folderName];
    localStorage.setItem('createdFolders', JSON.stringify(updatedFolders));

    // Update the created folders state
    setCreatedFolders(updatedFolders);

    // Redirect to the dynamic folder page
    router.push(`/dashboard/photography-upload/${folderName}`);
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
        />
        <input
          type="text"
          placeholder="Enter customer number"
          value={customerNumber}
          onChange={(e) => setCustomerNumber(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          type="text"
          placeholder="Enter order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button type="submit" style={{ padding: '5px 10px' }}>Create Folder</button>
      </form>

      {createdFolders.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>Previous Folders</h2>
          <ul>
            {createdFolders.map((folder, index) => (
              <li key={index}>
                <a href={`/dashboard/photography-upload/${folder}`} style={{ textDecoration: 'none' }}>
                  {folder}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CreatePhotoProject;

