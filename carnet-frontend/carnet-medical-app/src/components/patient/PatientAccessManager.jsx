// src/components/Patient/PatientAccessManager.jsx (Version Intégrale Corrigée pour 'grantId')
import React, { useState, useEffect, useCallback } from 'react';
import { grantAccess, revokeAccess, listAccessGrants } from '../../api/medicalApi';

const PatientAccessManager = () => {
    const [medecinId, setMedecinId] = useState('');
    const [dateFin, setDateFin] = useState('');
    const [grants, setGrants] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchGrants = useCallback(async () => {
        setLoading(true);
        try {
            const res = await listAccessGrants();
            // console.log("Réponse complète de l'API listAccessGrants:", res.data); // Log désactivé après le diagnostic
            setGrants(res.data.grants);
        } catch (err) {
            setError('Impossible de lister les accès.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGrants();
    }, [fetchGrants]);

    const handleGrantAccess = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const res = await grantAccess(parseInt(medecinId), dateFin);
            setMessage(res.data.message);
            setMedecinId('');
            setDateFin('');
            fetchGrants(); // Recharger la liste
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'octroi de l'accès.");
        }
    };

    const handleRevokeAccess = async (grantId) => {
        // console.log("ID de subvention envoyé pour révocation:", grantId); // Log désactivé après le diagnostic

        if (!window.confirm("Êtes-vous sûr de vouloir révoquer cet accès immédiatement ?")) return;

        try {
            const res = await revokeAccess(grantId);
            setMessage(res.data.message);
            fetchGrants(); // Recharger la liste
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de la révocation de l'accès.");
        }
    };

    const getStatus = (dateFin) => {
        return new Date(dateFin) > new Date() ? 'Actif' : 'Expiré';
    };

    if (loading) return <p>Chargement des permissions...</p>;

    return (
        <div className="access-manager-container">
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-error">{error}</div>}

            {/* Formulaire d'Octroi d'Accès */}
            <h4>Accorder un nouvel accès temporaire</h4>
            <form onSubmit={handleGrantAccess} className="form-grant">
                <div className="form-row">
                    <div className="form-group">
                        <label>ID du Médecin</label>
                        <input
                            type="number"
                            value={medecinId}
                            onChange={(e) => setMedecinId(e.target.value)}
                            required
                            placeholder="Entrez l'ID unique du médecin"
                        />
                    </div>
                    <div className="form-group">
                        <label>Date de Fin d'Accès</label>
                        <input
                            type="datetime-local"
                            value={dateFin}
                            onChange={(e) => setDateFin(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <button type="submit" className="btn btn-secondary">Accorder l'Accès</button>
            </form>

            <h4 style={{ marginTop: '30px' }}>Liste des Autorisations ({grants.length})</h4>

            <ul className="grants-list">
                {grants.map(grant => {
                    // console.log("Structure de l'élément de subvention (grant):", grant); // Log désactivé après le diagnostic

                    return (
                        // 🚨 CORRECTION CLÉ 1 : Utilisation de grant.grantId pour la clé React
                        <li key={grant.grantId} className={`grant-item status-${getStatus(grant.date_fin).toLowerCase()}`}>
                            <div>
                                <p><strong>Médecin:</strong> {grant.prenom} {grant.nom} ({grant.email})</p>
                                <p><strong>Période:</strong> Du {new Date(grant.date_debut).toLocaleDateString()} au {new Date(grant.date_fin).toLocaleDateString()} à {new Date(grant.date_fin).toLocaleTimeString()}</p>
                                <span className="status-badge">{getStatus(grant.date_fin)}</span>
                            </div>
                            {getStatus(grant.date_fin) === 'Actif' && (
                                <button
                                    // 🚨 CORRECTION CLÉ 2 : Utilisation de grant.grantId pour l'appel de révocation
                                    onClick={() => handleRevokeAccess(grant.grantId)}
                                    className="btn btn-danger btn-small"
                                >
                                    Révoquer
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default PatientAccessManager;