// Fonction globale simple pour changer le nom (accessible immédiatement)
function changeUserName() {
    console.log('🖱️ Clic détecté sur le nom utilisateur (fonction globale)');
    const currentName = appData.currentUser.name;
    const newName = prompt(`🎯 Modifier votre pseudonyme\n\nPseudonyme actuel : ${currentName}\n\nNouveau pseudonyme :`, currentName);
    
    console.log('📝 Nouveau nom saisi:', newName);
    
    if (newName && newName.trim() && newName.trim() !== currentName) {
        changeUserNameLogic(newName.trim());
    } else if (newName && newName.trim() === currentName) {
        if (window.uiManager) {
            uiManager.showToast('Le pseudonyme est identique', 'warning');
        }
    } else if (newName === '') {
        if (window.uiManager) {
            uiManager.showToast('Le pseudonyme ne peut pas être vide', 'error');
        }
    }
}

// Fonction globale pour la logique de changement de nom
function changeUserNameLogic(newName) {
    console.log('🔄 Changement de nom vers:', newName);
    
    // Vérifier si le nom n'est pas déjà pris par un autre utilisateur
    const existingUser = appData.users.find(u => 
        u.name.toLowerCase() === newName.toLowerCase() && u.id !== appData.currentUser.id
    );
    
    if (existingUser) {
        if (window.uiManager) {
            uiManager.showToast('Ce pseudonyme est déjà utilisé', 'error');
        }
        return;
    }

    const oldName = appData.currentUser.name;
    
    // Mettre à jour le nom de l'utilisateur
    appData.currentUser.name = newName;
    appData.currentUser.lastActivity = new Date().toISOString();
    
    // Sauvegarder
    appData.saveUser();
    appData.updateUserInList();
    
    // Mettre à jour l'interface
    if (window.uiManager) {
        uiManager.updateHeader();
        uiManager.renderAdmin();
        uiManager.renderLeaderboard();
        uiManager.showToast(`Pseudonyme modifié : ${oldName} → ${newName}`, 'success');
    }
}

// Configuration et constantes
const CONFIG = {
    pointsSystem: {
        exactScore: 5,
        correctResult: 3,
        goalDifference: 2
    },
    tournaments: {
        worldcup: 'Coupe du Monde 2026',
        ligue1: 'Ligue 1 2024-25'
    }
};

// Données de l'application
class AppData {
    constructor() {
        this.currentUser = this.loadUser();
        this.users = this.loadUsers();
        this.matches = this.loadMatches();
        this.predictions = this.loadPredictions();
        this.pointsConfig = this.loadPointsConfig();
        this.currentTournament = 'worldcup';
    }

    loadUser() {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : {
            id: 'user_' + Date.now(),
            name: 'Joueur',
            points: 0,
            totalPredictions: 0,
            correctPredictions: 0,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        };
    }

    saveUser() {
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }

