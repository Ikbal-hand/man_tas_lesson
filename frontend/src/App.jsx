// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import StafTUDashboard from './pages/StafTUDashboard'; // Import komponen dashboard

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                {/* Rute baru untuk dashboard Staf TU */}
                <Route path="/staf-tu-dashboard" element={<StafTUDashboard />} />
            </Routes>
        </Router>
    );
}

export default App;