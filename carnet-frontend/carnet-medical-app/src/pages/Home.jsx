// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { isAuthenticated, user } = useAuth();

    // Style interne pour le Hero Section
    const heroStyle = {
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: 'var(--color-light)',
        borderBottom: '1px solid #E0E0E0',
        color: 'var(--color-text)',
    };

    const callToActionStyle = {
        marginTop: '30px',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
    };

    if (isAuthenticated) {
        const dashboardPath = user.role === 'patient' ? '/patient/dashboard' : '/medecin/dashboard';
        const roleText = user.role === 'patient' ? 'votre Tableau de Bord Patient' : 'votre Espace Professionnel';

        return (
            <div className="page-container">
                <div style={heroStyle}>
                    <h1>Bienvenue, {user.role === 'patient' ? 'Patient' : 'Docteur'} !</h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>
                        Vous êtes déjà connecté(e).
                    </p>
                    <Link to={dashboardPath} className="btn btn-primary" style={{ marginTop: '20px' }}>
                        Accéder à {roleText}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div style={heroStyle}>
                <h1>Bienvenue sur Tohpitoh : L'application de Carnet Médical ⚕️</h1>
                <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '20px auto' }}>
                    Votre plateforme sécurisée pour gérer et consulter l'intégralité de votre dossier médical, en toute confiance et harmonie.
                </p>
                <div style={callToActionStyle}>
                    <Link to="/login/patient" className="btn btn-primary">
                        Accès Patient
                    </Link>
                    <Link to="/login/medecin" className="btn btn-secondary">
                        Accès Médecin
                    </Link>
                </div>
                <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
                    Nouveau patient ? <Link to="/register/patient" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Créez votre compte ici.</Link>
                </p>
            </div>

            {/* Section d'information (Exemple) */}
            <div className="dashboard-grid" style={{ marginTop: '40px' }}>
                <div className="card">
                    <h3>Sécurité Assurée</h3>
                    <p>Vos données sont protégées par un chiffrement de pointe, garantissant la confidentialité et l'intégrité de votre historique médical.</p>
                </div>
                <div className="card">
                    <h3>Accès Facilité</h3>
                    <p>Consultez vos diagnostics, prescriptions et documents (PDF) à tout moment et depuis n'importe quel appareil.</p>
                </div>
            </div>
        </div>
    );
};

export default Home;