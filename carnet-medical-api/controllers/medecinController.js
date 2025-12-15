// controllers/medecinController.js
const db = require('../config/db');

/**
 * Permet aux médecins de rechercher des patients par nom ou numéro médical.
 */
exports.searchPatients = async (req, res) => {
    // Les médecins n'ont pas besoin de leur propre ID ici, juste du rôle
    const { nom, numero_medical } = req.query; // Utiliser req.query pour les paramètres GET

    // Construire la clause WHERE dynamiquement
    let sql = 'SELECT patient_id, nom, prenom, date_naissance, numero_medical FROM Patient WHERE 1=1';
    let params = [];

    if (nom) {
        // Recherche partielle (LIKE)
        sql += ' AND (nom LIKE ? OR prenom LIKE ?)';
        params.push(`%${nom}%`);
        params.push(`%${nom}%`);
    }

    if (numero_medical) {
        sql += ' AND numero_medical = ?';
        params.push(numero_medical);
    }

    // Si aucun critère de recherche n'est fourni, on pourrait limiter la requête
    if (!nom && !numero_medical) {
        return res.status(400).json({ message: "Veuillez fournir un nom ou un numéro médical pour la recherche." });
    }

    try {
        const [rows] = await db.execute(sql, params);

        res.json({
            count: rows.length,
            patients: rows
        });

    } catch (error) {
        console.error('Erreur lors de la recherche de patients:', error);
        res.status(500).json({ message: 'Erreur serveur interne lors de la recherche.' });
    }
};

// controllers/medecinController.js (Ajoutez ceci après exports.searchPatients)

/**
 * Permet aux médecins de récupérer le dossier médical complet d'un patient.
 */
// Assurez-vous que l'importation de la connexion à la base de données est présente au début du fichier
// const db = require('../config/db'); 

// controllers/medecinController.js

/**
 * Permet aux médecins de récupérer le dossier médical complet d'un patient
 * après vérification de l'autorisation d'accès.
 */
exports.getPatientDossier = async (req, res) => {
    // Récupère l'ID du médecin. Nous utilisons req.userId pour l'uniformité 
    // avec la convention patient, assumant que le middleware l'injecte correctement.
    const medecinId = req.userId;

    // Récupère l'ID du patient à partir des paramètres de l'URL
    const { patientId } = req.params;

    if (!patientId) {
        return res.status(400).json({ message: "L'identifiant du patient est requis." });
    }

    // 🚨 Débogage : Si l'erreur persiste, décommentez ceci pour voir les IDs
    // console.log(`[DEBUG DOSSIER] Médecin ID: ${medecinId} tente d'accéder au Patient ID: ${patientId}`);

    try {
        // ----------------------------------------------------
        // 1. VÉRIFICATION DE L'AUTORISATION TEMPORAIRE
        //    (Assumons que la table AccessGrant utilise patient_id et non dossier_id)
        // ----------------------------------------------------

        const [access] = await db.execute(
            `SELECT grant_id FROM AccessGrant 
             WHERE patient_id = ? AND medecin_id = ? AND date_fin > NOW()`,
            [patientId, medecinId]
        );

        if (access.length === 0) {
            // Statut 403: Forbidden (Accès Interdit)
            return res.status(403).json({
                message: "Accès refusé. Le patient n'a pas accordé d'accès temporaire valide à son dossier."
            });
        }

        // ----------------------------------------------------
        // 2. RÉCUPÉRATION DES DONNÉES DU DOSSIER
        // ----------------------------------------------------

        // A. Récupération des informations de base du patient (Table Patient)
        const [patientInfoRows] = await db.execute(
            `SELECT 
                patient_id, nom, prenom, date_naissance, numero_medical, email,
                sexe, groupe_sanguin, genotype, allergies_connues, maladies_chroniques
             FROM Patient
             WHERE patient_id = ?`,
            [patientId]
        );

        if (patientInfoRows.length === 0) {
            return res.status(404).json({ message: "Dossier patient introuvable." });
        }
        const patientInfo = patientInfoRows[0];


        // B. Récupération des consultations et observations (Table Consultation)
        // 🚨 CORRECTIONS APPLIQUÉES :
        //    1. Remplacement de notes_cliniques par 'notes'.
        //    2. Remplacement de patient_id par 'dossier_id' dans la clause WHERE.
        const [consultations] = await db.execute(
            `SELECT 
                consultation_id, date_consultation, motif, notes, 
                diagnostic, ordonnance_texte, created_at
             FROM Consultation
             WHERE dossier_id = ? 
             ORDER BY date_consultation DESC`,
            [patientId] // patientId est utilisé ici comme dossier_id
        );

        // C. Récupération des informations générales du Dossier Médical (Table DossierMedical)
        // Cette étape est nécessaire car les infos du dossier médical ne sont pas dans la table Patient
        const [dossierMedicalInfo] = await db.execute(
            `SELECT 
                allergies, 
                maladies_chroniques, 
                vaccinations, 
                traitements_en_cours 
             FROM DossierMedical 
             WHERE patient_id = ?`,
            [patientId]
        );
        const dossierDetails = dossierMedicalInfo.length > 0 ? dossierMedicalInfo[0] : {};

        // ----------------------------------------------------
        // 3. RÉPONSE DU DOSSIER
        // ----------------------------------------------------
        res.json({
            patient: patientInfo,
            dossierMedical: dossierDetails, // Ajout des informations DossierMedical
            consultations: consultations,
            message: "Dossier chargé avec succès."
        });

    } catch (error) {
        console.error("Erreur lors de la récupération du dossier patient:", error);
        // Retourner une erreur serveur 500
        return res.status(500).json({ message: "Erreur interne du serveur lors du chargement du dossier." });
    }
};

