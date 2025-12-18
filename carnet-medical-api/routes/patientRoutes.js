// carnet-medical-api/routes/patientRoutes.js (Correction de la connexion)

const express = require('express');
const router = express.Router();

const patientController = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Route 1: CONNEXION PATIENT (accessible via POST /api/patient/login)
router.post('/login', patientController.loginPatient);

// Test de réception :
router.use((req, res, next) => {
    console.log(`[ROUTEUR PATIENT] Tentative d'accès à l'URL : ${req.originalUrl}`);
    next();
});
router.post('/register', patientController.registerPatient); // <-- AJOUTEZ CETTE LIGNE
// Route 2: Route sécurisée pour le dossier (accessible via GET /api/patient/me/dossier)
// Note: J'ai corrigé l'erreur de syntaxe de la fonction authorize
router.get('/me/dossier', protect, authorize(['patient']), patientController.getMonDossierMedical);

// Route pour la mise à jour du profil (Protégée pour le patient)
router.put('/profile', protect, authorize(['patient']), patientController.updateProfile);

router.get('/dossier', protect, authorize(['patient']), patientController.getPatientDossier);

// src/routes/patientRoutes.js (Ajouter dans la section protégée par 'patient')
router.get('/profile', protect, authorize(['patient']), patientController.getPatientProfile);
// Route pour accorder/révoquer l'accès temporaire

//router.post('/access/grant', protect, authorize(['patient']), patientController.manageAccess);
// Route pour lister les accès accordés
// APRÈS (Utilisation d'une fonction anonyme pour forcer l'exécution) :
router.post('/access/grant', protect, authorize(['patient']), (req, res, next) => {
    // 🚨 APPEL DIRECT ET FORCÉ 🚨
    console.log('[ROUTE WRAPPER LOG] Appel du contrôleur grantAccess.');
    patientController.grantAccess(req, res, next);
});

router.get('/access/list', protect, authorize(['patient']), patientController.listAccess);


router.delete('/access/revoke/:grantId', protect, authorize(['patient']), patientController.revokeAccess);



module.exports = router;
