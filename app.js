// Fonction globale simple pour changer le nom (accessible immédiatement)
function changeUserName() {
    console.log('🖱️ Clic détecté sur le nom utilisateur (fonction globale)');
    
    // Éviter les conflits avec le changement en cours
    if (uiManager && uiManager.isChangingUserName) {
        console.log('⚠️ Changement de nom déjà en cours, annulation');
        return;
    }
    
    const currentName = appData.currentUser.name;
    const newName = prompt(`🎯 Modifier votre pseudonyme\n\nPseudonyme actuel : ${currentName}\n\nNouveau pseudonyme :`, currentName);
    
    console.log('📝 Nouveau nom saisi:', newName);
    
    if (newName && newName.trim() && newName.trim() !== currentName) {
        changeUserNameLogic(newName.trim());
    } else if (newName && newName.trim() === currentName) {
        if (uiManager) {
            uiManager.showToast('Le pseudonyme est identique', 'warning');
        }
    } else if (newName === '') {
        if (uiManager) {
            uiManager.showToast('Le pseudonyme ne peut pas être vide', 'error');
        }
    }
}

// Fonction globale pour la logique de changement de nom
function changeUserNameLogic(newName) {
    console.log('🔄 Changement de nom vers:', newName);
    
    // Marquer qu'on est en train de changer le nom
    if (uiManager) {
        uiManager.isChangingUserName = true;
        console.log('✅ Flag isChangingUserName activé');
    }
    
    // Vérifier si le nom n'est pas déjà pris par un autre utilisateur
    console.log('🔍 Vérification si le nom est déjà pris...');
    const existingUser = appData.users.find(u => 
        u.name.toLowerCase() === newName.toLowerCase() && u.id !== appData.currentUser.id
    );
    
    if (existingUser) {
        console.log('❌ Nom déjà pris par:', existingUser.name);
        if (uiManager) {
            uiManager.showToast('Ce pseudonyme est déjà utilisé', 'error');
            uiManager.isChangingUserName = false;
        }
        return;
    }
    console.log('✅ Nom disponible');

    const oldName = appData.currentUser.name;
    console.log('📝 Ancien nom:', oldName);
    
    // Mettre à jour le nom de l'utilisateur
    console.log('🔄 Mise à jour des données utilisateur...');
    appData.currentUser.name = newName;
    appData.currentUser.lastActivity = new Date().toISOString();
    console.log('✅ Données utilisateur mises à jour');
    
    // Sauvegarder
    try {
        console.log('💾 Sauvegarde en cours...');
        appData.saveUser();
        console.log('✅ saveUser() terminé');
        
        appData.updateUserInList();
        console.log('✅ updateUserInList() terminé');
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
        return;
    }
    
    // Mettre à jour l'interface
    if (uiManager) {
        console.log('🔄 Début mise à jour interface après changement de nom');
        
        try {
            // Mise à jour immédiate du header avec plusieurs approches
            console.log('🔄 Appel updateHeader()...');
            uiManager.updateHeader();
            console.log('✅ updateHeader() terminé');
            
            // Approche alternative au cas où la première ne marche pas
            setTimeout(() => {
                console.log('🔄 Mise à jour header - tentative 2');
                const userNameElement = document.getElementById('userName');
                if (userNameElement) {
                    userNameElement.textContent = newName;
                    userNameElement.innerHTML = newName;
                    console.log('📝 Header forcé avec:', newName);
                }
            }, 50);
            
            // Troisième tentative plus tard
            setTimeout(() => {
                console.log('🔄 Mise à jour header - tentative 3');
                uiManager.updateHeader();
            }, 200);
            
            console.log('🔄 Appel renderLeaderboard()...');
            uiManager.renderLeaderboard();
            console.log('✅ renderLeaderboard() terminé');
            
            console.log('🔄 Appel renderDashboard()...');
            uiManager.renderDashboard();
            console.log('✅ renderDashboard() terminé');
            
            uiManager.showToast(`Pseudonyme modifié : ${oldName} → ${newName}`, 'success');
        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour de l\'interface:', error);
        }
        
        // Mettre à jour les informations de profil sans recharger tout l'admin
        try {
            console.log('🔄 Mise à jour informations profil...');
            if (appData.currentUser.createdAt) {
                document.getElementById('memberSince').textContent = uiManager.formatDate(appData.currentUser.createdAt);
            }
            if (appData.currentUser.lastActivity) {
                document.getElementById('lastActivity').textContent = uiManager.formatDate(appData.currentUser.lastActivity);
            }
            console.log('✅ Informations profil mises à jour');
        } catch (error) {
            console.error('❌ Erreur mise à jour profil:', error);
        }
        
        // S'assurer que le champ input reflète la nouvelle valeur
        try {
            console.log('🔄 Mise à jour champ input...');
            const userNameInput = document.getElementById('userNameInput');
            if (userNameInput) {
                userNameInput.value = newName;
                console.log('📝 Champ input mis à jour avec:', newName);
            }
            console.log('✅ Champ input mis à jour');
        } catch (error) {
            console.error('❌ Erreur mise à jour champ input:', error);
        }
        
        // Finir le processus de changement de nom
        setTimeout(() => {
            uiManager.isChangingUserName = false;
            console.log('✅ Fin mise à jour interface après changement de nom');
        }, 100); // Petit délai pour s'assurer que les mises à jour DOM sont appliquées
    } else {
        console.error('❌ uiManager non disponible');
    }
}

