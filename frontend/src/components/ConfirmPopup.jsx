// frontend/src/components/ConfirmPopup.jsx

import React from 'react';
import './ConfirmPopup.css'; // Kita akan buat file CSS ini

const ConfirmPopup = ({ message, onConfirm, onCancel }) => {
    return (
        <div className="popup-overlay">
            <div className="popup-container">
                <p>{message}</p>
                <div className="popup-actions">
                    <button onClick={onConfirm} className="confirm-button">Ya</button>
                    <button onClick={onCancel} className="cancel-button">Tidak</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmPopup;