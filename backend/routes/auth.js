const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Route de connexion/création d'utilisateur
router.post('/login', async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Le nom est requis' });
        }

        let user;

        // Si email fourni, chercher par email
        if (email) {
            user = await User.findByEmail(email);
            if (user) {
                // Mettre à jour le nom si différent
                if (user.name !== name) {
                    await User.updateName(user.id, name);
                    user.name = name;
                }
            } else {
                // Créer un nouvel utilisateur avec email
                user = await User.create({ name, email });
            }
        } else {
            // Mode sans email (comme actuellement)
            // Chercher par nom ou créer
            const users = await User.findAll();
            user = users.find(u => u.name === name);
            
            if (!user) {
                user = await User.create({ name });
            }
        }

        // Générer un token JWT
        const token = jwt.sign(
            { userId: user.id, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            user: user.toPublic(),
            token
        });

    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
    }
});

// Route pour obtenir l'utilisateur actuel
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.json(user.toPublic());
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Middleware d'authentification
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token d\'accès requis' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token invalide' });
        }
        req.user = user;
        next();
    });
}

module.exports = router;
module.exports.authenticateToken = authenticateToken;