// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="page-container" style={{ textAlign: 'center', padding: '100px 0' }}>
            <h1 style={{ fontSize: '3rem', color: 'var(--color-danger)' }}>Erreur 404</h1>
            <h2 style={{ color: 'var(--color-text)' }}>Page Introuvable</h2>
            <p style={{ margin: '20px 0' }}>
                L'itinéraire demandé ne correspond à aucune ressource de notre application.
            </p>
            <Link to="/" className="btn btn-primary">
                Retour à l'Accueil
            </Link>
        </div>
    );
};

export default NotFound;