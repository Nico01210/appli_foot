#!/bin/bash

# Script pour démarrer le serveur de développement avec cache désactivé
echo "🚀 Démarrage du serveur de développement..."
echo "📝 Conseil: Utilisez Ctrl+Shift+R ou Cmd+Shift+R pour forcer le rechargement"
echo "🌐 Application disponible sur: http://localhost:8000"
echo "🔄 Le cache est maintenant versionné pour éviter les problèmes"
echo ""
echo "💡 Si vous voyez encore l'ancienne version:"
echo "   1. Ouvrez les DevTools (F12)"
echo "   2. Clic droit sur le bouton actualiser"
echo "   3. Choisissez 'Vider le cache et actualiser'"
echo ""

# Démarrer le serveur Python
python3 -m http.server 8000