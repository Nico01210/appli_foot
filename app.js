// Configuration et constantes
const CONFIG = {
    pointsSystem: {
        exactScore: 5,
        correctResult: 3,
        winnerRegular: 1
    },
    tournaments: {
        worldcup: 'Coupe du Monde 2026',
        ligue1: 'Ligue 1 2024-25'
    },
    teamFlags: {
        'France': '\u{1F1EB}\u{1F1F7}', 'Argentine': '\u{1F1E6}\u{1F1F7}', 'Br\u00e9sil': '\u{1F1E7}\u{1F1F7}', 'Allemagne': '\u{1F1E9}\u{1F1EA}',
        'Espagne': '\u{1F1EA}\u{1F1F8}', 'Italie': '\u{1F1EE}\u{1F1F9}', 'Portugal': '\u{1F1F5}\u{1F1F9}', 'Pays-Bas': '\u{1F1F3}\u{1F1F1}',
        'Belgique': '\u{1F1E7}\u{1F1EA}', 'Angleterre': '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}', 'Croatie': '\u{1F1ED}\u{1F1F7}', 'Maroc': '\u{1F1F2}\u{1F1E6}',
        'Mexique': '\u{1F1F2}\u{1F1FD}', '\u00c9tats-Unis': '\u{1F1FA}\u{1F1F8}', 'Canada': '\u{1F1E8}\u{1F1E6}', 'Japon': '\u{1F1EF}\u{1F1F5}',
        'Cor\u00e9e du Sud': '\u{1F1F0}\u{1F1F7}', 'Australie': '\u{1F1E6}\u{1F1FA}', 'Suisse': '\u{1F1E8}\u{1F1ED}', 'Pologne': '\u{1F1F5}\u{1F1F1}',
        'Danemark': '\u{1F1E9}\u{1F1F0}', 'Su\u00e8de': '\u{1F1F8}\u{1F1EA}', 'Norv\u00e8ge': '\u{1F1F3}\u{1F1F4}', 'Autriche': '\u{1F1E6}\u{1F1F9}',
        'R\u00e9publique Tch\u00e8que': '\u{1F1E8}\u{1F1FF}', 'Hongrie': '\u{1F1ED}\u{1F1FA}', 'Slovaquie': '\u{1F1F8}\u{1F1F0}',
        'Slov\u00e9nie': '\u{1F1F8}\u{1F1EE}', 'Serbie': '\u{1F1F7}\u{1F1F8}', 'Gr\u00e8ce': '\u{1F1EC}\u{1F1F7}', 'Turquie': '\u{1F1F9}\u{1F1F7}',
        'Russie': '\u{1F1F7}\u{1F1FA}', 'Ukraine': '\u{1F1FA}\u{1F1E6}', 'Irlande': '\u{1F1EE}\u{1F1EA}',
        '\u00c9cosse': '\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}', 'Pays de Galles': '\u{1F3F4}\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}\u{E007F}',
        'Roumanie': '\u{1F1F7}\u{1F1F4}', 'Bulgarie': '\u{1F1E7}\u{1F1EC}', 'Finlande': '\u{1F1EB}\u{1F1EE}',
        'Estonie': '\u{1F1EA}\u{1F1EA}', 'Lettonie': '\u{1F1F1}\u{1F1FB}', 'Lituanie': '\u{1F1F1}\u{1F1F9}', 'Islande': '\u{1F1EE}\u{1F1F8}',
        'Arabie Saoudite': '\u{1F1F8}\u{1F1E6}', 'Tunisie': '\u{1F1F9}\u{1F1F3}',
        'PSG': '\u{1F534}\u{1F535}', 'Paris Saint-Germain': '\u{1F534}\u{1F535}',
        'Marseille': '\u{1F499}\u{1F90D}', 'OM': '\u{1F499}\u{1F90D}', 'Olympique de Marseille': '\u{1F499}\u{1F90D}',
        'Lyon': '\u{1F534}\u26AA', 'OL': '\u{1F534}\u26AA', 'Olympique Lyonnais': '\u{1F534}\u26AA',
        'Monaco': '\u{1F534}\u26AA', 'AS Monaco': '\u{1F534}\u26AA',
        'Lille': '\u{1F534}\u26AA', 'LOSC': '\u{1F534}\u26AA',
        'Nice': '\u{1F534}\u26AB', 'OGC Nice': '\u{1F534}\u26AB',
        'Rennes': '\u{1F534}\u26AB', 'Stade Rennais': '\u{1F534}\u26AB',
        'Strasbourg': '\u{1F535}\u26AA', 'RC Strasbourg': '\u{1F535}\u26AA',
        'Lens': '\u{1F7E1}\u{1F534}', 'RC Lens': '\u{1F7E1}\u{1F534}',
        'Montpellier': '\u{1F535}\u{1F7E0}', 'MHSC': '\u{1F535}\u{1F7E0}',
        'Nantes': '\u{1F7E1}\u{1F7E2}', 'FC Nantes': '\u{1F7E1}\u{1F7E2}',
        'Reims': '\u{1F534}\u26AA', 'Stade de Reims': '\u{1F534}\u26AA',
        'Toulouse': '\u{1F7E3}\u26AA', 'TFC': '\u{1F7E3}\u26AA',
        'Brest': '\u{1F534}\u26AA', 'Stade Brestois': '\u{1F534}\u26AA',
        'Le Havre': '\u{1F535}\u26AA', 'HAC': '\u{1F535}\u26AA',
        'Clermont': '\u{1F534}\u{1F535}', 'Clermont Foot': '\u{1F534}\u{1F535}',
        'Ajaccio': '\u{1F534}\u26AA', 'AC Ajaccio': '\u{1F534}\u26AA',
        'Auxerre': '\u26AA\u{1F535}', 'AJ Auxerre': '\u26AA\u{1F535}',
        'Troyes': '\u{1F535}\u26AA', 'ESTAC': '\u{1F535}\u26AA',
        'Angers': '\u26AB\u26AA', 'SCO Angers': '\u26AB\u26AA'
    }
};

