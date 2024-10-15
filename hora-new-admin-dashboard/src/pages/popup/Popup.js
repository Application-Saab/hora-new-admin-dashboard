// Popup.js
import React from 'react';
import './popup.css'; // Add CSS for styling

const Popup = ({ isOpen, address, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Order Address</h2>
        <p>{address}</p>
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Popup;
