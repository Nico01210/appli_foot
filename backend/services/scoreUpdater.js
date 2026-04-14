const cron = require('node-cron');
const axios = require('axios');
const Match = require('../models/Match');
const Prediction = require('../models/Prediction');
const dbUtils = require('../models/database');

class AutoScoreUpdater {
    constructor() {
        // API football-data.org (gratuite : 2000 req/jour)
        this.apiKey = process.env.FOOTBALL_API_KEY || 'YOUR_API_KEY_HERE';
        this.apiBaseUrl = 'https://api.football-data.org/v4';
        
        // Mapping des équipes (à adapter selon vos données)
        this.teamMapping = {
            'France': 'FRA',
            'Allemagne': 'GER',
            'Espagne': 'ESP',
            'Italie': 'ITA',
            'Angleterre': 'ENG',
            'Portugal': 'POR',
            'Pays-Bas': 'NED',
            'Belgique': 'BEL',
            // Ajoutez vos équipes...
        };
    }

    // Démarre l'automatisation (toutes les 15 minutes)
    start() {
        console.log('🤖 Service d\'automatisation des scores démarré');
        
        // Vérifie toutes les 15 minutes pendant les périodes de match
        cron.schedule('*/15 * * * *', async () => {
            await this.updateAllScores();
        });

        // Vérifie intensivement pendant les heures de match (ex: 14h-23h)
        cron.schedule('*/5 14-23 * * *', async () => {
            await this.updateAllScores();
        });

        console.log('⏰ Planificateur configuré: toutes les 15min (5min en soirée)');
    }

    async updateAllScores() {
        try {
            console.log('🔍 Vérification des scores automatique...');
            
            // Récupère les matchs non terminés
            const pendingMatches = await dbUtils.all(`
                SELECT * FROM matches 
                WHERE status IN ('pending', 'ongoing') 
                AND date <= datetime('now', '+2 hours')
                ORDER BY date
            `);

            if (pendingMatches.length === 0) {
                console.log('✅ Aucun match à vérifier');
                return;
            }

            console.log(`📋 ${pendingMatches.length} match(s) à vérifier`);

            for (const match of pendingMatches) {
                await this.updateSingleMatch(match);
                // Pause entre les appels API (respecter les limites)
                await this.sleep(1000);
            }

        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour automatique:', error.message);
        }
    }

    async updateSingleMatch(match) {
        try {
            // Récupère le résultat depuis l'API externe
            const externalResult = await this.fetchMatchResult(match);
            
            if (!externalResult) {
                console.log(`⏸️  Pas de résultat disponible pour ${match.team1} vs ${match.team2}`);
                return;
            }

            const { homeScore, awayScore, status } = externalResult;

            // Vérifie si le score a changé
            if (match.team1_score === homeScore && 
                match.team2_score === awayScore && 
                match.status === 'completed') {
                return; // Déjà à jour
            }

            console.log(`🎯 Mise à jour automatique: ${match.team1} ${homeScore}-${awayScore} ${match.team2}`);

            // Sauvegarde l'historique des rangs (comme fait manuellement)
            await this.saveRankHistory(match.id);

            // Met à jour le score (utilise la même logique que l'admin)
            await Match.updateScore(match.id, homeScore, awayScore);

            // Recalcule les points
            await Prediction.calculatePointsForMatch(match.id, homeScore, awayScore);

            console.log(`✅ Score automatiquement mis à jour: ${match.team1} ${homeScore}-${awayScore} ${match.team2}`);

            // Log pour audit
            await this.logAutoUpdate(match.id, homeScore, awayScore);

        } catch (error) {
            console.error(`❌ Erreur pour ${match.team1} vs ${match.team2}:`, error.message);
        }
    }

    async fetchMatchResult(match) {
        try {
            // Option 1: API football-data.org (World Cup 2026)
            const response = await axios.get(
                `${this.apiBaseUrl}/competitions/2000/matches`, // FIFA World Cup
                {
                    headers: { 'X-Auth-Token': this.apiKey },
                    timeout: 10000
                }
            );

            const externalMatches = response.data.matches;
            
            // Trouve le match correspondant par équipes et date
            const foundMatch = externalMatches.find(extMatch => {
                const homeTeam = this.normalizeTeamName(extMatch.homeTeam.name);
                const awayTeam = this.normalizeTeamName(extMatch.awayTeam.name);
                const matchDate = new Date(extMatch.utcDate).toDateString();
                const ourMatchDate = new Date(match.date).toDateString();
                
                return (homeTeam === match.team1 && awayTeam === match.team2 && 
                        matchDate === ourMatchDate) ||
                       (homeTeam === match.team2 && awayTeam === match.team1 && 
                        matchDate === ourMatchDate);
            });

            if (!foundMatch || foundMatch.status !== 'FINISHED') {
                return null;
            }

            return {
                homeScore: foundMatch.score.fullTime.home,
                awayScore: foundMatch.score.fullTime.away,
                status: 'completed'
            };

        } catch (error) {
            // Option 2: API de secours (ESPN, RapidAPI, etc.)
            console.warn('⚠️  API principale indisponible, essai API de secours...');
            return await this.fetchFromBackupAPI(match);
        }
    }

    async fetchFromBackupAPI(match) {
        // Implémentation d'une API de secours
        // Par exemple: ESPN API, RapidAPI Football, etc.
        return null;
    }

    normalizeTeamName(apiTeamName) {
        // Normalise les noms d'équipes entre votre DB et l'API
        const mapping = {
            'France': 'France',
            'Germany': 'Allemagne',
            'Spain': 'Espagne',
            'Italy': 'Italie',
            'England': 'Angleterre',
            'Portugal': 'Portugal',
            'Netherlands': 'Pays-Bas',
            'Belgium': 'Belgique',
            // Étendre selon vos besoins...
        };
        
        return mapping[apiTeamName] || apiTeamName;
    }

    async saveRankHistory(matchId) {
        // Reproduit la logique de sauvegarde des rangs (routes/matches.js:92-95)
        const allUsers = await dbUtils.all('SELECT * FROM users ORDER BY points DESC, correct_predictions DESC');
        const rankSql = 'INSERT INTO rank_history (user_id, rank, match_id, recorded_at) VALUES (?, ?, ?, ?)';
        
        for (let i = 0; i < allUsers.length; i++) {
            await dbUtils.run(rankSql, [allUsers[i].id, i + 1, matchId, new Date().toISOString()]);
        }
    }

    async logAutoUpdate(matchId, homeScore, awayScore) {
        // Log d'audit pour traçabilité
        console.log(`📊 AUTO-UPDATE: Match ${matchId} -> ${homeScore}-${awayScore} at ${new Date().toISOString()}`);
        
        // Optionnel: Enregistrer dans une table d'audit
        /*
        await dbUtils.run(`
            INSERT INTO auto_updates_log (match_id, home_score, away_score, updated_at) 
            VALUES (?, ?, ?, ?)
        `, [matchId, homeScore, awayScore, new Date().toISOString()]);
        */
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Méthode pour tester manuellement
    async testUpdate(matchId) {
        const match = await dbUtils.get('SELECT * FROM matches WHERE id = ?', [matchId]);
        if (match) {
            await this.updateSingleMatch(match);
        }
    }

    // Arrêt propre
    stop() {
        console.log('⏹️  Service d\'automatisation arrêté');
        // Cleanup si nécessaire
    }
}

module.exports = AutoScoreUpdater;