    loadUsers() {
        const usersData = localStorage.getItem('users');
        const users = usersData ? JSON.parse(usersData) : [];
        
        // Ajouter l'utilisateur actuel s'il n'existe pas
        if (!users.find(u => u.id === this.currentUser.id)) {
            users.push(this.currentUser);
        }
        
        return users;
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    loadMatches() {
        const matchesData = localStorage.getItem('matches');
        return matchesData ? JSON.parse(matchesData) : this.getDefaultMatches();
    }

    saveMatches() {
        localStorage.setItem('matches', JSON.stringify(this.matches));
    }

    loadPredictions() {
        const predictionsData = localStorage.getItem('predictions');
        return predictionsData ? JSON.parse(predictionsData) : [];
    }

    savePredictions() {
        localStorage.setItem('predictions', JSON.stringify(this.predictions));
    }

    loadPointsConfig() {
        const configData = localStorage.getItem('pointsConfig');
        return configData ? JSON.parse(configData) : CONFIG.pointsSystem;
    }

    savePointsConfig() {
        localStorage.setItem('pointsConfig', JSON.stringify(this.pointsConfig));
    }

    getDefaultMatches() {
        return [
            // Matchs Coupe du Monde 2026
            {
                id: 'wc_1',
                homeTeam: 'France',
                awayTeam: 'Argentine',
                date: '2026-06-15T20:00:00',
                tournament: 'worldcup',
                status: 'upcoming',
                homeScore: null,
                awayScore: null
            },
            {
                id: 'wc_2',
                homeTeam: 'Brésil',
                awayTeam: 'Allemagne',
                date: '2026-06-16T16:00:00',
                tournament: 'worldcup',
                status: 'upcoming',
                homeScore: null,
                awayScore: null
            },
            {
                id: 'wc_3',
                homeTeam: 'Espagne',
                awayTeam: 'Italie',
                date: '2026-06-17T20:00:00',
                tournament: 'worldcup',
                status: 'upcoming',
                homeScore: null,
                awayScore: null
            },
            // Matchs Ligue 1
            {
                id: 'l1_1',
                homeTeam: 'PSG',
                awayTeam: 'Marseille',
                date: '2024-11-01T21:00:00',
                tournament: 'ligue1',
                status: 'completed',
                homeScore: 2,
                awayScore: 1
            },
            {
                id: 'l1_2',
                homeTeam: 'Lyon',
                awayTeam: 'Monaco',
                date: '2024-11-03T17:00:00',
                tournament: 'ligue1',
                status: 'upcoming',
                homeScore: null,
                awayScore: null
            },
            {
                id: 'l1_3',
                homeTeam: 'Lille',
                awayTeam: 'Nice',
                date: '2024-11-05T20:00:00',
                tournament: 'ligue1',
                status: 'upcoming',
                homeScore: null,
                awayScore: null
            }
        ];
    }

    updateUserInList() {
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.currentUser };
        } else {
            this.users.push(this.currentUser);
        }
        this.saveUsers();
    }
}

// Instance globale des données
const appData = new AppData();

// Gestionnaire d'interface utilisateur
class UIManager {
    constructor() {
        this.currentTab = 'dashboard';
        this.initializeEventListeners();
        this.updateUI();
    }

