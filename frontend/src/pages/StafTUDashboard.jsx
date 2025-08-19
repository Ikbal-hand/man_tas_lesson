// frontend/src/pages/StafTUDashboard.jsx

import React from 'react';
// Hapus semua import yang tidak perlu, karena ini sekarang hanya halaman KONTEN
import RealtimeInfo from './RealtimeInfo';
import GuruMengajar from './GuruMengajar';
// ...

const StafTUDashboard = () => {
    // ... (hanya state dan logic yang berhubungan dengan konten dashboard)
    
    return (
        <div className="dashboard-staf-tu-container fade-in">
            {/* Hanya render kontennya saja */}
            <RealtimeInfo />
            {/* ... Kartu ringkasan ... */}
            <div className="monitoring-section">
                <GuruMengajar />
            </div>
        </div>
    );
};

export default StafTUDashboard;