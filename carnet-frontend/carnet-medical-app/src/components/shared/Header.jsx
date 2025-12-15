// src/components/shared/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Style interne pour la concision
    const headerStyle = {
        backgroundColor: 'var(--color-primary)',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'var(--color-light)',
    };

    const logoStyle = {
        color: 'var(--color-light)',
        textDecoration: 'none',
        fontSize: '1.5rem',
        fontWeight: 'bold',
    };

    const navStyle = {
        display: 'flex',
        gap: '15px',
    };

    return (
        <header style={headerStyle}>
            <Link to={isAuthenticated ? (user.role === 'patient' ? '/patient/dashboard' : '/medecin/dashboard') : '/'} style={logoStyle}>
                🩺 TOHPITOH
            </Link>
            <nav style={navStyle}>
                {!isAuthenticated ? (
                    <>
                        <Link className="nav-link" to="/login/patient">Patient</Link>
                        <Link className="nav-link" to="/login/medecin">Médecin</Link>
                    </>
                ) : (
                    <>
                        <span style={{ padding: '8px 15px' }}>
                            Bienvenue, {user.role === 'patient' ? 'Patient' : 'Dr.'}
                        </span>
                        <button className="btn btn-danger" onClick={handleLogout} style={{ padding: '8px 15px' }}>
                            Déconnexion
                        </button>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;