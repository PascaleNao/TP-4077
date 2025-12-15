// src/components/patient/DossierDetails.jsx (Version Corrigée)
import React from 'react';

// Composant pour formater les paires clé-valeur (inchangé)
const DetailItem = ({ label, value }) => (
    <div style={{ marginBottom: '10px' }}>
        <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{label} : </span>
        <span>{value || 'N/A'}</span>
    </div>
);

const DossierDetails = ({ dossier, onDownload }) => {
    if (!dossier) return null;

    // 🚨 CORRECTION : Renommage de la clé pour correspondre au backend (dossierMedical)
    // Nous déstructurons et créons un alias si la clé est différente.
    // L'objet 'dossier' du médecin contient : { patient, dossierMedical, consultations }

    // Nous déstructurons la clé 'dossierMedical' sous l'alias 'dossier_clinique'
    // pour éviter de changer le code dans la partie affichage (Colonne 2).
    const {
        patient,
        consultations,
        dossierMedical: dossier_clinique // 👈 ALIAS CRUCIAL
    } = dossier;

    // 🚨 SÉCURISATION SUPPLÉMENTAIRE : S'assurer que dossier_clinique existe pour éviter un crash au rendu
    if (!dossier_clinique) {
        // Cela peut arriver si le patient n'a pas encore de DossierMedical dans la table
        // Nous fournissons un objet vide pour un rendu sûr si la donnée est manquante.
        const safeDossier_clinique = { allergies: 'N/A', maladies_chroniques: 'N/A', vaccinations: 'N/A', traitements_en_cours: 'N/A' };

        return (
            <div className="card">
                <p className="alert alert-info">Dossier médical en cours d'initialisation ou données non complètes.</p>
                {/* Vous pouvez décommenter la suite pour afficher quand même les infos patient */}
                {/* <h3>📋 Informations Démographiques</h3>
                 <DetailItem label="Nom Prénom" value={`${patient.nom} ${patient.prenom}`} />
                 <DetailItem label="N° Médical" value={patient.numero_medical} /> */}
            </div>
        );
    }

    // Le code de rendu (Colonne 2) reste inchangé car dossier_clinique est maintenant défini.

    return (
        <div className="dashboard-grid">

            {/* Colonne 1: Infos Personnelles (Inchangement) */}
            <div className="card">
                <h3>📋 Informations Démographiques</h3>
                <DetailItem label="Nom Prénom" value={`${patient.nom} ${patient.prenom}`} />
                <DetailItem label="N° Médical" value={patient.numero_medical} />
                <DetailItem label="Date de Naissance" value={patient.date_naissance ? new Date(patient.date_naissance).toLocaleDateString() : 'N/A'} />
            </div>

            {/* Colonne 2: Données Cliniques (Accès maintenant sécurisé) */}
            <div className="card">
                <h3>🔬 Données Cliniques</h3>
                {/* 🚨 Accès direct à dossier_clinique.allergies est maintenant sûr 🚨 */}
                <DetailItem label="Allergies" value={dossier_clinique.allergies} />
                <DetailItem label="Maladies Chroniques" value={dossier_clinique.maladies_chroniques} />
                <DetailItem label="Vaccinations" value={dossier_clinique.vaccinations} />
                <DetailItem label="Traitements en Cours" value={dossier_clinique.traitements_en_cours} />
            </div>

            {/* Colonne 3: Historique des Consultations (Inchangement) */}
            <div className="card" style={{ gridColumn: 'span 2' }}>
                <h3>🏥 Historique des Consultations ({consultations.length})</h3>
                {consultations.length === 0 ? (
                    <p>Aucune consultation enregistrée à ce jour.</p>
                ) : (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {consultations.map((consultation) => (
                            <div key={consultation.consultation_id} style={{ borderBottom: '1px solid #EEE', padding: '10px 0', marginBottom: '10px' }}>
                                <p style={{ fontWeight: 'bold' }}>
                                    {new Date(consultation.date_consultation).toLocaleDateString()} - Dr. {consultation.medecin_nom || 'Inconnu'}
                                </p>
                                <DetailItem label="Diagnostic" value={consultation.diagnostic} />
                                <DetailItem label="Notes" value={consultation.notes} />
                                {onDownload && (
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => onDownload(1, `Rapport-Consultation-${consultation.consultation_id}.pdf`)}
                                        style={{ marginTop: '5px', fontSize: '0.85rem' }}
                                    >
                                        Télécharger Document Associé
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default DossierDetails;