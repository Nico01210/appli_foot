const { dbUtils } = require('./database');
const { v4: uuidv4 } = require('uuid');

class Prediction {
    constructor(data) {
        this.id = data.id || uuidv4();
        this.user_id = data.user_id;
        this.match_id = data.match_id;
        this.team1_score = data.team1_score;
        this.team2_score = data.team2_score;
        this.points_earned = data.points_earned || 0;
        this.created_at = data.created_at || new Date().toISOString();
        this.updated_at = data.updated_at || new Date().toISOString();
    }

    // Créer une prédiction
    static async create(predictionData) {
        const prediction = new Prediction(predictionData);
        
        const sql = `
            INSERT OR REPLACE INTO predictions 
            (id, user_id, match_id, team1_score, team2_score, points_earned, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await dbUtils.run(sql, [
            prediction.id, prediction.user_id, prediction.match_id,
            prediction.team1_score, prediction.team2_score, prediction.points_earned,
            prediction.created_at, prediction.updated_at
        ]);

        return prediction;
    }

    // Trouver une prédiction par ID
    static async findById(id) {
        const sql = 'SELECT * FROM predictions WHERE id = ?';
        const row = await dbUtils.get(sql, [id]);
        return row ? new Prediction(row) : null;
    }

    // Trouver une prédiction par utilisateur et match
    static async findByUserAndMatch(userId, matchId) {
        const sql = 'SELECT * FROM predictions WHERE user_id = ? AND match_id = ?';
        const row = await dbUtils.get(sql, [userId, matchId]);
        return row ? new Prediction(row) : null;
    }

    // Obtenir toutes les prédictions d'un utilisateur
    static async findByUser(userId) {
        const sql = `
            SELECT p.*, m.team1, m.team2, m.date, m.status
            FROM predictions p
            JOIN matches m ON p.match_id = m.id
            WHERE p.user_id = ?
            ORDER BY m.date ASC
        `;
        const rows = await dbUtils.all(sql, [userId]);
        return rows.map(row => ({
            ...new Prediction(row),
            match: {
                team1: row.team1,
                team2: row.team2,
                date: row.date,
                status: row.status
            }
        }));
    }

    // Obtenir toutes les prédictions d'un match
    static async findByMatch(matchId) {
        const sql = `
            SELECT p.*, u.name as user_name
            FROM predictions p
            JOIN users u ON p.user_id = u.id
            WHERE p.match_id = ?
            ORDER BY p.created_at ASC
        `;
        const rows = await dbUtils.all(sql, [matchId]);
        return rows.map(row => ({
            ...new Prediction(row),
            user_name: row.user_name
        }));
    }

    // Calculer et mettre à jour les points pour un match terminé
    static async calculatePointsForMatch(matchId, team1Score, team2Score) {
        // Obtenir la configuration des points
        const configSql = 'SELECT * FROM points_config WHERE id = 1';
        const config = await dbUtils.get(configSql);
        
        if (!config) {
            throw new Error('Configuration des points non trouvée');
        }

        // Obtenir toutes les prédictions pour ce match
        const predictionsSql = 'SELECT * FROM predictions WHERE match_id = ?';
        const predictions = await dbUtils.all(predictionsSql, [matchId]);

        // Calculer les points pour chaque prédiction
        for (const prediction of predictions) {
            let points = 0;

            // Score exact
            if (prediction.team1_score === team1Score && prediction.team2_score === team2Score) {
                points = config.exact_score;
            }
            // Bon vainqueur ou match nul
            else {
                const actualWinner = team1Score > team2Score ? 'team1' : 
                                   team2Score > team1Score ? 'team2' : 'draw';
                const predictedWinner = prediction.team1_score > prediction.team2_score ? 'team1' : 
                                      prediction.team2_score > prediction.team1_score ? 'team2' : 'draw';
                
                if (actualWinner === predictedWinner) {
                    points = config.correct_winner;
                } else {
                    points = config.wrong_prediction;
                }
            }

            // Mettre à jour les points de la prédiction
            const updatePredSql = `
                UPDATE predictions 
                SET points_earned = ?, updated_at = ?
                WHERE id = ?
            `;
            await dbUtils.run(updatePredSql, [points, new Date().toISOString(), prediction.id]);
        }

        // Mettre à jour les totaux des utilisateurs
        await this.updateUserTotals();
    }

    // Mettre à jour les totaux de tous les utilisateurs
    static async updateUserTotals() {
        const sql = `
            UPDATE users 
            SET 
                points = (
                    SELECT COALESCE(SUM(points_earned), 0) 
                    FROM predictions 
                    WHERE user_id = users.id
                ),
                total_predictions = (
                    SELECT COUNT(*) 
                    FROM predictions 
                    WHERE user_id = users.id
                ),
                correct_predictions = (
                    SELECT COUNT(*) 
                    FROM predictions 
                    WHERE user_id = users.id AND points_earned > 0
                ),
                last_activity = ?
        `;
        
        return await dbUtils.run(sql, [new Date().toISOString()]);
    }

    // Supprimer une prédiction
    static async delete(predictionId) {
        const sql = 'DELETE FROM predictions WHERE id = ?';
        return await dbUtils.run(sql, [predictionId]);
    }
}

module.exports = Prediction;