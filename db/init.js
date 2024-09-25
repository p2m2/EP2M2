// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import fs from 'fs';
import path from 'path';
import pg from 'pg';

// Créez une instance de client PostgreSQL
const client = new pg.Client({
    user: "ep2m2",
    password: "ep2m2",
});

// Fonction pour initialiser la base de données
async function initializeDatabase() {
    try {
        // Connexion au client
        await client.connect();

        // Chemin vers le fichier init.sql
        const sqlFilePath = path.join(__dirname, 'init.sql');

        // Lire le contenu du fichier
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        console.log("Lecture du fichier SQL réussie !",sql.length);
        // Exécuter le contenu SQL
        await client.query(sql);

        console.log("Base de données initialisée avec succès !");
    } catch (err) {
        console.error("Erreur lors de l'initialisation de la base de données :", err);
    } finally {
        // Fermer la connexion
        await client.end();
    }
}

// Appeler la fonction d'initialisation
initializeDatabase();
