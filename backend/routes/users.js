const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authModule = require('./auth');
const authenticateToken = authModule.authenticateToken;

// Obtenir tous les utilisateurs
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users.map(user => user.toPublic()));
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Obtenir un utilisateur par ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.json(user.toPublic());
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Mettre à jour le nom d'utilisateur
router.put('/:id/name', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        // Vérifier que l'utilisateur modifie son propre profil
        if (req.user.userId !== id) {
            return res.status(403).json({ error: 'Non autorisé' });
        }

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: 'Le nom ne peut pas être vide' });
        }

        await User.updateName(id, name.trim());
        const updatedUser = await User.findById(id);
        
        res.json({
            message: 'Nom mis à jour avec succès',
            user: updatedUser.toPublic()
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du nom:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Obtenir les statistiques d'un utilisateur
router.get('/:id/stats', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const stats = {
            points: user.points,
            total_predictions: user.total_predictions,
            correct_predictions: user.correct_predictions,
            accuracy: user.total_predictions > 0 
                ? Math.round((user.correct_predictions / user.total_predictions) * 100) 
                : 0,
            member_since: user.created_at,
            last_activity: user.last_activity
        };

        res.json(stats);
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;