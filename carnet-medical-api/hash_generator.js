// hash_generator.js
const bcrypt = require('bcryptjs');

async function generateHashes() {
    const saltRounds = 10; // Utilisez le même nombre que pour l'enregistrement du patient

    const mdp1 = 'motdepasse123';
    const mdp2 = 'motdepasse456';

    // Génération du hachage pour Jean Dupont
    const hash1 = await bcrypt.hash(mdp1, saltRounds);

    // Génération du hachage pour Sophie Martin
    const hash2 = await bcrypt.hash(mdp2, saltRounds);

    console.log(`\n--- Hachages générés ---\n`);
    console.log(`Mot de passe : ${mdp1}`);
    console.log(`Hachage Jean Dupont: ${hash1}`);
    console.log(`\nMot de passe : ${mdp2}`);
    console.log(`Hachage Sophie Martin: ${hash2}`);
    console.log(`\n--- Copiez ces hachages dans MySQL ---`);
}

generateHashes();
