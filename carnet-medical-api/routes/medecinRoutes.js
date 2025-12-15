// routes/medecinRoutes.js
const express = require('express');
const router = express.Router();
const medecinController = require('../controllers/medecinController');
const medecinAuthController = require('../controllers/medecinAuthController');
const { protect, authorize } = require('../middleware/authMiddleware');
// Route de connexion pour les professionnels de santé
router.post('/login', medecinAuthController.loginMedecin);
// Route 2: Recherche de patient (déjà existante)
router.get('/patients/search', protect, authorize(['medecin']), medecinController.searchPatients);

// Route 3: Consultation d'un dossier patient spécifique par son ID
router.get('/dossier/:patientId', protect, authorize(['medecin']), medecinController.getPatientDossier); // <<< AJOUT

// routes/medecinRoutes.js (Ajouter cette ligne)
// Route 4: Ajouter une nouvelle consultation
router.post('/consultation', protect, authorize(['medecin']), medecinController.addConsultation);
module.exports = router;