#!/bin/bash

# Script de développement unifié pour l'application de pronostics foot
# Ce script évite de créer plusieurs serveurs et gère le cache correctement

PORT=3000
echo "🚀 Serveur de développement - Pronostics Football"
echo "📁 Dossier: $(pwd)"
echo "🌐 URL: http://localhost:$PORT"
echo ""
echo "💡 Pour éviter les problèmes de cache:"
echo "   - Ctrl+F5 pour forcer le rechargement"
echo "   - F12 > Application > Storage > Clear storage"
echo "   - Mode incognito"
echo ""
echo "🔄 Le serveur va démarrer..."
echo "   Appuyez sur Ctrl+C pour arrêter"
echo ""

# Tuer les anciens serveurs sur différents ports
echo "🧹 Nettoyage des anciens serveurs..."
pkill -f "python.*http.server" 2>/dev/null || true

# Démarrer le serveur sur un port fixe
echo "▶️  Démarrage du serveur sur le port $PORT..."
python3 -m http.server $PORT