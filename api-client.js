// API Client pour l'application de pronostics football
// Remplace l'utilisation de localStorage par des appels API

class APIClient {
    constructor() {
        this.baseURL = 'http://localhost:3001/api';
        this.token = localStorage.getItem('auth_token');
    }

    // Headers par défaut avec authentification
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Méthode générique pour les requêtes
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `HTTP ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Erreur API ${endpoint}:`, error);
            throw error;
        }
    }

    // === AUTHENTIFICATION ===
    async login(name, email = null) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ name, email })
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

    // === UTILISATEURS ===
    async getUsers() {
        return await this.request('/users');
    }

    async getUser(id) {
        return await this.request(`/users/${id}`);
    }

    async updateUserName(id, name) {
        return await this.request(`/users/${id}/name`, {
            method: 'PUT',
            body: JSON.stringify({ name })
        });
    }

    async getUserStats(id) {
        return await this.request(`/users/${id}/stats`);
    }

    // === MATCHS ===
    async getMatches(status = null, userId = null) {
        let endpoint = '/matches';
        const params = new URLSearchParams();
        
        if (status) params.append('status', status);
        if (userId) params.append('userId', userId);
        
        if (params.toString()) {
            endpoint += `?${params.toString()}`;
        }
        
        return await this.request(endpoint);
    }

    async getMatch(id) {
        return await this.request(`/matches/${id}`);
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
            body: JSON.stringify({ 
                team1_score: team1Score, 
                team2_score: team2Score 
            })
        });
    }

    async updateMatchStatus(id, status) {
        return await this.request(`/matches/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    // === PRÉDICTIONS ===
    async getUserPredictions(userId) {
        return await this.request(`/predictions/user/${userId}`);
    }

    async getMatchPredictions(matchId) {
        return await this.request(`/predictions/match/${matchId}`);
    }

    async createPrediction(matchId, team1Score, team2Score) {
        return await this.request('/predictions', {
            method: 'POST',
            body: JSON.stringify({
                match_id: matchId,
                team1_score: team1Score,
                team2_score: team2Score
            })
        });
    }

    async deletePrediction(id) {
        return await this.request(`/predictions/${id}`, {
            method: 'DELETE'
        });
    }

    // === CLASSEMENT ===
    async getLeaderboard() {
        return await this.request('/leaderboard');
    }

    async getDetailedLeaderboard() {
        return await this.request('/leaderboard/detailed');
    }

    async getUserRank(userId) {
        return await this.request(`/leaderboard/user/${userId}`);
    }

    async getGlobalStats() {
        return await this.request('/leaderboard/stats/global');
    }
}

// Instance globale du client API
const apiClient = new APIClient();