// src/api/medicalApi.js
import axios from 'axios';

// Définir l'URL de base pour simplifier les appels
const API_URL = 'http://localhost:5000/api'; // *AJUSTEMENT NÉCESSAIRE* : Assurez-vous que le port correspond à votre serveur backend

const medicalApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le Token JWT à toutes les requêtes sécurisées
medicalApi.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Fonctions d'authentification
export const login = (email, password, role) => {
    const endpoint = role === 'patient' ? '/patient/login' : '/medecin/login'; // Routes déduites de votre backend (patientRoutes.js et medecinRoutes.js non fournis mais implicites)
    const data = { email, mot_de_passe: password }; // Utilisez le nom de champ du backend
    return medicalApi.post(endpoint, data);
};

export const registerPatient = (patientData) => {
    return medicalApi.post('/patient/register', patientData);
};

// Fonctions Dossier Patient
export const fetchPatientDossier = () => {
    // Patient: GET /api/dossier/dossier
    return medicalApi.get('/dossier/dossier');
};

export const getPatientProfile = () => {
    // Cette route utilise le token d'authentification (géré par votre instance axios/medicalApi)
    return medicalApi.get('/patient/profile');
};

// Fonctions Médecin
export const searchPatients = (searchQuery) => {
    // Medecin: GET /api/medecin/patients/search?nom=...&numero_medical=...
    const params = new URLSearchParams(searchQuery).toString();
    return medicalApi.get(`/medecin/patients/search?${params}`);
};

export const fetchDoctorPatientDossier = (patientId) => {
    // Medecin: GET /api/medecin/dossier/:patientId
    return medicalApi.get(`/medecin/dossier/${patientId}`);
};

export const addConsultation = (consultationData, file) => {
    // Medecin: POST /api/dossier/consultation
    const formData = new FormData();

    // Ajouter les champs de texte
    for (const key in consultationData) {
        formData.append(key, consultationData[key]);
    }

    // Ajouter le fichier (doit correspondre à 'document' dans Multer)
    if (file) {
        formData.append('document', file);
    }

    // Config pour les requêtes de type multipart/form-data
    return medicalApi.post('/dossier/consultation', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

// NOTE: Cette route est différente de celle du médecin car elle n'utilise pas patientId dans l'URL (le backend connaît l'ID via le token)
export const getPatientDossier = () => {
    return medicalApi.get('/patient/dossier');
};

export const downloadDocument = (documentId) => {
    // Patient & Medecin: GET /api/dossier/documents/:documentId
    return medicalApi.get(`/dossier/documents/${documentId}`, {
        responseType: 'blob', // Important pour le téléchargement de fichiers
    });
};

// src/api/medicalApi.js (Ajouter dans la section 'Fonctions Dossier Patient')

export const updatePatientProfile = (profileData) => {
    // PUT /api/patient/profile (Utilise le token JWT pour identifier le patient)
    return medicalApi.put('/patient/profile', profileData);
};

export const grantAccess = (medecinId, dateFin) => {
    return medicalApi.post('/patient/access/grant', { medecinId, dateFin });
};

export const revokeAccess = (grantId) => {
    return medicalApi.delete(`/patient/access/revoke/${grantId}`);
};

export const listAccessGrants = () => {
    return medicalApi.get('/patient/access/list');
};

export default medicalApi;