    initializeEventListeners() {
        console.log('🔧 Initialisation des événements...');
        
        // Navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Sélecteur de tournoi
        document.getElementById('tournamentSelect').addEventListener('change', (e) => {
            appData.currentTournament = e.target.value;
            this.updateUI();
        });

        // Filtre des matchs
        document.getElementById('matchFilter').addEventListener('change', () => {
            this.renderMatches();
        });

        // Boutons de période du classement
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.renderLeaderboard();
            });
        });

        // Modal
        document.getElementById('closePredictionModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('predictionModal').addEventListener('click', (e) => {
            if (e.target.id === 'predictionModal') {
                this.closeModal();
            }
        });

        // Formulaire de pronostic
        document.getElementById('submitPrediction').addEventListener('click', () => {
            this.submitPrediction();
        });

        // Admin
        document.getElementById('savePointsConfig').addEventListener('click', () => {
            this.savePointsConfiguration();
        });

        document.getElementById('saveUserName').addEventListener('click', () => {
            const newName = document.getElementById('userNameInput').value.trim();
            if (newName && newName !== appData.currentUser.name) {
                changeUserNameLogic(newName);
            }
        });

        document.getElementById('addMatchForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewMatch();
        });

        // Initialiser les valeurs admin
        this.loadAdminValues();
    }

    switchTab(tabName) {
        // Mettre à jour les onglets
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Mettre à jour le contenu
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;

        // Rafraîchir le contenu selon l'onglet
        switch (tabName) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'predictions':
                this.renderMatches();
                break;
            case 'leaderboard':
                this.renderLeaderboard();
                break;
            case 'admin':
                this.renderAdmin();
                break;
        }
    }

    updateUI() {
        this.updateHeader();
        this.renderDashboard();
        this.renderMatches();
        this.renderLeaderboard();
        this.renderAdmin();
    }

    updateHeader() {
        const userNameElement = document.getElementById('userName');
        const userPointsElement = document.getElementById('userPoints');
        
        if (userNameElement) {
            userNameElement.textContent = appData.currentUser.name;
            // S'assurer que l'élément reste cliquable
            userNameElement.style.cursor = 'pointer';
            userNameElement.style.userSelect = 'none';
            userNameElement.title = 'Cliquer pour modifier votre pseudonyme';
            
            console.log('✅ Header mis à jour pour:', appData.currentUser.name);
        } else {
            console.error('❌ Élément userName non trouvé dans updateHeader');
        }
        
        if (userPointsElement) {
            userPointsElement.textContent = appData.currentUser.points;
        }
    }

    renderDashboard() {
        const userPredictions = appData.predictions.filter(p => p.userId === appData.currentUser.id);
        const tournamentPredictions = userPredictions.filter(p => {
            const match = appData.matches.find(m => m.id === p.matchId);
            return match && match.tournament === appData.currentTournament;
        });

        const correctPredictions = tournamentPredictions.filter(p => p.points > 0).length;
        const accuracy = tournamentPredictions.length > 0 ? 
            Math.round((correctPredictions / tournamentPredictions.length) * 100) : 0;

        // Calculer le rang
        const leaderboard = this.calculateLeaderboard();
        const userRank = leaderboard.findIndex(user => user.id === appData.currentUser.id) + 1;

        // Mettre à jour les statistiques
        document.getElementById('totalPredictions').textContent = tournamentPredictions.length;
        document.getElementById('correctPredictions').textContent = correctPredictions;
        document.getElementById('accuracy').textContent = accuracy + '%';
        document.getElementById('userRank').textContent = userRank > 0 ? userRank : '-';

        // Afficher les pronostics récents
        this.renderRecentPredictions();
    }

    renderRecentPredictions() {
        const userPredictions = appData.predictions
            .filter(p => p.userId === appData.currentUser.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        const container = document.getElementById('recentPredictionsList');
        container.innerHTML = '';

        if (userPredictions.length === 0) {
            container.innerHTML = '<p class="text-center">Aucun pronostic récent</p>';
            return;
        }

        userPredictions.forEach(prediction => {
            const match = appData.matches.find(m => m.id === prediction.matchId);
            if (!match) return;

            const predictionCard = document.createElement('div');
            predictionCard.className = 'match-card';
            
            const statusClass = match.status === 'completed' ? 
                (prediction.points > 0 ? 'success' : 'error') : 'upcoming';

            predictionCard.innerHTML = `
                <div class="match-header">
                    <span class="match-tournament">${CONFIG.tournaments[match.tournament]}</span>
                    <span class="match-date">${this.formatDate(match.date)}</span>
                </div>
                <div class="match-body">
                    <div class="match-teams">
                        <div class="team">
                            <div class="team-flag">🏴</div>
                            <div class="team-name">${match.homeTeam}</div>
                        </div>
                        <div class="vs">VS</div>
                        <div class="team">
                            <div class="team-flag">🏴</div>
                            <div class="team-name">${match.awayTeam}</div>
                        </div>
                    </div>
                    <div class="prediction-info">
                        <div class="predicted-score">${prediction.homeScore} - ${prediction.awayScore}</div>
                        ${match.status === 'completed' ? 
                            `<div class="prediction-points ${statusClass}">
                                ${prediction.points > 0 ? '+' + prediction.points + ' points' : 'Aucun point'}
                            </div>` : 
                            '<div class="prediction-points">En attente</div>'
                        }
                    </div>
                </div>
            `;

            container.appendChild(predictionCard);
        });
    }

    renderMatches() {
        const filter = document.getElementById('matchFilter').value;
        let filteredMatches = appData.matches.filter(match => match.tournament === appData.currentTournament);

        switch (filter) {
            case 'upcoming':
                filteredMatches = filteredMatches.filter(match => match.status === 'upcoming');
                break;
            case 'completed':
                filteredMatches = filteredMatches.filter(match => match.status === 'completed');
                break;
        }

        filteredMatches.sort((a, b) => new Date(a.date) - new Date(b.date));

        const container = document.getElementById('matchesList');
        container.innerHTML = '';

        if (filteredMatches.length === 0) {
            container.innerHTML = '<p class="text-center">Aucun match trouvé</p>';
            return;
        }

        filteredMatches.forEach(match => {
            const userPrediction = appData.predictions.find(p => 
                p.matchId === match.id && p.userId === appData.currentUser.id
            );

            const matchCard = document.createElement('div');
            matchCard.className = 'match-card';

            const isUpcoming = match.status === 'upcoming';
            const canPredict = isUpcoming && new Date(match.date) > new Date();

            matchCard.innerHTML = `
                <div class="match-header">
                    <span class="match-tournament">${CONFIG.tournaments[match.tournament]}</span>
                    <span class="match-date">${this.formatDate(match.date)}</span>
                </div>
                <div class="match-body">
                    <div class="match-teams">
                        <div class="team">
                            <div class="team-flag">🏴</div>
                            <div class="team-name">${match.homeTeam}</div>
                            ${match.status === 'completed' ? `<div class="final-score">${match.homeScore}</div>` : ''}
                        </div>
                        <div class="vs">VS</div>
                        <div class="team">
                            <div class="team-flag">🏴</div>
                            <div class="team-name">${match.awayTeam}</div>
                            ${match.status === 'completed' ? `<div class="final-score">${match.awayScore}</div>` : ''}
                        </div>
                    </div>
                    
                    ${userPrediction ? `
                        <div class="prediction-info">
                            <div class="predicted-score">Votre pronostic: ${userPrediction.homeScore} - ${userPrediction.awayScore}</div>
                            ${match.status === 'completed' ? 
                                `<div class="prediction-points ${userPrediction.points > 0 ? 'success' : 'error'}">
                                    ${userPrediction.points > 0 ? '+' + userPrediction.points + ' points' : 'Aucun point'}
                                </div>` : 
                                '<div class="prediction-points">En attente du résultat</div>'
                            }
                        </div>
                    ` : ''}
                    
                    <div class="match-actions">
                        ${canPredict ? `
                            <button class="btn ${userPrediction ? 'btn-outline' : 'btn-primary'}" 
                                    onclick="uiManager.openPredictionModal('${match.id}')">
                                <i class="fas fa-${userPrediction ? 'edit' : 'plus'}"></i>
                                ${userPrediction ? 'Modifier' : 'Pronostiquer'}
                            </button>
                        ` : ''}
                        
                        ${match.status === 'completed' && !userPrediction ? `
                            <span class="btn btn-outline" style="opacity: 0.5;">
                                <i class="fas fa-clock"></i>
                                Trop tard
                            </span>
                        ` : ''}
                    </div>
                </div>
            `;

            container.appendChild(matchCard);
        });
    }

    renderLeaderboard() {
        const leaderboard = this.calculateLeaderboard();
        const container = document.getElementById('leaderboardList');
        container.innerHTML = '';

        if (leaderboard.length === 0) {
            container.innerHTML = '<p class="text-center">Aucun joueur dans le classement</p>';
            return;
        }

        leaderboard.forEach((user, index) => {
            const rank = index + 1;
            const isCurrentUser = user.id === appData.currentUser.id;
            
            const leaderboardItem = document.createElement('div');
            leaderboardItem.className = `leaderboard-item ${isCurrentUser ? 'current-user' : ''}`;

            let rankClass = '';
            if (rank === 1) rankClass = 'gold';
            else if (rank === 2) rankClass = 'silver';
            else if (rank === 3) rankClass = 'bronze';

            leaderboardItem.innerHTML = `
                <div class="rank ${rankClass}">
                    ${rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
                </div>
                <div class="player-info">
                    <div class="player-name">${user.name} ${isCurrentUser ? '(Vous)' : ''}</div>
                    <div class="player-stats">
                        ${user.totalPredictions} pronostic${user.totalPredictions > 1 ? 's' : ''} • 
                        ${user.correctPredictions} correct${user.correctPredictions > 1 ? 's' : ''} • 
                        ${user.totalPredictions > 0 ? Math.round((user.correctPredictions / user.totalPredictions) * 100) : 0}% de réussite
                    </div>
                </div>
                <div class="player-points">${user.points}</div>
            `;

            container.appendChild(leaderboardItem);
        });
    }

    calculateLeaderboard() {
        return appData.users
            .map(user => {
                const userPredictions = appData.predictions.filter(p => p.userId === user.id);
                const correctPredictions = userPredictions.filter(p => p.points > 0).length;
                const totalPoints = userPredictions.reduce((sum, p) => sum + p.points, 0);

                return {
                    ...user,
                    points: totalPoints,
                    totalPredictions: userPredictions.length,
                    correctPredictions: correctPredictions
                };
            })
            .sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                if (b.correctPredictions !== a.correctPredictions) return b.correctPredictions - a.correctPredictions;
                return b.totalPredictions - a.totalPredictions;
            });
    }

    renderAdmin() {
        // Charger la configuration des points
        document.getElementById('exactScorePoints').value = appData.pointsConfig.exactScore;
        document.getElementById('correctResultPoints').value = appData.pointsConfig.correctResult;
        document.getElementById('goalDifferencePoints').value = appData.pointsConfig.goalDifference;

        // Charger les informations utilisateur
        document.getElementById('userNameInput').value = appData.currentUser.name;
        
        // Afficher les informations de profil
        if (appData.currentUser.createdAt) {
            document.getElementById('memberSince').textContent = this.formatDate(appData.currentUser.createdAt);
        } else {
            document.getElementById('memberSince').textContent = 'Information non disponible';
        }
        
        if (appData.currentUser.lastActivity) {
            document.getElementById('lastActivity').textContent = this.formatDate(appData.currentUser.lastActivity);
        } else {
            document.getElementById('lastActivity').textContent = 'Information non disponible';
        }

        // Afficher les statistiques admin
        document.getElementById('totalUsers').textContent = appData.users.length;
        document.getElementById('totalPredictionsAdmin').textContent = appData.predictions.length;
        document.getElementById('activeMatches').textContent = 
            appData.matches.filter(m => m.status === 'upcoming').length;

        // Afficher les matchs en attente de résultats
        this.renderPendingMatches();
    }

    renderPendingMatches() {
        const pendingMatches = appData.matches.filter(match => 
            match.status === 'upcoming' && new Date(match.date) < new Date()
        );

        const container = document.getElementById('pendingMatches');
        container.innerHTML = '';

        if (pendingMatches.length === 0) {
            container.innerHTML = '<p>Aucun match en attente de résultat</p>';
            return;
        }

        pendingMatches.forEach(match => {
            const matchDiv = document.createElement('div');
            matchDiv.className = 'pending-match';
            matchDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: var(--border-radius);">
                    <div>
                        <strong>${match.homeTeam} vs ${match.awayTeam}</strong>
                        <br>
                        <small>${this.formatDate(match.date)}</small>
                    </div>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <input type="number" min="0" max="20" placeholder="0" style="width: 60px; text-align: center;" id="home_${match.id}">
                        <span>-</span>
                        <input type="number" min="0" max="20" placeholder="0" style="width: 60px; text-align: center;" id="away_${match.id}">
                        <button class="btn btn-success" onclick="uiManager.updateMatchResult('${match.id}')">
                            <i class="fas fa-check"></i>
                            Confirmer
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(matchDiv);
        });
    }

    loadAdminValues() {
        document.getElementById('exactScorePoints').value = appData.pointsConfig.exactScore;
        document.getElementById('correctResultPoints').value = appData.pointsConfig.correctResult;
        document.getElementById('goalDifferencePoints').value = appData.pointsConfig.goalDifference;
    }

    openPredictionModal(matchId) {
        const match = appData.matches.find(m => m.id === matchId);
        if (!match) return;

        const existingPrediction = appData.predictions.find(p => 
            p.matchId === matchId && p.userId === appData.currentUser.id
        );

        // Remplir les informations du modal
        document.getElementById('modalHomeTeam').textContent = match.homeTeam;
        document.getElementById('modalAwayTeam').textContent = match.awayTeam;
        document.getElementById('modalMatchDate').textContent = this.formatDate(match.date);

        // Pré-remplir avec la prédiction existante
        if (existingPrediction) {
            document.getElementById('homeScore').value = existingPrediction.homeScore;
            document.getElementById('awayScore').value = existingPrediction.awayScore;
        } else {
            document.getElementById('homeScore').value = 0;
            document.getElementById('awayScore').value = 0;
        }

        // Stocker l'ID du match pour la soumission
        document.getElementById('predictionModal').dataset.matchId = matchId;
        
        // Afficher le modal
        document.getElementById('predictionModal').classList.add('active');
    }

    closeModal() {
        document.getElementById('predictionModal').classList.remove('active');
    }

    submitPrediction() {
        const matchId = document.getElementById('predictionModal').dataset.matchId;
        const homeScore = parseInt(document.getElementById('homeScore').value);
        const awayScore = parseInt(document.getElementById('awayScore').value);

        if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
            this.showToast('Veuillez entrer des scores valides', 'error');
            return;
        }

        // Vérifier si une prédiction existe déjà
        const existingPredictionIndex = appData.predictions.findIndex(p => 
            p.matchId === matchId && p.userId === appData.currentUser.id
        );

        const prediction = {
            id: existingPredictionIndex >= 0 ? appData.predictions[existingPredictionIndex].id : 'pred_' + Date.now(),
            matchId: matchId,
            userId: appData.currentUser.id,
            homeScore: homeScore,
            awayScore: awayScore,
            date: new Date().toISOString(),
            points: 0
        };

        if (existingPredictionIndex >= 0) {
            appData.predictions[existingPredictionIndex] = prediction;
            this.showToast('Pronostic modifié avec succès !', 'success');
        } else {
            appData.predictions.push(prediction);
            this.showToast('Pronostic enregistré avec succès !', 'success');
        }

        appData.savePredictions();
        this.closeModal();
        this.updateUI();
    }

    addNewMatch() {
        const homeTeam = document.getElementById('homeTeam').value.trim();
        const awayTeam = document.getElementById('awayTeam').value.trim();
        const matchDate = document.getElementById('matchDate').value;
        const tournament = document.getElementById('matchTournament').value;

        if (!homeTeam || !awayTeam || !matchDate) {
            this.showToast('Veuillez remplir tous les champs', 'error');
            return;
        }

        const newMatch = {
            id: 'match_' + Date.now(),
            homeTeam: homeTeam,
            awayTeam: awayTeam,
            date: matchDate,
            tournament: tournament,
            status: 'upcoming',
            homeScore: null,
            awayScore: null
        };

        appData.matches.push(newMatch);
        appData.saveMatches();

        // Réinitialiser le formulaire
        document.getElementById('addMatchForm').reset();
        
        this.showToast('Match ajouté avec succès !', 'success');
        this.renderMatches();
        this.renderAdmin();
    }

    updateMatchResult(matchId) {
        const homeScore = parseInt(document.getElementById(`home_${matchId}`).value);
        const awayScore = parseInt(document.getElementById(`away_${matchId}`).value);

        if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
            this.showToast('Veuillez entrer des scores valides', 'error');
            return;
        }

        // Mettre à jour le match
        const matchIndex = appData.matches.findIndex(m => m.id === matchId);
        if (matchIndex === -1) return;

        appData.matches[matchIndex].homeScore = homeScore;
        appData.matches[matchIndex].awayScore = awayScore;
        appData.matches[matchIndex].status = 'completed';

        // Calculer les points pour toutes les prédictions de ce match
        this.calculatePredictionPoints(matchId, homeScore, awayScore);

        appData.saveMatches();
        this.showToast('Résultat mis à jour avec succès !', 'success');
        this.updateUI();
    }

    calculatePredictionPoints(matchId, actualHomeScore, actualAwayScore) {
        const matchPredictions = appData.predictions.filter(p => p.matchId === matchId);
        const actualResult = this.getMatchResult(actualHomeScore, actualAwayScore);
        const actualDifference = Math.abs(actualHomeScore - actualAwayScore);

        matchPredictions.forEach(prediction => {
            const predictedResult = this.getMatchResult(prediction.homeScore, prediction.awayScore);
            const predictedDifference = Math.abs(prediction.homeScore - prediction.awayScore);
            
            let points = 0;

            // Score exact
            if (prediction.homeScore === actualHomeScore && prediction.awayScore === actualAwayScore) {
                points = appData.pointsConfig.exactScore;
            }
            // Bon résultat (victoire, nul, défaite)
            else if (predictedResult === actualResult) {
                points = appData.pointsConfig.correctResult;
            }
            // Bonne différence de buts
            else if (predictedDifference === actualDifference) {
                points = appData.pointsConfig.goalDifference;
            }

            prediction.points = points;

            // Mettre à jour les stats de l'utilisateur
            const user = appData.users.find(u => u.id === prediction.userId);
            if (user) {
                if (prediction.userId === appData.currentUser.id) {
                    appData.currentUser.points = appData.predictions
                        .filter(p => p.userId === appData.currentUser.id)
                        .reduce((sum, p) => sum + p.points, 0);
                    appData.saveUser();
                }
            }
        });

        appData.savePredictions();
        appData.updateUserInList();
    }

    getMatchResult(homeScore, awayScore) {
        if (homeScore > awayScore) return 'home';
        if (awayScore > homeScore) return 'away';
        return 'draw';
    }

    savePointsConfiguration() {
        const exactScore = parseInt(document.getElementById('exactScorePoints').value);
        const correctResult = parseInt(document.getElementById('correctResultPoints').value);
        const goalDifference = parseInt(document.getElementById('goalDifferencePoints').value);

        if (isNaN(exactScore) || isNaN(correctResult) || isNaN(goalDifference)) {
            this.showToast('Veuillez entrer des valeurs valides', 'error');
            return;
        }

        appData.pointsConfig = {
            exactScore: exactScore,
            correctResult: correctResult,
            goalDifference: goalDifference
        };

        appData.savePointsConfig();
        this.showToast('Configuration sauvegardée !', 'success');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 
                    type === 'error' ? 'exclamation-circle' : 'info-circle';
        
        toast.innerHTML = `
            <i class="fas fa-${icon} toast-icon"></i>
            <span class="toast-message">${message}</span>
        `;

        document.getElementById('toastContainer').appendChild(toast);

        // Animer l'apparition
        setTimeout(() => toast.classList.add('show'), 100);

        // Supprimer après 3 secondes
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialisation de l'application
let uiManager;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Démarrage de l\'application...');
    
    // Créer l'instance UIManager
    uiManager = new UIManager();
    
    // Vérifier si c'est la première visite
    if (!localStorage.getItem('currentUser')) {
        const userName = prompt('🎉 Bienvenue dans Pronostics Football !\n\nVeuillez choisir votre pseudonyme :') || 'Joueur';
        appData.currentUser.name = userName.trim();
        appData.currentUser.createdAt = new Date().toISOString();
        appData.currentUser.lastActivity = new Date().toISOString();
        appData.saveUser();
        appData.updateUserInList();
        uiManager.updateHeader();
        uiManager.showToast(`Bienvenue ${userName} ! 🎊`, 'success');
    } else {
        // Mettre à jour la dernière activité
        appData.currentUser.lastActivity = new Date().toISOString();
        appData.saveUser();
    }
});

// Service Worker pour PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}