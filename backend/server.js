const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Security middleware (install with: npm install helmet express-rate-limit)
let helmet, rateLimit;
try { helmet = require('helmet'); } catch(e) { helmet = null; }
try { rateLimit = require('express-rate-limit'); } catch(e) { rateLimit = null; }

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const matchRoutes = require('./routes/matches');
const predictionRoutes = require('./routes/predictions');
const leaderboardRoutes = require('./routes/leaderboard');

// Import database
const db = require('./models/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
if (helmet) {
    app.use(helmet({ contentSecurityPolicy: false }));
}

// Rate limiting
if (rateLimit) {
    app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
    app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
}

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, '../')));

// Route par défaut pour le frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Erreur serveur',
        message: err.message 
    });
});

// Route 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
    console.log(`🌐 Frontend accessible sur http://localhost:${PORT}`);
    console.log(`📡 API disponible sur http://localhost:${PORT}/api`);
});

module.exports = app;