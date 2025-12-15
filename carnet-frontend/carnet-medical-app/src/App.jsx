// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/shared/Header';
import PatientLogin from './pages/Auth/PatientLogin';
import MedecinLogin from './pages/Auth/MedecinLogin';
import PatientRegister from './pages/Auth/PatientRegister';
import PatientArea from './pages/PatientArea';
import MedecinArea from './pages/MedecinArea'; // Le code pour l'espace Médecin est omis pour la concision mais est essentiel.
import Home from './pages/Home';
import NotFound from './pages/NotFound';

import './styles/app.css';

// Composant de protection de route
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        // Rediriger vers la page d'accueil ou de connexion
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Rediriger vers une page d'accès refusé ou le tableau de bord par défaut
        return <Navigate to={user.role === 'patient' ? '/patient/dashboard' : '/medecin/dashboard'} replace />;
    }

    return children;
};



const AppContent = () => {
    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />

                {/* Routes d'Authentification */}
                <Route path="/login/patient" element={<PatientLogin />} />
                <Route path="/login/medecin" element={<MedecinLogin />} />
                <Route path="/register/patient" element={<PatientRegister />} />

                {/* Espace Patient Protégé */}
                <Route path="/patient/dashboard" element={
                    <ProtectedRoute allowedRoles={['patient']}>
                        <PatientArea />
                    </ProtectedRoute>
                } />

                {/* Espace Médecin Protégé */}
                <Route path="/medecin/dashboard" element={
                    <ProtectedRoute allowedRoles={['medecin']}>
                        <MedecinArea />
                    </ProtectedRoute>
                } />

                {/* Route par défaut (404) */}
                <Route path="*" element={<NotFound />} />
            </Routes>
            {/* <Footer /> */}
        </>
    );
};

const App = () => (
    <Router>
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    </Router>
);

export default App;