// controllers/patientController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Assurez-vous d'avoir process.env.JWT_SECRET défini dans votre fichier .env

// ===================================
// FONCTION 1: CONNEXION PATIENT (Login)
// ===================================
exports.loginPatient = async (req, res) => {
    console.log("--- REQUÊTE DE CONNEXION PATIENT REÇUE ---");
    const email = req.body.email ? req.body.email.trim() : null;
    const mot_de_passe = req.body.mot_de_passe ? req.body.mot_de_passe.trim() : null;
    console.log(`Tentative de connexion pour: ${email}`);


    try {
        // CORRECTION A: Sélectionner explicitement patient_id pour correspondre à la BDD
        const [rows] = await db.execute(
            'SELECT patient_id, nom, prenom, email, mot_de_passe FROM Patient WHERE email = ?',
            [email]
        );
        const patient = rows[0];

        if (!patient) {
            console.log("Échec: Utilisateur non trouvé.");
            return res.status(401).json({ message: 'Identifiants invalides.' });
        }

        const isMatch = await bcrypt.compare(mot_de_passe, patient.mot_de_passe);
        if (!isMatch) {
            console.log("Échec: Mot de passe incorrect.");
            return res.status(401).json({ message: 'Identifiants invalides.' });
        }

        // CORRECTION A: Utiliser patient.patient_id dans le JWT
        const token = jwt.sign(
            { id: patient.patient_id, role: 'patient' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const userWithoutPassword = {
            id: patient.patient_id, // Utilisation de l'ID correct
            nom: patient.nom,
            prenom: patient.prenom,
            email: patient.email,
            role: 'patient'
        };

        console.log("Succès: Connexion réussie.");
        res.status(200).json({ token, user: userWithoutPassword });

    } catch (error) {
        console.error("Erreur critique du serveur lors de la connexion:", error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
};

// ===================================
// FONCTION 2: ENREGISTREMENT PATIENT (Register)
// ===================================
// src/controllers/patientController.js

// Assurez-vous d'importer les modules nécessaires en haut du fichier :
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const db = require('../config/db'); // ou votre module de connexion

exports.registerPatient = async (req, res) => {
    // ----------------------------------------------------
    // 1. Récupération et Nettoyage des Données
    // ----------------------------------------------------
    const {
        nom,
        prenom,
        email,
        mot_de_passe,
        date_naissance,
        // Nouveaux champs récupérés du frontend
        sexe,
        groupe_sanguin,
        genotype,
        allergies_connues,
        maladies_chroniques
    } = req.body;

    // Champs non envoyés par le patient mais qui doivent être gérés
    const numero_medical = req.body.numero_medical ? req.body.numero_medical.trim() : null;
    // Assurez-vous que ce champ est NULLABLE en BDD si non généré ici.

    // ----------------------------------------------------
    // 2. Vérification des Champs OBLIGATOIRES
    // ----------------------------------------------------
    if (!email || !mot_de_passe || !nom || !prenom || !date_naissance) {
        return res.status(400).json({ message: 'Les champs Nom, Prénom, Email, Mot de passe et Date de naissance sont obligatoires.' });
    }

    try {
        // 3. Vérification de l'unicité de l'email (Le numéro médical n'est pas fourni par le patient)
        const [existingUsers] = await db.query(
            'SELECT email FROM Patient WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ message: "Cet email est déjà associé à un compte." });
        }

        // 4. Hachage du mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(mot_de_passe, salt);

        // 5. Insertion dans la table Patient (avec TOUS les champs)
        // Note : Si 'numero_medical' n'est pas fourni, sa colonne doit être NULLABLE dans la BDD.
        const [patientResult] = await db.query(
            `INSERT INTO Patient 
             (nom, prenom, email, mot_de_passe, date_naissance, numero_medical,
              sexe, groupe_sanguin, genotype, allergies_connues, maladies_chroniques) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nom,
                prenom,
                email,
                hashedPassword,
                date_naissance,
                numero_medical, // Reste null si non fourni
                sexe,
                groupe_sanguin,
                genotype,
                allergies_connues,
                maladies_chroniques
            ]
        );

        const patientId = patientResult.insertId;

        // 6. Gestion de Dossier (si vous aviez une table DossierMedical, cette insertion n'est plus nécessaire 
        // car vous avez choisi de fusionner les données dans Patient. Si cette table est vitale pour une autre raison, 
        // vous pouvez la conserver, mais l'insertion des données cliniques se fait dans Patient.)

        // 7. Génération du Token JWT
        const token = jwt.sign(
            { id: patientId, role: 'patient' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 8. Réponse de Succès
        res.status(201).json({
            success: true,
            message: "Inscription réussie. Bienvenue !",
            token,
            user: {
                id: patientId,
                nom,
                prenom,
                email,
                role: 'patient'
            }
        });

    } catch (error) {
        console.error('Erreur lors de l\'enregistrement du patient:', error);
        res.status(500).json({ success: false, message: "Erreur d'enregistrement interne du serveur." });
    }
};
// ===================================
// FONCTION 3: ACCÈS AU DOSSIER
// ===================================
exports.getMonDossierMedical = async (req, res) => {
    // req.userId; contient le patientId décodé du JWT
    const patientId = req.userId;;

    try {
        const [dossier] = await db.execute(
            // Jointure pour obtenir le dossier (attention aux colonnes si elles se chevauchent, 
            // vous pourriez vouloir les nommer explicitement)
            'SELECT dm.*, p.nom, p.prenom, p.date_naissance, p.numero_medical FROM DossierMedical dm JOIN Patient p ON dm.patient_id = p.patient_id WHERE dm.patient_id = ?',
            [patientId]
        );

        if (dossier.length === 0) {
            return res.status(404).json({ message: 'Dossier médical introuvable.' });
        }

        // Nous retournons l'objet du dossier et les infos patient jointes
        res.json({ dossier: dossier[0] });

    } catch (error) {
        console.error('Erreur lors de la récupération du dossier:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

exports.updateProfile = async (req, res) => {
    // Récupérer l'ID du patient depuis le token JWT (après 'protect')
    const patientId = req.userId;;

    // Champs qui peuvent être mis à jour
    const {
        nom, prenom, date_naissance, sexe,
        groupe_sanguin, genotype, allergies_connues,
        maladies_chroniques
    } = req.body;

    try {
        const [result] = await db.execute(
            `UPDATE Patient SET 
             nom = ?, prenom = ?, date_naissance = ?, sexe = ?, 
             groupe_sanguin = ?, genotype = ?, allergies_connues = ?, 
             maladies_chroniques = ?
             WHERE patient_id = ?`,
            [nom, prenom, date_naissance, sexe,
                groupe_sanguin, genotype, allergies_connues,
                maladies_chroniques, patientId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Patient non trouvé." });
        }

        res.json({ message: "Profil mis à jour avec succès." });

    } catch (error) {
        console.error("Erreur de mise à jour du profil:", error);
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour du profil." });
    }
};

// src/controllers/patientController.js (Ajouter ces fonctions)

exports.manageAccess = async (req, res) => {
    const patientId = req.userId;;
    const { medecinId, dateFin, action } = req.body; // action: 'grant' ou 'revoke'

    if (!medecinId) {
        return res.status(400).json({ message: "ID du médecin requis." });
    }

    try {
        if (action === 'grant') {
            if (!dateFin || new Date(dateFin) <= Date.now()) {
                return res.status(400).json({ message: "Date de fin d'accès invalide ou passée." });
            }

            // 1. Vérifier si le médecin existe
            const [medecin] = await db.execute("SELECT medecin_id FROM Medecin WHERE medecin_id = ?", [medecinId]);
            if (medecin.length === 0) {
                return res.status(404).json({ message: "Médecin non trouvé." });
            }

            // 2. Insérer l'accès temporaire
            await db.execute(
                `INSERT INTO AccessGrant (patient_id, medecin_id, date_debut, date_fin) 
                 VALUES (?, ?, NOW(), ?)`,
                [patientId, medecinId, dateFin]
            );
            return res.status(201).json({ message: `Accès accordé au médecin ${medecinId} jusqu'au ${dateFin}.` });

        } else if (action === 'revoke') {
            // 3. Révoquer l'accès (supprimer l'entrée ou mettre date_fin à NOW())
            await db.execute(
                `DELETE FROM AccessGrant 
                 WHERE patient_id = ? AND medecin_id = ? AND date_fin > NOW()`,
                [patientId, medecinId]
            );
            return res.json({ message: `Accès révoqué pour le médecin ${medecinId}.` });
        }

        return res.status(400).json({ message: "Action invalide." });

    } catch (error) {
        console.error("Erreur de gestion d'accès:", error);
        res.status(500).json({ message: "Erreur serveur lors de la gestion des accès." });
    }
};

exports.listAccess = async (req, res) => {
    const patientId = req.userId;;
    try {
        const [grants] = await db.execute(
            `SELECT 
                ag.medecin_id, m.nom, m.prenom, ag.date_debut, ag.date_fin 
             FROM AccessGrant ag
             JOIN Medecin m ON ag.medecin_id = m.medecin_id
             WHERE ag.patient_id = ? AND ag.date_fin > NOW()`,
            [patientId]
        );
        res.json({ grants });
    } catch (error) {
        console.error("Erreur de liste d'accès:", error);
        res.status(500).json({ message: "Erreur serveur lors de la liste des accès." });
    }
};

// src/controllers/patientController.js (Ajouter cette fonction)

exports.getPatientProfile = async (req, res) => {
    // L'ID du patient est attaché à req.user par le middleware 'protect'
    const patientId = req.userId;

    try {
        const [patientInfoRows] = await db.execute(
            `SELECT 
                patient_id, nom, prenom, email, date_naissance, numero_medical,
                sexe, groupe_sanguin, genotype, allergies_connues, maladies_chroniques
             FROM Patient
             WHERE patient_id = ?`,
            [patientId]
        );

        if (patientInfoRows.length === 0) {
            return res.status(404).json({ message: "Profil patient introuvable." });
        }

        res.json({ patient: patientInfoRows[0] });

    } catch (error) {
        console.error("Erreur de récupération du profil patient:", error);
        res.status(500).json({ message: "Erreur serveur lors du chargement du profil." });
    }
};

// src/controllers/patientController.js (Ajouter)

// src/controllers/patientController.js (Fonction getPatientDossier - CORRECTION FINALE)
// src/controllers/patientController.js (Fonction getPatientDossier - Version Intégrale Corrigée)

/**
 * Récupère le dossier médical complet (informations générales et consultations) 
 * d'un patient donné.
 */
exports.getPatientDossier = async (req, res) => {
    const patientId = req.userId; // ID du Patient connecté (garanti par le middleware 'protect')

    try {
        // 1. Récupérer les informations générales du Dossier Médical (DossierMedical.patient_id = req.userId)
        // Note: Le DossierMedical est lié directement au patient_id.
        const [dossierInfo] = await db.execute(
            `SELECT 
                allergies, 
                maladies_chroniques, 
                vaccinations, 
                traitements_en_cours 
             FROM DossierMedical 
             WHERE patient_id = ?`,
            [patientId]
        );

        if (dossierInfo.length === 0) {
            // Si le dossier n'existe pas, on renvoie une structure vide mais valide (200 OK)
            return res.status(200).json({
                dossier: {
                    allergies: '',
                    maladies_chroniques: '',
                    vaccinations: '',
                    traitements_en_cours: '',
                    consultations: []
                }
            });
        }

        const dossierDetails = dossierInfo[0];

        // 2. Récupérer les Consultations associées au Dossier
        // Jointure entre Consultation et DossierMedical sur C.dossier_id = D.patient_id
        // (La clé du dossier dans Consultation est le patient_id/dossier_id)
        const [consultations] = await db.execute(
            `SELECT 
                C.consultation_id, 
                C.date_consultation, 
                C.motif, 
                C.notes, 
                C.diagnostic, 
                C.ordonnance_texte, 
                C.created_at
             FROM Consultation C
             INNER JOIN DossierMedical D ON C.dossier_id = D.patient_id
             WHERE D.patient_id = ? 
             ORDER BY C.date_consultation DESC`,
            [patientId]
        );

        // 3. ENVELOPPEMENT FINAL : Renvoyer les résultats dans le format attendu par le Frontend (React)
        // Ceci résout l'erreur: 'dossier.consultations is undefined'
        const responseData = {
            dossier: {
                ...dossierDetails,
                consultations: consultations
            }
        };

        res.json(responseData);

    } catch (error) {
        // Gérer les erreurs SQL ou autres
        console.error('Erreur serveur critique lors de la récupération du dossier patient:', error);
        res.status(500).json({ message: 'Erreur serveur interne lors de la récupération du dossier.' });
    }
};
// src/controllers/patientController.js (Ajouter)

// Permet au patient d'accorder l'accès à son dossier pour un médecin
// src/controllers/patientController.js (Fonction grantAccess)
// src/controllers/patientController.js (Fonction grantAccess - Version Intégrale Corrigée)

/**
 * Permet à un patient d'accorder l'accès à son dossier à un médecin spécifié 
 * pour une période définie.
 */
exports.grantAccess = async (req, res) => {
    // Les ID/Rôles sont garantis par les middlewares protect/authorize
    const patientId = req.userId;
    const { medecinId, dateFin } = req.body;

    // Débogage pour confirmer l'arrivée dans le contrôleur
    console.log(`[EXECUTION GRANT ACCESS] Tentative d'accès par Patient ID: ${patientId}.`);

    // 1. Validation des données de requête (si le body parser a tout laissé passer)
    if (!medecinId || !dateFin) {
        console.error("ERREUR 400: Données d'accès manquantes (medecinId ou dateFin).");
        return res.status(400).json({ message: 'L\'ID du médecin et la date de fin sont requis.' });
    }

    try {
        // 2. Vérification de l'existence du Médecin
        console.log(`[VERIF MEDECIN] Recherche du médecin ID: ${medecinId}`);
        const [medecin] = await db.execute('SELECT medecin_id FROM Medecin WHERE medecin_id = ?', [medecinId]);

        if (medecin.length === 0) {
            // Blocage du flux et envoi d'une réponse 404
            console.error(`Médecin ID ${medecinId} introuvable. Échec 404.`);
            return res.status(404).json({ message: 'Médecin spécifié introuvable.' });
        }

        // 3. Insertion de l'octroi d'accès (seulement si le médecin est trouvé)
        // Utilisation de NOW() pour la date_debut et format ISO 8601 pour dateFin
        console.log(`[INSERTION] Tentative d'insertion pour le Médecin ID: ${medecinId} jusqu'à ${dateFin}`);
        const [result] = await db.execute(
            'INSERT INTO AccessGrant (patient_id, medecin_id, date_debut, date_fin) VALUES (?, ?, NOW(), ?)',
            [patientId, medecinId, dateFin]
        );

        // 4. Succès
        console.log(`[SUCCÈS] Accès accordé, ID d'insertion: ${result.insertId}`);
        res.status(201).json({ success: true, message: 'Accès accordé avec succès.', grantId: result.insertId });

    } catch (error) {
        // 5. Gestion des erreurs SQL
        // Si l'insertion échoue (ex: clé étrangère non respectée, problème de connexion)
        console.error("Erreur serveur inattendue (SQL ou autre) lors de l'octroi d'accès:", error);
        res.status(500).json({ message: "Erreur serveur interne lors de l'opération." });
    }
};


// Permet au patient de révoquer un accès spécifique

// src/controllers/patientController.js (Fonction revokeAccess)

exports.revokeAccess = async (req, res) => {
    // 🚨 VÉRIFIEZ LE NOM DU PARAMÈTRE : doit correspondre au nom dans le routeur (ex: :grantId)
    const grantId = req.params.grantId;
    const patientId = req.userId; // ID du patient connecté

    console.log(`[REVOKE ACCESS] Tentative de révocation de Grant ID: ${grantId} par Patient ID: ${patientId}`);

    // 1. Validation de l'ID (bloque 'undefined' envoyé par le frontend)
    if (!grantId || isNaN(grantId)) {
        console.error(`Erreur 400: ID de subvention invalide ou manquant: ${grantId}`);
        return res.status(400).json({ message: 'L\'ID de la subvention d\'accès est requis.' });
    }

    try {
        // 2. Requête SQL de suppression : garantit que seul CE patient peut révoquer CETTE subvention
        const [result] = await db.execute(
            'DELETE FROM AccessGrant WHERE grant_id = ? AND patient_id = ?',
            [grantId, patientId]
        );

        if (result.affectedRows === 0) {
            console.warn(`Aucune subvention trouvée ou permission refusée pour Grant ID: ${grantId}`);
            // Si affectedRows est 0, soit l'ID n'existe pas, soit il n'appartient pas à ce patient.
            return res.status(404).json({ message: 'Subvention d\'accès introuvable ou vous n\'êtes pas autorisé à la révoquer.' });
        }

        console.log(`[SUCCÈS] Révocation réussie de Grant ID: ${grantId}.`);
        res.status(200).json({ success: true, message: 'Accès révoqué avec succès.' });

    } catch (error) {
        // Log l'erreur complète pour le débogage serveur
        console.error("Erreur serveur inattendue lors de la révocation d'accès:", error);
        // Renvoie une erreur générique au client
        res.status(500).json({ message: "Erreur serveur interne lors de la révocation d'accès." });
    }
};

// Liste les accès actifs et expirés pour le patient
// src/controllers/patientController.js (Fonction listAccessGrants - VERSION FINALE PROPRE)

exports.listAccessGrants = async (req, res) => {
    const patientId = req.userId;
    let grants = [];

    try {
        // 1. Récupération avec alias pour assurer le mapping JS (grantId)
        const [results] = await db.execute(
            `SELECT 
                ag.grant_id AS grantId,         
                ag.medecin_id AS medecinId,     
                ag.date_debut, 
                ag.date_fin, 
                m.nom, 
                m.prenom, 
                m.email,
                m.specialite
             FROM AccessGrant ag
             JOIN Medecin m ON ag.medecin_id = m.medecin_id
             WHERE ag.patient_id = ?
             ORDER BY ag.date_fin DESC`,
            [patientId]
        );

        grants = results;

    } catch (error) {
        console.error("Erreur critique lors de la liste des accès (SQL):", error);
        return res.status(500).json({ message: "Erreur serveur lors de la récupération des autorisations." });
    }

    // Ce log est retiré pour ne plus perturber votre terminal
    // console.log('[API LIST ACCESS] Données retournées:', grants); 

    // 2. Envoi des données (même si 'grants' est vide)
    res.json({ grants });
};