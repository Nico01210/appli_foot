const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbDir = process.env.DB_PATH || path.join(__dirname, '..');
const dbPath = path.join(dbDir, 'database.sqlite');

// Créer ou ouvrir la base de données
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erreur lors de l\'ouverture de la base de données:', err.message);
    } else {
        console.log('✅ Connexion à la base SQLite établie');
        initializeDatabase();
    }
});

// Initialiser les tables
function initializeDatabase() {
    // Table des utilisateurs
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            password_hash TEXT,
            points INTEGER DEFAULT 0,
            total_predictions INTEGER DEFAULT 0,
            correct_predictions INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_admin BOOLEAN DEFAULT 0
        )
    `);

    // Table des matchs
    db.run(`
        CREATE TABLE IF NOT EXISTS matches (
            id TEXT PRIMARY KEY,
            team1 TEXT NOT NULL,
            team2 TEXT NOT NULL,
            team1_flag TEXT,
            team2_flag TEXT,
            date DATETIME NOT NULL,
            venue TEXT,
            tournament TEXT DEFAULT 'worldcup',
            phase TEXT DEFAULT 'group',
            status TEXT DEFAULT 'pending',
            team1_score INTEGER,
            team2_score INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Migration : ajouter colonne phase si elle n'existe pas
    db.run(`ALTER TABLE matches ADD COLUMN phase TEXT DEFAULT 'group'`, (err) => {
        if (err && !err.message.includes('duplicate column')) console.error(err);
    });

    // Table des prédictions
    db.run(`
        CREATE TABLE IF NOT EXISTS predictions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            match_id TEXT NOT NULL,
            team1_score INTEGER NOT NULL,
            team2_score INTEGER NOT NULL,
            winner_pick TEXT,
            points_earned INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (match_id) REFERENCES matches (id),
            UNIQUE(user_id, match_id)
        )
    `);

    // Migration : ajouter colonne winner_pick si elle n'existe pas
    db.run(`ALTER TABLE predictions ADD COLUMN winner_pick TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) console.error(err);
    });

    // Table de configuration des points
    db.run(`
        CREATE TABLE IF NOT EXISTS points_config (
            id INTEGER PRIMARY KEY,
            exact_score INTEGER DEFAULT 3,
            correct_winner INTEGER DEFAULT 1,
            wrong_prediction INTEGER DEFAULT 0,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Table d'historique des classements (pour les flèches montée/descente)
    db.run(`
        CREATE TABLE IF NOT EXISTS rank_history (
            user_id TEXT NOT NULL,
            rank INTEGER NOT NULL,
            match_id TEXT NOT NULL,
            recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, match_id),
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (match_id) REFERENCES matches (id)
        )
    `);

    // Insérer la configuration par défaut
    db.run(`
        INSERT OR IGNORE INTO points_config (id, exact_score, correct_winner, wrong_prediction)
        VALUES (1, 3, 1, 0)
    `);

    // Indexes pour performances
    db.run('CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_predictions_match_id ON predictions(match_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status)');
    db.run('CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date)');
    db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_name ON users(name)');

    console.log('📊 Tables de base de données initialisées');
}

// Fonctions utilitaires
const dbUtils = {
    // Exécuter une requête avec promesse
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    },

    // Récupérer une ligne
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    // Récupérer plusieurs lignes
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

module.exports = { db, dbUtils };