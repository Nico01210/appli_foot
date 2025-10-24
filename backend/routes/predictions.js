const express = require('express');
const router = express.Router();
const Prediction = require('../models/Prediction');
const authModule = require('./auth');
const authenticateToken = authModule.authenticateToken;

// Obtenir toutes les prédictions d'un utilisateur
router.get('/user/:userId', async (req, res) => {
    try {
        const predictions = await Prediction.findByUser(req.params.userId);
        res.json(predictions);
    } catch (error) {
        console.error('Erreur lors de la récupération des prédictions:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Obtenir toutes les prédictions d'un match
router.get('/match/:matchId', async (req, res) => {
    try {
        const predictions = await Prediction.findByMatch(req.params.matchId);
        res.json(predictions);
    } catch (error) {
        console.error('Erreur lors de la récupération des prédictions du match:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Créer ou mettre à jour une prédiction
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { match_id, team1_score, team2_score } = req.body;
        const user_id = req.user.userId;

        // Validation des données
        if (!match_id || team1_score === undefined || team2_score === undefined) {
            return res.status(400).json({ 
                error: 'Match ID et scores sont requis' 
            });
        }

        if (team1_score < 0 || team2_score < 0) {
            return res.status(400).json({ 
                error: 'Les scores ne peuvent pas être négatifs' 
            });
        }

        // Vérifier que le match existe et n'est pas terminé
        const Match = require('../models/Match');
        const match = await Match.findById(match_id);
        
        if (!match) {
            return res.status(404).json({ error: 'Match non trouvé' });
        }

        if (match.status === 'completed') {
            return res.status(400).json({ 
                error: 'Impossible de faire un pronostic sur un match terminé' 
            });
        }

        // Vérifier si une prédiction existe déjà
        const existingPrediction = await Prediction.findByUserAndMatch(user_id, match_id);
        
        let prediction;
        if (existingPrediction) {
            // Mettre à jour la prédiction existante
            prediction = await Prediction.create({
                id: existingPrediction.id,
                user_id,
                match_id,
                team1_score: parseInt(team1_score),
                team2_score: parseInt(team2_score),
                updated_at: new Date().toISOString()
            });
        } else {
            // Créer une nouvelle prédiction
            prediction = await Prediction.create({
                user_id,
                match_id,
                team1_score: parseInt(team1_score),
                team2_score: parseInt(team2_score)
            });
        }

        res.json({
            message: existingPrediction ? 'Prédiction mise à jour' : 'Prédiction créée',
            prediction
        });
    } catch (error) {
        console.error('Erreur lors de la création/mise à jour de la prédiction:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Obtenir une prédiction spécifique
router.get('/:id', async (req, res) => {
    try {
        const prediction = await Prediction.findById(req.params.id);
        if (!prediction) {
            return res.status(404).json({ error: 'Prédiction non trouvée' });
        }
        res.json(prediction);
    } catch (error) {
        console.error('Erreur lors de la récupération de la prédiction:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Supprimer une prédiction
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Vérifier que la prédiction appartient à l'utilisateur
        const prediction = await Prediction.findById(id);
        if (!prediction) {
            return res.status(404).json({ error: 'Prédiction non trouvée' });
        }

        if (prediction.user_id !== req.user.userId) {
            return res.status(403).json({ error: 'Non autorisé' });
        }

        await Prediction.delete(id);
        res.json({ message: 'Prédiction supprimée avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de la prédiction:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;