function getTeamFlag(teamName) {
    return CONFIG.teamFlags[teamName] || '\u26BD';
}

// --- Etat global de l'application ---
const appState = {
    currentUser: null,
    matches: [],
    leaderboard: [],
    currentTournament: 'worldcup',
    isAdmin: false
};

// --- Classe principale UI ---
class UIManager {
    constructor() {
        this.currentTab = 'dashboard';
        this.countdownInterval = null;
    }

    async init() {
        this.initTheme();
        this.bindEvents();
        this.startCountdownUpdates();

        if (apiClient.isLoggedIn()) {
            try {
                const user = await apiClient.getCurrentUser();
                appState.currentUser = user;
                appState.isAdmin = user.is_admin ? true : false;
                this.showApp();
            } catch (e) {
                apiClient.logout();
                this.showAuth();
            }
        } else {
            this.showAuth();
        }
    }

    bindEvents() {
        var themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => this.toggleTheme());
        }

        // Navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.currentTarget.dataset.tab));
        });

        // Selecteur de tournoi
        document.getElementById('tournamentSelect').addEventListener('change', (e) => {
            appState.currentTournament = e.target.value;
            this.renderMatches();
            this.renderDashboard();
        });

        // Filtre des matchs
        document.getElementById('matchFilter').addEventListener('change', () => this.renderMatches());

        // Classement - periodes
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Modal pronostic
        document.getElementById('closePredictionModal').addEventListener('click', () => this.closeModal());
        document.getElementById('predictionModal').addEventListener('click', (e) => {
            if (e.target.id === 'predictionModal') this.closeModal();
        });
        document.getElementById('submitPrediction').addEventListener('click', () => this.submitPrediction());

        // Admin - form ajout match
        document.getElementById('addMatchForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewMatch();
        });

        // Header login/logout
        document.getElementById('loginHeaderBtn').addEventListener('click', () => this.showAuth());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Auth form - tabs login/register
        document.getElementById('authTabLogin').addEventListener('click', () => this.switchAuthTab('login'));
        document.getElementById('authTabRegister').addEventListener('click', () => this.switchAuthTab('register'));
        document.getElementById('loginBtn').addEventListener('click', () => this.handleLogin());
        document.getElementById('registerBtn').addEventListener('click', () => this.handleRegister());

        // Admin - save username
        document.getElementById('saveUserName').addEventListener('click', () => this.changeUserName());
    }

    // === THEME ===
    initTheme() {
        var savedTheme = localStorage.getItem('theme_preference');
        if (savedTheme === 'light' || savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        this.updateThemeToggleButton();

        if (window.matchMedia) {
            var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            var refreshThemeLabel = () => {
                if (!localStorage.getItem('theme_preference')) {
                    this.updateThemeToggleButton();
                }
            };

            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', refreshThemeLabel);
            } else if (mediaQuery.addListener) {
                mediaQuery.addListener(refreshThemeLabel);
            }
        }
    }

    getActiveTheme() {
        var forcedTheme = document.documentElement.getAttribute('data-theme');
        if (forcedTheme === 'light' || forcedTheme === 'dark') {
            return forcedTheme;
        }

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        return 'light';
    }

    toggleTheme() {
        var currentTheme = this.getActiveTheme();
        var nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme_preference', nextTheme);
        this.updateThemeToggleButton();
    }

    updateThemeToggleButton() {
        var iconEl = document.getElementById('themeToggleIcon');
        var textEl = document.getElementById('themeToggleText');
        var btnEl = document.getElementById('themeToggleBtn');
        var activeTheme = this.getActiveTheme();

        if (iconEl) {
            iconEl.className = activeTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }

        if (textEl) {
            textEl.textContent = activeTheme === 'dark' ? 'Clair' : 'Sombre';
        }

        if (btnEl) {
            btnEl.setAttribute('title', activeTheme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre');
            btnEl.setAttribute('aria-label', activeTheme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre');
        }
    }

    // === AUTH ===
    switchAuthTab(tab) {
        document.getElementById('authTabLogin').classList.toggle('active', tab === 'login');
        document.getElementById('authTabRegister').classList.toggle('active', tab === 'register');
        document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
        document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showToast('Veuillez remplir tous les champs', 'error');
            return;
        }

        try {
            const data = await apiClient.login(email, password);
            appState.currentUser = data.user;
            appState.isAdmin = data.user.is_admin ? true : false;
            this.showToast('Bienvenue ' + data.user.name + ' !', 'success');
            this.showApp();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    async handleRegister() {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;

        if (!name || !email || !password) {
            this.showToast('Veuillez remplir tous les champs', 'error');
            return;
        }

        if (password.length < 4) {
            this.showToast('Le mot de passe doit faire au moins 4 caracteres', 'error');
            return;
        }

        try {
            const data = await apiClient.register(name, email, password);
            appState.currentUser = data.user;
            appState.isAdmin = data.user.is_admin ? true : false;
            this.showToast('Bienvenue ' + data.user.name + ' !', 'success');
            this.showApp();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    logout() {
        apiClient.logout();
        appState.currentUser = null;
        appState.isAdmin = false;
        this.showAuth();
        this.showToast('Deconnecte', 'success');
    }

    showAuth() {
        document.getElementById('auth').style.display = 'block';
        document.querySelector('nav').style.display = 'none';
        document.querySelector('.main').style.display = 'none';
        document.getElementById('authenticated-user').style.display = 'none';
        document.getElementById('guest-user').style.display = 'block';
    }

    async showApp() {
        document.getElementById('auth').style.display = 'none';
        document.querySelector('nav').style.display = 'block';
        document.querySelector('.main').style.display = 'block';
        document.getElementById('authenticated-user').style.display = 'flex';
        document.getElementById('guest-user').style.display = 'none';

        // Admin tab visibility
        const adminTab = document.querySelector('[data-tab="admin"]');
        if (adminTab) adminTab.style.display = appState.isAdmin ? '' : 'none';

        await this.loadAllData();
        this.switchTab('dashboard');
    }

    // === CHARGEMENT DES DONNEES ===
    async loadAllData() {
        try {
            const userId = appState.currentUser ? appState.currentUser.id : null;
            const [matches, leaderboard] = await Promise.all([
                apiClient.getMatches(userId),
                apiClient.getLeaderboard()
            ]);
            appState.matches = matches;
            appState.leaderboard = leaderboard;
            this.updateHeader();
            this.renderDashboard();
            this.renderMatches();
            this.renderLeaderboard();
            if (appState.isAdmin) this.renderAdmin();
        } catch (error) {
            this.showToast('Erreur de chargement des donnees', 'error');
        }
    }

    // === NAVIGATION ===
    switchTab(tabName) {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        var tabEl = document.querySelector('[data-tab="' + tabName + '"]');
        if (tabEl) tabEl.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        var contentEl = document.getElementById(tabName);
        if (contentEl) contentEl.classList.add('active');

        this.currentTab = tabName;

        if (tabName === 'predictions') this.renderMatches();
        else if (tabName === 'leaderboard') this.loadLeaderboard();
        else if (tabName === 'admin' && appState.isAdmin) this.renderAdmin();
    }

    async loadLeaderboard() {
        try {
            appState.leaderboard = await apiClient.getLeaderboard();
            this.renderLeaderboard();
        } catch (e) { /* ignore */ }
    }

    // === HEADER ===
    updateHeader() {
        var user = appState.currentUser;
        if (!user) return;
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userPoints').textContent = user.points || 0;
    }

    // === DASHBOARD ===
    renderDashboard() {
        var user = appState.currentUser;
        if (!user) return;

        var matches = appState.matches.filter(function(m) { return m.tournament === appState.currentTournament; });
        var predictions = matches.filter(function(m) { return m.userPrediction; });
        var correct = predictions.filter(function(m) { return m.userPrediction && m.userPrediction.points_earned > 0; });
        var total = predictions.length;
        var accuracy = total > 0 ? Math.round((correct.length / total) * 100) : 0;

        var rank = appState.leaderboard.find(function(u) { return u.id === user.id; });

        document.getElementById('totalPredictions').textContent = total;
        document.getElementById('correctPredictions').textContent = correct.length;
        document.getElementById('accuracy').textContent = accuracy + '%';
        document.getElementById('userRank').textContent = rank ? rank.rank : '-';

        this.renderRecentPredictions(matches);
    }

    renderRecentPredictions(matches) {
        var container = document.getElementById('recentPredictionsList');
        var withPredictions = matches
            .filter(function(m) { return m.userPrediction; })
            .sort(function(a, b) { return new Date(b.date) - new Date(a.date); })
            .slice(0, 5);

        if (withPredictions.length === 0) {
            container.innerHTML = '<p class="text-center">Aucun pronostic recent</p>';
            return;
        }

        var self = this;
        container.innerHTML = withPredictions.map(function(match) {
            var pred = match.userPrediction;
            var isCompleted = match.status === 'completed';
            var statusClass = isCompleted ? (pred.points_earned > 0 ? 'success' : 'error') : 'upcoming';
            var tournamentName = CONFIG.tournaments[match.tournament] || match.tournament;

            return '<div class="match-card">' +
                '<div class="match-header">' +
                    '<span class="match-tournament">' + tournamentName + '</span>' +
                    '<span class="match-date">' + self.formatDate(match.date) + '</span>' +
                '</div>' +
                '<div class="match-body">' +
                    '<div class="match-teams">' +
                        '<div class="team"><div class="team-flag">' + getTeamFlag(match.team1) + '</div><div class="team-name">' + match.team1 + '</div></div>' +
                        '<div class="vs">VS</div>' +
                        '<div class="team"><div class="team-flag">' + getTeamFlag(match.team2) + '</div><div class="team-name">' + match.team2 + '</div></div>' +
                    '</div>' +
                    '<div class="prediction-info">' +
                        '<div class="predicted-score">' + pred.team1_score + ' - ' + pred.team2_score + '</div>' +
                        (isCompleted 
                            ? '<div class="prediction-points ' + statusClass + '">' + (pred.points_earned > 0 ? '+' + pred.points_earned + ' points' : 'Aucun point') + '</div>'
                            : '<div class="prediction-points">En attente</div>') +
                    '</div>' +
                '</div>' +
            '</div>';
        }).join('');
    }

    // === MATCHS ===
    renderMatches() {
        var filter = document.getElementById('matchFilter').value;
        var matches = appState.matches.filter(function(m) { return m.tournament === appState.currentTournament; });

        if (filter === 'upcoming') matches = matches.filter(function(m) { return m.status !== 'completed'; });
        else if (filter === 'completed') matches = matches.filter(function(m) { return m.status === 'completed'; });

        if (filter === 'completed') {
            matches.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
        } else {
            matches.sort(function(a, b) { return new Date(a.date) - new Date(b.date); });
        }

        var container = document.getElementById('matchesList');
        if (matches.length === 0) {
            container.innerHTML = '<p class="text-center">' + (filter === 'completed' ? 'Aucun match termine' : 'Aucun match a venir') + '</p>';
            return;
        }

        var self = this;
        container.innerHTML = matches.map(function(match) {
            var pred = match.userPrediction;
            var isCompleted = match.status === 'completed';
            var canPredict = !isCompleted && new Date(match.date) > new Date();
            var tournamentName = CONFIG.tournaments[match.tournament] || match.tournament;

            var completedDisplay = isCompleted ? 
                '<div class="final-result">' +
                    '<div class="result-header"><i class="fas fa-check-circle"></i> <span>Resultat final</span></div>' +
                    '<div class="final-score-display">' +
                        '<span class="team-score">' + match.team1 + ' ' + match.team1_score + '</span>' +
                        '<span class="score-separator">-</span>' +
                        '<span class="team-score">' + match.team2_score + ' ' + match.team2 + '</span>' +
                    '</div>' +
                '</div>' : '';

            var predictionDisplay = '';
            if (pred) {
                predictionDisplay = '<div class="prediction-info">' +
                    '<div class="predicted-score"><i class="fas fa-user"></i> Votre pronostic: ' + pred.team1_score + ' - ' + pred.team2_score + '</div>';
                if (isCompleted) {
                    var ptClass = pred.points_earned > 0 ? 'success' : 'error';
                    var ptIcon = pred.points_earned > 0 ? 'trophy' : 'times';
                    var ptText = pred.points_earned > 0 ? '+' + pred.points_earned + ' points' : 'Aucun point';
                    predictionDisplay += '<div class="prediction-result"><div class="prediction-points ' + ptClass + '"><i class="fas fa-' + ptIcon + '"></i> ' + ptText + '</div></div>';
                } else {
                    predictionDisplay += '<div class="prediction-points pending">En attente du resultat</div>';
                }
                predictionDisplay += '</div>';
            } else if (isCompleted) {
                predictionDisplay = '<div class="no-prediction"><i class="fas fa-exclamation-triangle"></i> Aucun pronostic effectue</div>';
            }

            var actionsDisplay = canPredict ? 
                '<button class="btn ' + (pred ? 'btn-outline' : 'btn-primary') + '" onclick="uiManager.openPredictionModal(\'' + match.id + '\')">' +
                    '<i class="fas fa-' + (pred ? 'edit' : 'plus') + '"></i> ' + (pred ? 'Modifier' : 'Pronostiquer') +
                '</button>' : '';

            return '<div class="match-card ' + (isCompleted ? 'completed-match' : '') + '">' +
                '<div class="match-header">' +
                    '<span class="match-tournament">' + tournamentName + '</span>' +
                    '<div class="match-info-row">' +
                        '<span class="match-date">' + self.formatDate(match.date) + '</span>' +
                        (!isCompleted && canPredict ? '<span class="match-countdown" data-match-date="' + match.date + '" style="font-size:0.85rem;color:var(--primary-color);font-weight:600;">Pronostiquer avant: ' + self.formatTimeRemaining(match.date) + '</span>' : '') +
                    '</div>' +
                    (isCompleted ? '<span class="match-status completed"><i class="fas fa-check"></i> Termine</span>' : '') +
                '</div>' +
                '<div class="match-body">' +
                    '<div class="match-teams">' +
                        '<div class="team"><div class="team-flag">' + getTeamFlag(match.team1) + '</div><div class="team-name">' + match.team1 + '</div>' + (isCompleted ? '<div class="final-score">' + match.team1_score + '</div>' : '') + '</div>' +
                        '<div class="vs">' + (isCompleted ? '-' : 'VS') + '</div>' +
                        '<div class="team"><div class="team-flag">' + getTeamFlag(match.team2) + '</div><div class="team-name">' + match.team2 + '</div>' + (isCompleted ? '<div class="final-score">' + match.team2_score + '</div>' : '') + '</div>' +
                    '</div>' +
                    completedDisplay +
                    predictionDisplay +
                    '<div class="match-actions">' + actionsDisplay + '</div>' +
                '</div>' +
            '</div>';
        }).join('');
    }

    // === CLASSEMENT ===
    renderLeaderboard() {
        var container = document.getElementById('leaderboardList');
        var lb = appState.leaderboard;

        if (lb.length === 0) {
            container.innerHTML = '<p class="text-center">Aucun joueur dans le classement</p>';
            return;
        }

        var currentUserId = appState.currentUser ? appState.currentUser.id : null;
        container.innerHTML = lb.map(function(user, index) {
            var rank = user.rank || index + 1;
            var isCurrentUser = user.id === currentUserId;
            var rankClass = '';
            if (rank === 1) rankClass = 'gold';
            else if (rank === 2) rankClass = 'silver';
            else if (rank === 3) rankClass = 'bronze';

            var rankDisplay = rank <= 3 ? ['\u{1F947}', '\u{1F948}', '\u{1F949}'][rank - 1] : rank;

            return '<div class="leaderboard-item ' + (isCurrentUser ? 'current-user' : '') + '">' +
                '<div class="rank ' + rankClass + '">' + rankDisplay + '</div>' +
                '<div class="player-info">' +
                    '<div class="player-name">' + user.name + (isCurrentUser ? ' (Vous)' : '') + '</div>' +
                    '<div class="player-stats">' +
                        user.total_predictions + ' pronostic' + (user.total_predictions > 1 ? 's' : '') + ' \u2022 ' +
                        (user.accuracy || 0) + '% de reussite' +
                    '</div>' +
                '</div>' +
                '<div class="player-points">' + user.points + '</div>' +
            '</div>';
        }).join('');
    }

    // === MODAL PRONOSTIC ===
    openPredictionModal(matchId) {
        var match = appState.matches.find(function(m) { return m.id === matchId; });
        if (!match) return;

        if (new Date(match.date) <= new Date()) {
            this.showToast('Ce match a deja commence', 'error');
            return;
        }

        var pred = match.userPrediction;

        document.getElementById('modalHomeTeam').textContent = match.team1;
        document.getElementById('modalAwayTeam').textContent = match.team2;
        document.getElementById('modalMatchDate').textContent = this.formatDate(match.date);
        document.getElementById('modalTitle').textContent = pred ? 'Modifier le Pronostic' : 'Faire un Pronostic';
        document.getElementById('submitButtonText').textContent = pred ? 'Confirmer la Modification' : 'Confirmer le Pronostic';
        document.getElementById('homeScore').value = pred ? pred.team1_score : 0;
        document.getElementById('awayScore').value = pred ? pred.team2_score : 0;

        var countdownEl = document.getElementById('modalCountdown');
        if (countdownEl) {
            countdownEl.textContent = 'Temps restant: ' + this.formatTimeRemaining(match.date);
        }

        document.getElementById('predictionModal').dataset.matchId = matchId;
        document.getElementById('predictionModal').classList.add('active');
    }

    closeModal() {
        document.getElementById('predictionModal').classList.remove('active');
    }

    async submitPrediction() {
        var matchId = document.getElementById('predictionModal').dataset.matchId;
        var homeScore = parseInt(document.getElementById('homeScore').value || 0, 10);
        var awayScore = parseInt(document.getElementById('awayScore').value || 0, 10);

        if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
            this.showToast('Veuillez entrer des scores valides', 'error');
            return;
        }

        try {
            await apiClient.createPrediction(matchId, homeScore, awayScore);
            this.showToast('Pronostic enregistre !', 'success');
            this.closeModal();
            await this.loadAllData();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    // === ADMIN ===
    renderAdmin() {
        if (!appState.isAdmin) return;

        var user = appState.currentUser;
        var userNameInput = document.getElementById('userNameInput');
        if (userNameInput) userNameInput.value = user.name;

        document.getElementById('memberSince').textContent = user.created_at ? this.formatDate(user.created_at) : '-';
        document.getElementById('lastActivity').textContent = user.last_activity ? this.formatDate(user.last_activity) : '-';

        document.getElementById('totalUsers').textContent = appState.leaderboard.length;
        document.getElementById('totalPredictionsAdmin').textContent = appState.leaderboard.reduce(function(s, u) { return s + u.total_predictions; }, 0);
        document.getElementById('activeMatches').textContent = appState.matches.filter(function(m) { return m.status !== 'completed'; }).length;

        this.renderPendingMatches();
    }

    renderPendingMatches() {
        var pendingMatches = appState.matches.filter(function(m) {
            return m.status !== 'completed' && new Date(m.date) < new Date();
        });

        var container = document.getElementById('pendingMatches');
        if (pendingMatches.length === 0) {
            container.innerHTML = '<p class="no-pending-matches">\u2705 Aucun match en attente de resultat</p>';
            return;
        }

        var self = this;
        container.innerHTML = '<div class="pending-matches-header"><h4><i class="fas fa-clock"></i> Matchs en attente (' + pendingMatches.length + ')</h4></div>' +
            pendingMatches.map(function(match) {
                return '<div class="pending-match"><div class="pending-match-card">' +
                    '<div class="pending-match-info">' +
                        '<div class="pending-match-teams">' +
                            '<span class="team-flag">' + getTeamFlag(match.team1) + '</span>' +
                            '<strong>' + match.team1 + ' vs ' + match.team2 + '</strong>' +
                            '<span class="team-flag">' + getTeamFlag(match.team2) + '</span>' +
                        '</div>' +
                        '<div class="pending-match-details"><div class="pending-match-date"><i class="fas fa-calendar"></i> ' + self.formatDate(match.date) + '</div></div>' +
                    '</div>' +
                    '<div class="pending-match-actions">' +
                        '<div class="score-inputs-mini">' +
                            '<input type="number" min="0" max="20" placeholder="0" id="home_' + match.id + '" class="score-input-mini">' +
                            '<span class="score-separator-mini">-</span>' +
                            '<input type="number" min="0" max="20" placeholder="0" id="away_' + match.id + '" class="score-input-mini">' +
                        '</div>' +
                        '<button class="btn btn-success btn-confirm" onclick="uiManager.updateMatchResult(\'' + match.id + '\')">' +
                            '<i class="fas fa-check"></i> Confirmer' +
                        '</button>' +
                    '</div>' +
                '</div></div>';
            }).join('');
    }

    async addNewMatch() {
        var team1 = document.getElementById('homeTeam').value.trim();
        var team2 = document.getElementById('awayTeam').value.trim();
        var date = document.getElementById('matchDate').value;
        var tournament = document.getElementById('matchTournament').value;

        if (!team1 || !team2 || !date) {
            this.showToast('Veuillez remplir tous les champs', 'error');
            return;
        }

        try {
            await apiClient.createMatch({
                team1: team1, team2: team2, date: date, tournament: tournament,
                team1_flag: getTeamFlag(team1),
                team2_flag: getTeamFlag(team2)
            });
            document.getElementById('addMatchForm').reset();
            this.showToast('Match ajoute !', 'success');
            await this.loadAllData();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    async updateMatchResult(matchId) {
        var homeScore = parseInt(document.getElementById('home_' + matchId).value || 0, 10);
        var awayScore = parseInt(document.getElementById('away_' + matchId).value || 0, 10);

        if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
            this.showToast('Scores invalides', 'error');
            return;
        }

        try {
            await apiClient.updateMatchScore(matchId, homeScore, awayScore);
            this.showToast('Resultat mis a jour !', 'success');
            await this.loadAllData();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    async changeUserName() {
        var newName = document.getElementById('userNameInput').value.trim();
        if (!newName) {
            this.showToast('Le pseudonyme ne peut pas etre vide', 'error');
            return;
        }
        if (newName === appState.currentUser.name) {
            this.showToast('Le pseudonyme est identique', 'warning');
            return;
        }

        try {
            var data = await apiClient.updateUserName(appState.currentUser.id, newName);
            appState.currentUser.name = data.user.name;
            this.updateHeader();
            this.showToast('Pseudonyme modifie !', 'success');
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    // === UTILITAIRES ===
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    formatTimeRemaining(matchDateString) {
        var diffMs = new Date(matchDateString) - new Date();
        if (diffMs <= 0) return 'Match commence';

        var s = Math.floor(diffMs / 1000);
        var m = Math.floor(s / 60);
        var h = Math.floor(m / 60);
        var d = Math.floor(h / 24);

        if (d > 0) return d + 'j ' + (h % 24) + 'h';
        if (h > 0) return h + 'h ' + (m % 60) + 'm';
        if (m > 0) return m + 'm ' + (s % 60) + 's';
        return s + 's';
    }

    startCountdownUpdates() {
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        var self = this;
        this.countdownInterval = setInterval(function() {
            document.querySelectorAll('.match-countdown[data-match-date]').forEach(function(el) {
                var date = el.dataset.matchDate;
                if (date) el.textContent = 'Pronostiquer avant: ' + self.formatTimeRemaining(date);
            });
        }, 1000);
    }

    showToast(message, type) {
        type = type || 'success';
        var toast = document.createElement('div');
        toast.className = 'toast ' + type;
        var icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
        toast.innerHTML = '<i class="fas fa-' + icon + ' toast-icon"></i><span class="toast-message">' + this.escapeHtml(message) + '</span>';
        document.getElementById('toastContainer').appendChild(toast);
        setTimeout(function() { toast.classList.add('show'); }, 100);
        setTimeout(function() {
            toast.classList.remove('show');
            setTimeout(function() { toast.remove(); }, 300);
        }, 3000);
    }

    escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// --- Initialisation ---
var uiManager;

document.addEventListener('DOMContentLoaded', function() {
    uiManager = new UIManager();
    window.uiManager = uiManager;
    uiManager.init();
});

// Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw.js').catch(function() {});
    });
}
