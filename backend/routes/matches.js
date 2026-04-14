const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const authModule = require('./auth');
const authenticateToken = authModule.authenticateToken;
const requireAdmin = authModule.requireAdmin;

// Obtenir tous les matchs
router.get('/', async (req, res) => {
    try {
        const { status, userId } = req.query;
        
        let matches;
        if (userId) {
            // Matchs avec les prédictions de l'utilisateur
            matches = await Match.findWithUserPredictions(userId);
        } else if (status) {
            // Matchs par statut
            matches = await Match.findByStatus(status);
        } else {
            // Tous les matchs
            matches = await Match.findAll();
        }

        res.json(matches);
    } catch (error) {
        console.error('Erreur lors de la récupération des matchs:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Obtenir un match par ID
router.get('/:id', async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) {
            return res.status(404).json({ error: 'Match non trouvé' });
        }
        res.json(match);
    } catch (error) {
        console.error('Erreur lors de la récupération du match:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Créer un nouveau match (admin seulement)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const matchData = req.body;
        
        // Validation des données requises
        if (!matchData.team1 || !matchData.team2 || !matchData.date) {
            return res.status(400).json({ 
                error: 'Les équipes et la date sont requises' 
            });
        }

        // Validation des noms d'équipe
        if (matchData.team1.length > 50 || matchData.team2.length > 50) {
            return res.status(400).json({ error: 'Nom d\'équipe trop long (max 50 caractères)' });
        }

        // Validation de la date
        if (isNaN(new Date(matchData.date).getTime())) {
            return res.status(400).json({ error: 'Date invalide' });
        }

        const match = await Match.create(matchData);
        res.status(201).json(match);
    } catch (error) {
        console.error('Erreur lors de la création du match:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Mettre à jour le score d'un match (admin seulement)
router.put('/:id/score', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { team1_score, team2_score } = req.body;

        if (team1_score === undefined || team2_score === undefined) {
            return res.status(400).json({ 
                error: 'Les scores des deux équipes sont requis' 
            });
        }

        // Sauvegarder le classement actuel avant le calcul des points
        const User = require('../models/User');
        const allUsers = await User.findAll();
        for (let i = 0; i < allUsers.length; i++) {
            const rankSql = `INSERT OR REPLACE INTO rank_history (user_id, rank, match_id, recorded_at) VALUES (?, ?, ?, ?)`;
            await require('../models/database').dbUtils.run(rankSql, [allUsers[i].id, i + 1, id, new Date().toISOString()]);
        }

        // Mettre à jour le score du match
        await Match.updateScore(id, team1_score, team2_score);
        
        // Calculer les points pour toutes les prédictions de ce match
        const Prediction = require('../models/Prediction');
        await Prediction.calculatePointsForMatch(id, team1_score, team2_score);

        const updatedMatch = await Match.findById(id);
        res.json({
            message: 'Score mis à jour et points calculés',
            match: updatedMatch
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du score:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Mettre à jour le statut d'un match (admin seulement)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Le statut est requis' });
        }

        await Match.updateStatus(id, status);
        const updatedMatch = await Match.findById(id);
        
        res.json({
            message: 'Statut mis à jour',
            match: updatedMatch
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Supprimer un match (admin seulement)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Supprimer d'abord les prédictions associées
        const Prediction = require('../models/Prediction');
        await Prediction.deleteByMatch(id);
        
        await Match.delete(id);
        
        res.json({ message: 'Match supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du match:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Nouvelle route : Test automatisation pour un match spécifique
router.post('/:id/auto-update', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Importer le service (pas global pour éviter les erreurs si désactivé)
        const AutoScoreUpdater = require('../services/scoreUpdater');
        const scoreUpdater = new AutoScoreUpdater();
        
        const match = await dbUtils.get('SELECT * FROM matches WHERE id = ?', [id]);
        if (!match) {
            return res.status(404).json({ error: 'Match non trouvé' });
        }
        
        if (match.status === 'completed') {
            return res.status(400).json({ error: 'Match déjà terminé' });
        }
        
        console.log(`🤖 Test automatisation demandé par admin pour match ${id}`);
        await scoreUpdater.updateSingleMatch(match);
        
        const updatedMatch = await dbUtils.get('SELECT * FROM matches WHERE id = ?', [id]);
        res.json({ 
            message: 'Test automatisation effectué',
            match: updatedMatch
        });
        
    } catch (error) {
        console.error('Erreur test automatisation:', error);
        res.status(500).json({ error: 'Erreur lors du test automatisation' });
    }
});

module.exports = router;