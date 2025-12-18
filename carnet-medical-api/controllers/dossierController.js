// controllers/dossierController.js
const db = require('../config/db');
const fs = require('fs');
const path = require('path'); // << AJOUTER CETTE LIGNE
/**
 * Récupère le dossier médical complet d'un patient connecté.
 */
exports.getDossierPatient = async (req, res) => {
    const patientId = req.userId;

    try {
        // 1. Récupérer les informations de base du patient
        const [patientRows] = await db.execute(
            'SELECT patient_id, nom, prenom, date_naissance, numero_medical FROM Patient WHERE patient_id = ?',
            [patientId]
        );
        const patient = patientRows[0];

        if (!patient) {
            return res.status(404).json({ message: 'Patient introuvable.' });
        }

        // NOUVEAU : 2. Récupérer les données cliniques du DossierMedical
        const [dossierRows] = await db.execute(
            `SELECT 
                allergies, 
                maladies_chroniques, 
                vaccinations, 
                traitements_en_cours 
             FROM DossierMedical WHERE patient_id = ?`,
            [patientId]
        );
        const dossierClinique = dossierRows[0] || {}; // Utiliser un objet vide si le dossier est incomplet

        // 3. Récupérer l'historique des consultations du patient
        const [consultationRows] = await db.execute(
            `
            SELECT 
                c.consultation_id, 
                c.date_consultation, 
                c.diagnostic, 
                c.notes,
                m.nom AS medecin_nom,
                m.prenom AS medecin_prenom
            FROM Consultation c
            JOIN DossierMedical dm ON c.dossier_id = dm.patient_id
            JOIN Medecin m ON c.medecin_id = m.medecin_id
            WHERE dm.patient_id = ?
            ORDER BY c.date_consultation DESC
            `,
            [patientId]
        );

        // 4. Assembler et renvoyer le dossier complet
        res.json({
            patient: patient,
            // AJOUT : Intégration des données cliniques à la réponse
            dossier_clinique: dossierClinique,
            consultations: consultationRows
        });

    } catch (error) {
        console.error('Erreur lors de la récupération du dossier:', error);
        res.status(500).json({ message: 'Erreur serveur interne lors de la consultation du dossier.' });
    }
};
// ... (exports.addConsultation qui reste inchangé)

/**
 * Ajoute une nouvelle consultation pour le patient et enregistre un document associé.
 */
// controllers/medecinController.js

/**
 * Permet au médecin d'ajouter une nouvelle consultation pour un patient.
 */
exports.addConsultation = async (req, res) => {
    const medecinId = req.userId; // ID du médecin (récupéré du Token)

    // Récupération des données du corps de la requête
    const {
        patient_id,
        motif,
        notes,             // 🚨 CORRECTION : Utilisation de 'notes' 
        diagnostic,
        ordonnance_texte
    } = req.body;

    // Définir la date de consultation (la colonne 'date_consultation' est de type DATE)
    const date_consultation = new Date().toISOString().slice(0, 10); // Format YYYY-MM-DD

    // Validation des champs requis selon votre table (motif est NO NULL)
    if (!patient_id || !motif) {
        return res.status(400).json({
            message: "L'identifiant du patient et le motif de la consultation sont requis."
        });
    }

    try {
        // ----------------------------------------------------
        // 1. VÉRIFICATION DE L'AUTORISATION TEMPORAIRE
        // ----------------------------------------------------

        // Cette vérification est cruciale avant d'autoriser la modification
        const [access] = await db.execute(
            `SELECT grant_id FROM AccessGrant 
             WHERE patient_id = ? AND medecin_id = ? AND date_fin > NOW()`,
            [patient_id, medecinId]
        );

        if (access.length === 0) {
            return res.status(403).json({
                message: "Opération refusée. L'accès temporaire au dossier patient est expiré ou inexistant."
            });
        }

        // ----------------------------------------------------
        // 2. INSERTION DE LA NOUVELLE CONSULTATION
        // ----------------------------------------------------

        const [result] = await db.execute(
            `INSERT INTO Consultation 
             (dossier_id, medecin_id, date_consultation, motif, notes, diagnostic, ordonnance_texte)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                patient_id, // Correspond à dossier_id
                medecinId,
                date_consultation,
                motif,
                notes || null,             // Notes est facultatif (NULL autorisé)
                diagnostic || null,        // Diagnostic est facultatif (NULL autorisé)
                ordonnance_texte || null   // Ordonnance est facultatif (NULL autorisé)
            ]
        );

        res.status(201).json({
            message: 'Consultation ajoutée avec succès.',
            consultationId: result.insertId
        });

    } catch (error) {
        console.error('Erreur lors de l\'ajout de la consultation:', error);
        res.status(500).json({ message: 'Erreur serveur interne lors de l\'ajout de la consultation.' });
    }
};
// controllers/dossierController.js (Ajoutez CECI)


exports.downloadDocument = async (req, res) => {
    const patientId = req.userId;
    // L'ID du document est extrait de l'URL via la route (ex: /documents/1)
    const documentId = req.params.documentId;

    try {
        // 1. Récupérer les informations du document et valider l'accès
        // On s'assure que le document est lié à une consultation, qui est liée au patient connecté.
        const [documentRows] = await db.execute(
            `SELECT 
                doc.nom_original, 
                doc.chemin_stockage, 
                c.dossier_id 
             FROM Document doc
             JOIN Consultation c ON doc.consultation_id = c.consultation_id
             WHERE doc.document_id = ? AND c.dossier_id = ?`,
            [documentId, patientId] // Vérifie si le document appartient bien à l'utilisateur
        );

        const documentInfo = documentRows[0];

        if (!documentInfo) {
            return res.status(404).json({ message: "Document non trouvé ou accès non autorisé." });
        }

        const filePath = documentInfo.chemin_stockage;

        // 2. Vérifier si le fichier existe sur le disque
        if (!fs.existsSync(filePath)) {
            console.error(`Fichier non trouvé sur le disque: ${filePath}`);
            return res.status(404).json({ message: "Fichier physique introuvable sur le serveur." });
        }

        // 3. Envoyer le fichier au client
        res.download(filePath, documentInfo.nom_original, (err) => {
            if (err) {
                console.error("Erreur lors de l'envoi du fichier:", err);
                // Le client n'a pas pu télécharger, mais nous ne renvoyons pas 500
                // pour ne pas exposer d'informations internes.
            }
        });

    } catch (error) {
        console.error('Erreur lors du téléchargement du document:', error);
        res.status(500).json({ message: 'Erreur serveur interne lors du téléchargement.' });
    }
};

// Assurez-vous d'avoir bien importé 'path' et 'fs' en haut du fichier :
// const db = require('../config/db');
// const fs = require('fs');
// const path = require('path'); // << AJOUTER CETTE LIGNE