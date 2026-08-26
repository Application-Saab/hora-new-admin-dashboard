// Popup.js
import React from 'react';
import './commonpopup.css';

const Popup = ({ isOpen, onClose, heading, popupBody, buttonText, mainButtonAction =()=>{}, disabled , mainBtnVisible=true}) => {
    if (!isOpen) return null;

    return (
        <div className="commonpopup-overlay">
            <div className="commonpopup-content">
                <h2 className="commonpopup-heading">{heading}</h2>
                <div className='commonpopup-body'>
                    {popupBody}
                </div>
                <div className='commonpopup-footer'>
                    {mainBtnVisible &&
                    <button
                        disabled={disabled}
                        onClick={mainButtonAction}
                        className='mainPopup-btn'
                    >
                        {buttonText}
                    </button>
                    }

                    <button
                        onClick={onClose}
                        className='cancel-btn'
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Popup;
