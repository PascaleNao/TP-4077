// src/components/medecin/PatientSummary.jsx
import React, { useState, useEffect } from 'react';
import { fetchDoctorPatientDossier } from '../../api/medicalApi';
import AddConsultationForm from './AddConsultationForm';
import DossierDetails from '../patient/DossierDetails'; // Réutilisation du composant Patient

const PatientSummary = ({ patientId, patientBaseInfo, medecinId, onBackToSearch }) => {
    const [dossier, setDossier] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    // Fonction de chargement du dossier
    const loadDossier = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchDoctorPatientDossier(patientId);
            setDossier(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Échec de l'extraction du dossier.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDossier();
    }, [patientId]); // Rechargement si l'ID patient change

    // Gestion du succès de l'ajout (pour rafraîchir la liste des consultations)
    const handleConsultationSuccess = () => {
        setShowAddForm(false);
        // Rafraîchir les données du dossier
        loadDossier();
    };

    if (loading) return <div style={{ textAlign: 'center' }}>Synthèse du Dossier en cours de chargement...</div>;
    if (error) return <div className="alert alert-error">{error}</div>;
    if (!dossier) return <div className="alert">Dossier non disponible.</div>;


    return (
        <div>
            {/* Boutons d'action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddForm(true)}
                >
                    ➕ Ajouter une nouvelle consultation
                </button>
                <button
                    className="btn btn-secondary"
                    onClick={onBackToSearch}
                >
                    &larr; Nouvelle Recherche
                </button>
            </div>

            {/* Affichage du formulaire d'ajout */}
            {showAddForm && (
                <div className="card" style={{ border: '1px solid var(--color-secondary)' }}>
                    <h2>Nouveau Bilan Médical</h2>
                    <AddConsultationForm
                        patientId={patientId}
                        medecinId={medecinId}
                        onSuccess={handleConsultationSuccess}
                        onCancel={() => setShowAddForm(false)}
                    />
                </div>
            )}

            {/* Affichage du dossier (réutilisation du composant Patient) */}
            <DossierDetails dossier={dossier} onDownload={() => alert("Le téléchargement doit être implémenté via l'API.")} />
        </div>
    );
};

export default PatientSummary;