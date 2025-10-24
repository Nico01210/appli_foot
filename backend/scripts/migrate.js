const { dbUtils } = require('../models/database');
const User = require('../models/User');
const Match = require('../models/Match');
const Prediction = require('../models/Prediction');

// Données par défaut des matchs (reprises de votre app.js)
const defaultMatches = [
    {
        id: "match_1",
        team1: "France",
        team2: "Australie",
        team1_flag: "🇫🇷",
        team2_flag: "🇦🇺",
        date: "2025-11-20T20:00:00Z",
        venue: "Stade de France",
        tournament: "worldcup",
        status: "pending"
    },
    {
        id: "match_2",
        team1: "Argentine",
        team2: "Arabie Saoudite",
        team1_flag: "🇦🇷",
        team2_flag: "🇸🇦",
        date: "2025-11-21T13:00:00Z",
        venue: "Lusail Stadium",
        tournament: "worldcup",
        status: "pending"
    },
    {
        id: "match_3",
        team1: "Mexique",
        team2: "Pologne",
        team1_flag: "🇲🇽",
        team2_flag: "🇵🇱",
        date: "2025-11-22T17:00:00Z",
        venue: "Stadium 974",
        tournament: "worldcup",
        status: "pending"
    },
    {
        id: "match_4",
        team1: "Danemark",
        team2: "Tunisie",
        team1_flag: "🇩🇰",
        team2_flag: "🇹🇳",
        date: "2025-11-22T14:00:00Z",
        venue: "Education City Stadium",
        tournament: "worldcup",
        status: "pending"
    }
];

async function migrateData() {
    console.log('🚀 Début de la migration des données...');

    try {
        // Attendre que la base soit complètement initialisée
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 1. Migrer les matchs par défaut
        console.log('📋 Migration des matchs...');
        for (const matchData of defaultMatches) {
            const existingMatch = await Match.findById(matchData.id);
            if (!existingMatch) {
                await Match.create(matchData);
                console.log(`✅ Match créé: ${matchData.team1} vs ${matchData.team2}`);
            } else {
                console.log(`⏭️  Match déjà existant: ${matchData.team1} vs ${matchData.team2}`);
            }
        }

        // 2. Créer un utilisateur administrateur par défaut
        console.log('👤 Création de l\'utilisateur administrateur...');
        const adminUser = await User.findByEmail('admin@example.com');
        if (!adminUser) {
            await User.create({
                name: 'Administrateur',
                email: 'admin@example.com',
                is_admin: true
            });
            console.log('✅ Utilisateur administrateur créé');
        } else {
            console.log('⏭️  Utilisateur administrateur déjà existant');
        }

        console.log('✨ Migration terminée avec succès !');
        console.log('\n📋 Prochaines étapes:');
        console.log('1. Démarrer le serveur: npm start');
        console.log('2. Accéder à l\'application: http://localhost:3001');
        console.log('3. Les utilisateurs peuvent maintenant se connecter avec leur nom');
        console.log('4. Toutes les données seront synchronisées entre les appareils');

    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
        throw error;
    }
}

// Script de migration pour les données localStorage (à utiliser manuellement)
function generateMigrationScript() {
    return `
// Script à exécuter dans la console du navigateur
// pour extraire les données localStorage actuelles

function extractLocalStorageData() {
    const data = {
        currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null'),
        users: JSON.parse(localStorage.getItem('users') || '[]'),
        matches: JSON.parse(localStorage.getItem('matches') || '[]'),
        predictions: JSON.parse(localStorage.getItem('predictions') || '[]'),
        pointsConfig: JSON.parse(localStorage.getItem('pointsConfig') || 'null')
    };
    
    console.log('=== DONNÉES LOCALSTORAGE ===');
    console.log(JSON.stringify(data, null, 2));
    
    // Copier dans le presse-papier si possible
    if (navigator.clipboard) {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        console.log('✅ Données copiées dans le presse-papier');
    }
    
    return data;
}

extractLocalStorageData();
`;
}

// Fonction pour importer des données depuis localStorage
async function importLocalStorageData(localStorageData) {
    console.log('📥 Import des données localStorage...');

    try {
        // Importer les utilisateurs
        if (localStorageData.users && localStorageData.users.length > 0) {
            console.log('👥 Import des utilisateurs...');
            for (const userData of localStorageData.users) {
                const existingUser = await User.findById(userData.id);
                if (!existingUser) {
                    await User.create(userData);
                    console.log(`✅ Utilisateur créé: ${userData.name}`);
                } else {
                    console.log(`⏭️  Utilisateur déjà existant: ${userData.name}`);
                }
            }
        }

        // Importer les matchs
        if (localStorageData.matches && localStorageData.matches.length > 0) {
            console.log('⚽ Import des matchs...');
            for (const matchData of localStorageData.matches) {
                const existingMatch = await Match.findById(matchData.id);
                if (!existingMatch) {
                    await Match.create(matchData);
                    console.log(`✅ Match créé: ${matchData.team1} vs ${matchData.team2}`);
                }
            }
        }

        // Importer les prédictions
        if (localStorageData.predictions && localStorageData.predictions.length > 0) {
            console.log('🎯 Import des prédictions...');
            for (const predictionData of localStorageData.predictions) {
                const existingPrediction = await Prediction.findByUserAndMatch(
                    predictionData.userId, 
                    predictionData.matchId
                );
                if (!existingPrediction) {
                    await Prediction.create({
                        user_id: predictionData.userId,
                        match_id: predictionData.matchId,
                        team1_score: predictionData.team1Score,
                        team2_score: predictionData.team2Score,
                        points_earned: predictionData.points || 0
                    });
                    console.log(`✅ Prédiction créée pour le match ${predictionData.matchId}`);
                }
            }
        }

        // Recalculer les totaux des utilisateurs
        await Prediction.updateUserTotals();
        console.log('📊 Totaux des utilisateurs recalculés');

        console.log('✨ Import terminé avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors de l\'import:', error);
        throw error;
    }
}

// Exporter les fonctions
module.exports = {
    migrateData,
    generateMigrationScript,
    importLocalStorageData
};

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
    migrateData()
        .then(() => {
            console.log('\n🎉 Migration réussie !');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Migration échouée:', error);
            process.exit(1);
        });
}