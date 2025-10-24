const { dbUtils } = require('./database');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

class User {
    constructor(data) {
        this.id = data.id || uuidv4();
        this.name = data.name;
        this.email = data.email;
        this.password_hash = data.password_hash;
        this.points = data.points || 0;
        this.total_predictions = data.total_predictions || 0;
        this.correct_predictions = data.correct_predictions || 0;
        this.created_at = data.created_at || new Date().toISOString();
        this.last_activity = data.last_activity || new Date().toISOString();
        this.is_admin = data.is_admin || false;
    }

    // Créer un utilisateur
    static async create(userData) {
        const user = new User(userData);
        
        if (userData.password) {
            user.password_hash = await bcrypt.hash(userData.password, 10);
        }

        const sql = `
            INSERT INTO users (id, name, email, password_hash, points, total_predictions, 
                             correct_predictions, created_at, last_activity, is_admin)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await dbUtils.run(sql, [
            user.id, user.name, user.email, user.password_hash,
            user.points, user.total_predictions, user.correct_predictions,
            user.created_at, user.last_activity, user.is_admin
        ]);

        return user;
    }

    // Trouver un utilisateur par ID
    static async findById(id) {
        const sql = 'SELECT * FROM users WHERE id = ?';
        const row = await dbUtils.get(sql, [id]);
        return row ? new User(row) : null;
    }

    // Trouver un utilisateur par email
    static async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const row = await dbUtils.get(sql, [email]);
        return row ? new User(row) : null;
    }

    // Obtenir tous les utilisateurs
    static async findAll() {
        const sql = 'SELECT * FROM users ORDER BY points DESC, name ASC';
        const rows = await dbUtils.all(sql);
        return rows.map(row => new User(row));
    }

    // Mettre à jour les points d'un utilisateur
    static async updatePoints(userId, points, totalPredictions, correctPredictions) {
        const sql = `
            UPDATE users 
            SET points = ?, total_predictions = ?, correct_predictions = ?, last_activity = ?
            WHERE id = ?
        `;
        return await dbUtils.run(sql, [
            points, totalPredictions, correctPredictions, 
            new Date().toISOString(), userId
        ]);
    }

    // Mettre à jour le nom d'utilisateur
    static async updateName(userId, newName) {
        const sql = `
            UPDATE users 
            SET name = ?, last_activity = ?
            WHERE id = ?
        `;
        return await dbUtils.run(sql, [newName, new Date().toISOString(), userId]);
    }

    // Vérifier le mot de passe
    async verifyPassword(password) {
        if (!this.password_hash) return false;
        return await bcrypt.compare(password, this.password_hash);
    }

    // Obtenir les données publiques (sans mot de passe)
    toPublic() {
        const { password_hash, ...publicData } = this;
        return publicData;
    }
}

module.exports = User;