// src/components/Patient/PatientDossier.jsx (Version Intégralement Corrigée et Sécurisée)
import React, { useState, useEffect } from 'react';
import { getPatientDossier } from '../../api/medicalApi';

// Initialisation vide pour garantir une structure sûre en cas d'erreur ou d'absence de données
const initialDossierState = {
    consultations: [],
    // Ajoutez ici d'autres propriétés si votre backend les renvoie (allergies, traitements, etc.)
};

const PatientDossier = () => {
    // 🚨 CORRECTION 1 : Initialisation de l'état avec une structure sécurisée.
    // L'état 'dossier' est initialisé à null pour le chargement, mais contient une structure vide après chargement.
    const [dossierData, setDossierData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDossier = async () => {
            try {
                const res = await getPatientDossier();

                // 🚨 CORRECTION 2 : Extraction correcte de la propriété 'dossier' du backend.
                // Le backend renvoie { dossier: { ... } }, nous stockons le contenu de 'dossier'.
                setDossierData(res.data.dossier || initialDossierState);
                setError('');
            } catch (err) {
                console.error("Échec du chargement du dossier:", err);
                setError("Impossible de récupérer l'historique complet du dossier.");
                setDossierData(initialDossierState); // Assure un état stable même après échec
            } finally {
                setLoading(false);
            }
        };
        fetchDossier();
    }, []);

    // Affichage de l'état de chargement
    if (loading) return <div>Chargement de l'historique...</div>;

    // Affichage des erreurs critiques
    if (error) return <div className="alert alert-error">{error}</div>;

    // 🚨 CORRECTION 3 : Sécurisation de la condition d'absence de consultation.
    // L'accès à .consultations doit se faire uniquement si dossierData n'est pas null.
    // Si dossierData est null, nous retournons 'Chargement' ci-dessus. S'il est initialDossierState, .consultations existe.
    if (dossierData.consultations.length === 0) {
        return <div className="alert alert-info">Aucune consultation n'est enregistrée dans votre dossier pour le moment.</div>;
    }

    // Les données de consultation sont garanties d'exister et d'avoir une longueur > 0 ici.
    const consultations = dossierData.consultations;

    return (
        <div className="dossier-history">
            <h3>Historique des Consultations ({consultations.length})</h3>

            {consultations.map((c) => (
                <div key={c.consultation_id} className="consultation-card">
                    <h4>Consultation du {new Date(c.date_consultation).toLocaleDateString()}</h4>
                    <p><strong>Motif:</strong> {c.motif}</p>
                    {/* Assurez-vous que le nom des colonnes (notes, diagnostics) correspond à votre requête SQL */}
                    <p><strong>Notes Cliniques:</strong> {c.notes}</p>
                    {c.diagnostic && <p><strong>Diagnostic(s):</strong> {c.diagnostics}</p>}
                    {c.ordonnance_texte && <p><strong>Ordonnance:</strong> {c.ordonnance_texte}</p>}
                </div>
            ))}

            {/* Ajoutez ici la section pour les résultats de laboratoire, si applicable */}
        </div>
    );
};

export default PatientDossier;