const { dbUtils } = require('./database');
const { v4: uuidv4 } = require('uuid');

class Match {
    constructor(data) {
        this.id = data.id || uuidv4();
        this.team1 = data.team1;
        this.team2 = data.team2;
        this.team1_flag = data.team1_flag;
        this.team2_flag = data.team2_flag;
        this.date = data.date;
        this.venue = data.venue;
        this.tournament = data.tournament || 'worldcup';
        this.status = data.status || 'pending';
        this.team1_score = data.team1_score;
        this.team2_score = data.team2_score;
        this.created_at = data.created_at || new Date().toISOString();
        this.updated_at = data.updated_at || new Date().toISOString();
    }

    // Créer un match
    static async create(matchData) {
        const match = new Match(matchData);
        
        const sql = `
            INSERT INTO matches (id, team1, team2, team1_flag, team2_flag, date, venue, 
                               tournament, status, team1_score, team2_score, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await dbUtils.run(sql, [
            match.id, match.team1, match.team2, match.team1_flag, match.team2_flag,
            match.date, match.venue, match.tournament, match.status,
            match.team1_score, match.team2_score, match.created_at, match.updated_at
        ]);

        return match;
    }

    // Trouver un match par ID
    static async findById(id) {
        const sql = 'SELECT * FROM matches WHERE id = ?';
        const row = await dbUtils.get(sql, [id]);
        return row ? new Match(row) : null;
    }

    // Obtenir tous les matchs
    static async findAll() {
        const sql = 'SELECT * FROM matches ORDER BY date ASC';
        const rows = await dbUtils.all(sql);
        return rows.map(row => new Match(row));
    }

    // Obtenir les matchs par statut
    static async findByStatus(status) {
        const sql = 'SELECT * FROM matches WHERE status = ? ORDER BY date ASC';
        const rows = await dbUtils.all(sql, [status]);
        return rows.map(row => new Match(row));
    }

    // Mettre à jour le score d'un match
    static async updateScore(matchId, team1Score, team2Score) {
        const sql = `
            UPDATE matches 
            SET team1_score = ?, team2_score = ?, status = 'completed', updated_at = ?
            WHERE id = ?
        `;
        return await dbUtils.run(sql, [
            team1Score, team2Score, new Date().toISOString(), matchId
        ]);
    }

    // Mettre à jour le statut d'un match
    static async updateStatus(matchId, status) {
        const sql = `
            UPDATE matches 
            SET status = ?, updated_at = ?
            WHERE id = ?
        `;
        return await dbUtils.run(sql, [status, new Date().toISOString(), matchId]);
    }

    // Supprimer un match
    static async delete(matchId) {
        const sql = 'DELETE FROM matches WHERE id = ?';
        return await dbUtils.run(sql, [matchId]);
    }

    // Obtenir les matchs avec les prédictions d'un utilisateur
    static async findWithUserPredictions(userId) {
        const sql = `
            SELECT m.*, p.team1_score as pred_team1, p.team2_score as pred_team2, 
                   p.points_earned, p.id as prediction_id
            FROM matches m
            LEFT JOIN predictions p ON m.id = p.match_id AND p.user_id = ?
            ORDER BY m.date ASC
        `;
        const rows = await dbUtils.all(sql, [userId]);
        
        return rows.map(row => {
            const match = new Match(row);
            if (row.prediction_id) {
                match.userPrediction = {
                    id: row.prediction_id,
                    team1_score: row.pred_team1,
                    team2_score: row.pred_team2,
                    points_earned: row.points_earned
                };
            }
            return match;
        });
    }
}

module.exports = Match;