// carnet-medical-api/server.js (Version Corrigée et Structurée)

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// --- 1. CONFIGURATION ET INITIALISATION ---
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- 2. IMPORTATION DES ROUTES ---
// Les routes doivent être importées pour être utilisées
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const dossierRoutes = require('./routes/dossierRoutes');
const medecinRoutes = require('./routes/medecinRoutes'); // Assurez-vous d'importer cette route

// --- 3. MIDDLEWARES DE SÉCURITÉ ET DE REQUÊTE ---

// A. CORS (DOIT ÊTRE LE PREMIER MIDDLEWARE pour éviter le blocage)
app.use(cors({
    origin: 'http://localhost:3000', // Adresse de votre frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

// B. Parsing du corps des requêtes (JSON et formulaires)
app.use(express.json());

// TEST DE RÉCEPTION GÉNÉRAL :
app.use((req, res, next) => {
    console.log(`[TEST EXPRESS GLOBAL] Méthode: ${req.method} | URL: ${req.originalUrl}`);
    next();
});
app.use(express.urlencoded({ extended: true }));

// --- 4. DÉFINITION DES POINTS DE TERMINAISON (ROUTES) ---

// Route de base de vérification
app.get('/', (req, res) => {
    res.send('API Carnet Médical en cours d\'exécution.');
});

// Montage des routes spécifiques (avec leurs préfixes)
app.use('/api/auth', authRoutes);

// Pour l'authentification/inscription générale (si utilisée

// 🚨 NOUVEAU MIDDLEWARE DE DÉBOGAGE CRITIQUE 🚨
app.use('/api/patient', (req, res, next) => {
    if (req.method === 'POST') {
        // Log le corps de la requête exactement comme il est reçu après les parsers
        console.log(`[BODY-PARSER LOG] Corps Reçu pour POST /api/patient:`, req.body);
    }
    next();
});


app.use('/api/patient', patientRoutes);   // Routes Patient (login, get, etc.)
app.use('/api/medecin', medecinRoutes);   // Routes Médecin (login, search, etc.)
app.use('/api/dossier', dossierRoutes);   // Routes Dossier (consultation, ajout)
// Note: J'ai changé /api/patient pour dossierRoutes afin d'éviter des conflits, 
// vérifiez votre dossierRoutes.js si vous utilisez /api/patient comme préfixe.

// --- 5. DÉMARRAGE DU SERVEUR ---
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    // Ici, vous pouvez ajouter l'appel à votre fonction de test de connexion DB
});