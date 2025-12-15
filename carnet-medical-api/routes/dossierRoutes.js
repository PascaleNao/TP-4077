// routes/dossierRoutes.js
const express = require('express');
const router = express.Router();
const dossierController = require('../controllers/dossierController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../config/multerConfig'); // <<< DOIT ÊTRE PRÉSENT

// Route GET protégée (Lecture Dossier)
router.get('/dossier', protect, dossierController.getDossierPatient);

// Route POST protégée (Ajout Consultation / Upload) <<< DOIT ÊTRE PRÉSENT
router.post(
    '/consultation',
    protect,
    authorize('medecin'),
    upload.single('document'),
    dossierController.addConsultation
);
router.get('/documents/:documentId', protect, dossierController.downloadDocument);

module.exports = router;