const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { dbUtils } = require('../models/database');

// Obtenir le classement général
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll();
        
        // Formatage du classement
        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            id: user.id,
            name: user.name,
            points: user.points,
            total_predictions: user.total_predictions,
            correct_predictions: user.correct_predictions,
            accuracy: user.total_predictions > 0 
                ? Math.round((user.correct_predictions / user.total_predictions) * 100) 
                : 0
        }));

        res.json(leaderboard);
    } catch (error) {
        console.error('Erreur lors de la récupération du classement:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Obtenir le classement avec détails des prédictions
router.get('/detailed', async (req, res) => {
    try {
        const sql = `
            SELECT 
                u.id,
                u.name,
                u.points,
                u.total_predictions,
                u.correct_predictions,
                COUNT(CASE WHEN p.points_earned = 3 THEN 1 END) as exact_scores,
                COUNT(CASE WHEN p.points_earned = 1 THEN 1 END) as correct_winners,
                COUNT(CASE WHEN p.points_earned = 0 THEN 1 END) as wrong_predictions
            FROM users u
            LEFT JOIN predictions p ON u.id = p.user_id
            GROUP BY u.id, u.name, u.points, u.total_predictions, u.correct_predictions
            ORDER BY u.points DESC, u.name ASC
        `;
        
        const rows = await dbUtils.all(sql);
        
        const detailedLeaderboard = rows.map((row, index) => ({
            rank: index + 1,
            id: row.id,
            name: row.name,
            points: row.points,
            total_predictions: row.total_predictions,
            correct_predictions: row.correct_predictions,
            accuracy: row.total_predictions > 0 
                ? Math.round((row.correct_predictions / row.total_predictions) * 100) 
                : 0,
            breakdown: {
                exact_scores: row.exact_scores,
                correct_winners: row.correct_winners,
                wrong_predictions: row.wrong_predictions
            }
        }));

        res.json(detailedLeaderboard);
    } catch (error) {
        console.error('Erreur lors de la récupération du classement détaillé:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Obtenir la position d'un utilisateur dans le classement
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Compter combien d'utilisateurs ont plus de points
        const sql = `
            SELECT COUNT(*) as better_users
            FROM users 
            WHERE points > ? OR (points = ? AND name < ?)
        `;
        
        const result = await dbUtils.get(sql, [user.points, user.points, user.name]);
        const rank = result.better_users + 1;

        // Obtenir le total d'utilisateurs
        const totalUsers = await dbUtils.get('SELECT COUNT(*) as total FROM users');

        res.json({
            user_id: userId,
            rank: rank,
            total_users: totalUsers.total,
            points: user.points,
            percentile: Math.round(((totalUsers.total - rank + 1) / totalUsers.total) * 100)
        });
    } catch (error) {
        console.error('Erreur lors de la récupération de la position:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Obtenir les statistiques globales
router.get('/stats/global', async (req, res) => {
    try {
        const sql = `
            SELECT 
                COUNT(DISTINCT u.id) as total_users,
                COUNT(p.id) as total_predictions,
                COUNT(CASE WHEN p.points_earned > 0 THEN 1 END) as correct_predictions,
                COUNT(CASE WHEN p.points_earned = 3 THEN 1 END) as exact_scores,
                AVG(u.points) as average_points,
                MAX(u.points) as max_points,
                COUNT(DISTINCT CASE WHEN m.status = 'completed' THEN m.id END) as completed_matches
            FROM users u
            LEFT JOIN predictions p ON u.id = p.user_id
            LEFT JOIN matches m ON p.match_id = m.id
        `;
        
        const stats = await dbUtils.get(sql);
        
        res.json({
            total_users: stats.total_users,
            total_predictions: stats.total_predictions,
            correct_predictions: stats.correct_predictions,
            exact_scores: stats.exact_scores,
            average_points: Math.round(stats.average_points || 0),
            max_points: stats.max_points || 0,
            completed_matches: stats.completed_matches,
            global_accuracy: stats.total_predictions > 0 
                ? Math.round((stats.correct_predictions / stats.total_predictions) * 100)
                : 0
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques globales:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;