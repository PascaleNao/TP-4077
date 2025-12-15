// carnet-medical-api/routes/authRoutes.js (Nettoyé)

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ces imports sont pour les autres routes sécurisées
// const { protect, authorize } = require('../middleware/authMiddleware');

// Route d'enregistrement (si vous avez une fonction d'enregistrement)
router.post('/register/patient', authController.registerPatient);

// Note: La route de connexion est déplacée dans patientRoutes.js

module.exports = router;