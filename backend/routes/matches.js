const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const authModule = require('./auth');
const authenticateToken = authModule.authenticateToken;

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
router.post('/', authenticateToken, async (req, res) => {
    try {
        const matchData = req.body;
        
        // Validation des données requises
        if (!matchData.team1 || !matchData.team2 || !matchData.date) {
            return res.status(400).json({ 
                error: 'Les équipes et la date sont requises' 
            });
        }

        const match = await Match.create(matchData);
        res.status(201).json(match);
    } catch (error) {
        console.error('Erreur lors de la création du match:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Mettre à jour le score d'un match (admin seulement)
router.put('/:id/score', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { team1_score, team2_score } = req.body;

        if (team1_score === undefined || team2_score === undefined) {
            return res.status(400).json({ 
                error: 'Les scores des deux équipes sont requis' 
            });
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

// Mettre à jour le statut d'un match
router.put('/:id/status', authenticateToken, async (req, res) => {
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
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Supprimer d'abord les prédictions associées
        const Prediction = require('../models/Prediction');
        // Cette fonctionnalité pourrait être ajoutée si nécessaire
        
        await Match.delete(id);
        
        res.json({ message: 'Match supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du match:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;