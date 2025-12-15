// src/components/medecin/AddConsultationForm.jsx (Version Corrigée)
import React, { useState } from 'react';
import { addConsultation } from '../../api/medicalApi';

// Assurez-vous que le composant reçoit bien patientId en prop !
const AddConsultationForm = ({ patientId, onSuccess, onCancel }) => {
    // 🚨 AJOUT DE L'ÉTAT POUR LE MOTIF
    const [motif, setMotif] = useState('');

    const [diagnostic, setDiagnostic] = useState('');
    const [notes, setNotes] = useState('');
    const [documentFile, setDocumentFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        // 🚨 NOUVELLE VALIDATION FRONTEND POUR MOTIF ET DIAGNOSTIC
        if (!motif) {
            setMessage("Le 'Motif de la consultation' est obligatoire.");
            setMessageType('error');
            return;
        }
        if (!diagnostic) {
            setMessage("Le 'Diagnostic Principal' est obligatoire.");
            setMessageType('error');
            return;
        }

        setLoading(true);

        const consultationData = {
            patient_id: patientId, // 🚨 AJOUT CRUCIAL : ID du patient
            motif,                 // 🚨 AJOUT CRUCIAL : Motif
            diagnostic,
            notes,
        };

        try {
            await addConsultation(consultationData, documentFile);

            setMessage('Consultation enregistrée avec succès.');
            setMessageType('success');

            // Réinitialisation des champs
            setMotif('');
            setDiagnostic('');
            setNotes('');
            setDocumentFile(null);

            setTimeout(onSuccess, 1500);

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Échec de l'enregistrement de la consultation.";
            setMessage(errorMessage);
            setMessageType('error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // ... (handleFileChange reste inchangé) ...
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type !== 'application/pdf') {
            setMessage("Seuls les fichiers PDF sont autorisés.");
            setMessageType('error');
            setDocumentFile(null);
            e.target.value = null;
            return;
        }
        setMessage('');
        setDocumentFile(file);
    };


    return (
        <form onSubmit={handleSubmit}>
            {message && <div className={`alert alert-${messageType}`}>{message}</div>}

            {/* 🚨 NOUVEAU CHAMPS : MOTIF */}
            <div className="form-group">
                <label htmlFor="motif">Motif de la Consultation *</label>
                <input
                    type="text"
                    id="motif"
                    className="form-control"
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    required
                />
            </div>
            {/* FIN NOUVEAU CHAMPS */}


            <div className="form-group">
                <label htmlFor="diagnostic">Diagnostic Principal *</label>
                <textarea
                    id="diagnostic"
                    className="form-control"
                    rows="3"
                    value={diagnostic}
                    onChange={(e) => setDiagnostic(e.target.value)}
                    required
                ></textarea>
            </div>

            <div className="form-group">
                <label htmlFor="notes">Notes Cliniques (optionnel)</label>
                <textarea
                    id="notes"
                    className="form-control"
                    rows="4"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                ></textarea>
            </div>

            <div className="form-group">
                <label htmlFor="document">Document Associé (PDF - max 5 Mo)</label>
                <input
                    type="file"
                    id="document"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="form-control"
                />
                {documentFile && <p style={{ fontSize: '0.9rem', color: 'var(--color-secondary)' }}>Fichier sélectionné : **{documentFile.name}**</p>}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={onCancel} style={{ backgroundColor: '#CCC', color: 'var(--color-text)' }} disabled={loading}>
                    Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Enregistrement...' : 'Valider Consultation'}
                </button>
            </div>
        </form>
    );
};

export default AddConsultationForm;