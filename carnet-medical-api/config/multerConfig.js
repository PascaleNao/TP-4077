// config/multerConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Définir le répertoire de stockage
const uploadDir = path.join(__dirname, '../uploads/documents');

// Créer le répertoire s'il n'existe pas
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Le répertoire où les fichiers seront sauvegardés
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Nommer le fichier de manière unique pour éviter les collisions
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        // Ex: document-1765643512345-123456789.pdf
        cb(null, 'document-' + uniqueSuffix + fileExtension);
    }
});

// Filtre pour n'accepter que les PDF (et éventuellement d'autres formats médicaux)
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Format de fichier non supporté. Seuls les PDF sont autorisés.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite à 5 MB
    }
});

module.exports = upload;