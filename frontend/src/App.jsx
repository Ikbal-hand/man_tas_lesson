// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import StafTUDashboard from './pages/StafTUDashboard';
import WakaKurikulumDashboard from './pages/WakaKurikulumDashboard'; 
import DashboardKepalaSekolah from './pages/DashboardKepalaSekolah'; 

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/staf-tu-dashboard" element={<StafTUDashboard />} />
                <Route path="/waka-kurikulum-dashboard" element={<WakaKurikulumDashboard />} /> 
                 <Route path="/kepala-sekolah-dashboard" element={<DashboardKepalaSekolah />} />
            </Routes>
        </Router>
    );
}

export default App;