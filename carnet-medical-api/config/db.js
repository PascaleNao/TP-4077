// config/db.js
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// 1. Charger les variables d'environnement en premier lieu
dotenv.config();

// 2. DÉFINITION DU POOL DE CONNEXION
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    // NOUVELLE OPTION DE COMPATIBILITÉ (pour usage développement local)
    insecureAuth: true
});

// 3. TEST IMMÉDIAT DE LA CONNEXION AU POOL
pool.getConnection()
    .then(connection => {
        connection.release();
        console.log('--- Connexion au pool MySQL réussie ! ---');
    })
    .catch(err => {
        // Affiche l'erreur complète si la connexion échoue
        console.error('#####################################################');
        console.error('ÉCHEC DE CONNEXION AU POOL MYSQL:', err.code, err.message);
        console.error('#####################################################');
    });


// 4. EXPORTATION du pool pour être utilisé par les contrôleurs
module.exports = pool;