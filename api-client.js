// API Client pour l'application de pronostics football

class APIClient {
    constructor() {
        // Toujours utiliser le chemin relatif (fonctionne en local et en production)
        this.baseURL = '/api';
        this.token = localStorage.getItem('auth_token');
    }

    getHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = { headers: this.getHeaders(), ...options };

        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Erreur HTTP ${response.status}`);
        }

        return data;
    }

    // === AUTH ===
    async register(name, email, password) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
        if (data.token) {
            this.token = data.token;
            localStorage.setItem('auth_token', this.token);
        }
        return data;
    }

    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        if (data.token) {
            this.token = data.token;
            localStorage.setItem('auth_token', this.token);
        }
        return data;
    }

    async getCurrentUser() {
        return await this.request('/auth/me');
    }

    logout() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    isLoggedIn() {
        return !!this.token;
    }

    // === USERS ===
    async getUsers() {
        return await this.request('/users');
    }

    async updateUserName(id, name) {
        return await this.request(`/users/${id}/name`, {
            method: 'PUT',
            body: JSON.stringify({ name })
        });
    }
    // Supprimer un utilisateur (admin uniquement)
    async deleteUser(id) {
        return await this.request(`/users/${id}`, {
            method: 'DELETE'
        });
    }
    // === MATCHES ===
    async getMatches(userId = null) {
        let endpoint = '/matches';
        if (userId) endpoint += `?userId=${userId}`;
        return await this.request(endpoint);
    }

    async createMatch(matchData) {
        return await this.request('/matches', {
            method: 'POST',
            body: JSON.stringify(matchData)
        });
    }

    async updateMatchScore(id, team1Score, team2Score) {
        return await this.request(`/matches/${id}/score`, {
            method: 'PUT',
            body: JSON.stringify({ team1_score: team1Score, team2_score: team2Score })
        });
    }

    async deleteMatch(id) {
        return await this.request(`/matches/${id}`, { method: 'DELETE' });
    }

    // === PREDICTIONS ===
    async createPrediction(matchId, team1Score, team2Score, winnerPick) {
        var body = { match_id: matchId, team1_score: team1Score, team2_score: team2Score };
        if (winnerPick) body.winner_pick = winnerPick;
        return await this.request('/predictions', {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    async getUserPredictions(userId) {
        return await this.request(`/predictions/user/${userId}`);
    }

    // === LEADERBOARD ===
    async getLeaderboard() {
        return await this.request('/leaderboard');
    }

    async getUserRank(userId) {
        return await this.request(`/leaderboard/user/${userId}`);
    }
}

const apiClient = new APIClient();