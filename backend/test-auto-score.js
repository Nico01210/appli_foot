const AutoScoreUpdater = require('./services/scoreUpdater');
const dbUtils = require('./models/database');

async function testAutoUpdate() {
    console.log('🧪 Test de mise à jour automatique des scores');
    
    try {
        const scoreUpdater = new AutoScoreUpdater();
        
        // Affiche les matchs disponibles pour test
        const matches = await dbUtils.all(`
            SELECT id, team1, team2, date, status, team1_score, team2_score 
            FROM matches 
            WHERE status != 'completed' 
            ORDER BY date
        `);
        
        if (matches.length === 0) {
            console.log('❌ Aucun match en attente trouvé pour test');
            return;
        }
        
        console.log('\n📋 Matchs disponibles pour test:');
        matches.forEach(match => {
            console.log(`  ${match.id}: ${match.team1} vs ${match.team2} (${match.date}) - ${match.status}`);
        });
        
        // Test sur le premier match
        const testMatch = matches[0];
        console.log(`\n🎯 Test sur: ${testMatch.team1} vs ${testMatch.team2}`);
        
        await scoreUpdater.testUpdate(testMatch.id);
        
        console.log('✅ Test terminé');
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
    } finally {
        process.exit(0);
    }
}

// Arguments de ligne de commande
if (process.argv[2] === '--match-id') {
    const matchId = Number(process.argv[3]);
    if (matchId) {
        testSpecificMatch(matchId);
    } else {
        console.log('Usage: node test-auto-score.js --match-id 123');
        process.exit(1);
    }
} else {
    testAutoUpdate();
}

async function testSpecificMatch(matchId) {
    console.log(`🧪 Test spécifique pour le match ID: ${matchId}`);
    
    try {
        const scoreUpdater = new AutoScoreUpdater();
        await scoreUpdater.testUpdate(matchId);
        console.log('✅ Test spécifique terminé');
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        process.exit(0);
    }
}