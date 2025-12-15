// src/pages/PatientArea.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPatientProfile } from '../api/medicalApi';
import PatientProfileEdit from '../components/patient/PatientProfileEdit.jsx';
import PatientAccessManager from '../components/patient/PatientAccessManager.jsx'; // Nous allons créer ce composant ensuite
import PatientDossier from '../components/patient/PatientDossier.jsx';
const PatientArea = () => {
    const { user } = useAuth();
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('profil'); // 'profil', 'dossier', 'acces'

    // Fonction pour charger les données du patient
    const fetchPatientData = useCallback(async () => {
        setLoading(true);
        try {
            // Note: Nous supposons que getPatientProfile est bien défini pour récupérer le profil du patient
            const res = await getPatientProfile();
            setPatientData(res.data.patient);
            setError('');
        } catch (err) {
            console.error("Erreur de chargement du profil patient:", err);
            setError("Impossible de charger les données du profil.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPatientData();
    }, [fetchPatientData]);

    if (loading) {
        return <div className="page-container">Chargement du tableau de bord...</div>;
    }

    if (error) {
        return <div className="page-container alert alert-error">{error}</div>;
    }

    if (!patientData) {
        return <div className="page-container alert">Données patient non disponibles.</div>;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'profil':
                return (
                    <div>
                        <h2>Informations Personnelles</h2>
                        <p>Nom: {patientData.nom} {patientData.prenom}</p>
                        <p>Email: {patientData.email}</p>
                        <p>Date de Naissance: {patientData.date_naissance}</p>

                        <h3 style={{ marginTop: '20px' }}>Informations Médicales de Base</h3>
                        <p>Sexe: {patientData.sexe || 'Non spécifié'}</p>
                        <p>Groupe Sanguin: {patientData.groupe_sanguin || 'Non spécifié'}</p>
                        <p>Génotype: {patientData.genotype || 'Non spécifié'}</p>
                        <p>Allergies: {patientData.allergies_connues || 'Aucune connue'}</p>
                        <p>Maladies Chroniques: {patientData.maladies_chroniques || 'Aucune connue'}</p>

                        <div style={{ marginTop: '30px' }}>
                            <PatientProfileEdit
                                initialData={patientData}
                                onUpdateSuccess={fetchPatientData}
                            />
                        </div>
                    </div>
                );
            case 'dossier':
                // Ceci sera l'espace pour l'historique des consultations, résultats labo, etc.
                return <PatientDossier />;
            case 'acces':
                // Intégration du composant de gestion d'accès
                return (
                    <div>
                        <h2>Gérer l'Accès des Médecins</h2>
                        <PatientAccessManager />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="page-container">
            <h1>Bienvenue, {patientData.prenom}</h1>

            <div className="tabs-container">
                <button
                    className={`tab-button ${activeTab === 'profil' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profil')}
                >
                    Mon Profil & Édition
                </button>
                <button
                    className={`tab-button ${activeTab === 'dossier' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dossier')}
                >
                    Historique & Dossier
                </button>
                <button
                    className={`tab-button ${activeTab === 'acces' ? 'active' : ''}`}
                    onClick={() => setActiveTab('acces')}
                >
                    Accès Médecin (Nouveau)
                </button>
            </div>

            <div className="tab-content">
                {renderContent()}
            </div>

            {/* 🚨 CSS nécessaire pour les onglets, à ajouter à votre app.css */}
            <style jsx="true">{`
                .tabs-container {
                    display: flex;
                    border-bottom: 2px solid #ddd;
                    margin-bottom: 20px;
                }
                .tab-button {
                    background: none;
                    border: none;
                    padding: 10px 15px;
                    cursor: pointer;
                    font-size: 1em;
                    border-bottom: 2px solid transparent;
                    transition: all 0.3s;
                }
                .tab-button.active {
                    color: var(--color-primary);
                    border-bottom: 2px solid var(--color-primary);
                    font-weight: bold;
                }
            `}</style>
        </div>
    );
};

export default PatientArea;