// frontend/src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Jika `children` ada (versi lama), render `children`. Jika tidak, render `Outlet`.
    // Ini membuat komponen lebih fleksibel.
    return children ? children : <Outlet />;
};

export default ProtectedRoute;