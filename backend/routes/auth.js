const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Route d'inscription
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Nom, email et mot de passe sont requis' });
        }

        if (password.length < 4) {
            return res.status(400).json({ error: 'Le mot de passe doit faire au moins 4 caractères' });
        }

        // Vérifier si l'email est déjà utilisé
        const existing = await User.findByEmail(email);
        if (existing) {
            return res.status(409).json({ error: 'Cet email est déjà utilisé' });
        }

        // Vérifier si le pseudo est déjà utilisé
        const existingName = await User.findByName(name);
        if (existingName) {
            return res.status(409).json({ error: 'Ce pseudonyme est déjà utilisé' });
        }

        const user = await User.create({ name, email, password });

        const token = jwt.sign(
            { userId: user.id, name: user.name, isAdmin: user.is_admin ? true : false },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({ user: user.toPublic(), token });
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
    }
});

// Route de connexion
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe sont requis' });
        }

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        const valid = await user.verifyPassword(password);
        if (!valid) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        const token = jwt.sign(
            { userId: user.id, name: user.name, isAdmin: user.is_admin ? true : false },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ user: user.toPublic(), token });
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

// Middleware d'autorisation admin
function requireAdmin(req, res, next) {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }
    next();
}

module.exports = router;
module.exports.authenticateToken = authenticateToken;
module.exports.requireAdmin = requireAdmin;