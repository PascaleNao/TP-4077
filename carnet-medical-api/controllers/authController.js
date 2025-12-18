// controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.loginPatient = async (req, res) => {
    const { email, mot_de_passe } = req.body;
    try {
        const [rows] = await db.execute('SELECT patient_id, email, mot_de_passe FROM Patient WHERE email = ?', [email]);
        const patient = rows[0];

        if (!patient || !await bcrypt.compare(mot_de_passe, patient.mot_de_passe)) {
            return res.status(401).json({ message: 'Identifiants invalides.' });
        }

        const token = jwt.sign({ id: patient.patient_id, role: 'patient' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, patient: { id: patient.patient_id, email: patient.email } });
    } catch (error) {
        console.error('Erreur de connexion:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

exports.registerPatient = async (req, res) => {
    const {
        sexe,
        groupe_sanguin,
        genotype,
        allergies_connues,
        maladies_chroniques
    } = req.body;

    if (!nom || !prenom || !email || !mot_de_passe || !date_naissance) {
        return res.status(400).json({ message: "Veuillez remplir tous les champs requis." });
    }
    try {
        // Chiffrement du mot de passe
        const hashedPassword = await bcrypt.hash(mot_de_passe, await bcrypt.genSalt(10));

        // 3. Insertion du nouveau patient
        const [result] = await db.execute(
            `INSERT INTO Patient 
             (nom, prenom, email, mot_de_passe, date_naissance, 
              sexe, groupe_sanguin, genotype, allergies_connues, maladies_chroniques)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [nom, prenom, email, hashedPassword, date_naissance,
                sexe, groupe_sanguin, genotype, allergies_connues, maladies_chroniques]
        );

        const patientId = result.insertId;

        // Initialisation du Dossier Médical
        await db.execute('INSERT INTO DossierMedical (patient_id) VALUES (?)', [newPatientId]);

        const token = jwt.sign({ id: patientId, role: 'patient' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token, message: 'Compte créé avec succes.', patient: { id: newPatientId, email } });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'L\'email ou le numéro médical existe déjà.' });
        }
        console.error('Erreur d\'enregistrement:', error);
        res.status(500).json({ message: 'Erreur serveur interne.' });
    }
};