exports.addConsultation = async (req, res) => {
    // 🚨 ASSUMPTION: req.userId contient l'ID du médecin
    const medecinId = req.userId;

    // 🚨 CORRECTION 1 : Récupérer le champ 'motif' du frontend
    const { patient_id, diagnostic, notes, motif } = req.body;

    // Utiliser la date actuelle en format MySQL YYYY-MM-DD
    const date_consultation = new Date().toISOString().slice(0, 10);

    // 🚨 CORRECTION 2 : Validation stricte des champs requis
    if (!patient_id || !diagnostic || !motif) {
        return res.status(400).json({
            message: "L'ID du patient, le diagnostic et le motif de la consultation sont requis."
        });
    }

    try {
        // ----------------------------------------------------
        // ÉTAPE 1 : VÉRIFICATION ET INITIALISATION DU DOSSIER MÉDICAL (ANTI-ERREUR CLÉ ÉTRANGÈRE)
        // ----------------------------------------------------

        // S'assurer que l'entrée dans la table parente (DossierMedical) existe
        const [existingDossier] = await db.execute(
            `SELECT patient_id FROM DossierMedical WHERE patient_id = ?`,
            [patient_id]
        );

        if (existingDossier.length === 0) {
            // Créer l'entrée minimale dans DossierMedical pour satisfaire la clé étrangère
            await db.execute(
                `INSERT INTO DossierMedical (patient_id) VALUES (?)`,
                [patient_id]
            );
            console.log(`[INIT DOSSIER] DossierMedical initialisé pour le Patient ID: ${patient_id}`);
        }

        // ----------------------------------------------------
        // ÉTAPE 2 : INSERTION DE LA NOUVELLE CONSULTATION
        // ----------------------------------------------------

        // 🚨 CORRECTION 3 : Inclure 'motif' dans la requête INSERT
        const [result] = await db.execute(
            `INSERT INTO Consultation 
             (dossier_id, medecin_id, date_consultation, motif, diagnostic, notes)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                patient_id, // Correspond à dossier_id
                medecinId,
                date_consultation,
                motif,
                diagnostic,
                notes || null // Utiliser null si les notes sont vides
            ]
        );

        res.status(201).json({
            message: 'Consultation ajoutée avec succès.',
            consultationId: result.insertId
        });

    } catch (error) {
        // Gestion des erreurs spécifiques pour le débogage
        if (error.errno === 1216 || error.errno === 1452) {
            console.error('Erreur Clé Étrangère lors de l\'ajout:', error);
            res.status(500).json({ message: 'Erreur d\'intégrité de la base de données: vérifiez l\'existence des IDs ou la structure des tables.' });
        } else {
            console.error('Erreur lors de l\'ajout de la consultation:', error);
            res.status(500).json({ message: 'Erreur serveur interne lors de l\'ajout de la consultation.' });
        }
    }
};