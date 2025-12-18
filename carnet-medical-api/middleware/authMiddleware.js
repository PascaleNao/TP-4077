// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

/**
 * Middleware pour protéger les routes et extraire l'ID et le rôle de l'utilisateur.
 */
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Extraire le token (sans le préfixe "Bearer ")
            token = req.headers.authorization.split(' ')[1];

            // Décoder le token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attacher l'ID et le RÔLE à l'objet de requête (req)
            req.userId = decoded.id;
            req.userRole = decoded.role; // <<< NOUVELLE LIGNE CRUCIALE

            next();

        } catch (error) {
            console.error('Erreur de validation du token:', error);
            return res.status(401).json({ message: 'Accès non autorisé, token invalide ou expiré.' });
        }
    } else {
        return res.status(401).json({ message: 'Accès non autorisé, aucun token fourni.' });
    }
};

/**
 * Middleware pour vérifier si l'utilisateur est un Médecin.
 * Utilisez-le après 'protect'.
 */
exports.authorize = (roles = []) => {
    // Si 'roles' est une chaîne, le convertir en tableau
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        // Le rôle est déjà dans req.userRole grâce à 'protect'
        const userRole = req.userRole;
        // 🚨 AJOUTEZ CETTE LIGNE DE DÉBOGAGE : 🚨
        console.log(`[AUTHORIZE DEBOGAGE] Rôle requis: ${roles.join(', ')} | Rôle utilisateur: ${userRole}`);

        // Si la liste des rôles est vide, ou si le rôle de l'utilisateur correspond
        if (roles.length === 0 || roles.includes(userRole)) {
            next();
        } else {
            // L'utilisateur n'a pas la permission requise
            res.status(403).json({ message: 'Accès refusé. Permission insuffisante.' });
        }
    };
};