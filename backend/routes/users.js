const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authModule = require('./auth');
const authenticateToken = authModule.authenticateToken;
const requireAdmin = authModule.requireAdmin;

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

// Mettre à jour le nom d'utilisateur (admin uniquement)
router.put('/:id/name', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        // Seuls les admins peuvent modifier les pseudos
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Seuls les administrateurs peuvent modifier les pseudonymes' });
        }

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: 'Le pseudonyme ne peut pas être vide' });
        }

        // Vérifier que le pseudo n'est pas déjà pris par un autre utilisateur
        const existingUser = await User.findByName(name.trim());
        if (existingUser && existingUser.id !== id) {
            return res.status(409).json({ error: 'Ce pseudonyme est déjà utilisé' });
        }

        await User.updateName(id, name.trim());
        const updatedUser = await User.findById(id);
        
        res.json({
            message: 'Pseudonyme mis à jour avec succès',
            user: updatedUser.toPublic()
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du pseudonyme:', error);
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

// Supprimer un utilisateur (admin seulement)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        const currentUserId = req.user.userId;

        // Vérification de sécurité : empêcher l'auto-suppression
        if (parseInt(userId) === parseInt(currentUserId)) {
            return res.status(400).json({ 
                error: 'Impossible de supprimer votre propre compte' 
            });
        }

        // Vérifier que l'utilisateur existe
        const userExists = await User.exists(userId);
        if (!userExists) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Récupérer les infos utilisateur pour logs
        const userToDelete = await User.findById(userId);
        const userPredictions = await User.countUserPredictions(userId);

        console.log(`🗑️  Admin ${req.user.name} supprime utilisateur: ${userToDelete.name} (${userPredictions} prédictions)`);

        // Suppression en cascade (comme pour les matchs)
        const Prediction = require('../models/Prediction');
        
        // 1. Supprimer l'historique des rangs
        await Prediction.deleteRankHistoryByUser(userId);
        
        // 2. Supprimer les prédictions
        await Prediction.deleteByUser(userId);
        
        // 3. Supprimer l'utilisateur
        await User.delete(userId);

        // Recalcul des rangs des autres utilisateurs après suppression
        await Prediction.updateUserTotals();

        res.json({ 
            message: `Utilisateur '${userToDelete.name}' supprimé avec succès`,
            deletedUser: {
                id: userToDelete.id,
                name: userToDelete.name,
                predictionsCount: userPredictions
            }
        });

    } catch (error) {
        console.error('Erreur suppression utilisateur:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
    }
});

module.exports = router;