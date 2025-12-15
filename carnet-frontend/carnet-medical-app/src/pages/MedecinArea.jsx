// src/pages/MedecinArea.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MedecinSearch from '../components/medecin/MedecinSearch';
import PatientSummary from '../components/medecin/PatientSummary';
import AddConsultationForm from '../components/medecin/AddConsultationForm';


const MedecinArea = () => {
    const { user } = useAuth();
    // PatientId stocke l'ID du patient sélectionné après la recherche
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [patientInfo, setPatientInfo] = useState(null); // Stocke les données de base du patient sélectionné
    const [isSearching, setIsSearching] = useState(false);

    // Fonction appelée lorsque le médecin sélectionne un patient dans la liste de résultats
    const handlePatientSelect = (patient) => {
        setSelectedPatientId(patient.patient_id);
        setPatientInfo(patient);
        setIsSearching(false); // Masquer la liste de recherche pour voir le dossier
    };

    const resetSelection = () => {
        setSelectedPatientId(null);
        setPatientInfo(null);
        setIsSearching(true); // Retourner à l'état de recherche
    };

    return (
        <div className="page-container">
            <h1>Espace Professionnel de Santé</h1>
            <p>Dr. {user.prenom} {user.nom} utilisez l'outil ci-dessous pour accéder aux dossiers médicaux.</p>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2 style={{ borderBottom: '1px solid #EEE', paddingBottom: '10px' }}>
                    {selectedPatientId ? `Dossier de ${patientInfo.prenom} ${patientInfo.nom}` : '🔎 Recherche de Patients'}
                </h2>

                {!selectedPatientId ? (
                    // Afficher le composant de recherche si aucun patient n'est sélectionné
                    <MedecinSearch onSelectPatient={handlePatientSelect} />
                ) : (
                    // Afficher le dossier complet du patient sélectionné
                    <PatientSummary
                        patientId={selectedPatientId}
                        patientBaseInfo={patientInfo}
                        onBackToSearch={resetSelection}
                        medecinId={user.id}
                    />
                )}
            </div>
        </div>
    );
};

export default MedecinArea;