// Popup.js
import React from 'react';
import './commonpopup.css';

const Popup = ({ isOpen, onClose, heading, popupBody, buttonText, mainButtonAction, disabled }) => {
    if (!isOpen) return null;

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h2 className="popup-heading">{heading}</h2>
                <div className='popup-body'>
                    {popupBody}
                </div>
                <div className='popup-footer'>
                    <button
                        disabled={disabled}
                        onClick={mainButtonAction}
                        className='mainPopup-btn'
                    >
                        {buttonText}
                    </button>

                    <button
                        onClick={onClose}
                        className='cancel-btn'
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Popup;
