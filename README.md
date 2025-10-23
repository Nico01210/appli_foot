# Pronostics Football ⚽

Une application web progressive (PWA) pour faire des pronostics sur les matchs de football et participer à des classements avec vos amis !

## 🚀 Fonctionnalités

### 🏆 Système de Pronostics
- **Prédictions de scores** : Pronostiquez le score exact des matchs
- **Système de points personnalisable** :
  - Score exact : 5 points (par défaut)
  - Bon résultat (victoire/nul/défaite) : 3 points
  - Écart de buts correct : 2 points
- **Gestion multi-tournois** : Coupe du Monde 2026 et Ligue 1

### 📊 Dashboard Personnel
- **Statistiques individuelles** :
  - Nombre total de pronostics
  - Pronostics corrects
  - Pourcentage de réussite
  - Position dans le classement
- **Historique des pronostics récents**
- **Suivi des performances par tournoi**

### 🏅 Classement Compétitif
- **Classement général** avec système de points
- **Vues temporelles** : général, mensuel, hebdomadaire
- **Statistiques détaillées** pour chaque joueur
- **Mise en évidence** de votre position

### ⚙️ Administration
- **Configuration du système de points**
- **Ajout de nouveaux matchs**
- **Mise à jour des résultats**
- **Statistiques globales de l'application**

### 📱 Expérience Mobile
- **PWA** : Installation sur mobile comme une app native
- **Design responsive** optimisé mobile-first
- **Mode hors-ligne** avec cache intelligent
- **Notifications push** (à venir)

## 🛠️ Technologies Utilisées

- **Frontend** : HTML5, CSS3, JavaScript (ES6+)
- **Design** : CSS Grid, Flexbox, Variables CSS
- **PWA** : Service Worker, Web App Manifest
- **Stockage** : LocalStorage pour la persistance
- **Icons** : Font Awesome 6
- **Fonts** : Inter (Google Fonts)

## 📦 Installation

### Option 1 : Utilisation directe
1. Clonez ou téléchargez les fichiers
2. Ouvrez `index.html` dans un navigateur moderne
3. L'application fonctionne immédiatement !

### Option 2 : Serveur local (recommandé pour PWA)
```bash
# Avec Python
python -m http.server 8000

# Avec Node.js (http-server)
npx http-server

# Avec PHP
php -S localhost:8000
```

### Option 3 : Installation PWA
1. Ouvrez l'application dans Chrome/Edge/Safari
2. Cliquez sur "Installer" dans la barre d'adresse
3. L'app s'installe comme une application native !

## 🎮 Comment Jouer

### Premier lancement
1. **Entrez votre nom** lors de la première visite
2. **Explorez les onglets** : Dashboard, Pronostics, Classement
3. **Choisissez votre tournoi** (Coupe du Monde ou Ligue 1)

### Faire des pronostics
1. Allez dans l'onglet **"Pronostics"**
2. Cliquez sur **"Pronostiquer"** pour un match à venir
3. Entrez le **score que vous prédisez**
4. Confirmez votre pronostic

### Gagner des points
- **Score exact** : Maximum de points !
- **Bon résultat** : Points intermédiaires
- **Écart de buts** : Points de consolation
- **Mauvais pronostic** : Aucun point

### Administration (pour les organisateurs)
1. Allez dans l'onglet **"Admin"**
2. **Configurez les points** selon vos préférences
3. **Ajoutez de nouveaux matchs**
4. **Mettez à jour les résultats** après les matchs

## 🎯 Structure des Points

Le système de points est entièrement personnalisable via l'interface admin :

```
Score exact (par défaut: 5 points)
├── Pronostic: France 2-1 Argentine
└── Résultat réel: France 2-1 Argentine
    ✅ Score parfait = 5 points

Bon résultat (par défaut: 3 points)  
├── Pronostic: France 3-1 Argentine
└── Résultat réel: France 2-0 Argentine
    ✅ Victoire France prédite = 3 points

Écart de buts (par défaut: 2 points)
├── Pronostic: France 1-2 Argentine  
└── Résultat réel: France 0-1 Argentine
    ✅ Écart d'1 but prédit = 2 points
```

## 📁 Structure du Projet

```
appli_foot/
├── index.html          # Page principale de l'application
├── styles.css          # Styles CSS responsive
├── app.js              # Logique JavaScript
├── manifest.json       # Configuration PWA
├── sw.js              # Service Worker
├── icon-192.svg       # Icône de l'application
└── README.md          # Documentation
```

## 🔧 Personnalisation

### Ajouter de nouveaux tournois
Dans `app.js`, modifiez l'objet `CONFIG.tournaments` :

```javascript
tournaments: {
    worldcup: 'Coupe du Monde 2026',
    ligue1: 'Ligue 1 2024-25',
    championsleague: 'Champions League',  // Nouveau tournoi
    euro2028: 'Euro 2028'                 // Nouveau tournoi
}
```

### Modifier les couleurs
Dans `styles.css`, changez les variables CSS :

```css
:root {
    --primary-color: #2563eb;    /* Bleu principal */
    --secondary-color: #10b981;  /* Vert secondaire */
    --success-color: #059669;    /* Vert succès */
    /* ... autres couleurs */
}
```

### Personnaliser les points par défaut
Dans `app.js`, modifiez `CONFIG.pointsSystem` :

```javascript
pointsSystem: {
    exactScore: 10,        // Plus de points pour score exact
    correctResult: 5,      // Points moyens pour bon résultat  
    goalDifference: 3      // Points pour écart correct
}
```

## 🌟 Fonctionnalités Avancées

### Persistance des données
- **LocalStorage** : Toutes les données sont sauvegardées localement
- **Synchronisation automatique** entre les onglets
- **Récupération de session** : Retrouvez vos données au redémarrage

### Mode hors-ligne
- **Service Worker** : Fonctionne sans connexion
- **Cache intelligent** : Ressources mises en cache automatiquement
- **Synchronisation** : Données synchronisées au retour de connexion

### Responsive Design
- **Mobile-first** : Optimisé d'abord pour mobile
- **Tablettes** : Interface adaptée aux écrans moyens
- **Desktop** : Expérience complète sur grand écran

## 🚀 Fonctionnalités Futures

- [ ] **Notifications push** pour les nouveaux matchs
- [ ] **Mode multijoueur** avec synchronisation cloud
- [ ] **Statistiques avancées** et graphiques
- [ ] **Import/Export** de données
- [ ] **Themes** sombre/clair
- [ ] **API** de scores en temps réel
- [ ] **Ligues privées** avec codes d'accès
- [ ] **Achievements** et badges

## 🐛 Dépannage

### L'application ne se charge pas
- Vérifiez que JavaScript est activé
- Utilisez un navigateur moderne (Chrome, Firefox, Safari, Edge)
- Effacez le cache du navigateur

### Les données sont perdues
- Les données sont stockées localement dans le navigateur
- Évitez de vider les données de navigation pour ce site
- Exportez vos données régulièrement (fonctionnalité à venir)

### PWA ne s'installe pas
- Utilisez HTTPS ou localhost
- Vérifiez que le Service Worker fonctionne
- Certains navigateurs nécessitent une interaction utilisateur

## 📄 Licence

Ce projet est sous licence MIT. Libre d'utilisation, modification et distribution.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer des fonctionnalités
- Améliorer la documentation
- Partager vos idées

---

**Amusez-vous bien avec vos pronostics ! ⚽🏆**