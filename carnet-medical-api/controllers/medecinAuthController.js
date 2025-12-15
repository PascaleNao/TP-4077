// controllers/medecinAuthController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fonction utilitaire pour générer le JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '1d', // Expire dans 1 jour
    });
};

/**
 * Connecte un utilisateur de type Médecin.
 */
exports.loginMedecin = async (req, res) => {
    const { email, mot_de_passe } = req.body;

    try {
        // 1. Trouver le médecin par email
        const [medecinRows] = await db.execute(
            'SELECT medecin_id, email, mot_de_passe, nom, prenom FROM Medecin WHERE email = ?',
            [email]
        );
        const medecin = medecinRows[0];

        if (!medecin) {
            return res.status(401).json({ message: 'Identifiants de connexion non valides.' });
        }

        // 2. Comparer le mot de passe (utilisation de bcryptjs)
        // ATTENTION : Si vous n'avez pas installé bcryptjs, vous aurez une erreur !
        const isMatch = await bcrypt.compare(mot_de_passe, medecin.mot_de_passe);

        if (!isMatch) {
            return res.status(401).json({ message: 'Identifiants de connexion non valides.' });
        }

        // 3. Générer le jeton avec le rôle 'medecin'
        const token = generateToken(medecin.medecin_id, 'medecin');

        res.json({
            token,
            user: {
                id: medecin.medecin_id,
                nom: medecin.nom,
                prenom: medecin.prenom,
                email: medecin.email,
                role: 'medecin',
            },
        });

    } catch (error) {
        console.error('Erreur lors de la connexion du médecin:', error);
        res.status(500).json({ message: 'Erreur serveur interne.' });
    }
};