// src/pages/Auth/PatientLogin.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PatientLogin = () => {
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

        const result = await login(email, password, 'patient');

        setLoading(false);
        if (result.success) {
            navigate('/patient/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="page-container" style={{ maxWidth: '400px', margin: '50px auto' }}>
            <div className="card">
                <h1>Connexion Patient</h1>
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Adresse Email</label>
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
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Authentification...' : 'Se Connecter'}
                    </button>
                </form>
                <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                    Pas encore de compte ? <Link to="/register/patient" style={{ color: 'var(--color-primary)' }}>S'inscrire</Link>
                </p>
            </div>
        </div>
    );
};

export default PatientLogin;

// *REMARQUE :* Les autres pages d'authentification (`MedecinLogin.jsx` et `PatientRegister.jsx`) suivraient une structure similaire, adaptant le rôle et les champs de formulaire.