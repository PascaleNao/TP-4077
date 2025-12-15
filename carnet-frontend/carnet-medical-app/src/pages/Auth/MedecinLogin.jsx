// src/pages/Auth/MedecinLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MedecinLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Connexion avec le rôle 'medecin'
        const result = await login(email, password, 'medecin');

        setLoading(false);
        if (result.success) {
            navigate('/medecin/dashboard');
        } else {
            // Afficher l'erreur retournée par l'API
            setError(result.message);
        }
    };

    return (
        <div className="page-container" style={{ maxWidth: '400px', margin: '50px auto' }}>
            <div className="card">
                <h1 style={{ color: 'var(--color-secondary)' }}>Espace Médecin : Connexion</h1>
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Professionnel</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-secondary" disabled={loading}>
                        {loading ? 'Authentification...' : 'Accéder au Dossier'}
                    </button>
                </form>
                <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>
                    *Accès strictement réservé aux professionnels de santé enregistrés.
                </p>
            </div>
        </div>
    );
};

export default MedecinLogin;