// Configuration et constantes
const CONFIG = {
    pointsSystem: {
        exactScore: 5,
        correctResult: 3,
        winnerRegular: 1 // Pour vainqueur après temps réglementaire en phase finale
    },
    tournaments: {
        worldcup: 'Coupe du Monde 2026',
        ligue1: 'Ligue 1 2024-25'
    },
    // Tournois où les phases finales utilisent un système différent
    finalPhasesTournaments: ['worldcup'], // Coupe du monde utilise des phases à élimination directe
    teamFlags: {
        // Équipes nationales
        'France': '🇫🇷',
        'Argentine': '🇦🇷',
        'Brésil': '🇧🇷',
        'Allemagne': '🇩🇪',
        'Espagne': '🇪🇸',
        'Italie': '🇮🇹',
        'Portugal': '🇵🇹',
        'Pays-Bas': '🇳🇱',
        'Belgique': '🇧🇪',
        'Angleterre': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        'Croatie': '🇭🇷',
        'Maroc': '🇲🇦',
        'Mexique': '🇲🇽',
        'États-Unis': '🇺🇸',
        'Canada': '🇨🇦',
        'Japon': '🇯🇵',
        'Corée du Sud': '🇰🇷',
        'Australie': '🇦🇺',
        'Suisse': '🇨🇭',
        'Pologne': '🇵🇱',
        'Danemark': '🇩🇰',
        'Suède': '🇸🇪',
        'Norvège': '🇳🇴',
        'Autriche': '🇦🇹',
        'République Tchèque': '🇨🇿',
        'Hongrie': '🇭🇺',
        'Slovaquie': '🇸🇰',
        'Slovénie': '🇸🇮',
        'Serbie': '🇷🇸',
        'Grèce': '🇬🇷',
        'Turquie': '🇹🇷',
        'Russie': '🇷🇺',
        'Ukraine': '🇺🇦',
        'Irlande': '🇮🇪',
        'Écosse': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
        'Pays de Galles': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
        'Roumanie': '🇷🇴',
        'Bulgarie': '🇧🇬',
        'Finlande': '🇫🇮',
        'Estonie': '🇪🇪',
        'Lettonie': '🇱🇻',
        'Lituanie': '🇱🇹',
        'Islande': '🇮🇸',
        
        // Équipes de Ligue 1
        'PSG': '🔴🔵',
        'Paris Saint-Germain': '🔴🔵',
        'Marseille': '💙🤍',
        'OM': '💙🤍',
        'Olympique de Marseille': '💙🤍',
        'Lyon': '🔴⚪',
        'OL': '🔴⚪',
        'Olympique Lyonnais': '🔴⚪',
        'Monaco': '🔴⚪',
        'AS Monaco': '🔴⚪',
        'Lille': '🔴⚪',
        'LOSC': '🔴⚪',
        'Nice': '🔴⚫',
        'OGC Nice': '🔴⚫',
        'Rennes': '🔴⚫',
        'Stade Rennais': '🔴⚫',
        'Strasbourg': '🔵⚪',
        'RC Strasbourg': '🔵⚪',
        'Lens': '🟡🔴',
        'RC Lens': '🟡🔴',
        'Montpellier': '🔵🟠',
        'MHSC': '🔵🟠',
        'Nantes': '🟡🟢',
        'FC Nantes': '🟡🟢',
        'Reims': '🔴⚪',
        'Stade de Reims': '🔴⚪',
        'Toulouse': '🟣⚪',
        'TFC': '🟣⚪',
        'Brest': '🔴⚪',
        'Stade Brestois': '🔴⚪',
        'Le Havre': '🔵⚪',
        'HAC': '🔵⚪',
        'Clermont': '🔴🔵',
        'Clermont Foot': '🔴🔵',
        'Ajaccio': '🔴⚪',
        'AC Ajaccio': '🔴⚪',
        'Auxerre': '⚪🔵',
        'AJ Auxerre': '⚪🔵',
        'Troyes': '🔵⚪',
        'ESTAC': '🔵⚪',
        'Angers': '⚫⚪',
        'SCO Angers': '⚫⚪'
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
                date: '2024-10-20T21:00:00',
                tournament: 'ligue1',
                status: 'completed',
                homeScore: 2,
                awayScore: 1
            },
            {
                id: 'l1_2',
                homeTeam: 'Lyon',
                awayTeam: 'Monaco',
                date: '2024-10-21T17:00:00',
                tournament: 'ligue1',
                status: 'upcoming',
                homeScore: null,
                awayScore: null
            },
            {
                id: 'l1_3',
                homeTeam: 'Lille',
                awayTeam: 'Nice',
                date: '2024-10-22T20:00:00',
                tournament: 'ligue1',
                status: 'upcoming',
                homeScore: null,
                awayScore: null
            },
            // Match en attente de confirmation (date passée mais pas encore confirmé)
            {
                id: 'l1_4',
                homeTeam: 'Lens',
                awayTeam: 'Rennes',
                date: '2024-10-22T15:00:00',
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

// Fonction utilitaire pour obtenir le drapeau d'une équipe
function getTeamFlag(teamName) {
    return CONFIG.teamFlags[teamName] || '⚽';
}

// Gestionnaire d'interface utilisateur
class UIManager {
    constructor() {
        this.currentTab = 'dashboard';
        this.isChangingUserName = false; // Flag pour éviter les conflits
        this.countdownUpdateInterval = null; // Pour mettre à jour les décomptes périodiquement
        this.initializeEventListeners();
        this.updateUI();
        this.startCountdownUpdates(); // Démarrer la mise à jour périodique des décomptes
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

        // Événement pour le bouton de modification du nom d'utilisateur
        const saveUserNameBtn = document.getElementById('saveUserName');
        if (saveUserNameBtn) {
            console.log('✅ Bouton saveUserName trouvé, ajout de l\'événement');
            saveUserNameBtn.addEventListener('click', () => {
                console.log('🖱️ Clic détecté sur le bouton Modifier (admin)');
                const userNameInput = document.getElementById('userNameInput');
                const newName = userNameInput.value.trim();
                console.log('📝 Nouveau nom saisi (admin):', `"${newName}"`);
                console.log('📝 Nom actuel:', `"${appData.currentUser.name}"`);
                console.log('📝 Comparaison strict:', newName === appData.currentUser.name);
                console.log('📝 Longueur nouveau nom:', newName.length);
                console.log('📝 Longueur nom actuel:', appData.currentUser.name.length);
                
                if (!newName) {
                    console.warn('⚠️ Nom vide');
                    if (uiManager && uiManager.showToast) {
                        uiManager.showToast('Le pseudonyme ne peut pas être vide', 'error');
                    } else {
                        alert('Le pseudonyme ne peut pas être vide');
                    }
                    return;
                }
                
                if (newName === appData.currentUser.name) {
                    console.warn('⚠️ Nom identique - annulation');
                    if (uiManager && uiManager.showToast) {
                        uiManager.showToast('Le pseudonyme est identique au précédent', 'warning');
                    } else {
                        alert('Le pseudonyme est identique au précédent');
                    }
                    return;
                }
                
                console.log('✅ Appel de changeUserNameLogic avec:', `"${newName}"`);
                
                // Debug: vérifier l'état avant le changement
                const userNameElement = document.getElementById('userName');
                console.log('🔍 État avant changement:');
                console.log('  - Element trouvé:', !!userNameElement);
                console.log('  - Contenu actuel:', userNameElement ? userNameElement.textContent : 'N/A');
                console.log('  - Style display:', userNameElement ? userNameElement.style.display : 'N/A');
                
                changeUserNameLogic(newName);
            });
        } else {
            console.error('❌ Bouton saveUserName non trouvé!');
        }

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
            case 'rules':
                // Onglet statique, pas de rendu nécessaire
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
        console.log('🔄 Mise à jour du header avec le nom:', appData.currentUser.name);
        const userNameElement = document.getElementById('userName');
        const userPointsElement = document.getElementById('userPoints');
        
        if (userNameElement) {
            console.log('📝 Ancien nom affiché:', `"${userNameElement.textContent}"`);
            console.log('📝 Element trouvé:', userNameElement);
            console.log('📝 Element parent:', userNameElement.parentElement);
            
            // Méthode 1: Changement direct
            userNameElement.textContent = appData.currentUser.name;
            
            // Méthode 2: Forcer avec innerHTML
            userNameElement.innerHTML = appData.currentUser.name;
            
            // Méthode 3: Recréer l'attribut onclick pour s'assurer qu'il reste fonctionnel
            userNameElement.setAttribute('onclick', 'changeUserName()');
            userNameElement.setAttribute('title', 'Cliquer pour modifier votre pseudonyme');
            
            console.log('📝 Nouveau nom affiché:', `"${userNameElement.textContent}"`);
            
            // S'assurer que l'élément reste cliquable
            userNameElement.style.cursor = 'pointer';
            userNameElement.style.userSelect = 'none';
            
            // Forcer plusieurs types de rafraîchissement
            userNameElement.style.display = 'none';
            userNameElement.offsetHeight; // Force reflow
            userNameElement.style.display = 'inline';
            
            // Déclencher un événement de changement
            userNameElement.dispatchEvent(new Event('change', { bubbles: true }));
            
            console.log('✅ Header mis à jour pour:', appData.currentUser.name);
        } else {
            console.error('❌ Élément userName non trouvé dans updateHeader');
            console.log('🔍 Recherche d\'éléments similaires...');
            const allSpans = document.querySelectorAll('span');
            allSpans.forEach((span, index) => {
                if (span.className.includes('user') || span.id.includes('user')) {
                    console.log(`🔍 Span ${index}:`, span.id, span.className, span.textContent);
                }
            });
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
                            <div class="team-flag">${getTeamFlag(match.homeTeam)}</div>
                            <div class="team-name">${match.homeTeam}</div>
                        </div>
                        <div class="vs">VS</div>
                        <div class="team">
                            <div class="team-flag">${getTeamFlag(match.awayTeam)}</div>
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

        // Tri différent selon le filtre
        if (filter === 'completed') {
            // Pour les matchs terminés, trier du plus récent au plus ancien
            filteredMatches.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else {
            // Pour les matchs à venir, trier du plus proche au plus éloigné
            filteredMatches.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        const container = document.getElementById('matchesList');
        container.innerHTML = '';

        if (filteredMatches.length === 0) {
            const emptyMessage = filter === 'completed' ? 
                'Aucun match terminé pour ce tournoi' : 
                'Aucun match à venir pour ce tournoi';
            container.innerHTML = `<p class="text-center">${emptyMessage}</p>`;
            return;
        }

        filteredMatches.forEach(match => {
            const userPrediction = appData.predictions.find(p => 
                p.matchId === match.id && p.userId === appData.currentUser.id
            );

            const matchCard = document.createElement('div');
            matchCard.className = `match-card ${match.status === 'completed' ? 'completed-match' : ''}`;

            const isUpcoming = match.status === 'upcoming';
            const canPredict = isUpcoming && new Date(match.date) > new Date();

            // Affichage spécial pour les matchs terminés
            const completedMatchDisplay = match.status === 'completed' ? `
                <div class="final-result">
                    <div class="result-header">
                        <i class="fas fa-check-circle"></i>
                        <span>Résultat final</span>
                    </div>
                    <div class="final-score-display">
                        <span class="team-score">${match.homeTeam} ${match.homeScore}</span>
                        <span class="score-separator">-</span>
                        <span class="team-score">${match.awayScore} ${match.awayTeam}</span>
                    </div>
                </div>
            ` : '';

            matchCard.innerHTML = `
                <div class="match-header">
                    <span class="match-tournament">${CONFIG.tournaments[match.tournament]}</span>
                    <div class="match-info-row">
                        <span class="match-date">${this.formatDate(match.date)}</span>
                        ${isUpcoming && canPredict ? `<span class="match-countdown" style="font-size: 0.85rem; color: var(--primary-color); font-weight: 600;">Pronostiquer avant: ${this.formatTimeRemaining(match.date)}</span>` : ''}
                    </div>
                    ${match.status === 'completed' ? '<span class="match-status completed"><i class="fas fa-check"></i> Terminé</span>' : ''}
                </div>
                <div class="match-body">
                    <div class="match-teams">
                        <div class="team">
                            <div class="team-flag">${getTeamFlag(match.homeTeam)}</div>
                            <div class="team-name">${match.homeTeam}</div>
                            ${match.status === 'completed' ? `<div class="final-score">${match.homeScore}</div>` : ''}
                        </div>
                        <div class="vs">${match.status === 'completed' ? '-' : 'VS'}</div>
                        <div class="team">
                            <div class="team-flag">${getTeamFlag(match.awayTeam)}</div>
                            <div class="team-name">${match.awayTeam}</div>
                            ${match.status === 'completed' ? `<div class="final-score">${match.awayScore}</div>` : ''}
                        </div>
                    </div>
                    
                    ${completedMatchDisplay}
                    
                    ${userPrediction ? `
                        <div class="prediction-info">
                            <div class="predicted-score">
                                <i class="fas fa-user"></i>
                                Votre pronostic: ${userPrediction.homeScore} - ${userPrediction.awayScore}
                            </div>
                            ${match.status === 'completed' ? 
                                `<div class="prediction-result">
                                    <div class="prediction-points ${userPrediction.points > 0 ? 'success' : 'error'}">
                                        <i class="fas fa-${userPrediction.points > 0 ? 'trophy' : 'times'}"></i>
                                        ${userPrediction.points > 0 ? '+' + userPrediction.points + ' points' : 'Aucun point'}
                                    </div>
                                    ${userPrediction.points > 0 ? `
                                        <div class="prediction-accuracy">
                                            ${this.getPredictionAccuracyText(userPrediction, match)}
                                        </div>
                                    ` : ''}
                                </div>` : 
                                '<div class="prediction-points pending">En attente du résultat</div>'
                            }
                        </div>
                    ` : match.status === 'completed' ? `
                        <div class="no-prediction">
                            <i class="fas fa-exclamation-triangle"></i>
                            Aucun pronostic effectué
                        </div>
                    ` : ''}
                    
                    <div class="match-actions">
                        ${canPredict ? `
                            <button class="btn ${userPrediction ? 'btn-outline' : 'btn-primary'}" 
                                    onclick="uiManager.openPredictionModal('${match.id}')">
                                <i class="fas fa-${userPrediction ? 'edit' : 'plus'}"></i>
                                ${userPrediction ? 'Modifier' : 'Pronostiquer'}
                            </button>
                        ` : userPrediction && match.status === 'upcoming' ? `
                            <span class="btn btn-outline disabled">
                                <i class="fas fa-lock"></i>
                                Pronostic verrouillé
                            </span>
                        ` : ''}
                        
                        ${match.status === 'completed' && !userPrediction ? `
                            <span class="btn btn-outline disabled">
                                <i class="fas fa-clock"></i>
                                Trop tard
                            </span>
                        ` : ''}
                        
                        ${match.status === 'upcoming' && new Date(match.date) <= new Date() && !userPrediction ? `
                            <span class="btn btn-outline disabled">
                                <i class="fas fa-hourglass-half"></i>
                                En cours
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
        document.getElementById('winnerRegularPoints').value = appData.pointsConfig.winnerRegular || 1;

        // Charger les informations utilisateur SEULEMENT si on n'est pas en train de changer le nom
        const userNameInput = document.getElementById('userNameInput');
        if (userNameInput && !this.isChangingUserName) {
            // Ne mettre à jour que si l'utilisateur n'est pas en train d'éditer le champ
            if (userNameInput !== document.activeElement) {
                userNameInput.value = appData.currentUser.name;
            }
        }
        
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
            container.innerHTML = '<p class="no-pending-matches">✅ Aucun match en attente de résultat</p>';
            return;
        }

        // Ajouter un en-tête
        const header = document.createElement('div');
        header.className = 'pending-matches-header';
        header.innerHTML = `
            <h4><i class="fas fa-clock"></i> Matchs en attente de résultat (${pendingMatches.length})</h4>
            <p>Ces matchs sont terminés mais leur score final n'a pas encore été confirmé.</p>
        `;
        container.appendChild(header);

        pendingMatches.forEach(match => {
            const matchDiv = document.createElement('div');
            matchDiv.className = 'pending-match';
            
            // Calculer le nombre de pronostics pour ce match
            const predictionsCount = appData.predictions.filter(p => p.matchId === match.id).length;
            
            matchDiv.innerHTML = `
                <div class="pending-match-card">
                    <div class="pending-match-info">
                        <div class="pending-match-teams">
                            <span class="team-flag">${getTeamFlag(match.homeTeam)}</span>
                            <strong>${match.homeTeam} vs ${match.awayTeam}</strong>
                            <span class="team-flag">${getTeamFlag(match.awayTeam)}</span>
                        </div>
                        <div class="pending-match-details">
                            <div class="pending-match-date">
                                <i class="fas fa-calendar"></i>
                                ${this.formatDate(match.date)}
                            </div>
                            <div class="pending-match-predictions">
                                <i class="fas fa-users"></i>
                                ${predictionsCount} pronostic${predictionsCount !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                    <div class="pending-match-actions">
                        <div class="score-inputs-mini">
                            <input type="number" min="0" max="20" placeholder="0" 
                                   id="home_${match.id}" class="score-input-mini">
                            <span class="score-separator-mini">-</span>
                            <input type="number" min="0" max="20" placeholder="0" 
                                   id="away_${match.id}" class="score-input-mini">
                        </div>
                        <button class="btn btn-success btn-confirm" onclick="uiManager.updateMatchResult('${match.id}')">
                            <i class="fas fa-check"></i>
                            Confirmer le score
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(matchDiv);
        });

        // Ajouter une section pour voir les matchs terminés récents
        this.addRecentCompletedMatches(container);
    }

    addRecentCompletedMatches(parentContainer) {
        const recentCompleted = appData.matches
            .filter(match => match.status === 'completed')
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);

        if (recentCompleted.length > 0) {
            const recentSection = document.createElement('div');
            recentSection.className = 'recent-completed-section';
            recentSection.innerHTML = `
                <div class="recent-completed-header">
                    <h4><i class="fas fa-check-circle"></i> Derniers matchs confirmés</h4>
                </div>
                <div class="recent-completed-list">
                    ${recentCompleted.map(match => {
                        const predictionsCount = appData.predictions.filter(p => p.matchId === match.id).length;
                        const pointsAwarded = appData.predictions
                            .filter(p => p.matchId === match.id)
                            .reduce((total, p) => total + p.points, 0);
                        
                        return `
                            <div class="recent-completed-match">
                                <div class="completed-match-info">
                                    <div class="completed-teams">
                                        <span class="team-flag">${getTeamFlag(match.homeTeam)}</span>
                                        <span class="team-name">${match.homeTeam}</span>
                                        <span class="final-score-small">${match.homeScore}</span>
                                        <span class="vs-small">-</span>
                                        <span class="final-score-small">${match.awayScore}</span>
                                        <span class="team-name">${match.awayTeam}</span>
                                        <span class="team-flag">${getTeamFlag(match.awayTeam)}</span>
                                    </div>
                                    <div class="completed-stats">
                                        <span class="prediction-stat">
                                            <i class="fas fa-users"></i>
                                            ${predictionsCount} pronostic${predictionsCount !== 1 ? 's' : ''}
                                        </span>
                                        <span class="points-stat">
                                            <i class="fas fa-trophy"></i>
                                            ${pointsAwarded} points distribués
                                        </span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
            parentContainer.appendChild(recentSection);
        }
    }

    loadAdminValues() {
        document.getElementById('exactScorePoints').value = appData.pointsConfig.exactScore;
        document.getElementById('correctResultPoints').value = appData.pointsConfig.correctResult;
        document.getElementById('goalDifferencePoints').value = appData.pointsConfig.goalDifference;
    }

    openPredictionModal(matchId) {
        const match = appData.matches.find(m => m.id === matchId);
        if (!match) return;

        // Vérifier que le match n'a pas commencé
        if (new Date(match.date) <= new Date()) {
            this.showToast('Ce match a déjà commencé, les pronostics ne sont plus acceptés', 'error');
            return;
        }

        const existingPrediction = appData.predictions.find(p => 
            p.matchId === matchId && p.userId === appData.currentUser.id
        );

        // Remplir les informations du modal
        document.getElementById('modalHomeTeam').textContent = match.homeTeam;
        document.getElementById('modalAwayTeam').textContent = match.awayTeam;
        document.getElementById('modalMatchDate').textContent = this.formatDate(match.date);
        
        // Changer le titre du modal selon qu'il s'agit d'une modification ou d'un nouveau pronostic
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = existingPrediction ? 'Modifier le Pronostic' : 'Faire un Pronostic';
        }
        
        // Changer le texte du bouton de soumission
        const submitButtonText = document.getElementById('submitButtonText');
        if (submitButtonText) {
            submitButtonText.textContent = existingPrediction ? 'Confirmer la Modification' : 'Confirmer le Pronostic';
        }
        
        // Afficher le décompte
        const countdownElement = document.getElementById('modalCountdown');
        if (countdownElement) {
            countdownElement.textContent = `Temps restant: ${this.formatTimeRemaining(match.date)}`;
            
            // Mettre à jour le décompte toutes les secondes
            const countdownInterval = setInterval(() => {
                const timeRemaining = this.formatTimeRemaining(match.date);
                countdownElement.textContent = `Temps restant: ${timeRemaining}`;
                
                // Arrêter si le match a commencé
                if (timeRemaining === 'Match commencé') {
                    clearInterval(countdownInterval);
                    document.getElementById('closeModal').click(); // Fermer le modal
                    this.showToast('Ce match a commencé, les pronostics sont fermés', 'warning');
                }
            }, 1000);
            
            // Stocker l'intervalle pour le nettoyer si on ferme le modal
            document.getElementById('predictionModal').countdownInterval = countdownInterval;
        }

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
        // Nettoyer l'intervalle de décompte s'il existe
        const modal = document.getElementById('predictionModal');
        if (modal.countdownInterval) {
            clearInterval(modal.countdownInterval);
            modal.countdownInterval = null;
        }
        modal.classList.remove('active');
    }

    submitPrediction() {
        const matchId = document.getElementById('predictionModal').dataset.matchId;
        const homeScore = parseInt(document.getElementById('homeScore').value || 0, 10);
        const awayScore = parseInt(document.getElementById('awayScore').value || 0, 10);

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
        const homeScoreInput = document.getElementById(`home_${matchId}`);
        const awayScoreInput = document.getElementById(`away_${matchId}`);
        
        // Utiliser parseInt pour convertir en entier
        const homeScore = parseInt(homeScoreInput.value || 0, 10);
        const awayScore = parseInt(awayScoreInput.value || 0, 10);
        
        console.log('[DEBUG] updateMatchResult:', {
            homeScore: homeScore,
            awayScore: awayScore,
            homeScoreValid: !isNaN(homeScore) && homeScore >= 0,
            awayScoreValid: !isNaN(awayScore) && awayScore >= 0
        });

        // Vérifier que les scores sont valides (nombres entiers positifs ou zéro)
        if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
            console.log('[DEBUG] Validation échouée - scores invalides');
            this.showToast('Veuillez entrer des scores valides (nombres positifs)', 'error');
            return;
        }

        console.log('[DEBUG] Validation réussie - Mise à jour du match');
        
        // Mettre à jour le match
        const matchIndex = appData.matches.findIndex(m => m.id === matchId);
        if (matchIndex === -1) {
            console.log('[DEBUG] Match non trouvé');
            return;
        }

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
        const match = appData.matches.find(m => m.id === matchId);
        const actualResult = this.getMatchResult(actualHomeScore, actualAwayScore);
        
        // Vérifier si c'est un tournoi de phase finale
        const isFinalPhase = CONFIG.finalPhasesTournaments.includes(match.tournament);

        matchPredictions.forEach(prediction => {
            const predictedResult = this.getMatchResult(prediction.homeScore, prediction.awayScore);
            
            let points = 0;

            // Score exact
            if (prediction.homeScore === actualHomeScore && prediction.awayScore === actualAwayScore) {
                points = appData.pointsConfig.exactScore;
            }
            // Bon résultat (victoire, nul, défaite)
            else if (predictedResult === actualResult) {
                points = appData.pointsConfig.correctResult;
            }
            // Pour les phases finales : vainqueur après temps réglementaire
            else if (isFinalPhase && predictedResult === actualResult && actualResult !== 'nul') {
                points = appData.pointsConfig.winnerRegular || 1;
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

    getPredictionAccuracyText(prediction, match) {
        // Score exact
        if (prediction.homeScore === match.homeScore && prediction.awayScore === match.awayScore) {
            return '🎯 Score exact !';
        }
        
        const predictedResult = this.getMatchResult(prediction.homeScore, prediction.awayScore);
        const actualResult = this.getMatchResult(match.homeScore, match.awayScore);
        
        // Bon résultat
        if (predictedResult === actualResult) {
            const resultText = actualResult === 'home' ? 'victoire domicile' : 
                              actualResult === 'away' ? 'victoire extérieur' : 'match nul';
            return `✅ Bon résultat (${resultText})`;
        }
        
        // Bonne différence de buts
        const predictedDiff = Math.abs(prediction.homeScore - prediction.awayScore);
        const actualDiff = Math.abs(match.homeScore - match.awayScore);
        if (predictedDiff === actualDiff) {
            return `📊 Bonne différence de buts (${actualDiff})`;
        }
        
        return '';
    }

    savePointsConfiguration() {
        const exactScore = parseInt(document.getElementById('exactScorePoints').value);
        const correctResult = parseInt(document.getElementById('correctResultPoints').value);
        const winnerRegular = parseInt(document.getElementById('winnerRegularPoints').value);

        if (isNaN(exactScore) || isNaN(correctResult) || isNaN(winnerRegular)) {
            this.showToast('Veuillez entrer des valeurs valides', 'error');
            return;
        }

        appData.pointsConfig = {
            exactScore: exactScore,
            correctResult: correctResult,
            winnerRegular: winnerRegular
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

    // Formater le temps restant avant un match (pour le décompte)
    formatTimeRemaining(matchDateString) {
        const now = new Date();
        const matchDate = new Date(matchDateString);
        const diffMs = matchDate - now;

        if (diffMs <= 0) {
            return 'Match commencé';
        }

        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) {
            return `${diffDays}j ${diffHours % 24}h`;
        } else if (diffHours > 0) {
            return `${diffHours}h ${diffMinutes % 60}m`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes}m ${diffSeconds % 60}s`;
        } else {
            return `${diffSeconds}s`;
        }
    }

    // Démarrer la mise à jour périodique des décomptes dans les cartes de matchs
    startCountdownUpdates() {
        if (this.countdownUpdateInterval) {
            clearInterval(this.countdownUpdateInterval);
        }

        this.countdownUpdateInterval = setInterval(() => {
            this.updateCountdownsInCards();
        }, 1000); // Mettre à jour chaque seconde
    }

    // Mettre à jour les décomptes affichés dans les cartes de matchs
    updateCountdownsInCards() {
        // Chercher tous les éléments de décompte dans les cartes
        const countdownElements = document.querySelectorAll('.match-countdown');
        
        countdownElements.forEach(element => {
            // Récupérer l'ID du match depuis l'attribut data
            const matchCard = element.closest('.match-card');
            if (!matchCard) return;

            // Trouver le match correspondant
            let matchId = null;
            const matchButton = matchCard.querySelector('[onclick*="openPredictionModal"]');
            if (matchButton) {
                const onclickStr = matchButton.getAttribute('onclick');
                const match = onclickStr.match(/openPredictionModal\('([^']+)'\)/);
                if (match) matchId = match[1];
            }

            if (!matchId) return;

            const currentMatch = appData.matches.find(m => m.id === matchId);
            if (!currentMatch) return;

            // Vérifier si le match est toujours à venir et peut recevoir des pronostics
            const isUpcoming = currentMatch.status === 'upcoming';
            const canPredict = isUpcoming && new Date(currentMatch.date) > new Date();

            if (isUpcoming && canPredict) {
                // Mettre à jour le texte du décompte
                element.textContent = `Pronostiquer avant: ${this.formatTimeRemaining(currentMatch.date)}`;
            } else if (isUpcoming && !canPredict) {
                // Le match a commencé
                element.textContent = 'Match commencé';
                element.style.color = 'var(--error-color)'; // Couleur rouge
            }
        });
    }

    // Arrêter la mise à jour périodique des décomptes
    stopCountdownUpdates() {
        if (this.countdownUpdateInterval) {
            clearInterval(this.countdownUpdateInterval);
            this.countdownUpdateInterval = null;
        }
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

    // === AUTHENTIFICATION ===
    showContent(sectionName) {
        console.log('[DEBUG] showContent appelé avec:', sectionName);
        
        if (sectionName === 'auth') {
            // Afficher la section d'authentification
            console.log('[DEBUG] Affichage interface authentification');
            const authSection = document.getElementById('auth');
            const nav = document.querySelector('nav');
            const main = document.querySelector('.main');
            const header = document.querySelector('.header');
            
            if (authSection) authSection.style.display = 'block';
            if (nav) nav.style.display = 'none';
            if (main) main.style.display = 'none';
            // Garder le header visible pour naviguer
            if (header) header.style.display = 'block';
            
            // Initialiser les écouteurs d'authentification
            setTimeout(() => {
                this.initializeAuthListeners();
            }, 10);
        } else {
            // Afficher l'application principale
            console.log('[DEBUG] Affichage application principale:', sectionName);
            const authSection = document.getElementById('auth');
            const nav = document.querySelector('nav');
            const main = document.querySelector('.main');
            const header = document.querySelector('.header');
            
            if (authSection) authSection.style.display = 'none';
            if (nav) nav.style.display = 'block';
            if (main) main.style.display = 'block';
            if (header) header.style.display = 'block';
            
            // Aller à l'onglet spécifié ou dashboard par défaut
            this.switchTab(sectionName || 'dashboard');
        }
    }

    initializeHeaderListeners() {
        console.log('[DEBUG] Initialisation des écouteurs header...');
        
        // Bouton de connexion dans le header
        const loginHeaderBtn = document.getElementById('loginHeaderBtn');
        console.log('[DEBUG] loginHeaderBtn trouvé:', !!loginHeaderBtn);
        
        if (loginHeaderBtn && !loginHeaderBtn.hasAttribute('data-listener-attached')) {
            loginHeaderBtn.addEventListener('click', (e) => {
                console.log('[DEBUG] Clic sur loginHeaderBtn');
                e.preventDefault();
                e.stopPropagation();
                this.showContent('auth');
            });
            loginHeaderBtn.setAttribute('data-listener-attached', 'true');
            console.log('[DEBUG] Écouteur ajouté sur loginHeaderBtn');
        }
        
        // Bouton de déconnexion
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn && !logoutBtn.hasAttribute('data-listener-attached')) {
            logoutBtn.addEventListener('click', (e) => {
                console.log('[DEBUG] Clic sur logoutBtn');
                e.preventDefault();
                // Nettoyer les données si nécessaire
                this.showContent('auth');
            });
            logoutBtn.setAttribute('data-listener-attached', 'true');
        }
    }

    initializeAuthListeners() {
        console.log('[DEBUG] Initialisation des écouteurs d\'authentification...');
        const loginBtn = document.getElementById('loginBtn');
        const userNameInput = document.getElementById('authUserName');
        const emailInput = document.getElementById('authEmail');

        console.log('[DEBUG] Elements trouvés - loginBtn:', !!loginBtn, 'userNameInput:', !!userNameInput, 'emailInput:', !!emailInput);

        if (loginBtn && !loginBtn.hasAttribute('data-listener-attached')) {
            loginBtn.setAttribute('data-listener-attached', 'true');
            loginBtn.addEventListener('click', async (e) => {
                console.log('[DEBUG] Clic détecté sur bouton login');
                e.preventDefault();
                
                const username = userNameInput ? userNameInput.value.trim() : '';
                const email = emailInput ? emailInput.value.trim() : '';
                
                if (!username) {
                    this.showToast('Veuillez entrer un pseudonyme', 'error');
                    return;
                }
                
                console.log('[DEBUG] Tentative de connexion avec:', username);
                
                try {
                    // Sauvegarder l'utilisateur en local pour l'instant
                    appData.currentUser.name = username;
                    appData.currentUser.email = email;
                    appData.currentUser.lastActivity = new Date().toISOString();
                    appData.saveUser();
                    
                    this.updateHeader();
                    this.showContent('dashboard');
                    this.showToast(`Bienvenue ${username} !`, 'success');
                    
                    console.log('[DEBUG] Connexion réussie');
                } catch (error) {
                    console.error('[DEBUG] Erreur de connexion:', error);
                    this.showToast('Erreur de connexion', 'error');
                }
            });
        }
    }

    updateHeaderAuth() {
        console.log('[DEBUG] Mise à jour affichage authentification');
        const authenticatedUser = document.getElementById('authenticated-user');
        const guestUser = document.getElementById('guest-user');
        
        if (authenticatedUser && guestUser) {
            if (appData.currentUser && appData.currentUser.name) {
                authenticatedUser.style.display = 'flex';
                guestUser.style.display = 'none';
            } else {
                authenticatedUser.style.display = 'none';
                guestUser.style.display = 'block';
            }
        }
    }
}

// Initialisation de l'application
let uiManager;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Démarrage de l\'application...');
    console.log('📦 Version: 2.0 - Correction uiManager global');
    
    // Créer l'instance UIManager
    uiManager = new UIManager();
    
    // Rendre uiManager accessible globalement
    window.uiManager = uiManager;
    console.log('✅ uiManager rendu global:', !!window.uiManager);
    
    // Initialiser les écouteurs du header immédiatement
    console.log('[DEBUG] Appel initializeHeaderListeners...');
    uiManager.initializeHeaderListeners();
    
    // Mettre à jour l'affichage d'authentification
    console.log('[DEBUG] Appel updateHeaderAuth...');
    uiManager.updateHeaderAuth();
    
    // S'assurer que le header est correctement initialisé
    setTimeout(() => {
        console.log('🔄 Initialisation finale du header');
        uiManager.updateHeader();
    }, 200);
    
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
    
    // Test pour vérifier que les nouvelles fonctionnalités sont chargées
    setTimeout(() => {
        const userNameElement = document.getElementById('userName');
        if (userNameElement && userNameElement.onclick) {
            console.log('✅ Pseudonyme cliquable activé');
        } else {
            console.warn('⚠️ Problème avec le pseudonyme cliquable');
        }
        
        // Test des drapeaux
        const testFlag = getTeamFlag('France');
        if (testFlag === '🇫🇷') {
            console.log('✅ Système de drapeaux actif');
        } else {
            console.warn('⚠️ Problème avec les drapeaux');
        }
    }, 1000);
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