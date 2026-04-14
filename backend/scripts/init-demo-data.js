const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Utiliser la même DB que l'application
const dbPath = process.env.DB_PATH || path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Helper functions
const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

async function initializeDemoData() {
    console.log('🚀 Initialisation des données de démonstration...');

    try {
        // Vérifier si des utilisateurs existent déjà
        const existingUsers = await dbGet('SELECT COUNT(*) as count FROM users');
        if (existingUsers && existingUsers.count > 0) {
            console.log('⚠️  Des utilisateurs existent déjà. Démo annulée pour éviter les doublons.');
            return;
        }

        // 1. Créer un admin
        const adminPassword = await bcrypt.hash('admin123', 10);
        const adminResult = await dbRun(
            'INSERT INTO users (name, email, password_hash, is_admin, created_at) VALUES (?, ?, ?, ?, ?)',
            ['Admin', 'admin@pronofoot.com', adminPassword, 1, new Date().toISOString()]
        );
        console.log('✅ Admin créé : admin@pronofoot.com / admin123');

        // 2. Créer quelques joueurs de demo
        const players = [
            { name: 'Pierre', email: 'pierre@test.com' },
            { name: 'Marie', email: 'marie@test.com' },
            { name: 'Lucas', email: 'lucas@test.com' },
            { name: 'Emma', email: 'emma@test.com' }
        ];

        const playerPassword = await bcrypt.hash('demo123', 10);
        const playerIds = [];

        for (const player of players) {
            const result = await dbRun(
                'INSERT INTO users (name, email, password_hash, is_admin, created_at) VALUES (?, ?, ?, ?, ?)',
                [player.name, player.email, playerPassword, 0, new Date().toISOString()]
            );
            playerIds.push(result.lastID);
        }
        console.log('✅ 4 joueurs demo créés (mot de passe: demo123)');

        // 3. Créer des matchs d'exemple (Coupe du Monde 2026)
        const matches = [
            {
                team1: 'France', team2: 'Allemagne',
                date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // Dans 2 jours
                tournament: 'FIFA World Cup 2026', phase: 'group', venue: 'Stade de France'
            },
            {
                team1: 'Espagne', team2: 'Italie',
                date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // Dans 3 jours
                tournament: 'FIFA World Cup 2026', phase: 'group', venue: 'Camp Nou'
            },
            {
                team1: 'Brésil', team2: 'Argentine',
                date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), // Dans 5 jours
                tournament: 'FIFA World Cup 2026', phase: 'group', venue: 'Maracanã'
            },
            {
                team1: 'Angleterre', team2: 'Portugal',
                date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // Dans 7 jours
                tournament: 'FIFA World Cup 2026', phase: 'knockout', venue: 'Wembley'
            },
            {
                team1: 'Pays-Bas', team2: 'Belgique',
                date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // Hier (terminé)
                tournament: 'FIFA World Cup 2026', phase: 'group', venue: 'Amsterdam Arena',
                team1_score: 2, team2_score: 1, status: 'completed'
            }
        ];

        const matchIds = [];
        for (const match of matches) {
            const result = await dbRun(
                'INSERT INTO matches (team1, team2, date, tournament, phase, venue, team1_score, team2_score, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [match.team1, match.team2, match.date, match.tournament, match.phase, match.venue, 
                 match.team1_score || null, match.team2_score || null, match.status || 'pending', new Date().toISOString()]
            );
            matchIds.push(result.lastID);
        }
        console.log('✅ 5 matchs d\'exemple créés (1 terminé, 4 à venir)');

        // 4. Créer quelques pronostics d'exemple
        const predictions = [
            // Match terminé Pays-Bas vs Belgique (2-1)
            { userId: playerIds[0], matchId: matchIds[4], team1Score: 2, team2Score: 1 }, // Pierre - exact
            { userId: playerIds[1], matchId: matchIds[4], team1Score: 1, team2Score: 0 }, // Marie - bon vainqueur
            { userId: playerIds[2], matchId: matchIds[4], team1Score: 0, team2Score: 1 }, // Lucas - mauvais

            // Match à venir France vs Allemagne
            { userId: playerIds[0], matchId: matchIds[0], team1Score: 2, team2Score: 0 },
            { userId: playerIds[1], matchId: matchIds[0], team1Score: 1, team2Score: 1 },
            { userId: playerIds[2], matchId: matchIds[0], team1Score: 3, team2Score: 1 },

            // Match à venir Espagne vs Italie
            { userId: playerIds[0], matchId: matchIds[1], team1Score: 1, team2Score: 0 },
            { userId: playerIds[1], matchId: matchIds[1], team1Score: 2, team2Score: 1 }
        ];

        for (const pred of predictions) {
            await dbRun(
                'INSERT INTO predictions (user_id, match_id, team1_score, team2_score, created_at) VALUES (?, ?, ?, ?, ?)',
                [pred.userId, pred.matchId, pred.team1Score, pred.team2Score, new Date().toISOString()]
            );
        }
        console.log('✅ Pronostics d\'exemple créés');

        // 5. Calculer les points pour le match terminé
        const Prediction = require('../models/Prediction');
        await Prediction.calculatePointsForMatch(matchIds[4], 2, 1); // Pays-Bas 2-1 Belgique
        console.log('✅ Points calculés pour le match terminé');

        // 6. Configuration des points par défaut
        await dbRun(
            'INSERT OR REPLACE INTO points_config (id, exact_score, correct_winner, wrong_prediction) VALUES (1, 3, 1, 0)'
        );
        console.log('✅ Configuration points : Score exact=3, Bon résultat=1, Mauvais=0');

        console.log('\n🎉 DONNÉES DEMO CRÉÉES AVEC SUCCÈS !');
        console.log('\n📋 COMPTES CRÉÉS :');
        console.log('   👑 Admin : admin@pronofoot.com / admin123');
        console.log('   👤 Pierre : pierre@test.com / demo123');
        console.log('   👤 Marie : marie@test.com / demo123');
        console.log('   👤 Lucas : lucas@test.com / demo123');
        console.log('   👤 Emma : emma@test.com / demo123');
        console.log('\n⚽ MATCHS : 5 matchs créés (1 terminé avec résultats)');
        console.log('🎯 PRONOS : Quelques pronostics d\'exemple');
        console.log('🏆 POINTS : Pierre en tête avec un score exact !');
        console.log('\n🚀 L\'application est prête à être testée sur http://localhost:3001');

    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
    }
}

// Lancer l'initialisation si appelé directement
if (require.main === module) {
    initializeDemoData().then(() => {
        process.exit(0);
    }).catch(error => {
        console.error('Erreur fatale:', error);
        process.exit(1);
    });
}

module.exports = { initializeDemoData };